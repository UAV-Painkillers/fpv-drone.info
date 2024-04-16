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
import type { RegisteredComponent } from "@builder.io/sdk-qwik/types/src/server-index";
import styles from "./blackbox-analyzer.module.css";
import { BlackboxAnalyzerStatusDialog } from "./status-dialog/status-dialog";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import classNames from "classnames";
import { Plots } from "./plots/plots";
import { useBlackboxAnalyzerContextProvider } from "./context/blackbox-analyzer.context";
import { useHideHeader } from "~/hooks/use-hide-header/use-hide-header";
import { AnalyzerState, useAnalyzeLog } from "./hooks/use-analyze-log";
import type { PlotLabelDefinitions } from "./plots/response.plotter";
import { NoiseFields, PlotName } from "./plots/response.plotter";
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
  const isDroppingFile = useSignal(false);

  useHideHeader();
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

  const showLoadingError: Signal<boolean> = useComputed$(() => {
    return (
      !appContext.isPreviewing && analyzerState.value === AnalyzerState.ERROR
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

    const onDragOver = () => {
      isDroppingFile.value = true;
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragOver);

    const cleanDragDrop = dragDrop(dropzoneRef.value, {
      onDrop: (files: File[]) => {
        isDroppingFile.value = false;

        const file = files[0];

        if (!file) {
          return;
        }

        onUserUploadedFile(file);
      },
    });

    cleanup(() => {
      cleanDragDrop();
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragOver);
    });
  });

  const activePlotsArray = useComputed$(() => {
    const hasAllPlotsActive = props.activePlots?.[WILDCARD_PLOTNAME];

    const activePlots = props.activePlots || {};
    const activePlotNames = Object.entries(activePlots)
      .filter(
        ([plotName, isActive]) => isActive && plotName !== WILDCARD_PLOTNAME
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

  if (
    !appContext.isPreviewing &&
    analyzerState.value === AnalyzerState.LOADING
  ) {
    return <RacoonLoader label="Loading analyzer..." />;
  }

  if (showLoadingError.value) {
    return;
  }

  const subLogsWithErrors = useComputed$(() => {
    return analyzerProgress.value.subLogs.state.filter(
      (s) => s.state === AnalyzerStepStatus.ERROR
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

  return (
    <>
      {showLoadingError.value && <div>Error: {analyzerError.value}</div>}
      <div
        class={classNames(styles.wrapper, {
          [styles.wrapperDropover]: isDroppingFile.value,
        })}
        ref={dropzoneRef}
        style={{ display: showLoadingError.value ? "none" : undefined }}
      >
        <button
          type="button"
          onClick$={openFilePicker}
          class={classNames("button", styles.uploadButton, {
            [styles.uploadButtonDropover]: isDroppingFile.value,
          })}
          aria-label="Button to open a blackbox file for analysis"
        >
          {analyzerState.value === AnalyzerState.RUNNING && <InlineSpinner />}
          Click to open a Blackbox File (.bbl) or drag and drop it here
        </button>

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
              aria-label="add to current analysis"
            >
              Add to current Analysis
            </button>
            <button
              class="button"
              style={{ width: "100%" }}
              onClick$={overwriteCurrentAnalysisWithFile}
              aria-label="replace current analysis"
            >
              Replace current Analysis
            </button>
          </div>
        </Dialog>

        <BlackboxAnalyzerStatusDialog
          isOpen={analyzerState.value === AnalyzerState.RUNNING}
          analyzerProgress={analyzerProgress.value}
        />

        {analyzerState.value === AnalyzerState.ERROR && (
          <div>ERROR: {analyzerError.value}</div>
        )}

        {subLogsWithErrors.value.length > 0 && (
          <code>
            <RacoonError style={{ float: "right" }} />
            <b style={{ color: "var(--alarm-color)", display: "block" }}>
              ERRORS:
            </b>
            {subLogsWithErrors.value.map(({ index, error }) => (
              <div
                key={"sublog-error-" + index}
              >{`> Sublog ${index}: ${error}`}</div>
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
  return (
    <SWCachingBlocker
      render={$(() => (
        <BlackboxAnalyzerContent {...props} />
      ))}
    />
  );
});

enum PIDAnalyzerHeaderInformationKeys {
  fwType,
  rollPID,
  pitchPID,
  yawPID,
  maxThrottle,
  tpa_breakpoint,
  tpa_percent,
  simplified_d_gain,
  simplified_dmax_gain,
  simplified_dterm_filter,
  simplified_dterm_filter_multiplier,
  simplified_feedforward_gain,
  simplified_gyro_filter,
  simplified_gyro_filter_multiplier,
  simplified_i_gain,
  simplified_master_multiplier,
  simplified_pi_gain,
  simplified_pitch_d_gain,
  simplified_pitch_pi_gain,
}

function makeSeriesLabelDefinitionInput(name: string, friendlyName?: string) {
  return {
    name,
    friendlyName,
    type: "object",
    required: false,
    subFields: [
      {
        name: "headdictField",
        friendlyName: "Header Name",
        type: "string",
        required: true,
        enum: Object.values(PIDAnalyzerHeaderInformationKeys) as string[],
      },
      {
        name: "template",
        friendlyName: "Template",
        type: "string",
        required: false,
      },
    ],
  };
}

export const BlackboxAnalyzerRegistryDefinition: RegisteredComponent = {
  component: BlackboxAnalyzer,
  name: "BlackboxAnalyzer",
  friendlyName: "Blackbox Analyzer",
  inputs: [
    {
      name: "activePlots",
      friendlyName: "active Plots",
      type: "object",
      required: true,
      defaultValue: {
        "*": true,
      },
      subFields: [
        {
          name: "*",
          friendlyName: "All",
          type: "boolean",
          required: false,
        },
        ...Object.values(PlotName).map((plotName) => ({
          name: plotName,
          friendlyName: plotName,
          type: "boolean",
          required: false,
        })),
      ],
    },
    {
      name: "navigation",
      friendlyName: "Navigation",
      type: "object",
      required: false,
      subFields: [
        {
          name: "showCombinedLogsSelection",
          friendlyName: "Show Combined Logs Selection",
          type: "boolean",
          required: false,
          defaultValue: true,
        },
        {
          name: "showActiveAxisSelection",
          friendlyName: "Show Active Axis Selection",
          type: "boolean",
          required: false,
          defaultValue: true,
        },
        {
          name: "showMainLogSelection",
          friendlyName: "Show Main Log Selection",
          type: "boolean",
          required: false,
          defaultValue: true,
        },
      ],
    },
    {
      name: "plotLabels",
      friendlyName: "Plot Labels",
      type: "object",
      required: false,
      defaultValue: {},
      subFields: [
        {
          name: "responseTrace",
          friendlyName: "Response Trace",
          type: "object",
          required: false,
          subFields: [
            makeSeriesLabelDefinitionInput("gyro", "Gyro"),
            makeSeriesLabelDefinitionInput("setPoint", "Setpoint"),
            makeSeriesLabelDefinitionInput("feedForward", "Feedforward"),
          ],
        },
        {
          name: "responseThrottle",
          friendlyName: "Response Throttle",
          type: "object",
          required: false,
          subFields: [makeSeriesLabelDefinitionInput("throttle", "Throttle")],
        },
        {
          name: "responseStrength",
          friendlyName: "Response Strength",
          type: "object",
          required: false,
          subFields: [makeSeriesLabelDefinitionInput("response", "Response")],
        },
        {
          name: "responseStrength",
          friendlyName: "Response Strength",
          type: "object",
          required: false,
          subFields: Object.values(NoiseFields).map((noiseField) =>
            makeSeriesLabelDefinitionInput(noiseField)
          ),
        },
      ],
    },
  ],
};
