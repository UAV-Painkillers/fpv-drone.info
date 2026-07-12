import {
  PIDAnalyzer,
  type PIDAnalyzerResult,
} from '@uav.painkillers/pid-analyzer-wasm';
import { useCallback, useRef, useState } from 'react';
import { applyAnalyzeStep, applySplitBBLStep } from '../core/progress';
import {
  AnalyzerState,
  makeEmptyProgress,
  type AnalyzerProgress,
} from '../core/types';
import { useAnalyzerContext } from './analyzer-context';

export interface UseAnalyzeLogOptions {
  /** Where the Pyodide runtime + wheels are served from. */
  dependenciesPath?: string;
  /** Analytics callback, e.g. ('TUNING_TOOLS', 'ANALYZE_FILE_START'). */
  onEvent?: (category: string, action: string) => void;
}

/**
 * React port of the original use-analyze-log hook. The heavy lifting stays in
 * @uav.painkillers/pid-analyzer-wasm (Pyodide); progress bookkeeping lives in
 * the pure reducers in core/progress.ts.
 *
 * Unlike the original (init on visibility), initialization is explicit via
 * init(): the engine download is ~90 MB, so the UI asks the user first.
 */
export function useAnalyzeLog(options: UseAnalyzeLogOptions = {}) {
  const { dependenciesPath = '/pid-analyzer-dependencies', onEvent } = options;
  const analyzerState = useAnalyzerContext();

  const [state, setState] = useState<AnalyzerState>(AnalyzerState.UNINITIALIZED);
  const [progress, setProgress] = useState<AnalyzerProgress>(makeEmptyProgress);
  const [error, setError] = useState<string | null>(null);
  const analyzerRef = useRef<PIDAnalyzer | null>(null);
  const hasAnalysisInMemory = analyzerState.results.length > 0;

  const init = useCallback(async () => {
    if (analyzerRef.current) return;
    try {
      setState(AnalyzerState.LOADING);
      const analyzer = new PIDAnalyzer(dependenciesPath);
      await analyzer.init();
      analyzerRef.current = analyzer;
      setState(AnalyzerState.IDLE);
    } catch (e) {
      console.error('Error initializing analyzer', e);
      setState(AnalyzerState.ERROR);
      setError((e as Error).message);
    }
  }, [dependenciesPath]);

  const analyzeFile = useCallback(
    async (file: File | undefined, replaceCurrentAnalysis = true) => {
      if (!file) {
        console.warn('No file provided');
        return;
      }
      const analyzer = analyzerRef.current;
      if (!analyzer) {
        console.warn('Analyzer not initialized');
        return;
      }

      onEvent?.('TUNING_TOOLS', 'ANALYZE_FILE_START');

      try {
        setState(AnalyzerState.RUNNING);
        setError(null);
        setProgress(makeEmptyProgress());

        const decoderResults = await analyzer.decodeMainBBL(
          await file.arrayBuffer(),
          (status, payload) => {
            setProgress((p) => applySplitBBLStep(p, status, payload as never));
          },
        );

        const analyzerResult = await analyzer.analyze(
          decoderResults,
          (status, index, payload) => {
            setProgress((p) => applyAnalyzeStep(p, status, index, payload as never));
          },
        );

        const base: PIDAnalyzerResult[] = replaceCurrentAnalysis
          ? []
          : analyzerState.results;
        analyzerState.setResults([...base, ...analyzerResult]);
        analyzerState.setSelectedLogIndexes(
          replaceCurrentAnalysis
            ? analyzerResult.map((_, index) => index)
            : [
                ...analyzerState.selectedLogIndexes,
                ...analyzerResult.map((_, index) => index + base.length),
              ],
        );

        if (analyzerResult.length === 0) {
          setError('Unable to parse any logs from the file.');
          setState(AnalyzerState.ERROR);
        } else {
          setState(AnalyzerState.DONE);
        }

        onEvent?.('TUNING_TOOLS', 'ANALYZE_FILE_COMPLETE');
      } catch (e) {
        console.error('Error analyzing file', e);
        onEvent?.('TUNING_TOOLS', 'ANALYZE_FILE_ERROR');
        setState(AnalyzerState.ERROR);

        let message = (e as Error).message;
        if (message.includes('(OOM)')) {
          message =
            'Out of memory error.\nMost likely your logfile is too large...';
        }
        setError(message);
      }
    },
    [analyzerState, onEvent],
  );

  return {
    init,
    analyzeFile,
    progress,
    state,
    error,
    hasAnalysisInMemory,
  };
}
