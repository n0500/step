// StepUp • Unit 1 deterministic full review coverage — 2026-10-01
// Every approved Unit 1 review question is shown once; prior answers remain credited.
(() => {
  'use strict';

  const J = window.STEPUP_JOURNEY;
  if (!J?.data) return;

  const VERSION = 'u1-review-accuracy-20261010-4';
  const MASTERY = 80;
  const UNIT_ID = 'u1';
  const UNIT_NUMBER = 1;
  const UNIT = (J.data.units || []).find(u => u.id === UNIT_ID || Number(u.number) === UNIT_NUMBER);
  if (!UNIT) return;

  const old = {
    html: J.html,
    homeHTML: J.homeHTML,
    progressHTML: J.progressHTML,
    openUnit: J.openUnit,
    go: J.go
  };

  let attempts = [];
  let openUnits = [];
  let profile = null;
  let session = null;
  let saving = false;
  let audio = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function mission(type, index = 0){
    return (UNIT.missions || []).filter(m => m.type === type)[index] || null;
  }

  function reviewQuestionsFor(m, stage){
    if (!m) return [];
    return (J.data.questions || []).filter(q =>
      q.unit_id === 'MG1_U1' &&
      q.mission === m.source &&
      q.stage === stage &&
      q.review_status !== 'مستبعد'
    );
  }

  const coreMissions = (UNIT.missions || []).filter(m => m.type === 'core');
  const sections = {};
  coreMissions.forEach((m, i) => {
    sections[`core-${i+1}`] = {
      key:`core-${i+1}`,
      title:m.title,
      sub:m.sub || 'Review',
      icon:['💬','🧩','🔄','⏳'][i] || '🧩',
      questions:reviewQuestionsFor(m, 'Mastery'),
      trainingId:`journey-u1-core-${i+1}`,
      trainingType:i===0 ? 'vocabulary' : 'grammar',
      pass:67
    };
  });

  const readingMission = mission('reading');
  const listeningMission = mission('listening');
  const finalMission = mission('final');

  sections.reading = {
    key:'reading', title:'Reading', sub:readingMission?.title || 'Reading comprehension', icon:'📖',
    questions:reviewQuestionsFor(readingMission, 'Mastery'),
    trainingId:'journey-u1-reading', trainingType:'reading', pass:67
  };
  sections.listening = {
    key:'listening', title:'Listening', sub:listeningMission?.title || 'Listening comprehension', icon:'🎧',
    questions:reviewQuestionsFor(listeningMission, 'Mastery'),
    trainingId:'journey-u1-listening', trainingType:'listening', pass:67
  };
  sections.final = {
    key:'final', title:'Final Challenge', sub:finalMission?.title || 'Final Challenge', icon:'🏁',
    questions:reviewQuestionsFor(finalMission, 'Final Challenge'),
    trainingId:'journey-u1-final', trainingType:'challenge', pass:83
  };

  const requiredKeys = [...Object.keys(sections).filter(k => k.startsWith('core-')), 'reading', 'listening', 'final'];
  const TOTAL_REQUIRED = requiredKeys.reduce((n, k) => n + sections[k].questions.length, 0);

  function openSet(list){
    return new Set((list || []).map(x => typeof x === 'string' ? x : x?.id).filter(Boolean));
  }

  function hydrate(a, o, p){
    attempts = Array.isArray(a) ? a : [];
    openUnits = Array.isArray(o) ? o : [];
    profile = p || null;
  }

  function unitOpen(){
    const set = openSet(openUnits);
    return !set.size || set.has('u1');
  }

  function stageAttempts(trainingId){
    return attempts.filter(a => a.trainingId === trainingId && a.recordKind !== 'question');
  }

  function oldAnswerRecords(sectionKey, questionId){
    const sec = sections[sectionKey];
    const out = [];
    stageAttempts(sec.trainingId).forEach(a => {
      (Array.isArray(a.answers) ? a.answers : []).forEach(ans => {
        const id = ans?.question_id || ans?.questionId;
        if (id === questionId){
          out.push({
            correct: ans.correct === true,
            bestCorrect: ans.correct === true,
            selected: ans.selected,
            selectedText: ans.selectedText || '',
            submittedAt: a.submittedAt || ''
          });
        }
      });
    });
    return out;
  }

  function questionRecords(sectionKey, questionId){
    const newer = attempts.filter(a =>
      a.recordKind === 'question' &&
      a.examUnit === 'u1' &&
      a.examSection === sectionKey &&
      a.questionId === questionId
    );
    return oldAnswerRecords(sectionKey, questionId).concat(newer)
      .sort((a,b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
  }

  function latestQuestion(sectionKey, questionId){
    return questionRecords(sectionKey, questionId)[0] || null;
  }

  // Full-review summaries carry cumulative credits. The actual saved answer
  // takes precedence when showing which questions currently need review.
  function reviewQuestion(sectionKey, questionId){
    return attempts.filter(a => a.recordKind === 'question' && a.examUnit === 'u1' &&
      a.examSection === sectionKey && a.questionId === questionId)
      .sort((a,b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')))[0]
      || latestQuestion(sectionKey, questionId);
  }

  function reviewCorrectCount(key){
    return sections[key].questions.filter(q => reviewQuestion(key,q.question_id)?.correct === true).length;
  }

  function reviewAccuracyPct(){
    const correct=requiredKeys.reduce((n,key)=>n+reviewCorrectCount(key),0);
    return Math.min(correct<TOTAL_REQUIRED?99:100,Math.round(correct/Math.max(1,TOTAL_REQUIRED)*100));
  }

  function bestQuestion(sectionKey, questionId){
    const list = questionRecords(sectionKey, questionId);
    return list.find(a => a.correct === true) || list.find(a => a.bestCorrect === true) || list[0] || null;
  }

  function answeredCount(sectionKey){
    const sec = sections[sectionKey];
    return sec.questions.filter(q => !!latestQuestion(sectionKey, q.question_id)).length;
  }

  function correctCount(sectionKey){
    const sec = sections[sectionKey];
    return sec.questions.filter(q => {
      const a = bestQuestion(sectionKey, q.question_id);
      return !!(a?.correct || a?.bestCorrect);
    }).length;
  }

  function sectionDone(sectionKey){
    const sec = sections[sectionKey];
    return sec.questions.length > 0 && answeredCount(sectionKey) >= sec.questions.length;
  }

  function requiredAnswered(){
    return requiredKeys.reduce((n,k) => n + answeredCount(k), 0);
  }

  function requiredCorrect(){
    return requiredKeys.reduce((n,k) => n + correctCount(k), 0);
  }

  function progressPct(){
    return TOTAL_REQUIRED ? Math.round(requiredAnswered() / TOTAL_REQUIRED * 100) : 0;
  }

  function accuracyPct(){
    const a = requiredAnswered();
    return a ? Math.round(requiredCorrect() / a * 100) : 0;
  }

  function qChoices(q){
    return [q.option_a_text, q.option_b_text, q.option_c_text, q.option_d_text];
  }

  function qAnswer(q){
    return ['option_a_id','option_b_id','option_c_id','option_d_id'].findIndex(k => q[k] === q.correct_option_id);
  }

  function pendingQuestions(sectionKey){
    const sec = sections[sectionKey];
    const missing = sec.questions.filter(q => !latestQuestion(sectionKey, q.question_id));
    const missed = sec.questions.filter(q => reviewQuestion(sectionKey, q.question_id)?.correct !== true);
    return missing.length ? missing : missed.length ? missed : [...sec.questions];
  }

  function nextMissingSection(){
    return requiredKeys.find(k => !sectionDone(k)) || null;
  }

  function nextReviewSection(){
    return nextMissingSection() || requiredKeys.find(k => sectionProgress(k).missed > 0) || null;
  }

  function sectionProgress(key){
    const sec = sections[key];
    if (!sec) return null;
    const answered = answeredCount(key), correct = correctCount(key), total = sec.questions.length;
    const accuracy = total ? Math.round(correct / total * 100) : 0;
    const done = total > 0 && answered === total;
    const reviewCorrect=reviewCorrectCount(key),missed=answered-reviewCorrect;
    return {answered,total,correct,accuracy,done,reviewCorrect,missed,
      reviewAccuracy:Math.min(reviewCorrect<total?99:100,Math.round(reviewCorrect/Math.max(1,total)*100)),mastered:done && reviewCorrect===total};
  }

  function readingText(){
    const training = (window.PROVEIT_DATA?.units || []).find(u => u.id === 'u1')?.trainings?.find(t => t.id === 'u1-reading');
    if (!training?.passage) return String(UNIT.reading || '');
    const box = document.createElement('div');
    box.innerHTML = training.passage;
    return [...box.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean).join('\n\n') || box.textContent.trim();
  }

  function questionContext(sectionKey, q){
    const reading = sectionKey === 'reading' || /^U1-FIN-0[78]$/.test(q.question_id);
    const conversation = /^U1-FIN-0[56]$/.test(q.question_id);
    const source = (window.MG1_KB?.chunks || []).find(c => c.id === 'unit_1_p011_c2')?.text || '';
    const dialogue = source.includes('Hans:') ? source.slice(source.indexOf('Hans:')).replace(/Y ou/g,'You').replace(/lot s/g,'lots').replace(/\s+([,.])/g,'$1') : '';
    return {context:reading ? readingText() : conversation ? dialogue : '', contextTitle:conversation ? 'Conversation context' : 'Reading passage', audio:sectionKey === 'listening' ? String(UNIT.listening || '') : ''};
  }

  function contextHTML(sectionKey, q){
    const content = questionContext(sectionKey, q);
    if (content.context) return `<section class="u1-review-context"><h3>${esc(content.contextTitle)}</h3><div class="journey-passage" dir="ltr">${content.context.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join('')}</div></section>`;
    if (content.audio) return `<section class="u1-review-context"><h3>Listening</h3><p>Listen before answering. You can replay the audio for every question.</p><div class="u1-audio-controls"><button type="button" class="journey-audio-btn" onclick="STEPUP_U1_REVIEW.playAudio()">▶ Play / replay audio</button><button type="button" class="journey-link-btn" onclick="STEPUP_U1_REVIEW.stopAudio()">Stop audio</button></div><p class="u1-audio-status" role="status" aria-live="polite"></p><details><summary>Show transcript for practice</summary><p dir="ltr">${esc(content.audio)}</p></details></section>`;
    return '';
  }

  function stopAudio(){
    if (audio) { audio.onstart = audio.onend = audio.onerror = null; audio = null; }
    try { window.speechSynthesis?.cancel(); } catch (_) {}
  }

  function playAudio(){
    const q = session?.queue[session.pos];
    const script = q && questionContext(session.sectionKey, q).audio;
    if (!script) return;
    stopAudio();
    const status = document.querySelector('.student-view .u1-audio-status');
    const say = message => { if (status?.isConnected) status.textContent = message; };
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return say('Audio is unavailable on this device. Try another browser or use the transcript for practice.');
    try {
      const speech = new window.SpeechSynthesisUtterance(script);
      audio = speech; speech.lang = 'en-US'; speech.rate = 0.88;
      const voice = window.speechSynthesis.getVoices?.().find(v => /^en[-_]/i.test(v.lang));
      if (voice) speech.voice = voice;
      speech.onstart = () => say('Playing audio…');
      speech.onend = () => { if (audio === speech) audio = null; say('Audio finished. Replay whenever you need.'); };
      speech.onerror = () => { if (audio === speech) audio = null; say('Audio could not play. Try replaying or use the transcript for practice.'); };
      say('Preparing audio…');
      window.speechSynthesis.speak(speech);
    } catch (_) { audio = null; say('Audio could not play. Try replaying or use the transcript for practice.'); }
  }

  function sectionCard(key){
    const sec = sections[key];
    const answered = answeredCount(key);
    const total = sec.questions.length;
    const state = sectionProgress(key),done=state.mastered;
    const label = `${state.missed?'Needs review • ':done?'All answers correct • ':''}${answered}/${total} answered • ${state.reviewCorrect}/${total} correct`;
    return `<button class="journey-stop ${done?'done':''} ${state.missed?'needs-review':''} ${nextReviewSection()===key?'current':''}" data-review-unit="u1" data-review-section="${key}" data-accuracy="${state.reviewAccuracy}" data-needs-review="${state.missed>0?1:0}" data-answered="${answered}" data-total="${total}" onclick="STEPUP_U1_REVIEW.start('${key}')">
      <span class="journey-stop-icon">${done?'✓':state.missed?'↻':sec.icon}</span>
      <span class="journey-stop-copy"><b>${esc(sec.title)}</b><small>${esc(label)}</small></span>
      <span class="journey-stop-arrow">›</span>
    </button>`;
  }

  function progressStatsHTML(){
    const answered = requiredAnswered();
    const correct = requiredKeys.reduce((n,key)=>n+reviewCorrectCount(key),0);
    return `<div class="u1-review-stats">
      <span><b>${answered}/${TOTAL_REQUIRED}</b><small>Questions answered</small></span>
      <span><b>${correct}/${TOTAL_REQUIRED}</b><small>Review accuracy • ${reviewAccuracyPct()}%</small></span>
    </div>`;
  }

  function openUnit1(){
    session = null; saving = false; stopAudio();
    if (!unitOpen()) return old.openUnit('u1');
    const h = document.querySelector('.student-view');
    if (!h) return;
    const next = nextReviewSection();
    const accuracy = reviewAccuracyPct();
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="PROVE.setStudentTab('journey')">My Journey</button><span>›</span><b>Unit 1</b></div>
      <section class="journey-unit-hero" data-review-unit="u1" data-ring-pct="${accuracy}" data-ring-label="review accuracy">
        <span class="journey-kicker">Unit 1 • Full Review</span>
        <h1>Big Changes</h1>
        <p>Your correct answers stay credited. Complete the remaining questions, then review missed answers to improve your accuracy.</p>
        <div class="journey-mini-progress"><i style="width:${accuracy}%"></i></div>
        ${progressStatsHTML()}
        <small class="u1-review-skill-count journey-review-skill-count">${requiredKeys.filter(k=>sectionProgress(k).mastered).length} of ${requiredKeys.length} skills mastered • Review any missed answers</small>
      </section>
      <section class="journey-master-card">
        <div class="journey-stage-title"><span>📚</span><div><h2>Review Path</h2><p>Answering every question completes the review. Correct answers measure mastery.</p></div><b>${accuracy}% accuracy</b></div>
        <div class="journey-stops">${requiredKeys.map(sectionCard).join('')}</div>
      </section>
      <section class="journey-master-card u1-step-extra">
        <div class="journey-stage-title"><span>STEP</span><div><h2>STEP Practice</h2><p>Extra timed strategy practice. It never blocks Unit 1 completion or the certificate.</p></div></div>
        <button class="journey-stop" onclick="STEPUP_JOURNEY.startStep('u1')"><span class="journey-stop-icon">⚡</span><span class="journey-stop-copy"><b>STEP Practice</b><small>Practice anytime • STEP Ready at 75%+</small></span><span class="journey-stop-arrow">›</span></button>
      </section>
      ${next ? `<button class="u1-review-continue" onclick="STEPUP_U1_REVIEW.start('${next}')">${nextMissingSection()?'Continue remaining questions':'Review missed answers'} →</button>` : `<div class="u1-review-done">All Unit 1 review questions are answered correctly.</div>`}`;
  }

  function startSection(sectionKey){
    const sec = sections[sectionKey];
    if (!sec || !sec.questions.length) return openUnit1();
    stopAudio();
    saving = false;
    session = {
      sectionKey,
      sec,
      queue: pendingQuestions(sectionKey),
      pos:0,
      correct:0,
      started:Date.now(),
      runAnswers:[],
      phase:'question',
      reviewRun: !sectionDone(sectionKey)
    };
    renderQuestion();
  }

  function renderQuestion(){
    if (!session) return;
    const h = document.querySelector('.student-view');
    if (!h) return;
    const q = session.queue[session.pos];
    if (!q) return;
    session.phase = 'question';
    const choices = qChoices(q);
    const seenBefore = !!latestQuestion(session.sectionKey, q.question_id);
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U1_REVIEW.open()">Unit 1</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      ${contextHTML(session.sectionKey, q)}
      <section class="journey-question-card">
        <div class="journey-question-meta"><span>${seenBefore?'Practice':'Required Review'}</span><b>${session.pos+1}/${session.queue.length}</b></div>
        <h2 dir="ltr">${esc(q.prompt)}</h2>
        <div class="journey-options">${choices.map((x,i) => `<button ${saving?'disabled':''} onclick="STEPUP_U1_REVIEW.answer(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join('')}</div>
        <small class="u1-review-source">${esc(q.source_ref || '')}</small>
      </section>`;
  }

  async function currentStudent(){
    if (!window.firebase?.auth || !window.firebase?.firestore) throw new Error('Firebase unavailable');
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('Student not signed in');
    // Reuse the signed-in student's known profile instead of a remote read per answer.
    if(profile?.role==='student' && (profile.id===user.uid || profile.uid===user.uid)){
      return {user,p:profile};
    }
    const snap = await firebase.firestore().collection('users').doc(user.uid).get();
    const p = snap.exists ? (snap.data() || {}) : {};
    return {user,p};
  }

  async function saveQuestion(sectionKey, q, selected){
    const {user,p} = await currentStudent();
    const answer = qAnswer(q);
    const choices = qChoices(q);
    const correct = selected === answer;
    const previous = questionRecords(sectionKey, q.question_id);
    const priorBest = previous.some(a => a.correct === true || a.bestCorrect === true);
    const now = new Date().toISOString();
    const record = {
      recordKind:'question', examUnit:'u1', examSection:sectionKey, questionId:q.question_id,
      studentId:user.uid, studentName:p.displayName || '', classId:p.classId || '', classCode:p.classCode || '', teacherId:p.teacherId || '',
      trainingId:`question-u1-${sectionKey}-${q.question_id}-${Date.now()}`,
      trainingTitle:sections[sectionKey].title, trainingType:'question', unitNumber:1,
      stem:q.prompt, skill:q.skill || sections[sectionKey].title,
      selected, selectedText:choices[selected] || '', correctAnswer:answer, correctText:choices[answer] || '', correct,
      score:correct?1:0, total:1, percentage:correct?100:0,
      bestCorrect:priorBest || correct, bestScore:(priorBest || correct)?1:0, bestPercentage:(priorBest || correct)?100:0,
      source:q.source_ref || '', studyMethod:'u1-full-review-question', submittedAt:now
    };
    await firebase.firestore().collection('attempts').add(record);
    attempts.push(record);
    return record;
  }

  function feedback(q, record, ticket){
    const h = document.querySelector('.student-view');
    if (!h) return;
    const choices = qChoices(q);
    const answer = qAnswer(q);
    const ok = record.correct;
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U1_REVIEW.open()">Unit 1</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      ${contextHTML(ticket.sectionKey, q)}
      <section class="journey-feedback ${ok?'good':'support'}">
        <span>${ok?'✓':'✕'}</span><h2>${ok?'Correct!':'Not quite'}</h2>
        <div class="u1-review-choice" dir="ltr"><b>Your answer:</b> ${esc(record.selectedText)}</div>
        ${!ok ? `<div class="u1-review-correct" dir="ltr"><b>Correct answer:</b> ${esc(choices[answer])}</div>` : ''}
        <p>${esc(q.explanation || (ok?'Great work.':'Review the clue and keep going.'))}</p>
        ${!ok && q.hint ? `<div class="u1-review-hint">💡 ${esc(q.hint)}</div>` : ''}
        <div class="u1-review-saved">Saved ✓</div>
        <button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.next()">Continue</button>
      </section>`;
  }


  function answer(selected){
    if(!session || session.phase !== 'question')return;
    const ticket=session,position=ticket.pos,q=ticket.queue[position],choice=Number(selected);
    if (!q || !Number.isInteger(choice) || choice < 0 || choice >= qChoices(q).length) return;
    return window.STEPUP_ANSWER_RESPONSE.submit({
      session:ticket,questionId:String(q.question_id),position,selected:choice,
      persist:()=>saveQuestion(ticket.sectionKey,q,choice),
      isActive:()=>session===ticket && session.pos===position,
      onStart:()=>{saving=true;ticket.phase='saving';},
      onSlow:()=>{saving=false;},
      onSaved:(record)=>{
        saving=false;
        ticket.phase='feedback';
        ticket.runAnswers.push(record);
        if(record.correct)ticket.correct++;
        feedback(q,record,ticket);
      },
      onError:(err)=>{
        saving=false;
        console.error('U1 answer save failed',err);
        renderQuestion();
      }
    });
  }

  async function saveSectionSummary(sectionKey, ticket){
    const sec = sections[sectionKey];
    const answers = sec.questions.map(q => {
      const a = bestQuestion(sectionKey, q.question_id);
      const choices = qChoices(q), correctAnswer = qAnswer(q);
      return {
        question_id:q.question_id, stem:q.prompt, skill:q.skill || sec.title,
        selected:Number(a?.selected ?? -1), correctAnswer,
        correct:!!(a?.correct || a?.bestCorrect), selectedText:a?.selectedText || '',
        correctText:choices[correctAnswer] || '', explanation:q.explanation || '', need:q.hint || ''
      };
    });
    const score = answers.filter(a => a.correct).length;
    const total = sec.questions.length;
    const percentage = total ? Math.round(score/total*100) : 0;
    const previous = stageAttempts(sec.trainingId);
    const priorBest = previous.reduce((m,a) => Math.max(m, Number(a.bestPercentage ?? a.percentage ?? 0)), 0);
    const payload = {
      trainingId:sec.trainingId, trainingTitle:sec.title, trainingType:sec.trainingType,
      unitId:'u1', unitNumber:1, score, total, percentage,
      attemptNumber:previous.length+1,
      attemptScore:ticket.runAnswers.filter(a => a.correct).length,
      attemptTotal:ticket.runAnswers.length,
      attemptPercentage:Math.round(ticket.runAnswers.filter(a=>a.correct).length / Math.max(1,ticket.runAnswers.length) * 100),
      bestScore:Math.max(score, Math.round(priorBest*total/100)), bestTotal:total, bestPercentage:Math.max(percentage, priorBest),
      elapsedSeconds:Math.max(1, Math.round((Date.now()-ticket.started)/1000)),
      answers, studyMethod:'u1-full-review'
    };
    await window.PROVE?.recordJourneyAttempt?.(payload);
    attempts.push({...payload, submittedAt:new Date().toISOString()});
    return payload;
  }

  async function next(){
    if (!session || session.phase !== 'feedback') return;
    stopAudio();
    if (session.pos < session.queue.length - 1){
      session.pos++;
      return renderQuestion();
    }

    return finishSection();
  }

  async function finishSection(){
    const ticket = session;
    if (!ticket || !['feedback','summary-error'].includes(ticket.phase)) return;
    const key = ticket.sectionKey, sec = ticket.sec;
    const h = document.querySelector('.student-view');
    const marker = h?.querySelector('.journey-feedback, .journey-result');
    ticket.phase = 'finishing';
    marker?.querySelectorAll('button').forEach(b => b.disabled = true);
    let summarySaved = true;
    try{
      await saveSectionSummary(key, ticket);
    } catch (e){
      console.warn('Unit 1 section summary save failed', e);
      summarySaved = false;
    }
    ticket.phase = summarySaved ? 'finished' : 'summary-error';
    if (session !== ticket || !h || !marker?.isConnected || marker.parentElement !== h) return;
    const score = ticket.runAnswers.filter(a => a.correct).length, total = ticket.runAnswers.length;
    const pct = total ? Math.round(score / total * 100) : 0;
    const cumulative = sectionProgress(key);
    const nextKey = nextMissingSection();
    h.innerHTML = `<section class="journey-result ${pct>=sec.pass?'good':'review'}" data-u1-run-result="1">
      <div class="journey-result-score">${score}<span>/${total}</span></div>
      <h2>Your score this time: ${pct}%</h2>
      <p>${total-score ? `${total-score} answer${total-score===1?'':'s'} to review. Check the corrections and try again.` : 'Every answer in this attempt was correct.'}</p>
      <p>Cumulative accuracy: ${cumulative.correct}/${cumulative.total} • ${cumulative.accuracy}%. Your previous correct answers stay credited.</p>
      ${!summarySaved ? '<p role="status">Your individual answers are saved. The section summary could not be saved yet.</p><button class="journey-link-btn" onclick="STEPUP_U1_REVIEW.retrySummary()">Retry saving section summary</button>' : ''}
      <div class="journey-result-actions">
        ${nextKey ? `<button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.start('${nextKey}')">Continue Review</button>` : `<button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.open()">Back to Unit 1</button>`}
        <button class="journey-link-btn" onclick="STEPUP_U1_REVIEW.start('${key}')">${cumulative.correct<cumulative.total?'Review missed answers':'Practice again'}</button>
      </div>
    </section>`;
  }

  function addStyles(){
    if (document.getElementById('u1FullReviewStyles')) return;
    const s = document.createElement('style');
    s.id = 'u1FullReviewStyles';
    s.textContent = `
      .u1-review-stats{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}
      .u1-review-stats>span{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid #e1e8f0;border-radius:14px;background:#fff}
      .u1-review-stats b{font-size:18px;color:#172033!important}.u1-review-stats small{font-size:12px;color:#526278!important}
      .u1-review-skill-count{display:block;margin-top:12px;font-weight:800}
      .u1-review-context{padding:18px;margin:12px 0;border:1px solid #dce6ef;border-radius:18px;background:#fff}
      .u1-review-context h3{margin:0 0 10px;font-size:19px}.u1-review-context p{font-size:16px;line-height:1.8}
      .u1-review-context .journey-passage{max-height:320px;overflow:auto;font-size:17px;line-height:1.85;padding:0 12px 0 0}
      .u1-review-context .journey-passage p{font-size:inherit}.u1-review-context details{margin-top:12px}
      .u1-audio-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.u1-audio-status:empty{display:none}
      .u1-review-choice{margin:10px 0;padding:10px;border-radius:12px;background:#f4f7fb}
      .journey-focus-roadmap[data-review-unit=u1] .journey-focus-stage{cursor:pointer;border:0;background:transparent;padding:0;font:inherit}
      .journey-focus-roadmap[data-review-unit=u1] .journey-focus-stage.needs-review .journey-focus-dot{background:#fff3de!important;border-color:#eac783!important;color:#8b560c!important}
      .journey-focus-roadmap[data-review-unit=u1] .journey-focus-stage em{font-style:normal;font-size:11px;line-height:1.4;margin-top:3px}
      .u1-step-extra{margin-top:14px}.u1-review-source{display:block;margin-top:14px;color:#78879a;font-size:12px}
      .u1-review-correct,.u1-review-hint{margin:10px 0;padding:11px 13px;border-radius:13px;background:#f3f6fb;color:#24354c}
      .u1-review-saved{display:inline-block;margin:8px 0;padding:7px 11px;border-radius:999px;background:#e7f7ee;color:#176b4a;font-weight:900}
      .u1-review-continue{width:100%;margin-top:14px;min-height:52px;border:0;border-radius:16px;background:#284f88;color:#fff;font-weight:900;cursor:pointer}
      .u1-review-done{margin-top:14px;padding:14px;border-radius:16px;background:#eaf7ef;color:#24623f;font-weight:900;text-align:center}
      @media(max-width:520px){.u1-review-stats{grid-template-columns:1fr 1fr}.u1-review-stats b{font-size:15px}}
    `;
    document.head.appendChild(s);
  }

  J.homeHTML = function(a,o,p){ hydrate(a,o,p); return old.homeHTML(a,o,p); };
  J.html = function(a,o,p){ hydrate(a,o,p); return old.html(a,o,p); };
  J.progressHTML = function(a,o,p){ hydrate(a,o,p); return old.progressHTML(a,o,p); };
  J.openUnit = function(uid){ if(uid==='u1') return openUnit1(); return old.openUnit(uid); };
  J.go = function(uid,key){ if(uid!=='u1') return old.go(uid,key); if(key==='step') return J.startStep('u1'); if(sections[key]) return startSection(key); return openUnit1(); };
  // Some decorations and old links call these entry points directly.
  // Unit 1 must always use the full-review feedback and context screens.
  ['startCore','startReading','startListening','startFinal'].forEach(name => {
    const original = J[name];
    if (typeof original !== 'function') return;
    J[name] = function(uid, index){
      if (uid !== 'u1') return original.apply(this, arguments);
      return startSection(name==='startCore' ? `core-${Number(index)+1}` : name==='startReading' ? 'reading' : name==='startListening' ? 'listening' : 'final');
    };
  });

  addStyles();

  window.STEPUP_U1_REVIEW = {
    version:VERSION,
    open:openUnit1,
    start:startSection,
    answer,
    next,
    retrySummary:() => session?.phase==='summary-error' && finishSection(),
    playAudio,
    stopAudio,
    getProgress:() => ({
      answered:requiredAnswered(), total:TOTAL_REQUIRED, percentage:progressPct(),
      correct:requiredCorrect(), accuracy:accuracyPct(), complete:TOTAL_REQUIRED>0 && requiredAnswered()>=TOTAL_REQUIRED,
      reviewCorrect:requiredKeys.reduce((n,key)=>n+reviewCorrectCount(key),0), reviewAccuracy:reviewAccuracyPct(),
      nextSection:nextReviewSection()
    }),
    getCertificateRequirements:() => requiredKeys.flatMap(key => sections[key].questions.map(q => ({
      section:key, questionId:q.question_id, trainingId:sections[key].trainingId
    }))),
    getMasteryBank:() => requiredKeys.flatMap(key => sections[key].questions.map(q => ({
      section:key, sectionTitle:sections[key].title, id:q.question_id,
      prompt:q.prompt, choices:qChoices(q), answer:qAnswer(q),
      ...questionContext(key, q)
    }))),
    sectionProgress
  };
})();

