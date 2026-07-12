import {
  AnalyzeOneFlightStep,
  SplitBBLStep,
} from '@uav.painkillers/pid-analyzer-wasm';
import { describe, expect, it } from 'vitest';
import { applyAnalyzeStep, applySplitBBLStep } from './progress';
import { AnalyzerStepStatus, makeEmptyProgress } from './types';

describe('applySplitBBLStep', () => {
  it('walks a full split sequence', () => {
    let p = makeEmptyProgress();

    p = applySplitBBLStep(p, SplitBBLStep.RUNNING, undefined as never);
    expect(p.splitting.state).toBe(AnalyzerStepStatus.RUNNING);

    p = applySplitBBLStep(p, SplitBBLStep.SPLITTING_BBL, undefined as never);
    expect(p.splitting.splittingIntoFlights).toBe(AnalyzerStepStatus.RUNNING);

    p = applySplitBBLStep(p, SplitBBLStep.BBLS_SPLITTED, 3 as never);
    expect(p.splitting.splittingIntoFlights).toBe(AnalyzerStepStatus.COMPLETE);
    expect(p.flightsCount).toBe(3);

    for (let i = 0; i < 3; i++) {
      p = applySplitBBLStep(
        p,
        SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_START,
        i as never,
      );
      p = applySplitBBLStep(
        p,
        SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_COMPLETE,
        i as never,
      );
      p = applySplitBBLStep(p, SplitBBLStep.DECODING_SUB_BBL_START, i as never);
      p = applySplitBBLStep(p, SplitBBLStep.DECODING_SUB_BBL_COMPLETE, i as never);
    }

    expect(p.subLogs.readingHeaders).toHaveLength(3);
    expect(
      p.subLogs.readingHeaders.every((s) => s.state === AnalyzerStepStatus.COMPLETE),
    ).toBe(true);
    expect(
      p.subLogs.decoding.every((s) => s.state === AnalyzerStepStatus.COMPLETE),
    ).toBe(true);
    // overall sub-log state stays RUNNING until the analyze phase completes it
    expect(p.subLogs.state.every((s) => s.state === AnalyzerStepStatus.RUNNING)).toBe(
      true,
    );

    p = applySplitBBLStep(p, SplitBBLStep.COMPLETE, undefined as never);
    expect(p.splitting.state).toBe(AnalyzerStepStatus.COMPLETE);
  });

  it('does not mutate the previous progress object', () => {
    const before = makeEmptyProgress();
    const frozen = JSON.parse(JSON.stringify(before));
    applySplitBBLStep(before, SplitBBLStep.RUNNING, undefined as never);
    expect(before).toEqual(frozen);
  });
});

describe('applyAnalyzeStep', () => {
  function progressWithFlight(index: number) {
    let p = makeEmptyProgress();
    p = applySplitBBLStep(
      p,
      SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_START,
      index as never,
    );
    return p;
  }

  it('tracks per-axis PID trace analysis', () => {
    let p = progressWithFlight(0);

    p = applyAnalyzeStep(p, AnalyzeOneFlightStep.ANALYZE_PID_START, 0, undefined as never);
    expect(p.subLogs.analyzingPID[0]?.state).toBe(AnalyzerStepStatus.RUNNING);

    for (const axis of ['roll', 'pitch', 'yaw'] as const) {
      p = applyAnalyzeStep(
        p,
        AnalyzeOneFlightStep.ANALYZE_PID_TRACE_START,
        0,
        axis as never,
      );
      expect(p.subLogs.analyzingPIDTrace[axis][0]?.state).toBe(
        AnalyzerStepStatus.RUNNING,
      );
      p = applyAnalyzeStep(
        p,
        AnalyzeOneFlightStep.ANALYZE_PID_TRACE_COMPLETE,
        0,
        axis as never,
      );
      expect(p.subLogs.analyzingPIDTrace[axis][0]?.state).toBe(
        AnalyzerStepStatus.COMPLETE,
      );
    }

    p = applyAnalyzeStep(
      p,
      AnalyzeOneFlightStep.ANALYZE_PID_COMPLETE,
      0,
      undefined as never,
    );
    expect(p.subLogs.analyzingPID[0]?.state).toBe(AnalyzerStepStatus.COMPLETE);

    p = applyAnalyzeStep(p, AnalyzeOneFlightStep.COMPLETE, 0, undefined as never);
    expect(p.subLogs.state[0]?.state).toBe(AnalyzerStepStatus.COMPLETE);
  });

  it('records flight errors with their message', () => {
    let p = progressWithFlight(1);
    p = applyAnalyzeStep(
      p,
      AnalyzeOneFlightStep.ERROR,
      1,
      'boom' as never,
    );
    const state = p.subLogs.state.find((s) => s.index === 1);
    expect(state?.state).toBe(AnalyzerStepStatus.ERROR);
    expect(state?.error).toBe('boom');
  });

  it('only touches the flight it is given', () => {
    let p = progressWithFlight(0);
    p = applySplitBBLStep(
      p,
      SplitBBLStep.READING_HEADERS_FROM_SUB_BBL_START,
      1 as never,
    );
    p = applyAnalyzeStep(p, AnalyzeOneFlightStep.COMPLETE, 1, undefined as never);
    expect(p.subLogs.state.find((s) => s.index === 0)?.state).toBe(
      AnalyzerStepStatus.RUNNING,
    );
    expect(p.subLogs.state.find((s) => s.index === 1)?.state).toBe(
      AnalyzerStepStatus.COMPLETE,
    );
  });
});
