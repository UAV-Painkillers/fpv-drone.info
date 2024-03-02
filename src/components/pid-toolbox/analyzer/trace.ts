import { cut as danfoCut, cut2D as danfoCut2D } from "danfojs";

interface Data {
  time: number[];
  pid_in: number[];
  gyro: number[];
  P: number[];
  input: number[];
  p_err: number[];
  name: string;
  throttle: number[];
}

interface Hist2DResult {
  hist2d_norm: number[];
  hist2d: danfoCategorical;
  throt_hist: danfoCategorical;
  throt_scale: number[];
}

interface StackspectrumResult {
  throt_hist_avr: number[];
  throt_axis: number[];
  freq_axis: number[];
  hist2d?: number[][];
}

class Trace {
  private static readonly framelen = 1; // length of each single frame over which to compute response
  private static readonly resplen = 0.5; // length of respose window
  private static readonly cutfreq = 25; // cutfreqency of what is considered as input
  private static readonly tuk_alpha = 1.0; // alpha of tukey window, if used
  private static readonly superpos = 16; // sub windowing (superpos windows in framelen)
  private static readonly threshold = 500; // threshold for 'high input rate'
  private static readonly noise_framelen = 0.3; // window width for noise analysis
  private static readonly noise_superpos = 16; // subsampling for noise analysis windows

  private readonly data: Data;
  private readonly input: number[];
  private readonly name: string;
  private readonly time: number[];
  private readonly dt: number;
  private readonly gyro: number[];
  private readonly throttle: number[];
  private readonly throt_hist: number[];
  private readonly throt_scale: number[];
  private readonly flen: number;
  private readonly rlen: number;
  private readonly time_resp: number[];
  private readonly stacks: Record<string, number[]>;
  private readonly window: number[];
  private readonly spec_sm: number[][];
  private readonly avr_t: number[];
  private readonly avr_in: number[];
  private readonly max_in: number[];
  private readonly max_thr: number[];
  private readonly low_mask: number[];
  private readonly high_mask: number[];
  private readonly toolow_mask: number[];
  private readonly resp_sm: [
    number[],
    number[],
    [number[], number[], number[]],
  ];
  private readonly resp_quality: number[];
  private readonly thr_response: Hist2DResult;
  private readonly resp_low: [
    number[],
    number[],
    [number[], number[], number[]],
  ];
  private readonly resp_high: [
    number[],
    number[],
    [number[], number[], number[]],
  ];
  private readonly noise_winlen: number;
  private readonly noise_stack: Record<string, number[]>;
  private readonly noise_gyro: StackspectrumResult;
  private readonly noise_win: unknown;
  private readonly noise_d: StackspectrumResult;
  private readonly noise_debug: StackspectrumResult;
  private readonly filter_trans: number[];

  public constructor(data: Data) {
    this.data = data;
    this.input = this.equalize(
      this.data["time"],
      this.pid_in(this.data["p_err"], this.data["gyro"], this.data["P"])
    )[1]; // /20.
    this.data["input"] = this.pid_in(
      this.data["p_err"],
      this.data["gyro"],
      this.data["P"]
    );
    this.equalize_data();

    this.name = this.data.name;
    this.time = this.data.time;
    this.dt = this.time[0] - this.time[1];

    this.input = this.data.input;
    // enable this to generate artifical gyro trace with known system response
    // this.data.gyro = this.toy_out(this.input, {delay: 0.01, mode: 'normal'});

    this.gyro = this.data.gyro;
    this.throttle = this.data.throttle;
    [this.throt_hist, this.throt_scale] = this.histogram(
      this.throttle,
      this.linspace(0, 100, 101, "float64"),
      true
    );

    this.flen = this.stepcalc(this.time, Trace.framelen); // array len corresponding to framelen in s
    this.rlen = this.stepcalc(this.time, Trace.resplen); // array len corresponding to resplen in s
    this.time_resp = this.time.slice(0, this.rlen).map((t) => t - this.time[0]);

    this.stacks = this.winstacker(
      { time: [], input: [], gyro: [], throttle: [] },
      this.flen,
      Trace.superpos
    ); // [[time, input, output],]
    this.window = this.hanning(this.flen); // this.tukeywin(this.flen, this.tuk_alpha)
    [this.spec_sm, this.avr_t, this.avr_in, this.max_in, this.max_thr] =
      this.stack_response(this.stacks, this.window);
    [this.low_mask, this.high_mask] = this.low_high_mask(
      this.max_in,
      Trace.threshold
    ); // calcs masks for high and low inputs according to threshold
    this.toolow_mask = this.low_high_mask(this.max_in, 20)[1];

    this.resp_sm = this.weighted_mode_avr(
      this.spec_sm,
      this.toolow_mask,
      [-1.5, 3.5],
      1000
    );

    // Subtract this.resp_sm[0] from each row of this.spec_sm and take absolute value
    const absDiff = this.spec_sm.map((row) =>
      row.map((x, i) => Math.abs(x - this.resp_sm[0][i]))
    );

    // Clip the result to [0.5 - 1e-9, 0.5]
    const clipResult = this.clip(absDiff, 0.5 - 1e-9, 0.5);

    // Calculate the mean of each row
    const meanResult = this.mean(clipResult);

    // Apply to_mask function
    const maskResult = this.to_mask(meanResult);

    // Negate the result and add 1
    this.resp_quality = this.addToArr(this.negate(maskResult), 1);
    // masking by setting trottle of unwanted traces to neg
    const max_thr_times_mask_quality = this.max_thr.map(
      (val, i) =>
        val * (2.0 * (this.toolow_mask[i] * this.resp_quality[i]) - 1.0)
    );
    const spec_sm_transpose_times_mask = this.spec_sm[0].map((_, col) =>
      this.spec_sm.map((row) => row[col] * this.toolow_mask[col])
    );

    this.thr_response = this.hist2d(
      max_thr_times_mask_quality,
      this.time_resp,
      spec_sm_transpose_times_mask,
      [101, this.rlen]
    );

    this.resp_low = this.weighted_mode_avr(
      this.spec_sm,
      this.low_mask.map((val, i) => val * this.toolow_mask[i]),
      [-1.5, 3.5],
      1000
    );
    if (this.high_mask.reduce((a, b) => a + (b ? 1 : 0), 0) > 0) {
      this.resp_high = this.weighted_mode_avr(
        this.spec_sm,
        this.high_mask.map((val, i) => val && this.toolow_mask[i]),
        [-1.5, 3.5],
        1000
      );
    }

    this.noise_winlen = this.stepcalc(this.time, Trace.noise_framelen);
    this.noise_stack = this.winstacker(
      { time: [], gyro: [], throttle: [], d_err: [], debug: [] },
      this.noise_winlen,
      Trace.noise_superpos
    );
    this.noise_win = this.hanning(this.noise_winlen);

    this.noise_gyro = this.stackspectrum(
      this.noise_stack.time,
      this.noise_stack.throttle,
      this.noise_stack.gyro,
      this.noise_win
    );
    this.noise_d = this.stackspectrum(
      this.noise_stack.time,
      this.noise_stack.throttle,
      this.noise_stack.d_err,
      this.noise_win
    );
    this.noise_debug = this.stackspectrum(
      this.noise_stack.time,
      this.noise_stack.throttle,
      this.noise_stack.debug,
      this.noise_win
    );

    if (this.noise_debug.hist2d!.flat().reduce((a, b) => a + b, 0) > 0) {
      const thr_mask = this.clip(this.noise_gyro.throt_hist_avr, 0, 1);

      const sumWeights = thr_mask.reduce((a, b) => a + b, 0);

      const weightedAverageGyro = this.noise_gyro
        .hist2d!.map((row) => row.reduce((a, b, j) => a + b * thr_mask[j], 0))
        .map((val) => val / sumWeights);
      const weightedAverageDebug = this.noise_debug
        .hist2d!.map((row) => row.reduce((a, b, j) => a + b * thr_mask[j], 0))
        .map((val) => val / sumWeights);

      this.filter_trans = weightedAverageGyro.map(
        (val, i) => val / weightedAverageDebug[i]
      );
    } else {
      const mean = this.mean(this.noise_gyro.hist2d!);
      this.filter_trans = mean.map(row => row * 0);
    }
  }

  // typescript equivalent of numpy.histogram
  private histogram(
    data: number[],
    bins: number[] | number,
    normed: boolean = false
  ): [number[], number[]] {
    let binEdges: number[];
    let counts: number[];

    if (typeof bins === "number") {
      const min = Math.min(...data);
      const max = Math.max(...data);
      binEdges = Array.from(
        { length: bins + 1 },
        (_, i) => min + (i * (max - min)) / bins
      );
      counts = new Array(bins).fill(0);
    } else {
      binEdges = bins;
      counts = new Array(binEdges.length - 1).fill(0);
    }

    for (const d of data) {
      const bin = binEdges.findIndex(
        (edge, i) => i < binEdges.length - 1 && edge <= d && d < binEdges[i + 1]
      );
      if (bin !== -1) {
        counts[bin]++;
      }
    }

    if (normed) {
      const totalArea =
        (binEdges[binEdges.length - 1] - binEdges[0]) * data.length;
      counts = counts.map((count) => count / totalArea);
    }

    return [counts, binEdges];
  }

  // typescript equivalent of numpy.linspace
  private linspace(
    start: number,
    stop: number,
    num: number,
    dtype: "float32" | "float64" = "float64"
  ): number[] {
    const step = (stop - start) / (num - 1);
    let array = Array.from({ length: num }, (_, i) => start + i * step);

    if (dtype === "float32") {
      array = array.map((value) => Math.fround(value));
    }

    return array;
  }

  private equalize(time: number[], pid_in: number[]): number[][] {
    // not implemented
  }

  private pid_in(p_err: number[], gyro: number[], P: number[]): number[] {
    // not implemented
  }

  private equalize_data(): void {
    // not implemented
  }

  private stepcalc(time: number[], duration: number): number {
    // not implemented
  }

  private winstacker(
    data: {
      time: number[];
      input?: number[];
      gyro: number[];
      throttle: number[];
      d_err?: number[];
      debug?: number[];
    },
    flen: number,
    superpos: number
  ): Record<string, number[]> {
    // not implemented
  }

  // typescript equivalent of numpy.hanning
  private hanning(length: number): number[] {
    return Array.from(
      { length },
      (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (length - 1))
    );
  }

  private stack_response(
    stacks: Record<string, number[]>,
    window: number[]
  ): [number[][], number[], number[], number[], number[]] {
    // not implemented
  }

  private low_high_mask(
    signal: number[],
    threshold: number
  ): [number[], number[]] {
    // not implemented
  }

  private weighted_mode_avr(
    values: number[][],
    weights: number[],
    range: number[],
    bins: number
  ): [number[], number[], [number[], number[], number[]]] {
    // not implemented
  }

  // TypeScript equivalent of numpy.mean with axis=1 and a 2D array as input
  private mean(arr: number[][]): number[] {
    return arr.map((row) => row.reduce((a, b) => a + b) / row.length);
  }

  // TypeScript equivalent of numpy.clip on a 2D array
  private clip<T extends number[] | number[][]>(
    arr: T,
    min: number,
    max: number
  ): T {
    if (typeof arr[0] === "number") {
      return (arr as number[]).map((x) => Math.min(Math.max(x, min), max)) as T;
    } else {
      return (arr as number[][]).map((row) =>
        row.map((x) => Math.min(Math.max(x, min), max))
      ) as T;
    }
  }

  private to_mask(clipped: number[]): number[] {
    const min = Math.min(...clipped);
    const max = Math.max(...clipped);

    return clipped.map((x) => (x - min) / (max - min));
  }

  private negate<T extends number | number[]>(value: T): T {
    if (typeof value === "number") {
      return -value as T;
    } else if (Array.isArray(value)) {
      return value.map((x) => -x) as T;
    } else {
      throw new Error("Invalid type");
    }
  }

  private addToArr(arr: number[], value: number): number[] {
    return arr.map((x) => x + value);
  }

  private hist2d(
    x: number[],
    y: number[],
    weights: number[][],
    bins: [number, number]
  ): Hist2DResult {
    const freqs = Array(x.length).fill(y);
    const throts = Array(y.length)
      .fill(x)
      .map((row) => row.slice().reverse());

    const throt_hist_avr = danfoCut(x, 101, {
      labels: false,
      retbins: true,
      right: true,
      precision: 3,
      include_lowest: true,
    });
    const throt_scale_avr = throt_hist_avr.categories;

    const hist2d = danfoCut2D(throts.flat(), freqs.flat(), {
      bins: bins,
      labels: false,
      retbins: true,
      right: true,
      precision: 3,
      include_lowest: true,
    });
    let hist2d_norm = hist2d.value_counts().values;

    hist2d_norm /= throt_hist_avr.value_counts().values + 1e-9;

    return {
      hist2d_norm: hist2d_norm,
      hist2d: hist2d,
      throt_hist: throt_hist_avr,
      throt_scale: throt_scale_avr,
    };
  }

  private stackspectrum(
    time: number[],
    throttle: number[],
    gyro: number[],
    noise_win: unknown
  ): StackspectrumResult {
    throw new Error("Method not implemented.");
  }
}
