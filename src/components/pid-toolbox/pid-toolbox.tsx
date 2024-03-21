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
import { useAnalyzeLog } from "./hooks/use-analyze-log";
import { PlotName } from "./plots/response.plotter";
import { AppContext } from "~/app.ctx";

const WILDCARD_PLOTNAME = '*' as const;

interface Props {
  activePlots?: { [key in PlotName | typeof WILDCARD_PLOTNAME]?: boolean };
}

export const PIDToolbox = component$((props: Props) => {
  useToolboxContextProvider();
  const appContext = useContext(AppContext);

  useHideHeader();
  const analyzer = useAnalyzeLog();

  const isDroppingFile = useFileDrop({
    onFileDrop: analyzer.analyzeFile,
  });

  const activePlotsArray = useComputed$(() => {
    const hasAllPlotsActive = props.activePlots?.[WILDCARD_PLOTNAME];

    const activePlots = props.activePlots || {};
    const activePlotNames = Object.entries(activePlots)
      .filter(([plotName, isActive]) => isActive && plotName !== WILDCARD_PLOTNAME)
      .map(([plotName]) => plotName as PlotName);

    if (
      hasAllPlotsActive ||
      activePlotNames.length === 0
    ) {
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

      analyzer.analyzeFile(file);
    };

    input.click();
  });

  if (!appContext.isPreviewing && analyzer.state.value === "loading") {
    return (
      <div>
        <center>
          <img
            height="300"
            width="300"
            style={{
              height: "30vh !important",
              width: "auto",
              display: "block",
              transition: "height .4s ease",
            }}
            // eslint-disable-next-line qwik/jsx-img
            src="/original_images/racoon_processing-cropped.gif"
          />

          <br />
          <label for="pid-analyzer-loading-indicator">
            Loading analyzer...
          </label>
        </center>
      </div>
    );
  }

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
        {analyzer.state.value === "running" && <InlineSpinner />}
        Click to open a Blackbox File (.bbl) or drag and drop it here
      </button>

      <PIDToolboxStatusDialog
        isOpen={analyzer.state.value === "running"}
        analyzerProgress={analyzer.progress.value}
      />

      <div
        style={{
          display:
            appContext.isPreviewing || analyzer.state.value === "done"
              ? undefined
              : "none",
        }}
      >
        <Plots plots={activePlotsArray.value} />

        {/* not beautiful but needed for the sticky navigation to not overlay the last chart */}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    </div>
  );
});

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
  ],
};
