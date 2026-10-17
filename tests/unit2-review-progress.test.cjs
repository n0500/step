const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<100;i++){if(check())return;await wait(10);}assert.fail('Expected UI state did not appear');}

function fixture({realApp=false,decorated=false}={}){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc
  });
  const w=dom.window,profile={id:'u2-progress-qa',role:'student',displayName:'QA Student',classId:'qa-class',classCode:'QA',teacherId:'qa-teacher'};
  const writes=[],summaries=[],alerts=[],stored=[],control={failSummary:false,failAnswer:false,summaryDelay:null,answerDelay:null};
  let authListener=null;
  const auth={currentUser:{uid:profile.id},onAuthStateChanged(fn){authListener=fn;return()=>{};}};
  const db={collection(name){
    const filters=[];
    return {id:name,where(field,op,value){filters.push([field,value]);return this;},
      doc(id){return {id,async get(){return {exists:true,id,data:()=>name==='users'?{...profile}:{id,name:'QA Class',openUnits:['u1','u2','u3']}};}};},
      async get(){return {docs:stored.filter(a=>filters.every(([field,value])=>a[field]===value)).map(a=>({id:a.id,data:()=>({...a})}))};},
      async add(record){
        assert.equal(name,'attempts');
        if(record.recordKind==='question'){
          if(control.answerDelay)await control.answerDelay;
          if(control.failAnswer)throw new Error('answer offline');
        }else{
          if(control.summaryDelay)await control.summaryDelay;
          if(control.failSummary)throw new Error('summary offline');
        }
        const copy=JSON.parse(JSON.stringify(record)),id='saved-'+(stored.length+1);
        (record.recordKind==='question'?writes:summaries).push(copy);stored.push({...copy,id});return{id};
      },
      update(){assert.fail('Historical results must not be overwritten');},delete(){assert.fail('Historical results must not be deleted');}
    };
  }};
  w.firebase={apps:[{}],auth:()=>auth,firestore:()=>db};
  w.PROVEIT_CONFIG={firebase:{enabled:true},ownerEmail:'qa-owner@example.test'};
  w.alert=message=>alerts.push(message);
  w.matchMedia=()=>({matches:true});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.PROVE={setStudentTab(){w.document.querySelector('.student-view').innerHTML='<h1>Journey</h1>';},
    async recordJourneyAttempt(payload){
      const saved={...payload,studentId:profile.id,submittedAt:new Date().toISOString()};
      const ref=await db.collection('attempts').add(saved);return {...saved,id:ref.id};
    }};
  function load(file){w.eval(fs.readFileSync(path.join(root,file),'utf8'));}
  ['speech-voices.js','data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js',
    'unit1-cleanup.js','unit1-review-all.js','unit3-content.js','unit3-review-all.js','unit2-source-override.js'].forEach(load);
  if(realApp)load('app.js');
  load('unit2-exam-review.js');
  if(decorated)['journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js'].forEach(load);
  w.document.addEventListener('click',e=>{const b=e.target.closest('button[onclick]');if(b&&!b.disabled)w.eval(b.getAttribute('onclick'));});
  const api=w.STEPUP_U2_EXAM,bank=api.getMasteryBank();
  const view=()=>w.document.querySelector('.student-view');
  function hydrate(records){w.STEPUP_JOURNEY.html(JSON.parse(JSON.stringify(records)),['u1','u2','u3'],profile);}
  function records(correct){return bank.map((q,i)=>({id:'old-'+i,recordKind:'question',examUnit:'u2',examSection:q.section,questionId:q.id,
    studentId:profile.id,trainingId:'question-u2-'+q.id,selected:correct(q,i)?q.answer:(q.answer+1)%q.choices.length,
    correct:correct(q,i),bestCorrect:correct(q,i),submittedAt:'2026-10-10T00:00:00.000Z'}));}
  const prompt=()=>view().querySelector('.journey-question-card h2')?.textContent;
  function beginReading(){const button=view().querySelector('.u2-reading-try');assert.ok(button);button.click();}
  async function answer(choice){api.answer(choice);await until(()=>view().querySelector('.journey-feedback')||view().querySelector('.sar-error'));}
  hydrate([]);
  return {dom,w,api,bank,profile,writes,summaries,stored,control,alerts,errors,view,hydrate,records,prompt,beginReading,answer,
    async login(){await authListener(auth.currentUser);}};
}

test('Unit 2 reading resumes saved work and then retries only the missed question',async()=>{
  const f=fixture();try{
    const questions=f.bank.filter(q=>q.section==='reading');
    const old=f.records(q=>q.id!==questions[1].id).filter(a=>a.examSection==='reading').slice(0,2),original=JSON.stringify(old);
    f.hydrate(old);f.api.readingLesson();f.beginReading();
    assert.equal(f.prompt(),questions[2].prompt);
    assert.equal(f.view().querySelector('.u2-question-meta-right > b:last-child').textContent,'1/2');
    for(const q of questions.slice(2)){await f.answer(q.answer);await f.api.next();if(q!==questions.at(-1))f.beginReading();}
    assert.equal(f.summaries.at(-1).attemptTotal,2);assert.equal(f.summaries.at(-1).readingQualifies,false);
    f.api.readingLesson();f.beginReading();assert.equal(f.prompt(),questions[1].prompt);
    await f.answer(questions[1].answer);await f.api.next();
    assert.equal(f.api.sectionProgress('reading').mastered,true);
    assert.equal(f.view().querySelector('.journey-result-score').textContent,'1/1');
    assert.equal(f.view().querySelector('.journey-result').classList.contains('good'),true);
    assert.equal(f.writes.length,3);assert.equal(JSON.stringify(old),original);
  }finally{f.dom.window.close();}
});

test('Unit 2 recognises improved answers from a later saved mastery check after hydration',()=>{
  const f=fixture({decorated:true});try{
    const wrong=f.bank.find(q=>q.section==='grammar'),old=f.records(q=>q.id!==wrong.id);
    const check={trainingId:'journey-u2-mastery-check',studyMethod:'full-unit-single-attempt',submittedAt:'2026-10-11T00:00:00.000Z',
      answers:f.bank.map(q=>({section:q.section,question_id:q.id,selected:q.answer,correct:true}))};
    const source=[...old,check],original=JSON.stringify(source);f.hydrate(source);
    assert.equal(f.api.getProgress().reviewAccuracy,100);assert.equal(f.api.getProgress().correct,f.bank.length);
    f.api.start('grammar');assert.equal(f.view().querySelector('.u2-question-meta-right > b:last-child').textContent,'1/8');
    assert.equal(f.w.STEPUP_MASTERY.status('u2',source).earned,true);
    assert.equal(JSON.stringify(source),original);assert.equal(f.writes.length,0);
  }finally{f.dom.window.close();}
});

test('Unit 2 retains matching historical answers across multiple summaries with different question coverage',()=>{
  const f=fixture({decorated:true});try{
    const questions=f.bank.filter(q=>q.section==='grammar');
    const trainingId=f.api.getCertificateRequirements().find(q=>q.section==='grammar').trainingId;
    const source=questions.map((q,i)=>({trainingId,percentage:i===0?100:50,submittedAt:'2026-10-10T00:00:0'+i+'.000Z',
      answers:[{question_id:q.id,correct:true,selected:q.answer}]}));
    source.push({trainingId,percentage:100,answers:[{question_id:'unknown-legacy-question',correct:true}],submittedAt:'2026-10-12'});
    const original=JSON.stringify(source);f.hydrate(source);
    assert.equal(f.api.sectionProgress('grammar').answered,questions.length);
    assert.equal(f.api.sectionProgress('grammar').correct,questions.length);
    assert.equal(f.api.sectionProgress('grammar').mastered,true);assert.equal(JSON.stringify(source),original);
  }finally{f.dom.window.close();}
});

test('Unit 2 cannot skip a question through repeated Continue taps or before an answer is saved',async()=>{
  const f=fixture();try{
    const questions=f.bank.filter(q=>q.section==='grammar');f.api.start('grammar');
    await f.api.next();assert.equal(f.prompt(),questions[0].prompt);
    let release;f.control.answerDelay=new Promise(resolve=>release=resolve);
    f.api.answer(questions[0].answer);await wait(10);await f.api.next();assert.equal(f.prompt(),questions[0].prompt);
    release();await until(()=>f.view().querySelector('.journey-feedback'));
    await Promise.all([f.api.next(),f.api.next()]);assert.equal(f.prompt(),questions[1].prompt);
    assert.equal(f.writes.length,1);
  }finally{f.dom.window.close();}
});

test('Unit 2 final Continue saves one summary and keeps the actual retry score',async()=>{
  const f=fixture();try{
    const questions=f.bank.filter(q=>q.section==='grammar');f.hydrate(f.records(q=>q.id!==questions[0].id));
    f.api.start('grammar');await f.answer(questions[0].answer);
    let release;f.control.summaryDelay=new Promise(resolve=>release=resolve);
    const one=f.api.next(),two=f.api.next();await wait(10);release();await Promise.all([one,two]);
    assert.equal(f.summaries.length,1);assert.equal(f.summaries[0].attemptScore,1);assert.equal(f.summaries[0].attemptTotal,1);
    assert.equal(f.view().querySelector('.journey-result-score').textContent,'1/1');assert.equal(f.api.getProgress().reviewAccuracy,100);
  }finally{f.dom.window.close();}
});

test('a failed Unit 2 summary can be saved again without repeating saved questions',async()=>{
  const f=fixture();try{
    const q=f.bank.find(q=>q.section==='grammar');f.hydrate(f.records(x=>x.id!==q.id));f.api.start('grammar');await f.answer(q.answer);
    f.control.failSummary=true;await f.api.next();
    assert.ok(f.view().querySelector('[onclick="STEPUP_U2_EXAM.retrySummary()"]'));
    assert.equal(f.api.getProgress().reviewAccuracy,100);assert.equal(f.writes.length,1);
    f.control.failSummary=false;await f.api.retrySummary();
    assert.equal(f.summaries.length,1);assert.equal(f.writes.length,1);
    assert.equal(f.view().querySelector('[onclick="STEPUP_U2_EXAM.retrySummary()"]'),null);
  }finally{f.dom.window.close();}
});

test('a late Unit 2 summary never replaces a different skill opened during saving',async()=>{
  const f=fixture();try{
    const q=f.bank.find(q=>q.section==='grammar');f.hydrate(f.records(x=>x.id!==q.id));f.api.start('grammar');await f.answer(q.answer);
    let release;f.control.summaryDelay=new Promise(resolve=>release=resolve);const pending=f.api.next();await wait(10);
    f.api.start('functions');const nextPrompt=f.prompt();release();await pending;
    assert.equal(f.prompt(),nextPrompt);assert.ok(f.view().querySelector('.journey-options'));assert.equal(f.summaries.length,1);
  }finally{f.dom.window.close();}
});

test('real app saving preserves Unit 2 retry scores and reading improvement after a fresh dashboard read',async()=>{
  const f=fixture({realApp:true});try{
    await f.login();
    const payload={trainingId:'journey-u2-reading',trainingTitle:'Reading',trainingType:'reading',unitId:'u2',unitNumber:2,
      score:4,total:4,percentage:100,attemptScore:1,attemptTotal:2,attemptPercentage:50,attemptNumber:2,
      bestScore:4,bestTotal:4,bestPercentage:100,readingTimeSeconds:12,readingQualifies:false,bestReadingTimeSeconds:30,
      elapsedSeconds:12,answers:[{question_id:f.bank.find(q=>q.section==='reading').id,correct:true}],studyMethod:'u2-exam-review'};
    await f.w.PROVE.recordJourneyAttempt(payload);
    const saved=f.summaries.at(-1);
    for(const field of ['attemptScore','attemptTotal','attemptPercentage','attemptNumber','bestScore','bestTotal','bestPercentage',
      'readingTimeSeconds','readingQualifies','bestReadingTimeSeconds'])assert.equal(saved[field],payload[field],field+' was lost');
    await f.w.PROVE.setStudentTab('progress');
    await until(()=>f.view().querySelector('.student-page-head h1')?.textContent==='My Progress');
    assert.match(f.view().textContent,/Unit 2/);
    assert.match(f.view().querySelector('tbody tr td:nth-child(3)').textContent,/50%.*This attempt.*100%/);
    assert.equal(f.api.sectionProgress('reading').answered,1);assert.equal(f.writes.length,0);assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});

test('a failed Unit 2 reading answer stays on the same question and counts only a successful save',async()=>{
  const f=fixture();try{
    const q=f.bank.find(q=>q.section==='reading');f.api.readingLesson();f.beginReading();
    f.control.failAnswer=true;await f.answer(q.answer);
    assert.ok(f.view().querySelector('.sar-error'));assert.equal(f.prompt(),q.prompt);
    assert.equal(f.api.sectionProgress('reading').answered,0);await f.api.next();assert.equal(f.prompt(),q.prompt);
    f.control.failAnswer=false;f.view().querySelector('.sar-retry').click();await until(()=>f.view().querySelector('.journey-feedback'));
    assert.equal(f.writes.length,1);assert.equal(f.api.sectionProgress('reading').reviewCorrect,1);
  }finally{f.dom.window.close();}
});

test('Unit 2 weakness practice repeats only the incorrect question within a shared skill',async()=>{
  const f=fixture();try{
    const questions=f.bank.filter(q=>q.section==='grammar'&&['U2-G-B2','U2-G-B4'].includes(q.id)),wrong=questions[0];
    assert.ok(questions.length>1);f.hydrate(f.records(q=>q.id!==wrong.id));
    f.api.practiceWeakness('grammar',encodeURIComponent('Present Perfect Simple'));
    assert.equal(f.prompt(),wrong.prompt);assert.equal(f.view().querySelector('.u2-question-meta-right > b:last-child').textContent,'1/1');
    await f.answer(wrong.answer);await f.api.next();assert.equal(f.api.sectionProgress('grammar').mastered,true);assert.equal(f.writes.length,1);
  }finally{f.dom.window.close();}
});

test('Unit 2 grammar improvement survives returning through the actual application dashboard',async()=>{
  const f=fixture({realApp:true});try{
    await f.login();const questions=f.bank.filter(q=>q.section==='grammar');f.api.start('grammar');
    for(let i=0;i<questions.length;i++){await f.answer(i%2?questions[i].answer:(questions[i].answer+1)%questions[i].choices.length);await f.api.next();}
    assert.equal(f.api.sectionProgress('grammar').reviewCorrect,4);f.api.start('grammar');
    for(const q of questions.filter((q,i)=>i%2===0)){assert.equal(f.prompt(),q.prompt);await f.answer(q.answer);await f.api.next();}
    assert.equal(f.api.sectionProgress('grammar').reviewCorrect,8);assert.equal(f.writes.length,12);
    f.w.PROVE.setStudentTab('journey');await until(()=>f.view().querySelector('.journey-page-head'));
    f.api.open();assert.equal(f.api.sectionProgress('grammar').reviewCorrect,8);assert.equal(f.api.sectionProgress('grammar').mastered,true);
    assert.equal(f.summaries.length,2);assert.equal(f.summaries[1].attemptTotal,4);assert.equal(f.summaries[1].attemptPercentage,100);
    assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});


test('Unit 2 complete 100% shows a primary functional Practice Again beside the result without duplicate lower panel',async()=>{
  const f=fixture({decorated:true});
  try{
    f.hydrate(f.records(()=>true));
    f.api.open();
    // Load the same student overlay and focused-journey modules as the live page.
    const loadSmart=file=>f.w.eval(fs.readFileSync(path.join(root,file),'utf8'));
    loadSmart('student-smart-review.js');
    loadSmart('journey-focus.js');
    f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
    await until(()=>f.view().querySelector('.journey-focus-shell.journey-focus-replay-ready'));
    const card=f.view().querySelector('.journey-focus-replay-ready .journey-focus-task.complete');
    assert.ok(card,'completed unit needs a clear result card');
    assert.match(card.textContent,/All answers correct/);
    assert.match(card.textContent,/Practice Again/);
    assert.ok(card.querySelector('.journey-focus-back-secondary'),'Back to units should stay secondary');
    assert.equal(f.view().querySelector('.smart-unit-panel'),null,'lower duplicate replay card removed');
    const replay=card.querySelector('.journey-focus-start');
    replay.click();
    await until(()=>f.view().querySelector('.journey-question-card h2'));
    const questions=f.bank.filter(q=>q.section==='vocab');
    assert.equal(f.prompt(),questions[0].prompt,'replay must start at the first original question, not skip correct answers');
    const options=f.view().querySelectorAll('.journey-options button');
    options[questions[0].answer].click();
    assert.equal(f.writes.length,0,'choice tap must not save before confirmation');
    const confirm=f.view().querySelector('.smart-confirm');
    assert.ok(confirm,'confirmation button required');
    assert.equal(confirm.disabled,false);
    confirm.click();
    await until(()=>f.view().querySelector('.journey-feedback'));
    assert.equal(f.writes.length,1,'confirm should save exactly one replay answer');
    await f.api.next();
    assert.equal(f.prompt(),questions[1].prompt,'next original question must be reachable');
    assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});


test('Unit 2 ordinary review goes directly from a finished skill to the next skill',async()=>{
  const f=fixture();
  try{
    const questions=f.bank.filter(q=>q.section==='vocab');
    f.api.start('vocab');
    for(const q of questions){await f.answer(q.answer);await f.api.next();}
    const primary=f.view().querySelector('[data-unit-review-continue]');
    assert.ok(primary,'next-skill button missing after section finish');
    assert.match(primary.textContent,/Continue to Grammar/);
    assert.doesNotMatch(primary.getAttribute('onclick'),/open\(\)/);
    primary.click();
    await until(()=>f.prompt()===f.bank.find(q=>q.section==='grammar').prompt);
    assert.match(f.view().querySelector('.journey-breadcrumb').textContent,/Grammar/);
    assert.equal(f.writes.length,questions.length);
  }finally{f.dom.window.close();}
});

test('Unit 2 full Practice Again moves from one completed skill to the next without visiting units',async()=>{
  const f=fixture();
  try{
    f.w.eval(fs.readFileSync(path.join(root,'student-smart-review.js'),'utf8'));
    f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
    f.w.STEPUP_SMART.beginFull('u2');
    const questions=f.bank.filter(q=>q.section==='vocab');
    assert.equal(f.prompt(),questions[0].prompt);
    for(const q of questions){
      await until(()=>!!f.view().querySelector('.smart-confirm'));
      const choices=f.view().querySelectorAll('.journey-options button');
      const confirm=f.view().querySelector('.smart-confirm');
      assert.ok(confirm,'Confirm Answer missing from full review');
      choices[q.answer].click();
      assert.equal(f.writes.length,questions.indexOf(q),'answer must not save on choice tap');
      confirm.click();
      await until(()=>f.view().querySelector('.journey-feedback'));
      await f.api.next();
    }
    const next=f.view().querySelector('[data-unit-review-continue]');
    assert.ok(next,'full review must provide a next-skill action');
    assert.match(next.textContent,/Continue to Grammar/);
    assert.match(next.getAttribute('onclick'),/STEPUP_SMART.advance/);
    next.click();
    await until(()=>f.prompt()===f.bank.find(q=>q.section==='grammar').prompt);
    assert.equal(f.view().querySelector('.journey-unit-hero'),null);
    assert.equal(f.writes.length,questions.length);
  }finally{f.dom.window.close();}
});

test('Unit 2 final full-review skill offers My Learning Level and saves the overall result',async()=>{
  const f=fixture();
  try{
    f.w.eval(fs.readFileSync(path.join(root,'student-smart-review.js'),'utf8'));
    f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
    const b=f.bank,last=b.at(-1);
    assert.equal(last.section,'listening');
    const key='stepup-smart-20261017-1-'+f.profile.id+'-run-u2';
    const answers={};
    for(const q of b.slice(0,-1))answers[q.section+'|'+q.id]={
      section:q.section,question_id:q.id,correct:true,skill:q.skill,
      stem:q.prompt,selectedText:q.choices[q.answer],correctText:q.choices[q.answer]
    };
    f.w.localStorage.setItem(key,JSON.stringify({
      uid:f.profile.id,unit:'u2',runId:'final-test-u2',
      startedAt:'2026-10-17T01:00:00Z',keys:b.map(q=>q.section+'|'+q.id),answers
    }));
    f.w.STEPUP_SMART.beginFull('u2');
    assert.equal(f.prompt(),last.prompt);
    f.api.answer(last.answer);
    await until(()=>f.view().querySelector('.journey-feedback'));
    await f.api.next();
    const btn=f.view().querySelector('[data-unit-review-continue]');
    assert.ok(btn);
    assert.match(btn.textContent,/See My Learning Level/);
    btn.click();
    await until(()=>f.view().querySelector('.smart-results .smart-score'));
    assert.match(f.view().textContent,/My Learning Level/);
    assert.match(f.view().textContent,/100%/);
    const result=f.summaries.find(a=>a.recordKind==='smart-full-review');
    assert.ok(result,'full review result must save');
    assert.equal(result.total,b.length);
    assert.equal(result.percentage,100);
  }finally{f.dom.window.close();}
});
