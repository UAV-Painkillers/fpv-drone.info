import { component$, useComputed$ } from "@builder.io/qwik";
import { Dialog } from "../../shared/dialog/dialog";
import type {
  AnalyzerProgress,
  AnalyzerStepStatusIndexArray,
} from "../hooks/types";
import { AnalyzerStepStatus } from "../hooks/types";
import type { StepProps } from "./step/step";
import { Step } from "./step/step";
import { RacoonLoader } from "../racoon-loader/racoon-loader";

interface Props {
  isOpen: boolean;
  analyzerProgress: AnalyzerProgress;
}

export const PIDToolboxStatusDialog = component$((props: Props) => {
  const steps = useComputed$(() => {
    const getStateOfItemInIndexArray = (
      indexArray: AnalyzerStepStatusIndexArray,
      index: number,
    ): AnalyzerStepStatus => {
      const item = indexArray.find((i) => i.index === index);
      return item ? item.state : AnalyzerStepStatus.PENDING;
    };

    const stepItems: StepProps[] = [];

    stepItems.push({
      state: props.analyzerProgress.splitting.state,
      label: "Running Analysis",
    });

    stepItems.push({
      state: props.analyzerProgress.splitting.state,
      label: "Splitting log into flights",
      subStepsAllwaysVisible: true,
      subSteps: Array.from({ length: props.analyzerProgress.flightsCount }).map(
        (_, flightIndex) =>
          ({
            state: getStateOfItemInIndexArray(
              props.analyzerProgress.subLogs.state,
              flightIndex,
            ),
            label: `Analyzing Sub Log #${flightIndex + 1}`,
            subSteps: [
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.readingHeaders,
                  flightIndex,
                ),
                label: "reading headers",
              },
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.decoding,
                  flightIndex,
                ),
                label: "decoding",
              },
              {
                label: "reading decoded log",
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.readingCSV,
                  flightIndex,
                ),
              },
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.writingHeadDictToJson,
                  flightIndex,
                ),
                label: "exporting headers",
              },
              {
                label: "running analysis",
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.analyzingPID,
                  flightIndex,
                ),
                subSteps: ["roll", "pitch", "yaw"].map((axis) => ({
                  state: getStateOfItemInIndexArray(
                    props.analyzerProgress.subLogs.analyzingPIDTrace[
                      axis as "roll" | "pitch" | "yaw"
                    ],
                    flightIndex,
                  ),
                  label: `analysing ${axis}`,
                })),
              },
            ],
          }) as StepProps,
      ),
    });

    return stepItems;
  });

  return (
    <Dialog isOpen={props.isOpen}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div style={{ maxHeight: "calc(100vh - 5rem)", overflowY: "auto" }}>
          {steps.value.map((step, index) => (
            <Step {...step} key={`${index}_${step.label}`} />
          ))}
        </div>

        <div>
          <RacoonLoader />
        </div>
      </div>
    </Dialog>
  );
});
