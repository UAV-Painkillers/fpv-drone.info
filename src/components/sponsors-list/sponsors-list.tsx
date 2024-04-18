import { component$, $ } from "@builder.io/qwik";
import type { ISbStoryData } from "@storyblok/js";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { CMSItemsList } from "../shared/cms-items-list/cms-items-list";

interface Props {
  sponsorsListStorySlug: string;
}
export const SponsorsList = component$((props: Props) => {
  const renderSponsor = $((sponsor: ISbStoryData) => (
    <a
      href={sponsor.content.href}
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
        src={sponsor.content.logo}
        alt={sponsor.content.name}
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
        {sponsor.content.name}
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
      <CMSItemsList
        itemsListStorySlug={props.sponsorsListStorySlug}
        renderItem={renderSponsor}
      />
    </div>
  );
});

export const SponsorsListRegistryDefinition: CMSRegisteredComponent = {
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
