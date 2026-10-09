// StepUp • Unit 1 deterministic full review coverage — 2026-10-01
// Every approved Unit 1 review question is shown once; prior answers remain credited.
(() => {
  'use strict';

  const J = window.STEPUP_JOURNEY;
  if (!J?.data) return;

  const VERSION = 'u1-full-review-20261001-1';
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

  function bestQuestion(sectionKey, questionId){
    const list = questionRecords(sectionKey, questionId);
    return list.find(a => a.correct === true || a.bestCorrect === true) || list[0] || null;
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
    return missing.length ? missing : [...sec.questions];
  }

  function nextMissingSection(){
    return requiredKeys.find(k => !sectionDone(k)) || null;
  }

  function sectionCard(key){
    const sec = sections[key];
    const answered = answeredCount(key);
    const total = sec.questions.length;
    const done = total > 0 && answered >= total;
    const correct = correctCount(key);
    const pct = answered ? Math.round(correct / answered * 100) : 0;
    const label = done ? `All ${total} review questions seen • Best accuracy ${pct}%` : `${answered}/${total} review questions seen`;
    return `<button class="journey-stop ${done?'done':''}" onclick="STEPUP_U1_REVIEW.start('${key}')">
      <span class="journey-stop-icon">${done?'✓':sec.icon}</span>
      <span class="journey-stop-copy"><b>${esc(sec.title)}</b><small>${esc(label)}</small></span>
      <span class="journey-stop-arrow">›</span>
    </button>`;
  }

  function progressStatsHTML(){
    const answered = requiredAnswered();
    const correct = requiredCorrect();
    return `<div class="u1-review-stats">
      <span><b>${answered}/${TOTAL_REQUIRED}</b><small>Review Questions • ${progressPct()}%</small></span>
      <span><b>${answered ? `${correct}/${answered}` : '—'}</b><small>Best Accuracy${answered ? ` • ${accuracyPct()}%` : ''}</small></span>
    </div>`;
  }

  function openUnit1(){
    if (!unitOpen()) return old.openUnit('u1');
    const h = document.querySelector('.student-view');
    if (!h) return;
    const answered = requiredAnswered();
    const next = nextMissingSection();
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="PROVE.setStudentTab('journey')">My Journey</button><span>›</span><b>Unit 1</b></div>
      <section class="journey-unit-hero">
        <span class="journey-kicker">Unit 1 • Full Review</span>
        <h1>Big Changes</h1>
        <p>Every approved review question is included. Questions you already answered are kept, so you only need to complete what you have not seen yet.</p>
        <div class="journey-mini-progress"><i style="width:${progressPct()}%"></i></div>
        ${progressStatsHTML()}
      </section>
      <section class="journey-master-card">
        <div class="journey-stage-title"><span>✓</span><div><h2>Review Path</h2><p>Complete every approved question once. After that, each section becomes optional practice.</p></div><b>${progressPct()}%</b></div>
        <div class="journey-stops">${requiredKeys.map(sectionCard).join('')}</div>
      </section>
      <section class="journey-master-card u1-step-extra">
        <div class="journey-stage-title"><span>STEP</span><div><h2>STEP Practice</h2><p>Extra timed strategy practice. It never blocks Unit 1 completion or the certificate.</p></div></div>
        <button class="journey-stop" onclick="STEPUP_JOURNEY.startStep('u1')"><span class="journey-stop-icon">⚡</span><span class="journey-stop-copy"><b>STEP Practice</b><small>Practice anytime • STEP Ready at 75%+</small></span><span class="journey-stop-arrow">›</span></button>
      </section>
      ${next ? `<button class="u1-review-continue" onclick="STEPUP_U1_REVIEW.start('${next}')">Continue missing review questions →</button>` : `<div class="u1-review-done">✓ All Unit 1 review questions have been shown.</div>`}`;
  }

  function startSection(sectionKey){
    const sec = sections[sectionKey];
    if (!sec || !sec.questions.length) return openUnit1();
    saving = false;
    session = {
      sectionKey,
      sec,
      queue: pendingQuestions(sectionKey),
      pos:0,
      correct:0,
      started:Date.now(),
      runAnswers:[],
      reviewRun: !sectionDone(sectionKey)
    };
    renderQuestion();
  }

  function renderQuestion(){
    if (!session) return;
    const h = document.querySelector('.student-view');
    if (!h) return;
    const q = session.queue[session.pos];
    const choices = qChoices(q);
    const seenBefore = !!latestQuestion(session.sectionKey, q.question_id);
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U1_REVIEW.open()">Unit 1</button><span>›</span><b>${esc(session.sec.title)}</b></div>
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

  function feedback(q, record){
    const h = document.querySelector('.student-view');
    if (!h) return;
    const choices = qChoices(q);
    const answer = qAnswer(q);
    const ok = record.correct;
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U1_REVIEW.open()">Unit 1</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      <section class="journey-feedback ${ok?'good':'support'}">
        <span>${ok?'✓':'✕'}</span><h2>${ok?'Correct!':'Not quite'}</h2>
        ${!ok ? `<div class="u1-review-correct" dir="ltr"><b>Correct answer:</b> ${esc(choices[answer])}</div>` : ''}
        <p>${esc(q.explanation || (ok?'Great work.':'Review the clue and keep going.'))}</p>
        ${!ok && q.hint ? `<div class="u1-review-hint">💡 ${esc(q.hint)}</div>` : ''}
        <div class="u1-review-saved">Saved ✓</div>
        <button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.next()">Continue</button>
      </section>`;
  }


  function answer(selected){
    if(!session)return;
    const ticket=session,position=ticket.pos,q=ticket.queue[position],choice=Number(selected);
    return window.STEPUP_ANSWER_RESPONSE.submit({
      session:ticket,questionId:String(q.question_id),position,selected:choice,
      persist:()=>saveQuestion(ticket.sectionKey,q,choice),
      isActive:()=>session===ticket && session.pos===position,
      onStart:()=>{saving=true;},
      onSlow:()=>{saving=false;},
      onSaved:(record)=>{
        saving=false;
        ticket.runAnswers.push(record);
        if(record.correct)ticket.correct++;
        feedback(q,record);
      },
      onError:(err)=>{
        saving=false;
        console.error('U1 answer save failed',err);
        renderQuestion();
      }
    });
  }

  async function saveSectionSummary(sectionKey){
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
      attemptScore:session?.runAnswers.filter(a => a.correct).length || 0,
      attemptPercentage:Math.round((session?.runAnswers.filter(a=>a.correct).length || 0) / Math.max(1,session?.runAnswers.length || 0) * 100),
      bestScore:Math.max(score, Math.round(priorBest*total/100)), bestTotal:total, bestPercentage:Math.max(percentage, priorBest),
      elapsedSeconds:Math.max(1, Math.round((Date.now()-(session?.started || Date.now()))/1000)),
      answers, studyMethod:'u1-full-review'
    };
    await window.PROVE?.recordJourneyAttempt?.(payload);
    attempts.push({...payload, submittedAt:new Date().toISOString()});
    return payload;
  }

  async function next(){
    if (!session) return;
    if (session.pos < session.queue.length - 1){
      session.pos++;
      return renderQuestion();
    }

    const key = session.sectionKey;
    const sec = session.sec;
    let result;
    try{
      result = await saveSectionSummary(key);
    } catch (e){
      console.warn('Unit 1 section summary save failed', e);
      result = {score:correctCount(key), total:sec.questions.length, percentage:Math.round(correctCount(key)/Math.max(1,sec.questions.length)*100)};
    }
    const allSeen = sectionDone(key);
    const h = document.querySelector('.student-view');
    session = null;
    if (!h) return;
    const nextKey = nextMissingSection();
    h.innerHTML = `<section class="journey-result ${result.percentage>=67?'good':'review'}">
      <div class="journey-result-score">${result.score}<span>/${result.total}</span></div>
      <h2>${allSeen?'Review section complete ✨':'Practice complete'}</h2>
      <p>${allSeen ? `All ${result.total} approved questions in ${esc(sec.title)} have now been shown.` : `Your answers were saved.`}</p>
      <div class="journey-result-actions">
        ${nextKey ? `<button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.start('${nextKey}')">Continue Review</button>` : `<button class="journey-main-btn" onclick="STEPUP_U1_REVIEW.open()">Back to Unit 1</button>`}
        <button class="journey-link-btn" onclick="STEPUP_U1_REVIEW.start('${key}')">Practice again</button>
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
      .u1-review-stats b{font-size:16px;color:#172033}.u1-review-stats small{font-size:11px;color:#6a778c}
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

  addStyles();

  window.STEPUP_U1_REVIEW = {
    version:VERSION,
    open:openUnit1,
    start:startSection,
    answer,
    next,
    getProgress:() => ({
      answered:requiredAnswered(), total:TOTAL_REQUIRED, percentage:progressPct(),
      correct:requiredCorrect(), accuracy:accuracyPct(), complete:TOTAL_REQUIRED>0 && requiredAnswered()>=TOTAL_REQUIRED,
      nextSection:nextMissingSection()
    }),
    getCertificateRequirements:() => requiredKeys.flatMap(key => sections[key].questions.map(q => ({
      section:key, questionId:q.question_id, trainingId:sections[key].trainingId
    }))),
    getMasteryBank:() => requiredKeys.flatMap(key => sections[key].questions.map(q => ({
      section:key, sectionTitle:sections[key].title, id:q.question_id,
      prompt:q.prompt, choices:qChoices(q), answer:qAnswer(q),
      context:key==='reading'?String(UNIT.reading||''):'',
      audio:key==='listening'?String(UNIT.listening||''):''
    }))),
    sectionProgress:key => sections[key] ? ({answered:answeredCount(key), total:sections[key].questions.length, correct:correctCount(key), done:sectionDone(key)}) : null
  };
})();

