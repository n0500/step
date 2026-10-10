const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const source=fs.readFileSync(path.join(__dirname,'..','unit3-future-challenge.js'),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture(){
  const errors=[],attempts=[],navigation=[],sounds=[],vc=new VirtualConsole();
  vc.on('jsdomError',error=>errors.push(error.message));
  const teacherPage='<main dir="rtl"><section class="teacher-classmode-v2"><div class="teacher-classmode-controls"></div></section></main>';
  const dom=new JSDOM('<div id="app">'+teacherPage+'</div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  const style=w.document.createElement('style');style.textContent=fs.readFileSync(path.join(__dirname,'..','unit3-future-challenge.css'),'utf8');w.document.head.appendChild(style);
  w.PROVE={setTeacherTab(tab){navigation.push(tab);w.document.getElementById('app').innerHTML=teacherPage;},async recordJourneyAttempt(attempt){attempts.push(attempt);}};
  w.STEPUP_JOURNEY={openUnit(id){navigation.push(id);w.document.getElementById('app').innerHTML='<header id="studentHeader">StepUp</header><div class="student-view"><section class="journey-unit-hero"><span class="journey-kicker">Unit 3</span></section></div>';}};
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}};
  function node(){return{frequency:parameter,gain:parameter,connect(){return this;},start(){sounds.push('start');},stop(){sounds.push('stop');}};}
  w.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.sampleRate=100;this.destination={};}createOscillator(){return node();}createGain(){return node();}createBiquadFilter(){return node();}createBufferSource(){return node();}createBuffer(channels,count){return{getChannelData(){return new Float32Array(count);}};}};
  w.document.addEventListener('click',event=>{const button=event.target.closest('button[onclick]');if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));});
  w.eval(source);
  const $=selector=>w.document.querySelector(selector);
  const click=selector=>{const button=$(selector);assert.ok(button,'Missing '+selector);button.click();};
  return{w,dom,errors,attempts,navigation,sounds,$,click,close(){assert.deepEqual(errors,[]);dom.window.close();}};
}

test('the teacher entry replaces the old visual activity with the two-question discussion',async()=>{
  const f=fixture();try{
    await wait(140);
    const entry=f.$('[data-wtc-teacher]');assert.ok(entry);
    assert.equal(entry.querySelector('h2').textContent,'Choose. Explain. Prove it.');
    assert.match(entry.textContent,/Two picture questions/);
    assert.doesNotMatch(entry.textContent,/Four image-and-sound/);
    f.click('[data-wtc-teacher] button');
    assert.equal(f.$('.wtc').dir,'ltr');
    assert.equal(f.$('.wtc-head em').textContent,'1/ 2');
    assert.equal(f.$('#wtcQ').hidden,false);
    assert.deepEqual(Array.from(f.w.document.querySelectorAll('.wtc-choices button b')).map(el=>el.textContent),['I will get it.','I am going to get it.']);
    assert.doesNotMatch(f.$('#wtcQ').textContent,/_{2,}/);
    assert.match(f.$('.wtc-discuss').textContent,/Did she decide before or now\?/);
    assert.ok(f.$('.wtc-source-door img'));
    assert.equal(f.w.getComputedStyle(f.$('.wtc-source-door img')).height,'auto');
    assert.equal(f.w.getComputedStyle(f.$('.wtc-source-door')).overflow,'hidden');
    assert.equal(f.$('#wtcFb').hidden,true);
    assert.equal(f.attempts.length,0);
  }finally{f.close();}
});

test('class choices allow discussion without revealing correctness until the teacher asks',()=>{
  const f=fixture();try{
    f.w.STEPUP_FUTURE.openClass();
    f.click('[data-c="1"]');
    assert.equal(f.$('[data-c="1"]').getAttribute('aria-pressed'),'true');
    assert.equal(f.$('.correct'),null);assert.equal(f.$('#wtcFb').hidden,true);
    f.w.STEPUP_FUTURE.next();assert.equal(f.$('.wtc-head em').textContent,'1/ 2');
    f.click('[data-c="0"]');assert.equal(f.$('[data-c="1"]').getAttribute('aria-pressed'),'false');
    f.click('#wtcReveal');
    assert.equal(f.$('#wtcFb').hidden,false);
    assert.equal(f.$('.wtc-discuss').hidden,true);
    assert.equal(f.$('.wtc-choices button.correct b').textContent,'I will get it.');
    assert.match(f.$('#wtcFb').textContent,/Decision now → WILL/);
    assert.match(f.$('.wtc-proof').textContent,/Explain: She decides to answer the door now\./);
    assert.match(f.$('.wtc-proof').textContent,/Evidence: The doorbell rings/);
    assert.ok(Array.from(f.w.document.querySelectorAll('.wtc-choices button')).every(button=>button.disabled));
    assert.equal(f.$('#wtcNext').hidden,false);
    assert.equal(f.attempts.length,0);
  }finally{f.close();}
});

test('the second picture uses complete future sentences and the original planning question',()=>{
  const f=fixture();try{
    f.w.STEPUP_FUTURE.openClass();f.click('#wtcReveal');f.click('#wtcNext');
    assert.equal(f.$('.wtc-head em').textContent,'2/ 2');
    assert.deepEqual(Array.from(f.w.document.querySelectorAll('.wtc-choices button b')).map(el=>el.textContent),['She will train after school.','She is going to train after school.']);
    assert.match(f.$('.wtc-discuss').textContent,/Was this planned before\?/);
    assert.equal(f.$('.wtc-photo-caption').textContent,'After School • 4:00–6:00 • Gym');
    assert.ok(f.$('.wtc-source-gym img'));assert.equal(f.$('.wtc-sound'),null);
    assert.equal(f.w.getComputedStyle(f.$('.wtc-source-gym img')).height,'auto');
    assert.doesNotMatch(f.$('#wtcQ').textContent,/_{2,}/);
    f.click('[data-c="0"]');assert.equal(f.$('#wtcFb').hidden,true);
    f.click('#wtcReveal');
    assert.equal(f.$('.wtc-choices button.correct b').textContent,'She is going to train after school.');
    assert.match(f.$('#wtcFb').textContent,/Previous plan → GOING TO/);
    assert.match(f.$('.wtc-proof').textContent,/planner shows an after-school gym session/);
    f.click('#wtcNext');
    assert.ok(f.$('.wtc-finish'));
    assert.equal(f.w.document.querySelectorAll('.wtc-map>div').length,2);
    assert.match(f.$('.wtc-finish').textContent,/Two situations discussed/);
    assert.equal(f.attempts.length,0);
  }finally{f.close();}
});

test('replay and exit keep the two class questions and return to the teacher tab without saving',async()=>{
  const f=fixture();try{
    f.w.STEPUP_FUTURE.openClass();
    const plays=f.sounds.filter(x=>x==='start').length;
    f.click('.wtc-sound');assert.equal(f.sounds.filter(x=>x==='start').length,plays+2);
    f.click('#wtcReveal');f.click('#wtcNext');f.click('#wtcReveal');f.click('#wtcNext');
    f.click('.wtc-finish .light');
    assert.equal(f.$('.wtc-head em').textContent,'1/ 2');
    assert.equal(f.$('#wtcFb').hidden,true);
    assert.equal(f.$('.selected'),null);
    f.click('.wtc-toolbar button');
    await wait(140);
    assert.equal(f.navigation.at(-1),'classmode');assert.ok(f.$('[data-wtc-teacher]'));
    assert.equal(f.attempts.length,0);
  }finally{f.close();}
});

test('students keep the original four scenes, answer identifiers, score, and navigation',async()=>{
  const f=fixture();try{
    f.w.STEPUP_FUTURE.openClass();f.click('#wtcReveal');f.click('#wtcNext');
    f.w.STEPUP_JOURNEY.openUnit('u3');await wait(10);
    assert.equal(f.$('[data-wtc] h2').textContent,'Watch • Think • Choose');
    f.click('[data-wtc] button');
    const expected=[{stem:'It ______ rain.',correct:1},{stem:'I ______ answer it.',correct:0},{stem:'We ______ travel this weekend.',correct:1},{stem:'Our class ______ do well.',correct:0}];
    for(let index=0;index<expected.length;index++){
      assert.equal(f.$('.wtc-head em').textContent,(index+1)+'/ 4');
      assert.equal(f.$('.wtc-q h2').textContent,expected[index].stem);
      assert.equal(f.$('.wtc-source-photo'),null);
      assert.ok(f.$('#studentHeader'));
      if(index===0){f.w.STEPUP_FUTURE.choose(0);assert.match(f.$('#wtcFb').textContent,/Try again/);assert.equal(f.$('#wtcNext').hidden,true);}
      f.w.STEPUP_FUTURE.choose(expected[index].correct);f.click('#wtcNext');
    }
    await wait(0);
    assert.match(f.$('.wtc-finish').textContent,/First-try score: 3\/4/);
    assert.equal(f.w.document.querySelectorAll('.wtc-map>div').length,4);
    assert.equal(f.attempts.length,1);
    const attempt=f.attempts[0];
    assert.equal(attempt.trainingId,'u3-watch-think-choose');assert.equal(attempt.total,4);assert.equal(attempt.score,3);
    assert.deepEqual(Array.from(attempt.answers,answer=>answer.question_id),['WTC-rain','WTC-phone','WTC-travel','WTC-opinion']);
    f.click('.wtc-finish .dark');assert.equal(f.navigation.at(-1),'u3');
  }finally{f.close();}
});

test('the class activity still works when the device cannot play sound',()=>{
  const f=fixture();try{
    delete f.w.AudioContext;
    f.w.STEPUP_FUTURE.openClass();
    assert.equal(f.$('#wtcQ').hidden,false);
    f.click('.wtc-sound');f.click('#wtcReveal');f.click('#wtcNext');
    assert.equal(f.$('.wtc-head em').textContent,'2/ 2');
    f.click('#wtcReveal');f.click('#wtcNext');assert.ok(f.$('.wtc-finish'));
    assert.equal(f.attempts.length,0);
  }finally{f.close();}
});
