// StepUp • Teacher-only Teach Reading — Unit 2
// Uses the ORIGINAL Mega Goal 1 textbook Reading text.
(() => {
  "use strict";

  const state = {
    step: 0, revealed: false, rate: 0.9,
    speechToken: 0, speechMode: "", speechSentences: [],
    speechIndex: 0, speechQueue: [], queueIndex: 0,
    selectedAnswers: {},
    context: "teacher",
    paused: false, observer: null,
    classTimerStep: -1,
    classTimerTotal: 45,
    classTimerRemaining: 45,
    classTimerRunning: false,
    classTimerHandle: null,
    classTimerFinished: false
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

  function timerFormat(seconds){
    const value=Math.max(0,Math.floor(Number(seconds)||0));
    const m=Math.floor(value/60);
    const s=value%60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function clearClassTimerHandle(){
    if(state.classTimerHandle){
      clearInterval(state.classTimerHandle);
      state.classTimerHandle=null;
    }
  }

  function syncClassTimerForStep(stepData){
    if(state.context!=="teacher" || !stepData?.timed)return;
    if(state.classTimerStep!==state.step){
      clearClassTimerHandle();
      state.classTimerStep=state.step;
      state.classTimerTotal=Number(stepData.timerSeconds||45);
      state.classTimerRemaining=state.classTimerTotal;
      state.classTimerRunning=false;
      state.classTimerFinished=false;
    }
  }

  function updateClassTimerUI(){
    const el=document.getElementById("trClassTimerValue");
    const shell=document.getElementById("trClassTimer");
    const status=document.getElementById("trClassTimerStatus");
    if(el)el.textContent=timerFormat(state.classTimerRemaining);
    if(shell)shell.classList.toggle("time-up",!!state.classTimerFinished);
    if(status)status.textContent=state.classTimerFinished
      ? "Time!"
      : (state.classTimerRunning ? "Running" : "Ready");
  }

  function setClassTimer(seconds){
    clearClassTimerHandle();
    state.classTimerTotal=Math.max(5,Number(seconds)||45);
    state.classTimerRemaining=state.classTimerTotal;
    state.classTimerRunning=false;
    state.classTimerFinished=false;
    updateClassTimerUI();
  }

  function startClassTimer(){
    if(state.classTimerRemaining<=0){
      state.classTimerRemaining=state.classTimerTotal||45;
      state.classTimerFinished=false;
    }
    if(state.classTimerRunning)return;
    state.classTimerRunning=true;
    updateClassTimerUI();
    clearClassTimerHandle();
    state.classTimerHandle=setInterval(()=>{
      state.classTimerRemaining=Math.max(0,state.classTimerRemaining-1);
      if(state.classTimerRemaining<=0){
        clearClassTimerHandle();
        state.classTimerRunning=false;
        state.classTimerFinished=true;
      }
      updateClassTimerUI();
    },1000);
  }

  function pauseClassTimer(){
    clearClassTimerHandle();
    state.classTimerRunning=false;
    updateClassTimerUI();
  }

  function resetClassTimer(){
    clearClassTimerHandle();
    state.classTimerRemaining=state.classTimerTotal||45;
    state.classTimerRunning=false;
    state.classTimerFinished=false;
    updateClassTimerUI();
  }

  function classTimerHTML(defaultSeconds=45){
    return `<div id="trClassTimer" class="tr-class-timer">
      <div class="tr-class-timer-main">
        <span>⏱</span>
        <b id="trClassTimerValue">${timerFormat(state.classTimerRemaining)}</b>
        <small id="trClassTimerStatus">${state.classTimerFinished?"Time!":(state.classTimerRunning?"Running":"Ready")}</small>
      </div>
      <div class="tr-class-timer-actions">
        <button onclick="STEPUP_TEACH_READING.setTimer(30)">30s</button>
        <button onclick="STEPUP_TEACH_READING.setTimer(45)">45s</button>
        <button onclick="STEPUP_TEACH_READING.setTimer(60)">60s</button>
        <button class="primary" onclick="STEPUP_TEACH_READING.startTimer()">Start</button>
        <button onclick="STEPUP_TEACH_READING.pauseTimer()">Pause</button>
        <button onclick="STEPUP_TEACH_READING.resetTimer()">Reset</button>
      </div>
    </div>`;
  }

  function routineStrip(active=""){
    const items=[
      ["preview","Preview"],
      ["main","Main Idea"],
      ["scan","Scanning"],
      ["context","Context"],
      ["infer","Inference"],
      ["check","Check"]
    ];
    return `<div class="tr-routine-strip">
      ${items.map(([key,label],i)=>`
        <span class="${key===active?"active":""}">
          <b>${i+1}</b>${esc(label)}
        </span>`).join("")}
    </div>`;
  }

  function compactPassageHTML(s, parts=["about","media","archaeology","engineering"]){
    const map={
      about:["About Us",s.about||"","about"],
      media:["Media Intern",s.media||"","media"],
      archaeology:["Archaeological Interns",s.archaeology||"","archaeology"],
      engineering:["Environmental Engineering",s.engineering||"","engineering"]
    };
    return `<div class="tr-compact-passage" dir="ltr">
      ${parts.map(key=>{
        const item=map[key];
        if(!item || !item[1])return "";
        return `<section>
          <h3>${esc(item[0])}</h3>
          <p>${sentenceMarkup(item[1],item[2])}</p>
        </section>`;
      }).join("")}
    </div>`;
  }

  function afterReadingEvidenceDrawer(s){
    return `<details class="tr-evidence-drawer">
      <summary>Open the text & résumé to find evidence</summary>
      <div class="tr-evidence-content">
        ${compactPassageHTML(s)}
        <div class="tr-evidence-resume">${resumeHTML(s.resume)}</div>
      </div>
    </details>`;
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
      {
        stem:"JobPool has been growing since the year 2000.", answer:0,
        evidence:"Since its foundation in 2000, the company has constantly improved ... JobPool has been growing globally."
      },
      {
        stem:"The archaeological interns get a good salary.", answer:1,
        evidence:"This is an unpaid three-month internship, but lodging and meals are provided near the site."
      },
      {
        stem:"The media intern needs to speak several languages.", answer:1,
        evidence:"The opening says the intern needs to be fluent in English; it does not require several languages."
      },
      {
        stem:"The candidate for the engineering job must be good at reading blueprints.", answer:0,
        evidence:"You need to be able to read blueprints."
      },
      {
        stem:"Carl has experience with word-processing programs.", answer:0,
        evidence:"Skills: Computer expertise in word-processing and graphic programs."
      },
      {
        stem:"One of Carl’s articles has appeared in newspapers all over the country.", answer:1,
        evidence:"The résumé says an article appeared in the local press, not newspapers all over the country."
      }
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
              ${state.revealed?`<div class="tr-exit-evidence"><b>Evidence:</b> ${esc(q.evidence)}</div>`:""}
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

    const quickWords=["interns","fluent","painstaking","lodging","blueprints"];

    const contextQuestion={
      skill:"Vocabulary in Context",
      stem:"In the passage, the word “painstaking” is closest in meaning to ___.",
      choices:[
        "requiring a lot of care and effort",
        "quick and effortless",
        "highly paid",
        "done only by machines"
      ],
      answer:0,
      explanation:"The surrounding sentences describe the archaeological work as hard, slow, and careful.",
      need:"Find the word, then read the sentence around it for clues."
    };

    return [
      {
        label:"1 • Start",
        kicker:"Our Reading Routine",
        title:"Read smarter, not harder",
        body:`
          ${routineStrip("preview")}
          <div class="tr-routine-hero">
            <div>
              <span class="tr-routine-pill">Today’s goal</span>
              <h2>Learn the routine we will use in every Reading lesson.</h2>
              <p>Do not start by translating every word. First decide what the question needs.</p>
            </div>
            <div class="tr-routine-rule">I don’t need to understand every word to understand the text.</div>
          </div>
          ${textbookBadge("Before Reading", "26")}
          <div class="tr-preview-card" dir="ltr">
            <span class="tr-preview-label">Title</span>
            <h2>JobPool Has the Job for You</h2>
            <span class="tr-preview-label">Headings</span>
            <div class="tr-preview-headings">
              <span>About Us</span>
              <span>Media Intern</span>
              <span>Archaeological Interns</span>
              <span>Environmental Engineering</span>
            </div>
          </div>
          <div class="tr-teacher-prompt">
            <b>Ask the class:</b> “What do you expect this text to be mainly about?”
            <br><small>Then connect to the textbook Before Reading task: find what a person should be able to do in each job.</small>
          </div>`
      },

      {
        label:"2 • Vocabulary",
        kicker:"Quick Vocabulary",
        title:"Only the words that may block understanding",
        body:`
          ${routineStrip("preview")}
          <div class="tr-vocab-grid tr-vocab-compact">
            ${quickWords.map(word=>`
              <div class="tr-vocab-card">
                <div class="tr-vocab-top">
                  <b>${esc(word)}</b>
                  <button onclick="STEPUP_TEACH_READING.readWord('${word.replace(/'/g,"\\'")}')">🔊</button>
                </div>
                <button class="tr-meaning-toggle" onclick="STEPUP_TEACH_READING.toggleMeaning(this)">Show meaning</button>
                <span class="tr-vocab-meaning">${esc(VOCAB[word]||"")}</span>
              </div>`).join("")}
          </div>
          <div class="tr-routine-rule small">
            If a word does not stop your understanding or the answer, keep reading.
          </div>
          <div class="tr-teacher-prompt"><b>Quick check:</b> Which word means “a place to stay”?</div>`
      },

      {
        label:"3 • Main Idea",
        kicker:"Learn → Try",
        title:"Main Idea — Predict → Read → Confirm",
        timed:true,
        timerSeconds:60,
        audioQueue:fullQueue,
        body:`
          ${routineStrip("main")}
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Start with the title</b><small>It gives you the broad topic.</small></div>
            <div><span>2</span><b>Scan the headings</b><small>Look for what all sections have in common.</small></div>
            <div><span>3</span><b>Predict, then confirm</b><small>Choose the idea that covers the whole text.</small></div>
          </div>
          <div class="tr-class-reading-block">
            ${audioControls("Listen to Full Text")}
            ${compactPassageHTML(s)}
          </div>
          <div class="tr-class-try-label">Try it now</div>
          ${simpleQuestion(q[0], "Main Idea • Does your answer cover the whole text?")}`
      },

      {
        label:"4 • Scanning",
        kicker:"Learn → Try",
        title:"Scanning — Find the clue fast",
        timed:true,
        timerSeconds:45,
        audioQueue:[
          {mode:"scan-media",text:s.media||""},
          {mode:"scan-archaeology",text:s.archaeology||""},
          {mode:"scan-engineering",text:s.engineering||""}
        ].filter(x=>x.text),
        body:`
          ${routineStrip("scan")}
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Read the question first</b><small>Know exactly what you are looking for.</small></div>
            <div><span>2</span><b>Pick a keyword</b><small>Job title, number, skill, paid/unpaid, or requirement.</small></div>
            <div><span>3</span><b>Scan → Stop → Read</b><small>Move your eyes quickly, then read the matching sentence carefully.</small></div>
          </div>
          <div class="tr-class-reading-block">
            ${audioControls("Listen to the Openings")}
            ${compactPassageHTML(s,["media","archaeology","engineering"])}
          </div>
          <div class="tr-class-try-label">Try it now • What keyword should your eyes search for?</div>
          ${simpleQuestion(q[1], "Scanning • Find the exact clue before choosing.")}`
      },

      {
        label:"5 • Context",
        kicker:"Learn → Try",
        title:"Vocabulary in Context — Use the words around it",
        timed:true,
        timerSeconds:45,
        audioMode:"context-archaeology",
        audioText:s.archaeology||"",
        body:`
          ${routineStrip("context")}
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Find the target word</b><small>Scan until your eyes reach it.</small></div>
            <div><span>2</span><b>Read around it</b><small>Use nearby words and sentences as clues.</small></div>
            <div><span>3</span><b>Choose the closest meaning</b><small>Reject meanings that do not fit the context.</small></div>
          </div>
          <div class="tr-class-reading-block">
            ${readingCard("Archaeological Interns",s.archaeology||"","context-archaeology","Listen to the Paragraph")}
          </div>
          <div class="tr-class-try-label">Try it now • Do not translate first</div>
          ${simpleQuestion(contextQuestion, "Context • Find → Read around → Use clues")}`
      },

      {
        label:"6 • Inference",
        kicker:"Learn → Try",
        title:"Inference — The answer is supported, not copied",
        timed:true,
        timerSeconds:45,
        audioMode:"infer-media",
        audioText:s.media||"",
        body:`
          ${routineStrip("infer")}
          <div class="tr-strategy-grid">
            <div><span>1</span><b>Collect clues</b><small>Find two or more useful details.</small></div>
            <div><span>2</span><b>Connect the clues</b><small>Match them to what the question asks.</small></div>
            <div><span>3</span><b>Choose the best fit</b><small>Reject answers that add unsupported ideas.</small></div>
          </div>
          <div class="tr-class-reading-block">
            ${readingCard("Media Intern",s.media||"","infer-media","Listen to the Paragraph")}
          </div>
          <div class="tr-class-try-label">Try it now • What clues support your answer?</div>
          ${simpleQuestion(q[2], "Inference • Find clues → Connect → Choose")}`
      },

      {
        label:"7 • Résumé",
        kicker:"Same strategy • New text shape",
        title:"Scan Carl’s résumé",
        timed:true,
        timerSeconds:45,
        audioQueue:resumeQueue(s.resume),
        body:`
          ${routineStrip("scan")}
          ${textbookBadge("Résumé", "27")}
          <div class="tr-resume-task">
            <b>Do not read every line.</b>
            <span>Find <strong>Experience</strong> → Find <strong>Skills</strong> → Find the clue.</span>
          </div>
          ${resumeHTML(s.resume)}
          <div class="tr-teacher-prompt">
            <b>Ask:</b> “If the question asks about word-processing, where should your eyes go first?”
            <br><small>Goal: show that Scanning still works when the text format changes.</small>
          </div>`
      },

      {
        label:"8 • After Reading",
        kicker:"Final Check • Student Book",
        title:"Find the keyword → Find the evidence → Decide",
        timed:true,
        timerSeconds:60,
        body:`
          ${routineStrip("check")}
          <div class="tr-after-reading-guide">
            <span><b>1</b> Read the statement</span>
            <span><b>2</b> Pick the keyword</span>
            <span><b>3</b> Find the evidence</span>
            <span><b>4</b> Decide True / False</span>
          </div>
          ${exitCheckHTML()}
          ${afterReadingEvidenceDrawer(s)}`
      },

      {
        label:"9 • Wrap-up",
        kicker:"Use this every time",
        title:"Our Reading Routine",
        body:`
          ${routineStrip("")}
          <div class="tr-wrap-grid">
            <div><b>Main Idea</b><span>Whole text → title + headings + repeated idea</span></div>
            <div><b>Scanning</b><span>Question first → keyword → clue</span></div>
            <div><b>Context</b><span>Find word → read around → use clues</span></div>
            <div><b>Inference</b><span>Find clues → connect → best supported answer</span></div>
          </div>
          <div class="tr-routine-hero tr-wrap-final">
            <div>
              <span class="tr-routine-pill">From the next Reading lesson</span>
              <h2>You already know the routine.</h2>
              <p>At home in StepUp: learn the strategy, apply it immediately, and improve speed + accuracy.</p>
            </div>
            <div class="tr-routine-rule">What strategy do you need more practice with?</div>
          </div>
          <div class="tr-teacher-prompt"><b>Exit question:</b> “What will you do first when you see a long Reading text?”</div>`
      }
    ];
  }

  function studentLessonSteps() {
    const all = lessonSteps();
    const find = (test) => all.find(test) || {};

    const warm = find(x => x.label === "Warm-up");
    const preview = find(x => x.label === "Preview");
    const vocab = find(x => x.label === "Vocabulary");
    const mainIdea = find(x => x.label === "Strategy • Main Idea");
    const mainCheck = find(x => x.label === "Main Idea Check");
    const fullReading = find(x => x.label === "Full Reading");
    const scanning = find(x => x.label === "Strategy • Scanning");
    const scanCheck = find(x => x.label === "Quick Check");
    const detailCheck = find(x => x.label === "Detail Check");
    const inference = find(x => x.label === "Strategy • Inference");
    const guidedInference = find(x => x.label === "Guided Practice" && x.kicker === "Inference");
    const afterReading = find(x => x.label === "After Reading");

    return [
      {
        label:"1 • Before Reading",
        kicker:"Before Reading",
        title:"Preview before you read",
        body:`
          ${warm.body || ""}
          <div class="tr-student-divider"></div>
          ${preview.body || ""}
        `
      },
      {
        label:"2 • Vocabulary",
        kicker:"Key Vocabulary",
        title:"Words that help you understand the text",
        body:vocab.body || ""
      },
      {
        label:"3 • Main Idea",
        kicker:"Reading Strategy",
        title:"Main Idea — Predict → Read → Confirm",
        body:`
          ${mainIdea.body || ""}
          <div class="tr-student-divider"></div>
          ${mainCheck.questionHTML || ""}
        `
      },
      {
        label:"4 • Read & Listen",
        kicker:"Original Text",
        title:"JobPool Has the Job for You",
        audioQueue:fullReading.audioQueue || [],
        body:fullReading.body || ""
      },
      {
        label:"5 • Scanning",
        kicker:"Reading Strategy",
        title:"Scanning for Details",
        body:`
          ${scanning.body || ""}
          <div class="tr-student-divider"></div>
          ${scanCheck.questionHTML || ""}
          <div class="tr-student-mini-gap"></div>
          ${detailCheck.questionHTML || ""}
        `
      },
      {
        label:"6 • Inference",
        kicker:"Reading Strategy",
        title:"Use clues to infer",
        body:`
          ${inference.body || ""}
          <div class="tr-student-divider"></div>
          ${guidedInference.questionHTML || ""}
        `
      },
      {
        label:"7 • After Reading",
        kicker:"Textbook Check",
        title:"Check your understanding",
        body:afterReading.questionHTML || afterReading.body || ""
      },
      {
        label:"8 • Apply",
        kicker:"Ready to Apply",
        title:"Use the three strategies",
        body:`
          <div class="tr-student-apply">
            <span class="tr-apply-icon">✓</span>
            <h2>Now apply what you learned</h2>
            <p>Use <b>Main Idea</b>, <b>Scanning</b>, and <b>Inference</b> in the 4 Reading questions.</p>
            <div class="tr-apply-strategies">
              <span>Main Idea</span>
              <span>Scanning</span>
              <span>Inference</span>
            </div>
            <small>Your answers will be saved in your Unit 2 progress.</small>
          </div>
        `
      }
    ];
  }

  function activeLessonSteps() {
    return state.context === "student" ? studentLessonSteps() : lessonSteps();
  }

  function currentStep() {
    const steps = activeLessonSteps();
    return steps[state.step] || steps[0];
  }

  function render() {
    stopSpeech();
    const isStudent = state.context === "student";
    const app = isStudent
      ? (document.querySelector(".student-view") || document.getElementById("app"))
      : document.getElementById("app");
    if (!app) return;

    const steps = activeLessonSteps();
    const s = steps[state.step] || steps[0];
    const progress = Math.round(((state.step + 1) / steps.length) * 100);

    syncClassTimerForStep(s);
    let content = s.questionHTML || s.body || "";
    if(!isStudent && s.timed){
      content = classTimerHTML(s.timerSeconds||45) + content;
    }
    if (isStudent) {
      content = content
        .replaceAll("Teacher cue:", "Think:")
        .replaceAll("Original textbook task:", "Textbook task:");
    }

    app.innerHTML = `
      <div class="tr-shell ${isStudent ? "tr-student-shell" : ""}">
        <header class="tr-toolbar">
          <div class="tr-brand">
            <div class="tr-logo">SU</div>
            <div>
              <strong>StepUp • ${isStudent ? "Reading Lesson" : "Teach Reading"}</strong>
              <small>Unit 2 • Careers • ${isStudent ? "Reading journey" : "Reading Routine • 9 stops"}</small>
            </div>
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
          <section class="tr-content">${content}</section>
          <footer class="tr-nav">
            <button class="secondary" onclick="STEPUP_TEACH_READING.prev()" ${state.step === 0 ? "disabled" : ""}>← Back</button>
            <div class="tr-dots">${steps.map((_,i)=>`<span class="${i===state.step?"active":i<state.step?"done":""}"></span>`).join("")}</div>
            ${state.step < steps.length - 1
              ? `<button class="primary" onclick="STEPUP_TEACH_READING.next()">Next →</button>`
              : `<button class="primary" onclick="STEPUP_TEACH_READING.finish()">${isStudent?"Finish & Practice ✓":"Finish Lesson ✓"}</button>`}
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

  function resetTeacherTimerState(){
    clearClassTimerHandle();
    state.classTimerStep=-1;
    state.classTimerTotal=45;
    state.classTimerRemaining=45;
    state.classTimerRunning=false;
    state.classTimerFinished=false;
  }

  function start(){
    if(!document.querySelector(".teacher-classmode-v2")){
      alert("Teach Reading is available from Teacher > Class Mode.");
      return;
    }
    stopSpeech();
    resetTeacherTimerState();
    state.context="teacher";
    state.step=0;
    state.revealed=false;
    state.selectedAnswers={};
    render();
  }

  function startStudent(){
    if(window.STEPUP_U2_EXAM?.readingLesson){
      window.STEPUP_U2_EXAM.readingLesson();
      return;
    }
    stopSpeech();
    resetTeacherTimerState();
    state.context="student";
    state.step=0;
    state.revealed=false;
    state.selectedAnswers={};
    render();
  }

  function next(){
    const steps=activeLessonSteps();
    if(state.step<steps.length-1){
      stopSpeech();
      clearClassTimerHandle();
      state.step++;
      state.revealed=false;
      render();
    }
  }

  function prev(){
    if(state.step>0){
      stopSpeech();
      clearClassTimerHandle();
      state.step--;
      state.revealed=false;
      render();
    }
  }

  function reveal(){stopSpeech();state.revealed=true;render()}

  function exitLesson(){
    stopSpeech();
    resetTeacherTimerState();
    const wasStudent=state.context==="student";
    state.step=0;
    state.revealed=false;
    state.selectedAnswers={};
    if(wasStudent){
      state.context="teacher";
      if(window.STEPUP_U2_EXAM?.open)window.STEPUP_U2_EXAM.open();
      return;
    }
    if(window.PROVE?.setTeacherTab)window.PROVE.setTeacherTab("classmode");
  }

  function finishLesson(){
    stopSpeech();
    resetTeacherTimerState();
    const wasStudent=state.context==="student";
    state.step=0;
    state.revealed=false;
    state.selectedAnswers={};
    if(wasStudent){
      state.context="teacher";
      if(window.STEPUP_U2_EXAM?.start)window.STEPUP_U2_EXAM.start("reading");
      return;
    }
    if(window.PROVE?.setTeacherTab)window.PROVE.setTeacherTab("classmode");
  }

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
      .tr-preview-card{border:1px solid #dde6f1;border-radius:22px;padding:26px;background:linear-gradient(145deg,#fbfdff,#f8f4ff);margin-bottom:18px}.tr-preview-card h2{font-size:30px;margin:8px 0 22px;color:#2c347d}.tr-preview-label{display:block;font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#667085}.tr-preview-headings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.tr-preview-headings span{padding:13px 15px;border-radius:14px;background:#fff;border:1px solid #dce4ee;font-weight:800;color:#344054}
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

      .tr-routine-strip{
        display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-bottom:16px;
      }
      .tr-routine-strip span{
        display:flex;align-items:center;justify-content:center;gap:6px;min-height:38px;
        padding:7px 8px;border:1px solid #e1e7ef;border-radius:12px;background:#fff;
        color:#637187;font-size:11px;font-weight:800;text-align:center;
      }
      .tr-routine-strip span b{
        width:21px;height:21px;display:grid;place-items:center;border-radius:50%;
        background:#edf2f8;color:#50627a;font-size:10px;
      }
      .tr-routine-strip span.active{
        border-color:#bcd3ea;background:#eef6ff;color:#234f78;
      }
      .tr-routine-strip span.active b{background:#234f78;color:#fff}
      .tr-routine-hero{
        display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.5fr);
        gap:14px;align-items:stretch;margin-bottom:16px;
      }
      .tr-routine-hero>div:first-child{
        padding:18px;border:1px solid #e1e8f0;border-radius:18px;background:#fff;
      }
      .tr-routine-hero h2{margin:6px 0 7px;font-size:24px;color:#172033}
      .tr-routine-hero p{margin:0;color:#5c6d82;line-height:1.6}
      .tr-routine-pill{
        display:inline-flex;padding:6px 9px;border-radius:999px;background:#eef4fb;
        color:#315b86;font-size:11px;font-weight:900;
      }
      .tr-routine-rule{
        display:grid;place-items:center;padding:17px;border-radius:18px;
        background:#173b63;color:#fff;font-weight:900;line-height:1.55;text-align:center;
      }
      .tr-routine-rule.small{margin-top:13px;padding:11px 13px;border-radius:13px;font-size:12px}
      .tr-vocab-compact{grid-template-columns:repeat(5,minmax(0,1fr))}
      .tr-class-timer{
        display:flex;align-items:center;justify-content:space-between;gap:12px;
        margin-bottom:14px;padding:10px 12px;border:1px solid #dbe5ef;border-radius:15px;
        background:#f8fbff;
      }
      .tr-class-timer.time-up{border-color:#e1c6c6;background:#fff7f7}
      .tr-class-timer-main{display:flex;align-items:center;gap:8px}
      .tr-class-timer-main>b{
        min-width:58px;font-size:21px;color:#173b63;font-variant-numeric:tabular-nums;
      }
      .tr-class-timer-main>small{color:#6d7d90;font-size:11px}
      .tr-class-timer.time-up .tr-class-timer-main>b{color:#9d3131}
      .tr-class-timer-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
      .tr-class-timer-actions button{
        min-height:36px;padding:7px 10px;border:1px solid #cfdae7;border-radius:10px;
        background:#fff;color:#35506f;font-weight:800;cursor:pointer;
      }
      .tr-class-timer-actions button.primary{background:#173b63;color:#fff;border-color:#173b63}
      .tr-class-reading-block{margin:14px 0}
      .tr-compact-passage{
        max-height:360px;overflow:auto;padding:15px;border:1px solid #e0e6ed;
        border-radius:17px;background:#fff;
      }
      .tr-compact-passage section+section{margin-top:15px;padding-top:14px;border-top:1px solid #edf1f5}
      .tr-compact-passage h3{margin:0 0 6px;color:#22384f;font-size:16px}
      .tr-compact-passage p{margin:0;color:#394b60;line-height:1.8}
      .tr-class-try-label{
        margin:16px 0 9px;padding:8px 11px;border-radius:11px;
        background:#173b63;color:#fff;font-size:12px;font-weight:900;
      }
      .tr-resume-task{
        display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:10px 0 13px;
        padding:11px 13px;border-radius:13px;background:#eef6ff;color:#315274;
      }
      .tr-resume-task>b{color:#173b63}
      .tr-after-reading-guide{
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0 16px;
      }
      .tr-after-reading-guide span{
        display:flex;align-items:center;gap:7px;padding:9px 10px;border:1px solid #e1e7ef;
        border-radius:12px;background:#fff;color:#4d6077;font-size:11px;font-weight:800;
      }
      .tr-after-reading-guide b{
        width:22px;height:22px;display:grid;place-items:center;border-radius:50%;
        background:#eef4fb;color:#234f78;
      }
      .tr-exit-evidence{
        margin-top:9px;padding:8px 9px;border-radius:10px;background:#eef6ff;
        color:#315274;font-size:11px;line-height:1.5;
      }
      .tr-evidence-drawer{
        margin-top:14px;border:1px solid #dfe6ee;border-radius:14px;background:#fafbfd;overflow:hidden;
      }
      .tr-evidence-drawer summary{
        padding:11px 13px;cursor:pointer;color:#315274;font-size:12px;font-weight:900;
      }
      .tr-evidence-content{padding:0 12px 12px}
      .tr-evidence-content .tr-compact-passage{max-height:320px}
      .tr-evidence-resume{margin-top:12px}
      .tr-wrap-grid{
        display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0 16px;
      }
      .tr-wrap-grid>div{
        padding:13px;border:1px solid #e1e8f0;border-radius:15px;background:#fff;
      }
      .tr-wrap-grid b{display:block;color:#173b63;margin-bottom:4px}
      .tr-wrap-grid span{color:#647388;font-size:12px;line-height:1.5}
      .tr-wrap-final{margin-top:14px}
      @media(max-width:850px){
        .tr-routine-strip{grid-template-columns:repeat(3,minmax(0,1fr))}
        .tr-routine-hero{grid-template-columns:1fr}
        .tr-vocab-compact{grid-template-columns:repeat(2,minmax(0,1fr))}
        .tr-after-reading-guide{grid-template-columns:repeat(2,minmax(0,1fr))}
        .tr-class-timer{align-items:flex-start;flex-direction:column}
        .tr-class-timer-actions{justify-content:flex-start}
      }
      .tr-student-divider{height:1px;background:#e8edf3;margin:18px 0}
      .tr-student-mini-gap{height:12px}
      .tr-student-apply{
        max-width:680px;margin:0 auto;text-align:center;padding:28px 22px;
        border:1px solid #e1e8f0;border-radius:22px;background:#fbfcfe;
      }
      .tr-apply-icon{
        width:48px;height:48px;margin:0 auto 12px;display:grid;place-items:center;
        border-radius:50%;background:#e9f6ee;color:#178a55;font-size:22px;font-weight:900;
      }
      .tr-student-apply h2{margin:0 0 8px;font-size:24px}
      .tr-student-apply p{margin:0 auto 14px;max-width:560px;line-height:1.6;color:#4f5f73}
      .tr-apply-strategies{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:12px 0}
      .tr-apply-strategies span{
        padding:7px 10px;border-radius:999px;background:#eef4fb;color:#234d78;
        font-size:12px;font-weight:800;
      }
      .tr-student-apply small{display:block;margin-top:8px;color:#6a778c}
      .tr-student-shell{min-height:auto;border-radius:22px;overflow:hidden}
      .tr-student-shell .tr-stage{max-width:1120px}
      @media(max-width:850px){.tr-skill-grid,.tr-warm-grid,.tr-strategy-grid,.tr-vocab-grid,.tr-question-grid,.tr-exit-grid,.tr-exit-six,.tr-preview-headings{grid-template-columns:1fr}.tr-stage{padding:20px 16px}.tr-content{padding:20px;min-height:auto}.tr-step-head h1{font-size:28px}.tr-reading-card{font-size:18px}.tr-toolbar{padding:0 14px}.tr-brand small{display:none}.tr-nav{grid-template-columns:110px 1fr 110px}.tr-nav button{padding:11px 8px}.tr-audio-bar{grid-template-columns:1fr}.tr-audio-status{text-align:left}}
    `;document.head.appendChild(s)
  }

  function sync(){injectStyles();injectSkillPanel()}
  const boot=()=>{sync();if("speechSynthesis" in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices()}state.observer=new MutationObserver(sync);state.observer.observe(document.body,{childList:true,subtree:true})};
  window.addEventListener("pagehide",stopSpeech);window.addEventListener("beforeunload",stopSpeech);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

  window.STEPUP_TEACH_READING={
    start,
    startStudent,
    next,
    prev,
    reveal,
    exit:exitLesson,
    finish:finishLesson,
    playCurrent,
    pauseResume,
    stopSpeech,
    setRate,
    readWord,
    toggleMeaning,
    toggleWord,
    selectAnswer,
    checkAnswer,
    selectExitAnswer,
    checkExitAnswers,
    setTimer:setClassTimer,
    startTimer:startClassTimer,
    pauseTimer:pauseClassTimer,
    resetTimer:resetClassTimer
  };
})();
