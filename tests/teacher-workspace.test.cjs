const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..'),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<100;i++){if(check())return;await wait(10);}assert.fail('Expected teacher UI did not appear');}

async function fixture(options={}){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<div id="app"></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window,teacher={id:'qa-teacher',role:'teacher',status:'active',displayName:'معلمة الاختبار',school:'مدرسة الاختبار'};
  const classes=options.empty?[]:[{id:'qa-a',name:'أول ثانوي 1',code:'QA-A',teacherId:teacher.id,openUnits:options.closedU1?['u2']:['u1','u2']},{id:'qa-b',name:'أول ثانوي 2',code:'QA-B',teacherId:teacher.id,openUnits:['u2']}];
  const students=options.empty?[]:[{id:'qa-amal',displayName:'أمل المطيري',pin:'1234',classId:'qa-a'},
    {id:'qa-noura',displayName:'نورة <img src=x onerror=alert(1)>',classId:'qa-a'},
    {id:'qa-sara',displayName:'سارة العتيبي',pin:'5678',classId:'qa-a'},
    {id:'qa-dana',displayName:'دانا الاختبار',pin:'9012',classId:'qa-b'}].map(s=>({...s,role:'student',teacherId:teacher.id,classCode:s.classId==='qa-a'?'QA-A':'QA-B'}));
  const attempts=[],reads=[],observers=[];
  const auth={currentUser:{uid:teacher.id},onAuthStateChanged(fn){observers.push(fn);return()=>{};}};
  function snapshot(records){return{docs:records.map(record=>({id:record.id,data:()=>({...record})}))};}
  const tables={users:[teacher,...students],classes,attempts,archivedClasses:options.archived?[{id:'qa-archived',teacherId:teacher.id,name:'الفصل السابق',code:'QA-OLD'}]:[]};
  function collection(name,filters=[]){return{
    where(field,op,value){assert.equal(op,'==');return collection(name,[...filters,[field,value]]);},
    async get(){reads.push(name);return snapshot((tables[name]||[]).filter(record=>filters.every(([field,value])=>record[field]===value)));},
    doc(id){return{async get(){reads.push(name+'|'+id);const record=(tables[name]||[]).find(record=>record.id===id);return{exists:!!record,id,data:()=>({...record})};},
      set(){assert.fail('Reorganizing the dashboard must not write data');},update(){assert.fail('Saved data must not be overwritten');},delete(){assert.fail('Saved data must not be deleted');}};},
    add(){assert.fail('Browsing the workspace must not add records');}
  };}
  w.PROVEIT_CONFIG={firebase:{enabled:true,projectId:'qa-teacher-workspace'},ownerEmail:'owner@example.test'};
  w.firebase={apps:[{}],auth:()=>auth,firestore:()=>({collection}),initializeApp(){assert.fail('No secondary accounts are needed');}};
  w.requestIdleCallback=()=>0;
  w.document.addEventListener('click',event=>{const button=event.target.closest('button[onclick]');if(button&&!button.disabled)w.eval(button.getAttribute('onclick'));});
  const load=file=>w.eval(fs.readFileSync(path.join(root,file),'utf8').replace(/^import .*;\r?\n/gm,''));
  ['data.js','unit2-grammar.js','unit2-classmode-reading.js','journey-engine.js','answer-response-guard.js','unit1-cleanup.js','unit1-review-all.js',
    'unit3-content.js','unit3-review-all.js','unit2-source-override.js','unit2-exam-review.js','teacher-workspace.js','stepup-mastery.js','teacher-certificates.js','teacher-motivation.js'].forEach(load);
  const req=w.STEPUP_U1_REVIEW.getCertificateRequirements(),read=req.filter(q=>q.section==='reading');
  function record(student,unit,q,correct){return{id:'qa-'+attempts.length,recordKind:'question',examUnit:unit,examSection:q.section,questionId:q.questionId,studentId:student.id,studentName:student.displayName,classId:student.classId,teacherId:teacher.id,unitNumber:Number(unit.slice(1)),trainingTitle:'قراءة',correct,bestCorrect:correct,total:1,percentage:correct?100:0,submittedAt:'2026-10-10T01:00:00.000Z'};}
  if(students.length){
    attempts.push(record(students[0],'u1',read[0],true),record(students[0],'u1',read[1],false));
    const q=w.STEPUP_U2_EXAM.getCertificateRequirements().find(q=>q.section==='reading');
    attempts.push(record(students[0],'u2',q,true),record(students[3],'u2',q,true));
    req.forEach(q=>attempts.push(record(students[1],'u1',q,true)));
    if(options.assessment){
      const answers=w.STEPUP_U1_REVIEW.getMasteryBank().map(q=>({section:q.section,question_id:q.id,correct:true}));
      attempts.push({id:'qa-assessment',studentId:students[2].id,studentName:students[2].displayName,classId:students[2].classId,teacherId:teacher.id,unitNumber:1,trainingId:'journey-u1-mastery-check',trainingTitle:'تقييم الإتقان',answers,score:answers.length,total:answers.length,percentage:100,submittedAt:'2026-10-10T01:05:00.000Z'});
    }
  }
  const original=JSON.stringify({students,attempts,classes});
  load('app.js');load('teacher-nav.js');
  await observers.at(-1)(auth.currentUser);await until(()=>w.document.querySelector('.tw-routes')||w.document.querySelector('.tw-empty'));
  const input=(id,value)=>{const el=w.document.getElementById(id);assert.ok(el);el.value=value;el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};
  const visible=()=>Array.from(w.document.querySelectorAll('[data-tw-row]')).filter(row=>!row.hidden).map(row=>row.dataset.twRow);
  return{dom,w,teacher,students,attempts,classes,reads,errors,original,load,input,visible,req,async tab(id){await w.PROVE.setTeacherTab(id);},unchanged(){assert.equal(JSON.stringify({students,attempts,classes}),original);assert.deepEqual(errors,[]);}};
}

test('the home page has direct Arabic destinations and counts for the selected class',async()=>{
  const f=await fixture();try{
    assert.equal(f.w.document.querySelector('main').dir,'rtl');
    const nav=f.w.document.querySelector('.teacher-nav-main');assert.ok(nav.querySelector('[data-tab="pins"]'));assert.match(nav.textContent,/حسابات الدخول/);assert.match(nav.textContent,/الطالبات والنتائج/);
    assert.deepEqual(Array.from(f.w.document.querySelectorAll('.tw-metric strong')).map(el=>el.textContent),['3','2','1','1']);
    assert.equal(f.w.document.querySelectorAll('.tw-route').length,4);
    f.w.document.querySelector('[data-tw-filter="idle"]').click();await until(()=>f.w.document.querySelector('.tw-results'));
    assert.deepEqual(f.visible(),['qa-sara']);f.unchanged();
  }finally{f.dom.window.close();}
});

test('student names are searchable with Arabic letter variants without remote reads',async()=>{
  const f=await fixture();try{
    await f.tab('reports');const count=f.reads.length;f.input('twStudentSearch','امل');assert.deepEqual(f.visible(),['qa-amal']);
    f.input('twStudentSearch','غائبة');assert.deepEqual(f.visible(),[]);assert.equal(f.w.document.getElementById('twNoResults').hidden,false);
    f.input('twStudentSearch','');assert.equal(f.visible().length,3);assert.equal(f.reads.length,count);
    assert.equal(f.w.document.querySelector('.tw-results img'),null);f.unchanged();
  }finally{f.dom.window.close();}
});

test('saved answers without a section summary appear with separate coverage and accuracy',async()=>{
  const f=await fixture();try{
    await f.tab('reports');f.input('twUnitFilter','u1');
    const row=f.w.document.querySelector('[data-tw-row="qa-amal"]');
    assert.equal(row.querySelector('[data-tw-cell="progress"]').textContent,'2 / '+f.req.length);
    assert.equal(row.querySelector('[data-tw-cell="accuracy"]').textContent,'50%');
    assert.equal(f.w.document.querySelector('[data-tw-row="qa-sara"] [data-tw-cell="accuracy"]').textContent,'—');
    f.w.document.querySelector('[data-tw-status="review"]').click();assert.deepEqual(f.visible(),['qa-amal']);
    assert.equal(f.w.document.querySelector('.tw-details').open,false);assert.ok(f.w.document.querySelector('[onclick="PROVE.exportClassPDF()"]'));assert.ok(f.w.document.querySelector('[onclick="PROVE.exportClassExcel()"]'));f.unchanged();
  }finally{f.dom.window.close();}
});

test('class switching keeps filters and rosters scoped to the chosen class',async()=>{
  const f=await fixture();try{
    await f.tab('reports');await f.w.PROVE.selectClass('qa-b');assert.deepEqual(f.visible(),['qa-dana']);
    assert.equal(f.w.document.getElementById('teacherClassSelect').value,'qa-b');
    assert.equal(f.w.document.querySelector('[data-tw-row="qa-amal"]'),null);
    await f.tab('home');assert.deepEqual(Array.from(f.w.document.querySelectorAll('.tw-metric strong')).map(el=>el.textContent),['1','1','0','0']);f.unchanged();
  }finally{f.dom.window.close();}
});

test('certificate filters match the established certificate policy and preserve existing records',async()=>{
  const f=await fixture();try{
    await f.tab('reports');f.w.document.querySelector('[data-tw-status="earned"]').click();assert.deepEqual(f.visible(),['qa-noura']);
    const results=Array.from(f.w.document.querySelectorAll('[data-tw-row="qa-noura"] [data-tw-cell="certificates"]'));assert.equal(results[0].textContent,'1');
    await f.tab('certificates');assert.match(f.w.document.querySelector('.sct-wrap').textContent,/نورة/);assert.equal(f.w.document.querySelector('.sct-wrap .teacher-report-toolbar').dir,'rtl');f.unchanged();
  }finally{f.dom.window.close();}
});

test('PIN recovery remains directly reachable and class unit settings remain available',async()=>{
  const f=await fixture();try{
    await f.tab('pins');assert.match(f.w.document.querySelector('h1').textContent,/حسابات الدخول/);
    assert.equal(f.w.document.querySelector('[data-student-id="qa-amal"]').disabled,false);assert.equal(f.w.document.querySelector('[data-student-id="qa-noura"]').disabled,true);
    assert.equal(f.w.document.querySelector('[data-group="students"].active'),null);
    await f.tab('classes');assert.equal(f.w.document.querySelectorAll('.teacher-class-card').length,2);assert.equal(f.w.document.querySelectorAll('.teacher-unit-access[open]').length,1);
    assert.ok(f.w.document.querySelector('[onclick*="toggleUnit"]'));assert.match(f.w.document.querySelector('.teacher-class-list').textContent,/متاحة للطالبات/);f.unchanged();
  }finally{f.dom.window.close();}
});

test('tool modules keep their handlers while moving into the labeled tools menu',async()=>{
  const f=await fixture();try{
    const nav=f.w.document.querySelector('.teacher-nav'),button=f.w.document.createElement('button');
    button.id='mg1AssistantTab';button.className='role-tab';button.textContent='MG1 Assistant';let clicked=0;button.addEventListener('click',()=>clicked++);nav.appendChild(button);
    f.w.STEPUP_TEACHER_NAV.organize();assert.equal(button.parentElement.dataset.group,'tools');assert.equal(button.textContent,'المساعد الذكي');
    f.w.document.querySelector('[data-group="tools"].teacher-group-btn').click();assert.equal(button.parentElement.hidden,false);assert.equal(f.w.document.querySelector('[data-group="tools"].teacher-group-btn').getAttribute('aria-expanded'),'true');
    button.click();assert.equal(clicked,1);button.classList.add('active');f.w.STEPUP_TEACHER_NAV.organize();assert.equal(f.w.document.querySelectorAll('.teacher-nav-main .active').length,1);f.unchanged();
  }finally{f.dom.window.close();}
});

test('home search opens a student profile and share actions retain their actual arguments',async()=>{
  const f=await fixture();try{
    const opened=[],links=[],codes=[];f.w.PROVE.openStudent=id=>opened.push(id);f.w.PROVE.copyStudentLink=code=>links.push(code);f.w.PROVE.showClassQR=(code,name)=>codes.push([code,name]);
    f.input('twHomeSearch','امل');const student=f.w.document.querySelector('[data-tw-home-name]:not([hidden])');student.click();assert.deepEqual(opened,['qa-amal']);
    f.w.document.querySelector('[data-tw-copy]').click();f.w.document.querySelector('[data-tw-qr]').click();assert.deepEqual(links,['QA-A']);assert.deepEqual(codes,[['QA-A','أول ثانوي 1']]);f.unchanged();
  }finally{f.dom.window.close();}
});

test('the empty teacher workspace gives a clear create-class action',async()=>{
  const f=await fixture({empty:true});try{assert.match(f.w.document.querySelector('.tw-empty').textContent,/إنشاء فصل/);assert.ok(f.w.document.querySelector('[onclick="PROVE.createClass()"]'));await f.tab('reports');assert.match(f.w.document.querySelector('main').textContent,/أنشئي فصلا/);f.unchanged();}finally{f.dom.window.close();}
});

test('the actual student profile includes incomplete unit answers and returns to the chosen class',async()=>{
  const f=await fixture();try{
    await f.w.PROVE.openStudent('qa-amal');
    assert.equal(f.w.document.querySelector('main').dir,'rtl');
    const rows=f.w.document.querySelectorAll('.tw-student-summary tbody tr');
    assert.equal(rows.length,6);assert.match(rows[0].textContent,/الوحدة 1/);
    assert.equal(rows[0].children[1].textContent,'2 / '+f.req.length);assert.equal(rows[0].children[2].textContent,'50%');
    assert.equal(rows[1].children[2].textContent,'100%');assert.equal(rows[2].children[2].textContent,'—');
    assert.equal(f.w.document.querySelector('.tw-details').open,false);
    assert.ok(f.w.document.querySelector('[onclick*="downloadStudentPDF"]'));
    f.w.document.querySelector('[data-tw-tab="reports"]').click();await until(()=>f.w.document.querySelector('.tw-results'));
    assert.deepEqual(f.visible().sort(),['qa-amal','qa-noura','qa-sara']);
    assert.equal(f.w.document.getElementById('teacherClassSelect').value,'qa-a');f.unchanged();
  }finally{f.dom.window.close();}
});

test('export uses the currently displayed student and unit filters with the saved-answer accuracy',async()=>{
  const f=await fixture();try{
    const blobs=[],downloads=[];f.w.Blob=Blob;
    f.w.URL.createObjectURL=blob=>{blobs.push(blob);return 'blob:qa-export';};f.w.URL.revokeObjectURL=()=>{};
    f.w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
    await f.tab('reports');f.input('twUnitFilter','u1');f.input('twStudentSearch','امل');const reads=f.reads.length;
    f.w.document.querySelector('[data-tw-export]').click();assert.deepEqual(downloads,['StepUp-Results-QA-A.csv']);
    const csv=await blobs[0].text();const lines=csv.trim().split('\r\n');assert.equal(lines.length,2);
    assert.match(lines[0],/الدقة التراكمية/);assert.match(lines[1],/أمل المطيري/);assert.match(lines[1],/"الوحدة 1","بدأت","2","\d+","50","0"/);
    assert.equal(f.reads.length,reads);f.unchanged();
  }finally{f.dom.window.close();}
});

test('tab and class navigation reuse loaded data while refresh retrieves a fresh snapshot',async()=>{
  const f=await fixture();try{
    const count=f.reads.length;
    for(const tab of ['reports','pins','certificates','home'])await f.tab(tab);
    await f.w.PROVE.selectClass('qa-b');await f.tab('reports');assert.equal(f.reads.length,count);
    await f.w.PROVE.refreshTeacher();assert.deepEqual(f.reads.slice(count).sort(),['attempts','classes','users']);f.unchanged();
  }finally{f.dom.window.close();}
});

test('a certificate from a subsequently closed unit remains visible without inflating the selected unit',async()=>{
  const f=await fixture({closedU1:true});try{
    assert.equal(f.w.document.querySelectorAll('.tw-metric strong')[3].textContent,'1');
    await f.tab('reports');f.w.document.querySelector('[data-tw-status="earned"]').click();assert.deepEqual(f.visible(),['qa-noura']);
    f.input('twUnitFilter','u2');assert.deepEqual(f.visible(),[]);
    await f.tab('certificates');assert.match(f.w.document.querySelector('.sct-wrap').textContent,/نورة/);f.unchanged();
  }finally{f.dom.window.close();}
});

test('mastery assessment answers appear in the roster and profile with their earned certificate',async()=>{
  const f=await fixture({assessment:true});try{
    await f.tab('reports');f.input('twUnitFilter','u1');
    const row=f.w.document.querySelector('[data-tw-row="qa-sara"]');
    assert.equal(row.querySelector('[data-tw-cell="progress"]').textContent,f.req.length+' / '+f.req.length);
    assert.equal(row.querySelector('[data-tw-cell="accuracy"]').textContent,'100%');assert.equal(row.querySelector('[data-tw-cell="certificates"]').textContent,'1');
    await f.w.PROVE.openStudent('qa-sara');assert.equal(f.w.document.querySelector('.tw-student-summary tbody tr').children[3].textContent,'مستحقة');f.unchanged();
  }finally{f.dom.window.close();}
});

test('the real tool and class modules remain connected to Arabic navigation',async()=>{
  const f=await fixture({archived:true});try{
    ['mg1-kb.js','mg1-assistant.js','advanced-features.js','class-manager.js','nav-cleanup.js','stepup-athari.js'].forEach(f.load);
    await until(()=>f.w.document.querySelector('#stepupTeachingHubTab')&&f.w.document.querySelector('#mg1DictionaryTab'));
    f.w.STEPUP_TEACHER_NAV.organize();
    assert.equal(f.w.document.querySelector('#mg1AssistantTab').textContent,'المساعد الذكي');
    f.w.document.querySelector('[data-group="tools"].teacher-group-btn').click();
    f.w.document.querySelector('#mg1DictionaryTab').click();await until(()=>f.w.document.querySelector('#mg1DictInput'));
    await f.tab('classes');await until(()=>f.w.document.querySelector('[data-manage-class="qa-a"]')&&f.w.document.querySelector('#stepupArchivedClasses'));
    assert.equal(f.w.document.querySelectorAll('[data-manage-class]').length,2);
    assert.equal(f.w.document.querySelector('[data-manage-class="qa-a"]').textContent,'إدارة الفصل');
    assert.match(f.w.document.querySelector('#stepupArchivedClasses').textContent,/الفصل السابق/);
    await f.tab('home');assert.equal(f.w.document.querySelector('#stepupArchivedClasses'),null);f.unchanged();
  }finally{f.dom.window.close();}
});
