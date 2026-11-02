const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
test('Unit 4 optional review resumes, presents media, scores and saves all 28 answers',async()=>{
 const dom=new JSDOM('<div id="app"><div class="student-view"></div></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only'});
 const w=dom.window,saved=[],student={id:'qa',role:'student'};
 w.firebase={auth:()=>({currentUser:{uid:'qa'}})};
 w.PROVE={recordJourneyAttempt:async p=>{const r={...p,studentId:'qa'};saved.push(r);return r;}};
 try{
 for(const f of ['journey-engine.js','unit4-content.js','stepup-mastery.js','unit5-6-practice-again.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
 w.STEPUP_MASTERY.hydrate([],student);
 const j=w.STEPUP_JOURNEY,p=w.STEPUP_U56_PRACTICE,h=w.document.querySelector('.student-view');
 j.html([],['u4'],student);j.openUnit('u4');
 assert.match(h.textContent,/Review & Practice/);
 assert.equal(w.STEPUP_MASTERY.studentStatus('u4').earned,false);
 const bank=p.bank('u4');assert.equal(bank.length,28);
 assert.ok(bank.every(q=>!['step','final'].includes(q.section)));
 p.begin('u4');p.confirm();assert.match(h.textContent,/Question 1 of 28/);
 for(let i=0;i<bank.length;i++){
  const q=bank[i];
  assert.match(h.textContent,new RegExp('Question '+(i+1)+' of 28'));
  assert.equal(h.querySelector('[data-confirm]').disabled,true);
  if(q.context_excerpt)assert.ok(h.querySelector('.u4-vocab-evidence'));
  if(q.section==='reading')assert.match(h.textContent,/World|cash|credit/i);
  if(q.section==='listening')assert.ok(h.querySelector('audio').src.endsWith('/unit-04/conversation.mp3'));
  p.select(i===0?(q.answer+1)%4:q.answer);p.confirm();
  if(i===0){assert.match(h.textContent,/Correct answer/);p.exit('u4');assert.match(h.textContent,/Resume Review/);p.begin('u4');}
  else if(i===bank.length-1)await p.finish('u4');
  else p.next();
 }
 assert.equal(saved.length,1);assert.equal(saved[0].total,28);assert.equal(saved[0].score,27);
 assert.match(h.textContent,/Result saved successfully/);assert.equal(p.pending('u4'),false);
 p.begin('u4');assert.match(h.textContent,/Question 1 of 28/);
 }finally{dom.window.close();}
});
