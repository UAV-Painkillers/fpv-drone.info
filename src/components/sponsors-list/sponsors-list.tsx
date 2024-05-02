import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, useComputed$ } from "@builder.io/qwik";
import { storyblokEditable } from "@storyblok/js";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { transformStoryblokHref } from "../utils/url";

interface Sponsor {
  href: string;
  logoSrc: string;
  name: string;
}
const SingleSponsor = component$((sponsor: Sponsor) => (
  <a
    href={sponsor.href}
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
      src={sponsor.logoSrc}
      alt={sponsor.name}
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
      {sponsor.name}
    </label>
  </a>
));

interface Props {
  sponsors?: Sponsor[];
}
export const SponsorsList = component$(
  (props: Props & IntrinsicElements["div"]) => {
    const { sponsors, ...divProps } = props;

    return (
      <div
        {...divProps}
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          gap: "25px 0",
        }}
      >
        {(sponsors ?? []).map((sponsor, index) => (
          <SingleSponsor key={index} {...sponsor} />
        ))}
      </div>
    );
  },
);

export const SponsorsListRegistryDefinition: CMSRegisteredComponent = {
  component: component$((storyData) => {
    const sponsors = useComputed$(() => {
      return (storyData.items ?? []).map((item: any) => {
        const href = transformStoryblokHref(item.href);
        return {
          href,
          logoSrc: item.logo.filename,
          name: item.name,
        };
      });
    });

    return (
      <SponsorsList
        {...storyblokEditable(storyData)}
        sponsors={sponsors.value}
      />
    );
  }),
  name: "SponsorsList",
};
