const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function load(w,file){
  const baseline=process.env.STEP_U1_BASELINE && path.join(process.env.STEP_U1_BASELINE,file.replace('/','__'));
  w.eval(fs.readFileSync(baseline && fs.existsSync(baseline)?baseline:path.join(root,file),'utf8'));
}
async function until(check){for(let i=0;i<100;i++){if(check())return;await wait(10);}assert.fail('Expected UI state did not appear');}
function fixture(){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window,profile={id:'student-qa',uid:'student-qa',role:'student',displayName:'QA Student',classId:'class-qa',classCode:'QA',teacherId:'teacher-qa'};
  const writes=[],summaries=[],reads=[],control={failQuestion:false,failSummary:false,summaryDelay:null};
  const auth={currentUser:{uid:profile.id},onAuthStateChanged(){return()=>{};}};
  w.firebase={apps:[{}],auth:()=>auth,firestore:()=>({collection(name){return {
    doc(){return {async get(){reads.push(name);return {exists:true,data:()=>({...profile})};}};},
    where(){return this;},async get(){reads.push(name);return {docs:[]};},
    async add(record){if(control.failQuestion)throw new Error('offline');writes.push(JSON.parse(JSON.stringify(record)));return {id:'q-'+writes.length};},
    delete(){throw new Error('Saved answers must not be deleted');},update(){throw new Error('Saved answers must not be overwritten');}
  };}})};
  w.PROVE={setStudentTab(){w.document.querySelector('.student-view').innerHTML='<h1>Units</h1>';},async recordJourneyAttempt(p){
    if(control.summaryDelay)await control.summaryDelay;
    if(control.failSummary)throw new Error('quota');
    summaries.push(JSON.parse(JSON.stringify(p)));return {...p,id:'summary-'+summaries.length};
  }};
  w.document.addEventListener('click',e=>{const b=e.target.closest('button[onclick]');if(b&&!b.disabled)w.eval(b.getAttribute('onclick'));});
  ['data.js','journey-engine.js','unit1-cleanup.js','answer-response-guard.js','unit1-review-all.js','mg1-kb.js'].forEach(file=>load(w,file));
  const api=w.STEPUP_U1_REVIEW,bank=api.getMasteryBank();
  let attempts=[];
  function hydrate(items){attempts=JSON.parse(JSON.stringify(items));w.STEPUP_JOURNEY.html(attempts,['u1'],profile);return attempts;}
  function records(correct){return bank.map((q,i)=>({recordKind:'question',examUnit:'u1',examSection:q.section,questionId:q.id,trainingId:'question-u1-'+i,
    selected:correct(q,i)?q.answer:(q.answer+1)%4,selectedText:q.choices[correct(q,i)?q.answer:(q.answer+1)%4],correct:correct(q,i),bestCorrect:correct(q,i),
    studentId:profile.id,submittedAt:'2026-10-01T00:00:00.000Z'}));}
  const prompt=()=>w.document.querySelector('.journey-question-card h2')?.textContent;
  async function answer(choice){api.answer(choice);await until(()=>w.document.querySelector('.journey-feedback')||w.document.querySelector('.sar-error'));}
  async function run(section,correct){api.start(section);const questions=bank.filter(q=>q.section===section);
    for(let i=0;i<questions.length;i++){await answer(correct(questions[i],i)?questions[i].answer:(questions[i].answer+1)%4);await api.next();}
    return questions;
  }
  hydrate([]);
  return {dom,w,api,bank,profile,writes,summaries,reads,control,errors,hydrate,records,prompt,answer,run,get attempts(){return attempts;}};
}

test('reading questions and their feedback retain the complete existing book passage',async()=>{
  const f=fixture();try{
    f.api.start('reading');
    const text=f.w.document.querySelector('.journey-passage')?.textContent||'';
    assert.match(text,/second pillar/);assert.match(text,/center for global business/);assert.match(text,/Asia, Europe and Africa/);
    assert.match(text,/transparent/);assert.match(text,/thriving economy/);
    const q=f.bank.find(q=>q.section==='reading');await f.answer((q.answer+1)%4);
    assert.ok(f.w.document.querySelector('.journey-passage'));assert.match(f.w.document.querySelector('.journey-feedback').textContent,/Not quite/);
    await f.api.next();assert.ok(f.w.document.querySelector('.journey-passage'));
    assert.equal(f.api.getMasteryBank().find(q=>q.section==='reading').context.includes('second pillar'),true);
  }finally{f.dom.window.close();}
});

test('listening has replayable audio for the original script on questions and feedback',async()=>{
  const f=fixture();try{
    const spoken=[];let canceled=0;
    f.w.SpeechSynthesisUtterance=function(text){this.text=text;};
    f.w.speechSynthesis={cancel(){canceled++;},getVoices:()=>[{lang:'en-GB'}],speak(s){spoken.push(s);s.onstart();}};
    f.api.start('listening');assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));
    f.api.playAudio();assert.equal(spoken[0].text,f.w.STEPUP_JOURNEY.data.units[0].listening);assert.equal(spoken[0].lang,'en-US');
    assert.match(f.w.document.querySelector('.u1-audio-status').textContent,/Playing/);
    const q=f.bank.find(q=>q.section==='listening');await f.answer(q.answer);f.api.playAudio();assert.equal(spoken.length,2);
    await f.api.next();assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));f.api.playAudio();assert.equal(spoken.length,3);
    f.api.open();assert.ok(canceled>=4);
  }finally{f.dom.window.close();}
});

test('unavailable audio is explained and the transcript remains available for practice',()=>{
  const f=fixture();try{
    f.api.start('listening');f.api.playAudio();
    assert.match(f.w.document.querySelector('.u1-audio-status').textContent,/unavailable/);
    assert.match(f.w.document.querySelector('.u1-review-context details').textContent,/public transport center/);
  }finally{f.dom.window.close();}
});

test('a question cannot be skipped before an answer or by repeated Continue taps',async()=>{
  const f=fixture();try{
    f.api.start('core-2');const first=f.prompt();await f.api.next();assert.equal(f.prompt(),first);
    const q=f.bank.find(q=>q.section==='core-2');await f.answer((q.answer+1)%4);
    assert.match(f.w.document.querySelector('.journey-feedback').textContent,/Your answer:/);
    assert.match(f.w.document.querySelector('.journey-feedback').textContent,/Correct answer:/);
    f.api.next();f.api.next();
    assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,'2/6');assert.equal(f.writes.length,1);
  }finally{f.dom.window.close();}
});

test('direct Unit 1 entry points always use the full review and wait for feedback',async()=>{
  const f=fixture();try{
    f.w.STEPUP_JOURNEY.startFinal('u1');assert.ok(f.w.document.querySelector('.journey-options'));
    const q=f.bank.find(q=>q.section==='final');await f.answer((q.answer+1)%4);
    assert.match(f.w.document.querySelector('.journey-feedback').textContent,/Not quite/);
    f.w.STEPUP_JOURNEY.startReading('u1');assert.ok(f.w.document.querySelector('.journey-passage'));
    f.w.STEPUP_JOURNEY.startListening('u1');assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));
    f.w.STEPUP_JOURNEY.startCore('u1',1);assert.equal(f.prompt(),f.bank.find(q=>q.section==='core-2').prompt);
  }finally{f.dom.window.close();}
});

test('a 50% retake shows its actual score while keeping earlier 100% mastery and all old records',async()=>{
  const f=fixture();try{
    const old=f.records(()=>true);f.hydrate(old);const original=JSON.stringify(f.attempts);
    await f.run('core-2',(_,i)=>i%2===0);
    assert.equal(f.w.document.querySelector('.journey-result-score').textContent,'3/6');
    assert.match(f.w.document.querySelector('.journey-result h2').textContent,/50%/);
    assert.equal(f.w.document.querySelector('.journey-result').classList.contains('good'),false);
    assert.match(f.w.document.querySelector('.journey-result').textContent,/Cumulative accuracy: 6\/6 • 100%/);
    assert.equal(f.summaries[0].attemptScore,3);assert.equal(f.summaries[0].attemptTotal,6);assert.equal(f.summaries[0].attemptPercentage,50);
    assert.equal(f.summaries[0].percentage,100);assert.equal(f.api.sectionProgress('core-2').correct,6);
    assert.equal(JSON.stringify(f.attempts.slice(0,old.length)),original);
    assert.equal(f.writes.filter(a=>a.correct).length,3);assert.equal(f.writes.filter(a=>!a.correct).length,3);
  }finally{f.dom.window.close();}
});

test('the full visual stack distinguishes 100% coverage from lower accuracy without false ticks',async()=>{
  const f=fixture();try{
    const old=f.records((q,i)=>i%2===0);f.hydrate(old);
    ['journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js'].forEach(file=>load(f.w,file));
    f.hydrate(old);
    f.api.open();await until(()=>f.w.document.querySelector('.journey-focus-head .sx-ring'));
    const expected=Math.round(old.filter(a=>a.correct).length/old.length*100);
    const ring=f.w.document.querySelector('.journey-focus-head .sx-ring');assert.equal(ring.dataset.pct,String(expected));assert.match(ring.getAttribute('aria-label'),/accuracy/);
    assert.match(f.w.document.querySelector('.u1-review-stats').textContent,/Questions answered • 100%/);
    const road=f.w.document.querySelector('.journey-focus-roadmap');assert.equal(road.querySelectorAll('.journey-focus-stage').length,7);
    const stage=road.querySelector('[data-review-section="core-2"]');assert.equal(stage.classList.contains('done'),false);assert.notEqual(stage.querySelector('.journey-focus-dot').textContent,'✓');
    assert.notEqual(f.w.document.querySelector('.journey-focus-task h2').textContent,'Continue your journey');
    stage.click();assert.ok(f.w.document.querySelector('.journey-options'));assert.equal(f.prompt(),f.bank.find(q=>q.section==='core-2'&&!old.find(a=>a.questionId===q.id).correct).prompt);
    assert.equal(f.errors.length,0);
  }finally{f.dom.window.close();}
});

test('missed-answer practice retains correct credits and targets only unmastered questions',()=>{
  const f=fixture();try{
    const old=f.records((q,i)=>q.section!=='reading'||i%2===0);f.hydrate(old);
    const missed=f.bank.filter(q=>q.section==='reading'&&!old.find(a=>a.questionId===q.id).correct);
    f.api.start('reading');assert.equal(f.prompt(),missed[0].prompt);assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,`1/${missed.length}`);
    assert.equal(f.api.getProgress().percentage,100);assert.equal(f.api.getProgress().nextSection,'reading');
  }finally{f.dom.window.close();}
});

test('legacy adaptive attempts with different questions all remain credited after stability filtering',async()=>{
  const f=fixture();try{
    const qs=f.bank.filter(q=>q.section==='core-2');
    const old=[{trainingId:'journey-u1-core-2',percentage:33,submittedAt:'2026-09-01',answers:[{question_id:qs[0].id,correct:true}]},
      {trainingId:'journey-u1-core-2',percentage:67,submittedAt:'2026-09-02',answers:qs.slice(1,4).map(q=>({question_id:q.id,correct:true}))}];
    load(f.w,'stability-fixes.js');await wait(350);f.hydrate(old);
    assert.equal(f.api.sectionProgress('core-2').correct,4);assert.equal(f.attempts.length,2);
  }finally{f.dom.window.close();}
});

test('summary saving is locked against duplicate taps and cannot replace another skill',async()=>{
  const f=fixture();let release;try{
    f.control.summaryDelay=new Promise(r=>{release=r;});
    const qs=f.bank.filter(q=>q.section==='reading');f.api.start('reading');
    for(let i=0;i<qs.length;i++){await f.answer(qs[i].answer);if(i<qs.length-1)await f.api.next();}
    const pending=f.api.next();f.api.next();f.api.start('listening');const current=f.prompt();
    release();await pending;assert.equal(f.summaries.length,1);assert.equal(f.prompt(),current);assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));
  }finally{release?.();f.dom.window.close();}
});

test('a failed section summary keeps saved answers and can retry only the summary',async()=>{
  const f=fixture();try{
    f.control.failSummary=true;await f.run('listening',()=>true);
    assert.equal(f.writes.length,4);assert.match(f.w.document.querySelector('.journey-result').textContent,/individual answers are saved/);
    f.control.failSummary=false;await f.api.retrySummary();assert.equal(f.summaries.length,1);assert.equal(f.writes.length,4);
    assert.equal(f.api.sectionProgress('listening').correct,4);
  }finally{f.dom.window.close();}
});

test('a failed answer save cannot fabricate progress or allow skipping the question',async()=>{
  const f=fixture();try{
    f.control.failQuestion=true;f.api.start('core-1');const initial=f.prompt();await f.answer(0);
    assert.equal(f.writes.length,0);assert.equal(f.api.sectionProgress('core-1').answered,0);await f.api.next();assert.equal(f.prompt(),initial);
    f.control.failQuestion=false;f.w.document.querySelector('.sar-retry').click();await until(()=>f.w.document.querySelector('.journey-feedback'));assert.equal(f.writes.length,1);
  }finally{f.dom.window.close();}
});

test('reading-dependent final questions carry their original passage without changing question IDs',()=>{
  const f=fixture();try{
    const keys=f.api.getCertificateRequirements().map(q=>q.section+'|'+q.questionId);
    assert.equal(new Set(keys).size,keys.length);
    for(const id of ['U1-FIN-07','U1-FIN-08'])assert.match(f.api.getMasteryBank().find(q=>q.id===id).context,/second pillar/);
    for(const id of ['U1-FIN-05','U1-FIN-06'])assert.match(f.api.getMasteryBank().find(q=>q.id===id).context,/German passport because of my grandparents/);
  }finally{f.dom.window.close();}
});

test('an earlier earned certificate and question requirements remain valid after an incorrect retake',async()=>{
  const f=fixture();try{
    f.hydrate(f.records(()=>true));load(f.w,'stepup-mastery.js');
    const ids=f.api.getCertificateRequirements().map(q=>q.questionId).join('|');
    const before=f.w.STEPUP_MASTERY.status('u1',f.attempts);assert.equal(before.earned,true);
    await f.run('reading',()=>false);
    assert.equal(f.w.STEPUP_MASTERY.status('u1',f.attempts).earned,true);
    assert.equal(f.api.getCertificateRequirements().map(q=>q.questionId).join('|'),ids);
    assert.equal(f.api.sectionProgress('reading').correct,4);
  }finally{f.dom.window.close();}
});

test('the application persists this-attempt scores alongside existing cumulative Unit 1 scores',async()=>{
  const f=fixture();try{
    let cb;const saved=[];
    const auth={currentUser:{uid:f.profile.id},onAuthStateChanged(fn){cb=fn;return()=>{};}};
    const db={collection(name){return {doc(){return {get:async()=>({exists:true,id:f.profile.id,data:()=>({...f.profile})})};},
      where(){return this;},get:async()=>({docs:name==='classes'?[{id:f.profile.classId,data:()=>({code:'QA',openUnits:['u1']})}]:name==='attempts'?saved.map((a,i)=>({id:String(i),data:()=>a})):[]}),add:async a=>saved.push(a)};}};
    f.w.PROVEIT_CONFIG={firebase:{enabled:true,projectId:'qa'},ownerEmail:'owner@example.test'};
    f.w.firebase={apps:[{}],auth:()=>auth,firestore:()=>db};load(f.w,'app.js');await cb(auth.currentUser);
    await f.w.PROVE.recordJourneyAttempt({trainingId:'journey-u1-reading',trainingTitle:'Reading',trainingType:'reading',unitId:'u1',unitNumber:1,score:4,total:4,percentage:100,attemptScore:2,attemptTotal:4,attemptPercentage:50,answers:[],studyMethod:'u1-full-review'});
    const result=saved.find(a=>a.trainingId==='journey-u1-reading');assert.equal(result.percentage,100);assert.equal(result.attemptScore,2);assert.equal(result.attemptTotal,4);assert.equal(result.attemptPercentage,50);
    await f.w.PROVE.setStudentTab('progress');
    await until(()=>[...f.w.document.querySelectorAll('tbody tr')].some(tr=>tr.textContent.includes('Reading')));
    const row=[...f.w.document.querySelectorAll('tbody tr')].find(tr=>tr.textContent.includes('Reading'));
    assert.match(row.textContent,/50%/);assert.match(row.textContent,/This attempt • cumulative accuracy 100%/);
  }finally{f.dom.window.close();}
});
