import { component$, $, useComputed$ } from "@builder.io/qwik";
import { NavLink } from "../nav-link/nav-link";
import type { SbBlokData } from "@storyblok/js";
import { storyblokEditable, type ISbStoryData } from "@storyblok/js";
import { CMSItemsList } from "../cms-items-list/cms-items-list";

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

  const url = useComputed$(() => {
    let actualUrl = link.href.url || link.href.cached_url;
    if (!actualUrl.startsWith('/')) {
      actualUrl = '/' + actualUrl;
    }

    return actualUrl;
  });

  return (
    <li
      key={`link-${url.value}-${link.label}`}
      style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
      {...storyblokEditable(link as any)}
    >
      <NavLink href={url.value} activeClass="active">
        {link.label}
      </NavLink>
    </li>
  );
});

interface Props {
  navigationStorySlug: string;
}
export const DynamicLinkList = component$((props: Props) => {
  const renderItem = $((item: LinkItem) => {
    return <Item link={item} />;
  });

  const render = $((itemsList: ISbStoryData) => {
    return (
      <ul {...storyblokEditable(itemsList as unknown as SbBlokData)}>
        {itemsList.content.items.map((item: LinkItem) => (
          <>{renderItem(item)}</>
        ))}
      </ul>
    );
  });

  return (
    <ul>
      <CMSItemsList
        itemsListStorySlug={props.navigationStorySlug}
        render={render}
      />
    </ul>
  );
});
