// STEP UP Games Arcade: student-only navigation and independent playable games.
(function () {
  "use strict";

  const games = [
    {
      unit: 3,
      title: "Watch • Think • Choose",
      description: "Unit 3 · Will / Be Going To",
      launch: function () {
        if (window.STEPUP_FUTURE && typeof window.STEPUP_FUTURE.openStudent === "function") {
          window.STEPUP_FUTURE.openStudent();
        } else {
          window.alert("This game is not available right now.");
        }
      }
    },
    {
      unit: 4,
      title: "Grammar Rescue",
      description: "Unit 4 · 4 Missions · 18 Challenges",
      path: "games/grammar-rescue/index.html"
    }
  ];

  let originalOverflow = "";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }

  function pausePage() {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function resumePage() {
    document.body.style.overflow = originalOverflow;
  }

  function closeArcade() {
    const overlay = document.getElementById("stepupGamesArcadeOverlay");
    if (!overlay) return;
    overlay.remove();
    resumePage();
  }

  function closeGame() {
    const overlay = document.getElementById("stepupArcadeGameOverlay");
    if (!overlay) return;
    overlay.remove();
    resumePage();
  }

  function arcadeMarkup() {
    return '<div class="arc-head"><h2>🎮 Games Arcade</h2><p>Learn through play · Units 1–6</p></div>' +
      Array.from({length: 6}, function (_, index) {
        const unit = index + 1;
        const unitGames = games.filter(function (game) { return game.unit === unit; });
        const cards = unitGames.map(function (game) {
          return '<div class="arc-game"><div><strong>' + escapeHtml(game.title) +
            '</strong><small>' + escapeHtml(game.description) + '</small></div>' +
            '<button type="button" data-arc-game="' + escapeHtml(game.title) + '">Play →</button></div>';
        }).join("");
        return '<section class="arc-unit"><h3>Unit ' + unit + '</h3>' +
          (cards || '<p class="arc-empty">New games will appear here.</p>') + '</section>';
      }).join("");
  }

  function openArcade() {
    closeGame();
    if (document.getElementById("stepupGamesArcadeOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "stepupGamesArcadeOverlay";
    overlay.innerHTML = '<div class="arc-panel"><button class="arc-close" type="button" data-arc-close>✕ Close</button>' +
      '<div id="stepupGamesArcade">' + arcadeMarkup() + '</div></div>';
    document.body.appendChild(overlay);
    pausePage();
  }

  function openGame(path) {
    closeArcade();
    closeGame();
    if (!/^games\/[a-z0-9-]+\/index\.html$/.test(path)) return;
    const overlay = document.createElement("div");
    overlay.id = "stepupArcadeGameOverlay";
    overlay.innerHTML = '<div class="arc-gamebar">' +
      '<strong>🎮 Grammar Rescue</strong>' +
      '<button type="button" data-arc-back>← Games</button>' +
      '<button type="button" data-arc-exit aria-label="Close game">✕</button>' +
      '</div><iframe class="arc-gameframe" title="Grammar Rescue · Unit 4" allow="autoplay" src="' +
      escapeHtml(path + '?v=20261022-challenge-3') + '"></iframe>';
    document.body.appendChild(overlay);
    pausePage();
  }

  function addStudentNav() {
    const nav = document.querySelector('nav.student-nav[data-role="student"]');
    if (!nav || nav.querySelector('[data-arc-open]')) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "role-tab arc-entry";
    button.setAttribute("data-arc-open", "1");
    button.innerHTML = '<span class="student-nav-icon">🎮</span><span class="student-nav-label">Games</span>';
    nav.appendChild(button);
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-arc-open]")) { openArcade(); return; }
    if (event.target.closest("[data-arc-close], [data-arc-exit]")) {
      closeArcade(); closeGame(); return;
    }
    if (event.target.closest("[data-arc-back]")) { openArcade(); return; }
    const button = event.target.closest("[data-arc-game]");
    if (!button) return;
    const game = games.find(function (g) { return g.title === button.getAttribute("data-arc-game"); });
    if (!game) return;
    if (game.path) openGame(game.path);
    else if (typeof game.launch === "function") { closeArcade(); game.launch(); }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { closeGame(); closeArcade(); }
  });

  function start() {
    addStudentNav();
    new MutationObserver(addStudentNav).observe(document.getElementById("app") || document.body, {
      childList: true, subtree: true
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.STEPUP_GAMES_ARCADE = {
    open: openArcade,
    register: function (game) {
      if (game && Number.isInteger(game.unit) && game.unit >= 1 && game.unit <= 6 &&
          typeof game.title === "string" && (typeof game.launch === "function" || typeof game.path === "string")) {
        games.push(game);
        const root = document.getElementById("stepupGamesArcade");
        if (root) root.innerHTML = arcadeMarkup();
      }
    }
  };
})();
