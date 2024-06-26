import type { IntrinsicElements } from "@builder.io/qwik";
import { component$, $ } from "@builder.io/qwik";
import { NavLink } from "../nav-link/nav-link";
import type { SbBlokData } from "@storyblok/js";
import { storyblokEditable, type ISbStoryData } from "@storyblok/js";
import { CMSItemsList } from "../cms-items-list/cms-items-list";
import { useStoryblokURL } from "../utils/url";

interface LinkItem {
  href: {
    url: string;
    cached_url: string;
  };
  label: string;
}

interface ItemProps {
  link: LinkItem;
}
const Item = component$((props: ItemProps) => {
  const { link } = props;

  const actualURL = useStoryblokURL(link.href);

  return (
    <li
      key={`link-${actualURL.value}-${link.label}`}
      style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
      {...storyblokEditable(link as any)}
    >
      <NavLink href={actualURL.value!} activeClass="active">
        {link.label}
      </NavLink>
    </li>
  );
});

interface Props {
  navigationStorySlug: string;
}
export const DynamicLinkList = component$(
  (props: Props & IntrinsicElements["ul"]) => {
    const renderItem = $((item: LinkItem) => {
      return <Item link={item} />;
    });

    const render = $((itemsList: ISbStoryData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { navigationStorySlug, ...ulProps } = props;
      return (
        <ul
          {...ulProps}
          {...storyblokEditable(itemsList as unknown as SbBlokData)}
        >
          {itemsList.content.items.map((item: LinkItem) => (
            <>{renderItem(item)}</>
          ))}
        </ul>
      );
    });

    return (
      <CMSItemsList
        itemsListStorySlug={props.navigationStorySlug}
        render={render}
      />
    );
  },
);
