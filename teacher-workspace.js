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
      return {id:student.id,name:student.displayName||'طالبة',started:activity.length>0,units,certificates,
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
      <div class="tw-context-code"><span>رمز الفصل</span><b dir="ltr">${esc(cls.code)}</b></div>
      <div class="tw-context-actions"><button type="button" class="btn btn-secondary" data-tw-copy="${esc(cls.code)}">نسخ رابط الطالبات</button>
      <button type="button" class="btn btn-secondary" data-tw-qr="${esc(cls.code)}" data-class-name="${esc(cls.name)}">باركود الفصل</button></div></div>`;
  }
  function route(tab,title,description,number){
    return `<button type="button" class="tw-route" data-tw-tab="${tab}"><span class="tw-route-number" aria-hidden="true">${number}</span><strong>${title}</strong><small>${description}</small><span class="tw-route-arrow" aria-hidden="true">←</span></button>`;
  }
  function metric(label,value,detail,tab,filter){
    return `<button type="button" class="tw-metric" data-tw-tab="${tab}"${filter?` data-tw-filter="${filter}"`:''}><span>${label}</span><strong>${value??'—'}</strong><small>${detail}</small></button>`;
  }
  function dateLabel(value){
    const date=new Date(value);
    return value&&Number.isFinite(date.getTime())?date.toLocaleDateString('ar-SA',{calendar:'gregory',day:'numeric',month:'short'}):'لا يوجد نشاط محفوظ';
  }
  function recentHTML(attempts){
    const recent=(attempts||[]).filter(practice).slice().sort((a,b)=>String(b.submittedAt||'').localeCompare(String(a.submittedAt||''))).slice(0,5);
    if(!recent.length)return '<div class="tw-empty">سيظهر آخر نشاط هنا بعد حفظ إجابات الطالبات.</div>';
    return `<div class="tw-activity">${recent.map(a=>{
      const percentage=Number(a.attemptPercentage??a.percentage??0);
      const label=a.recordKind==='question'?(a.correct===true?'إجابة صحيحة':'إجابة غير صحيحة'):
        Number.isFinite(Number(a.attemptPercentage))&&a.attemptPercentage!=null?`درجة المحاولة ${percentage}%`:`نتيجة محفوظة ${percentage}%`;
      return `<button type="button" data-tw-student="${esc(a.studentId)}"><span><strong>${esc(a.studentName||'طالبة')}</strong><small>${esc(a.trainingTitle||a.skill||'تدريب')} · ${esc(dateLabel(a.submittedAt))}</small></span><b class="tw-activity-label">${esc(label)}</b></button>`;
    }).join('')}</div>`;
  }
  function home(input){
    const {classes,cls,profile,students,attempts,classSelectHTML}=input;
    if(!cls)return `<section class="tw" dir="rtl"><div class="tw-heading"><span class="tw-eyebrow">STEP UP · لوحة المعلمة</span><h1>أهلا ${esc(profile.displayName||'بك')}</h1></div><div class="tw-card tw-empty"><h2>ابدئي بإنشاء فصل</h2><p>لكل فصل قائمة طالبات ورابط دخول ونتائج مستقلة.</p><button type="button" class="btn btn-primary" onclick="PROVE.createClass()">إنشاء فصل</button></div></section>`;
    const rows=buildRows(students,attempts,cls),active=rows.filter(r=>r.started).length;
    const certificateCount=rows.every(r=>stats(r).certificates!==null)?rows.filter(r=>stats(r).certificates>0).length:null;
    const activity=attempts.filter(a=>a.classId===cls.id&&rows.some(r=>r.id===a.studentId));
    return `<section class="teacher-home-v2 tw" dir="rtl">
      <div class="tw-heading"><div><span class="tw-eyebrow">STEP UP · لوحة المعلمة</span><h1>كل ما تحتاجينه في مكان واضح</h1><p>${esc(profile.displayName||'')}<span class="tw-separator">·</span>${esc(profile.school||'')}</p></div><div class="tw-heading-actions"><span class="tw-total">${classes.length} فصول · ${students.length} طالبة إجمالا</span><button type="button" class="btn btn-secondary" data-tw-refresh>تحديث البيانات</button></div></div>
      ${context({cls,classSelectHTML})}
      <div class="tw-section-title"><h2>أين تجدين البيانات؟</h2><span>اختاري ما تحتاجينه مباشرة</span></div>
      <div class="tw-routes">${route('reports','الطالبات والنتائج','درجات المراجعة، الإكمال، وملف كل طالبة','01')}${route('pins','حسابات الدخول','رموز PIN واستعادة دخول الطالبات','02')}${route('certificates','شهادات الوحدات','الطالبات المستحقات للشهادات وقائمة الوحدات','03')}${route('classes','الفصول والوحدات','روابط الفصول، الباركود، وفتح الوحدات','04')}</div>
      <div class="tw-section-title"><h2>فصل ${esc(cls.name)}</h2><span>الأرقام التالية لهذا الفصل فقط</span></div>
      <div class="tw-metrics">${metric('طالبات الفصل',rows.length,'عرض قائمة الطالبات','reports','all')}${metric('بدأن التدريب',active,'لديهن محاولات محفوظة','reports','active')}${metric('لم يبدأن بعد',rows.length-active,'متابعة الطالبات دون نشاط محفوظ','reports','idle')}${metric('لديهن شهادات',certificateCount,'الشهادات المستحقة حسب النظام الحالي','certificates')}</div>
      <div class="tw-main-grid"><section class="tw-card"><div class="tw-card-head"><h2>الوصول إلى ملف طالبة</h2><button type="button" class="tw-link" data-tw-tab="reports">عرض الجميع ←</button></div>
        <label class="tw-label" for="twHomeSearch">ابحثي باسم الطالبة في هذا الفصل</label><input id="twHomeSearch" class="tw-search" type="search" placeholder="اسم الطالبة" autocomplete="off">
        <div class="tw-student-shortlist">${rows.map((row,i)=>`<button type="button" data-tw-home-name="${esc(normalize(row.name))}" data-tw-student="${esc(row.id)}"${i>=5?' hidden':''}><span>${esc(row.name)}</span><small>فتح الملف ←</small></button>`).join('')}</div>
        <p id="twHomeEmpty" class="tw-empty"${rows.length?' hidden':''}>${rows.length?'لا توجد طالبة بهذا الاسم في الفصل المحدد.':'لا توجد طالبات في هذا الفصل بعد.'}</p><small class="tw-note">البحث يشمل جميع طالبات الفصل، ويظهر الملف عند اختيار الاسم.</small>
      </section><section class="tw-card"><div class="tw-card-head"><h2>آخر نشاط محفوظ</h2><button type="button" class="tw-link" data-tw-tab="reports">كل النتائج ←</button></div>${recentHTML(activity)}</section></div>
      <div class="tw-footer-help"><span>أدوات الشرح والعرض الجماعي تجدينها في <b>العرض الصفي</b>، والمساعد والقاموس في <b>أدوات التدريس</b>.</span><button type="button" class="tw-link" data-tw-tab="classmode">فتح العرض الصفي ←</button></div>
    </section>`;
  }
  function rowHTML(row){
    return `<tr data-tw-row="${esc(row.id)}" data-tw-name="${esc(normalize(row.name))}"><td><button type="button" class="teacher-student-link" data-tw-student="${esc(row.id)}">${esc(row.name)}</button></td><td data-tw-cell="state"></td><td data-tw-cell="progress" dir="ltr"></td><td data-tw-cell="accuracy" dir="ltr"></td><td data-tw-cell="certificates"></td><td><button type="button" class="btn btn-secondary" data-tw-student="${esc(row.id)}">ملف الطالبة</button></td></tr>`;
  }
  function reports(input){
    const {cls,students,attempts,classSelectHTML,legacyHTML}=input;
    const rows=buildRows(students,attempts,cls);
    report={rows,cls,unitId:'all',filter:pendingFilter||'all'};pendingFilter=null;
    return `<section class="teacher-reports-v2 tw" dir="rtl"><div class="tw-heading"><div><span class="tw-eyebrow">المتابعة والنتائج</span><h1>الطالبات والنتائج</h1><p>ابحثي عن طالبة أو اختاري وحدة، ثم افتحي ملفها للتفاصيل.</p></div><div class="tw-heading-actions"><button type="button" class="btn btn-secondary" data-tw-refresh>تحديث البيانات</button><button type="button" class="btn btn-primary" data-tw-export>تصدير القائمة</button></div></div>
      ${context({cls,classSelectHTML})}
      <section class="tw-card tw-results"><div class="tw-report-filters"><div><label class="tw-label" for="twStudentSearch">اسم الطالبة</label><input id="twStudentSearch" class="tw-search" type="search" placeholder="ابحثي باسم الطالبة" autocomplete="off"></div><div><label class="tw-label" for="twUnitFilter">نتائج المراجعة</label><select id="twUnitFilter" class="tw-search"><option value="all">كل الوحدات المفتوحة</option>${sources(cls).map(({unit})=>`<option value="${esc(unit.id)}">الوحدة ${unit.number} · ${esc(unit.title)}</option>`).join('')}</select></div></div>
      <div class="tw-filter-chips" role="group" aria-label="تصفية الطالبات">${[['all','كل الطالبات'],['idle','لم يبدأن'],['active','بدأن التدريب'],['review','دقة أقل من 80%'],['earned','لديهن شهادة']].map(([key,label])=>`<button type="button" data-tw-status="${key}" aria-pressed="${report.filter===key}">${label}</button>`).join('')}</div>
      <div class="tw-table-meta"><h2>قائمة ${esc(cls.name)}</h2><span id="twVisibleCount" role="status" aria-live="polite"></span></div>
      <div class="table-wrap"><table class="tw-results-table"><thead><tr><th>الطالبة</th><th>حالة التدريب</th><th>أسئلة المراجعة</th><th>الدقة التراكمية</th><th>الشهادات المستحقة</th><th>التفاصيل</th></tr></thead><tbody>${rows.map(rowHTML).join('')}<tr id="twNoResults" hidden><td colspan="6">لا توجد طالبات مطابقات للبحث أو الفلتر في هذا الفصل.</td></tr></tbody></table></div>
      <p class="tw-note">الأسئلة والدقة تخص الوحدات المفتوحة المختارة. الدقة التراكمية تحفظ أفضل إجابة لكل سؤال، وهي منفصلة عن درجة المحاولة. عند اختيار الكل تظهر جميع الشهادات المستحقة، بما فيها الوحدات المغلقة لاحقا.</p></section>
      ${legacyHTML||''}</section>`;
  }
  let pendingFilter=null;
  function studentSummary({student,attempts,cls}){
    const row=buildRows([student],attempts,{...cls,id:student.classId,openUnits:sources(cls,true).filter(s=>s.questions).map(s=>s.unit.id)})[0];
    if(!row)return '';
    return `<section class="tw" dir="rtl"><div class="tw-heading"><div><span class="tw-eyebrow">ملف الطالبة</span><h1>${esc(student.displayName)}</h1><p>${esc(cls?.name||student.classCode||'')}</p></div><div class="tw-heading-actions"><button type="button" class="btn btn-secondary" data-tw-tab="reports">العودة إلى النتائج</button><button type="button" class="btn btn-primary" data-tw-tab="pins">حسابات الدخول</button></div></div><div class="tw-card"><div class="tw-card-head"><h2>مراجعة الوحدات</h2><span>${row.certificates??'—'} شهادة مستحقة</span></div><div class="table-wrap"><table class="tw-results-table tw-student-summary"><thead><tr><th>الوحدة</th><th>أسئلة المراجعة</th><th>الدقة التراكمية</th><th>الشهادة</th></tr></thead><tbody>${row.units.map(unit=>`<tr><td>الوحدة ${unit.number} · ${esc(unit.title)}</td><td dir="ltr">${unit.available?`${unit.answered} / ${unit.total}`:'غير متاح'}</td><td dir="ltr">${unit.available&&unit.answered?Math.round(unit.correct/unit.answered*100)+'%':'—'}</td><td>${unit.earned===null?'غير متاح':unit.earned?'مستحقة':'لم تستحق بعد'}</td></tr>`).join('')}</tbody></table></div><p class="tw-note">تظهر الإجابات المحفوظة حتى قبل اكتمال المهارة، وتبقى الشهادات المستحقة سابقا محفوظة.</p></div></section>`;
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
      tr.querySelector('[data-tw-cell="state"]').textContent=value.started?'بدأت التدريب':'لم تبدأ بعد';
      tr.querySelector('[data-tw-cell="progress"]').textContent=value.available?`${value.answered} / ${value.total}`:'غير متاح';
      tr.querySelector('[data-tw-cell="accuracy"]').textContent=value.available&&value.accuracy!==null?value.accuracy+'%':'—';
      tr.querySelector('[data-tw-cell="certificates"]').textContent=value.certificates===null?'غير متاح':String(value.certificates);
    });
    document.getElementById('twVisibleCount').textContent=`${count} من ${report.rows.length} طالبة`;
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
    const cells=[['الفصل','الطالبة','الوحدة','حالة التدريب','أسئلة مجابة','إجمالي الأسئلة','الدقة التراكمية %','الشهادات المستحقة']];
    report.rows.filter(row=>matches(row,q)).forEach(row=>{
      const value=selected(row),unit=row.units.find(u=>u.id===report.unitId);
      cells.push([report.cls.name,row.name,unit?`الوحدة ${unit.number}`:'كل الوحدات المفتوحة',value.started?'بدأت':'لم تبدأ',value.available?value.answered:'غير متاح',value.available?value.total:'غير متاح',value.available?value.accuracy??'':'غير متاح',value.certificates??'غير متاح']);
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
