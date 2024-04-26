import type { NoSerialize, Signal } from "@builder.io/qwik";
import {
  component$,
  $,
  useContext,
  useComputed$,
  useSignal,
  noSerialize,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./blackbox-analyzer.module.css";
import { BlackboxAnalyzerStatusDialog } from "./status-dialog/status-dialog";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import classNames from "classnames";
import { Plots } from "./plots/plots";
import { useBlackboxAnalyzerContextProvider } from "./context/blackbox-analyzer.context";
import { useHideHeader } from "~/hooks/use-hide-header/use-hide-header";
import { AnalyzerState, useAnalyzeLog } from "./hooks/use-analyze-log";
import type { PlotLabelDefinitions } from "./plots/response.plotter";
import { PlotName } from "./plots/response.plotter";
import { AppContext } from "~/app.ctx";
import type { PlotNavigationProps } from "./plots/navigation/plot-navigation";
import {
  RacoonError,
  RacoonLoader,
} from "./racoon-animations/racoon-animation";
import { AnalyzerStepStatus } from "./hooks/types";
import { Dialog } from "../shared/dialog/dialog";
import { SWCachingBlocker } from "../sw-caching-blocker/sw-caching-blocker";
// @ts-ignore
import dragDrop from "drag-drop";
import { ErrorBox } from "../error-box/error-box";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { storyblokEditable } from "@storyblok/js";
import { inlineTranslate } from "qwik-speak";

const WILDCARD_PLOTNAME = "*" as const;

interface Props {
  activePlots?: { [key in PlotName | typeof WILDCARD_PLOTNAME]?: boolean };
  navigation?: PlotNavigationProps;
  plotLabels?: PlotLabelDefinitions;
}

const BlackboxAnalyzerContent = component$((props: Props) => {
  useBlackboxAnalyzerContextProvider();
  const appContext = useContext(AppContext);
  const dropzoneRef = useSignal<HTMLElement>();

  useHideHeader();
  const t = inlineTranslate();

  const {
    state: analyzerState,
    analyzeFile,
    progress: analyzerProgress,
    error: analyzerError,
    hasAnalysisInMemory,
  } = useAnalyzeLog();

  const temporaryFileStorage =
    useSignal<NoSerialize<File | undefined>>(undefined);
  const showSelectAnalysisOverwriteMethodDialog = useSignal(false);
  const isDroppingOver = useSignal(false);

  const showAnalyzerError: Signal<boolean> = useComputed$(() => {
    return (
      !appContext.isPreviewing && analyzerState.value === AnalyzerState.ERROR
    );
  });

  const showLoader: Signal<boolean> = useComputed$(() => {
    return (
      !appContext.isPreviewing && analyzerState.value === AnalyzerState.LOADING
    );
  });

  const onUserUploadedFile = $((file?: File) => {
    if (!hasAnalysisInMemory.value) {
      analyzeFile(file, true);
      return;
    }

    temporaryFileStorage.value = noSerialize(file);
    showSelectAnalysisOverwriteMethodDialog.value = true;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(dropzoneRef);

    if (!dropzoneRef.value) {
      return;
    }

    const cleanDragDrop = dragDrop(dropzoneRef.value, {
      onDrop: (files: File[]) => {
        const file = files[0];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!file) {
          return;
        }

        onUserUploadedFile(file);
      },
      onDragEnter: () => {
        isDroppingOver.value = true;
      },
      onDragOver: () => {
        isDroppingOver.value = true;
      },
      onDragLeave: () => {
        isDroppingOver.value = false;
      },
    });

    cleanup(() => {
      cleanDragDrop();
    });
  });

  const activePlotsArray = useComputed$(() => {
    const hasAllPlotsActive = props.activePlots?.[WILDCARD_PLOTNAME];

    const activePlots = props.activePlots || {};
    const activePlotNames = Object.entries(activePlots)
      .filter(
        ([plotName, isActive]) => isActive && plotName !== WILDCARD_PLOTNAME,
      )
      .map(([plotName]) => plotName as PlotName);

    if (hasAllPlotsActive || activePlotNames.length === 0) {
      return Object.values(PlotName);
    }

    return activePlotNames;
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

      onUserUploadedFile(file);
    };

    input.click();
  });

  const subLogsWithErrors = useComputed$(() => {
    return analyzerProgress.value.subLogs.state.filter(
      (s) => s.state === AnalyzerStepStatus.ERROR,
    );
  });

  const addFileToCurrentAnalysis = $(() => {
    if (!temporaryFileStorage.value) {
      return;
    }

    showSelectAnalysisOverwriteMethodDialog.value = false;
    analyzeFile(temporaryFileStorage.value, false);
  });

  const overwriteCurrentAnalysisWithFile = $(() => {
    if (!temporaryFileStorage.value) {
      return;
    }

    showSelectAnalysisOverwriteMethodDialog.value = false;
    analyzeFile(temporaryFileStorage.value, true);
  });

  const loadingMessage = t("blackboxAnalyzer.loadingIndicator.label");

  const logAnalyzationError = t("blackboxAnalyzer.error.logAnalyzation");

  const openFileButtonLabel = t("blackboxAnalyzer.openFileButton.label");

  const openFileButtonAriaLabel = t(
    "blackboxAnalyzer.openFileButton.ariaLabel",
  );

  const addFileToCurrentAnalysisButtonLabel = t(
    "blackboxAnalyzer.addFileToCurrentAnalysisButton.label",
  );

  const addFileToCurrentAnalysisButtonAriaLabel = t(
    "blackboxAnalyzer.addFileToCurrentAnalysisButton.ariaLabel",
  );

  const replaceCurrentAnalysisButtonLabel = t(
    "blackboxAnalyzer.replaceCurrentAnalysisButton.label",
  );

  const replaceCurrentAnalysisButtonAriaLabel = t(
    "blackboxAnalyzer.replaceCurrentAnalysisButton.ariaLabel",
  );

  const subLogError = (logIndex: number, error: string) =>
    t("blackboxAnalyzer.subLogError", { logIndex, error });

  return (
    <>
      {showLoader.value && <RacoonLoader label={loadingMessage} />}

      <div
        class={classNames(styles.wrapper, {
          [styles.wrapperDropover]: isDroppingOver.value,
        })}
        ref={dropzoneRef}
        style={{ display: showLoader.value ? "none" : undefined }}
      >
        <button
          type="button"
          onClick$={openFilePicker}
          class={classNames("button", styles.uploadButton, {
            [styles.uploadButtonDropover]: isDroppingOver.value,
          })}
          aria-label={openFileButtonAriaLabel}
        >
          {analyzerState.value === AnalyzerState.RUNNING && <InlineSpinner />}
          {openFileButtonLabel}
        </button>

        {showAnalyzerError.value && (
          <ErrorBox errorLines={analyzerError.value ?? logAnalyzationError} />
        )}

        <Dialog isOpen={showSelectAnalysisOverwriteMethodDialog.value}>
          <div
            style={{
              display: "flex",
              gap: "25px",
              height: "calc(100vh - 4rem)",
              justifyContent: "space-evenly",
              maxWidth: "700px",
              margin: "0 auto",
              alignItems: "center",
            }}
          >
            <button
              class="button"
              style={{ width: "100%" }}
              onClick$={addFileToCurrentAnalysis}
              aria-label={addFileToCurrentAnalysisButtonAriaLabel}
            >
              {addFileToCurrentAnalysisButtonLabel}
            </button>
            <button
              class="button"
              style={{ width: "100%" }}
              onClick$={overwriteCurrentAnalysisWithFile}
              aria-label={replaceCurrentAnalysisButtonAriaLabel}
            >
              {replaceCurrentAnalysisButtonLabel}
            </button>
          </div>
        </Dialog>

        <BlackboxAnalyzerStatusDialog
          isOpen={analyzerState.value === AnalyzerState.RUNNING}
          analyzerProgress={analyzerProgress.value}
        />

        {subLogsWithErrors.value.length > 0 && (
          <code>
            <RacoonError style={{ float: "right" }} />
            <b style={{ color: "var(--error-color)", display: "block" }}>
              ERRORS:
            </b>
            {subLogsWithErrors.value.map(({ index, error }) => (
              <div key={"sublog-error-" + index}>
                {subLogError(index, error!)}
              </div>
            ))}

            <div style={{ clear: "both" }} />
          </code>
        )}

        <div
          style={{
            display:
              appContext.isPreviewing ||
              analyzerState.value === AnalyzerState.DONE
                ? undefined
                : "none",
          }}
        >
          <Plots
            plots={activePlotsArray.value}
            navigation={props.navigation}
            plotLabels={props.plotLabels}
          />
        </div>
      </div>
    </>
  );
});

export const BlackboxAnalyzer = component$((props: Props) => {
  const t = inlineTranslate();

  const downloadSizeMB = 150;
  const blockMessage = t("blackboxAnalyzer.cacheBlockMessage", {
    downloadSizeMB,
  });

  return (
    <div style={{ marginBlock: "1rem" }}>
      <SWCachingBlocker
        blockMessage={blockMessage}
        downloadSizeMB={downloadSizeMB}
        render={$(() => (
          <BlackboxAnalyzerContent {...props} />
        ))}
      />
    </div>
  );
});

export const BlackboxAnalyzerRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData: any) => {
    const {
      activePlots: activePlotsStoryData,
      navigation: navigationStoryData,
      ...plotLabelsStoryData
    } = storyData;

    const plotLabels = useComputed$(
      () =>
        ({
          responseTrace: {
            gyro: {
              headdictField: plotLabelsStoryData.labelTraceGyroHeaderField,
              template: plotLabelsStoryData.labelTraceGyroTemplate,
            },
            setPoint: {
              headdictField: plotLabelsStoryData.labelTraceSetpointHeaderField,
              template: plotLabelsStoryData.labelTraceSetpointTemplate,
            },
            feedForward: {
              headdictField:
                plotLabelsStoryData.labelTraceFeedforwardHeaderField,
              template: plotLabelsStoryData.labelTraceFeedforwardTemplate,
            },
          },
          responseThrottle: {
            throttle: {
              headdictField: plotLabelsStoryData.labelThrottleHeaderField,
              template: plotLabelsStoryData.labelThrottleTemplate,
            },
          },
          responseStrength: {
            response: {
              headdictField: plotLabelsStoryData.labelStrengthHeaderField,
              template: plotLabelsStoryData.labelStrengthTemplate,
            },
          },
          responseDelay: {
            delay: {
              headdictField: plotLabelsStoryData.labelDelayHeaderField,
              template: plotLabelsStoryData.labelDelayTemplate,
            },
          },
          responseStrengthPeak: {
            peak: {
              headdictField: plotLabelsStoryData.labelStrengthPeakHeaderField,
              template: plotLabelsStoryData.labelStrengthPeakTemplate,
            },
          },
          noiseFrequencies: {
            noise_gyro: {
              headdictField:
                plotLabelsStoryData.labelNoiseFrequenciesGyroHeaderField,
              template: plotLabelsStoryData.labelNoiseFrequenciesGyroTemplate,
            },
            noise_debug: {
              headdictField:
                plotLabelsStoryData.labelNoiseFrequenciesDebugHeaderField,
              template: plotLabelsStoryData.labelNoiseFrequenciesDebugTemplate,
            },
            noise_d: {
              headdictField:
                plotLabelsStoryData.labelNoiseFrequenciesDTermHeaderField,
              template: plotLabelsStoryData.labelNoiseFrequenciesDTermTemplate,
            },
          },
          noise: {
            noise_gyro: {
              headdictField: plotLabelsStoryData.labelNoiseGyroHeaderField,
              template: plotLabelsStoryData.labelNoiseGyroTemplate,
            },
            noise_debug: {
              headdictField: plotLabelsStoryData.labelNoiseDebugHeaderField,
              template: plotLabelsStoryData.labelNoiseDebugTemplate,
            },
            noise_d: {
              headdictField: plotLabelsStoryData.labelNoiseDTermHeaderField,
              template: plotLabelsStoryData.labelNoiseDTermTemplate,
            },
          },
        }) as PlotLabelDefinitions,
    );
    const activePlots = useComputed$(() =>
      Object.fromEntries(
        activePlotsStoryData.map((plotName: string) => [plotName, true]),
      ),
    );
    const navigation = useComputed$(() =>
      Object.fromEntries(
        navigationStoryData.map((navTypeName: string) => [navTypeName, true]),
      ),
    );

    return (
      <div {...storyblokEditable(storyData)}>
        <BlackboxAnalyzer
          activePlots={activePlots.value}
          navigation={navigation.value}
          plotLabels={plotLabels.value}
        />
      </div>
    );
  }),
  name: "BlackboxAnalyzer",
};
