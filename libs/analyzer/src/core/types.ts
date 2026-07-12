// Ported verbatim from the original tuning-tools hooks/types.ts.

export enum AnalyzerStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETE = 'COMPLETE',
  SKIPPED = 'SKIPPED',
  ERROR = 'ERROR',
}

export type AnalyzerStepStatusIndexArray = {
  index: number;
  state: AnalyzerStepStatus;
  error?: string;
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

export type Axis = 'roll' | 'pitch' | 'yaw';

export enum AnalyzerState {
  UNINITIALIZED = 'uninitialized',
  LOADING = 'loading',
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error',
  DONE = 'done',
}

export function makeEmptyProgress(): AnalyzerProgress {
  return {
    flightsCount: 0,
    analyzerErrors: [],
    splitting: {
      state: AnalyzerStepStatus.PENDING,
      splittingIntoFlights: AnalyzerStepStatus.PENDING,
      readingHeaders: AnalyzerStepStatus.PENDING,
    },
    subLogs: {
      state: [],
      readingHeaders: [],
      decoding: [],
      readingCSV: [],
      writingHeadDictToJson: [],
      analyzingPID: [],
      analyzingPIDTrace: {
        roll: [],
        pitch: [],
        yaw: [],
      },
    },
  };
}
