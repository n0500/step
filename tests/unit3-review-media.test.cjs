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
  w.speechSynthesis={cancel(){canceled++;},getVoices:()=>[{name:'English',lang:'en-US'}],speak(speech){spoken.push(speech);speech.onstart?.();}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.document.addEventListener('click',event=>{const button=event.target.closest('button[onclick]');if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));});
  function load(file){
    const baseline=process.env.STEP_U3_BASELINE && path.join(process.env.STEP_U3_BASELINE,file);
    w.eval(fs.readFileSync(baseline && fs.existsSync(baseline)?baseline:path.join(root,file),'utf8'));
  }
  ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js',
    'unit1-cleanup.js','unit1-review-all.js','unit3-content.js','unit3-review-all.js','unit2-source-override.js','unit2-exam-review.js','mg1-kb.js'].forEach(load);
  const api=w.STEPUP_U3_REVIEW,bank=api.getMasteryBank(),unit=w.STEPUP_JOURNEY.data.units.find(u=>u.id==='u3');
  function hydrate(records){w.STEPUP_JOURNEY.html(records,['u1','u2','u3'],profile);}
  async function answer(choice){api.answer(choice);for(let i=0;i<100;i++){if(w.document.querySelector('.journey-feedback'))return;await wait(10);}assert.fail('Answer feedback did not appear');}
  function passage(){
    const element=w.document.querySelector('.u3-reading-passage');
    assert.ok(element,'The full passage must remain visible');assert.ok(element.open,'The passage must be open initially');
    const paragraphs=Array.from(element.querySelectorAll('p')).map(p=>p.textContent);
    assert.deepEqual(paragraphs,unit.reading.split(/\n\s*\n/));assert.equal(paragraphs.length,5);
    assert.match(element.textContent,/five gallons|Five gallons/);assert.match(element.textContent,/covered in rust/);assert.match(element.textContent,/Teddy and Gene were still alive/);
    assert.notEqual(w.getComputedStyle(element).display,'none');
  }
  function player(){assert.ok(w.document.querySelector('.u3-listening-player'),'The listening player must remain available');assert.ok(w.document.querySelector('[onclick="STEPUP_U3_REVIEW.listen()"]'));}
  function directReading(){w.STEPUP_JOURNEY.startReading('u3');w.document.querySelector('[onclick="STEPUP_JOURNEY.beginStandardQuiz()"]')?.click();}
  hydrate([]);
  return{dom,w,api,bank,unit,errors,writes,summaries,spoken,hydrate,answer,passage,player,directReading,load,get canceled(){return canceled;}};
}

test('all seven Unit 3 reading questions retain every paragraph of the existing text',async()=>{
  const f=fixture();try{
    f.w.STEPUP_JOURNEY.go('u3','reading');const questions=f.bank.filter(q=>q.section==='reading');assert.equal(questions.length,7);
    for(let i=0;i<questions.length;i++){
      f.passage();assert.equal(f.w.document.querySelector('.journey-question-card h2').textContent,questions[i].prompt);
      await f.answer(questions[i].answer);if(i<questions.length-1)await f.api.next();
    }
    assert.equal(f.writes.length,7);assert.equal(f.errors.length,0);
  }finally{f.dom.window.close();}
});

test('the direct reading entry retains the full text during questions',()=>{
  const f=fixture();try{f.directReading();f.passage();assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,'1/7');}finally{f.dom.window.close();}
});

test('reading evidence remains available after both incorrect and correct answers',async()=>{
  const f=fixture();try{
    f.api.start('reading');const questions=f.bank.filter(q=>q.section==='reading');
    for(let i=0;i<2;i++){
      await f.answer(i?questions[i].answer:(questions[i].answer+1)%4);f.passage();
      assert.match(f.w.document.querySelector('.journey-feedback h2').textContent,i?/Correct!/:/Not quite/);
      if(i===0)await f.api.next();
    }
  }finally{f.dom.window.close();}
});

test('all four listening questions can play, replay, and stop the complete graduation script',async()=>{
  const f=fixture();try{
    f.w.STEPUP_JOURNEY.go('u3','listening');const questions=f.bank.filter(q=>q.section==='listening');assert.equal(questions.length,4);
    for(let i=0;i<questions.length;i++){
      f.player();const before=f.spoken.length;f.w.document.querySelector('[onclick="STEPUP_U3_REVIEW.listen()"]').click();
      assert.equal(f.spoken[before].text,f.unit.listening);assert.equal(f.spoken[before].lang,'en-US');
      for(const name of ['Ibrahim Al-Onazy','Steven Walker','Saeed Al-Yami','Jim Miller','Riverside High'])assert.ok(f.spoken[before].text.includes(name));
      f.api.listen();assert.equal(f.spoken.length,before+2);const canceled=f.canceled;f.api.stopAudio();assert.ok(f.canceled>canceled);
      await f.answer(questions[i].answer);if(i<questions.length-1)await f.api.next();
    }
    assert.equal(f.writes.length,4);assert.equal(f.errors.length,0);
  }finally{f.dom.window.close();}
});

test('the direct listening entry provides replay alongside the first question',()=>{
  const f=fixture();try{f.w.STEPUP_JOURNEY.startListening('u3');f.player();f.api.listen();assert.equal(f.spoken[0].text,f.unit.listening);}finally{f.dom.window.close();}
});

test('listening remains replayable after incorrect and correct answers',async()=>{
  const f=fixture();try{
    f.api.start('listening');const questions=f.bank.filter(q=>q.section==='listening');
    for(let i=0;i<2;i++){
      await f.answer(i?questions[i].answer:(questions[i].answer+1)%4);f.player();f.api.listen();assert.equal(f.spoken[i].text,f.unit.listening);
      assert.match(f.w.document.querySelector('.journey-feedback h2').textContent,i?/Correct!/:/Not quite/);
      if(i===0)await f.api.next();
    }
  }finally{f.dom.window.close();}
});

test('audio status reports playback failures and ignores stopped speech callbacks',()=>{
  const f=fixture();try{
    f.api.start('listening');f.api.listen();const first=f.spoken[0];
    assert.match(f.w.document.querySelector('#u3ListeningStatus')?.textContent||'',/Playing/);
    f.api.stopAudio();first.onend?.();assert.match(f.w.document.querySelector('#u3ListeningStatus').textContent,/Stopped/);
    f.api.listen();f.spoken[1].onerror?.();assert.match(f.w.document.querySelector('#u3ListeningStatus').textContent,/try again/i);
    delete f.w.speechSynthesis;f.api.listen();assert.match(f.w.document.querySelector('#u3ListeningStatus').textContent,/not supported/);
  }finally{f.dom.window.close();}
});

test('the decorated flow keeps earlier answers and certificates and delegates other units',async()=>{
  const f=fixture();try{
    const q=f.bank.find(q=>q.section==='reading');
    const old=[{trainingId:'journey-u3-reading',answers:[{question_id:q.id,correct:true}],percentage:100,submittedAt:'2026-09-01'},
      {trainingId:'mastery-certificate-u3',recordKind:'certificate',certificateEarned:true,percentage:100,submittedAt:'2026-09-01'}];
    const original=JSON.stringify(old),requirements=JSON.stringify(f.api.getCertificateRequirements());
    ['journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js'].forEach(f.load);
    f.hydrate(old);f.api.open();await wait(350);assert.equal(f.api.sectionProgress('reading').correct,1);
    f.w.STEPUP_JOURNEY.startReading('u3');await wait(30);f.passage();assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,'1/6');
    f.w.STEPUP_JOURNEY.startListening('u3');await wait(30);f.player();
    assert.equal(JSON.stringify(old),original);assert.equal(JSON.stringify(f.api.getCertificateRequirements()),requirements);
    assert.equal(f.writes.length,0);assert.equal(f.summaries.length,0);assert.equal(f.errors.length,0);
    f.w.STEPUP_JOURNEY.startReading('u1');assert.ok(f.w.document.querySelector('.journey-passage'));
    f.w.STEPUP_JOURNEY.startListening('u1');assert.ok(f.w.document.querySelector('[onclick*="playAudio"]'));
    f.w.STEPUP_JOURNEY.startReading('u2');f.w.STEPUP_U2_EXAM.beginReadingQuestion();assert.ok(f.w.document.querySelector('.u2-reading-passage'));
    f.w.STEPUP_JOURNEY.startListening('u2');assert.ok(f.w.document.querySelector('.u2-listening-player'));
  }finally{f.dom.window.close();}
});
