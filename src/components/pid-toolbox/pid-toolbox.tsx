import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  $,
  noSerialize,
  useComputed$,
  useTask$,
  useStore,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import type { RegisteredComponent } from "@builder.io/sdk-qwik";
import { FlightLog } from "./parser/flightlog.js";
import { Chart, registerables } from "chart.js";

interface ChartData {
  timeArray: number[];
  rollArray: number[];
  pitchArray: number[];
  yawArray: number[];
}

interface State {
  flightLog: NoSerialize<FlightLog> | null;
  selectedLogIndex: number;
  chunks: NoSerialize<
    Array<{
      frames: Array<Array<any>>;
    }>
  >;
  chartData: ChartData;
  axisToShow: "roll" | "pitch" | "yaw";
}

export const PIDToolbox = component$(() => {
  const state = useStore<State>({
    flightLog: null,
    selectedLogIndex: -1,
    chunks: noSerialize([]),
    chartData: {
      timeArray: [],
      rollArray: [],
      pitchArray: [],
      yawArray: [],
    },
    axisToShow: "roll",
  });

  const chartCanvas = useSignal<HTMLCanvasElement>();

  const amountOfFlightsInLog = useComputed$(() => {
    if (!state.flightLog) {
      return -1;
    }

    const count = state.flightLog.getLogCount();
    return count;
  });

  const openFilePicker = $(() => {
    const input = document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.accept = ".bbl,.txt,.cfl,.bfl,.log";

    // read file into memory
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      const bytes = await file.arrayBuffer();
      state.flightLog = noSerialize(new FlightLog(new Uint8Array(bytes)));
      state.selectedLogIndex = -1;
      state.chunks = noSerialize([]);
    };

    input.click();
  });

  const flightLogOptionLabel = (index: number) => {
    return `Flight Log #${index + 1}`;
  };

  const selectFlightLog = $(async (event: Event) => {
    console.log("selectFlightLog");

    const select = event.target as HTMLSelectElement;
    const selectedIndex = select.selectedIndex;
    if (selectedIndex === 0) {
      state.selectedLogIndex = -1;
      return;
    }

    state.selectedLogIndex = selectedIndex - 1;
    state.chunks = noSerialize([]);
  });

  // open log
  useTask$(async ({ track }) => {
    track(() => state.selectedLogIndex);

    if (state.selectedLogIndex === -1) {
      return;
    }

    if (!state.flightLog) {
      return;
    }

    const success = state.flightLog.openLog(state.selectedLogIndex);

    if (!success) {
      alert("Failed to open flight log");
      return;
    }

    state.chunks = noSerialize(
      state.flightLog.getChunksInTimeRange(
        state.flightLog.getMinTime(),
        state.flightLog.getMaxTime()
      )
    );
  });

  // parse chunks into chart data
  useTask$(async ({ track }) => {
    track(() => state.chunks);
    console.log("chunks", state.chunks);

    if (!state.flightLog) {
      return;
    }

    if (!state.chunks) {
      return;
    }

    console.log(state.flightLog.getMainFieldNames());

    const timeFieldIndex = state.flightLog.getMainFieldIndexByName("time");
    const rollFieldIndex =
      state.flightLog.getMainFieldIndexByName("gyroADC[0]");
    const pitchFieldIndex =
      state.flightLog.getMainFieldIndexByName("gyroADC[1]");
    const yawFieldIndex = state.flightLog.getMainFieldIndexByName("gyroADC[2]");

    state.chartData = {
      timeArray: [],
      rollArray: [],
      pitchArray: [],
      yawArray: [],
    };

    for (let chunkIndex = 0; chunkIndex < state.chunks.length; chunkIndex++) {
      const chunk = state.chunks[chunkIndex];
      for (let frameIndex = 0; frameIndex < chunk.frames.length; frameIndex++) {
        const frame = chunk.frames[frameIndex];

        const frameTime = chunk.frames[frameIndex][timeFieldIndex];
        const rollValue = frame[rollFieldIndex];
        const pitchValue = frame[pitchFieldIndex];
        const yawValue = frame[yawFieldIndex];

        state.chartData.timeArray.push(frameTime);
        state.chartData.rollArray.push(rollValue);
        state.chartData.pitchArray.push(pitchValue);
        state.chartData.yawArray.push(yawValue);
      }
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    console.log("update chart");

    track(() => state.chartData);
    track(() => state.axisToShow);

    if (!chartCanvas.value) {
      console.log("no chartCanvas");
      return;
    }

    console.log("chartCanvas", chartCanvas.value);

    Chart.register(...registerables);
    const chart = new Chart(chartCanvas.value, {
      type: "line",
      data: {
        labels: state.chartData.timeArray,
        datasets: [
          {
            label: state.axisToShow,
            data: state.chartData[`${state.axisToShow}Array`],
            borderWidth: 1,
          },
        ],
      },
    });

    cleanup(() => {
      chart.destroy();
    });
  });

  return (
    <>
      <button type="button" onClick$={openFilePicker}>
        Open Blackbox Log
      </button>

      {amountOfFlightsInLog.value > 0 && (
        <select onChange$={selectFlightLog}>
          <option disabled selected>
            Select a flight log
          </option>
          {[...Array(amountOfFlightsInLog.value)].map((_item, index) => (
            <option key={index} value={index}>
              {flightLogOptionLabel(index)}
            </option>
          ))}
        </select>
      )}

      <div style="height: 500px;">
        <canvas ref={chartCanvas} id="step-response-chart-canvas"></canvas>
      </div>
      <button type="button" onClick$={() => (state.axisToShow = "roll")}>
        Show Roll
      </button>
      <button type="button" onClick$={() => (state.axisToShow = "pitch")}>
        Show Pitch
      </button>
      <button type="button" onClick$={() => (state.axisToShow = "yaw")}>
        Show Yaw
      </button>
    </>
  );
});

export const PIDToolboxRegistryDefinition: RegisteredComponent = {
  component: PIDToolbox,
  name: "PIDToolbox",
  inputs: [],
};
