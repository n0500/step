const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const smartScript=fs.readFileSync(path.join(__dirname,'..','student-smart-review.js'),'utf8');
const fixScript=fs.readFileSync(path.join(__dirname,'..','fix-my-mistakes.js'),'utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const bank=[
 {section:'grammar',id:'a',skill:'Present Perfect Progressive',prompt:'They ___ for hours.',choices:['are waiting','have been waiting','wait','waited'],answer:1,explanation:'Since and for show duration continuing until now.'},
 {section:'reading',id:'b',skill:'Reading • Detail',prompt:'Where is the concert?',choices:['At school','At the park'],answer:0,explanation:'The original passage explicitly states that the concert is at school.'}
];
function fixture(){
 const dom=new JSDOM('<main><section class="student-view"></section></main>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let student='student-one',calls=[];
 w.firebase={auth:()=>({get currentUser(){return {uid:student};}})};
 w.STEPUP_MASTERY={studentStatus:()=>({earned:true})};
 w.STEPUP_ANSWER_RESPONSE={submit(){}};
 w.STEPUP_U1_REVIEW={getMasteryBank:()=>bank,start(){},open(){},getProgress:()=>({answered:2,total:2,correct:2})};
 w.STEPUP_JOURNEY={progressHTML:()=>''};
 w.PROVE={async recordJourneyAttempt(a){calls.push(structuredClone(a));return a;}};
 w.eval(smartScript);w.eval(fixScript);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const smart=w.STEPUP_SMART,fix=w.STEPUP_FIX;
 async function full(correct=[false,true]){
   smart.beginFull('u1');
   for(let i=0;i<bank.length;i++){
     let q=bank[i],isCorrect=correct[i];
     smart.onSaved({recordKind:'question',examUnit:'u1',examSection:q.section,questionId:q.id,
       correct:isCorrect,selectedText:isCorrect?q.choices[q.answer]:q.choices[0],correctText:q.choices[q.answer]});
   }
   await smart.advance('u1');await sleep(10);
   return smart.latestResult('u1');
 }
 function click(action){let b=w.document.querySelector('[data-fix-action="'+action+'"]');assert.ok(b,'Missing action: '+action);b.click();return b;}
 function text(){return w.document.querySelector('.student-view').textContent;}
 return {w,dom,smart,fix,calls,full,click,text,student:id=>{student=id;},dispose:()=>dom.window.close()};
}
test('Full review exposes a clear Fix My Mistakes entry and bilingual question-specific explanation',async()=>{
 const f=fixture();try{
   const a=await f.full();
   assert.equal(a.score,1);
   assert.equal(f.calls.length,1);
   assert.match(f.text(),/Fix My Mistakes/);
   f.fix.start('u1');
   assert.match(f.text(),/Understand Your Mistake/);
   assert.match(f.text(),/They ___ for hours/);
   assert.match(f.text(),/Your answer/);
   assert.match(f.text(),/Correct answer/);
   assert.match(f.text(),/Since and for show duration/);
   assert.match(f.text(),/نستخدم/);
   assert.equal(f.w.document.querySelector('.fix-recovery [lang="ar"]').getAttribute('dir'),'rtl');
   assert.equal(f.fix.getActive().phase,'explain');
   assert.equal(f.calls.length,1,'Explanations never create grading or certificate records');
 }finally{f.dispose();}
});
test('Check uses a fresh concept-aligned question, confirms only on tap, and moves to next mistake',async()=>{
 const f=fixture();try{
   const original=await f.full();
   f.fix.start('u1');f.click('begin-check');
   assert.equal(f.fix.getActive().phase,'check');
   assert.equal(f.w.document.querySelector('.fix-confirm').disabled,true);
   assert.match(f.text(),/Check My Understanding/);
   const check=f.w.document.querySelector('.fix-check h3').textContent;
   assert.notEqual(check,bank[0].prompt);
   assert.match(check,/three hours/);
   const selected=f.w.document.querySelector('.fix-options button[data-index="0"]');
   selected.click();
   assert.equal(f.w.document.querySelector('.fix-confirm').disabled,false);
   assert.equal(f.fix.getActive().phase,'check','selection must not save or grade');
   f.click('confirm');assert.equal(f.fix.getActive().phase,'feedback');
   assert.match(f.text(),/Great/);
   f.click('next');assert.equal(f.fix.getActive().phase,'done');
   assert.match(f.text(),/Well done/);
   assert.equal(f.smart.latestResult('u1').percentage,original.percentage);
   assert.equal(f.calls.length,1,'Recovery must never write a graded attempt');
 }finally{f.dispose();}
});
test('Wrong Check permits exactly one different retry and can finish without retaking an entire skill',async()=>{
 const f=fixture();try{
   await f.full();f.fix.start('u1');f.click('begin-check');
   const first=f.w.document.querySelector('.fix-check h3').textContent;
   f.w.document.querySelector('[data-fix-action="choose"][data-index="2"]').click();f.click('confirm');
   assert.match(f.text(),/Keep learning/);
   f.click('retry');
   const second=f.w.document.querySelector('.fix-check h3').textContent;
   assert.notEqual(second,first);
   f.w.document.querySelector('[data-fix-action="choose"][data-index="0"]').click();f.click('confirm');
   assert.equal(f.w.document.querySelector('[data-fix-action="retry"]'),null);
   f.click('next');
   assert.match(f.text(),/Well done/);
   assert.match(f.text(),/original score has not changed/);
   assert.equal(f.calls.length,1);
 }finally{f.dispose();}
});
test('Recovery progress is saved separately by account and exact full-review run',async()=>{
 const f=fixture();try{
   await f.full([false,false]);f.fix.start('u1');f.click('begin-check');
   f.w.document.querySelector('[data-fix-action="choose"][data-index="0"]').click();f.click('confirm');f.click('next');
   assert.equal(f.fix.getActive().pos,1);
   f.fix.exit();f.fix.start('u1');
   assert.equal(f.fix.getActive().pos,1,'Resume the latest recovery at the next mistake');
   f.student('student-two');f.fix.start('u1');
   assert.equal(f.fix.getActive().uid,'student-one'); // prior session is inert, not rendered for another account
   f.click('begin-check');assert.equal(f.fix.getActive(),null,'Invalid active session is discarded');
 }finally{f.dispose();}
});
test('Perfect review hides recovery; full review is the only source of recovery mistakes',async()=>{
 const f=fixture();try{
   await f.full([true,true]);
   assert.doesNotMatch(f.text(),/Fix My Mistakes/);
   f.fix.start('u1');
   assert.equal(f.fix.getActive(),null);
   assert.equal(f.calls[0].recordKind,'smart-full-review');
 }finally{f.dispose();}
});
test('Skill mapping supports U1, U2, U3 including grammar, reading and listening',()=>{
 const f=fixture();try{
 const pairs=[
  [{unit:'u1',skill:'Stative verbs'},'stative'],
  [{unit:'u1',skill:'Past Progressive + when'},'interrupted'],
  [{unit:'u1',skill:'Reading main idea'},'main'],
  [{unit:'u1',skill:'Listening for sequence'},'audioSequence'],
  [{unit:'u2',skill:'Present Perfect Progressive'},'perfProg'],
  [{unit:'u2',skill:'Prepositions of Time'},'prep'],
  [{unit:'u2',skill:'Adjective + Preposition + Gerund'},'gerund'],
  [{unit:'u2',skill:'Listening • Main Idea'},'audioMain'],
  [{unit:'u3',skill:'Will vs Be Going To'},'goingPlan'],
  [{unit:'u3',skill:'Future Progressive'},'futureProg'],
  [{unit:'u3',skill:'Tag Questions'},'tag'],
  [{unit:'u3',skill:'Reading Strategy • Reference'},'reference']
 ];
 for(const [q,expected] of pairs){assert.equal(f.fix.topic(q),expected,q.skill);assert.equal(f.fix.checks[expected].length,2);}
 assert.doesNotMatch(fixScript,/fetch\s*\(|AI Tutor|openai/i,'Error explanations must not invoke AI');
 }finally{f.dispose();}
});