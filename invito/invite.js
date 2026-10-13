/* The fragment stays in the browser. No network requests, storage or analytics. */
(() => {
  "use strict";
  const messages = {
    it: {
      missing: "In questo link manca il codice. Chiedi a chi ti ha invitato di inviarti il link completo o il codice scritto. Puoi comunque installare l’app.",
      invalid: "Il codice nel link sembra incompleto o scritto male. Chiedi a chi ti ha invitato di inviarlo di nuovo. Puoi comunque installare l’app.",
      copied: "Codice copiato. Puoi incollarlo nell’app.",
      manual: "Tieni premuto sul codice selezionato e scegli Copia."
    },
    en: {
      missing: "This link has no code. Ask the person who invited you for the complete link or the code as text. You can still install the app.",
      invalid: "The code in this link seems incomplete or mistyped. Ask the person who invited you to send it again. You can still install the app.",
      copied: "Code copied. You can paste it in the app.",
      manual: "Touch and hold the selected code and choose Copy."
    }
  };
  let currentCode = "";

  function render() {
    const hash = window.location.hash;
    // Old fragment links and the new query form both work. Never combine
    // untrusted duplicate fields from different sources.
    const source = hash && hash !== "#it" && hash !== "#en" ? hash.slice(1) : (window.location.search || "").slice(1);
    let state = source ? "invalid" : "missing";
    let code = "", garden = "", name = "";
    let params = new URLSearchParams();
    if (source.length <= 2048 && !/%(?![0-9a-f]{2})/i.test(source)) {
      const parsed = new URLSearchParams(source);
      const keys = Array.from(parsed.keys());
      const validKeys = keys.every(key => ["c", "g", "n", "lang"].includes(key)) && new Set(keys).size === keys.length;
      const raw = parsed.get("c");
      const normalized = raw === null ? "" : raw.replace(/[\s-]/g, "");
      const rawGarden = parsed.get("g"), rawName = parsed.get("n");
      const validCode = raw === null || (raw.length <= 80 && /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$/i.test(normalized));
      const validGarden = rawGarden === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(rawGarden);
      const validName = rawName === null || (!!rawGarden && rawName.trim() === rawName && [...rawName].length <= 40 && !/[\u0000-\u001f\u007f-\u009f]/.test(rawName));
      if (validKeys && validCode && validGarden && validName && (raw !== null || rawGarden !== null)) {
        code = normalized ? normalized.toUpperCase().match(/.{4}/g).join("-") : "";
        garden = rawGarden || ""; name = rawName || ""; state = "valid";
        params = parsed;
        if (code) params.set("c", code);
      }
    }
    currentCode = code;
    document.querySelectorAll("[data-open-app]").forEach(node => {
      node.hidden = !code && !garden;
      if (code || garden) {
        const target = new URL("growyourlife://invito");
        if (code) target.searchParams.set("code", code.replace(/-/g, ""));
        if (garden) { target.searchParams.set("g", garden); if (name) target.searchParams.set("n", name); }
        node.href = target.href;
      } else { node.removeAttribute("href"); }
    });
    document.querySelectorAll("[data-valid]").forEach(node => { node.hidden = !code; });
    for (const lang of ["it", "en"]) {
      document.getElementById(`title-${lang}`).textContent = garden
        ? (lang === "it" ? (name ? `Visita il giardino di ${name}` : "Visita il giardino di un amico") : (name ? `Visit ${name}’s garden` : "Visit a friend’s garden"))
        : (lang === "it" ? "Un invito a far crescere il tuo giardino" : "An invitation to grow your garden");
      document.getElementById(`visit-${lang}`).hidden = !garden;
      document.getElementById(`code-${lang}`).value = code;
      document.getElementById(`status-${lang}`).textContent = "";
      const fallback = document.querySelector(`[data-fallback="${lang}"]`);
      fallback.hidden = !!code || !!garden;
      fallback.textContent = code || garden ? "" : messages[lang][state];
      const localized = new URLSearchParams(params);
      localized.set("lang", lang);
      document.querySelector(`[data-language="${lang}"]`).href = code || garden ? `#${localized}` : `#${lang}`;
    }
    const lang = params.get("lang");
    if ((code || garden) && (lang === "it" || lang === "en")) document.getElementById(lang).scrollIntoView();
  }

  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const code = currentCode;
      if (!code) return;
      const lang = button.dataset.copy;
      const field = document.getElementById(`code-${lang}`);
      const status = document.getElementById(`status-${lang}`);
      try {
        // Called directly from the tap, as required by iPhone Safari.
        if (!navigator.clipboard || !window.isSecureContext) throw new Error();
        await navigator.clipboard.writeText(code);
        if (code === currentCode) status.textContent = messages[lang].copied;
      } catch (_) {
        if (code !== currentCode) return;
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
