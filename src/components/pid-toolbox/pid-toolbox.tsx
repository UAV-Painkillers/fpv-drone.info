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
  useContext,
} from "@builder.io/qwik";
import { ResponsePlotter } from "./response.plotter";
import type { RegisteredComponent } from "@builder.io/sdk-qwik/types/src/server-index";
import styles from "./pid-toolbox.module.css";
import { PIDToolboxStatusDialog } from "./pid-toolbox-status-dialog";
import type { AnalyzerStatus } from "./analyzer-status";
import { AnalyzerStepStatus } from "./analyzer-status";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import type { ChangeEvent } from "react";
import classNames from "classnames";
import { AppContext } from "~/app.ctx";
import { useLocation } from "@builder.io/qwik-city";
import { Dialog } from "../shared/dialog/dialog";
/**
 * TODO: List
 * - [ ] Split into smaller components/functions/files
 * - [ ] Multiple logs in one plot
 * - [ ] latency plot (ask discord people what it is)
 * - [ ] analyzer status dialog -> beter readability
 * - [ ] better memory handling by posting from python to js as soon as possible
 */

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
  const responseTraceChartRef = useSignal<HTMLDivElement>();
  const responseThrottleChartRef = useSignal<HTMLDivElement>();
  const responseStrengthChartRef = useSignal<HTMLDivElement>();
  const noiseGyroChartRef = useSignal<HTMLDivElement>();
  const noiseGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseDTermChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesDTermChartRef = useSignal<HTMLDivElement>();

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

  const selectedLogIndexes = useSignal<number[]>([]);

  const analyzer = useSignal<NoSerialize<PIDAnalyzer>>();
  const plotter = useSignal<NoSerialize<ResponsePlotter>>();

  const analyzerResults = useSignal<NoSerialize<PIDAnalyzerResult[]>>(
    noSerialize([])
  );

  const plotStepResponse = $((logs: PIDAnalyzerResult[]) => {
    if (!plotter.value) {
      plotter.value = noSerialize(
        new ResponsePlotter(
          responseTraceChartRef.value!,
          responseThrottleChartRef.value!,
          responseStrengthChartRef.value!,
          noiseGyroChartRef.value!,
          noiseGyroDebugChartRef.value!,
          noiseDTermChartRef.value!,
          noiseFrequenciesGyroChartRef.value!,
          noiseFrequenciesGyroDebugChartRef.value!,
          noiseFrequenciesDTermChartRef.value!
        )
      );
    }

    plotter.value!.setData(logs);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(analyzerResults);
    track(selectedLogIndexes);

    const logsToShow =
      analyzerResults.value?.filter((_, i) =>
        selectedLogIndexes.value.includes(i)
      ) ?? [];

    plotStepResponse(logsToShow);
  });

  const appContext = useContext(AppContext);
  const location = useLocation();

  const updatePageHeaderVisibility = $(() => {
    console.log("updating visibility");

    let displayMode = "browser";
    const mqStandAlone = "(display-mode: standalone)";
    if (
      (navigator as any).standalone ||
      window.matchMedia(mqStandAlone).matches
    ) {
      displayMode = "standalone";
    }

    appContext.showPageHeader = displayMode !== "standalone";
  });

  useOnWindow("load", updatePageHeaderVisibility);
  useOnWindow("resize", updatePageHeaderVisibility);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(location);

    updatePageHeaderVisibility();
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
      await analyzer.value!.init(
        `${location.url.origin}/pid-analyer-dependencies`
      );
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
    }
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

  const openFile = $(async (file?: File) => {
    if (!file) {
      console.warn("No file provided");
      return;
    }

    try {
      analyzerStatus.value = {
        ...analyzerStatus.value,
        state: "running",
      };

      const bytes = await file.arrayBuffer();
      const uint8_view = new Uint8Array(bytes);
      const stepResponseResult = await analyzer.value!.analyze(
        uint8_view,
        (status: string, payload: any) => {
          updateAnalyzerStatus(status as AnalyzerStep, payload);
        }
      );

      showPlots.value = true;
      analyzerResults.value = noSerialize(stepResponseResult);
      selectedLogIndexes.value = stepResponseResult.map((_, index) => index);
    } finally {
      analyzerStatus.value = {
        ...analyzerStatus.value,
        state: "idle",
      };
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

      openFile(file);
    };

    input.click();
  });

  useOnWindow(
    "resize",
    $(() => {
      if (plotter.value) {
        plotter.value.resize();
      }
    })
  );

  if (analyzerStatus.value.state === "loading") {
    return (
      <div>
        <center>
          <img
            height="300"
            width="300"
            style={{
              height: "30vh !important",
              width: "auto",
              display: "block",
              transition: "height .4s ease",
            }}
            // eslint-disable-next-line qwik/jsx-img
            src="/original_images/racoon_processing-cropped.gif"
          />

          <br />
          <label for="pid-analyzer-loading-indicator">
            Loading analyzer...
          </label>
        </center>
      </div>
    );
  }

  const isDroppingFile = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
      isDroppingFile.value = true;
    });

    window.addEventListener("dragleave", (e) => {
      e.preventDefault();
      isDroppingFile.value = false;
    });

    window.addEventListener("drop", (e) => {
      e.preventDefault();
      isDroppingFile.value = false;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      openFile(e.dataTransfer?.files?.[0]);
    });
  });

  const logSelectionOpen = useSignal(false);
  const onLogSelectionChange = $((index: number) => {
    const wasSelected = selectedLogIndexes.value.includes(index);

    if (wasSelected) {
      selectedLogIndexes.value = selectedLogIndexes.value.filter(
        (i) => i !== index
      );
    } else {
      selectedLogIndexes.value = [...selectedLogIndexes.value, index];
    }
  });

  const onLogSelectionClose = $(() => {
    logSelectionOpen.value = false;
  });

  const activeMainLogIndex = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(activeMainLogIndex);
    if (plotter.value) {
      plotter.value.setActiveMainLog(activeMainLogIndex.value);
    }
  });

  return (
    <div
      class={classNames(styles.wrapper, {
        [styles.wrapperDropover]: isDroppingFile.value,
      })}
    >
      <button
        type="button"
        onClick$={openFilePicker}
        class={classNames("button", styles.uploadButton, {
          [styles.uploadButtonDropover]: isDroppingFile.value,
        })}
      >
        {analyzerStatus.value.state === "running" && <InlineSpinner />}
        Click to open a Blackbox File (.bbl) or drag and drop it here
      </button>

      <PIDToolboxStatusDialog
        analyzerStatus={analyzerStatus.value}
        isOpen={analyzerStatus.value.state === "running"}
      />

      <div style={{ display: showPlots.value ? undefined : "none" }}>
        <Dialog open={logSelectionOpen.value} onClose={onLogSelectionClose}>
          <>
            {analyzerResults.value?.map((_, i) => (
              <label key={i} style={{ display: "block", marginBlock: "15px" }}>
                <input
                  type="checkbox"
                  checked={selectedLogIndexes.value.includes(i)}
                  onChange$={() => {
                    onLogSelectionChange(i);
                  }}
                />
                {`Flightlog #${i + 1}`}
              </label>
            ))}
          </>
        </Dialog>

        <nav class={styles.plotNavigation}>
          <button
            class="button"
            onClick$={() => (logSelectionOpen.value = !logSelectionOpen.value)}
          >
            Combined Logs ({selectedLogIndexes.value.length} / {analyzerResults.value?.length})
          </button>

          <select
            class="button"
            onChange$={(e) => {
              const selectedIndex = parseInt(
                (e as unknown as ChangeEvent<HTMLSelectElement>).target.value
              );
              console.log("selected index", selectedIndex);
              activeMainLogIndex.value = selectedIndex;
            }}
          >
            {analyzerResults.value?.map((_, i) => (
              <option
                key={i}
                selected={activeMainLogIndex.value === i}
                value={i}
              >{`Active Flightlog #${i + 1}`}</option>
            ))}
          </select>

          <select
            class="button"
            value={analyzerActiveAxis.value}
            onChange$={(e) => {
              analyzerActiveAxis.value = (
                e as unknown as ChangeEvent<HTMLSelectElement>
              ).target.value as "roll" | "pitch" | "yaw";
            }}
          >
            <option value="roll" selected={analyzerActiveAxis.value === "roll"}>
              Axis: Roll
            </option>
            <option
              value="pitch"
              selected={analyzerActiveAxis.value === "pitch"}
            >
              Axis: Pitch
            </option>
            <option value="yaw" selected={analyzerActiveAxis.value === "yaw"}>
              Axis: Yaw
            </option>
          </select>
        </nav>

        <h2 style={{ marginBottom: "1rem" }}>Filter Tuning</h2>

        <div class={styles.noisePlotGrid}>
          <div class={styles.noiseGyroDebug} ref={noiseGyroDebugChartRef}></div>
          <div class={styles.noiseGyro} ref={noiseGyroChartRef}></div>
          <div class={styles.noiseDTerm} ref={noiseDTermChartRef}></div>
          <div
            class={styles.noiseFrequenciesGyro}
            ref={noiseFrequenciesGyroChartRef}
          ></div>
          <div
            class={styles.noiseFrequenciesGyroDebug}
            ref={noiseFrequenciesGyroDebugChartRef}
          ></div>
          <div
            class={styles.noiseFrequenciesDTerm}
            ref={noiseFrequenciesDTermChartRef}
          ></div>
        </div>

        <hr />
        <h2 style={{ marginBottom: "1rem" }}>PID Response Tuning</h2>

        <div class={styles.responsePlotGrid}>
          <div class={styles.responseTrace} ref={responseTraceChartRef}></div>

          <div
            class={styles.responseStrength}
            ref={responseStrengthChartRef}
          ></div>

          <div
            class={styles.responseThrottle}
            ref={responseThrottleChartRef}
          ></div>
        </div>

        {/* not beautiful but needed for the sticky navigation to not overlay the last chart */}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    </div>
  );
});

export const PIDToolboxRegistryDefinition: RegisteredComponent = {
  component: PIDToolbox,
  name: "PIDToolbox",
  inputs: [],
};
