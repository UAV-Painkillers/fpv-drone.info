import { makeReadOnly } from "./make_read_only";

export const FlightLogEvent = makeReadOnly({
  SYNC_BEEP: 0,

  AUTOTUNE_CYCLE_START: 10,
  AUTOTUNE_CYCLE_RESULT: 11,
  AUTOTUNE_TARGETS: 12,
  INFLIGHT_ADJUSTMENT: 13,
  LOGGING_RESUME: 14,

  GTUNE_CYCLE_RESULT: 20,
  FLIGHT_MODE: 30, // New Event type
  TWITCH_TEST: 40, // Feature for latency testing

  CUSTOM: 250, // Virtual Event Code - Never part of Log File.
  CUSTOM_BLANK: 251, // Virtual Event Code - Never part of Log File. - No line shown
  LOG_END: 255,
});
