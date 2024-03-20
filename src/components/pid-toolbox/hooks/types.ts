export enum AnalyzerStepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETE = "COMPLETE",
  SKIPPED = "SKIPPED",
  ERROR = "ERROR",
}

export type AnalyzerStepStatusIndexArray = {
  index: number;
  state: AnalyzerStepStatus;
}[];

export interface AnalyzerProgress {
  flightsCount: number;
  analyzerErrors: string[];
  splitting: {
    state: AnalyzerStepStatus;
    splittingIntoFlights: AnalyzerStepStatus;
    readingHeaders: AnalyzerStepStatus;
  };
  subLogs: {
    state: AnalyzerStepStatusIndexArray;
    readingHeaders: AnalyzerStepStatusIndexArray;
    decoding: AnalyzerStepStatusIndexArray;
    readingCSV: AnalyzerStepStatusIndexArray;
    writingHeadDictToJson: AnalyzerStepStatusIndexArray;
    analyzingPID: AnalyzerStepStatusIndexArray;
    analyzingPIDTrace: {
      roll: AnalyzerStepStatusIndexArray;
      pitch: AnalyzerStepStatusIndexArray;
      yaw: AnalyzerStepStatusIndexArray;
    };
  };
}

const makeState = () => "PENDING" as AnalyzerStepStatus;
const makeStateIndexArray = () =>
  [] as { index: number; state: AnalyzerStepStatus }[];

export const makeEmptyProgress = () =>
  ({
    flightsCount: 0,
    analyzerErrors: [] as string[],
    splitting: {
      state: makeState(),
      splittingIntoFlights: makeState(),
      readingHeaders: makeState(),
    },
    subLogs: {
      readingHeaders: makeStateIndexArray(),
      decoding: makeStateIndexArray(),
      state: makeStateIndexArray(),
      readingCSV: makeStateIndexArray(),
      writingHeadDictToJson: makeStateIndexArray(),
      analyzingPID: makeStateIndexArray(),
      analyzingPIDTrace: {
        roll: makeStateIndexArray(),
        pitch: makeStateIndexArray(),
        yaw: makeStateIndexArray(),
      },
    },
  }) as AnalyzerProgress;
