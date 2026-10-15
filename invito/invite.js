/* Version 1.0: language selection only. No app links, code copying, network,
   cookies, storage or analytics. Old c/g/n parameters are ignored. */
(() => {
  "use strict";
  const messages = {
  "it": {
    "page": "Il tuo giardino",
    "language": "Lingua"
  },
  "en": {
    "page": "Your garden",
    "language": "Language"
  },
  "es": {
    "page": "Tu jardín",
    "language": "Idioma"
  },
  "de": {
    "page": "Dein Garten",
    "language": "Sprache"
  },
  "fr": {
    "page": "Ton jardin",
    "language": "Langue"
  },
  "pt": {
    "page": "Seu jardim",
    "language": "Idioma"
  }
};
  const languages = Object.keys(messages);
  function supportedLanguage(value) {
    const base = String(value || "").toLowerCase().split(/[-_]/)[0];
    return languages.includes(base) ? base : null;
  }
  function browserLanguage() {
    for (const value of [...(navigator.languages || []), navigator.language]) {
      const lang = supportedLanguage(value);
      if (lang) return lang;
    }
    return "en";
  }
  function render() {
    const hash = window.location.hash.slice(1);
    const hashLanguage = languages.includes(hash) ? hash : null;
    // Preserve old anchor bookmarks and prefer fragment language to query language.
    const anchorLanguage = /^(?:title|visit|code|hint|status)-(it|en|es|de|fr|pt)$/.exec(hash);
    const source = hash && !hashLanguage && !anchorLanguage ? hash : window.location.search.slice(1);
    let requestedLanguage = hashLanguage || (anchorLanguage && anchorLanguage[1]);
    if (!requestedLanguage && source.length <= 2048 && !/%(?![0-9a-f]{2})/i.test(source)) {
      const params = new URLSearchParams(source);
      if (params.getAll("lang").length === 1) requestedLanguage = supportedLanguage(params.get("lang"));
    }
    const current = requestedLanguage || browserLanguage();
    document.documentElement.lang = current === "pt" ? "pt-BR" : current;
    document.title = `Grow Your Life · ${messages[current].page}`;
    document.querySelector("nav.lang").setAttribute("aria-label", messages[current].language);
    for (const lang of languages) {
      document.getElementById(lang).hidden = lang !== current;
      const link = document.querySelector(`[data-language="${lang}"]`);
      link.href = `#${lang}`;
      if (lang === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }
  window.addEventListener("hashchange", render);
  render();
})();
