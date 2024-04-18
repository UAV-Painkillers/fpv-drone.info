import {
  Slot,
  component$,
} from "@builder.io/qwik";
import { Link, type LinkProps } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string };

export const NavLink = component$((props: NavLinkProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeClass, ...elProps } = props;

  return (
    <Link
      {...elProps}
      class={`${elProps.class || ""} anchor`}
    >
      <Slot />
    </Link>
  );
});
