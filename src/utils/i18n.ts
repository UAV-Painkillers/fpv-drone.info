import path from "path";

export function changeLanguageInURLPathname(
  pathname: string,
  currentLang: string,
  targetLang: string,
) {
  if (!targetLang) {
    console.warn("No targetLang provided");
    return pathname;
  }

  let pathnameWithChangedLang = pathname;
  if (pathnameWithChangedLang.startsWith(`/${currentLang}/`)) {
    pathnameWithChangedLang = pathnameWithChangedLang.replace(
      `/${currentLang}/`,
      "",
    );
  }

  if (!pathnameWithChangedLang || pathnameWithChangedLang === "/") {
    return `/${targetLang}`;
  }

  if (pathnameWithChangedLang.startsWith("/")) {
    pathnameWithChangedLang = pathnameWithChangedLang.slice(1);
  }

  return `/${targetLang}/${pathnameWithChangedLang}`;
}
