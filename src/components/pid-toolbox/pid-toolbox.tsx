import { component$, $, useContext, useComputed$ } from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik/types/src/server-index";
import styles from "./pid-toolbox.module.css";
import { PIDToolboxStatusDialog } from "./status-dialog/pid-toolbox-status-dialog";
import { InlineSpinner } from "../inline-spinner/inline-spinner";
import classNames from "classnames";
import { Plots } from "./plots/plots";
import { useToolboxContextProvider } from "./context/pid-toolbox.context";
import { useHideHeader } from "~/hooks/use-hide-header/use-hide-header";
import { useFileDrop } from "~/hooks/use-file-drop/use-file-drop";
import { AnalyzerState, useAnalyzeLog } from "./hooks/use-analyze-log";
import type { PlotLabelDefinitions } from "./plots/response.plotter";
import { NoiseFields, PlotName } from "./plots/response.plotter";
import { AppContext } from "~/app.ctx";
import type { PlotNavigationProps } from "./plots/navigation/plot-navigation";
import { RacoonLoader } from "./racoon-loader/racoon-loader";
import { AnalyzerStepStatus } from "./hooks/types";

const WILDCARD_PLOTNAME = "*" as const;

interface Props {
  activePlots?: { [key in PlotName | typeof WILDCARD_PLOTNAME]?: boolean };
  navigation?: PlotNavigationProps;
  plotLabels?: PlotLabelDefinitions;
}

export const PIDToolbox = component$((props: Props) => {
  useToolboxContextProvider();
  const appContext = useContext(AppContext);

  useHideHeader();
  const {
    state: analyzerState,
    analyzeFile,
    progress: analyzerProgress,
    error: analyzerError,
  } = useAnalyzeLog();

  const isDroppingFile = useFileDrop({
    onFileDrop: analyzeFile,
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

      analyzeFile(file);
    };

    input.click();
  });

  if (
    !appContext.isPreviewing &&
    analyzerState.value === AnalyzerState.LOADING
  ) {
    return <RacoonLoader label="Loading analyzer..." />;
  }

  const subLogsWithErrors = useComputed$(() => {
    return analyzerProgress.value.subLogs.state.filter(
      (s) => s.state === AnalyzerStepStatus.ERROR
    );
  });

  return (
    <div
      class={classNames(styles.wrapper, {
        [styles.wrapperDropover]: isDroppingFile.value,
      })}
    >
      <button
        type="button"
        onClick$={openFilePicker}
        class={classNames("button", styles.uploadButton, {
          [styles.uploadButtonDropover]: isDroppingFile.value,
        })}
      >
        {analyzerState.value === AnalyzerState.RUNNING && <InlineSpinner />}
        Click to open a Blackbox File (.bbl) or drag and drop it here
      </button>

      <PIDToolboxStatusDialog
        isOpen={analyzerState.value === AnalyzerState.RUNNING}
        analyzerProgress={analyzerProgress.value}
      />

      {analyzerState.value === AnalyzerState.ERROR && (
        <div>ERROR: {analyzerError.value}</div>
      )}

      {subLogsWithErrors.value.length > 0 && (
        <>
          <div>ERRORS:</div>
          {subLogsWithErrors.value.map(({ index, error }) => (
            <div
              key={"sublog-error-" + index}
            >{`Sublog ${index}: ${error}`}</div>
          ))}
        </>
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

export const PIDToolboxRegistryDefinition: RegisteredComponent = {
  component: PIDToolbox,
  name: "PIDToolbox",
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
