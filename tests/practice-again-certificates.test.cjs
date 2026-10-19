const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');

function fixture(){
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()
  });
  const w=dom.window,student={id:'qa-student',role:'student',displayName:'Test Student',classId:'qa-class'};
  const control={uid:student.id,fail:false},saved=[];
  w.firebase={auth:()=>({currentUser:{uid:control.uid}})};
  w.PROVE={async recordJourneyAttempt(payload){
    if(control.fail)throw new Error('offline');
    const record={...payload,studentId:control.uid,classId:student.classId,submittedAt:'2026-10-18T20:00:00.000Z'};
    saved.push(record);return record;
  }};
  for(const file of ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js',
    'unit1-cleanup.js','unit1-review-all.js','unit3-content.js','unit3-review-all.js','unit2-source-override.js',
    'unit2-exam-review.js','stepup-mastery.js','teacher-certificates.js','student-smart-review.js'])
    w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  w.STEPUP_MASTERY.hydrate([],student);
  function review(unit,correct){
    const questions=w.STEPUP_MASTERY.bank(unit),n=questions.length;
    const answers=questions.map((q,i)=>({section:q.section,question_id:q.id,correct:typeof correct==='function'?correct(q,i):i<correct}));
    const score=answers.filter(q=>q.correct).length;
    return {recordKind:'smart-full-review',trainingId:'smart-full-review-'+unit,unitId:unit,
      studyMethod:'full-original-bank',reviewRunId:'qa-review',answers,score,total:n,percentage:Math.round(score*100/n),
      studentId:student.id,classId:student.classId,submittedAt:'2026-10-18T18:00:00.000Z'};
  }
  return {w,dom,student,control,saved,review,mastery:w.STEPUP_MASTERY};
}

for(const unit of ['u1','u2','u3'])test(unit+' saved Practice Again at the 80% boundary unlocks the same certificate for student and teacher',()=>{
  const f=fixture();try{
    const n=f.mastery.requirements(unit).length,a=f.review(unit,Math.ceil(n*.8)),before=JSON.stringify(a);
    const status=f.mastery.status(unit,[a]);
    assert.equal(status.earned,true);assert.equal(status.mode,'practice-again');
    assert.equal(status.progress.answered,n);assert.equal(status.fullReview.qualifies,true);
    const source={unitId:unit,questions:f.mastery.requirements(unit),unit:{number:Number(unit.slice(1)),title:'Unit'}};
    const rows=f.w.STEPUP_CERT_REPORT.buildRows([f.student],[a],f.student.classId,[source]);
    assert.equal(rows.length,1);assert.equal(rows[0].units[0].fullReview.score,a.score);
    assert.equal(JSON.stringify(a),before,'certificate calculation must not rewrite historical answers');
  }finally{f.dom.window.close();}
});

test('incomplete, mismatched, duplicated and corrupted reviews cannot grant a certificate',()=>{
  const f=fixture();try{
    const original=f.review('u2',30);
    const changes=[a=>a.answers.pop(),a=>a.answers[1]=a.answers[0],a=>a.answers[0].question_id='foreign-question',
      a=>a.answers[0].section='other-skill',a=>a.unitId='u1',a=>a.trainingId='smart-full-review-u1',
      a=>a.recordKind='smart-extra-challenge',a=>a.studyMethod='optional-new-examples',
      a=>a.score--,a=>a.total--,a=>a.percentage=99,a=>a.answers[0].correct='true'];
    for(const change of changes){
      const a=JSON.parse(JSON.stringify(original));change(a);
      assert.equal(f.mastery.fullReviewResult('u2',a),null);
      assert.equal(f.mastery.status('u2',[a]).earned,false);
    }
    assert.equal(f.mastery.status('u1',[original]).earned,false,'reviews must stay in their original unit');
  }finally{f.dom.window.close();}
});

test('a rounded display of 80% cannot pass a real score below 80%',()=>{
  const f=fixture();try{
    f.w.STEPUP_U2_EXAM.getCertificateRequirements=()=>Array.from({length:201},(_,i)=>({section:'grammar',questionId:'q'+i,trainingId:'journey-u2-grammar'}));
    const answers=Array.from({length:201},(_,i)=>({section:'grammar',question_id:'q'+i,correct:i<160}));
    const a={...f.review('u2',0),answers,score:160,total:201,percentage:80};
    assert.equal(f.mastery.fullReviewResult('u2',a).qualifies,false);
    assert.equal(f.mastery.status('u2',[a]).earned,false);
  }finally{f.dom.window.close();}
});

test('correct answers from valid lower retakes accumulate and a later lower score keeps earned certificates',()=>{
  const f=fixture();try{
    const a=f.review('u2',(q,i)=>i<15),b=f.review('u2',(q,i)=>i>=15);
    assert.equal(f.mastery.status('u2',[a]).earned,false);
    const st=f.mastery.status('u2',[a,b]);
    assert.equal(st.earned,true);assert.equal(st.mode,'cumulative');assert.equal(st.progress.correct,30);
    const complete=f.review('u2',30),low=f.review('u2',0);
    assert.equal(f.mastery.status('u2',[complete,low]).fullReview.accuracy,100);
    const legacy=f.mastery.requirements('u2').map(q=>({recordKind:'question',examUnit:'u2',examSection:q.section,questionId:q.questionId,correct:true,submittedAt:'2026-10-08T00:00:00.000Z'}));
    assert.equal(f.mastery.status('u2',[...legacy,low]).mode,'legacy');
  }finally{f.dom.window.close();}
});

test('certificate becomes available immediately after a successful save, and never leaks across students',async()=>{
  const f=fixture();try{
    const review=f.review('u2',24);
    f.control.fail=true;
    await assert.rejects(f.w.PROVE.recordJourneyAttempt(review),/offline/);
    assert.equal(f.mastery.studentStatus('u2').earned,false);
    assert.doesNotMatch(f.w.STEPUP_SMART.reportHTML(review),/View Unit Certificate/);
    f.control.fail=false;
    await f.w.PROVE.recordJourneyAttempt(review);
    assert.equal(f.mastery.studentStatus('u2').earned,true);
    const report=f.w.STEPUP_SMART.reportHTML(review);
    assert.match(report,/Unit 2 Certificate Available/);assert.match(report,/View Unit Certificate/);
    assert.match(report,/completed Practice Again with at least 80% mastery/);
    f.mastery.hydrate([],{...f.student,id:'qa-other'});f.control.uid='qa-other';
    f.mastery.recordSaved(review);
    assert.equal(f.mastery.studentStatus('u2').earned,false);
  }finally{f.dom.window.close();}
});

test('teacher Practice Again list includes only mastered complete retakes from the selected class',()=>{
  const f=fixture();try{
    const other={...f.student,id:'qa-other',classId:'other-class'},a=f.review('u2',24);
    const old=f.mastery.requirements('u1').map(q=>({recordKind:'question',examUnit:'u1',examSection:q.section,questionId:q.questionId,correct:true,studentId:f.student.id}));
    f.w.PROVE.setTeacherTab=()=>{};f.w.STEPUP_CERT_REPORT.setReviewFilter(true);
    const html=f.w.STEPUP_CERT_REPORT.render({students:[f.student,other],attempts:[a,...old,{...a,studentId:other.id}],
      classes:[],cls:{id:f.student.classId,name:'QA Class'},classSelectHTML:''});
    const view=f.w.document.createElement('div');view.innerHTML=html;
    assert.match(view.querySelector('.sct-review-count').textContent,/1 students.*1 mastered unit reviews/);
    assert.equal(view.querySelectorAll('.sct-table tbody tr').length,1);
    assert.match(view.querySelector('.sct-table tbody').textContent,/Unit 2/);
    assert.doesNotMatch(view.querySelector('.sct-table tbody').textContent,/Unit 1/);
    f.w.STEPUP_CERT_REPORT.setReviewFilter(false);
    const all=f.w.STEPUP_CERT_REPORT.render({students:[f.student],attempts:[a,...old],classes:[],cls:{id:f.student.classId,name:'QA'},classSelectHTML:''});
    assert.match(all,/Unit 1/);assert.match(all,/Unit 2/);
  }finally{f.dom.window.close();}
});

test('previously saved Practice Again certificates appear when Progress is reopened on another device',()=>{
  const f=fixture();try{
    const a=f.review('u2',30);
    assert.equal(f.mastery.studentStatus('u2').earned,false);
    f.w.document.dispatchEvent(new f.w.Event('DOMContentLoaded'));
    const html=f.w.STEPUP_JOURNEY.progressHTML([a],['u2'],f.student);
    assert.match(html,/Unit 2 Certificate Available/);assert.match(html,/View Unit Certificate/);
    assert.equal(f.mastery.studentStatus('u2').earned,true);
  }finally{f.dom.window.close();}
});
