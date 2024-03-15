export enum AnalyzerStepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETE = "COMPLETE",
  SKIPPED = "SKIPPED",
}

export interface AnalyzerStatus {
  state: "loading" | "idle" | "running";
  progress: {
    processingMainBBL: AnalyzerStepStatus;
    subBBL_count: number;
    subBBL_skipped: number;

    subBBL_decoding_running: number;
    subBBL_decoding_complete: number;

    subBBL_reading_headers_running: number;
    subBBL_reading_headers_complete: number;

    subBBL_reading_decoded_running: number;
    subBBL_reading_decoded_complete: number;

    subBBL_running_analysis_running: number;
    subBBL_running_analysis_complete: number;

    subBBL_saving_results_running: number;
    subBBL_saving_results_complete: number;
  };
}
