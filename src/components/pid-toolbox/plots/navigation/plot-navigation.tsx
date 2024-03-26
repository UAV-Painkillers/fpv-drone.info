import { component$, $, useSignal, useContext } from "@builder.io/qwik";
import { Dialog } from "~/components/shared/dialog/dialog";
import { PIDToolBoxContext } from "../../context/pid-toolbox.context";
import styles from "./plot-navigation.module.css";

export interface PlotNavigationProps {
  showCombinedLogsSelection?: boolean;
  showActiveAxisSelection?: boolean;
  showMainLogSelection?: boolean;
}
export const PlotNavigation = component$((props: PlotNavigationProps) => {
  const toolboxContext = useContext(PIDToolBoxContext);

  const showLogSelection = useSignal(false);

  const onLogSelectionClose = $(() => {
    showLogSelection.value = false;
  });

  const onLogSelectionChange = $((index: number) => {
    const wasSelected = toolboxContext.selectedLogIndexes.includes(index);

    let resultingSelectedLogIndexes: number[];
    if (wasSelected) {
      resultingSelectedLogIndexes = toolboxContext.selectedLogIndexes.filter(
        (i) => i !== index,
      );
    } else {
      resultingSelectedLogIndexes = [
        ...toolboxContext.selectedLogIndexes,
        index,
      ];
    }

    toolboxContext.selectedLogIndexes = resultingSelectedLogIndexes;
  });

  if (
    !props.showActiveAxisSelection &&
    !props.showCombinedLogsSelection &&
    !props.showMainLogSelection
  ) {
    return null;
  }

  return (
    <>
      <Dialog isOpen={showLogSelection.value} onClose={onLogSelectionClose}>
        <>
          {toolboxContext.results?.map((_, i) => (
            <label key={i} style={{ display: "block", marginBlock: "15px" }}>
              <input
                type="checkbox"
                checked={toolboxContext.selectedLogIndexes.includes(i)}
                onChange$={() => {
                  onLogSelectionChange(i);
                }}
              />
              {`Flightlog #${i + 1}`}
            </label>
          ))}
        </>
      </Dialog>
      <nav class={styles.plotNavigation}>
        {props.showCombinedLogsSelection && (
          <button
            class="button"
            onClick$={() => (showLogSelection.value = !showLogSelection.value)}
          >
            Combined Logs ({toolboxContext.selectedLogIndexes.length} /{" "}
            {toolboxContext.results?.length})
          </button>
        )}

        {props.showMainLogSelection && (
          <select
            class="button"
            onChange$={(e) => {
              const selectedIndex = parseInt((e as any).target.value);
              toolboxContext.activeMainLogIndex = selectedIndex;
            }}
          >
            {toolboxContext.results?.map((_, i) => (
              <option
                key={i}
                selected={toolboxContext.activeMainLogIndex === i}
                value={i}
              >{`Active Flightlog #${i + 1}`}</option>
            ))}
          </select>
        )}

        {props.showActiveAxisSelection && (
          <select
            class="button"
            value={toolboxContext.analyzerActiveAxis}
            onChange$={(e) => {
              toolboxContext.analyzerActiveAxis = (e as any).target.value as
                | "roll"
                | "pitch"
                | "yaw";
            }}
          >
            <option
              value="roll"
              selected={toolboxContext.analyzerActiveAxis === "roll"}
            >
              Axis: Roll
            </option>
            <option
              value="pitch"
              selected={toolboxContext.analyzerActiveAxis === "pitch"}
            >
              Axis: Pitch
            </option>
            <option
              value="yaw"
              selected={toolboxContext.analyzerActiveAxis === "yaw"}
            >
              Axis: Yaw
            </option>
          </select>
        )}
      </nav>
    </>
  );
});
