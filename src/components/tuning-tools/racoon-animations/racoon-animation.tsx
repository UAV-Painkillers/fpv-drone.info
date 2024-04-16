import { component$ } from "@builder.io/qwik";
import type { IntrinsicElements } from "@builder.io/qwik";

type Props = IntrinsicElements["div"] & {
  label?: string;
};

const baseComponent = (src: string, props: Props) => {
  const { label, ...divProps } = props;
  return (
    <div {...divProps}>
      <center>
        <img
          height="300"
          width="300"
          style={{
            height: "30vh !important",
            width: "auto",
            display: "block",
            transition: "height .4s ease",
          }}
          // eslint-disable-next-line qwik/jsx-img
          src={src}
          alt={label || "Animation"}
        />

        {label && (
          <>
            <br />
            <label>{label}</label>
          </>
        )}
      </center>
    </div>
  );
};

export const RacoonLoader = component$((props: Props) =>
  baseComponent("/images/racoon_processing-cropped.gif", props),
);

export const RacoonError = component$((props: Props) =>
  baseComponent("/images/racoon_fire_error.gif", props),
);
