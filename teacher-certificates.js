/* StepUp — verified teacher certificate roster.
   Uses the SAME required-question IDs and 80% mastery rule as unit certificates.
   "Earned" means unlocked and available, not proof of file download. */
(function(){
  'use strict';
  const REQUIRED_MASTERY = 80;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function requirements(){
    const mods = [
      ['u1',window.STEPUP_U1_REVIEW],
      ['u2',window.STEPUP_U2_EXAM],
      ['u3',window.STEPUP_U3_REVIEW]
    ];
    const available=(window.STEPUP_JOURNEY?.data?.units || []);
    return mods.filter(([unitId])=>available.some(u=>u.id===unitId)).map(([unitId,mod])=>{
      const questions=typeof mod?.getCertificateRequirements==='function'
        ? mod.getCertificateRequirements() : null;
      return {unitId,questions:Array.isArray(questions) ? questions : null,
        unit:available.find(u=>u.id===unitId)};
    });
  }

  function evaluateUnit(unitId, attempts, questions){
    if(!Array.isArray(questions) || !questions.length)
      return {earned:false,answered:0,total:0,accuracy:0};
    const target = new Map(), sections = new Map();
    questions.forEach(q=>{
      const key=String(q.section)+'|'+String(q.questionId);
      target.set(key,{answered:false,correct:false});
      sections.set(String(q.trainingId),String(q.section));
    });
    (attempts || []).forEach(a=>{
      if(!a) return;
      if(a.recordKind==='question'){
        if(a.examUnit!==unitId) return;
        const key=String(a.examSection)+'|'+String(a.questionId);
        const entry=target.get(key);
        if(!entry)return;
        entry.answered=true;
        if(a.correct===true || a.bestCorrect===true)entry.correct=true;
      }else if(Array.isArray(a.answers)){
        const section=sections.get(String(a.trainingId));
        if(!section)return;
        a.answers.forEach(answer=>{
          const id=answer?.question_id || answer?.questionId;
          const entry=target.get(section+'|'+String(id));
          if(!entry)return;
          entry.answered=true;
          if(answer.correct===true || answer.bestCorrect===true)entry.correct=true;
        });
      }
    });
    let answered=0,correct=0;
    target.forEach(v=>{if(v.answered)answered++;if(v.correct)correct++;});
    const accuracy=answered?Math.round(correct/answered*100):0;
    return {earned:answered===target.size && accuracy>=REQUIRED_MASTERY,
      answered,total:target.size,accuracy,correct};
  }

  function buildRows(students, attempts, classId, sources){
    const groups=new Map();
    (attempts||[]).forEach(a=>{
      if(!a?.studentId)return;
      if(!groups.has(a.studentId))groups.set(a.studentId,[]);
      groups.get(a.studentId).push(a);
    });
    return (students||[]).filter(s=>s.classId===classId && s.role==='student').map(s=>{
      const studentAttempts=groups.get(s.id)||[];
      const units=sources.filter(item=>item.questions?.length)
        .map(item=>{
          // Use the SAME protected certificate policy as the student's screen.
          // Never grant a new certificate from post-migration cumulative answers.
          const result=window.STEPUP_MASTERY?.status?.(item.unitId,studentAttempts);
          return {unitId:item.unitId,number:item.unit.number,title:item.unit.title,
            earned:!!result?.earned,accuracy:result?.accuracy||0,mode:result?.mode||'pending'};
        })
        .filter(u=>u.earned);
      return {id:s.id,name:s.displayName||'طالبة',units};
    }).filter(row=>row.units.length)
      .sort((a,b)=>a.name.localeCompare(b.name,'ar',{sensitivity:'base'}));
  }

  let lastExport={rows:[],cls:null};
  function ensureCSS(){
    if(document.getElementById('stepupTeacherCertificatesCSS'))return;
    const style=document.createElement('style');style.id='stepupTeacherCertificatesCSS';
    style.textContent=`
      .sct-wrap{max-width:1220px;margin:0 auto;text-align:right}
      .sct-heading{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;margin-bottom:18px}
      .sct-heading h1{font-size:clamp(23px,2.4vw,32px);margin:4px 0}
      .sct-heading p{max-width:820px;line-height:1.8;margin:5px 0;color:#566276}
      .sct-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0}
      .sct-stat{background:#fff;border:1px solid #dfe9f2;border-radius:16px;padding:18px}
      .sct-stat span{display:block;color:#576579;font-weight:650;font-size:14px}
      .sct-stat strong{display:block;color:#173b55;font-size:31px;margin-top:5px;font-variant-numeric:tabular-nums}
      .sct-row-units{display:flex;flex-wrap:wrap;gap:7px}
      .sct-unit{display:inline-flex;align-items:center;gap:7px;border-radius:999px;background:#eaf6f4;color:#185f60;padding:8px 13px;font-weight:750;font-size:14px;border:1px solid #bfe5df}
      .sct-unit b{font-variant-numeric:tabular-nums;font-size:12px;color:#496476}
      .sct-wrap .sct-table th,.sct-wrap .sct-table td{text-align:right;vertical-align:middle;line-height:1.7}
      .sct-wrap .sct-table th{white-space:nowrap}
      .sct-note{font-size:13px;color:#586777;line-height:1.8;margin-top:10px}
      .sct-empty{text-align:center;color:#64748b;padding:35px 12px;line-height:1.9}
      .sct-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .sct-wrap .teacher-report-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
      .sct-wrap .teacher-report-toolbar .field{min-width:230px}
      @media(max-width:680px){.sct-stats{grid-template-columns:1fr}.sct-heading{align-items:flex-start}.sct-wrap .sct-table{min-width:550px}}
      @media print{.sct-actions,.sct-wrap .teacher-report-toolbar .field{display:none!important}.sct-wrap{max-width:none}}
    `;
    document.head.appendChild(style);
  }

  function render({students,attempts,classes,cls,classSelectHTML}){
    ensureCSS();
    if(!cls)return '<section class="card" dir="rtl">أنشئي فصلًا أولًا لعرض شهادات الطالبات.</section>';
    const sources=requirements();
    const unavailable=sources.filter(s=>!s.questions?.length);
    const roster=(students||[]).filter(s=>s.role==='student'&&s.classId===cls.id);
    const rows=buildRows(roster,attempts,cls.id,sources);
    const certificates=rows.reduce((n,row)=>n+row.units.length,0);
    lastExport={rows,cls};
    const tableRows=rows.map((row,i)=>`
      <tr>
        <td>${i+1}</td>
        <td><strong>${esc(row.name)}</strong></td>
        <td><div class="sct-row-units">${row.units.map(u=>`
          <span class="sct-unit" title="${esc(u.title)}">الوحدة ${Number(u.number)}
          <b>${u.accuracy}%</b></span>`).join('')}</div></td>
        <td><strong>${row.units.length}</strong></td>
      </tr>`).join('');
    const message=unavailable.length
      ? '<div class="notice">تعذر التحقق من متطلبات بعض الوحدات. لن تُدرج شهادة إلا بعد التحقق من جميع أسئلتها.</div>'
      : '';
    return `<section class="teacher-reports-v2 sct-wrap" dir="rtl">
      <div class="sct-heading">
        <div><div class="eyebrow">StepUp · Certificates</div>
          <h1>شهادات إتقان الوحدات</h1>
          <p>أسماء الطالبات المستحقات لشهادات الوحدات: شهادات النظام السابق محفوظة، والشهادات الجديدة تتطلب 80% فأكثر في اختبار إتقان مكتمل.</p></div>
        <div class="sct-actions">
          <button type="button" class="btn btn-secondary" onclick="PROVE.setTeacherTab('certificates')">تحديث القائمة</button>
          <button type="button" class="btn btn-primary" onclick="STEPUP_CERT_REPORT.exportCSV()">تصدير القائمة (CSV)</button>
        </div>
      </div>
      <div class="teacher-report-toolbar card" dir="ltr">
        ${classSelectHTML}
        <div class="teacher-report-code"><span>Class Code</span><strong>${esc(cls.code||'')}</strong></div>
      </div>
      ${message}
      <div class="sct-stats">
        <div class="sct-stat"><span>طالبات الفصل</span><strong>${roster.length}</strong></div>
        <div class="sct-stat"><span>الطالبات الحاصلات على شهادة</span><strong>${rows.length}</strong></div>
        <div class="sct-stat"><span>إجمالي شهادات الوحدات المكتسبة</span><strong>${certificates}</strong></div>
      </div>
      <div class="card teacher-students-table">
        <div class="teacher-card-head"><div><h2>قائمة الشهادات — ${esc(cls.name)}</h2></div><span class="teacher-code-pill">${rows.length} طالبة</span></div>
        <div class="table-wrap"><table class="sct-table">
          <thead><tr><th>م</th><th>اسم الطالبة</th><th>الوحدات التي أتقنتها</th><th>عدد الشهادات</th></tr></thead>
          <tbody>${tableRows||'<tr><td colspan="4" class="sct-empty">لا توجد شهادات إتقان مستحقة لهذا الفصل حتى الآن.</td></tr>'}</tbody>
        </table></div>
      </div>
      <p class="sct-note">تحتفظ القائمة بجميع شهادات الإتقان المستحقة وفق النظام السابق. أما الشهادات الجديدة فتعتمد على أفضل محاولة مكتملة في اختبار إتقان الوحدة بنسبة 80% فأكثر. لا يعني الاستحقاق بالضرورة تنزيل ملف الشهادة.</p>
    </section>`;
  }
  function exportCSV(){
    const {rows,cls}=lastExport;
    if(!cls)return;
    const cells=[['الفصل','اسم الطالبة','الوحدة','عنوان الوحدة','الإتقان %']];
    rows.forEach(row=>row.units.forEach(u=>cells.push([cls.name,row.name,u.number,u.title,u.accuracy])));
    const value=cells.map(row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const link=document.createElement('a');
    const href=URL.createObjectURL(new Blob(['\uFEFF'+value],{type:'text/csv;charset=utf-8'}));
    link.href=href;
    link.download='StepUp-Certificates-'+String(cls.code||'class').replace(/[^a-zA-Z0-9_-]/g,'-')+'.csv';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
  }

  window.STEPUP_CERT_REPORT={render,exportCSV,evaluateUnit,buildRows};
})();
