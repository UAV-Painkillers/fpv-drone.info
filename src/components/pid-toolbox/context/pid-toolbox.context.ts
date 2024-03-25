import type { NoSerialize } from "@builder.io/qwik";
import {
  createContextId,
  noSerialize,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";

export interface PIDToolBoxState {
  results: NoSerialize<PIDAnalyzerResult[]>;
  selectedLogIndexes: number[];
  activeMainLogIndex: number;
  analyzerActiveAxis: "roll" | "pitch" | "yaw";
}

export const PIDToolBoxContext =
  createContextId<PIDToolBoxState>("pid-toolbox");

export function useToolboxContextProvider() {
  const toolboxState = useStore<PIDToolBoxState>({
    results: noSerialize([]),
    selectedLogIndexes: [],
    activeMainLogIndex: 0,
    analyzerActiveAxis: "roll",
  });
  useContextProvider(PIDToolBoxContext, toolboxState);

  return toolboxState;
}
