import { component$, useSignal } from "@builder.io/qwik";
import { Dialog } from "../shared/dialog/dialog";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import { Inset } from "../inset/inset";
import type { AnalyzerStatus } from "./analyzer-status";

interface Props {
  isOpen: boolean;
  analyzerStatus: AnalyzerStatus;
}

export const PIDToolboxStatusDialog = component$((props: Props) => {
  const dialogRef = useSignal<HTMLDialogElement>();

  if (props.isOpen) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }

  const subBBLIsDone = (
    index: number,
    status?: keyof Omit<AnalyzerStatus["progress"], "processingMainBBL">,
  ) => {
    if (!status) {
      status = "subBBL_saving_results_complete";
    }
    return props.analyzerStatus.progress[status] >= index + 1;
  };

  return (
    <Dialog title="PID Analysis Status" ref={dialogRef}>
      <div>
        <div>
          <InlineSpinner
            success={
              props.analyzerStatus.progress.subBBL_count !== 0 &&
              props.analyzerStatus.progress.subBBL_count -
                props.analyzerStatus.progress.subBBL_skipped ===
                props.analyzerStatus.progress.subBBL_saving_results_complete
            }
          />{" "}
          Running Analysis
        </div>

        {Array.from({
          length:
            props.analyzerStatus.progress.subBBL_count -
            props.analyzerStatus.progress.subBBL_skipped,
        }).map((_, i) => (
          <Inset key={i}>
            <div>
              <InlineSpinner success={subBBLIsDone(i)} /> Analyzing Sub Log #
              {i + 1}
            </div>
            <Inset>
              <div>
                <InlineSpinner
                  success={subBBLIsDone(i, "subBBL_decoding_complete")}
                />{" "}
                decoding
              </div>
              <div>
                <InlineSpinner
                  success={subBBLIsDone(i, "subBBL_reading_headers_complete")}
                />{" "}
                reading Headers
              </div>
              <div>
                <InlineSpinner
                  success={subBBLIsDone(i, "subBBL_reading_decoded_complete")}
                />{" "}
                reading result of decoder
              </div>
              <div>
                <InlineSpinner
                  success={subBBLIsDone(i, "subBBL_running_analysis_complete")}
                />{" "}
                analysing
              </div>
              <div>
                <InlineSpinner
                  success={subBBLIsDone(i, "subBBL_saving_results_complete")}
                />{" "}
                saving results
              </div>
            </Inset>
          </Inset>
        ))}
      </div>
    </Dialog>
  );
});
