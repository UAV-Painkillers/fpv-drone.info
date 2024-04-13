import { component$, $ } from "@builder.io/qwik";
import { NavLink } from "../nav-link/nav-link";
import { BuilderDataList } from "../builder-data-list/builder-data-list";
import type { BuilderContent } from "@builder.io/sdk-qwik";

const Item = component$((props: { link: BuilderContent }) => {
  const { link } = props;
  return (
    <li
      key={`link-${link.data?.href.Default ?? link.data?.href}-${link.data?.label.Default ?? link.data?.label}`}
    >
      <NavLink
        href={link.data?.href.Default ?? link.data?.href}
        activeClass="active"
      >
        {link.data?.label.Default ?? link.data?.label}
      </NavLink>
    </li>
  );
});

interface Props {
  linkModel: string;
}
export const DynamicLinkList = component$((props: Props) => {
  const renderItem = $((item: BuilderContent) => {
    return <Item link={item} />;
  });
  return (
    <ul>
      <BuilderDataList dataModelName={props.linkModel} item={renderItem} />
    </ul>
  );
});
