import { useAnalyzerContext } from '@fpv/analyzer';
import { useEffect, useMemo, useRef } from 'react';
import {
  PlotName,
  ResponsePlotter,
  type ChartsElementMap,
  type PlotLabelDefinitions,
} from '../response-plotter';
import { PlotNavigation, type PlotNavigationProps } from './plot-navigation';

export interface PlotsProps {
  plots?: PlotName[];
  navigation?: PlotNavigationProps;
  plotLabels?: PlotLabelDefinitions;
}

const TWO_COLUMN_PLOTS: PlotName[] = [PlotName.RESPONSE_THROTTLE];

/** React wrapper around the ported ResponsePlotter (ECharts). */
export function Plots({ plots, navigation, plotLabels }: PlotsProps) {
  const ctx = useAnalyzerContext();
  const plotterRef = useRef<ResponsePlotter | null>(null);
  const elementRefs = useRef<ChartsElementMap>({});

  const activePlots = useMemo(
    () => plots ?? Object.values(PlotName),
    [plots],
  );

  const logsToShow = useMemo(
    () => ctx.results.filter((_, i) => ctx.selectedLogIndexes.includes(i)),
    [ctx.results, ctx.selectedLogIndexes],
  );

  const hasResults = ctx.results.length > 0;

  // (Re-)initialize charts when the visible plot set or results-presence
  // changes. Data/axis/labels are pushed by the effects below.
  useEffect(() => {
    if (!hasResults) return;

    if (!plotterRef.current) {
      plotterRef.current = new ResponsePlotter();
    }
    const charts = Object.fromEntries(
      activePlots
        .map((name) => [name, elementRefs.current[name]] as const)
        .filter(([, el]) => !!el),
    ) as ChartsElementMap;
    plotterRef.current.setLabelDefinitions(plotLabels ?? {});
    plotterRef.current.setData(logsToShow);
    plotterRef.current.setChartElements(charts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlots, hasResults]);

  useEffect(() => {
    plotterRef.current?.setData(logsToShow);
  }, [logsToShow]);

  useEffect(() => {
    plotterRef.current?.setActiveAxis(ctx.activeAxis);
  }, [ctx.activeAxis]);

  useEffect(() => {
    plotterRef.current?.setActiveMainLog(ctx.activeMainLogIndex);
  }, [ctx.activeMainLogIndex]);

  useEffect(() => {
    plotterRef.current?.setLabelDefinitions(plotLabels ?? {});
  }, [plotLabels]);

  useEffect(() => {
    const onResize = () => plotterRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      plotterRef.current?.dispose();
      plotterRef.current = null;
    };
  }, []);

  if (!hasResults) {
    return null;
  }

  return (
    <div>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {activePlots.map((plotName) => (
          <div
            key={plotName}
            ref={(el) => {
              elementRefs.current[plotName] = el ?? undefined;
            }}
            className={
              TWO_COLUMN_PLOTS.includes(plotName)
                ? 'aspect-3/1 max-h-[80vh] w-full md:col-span-2'
                : 'aspect-square max-h-[80vh] w-full'
            }
          />
        ))}
      </div>
      <PlotNavigation {...navigation} />
    </div>
  );
}
