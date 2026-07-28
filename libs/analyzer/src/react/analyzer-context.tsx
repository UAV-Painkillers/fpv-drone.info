import type { PIDAnalyzerResult } from '@uav.painkillers/pid-analyzer-wasm';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { Axis } from '../core/types';

export interface BlackboxAnalyzerState {
  results: PIDAnalyzerResult[];
  selectedLogIndexes: number[];
  activeMainLogIndex: number;
  activeAxis: Axis;
  setResults: Dispatch<SetStateAction<PIDAnalyzerResult[]>>;
  setSelectedLogIndexes: Dispatch<SetStateAction<number[]>>;
  setActiveMainLogIndex: Dispatch<SetStateAction<number>>;
  setActiveAxis: Dispatch<SetStateAction<Axis>>;
}

const AnalyzerContext = createContext<BlackboxAnalyzerState | null>(null);

/** Shared analysis state: results + plot navigation selections. */
export function AnalyzerProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<PIDAnalyzerResult[]>([]);
  const [selectedLogIndexes, setSelectedLogIndexes] = useState<number[]>([]);
  const [activeMainLogIndex, setActiveMainLogIndex] = useState(0);
  const [activeAxis, setActiveAxis] = useState<Axis>('roll');

  const value = useMemo(
    () => ({
      results,
      selectedLogIndexes,
      activeMainLogIndex,
      activeAxis,
      setResults,
      setSelectedLogIndexes,
      setActiveMainLogIndex,
      setActiveAxis,
    }),
    [results, selectedLogIndexes, activeMainLogIndex, activeAxis],
  );

  return <AnalyzerContext.Provider value={value}>{children}</AnalyzerContext.Provider>;
}

export function useAnalyzerContext(): BlackboxAnalyzerState {
  const ctx = useContext(AnalyzerContext);
  if (!ctx) {
    throw new Error('useAnalyzerContext must be used inside <AnalyzerProvider>');
  }
  return ctx;
}
