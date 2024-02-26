export function formatHtmlText(text: string): string {
  return text.replace('<a', '<a target="_blank" class="anchor"');
}