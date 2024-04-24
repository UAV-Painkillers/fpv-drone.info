import {
  component$,
  useComputed$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { Dialog } from "../../shared/dialog/dialog";
import type {
  AnalyzerProgress,
  AnalyzerStepStatusIndexArray,
} from "../hooks/types";
import { AnalyzerStepStatus } from "../hooks/types";
import type { StepProps } from "./step/step";
import { Step } from "./step/step";
import { RacoonLoader } from "../racoon-animations/racoon-animation";
import {
  TranslationsContext,
  useTranslationFunction,
} from "~/translations.ctx";

interface Props {
  isOpen: boolean;
  analyzerProgress: AnalyzerProgress;
}

export const BlackboxAnalyzerStatusDialog = component$((props: Props) => {
  const translationContext = useContext(TranslationsContext);
  const translate = useTranslationFunction(translationContext.translations);

  const translations = useSignal({
    runningAnalysis: translate(
      "blackboxAnalyzer.progress.runningAnalysis",
    ) as string,
    splittingLog: translate("blackboxAnalyzer.progress.splittingLog") as string,
    analyzingSubLog: translate(
      "blackboxAnalyzer.progress.analyzingSubLog",
    ) as string,
    readingHeaders: translate(
      "blackboxAnalyzer.progress.readingHeaders",
    ) as string,
    decoding: translate("blackboxAnalyzer.progress.decoding") as string,
    readingDecodedLog: translate(
      "blackboxAnalyzer.progress.readingDecodedLog",
    ) as string,
    exportingHeaders: translate(
      "blackboxAnalyzer.progress.exportingHeaders",
    ) as string,
    analyzingAxis: translate(
      "blackboxAnalyzer.progress.analyzingAxis",
    ) as string,
    analyzingAxis_roll: translate("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "roll",
    }) as string,
    analyzingAxis_pitch: translate("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "pitch",
    }) as string,
    analyzingAxis_yaw: translate("blackboxAnalyzer.progress.analyzingAxis", {
      axis: "yaw",
    }) as string,
  });

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
      label: translations.value.runningAnalysis,
    });

    stepItems.push({
      state: props.analyzerProgress.splitting.state,
      label: translations.value.splittingLog,
      subStepsAllwaysVisible: true,
      subSteps: Array.from({ length: props.analyzerProgress.flightsCount }).map(
        (_, flightIndex) =>
          ({
            state: getStateOfItemInIndexArray(
              props.analyzerProgress.subLogs.state,
              flightIndex,
            ),
            label: translations.value.analyzingSubLog.replace(
              "{flightIndex}",
              (flightIndex + 1).toString(),
            ),
            subSteps: [
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.readingHeaders,
                  flightIndex,
                ),
                label: translations.value.readingHeaders,
              },
              {
                state: getStateOfItemInIndexArray(
                  props.analyzerProgress.subLogs.decoding,
                  flightIndex,
                ),
                label: translations.value.decoding,
              },
              {
                label: translations.value.readingDecodedLog,
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
                label: translations.value.exportingHeaders,
              },
              {
                label: translations.value.runningAnalysis,
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
                  label:
                    translations.value[
                      `analyzingAxis_${axis}` as `analyzingAxis_${"roll" | "pitch" | "yaw"}`
                    ],
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
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "calc(100vh - 4rem)",
          }}
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
      </div>
    </Dialog>
  );
});
