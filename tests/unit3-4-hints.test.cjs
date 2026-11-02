const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
test('Unit 3 and 4 questions provide native hints before any answer',()=>{
 const dom=new JSDOM('<div id="app"><div class="student-view"></div></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',virtualConsole:new VirtualConsole()});
 const w=dom.window;
 w.firebase={auth:()=>({currentUser:{uid:'qa'}})};
 w.PROVE={recordJourneyAttempt:async p=>({...p,studentId:'qa'})};
 try{
 for(const f of ['journey-engine.js','unit3-content.js','unit3-review-all.js','unit4-content.js','stepup-mastery.js','student-smart-review.js','unit5-6-practice-again.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
 const j=w.STEPUP_JOURNEY,h=w.document.querySelector('.student-view');
 j.html([],['u3','u4'],{id:'qa',role:'student'});
 function check(){const hint=h.querySelector('details.question-hint');assert.ok(hint);assert.equal(hint.open,false);assert.equal(hint.querySelector('summary').textContent,'Hint');assert.ok(hint.querySelector('p').textContent.trim());assert.equal(h.querySelectorAll('.question-hint').length,1);}
 for(const key of new Set(w.STEPUP_U3_REVIEW.getMasteryBank().map(q=>q.section))){w.STEPUP_U3_REVIEW.start(key,true);check();}
 w.STEPUP_U3_REVIEW.startStep();check();
 for(let i=0;i<4;i++){j.startCore('u4',i);check();}
 w.STEPUP_U56_PRACTICE.begin('u4');check();assert.equal(h.querySelector('[data-confirm]').disabled,true);
 }finally{dom.window.close();}
});
