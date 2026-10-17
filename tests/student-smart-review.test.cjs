const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const script=fs.readFileSync(path.join(__dirname,'..','student-smart-review.js'),'utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const bank=[
  {section:'core-1',id:'q-1',skill:'Simple Present',prompt:'Which tense?',choices:['A','B'],answer:1,hint:'انتبهي إلى الزمن.',explanation:'Because the event is a habit.'},
  {section:'core-2',id:'q-2',skill:'Past Progressive',prompt:'What was happening?',choices:['A','B'],answer:0,explanation:'An ongoing past action.'}
];
function fixture(){
  const dom=new JSDOM('<main><section class="student-view"></section></main>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window,starts=[],answers=[],saved=[];
  let uid='student-a';
  w.firebase={auth:()=>({get currentUser(){return {uid};}})};
  w.STEPUP_MASTERY={studentStatus:()=>({earned:true})};
  w.STEPUP_ANSWER_RESPONSE={submit(){}};
  w.STEPUP_U1_REVIEW={
    getMasteryBank:()=>bank,start:(section,all)=>starts.push({section,all}),
    getProgress:()=>({nextSection:'core-1'}),open(){}
  };
  w.STEPUP_JOURNEY={progressHTML:()=>'<p>Original progress</p>'};
  w.PROVE={async recordJourneyAttempt(payload){saved.push(payload);return payload;}};
  w.document.addEventListener('click',e=>{
    const button=e.target.closest('button[onclick]');
    if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));
  });
  w.eval(script);
  // Trigger setup even when JSDOM's DOMContentLoaded happened earlier.
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return {w,dom,starts,answers,saved,student:id=>uid=id,smart:w.STEPUP_SMART,
    dispose(){dom.window.close();}};
}
function question(f){
  f.w.document.querySelector('.student-view').innerHTML=
    '<section class="journey-question-card"><h2>Which tense?</h2><div class="journey-options">'+
    '<button onclick="STEPUP_U1_REVIEW.answer(0)">A. A</button>'+
    '<button onclick="STEPUP_U1_REVIEW.answer(1)">B. B</button></div></section>';
}
test('answer selection stays reversible until Confirm Answer and hint does not save',async()=>{
  const f=fixture();
  try{
    f.w.STEPUP_U1_REVIEW.answer=i=>f.answers.push(i);
    question(f);await sleep(10);
    const buttons=f.w.document.querySelectorAll('.journey-options button');
    assert.ok(f.w.document.querySelector('.smart-confirm'));
    buttons[0].click();assert.deepEqual(f.answers,[]);
    buttons[1].click();assert.deepEqual(f.answers,[]);
    const hint=f.w.document.querySelector('.smart-hint-area [data-mode="ar"]');
    assert.ok(hint,'Unit 1 Arabic hint must appear');
    hint.click();assert.deepEqual(f.answers,[]);
    assert.match(f.w.document.querySelector('.smart-hint-text').textContent,/انتبهي/);
    f.w.document.querySelector('.smart-confirm').click();
    assert.deepEqual(f.answers,[1]);
  }finally{f.dispose();}
});
test('complete review uses every original bank question and saves actual latest attempt',async()=>{
  const f=fixture();
  try{
    f.smart.beginFull('u1');assert.deepEqual(f.starts,[{section:'core-1',all:true}]);
    f.smart.onSaved({recordKind:'question',examUnit:'u1',examSection:'core-1',questionId:'q-1',correct:true,selectedText:'B',correctText:'B'});
    f.smart.advance('u1');assert.deepEqual(f.starts[1],{section:'core-2',all:true});
    f.smart.onSaved({recordKind:'question',examUnit:'u1',examSection:'core-2',questionId:'q-2',correct:false,selectedText:'B',correctText:'A'});
    await f.smart.advance('u1');await sleep(0);
    assert.equal(f.saved[0].total,2);
    assert.equal(f.saved[0].score,1);
    assert.equal(f.saved[0].percentage,50);
    const output=f.w.document.querySelector('.student-view').textContent;
    assert.match(output,/Review My Mistakes/);
    assert.doesNotMatch(output,/Extra Challenge unlocked/);
    assert.equal(f.saved[0].answers.length,2);
  }finally{f.dispose();}
});
test('100 percent unlocks only optional challenge, without changing certificates',async()=>{
  const f=fixture();
  try{
    f.smart.beginFull('u1');
    for(const item of bank)f.smart.onSaved({recordKind:'question',examUnit:'u1',examSection:item.section,questionId:item.id,correct:true,selectedText:'A',correctText:'A'});
    await f.smart.advance('u1');await sleep(0);
    assert.match(f.w.document.querySelector('.student-view').textContent,/Extra Challenge unlocked/);
    assert.equal(f.saved[0].percentage,100);
    f.smart.startChallenge('u1');await sleep(0);
    assert.equal(f.w.document.querySelectorAll('.smart-challenge-options button').length,4);
    assert.equal(f.w.document.querySelector('.smart-confirm').disabled,true);
    f.smart.challengeSelect(1);assert.equal(f.w.document.querySelector('.smart-confirm').disabled,false);
    f.smart.challengeConfirm();
    assert.match(f.w.document.querySelector('.student-view').textContent,/Correct answer/);
  }finally{f.dispose();}
});
test('local incomplete runs remain scoped to student identity',async()=>{
  const f=fixture();
  try{
    f.smart.beginFull('u1');f.smart.onSaved({recordKind:'question',examUnit:'u1',examSection:'core-1',questionId:'q-1',correct:true});
    assert.equal(f.smart.resumePosition('u1','core-1',['q-1']),1);
    f.student('student-b');assert.equal(f.smart.resumePosition('u1','core-1',['q-1']),0);
    f.smart.beginFull('u1');
    assert.equal(f.smart.resumePosition('u1','core-1',['q-1']),0);
  }finally{f.dispose();}
});
