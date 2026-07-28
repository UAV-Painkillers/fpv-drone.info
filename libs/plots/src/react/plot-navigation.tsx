import { useAnalyzerContext, type Axis } from '@fpv/analyzer';
import { format, useT } from '@fpv/i18n';
import { useState } from 'react';

export interface PlotNavigationProps {
  showCombinedLogsSelection?: boolean;
  showActiveAxisSelection?: boolean;
  showMainLogSelection?: boolean;
}

const AXES: Axis[] = ['roll', 'pitch', 'yaw'];

/**
 * Sticky control bar under the plots: combined-log visibility, main log
 * selection and roll/pitch/yaw axis switch (port of plot-navigation.tsx).
 */
export function PlotNavigation(props: PlotNavigationProps) {
  const t = useT();
  const ctx = useAnalyzerContext();
  const [showLogSelection, setShowLogSelection] = useState(false);

  if (
    !props.showActiveAxisSelection &&
    !props.showCombinedLogsSelection &&
    !props.showMainLogSelection
  ) {
    return null;
  }

  const toggleLogIndex = (index: number) => {
    ctx.setSelectedLogIndexes((selected) =>
      selected.includes(index)
        ? selected.filter((i) => i !== index)
        : [...selected, index],
    );
  };

  const controlClasses =
    'h-10 rounded-(--radius-control) border border-line bg-surface-raised px-3 text-sm font-semibold';

  return (
    <nav
      aria-label="Plot navigation"
      className="sticky bottom-20 z-20 my-4 flex flex-wrap items-center gap-2 rounded-(--radius-card) border border-line bg-surface-raised/95 p-2 shadow-lg backdrop-blur md:bottom-4"
    >
      {props.showCombinedLogsSelection ? (
        <div className="relative">
          <button
            type="button"
            className={`${controlClasses} cursor-pointer hover:border-brand-green`}
            aria-expanded={showLogSelection}
            onClick={() => setShowLogSelection((v) => !v)}
          >
            {format(t.analyzer.plotNavigation.combinedLogs, {
              count: ctx.selectedLogIndexes.length,
              total: ctx.results.length,
            })}
          </button>
          {showLogSelection ? (
            <div className="absolute bottom-12 left-0 z-30 min-w-48 rounded-(--radius-control) border border-line bg-surface-raised p-3 shadow-xl">
              {ctx.results.map((_, i) => (
                <label key={i} className="flex items-center gap-2 py-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={ctx.selectedLogIndexes.includes(i)}
                    onChange={() => toggleLogIndex(i)}
                    className="accent-(--fpv-brand-green)"
                  />
                  {`Flightlog #${i + 1}`}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {props.showMainLogSelection ? (
        <select
          className={controlClasses}
          value={ctx.activeMainLogIndex}
          onChange={(e) => ctx.setActiveMainLogIndex(Number.parseInt(e.target.value))}
        >
          {ctx.results.map((_, i) => (
            <option key={i} value={i}>
              {format(t.analyzer.plotNavigation.activeFlightLog, { index: i + 1 })}
            </option>
          ))}
        </select>
      ) : null}

      {props.showActiveAxisSelection ? (
        <div className="ml-auto inline-flex rounded-(--radius-control) border border-line bg-surface-sunken p-1">
          {AXES.map((axis) => (
            <button
              key={axis}
              type="button"
              onClick={() => ctx.setActiveAxis(axis)}
              className={`cursor-pointer rounded-[calc(var(--radius-control)-4px)] px-3 py-1 text-sm font-semibold transition ${
                ctx.activeAxis === axis
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t.analyzer.plotNavigation.axis[axis]}
            </button>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
