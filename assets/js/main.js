/* ============================================================
   Réglages : clé Web3Forms (réception des candidatures par email)
   et lien Calendly.
   ============================================================ */
const WEB3FORMS_KEY = "090d985b-844a-49b7-96b4-abb08f7dca7a";
const CALENDLY_URL = "https://calendly.com/quentinyo/decouverte";

const SITUATIONS = ["Étudiant", "Salarié", "En alternance", "En intérim", "Indépendant ou entrepreneur", "Autre"];
const PRIORITES = ["Plus de liberté dans mon temps", "Plus de liberté financière", "Prendre confiance en moi", "Plus de liberté de choix", "Aider mes proches", "Voyager et vivre des expériences"];
const TEMPS = ["Moins de 3 h", "3 à 7 h", "7 à 15 h", "Plus de 15 h"];
const CONSEILS = ["L'applique tout de suite", "Prends le temps d'y réfléchir puis tu agis", "As besoin d'être convaincu", "Préfères faire à ta manière"];

const PHASES = [
  { days: "Jours 1 à 30", title: "Fondation", text: "Les habitudes, les compétences et la direction." },
  { days: "Jours 31 à 60", title: "Construire", text: "La correction, la data et de nouveaux domaines." },
  { days: "Jours 61 à 90", title: "Devenir", text: "L'autonomie, les résultats et une nouvelle identité." }
];

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = $("#qg");

  /* ---------- Apparitions au défilement + compteurs ---------- */
  const stats = $("#stats");
  function countUp() {
    const els = $$("b[data-count]", stats);
    const start = performance.now();
    const dur = 1600;
    const fmt = (v) => Math.round(v).toLocaleString("fr-FR");
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const t = 1 - Math.pow(1 - p, 3);
      els.forEach((el) => { el.textContent = el.dataset.before + fmt(+el.dataset.count * t) + el.dataset.after; });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("js-rv");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    $$(".rv", root).forEach((el) => io.observe(el));
    if (stats) {
      $$("b[data-count]", stats).forEach((el) => { el.textContent = el.dataset.before + "0" + el.dataset.after; });
      const io2 = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io2.disconnect(); countUp(); }
      }, { threshold: 0.2 });
      io2.observe(stats);
    }
  }

  /* ---------- La méthode : 3 phases ---------- */
  const nodes = $$(".node[data-phase]");
  function setPhase(i) {
    nodes.forEach((n, k) => {
      n.classList.toggle("on", k === i);
      n.classList.toggle("past", k < i);
      n.setAttribute("aria-pressed", k === i ? "true" : "false");
    });
    $("#track-fill").style.width = (i * 50) + "%";
    $("#phase-num").textContent = "0" + (i + 1);
    $("#phase-days").textContent = PHASES[i].days;
    $("#phase-title").textContent = PHASES[i].title;
    $("#phase-text").textContent = PHASES[i].text;
  }
  nodes.forEach((n) => n.addEventListener("click", () => setPhase(+n.dataset.phase)));

  /* ---------- Onglets ---------- */
  const tabs = $$(".tab[data-tab]");
  function setTab(i) {
    tabs.forEach((t, k) => {
      t.classList.toggle("on", k === i);
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      $("#panel-" + k).hidden = k !== i;
    });
    if (i === 0) requestAnimationFrame(onCarScroll);
  }
  tabs.forEach((t) => t.addEventListener("click", () => setTab(+t.dataset.tab)));

  /* ---------- Carrousel des témoignages ---------- */
  const track = $("#tcar");
  const prog = $("#car-prog");
  let paused = false, dragX = null, dragLeft = 0, dragMoved = false;
  function onCarScroll() {
    if (!track || !track.scrollWidth) return;
    const max = track.scrollWidth - track.clientWidth;
    const vis = track.clientWidth / track.scrollWidth;
    const pos = max > 0 ? track.scrollLeft / max : 0;
    const v = Math.min(1, Math.max(0, vis + (1 - vis) * pos));
    prog.style.width = Math.round(v * 100) + "%";
  }
  function scrollCar(dir) {
    const card = $(".tcard", track);
    const step = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.85;
    track.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  }
  if (track) {
    track.addEventListener("scroll", onCarScroll, { passive: true });
    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("focusin", () => { paused = true; });
    const leave = () => { paused = false; up(); };
    track.addEventListener("mouseleave", leave);
    track.addEventListener("focusout", leave);
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      dragX = e.clientX; dragLeft = track.scrollLeft; dragMoved = false;
    });
    track.addEventListener("pointermove", (e) => {
      if (dragX == null) return;
      const dx = e.clientX - dragX;
      if (!dragMoved && Math.abs(dx) > 4) { dragMoved = true; track.classList.add("drag"); }
      if (dragMoved) track.scrollLeft = dragLeft - dx;
    });
    function up() { if (dragX == null) return; dragX = null; track.classList.remove("drag"); }
    track.addEventListener("pointerup", up);
    $("#car-prev").addEventListener("click", () => scrollCar(-1));
    $("#car-next").addEventListener("click", () => scrollCar(1));
    window.addEventListener("resize", onCarScroll);
    requestAnimationFrame(onCarScroll);
    if (!reduce) {
      setInterval(() => {
        if (paused || dragX != null || track.offsetParent === null) return;
        const r = track.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) track.scrollTo({ left: 0, behavior: "smooth" });
        else scrollCar(1);
      }, 4500);
    }
  }

  /* ---------- Questionnaire ---------- */
  const s = { step: 0, situation: null, priorites: [], temps: null, conseil: null };
  const LISTS = { situation: SITUATIONS, priorites: PRIORITES, temps: TEMPS, conseil: CONSEILS };
  const TICK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="#0A0D0F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const errEl = $("#qz-err");
  function setError(msg) { errEl.textContent = msg; errEl.hidden = !msg; }

  $$(".qz-opts[data-key]").forEach((box) => {
    const key = box.dataset.key;
    const multi = box.dataset.mode === "multi";
    LISTS[key].forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "qz-choice";
      b.setAttribute("aria-pressed", "false");
      const t = document.createElement("span"); t.textContent = label;
      const tick = document.createElement("span"); tick.className = "tick" + (multi ? " sq" : ""); tick.innerHTML = TICK;
      b.append(t, tick);
      b.addEventListener("click", () => {
        if (multi) {
          const i = s[key].indexOf(label);
          if (i === -1) s[key].push(label); else s[key].splice(i, 1);
        } else {
          s[key] = label;
        }
        $$(".qz-choice", box).forEach((x) => {
          const v = x.firstChild.textContent;
          const on = multi ? s[key].indexOf(v) !== -1 : s[key] === v;
          x.classList.toggle("on", on);
          x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        setError("");
      });
      box.appendChild(b);
    });
  });

  const cout = $("#qz-cout");
  const count = $("#qz-count");
  cout.addEventListener("input", () => {
    const n = cout.value.trim().length;
    count.textContent = n < 20 ? n + " / 20 caractères minimum" : n + " caractères";
    setError("");
  });
  $$("#qz-prenom, #qz-email, #qz-wa, #qz-ig, #qz-consent").forEach((el) => el.addEventListener("input", () => setError("")));

  function validate(step) {
    if (step === 0 && !s.situation) return "Choisis une réponse pour continuer.";
    if (step === 1 && s.priorites.length === 0) return "Choisis au moins une priorité.";
    if (step === 2 && cout.value.trim().length < 20) return "Écris au moins 20 caractères : prends le temps d'y répondre vraiment.";
    if (step === 3 && !s.temps) return "Choisis une réponse pour continuer.";
    if (step === 4 && !s.conseil) return "Choisis une réponse pour continuer.";
    if (step === 5) {
      if (!$("#qz-prenom").value.trim()) return "Indique ton prénom.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#qz-email").value.trim())) return "Vérifie ton adresse email.";
      if (!$("#qz-consent").checked) return "Coche la case pour envoyer ta candidature.";
    }
    return "";
  }

  function showStep(n) {
    s.step = n;
    $$(".qz-step").forEach((el) => { el.hidden = +el.dataset.step !== n; });
    $("#qz-label").textContent = (n + 1) + " / 6";
    $("#qz-fill").style.width = Math.round(((n + 1) / 6) * 100) + "%";
    $("#qz-back").hidden = n === 0;
    $("#qz-next").hidden = n === 5;
    $("#qz-submit").hidden = n !== 5;
    setError("");
  }

  $("#qz-next").addEventListener("click", () => {
    const err = validate(s.step);
    if (err) { setError(err); return; }
    showStep(s.step + 1);
  });
  $("#qz-back").addEventListener("click", () => showStep(Math.max(0, s.step - 1)));

  function loadCalendly(prenom, email) {
    const link = CALENDLY_URL + "?name=" + encodeURIComponent(prenom) + "&email=" + encodeURIComponent(email);
    const url = link + "&hide_gdpr_banner=1";
    $("#cal-link").href = link;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
    const sc = document.createElement("script");
    sc.src = "https://assets.calendly.com/assets/external/widget.js";
    sc.async = true;
    sc.onload = () => {
      if (!window.Calendly) return;
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: $("#cal-embed"),
        prefill: { name: prenom, email: email }
      });
    };
    document.body.appendChild(sc);
  }

  $("#qz-submit").addEventListener("click", () => {
    const err = validate(5);
    if (err) { setError(err); return; }
    const prenom = $("#qz-prenom").value.trim();
    const email = $("#qz-email").value.trim();
    const qualifie = !(s.temps === "Moins de 3 h" || s.conseil === "Préfères faire à ta manière");
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => { if (params.get(k)) utm[k] = params.get(k); });
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: (qualifie ? "✅ Profil retenu : " : "🕓 À recontacter : ") + prenom,
      from_name: "Site gquentin.com",
      replyto: email,
      "Profil retenu": qualifie ? "Oui (Calendly proposé)" : "Non (à recontacter personnellement)",
      "Prénom": prenom,
      "Email": email,
      "WhatsApp": $("#qz-wa").value.trim() || "—",
      "Instagram": $("#qz-ig").value.trim() || "—",
      "1. Situation": s.situation,
      "2. Priorités": s.priorites.join(", "),
      "3. Si rien ne change, ça lui coûte": cout.value.trim(),
      "4. Temps par semaine": s.temps,
      "5. Face à un conseil": s.conseil,
      "Consentement RGPD": "Oui",
      "Source": [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ") || "directe"
    };
    if (WEB3FORMS_KEY) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      })
        .then((r) => r.json())
        .then((d) => { if (!d.success) console.error("Envoi de la candidature refusé", d); })
        .catch((e) => console.error("Envoi de la candidature impossible", e));
    } else {
      console.error("WEB3FORMS_KEY vide : candidature non transmise", payload);
    }
    $("#qz-form").hidden = true;
    if (qualifie) { $("#qz-yes").hidden = false; loadCalendly(prenom, email); }
    else { $("#qz-no").hidden = false; }
    $("#qz").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
})();
