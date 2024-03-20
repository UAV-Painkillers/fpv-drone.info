import type { NoSerialize } from "@builder.io/qwik";
import { $, noSerialize, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useToolboxContextProvider } from "../context/pid-toolbox.context";
import type {
  SplitBBLStepToPayloadMap,
  AnalyzeOneFlightStepToPayloadMap,
} from "@uav.painkillers/pid-analyzer-wasm";
import {
  PIDAnalyzer,
  AnalyzeOneFlightStep,
  SplitBBLStep,
} from "@uav.painkillers/pid-analyzer-wasm";
import { useLocation } from "@builder.io/qwik-city";
import type { AnalyzerProgress } from "./types";
import { AnalyzerStepStatus, makeEmptyProgress } from "./types";

export function useAnalyzeLog() {
  const toolboxState = useToolboxContextProvider();
  const location = useLocation();

  const state = useSignal<"loading" | "idle" | "running" | "error" | "done">(
    "idle"
  );
  const progress = useSignal<AnalyzerProgress>(makeEmptyProgress());
  const error = useSignal<string | null>(null);
  const analyzer = useSignal<NoSerialize<PIDAnalyzer>>();

  /**
   * Initialize the analyzer on component mount
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      state.value = "loading";
      analyzer.value = noSerialize(
        new PIDAnalyzer(`${location.url.origin}/pid-analyer-dependencies`)
      );
      await analyzer.value!.init();
    } catch (e) {
      state.value = "error";
      error.value = (e as Error).message;
      console.error(e);
    } finally {
      state.value = "idle";
    }
  });

  const onSplitBBLStatusReport = $(
    <TKey extends SplitBBLStep>(
      step: TKey,
      payload: SplitBBLStepToPayloadMap[TKey]
    ) => {
      switch (step) {
        case SplitBBLStep.RUNNING: {
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              state: AnalyzerStepStatus.RUNNING,
            },
          };
          break;
        }

        case SplitBBLStep.SPLITTING_BBL: {
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              splittingIntoFlights: AnalyzerStepStatus.RUNNING,
            },
          };
          break;
        }

        case SplitBBLStep.BBLS_SPLITTED: {
          const subFileCount = payload as number;
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              splittingIntoFlights: AnalyzerStepStatus.COMPLETE,
            },
            flightsCount: subFileCount,
          };
          break;
        }

        case SplitBBLStep.READING_HEADERS_START: {
          // const subFileCount = payload as number;
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              readingHeaders: AnalyzerStepStatus.RUNNING,
            },
          };
          break;
        }

        case SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_START: {
          const subFileIndex = payload as number;
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              readingHeaders: [
                ...progress.value.subLogs.readingHeaders,
                { index: subFileIndex, state: AnalyzerStepStatus.RUNNING },
              ],
              state: [
                ...progress.value.subLogs.state,
                { index: subFileIndex, state: AnalyzerStepStatus.RUNNING },
              ],
            },
          };
          break;
        }

        case SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_COMPLETE: {
          const subFileIndex = payload as number;
          const newReadingHeaders =
            progress.value.subLogs.readingHeaders.map((item) =>
              item.index === subFileIndex
                ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                : item
            );
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              readingHeaders: newReadingHeaders,
            },
          };
          break;
        }

        case SplitBBLStep.READING_HEADERS_COMPLETE: {
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              readingHeaders: AnalyzerStepStatus.COMPLETE,
            },
          };
          break;
        }

        case SplitBBLStep.DECODING_SUB_BBL_START: {
          const subFileIndex = payload as number;
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              decoding: [
                ...progress.value.subLogs.decoding,
                { index: subFileIndex, state: AnalyzerStepStatus.RUNNING },
              ],
            },
          };
          break;
        }

        case SplitBBLStep.DECODING_SUB_BBL_COMPLETE: {
          const subFileIndex = payload;
          const newDecoding = progress.value.subLogs.decoding.map((item) =>
            item.index === subFileIndex
              ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
              : item
          );
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              decoding: newDecoding,
            },
          };
          break;
        }

        case SplitBBLStep.COMPLETE: {
          progress.value = {
            ...progress.value,
            splitting: {
              ...progress.value.splitting,
              state: AnalyzerStepStatus.COMPLETE,
            },
          };
          break;
        }
      }
    }
  );

  const onAnalyzerStatusReport = $(
    <TKey extends AnalyzeOneFlightStep>(
      step: TKey,
      flightLogIndex: number,
      payload: AnalyzeOneFlightStepToPayloadMap[TKey]
    ) => {
      switch (step) {
        case AnalyzeOneFlightStep.START: {
          // nothing to do
          break;
        }

        case AnalyzeOneFlightStep.READING_CSV_START: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              readingCSV: [
                ...progress.value.subLogs.readingCSV,
                { index: flightLogIndex, state: AnalyzerStepStatus.RUNNING },
              ],
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.READING_CSV_COMPLETE: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              readingCSV: progress.value.subLogs.readingCSV.map((item) =>
                item.index === flightLogIndex
                  ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                  : item
              ),
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.WRITE_HEADDICT_TO_JSON_START: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              writingHeadDictToJson: [
                ...progress.value.subLogs.writingHeadDictToJson,
                { index: flightLogIndex, state: AnalyzerStepStatus.RUNNING },
              ],
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.WRITE_HEADDICT_TO_JSON_COMPLETE: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              writingHeadDictToJson:
                progress.value.subLogs.writingHeadDictToJson.map((item) =>
                  item.index === flightLogIndex
                    ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                    : item
                ),
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.ANALYZE_PID_START: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              analyzingPID: [
                ...progress.value.subLogs.analyzingPID,
                { index: flightLogIndex, state: AnalyzerStepStatus.RUNNING },
              ],
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.ANALYZE_PID_TRACE_START: {
          const traceName = payload as "roll" | "pitch" | "yaw";

          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              analyzingPIDTrace: {
                ...progress.value.subLogs.analyzingPIDTrace,
                [traceName]: [
                  ...progress.value.subLogs.analyzingPIDTrace[traceName],
                  { index: flightLogIndex, state: AnalyzerStepStatus.RUNNING },
                ],
              },
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.ANALYZE_PID_TRACE_COMPLETE: {
          const traceName = payload as "roll" | "pitch" | "yaw";

          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              analyzingPIDTrace: {
                ...progress.value.subLogs.analyzingPIDTrace,
                [traceName]: progress.value.subLogs.analyzingPIDTrace[
                  traceName
                ].map((item) =>
                  item.index === flightLogIndex
                    ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                    : item
                ),
              },
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.ANALYZE_PID_COMPLETE: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              analyzingPID: progress.value.subLogs.analyzingPID.map(
                (item) =>
                  item.index === flightLogIndex
                    ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                    : item
              ),
            },
          };
          break;
        }

        case AnalyzeOneFlightStep.COMPLETE:
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              state: progress.value.subLogs.state.map((item) =>
                item.index === flightLogIndex
                  ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
                  : item
              ),
            },
          };
          break;

        case AnalyzeOneFlightStep.ERROR: {
          progress.value = {
            ...progress.value,
            subLogs: {
              ...progress.value.subLogs,
              state: progress.value.subLogs.state.map((item) =>
                item.index === flightLogIndex
                  ? { index: item.index, state: AnalyzerStepStatus.ERROR }
                  : item
              ),
            },
          };
          break;
        }

        default:
          console.warn("Unknown step", step, payload);
      }
    }
  );

  const analyzeFile = $(async (file?: File) => {
    if (!file) {
      console.warn("No file provided");
      return;
    }

    try {
      state.value = "running";
      progress.value = makeEmptyProgress();

      const bytes = await file.arrayBuffer();

      const decoderResults = await analyzer.value!.decodeMainBBL(
        bytes,
        (status, payload) => {
          onSplitBBLStatusReport(status, payload);
        }
      );

      const analyzeResult = await analyzer.value!.analyze(
        decoderResults,
        (status, index, payload) => {
          onAnalyzerStatusReport(status, index, payload);
        }
      );

      toolboxState.results = noSerialize(analyzeResult);
      toolboxState.selectedLogIndexes = analyzeResult.map((_, index) => index);

      state.value = "done";
    } catch (e) {
      state.value = "error";
      console.error(e);
      error.value = (e as Error).message;
    }
  });

  return {
    analyzeFile,
    progress,
    state,
    error,
  };
}
