import { component$, $, useSignal, useContext } from "@builder.io/qwik";
import { Dialog } from "~/components/dialog/dialog";
import { BlackboxAnalyzerContext } from "../../context/blackbox-analyzer.context";
import styles from "./plot-navigation.module.css";
import { inlineTranslate } from "qwik-speak";

export interface PlotNavigationProps {
  showCombinedLogsSelection?: boolean;
  showActiveAxisSelection?: boolean;
  showMainLogSelection?: boolean;
}
export const PlotNavigation = component$((props: PlotNavigationProps) => {
  const analyzerContext = useContext(BlackboxAnalyzerContext);

  const showLogSelection = useSignal(false);

  const onLogSelectionClose = $(() => {
    showLogSelection.value = false;
  });

  const onLogSelectionChange = $((index: number) => {
    const wasSelected = analyzerContext.selectedLogIndexes.includes(index);

    let resultingSelectedLogIndexes: number[];
    if (wasSelected) {
      resultingSelectedLogIndexes = analyzerContext.selectedLogIndexes.filter(
        (i) => i !== index,
      );
    } else {
      resultingSelectedLogIndexes = [
        ...analyzerContext.selectedLogIndexes,
        index,
      ];
    }

    analyzerContext.selectedLogIndexes = resultingSelectedLogIndexes;
  });

  if (
    !props.showActiveAxisSelection &&
    !props.showCombinedLogsSelection &&
    !props.showMainLogSelection
  ) {
    return null;
  }

  const t = inlineTranslate();

  const combinedLogSelectionLabel = t(
    "blackboxAnalyzer.plotNavigation.combinedLogsSelection.label",
    {
      count: analyzerContext.selectedLogIndexes.length,
      total: analyzerContext.results?.length,
    },
  ) as string;
  const combinedLogSelectionAriaLabel = t(
    "blackboxAnalyzer.plotNavigation.combinedLogsSelection.ariaLabel",
  ) as string;

  const activeFlightLogLabel = (index: number) => {
    console.log('getting label', {index});
    return t("blackboxAnalyzer.plotNavigation.activeFlightLog.label", {
      flight: index,
    });
  };

  const axisSelectionRollLabel = t(
    "blackboxAnalyzer.plotNavigation.axisSelection.roll.label",
  ) as string;
  const axisSelectionPitchLabel = t(
    "blackboxAnalyzer.plotNavigation.axisSelection.pitch.label",
  ) as string;
  const axisSelectionYawLabel = t(
    "blackboxAnalyzer.plotNavigation.axisSelection.yaw.label",
  ) as string;

  return (
    <>
      <Dialog isOpen={showLogSelection.value} onClose={onLogSelectionClose}>
        <>
          {analyzerContext.results?.map((_, i) => (
            <label key={i} style={{ display: "block", marginBlock: "15px" }}>
              <input
                type="checkbox"
                checked={analyzerContext.selectedLogIndexes.includes(i)}
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
            aria-label={combinedLogSelectionAriaLabel}
          >
            {combinedLogSelectionLabel}
          </button>
        )}

        {props.showMainLogSelection && (
          <select
            class="button"
            onChange$={(e) => {
              const selectedIndex = parseInt((e as any).target.value);
              analyzerContext.activeMainLogIndex = selectedIndex;
            }}
          >
            {analyzerContext.results?.map((_, i) => (
              <option
                key={i}
                selected={analyzerContext.activeMainLogIndex === i}
                value={i}
              >
                {activeFlightLogLabel(i + 1)}
              </option>
            ))}
          </select>
        )}

        {props.showActiveAxisSelection && (
          <select
            class="button"
            value={analyzerContext.analyzerActiveAxis}
            onChange$={(e) => {
              analyzerContext.analyzerActiveAxis = (e as any).target.value as
                | "roll"
                | "pitch"
                | "yaw";
            }}
          >
            <option
              value="roll"
              selected={analyzerContext.analyzerActiveAxis === "roll"}
            >
              {axisSelectionRollLabel}
            </option>
            <option
              value="pitch"
              selected={analyzerContext.analyzerActiveAxis === "pitch"}
            >
              {axisSelectionPitchLabel}
            </option>
            <option
              value="yaw"
              selected={analyzerContext.analyzerActiveAxis === "yaw"}
            >
              {axisSelectionYawLabel}
            </option>
          </select>
        )}
      </nav>
    </>
  );
});
