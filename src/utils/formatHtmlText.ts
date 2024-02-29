export function formatHtmlText(text: string): string {
  return text.split("<a").join('<a target="_blank" class="anchor"');
}
