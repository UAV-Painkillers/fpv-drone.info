import type { NoSerialize, Signal } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useVisibleTask$,
  $,
  noSerialize,
  useOnWindow,
  useContext,
  useComputed$,
} from "@builder.io/qwik";
import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";
import type {
  ChartsElementMap,
  PlotLabelDefinitions,
} from "./response.plotter";
import { PlotName, ResponsePlotter } from "./response.plotter";
import styles from "./plots.module.css";
import type { PlotNavigationProps } from "./navigation/plot-navigation";
import { PlotNavigation } from "./navigation/plot-navigation";
import { BlackboxAnalyzerContext } from "../context/blackbox-analyzer.context";
import { AppContext } from "~/app.ctx";
import classNames from "classnames";

interface Props {
  plots?: Array<PlotName>;
  navigation?: PlotNavigationProps;
  plotLabels?: PlotLabelDefinitions;
}
export const Plots = component$((props: Props) => {
  const analyzerContext = useContext(BlackboxAnalyzerContext);
  const appContext = useContext(AppContext);

  const responseTraceChartRef = useSignal<HTMLDivElement>();
  const responseThrottleChartRef = useSignal<HTMLDivElement>();
  const responseStrengthChartRef = useSignal<HTMLDivElement>();
  const responseDelayChartRef = useSignal<HTMLDivElement>();
  const responseStrengthPeakChartRef = useSignal<HTMLDivElement>();
  const noiseGyroChartRef = useSignal<HTMLDivElement>();
  const noiseGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseDTermChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesGyroDebugChartRef = useSignal<HTMLDivElement>();
  const noiseFrequenciesDTermChartRef = useSignal<HTMLDivElement>();

  const plotter = useSignal<NoSerialize<ResponsePlotter>>();

  const plotStepResponse = $((logs: PIDAnalyzerResult[]) => {
    if (!plotter.value) {
      console.warn("Plotter not initialized");
      return;
    }
    plotter.value!.setData(logs);
  });

  /**
   * Load mock data on preview
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(appContext);
    track(plotter);

    if (!appContext.isPreviewing) {
      return;
    }

    return;

    const mockData = (await fetch("/mock-data.json.gz").then((res) =>
      res.json(),
    )) as unknown as PIDAnalyzerResult[];
    analyzerContext.results = noSerialize(mockData);
  });

  /**
   * Set chart elements on change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(responseTraceChartRef);
    track(responseThrottleChartRef);
    track(responseStrengthChartRef);
    track(responseDelayChartRef);
    track(noiseGyroChartRef);
    track(noiseGyroDebugChartRef);
    track(noiseDTermChartRef);
    track(noiseFrequenciesGyroChartRef);
    track(noiseFrequenciesGyroDebugChartRef);
    track(noiseFrequenciesDTermChartRef);
    track(() => props.plots);

    if (!plotter.value) {
      plotter.value = noSerialize(new ResponsePlotter());
    }

    let charts: ChartsElementMap = {
      [PlotName.RESPONSE_TRACE]: responseTraceChartRef.value!,
      [PlotName.RESPONSE_STRENGTH]: responseStrengthChartRef.value!,
      [PlotName.RESPONSE_DELAY]: responseDelayChartRef.value!,
      [PlotName.RESPONSE_STRENGTH_PEAK]: responseStrengthPeakChartRef.value!,
      [PlotName.RESPONSE_THROTTLE]: responseThrottleChartRef.value!,
      [PlotName.NOISE_GYRO]: noiseGyroChartRef.value!,
      [PlotName.NOISE_GYRO_DEBUG]: noiseGyroDebugChartRef.value!,
      [PlotName.NOISE_DTERM]: noiseDTermChartRef.value!,
      [PlotName.NOISE_FREQUENCIES_GYRO]: noiseFrequenciesGyroChartRef.value!,
      [PlotName.NOISE_FREQUENCIES_GYRO_DEBUG]:
        noiseFrequenciesGyroDebugChartRef.value!,
      [PlotName.NOISE_FREQUENCIES_DTERM]: noiseFrequenciesDTermChartRef.value!,
    };

    if (props.plots) {
      charts = Object.fromEntries(
        Object.entries(charts).filter(([key]) =>
          props.plots!.includes(key as PlotName),
        ),
      ) as ChartsElementMap;
    }

    plotter.value!.setChartElements(charts);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => props.plotLabels);
    track(plotter);

    if (!plotter.value) {
      return;
    }

    plotter.value!.setLabelDefinitions(props.plotLabels ?? {});
  });

  /**
   * Plot step response on data change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(analyzerContext);

    const logsToShow =
      analyzerContext.results?.filter((_, i) =>
        analyzerContext.selectedLogIndexes.includes(i),
      ) ?? [];

    plotStepResponse(logsToShow);
  });

  /**
   * Set plots active axis on change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(analyzerContext);
    if (!plotter.value) {
      return;
    }

    plotter.value.setActiveAxis(analyzerContext.analyzerActiveAxis);
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
    }),
  );

  /**
   * Set active main log on change
   */
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(analyzerContext);
    if (plotter.value) {
      plotter.value.setActiveMainLog(analyzerContext.activeMainLogIndex);
    }
  });

  const plotMap: Record<
    PlotName,
    { ref: Signal<HTMLDivElement | undefined>; class?: string }
  > = {
    [PlotName.RESPONSE_TRACE]: {
      ref: responseTraceChartRef,
    },
    [PlotName.RESPONSE_STRENGTH]: {
      ref: responseStrengthChartRef,
    },
    [PlotName.RESPONSE_DELAY]: {
      ref: responseDelayChartRef,
    },
    [PlotName.RESPONSE_STRENGTH_PEAK]: {
      ref: responseStrengthPeakChartRef,
    },
    [PlotName.RESPONSE_THROTTLE]: {
      ref: responseThrottleChartRef,
      class: classNames(styles.plotOverTwoColumns, styles.throttlePlot),
    },
    [PlotName.NOISE_GYRO]: { ref: noiseGyroChartRef },
    [PlotName.NOISE_GYRO_DEBUG]: {
      ref: noiseGyroDebugChartRef,
    },
    [PlotName.NOISE_DTERM]: {
      ref: noiseDTermChartRef,
    },
    [PlotName.NOISE_FREQUENCIES_GYRO]: {
      ref: noiseFrequenciesGyroChartRef,
    },
    [PlotName.NOISE_FREQUENCIES_GYRO_DEBUG]: {
      ref: noiseFrequenciesGyroDebugChartRef,
    },
    [PlotName.NOISE_FREQUENCIES_DTERM]: {
      ref: noiseFrequenciesDTermChartRef,
    },
  };

  const activePlotMap = useComputed$(() => {
    const map = Object.fromEntries(
      Object.entries(plotMap).filter(([key]) =>
        props.plots?.includes(key as PlotName),
      ),
    );

    return map;
  });

  return (
    <>
      {(analyzerContext.results?.length ?? 0) > 0 && (
        <PlotNavigation {...props.navigation} />
      )}

      <div
        class={classNames({
          [styles.plotGrid]: Object.values(activePlotMap.value).length > 1,
        })}
        style={{
          display:
            (analyzerContext.results?.length ?? 0) === 0 ? "none" : undefined,
        }}
      >
        {Object.entries(activePlotMap.value).map(
          ([plotName, { ref, class: className }]) => (
            <div
              class={classNames(styles.plot, className)}
              ref={ref}
              key={plotName}
            >
              {plotName}
            </div>
          ),
        )}
      </div>
      {(analyzerContext.results?.length ?? 0) > 0 && (
        <div class={styles.finalSpacing}>
          {/* not beautiful but needed for the sticky navigation to not overlay the last chart */}
        </div>
      )}
    </>
  );
});
