// StepUp • teacher workspace: navigation, saved activity, and searchable results.
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=value=>String(value||'').toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').trim();
  const practice=a=>a?.recordKind==='question'||(Array.isArray(a?.answers)&&a.answers.length>0)||(!a?.recordKind&&Number(a?.total)>0);
  let report=null;

  function sources(cls,all=false){
    const modules={u1:window.STEPUP_U1_REVIEW,u2:window.STEPUP_U2_EXAM,u3:window.STEPUP_U3_REVIEW};
    return (window.STEPUP_JOURNEY?.data?.units||window.PROVEIT_DATA?.units||[])
      .filter(u=>all||(cls?.openUnits||['u1']).includes(u.id))
      .map(unit=>{
        const requirements=modules[unit.id]?.getCertificateRequirements?.()||window.STEPUP_MASTERY?.requirements?.(unit.id);
        return {unit,questions:Array.isArray(requirements)&&requirements.length?requirements:null};
      });
  }
  function buildRows(students,attempts,cls){
    const bank=sources(cls),allBank=sources(cls,true).filter(source=>source.questions),byStudent=new Map();
    (attempts||[]).filter(a=>a.classId===cls?.id).forEach(a=>{
      if(!byStudent.has(a.studentId))byStudent.set(a.studentId,[]);
      byStudent.get(a.studentId).push(a);
    });
    return (students||[]).filter(s=>s.role==='student'&&s.classId===cls?.id).map(student=>{
      const saved=byStudent.get(student.id)||[],activity=saved.filter(practice);
      const units=bank.map(({unit,questions})=>{
        const certificate=window.STEPUP_MASTERY?.status?.(unit.id,saved);
        const evidence=questions&&(certificate?.progress?.total>0?certificate.progress:window.STEPUP_CERT_REPORT?.evaluateUnit?.(unit.id,saved,questions));
        return {id:unit.id,number:unit.number,title:unit.title,available:!!evidence,
          answered:evidence?.answered||0,total:evidence?.total||0,correct:evidence?.correct||0,
          earned:certificate?!!certificate.earned:null,
          started:activity.some(a=>a.examUnit===unit.id||a.unitId===unit.id||Number(a.unitNumber)===Number(unit.number)||String(a.trainingId||'').startsWith('journey-'+unit.id+'-'))};
      });
      const certificates=window.STEPUP_MASTERY?.status?allBank.filter(({unit})=>window.STEPUP_MASTERY.status(unit.id,saved)?.earned).length:null;
      return {id:student.id,name:student.displayName||'Student',started:activity.length>0,units,certificates,
        last:activity.map(a=>String(a.submittedAt||'')).sort().at(-1)||''};
    }).sort((a,b)=>a.name.localeCompare(b.name,'ar'));
  }
  function stats(row,unitId='all'){
    const units=unitId==='all'?row.units:row.units.filter(u=>u.id===unitId);
    const answered=units.reduce((n,u)=>n+u.answered,0),correct=units.reduce((n,u)=>n+u.correct,0);
    return {available:units.length>0&&units.every(u=>u.available),answered,correct,
      total:units.reduce((n,u)=>n+u.total,0),accuracy:answered?Math.round(correct/answered*100):null,
      certificates:unitId==='all'?row.certificates:units.every(u=>u.earned!==null)?units.filter(u=>u.earned).length:null,
      started:unitId==='all'?row.started:units.some(u=>u.started)};
  }
  function context({cls,classSelectHTML}){
    return `<div class="tw-context"><div class="tw-context-select">${classSelectHTML}</div>
      <div class="tw-context-code"><span>Class Code</span><b dir="ltr">${esc(cls.code)}</b></div>
      <div class="tw-context-actions"><button type="button" class="btn btn-secondary" data-tw-copy="${esc(cls.code)}">Copy Student Link</button>
      <button type="button" class="btn btn-secondary" data-tw-qr="${esc(cls.code)}" data-class-name="${esc(cls.name)}">Class QR Code</button></div></div>`;
  }
  function route(tab,title,description,number){
    return `<button type="button" class="tw-route" data-tw-tab="${tab}"><span class="tw-route-number" aria-hidden="true">${number}</span><strong>${title}</strong><small>${description}</small><span class="tw-route-arrow" aria-hidden="true">→</span></button>`;
  }
  function metric(label,value,detail,tab,filter){
    return `<button type="button" class="tw-metric" data-tw-tab="${tab}"${filter?` data-tw-filter="${filter}"`:''}><span>${label}</span><strong>${value??'—'}</strong><small>${detail}</small></button>`;
  }
  function dateLabel(value){
    const date=new Date(value);
    return value&&Number.isFinite(date.getTime())?date.toLocaleDateString('en-GB',{calendar:'gregory',day:'numeric',month:'short'}):'No saved activity';
  }
  function recentHTML(attempts){
    const recent=(attempts||[]).filter(practice).slice().sort((a,b)=>String(b.submittedAt||'').localeCompare(String(a.submittedAt||''))).slice(0,5);
    if(!recent.length)return '<div class="tw-empty">Recent activity will appear here after students save their answers.</div>';
    return `<div class="tw-activity">${recent.map(a=>{
      const percentage=Number(a.attemptPercentage??a.percentage??0);
      const label=a.recordKind==='question'?(a.correct===true?'Correct Answer':'Incorrect Answer'):
        Number.isFinite(Number(a.attemptPercentage))&&a.attemptPercentage!=null?`Attempt Score ${percentage}%`:`Saved Result ${percentage}%`;
      return `<button type="button" data-tw-student="${esc(a.studentId)}"><span><strong>${esc(a.studentName||'Student')}</strong><small>${esc(a.trainingTitle||a.skill||'Practice')} · ${esc(dateLabel(a.submittedAt))}</small></span><b class="tw-activity-label">${esc(label)}</b></button>`;
    }).join('')}</div>`;
  }
  function home(input){
    const {classes,cls,profile,students,attempts,classSelectHTML}=input;
    if(!cls)return `<section class="tw" dir="ltr"><div class="tw-heading"><span class="tw-eyebrow">STEP UP · Teacher Dashboard</span><h1>Welcome ${esc(profile.displayName||'')}</h1></div><div class="tw-card tw-empty"><h2>Create Your First Class</h2><p>Each class has its own student roster, access link, and results.</p><button type="button" class="btn btn-primary" onclick="PROVE.createClass()">Create Class</button></div></section>`;
    const rows=buildRows(students,attempts,cls),active=rows.filter(r=>r.started).length;
    const certificateCount=rows.every(r=>stats(r).certificates!==null)?rows.filter(r=>stats(r).certificates>0).length:null;
    const activity=attempts.filter(a=>a.classId===cls.id&&rows.some(r=>r.id===a.studentId));
    return `<section class="teacher-home-v2 tw" dir="ltr">
      <div class="tw-heading"><div><span class="tw-eyebrow">STEP UP · Teacher Dashboard</span><h1>Your Teaching Dashboard</h1><p>${esc(profile.displayName||'')}<span class="tw-separator">·</span>${esc(profile.school||'')}</p></div><div class="tw-heading-actions"><span class="tw-total">${classes.length} classes · ${students.length} students in total</span><button type="button" class="btn btn-secondary" data-tw-refresh>Refresh Data</button></div></div>
      ${context({cls,classSelectHTML})}
      <div class="tw-section-title"><h2>Quick Access</h2><span>Choose a section to get started</span></div>
      <div class="tw-routes">${route('reports','Students and Results','Review scores, completion, and student profiles','01')}${route('pins','Student Access','Student PINs and access recovery','02')}${route('certificates','Unit Certificates','Earned certificates and unit lists','03')}${route('classes','Classes and Units','Class links, QR codes, and unit access','04')}</div>
      <div class="tw-section-title"><h2>Class ${esc(cls.name)}</h2><span>The following figures apply to this class only</span></div>
      <div class="tw-metrics">${metric('Class Students',rows.length,'View the student roster','reports','all')}${metric('Started Practice',active,'Students with saved attempts','reports','active')}${metric('Not Started Yet',rows.length-active,'Students without saved activity','reports','idle')}${metric('Certificate Holders',certificateCount,'Certificates earned under the current policy','certificates')}</div>
      <div class="tw-main-grid"><section class="tw-card"><div class="tw-card-head"><h2>Find a Student Profile</h2><button type="button" class="tw-link" data-tw-tab="reports">View All →</button></div>
        <label class="tw-label" for="twHomeSearch">Search for a student in this class</label><input id="twHomeSearch" class="tw-search" type="search" placeholder="Student Name" autocomplete="off">
        <div class="tw-student-shortlist">${rows.map((row,i)=>`<button type="button" data-tw-home-name="${esc(normalize(row.name))}" data-tw-student="${esc(row.id)}"${i>=5?' hidden':''}><span>${esc(row.name)}</span><small>Open Profile →</small></button>`).join('')}</div>
        <p id="twHomeEmpty" class="tw-empty"${rows.length?' hidden':''}>${rows.length?'No student with this name was found in the selected class.':'There are no students in this class yet.'}</p><small class="tw-note">Search all students in this class. Select a name to open the profile.</small>
      </section><section class="tw-card"><div class="tw-card-head"><h2>Recent Saved Activity</h2><button type="button" class="tw-link" data-tw-tab="reports">All Results →</button></div>${recentHTML(activity)}</section></div>
      <div class="tw-footer-help"><span>Find classroom presentation tools in <b>Class Mode</b> and the assistant and dictionary in <b>Teaching Tools</b>.</span><button type="button" class="tw-link" data-tw-tab="classmode">Open Class Mode →</button></div>
    </section>`;
  }
  function rowHTML(row){
    return `<tr data-tw-row="${esc(row.id)}" data-tw-name="${esc(normalize(row.name))}"><td><button type="button" class="teacher-student-link" data-tw-student="${esc(row.id)}">${esc(row.name)}</button></td><td data-tw-cell="state"></td><td data-tw-cell="progress" dir="ltr"></td><td data-tw-cell="accuracy" dir="ltr"></td><td data-tw-cell="certificates"></td><td><button type="button" class="btn btn-secondary" data-tw-student="${esc(row.id)}">Student Profile</button></td></tr>`;
  }
  function reports(input){
    const {cls,students,attempts,classSelectHTML,legacyHTML}=input;
    const rows=buildRows(students,attempts,cls);
    report={rows,cls,unitId:'all',filter:pendingFilter||'all'};pendingFilter=null;
    return `<section class="teacher-reports-v2 tw" dir="ltr"><div class="tw-heading"><div><span class="tw-eyebrow">Progress and Results</span><h1>Students and Results</h1><p>Search for a student or select a unit, then open the profile for details.</p></div><div class="tw-heading-actions"><button type="button" class="btn btn-secondary" data-tw-refresh>Refresh Data</button><button type="button" class="btn btn-primary" data-tw-export>Export List</button></div></div>
      ${context({cls,classSelectHTML})}
      ${window.STEPUP_FLIPPED_U4?.reportPanel(cls)||""}
      <section class="tw-card tw-results"><div class="tw-report-filters"><div><label class="tw-label" for="twStudentSearch">Student Name</label><input id="twStudentSearch" class="tw-search" type="search" placeholder="Search by student name" autocomplete="off"></div><div><label class="tw-label" for="twUnitFilter">Review Results</label><select id="twUnitFilter" class="tw-search"><option value="all">All Open Units</option>${sources(cls).map(({unit})=>`<option value="${esc(unit.id)}">Unit ${unit.number} · ${esc(unit.title)}</option>`).join('')}</select></div></div>
      <div class="tw-filter-chips" role="group" aria-label="Filter students">${[['all','All Students'],['idle','Not Started'],['active','Started Practice'],['review','Accuracy Below 80%'],['earned','Certificate Holders']].map(([key,label])=>`<button type="button" data-tw-status="${key}" aria-pressed="${report.filter===key}">${label}</button>`).join('')}</div>
      <div class="tw-table-meta"><h2>Roster ${esc(cls.name)}</h2><span id="twVisibleCount" role="status" aria-live="polite"></span></div>
      <div class="table-wrap"><table class="tw-results-table"><thead><tr><th>Student</th><th>Practice Status</th><th>Review Questions</th><th>Cumulative Accuracy</th><th>Earned Certificates</th><th>Details</th></tr></thead><tbody>${rows.map(rowHTML).join('')}<tr id="twNoResults" hidden><td colspan="6">No students match this search or filter in this class.</td></tr></tbody></table></div>
      <p class="tw-note">Question counts and accuracy cover the selected open units. Cumulative accuracy uses the best answer for each question and is separate from the attempt score. All units shows every earned certificate, including units closed later.</p></section>
      ${legacyHTML||''}</section>`;
  }
  let pendingFilter=null;
  function studentSummary({student,attempts,cls}){
    const row=buildRows([student],attempts,{...cls,id:student.classId,openUnits:sources(cls,true).filter(s=>s.questions).map(s=>s.unit.id)})[0];
    if(!row)return '';
    return `<section class="tw" dir="ltr"><div class="tw-heading"><div><span class="tw-eyebrow">Student Profile</span><h1>${esc(student.displayName)}</h1><p>${esc(cls?.name||student.classCode||'')}</p></div><div class="tw-heading-actions"><button type="button" class="btn btn-secondary" data-tw-tab="reports">Back to Results</button><button type="button" class="btn btn-primary" data-tw-tab="pins">Student Access</button></div></div><div class="tw-card"><div class="tw-card-head"><h2>Unit Review</h2><span>${row.certificates??'—'} earned certificates</span></div><div class="table-wrap"><table class="tw-results-table tw-student-summary"><thead><tr><th>Unit</th><th>Review Questions</th><th>Cumulative Accuracy</th><th>Certificate</th></tr></thead><tbody>${row.units.map(unit=>`<tr><td>Unit ${unit.number} · ${esc(unit.title)}</td><td dir="ltr">${unit.available?`${unit.answered} / ${unit.total}`:'Unavailable'}</td><td dir="ltr">${unit.available&&unit.answered?Math.round(unit.correct/unit.answered*100)+'%':'—'}</td><td>${unit.earned===null?'Unavailable':unit.earned?'Earned':'Not Earned Yet'}</td></tr>`).join('')}</tbody></table></div><p class="tw-note">Saved answers appear even before a skill is complete. Previously earned certificates remain available.</p></div></section>`;
  }
  function selected(row){return stats(row,report?.unitId||'all');}
  function matches(row,q){
    if(q&&!normalize(row.name).includes(q))return false;
    const value=selected(row),filter=report.filter;
    return filter==='idle'?!value.started:filter==='active'?value.started:filter==='review'?value.accuracy!==null&&value.accuracy<80:filter==='earned'?value.certificates>0:true;
  }
  function filterRows(){
    const host=document.querySelector('.tw-results');if(!host||!report)return;
    const q=normalize(document.getElementById('twStudentSearch')?.value),unitId=document.getElementById('twUnitFilter')?.value||'all';
    report.unitId=unitId;let count=0;
    report.rows.forEach(row=>{
      const tr=Array.from(host.querySelectorAll('[data-tw-row]')).find(el=>el.dataset.twRow===row.id);if(!tr)return;
      const value=selected(row);tr.hidden=!matches(row,q);if(!tr.hidden)count++;
      tr.querySelector('[data-tw-cell="state"]').textContent=value.started?'Started Practice':'Not Started Yet';
      tr.querySelector('[data-tw-cell="progress"]').textContent=value.available?`${value.answered} / ${value.total}`:'Unavailable';
      tr.querySelector('[data-tw-cell="accuracy"]').textContent=value.available&&value.accuracy!==null?value.accuracy+'%':'—';
      tr.querySelector('[data-tw-cell="certificates"]').textContent=value.certificates===null?'Unavailable':String(value.certificates);
    });
    document.getElementById('twVisibleCount').textContent=`${count} of ${report.rows.length} students`;
    document.getElementById('twNoResults').hidden=count>0;
    host.querySelectorAll('[data-tw-status]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.twStatus===report.filter)));
  }
  function filterHome(){
    const input=document.getElementById('twHomeSearch');if(!input)return;
    const q=normalize(input.value);let count=0;
    document.querySelectorAll('[data-tw-home-name]').forEach((button,index)=>{
      button.hidden=q?!button.dataset.twHomeName.includes(q):index>=5;if(!button.hidden)count++;
    });
    document.getElementById('twHomeEmpty').hidden=count>0;
  }
  function exportRows(){
    if(!report)return;
    const q=normalize(document.getElementById('twStudentSearch')?.value);
    const cells=[['Class','Student','Unit','Practice Status','Answered Questions','Total Questions','Cumulative Accuracy %','Earned Certificates']];
    report.rows.filter(row=>matches(row,q)).forEach(row=>{
      const value=selected(row),unit=row.units.find(u=>u.id===report.unitId);
      cells.push([report.cls.name,row.name,unit?`Unit ${unit.number}`:'All Open Units',value.started?'Started':'Not Started',value.available?value.answered:'Unavailable',value.available?value.total:'Unavailable',value.available?value.accuracy??'':'Unavailable',value.certificates??'Unavailable']);
    });
    const csv=cells.map(row=>row.map(v=>{const text=String(v??'');return '"'+(/^[=+@\-\t\r]/.test(text)?"'":'')+text.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');
    const link=document.createElement('a'),url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    link.href=url;link.download='StepUp-Results-'+String(report.cls.code||'class').replace(/[^a-z0-9_-]/gi,'-')+'.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener('input',event=>{if(event.target.id==='twStudentSearch')filterRows();if(event.target.id==='twHomeSearch')filterHome();});
  document.addEventListener('change',event=>{if(event.target.id==='twUnitFilter')filterRows();});
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.twTab){pendingFilter=button.dataset.twTab==='reports'?button.dataset.twFilter||'all':null;window.PROVE?.setTeacherTab(button.dataset.twTab);}
    else if(button.dataset.twStudent)window.PROVE?.openStudent(button.dataset.twStudent);
    else if(button.dataset.twCopy)window.PROVE?.copyStudentLink(button.dataset.twCopy);
    else if(button.dataset.twQr)window.PROVE?.showClassQR(button.dataset.twQr,button.dataset.className||'');
    else if(button.dataset.twStatus&&report){report.filter=button.dataset.twStatus;filterRows();}
    else if(button.hasAttribute('data-tw-refresh'))window.PROVE?.refreshTeacher();
    else if(button.hasAttribute('data-tw-export'))exportRows();
  });
  window.STEPUP_TEACHER_WORKSPACE={home,reports,studentSummary,buildRows,stats,bind(){filterRows();filterHome();},normalize};
})();
