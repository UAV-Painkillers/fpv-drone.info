import { component$, useComputed$, useSignal } from "@builder.io/qwik";
import { Dialog } from "../../dialog/dialog";
import type {
  AnalyzerProgress,
  AnalyzerStepStatusIndexArray,
} from "../hooks/types";
import { AnalyzerStepStatus } from "../hooks/types";
import type { StepProps } from "./step/step";
import { Step } from "./step/step";
import { RacoonLoader } from "../racoon-animations/racoon-animation";
import { inlineTranslate } from "qwik-speak";
import styles from "./status-dialog.module.css";

interface Props {
  isOpen: boolean;
  analyzerProgress: AnalyzerProgress;
}

export const BlackboxAnalyzerStatusDialog = component$((props: Props) => {
  const t = inlineTranslate();

  const translations = useSignal({
    runningAnalysis: t("blackboxAnalyzer.progress.runningAnalysis"),
    splittingLog: t("blackboxAnalyzer.progress.splittingLog"),
    readingHeaders: t("blackboxAnalyzer.progress.readingHeaders"),
    decoding: t("blackboxAnalyzer.progress.decoding"),
    readingDecodedLog: t("blackboxAnalyzer.progress.readingDecodedLog"),
    exportingHeaders: t("blackboxAnalyzer.progress.exportingHeaders"),
    analyzingAxis: t("blackboxAnalyzer.progress.analyzingAxis"),
    analyzingAxis_roll: t("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "roll",
    }),
    analyzingAxis_pitch: t("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "pitch",
    }),
    analyzingAxis_yaw: t("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "yaw",
    }),
  });

  const steps = useComputed$(() => {
    const getStateOfItemInIndexArray = (
      indexArray: AnalyzerStepStatusIndexArray,
      index: number
    ): AnalyzerStepStatus => {
      const item = indexArray.find((i) => i.index === index);
      return item ? item.state : AnalyzerStepStatus.PENDING;
    };

    const stepItems: StepProps[] = [];

    stepItems.push({
      state: props.analyzerProgress.splitting.state,
      label: translations.value.runningAnalysis,
    });

    const t2 = inlineTranslate();

    stepItems.push({
      state: props.analyzerProgress.splitting.state,
      label: translations.value.splittingLog,
      subStepsAllwaysVisible: true,
      subSteps: Array.from({ length: props.analyzerProgress.flightsCount }).map(
        (_, flightIndex) =>
          ({
            state: getStateOfItemInIndexArray(
              props.analyzerProgress.subLogs.state,
              flightIndex
            ),
            label: t2("blackboxAnalyzer.progress.analyzingSubLog", {
              flightIndex: flightIndex + 1,
            }),
            subSteps: [
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.readingHeaders,
                  flightIndex
                ),
                label: translations.value.readingHeaders,
              },
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.decoding,
                  flightIndex
                ),
                label: translations.value.decoding,
              },
              {
                label: translations.value.readingDecodedLog,
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.readingCSV,
                  flightIndex
                ),
              },
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.writingHeadDictToJson,
                  flightIndex
                ),
                label: translations.value.exportingHeaders,
              },
              {
                label: translations.value.runningAnalysis,
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.analyzingPID,
                  flightIndex
                ),
                subSteps: ["roll", "pitch", "yaw"].map((axis) => ({
                  state: getStateOfItemInIndexArray(
                    props.analyzerProgress.subLogs.analyzingPIDTrace[
                      axis as "roll" | "pitch" | "yaw"
                    ],
                    flightIndex
                  ),
                  label:
                    translations.value[
                      `analyzingAxis_${axis}` as `analyzingAxis_${"roll" | "pitch" | "yaw"}`
                    ],
                })),
              },
            ],
          }) as StepProps
      ),
    });

    return stepItems;
  });

  return (
    <Dialog isOpen={props.isOpen}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div class={styles.content}>
          <div class={styles.statusItems}>
            {steps.value.map((step, index) => (
              <Step {...step} key={`${index}_${step.label}`} />
            ))}
          </div>

          <div class={styles.racoonLoader}>
            <RacoonLoader />
          </div>
        </div>
      </div>
    </Dialog>
  );
});
