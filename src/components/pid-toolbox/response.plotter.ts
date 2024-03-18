import * as echarts from "echarts";
import type {
  PIDAnalyzerResult,
  PIDAnalyzerTraceData,
} from "@uav.painkillers/pid-analyzer-wasm";

type Axis = "roll" | "pitch" | "yaw";

type ResponseChartType =
  | "responseTrace"
  | "responseThrottle"
  | "responseStrength";
type NoiseFields = keyof Pick<
  PIDAnalyzerTraceData,
  "noise_gyro" | "noise_debug" | "noise_d"
>;

type ChartType =
  | ResponseChartType
  | NoiseFields
  | "frequencies_gyro"
  | "frequencies_debug"
  | "frequencies_d";

type ChartBoundariesType = ResponseChartType | NoiseFields | "frequencies";

export class ResponsePlotter {
  private activeAxis: Axis = "roll";
  private data: PIDAnalyzerResult | null = null;
  private readonly chartBoundaries: Partial<
    Record<ChartBoundariesType, { min: number; max: number }>
  > = {
    noise_gyro: {
      min: 1,
      max: 10.1,
    },
    noise_debug: {
      min: 1,
      max: 100,
    },
    noise_d: {
      min: 1,
      max: 100,
    },
    frequencies: {
      min: 0,
      max: 100,
    },
  };
  private readonly charts: Record<ChartType, echarts.ECharts>;

  public static VIRIDIS_COLOR_PALETTE = [
    "#440154",
    "#482878",
    "#3e4a89",
    "#31688e",
    "#26828e",
    "#1f9e89",
    "#35b779",
    "#6dcd59",
    "#b4de2c",
    "#fde725",
  ];
  public static getBaseOptions(title: string): echarts.EChartsOption {
    return {
      title: {
        show: true,
        text: title,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
    };
  }

  constructor(
    responseTraceContainer: HTMLElement,
    responseThrottleContainer: HTMLElement,
    responseStrengthContainer: HTMLElement,
    noiseGyroElement: HTMLElement,
    noiseGyroDebugElement: HTMLElement,
    noiseDTermElement: HTMLElement,
    frequenciesGyro: HTMLElement,
    frequenciesDebug: HTMLElement,
    frequenciesDTerm: HTMLElement,
  ) {
    this.charts = {
      responseTrace: echarts.init(responseTraceContainer),
      responseThrottle: echarts.init(responseThrottleContainer),
      responseStrength: echarts.init(responseStrengthContainer),
      noise_gyro: echarts.init(noiseGyroElement),
      noise_debug: echarts.init(noiseGyroDebugElement),
      noise_d: echarts.init(noiseDTermElement),
      frequencies_gyro: echarts.init(frequenciesGyro),
      frequencies_debug: echarts.init(frequenciesDebug),
      frequencies_d: echarts.init(frequenciesDTerm),
    };
  }

  private mapTimeToSeconds(time: number[]) {
    return time.map((t) => Math.round(t));
  }

  private plotResponseTrace() {
    const gyro = this.data![this.activeAxis].gyro;
    const input = this.data![this.activeAxis].input;
    const time = this.data![this.activeAxis].time;

    const traceLimit = Math.max(
      Math.max(...gyro.map(Math.abs)),
      Math.max(...input.map(Math.abs)),
    );

    this.charts.responseTrace.setOption({
      ...ResponsePlotter.getBaseOptions("PID Response Trace"),
      legend: {},
      xAxis: {
        data: this.mapTimeToSeconds(time),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: -traceLimit * 1.1,
        max: traceLimit * 1.1,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: `${this.activeAxis} gyro`,
          type: "line",
          data: gyro,
          smooth: true,
        },
        {
          name: `${this.activeAxis} loop input`,
          type: "line",
          data: input,
          smooth: true,
        },
      ],
    });
  }

  private plotResponseThrottle() {
    const time = this.data![this.activeAxis].time;
    const tpaPercent = this.data!.headdict.tpa_percent;
    const throttle = this.data![this.activeAxis].throttle;

    this.charts.responseThrottle.setOption({
      ...ResponsePlotter.getBaseOptions("Throttle"),
      xAxis: {
        data: this.mapTimeToSeconds(time),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: "tpa",
          type: "line",
          data: Array(time.length).fill(tpaPercent),
          lineStyle: {
            color: "red",
          },
        },
        {
          type: "line",
          name: "throttle %",
          data: throttle,
          areaStyle: {},
          smooth: true,
        },
      ],
      grid: {
        show: true,
      },
      legend: {
        show: true,
      },
    });
  }

  private plotResponseStrength() {
    const high_mask: number[] | undefined =
      this.data![this.activeAxis].high_mask;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const highMaskSum = (high_mask ?? [0]).reduce((a, b) => a + b, 0);
    const useHighMask = highMaskSum > 0;

    const time_resp: number[] = this.data![this.activeAxis].time_resp;
    const resp_high = this.data![this.activeAxis].resp_high;
    const resp_low = this.data![this.activeAxis].resp_low;

    this.charts.responseStrength.setOption({
      ...ResponsePlotter.getBaseOptions("Step Response"),
      xAxis: {
        data: time_resp.map((t) => t.toFixed(1)),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: 0,
        max: 2,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: "step response",
          type: "line",
          data: useHighMask ? resp_high![0] : resp_low[0],
        },
      ],
      grid: {
        show: true,
      },
    });
  }

  public setData(data: PIDAnalyzerResult) {
    this.data = data;
    this.plotAll();
  }

  public setActiveAxis(axis: Axis) {
    this.activeAxis = axis;

    this.plotAll();
  }

  private plotNoiseForField(fieldName: NoiseFields, chart: echarts.ECharts) {
    const tr = this.data![this.activeAxis];
    const fieldValues = tr[fieldName];

    const data: Array<[number, number, number]> = [];

    const frequencyAxis = Array.from({
      length: fieldValues.hist2d_sm.length,
    }).map((_, i) => i);

    const throttleAxis = Array.from({
      length: fieldValues.hist2d_sm[0].length,
    }).map((_, i) => i);

    fieldValues.hist2d_sm.forEach((row, xIndex) => {
      return row.forEach((value, yIndex) => {
        data.push([xIndex, yIndex, value + 1]);
      });
    });

    chart.setOption({
      ...ResponsePlotter.getBaseOptions(
        fieldName
          .split("_")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
      ),
      tooltip: {},
      xAxis: {
        type: "category",
        name: "Frequency",
        nameRotate: 90,
        data: frequencyAxis,
        axisLabel: {
          formatter: (index: number) => {
            return `${Math.round(fieldValues.freq_axis[index])}Hz`;
          },
          rotate: 45,
        },
      },
      yAxis: {
        type: "category",
        name: "Throttle",
        axisLabel: {
          formatter: (index: number) => {
            return `${index}%`;
          },
          interval: 9,
        },
        data: throttleAxis,
      },
      visualMap: {
        min: this.chartBoundaries[fieldName]!.min,
        max: this.chartBoundaries[fieldName]!.max,
        calculable: true,
        realtime: false,
        inRange: {
          color: ResponsePlotter.VIRIDIS_COLOR_PALETTE,
        },
      },
      series: [
        {
          name: "Gaussian",
          type: "heatmap",
          data,
          emphasis: {
            itemStyle: {
              borderColor: "#333",
              borderWidth: 1,
            },
          },
          progressive: 1000,
          animation: false,
        },
      ],
    });
  }

  private plotNoise() {
    this.plotNoiseForField("noise_gyro", this.charts.noise_gyro);
    this.plotNoiseForField("noise_debug", this.charts.noise_debug);
    this.plotNoiseForField("noise_d", this.charts.noise_d);
  }

  private plotFrequenciesForNoiseAxis(
    noiseAxis: NoiseFields,
    chart: echarts.ECharts,
  ) {
    const tr = this.data![this.activeAxis];
    const noise = tr[noiseAxis];

    const data = noise.hist2d_sm.map((frequencyAxis) => {
      const sumOfAllThrottlePositions = frequencyAxis.reduce(
        (a, b) => a + b,
        0,
      );

      const meanOverAllThrottlePositions =
        sumOfAllThrottlePositions / frequencyAxis.length;
      return meanOverAllThrottlePositions;
    });

    const frequencyAxis = Array.from({
      length: noise.hist2d_sm.length,
    }).map((_, i) => i);

    let name: string;
    switch (noiseAxis) {
      case "noise_gyro":
        name = "Gyro";
        break;
      case "noise_debug":
        name = "Debug";
        break;
      case "noise_d":
        name = "D Term";
        break;
    }

    chart.setOption({
      ...ResponsePlotter.getBaseOptions(`${name}-Noise Frequencies`),
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      xAxis: {
        type: "category",
        name: "Frequency",
        nameRotate: 90,
        data: frequencyAxis,
        axisLabel: {
          formatter: (index: number) => {
            return `${Math.round(noise.freq_axis[index])}Hz`;
          },
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        name: "Intensity",
        min: this.chartBoundaries.frequencies!.min,
        max: this.chartBoundaries.frequencies!.max,
      },
      series: [
        {
          name: "Gyro",
          type: "bar",
          data: data,
        },
      ],
    });

    console.log(this.charts.frequencies_gyro.getOption());
  }

  private plotNoiseFrequencies() {
    this.plotFrequenciesForNoiseAxis(
      "noise_gyro",
      this.charts.frequencies_gyro,
    );
    this.plotFrequenciesForNoiseAxis(
      "noise_debug",
      this.charts.frequencies_debug,
    );
    this.plotFrequenciesForNoiseAxis("noise_d", this.charts.frequencies_d);
  }

  private plotAll() {
    if (!this.data) {
      throw new Error("No data to plot");
    }

    this.plotResponseTrace();
    this.plotResponseThrottle();
    this.plotResponseStrength();
    this.plotNoise();
    this.plotNoiseFrequencies();
  }

  public resize() {
    Object.values(this.charts).forEach((chart) => {
      chart.resize();
    });
  }
}
