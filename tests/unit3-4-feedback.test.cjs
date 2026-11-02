const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
test('Units 3 and 4 stop on feedback with the chosen answer and the original explanation',async()=>{
 const dom=new JSDOM('<div id="app"><div class="student-view"></div></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',virtualConsole:new VirtualConsole()});
 const w=dom.window,saved=[];
 w.firebase={auth:()=>({currentUser:{uid:'qa'}}),firestore:()=>({collection:()=>({add:async x=>{saved.push(x);return{id:'qa'};}})})};
 w.PROVE={recordJourneyAttempt:async p=>({...p,studentId:'qa'})};
 try{
 for(const f of ['journey-engine.js','answer-response-guard.js','unit3-content.js','unit3-review-all.js','unit4-content.js','stepup-mastery.js','unit5-6-practice-again.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
 const j=w.STEPUP_JOURNEY,h=w.document.querySelector('.student-view');
 j.html([],['u3','u4'],{id:'qa',role:'student'});
 function verify(q,choice){assert.match(h.textContent,/Your answer:/);assert.ok(h.textContent.includes(choice),JSON.stringify({choice,text:h.textContent}));assert.ok(h.querySelector('.answer-explanation').textContent.includes(q.explanation));assert.equal(h.querySelector('.journey-question-card'),null);}
 for(const correct of [false,true]){
  j.startCore('u4',1);
  const prompt=h.querySelector('h2').textContent,q=j.data.questions.find(q=>q.unit_id==='MG1_U4'&&q.prompt===prompt);
  const answer=['option_a_id','option_b_id','option_c_id','option_d_id'].findIndex(k=>q[k]===q.correct_option_id);
  const selected=correct?answer:(answer+1)%4,choice=q[['option_a_text','option_b_text','option_c_text','option_d_text'][selected]];
  j.answer(selected);verify(q,choice);assert.match(h.textContent,correct?/Correct!/:/Correct answer:/);
  const feedback=h.innerHTML;j.answer(selected);assert.equal(h.innerHTML,feedback);
  j.feedbackNext();assert.ok(h.querySelector('.journey-question-card'));
 }
 const api=w.STEPUP_U3_REVIEW;
 for(const key of new Set(api.getMasteryBank().map(q=>q.section))){
  api.start(key,true);const prompt=h.querySelector('h2').textContent;
  const q=api.getMasteryBank().find(q=>q.section===key&&q.prompt===prompt);const selected=(q.answer+1)%q.choices.length;
  api.answer(selected);await new Promise(resolve=>setTimeout(resolve,15));
  verify(q,q.choices[selected]);assert.match(h.textContent,/Correct answer:/);
 }
 const p=w.STEPUP_U56_PRACTICE;p.begin('u4');const q=p.bank('u4')[0],original=j.data.questions.find(x=>x.question_id===q.id);
 p.select((q.answer+1)%4);p.confirm();verify(original,q.choices[(q.answer+1)%4]);
 const stored=JSON.parse(w.localStorage.getItem('stepup-u56-full-review-v1-qa-u4'));
 assert.equal(Object.values(stored.answers)[0].explanation,original.explanation);
 }finally{dom.window.close();}
});
