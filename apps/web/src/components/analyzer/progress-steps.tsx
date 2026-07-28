import {
  AnalyzerStepStatus,
  type AnalyzerProgress,
  type AnalyzerStepStatusIndexArray,
} from '@fpv/analyzer';
import { format, useT } from '@fpv/i18n';
import { Spinner } from '@fpv/ui';
import type { ReactNode } from 'react';

function StatusIcon({ state }: { state: AnalyzerStepStatus }) {
  switch (state) {
    case AnalyzerStepStatus.RUNNING:
      return <Spinner className="h-3.5 w-3.5" />;
    case AnalyzerStepStatus.COMPLETE:
      return <span className="text-success">✓</span>;
    case AnalyzerStepStatus.ERROR:
      return <span className="text-danger">✗</span>;
    case AnalyzerStepStatus.SKIPPED:
      return <span className="text-ink-muted">–</span>;
    default:
      return <span className="text-ink-muted">○</span>;
  }
}

function StepRow({
  state,
  label,
  children,
}: {
  state: AnalyzerStepStatus;
  label: ReactNode;
  children?: ReactNode;
}) {
  return (
    <li>
      <span className="flex items-center gap-2 text-sm">
        <StatusIcon state={state} />
        <span
          className={
            state === AnalyzerStepStatus.PENDING ? 'text-ink-muted' : undefined
          }
        >
          {label}
        </span>
      </span>
      {children}
    </li>
  );
}

function stateAt(array: AnalyzerStepStatusIndexArray, index: number) {
  return (
    array.find((i) => i.index === index)?.state ?? AnalyzerStepStatus.PENDING
  );
}

/** Nested live progress view for a running analysis (port of status-dialog). */
export function ProgressSteps({ progress }: { progress: AnalyzerProgress }) {
  const t = useT();

  return (
    <ul className="space-y-1.5">
      <StepRow
        state={progress.splitting.state}
        label={t.analyzer.progress.splittingLog}
      />
      {Array.from({ length: progress.flightsCount }).map((_, flightIndex) => {
        const subSteps = [
          {
            state: stateAt(progress.subLogs.readingHeaders, flightIndex),
            label: t.analyzer.progress.readingHeaders,
          },
          {
            state: stateAt(progress.subLogs.decoding, flightIndex),
            label: t.analyzer.progress.decoding,
          },
          {
            state: stateAt(progress.subLogs.readingCSV, flightIndex),
            label: t.analyzer.progress.readingDecodedLog,
          },
          {
            state: stateAt(progress.subLogs.writingHeadDictToJson, flightIndex),
            label: t.analyzer.progress.exportingHeaders,
          },
          ...(['roll', 'pitch', 'yaw'] as const).map((axis) => ({
            state: stateAt(progress.subLogs.analyzingPIDTrace[axis], flightIndex),
            label: format(t.analyzer.progress.analyzingAxis, { axis }),
          })),
        ];
        return (
          <StepRow
            key={flightIndex}
            state={stateAt(progress.subLogs.state, flightIndex)}
            label={format(t.analyzer.progress.analyzingSubLog, {
              flightIndex: flightIndex + 1,
            })}
          >
            <ul className="mt-1 ml-6 space-y-1">
              {subSteps.map((step, i) => (
                <StepRow key={i} state={step.state} label={step.label} />
              ))}
            </ul>
          </StepRow>
        );
      })}
    </ul>
  );
}
