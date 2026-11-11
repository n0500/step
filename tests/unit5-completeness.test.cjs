const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');const wait=ms=>new Promise(r=>setTimeout(r,ms));
for(const score of [0,22,25,28])test('Unit 5 compact view preserves all lessons and certificate at '+score+'/28',async()=>{
 const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.PROVE={};w.firebase={auth:()=>({currentUser:{uid:'qa'}})};w.HTMLElement.prototype.scrollIntoView=function(){};
 let certificate=false;w.STEPUP_CELEBRATE={showCertificate:()=>certificate=true};
 try{
 for(const f of ['journey-engine.js','unit4-content.js','unit5-step-compilations.js','unit5-6-content.js','unit5-6-revision.js','unit5-fmf-live.js','stepup-mastery.js','unit5-6-practice-again.js','journey-focus.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
 const M=w.STEPUP_MASTERY,J=w.STEPUP_JOURNEY,profile={id:'qa',role:'student'},bank=M.bank('u5');
 const records=score?bank.map((q,i)=>({recordKind:'question',examUnit:'u5',examSection:q.section,questionId:q.id,studentId:'qa',correct:i<score,submittedAt:'2026-11-02T12:00:00Z'})):[];
 const original=JSON.stringify(records);M.hydrate(records,profile);J.html(records,['u5'],profile);J.openUnit('u5');await wait(150);
 const h=w.document.querySelector('.student-view'),shell=h.querySelector('.journey-focus-shell');assert.ok(shell);assert.equal(h.querySelector('.sum-card-slot'),null);assert.equal(h.querySelector('.u56-full-entry'),null);
 assert.equal(shell.querySelectorAll('.journey-focus-stage').length,6);
 assert.equal(shell.querySelector('.journey-focus-head').dataset.ringPct,String(Math.round(score/28*100)));
 const calls=[];J.go=(id,key)=>calls.push(key);J.startStep=()=>calls.push('step');
 for(const label of ['Vocab','Grammar']){shell.querySelector('[data-skill="'+label+'"]').click();for(const b of shell.querySelectorAll('[data-lesson]'))b.click();}
 for(const label of ['Functions','Read','Listen','STEP'])shell.querySelector('[data-skill="'+label+'"]').click();
 assert.deepEqual(calls,['core-1','core-5','core-2','core-3','core-4','reading','listening','step']);
 assert.equal(!!shell.querySelector('[data-u4-action="certificate"]'),score>=23);if(score>=23){shell.querySelector('[data-u4-action="certificate"]').click();assert.equal(certificate,true);}
 let review=false;w.STEPUP_U56_PRACTICE.begin=()=>review=true;shell.querySelector('.journey-focus-start').click();assert.equal(review,true);
 await wait(100);assert.equal(h.querySelectorAll('.journey-focus-shell').length,1);assert.equal(JSON.stringify(records),original);
 }finally{dom.window.close();}
});

test('Unit 5 complete bank gives feedback, keeps media and separates STEP from mastery',async()=>{
 const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only'}),w=dom.window;
 w.PROVE={recordJourneyAttempt:async p=>p};w.firebase={auth:()=>({currentUser:{uid:'qa'}})};
 try{
  for(const f of ['journey-engine.js','answer-response-guard.js','unit5-step-compilations.js','unit5-6-content.js','unit5-6-revision.js','stepup-mastery.js','unit5-6-practice-again.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
  const J=w.STEPUP_JOURNEY,M=w.STEPUP_MASTERY,h=w.document.querySelector('.student-view');
  M.hydrate([],{id:'qa',role:'student'});J.html([],['u5'],{id:'qa',role:'student'});
  const bank=M.bank('u5');assert.equal(bank.length,28);assert.equal(new Set(bank.map(q=>q.id)).size,28);assert.ok(M.validBank('u5'));
  assert.equal(w.STEPUP_U5_STEP.banks.grammar.length,6);assert.equal(w.STEPUP_U5_STEP.banks.fmf.length,6);
  assert.ok(w.STEPUP_U5_STEP.banks.grammar.some(q=>q.skill==='Because'));
  for(const q of Object.values(w.STEPUP_U5_STEP.banks).flat())assert.equal(q.certificate_eligible,false);
  let visited=0;
  for(const section of new Set(bank.map(q=>q.section))){
   J.go('u5',section);if(['reading','listening'].includes(section)){
    if(section==='reading')assert.match(h.textContent,/Phineas P. Gage/);
    else assert.match(h.querySelector('audio').src,/unit-05\/conversation.mp3/);
    J.beginStandardQuiz();
   }
   const count=bank.filter(q=>q.section===section).length;
   for(let i=0;i<count;i++){
    const q=bank.find(q=>q.prompt===h.querySelector('.journey-question-card h2').textContent);assert.ok(q);
    const raw=J.data.questions.find(x=>x.question_id===q.id);J.answer((q.answer+1)%4);
    assert.match(h.textContent,/Your answer:/);assert.match(h.textContent,/Correct answer:/);assert.ok(h.querySelector('.answer-explanation').textContent.includes(raw.explanation));
    const before=h.innerHTML;J.answer(0);assert.equal(h.innerHTML,before);visited++;
    await J.feedbackNext();
   }
  }
  assert.equal(visited,28);
  assert.ok(fs.statSync(path.join(__dirname,'../assets/audio/mega-goal-1/unit-05/conversation.mp3')).size>10000);
 }finally{dom.window.close();}
});
