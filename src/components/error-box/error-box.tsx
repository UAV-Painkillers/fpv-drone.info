import { component$, useComputed$ } from "@builder.io/qwik";
import { RacoonError } from "../tuning-tools/racoon-animations/racoon-animation";

interface Props {
  errorLines: string | string[];
}
export const ErrorBox = component$((props: Props) => {
  const errorLines = useComputed$(() => {
    if (Array.isArray(props.errorLines)) {
      return props.errorLines;
    }

    return [props.errorLines];
  });

  return (
    <code>
      <RacoonError style={{ float: "right" }} />
      <b style={{ color: "var(--error-color)", display: "block" }}>ERRORS:</b>
      {errorLines.value.map((line, errorLineIndex) =>
        line.split("\n").map((line, subLineIndex) => (
          <div
            style={{ minHeight: "1em" }}
            key={"sublog-error-" + errorLineIndex + "-" + subLineIndex}
          >
            {line}
          </div>
        )),
      )}

      <div style={{ clear: "both" }} />
    </code>
  );
});
