// StepUp • Unit 3 deterministic full review coverage — 2026-10-01
// Every approved Unit 3 review question is shown once; prior answers remain credited.
(() => {
  'use strict';

  const J = window.STEPUP_JOURNEY;
  if (!J?.data) return;

  const VERSION = 'u3-full-review-20261001-2';
  const UNIT_ID = 'u3';
  const UNIT_NUMBER = 3;
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
      q.unit_id === 'MG1_U3' &&
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
      icon:['💬','🔮','⏳','🎯'][i] || '🧩',
      questions:reviewQuestionsFor(m, 'Mastery'),
      trainingId:`journey-u3-core-${i+1}`,
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
    trainingId:'journey-u3-reading', trainingType:'reading', pass:67
  };
  sections.listening = {
    key:'listening', title:'Listening', sub:listeningMission?.title || 'Listening comprehension', icon:'🎧',
    questions:reviewQuestionsFor(listeningMission, 'Mastery'),
    trainingId:'journey-u3-listening', trainingType:'listening', pass:67
  };
  sections.final = {
    key:'final', title:'Final Challenge', sub:finalMission?.title || 'Final Challenge', icon:'🏁',
    questions:reviewQuestionsFor(finalMission, 'Final Challenge'),
    trainingId:'journey-u3-final', trainingType:'challenge', pass:83
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
    return set.has('u3');
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
      a.examUnit === 'u3' &&
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
    return [q.option_a_text, q.option_b_text, q.option_c_text, q.option_d_text]
      .filter(x => x !== undefined && x !== null && String(x).trim() !== '');
  }

  function qAnswer(q){
    return ['option_a_id','option_b_id','option_c_id','option_d_id'].findIndex(k => q[k] === q.correct_option_id);
  }

  const STEP_READY = 75;
  const CERT_MASTERY = 80;
  const stepQuestions = [
    {id:'U3-STEP-01',skill:'Future Arrangement',prompt:'My family ___ a trip to Europe next Spring.',choices:['is taking','is take','will','are going to'],answer:0,explanation:'The published STEP practice uses the present progressive for a planned future arrangement.',source:'Published STEP compilation • future forms'},
    {id:'U3-STEP-02',skill:'Will • decision now',prompt:'The phone’s ringing. ___ answer it.',choices:["I’ll",'I','will',"I’m"],answer:0,explanation:'Will is used for a decision made at the moment of speaking.',source:'Published STEP compilation • future forms'},
    {id:'U3-STEP-03',skill:'Future Arrangement',prompt:'We ___ them at eight o’clock.',choices:['meet',"’re meet","’re meeting",'are meet'],answer:2,explanation:'The present progressive can express a fixed future arrangement.',source:'Published STEP compilation • future forms'},
    {id:'U3-STEP-04',skill:'Be Going To',prompt:'They are going ___ in America next month.',choices:['to be','will be','to being','being'],answer:0,explanation:'Be going to is followed by the base form: to be.',source:'Published STEP compilation • future forms'},
    {id:'U3-STEP-05',skill:'Be Going To',prompt:'He says he ___ be a professor.',choices:['intends','is','is going to','wants'],answer:2,explanation:'Is going to expresses the future intention in this item.',source:'Published STEP compilation • future forms'},
    {id:'U3-STEP-06',skill:'Future Progressive',prompt:'I imagine she ___ that it has been a good year.',choices:['be saying','be say','will be saying','says'],answer:2,explanation:'Will be + verb-ing forms the future progressive.',source:'Published STEP compilation • future forms'}
  ];
  function stepAttempts(){ return stageAttempts('journey-u3-step'); }
  function stepStats(){
    const h=stepAttempts(); let best=-1,bestScore=0,bestTotal=0,bestTime=0;
    h.forEach(a=>{ const pct=Number(a.bestPercentage ?? a.percentage ?? 0), t=Number(a.elapsedSeconds||0); if(pct>best){best=pct;bestScore=Number(a.bestScore ?? a.score ?? 0);bestTotal=Number(a.bestTotal ?? a.total ?? 0);} if(t>0 && (!bestTime || t<bestTime)) bestTime=t; });
    return {attempts:h.length,best,bestScore,bestTotal,bestTime,ready:best>=STEP_READY};
  }
  function fmtTime(seconds){ seconds=Math.max(0,Math.round(Number(seconds)||0)); return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; }
  function stepSummaryText(){ const s=stepStats(); return s.attempts ? `${s.ready?'STEP Ready':'Best'} • ${s.best}%${s.bestTime?` • ${fmtTime(s.bestTime)}`:''}` : '6 questions • timed • STEP Ready at 75%+'; }
  function weakestSection(){ return requiredKeys.slice().sort((a,b)=>{ const pa=correctCount(a)/Math.max(1,sections[a].questions.length), pb=correctCount(b)/Math.max(1,sections[b].questions.length); return pa-pb; })[0] || null; }
  function certificateEligible(){ return !!window.STEPUP_MASTERY?.studentStatus?.('u3')?.earned; }

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
    return `<button class="journey-stop ${done?'done':''}" onclick="STEPUP_U3_REVIEW.start('${key}')">
      <span class="journey-stop-icon">${done?'✓':sec.icon}</span>
      <span class="journey-stop-copy"><b>${esc(sec.title)}</b><small>${esc(label)}</small></span>
      <span class="journey-stop-arrow">›</span>
    </button>`;
  }

  function progressStatsHTML(){
    const answered = requiredAnswered();
    const correct = requiredCorrect();
    return `<div class="u3-review-stats">
      <span><b>${answered}/${TOTAL_REQUIRED}</b><small>Review Questions • ${progressPct()}%</small></span>
      <span><b>${answered ? `${correct}/${answered}` : '—'}</b><small>Best Accuracy${answered ? ` • ${accuracyPct()}%` : ''}</small></span>
    </div>`;
  }

  function openUnit3(){
    stopListening();
    if (!unitOpen()) return old.openUnit('u3');
    const h = document.querySelector('.student-view');
    if (!h) return;
    const answered = requiredAnswered();
    const next = nextMissingSection();
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="PROVE.setStudentTab('journey')">My Journey</button><span>›</span><b>Unit 3</b></div>
      <section class="journey-unit-hero">
        <span class="journey-kicker">Unit 3 • Full Review</span>
        <h1>What Will Be, Will Be</h1>
        <p>Every approved review question is included. Questions you already answered are kept, so you only need to complete what you have not seen yet.</p>
        <div class="journey-mini-progress"><i style="width:${progressPct()}%"></i></div>
        ${progressStatsHTML()}
        <div class="u3-cert-goal ${certificateEligible()?'unlocked':''}">${certificateEligible()?`<span>🏆</span><div><b>Certificate unlocked</b><small>Unit 3 mastered • ${accuracyPct()}% overall accuracy</small></div><button onclick="STEPUP_CELEBRATE?.showCertificate?.(STEPUP_JOURNEY.data.units.find(u=>u.id==='u3'))">View</button>`:`<span>🎯</span><div><b>Certificate goal: ${CERT_MASTERY}%</b><small>${requiredAnswered()}/${TOTAL_REQUIRED} questions • ${accuracyPct()}% current accuracy</small></div>`}</div>
      </section>
      <section class="journey-master-card">
        <div class="journey-stage-title"><span>✓</span><div><h2>Review Path</h2><p>Complete every approved question once. After that, each section becomes optional practice.</p></div><b>${progressPct()}%</b></div>
        <div class="journey-stops">${requiredKeys.filter(k=>k!=='final').map(sectionCard).join('')}</div>
      </section>
      <section class="journey-master-card u3-step-extra">
        <div class="journey-stage-title"><span>STEP</span><div><h2>STEP Practice</h2><p>Timed practice from published STEP compilations, matched to Unit 3 skills. It never blocks the unit certificate.</p></div></div>
        <button class="journey-stop" onclick="STEPUP_U3_REVIEW.startStep()"><span class="journey-stop-icon">⚡</span><span class="journey-stop-copy"><b>STEP Practice</b><small>${stepSummaryText()}</small></span><span class="journey-stop-arrow">›</span></button>
      </section>
      <section class="journey-master-card u3-final-card">
        <div class="journey-stage-title"><span>🏁</span><div><h2>Final Challenge</h2><p>Complete the final mixed review after you have worked through the unit. STEP is recommended, but it is not a prerequisite.</p></div></div>
        <div class="journey-stops">${sectionCard('final')}</div>
      </section>
      ${next ? `<button class="u3-review-continue" onclick="STEPUP_U3_REVIEW.start('${next}')">Continue missing review questions →</button>` : certificateEligible() ? `<div class="u3-review-done">✓ All Unit 3 review questions are complete and your certificate is unlocked.</div>` : `<button class="u3-review-continue" onclick="STEPUP_U3_REVIEW.start('${weakestSection()}')">All questions seen • Practice your weakest section until you reach ${CERT_MASTERY}% cumulative mastery →</button>`}`;
  }

  function startSection(sectionKey){
    stopListening();
    const sec = sections[sectionKey];
    if (!sec || !sec.questions.length) return openUnit3();
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

  function passageHTML(){
    return `<details class="u3-reading-passage" open><summary>📖 The Tulsa Time Capsule • Reading text</summary><div>${String(UNIT.reading||'').split(/\n\s*\n/).map(p=>`<p dir="ltr">${esc(p)}</p>`).join('')}</div><small>Reading strategy: read the question first, scan for the evidence, then choose.</small></details>`;
  }
  function speakListening(){
    if(!('speechSynthesis' in window)) return alert('Audio is not available on this device.');
    speechSynthesis.cancel(); const x=new SpeechSynthesisUtterance(String(UNIT.listening||'')); x.lang='en-US'; x.rate=.88; speechSynthesis.speak(x);
  }
  function stopListening(){ try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(_){} }
  function listeningHTML(){ return `<div class="u3-listening-player"><span>🎧</span><div><b>Graduation Predictions</b><small>Listen as many times as you need, then answer from evidence.</small></div><button onclick="STEPUP_U3_REVIEW.listen()">▶ Play</button><button onclick="STEPUP_U3_REVIEW.stopAudio()">■ Stop</button></div>`; }

  function renderQuestion(){
    if (!session) return;
    const h = document.querySelector('.student-view');
    if (!h) return;
    const q = session.queue[session.pos];
    const choices = qChoices(q);
    const seenBefore = !!latestQuestion(session.sectionKey, q.question_id);
    const context = session.sectionKey==='reading' ? passageHTML() : session.sectionKey==='listening' ? listeningHTML() : '';
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U3_REVIEW.open()">Unit 3</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      ${context}
      <section class="journey-question-card">
        <div class="journey-question-meta"><span>${seenBefore?'Practice':'Required Review'}</span><b>${session.pos+1}/${session.queue.length}</b></div>
        <h2 dir="ltr">${esc(q.prompt)}</h2>
        <div class="journey-options">${choices.map((x,i) => `<button ${saving?'disabled':''} onclick="STEPUP_U3_REVIEW.answer(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join('')}</div>
        <small class="u3-review-source">${esc(q.source_ref || '')}</small>
      </section>`;
  }

  function startStep(){
    stopListening();
    session={kind:'step',sectionKey:'step',queue:[...stepQuestions],pos:0,correct:0,started:Date.now(),runAnswers:[]};
    renderStepQuestion();
  }
  function renderStepQuestion(){
    if(!session || session.kind!=='step') return;
    const h=document.querySelector('.student-view'); if(!h)return;
    const q=session.queue[session.pos];
    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_U3_REVIEW.open()">Unit 3</button><span>›</span><b>STEP Practice</b></div>
      <section class="journey-question-card u3-step-card"><div class="journey-question-meta"><span>STEP • ${esc(q.skill)}</span><b>${session.pos+1}/${session.queue.length}</b></div><h2 dir="ltr">${esc(q.prompt)}</h2><div class="journey-options">${q.choices.map((x,i)=>`<button onclick="STEPUP_U3_REVIEW.stepAnswer(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join('')}</div><small class="u3-step-time">⏱ Timed practice • your best score and fastest time are kept</small><small class="u3-review-source">${esc(q.source||'STEP compilation')}</small></section>`;
  }
  function stepAnswer(selected){
    if(!session || session.kind!=='step')return;
    const q=session.queue[session.pos], ok=Number(selected)===q.answer;
    session.runAnswers.push({question_id:q.id,stem:q.prompt,skill:q.skill,selected:Number(selected),correctAnswer:q.answer,correct:ok,selectedText:q.choices[selected]||'',correctText:q.choices[q.answer],explanation:q.explanation,source:q.source||''});
    if(ok)session.correct++;
    const h=document.querySelector('.student-view'); if(!h)return;
    h.innerHTML=`<section class="journey-feedback ${ok?'good':'support'}"><span>${ok?'✓':'✕'}</span><h2>${ok?'Correct!':'Not quite'}</h2>${!ok?`<div class="u3-review-correct" dir="ltr"><b>Correct answer:</b> ${esc(q.choices[q.answer])}</div>`:''}<p>${esc(q.explanation)}</p><button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.stepNext()">${session.pos<session.queue.length-1?'Next STEP Question':'See STEP Result'}</button></section>`;
  }
  async function stepNext(){
    if(!session || session.kind!=='step')return;
    if(session.pos<session.queue.length-1){session.pos++;return renderStepQuestion();}
    const s=session,total=s.queue.length,score=s.correct,pct=Math.round(score/total*100),elapsed=Math.max(1,Math.round((Date.now()-s.started)/1000));
    const prior=stepAttempts(), priorBest=prior.reduce((m,a)=>Math.max(m,Number(a.bestPercentage??a.percentage??0)),0);
    const payload={trainingId:'journey-u3-step',trainingTitle:'Unit 3 STEP Practice',trainingType:'step',unitId:'u3',unitNumber:3,score,total,percentage:pct,attemptNumber:prior.length+1,bestScore:Math.max(score,Math.round(priorBest*total/100)),bestTotal:total,bestPercentage:Math.max(pct,priorBest),elapsedSeconds:elapsed,answers:s.runAnswers,studyMethod:'u3-step-compilations'};
    try{await window.PROVE?.recordJourneyAttempt?.(payload);attempts.push({...payload,submittedAt:new Date().toISOString()});}catch(e){console.warn('Unit 3 STEP save failed',e);}
    const h=document.querySelector('.student-view'); session=null; if(!h)return; const ss=stepStats();
    h.innerHTML=`<section class="journey-result ${pct>=STEP_READY?'good':'review'}"><div class="journey-result-score">${score}<span>/${total}</span></div><h2>${pct>=STEP_READY?'STEP Ready 🏅':'STEP Practice complete ⚡'}</h2><p>${pct>=STEP_READY?'Excellent strategy work. Your STEP Ready badge is earned.':`Your best score is ${Math.max(pct,ss.best)}%. Reach ${STEP_READY}% for STEP Ready.`}</p><div class="u3-step-result"><b>${pct}%</b><small>Current</small><b>${fmtTime(elapsed)}</b><small>Time</small></div><div class="journey-result-actions"><button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.open()">Back to Unit 3</button><button class="journey-link-btn" onclick="STEPUP_U3_REVIEW.startStep()">Practice again</button></div></section>`;
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
      recordKind:'question', examUnit:'u3', examSection:sectionKey, questionId:q.question_id,
      studentId:user.uid, studentName:p.displayName || '', classId:p.classId || '', classCode:p.classCode || '', teacherId:p.teacherId || '',
      trainingId:`question-u3-${sectionKey}-${q.question_id}-${Date.now()}`,
      trainingTitle:sections[sectionKey].title, trainingType:'question', unitNumber:3,
      stem:q.prompt, skill:q.skill || sections[sectionKey].title,
      selected, selectedText:choices[selected] || '', correctAnswer:answer, correctText:choices[answer] || '', correct,
      score:correct?1:0, total:1, percentage:correct?100:0,
      bestCorrect:priorBest || correct, bestScore:(priorBest || correct)?1:0, bestPercentage:(priorBest || correct)?100:0,
      source:q.source_ref || '', studyMethod:'u3-full-review-question', submittedAt:now
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
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_U3_REVIEW.open()">Unit 3</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      <section class="journey-feedback ${ok?'good':'support'}">
        <span>${ok?'✓':'✕'}</span><h2>${ok?'Correct!':'Not quite'}</h2>
        ${!ok ? `<div class="u3-review-correct" dir="ltr"><b>Correct answer:</b> ${esc(choices[answer])}</div>` : ''}
        <p>${esc(q.explanation || (ok?'Great work.':'Review the clue and keep going.'))}</p>
        ${!ok && q.hint ? `<div class="u3-review-hint">💡 ${esc(q.hint)}</div>` : ''}
        <div class="u3-review-saved">Saved ✓</div>
        <button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.next()">Continue</button>
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
        console.error('U3 answer save failed',err);
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
      unitId:'u3', unitNumber:3, score, total, percentage,
      attemptNumber:previous.length+1,
      attemptScore:session?.runAnswers.filter(a => a.correct).length || 0,
      attemptPercentage:Math.round((session?.runAnswers.filter(a=>a.correct).length || 0) / Math.max(1,session?.runAnswers.length || 0) * 100),
      bestScore:Math.max(score, Math.round(priorBest*total/100)), bestTotal:total, bestPercentage:Math.max(percentage, priorBest),
      elapsedSeconds:Math.max(1, Math.round((Date.now()-(session?.started || Date.now()))/1000)),
      answers, studyMethod:'u3-full-review'
    };
    await window.PROVE?.recordJourneyAttempt?.(payload);
    attempts.push({...payload, submittedAt:new Date().toISOString()});
    return payload;
  }

  async function next(){
    stopListening();
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
      console.warn('Unit 3 section summary save failed', e);
      result = {score:correctCount(key), total:sec.questions.length, percentage:Math.round(correctCount(key)/Math.max(1,sec.questions.length)*100)};
    }
    const allSeen = sectionDone(key);
    const h = document.querySelector('.student-view');
    session = null;
    if (!h) return;
    const nextKey = nextMissingSection();
    const improveKey = !nextKey && !certificateEligible() ? weakestSection() : null;
    h.innerHTML = `<section class="journey-result ${result.percentage>=67?'good':'review'}">
      <div class="journey-result-score">${result.score}<span>/${result.total}</span></div>
      <h2>${allSeen?'Review section complete ✨':'Practice complete'}</h2>
      <p>${allSeen ? `All ${result.total} approved questions in ${esc(sec.title)} have now been shown.` : `Your answers were saved.`}</p>
      <div class="journey-result-actions">
        ${nextKey ? `<button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.start('${nextKey}')">Continue Review</button>` : improveKey ? `<button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.start('${improveKey}')">Practice to reach ${CERT_MASTERY}%</button>` : `<button class="journey-main-btn" onclick="STEPUP_U3_REVIEW.open()">Back to Unit 3</button>`}
        <button class="journey-link-btn" onclick="STEPUP_U3_REVIEW.start('${key}')">Practice again</button>
      </div>
    </section>`;
  }

  function addStyles(){
    if (document.getElementById('u3FullReviewStyles')) return;
    const s = document.createElement('style');
    s.id = 'u3FullReviewStyles';
    s.textContent = `
      .u3-review-stats{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}
      .u3-review-stats>span{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid #e1e8f0;border-radius:14px;background:#fff}
      .u3-review-stats b{font-size:16px;color:#172033}.u3-review-stats small{font-size:11px;color:#6a778c}
      .u3-step-extra{margin-top:14px}.u3-review-source{display:block;margin-top:14px;color:#78879a;font-size:12px}
      .u3-review-correct,.u3-review-hint{margin:10px 0;padding:11px 13px;border-radius:13px;background:#f3f6fb;color:#24354c}
      .u3-review-saved{display:inline-block;margin:8px 0;padding:7px 11px;border-radius:999px;background:#e7f7ee;color:#176b4a;font-weight:900}
      .u3-review-continue{width:100%;margin-top:14px;min-height:52px;border:0;border-radius:16px;background:#284f88;color:#fff;font-weight:900;cursor:pointer}
      .u3-review-done{margin-top:14px;padding:14px;border-radius:16px;background:#eaf7ef;color:#24623f;font-weight:900;text-align:center}
      .u3-cert-goal{display:flex;align-items:center;gap:10px;margin-top:12px;padding:11px 13px;border-radius:15px;background:#fff8e8;border:1px solid #f0dfb7;color:#624b13}.u3-cert-goal.unlocked{background:#eaf7ef;border-color:#c9ead8;color:#24623f}.u3-cert-goal span{font-size:24px}.u3-cert-goal div{flex:1}.u3-cert-goal b,.u3-cert-goal small{display:block}.u3-cert-goal small{margin-top:2px;font-size:11px;opacity:.8}.u3-cert-goal button{border:0;border-radius:999px;padding:8px 12px;background:#244e86;color:#fff;font-weight:900;cursor:pointer}
      .u3-reading-passage{margin:12px 0 16px;padding:12px 14px;border:1px solid #dfe7ef;border-radius:16px;background:#fbfcfe}.u3-reading-passage summary{cursor:pointer;font-weight:900;color:#173b63}.u3-reading-passage p{font-size:13.5px;line-height:1.72;color:#33425a}.u3-reading-passage small{display:block;margin-top:8px;color:#5d6e84;font-weight:700}
      .u3-listening-player{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:12px 0 16px;padding:12px;border:1px solid #d9e4ef;border-radius:16px;background:#f8fbff}.u3-listening-player>span{font-size:24px}.u3-listening-player>div{flex:1;min-width:180px}.u3-listening-player b,.u3-listening-player small{display:block}.u3-listening-player small{margin-top:2px;color:#6a778c}.u3-listening-player button{border:1px solid #cad7e7;border-radius:11px;padding:8px 10px;background:#fff;color:#173b63;font-weight:800;cursor:pointer}.u3-step-time{display:block;margin-top:13px;color:#6a778c}.u3-step-result{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:6px 10px;align-items:center;max-width:320px;margin:12px auto}.u3-step-result b{font-size:18px}.u3-step-result small{color:#6a778c}
      @media(max-width:520px){.u3-review-stats{grid-template-columns:1fr 1fr}.u3-review-stats b{font-size:15px}}
    `;
    document.head.appendChild(s);
  }

  J.homeHTML = function(a,o,p){ hydrate(a,o,p); return old.homeHTML(a,o,p); };
  J.html = function(a,o,p){ hydrate(a,o,p); return old.html(a,o,p); };
  J.progressHTML = function(a,o,p){ hydrate(a,o,p); return old.progressHTML(a,o,p); };
  J.openUnit = function(uid){ if(uid==='u3') return openUnit3(); return old.openUnit(uid); };
  J.go = function(uid,key){ if(uid!=='u3') return old.go(uid,key); if(key==='step') return startStep(); if(sections[key]) return startSection(key); return openUnit3(); };

  addStyles();

  window.STEPUP_U3_REVIEW = {
    version:VERSION,
    open:openUnit3,
    start:startSection,
    answer,
    next,
    startStep,
    stepAnswer,
    stepNext,
    listen:speakListening,
    stopAudio:stopListening,
    getProgress:() => ({
      answered:requiredAnswered(), total:TOTAL_REQUIRED, percentage:progressPct(),
      correct:requiredCorrect(), accuracy:accuracyPct(), complete:TOTAL_REQUIRED>0 && requiredAnswered()>=TOTAL_REQUIRED,
      nextSection:nextMissingSection(), eligible:certificateEligible()
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
