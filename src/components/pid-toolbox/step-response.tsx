import { FlightLog } from "./parser/flightlog.js";
import type {
  StepResponseGeneralInformation,
  StepResponseLogData,
} from "@uav.painkillers/pid-analyzer-wasm";
import { PIDAnalyzer } from "@uav.painkillers/pid-analyzer-wasm";
import type { NoSerialize, Signal } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  $,
  useVisibleTask$,
  noSerialize,
} from "@builder.io/qwik";
import { ResponsePlotter } from "./response.plotter";

interface Chunk {
  frames: Array<number[]>;
}

type LogValues = Record<string, number[]> & StepResponseLogData;

export const StepResponse = component$(() => {
  const rollTraceChartRef = useSignal<HTMLDivElement>();
  const rollThrottleChartRef = useSignal<HTMLDivElement>();
  const rollResponseChartRef = useSignal<HTMLDivElement>();
  const rollStrengthChartRef = useSignal<HTMLDivElement>();
  const isLoadingAnalyzer = useSignal<boolean>(true);

  const analyzer: Signal<PIDAnalyzer> = useSignal<NoSerialize<PIDAnalyzer>>();

  const plotStepResponse = $(
    (generalInformation: StepResponseGeneralInformation, data: any) => {
      const plotter = new ResponsePlotter(
        rollTraceChartRef.value!,
        rollThrottleChartRef.value!,
        rollResponseChartRef.value!,
        rollStrengthChartRef.value!
      );
      plotter.plotAllResp(generalInformation, data, "raw");
    }
  );

  const parseLog = $((flightLog: FlightLog) => {
    const flights: Array<LogValues> = [];

    for (
      let flightLogIndex = 0;
      flightLogIndex < flightLog.getLogCount();
      flightLogIndex++
    ) {
      const success = flightLog.openLog(flightLogIndex);
      if (!success) {
        throw new Error(`Failed to open flight log #${flightLogIndex}`);
      }

      const logValues: Record<string, number[]> & StepResponseLogData =
        {} as any;

      const logFieldIndexes = flightLog.getMainFieldIndexes();

      const chunks = flightLog.getChunksInTimeRange(
        flightLog.getMinTime(),
        flightLog.getMaxTime()
      );

      let frameCounter = -1;
      chunks.forEach((chunk: Chunk) => {
        chunk.frames.forEach((frame) => {
          Object.entries(logFieldIndexes).forEach(([fieldName, index]) => {
            if (!logValues[fieldName]) {
              logValues[fieldName] = [];
            }

            let value = frame[index] as number | undefined;

            if (value === undefined) {
              console.warn(`Field ${fieldName} not found in frame`);
              value = 0;
            }

            frameCounter++;
            logValues[fieldName][frameCounter] = value;
          });
        });
      });

      Object.keys(logValues).forEach((fieldName) => {
        for (let i = 0; i < frameCounter; i++) {
          if (logValues[fieldName][i] === undefined) {
            logValues[fieldName][i] = 0;
          }
        }
      });

      flights.push(logValues);
    }

    return flights;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      isLoadingAnalyzer.value = true;
      analyzer.value = noSerialize(new PIDAnalyzer());
      await analyzer.value.init(
        `${location.origin}/pid-analyer-dependencies`
      );
    } finally {
      isLoadingAnalyzer.value = false;
    }
  });

  const openFilePicker = $(() => {
    console.log("openFilePicker");

    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.accept = ".bbl,.txt,.cfl,.bfl,.log";

    // read file into memory
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      // const flightLog = new FlightLog(new Uint8Array(bytes));
      // const parsedFlights = await parseLog(flightLog);

      // get index from user popup
      // const flightLogValues =
        // parsedFlights![parseInt(window.prompt("Enter flight index")!)];

      // if (flightLogValues === null) {
        // console.log("parsedFlight is null");
        // return;
      // }

      // const sysConfig = flightLog.getSysConfig();

      /*
      const generalInformation: StepResponseGeneralInformation = {
        fwType: sysConfig.firmwareType,
        rollPID: sysConfig.rollPID,
        pitchPID: sysConfig.pitchPID,
        yawPID: sysConfig.yawPID,
        maxThrottle: sysConfig.maxthrottle,
        tpaBreakpoint: sysConfig.tpa_breakpoint,
      };
      */

      // console.log(Object.keys(flightLogValues).join('\n'));

      //const data = await fetch("/pid-analyzer-wasm/data.json").then((res) =>
      //  res.json()
      //);

      const bytes = await file.arrayBuffer();
      const uint8_view = new Uint8Array(bytes);
      const stepResponseResult = await analyzer.value!.analyze(
        uint8_view
        // generalInformation,
        // flightLogValues
        // data
      );

      console.log(stepResponseResult);

      plotStepResponse(
        stepResponseResult.headerInformation,
        stepResponseResult.traces.roll
      );
    };

    input.click();
  });

  return (
    <>
      {isLoadingAnalyzer.value ? (
        <h1>Loading analyzer...</h1>
      ) : (
        <>
          <button type="button" onClick$={openFilePicker}>
            Open Blackbox Log pls
          </button>
        </>
      )}

      <h1>Trace</h1>
      <div style={{ height: "500px" }} ref={rollTraceChartRef}></div>

      <h1>Throttle</h1>
      <div style={{ height: "200px" }} ref={rollThrottleChartRef}></div>

      <h1>Response</h1>
      <div style={{ height: "500px" }} ref={rollResponseChartRef}></div>

      <h1>Strength</h1>
      <div style={{ height: "500px" }} ref={rollStrengthChartRef}></div>
    </>
  );
});
