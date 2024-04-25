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

  return `/${targetLang}/${pathnameWithChangedLang}`;
}
