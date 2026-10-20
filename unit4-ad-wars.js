/* STEP UP — AD WARS, Unit 4 Grammar, teacher-led Class Mode.
   Six fixed questions: one per agency per round, 40 seconds each.
   All state is session-only; no student records or certificates are changed. */
(function () {
  'use strict';

  var TIME_LIMIT = 40;
  var AGENCIES = ['Agency A', 'Agency B', 'Agency C'];
  var QUESTIONS = [
    {
      agency: 0, round: 1, topic: 'Passive Voice · Present Perfect',
      stem: 'This advertisement ___ by millions of people so far.',
      choices: ['is seen', 'has been seen', 'has seen'], correct: 1,
      explanation: 'So far → present perfect passive: has been + past participle.'
    },
    {
      agency: 1, round: 1, topic: 'Passive Voice · Simple Past',
      stem: 'The first car ___ in 1886.',
      choices: ['was invented', 'is invent', 'has invent'], correct: 0,
      explanation: 'In 1886 → simple past passive: was + past participle.'
    },
    {
      agency: 2, round: 1, topic: 'Passive Voice · Future',
      stem: 'A new product ___ next month.',
      choices: ['is launch', 'has been launched', 'will be launched'], correct: 2,
      explanation: 'Next month → future passive: will be + past participle.'
    },
    {
      agency: 0, round: 2, topic: 'Comparative & Superlative',
      stem: 'The new phone is ___ than the old one. It is our ___ model.',
      choices: ['faster / fastest', 'fastest / faster', 'more fast / most fast'], correct: 0,
      explanation: 'Use faster than to compare two; our fastest model for the superlative.'
    },
    {
      agency: 1, round: 2, topic: 'Similarities & Differences',
      stem: 'This backpack is not ___ heavy ___ that suitcase.',
      choices: ['so / than', 'more / as', 'as / as'], correct: 2,
      explanation: 'Use not as + adjective + as to show that two things are different.'
    },
    {
      agency: 2, round: 2, topic: 'Sense Verbs + Like',
      stem: 'This perfume ___ fresh flowers.',
      choices: ['smells', 'smells like', 'is like smell'], correct: 1,
      explanation: 'Use smells like + noun to describe a similar smell.'
    }
  ];

  var state = null;
  var interval = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function stopClock() {
    if (interval != null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function overlay() {
    var el = document.getElementById('adwarsOverlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'adwarsOverlay';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'AD WARS Grammar Unit 4');
      document.body.appendChild(el);
    }
    return el;
  }

  function header(detail) {
    return '<header class="adwars-top">' +
      '<div><div class="adwars-wordmark">★ AD WARS</div><div class="adwars-kicker">' +
      esc(detail || 'STEP UP · CLASS MODE · UNIT 4') + '</div></div>' +
      '<button type="button" class="adwars-btn ghost small" data-adwars-action="exit">✕ Exit</button>' +
      '</header>';
  }

  function scores(activeAgency) {
    return '<section class="adwars-agencies" aria-label="Agency scores">' +
      AGENCIES.map(function (name, i) {
        return '<div class="adwars-agency ' + (activeAgency === i ? 'active' : '') + '">' +
          '<div class="team">' + esc(name) + '</div>' +
          '<div class="score">' + state.scores[i] + '</div>' +
          '<div class="score-label">points</div></div>';
      }).join('') + '</section>';
  }

  function frame(inner, detail) {
    overlay().innerHTML = '<main class="adwars-wrap">' + header(detail) + inner + '</main>';
  }

  function renderIntro() {
    frame('<div class="adwars-hero">' +
      '<div class="adwars-cup" aria-hidden="true">🏆</div>' +
      '<h1 class="adwars-title">THE GRAMMAR BATTLE</h1>' +
      '<p class="adwars-subtitle">3 Agencies · 2 Rounds · 6 Questions · 40 Seconds Each</p>' +
      scores(-1) +
      '<p class="adwars-intro-rules">Each agency answers one question in each round.<br>' +
      'Choose A, B, or C before the timer ends. Correct answer = 10 points.</p>' +
      '<button type="button" class="adwars-btn" data-adwars-action="begin">Start Round 1 →</button>' +
      '</div>', 'UNIT 4 · THE ART OF ADVERTISING');
  }

  function renderQuestion() {
    var q = QUESTIONS[state.index];
    var locked = state.revealed || state.seconds <= 0;
    var timeClass = state.seconds <= 10 ? ' warning' : '';
    var choices = q.choices.map(function (choice, i) {
      var status = '';
      if (state.revealed && i === q.correct) status = ' correct';
      else if (state.revealed && i === state.chosen) status = ' wrong';
      else if (!state.revealed && i === state.chosen) status = ' selected';
      return '<button type="button" class="adwars-choice' + status + '" data-adwars-action="pick" ' +
        'data-adwars-choice="' + i + '" ' + (locked ? 'disabled' : '') + ' aria-pressed="' +
        (i === state.chosen ? 'true' : 'false') + '">' +
        '<span class="adwars-letter">' + String.fromCharCode(65 + i) + '</span>' +
        esc(choice) + '</button>';
    }).join('');

    var notice = '';
    if (state.revealed) {
      var earned = state.chosen === q.correct;
      notice = '<div class="adwars-answer">' +
        (earned ? '✓ Correct! +10 points. ' : 'Correct answer: ' + String.fromCharCode(65 + q.correct) + '. ') +
        esc(q.explanation) + '</div>';
    } else if (state.seconds <= 0) {
      notice = '<div class="adwars-answer expired">⏱ Time is up. Reveal the answer to continue.</div>';
    }

    var actions = state.revealed ?
      '<button type="button" class="adwars-btn" data-adwars-action="advance">' +
      (state.index === QUESTIONS.length - 1 ? 'See Final Results 🏆' :
        state.index === 2 ? 'Round 1 Results →' : 'Next Question →') + '</button>' :
      '<button type="button" class="adwars-btn" data-adwars-action="reveal">Reveal Answer & Score</button>';

    frame(scores(q.agency) +
      '<section class="adwars-card">' +
      '<div class="adwars-meta">' +
      '<span class="adwars-round">ROUND ' + q.round + ' · ' + esc(AGENCIES[q.agency]) +
      ' · Q' + (state.index + 1) + '/6</span>' +
      '<span id="adwarsTimer" class="adwars-timer' + timeClass + '">' +
      '0:' + String(state.seconds).padStart(2, '0') + '</span></div>' +
      '<div class="adwars-progress"><span id="adwarsProgress" style="width:' +
      (state.seconds / TIME_LIMIT * 100) + '%"></span></div>' +
      '<div class="adwars-topic">' + esc(q.topic) + '</div>' +
      '<div class="adwars-question">' + esc(q.stem) + '</div>' +
      '<div class="adwars-choices">' + choices + '</div>' +
      notice +
      '<div class="adwars-actions">' +
      '<span class="adwars-note">Answer for ' + esc(AGENCIES[q.agency]) +
      ' · 10 points for a correct choice</span>' + actions +
      '</div></section>',
      'ROUND ' + q.round + ' · ' + esc(AGENCIES[q.agency]));
  }

  function tick() {
    if (!state || state.phase !== 'question' || state.revealed) return;
    var remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    if (remaining === state.seconds) return;
    state.seconds = remaining;
    var timerEl = document.getElementById('adwarsTimer');
    var bar = document.getElementById('adwarsProgress');
    if (timerEl) {
      timerEl.textContent = '0:' + String(remaining).padStart(2, '0');
      timerEl.classList.toggle('warning', remaining <= 10);
    }
    if (bar) bar.style.width = (remaining / TIME_LIMIT * 100) + '%';
    if (remaining === 0) {
      stopClock();
      renderQuestion();
    }
  }

  function beginQuestion(index) {
    stopClock();
    state.phase = 'question';
    state.index = index;
    state.chosen = null;
    state.revealed = false;
    state.seconds = TIME_LIMIT;
    state.deadline = Date.now() + TIME_LIMIT * 1000;
    renderQuestion();
    interval = setInterval(tick, 200);
  }

  function renderBreak() {
    frame('<div class="adwars-break"><div class="adwars-cup">⚡</div>' +
      '<h2>Round 1 Complete!</h2><p>Current scores</p>' +
      scores(-1) +
      '<button class="adwars-btn" data-adwars-action="round2" type="button">Start Round 2 →</button>' +
      '</div>', 'HALFTIME · SCOREBOARD');
  }

  function renderFinal() {
    var maximum = Math.max.apply(null, state.scores);
    var winners = AGENCIES.filter(function (name, i) { return state.scores[i] === maximum; });
    var heading = winners.length === 1 ? winners[0] + ' Wins!' : "It's a Tie!";
    frame('<div class="adwars-result"><div class="adwars-centered adwars-cup">🏆</div>' +
      '<h1 class="adwars-title">GRAMMAR CHAMPIONS!</h1>' +
      '<div class="adwars-final-label">All 6 questions completed</div>' +
      scores(-1) +
      '<h2>' + esc(heading) + '</h2>' +
      (winners.length > 1 ?
        '<p class="adwars-final-label">Tied: ' + esc(winners.join(' & ')) + '</p>' : '') +
      '<div class="adwars-centered"><button type="button" class="adwars-btn" data-adwars-action="restart">Play Again ↻</button>' +
      ' <button type="button" class="adwars-btn ghost" data-adwars-action="exit">Back to Class Mode</button></div>' +
      '</div>', 'FINAL RESULTS');
  }

  function open() {
    stopClock();
    state = { phase: 'intro', scores: [0, 0, 0], index: -1, chosen: null,
      revealed: false, seconds: TIME_LIMIT, deadline: 0 };
    renderIntro();
  }

  function exit() {
    stopClock();
    state = null;
    var el = document.getElementById('adwarsOverlay');
    if (el) el.remove();
  }

  function act(action, node) {
    if (action === 'exit') { exit(); return; }
    if (action === 'launch') { open(); return; }
    if (!state) return;
    if (action === 'restart') { open(); return; }
    if (action === 'begin' && state.phase === 'intro') {
      beginQuestion(0);
      return;
    }
    if (action === 'round2' && state.phase === 'break') {
      beginQuestion(3);
      return;
    }
    if (state.phase !== 'question') return;
    if (action === 'pick' && !state.revealed && state.seconds > 0) {
      var value = Number(node.getAttribute('data-adwars-choice'));
      if (Number.isInteger(value) && value >= 0 && value < 3) {
        state.chosen = value;
        renderQuestion();
      }
    } else if (action === 'reveal' && !state.revealed) {
      stopClock();
      state.revealed = true;
      if (state.chosen === QUESTIONS[state.index].correct) {
        state.scores[QUESTIONS[state.index].agency] += 10;
      }
      renderQuestion();
    } else if (action === 'advance' && state.revealed) {
      if (state.index === 2) {
        state.phase = 'break';
        renderBreak();
      } else if (state.index === QUESTIONS.length - 1) {
        state.phase = 'final';
        renderFinal();
      } else {
        beginQuestion(state.index + 1);
      }
    }
  }

  function injectTeacherEntry() {
    var page = document.querySelector('.teacher-classmode-v2');
    if (!page || page.querySelector('[data-adwars-entry]')) return;
    var card = document.createElement('section');
    card.className = 'teacher-recommended card adwars-entry';
    card.setAttribute('data-adwars-entry', '1');
    card.innerHTML = '<div><span class="adwars-tag">UNIT 4 · GRAMMAR COMPETITION</span>' +
      '<h2>🏆 AD WARS — The Grammar Battle</h2>' +
      '<p>3 agencies · 2 rounds · 6 questions · 40 seconds per question · Live scoring</p></div>' +
      '<button type="button" class="btn btn-primary" data-adwars-action="launch">Start AD WARS</button>';
    var controls = page.querySelector('.teacher-classmode-controls');
    if (controls) controls.insertAdjacentElement('afterend', card);
    else page.appendChild(card);
  }

  document.addEventListener('click', function (event) {
    var node = event.target.closest('[data-adwars-action]');
    if (!node) return;
    if (!node.closest('#adwarsOverlay') && !node.closest('[data-adwars-entry]')) return;
    event.preventDefault();
    act(node.getAttribute('data-adwars-action'), node);
  });

  function init() {
    injectTeacherEntry();
    var observer = new MutationObserver(injectTeacherEntry);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.STEPUP_AD_WARS = { open: open, close: exit, version: '20261020-1',
    questionCount: QUESTIONS.length, secondsPerQuestion: TIME_LIMIT };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
