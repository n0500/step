const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture(){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc
  });
  const w=dom.window,profile={id:'media-qa',uid:'media-qa',role:'student',displayName:'QA Student',classId:'qa',teacherId:'qa-teacher'};
  const writes=[],summaries=[],spoken=[];let canceled=0;
  w.firebase={apps:[{}],auth:()=>({currentUser:{uid:profile.id},onAuthStateChanged(){return()=>{};}}),firestore:()=>({collection(name){return{
    doc(){return{async get(){assert.fail('The cached profile should avoid remote reads');}};},
    async add(record){assert.equal(name,'attempts');writes.push(JSON.parse(JSON.stringify(record)));return{id:'qa-'+writes.length};},
    update(){assert.fail('Historical records must not be overwritten');},delete(){assert.fail('Historical records must not be deleted');}
  };}})};
  w.PROVE={setStudentTab(){w.document.querySelector('.student-view').innerHTML='';},async recordJourneyAttempt(record){summaries.push(record);return record;}};
  w.SpeechSynthesisUtterance=function(text){this.text=text;};
  w.speechSynthesis={cancel(){canceled++;},getVoices:()=>[{name:'English A',lang:'en-US'},{name:'English B',lang:'en-GB'}],speak(speech){spoken.push(speech);speech.onstart?.();}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.document.addEventListener('click',event=>{const button=event.target.closest('button[onclick]');if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));});
  function load(file){
    const baseline=process.env.STEP_U2_BASELINE && path.join(process.env.STEP_U2_BASELINE,file);
    w.eval(fs.readFileSync(baseline && fs.existsSync(baseline)?baseline:path.join(root,file),'utf8'));
  }
  ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js',
    'unit1-cleanup.js','unit1-review-all.js','unit3-content.js','unit3-review-all.js','unit2-source-override.js','unit2-exam-review.js','mg1-kb.js'].forEach(load);
  const api=w.STEPUP_U2_EXAM,bank=api.getMasteryBank();
  function hydrate(records){w.STEPUP_JOURNEY.html(records,['u1','u2','u3'],profile);}
  function beginReading(){
    const button=w.document.querySelector('.u2-reading-try,[onclick="STEPUP_JOURNEY.beginUnit2Skill()"]');
    assert.ok(button,'A reading start button must be available');button.click();
  }
  async function answer(choice){api.answer(choice);for(let i=0;i<100;i++){if(w.document.querySelector('.journey-feedback'))return;await wait(10);}assert.fail('Answer feedback did not appear');}
  function passage(){
    const element=w.document.querySelector('.u2-reading-passage,.journey-passage');
    assert.ok(element,'The passage must stay visible with the question');
    const text=element.textContent;
    for(const expected of ['JobPool','Media Intern','Archaeological Interns','Environmental Engineering','paid internship for the summer','unpaid three-month internship','Food and accommodation'])assert.ok(text.includes(expected),'Missing reading context: '+expected);
    assert.notEqual(w.getComputedStyle(element).display,'none');
  }
  function player(){assert.ok(w.document.querySelector('.u2-listening-player'),'The listening player must remain available');assert.ok(w.document.querySelector('[onclick="STEPUP_U2_EXAM.listen()"]'));}
  hydrate([]);
  return{dom,w,api,bank,errors,writes,summaries,spoken,hydrate,beginReading,answer,passage,player,load,get canceled(){return canceled;}};
}

test('the student journey shows the complete reading with every Unit 2 question',async()=>{
  const f=fixture();try{
    f.w.STEPUP_JOURNEY.go('u2','reading');
    const questions=f.bank.filter(q=>q.section==='reading');
    for(let i=0;i<questions.length;i++){
      f.beginReading();f.passage();assert.equal(f.w.document.querySelector('.journey-question-card h2').textContent,questions[i].prompt);
      await f.answer(questions[i].answer);if(i<questions.length-1)await f.api.next();
    }
    assert.equal(f.writes.length,4);assert.equal(f.errors.length,0);
  }finally{f.dom.window.close();}
});

test('direct reading entry also keeps the full passage with the question',()=>{
  const f=fixture();try{f.w.STEPUP_JOURNEY.startReading('u2');f.beginReading();f.passage();}finally{f.dom.window.close();}
});

test('reading feedback retains the evidence for correct and incorrect answers',async()=>{
  const f=fixture();try{
    f.api.start('reading');const questions=f.bank.filter(q=>q.section==='reading');
    for(let i=0;i<2;i++){
      f.beginReading();await f.answer(i?questions[i].answer:(questions[i].answer+1)%4);
      f.passage();assert.match(f.w.document.querySelector('.journey-feedback h2').textContent,i?/Correct!/:/Not quite/);
      if(i===0)await f.api.next();
    }
  }finally{f.dom.window.close();}
});

test('listening plays and replays the complete dialogue with every question',async()=>{
  const f=fixture();try{
    f.w.STEPUP_JOURNEY.go('u2','listening');const questions=f.bank.filter(q=>q.section==='listening');
    for(let i=0;i<questions.length;i++){
      f.player();const before=f.spoken.length;f.w.document.querySelector('[onclick="STEPUP_U2_EXAM.listen()"]').click();
      const speech=f.spoken.slice(before);assert.equal(speech.length,7);assert.match(speech[0].text,/job at the TV station/);assert.match(speech[6].text,/organized, reliable, hardworking/);
      assert.ok(speech.every(s=>s.lang==='en-US'&&s.rate>0));assert.match(f.w.document.querySelector('#u2ListeningStatus').textContent,/Playing/);
      f.api.listen();assert.equal(f.spoken.length,before+14);f.api.stopAudio();assert.match(f.w.document.querySelector('#u2ListeningStatus').textContent,/Stopped/);
      await f.answer(questions[i].answer);if(i<questions.length-1)await f.api.next();
    }
    assert.equal(f.writes.length,4);assert.equal(f.errors.length,0);
  }finally{f.dom.window.close();}
});

test('direct listening entry uses the same question player as the student journey',()=>{
  const f=fixture();try{f.w.STEPUP_JOURNEY.startListening('u2');f.player();f.api.listen();assert.equal(f.spoken.length,7);}finally{f.dom.window.close();}
});

test('listening feedback still allows replay to check the evidence',async()=>{
  const f=fixture();try{
    f.api.start('listening');const q=f.bank.find(q=>q.section==='listening');await f.answer((q.answer+1)%4);
    f.player();f.api.listen();assert.equal(f.spoken.length,7);assert.match(f.w.document.querySelector('.journey-feedback h2').textContent,/Not quite/);
  }finally{f.dom.window.close();}
});

test('the decorated journey preserves the reading and listening media and historical records',async()=>{
  const f=fixture();try{
    const old=[{trainingId:'journey-u2-reading',answers:[{question_id:'legacy-u2-reading',correct:true}],percentage:100,submittedAt:'2026-09-01'},
      {trainingId:'mastery-certificate-u2',recordKind:'certificate',certificateEarned:true,percentage:100,submittedAt:'2026-09-01'}];
    const original=JSON.stringify(old),requirements=JSON.stringify(f.api.getCertificateRequirements());
    ['journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js'].forEach(f.load);
    f.hydrate(old);f.api.open();await wait(350);
    f.api.readingLesson();f.beginReading();await wait(30);f.passage();
    f.api.start('listening');await wait(30);f.player();
    assert.equal(JSON.stringify(old),original);assert.equal(JSON.stringify(f.api.getCertificateRequirements()),requirements);
    assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);assert.equal(f.errors.length,0);
    f.w.STEPUP_JOURNEY.startReading('u1');assert.ok(f.w.document.querySelector('.journey-passage'));
    f.w.STEPUP_JOURNEY.startListening('u1');assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));
  }finally{f.dom.window.close();}
});
