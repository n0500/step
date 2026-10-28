const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');

const source=fs.readFileSync(path.join(__dirname,'..','unit5-6-practice-again.js'),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){
  for(let i=0;i<100;i++){if(check())return;await wait(10);}
  assert.fail('Expected review state was not reached');
}
function fixture(unit,restored){
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',
    pretendToBeVisual:true,virtualConsole:new VirtualConsole()
  });
  const w=dom.window,id='qa-review-student',saved=[],control={fail:false};
  const bank=[
    {section:'vocab',sectionTitle:'Vocabulary',id:'q1',prompt:'Choose the first answer',
      choices:['Correct','Wrong'],answer:0},
    {section:'grammar',sectionTitle:'Grammar',id:'q2',prompt:'Choose the second answer',
      choices:['Wrong','Correct'],answer:1}
  ];
  w.firebase={auth:()=>({currentUser:{uid:id}})};
  w.STEPUP_JOURNEY={
    data:{units:[{id:unit,number:Number(unit.slice(1)),title:'Unit '+unit.slice(1)}]},
    openUnit(){}
  };
  w.STEPUP_MASTERY={
    validBank:u=>u===unit,bank:()=>bank,
    studentStatus:()=>({earned:false}),
    fullReviewResult:(_,record)=>({qualifies:record.score===bank.length})
  };
  w.PROVE={async recordJourneyAttempt(record){
    if(control.fail)throw new Error('offline');
    const persisted={...record,studentId:id};
    saved.push(persisted);
    return persisted;
  }};
  const key='stepup-u56-full-review-v1-'+id+'-'+unit;
  if(restored)w.localStorage.setItem(key,restored);
  w.eval(source);
  return {dom,w,bank,saved,control,key,view:()=>w.document.querySelector('.student-view')};
}

for(const unit of ['u5','u6']){
  test(unit+': an interrupted final save survives a reload and never erases answers',async()=>{
    const first=fixture(unit);
    let second;
    try{
      const api=first.w.STEPUP_U56_PRACTICE;
      first.control.fail=true;
      api.begin(unit);
      assert.match(first.view().textContent,/Question 1 of 2/);
      api.select(0);api.confirm();api.next();
      assert.match(first.view().textContent,/Question 2 of 2/);
      api.select(1);api.confirm();api.next();
      await until(()=>/Result not saved/.test(first.view().textContent));
      assert.equal(first.saved.length,0);
      const snapshot=first.w.localStorage.getItem(first.key);
      assert.ok(snapshot,'Completed answers must remain on this device');
      const completed=JSON.parse(snapshot);
      assert.equal(Object.keys(completed.answers).length,2);
      assert.equal(completed.answers['vocab|q1'].correct,true);
      assert.equal(completed.answers['grammar|q2'].correct,true);

      // Simulate a fresh page load using the same on-device review record.
      second=fixture(unit,snapshot);
      second.view().innerHTML='<div class="journey-unit-hero"><h1>Unit '+unit.slice(1)+'</h1></div>';
      await until(()=>/Retry Saving/.test(second.view().textContent));
      const retry=second.w.STEPUP_U56_PRACTICE;
      retry.begin(unit);
      await until(()=>/Result saved successfully/.test(second.view().textContent));
      assert.equal(second.saved.length,1,'Exactly one complete retake is submitted');
      assert.equal(second.saved[0].reviewRunId,completed.runId,'The original run is retained');
      assert.equal(second.saved[0].score,2);
      assert.equal(second.saved[0].total,2);
      assert.deepEqual(second.saved[0].answers.map(a=>a.question_id),['q1','q2']);
      assert.equal(second.w.localStorage.getItem(second.key),null,'Clear only after a confirmed save');

      retry.begin(unit);
      assert.match(second.view().textContent,/Question 1 of 2/,'A fresh retake starts only after save');
    }finally{
      first.dom.window.close();
      second?.dom.window.close();
    }
  });
}
