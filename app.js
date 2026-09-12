/**
 * Zelda Progression Tracker
 * Persists checklist state under localStorage key from ZELDA_DATA.storageKey
 */
(function () {
  "use strict";

  const DATA = window.ZELDA_DATA;
  if (!DATA) {
    console.error("ZELDA_DATA missing — load data.js first");
    return;
  }

  const STORAGE_KEY = DATA.storageKey || "zelda-progression-v1";
  const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26 in SVG

  /** @typedef {"todo"|"in-progress"|"done"|"skipped"} Status */

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { games: {} };
      const parsed = JSON.parse(raw);
      return { games: parsed.games || {} };
    } catch {
      return { games: {} };
    }
  }

  function saveState(state) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, games: state.games, updatedAt: Date.now() })
    );
  }

  function getStatus(state, gameId) {
    const s = state.games[gameId];
    if (s && s.status) return s.status;
    return "todo";
  }

  function setStatus(state, gameId, status) {
    if (!state.games[gameId]) state.games[gameId] = {};
    state.games[gameId].status = status;
    saveState(state);
  }

  function heroPathIds() {
    return DATA.phases.flatMap((p) => p.gameIds);
  }

  function computeProgress(state) {
    const ids = heroPathIds();
    let done = 0;
    let inProgress = 0;
    let skipped = 0;
    ids.forEach((id) => {
      const st = getStatus(state, id);
      if (st === "done") done++;
      else if (st === "in-progress") inProgress++;
      else if (st === "skipped") skipped++;
    });
    const total = ids.length;
    const completedWeight = done + skipped; // skipped counts toward "handled"
    const pct = total ? Math.round((completedWeight / total) * 100) : 0;
    return { done, inProgress, skipped, total, pct, remaining: total - completedWeight };
  }

  function importanceLabel(imp) {
    const map = {
      essential: "Essential",
      "essential-ish": "Essential-ish",
      play: "Play",
      recommended: "Recommended",
      optional: "Optional",
      skip: "Skip",
      waiting: "Waiting",
    };
    return map[imp] || imp;
  }

  function importanceChipClass(imp) {
    return "chip chip-" + (imp === "essential-ish" ? "essential-ish" : imp);
  }

  function coverFallbackHtml(title) {
    return (
      '<div class="cover-fallback" aria-hidden="true">' +
      '<svg viewBox="0 0 100 90" width="48" height="42">' +
      '<polygon points="50,5 65,32 35,32" fill="#D4AF37"/>' +
      '<polygon points="20,58 35,85 5,85" fill="#D4AF37"/>' +
      '<polygon points="80,58 95,85 65,85" fill="#D4AF37"/>' +
      "</svg>" +
      "<span>" +
      escapeHtml(title) +
      "</span></div>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGameCard(game, state) {
    const status = getStatus(state, game.id);
    const blockedClass = game.blocked ? " blocked" : "";
    const coverSrc = game.cover || "";
    const hasCover = Boolean(coverSrc);

    const waitHtml = game.waitBadge
      ? '<span class="wait-ribbon">' + escapeHtml(game.waitLabel || "WAIT") + "</span>"
      : "";

    const orderHtml =
      game.order <= 10
        ? '<span class="order-badge" aria-hidden="true">' + game.order + "</span>"
        : "";

    const imgHtml = hasCover
      ? '<img src="' +
        escapeHtml(coverSrc) +
        '" alt="' +
        escapeHtml(game.alt || game.title) +
        '" loading="lazy" width="300" height="400" onerror="this.parentElement.classList.add(\'failed\')">'
      : "";

    const coverFailedClass = hasCover ? "" : " failed";

    const importance = game.blocked && game.importance === "essential" ? "waiting" : game.importance;
    const impChip =
      '<span class="' +
      importanceChipClass(importance) +
      '">' +
      escapeHtml(importanceLabel(importance)) +
      "</span>";

    const statuses = [
      { val: "todo", label: "To do" },
      { val: "in-progress", label: "In progress" },
      { val: "done", label: "Done" },
      { val: "skipped", label: "Skipped" },
    ];

    const radios = statuses
      .map((s) => {
        const checked = status === s.val ? " checked" : "";
        const id = "st-" + game.id + "-" + s.val;
        return (
          '<label data-val="' +
          s.val +
          '" for="' +
          id +
          '">' +
          '<input type="radio" name="status-' +
          escapeHtml(game.id) +
          '" id="' +
          id +
          '" value="' +
          s.val +
          '"' +
          checked +
          ">" +
          escapeHtml(s.label) +
          "</label>"
        );
      })
      .join("");

    return (
      '<article class="game-card' +
      blockedClass +
      '" data-game-id="' +
      escapeHtml(game.id) +
      '" data-status="' +
      escapeHtml(status) +
      '">' +
      '<div class="cover-wrap' +
      coverFailedClass +
      '">' +
      orderHtml +
      waitHtml +
      imgHtml +
      coverFallbackHtml(game.shortTitle || game.title) +
      "</div>" +
      '<div class="card-body">' +
      '<h3 class="card-title">' +
      escapeHtml(game.title) +
      "</h3>" +
      '<div class="chip-row">' +
      '<span class="chip chip-platform">' +
      escapeHtml(game.platform) +
      "</span>" +
      impChip +
      "</div>" +
      '<p class="version-note">' +
      escapeHtml(game.versionNote) +
      "</p>" +
      '<fieldset class="status-fieldset">' +
      '<legend>Progress</legend>' +
      '<div class="status-options">' +
      radios +
      "</div></fieldset>" +
      '<details class="why-details">' +
      "<summary>Why this entry</summary>" +
      "<p>" +
      escapeHtml(game.why) +
      "</p>" +
      (game.chronology
        ? '<p><em>Chronology: ' + escapeHtml(game.chronology) + "</em></p>"
        : "") +
      "</details>" +
      "</div></article>"
    );
  }

  function renderPhases(state) {
    const root = document.getElementById("path-sections");
    if (!root) return;
    root.innerHTML = DATA.phases
      .map((phase) => {
        const cards = phase.gameIds
          .map((id) => DATA.games[id])
          .filter(Boolean)
          .map((g) => renderGameCard(g, state))
          .join("");
        return (
          '<section class="phase" id="' +
          escapeHtml(phase.id) +
          '" aria-labelledby="' +
          escapeHtml(phase.id) +
          '-title">' +
          '<div class="section-head">' +
          '<span class="phase-num">' +
          escapeHtml(phase.id.replace("-", " ")) +
          "</span>" +
          '<h2 id="' +
          escapeHtml(phase.id) +
          '-title">' +
          escapeHtml(phase.title) +
          "</h2></div>" +
          '<p class="section-sub">' +
          escapeHtml(phase.subtitle) +
          "</p>" +
          '<div class="game-grid hero-path">' +
          cards +
          "</div></section>"
        );
      })
      .join("");
  }

  function renderOptional(state) {
    const root = document.getElementById("optional-grid");
    if (!root) return;
    const sec = DATA.optionalSection;
    root.innerHTML = sec.gameIds
      .map((id) => DATA.games[id])
      .filter(Boolean)
      .map((g) => renderGameCard(g, state))
      .join("");
  }

  function renderTimeline() {
    const trunk = document.getElementById("timeline-trunk");
    const branches = document.getElementById("timeline-branches");
    const future = document.getElementById("timeline-future");
    const why = document.getElementById("why-not-pure");
    if (!trunk || !DATA.chronology) return;

    const c = DATA.chronology;
    trunk.innerHTML = c.trunk
      .map((node, i) => {
        const conn =
          i < c.trunk.length - 1 ? '<div class="tl-connector" aria-hidden="true"></div>' : "";
        return (
          '<div class="tl-node"><div class="tl-label">' +
          escapeHtml(node.label) +
          '</div><div class="tl-note">' +
          escapeHtml(node.note) +
          "</div></div>" +
          conn
        );
      })
      .join("");

    branches.innerHTML = c.branches
      .map((b) => {
        const items = b.games.map((g) => "<li>" + escapeHtml(g) + "</li>").join("");
        return (
          '<div class="tl-branch" style="--branch-color:' +
          escapeHtml(b.color) +
          '"><h3>' +
          escapeHtml(b.title) +
          "</h3><ul>" +
          items +
          "</ul></div>"
        );
      })
      .join("");

    future.innerHTML =
      '<div class="tl-connector" aria-hidden="true"></div>' +
      c.farFuture
        .map((node, i) => {
          const conn =
            i < c.farFuture.length - 1
              ? '<div class="tl-connector" aria-hidden="true"></div>'
              : "";
          return (
            '<div class="tl-node"><div class="tl-label">' +
            escapeHtml(node.label) +
            '</div><div class="tl-note">' +
            escapeHtml(node.note) +
            "</div></div>" +
            conn
          );
        })
        .join("");

    if (why) {
      why.innerHTML =
        "<strong>Why not pure timeline order?</strong>" + escapeHtml(c.whyNotPure);
    }
  }

  function renderConnections() {
    const root = document.getElementById("connections-grid");
    if (!root) return;
    root.innerHTML = DATA.connections
      .map((c) => {
        return (
          '<article class="conn-card">' +
          '<p class="conn-pair">' +
          escapeHtml(c.pair.join(" → ")) +
          "</p>" +
          '<p class="conn-rel">' +
          escapeHtml(c.relation) +
          "</p>" +
          '<p class="conn-tip">' +
          escapeHtml(c.tip) +
          "</p></article>"
        );
      })
      .join("");
  }

  function updateProgressUI(state) {
    const p = computeProgress(state);
    const pctEl = document.getElementById("progress-pct");
    const fill = document.getElementById("progress-ring-fill");
    const bar = document.getElementById("progress-bar-fill");
    const meta = document.getElementById("progress-detail");

    if (pctEl) pctEl.textContent = p.pct + "%";
    if (fill) {
      const offset = CIRCUMFERENCE * (1 - p.pct / 100);
      fill.style.strokeDasharray = String(CIRCUMFERENCE);
      fill.style.strokeDashoffset = String(offset);
    }
    if (bar) bar.style.width = p.pct + "%";
    if (meta) {
      meta.textContent =
        p.done +
        " done · " +
        p.inProgress +
        " in progress · " +
        p.skipped +
        " skipped · " +
        p.remaining +
        " remaining (of " +
        p.total +
        " on the hero path)";
    }
  }

  function bindCardEvents(state) {
    document.getElementById("main")?.addEventListener("change", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || t.type !== "radio") return;
      if (!t.name.startsWith("status-")) return;
      const gameId = t.name.replace("status-", "");
      setStatus(state, gameId, t.value);
      const card = t.closest(".game-card");
      if (card) card.setAttribute("data-status", t.value);
      updateProgressUI(state);
    });
  }

  function bindNavHighlight() {
    const links = document.querySelectorAll(".nav-links a[href^='#']");
    const sections = ["path", "timeline", "connections", "optional"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || !sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((a) => {
            const match = a.getAttribute("href") === "#" + id;
            if (match) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  function resetProgress(state) {
    if (!confirm("Reset all hero-path and optional checklist progress?")) return;
    state.games = {};
    saveState(state);
    renderPhases(state);
    renderOptional(state);
    updateProgressUI(state);
  }

  function exportProgress(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zelda-progression-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function init() {
    const state = loadState();
    renderPhases(state);
    renderOptional(state);
    renderTimeline();
    renderConnections();
    updateProgressUI(state);
    bindCardEvents(state);
    bindNavHighlight();

    document.getElementById("btn-reset")?.addEventListener("click", () => resetProgress(state));
    document.getElementById("btn-export")?.addEventListener("click", () => exportProgress(state));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
