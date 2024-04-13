import { component$, $ } from "@builder.io/qwik";
import { BuilderDataList } from "../shared/builder-data-list/builder-data-list";
import type { BuilderContent, RegisteredComponent } from "@builder.io/sdk-qwik";

interface Props {
  sponsorModelName: string;
}
export const SponsorsList = component$((props: Props) => {
  const renderSponsor = $((sponsor: BuilderContent) => (
    <a
      href={sponsor.data?.href}
      target="_blank"
      rel="noreferrer"
      class="clickable"
      style={{
        width: "100%",
        maxWidth: "200px",
      }}
    >
      {/* eslint-disable-next-line qwik/jsx-img */}
      <img
        src={sponsor.data?.logo}
        alt={sponsor.data?.name}
        height="100"
        width="200"
        loading="lazy"
        style={{
          objectFit: "contain",
          maxHeight: "100px",
          maxWidth: "200px",
          marginBottom: "15px",
          display: "block",
        }}
      />
      <label class="anchor" style={{ display: "block", textAlign: "center" }}>
        {sponsor.data?.name}
      </label>
    </a>
  ));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        gap: "25px 0",
      }}
    >
      <BuilderDataList
        dataModelName={props.sponsorModelName}
        item={renderSponsor}
      />
    </div>
  );
});

export const SponsorsListRegistryDefinition: RegisteredComponent = {
  component: SponsorsList,
  name: "SponsorsList",
  friendlyName: "Sponsors List",
  inputs: [
    {
      name: "sponsorModelName",
      type: "string",
      defaultValue: "sponsor",
      required: true,
      friendlyName: "Sponsor Model Name",
      description: "The name of the model that contains the sponsor data.",
    },
  ],
};
