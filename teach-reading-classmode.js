// StepUp • Teacher-only Teach Reading — Unit 2
// Uses the ORIGINAL Mega Goal 1 textbook Reading text.
(() => {
  "use strict";

  const state = {
    step: 0, revealed: false, rate: 0.9,
    speechToken: 0, speechMode: "", speechSentences: [],
    speechIndex: 0, speechQueue: [], queueIndex: 0,
    selectedAnswers: {},
    paused: false, observer: null
  };

  const VOCAB = {
    "interns": "people getting work experience",
    "fluent": "able to speak a language easily and well",
    "outgoing": "friendly and comfortable meeting people",
    "painstaking": "done with great care and attention",
    "lodging": "a place to stay",
    "blueprints": "detailed plans or drawings",
    "cope": "deal successfully with a difficult situation",
    "résumé": "a document that summarizes education, skills, and experience"
  };

  const esc = (s="") => String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  function data() {
    const u2 = (window.PROVEIT_DATA?.units || []).find(u => u.id === "u2" || Number(u.number) === 2);
    const reading = (u2?.trainings || []).find(t => t.id === "u2-reading-review");
    return { u2, reading };
  }

  function sections() {
    const { reading } = data();
    return reading?.teachSections || {};
  }

  function sentenceSplit(text="") {
    return (String(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
      .map(x => x.trim()).filter(Boolean);
  }

  function wordMarkup(text) {
    let html = esc(text);
    const terms = Object.keys(VOCAB).sort((a,b)=>b.length-a.length);
    const rx = new RegExp(`\\b(${terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})\\b`, "gi");
    return html.replace(rx, (m) => {
      const key = Object.keys(VOCAB).find(k => k.toLowerCase() === m.toLowerCase()) || m.toLowerCase();
      return `<button class="tr-word" type="button" data-meaning="${esc(VOCAB[key] || "")}" onclick="STEPUP_TEACH_READING.toggleWord(this)">${esc(m)}</button>`;
    });
  }

  function sentenceMarkup(text, mode) {
    return sentenceSplit(text).map((s,i)=>
      `<span class="tr-sentence" data-speech-mode="${esc(mode)}" data-sentence-index="${i}">${wordMarkup(s)}</span>`
    ).join(" ");
  }

  function audioControls(label="Read Aloud") {
    return `
      <div class="tr-audio-bar">
        <div class="tr-audio-main">
          <button class="tr-audio-primary" onclick="STEPUP_TEACH_READING.playCurrent()">🔊 ${esc(label)}</button>
          <button onclick="STEPUP_TEACH_READING.pauseResume()" id="trPauseBtn">⏸ Pause</button>
          <button onclick="STEPUP_TEACH_READING.stopSpeech()">⏹ Stop</button>
          <button onclick="STEPUP_TEACH_READING.playCurrent(true)">↻ Listen Again</button>
        </div>
        <div class="tr-speed">
          <span>Speed</span>
          ${[0.8,0.9,1,1.1].map(r=>`<button class="${state.rate===r?"active":""}" onclick="STEPUP_TEACH_READING.setRate(${r})">${r}×</button>`).join("")}
        </div>
        <div class="tr-audio-status" id="trAudioStatus">Ready</div>
      </div>`;
  }

  function textbookBadge(exercise, page) {
    return `<div class="tr-book-badge"><span>📘 ${esc(exercise)}</span><b>Student Book • p. ${esc(page)}</b></div>`;
  }

  function readingCard(title, text, mode, label) {
    return `
      ${audioControls(label)}
      <div class="tr-reading-card" dir="ltr">
        <h3>${esc(title)}</h3>
        <p>${sentenceMarkup(text, mode)}</p>
      </div>
      <div class="tr-reading-tip">Click a highlighted word to show or hide its meaning.</div>`;
  }

  function simpleQuestion(q, strategyLabel="") {
    if (!q) return `<div class="tr-empty">Question unavailable.</div>`;

    const selected = state.selectedAnswers[state.step];
    const hasSelection = Number.isInteger(selected);

    const choices = (q.choices || []).map((choice, i) => {
      let cls = "tr-choice";
      if (hasSelection && i === selected) cls += " selected";
      if (state.revealed && i === q.answer) cls += " correct";
      if (state.revealed && hasSelection && i === selected && selected !== q.answer) cls += " wrong";

      return `
        <button type="button"
                class="${cls}"
                onclick="STEPUP_TEACH_READING.selectAnswer(${i})"
                aria-pressed="${hasSelection && i === selected ? "true" : "false"}">
          <span>${String.fromCharCode(65+i)}</span>
          <b>${esc(choice)}</b>
        </button>`;
    }).join("");

    const feedback = state.revealed && hasSelection
      ? (selected === q.answer
          ? `<div class="tr-choice-feedback correct-msg">✓ Correct</div>`
          : `<div class="tr-choice-feedback wrong-msg">Incorrect • Correct answer: ${String.fromCharCode(65+q.answer)}</div>`)
      : "";

    return `
      <div class="tr-question-grid">
        <div class="tr-question-panel">
          <div class="tr-big-question" dir="ltr">${esc(q.stem)}</div>
          <div class="tr-choices">${choices}</div>
          ${feedback}
        </div>
        <aside class="tr-strategy-side">
          <b>${esc(strategyLabel || q.skill || "Reading strategy")}</b>
          <p>${esc(q.need || "Find the clue in the text before choosing.")}</p>

          ${hasSelection
            ? `<button class="tr-reveal-btn" onclick="STEPUP_TEACH_READING.checkAnswer()">${state.revealed ? "Checked ✓" : "Check Answer"}</button>`
            : `<button class="tr-reveal-btn disabled" disabled>Choose an answer first</button>`}

          ${state.revealed
            ? `<div class="tr-answer-box"><strong>Answer: ${String.fromCharCode(65+q.answer)}</strong><p>${esc(q.explanation || "")}</p></div>`
            : ""}
        </aside>
      </div>`;
  }

  function quickCheck(stem, choices, answer, explanation) {
    return simpleQuestion({
      stem, choices, answer, explanation,
      need: "Scan the part you just read and find the exact clue."
    }, "Quick Check");
  }

  function resumeQueue(resume) {
    if (!resume) return [];
    const q = [];
    q.push({mode:"resume-name", text:resume.name || ""});
    (resume.contact || []).forEach((x,i)=>q.push({mode:`resume-contact-${i}`, text:x}));
    (resume.education || []).forEach((x,i)=>q.push({mode:`resume-education-${i}`, text:x}));
    (resume.experience || []).forEach((x,i)=>q.push({mode:`resume-experience-${i}`, text:x}));
    (resume.honors || []).forEach((x,i)=>q.push({mode:`resume-honors-${i}`, text:x}));
    (resume.skills || []).forEach((x,i)=>q.push({mode:`resume-skills-${i}`, text:x}));
    return q.filter(x => x.text);
  }

  function resumeHTML(resume) {
    if (!resume) return "";
    const itemList = (arr, prefix) => `<ul>${(arr||[]).map((x,i)=>`<li>${sentenceMarkup(x, `${prefix}-${i}`)}</li>`).join("")}</ul>`;
    return `
      ${audioControls("Read Résumé")}
      <div class="tr-resume" dir="ltr">
        <h2>${sentenceMarkup(resume.name || "", "resume-name")}</h2>
        <div class="tr-contact">${(resume.contact||[]).map((x,i)=>`<div>${sentenceMarkup(x, `resume-contact-${i}`)}</div>`).join("")}</div>
        <h3>Education</h3>${itemList(resume.education, "resume-education")}
        <h3>Experience</h3>${itemList(resume.experience, "resume-experience")}
        <h3>Honors/Awards</h3>${itemList(resume.honors, "resume-honors")}
        <h3>Skills</h3>${itemList(resume.skills, "resume-skills")}
      </div>`;
  }

  function exitCheckHTML() {
    // Original Mega Goal 1 Student Book — Unit 2 — After Reading, p. 27.
    const exit = [
      {stem:"JobPool has been growing since the year 2000.", answer:0},
      {stem:"The archaeological interns get a good salary.", answer:1},
      {stem:"The media intern needs to speak several languages.", answer:1},
      {stem:"The candidate for the engineering job must be good at reading blueprints.", answer:0},
      {stem:"Carl has experience with word-processing programs.", answer:0},
      {stem:"One of Carl’s articles has appeared in newspapers all over the country.", answer:1}
    ];

    const allSelected = exit.every((_,qi)=>Number.isInteger(state.selectedAnswers[`exit-${qi}`]));

    return `
      ${textbookBadge("After Reading • Answer true or false", "27")}
      <div class="tr-exit-grid tr-exit-six">
        ${exit.map((q,qi)=>{
          const key = `exit-${qi}`;
          const selected = state.selectedAnswers[key];
          const hasSelection = Number.isInteger(selected);

          return `
            <div class="tr-exit-card">
              <div class="tr-exit-num">${qi+1}</div>
              <h3 dir="ltr">${esc(q.stem)}</h3>
              <div class="tr-exit-options">
                ${["True","False"].map((label,i)=>{
                  let cls = "tr-exit-option";
                  if (hasSelection && i === selected) cls += " selected";
                  if (state.revealed && i === q.answer) cls += " correct";
                  if (state.revealed && hasSelection && i === selected && selected !== q.answer) cls += " wrong";

                  return `
                    <button type="button"
                            class="${cls}"
                            onclick="STEPUP_TEACH_READING.selectExitAnswer(${qi},${i})"
                            aria-pressed="${hasSelection && i === selected ? "true" : "false"}">
                      <span>${String.fromCharCode(65+i)}</span>${label}
                    </button>`;
                }).join("")}
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="tr-exit-actions">
        <button class="tr-reveal-btn"
                onclick="STEPUP_TEACH_READING.checkExitAnswers()"
                ${allSelected ? "" : "disabled"}>
          ${state.revealed ? "Answers Checked ✓" : "Check After Reading Answers"}
        </button>
      </div>`;
  }

  function discussionHTML() {
    // Original Mega Goal 1 Student Book — Unit 2 — Discussion, p. 27.
    const questions = [
      "What types of information does Carl include in his résumé? What types of jobs do you think Carl has the qualifications and experience for? Explain.",
      "What qualifications do you have that you can include in a résumé? What jobs are you qualified for?",
      "In your opinion, what makes a person qualified for a job?"
    ];

    return `
      ${textbookBadge("Discussion", "27")}
      <div class="tr-discussion-list">
        ${questions.map((q,i)=>`
          <div class="tr-discussion-card">
            <span>${i+1}</span>
            <p dir="ltr">${esc(q)}</p>
          </div>`).join("")}
      </div>
      <div class="tr-teacher-prompt"><b>Class use:</b> Ask students to answer orally, then invite different answers before moving on.</div>`;
  }

  function lessonSteps() {
    const { reading } = data();
    const s = sections();
    const q = reading?.questions || [];

    const fullQueue = [
      {mode:"full-about", text:s.about || ""},
      {mode:"full-media", text:s.media || ""},
      {mode:"full-archaeology", text:s.archaeology || ""},
      {mode:"full-engineering", text:s.engineering || ""}
    ].filter(x => x.text);

    return [
      {
        label:"Warm-up", kicker:"Before Reading",
        title:"Look at the three job opportunities",
        body:`
          ${textbookBadge("Before Reading", "26")}
          <div class="tr-warm-grid">
            <div class="tr-career-card"><span>📰</span><strong>Media Intern</strong><small>TV and Radio Media International</small></div>
            <div class="tr-career-card"><span>🏺</span><strong>Archaeological Interns</strong><small>Students Learning Overseas</small></div>
            <div class="tr-career-card"><span>🌱</span><strong>Environmental Engineering</strong><small>Saudi Construction, Riyadh</small></div>
          </div>
          <div class="tr-teacher-prompt"><b>Original textbook task:</b> Read the three job opportunities and find the sentences that say what a person should be able to do in each job.</div>`
      },
      {
        label:"Vocabulary", kicker:"Key words",
        title:"Meet the words before the text",
        body:`
          <div class="tr-vocab-grid">
            ${Object.entries(VOCAB).map(([word,meaning])=>`
              <div class="tr-vocab-card">
                <div class="tr-vocab-top"><b>${esc(word)}</b><button onclick="STEPUP_TEACH_READING.readWord('${word.replace(/'/g,"\\'")}')">🔊</button></div>
                <button class="tr-meaning-toggle" onclick="STEPUP_TEACH_READING.toggleMeaning(this)">Show meaning</button>
                <span class="tr-vocab-meaning">${esc(meaning)}</span>
              </div>`).join("")}
          </div>
          <div class="tr-teacher-prompt"><b>Quick check:</b> Which word means “a place to stay”?</div>`
      },

      {
        label:"Paragraph 1", kicker:"Original textbook text",
        title:"About Us",
        audioMode:"about", audioText:s.about || "",
        body:`${textbookBadge("Reading • JobPool Has the Job for You", "26")}${readingCard("About Us:", s.about || "", "about", "Read Paragraph 1")}`
      },
      {
        label:"Paragraph 2", kicker:"Original textbook text",
        title:"Media Intern",
        audioMode:"media", audioText:s.media || "",
        body:`${textbookBadge("Reading • JobPool Has the Job for You", "26")}${readingCard("Media Intern: TV and Radio Media International", s.media || "", "media", "Read Paragraph 2")}`
      },
      {
        label:"Quick Check", kicker:"Check understanding",
        title:"Find the exact clue",
        questionHTML:quickCheck(
          "The Media Intern position is ___.",
          ["paid for the summer","unpaid for three months","only for engineers","only for Arabic speakers"],
          0,
          "The original text says: “This is a paid internship for the summer.”"
        )
      },
      {
        label:"Paragraph 3", kicker:"Original textbook text",
        title:"Archaeological Interns",
        audioMode:"archaeology", audioText:s.archaeology || "",
        body:`${textbookBadge("Reading • JobPool Has the Job for You", "26")}${readingCard("Archaeological Interns: Students Learning Overseas", s.archaeology || "", "archaeology", "Read Paragraph 3")}`
      },
      {
        label:"Quick Check", kicker:"Check understanding",
        title:"Scan for one detail",
        questionHTML:quickCheck(
          "Which internship is unpaid but provides lodging and meals?",
          ["Media Intern","Archaeological Interns","Environmental Engineering","All of them"],
          1,
          "The original text states that the archaeological internship is unpaid, but lodging and meals are provided."
        )
      },
      {
        label:"Paragraph 4", kicker:"Original textbook text",
        title:"Environmental Engineering",
        audioMode:"engineering", audioText:s.engineering || "",
        body:`${textbookBadge("Reading • JobPool Has the Job for You", "26")}${readingCard("Environmental Engineering: Saudi Construction, Riyadh", s.engineering || "", "engineering", "Read Paragraph 4")}`
      },
      {
        label:"Quick Check", kicker:"Check understanding",
        title:"Scan the final paragraph",
        questionHTML:quickCheck(
          "The engineering applicant needs to be able to read ___.",
          ["résumés","blueprints","newspapers","maps only"],
          1,
          "The original text says the applicant needs to be able to read blueprints."
        )
      },
      {
        label:"Résumé", kicker:"Original textbook text",
        title:"Carl Barthes",
        audioQueue:resumeQueue(s.resume),
        body:`${textbookBadge("Résumé", "27")}${resumeHTML(s.resume)}`
      },
      {
        label:"Strategy", kicker:"Reading skill",
        title:"Main Idea",
        body:`
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Read the title and headings</b><small>They tell you the topic.</small></div>
            <div><span>2</span><b>Look across all sections</b><small>Find what they have in common.</small></div>
            <div><span>3</span><b>Avoid tiny details</b><small>The main idea must cover the whole text.</small></div>
          </div>
          <div class="tr-demo-box"><b>Teacher cue</b><p>“Is the text mainly about one job, or about several opportunities and their requirements?”</p></div>`
      },
      {
        label:"Strategy", kicker:"Reading skill",
        title:"Scanning for Details",
        body:`
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Underline the key word</b><small>Job title, number, skill, or requirement.</small></div>
            <div><span>2</span><b>Move your eyes quickly</b><small>Do not reread every line.</small></div>
            <div><span>3</span><b>Stop at the matching clue</b><small>Then read that sentence carefully.</small></div>
          </div>
          <div class="tr-demo-box"><b>Teacher cue</b><p>“If I ask which internship is unpaid, what exact word should your eyes search for?”</p></div>`
      },
      {
        label:"Strategy", kicker:"Reading skill",
        title:"Inference",
        body:`
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Collect two or more clues</b><small>The answer may not be copied exactly.</small></div>
            <div><span>2</span><b>Match clues to the question</b><small>Use only what the text supports.</small></div>
            <div><span>3</span><b>Choose the best fit</b><small>Reject options that add unsupported ideas.</small></div>
          </div>
          <div class="tr-demo-box"><b>Teacher cue</b><p>“If someone is fluent in English, friendly, and good with computers, which opening fits best?”</p></div>`
      },
      {label:"Guided Practice", kicker:"Main Idea", title:q[0]?.stem || "Main Idea", questionHTML:simpleQuestion(q[0], "Main Idea strategy")},
      {label:"Guided Practice", kicker:"Specific Detail", title:q[1]?.stem || "Specific Detail", questionHTML:simpleQuestion(q[1], "Scanning strategy")},
      {label:"Guided Practice", kicker:"Inference", title:q[2]?.stem || "Inference", questionHTML:simpleQuestion(q[2], "Inference strategy")},
      {
        label:"Full Reading", kicker:"Listen and follow",
        title:"JobPool Has the Job for You",
        audioQueue:fullQueue,
        body:`
          ${textbookBadge("Reading • JobPool Has the Job for You", "26")}
          ${audioControls("Read Full Text")}
          <div class="tr-reading-card tr-full-reading" dir="ltr">
            <section class="tr-paragraph-block">
              <h3>About Us:</h3>
              <p>${sentenceMarkup(s.about || "", "full-about")}</p>
            </section>
            <section class="tr-paragraph-block">
              <h3>Media Intern: TV and Radio Media International</h3>
              <p>${sentenceMarkup(s.media || "", "full-media")}</p>
            </section>
            <section class="tr-paragraph-block">
              <h3>Archaeological Interns: Students Learning Overseas</h3>
              <p>${sentenceMarkup(s.archaeology || "", "full-archaeology")}</p>
            </section>
            <section class="tr-paragraph-block">
              <h3>Environmental Engineering: Saudi Construction, Riyadh</h3>
              <p>${sentenceMarkup(s.engineering || "", "full-engineering")}</p>
            </section>
            <p><strong>Send applications to:</strong> internships@jpool.com Attach a cover letter and a résumé.</p>
          </div>`
      },
      {
        label:"After Reading", kicker:"Textbook Exercise",
        title:"Answer true or false",
        questionHTML:exitCheckHTML()
      },
      {
        label:"Discussion", kicker:"Textbook Exercise",
        title:"Discuss the reading",
        questionHTML:discussionHTML()
      }
    ];
  }

  function currentStep() {
    const steps = lessonSteps();
    return steps[state.step] || steps[0];
  }

  function render() {
    stopSpeech();
    const app = document.getElementById("app");
    if (!app) return;
    const steps = lessonSteps();
    const s = steps[state.step] || steps[0];
    const progress = Math.round(((state.step + 1) / steps.length) * 100);

    app.innerHTML = `
      <div class="tr-shell">
        <header class="tr-toolbar">
          <div class="tr-brand">
            <div class="tr-logo">SU</div>
            <div><strong>StepUp • Teach Reading</strong><small>Unit 2 • Careers • Teacher Class Mode</small></div>
          </div>
          <div class="tr-toolbar-actions">
            <span class="tr-counter">${state.step + 1}/${steps.length}</span>
            <button onclick="STEPUP_TEACH_READING.exit()">Exit Lesson</button>
          </div>
        </header>
        <div class="tr-progress"><div style="width:${progress}%"></div></div>
        <main class="tr-stage">
          <div class="tr-step-head">
            <div><span class="tr-kicker">${esc(s.kicker)}</span><h1>${esc(s.title)}</h1></div>
            <span class="tr-step-label">${esc(s.label)}</span>
          </div>
          <section class="tr-content">${s.questionHTML || s.body || ""}</section>
          <footer class="tr-nav">
            <button class="secondary" onclick="STEPUP_TEACH_READING.prev()" ${state.step === 0 ? "disabled" : ""}>← Back</button>
            <div class="tr-dots">${steps.map((_,i)=>`<span class="${i===state.step?"active":i<state.step?"done":""}"></span>`).join("")}</div>
            ${state.step < steps.length - 1
              ? `<button class="primary" onclick="STEPUP_TEACH_READING.next()">Next →</button>`
              : `<button class="primary" onclick="STEPUP_TEACH_READING.exit()">Finish Lesson ✓</button>`}
          </footer>
        </main>
      </div>`;
  }

  function preferredVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = speechSynthesis.getVoices() || [];
    return voices.find(v => /^en-US/i.test(v.lang)) ||
           voices.find(v => /^en-GB/i.test(v.lang)) ||
           voices.find(v => /^en/i.test(v.lang)) || null;
  }

  function setAudioStatus(t){
    const el=document.getElementById("trAudioStatus");
    if(el)el.textContent=t;
  }

  function clearSentenceHighlight(){
    document.querySelectorAll(".tr-sentence.speaking").forEach(el=>el.classList.remove("speaking"));
    document.querySelectorAll(".tr-paragraph-block.speaking-paragraph").forEach(el=>el.classList.remove("speaking-paragraph"));
  }

  function highlightSentence(mode,index){
    clearSentenceHighlight();
    const safeMode = (window.CSS && CSS.escape) ? CSS.escape(mode) : mode.replace(/"/g,'\\"');
    const el=document.querySelector(`.tr-sentence[data-speech-mode="${safeMode}"][data-sentence-index="${index}"]`);
    if(el){
      el.classList.add("speaking");
      const paragraph = el.closest(".tr-paragraph-block");
      if(paragraph) paragraph.classList.add("speaking-paragraph");
      el.scrollIntoView({behavior:"smooth",block:"center"});
    }
  }

  function loadQueueItem(token, sentenceStart=0){
    if(token!==state.speechToken)return;
    if(state.queueIndex>=state.speechQueue.length){
      clearSentenceHighlight();
      setAudioStatus("Finished");
      state.speechMode="";
      state.speechSentences=[];
      state.speechQueue=[];
      state.queueIndex=0;
      state.speechIndex=0;
      state.paused=false;
      return;
    }

    const item=state.speechQueue[state.queueIndex];
    state.speechMode=item.mode;
    state.speechSentences=sentenceSplit(item.text);
    state.speechIndex=Math.min(sentenceStart, Math.max(0,state.speechSentences.length-1));

    if(!state.speechSentences.length){
      state.queueIndex++;
      loadQueueItem(token,0);
      return;
    }
    speakSentence(token);
  }

  function speakSentence(token){
    if(token!==state.speechToken)return;

    if(state.speechIndex>=state.speechSentences.length){
      state.queueIndex++;
      loadQueueItem(token,0);
      return;
    }

    const text=state.speechSentences[state.speechIndex];
    const u=new SpeechSynthesisUtterance(text);
    u.lang="en-US";
    u.rate=state.rate;
    const voice=preferredVoice();
    if(voice)u.voice=voice;

    highlightSentence(state.speechMode,state.speechIndex);

    const paragraphNumber = state.speechQueue.length > 1
      ? ` • paragraph ${state.queueIndex+1}/${state.speechQueue.length}`
      : "";
    setAudioStatus(`Reading sentence ${state.speechIndex+1}/${state.speechSentences.length}${paragraphNumber}`);

    u.onend=()=>{
      if(token!==state.speechToken)return;
      state.speechIndex++;
      speakSentence(token);
    };

    u.onerror=()=>{
      if(token!==state.speechToken)return;
      setAudioStatus("Audio stopped");
      clearSentenceHighlight();
    };

    speechSynthesis.speak(u);
  }

  function startSpeechQueue(queue, queueStart=0, sentenceStart=0){
    if(!("speechSynthesis" in window)){
      alert("Read Aloud is not available on this device/browser.");
      return;
    }

    const clean=(queue||[]).filter(x=>x && x.text);
    if(!clean.length)return;

    speechSynthesis.cancel();
    state.speechToken++;
    state.speechQueue=clean;
    state.queueIndex=Math.min(queueStart,clean.length-1);
    state.paused=false;

    const pauseBtn=document.getElementById("trPauseBtn");
    if(pauseBtn)pauseBtn.textContent="⏸ Pause";

    loadQueueItem(state.speechToken,sentenceStart);
  }

  function playCurrent(forceRestart=false){
    const s=currentStep();
    const queue = Array.isArray(s.audioQueue) && s.audioQueue.length
      ? s.audioQueue
      : (s.audioText ? [{mode:s.audioMode,text:s.audioText}] : []);

    if(!queue.length)return;

    if(!forceRestart && state.speechQueue.length && state.paused){
      pauseResume();
      return;
    }

    startSpeechQueue(queue,0,0);
  }

  function pauseResume(){
    if(!("speechSynthesis" in window)||!state.speechQueue.length)return;
    const btn=document.getElementById("trPauseBtn");

    if(speechSynthesis.paused||state.paused){
      speechSynthesis.resume();
      state.paused=false;
      if(btn)btn.textContent="⏸ Pause";
      setAudioStatus("Reading");
    } else {
      speechSynthesis.pause();
      state.paused=true;
      if(btn)btn.textContent="▶ Resume";
      setAudioStatus("Paused");
    }
  }

  function stopSpeech(){
    if("speechSynthesis" in window)speechSynthesis.cancel();
    state.speechToken++;
    state.speechMode="";
    state.speechSentences=[];
    state.speechQueue=[];
    state.queueIndex=0;
    state.speechIndex=0;
    state.paused=false;
    clearSentenceHighlight();
    setAudioStatus("Ready");
  }

  function setRate(rate){
    const newRate=Number(rate)||0.9;
    const wasSpeaking=state.speechQueue.length>0;
    const queue=[...state.speechQueue];
    const queueIndex=state.queueIndex;
    const sentenceIndex=state.speechIndex;

    state.rate=newRate;

    document.querySelectorAll(".tr-speed button").forEach(btn=>{
      btn.classList.toggle("active",btn.textContent.trim()===`${newRate}×`);
    });

    if(wasSpeaking&&queue.length){
      startSpeechQueue(queue,queueIndex,sentenceIndex);
    }
  }

  function readWord(word){if(!("speechSynthesis" in window))return;stopSpeech();const u=new SpeechSynthesisUtterance(String(word||""));u.lang="en-US";u.rate=.82;const voice=preferredVoice();if(voice)u.voice=voice;speechSynthesis.speak(u)}
  function toggleMeaning(btn){const card=btn.closest(".tr-vocab-card");if(!card)return;const open=card.classList.toggle("show-meaning");btn.textContent=open?"Hide meaning":"Show meaning"}
  function toggleWord(btn){btn.classList.toggle("open")}
  function selectAnswer(index){
    state.selectedAnswers[state.step]=Number(index);
    state.revealed=false;
    render();
  }

  function checkAnswer(){
    if(!Number.isInteger(state.selectedAnswers[state.step]))return;
    state.revealed=true;
    render();
  }

  function selectExitAnswer(questionIndex,index){
    state.selectedAnswers[`exit-${questionIndex}`]=Number(index);
    state.revealed=false;
    render();
  }

  function checkExitAnswers(){
    const ready=[0,1,2,3,4,5].every(i=>Number.isInteger(state.selectedAnswers[`exit-${i}`]));
    if(!ready)return;
    state.revealed=true;
    render();
  }

  function start(){if(!document.querySelector(".teacher-classmode-v2")){alert("Teach Reading is available from Teacher > Class Mode.");return}state.step=0;state.revealed=false;state.selectedAnswers={};render()}
  function next(){const steps=lessonSteps();if(state.step<steps.length-1){state.step++;state.revealed=false;render()}}
  function prev(){if(state.step>0){state.step--;state.revealed=false;render()}}
  function reveal(){stopSpeech();state.revealed=true;render()}
  function exitLesson(){stopSpeech();state.step=0;state.revealed=false;if(window.PROVE?.setTeacherTab)window.PROVE.setTeacherTab("classmode")}

  function injectSkillPanel(){
    const page=document.querySelector(".teacher-classmode-v2");
    if(!page||page.querySelector(".tr-u2-skill-panel"))return;
    const rows=[...page.querySelectorAll(".teacher-practice-row")];
    const readingRow=rows.find(r=>/Unit 2/i.test(r.textContent||"")&&/Reading Review/i.test(r.textContent||""));
    const grammarRow=rows.find(r=>/Unit 2/i.test(r.textContent||"")&&/STEP Grammar Practice/i.test(r.textContent||""));
    if(!readingRow&&!grammarRow)return;
    const anchor=readingRow||grammarRow;
    const panel=document.createElement("section");panel.className="tr-u2-skill-panel";
    panel.innerHTML=`
      <div class="tr-panel-head"><div><span>Unit 2 • Careers</span><h2>Choose what you want to review</h2></div><small>Teacher Class Mode</small></div>
      <div class="tr-skill-grid">
        <button class="tr-skill-card teach" data-tr-teach><span class="tr-skill-icon">👩‍🏫</span><b>Teach Reading</b><small>Original text • audio • vocabulary • strategies • exit check</small></button>
        <button class="tr-skill-card reading" data-tr-reading><span class="tr-skill-icon">📖</span><b>Reading Review</b><small>Original text • Main Idea • Detail • Inference</small></button>
        <button class="tr-skill-card grammar" data-tr-grammar><span class="tr-skill-icon">✓</span><b>STEP Grammar Practice</b><small>STEP-style grammar review</small></button>
      </div>`;
    anchor.parentNode.insertBefore(panel,anchor);
    if(readingRow)readingRow.style.display="none";if(grammarRow)grammarRow.style.display="none";
    panel.querySelector("[data-tr-teach]")?.addEventListener("click",start);
    panel.querySelector("[data-tr-reading]")?.addEventListener("click",()=>window.PROVE?.startClassMode?.("u2-reading-review"));
    panel.querySelector("[data-tr-grammar]")?.addEventListener("click",()=>window.PROVE?.startClassMode?.("u2-grammar"));
  }

  function injectStyles(){
    if(document.getElementById("teachReadingStyles"))return;
    const s=document.createElement("style");s.id="teachReadingStyles";s.textContent=`
      .tr-u2-skill-panel{margin:18px 0;padding:20px;border:1px solid #dfe8f4;border-radius:22px;background:linear-gradient(135deg,#fbfdff,#f7f4ff);box-shadow:0 10px 28px rgba(23,50,77,.06)}
      .tr-panel-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.tr-panel-head span{font-size:12px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:#6750d8}.tr-panel-head h2{margin:4px 0 0;font-size:24px;color:#172033}.tr-panel-head small{color:#667085;font-weight:700}
      .tr-skill-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.tr-skill-card{border:1px solid #dfe5ef;border-radius:18px;padding:18px;text-align:left;background:#fff;cursor:pointer;min-height:155px;transition:.18s ease;box-shadow:0 6px 18px rgba(35,46,80,.04)}.tr-skill-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(35,46,80,.08)}.tr-skill-card.teach{background:linear-gradient(145deg,#eef7ff,#fff);border-color:#bedcff}.tr-skill-card.reading{background:linear-gradient(145deg,#fff1fb,#fff);border-color:#efc7eb}.tr-skill-card.grammar{background:linear-gradient(145deg,#effcf8,#fff);border-color:#bfeadd}.tr-skill-card b{display:block;font-size:18px;color:#172033;margin:9px 0 6px}.tr-skill-card small{display:block;color:#667085;line-height:1.5}.tr-skill-icon{font-size:28px}
      .tr-shell{min-height:100vh;background:linear-gradient(180deg,#f7faff,#fff);color:#172033;font-family:Arial,Tahoma,"Segoe UI",sans-serif}.tr-toolbar{height:76px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dfe7f0;background:#fff;position:sticky;top:0;z-index:10}.tr-brand{display:flex;align-items:center;gap:12px}.tr-logo{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#6250e8,#b43ed6);color:#fff;font-weight:900}.tr-brand strong{display:block;font-size:18px}.tr-brand small{display:block;margin-top:3px;color:#667085}.tr-toolbar-actions{display:flex;gap:10px;align-items:center}.tr-toolbar-actions button{border:1px solid #d8e1eb;background:#fff;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer}.tr-counter{font-weight:900;color:#6250e8}
      .tr-progress{height:5px;background:#eaf0f6}.tr-progress>div{height:100%;background:linear-gradient(90deg,#1769e0,#8f4ee8);transition:.25s}.tr-stage{max-width:1280px;margin:0 auto;padding:30px 28px 34px}.tr-step-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:20px}.tr-kicker{display:block;color:#6750d8;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.tr-step-head h1{margin:6px 0 0;font-size:36px;line-height:1.18}.tr-step-label{background:#eef2ff;color:#5845cd;border-radius:999px;padding:9px 13px;font-weight:900;font-size:13px}.tr-content{min-height:520px;background:#fff;border:1px solid #dfe7f0;border-radius:26px;padding:30px;box-shadow:0 12px 32px rgba(23,50,77,.06)}
      .tr-warm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:24px 0}.tr-career-card{min-height:190px;padding:26px;border:1px solid #dfe7f0;border-radius:22px;background:#fbfdff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.tr-career-card span{font-size:52px}.tr-career-card strong{font-size:22px;margin:14px 0 7px}.tr-career-card small{font-size:15px;color:#667085}.tr-teacher-prompt{margin-top:22px;padding:17px 20px;border-radius:16px;background:#eef7ff;border-left:5px solid #1769e0;font-size:18px;line-height:1.6}
      .tr-vocab-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.tr-vocab-card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff}.tr-vocab-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.tr-vocab-top b{font-size:21px;color:#6c48d7}.tr-vocab-top button{border:0;background:#eef5ff;border-radius:10px;padding:8px 10px;cursor:pointer}.tr-meaning-toggle{margin-top:10px;border:1px solid #d8e2ef;background:#fff;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer;color:#344054}.tr-vocab-meaning{display:none;margin-top:9px;font-size:16px;color:#475467;line-height:1.5}.tr-vocab-card.show-meaning .tr-vocab-meaning{display:block}
      .tr-audio-bar{display:grid;grid-template-columns:auto auto 1fr;gap:14px;align-items:center;padding:14px 16px;border-radius:18px;background:#f4f8ff;border:1px solid #d8e7fb;margin-bottom:22px}.tr-audio-main{display:flex;gap:8px;flex-wrap:wrap}.tr-audio-main button,.tr-speed button{border:1px solid #cfdcec;background:#fff;border-radius:11px;padding:9px 11px;font-weight:800;cursor:pointer}.tr-audio-main .tr-audio-primary{background:#1769e0;color:#fff;border-color:#1769e0}.tr-speed{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.tr-speed span{font-size:12px;font-weight:900;color:#667085}.tr-speed button.active{background:#6250e8;color:#fff;border-color:#6250e8}.tr-audio-status{text-align:right;color:#667085;font-size:13px;font-weight:800}
      .tr-reading-card{font-size:21px;line-height:1.85;color:#172033;margin-bottom:20px}.tr-paragraph-block{padding:14px 16px;border-radius:16px;margin-bottom:14px;transition:.2s}.tr-paragraph-block.speaking-paragraph{background:#fffdf1;box-shadow:0 0 0 2px rgba(255,224,91,.18)}.tr-reading-card h3{font-size:23px;margin:0 0 10px;color:#3c2e86}.tr-reading-card p{margin:0}.tr-sentence{border-radius:8px;padding:2px 3px;transition:.2s}.tr-sentence.speaking{background:#fff0a8;box-shadow:0 0 0 3px rgba(255,224,91,.22)}.tr-word{display:inline;border:0;border-bottom:2px solid #b084e8;background:#f7f0ff;color:#4a2c95;border-radius:5px;padding:0 3px;font:inherit;font-weight:800;cursor:pointer;position:relative}.tr-word.open::after{content:attr(data-meaning);position:absolute;z-index:20;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);width:max-content;max-width:260px;background:#172033;color:#fff;border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.35;white-space:normal;box-shadow:0 7px 20px rgba(0,0,0,.18)}.tr-reading-tip{margin-top:16px;color:#667085;font-size:13px}
      .tr-resume{max-width:860px;margin:0 auto;border:1px solid #dfe7f0;border-radius:20px;padding:28px;background:#fff}.tr-resume h2{font-size:28px;margin:0 0 8px}.tr-resume h3{margin:22px 0 8px;padding-bottom:6px;border-bottom:2px solid #172033;font-size:18px}.tr-resume ul{margin:8px 0 0;padding-left:24px;line-height:1.7}.tr-contact{color:#475467;line-height:1.55}
      .tr-strategy-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:12px 0 22px}.tr-strategy-grid>div{border:1px solid #e0e6ef;border-radius:18px;padding:22px;background:#fbfdff}.tr-strategy-grid span{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:#6250e8;color:#fff;font-weight:900;margin-bottom:13px}.tr-strategy-grid b{display:block;font-size:19px;margin-bottom:6px}.tr-strategy-grid small{font-size:15px;color:#667085;line-height:1.5}.tr-demo-box{padding:20px;border-radius:17px;background:#fff5fb;border:1px solid #f0d3e9;font-size:18px}.tr-demo-box p{margin:7px 0 0}
      .tr-question-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.7fr);gap:22px}.tr-big-question{font-size:29px;font-weight:900;line-height:1.35;margin-bottom:22px}.tr-choices{display:grid;gap:12px}.tr-choice{width:100%;display:flex;gap:14px;align-items:center;border:2px solid #dfe5ee;border-radius:17px;padding:17px 18px;font-size:18px;background:#fff;text-align:left;cursor:pointer;color:#172033;transition:.15s}.tr-choice:hover{border-color:#9ab8e8;background:#f8fbff}.tr-choice.selected{border-color:#6250e8;background:#f5f2ff;box-shadow:0 0 0 3px rgba(98,80,232,.10)}.tr-choice span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#eef3f8;font-weight:900}.tr-choice.correct{border-color:#32a36c;background:#edfff6}.tr-choice.correct span{background:#32a36c;color:#fff}.tr-choice.wrong{border-color:#d94d55;background:#fff1f2}.tr-choice.wrong span{background:#d94d55;color:#fff}.tr-choice-feedback{margin-top:14px;padding:12px 14px;border-radius:12px;font-weight:900}.tr-choice-feedback.correct-msg{background:#edfff6;color:#247a52}.tr-choice-feedback.wrong-msg{background:#fff1f2;color:#a4303a}.tr-strategy-side{border-radius:20px;padding:22px;background:#f7f4ff;border:1px solid #e2d8fb}.tr-strategy-side>b{font-size:20px}.tr-strategy-side p{font-size:16px;line-height:1.6;color:#4d5870}.tr-reveal-btn{width:100%;border:0;border-radius:14px;background:#6250e8;color:#fff;font-weight:900;padding:14px;cursor:pointer;font-size:16px}.tr-reveal-btn:disabled,.tr-reveal-btn.disabled{opacity:.45;cursor:not-allowed}.tr-answer-box{margin-top:14px;padding:15px;border-radius:14px;background:#fff;border:1px solid #d9d0f4}.tr-answer-box p{margin-bottom:0}

      .tr-book-badge{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;padding:11px 14px;border:1px solid #d9e4f1;border-radius:14px;background:#f7fbff;color:#344054}.tr-book-badge span{font-weight:900;color:#3e4db8}.tr-book-badge b{font-size:13px;color:#667085}
      .tr-discussion-list{display:grid;gap:14px}.tr-discussion-card{display:grid;grid-template-columns:42px 1fr;gap:14px;align-items:flex-start;border:1px solid #e0e7ef;border-radius:18px;padding:18px;background:#fbfdff}.tr-discussion-card>span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#6250e8;color:#fff;font-weight:900}.tr-discussion-card p{margin:3px 0 0;font-size:20px;line-height:1.55}.tr-exit-six{grid-template-columns:repeat(2,1fr)}

      .tr-exit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tr-exit-card{border:1px solid #e0e7ef;border-radius:18px;padding:18px;background:#fbfdff}.tr-exit-num{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#6250e8;color:#fff;font-weight:900}.tr-exit-card h3{font-size:18px;line-height:1.35}.tr-exit-options{display:grid;gap:7px}.tr-exit-option{width:100%;display:flex;gap:8px;border:1px solid #e0e6ee;background:#fff;border-radius:11px;padding:10px 11px;cursor:pointer;text-align:left;color:#172033}.tr-exit-options span{font-weight:900}.tr-exit-option.selected{border-color:#6250e8;background:#f5f2ff}.tr-exit-option.correct{border-color:#32a36c;background:#edfff6}.tr-exit-option.wrong{border-color:#d94d55;background:#fff1f2}.tr-exit-actions{max-width:360px;margin:18px auto 0}
      .tr-nav{display:grid;grid-template-columns:160px 1fr 160px;gap:16px;align-items:center;margin-top:20px}.tr-nav button{border-radius:14px;padding:13px 16px;font-weight:900;cursor:pointer;font-size:15px}.tr-nav .secondary{background:#fff;border:1px solid #d7e0ea;color:#344054}.tr-nav .primary{background:#1769e0;border:1px solid #1769e0;color:#fff}.tr-nav button:disabled{opacity:.35;cursor:not-allowed}.tr-dots{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}.tr-dots span{width:8px;height:8px;border-radius:50%;background:#d8e0e9}.tr-dots span.active{width:22px;border-radius:999px;background:#6250e8}.tr-dots span.done{background:#8cb7ef}
      @media(max-width:850px){.tr-skill-grid,.tr-warm-grid,.tr-strategy-grid,.tr-vocab-grid,.tr-question-grid,.tr-exit-grid,.tr-exit-six{grid-template-columns:1fr}.tr-stage{padding:20px 16px}.tr-content{padding:20px;min-height:auto}.tr-step-head h1{font-size:28px}.tr-reading-card{font-size:18px}.tr-toolbar{padding:0 14px}.tr-brand small{display:none}.tr-nav{grid-template-columns:110px 1fr 110px}.tr-nav button{padding:11px 8px}.tr-audio-bar{grid-template-columns:1fr}.tr-audio-status{text-align:left}}
    `;document.head.appendChild(s)
  }

  function sync(){injectStyles();injectSkillPanel()}
  const boot=()=>{sync();if("speechSynthesis" in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices()}state.observer=new MutationObserver(sync);state.observer.observe(document.body,{childList:true,subtree:true})};
  window.addEventListener("pagehide",stopSpeech);window.addEventListener("beforeunload",stopSpeech);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

  window.STEPUP_TEACH_READING={start,next,prev,reveal,exit:exitLesson,playCurrent,pauseResume,stopSpeech,setRate,readWord,toggleMeaning,toggleWord,selectAnswer,checkAnswer,selectExitAnswer,checkExitAnswers};
})();
