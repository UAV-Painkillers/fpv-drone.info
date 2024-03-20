import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useVisibleTask$,
  $,
  noSerialize,
  useOnWindow,
  useContext,
} from "@builder.io/qwik";
import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";
import { ResponsePlotter } from "./response.plotter";
import styles from "./plots.module.css";
import { PlotNavigation } from "./navigation/plot-navigation";
import { PIDToolBoxContext } from "../context/pid-toolbox.context";

export const Plots = component$(() => {
  const toolboxContext = useContext(PIDToolBoxContext);

  const responseTraceChartRef = useSignal<HTMLDivElement>();
  const responseThrottleChartRef = useSignal<HTMLDivElement>();
  const responseStrengthChartRef = useSignal<HTMLDivElement>();
  const noiseGyroChartRef = useSignal<HTMLDivElement>();
  const noiseGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseDTermChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesDTermChartRef = useSignal<HTMLDivElement>();

  const plotter = useSignal<NoSerialize<ResponsePlotter>>();

  const plotStepResponse = $((logs: PIDAnalyzerResult[]) => {
    if (!plotter.value) {
      plotter.value = noSerialize(
        new ResponsePlotter(
          responseTraceChartRef.value!,
          responseThrottleChartRef.value!,
          responseStrengthChartRef.value!,
          noiseGyroChartRef.value!,
          noiseGyroDebugChartRef.value!,
          noiseDTermChartRef.value!,
          noiseFrequenciesGyroChartRef.value!,
          noiseFrequenciesGyroDebugChartRef.value!,
          noiseFrequenciesDTermChartRef.value!
        )
      );
    }

    plotter.value!.setData(logs);
  });

  /**
   * Plot step response on data change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(toolboxContext);

    track(responseTraceChartRef);
    track(responseThrottleChartRef);
    track(responseStrengthChartRef);
    track(noiseGyroChartRef);
    track(noiseGyroDebugChartRef);
    track(noiseDTermChartRef);
    track(noiseFrequenciesGyroChartRef);
    track(noiseFrequenciesGyroDebugChartRef);
    track(noiseFrequenciesDTermChartRef);

    const logsToShow =
      toolboxContext.results?.filter((_, i) =>
        toolboxContext.selectedLogIndexes.includes(i)
      ) ?? [];

    plotStepResponse(logsToShow);
  });

  /**
   * Set plots active axis on change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(toolboxContext);
    if (!plotter.value) {
      return;
    }

    plotter.value.setActiveAxis(toolboxContext.analyzerActiveAxis);
  });

  /**
   * Resize plots on window resize
   */
  useOnWindow(
    "resize",
    $(() => {
      if (plotter.value) {
        plotter.value.resize();
      }
    })
  );

  /**
   * Set active main log on change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(toolboxContext);
    if (plotter.value) {
      plotter.value.setActiveMainLog(toolboxContext.activeMainLogIndex);
    }
  });

  return (
    <>
      <PlotNavigation />

      <h2 style={{ marginBottom: "1rem" }}>Filter Tuning</h2>

      <div class={styles.noisePlotGrid}>
        <div class={styles.noiseGyroDebug} ref={noiseGyroDebugChartRef}></div>
        <div class={styles.noiseGyro} ref={noiseGyroChartRef}></div>
        <div class={styles.noiseDTerm} ref={noiseDTermChartRef}></div>
        <div
          class={styles.noiseFrequenciesGyro}
          ref={noiseFrequenciesGyroChartRef}
        ></div>
        <div
          class={styles.noiseFrequenciesGyroDebug}
          ref={noiseFrequenciesGyroDebugChartRef}
        ></div>
        <div
          class={styles.noiseFrequenciesDTerm}
          ref={noiseFrequenciesDTermChartRef}
        ></div>
      </div>

      <hr />
      <h2 style={{ marginBottom: "1rem" }}>PID Response Tuning</h2>

      <div class={styles.responsePlotGrid}>
        <div class={styles.responseTrace} ref={responseTraceChartRef}></div>

        <div
          class={styles.responseStrength}
          ref={responseStrengthChartRef}
        ></div>

        <div
          class={styles.responseThrottle}
          ref={responseThrottleChartRef}
        ></div>
      </div>
    </>
  );
});
