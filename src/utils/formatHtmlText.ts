import {load as loadXML} from "cheerio";

export function formatHtmlText(text?: string): string | undefined {
  if (!text) {
    return text;
  }
  
  const $ = loadXML(text);
  const hasClassAttribute = !!$('a').attr('class');
  if (!hasClassAttribute) {
    $('a').addClass('anchor');
  }

  $('a').attr('target', '_blank');

  return $.html();
}
