/**
 * Decodes HTML entities in a string
 * Converts things like &gt; to >, &amp; to &, etc.
 * @param {string} html - String potentially containing HTML entities
 * @returns {string} Decoded string
 */
export function decodeHtml(html) {
  if (!html) return html;

  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
