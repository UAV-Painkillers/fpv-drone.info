import {
  AnalyzeOneFlightStep,
  SplitBBLStep,
  type AnalyzeOneFlightStepToPayloadMap,
  type SplitBBLStepToPayloadMap,
} from '@uav.painkillers/pid-analyzer-wasm';
import {
  AnalyzerStepStatus,
  type AnalyzerProgress,
  type AnalyzerStepStatusIndexArray,
  type Axis,
} from './types';

// Pure reducers extracted from the original use-analyze-log.ts status
// callbacks: `progress.value = {...}` became `return {...}` — behaviour is
// otherwise identical.

function upsertRunning(
  array: AnalyzerStepStatusIndexArray,
  index: number,
): AnalyzerStepStatusIndexArray {
  return [...array, { index, state: AnalyzerStepStatus.RUNNING }];
}

function complete(
  array: AnalyzerStepStatusIndexArray,
  index: number,
): AnalyzerStepStatusIndexArray {
  return array.map((item) =>
    item.index === index
      ? { index: item.index, state: AnalyzerStepStatus.COMPLETE }
      : item,
  );
}

export function applySplitBBLStep<TKey extends SplitBBLStep>(
  progress: AnalyzerProgress,
  step: TKey,
  payload: SplitBBLStepToPayloadMap[TKey],
): AnalyzerProgress {
  switch (step) {
    case SplitBBLStep.RUNNING:
      return {
        ...progress,
        splitting: { ...progress.splitting, state: AnalyzerStepStatus.RUNNING },
      };

    case SplitBBLStep.SPLITTING_BBL:
      return {
        ...progress,
        splitting: {
          ...progress.splitting,
          splittingIntoFlights: AnalyzerStepStatus.RUNNING,
        },
      };

    case SplitBBLStep.BBLS_SPLITTED:
      return {
        ...progress,
        splitting: {
          ...progress.splitting,
          splittingIntoFlights: AnalyzerStepStatus.COMPLETE,
        },
        flightsCount: payload as number,
      };

    case SplitBBLStep.READING_HEADERS_START:
      return {
        ...progress,
        splitting: {
          ...progress.splitting,
          readingHeaders: AnalyzerStepStatus.RUNNING,
        },
      };

    case SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_START: {
      const subFileIndex = payload as number;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          readingHeaders: upsertRunning(progress.subLogs.readingHeaders, subFileIndex),
          state: upsertRunning(progress.subLogs.state, subFileIndex),
        },
      };
    }

    case SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_COMPLETE: {
      const subFileIndex = payload as number;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          readingHeaders: complete(progress.subLogs.readingHeaders, subFileIndex),
        },
      };
    }

    case SplitBBLStep.READING_HEADERS_COMPLETE:
      return {
        ...progress,
        splitting: {
          ...progress.splitting,
          readingHeaders: AnalyzerStepStatus.COMPLETE,
        },
      };

    case SplitBBLStep.DECODING_SUB_BBL_START: {
      const subFileIndex = payload as number;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          decoding: upsertRunning(progress.subLogs.decoding, subFileIndex),
        },
      };
    }

    case SplitBBLStep.DECODING_SUB_BBL_COMPLETE: {
      const subFileIndex = payload as number;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          decoding: complete(progress.subLogs.decoding, subFileIndex),
        },
      };
    }

    case SplitBBLStep.COMPLETE:
      return {
        ...progress,
        splitting: { ...progress.splitting, state: AnalyzerStepStatus.COMPLETE },
      };

    default:
      return progress;
  }
}

export function applyAnalyzeStep<TKey extends AnalyzeOneFlightStep>(
  progress: AnalyzerProgress,
  step: TKey,
  flightLogIndex: number,
  payload: AnalyzeOneFlightStepToPayloadMap[TKey],
): AnalyzerProgress {
  switch (step) {
    case AnalyzeOneFlightStep.START:
      return progress;

    case AnalyzeOneFlightStep.READING_CSV_START:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          readingCSV: upsertRunning(progress.subLogs.readingCSV, flightLogIndex),
        },
      };

    case AnalyzeOneFlightStep.READING_CSV_COMPLETE:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          readingCSV: complete(progress.subLogs.readingCSV, flightLogIndex),
        },
      };

    case AnalyzeOneFlightStep.WRITE_HEADDICT_TO_JSON_START:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          writingHeadDictToJson: upsertRunning(
            progress.subLogs.writingHeadDictToJson,
            flightLogIndex,
          ),
        },
      };

    case AnalyzeOneFlightStep.WRITE_HEADDICT_TO_JSON_COMPLETE:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          writingHeadDictToJson: complete(
            progress.subLogs.writingHeadDictToJson,
            flightLogIndex,
          ),
        },
      };

    case AnalyzeOneFlightStep.ANALYZE_PID_START:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          analyzingPID: upsertRunning(progress.subLogs.analyzingPID, flightLogIndex),
        },
      };

    case AnalyzeOneFlightStep.ANALYZE_PID_TRACE_START: {
      const traceName = payload as Axis;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          analyzingPIDTrace: {
            ...progress.subLogs.analyzingPIDTrace,
            [traceName]: upsertRunning(
              progress.subLogs.analyzingPIDTrace[traceName],
              flightLogIndex,
            ),
          },
        },
      };
    }

    case AnalyzeOneFlightStep.ANALYZE_PID_TRACE_COMPLETE: {
      const traceName = payload as Axis;
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          analyzingPIDTrace: {
            ...progress.subLogs.analyzingPIDTrace,
            [traceName]: complete(
              progress.subLogs.analyzingPIDTrace[traceName],
              flightLogIndex,
            ),
          },
        },
      };
    }

    case AnalyzeOneFlightStep.ANALYZE_PID_COMPLETE:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          analyzingPID: complete(progress.subLogs.analyzingPID, flightLogIndex),
        },
      };

    case AnalyzeOneFlightStep.COMPLETE:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          state: complete(progress.subLogs.state, flightLogIndex),
        },
      };

    case AnalyzeOneFlightStep.ERROR:
      return {
        ...progress,
        subLogs: {
          ...progress.subLogs,
          state: progress.subLogs.state.map((item) =>
            item.index === flightLogIndex
              ? {
                  index: item.index,
                  state: AnalyzerStepStatus.ERROR,
                  error: payload as string,
                }
              : item,
          ),
        },
      };

    default:
      return progress;
  }
}
