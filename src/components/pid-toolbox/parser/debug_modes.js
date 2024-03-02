import { makeReadOnly } from "./make_read_only";

export let DEBUG_MODE = [];

export let DEBUG_MODE_COMPLETE = makeReadOnly([
  "NONE",
  "CYCLETIME",
  "BATTERY",
  "GYRO",
  "ACCELEROMETER",
  "MIXER",
  "AIRMODE",
  "PIDLOOP",
  "NOTCH",
  "RC_INTERPOLATION",
  "VELOCITY",
  "DTERM_FILTER",
  "ANGLERATE",
  "ESC_SENSOR",
  "SCHEDULER",
  "STACK",
  "DEBUG_ESC_SENSOR_RPM",
  "DEBUG_ESC_SENSOR_TMP",
  "DEBUG_ALTITUDE",
  "DEBUG_FFT",
  "DEBUG_FFT_TIME",
  "DEBUG_FFT_FREQ",
  "DEBUG_FRSKY_D_RX",
  "DEBUG_GYRO_RAW",
]);
