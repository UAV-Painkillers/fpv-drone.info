import { component$ } from "@builder.io/qwik";
import { useDocumentHead } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();

  return (
    <>
      <title>{head.title}</title>

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}

      {/* GENERATED AUTOMATICALLY DO NOT TOUCH */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/icons/apple-touch-icon.png?v=7"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png?v=7"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png?v=7"
      />
      <link rel="manifest" href="/icons/site.webmanifest?v=7" />
      <link rel="mask-icon" href="/icons/safari-pinned-tab.svg?v=7" />
      <link rel="shortcut icon" href="/icons/favicon.ico?v=7" />
      <meta name="apple-mobile-web-app-title" content="fpv-drone.info" />
      <meta name="application-name" content="fpv-drone.info" />
      <meta name="msapplication-TileColor" content="#2b5797" />
      <meta
        name="msapplication-config"
        content="/icons/browserconfig.xml?v=7"
      />
      <meta name="theme-color" content="#ffffff" />
      {/* END OF AUTOGENERATED CONTENT */}
    </>
  );
});
