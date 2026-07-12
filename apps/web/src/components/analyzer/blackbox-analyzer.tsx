import {
  AnalyzerProvider,
  AnalyzerState,
  useAnalyzeLog,
  useAnalyzerContext,
  type PIDAnalyzerResult,
} from '@fpv/analyzer';
import { format, useT } from '@fpv/i18n';
import {
  Button,
  Callout,
  ClientOnly,
  Dialog,
  DonateCta,
  ErrorRaccoon,
  LoaderRaccoon,
  MascotImage,
  Spinner,
} from '@fpv/ui';
import {
  Plots,
  PlotName,
  type PlotLabelDefinitions,
  type PlotNavigationProps,
} from '@fpv/plots';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { ProgressSteps } from './progress-steps';

const DOWNLOAD_SIZE_MB = 90;

export interface BlackboxAnalyzerProps {
  /** Plot names, or ["*"] / empty for all (matches migrated CMS config). */
  activePlots?: string[];
  /** Navigation flag names, e.g. ["showActiveAxisSelection"]. */
  navigation?: string[];
  /** Per-placement series labels, keyed by plot group. */
  plotLabels?: Record<string, { template: string; headerField: string }>;
}

function resolveActivePlots(activePlots?: string[]): PlotName[] {
  const names = (activePlots ?? []).filter((p) => p !== '*');
  if (!names.length || activePlots?.includes('*')) {
    return Object.values(PlotName);
  }
  return names.filter((n): n is PlotName =>
    (Object.values(PlotName) as string[]).includes(n),
  );
}

function resolveNavigation(navigation?: string[]): PlotNavigationProps {
  return {
    showCombinedLogsSelection: navigation?.includes('showCombinedLogsSelection'),
    showActiveAxisSelection: navigation?.includes('showActiveAxisSelection'),
    showMainLogSelection: navigation?.includes('showMainLogSelection'),
  };
}

function resolvePlotLabels(
  plotLabels?: BlackboxAnalyzerProps['plotLabels'],
): PlotLabelDefinitions {
  const defs: PlotLabelDefinitions = {};
  const strength = plotLabels?.['strength'];
  if (strength) {
    defs.responseStrength = {
      response: {
        headdictField:
          strength.headerField as keyof PIDAnalyzerResult['headdict'],
        template: strength.template,
      },
    };
  }
  return defs;
}

async function loadMockResults(): Promise<PIDAnalyzerResult[]> {
  const res = await fetch('/mock-data.json.gz');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // magic bytes 1f 8b → still gzipped (static hosting without content-encoding)
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Response(
      new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip')),
    );
    return (await stream.json()) as PIDAnalyzerResult[];
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as PIDAnalyzerResult[];
}

function AnalyzerContent(props: BlackboxAnalyzerProps) {
  const t = useT();
  const ctx = useAnalyzerContext();
  const { init, analyzeFile, progress, state, error, hasAnalysisInMemory } =
    useAnalyzeLog();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plots = useMemo(() => resolveActivePlots(props.activePlots), [props.activePlots]);
  const navigation = useMemo(() => resolveNavigation(props.navigation), [props.navigation]);
  const plotLabels = useMemo(() => resolvePlotLabels(props.plotLabels), [props.plotLabels]);

  // CI/preview hook: ?mock-data loads a canned analysis without Pyodide.
  const [mockMode, setMockMode] = useState(false);
  useEffect(() => {
    if (!window.location.search.includes('mock-data')) return;
    setMockMode(true);
    loadMockResults()
      .then((results) => {
        ctx.setResults(results);
        ctx.setSelectedLogIndexes(results.map((_, i) => i));
      })
      .catch((e) => console.error('Failed to load mock data', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUserUploadedFile = (file?: File) => {
    if (!file) return;
    if (!hasAnalysisInMemory) {
      void analyzeFile(file, true);
      return;
    }
    setPendingFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    onUserUploadedFile(e.dataTransfer?.files?.[0]);
  };

  const subLogsWithErrors = progress.subLogs.state.filter(
    (s) => s.state === 'ERROR',
  );

  if (state === AnalyzerState.UNINITIALIZED && !mockMode) {
    return (
      <div className="rounded-(--radius-card) border border-line bg-surface-raised p-6 text-center">
        <MascotImage name="chichi" alt="" className="mx-auto w-32" />
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          {format(t.analyzer.downloadGate.message, {
            downloadSizeMB: DOWNLOAD_SIZE_MB,
          })}
        </p>
        <Button size="lg" className="mt-4" onClick={() => void init()}>
          {format(t.analyzer.downloadGate.acceptButton, {
            downloadSizeMB: DOWNLOAD_SIZE_MB,
          })}
        </Button>
      </div>
    );
  }

  if (state === AnalyzerState.LOADING) {
    return <LoaderRaccoon>{t.analyzer.loading}</LoaderRaccoon>;
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={onDrop}
    >
      {!mockMode && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => onUserUploadedFile(e.target.files?.[0])}
          />
          <button
            type="button"
            aria-label={t.analyzer.openFileButton.ariaLabel}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex min-h-28 w-full cursor-pointer items-center justify-center gap-3 rounded-(--radius-card) border-2 border-dashed p-6 text-center font-semibold transition',
              isDraggingOver
                ? 'border-brand-green bg-brand-green-soft text-brand-green'
                : 'border-line bg-surface-raised text-ink-muted hover:border-brand-green hover:text-ink',
            )}
          >
            {state === AnalyzerState.RUNNING && <Spinner />}
            {t.analyzer.openFileButton.label}
          </button>
        </>
      )}

      {state === AnalyzerState.ERROR && (
        <div className="mt-4">
          <ErrorRaccoon title={t.analyzer.error.logAnalyzation}>
            <pre className="text-left text-xs whitespace-pre-wrap">
              {error ?? ''}
            </pre>
          </ErrorRaccoon>
        </div>
      )}

      {subLogsWithErrors.length > 0 && (
        <Callout tone="danger" title="Errors" className="mt-4">
          {subLogsWithErrors.map(({ index, error: subError }) => (
            <p key={index}>
              {format(t.analyzer.subLogError, {
                index: index + 1,
                error: subError ?? '',
              })}
            </p>
          ))}
        </Callout>
      )}

      {/* add-to vs replace decision for a second file */}
      <Dialog
        open={pendingFile !== null}
        onOpenChange={(open) => {
          if (!open) setPendingFile(null);
        }}
        title={t.analyzer.title}
      >
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => {
              void analyzeFile(pendingFile ?? undefined, false);
              setPendingFile(null);
            }}
          >
            {t.analyzer.addFileToCurrentAnalysis}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void analyzeFile(pendingFile ?? undefined, true);
              setPendingFile(null);
            }}
          >
            {t.analyzer.replaceCurrentAnalysis}
          </Button>
        </div>
      </Dialog>

      {/* live progress */}
      <Dialog
        open={state === AnalyzerState.RUNNING}
        title={t.analyzer.progress.runningAnalysis}
        dismissable={false}
      >
        <div className="flex flex-col items-center gap-4">
          <MascotImage name="processing" alt="" className="w-28 rounded-(--radius-control)" />
          <div className="max-h-72 w-full overflow-y-auto">
            <ProgressSteps progress={progress} />
          </div>
        </div>
      </Dialog>

      <div className="mt-6">
        <Plots plots={plots} navigation={navigation} plotLabels={plotLabels} />
      </div>

      {state === AnalyzerState.DONE && (
        <div className="mt-6">
          <DonateCta
            title={t.donate.afterAnalysis.title}
            body={t.donate.afterAnalysis.body}
            buttonLabel={t.donate.cta.button}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The Blackbox Analyzer widget. Client-only (Pyodide/ECharts); prerendered
 * pages show a lightweight placeholder until hydration.
 */
export function BlackboxAnalyzer(props: BlackboxAnalyzerProps) {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-40 animate-pulse rounded-(--radius-card) border border-line bg-surface-raised" />
      }
    >
      <AnalyzerProvider>
        <AnalyzerContent {...props} />
      </AnalyzerProvider>
    </ClientOnly>
  );
}
