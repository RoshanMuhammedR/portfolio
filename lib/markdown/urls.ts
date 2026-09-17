/**
 * The URL policy for post bodies.
 *
 * Bodies are authored by the owner, but they are also the one place on the
 * site where text becomes markup, so the rules are written down and applied in
 * one place rather than trusted to the author each time.
 *
 * Links:  http(s), mailto, and site-relative. Everything else - javascript:,
 *         data:, vbscript:, protocol-relative //host - falls through to plain
 *         text.
 * Media:  https, and site-relative (/public or the media bucket). http is not
 *         allowed because it would make a secure page load insecure subresources.
 */

/** `\s` misses the characters a browser also strips before resolving a scheme;
 *  strip them first so `java\0script:` cannot slip past the test below. */
function clean(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0020\u00a0\u2000-\u200d\ufeff]/g, "").trim();
}

function isRelative(value: string): boolean {
  // A single leading slash only: `//evil.example` is a protocol-relative URL.
  return value.startsWith("/") && !value.startsWith("//");
}

export function safeLinkHref(
  href: string | null | undefined,
): string | null {
  if (!href) return null;
  const raw = href.trim();
  const scheme = clean(raw).toLowerCase();

  if (/^https?:\/\//.test(scheme)) return raw;
  if (/^mailto:/.test(scheme)) return raw;
  if (isRelative(raw)) return raw;
  // In-page anchors, which the TOC and footnotes both produce.
  if (raw.startsWith("#")) return raw;
  return null;
}

export function safeMediaSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  const raw = src.trim();
  const scheme = clean(raw).toLowerCase();

  if (/^https:\/\//.test(scheme)) return raw;
  if (isRelative(raw)) return raw;
  return null;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}
