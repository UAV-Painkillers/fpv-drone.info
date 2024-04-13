export function formatHtmlText(text?: string): string | undefined {
  return text?.split("<a").join('<a target="_blank" class="anchor"');
}
