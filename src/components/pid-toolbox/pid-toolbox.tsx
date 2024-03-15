import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";
import { PIDAnalyzer } from "@uav.painkillers/pid-analyzer-wasm";
import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  $,
  useVisibleTask$,
  noSerialize,
  useTask$,
  useOnWindow,
} from "@builder.io/qwik";
import { ResponsePlotter } from "./response.plotter";
import type { RegisteredComponent } from "@builder.io/sdk-qwik/types/src/server-index";
import styles from "./pid-toolbox.module.css";
import { PIDToolboxStatusDialog } from "./pid-toolbox-status-dialog";
import type { AnalyzerStatus } from "./analyzer-status";
import { AnalyzerStepStatus } from "./analyzer-status";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import type { ChangeEvent } from "react";

type AnalyzerStep =
  | "PROCESSING_MAIN_BBL"
  | "DECODING_SUB_BBLS"
  | "DECODE_SUB_BBL_SKIPPED"
  | "DECODE_SUB_BBL_START"
  | "DECODE_SUB_BBL_COMPLETE"
  | "READING_HEADERS_FROM_SUB_BBL_START"
  | "READING_HEADERS_FROM_SUB_BBL_COMPLETE"
  | "READING_DECODED_SUB_BBL_START"
  | "READING_DECODED_SUB_BBL_COMPLETE"
  | "RUNNING_PID_ANALYSIS_ON_SUB_BBL_START"
  | "RUNNING_PID_ANALYSIS_ON_SUB_BBL_COMPLETE"
  | "SAVING_PID_ANALYSIS_RESULTS_FROM_SUB_BBL_START"
  | "SAVING_PID_ANALYSIS_RESULTS_FROM_SUB_BBL_COMPLETE"
  | "PID_ANALYSIS_COMPLETE";

export const PIDToolbox = component$(() => {
  const traceChartRef = useSignal<HTMLDivElement>();
  const throttleChartRef = useSignal<HTMLDivElement>();
  const strengthChartRef = useSignal<HTMLDivElement>();
  const gyroVsThrottleChartRef = useSignal<HTMLDivElement>();

  const analyzerStatus = useSignal<AnalyzerStatus>({
    state: "loading",
    progress: {
      processingMainBBL: AnalyzerStepStatus.PENDING,
      subBBL_count: 0,
      subBBL_skipped: 0,
      subBBL_decoding_running: 0,
      subBBL_decoding_complete: 0,
      subBBL_reading_headers_running: 0,
      subBBL_reading_headers_complete: 0,
      subBBL_reading_decoded_running: 0,
      subBBL_reading_decoded_complete: 0,
      subBBL_running_analysis_running: 0,
      subBBL_running_analysis_complete: 0,
      subBBL_saving_results_running: 0,
      subBBL_saving_results_complete: 0,
    },
  });
  const analyzerActiveAxis = useSignal<"roll" | "pitch" | "yaw">("roll");
  const showPlots = useSignal(false);

  const analyzer = useSignal<NoSerialize<PIDAnalyzer>>();
  const plotter = useSignal<NoSerialize<ResponsePlotter>>();

  const plotStepResponse = $((data: PIDAnalyzerResult) => {
    console.log({
      traceChartRef: traceChartRef.value,
      throttleChartRef: throttleChartRef.value,
      strengthChartRef: strengthChartRef.value,
      gyroVsThrottleChartRef: gyroVsThrottleChartRef.value,
    });
    plotter.value = noSerialize(
      new ResponsePlotter(
        traceChartRef.value!,
        throttleChartRef.value!,
        strengthChartRef.value!,
        gyroVsThrottleChartRef.value!,
      ),
    );
    plotter.value!.setData(data);
  });

  useTask$(({ track }) => {
    track(analyzerActiveAxis);
    if (!plotter.value) {
      return;
    }

    plotter.value.setActiveAxis(analyzerActiveAxis.value);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      analyzerStatus.value = {
        ...analyzerStatus.value,
        state: "loading",
      };
      analyzer.value = noSerialize(new PIDAnalyzer());
      await analyzer.value!.init(`${location.origin}/pid-analyer-dependencies`);
    } finally {
      analyzerStatus.value = {
        ...analyzerStatus.value,
        state: "idle",
      };
    }
  });

  const increaseSubBBLStepCount = $(
    (stepType: keyof Omit<AnalyzerStatus["progress"], "processingMainBBL">) => {
      analyzerStatus.value = {
        ...analyzerStatus.value,
        progress: {
          ...analyzerStatus.value.progress!,
          [stepType]: analyzerStatus.value.progress![stepType] + 1,
        },
      };
    },
  );

  const updateAnalyzerStatus = $((step: AnalyzerStep, payload?: any) => {
    console.log("received step", step, payload);
    switch (step) {
      case "PROCESSING_MAIN_BBL": {
        analyzerStatus.value = {
          state: "running",
          progress: {
            ...analyzerStatus.value.progress!,
            processingMainBBL: AnalyzerStepStatus.RUNNING,
          },
        };
        break;
      }

      case "DECODING_SUB_BBLS": {
        const count = payload as number;

        analyzerStatus.value = {
          ...analyzerStatus.value!,
          progress: {
            ...analyzerStatus.value.progress!,
            subBBL_count: count,
          },
        };
        break;
      }

      case "DECODE_SUB_BBL_SKIPPED": {
        increaseSubBBLStepCount("subBBL_skipped");
        break;
      }

      case "DECODE_SUB_BBL_START": {
        increaseSubBBLStepCount("subBBL_decoding_running");
        break;
      }

      case "DECODE_SUB_BBL_COMPLETE": {
        increaseSubBBLStepCount("subBBL_decoding_complete");
        break;
      }

      case "READING_HEADERS_FROM_SUB_BBL_START": {
        increaseSubBBLStepCount("subBBL_reading_headers_running");
        break;
      }

      case "READING_HEADERS_FROM_SUB_BBL_COMPLETE": {
        increaseSubBBLStepCount("subBBL_reading_headers_complete");
        break;
      }

      case "READING_DECODED_SUB_BBL_START": {
        increaseSubBBLStepCount("subBBL_reading_decoded_running");
        break;
      }

      case "READING_DECODED_SUB_BBL_COMPLETE": {
        increaseSubBBLStepCount("subBBL_reading_decoded_complete");
        break;
      }

      case "RUNNING_PID_ANALYSIS_ON_SUB_BBL_START": {
        increaseSubBBLStepCount("subBBL_running_analysis_running");
        break;
      }

      case "RUNNING_PID_ANALYSIS_ON_SUB_BBL_COMPLETE": {
        increaseSubBBLStepCount("subBBL_running_analysis_complete");
        break;
      }

      case "SAVING_PID_ANALYSIS_RESULTS_FROM_SUB_BBL_START": {
        increaseSubBBLStepCount("subBBL_saving_results_running");
        break;
      }

      case "SAVING_PID_ANALYSIS_RESULTS_FROM_SUB_BBL_COMPLETE": {
        increaseSubBBLStepCount("subBBL_saving_results_complete");
        break;
      }

      case "PID_ANALYSIS_COMPLETE": {
        analyzerStatus.value = {
          ...analyzerStatus.value!,
          progress: {
            ...analyzerStatus.value.progress!,
            processingMainBBL: AnalyzerStepStatus.COMPLETE,
          },
          state: "idle",
        };

        console.log("PID_ANALYSIS_COMPLETE", analyzerStatus);
        break;
      }

      default:
        throw new Error(`Unknown step: ${step}`);
    }
  });

  const openFilePicker = $(() => {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    // input.accept = ".bbl,.txt,.cfl,.bfl,.log";

    // read file into memory
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      try {
        analyzerStatus.value = {
          ...analyzerStatus.value,
          state: "running",
        };

        const bytes = await file.arrayBuffer();
        const uint8_view = new Uint8Array(bytes);
        alert("now analyzing");
        const stepResponseResult = await analyzer.value!.analyze(
          uint8_view,
          (status: string, payload: any) => {
            updateAnalyzerStatus(status as AnalyzerStep, payload);
          },
        );

        // showPlots.value = true;
        alert("now plotting");
        plotStepResponse(stepResponseResult[0]);
      } finally {
        analyzerStatus.value = {
          ...analyzerStatus.value,
          state: "idle",
        };
      }
    };

    input.click();
  });

  useOnWindow(
    "resize",
    $(() => {
      if (plotter.value) {
        plotter.value.resize();
      }
    }),
  );

  if (analyzerStatus.value.state === "loading") {
    return (
      <div>
        <h1>Loading analyzer...</h1>
        <center>
          <InlineSpinner />
        </center>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick$={openFilePicker}>
        {analyzerStatus.value.state === "running" && <InlineSpinner />}
        Open Blackbox Log
      </button>

      <PIDToolboxStatusDialog
        analyzerStatus={analyzerStatus.value}
        isOpen={analyzerStatus.value.state === "running"}
      />

      <div style={{ display: showPlots.value ? undefined : "none" }}>
        <select
          value={analyzerActiveAxis.value}
          onChange$={(e) => {
            analyzerActiveAxis.value = (
              e as unknown as ChangeEvent<HTMLSelectElement>
            ).target.value as "roll" | "pitch" | "yaw";
          }}
        >
          <option value="roll">Roll</option>
          <option value="pitch">Pitch</option>
          <option value="yaw">Yaw</option>
        </select>

        <div class={styles.responsePlotGrid}>
          <div class={styles.responseTrace} ref={traceChartRef}></div>

          <div class={styles.responseStrength} ref={strengthChartRef}></div>

          <div class={styles.responseThrottle} ref={throttleChartRef}></div>
        </div>

        <div class={styles.noisePlotGrid}>
          <div class={styles.noiseGyro} ref={gyroVsThrottleChartRef}></div>
        </div>
      </div>
    </>
  );
});

export const PIDToolboxRegistryDefinition: RegisteredComponent = {
  component: PIDToolbox,
  name: "PIDToolbox",
  inputs: [],
};
