import * as echarts from "echarts/core";
import {
  GridComponent,
  VisualMapComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { HeatmapChart } from "echarts/charts";
import { BarChart } from "echarts/charts";

import type {
  PIDAnalyzerResult,
  PIDAnalyzerHeaderInformation,
} from "@uav.painkillers/pid-analyzer-wasm";
import type { ECBasicOption } from "echarts/types/dist/shared";

echarts.use([
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  HeatmapChart,
  VisualMapComponent,
  TooltipComponent,
  TitleComponent,
  BarChart,
  ToolboxComponent,
  LegendComponent,
  DataZoomComponent,
]);

type Axis = "roll" | "pitch" | "yaw";

export enum NoiseFields {
  NoiseGyro = "noise_gyro",
  NoiseDebug = "noise_debug",
  NoiseDTerm = "noise_d",
}

export enum PlotName {
  RESPONSE_TRACE = "responseTrace",
  RESPONSE_STRENGTH = "responseStrength",
  RESPONSE_THROTTLE = "responseThrottle",
  NOISE_GYRO = "noiseGyro",
  NOISE_GYRO_DEBUG = "noiseGyroDebug",
  NOISE_DTERM = "noiseDTerm",
  NOISE_FREQUENCIES_GYRO = "noiseFrequenciesGyro",
  NOISE_FREQUENCIES_GYRO_DEBUG = "noiseFrequenciesGyroDebug",
  NOISE_FREQUENCIES_DTERM = "noiseFrequenciesDTerm",
}

export interface SeriesLabelDefinition {
  headdictField: keyof PIDAnalyzerHeaderInformation;
  template?: string;
}

export type ChartsElementMap = Record<PlotName, HTMLDivElement | undefined>;
export interface PlotLabelDefinitions {
  responseTrace?: {
    gyro?: SeriesLabelDefinition;
    setPoint?: SeriesLabelDefinition;
    feedForward?: SeriesLabelDefinition;
  };
  responseThrottle?: {
    throttle?: SeriesLabelDefinition;
  };
  responseStrength?: {
    response?: SeriesLabelDefinition;
  };
  noiseFrequencies?: {
    [key in NoiseFields]: SeriesLabelDefinition;
  };
}

interface GetLabelOptions {
  labelDefinition?: SeriesLabelDefinition;
  headdict: PIDAnalyzerHeaderInformation;
  fallback: string;
  logIndex?: number;
}

export class ResponsePlotter {
  private activeAxis: Axis = "roll";
  private activeMainIndex = 0;
  private logs: PIDAnalyzerResult[] = [];
  private readonly chartBoundaries = {
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
  private charts: { [key in PlotName]?: echarts.ECharts } = {};
  private lowPowerMode = false;
  private labelDefinitions: PlotLabelDefinitions = {};

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
  public static setChartOptions(
    chart: echarts.ECharts,
    title: string,
    optionsToMerge: ECBasicOption
  ) {
    const options: ECBasicOption = {
      title: {
        show: true,
        text: title,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      grid: {
        show: true,
      },
    };

    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ((optionsToMerge.series as unknown as { type: string }[]) ?? []).some(
        (s) => s.type === "heatmap"
      )
    ) {
      (options.grid as { left: number }).left = 90;
    }

    if ((optionsToMerge as any).series.length > 1) {
      options.legend = {
        top: 30, // the size of title + margin
        left: "left", //or 0 or '0%'
      };
      (options.grid as any).top = 80;
    }

    // recursively merge optionsToMerge into baseOptions
    const merge = (base: any, toMerge: any) => {
      for (const key in toMerge) {
        if (base[key] && typeof base[key] === "object") {
          merge(base[key], toMerge[key]);
        } else {
          base[key] = toMerge[key];
        }
      }
    };
    merge(options, optionsToMerge);

    chart.setOption(options);
  }

  public setChartElements(charts: ChartsElementMap) {
    Object.values(this.charts).forEach((chart) => {
      chart.dispose();
    });

    this.charts = Object.fromEntries(
      Object.entries(charts).map(([key, value]) => [
        key as PlotName,
        echarts.init(value),
      ])
    ) as { [key in PlotName]?: echarts.ECharts };

    this.plotAll();
  }

  private mapTimeToSeconds(time?: number[]) {
    if (!time) {
      return [];
    }

    return time.map((t) => Math.round(t));
  }

  private indexToLogName(index: number) {
    return `Log #${index}`;
  }

  private getLabel(options: GetLabelOptions) {
    const { labelDefinition, headdict, fallback, logIndex } = options;

    if (!labelDefinition) {
      return fallback;
    }

    const headerName = labelDefinition.headdictField;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!headerName) {
      return fallback;
    }

    const headerValue = headdict[headerName];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (headerValue === undefined || headerValue === null) {
      return fallback;
    }

    if (!labelDefinition.template) {
      return `#${logIndex} (${headerValue})`;
    }

    let templatedValue = labelDefinition.template.replaceAll(
      "{{headerValue}}",
      `${headerValue}`
    );

    if (logIndex !== undefined) {
      templatedValue = templatedValue.replaceAll("{{logIndex}}", `${logIndex}`);
    }

    return templatedValue;
  }

  private plotResponseTrace() {
    if (!this.charts.responseTrace) {
      return;
    }

    const gyros = this.logs.map((log) => log[this.activeAxis].gyro);
    const inputs = this.logs.map((log) => log[this.activeAxis].input);
    const feedforwards = this.logs.map(
      (log) => log[this.activeAxis].feedforward
    );
    const times = this.logs.map((log) => log[this.activeAxis].time);

    const traceLimits = new Array(gyros.length).fill(0);

    for (let i = 0; i < gyros.length; i++) {
      for (let j = 0; j < gyros[i].length; j++) {
        const absGyro = Math.abs(gyros[i][j]);
        const absInput = Math.abs(inputs[i][j]);
        const absFeedforward = Math.abs(feedforwards[i][j]);
        traceLimits[i] = Math.max(
          traceLimits[i],
          absGyro,
          absInput,
          absFeedforward
        );
      }
    }

    let traceLimit = 0;
    for (let i = 0; i < traceLimits.length; i++) {
      traceLimit = Math.max(traceLimit, traceLimits[i]);
    }

    ResponsePlotter.setChartOptions(
      this.charts.responseTrace,
      "PID Response Trace",
      {
        toolbox: {
          feature: {
            dataZoom: {},
          },
        },
        dataZoom: [
          {
            type: "slider",
            xAxisIndex: [0],
          },
        ],
        xAxis: {
          data: this.mapTimeToSeconds(times[0]),
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          // min: -traceLimit * 1.1,
          // max: traceLimit * 1.1,
          min: -500,
          max: 500,
          axisTick: {
            show: false,
          },
        },
        series: [
          ...gyros.map((gyro, index) => ({
            name: this.getLabel({
              labelDefinition: this.labelDefinitions.responseTrace?.gyro,
              headdict: this.logs[index].headdict,
              fallback: `${this.indexToLogName(index)} Setpoint`,
              logIndex: index,
            }),
            type: "line",
            data: gyro,
            smooth: true,
          })),
          ...inputs.map((input, index) => ({
            name: this.getLabel({
              labelDefinition: this.labelDefinitions.responseTrace?.setPoint,
              headdict: this.logs[index].headdict,
              fallback: `${this.indexToLogName(index)} Setpoint`,
              logIndex: index,
            }),
            type: "line",
            data: input,
            smooth: true,
          })),
          ...feedforwards.map((feedforward, index) => ({
            name: this.getLabel({
              labelDefinition: this.labelDefinitions.responseTrace?.feedForward,
              headdict: this.logs[index].headdict,
              fallback: `${this.indexToLogName(index)} Feedforward`,
              logIndex: index,
            }),
            type: "line",
            data: feedforward,
            smooth: true,
          })),
        ],
      }
    );
  }

  private plotResponseThrottle() {
    if (!this.charts.responseThrottle) {
      return;
    }

    const activeMainLog = this.logs[this.activeMainIndex];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!activeMainLog) {
      return;
    }

    const time = activeMainLog[this.activeAxis].time;
    const tpaPercent = activeMainLog.headdict.tpa_percent;
    const throttles = this.logs.map((log) => log[this.activeAxis].throttle);

    ResponsePlotter.setChartOptions(this.charts.responseThrottle, "Throttle", {
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
        ...throttles.map((throttle, index) => ({
          type: "line",
          name: this.getLabel({
            labelDefinition: this.labelDefinitions.responseThrottle?.throttle,
            headdict: activeMainLog.headdict,
            fallback: `${this.indexToLogName(index)} throttle %`,
            logIndex: index,
          }),
          data: throttle,
          areaStyle: {},
          smooth: true,
        })),
      ],
    });
  }

  private plotResponseStrength() {
    if (!this.charts.responseStrength) {
      return;
    }

    const activeMainLog = this.logs[this.activeMainIndex];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!activeMainLog) {
      return;
    }

    /*
    const high_masks: Array<number[] | undefined> = this.logs.map(
      (log) => log[this.activeAxis].high_mask
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const highMaskSums = high_masks?.map((mask) =>
      (mask ?? [0]).reduce((a, b) => a + b, 0)
    );
    const useHighMasks = highMaskSums.map((sum) => sum > 0);
    */

    const time_resp = activeMainLog[this.activeAxis].time_resp;
    // const resp_highs = this.logs.map((log) => log[this.activeAxis].resp_high);
    const resp_lows = this.logs.map((log) => log[this.activeAxis].resp_low);

    // const responseStrengthSeries = useHighMasks.map((useHighMask, index) => ({
    const responseStrengthSeries = resp_lows.map((resp_low, index) => ({
      name: this.getLabel({
        labelDefinition: this.labelDefinitions.responseStrength?.response,
        headdict: activeMainLog.headdict,
        fallback: this.indexToLogName(index),
        logIndex: index,
      }),
      type: "line",
      // data: useHighMask ? resp_highs[index]![0] : resp_lows[index][0],
      data: resp_low,
    }));

    console.log('responseStrengthSeries', responseStrengthSeries);

    ResponsePlotter.setChartOptions(
      this.charts.responseStrength,
      "Step Response",
      {
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
          ...responseStrengthSeries,
        ],
      }
    );
  }

  private plotNoiseForField(fieldName: NoiseFields, chart: echarts.ECharts) {
    const activeLog = this.logs[this.activeMainIndex];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!activeLog) {
      return;
    }

    const tr = activeLog![this.activeAxis];
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

    const chartName = fieldName
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    ResponsePlotter.setChartOptions(chart, chartName, {
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
        },
      ],
    });
  }

  private plotNoise() {
    if (this.charts.noiseGyro) {
      this.plotNoiseForField(NoiseFields.NoiseGyro, this.charts.noiseGyro);
    }

    if (this.charts.noiseGyroDebug) {
      this.plotNoiseForField(
        NoiseFields.NoiseDebug,
        this.charts.noiseGyroDebug
      );
    }

    if (this.charts.noiseDTerm) {
      this.plotNoiseForField(NoiseFields.NoiseDTerm, this.charts.noiseDTerm);
    }
  }

  private plotFrequenciesForNoiseAxis(
    noiseAxis: NoiseFields,
    chart: echarts.ECharts
  ) {
    const activeLog = this.logs[this.activeMainIndex];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!activeLog) {
      return;
    }

    const tr = activeLog[this.activeAxis];
    const noise = tr[noiseAxis];

    const data = noise.hist2d_sm.map((frequencyAxis) => {
      const sumOfAllThrottlePositions = frequencyAxis.reduce(
        (a, b) => a + b,
        0
      );

      const meanOverAllThrottlePositions =
        sumOfAllThrottlePositions / frequencyAxis.length;
      return meanOverAllThrottlePositions;
    });

    const frequencyAxis = Array.from({
      length: noise.hist2d_sm.length,
    }).map((_, i) => i);

    let name: string;
    let labelDefinition: SeriesLabelDefinition | undefined;
    switch (noiseAxis) {
      case NoiseFields.NoiseGyro:
        name = "Gyro";
        labelDefinition = this.labelDefinitions.noiseFrequencies?.noise_gyro;
        break;
      case NoiseFields.NoiseDebug:
        name = "Debug";
        labelDefinition = this.labelDefinitions.noiseFrequencies?.noise_debug;
        break;
      case NoiseFields.NoiseDTerm:
        name = "D Term";
        labelDefinition = this.labelDefinitions.noiseFrequencies?.noise_d;
        break;
    }

    ResponsePlotter.setChartOptions(chart, `${name}-Noise Frequencies`, {
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
          name: this.getLabel({
            labelDefinition,
            headdict: activeLog.headdict,
            fallback: "Gyro",
          }),
          type: "bar",
          data: data,
        },
      ],
    });
  }

  private plotNoiseFrequencies() {
    if (this.charts.noiseFrequenciesGyro) {
      this.plotFrequenciesForNoiseAxis(
        NoiseFields.NoiseGyro,
        this.charts.noiseFrequenciesGyro
      );
    }

    if (this.charts.noiseFrequenciesGyroDebug) {
      this.plotFrequenciesForNoiseAxis(
        NoiseFields.NoiseDebug,
        this.charts.noiseFrequenciesGyroDebug
      );
    }

    if (this.charts.noiseFrequenciesDTerm) {
      this.plotFrequenciesForNoiseAxis(
        NoiseFields.NoiseDTerm,
        this.charts.noiseFrequenciesDTerm
      );
    }
  }

  public setLowPowerMode(lowPowerMode: boolean) {
    this.lowPowerMode = lowPowerMode;
  }

  private plotAll() {
    const plotter = [
      this.plotResponseTrace.bind(this),
      this.plotResponseThrottle.bind(this),
      this.plotResponseStrength.bind(this),
      this.plotNoise.bind(this),
      this.plotNoiseFrequencies.bind(this),
    ];

    Object.values(this.charts).forEach((chart) => {
      chart.clear();
    });

    plotter.forEach((plot, plotIndex) => {
      if (this.lowPowerMode) {
        setTimeout(() => {
          plot();
        }, plotIndex * 250);
      } else {
        plot();
      }
    });

    this.resize();
  }

  public setData(logs: PIDAnalyzerResult[]) {
    this.logs = logs;
    this.plotAll();
  }

  public setActiveMainLog(index: number) {
    this.activeMainIndex = index;
    this.plotAll();
  }

  public setActiveAxis(axis: Axis) {
    this.activeAxis = axis;

    this.plotAll();
  }

  public resize() {
    Object.values(this.charts).forEach((chart) => {
      chart.resize();
    });
  }

  public setLabelDefinitions(options: PlotLabelDefinitions) {
    this.labelDefinitions = options;
    this.plotAll();
  }
}
