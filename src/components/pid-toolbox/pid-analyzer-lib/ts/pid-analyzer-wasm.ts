export interface StepResponseGeneralInformation {
  fwType: "Betaflight" | "KISS" | "Raceflight";
  rollPID: [number, number, number];
  pitchPID: [number, number, number];
  yawPID: [number, number, number];
  maxThrottle: number;
  tpaBreakpoint: number;
}

type GyroKeyPrefix = "gyroADC" | "ugyroADC" | "gyroData";

type TripletSuffix = `[${0 | 1 | 2}]`;

type GyroDataKey = `${GyroKeyPrefix}${TripletSuffix}`;

type LogKey =
  | "time"
  | `rcCommand${TripletSuffix}`
  | "rcCommand[3]"
  | `axisP${TripletSuffix}`
  | `axisI${TripletSuffix}`
  | `axisD${TripletSuffix}`
  | `debug${TripletSuffix}`
  | "debug[3]"
  | GyroDataKey;

export type StepResponseLogData = {
  [key in LogKey]: number[];
};

const PYODIDE_VERSION = "0.25.0";
const pyodideModuleUrl = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;

const requirementsUrl = "/python/requirements.txt";
const pythonCodeUrl = "/python/PID-Analyzer.py";

// define pyodie window property
declare global {
  interface Window {
    loadPyodide: any;
  }
}

// function to dynamically load the pydide module if not present
async function loadPyodide() {
  if (!window.loadPyodide) {
    await loadPyodideViaScriptTag();
  }

  const pyodide = await window.loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  });

  return pyodide;
}

// function to load the pyodide module
async function loadPyodideViaScriptTag() {
  console.log("Loading pyodide module");

  const pyodideScript = document.createElement("script");
  pyodideScript.src = pyodideModuleUrl;
  document.body.appendChild(pyodideScript);
  console.log("Waiting for pyodide module to load");

  await new Promise((resolve) => {
    pyodideScript.onload = resolve;
  });

  console.log("Pyodide module loaded", window.loadPyodide);
}

export async function stepResponse(
  generalInformation: StepResponseGeneralInformation,
  logData: StepResponseLogData
) {
  const pythonCode = `${/* DO NOT REMOVE ME: START OF PYTHON CODE */ ""}
      ${await fetch(pythonCodeUrl).then((response) => response.text())}
      ${/* DO NOT REMOVE ME: END OF PYTHON CODE */ ""}`.trim();

  const requirementsTXT = `${/* DO NOT REMOVE ME: START OF REQUIREMENTS */ ""}
    ${await fetch(requirementsUrl).then((response) => response.text())}
    ${/* DO NOT REMOVE ME: END OF REQUIREMENTS */ ""}`.trim();

  console.log({
    pythonCode,
    requirementsTXT,
  });

  const requirements = requirementsTXT.split("\n");

  const pyodide = await loadPyodide();

  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  for (const requirement of requirements) {
    if (requirement) {
      await micropip.install(requirement);
    }
  }

  type OmittedKeysOfData =
    | "gyro[0]"
    | "gyro[1]"
    | "gyro[2]"
    | "axisD[0]"
    | "axisD[1]"
    | "axisD[2]";
  const completeLogData = logData as Omit<typeof logData, OmittedKeysOfData> & {
    "gyro[0]": number[];
    "gyro[1]": number[];
    "gyro[2]": number[];

    "gyroADC[0]"?: (typeof logData)["gyroADC[0]"];
    "gyroADC[1]"?: (typeof logData)["gyroADC[1]"];
    "gyroADC[2]"?: (typeof logData)["gyroADC[2]"];

    "ugyroADC[0]"?: (typeof logData)["ugyroADC[0]"];
    "ugyroADC[1]"?: (typeof logData)["ugyroADC[1]"];
    "ugyroADC[2]"?: (typeof logData)["ugyroADC[2]"];

    "gyroData[0]"?: (typeof logData)["gyroData[0]"];
    "gyroData[1]"?: (typeof logData)["gyroData[1]"];
    "gyroData[2]"?: (typeof logData)["gyroData[2]"];

    "axisD[0]"?: number[];
    "axisD[1]"?: number[];
    "axisD[2]"?: number[];
  };

  if (completeLogData["axisD[0]"] === undefined) {
    console.warn("axisD[0] is undefined, filling with zeros.");
    completeLogData["axisD[0]"] = new Array(
      completeLogData["time"].length
    ).fill(0);
  }

  if (completeLogData["axisD[1]"] === undefined) {
    console.warn("axisD[1] is undefined, filling with zeros.");
    completeLogData["axisD[1]"] = new Array(
      completeLogData["time"].length
    ).fill(0);
  }

  if (completeLogData["axisD[2]"] === undefined) {
    console.warn("axisD[2] is undefined, filling with zeros.");
    completeLogData["axisD[2]"] = new Array(
      completeLogData["time"].length
    ).fill(0);
  }

  if (completeLogData["gyroADC[0]"] !== undefined) {
    console.info("Using gyroADC as gyro data");

    if (
      completeLogData["gyroADC[1]"] === undefined ||
      completeLogData["gyroADC[2]"] === undefined
    ) {
      throw new Error(
        "gyroADC[1] and gyroADC[2] must be defined if gyroADC[0] is defined"
      );
    }

    completeLogData["gyro[0]"] = completeLogData["gyroADC[0]"];
    completeLogData["gyro[1]"] = completeLogData["gyroADC[1]"];
    completeLogData["gyro[2]"] = completeLogData["gyroADC[2]"];
  } else if (completeLogData["ugyroADC[0]"] !== undefined) {
    console.info("Using ugyroADC as gyro data");

    if (
      completeLogData["ugyroADC[1]"] === undefined ||
      completeLogData["ugyroADC[2]"] === undefined
    ) {
      throw new Error(
        "ugyroADC[1] and ugyroADC[2] must be defined if ugyroADC[0] is defined"
      );
    }

    completeLogData["gyro[0]"] = completeLogData["ugyroADC[0]"];
    completeLogData["gyro[1]"] = completeLogData["ugyroADC[1]"];
    completeLogData["gyro[2]"] = completeLogData["ugyroADC[2]"];
  } else if (completeLogData["gyroData[0]"] !== undefined) {
    console.info("Using gyroData as gyro data");

    if (
      completeLogData["gyroData[1]"] === undefined ||
      completeLogData["gyroData[2]"] === undefined
    ) {
      throw new Error(
        "gyroData[1] and gyroData[2] must be defined if gyroData[0] is defined"
      );
    }

    completeLogData["gyro[0]"] = completeLogData["gyroData[0]"];
    completeLogData["gyro[1]"] = completeLogData["gyroData[1]"];
    completeLogData["gyro[2]"] = completeLogData["gyroData[2]"];
  } else {
    throw new Error(
      "gyroADC[0 | 1 | 2], ugyroADC[0 | 1 | 2] or gyroData[0 | 1 | 2] must be defined"
    );
  }

  console.log({ logData, generalInformation });

  pyodide.FS.writeFile("data.json", JSON.stringify(logData), {
    encoding: "utf8",
  });
  pyodide.FS.writeFile(
    "headdict.json",
    JSON.stringify({
      ...generalInformation,
      rollPID: `${generalInformation.rollPID[0]},${generalInformation.rollPID[1]},${generalInformation.rollPID[2]}`,
      pitchPID: `${generalInformation.pitchPID[0]},${generalInformation.pitchPID[1]},${generalInformation.pitchPID[2]}`,
      yawPID: `${generalInformation.yawPID[0]},${generalInformation.yawPID[1]},${generalInformation.yawPID[2]}`,
    }),
    {
      encoding: "utf8",
    }
  );

  // Pyodide is now ready to use...
  pyodide.runPython(pythonCode);

  console.log(pyodide.FS.readdir("/"));
  const responsePitchRaw = pyodide.FS.readFile("response_pitch.json", {
    encoding: "utf8",
  });
  const responsePitch = JSON.parse(responsePitchRaw);

  const responseRollRaw = pyodide.FS.readFile("response_roll.json", {
    encoding: "utf8",
  });
  const responseRoll = JSON.parse(responseRollRaw);

  const responseYawRaw = pyodide.FS.readFile("response_yaw.json", {
    encoding: "utf8",
  });
  const responseYaw = JSON.parse(responseYawRaw);

  return {
    roll: responseRoll,
    pitch: responsePitch,
    yaw: responseYaw,
  };
}
