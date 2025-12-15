import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { IntrinsicElements } from "@builder.io/qwik";
import { storyblokEditable } from "@storyblok/js";
import type { CMSRegisteredComponent } from "../cms-registered-component";
import { useStoryblokURL } from "../utils/url";

type StoryblokLinkTarget = "_self" | "_blank";

interface StoryblokLinkField {
  url?: string;
  cached_url?: string;
  target?: StoryblokLinkTarget;
}

type AnchorProps = Omit<
  IntrinsicElements["a"],
  "href" | "target" | "children" | "class"
>;

interface CMSLinkProps extends AnchorProps {
  href?: StoryblokLinkField;
  label: string;
  target?: StoryblokLinkTarget;
  class?: string;
}

export const CMSLink = component$<CMSLinkProps>((props) => {
  const {
    href,
    label,
    target,
    rel,
    class: className,
    title,
    ...anchorProps
  } = props;

  const actualHref = useStoryblokURL(href as any);
  const resolvedHref = actualHref.value;
  const resolvedTarget = (target ?? href?.target) as StoryblokLinkTarget;
  const isExternalTarget = resolvedTarget === "_blank";
  const resolvedRel =
    rel ?? (isExternalTarget ? "noopener noreferrer" : undefined);
  const resolvedClass = ["anchor", className].filter(Boolean).join(" ");

  if (!resolvedHref) {
    return (
      <span class={className} title={title}>
        {label}
      </span>
    );
  }

  const isInternal =
    resolvedHref.startsWith("/") || resolvedHref.startsWith("#");

  if (isInternal) {
    return (
      <Link
        {...anchorProps}
        class={resolvedClass}
        href={resolvedHref}
        target={resolvedTarget}
        rel={resolvedRel}
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      {...anchorProps}
      class={resolvedClass}
      href={resolvedHref}
      target={resolvedTarget}
      rel={resolvedRel}
    >
      {label}
    </a>
  );
});

interface CMSLinkStoryblokBlok {
  href?: StoryblokLinkField;
  label: string;
  rel?: string;
  target?: StoryblokLinkTarget;
  title?: string;
  class?: string;
}

export const LinkRegistryDefinition: CMSRegisteredComponent = {
  component: component$((blok: CMSLinkStoryblokBlok) => {
    return (
      <CMSLink
        {...storyblokEditable(blok as any)}
        href={blok.href}
        label={blok.label}
        rel={blok.rel}
        target={blok.target}
        title={blok.title}
        class={blok.class}
      />
    );
  }),
  name: "Link",
};

