/* Preserve old /privacy/#en bookmarks. Local navigation, no storage or analytics. */
(() => {
  "use strict";
  const lang = window.location.hash.slice(1);
  if (!["en", "es", "de", "fr", "pt"].includes(lang)) return;
  const base = new URL(window.location.href);
  base.hash = "";
  base.search = "";
  if (base.pathname.endsWith("/index.html")) base.pathname = base.pathname.slice(0, -10);
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  window.location.replace(new URL(`${lang}/`, base).href);
})();
