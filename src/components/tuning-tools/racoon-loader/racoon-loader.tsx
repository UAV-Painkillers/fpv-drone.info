import { component$ } from "@builder.io/qwik";

interface Props {
  label?: string;
}
export const RacoonLoader = component$((props: Props) => {
  return (
    <div>
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
          src="/images/racoon_processing-cropped.gif"
          alt="Racoon Loader"
        />

        {props.label && (
          <>
            <br />
            <label>{props.label}</label>
          </>
        )}
      </center>
    </div>
  );
});
