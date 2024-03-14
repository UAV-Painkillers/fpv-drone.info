import * as echarts from "echarts";
import type {
  PIDAnalyzerTraceData,
  PIDAnalyzerGeneralInformation,
} from "@uav.painkillers/pid-analyzer-wasm";

export class ResponsePlotter {
  private traceChart: echarts.ECharts;
  private throttleChart: echarts.ECharts;
  private responseChart: echarts.ECharts;
  private strengthChart: echarts.ECharts;

  constructor(
    traceElement: HTMLElement,
    throttleElement: HTMLElement,
    responseElement: HTMLElement,
    strengthElement: HTMLElement
  ) {
    this.traceChart = echarts.init(traceElement);
    this.throttleChart = echarts.init(throttleElement);
    this.responseChart = echarts.init(responseElement);
    this.strengthChart = echarts.init(strengthElement);
  }

  private mapTimeToSeconds(time: number[]) {
    return time.map((t) => Math.round(t));
  }

  private plotTrace(data: PIDAnalyzerTraceData) {
    const traceLimit = Math.max(
      Math.max(...data.gyro.map(Math.abs)),
      Math.max(...data.input.map(Math.abs))
    );

    this.traceChart.setOption({
      xAxis: {
        data: this.mapTimeToSeconds(data.time),
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
          name: data.name + " gyro",
          type: "line",
          data: data.gyro,
          smooth: true,
        },
        {
          name: data.name + " loop input",
          type: "line",
          data: data.input,
          smooth: true,
        },
      ],
    });
  }

  private plotThrottle(
    generalInformation: PIDAnalyzerGeneralInformation,
    data: PIDAnalyzerTraceData
  ) {
    this.throttleChart.setOption({
      xAxis: {
        data: this.mapTimeToSeconds(data.time),
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
          data: Array(data.time.length).fill(generalInformation.tpa_percent),
          lineStyle: {
            color: "red",
          },
        },
        {
          type: "line",
          name: "throttle %",
          data: data.throttle,
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

  private getRawResponsePlotOptions(data: PIDAnalyzerTraceData) {
    console.log("plotting raw response", data);
    console.error("not implemented");
  }

  private getNormalResponsePlotOptions(data: PIDAnalyzerTraceData) {
    console.log("plotting normal response", data);
    console.warn("not implemented");
  }

  private plotResponse(data: PIDAnalyzerTraceData, style?: "raw") {
    console.log("plotting response", data);
    console.warn("not implemented");
    return;
    let options: echarts.EChartsCoreOption;
    if (style === "raw") {
      options = this.getRawResponsePlotOptions(data);
    } else {
      options = this.getNormalResponsePlotOptions(data);
    }
    this.responseChart.setOption(options);
  }

  private plotStrength(data: PIDAnalyzerTraceData) {
    const highMaskSum = (data.high_mask ?? [0]).reduce((a, b) => a + b, 0);
    const useHighMask = highMaskSum > 0;

    this.strengthChart.setOption({
      xAxis: {
        // data: this.mapTimeToSeconds(data.time),
        //min: -0.001,
        //max: 0.501,
        data: data.time_resp.map((t) => t.toFixed(1)),
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
          data: useHighMask ? data.resp_high[0] : data.resp_low[0],
        },
      ],
      grid: {
        show: true,
      },
    });
  }

  public plotAllResp(
    generalInformation: PIDAnalyzerGeneralInformation,
    data: PIDAnalyzerTraceData,
    style: "raw" | "" = ""
  ) {
    this.plotTrace(data);
    this.plotThrottle(generalInformation, data);
    this.plotResponse(data, style);
    this.plotStrength(data);
  }
}
