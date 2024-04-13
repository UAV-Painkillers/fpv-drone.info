import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation, type LinkProps } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string };

function normalizePathname(pathname: string) {
  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === "//") {
    pathname = "/";
  }

  return pathname;
}

export const NavLink = component$(({ activeClass, ...props }: NavLinkProps) => {
  const location = useLocation();
  const toPathname = normalizePathname(props.href ?? "");
  const locationPathname = normalizePathname(location.url.pathname);

  const isActive = locationPathname === toPathname;

  return (
    <Link
      {...props}
      class={`${props.class || ""} ${isActive ? activeClass : ""} anchor`}
    >
      <Slot />
    </Link>
  );
});
