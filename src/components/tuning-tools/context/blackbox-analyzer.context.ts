import type { NoSerialize } from "@builder.io/qwik";
import {
  createContextId,
  noSerialize,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";

export interface BlackboxAnalyzerState {
  results: NoSerialize<PIDAnalyzerResult[]>;
  selectedLogIndexes: number[];
  activeMainLogIndex: number;
  analyzerActiveAxis: "roll" | "pitch" | "yaw";
}

export const BlackboxAnalyzerContext =
  createContextId<BlackboxAnalyzerState>("blackbox-analyzer");

export function useBlackboxAnalyzerContextProvider() {
  const blackboxAnalyzerState = useStore<BlackboxAnalyzerState>({
    results: noSerialize([]),
    selectedLogIndexes: [],
    activeMainLogIndex: 0,
    analyzerActiveAxis: "roll",
  });
  useContextProvider(BlackboxAnalyzerContext, blackboxAnalyzerState);

  return blackboxAnalyzerState;
}
