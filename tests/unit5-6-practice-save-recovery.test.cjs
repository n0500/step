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
  // Exercise an entire 28-question review without loading production data.
  const bank=Array.from({length:28},(_,i)=>({
    section:i<14?'vocab':'grammar',sectionTitle:i<14?'Vocabulary':'Grammar',
    id:'q'+(i+1),prompt:'Choose the correct answer for question '+(i+1),
    choices:['Option A','Option B'],answer:i%2
  }));
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
      for(let i=0;i<first.bank.length;i++){
        assert.match(first.view().textContent,new RegExp('Question '+(i+1)+' of 28'));
        api.select(i%2);api.confirm();api.next();
      }
      await until(()=>/Result not saved/.test(first.view().textContent));
      assert.equal(first.saved.length,0);
      const snapshot=first.w.localStorage.getItem(first.key);
      assert.ok(snapshot,'Completed answers must remain on this device');
      const completed=JSON.parse(snapshot);
      assert.equal(Object.keys(completed.answers).length,28);
      assert.equal(completed.answers['vocab|q1'].correct,true);
      assert.equal(completed.answers['grammar|q28'].correct,true);

      // Simulate a fresh page load using the same on-device review record.
      second=fixture(unit,snapshot);
      second.view().innerHTML='<div class="journey-unit-hero"><h1>Unit '+unit.slice(1)+'</h1></div>';
      await until(()=>/Retry Saving/.test(second.view().textContent));
      const retry=second.w.STEPUP_U56_PRACTICE;
      retry.begin(unit);
      await until(()=>/Result saved successfully/.test(second.view().textContent));
      assert.equal(second.saved.length,1,'Exactly one complete retake is submitted');
      assert.equal(second.saved[0].reviewRunId,completed.runId,'The original run is retained');
      assert.equal(second.saved[0].score,28);
      assert.equal(second.saved[0].total,28);
      assert.deepEqual(second.saved[0].answers.map(a=>a.question_id),first.bank.map(q=>q.id));
      assert.equal(second.w.localStorage.getItem(second.key),null,'Clear only after a confirmed save');

      retry.begin(unit);
      assert.match(second.view().textContent,/Question 1 of 28/,'A fresh retake starts only after save');
    }finally{
      first.dom.window.close();
      second?.dom.window.close();
    }
  });
}
