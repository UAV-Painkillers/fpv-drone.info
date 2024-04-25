export function changeLanguageInURLPathname(
  pathname: string,
  currentLang: string,
  targetLang: string,
) {
  let pathnameWithChangedLang = pathname;
  if (pathnameWithChangedLang.startsWith(`/${currentLang}/`)) {
    pathnameWithChangedLang = pathnameWithChangedLang.replace(
      `/${currentLang}/`,
      "",
    );
  }

  return `/${targetLang}/${pathnameWithChangedLang}`;
}
