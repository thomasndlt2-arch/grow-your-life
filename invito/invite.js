/* Local link handling only: no network requests, cookies, storage or analytics. */
(() => {
  "use strict";
  const messages = {
  "it": {
    "page": "Un invito",
    "title": "Un invito a far crescere il tuo giardino",
    "garden": "Visita un giardino",
    "missing": "In questo link manca il codice. Chiedi a chi ti ha invitato di inviarti il link completo o il codice scritto. Puoi comunque installare l’app quando sarà disponibile.",
    "invalid": "Il link sembra incompleto o scritto male. Chiedi a chi te lo ha mandato di inviarlo di nuovo. Puoi comunque installare l’app quando sarà disponibile.",
    "copied": "Codice copiato. Puoi incollarlo nell’app.",
    "manual": "Tieni premuto sul codice selezionato e scegli Copia.",
    "language": "Lingua"
  },
  "en": {
    "page": "An invitation",
    "title": "An invitation to grow your garden",
    "garden": "Visit a garden",
    "missing": "This link has no code. Ask the person who invited you for the complete link or the code as text. You can still install the app when it becomes available.",
    "invalid": "This link seems incomplete or mistyped. Ask the person who sent it to send it again. You can still install the app when it becomes available.",
    "copied": "Code copied. You can paste it in the app.",
    "manual": "Touch and hold the selected code and choose Copy.",
    "language": "Language"
  },
  "es": {
    "page": "Una invitación",
    "title": "Una invitación para hacer crecer tu jardín",
    "garden": "Visita un jardín",
    "missing": "Este enlace no tiene código. Pide a quien te invitó el enlace completo o el código por escrito. Podrás instalar la app cuando esté disponible.",
    "invalid": "El enlace parece incompleto o incorrecto. Pide que te lo envíen de nuevo. Podrás instalar la app cuando esté disponible.",
    "copied": "Código copiado. Puedes pegarlo en la app.",
    "manual": "Mantén pulsado el código seleccionado y elige Copiar.",
    "language": "Idioma"
  },
  "de": {
    "page": "Eine Einladung",
    "title": "Eine Einladung, deinen Garten wachsen zu lassen",
    "garden": "Besuche einen Garten",
    "missing": "Dieser Link enthält keinen Code. Bitte die einladende Person um den vollständigen Link oder den ausgeschriebenen Code. Du kannst die App installieren, sobald sie verfügbar ist.",
    "invalid": "Der Link scheint unvollständig oder fehlerhaft zu sein. Bitte darum, ihn erneut zu senden. Du kannst die App installieren, sobald sie verfügbar ist.",
    "copied": "Code kopiert. Du kannst ihn in der App einfügen.",
    "manual": "Halte den ausgewählten Code gedrückt und wähle Kopieren.",
    "language": "Sprache"
  },
  "fr": {
    "page": "Une invitation",
    "title": "Une invitation à faire grandir ton jardin",
    "garden": "Visite un jardin",
    "missing": "Ce lien ne contient pas de code. Demande à la personne qui t’a invité le lien complet ou le code écrit. Tu pourras installer l’app dès sa disponibilité.",
    "invalid": "Le lien semble incomplet ou incorrect. Demande à la personne de te le renvoyer. Tu pourras installer l’app dès sa disponibilité.",
    "copied": "Code copié. Tu peux le coller dans l’app.",
    "manual": "Appuie longuement sur le code sélectionné et choisis Copier.",
    "language": "Langue"
  },
  "pt": {
    "page": "Um convite",
    "title": "Um convite para fazer seu jardim crescer",
    "garden": "Visite um jardim",
    "missing": "Este link não tem código. Peça o link completo ou o código por escrito a quem convidou você. Você poderá instalar o app quando estiver disponível.",
    "invalid": "O link parece incompleto ou incorreto. Peça para a pessoa enviá-lo novamente. Você poderá instalar o app quando estiver disponível.",
    "copied": "Código copiado. Você pode colar no app.",
    "manual": "Toque e segure o código selecionado e escolha Copiar.",
    "language": "Idioma"
  }
};
  const languages = Object.keys(messages);
  let currentCode = "";
  let currentLanguage = "it";

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
    const hash = window.location.hash;
    const hashLanguage = languages.includes(hash.slice(1)) ? hash.slice(1) : null;
    // Fragment data takes precedence over legacy query data. Never merge them.
    const source = hash && !hashLanguage ? hash.slice(1) : (window.location.search || "").slice(1);
    let state = source ? "invalid" : "missing";
    let code = "", garden = "", requestedLanguage = hashLanguage;
    if (source.length <= 2048 && !/%(?![0-9a-f]{2})/i.test(source)) {
      const parsed = new URLSearchParams(source);
      const keys = Array.from(parsed.keys());
      const validKeys = keys.every(key => ["c", "g", "n", "lang"].includes(key)) && new Set(keys).size === keys.length;
      const raw = parsed.get("c");
      const normalized = raw === null ? "" : raw.replace(/[\s-]/g, "");
      const rawGarden = parsed.get("g"), rawName = parsed.get("n");
      const validCode = raw === null || (raw.length <= 80 && /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$/i.test(normalized));
      const validGarden = rawGarden === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawGarden);
      // Validate the old field for compatibility, but never display or forward it.
      const validName = rawName === null || (!!rawGarden && rawName.trim() === rawName && [...rawName].length <= 40 && !/[\u0000-\u001f\u007f-\u009f]/.test(rawName));
      if (parsed.getAll("lang").length === 1 && !hashLanguage) {
        requestedLanguage = supportedLanguage(parsed.get("lang"));
      }
      if (validKeys && validCode && validGarden && validName && (raw !== null || rawGarden !== null)) {
        code = normalized ? normalized.toUpperCase().match(/.{4}/g).join("-") : "";
        garden = (rawGarden || "").toLowerCase();
        state = "valid";
      } else if (validKeys && keys.length === 1 && keys[0] === "lang") {
        state = "missing";
      }
    }
    currentCode = code;
    currentLanguage = requestedLanguage || browserLanguage();
    document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : currentLanguage;
    document.title = `Grow Your Life · ${messages[currentLanguage].page}`;
    document.querySelector("nav.lang").setAttribute("aria-label", messages[currentLanguage].language);
    document.querySelectorAll("[data-open-app]").forEach(node => {
      node.hidden = !code && !garden;
      if (code || garden) {
        const target = new URL("growyourlife://invito");
        if (code) target.searchParams.set("code", code.replace(/-/g, ""));
        if (garden) target.searchParams.set("g", garden);
        node.href = target.href;
      } else {
        node.removeAttribute("href");
      }
    });
    document.querySelectorAll("[data-valid]").forEach(node => { node.hidden = !code; });
    for (const lang of languages) {
      document.getElementById(lang).hidden = lang !== currentLanguage;
      document.getElementById(`title-${lang}`).textContent = messages[lang][garden ? "garden" : "title"];
      document.getElementById(`visit-${lang}`).hidden = !garden;
      document.getElementById(`code-${lang}`).value = code;
      document.getElementById(`status-${lang}`).textContent = "";
      const fallback = document.querySelector(`[data-fallback="${lang}"]`);
      fallback.hidden = !!code || !!garden;
      fallback.textContent = code || garden ? "" : messages[lang][state];
      const localized = new URLSearchParams();
      if (code) localized.set("c", code);
      if (garden) localized.set("g", garden);
      // Keep an invalid-link explanation when changing language; carry no unsafe input.
      if (state === "invalid") localized.set("c", "");
      localized.set("lang", lang);
      const link = document.querySelector(`[data-language="${lang}"]`);
      link.href = code || garden || state === "invalid" ? `#${localized}` : `#${lang}`;
      if (lang === currentLanguage) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const code = currentCode;
      if (!code) return;
      const lang = button.dataset.copy;
      const field = document.getElementById(`code-${lang}`);
      const status = document.getElementById(`status-${lang}`);
      try {
        // Clipboard access remains inside the explicit tap, including in iPhone Safari.
        if (!navigator.clipboard || !window.isSecureContext) throw new Error();
        await navigator.clipboard.writeText(code);
        if (code === currentCode && lang === currentLanguage) status.textContent = messages[lang].copied;
      } catch (_) {
        if (code !== currentCode || lang !== currentLanguage) return;
        field.focus();
        field.select();
        field.setSelectionRange(0, field.value.length);
        status.textContent = messages[lang].manual;
      }
    });
  });
  window.addEventListener("hashchange", render);
  render();
})();
