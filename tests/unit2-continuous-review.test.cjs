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
  const authListeners=[];
  const auth={currentUser:{uid:profile.id},onAuthStateChanged(fn){authListeners.push(fn);return()=>{};}};
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
    async login(){for(const fn of authListeners)await fn(auth.currentUser);}};
}


function load(f,file){f.w.eval(fs.readFileSync(path.join(root,file),'utf8'));}
async function prepared(history='empty'){
  const f=fixture({realApp:true,decorated:true});
  for(const file of ['mg1-kb.js','student-smart-review.js','fix-my-mistakes.js'])load(f,file);
  f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
  f.w.STEPUP_AUTO_NEXT_TEST_DELAY_MS=100;
  const old=f.records((q,i)=>i%2===0);
  if(history==='two')f.stored.push(...old.slice(0,2));
  if(history==='complete')f.stored.push(...old);
  return f;
}
async function confirmedAnswer(f,q,correct){
  await until(()=>f.view().querySelector('.journey-question-card'));
  const strategy=f.view().querySelector('.u2-reading-try');if(strategy)strategy.click();
  await until(()=>f.view().querySelector('.smart-confirm'));
  assert.equal(f.prompt(),q.prompt,'must show the next original question exactly once');
  const before=f.writes.length,choices=f.view().querySelectorAll('.journey-options button');
  choices[correct?q.answer:(q.answer+1)%q.choices.length].click();
  assert.equal(f.writes.length,before,'choosing must not save before confirmation');
  f.view().querySelector('.smart-confirm').click();
  await until(()=>f.view().querySelector('.journey-feedback'));
  assert.equal(f.writes.length,before+1,'one confirmation must save exactly one answer');
  f.view().querySelector('[onclick="STEPUP_U2_EXAM.next()"]').click();
}
async function primary(f){
  f.api.open();await until(()=>f.view().querySelector('.journey-focus-start'));
  f.view().querySelector('.journey-focus-start').click();
}

for(const entry of ['primary','home','banner','practice'])test('Unit 2 '+entry+' completes every skill once before reporting mixed-answer mistakes',async()=>{
  const f=await prepared();try{
    await f.login();
    if(entry==='primary')await primary(f);
    if(entry==='home')f.w.STEPUP_JOURNEY.go('u2','core-1');
    if(entry==='practice')f.api.practice();
    if(entry==='banner'){
      f.api.open();await until(()=>f.view().querySelector('.smart-unit-panel button'));
      f.view().querySelector('.smart-unit-panel button').click();
    }
    for(let i=0;i<f.bank.length;i++){
      await confirmedAnswer(f,f.bank[i],i%3!==1);
      if(i===1)assert.equal(f.view().querySelector('.student-home-clean'),null);
    }
    await until(()=>f.view().querySelector('.smart-results .smart-score'));
    assert.equal(f.writes.length,f.bank.length,'incorrect answers must not restart any earlier skill');
    assert.equal(new Set(f.writes.map(a=>a.questionId)).size,f.bank.length);
    const expectedErrors=f.bank.filter((q,i)=>i%3===1).length;
    assert.equal(f.view().querySelectorAll('.smart-mistake').length,expectedErrors);
    assert.match(f.view().textContent,/My Learning Level/);
    assert.ok(f.view().querySelector('.smart-fix-entry'));
    f.view().querySelector('.smart-fix-entry').click();
    await until(()=>f.view().querySelector('.fix-recovery'));
    assert.equal(f.writes.length,f.bank.length,'opening Fix My Mistakes must not rescore or save unit questions');
    assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});

test('Continue Review resumes after two old answers and reports their mistakes at the end',async()=>{
  const f=await prepared('two');try{
    await f.login();await primary(f);
    await until(()=>f.prompt()===f.bank[2].prompt);
    for(const q of f.bank.slice(2))await confirmedAnswer(f,q,true);
    await until(()=>f.view().querySelector('.smart-results .smart-score'));
    assert.equal(f.writes.length,f.bank.length-2);
    assert.equal(f.view().querySelectorAll('.smart-mistake').length,1);
    assert.match(f.view().querySelector('.smart-score').textContent,/29\/30/);
    assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});

test('complete Continue Review below certificate threshold opens final summary instead of repeating mistakes',async()=>{
  const f=await prepared('complete');try{
    await f.login();await primary(f);
    await until(()=>f.view().querySelector('.smart-results .smart-score'));
    assert.match(f.view().querySelector('.smart-score').textContent,/50%/);
    assert.equal(f.view().querySelectorAll('.smart-mistake').length,15);
    assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);
    assert.equal(f.w.STEPUP_MASTERY.status('u2',f.stored).earned,false);
  }finally{f.dom.window.close();}
});

test('an all-correct first review reaches its final score, keeps earned mastery and opens the optional challenge',async()=>{
  const f=await prepared();try{
    await f.login();await primary(f);
    for(const q of f.bank)await confirmedAnswer(f,q,true);
    await until(()=>f.view().querySelector('.smart-results .smart-score'));
    assert.match(f.view().querySelector('.smart-score').textContent,/100%/);
    assert.equal(f.view().querySelectorAll('.smart-mistake').length,0);
    assert.equal(f.w.STEPUP_MASTERY.status('u2',f.stored).earned,true);
    const challenge=[...f.view().querySelectorAll('button')].find(b=>b.getAttribute('onclick')?.includes('startChallenge'));
    assert.ok(challenge);challenge.click();
    assert.equal(f.view().querySelectorAll('.smart-challenge-options button').length,4);
    assert.equal(f.writes.length,f.bank.length);
  }finally{f.dom.window.close();}
});

test('completed review report and Fix My Mistakes survive reload and remain scoped to the same student',async()=>{
  const first=await prepared('complete');let second;
  try{
    await first.login();await primary(first);
    await until(()=>first.view().querySelector('.smart-results .smart-score'));
    const oldSource=first.w.STEPUP_SMART.recoverySource('u2');
    second=await prepared('complete');
    for(let i=0;i<first.w.localStorage.length;i++){
      const key=first.w.localStorage.key(i);second.w.localStorage.setItem(key,first.w.localStorage.getItem(key));
    }
    await second.login();
    const restored=second.w.STEPUP_SMART.recoverySource('u2');
    assert.equal(restored.reviewRunId,oldSource.reviewRunId);
    second.w.STEPUP_FIX.start('u2');assert.ok(second.view().querySelector('.fix-recovery'));
    second.w.firebase.auth().currentUser.uid='different-student';
    assert.equal(second.w.STEPUP_SMART.recoverySource('u2'),null);
    second.w.STEPUP_FIX.start('u2');
    assert.equal(second.view().querySelector('.fix-original'),null);
    assert.equal(second.writes.length,0);assert.equal(second.summaries.length,0);
  }finally{first.dom.window.close();second?.dom.window.close();}
});

test('background pending-result sync preserves an active Unit 2 question after two confirmed answers',async()=>{
  const f=await prepared();try{
    let release;f.control.summaryDelay=new Promise(resolve=>release=resolve);
    f.w.localStorage.setItem('stepup_unsaved_results_v2',JSON.stringify([{
      studentId:f.profile.id,trainingId:'old-pending-result',trainingTitle:'Old result',trainingType:'review',score:1,total:1,percentage:100,submittedAt:'2026-10-10T00:00:00Z'
    }]));
    await f.login();await primary(f);
    await confirmedAnswer(f,f.bank[0],true);await confirmedAnswer(f,f.bank[1],false);
    await until(()=>f.prompt()===f.bank[2].prompt);
    release();await until(()=>JSON.parse(f.w.localStorage.getItem('stepup_unsaved_results_v2')).length===0);
    await wait(180);
    assert.equal(f.prompt(),f.bank[2].prompt,'sync must not replace the third question with Home');
    assert.equal(f.view().querySelector('.student-home-clean'),null);
    assert.equal(f.writes.length,2);
  }finally{f.dom.window.close();}
});
