const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<100;i++){if(check())return;await wait(10);}assert.fail('Expected UI state did not appear');}

function fixture(unit){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window,profile={id:'status-qa',uid:'status-qa',role:'student',displayName:'QA Student',classId:'qa',teacherId:'qa-teacher'};
  const writes=[],summaries=[];
  w.firebase={apps:[{}],auth:()=>({currentUser:{uid:profile.id},onAuthStateChanged(){return()=>{};}}),firestore:()=>({collection(name){return{
    doc(){return{async get(){return{exists:true,data:()=>({...profile})};}};},where(){return this;},async get(){return{docs:[]};},
    async add(record){assert.equal(name,'attempts');writes.push(JSON.parse(JSON.stringify(record)));return{id:'saved-'+writes.length};},
    update(){assert.fail('Existing records must not be changed');},delete(){assert.fail('Existing records must not be deleted');}
  };}})};
  w.PROVE={setStudentTab(){w.document.querySelector('.student-view').innerHTML='';},async recordJourneyAttempt(record){summaries.push(JSON.parse(JSON.stringify(record)));return{...record,submittedAt:new Date().toISOString()};}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.document.addEventListener('click',e=>{const b=e.target.closest('button[onclick]');if(b&&!b.disabled)w.eval(b.getAttribute('onclick'));});
  function load(file){w.eval(fs.readFileSync(path.join(root,file),'utf8'));}
  ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js','unit1-cleanup.js',
    'unit1-review-all.js','unit3-content.js','unit3-review-all.js','unit2-source-override.js','unit2-exam-review.js','unit3-classmode-reading.js','mg1-kb.js',
    'journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js','unit3-future-challenge.js'].forEach(load);
  const api={u1:w.STEPUP_U1_REVIEW,u2:w.STEPUP_U2_EXAM,u3:w.STEPUP_U3_REVIEW}[unit],bank=api.getMasteryBank();
  const view=()=>w.document.querySelector('.student-view');let attempts=[];
  function hydrate(list){attempts=list;w.STEPUP_JOURNEY.html(attempts,['u1','u2','u3','u4'],profile);}
  function records(correct){return bank.map((q,i)=>({id:'old-'+i,recordKind:'question',examUnit:unit,examSection:q.section,questionId:q.id,
    trainingId:'question-'+unit+'-'+q.id,correct:correct(q,i),bestCorrect:correct(q,i),studentId:profile.id,submittedAt:'2026-09-01T00:00:00.000Z'}));}
  async function open(){api.open();await until(()=>view().querySelector('.journey-focus-head .sx-ring'));await wait(150);}
  function stage(key){return view().querySelector('.journey-focus-roadmap [data-review-section="'+key+'"]');}
  function assertReview(key){const s=stage(key);assert.ok(s);assert.equal(s.classList.contains('done'),false);assert.equal(s.classList.contains('needs-review'),true);assert.equal(s.querySelector('.journey-focus-dot').textContent,'↻');assert.match(s.querySelector('em').textContent,/Needs review/);assert.equal(s.classList.contains('sxc-completed'),false);assert.match(s.getAttribute('aria-label'),/Needs review/);}
  async function answer(choice){api.answer(choice);await until(()=>view().querySelector('.journey-feedback'));}
  const core=bank.filter(q=>!['reading','listening','step'].includes(q.section)).sort((a,b)=>bank.filter(q=>q.section===b.section).length-bank.filter(q=>q.section===a.section).length)[0].section;
  hydrate([]);
  return{dom,w,api,bank,core,errors,writes,summaries,view,hydrate,records,open,stage,assertReview,answer,get attempts(){return attempts;}};
}

for(const unit of ['u1','u2','u3']){
  test(unit+': answering everything with mistakes never creates 100% or a check',async()=>{
    const f=fixture(unit);try{
      const old=f.records((q,i)=>i%2===0),original=JSON.stringify(old);f.hydrate(old);await f.open();
      const expected=Math.round(old.filter(a=>a.correct).length/old.length*100),g=f.api.getProgress();
      assert.equal(g.percentage,100);assert.equal(g.reviewAccuracy,expected);
      assert.equal(f.view().querySelector('.sx-ring').dataset.pct,String(expected));assert.match(f.view().querySelector('.sx-ring').getAttribute('aria-label'),/review accuracy/);
      const keys=[...new Set(f.bank.map(q=>q.section))];
      for(const key of keys){if(f.api.sectionProgress(key).missed)f.assertReview(key);}
      assert.equal(f.view().querySelector('.journey-focus-roadmap').children.length,keys.length+(unit==='u2'?1:0));
      assert.equal([...f.view().querySelectorAll('.journey-focus-stage small')].some(s=>s.textContent==='Master'),false);
      assert.equal(JSON.stringify(old),original);assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);assert.deepEqual(f.errors,[]);
    }finally{f.dom.window.close();}
  });

  test(unit+': a single wrong answer above the certificate threshold still needs review',async()=>{
    const f=fixture(unit);try{
      const wrong=f.bank.find(q=>q.section===f.core),old=f.records(q=>q.id!==wrong.id);f.hydrate(old);await f.open();
      assert.ok(f.api.sectionProgress(f.core).reviewAccuracy>=80);f.assertReview(f.core);
      const good=[...new Set(f.bank.map(q=>q.section))].find(k=>k!==f.core);
      assert.equal(f.stage(good).querySelector('.journey-focus-dot').textContent,'✓');
      assert.equal(f.api.getProgress().nextSection,f.core);assert.notEqual(f.view().querySelector('.sx-ring').dataset.pct,'100');
      f.stage(f.core).click();assert.equal(f.view().querySelector('.journey-question-card h2').textContent,wrong.prompt);assert.equal(f.view().querySelector('.journey-question-meta b').textContent,'1/1');
    }finally{f.dom.window.close();}
  });

  test(unit+': a wrong partial skill remains visible after opening another skill',async()=>{
    const f=fixture(unit);try{
      const record=f.records(()=>false).find(q=>q.examSection===f.core);f.hydrate([record]);await f.open();f.assertReview(f.core);
      const other=f.bank.find(q=>q.section!==f.core&&!['reading','listening','final'].includes(q.section));f.stage(other.section).click();
      assert.ok(f.view().querySelector('.journey-options'));assert.equal(f.writes.length,0);
      await f.open();f.assertReview(f.core);assert.equal(f.api.sectionProgress(f.core).answered,1);assert.equal(f.api.getProgress().reviewAccuracy,0);
    }finally{f.dom.window.close();}
  });

  test(unit+': latest wrong answers override newer cumulative summaries, while historical credit and certificates survive',async()=>{
    const f=fixture(unit);try{
      const old=f.records(()=>true),wrong=f.bank.find(q=>q.section===f.core),ids=JSON.stringify(f.api.getCertificateRequirements());
      const latest={...old.find(a=>a.questionId===wrong.id),id:'latest-wrong',correct:false,bestCorrect:true,submittedAt:'2026-09-02T00:00:00.000Z'};
      const requirement=f.api.getCertificateRequirements().find(q=>q.questionId===wrong.id);
      const summary={trainingId:requirement.trainingId,percentage:100,attemptPercentage:80,studyMethod:unit+'-full-review',submittedAt:'2026-09-03T00:00:00.000Z',
        answers:f.bank.filter(q=>q.section===f.core).map(q=>({question_id:q.id,correct:true}))};
      const source=[...old,latest,summary],original=JSON.stringify(source);f.hydrate(source);await f.open();f.assertReview(f.core);
      assert.equal(f.api.getProgress().correct,f.bank.length);assert.equal(f.api.getProgress().accuracy,100);assert.ok(f.api.getProgress().reviewAccuracy<100);
      assert.equal(f.w.STEPUP_MASTERY.status(unit,source).earned,true);assert.equal(JSON.stringify(source),original);assert.equal(JSON.stringify(f.api.getCertificateRequirements()),ids);
      f.stage(f.core).click();assert.equal(f.view().querySelector('.journey-question-card h2').textContent,wrong.prompt);
      await f.answer(wrong.answer);await f.api.next();await f.open();
      assert.equal(f.stage(f.core).querySelector('.journey-focus-dot').textContent,'✓');assert.equal(f.stage(f.core).classList.contains('needs-review'),false);
      assert.equal(f.api.getProgress().reviewAccuracy,100);assert.equal(f.writes.length,1);assert.equal(f.writes[0].bestCorrect,true);
      assert.equal(JSON.stringify(source.slice(0,old.length+2)),original);assert.equal(f.w.STEPUP_MASTERY.status(unit,source).earned,true);
    }finally{f.dom.window.close();}
  });

  test(unit+': cards, Home and Progress use actual correct answers before the visual layer reads them',async()=>{
    const f=fixture(unit);try{
      const source=f.records((q,i)=>i%2===0);f.hydrate(source);const pct=f.api.getProgress().reviewAccuracy;
      f.view().innerHTML=f.w.STEPUP_JOURNEY.html(source,[unit],{id:'status-qa',role:'student'});await wait(200);
      const card=f.view().querySelector('.journey-unit-card:not(.locked)');assert.match(card.querySelector('.journey-status').textContent,/Needs review/);assert.equal(card.classList.contains('complete'),false);assert.equal(card.querySelector('.journey-mini-progress i').style.width,pct+'%');assert.match(card.querySelector('strong').textContent,new RegExp('^'+pct+'%'));
      f.view().innerHTML='<section class="student-home-clean">'+f.w.STEPUP_JOURNEY.homeHTML(source,[unit],{id:'status-qa',role:'student'})+'</section>';await wait(200);
      assert.equal(f.view().querySelector('.journey-continue .sx-ring').dataset.pct,String(pct));assert.match(f.view().querySelector('.journey-continue .sx-ring').getAttribute('aria-label'),/review accuracy/);assert.match(f.view().querySelector('.sx-h-chips').textContent,/Skills mastered/);
      f.view().innerHTML='<div class="student-page-head"><h1>My Progress</h1></div>'+f.w.STEPUP_JOURNEY.progressHTML(source,[unit],{id:'status-qa',role:'student'});await wait(200);
      assert.equal(f.view().querySelector('.journey-progress-units b').textContent,pct+'% accuracy');assert.equal(f.view().querySelector('.sx-progress-hero .sx-ring').dataset.pct,String(pct));
      assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);assert.deepEqual(f.errors,[]);
    }finally{f.dom.window.close();}
  });

  test(unit+': only all correct answers show 100%, and the decorated view settles without writes',async()=>{
    const f=fixture(unit);try{
      f.hydrate(f.records(()=>true));await f.open();
      assert.equal(f.view().querySelector('.sx-ring').dataset.pct,'100');
      for(const key of [...new Set(f.bank.map(q=>q.section))]){assert.equal(f.stage(key).querySelector('.journey-focus-dot').textContent,'✓');assert.equal(f.stage(key).classList.contains('needs-review'),false);}
      let mutations=0;const observer=new f.w.MutationObserver(list=>mutations+=list.length);observer.observe(f.view(),{childList:true,subtree:true});
      await wait(800);mutations=0;await wait(250);assert.equal(mutations,0);observer.disconnect();assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);
    }finally{f.dom.window.close();}
  });

  test(unit+': an incorrect retake displays this attempt, while the earlier perfect score stays credited',async()=>{
    const f=fixture(unit);try{
      const old=f.records(()=>true),original=JSON.stringify(old);f.hydrate(old);f.api.start(f.core);
      const questions=f.bank.filter(q=>q.section===f.core),score=Math.ceil(questions.length/2);
      for(let i=0;i<questions.length;i++){await f.answer(i%2===0?questions[i].answer:(questions[i].answer+1)%questions[i].choices.length);await f.api.next();}
      await wait(200);const result=f.view().querySelector('.journey-result');assert.ok(result);
      assert.equal(result.querySelector('.journey-result-score').textContent,score+'/'+questions.length);
      assert.match(result.querySelector('h2').textContent,new RegExp(Math.round(score/questions.length*100)+'%'));
      assert.equal(result.classList.contains('good'),false);assert.match(result.textContent,/Cumulative accuracy:/);assert.match(result.textContent,/100%/);
      assert.equal(f.summaries.at(-1).score,questions.length);assert.equal(f.summaries.at(-1).attemptScore,score);
      assert.equal(f.w.STEPUP_MASTERY.status(unit,f.attempts).earned,true);assert.equal(JSON.stringify(old.slice(0,f.bank.length)),original);
      await f.open();f.assertReview(f.core);assert.ok(f.api.getProgress().reviewAccuracy<100);
    }finally{f.dom.window.close();}
  });
}

test('Unit 2 STEP practice can retain its earned badge while incorrect answers have no check',async()=>{
  const f=fixture('u2');try{
    const source=[...f.records(()=>true),{trainingId:'journey-u2-step',percentage:75,bestPercentage:75,submittedAt:'2026-09-02'}];
    f.hydrate(source);f.api.start('step');const prompt=f.view().querySelector('.journey-question-card h2').textContent;
    const q=f.api.getMasteryBank().find(q=>q.prompt===prompt);assert.ok(!q,'STEP is extra practice, outside certificate questions');
    await f.answer(0);assert.match(f.view().querySelector('.journey-feedback').textContent,/Not quite/);await f.open();f.assertReview('step');
    assert.match(f.view().querySelector('.sxc-step-summary').textContent,/STEP READY/);assert.equal(f.w.STEPUP_MASTERY.status('u2',source).earned,true);
  }finally{f.dom.window.close();}
});

test('future-unit roadmap checks also require a perfect latest attempt',async()=>{
  const f=fixture('u1');try{
    const source=[{trainingId:'journey-u4-reading',percentage:100,submittedAt:'2026-09-01'},{trainingId:'journey-u4-reading',percentage:100,attemptPercentage:50,submittedAt:'2026-09-02'},
      {trainingId:'journey-u4-step',percentage:50,submittedAt:'2026-09-01'}];
    f.hydrate(source);f.w.STEPUP_JOURNEY.openUnit('u4');await until(()=>f.view().querySelector('.journey-focus-roadmap .sxc-stage-status'));await wait(150);
    for(const label of ['Read','STEP']){
      const s=[...f.view().querySelectorAll('.journey-focus-stage')].find(s=>s.querySelector('small').textContent===label);assert.ok(s);assert.equal(s.classList.contains('done'),false);assert.equal(s.querySelector('.journey-focus-dot').textContent,'↻');assert.match(s.textContent,/Needs review/);assert.equal(s.classList.contains('sxc-completed'),false);
    }
  }finally{f.dom.window.close();}
});

test('a completed timed STEP retake still contains the full question set',async()=>{
  const f=fixture('u2');try{
    f.hydrate(f.records(()=>true));f.api.startTimedStep();
    const total=Number(f.view().querySelector('.u2-question-meta-right > b:last-child').textContent.split('/')[1]);assert.ok(total>1);
    for(let i=0;i<total;i++){await f.answer(0);await f.api.next();}
    await f.open();f.assertReview('step');f.api.startTimedStep();
    assert.equal(f.view().querySelector('.u2-question-meta-right > b:last-child').textContent,'1/'+total);
    assert.equal(f.summaries.at(-1).attemptTotal,total);
  }finally{f.dom.window.close();}
});

test('a rounded average cannot show 100% when a unit still has an incorrect answer',async()=>{
  const f=fixture('u1');try{
    const original=f.api.getProgress;
    f.api.getProgress=()=>({...original(),answered:301,total:301,reviewCorrect:300,reviewAccuracy:99});
    const source=['u2','u3'].flatMap(id=>{
      const api=id==='u2'?f.w.STEPUP_U2_EXAM:f.w.STEPUP_U3_REVIEW;
      return api.getMasteryBank().map(q=>({recordKind:'question',examUnit:id,examSection:q.section,questionId:q.id,correct:true,bestCorrect:true,submittedAt:'2026-09-01'}));
    });
    f.hydrate(source);f.view().innerHTML='<div class="student-page-head"><h1>My Progress</h1></div>'+f.w.STEPUP_JOURNEY.progressHTML(source,['u1','u2','u3'],{id:'status-qa',role:'student'});await wait(200);
    assert.equal(f.view().querySelector('.sx-progress-hero .sx-ring').dataset.pct,'99');
  }finally{f.dom.window.close();}
});

test('a preserved bestCorrect credit is retained in a new Unit 2 summary even without its older answer record',async()=>{
  const f=fixture('u2');try{
    const source=f.records(()=>true),wrong=source.find(a=>a.examSection===f.core);
    wrong.correct=false;wrong.bestCorrect=true;const original=JSON.stringify(source);f.hydrate(source);f.api.start(f.core);
    const q=f.bank.find(q=>q.id===wrong.questionId);await f.answer((q.answer+1)%q.choices.length);await f.api.next();
    assert.equal(f.view().querySelector('.journey-result-score').textContent,'0/1');
    assert.equal(f.summaries.at(-1).score,f.bank.filter(q=>q.section===f.core).length);
    assert.equal(f.summaries.at(-1).attemptScore,0);assert.equal(f.api.getProgress().accuracy,100);
    assert.equal(JSON.stringify(source.slice(0,f.bank.length)),original);
  }finally{f.dom.window.close();}
});
