import { Resource, component$, useResource$ } from "@builder.io/qwik";
import { getAllContent } from "@builder.io/sdk-qwik";
import { NavLink } from "../nav-link/nav-link";

interface LinkDocument {
  data: {
    label: {
      Default: string;
    };
    href: {
      Default: string;
    };
    order: number;
  };
}

interface Props {
  linkModel: string;
}
export const DynamicLinkList = component$((props: Props) => {
  const linksResource = useResource$(() =>
    getAllContent({
      model: props.linkModel,
      apiKey: import.meta.env.PUBLIC_BUILDER_API_KEY,
    }).then((links) => {
      (links as { results: LinkDocument[] }).results.sort(
        (a, b) => a.data.order - b.data.order,
      );
      return links;
    }),
  );

  return (
    <Resource
      value={linksResource}
      onRejected={(error) => <>Error: {error.message}</>}
      onResolved={(links) => (
        <ul>
          {(links as { results: LinkDocument[] }).results.map((link) => (
            <li
              key={`link-${link.data.href.Default}-${link.data.label.Default}`}
            >
              <NavLink href={link.data.href.Default} activeClass="active">
                {link.data.label.Default}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    />
  );
});
