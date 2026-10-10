const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..'),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture(options={}){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM('<div id="app"><header id="studentHeader">StepUp</header><main class="student-app-shell"><nav class="student-nav" data-role="student"><button onclick="PROVE.setStudentTab(\'journey\')">My Journey</button></nav><section class="student-view"></section></main></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc
  });
  const w=dom.window,profile={id:options.studentId||'lesson-qa',uid:options.studentId||'lesson-qa',role:'student',displayName:'QA Student',classId:'qa-class',teacherId:'qa-teacher'};
  const writes=[],summaries=[],spoken=[],authEvents=[],teacherTabs=[];let canceled=0,pendingSave=null;
  const auth={currentUser:{uid:profile.id},onAuthStateChanged(fn){authEvents.push(fn);return()=>{};}};
  w.firebase={apps:[{}],auth:()=>auth,firestore:()=>({collection(name){assert.equal(name,'attempts');return{
    async add(record){if(pendingSave){const blocked=pendingSave;pendingSave=null;await blocked;}writes.push(JSON.parse(JSON.stringify(record)));return{id:'qa-'+writes.length};},
    doc(){assert.fail('Learning must not query or overwrite student records');},update(){assert.fail('Historical records must not be overwritten');},delete(){assert.fail('Historical records must not be deleted');}
  };}})};
  w.PROVE={setStudentTab(){w.document.querySelector('.student-view').innerHTML='<div>Student journey</div>';},setTeacherTab(tab){teacherTabs.push(tab);w.document.getElementById('app').innerHTML='<main class="container"><section class="teacher-classmode-v2"></section></main>';},async recordJourneyAttempt(record){summaries.push(record);return record;}};
  w.SpeechSynthesisUtterance=function(text){this.text=text;};
  w.speechSynthesis={cancel(){canceled++;},getVoices:()=>[{name:'English',lang:'en-US'}],speak(speech){spoken.push(speech);speech.onstart?.();}};
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.requestIdleCallback=()=>0;
  w.document.addEventListener('click',event=>{const button=event.target.closest('button[onclick]');if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));});
  const load=file=>w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js','unit1-cleanup.js','unit1-review-all.js',
    'unit3-content.js','unit3-review-all.js','unit2-source-override.js','unit2-exam-review.js','unit3-classmode-reading.js','mg1-kb.js'].forEach(load);
  const review=w.STEPUP_U3_REVIEW,lesson=w.STEPUP_U3_TEACH_READING,bank=review.getMasteryBank(),unit=w.STEPUP_JOURNEY.data.units.find(u=>u.id==='u3');
  const records=typeof options.records==='function'?options.records(bank,profile):options.records||[];
  const original=JSON.stringify(records),requirements=JSON.stringify(review.getCertificateRequirements());
  if(options.storage)Object.entries(options.storage).forEach(([key,value])=>w.localStorage.setItem(key,value));
  const hydrate=(values=records,open=options.openUnits||['u1','u2','u3'],student=profile)=>w.STEPUP_JOURNEY.html(values,open,student);
  hydrate();review.open();
  function toParagraph(){lesson.next();lesson.next();assert.ok(w.document.querySelector('.u3tr-passage'));}
  function checkedNext(choice=0){lesson.choose(choice);lesson.check();lesson.next();}
  function toAfterReading(){toParagraph();for(let i=0;i<8;i++)checkedNext(0);assert.ok(w.document.querySelector('.u3tr-after'));}
  return{dom,w,auth,authEvents,profile,review,lesson,bank,unit,records,writes,summaries,spoken,errors,load,hydrate,toParagraph,toAfterReading,checkedNext,teacherTabs,
    storage(){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>w.localStorage.key(i)).map(key=>[key,w.localStorage.getItem(key)]));},
    unchanged(){assert.equal(JSON.stringify(records),original);assert.equal(JSON.stringify(review.getCertificateRequirements()),requirements);assert.equal(writes.length,0);assert.equal(summaries.length,0);assert.deepEqual(errors,[]);},
    blockSave(){let resolve;pendingSave=new Promise(done=>{resolve=done;});return resolve;},get canceled(){return canceled;}};
}

test('all student reading entry points open the shared lesson and keep student navigation',()=>{
  const f=fixture();try{
    const header=f.w.document.getElementById('studentHeader'),nav=f.w.document.querySelector('.student-nav');
    for(const open of [()=>f.w.STEPUP_JOURNEY.startReading('u3'),()=>f.w.STEPUP_JOURNEY.go('u3','reading'),()=>f.review.start('reading'),()=>f.review.readingLesson()]){
      open();assert.ok(f.w.document.querySelector('.u3tr-student-shell'));assert.match(f.w.document.querySelector('.u3tr-hero').textContent,/Think:/);
      assert.equal(f.w.document.querySelector('.u3tr-shell').dir,'ltr');assert.equal(f.w.document.getElementById('studentHeader'),header);assert.equal(f.w.document.querySelector('.student-nav'),nav);
      f.lesson.exit();assert.ok(f.w.document.querySelector('.u3-reading-lesson-entry'));
    }
    f.w.document.querySelector('[onclick="STEPUP_U3_REVIEW.readingLesson()"]').click();assert.ok(f.w.document.querySelector('.u3tr-student-shell'));f.unchanged();
  }finally{f.dom.window.close();}
});

test('all five complete paragraphs have replayable audio, questions and feedback before Next',()=>{
  const f=fixture();try{
    f.review.readingLesson();f.toParagraph();const paragraphs=f.unit.reading.split(/\n\s*\n/).map(p=>p.trim());assert.equal(paragraphs.length,5);
    for(let i=0;i<5;i++){
      assert.equal(f.w.document.querySelector('.u3tr-passage p').textContent,paragraphs[i]);
      const next=f.w.document.querySelector('[onclick="STEPUP_U3_TEACH_READING.next()"]');assert.equal(next.disabled,true);f.lesson.next();assert.equal(f.w.document.querySelector('.u3tr-passage p').textContent,paragraphs[i]);
      const before=f.spoken.length;f.lesson.readParagraph(i);f.lesson.readParagraph(i);assert.equal(f.spoken.length,before+2);assert.equal(f.spoken.at(-1).text,paragraphs[i]);assert.equal(f.spoken.at(-1).lang,'en-US');
      f.lesson.stop();f.lesson.choose(42);f.lesson.check();assert.equal(f.w.document.querySelector('.u3tr-feedback'),null);
      f.lesson.choose(i%2?0:1);
      assert.equal(f.w.document.querySelector('[onclick="STEPUP_U3_TEACH_READING.next()"]')?.disabled,true);
      f.lesson.check();assert.match(f.w.document.querySelector('.u3tr-feedback').textContent,i%2?/Correct/:/Correct answer: A/);
      assert.equal(f.w.document.querySelector('.u3tr-passage p').textContent,paragraphs[i]);assert.equal(f.w.document.querySelector('[onclick="STEPUP_U3_TEACH_READING.next()"]')?.disabled,false);f.lesson.next();
    }
    assert.equal(f.w.document.querySelector('.u3tr-head h1').textContent,'Main Idea');f.unchanged();
  }finally{f.dom.window.close();}
});

test('the student and class lesson share vocabulary, paragraph questions, strategies and textbook tasks',()=>{
  const student=fixture(),teacher=fixture();try{
    student.review.readingLesson();teacher.w.document.getElementById('app').innerHTML='<section class="teacher-classmode-v2"></section>';teacher.lesson.start();
    for(let stop=0;stop<12;stop++){
      const sw=student.w.document,tw=teacher.w.document;
      const copy=doc=>Array.from(doc.querySelectorAll('.u3tr-vocab-grid article,.u3tr-passage,.u3tr-q h2,.u3tr-choices button,.u3tr-strategy-card,.u3tr-book,.u3tr-after summary,.u3tr-after details p')).map(el=>el.textContent);
      assert.deepEqual(copy(sw),copy(tw));
      if(sw.querySelector('.u3tr-q')){student.lesson.choose(0);student.lesson.check();teacher.lesson.choose(0);teacher.lesson.check();assert.equal(sw.querySelector('.u3tr-feedback').textContent,tw.querySelector('.u3tr-feedback').textContent);}
      if(stop<11){student.lesson.next();teacher.lesson.next();}
    }
    assert.match(student.w.document.querySelector('.u3tr-finish').textContent,/previous answers are kept/);student.unchanged();teacher.unchanged();
  }finally{student.dom.window.close();teacher.dom.window.close();}
});

test('After Reading keeps the original task numbers and page and leads to the existing practice',()=>{
  const f=fixture();try{
    f.review.readingLesson();f.toAfterReading();assert.match(f.w.document.querySelector('.u3tr-book').textContent,/Exercise B.*p\. 41/);
    const details=f.w.document.querySelectorAll('.u3tr-after details');assert.deepEqual(Array.from(details).map(el=>el.querySelector('summary b').textContent),['1.','2.','4.','5.']);
    assert.equal(Array.from(details).every(el=>!el.open),true);details[0].open=true;details[0].dispatchEvent(new f.w.Event('toggle'));
    f.lesson.next();f.lesson.finish();assert.ok(f.w.document.querySelector('.u3-reading-passage'));assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,'1/7');
    assert.equal(f.w.document.querySelector('.u3tr-student-shell'),null);f.unchanged();
  }finally{f.dom.window.close();}
});

test('saved lesson position and checked answers survive reopening and reload and are scoped to the student',()=>{
  const f=fixture();let reload,other;try{
    f.review.readingLesson();f.toParagraph();f.lesson.choose(1);f.lesson.check();const feedback=f.w.document.querySelector('.u3tr-feedback').textContent;
    f.lesson.exit();f.review.readingLesson();assert.equal(f.w.document.querySelector('.u3tr-feedback').textContent,feedback);
    const storage=f.storage();reload=fixture({storage});reload.review.readingLesson();assert.equal(reload.w.document.querySelector('.u3tr-head h1').textContent,'Paragraph 1');assert.equal(reload.w.document.querySelector('.u3tr-feedback').textContent,feedback);assert.equal(reload.spoken.length,0);
    other=fixture({storage,studentId:'another-student'});other.review.readingLesson();assert.ok(other.w.document.querySelector('.u3tr-hero'));assert.equal(other.w.document.querySelector('.u3tr-feedback'),null);
    assert.equal(other.w.localStorage.getItem('stepup:u3-reading-lesson:v1:lesson-qa'),storage['stepup:u3-reading-lesson:v1:lesson-qa']);f.unchanged();reload.unchanged();other.unchanged();
  }finally{f.dom.window.close();reload?.dom.window.close();other?.dom.window.close();}
});

test('After Reading answers remain open when a student resumes that stop',()=>{
  const f=fixture();let reload;try{
    f.review.readingLesson();f.toAfterReading();const detail=f.w.document.querySelector('[data-u3tr-after="1"]');detail.open=true;detail.dispatchEvent(new f.w.Event('toggle'));
    reload=fixture({storage:f.storage()});reload.review.readingLesson();assert.equal(reload.w.document.querySelector('[data-u3tr-after="1"]').open,true);assert.equal(reload.w.document.querySelector('[data-u3tr-after="0"]').open,false);f.unchanged();reload.unchanged();
  }finally{f.dom.window.close();reload?.dom.window.close();}
});

test('unavailable or malformed local storage cannot block the lesson or fabricate checked answers',()=>{
  const f=fixture();try{
    f.w.localStorage.setItem('stepup:u3-reading-lesson:v1:lesson-qa',JSON.stringify({version:1,step:999,selected:{'2':999},checked:{'2':true}}));f.review.readingLesson();assert.ok(f.w.document.querySelector('.u3tr-hero'));f.toParagraph();assert.equal(f.w.document.querySelector('.u3tr-feedback'),null);assert.equal(f.w.document.querySelector('[onclick="STEPUP_U3_TEACH_READING.next()"]')?.disabled,true);
    f.lesson.exit();f.w.Storage.prototype.getItem=()=>{throw new Error('Storage disabled');};f.w.Storage.prototype.setItem=()=>{throw new Error('Storage disabled');};
    f.review.readingLesson();assert.match(f.w.document.querySelector('.u3tr-save-note').textContent,/Keep this page open/);f.toParagraph();f.lesson.choose(0);f.lesson.check();assert.ok(f.w.document.querySelector('.u3tr-feedback'));f.unchanged();
  }finally{f.dom.window.close();}
});

test('audio errors and stale speech callbacks leave the paragraph readable and navigation stops speech',async()=>{
  const f=fixture();try{
    f.review.readingLesson();f.toParagraph();f.lesson.readParagraph(0);const old=f.spoken.at(-1);f.lesson.readParagraph(0);old.onend();assert.match(f.w.document.querySelector('#u3trAudioStatus').textContent,/Playing/);
    f.spoken.at(-1).onerror();assert.match(f.w.document.querySelector('#u3trAudioStatus').textContent,/try again/);f.lesson.stop();old.onstart();assert.match(f.w.document.querySelector('#u3trAudioStatus').textContent,/Stopped/);
    const synthesis=f.w.speechSynthesis;delete f.w.speechSynthesis;f.lesson.readParagraph(0);assert.match(f.w.document.querySelector('#u3trAudioStatus').textContent,/not available/);assert.ok(f.w.document.querySelector('.u3tr-passage'));
    f.w.speechSynthesis=synthesis;f.lesson.readParagraph(0);const count=f.canceled;f.w.document.querySelector('.student-nav button').click();await wait(30);assert.ok(f.canceled>count);old.onend();assert.equal(f.w.document.querySelector('.u3tr-shell'),null);f.unchanged();
  }finally{f.dom.window.close();}
});

test('closed units and changed sign-in identities cannot enter or continue another student lesson',()=>{
  const closed=fixture({openUnits:['u1','u2']}),f=fixture();try{
    closed.review.readingLesson();closed.lesson.startStudent();assert.equal(closed.w.document.querySelector('.u3tr-student-shell'),null);closed.unchanged();
    f.review.readingLesson();f.toParagraph();f.lesson.readParagraph(0);const canceled=f.canceled,storage=f.storage();f.auth.currentUser=null;f.authEvents.forEach(fn=>fn(null));
    assert.ok(f.canceled>canceled);f.lesson.choose(0);f.lesson.check();f.lesson.next();assert.deepEqual(f.storage(),storage);assert.equal(f.w.document.querySelector('.u3tr-feedback'),null);f.unchanged();
  }finally{closed.dom.window.close();f.dom.window.close();}
});

test('the decorated lesson preserves all historical answers and earned certificates and practice can resume',async()=>{
  const f=fixture({records:(bank,p)=>bank.map((q,i)=>({id:'old-'+i,recordKind:'question',examUnit:'u3',examSection:q.section,questionId:q.id,correct:true,bestCorrect:true,studentId:p.id,classId:p.classId,teacherId:p.teacherId,submittedAt:'2026-09-01T00:00:00Z'}))});try{
    ['journey-focus.js','stability-fixes.js','stepup-athari.js','stepup-celebrate.js','stepup-mastery.js','unit3-future-challenge.js'].forEach(f.load);f.hydrate();f.review.open();await wait(350);
    assert.ok(f.w.document.querySelector('.u3-reading-lesson-entry'));assert.equal(f.w.STEPUP_MASTERY.studentStatus('u3').earned,true);
    const progress=JSON.stringify(f.review.getProgress());f.w.document.querySelector('[onclick="STEPUP_U3_REVIEW.readingLesson()"]').click();f.toAfterReading();f.lesson.next();f.lesson.finish();
    assert.equal(JSON.stringify(f.review.getProgress()),progress);assert.equal(f.w.STEPUP_MASTERY.studentStatus('u3').earned,true);assert.equal(f.w.document.querySelector('.journey-question-meta b').textContent,'1/7');f.unchanged();
    f.review.answer((f.bank.find(q=>q.section==='reading').answer+1)%4);await wait(50);assert.equal(f.writes.length,1);assert.equal(f.writes[0].bestCorrect,true);assert.equal(f.w.document.querySelector('.journey-feedback h2').textContent,'Not quite');assert.equal(f.w.STEPUP_MASTERY.studentStatus('u3').earned,true);
  }finally{f.dom.window.close();}
});

test('an answer already saving cannot replace a newly opened reading lesson',async()=>{
  const f=fixture();try{
    f.review.practiceReading();const release=f.blockSave();f.review.answer(0);await wait(10);f.review.readingLesson();release();await wait(50);
    assert.ok(f.w.document.querySelector('.u3tr-student-shell'));assert.equal(f.w.document.querySelector('.journey-feedback'),null);assert.equal(f.writes.length,1);assert.equal(f.review.sectionProgress('reading').answered,1);assert.equal(f.summaries.length,0);assert.deepEqual(f.errors,[]);
  }finally{f.dom.window.close();}
});

test('teacher Class Mode keeps its own navigation, free discussion and paragraph audio',()=>{
  const f=fixture();try{
    f.w.document.getElementById('app').innerHTML='<section class="teacher-classmode-v2"></section>';f.lesson.start();assert.equal(f.w.document.querySelector('.u3tr-student-shell'),null);assert.match(f.w.document.querySelector('.u3tr-hero').textContent,/Ask the class/);
    f.lesson.next();f.lesson.next();f.lesson.readParagraph(0);assert.equal(f.spoken.at(-1).text,f.unit.reading.split(/\n\s*\n/)[0]);
    assert.equal(f.w.document.querySelector('[onclick="STEPUP_U3_TEACH_READING.next()"]')?.disabled,false);f.lesson.next();assert.equal(f.w.document.querySelector('.u3tr-head h1').textContent,'Paragraph 2');
    f.lesson.choose(0);f.lesson.check();assert.match(f.w.document.querySelector('.u3tr-feedback').textContent,/Correct/);f.lesson.exit();assert.deepEqual(f.teacherTabs,['classmode']);assert.equal(f.w.localStorage.length,0);f.unchanged();
  }finally{f.dom.window.close();}
});
