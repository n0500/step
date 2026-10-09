/* StepUp teacher encouragement cards: independent of unit completion certificates.
   Cards are earned only from saved, completed journey attempts; no Firebase writes. */
(function(){
  'use strict';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CARDS=[
    {id:'leap',ar:'وسام القفزة',en:'My Progress Star',icon:'⭐',tone:'gold',message:'Your effort is making a difference!',arabic:'جهودك تصنع فرقا حقيقيا!'},
    {id:'persistence',ar:'نجمة الاستمرار',en:'Keep Going Star',icon:'💗',tone:'pink',message:'You showed consistent effort!',arabic:'مثابرتك تستحق التقدير!'},
    {id:'goal',ar:'محققة الأهداف',en:'Goal Achiever',icon:'🎯',tone:'blue',message:'You are getting closer to your goals!',arabic:'خطوة جديدة نحو هدفك!'},
    {id:'steady',ar:'تقدم ثابت',en:'Steady Progress',icon:'📈',tone:'violet',message:'You keep getting better!',arabic:'تقدمك مستمر خطوة بخطوة!'},
    {id:'growth',ar:'نمو في التعلم',en:'Learning Growth',icon:'🌱',tone:'green',message:'Your hard work is paying off!',arabic:'تتطور مهاراتك بجهودك!'},
    {id:'curious',ar:'متعلمة مستكشفة',en:'Curious Learner',icon:'💡',tone:'orange',message:'You explore new ways to learn!',arabic:'استكشافك للمهارات يقودك إلى التقدم!'}
  ];
  const cardById=id=>CARDS.find(c=>c.id===id);
  const units=()=>window.STEPUP_JOURNEY?.data?.units||[];
  const unitOf=a=>{
    const raw=String(a?.trainingId||'').match(/^journey-(u\d+)-/);
    return raw?raw[1]:null;
  };
  const valid=a=>{
    if(!a||a.recordKind==='question'||!unitOf(a))return false;
    if(!(Number(a.total)>0)||!Number.isFinite(Number(a.percentage)))return false;
    const p=Number(a.percentage);
    return p>=0&&p<=100&&Number.isFinite(Date.parse(a.submittedAt||''));
  };
  const pct=a=>Math.round(Number(a.percentage));
  function area(a){
    const t=String(a.trainingType||'').toLowerCase();
    const id=String(a.trainingId||'');
    if(t==='vocabulary'||/core-1$/.test(id))return 'Vocabulary';
    if(t==='grammar'||/core-2$/.test(id))return 'Grammar';
    if(t==='reading'||/-reading$/.test(id))return 'Reading';
    if(t==='listening'||/-listening$/.test(id))return 'Listening';
    if(t==='functions'||/core-3$/.test(id))return 'Functions';
    if(t==='step'||/-step$/.test(id))return 'STEP';
    if(t==='challenge'||/-final$/.test(id))return 'Challenge';
    return '';
  }
  function evaluateUnit(raw, unit){
    const attempts=(raw||[]).filter(a=>valid(a)&&unitOf(a)===unit)
      .sort((a,b)=>String(a.submittedAt).localeCompare(String(b.submittedAt)));
    if(!attempts.length)return [];
    const output=[];
    const add=(id,evidence)=>output.push({type:id,evidence});
    const byTraining=new Map();
    attempts.forEach(a=>{
      const key=String(a.trainingId);
      if(!byTraining.has(key))byTraining.set(key,[]);
      byTraining.get(key).push(a);
    });

    // Improvement is measured on the same activity, compared with an earlier result.
    let leap=null,steady=null;
    byTraining.forEach(history=>{
      let lowestEarlier=Infinity;
      for(const a of history){
        if(lowestEarlier!==Infinity&&pct(a)-lowestEarlier>=20){
          const value=pct(a)-lowestEarlier;
          if(!leap||value>leap.value)leap={value,before:lowestEarlier,after:pct(a)};
        }
        lowestEarlier=Math.min(lowestEarlier,pct(a));
      }
      if(history.length>=3){
        for(let i=2;i<history.length;i++){
          const a=pct(history[i-2]),b=pct(history[i-1]),c=pct(history[i]);
          if(b>=a+5&&c>=b+5){
            const v=c-a;
            if(!steady||v>steady.value)steady={value:v,before:a,after:c};
          }
        }
      }
    });
    if(leap)add('leap',leap.before+'% → '+leap.after+'% (+'+leap.value+' نقطة مئوية)');
    const dates=new Set(attempts.map(a=>String(a.submittedAt).slice(0,10)));
    if(attempts.length>=3&&dates.size>=2)add('persistence','محاولات: '+attempts.length+' · أيام التدريب: '+dates.size);
    const reached=attempts.filter(a=>area(a)!=='STEP'&&pct(a)>=80).sort((a,b)=>pct(b)-pct(a))[0];
    if(reached)add('goal',area(reached)+' · '+pct(reached)+'%');
    if(steady)add('steady',steady.before+'% → '+steady.after+'% (3 محاولات متتالية)');
    const strong=new Map();
    attempts.forEach(a=>{const type=area(a);if(type&&type!=='STEP'&&pct(a)>=70)strong.set(type,Math.max(strong.get(type)||0,pct(a)));});
    if(strong.size>=2)add('growth',Array.from(strong.keys()).slice(0,3).join(' + '));
    if(byTraining.size>=3)add('curious','أنشطة متنوعة: '+byTraining.size);
    return output;
  }
  function buildRows(students,attempts,classId){
    const grouped=new Map();
    (attempts||[]).forEach(a=>{
      if(!a||!a.studentId)return;
      if(!grouped.has(a.studentId))grouped.set(a.studentId,[]);
      grouped.get(a.studentId).push(a);
    });
    const available=units();
    const rows=[];
    (students||[]).filter(s=>s.role==='student'&&s.classId===classId).forEach(student=>{
      const mine=grouped.get(student.id)||[];
      available.forEach(u=>{
        if(!/^u\d+$/.test(u.id))return;
        evaluateUnit(mine,u.id).forEach(award=>{
          rows.push({studentId:student.id,studentName:student.displayName||'طالبة',
            classId,unitId:u.id,unitNumber:u.number,unitTitle:u.title,
            type:award.type,evidence:award.evidence});
        });
      });
    });
    return rows.sort((a,b)=>a.studentName.localeCompare(b.studentName,'ar')||
      Number(a.unitNumber)-Number(b.unitNumber)||CARDS.findIndex(c=>c.id===a.type)-CARDS.findIndex(c=>c.id===b.type));
  }
  let current={rows:[],cls:null};
  const filename=s=>String(s||'class').replace(/[^\p{L}\p{N}_-]/gu,'-');
  function css(){
    if(document.getElementById('stepupEncouragementStyles'))return;
    const s=document.createElement('style');s.id='stepupEncouragementStyles';
    s.textContent=[
      '.smc-view{max-width:1230px;margin:0 auto;text-align:right}',
      '.smc-head{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:14px}',
      '.smc-head h1{margin:4px 0;font-size:clamp(23px,2.4vw,31px)}',
      '.smc-head p{color:#58657a;line-height:1.8;margin:5px 0;max-width:800px}',
      '.smc-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.smc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}',
      '.smc-stat{padding:16px 19px;border:1px solid #e1e8ef;border-radius:14px;background:white}',
      '.smc-stat span{display:block;color:#64748b;font-weight:650;font-size:13px}',
      '.smc-stat strong{display:block;font-size:30px;color:#203b54;margin-top:6px}',
      '.smc-view .teacher-report-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}',
      '.smc-chip{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;background:#fff4db;color:#8b5e12;border:1px solid #f2d8a8;border-radius:999px;font-weight:750;white-space:nowrap}',
      '.smc-view table th,.smc-view table td{text-align:right;vertical-align:middle;padding:12px 10px}',
      '.smc-empty{text-align:center;padding:32px 12px;color:#64748b;line-height:1.9}',
      '.smc-note{color:#64748b;font-size:13px;line-height:1.8;margin:12px 0}',
      '.smc-tile{min-height:600px;max-width:740px;margin:auto;border:5px solid var(--smc-color);border-radius:27px;padding:38px;background:linear-gradient(155deg,#fff,var(--smc-bg));display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;color:#24354d;box-sizing:border-box}',
      '.smc-tile .smc-brand{align-self:flex-start;font-size:26px;font-weight:900;color:#6b21a8}',
      '.smc-tile .smc-emoji{font-size:100px;line-height:1.3}',
      '.smc-tile .smc-title{font-size:40px;font-weight:900;color:var(--smc-color);margin:8px 0}',
      '.smc-tile .smc-title-ar{font-size:31px;font-weight:850;color:var(--smc-color);margin:0}',
      '.smc-tile .smc-name{font-size:29px;font-weight:850;margin:16px 0}',
      '.smc-tile .smc-unit{font-size:20px;font-weight:700;color:#3e566e}',
      '.smc-tile .smc-message{font-size:20px;font-weight:700;line-height:1.8}',
      '.smc-tile .smc-evidence{background:#ffffffd9;border:1px solid #dbe4ef;border-radius:16px;padding:12px 20px;font-size:19px}',
      '.smc-tile .smc-footer{font-size:16px;font-weight:700;color:#526278}',
      '#stepupMotivationPrint{display:none}',
      '@media(max-width:670px){.smc-stats{grid-template-columns:1fr}.smc-view table{min-width:620px}}',
      '@media print{@page{size:A4 portrait;margin:12mm}body > :not(#stepupMotivationPrint){display:none!important}#stepupMotivationPrint{display:block!important}.smc-tile{height:245mm;max-width:none;break-after:page;print-color-adjust:exact;-webkit-print-color-adjust:exact}.smc-tile:last-child{break-after:auto}}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function tile(r,cls){
    const c=cardById(r.type);
    if(!c)return '';
    const themes={gold:['#bc8615','#fff3c9'],pink:['#df4d7d','#ffe5ef'],blue:['#2574cc','#e4f2ff'],
      violet:['#8555cc','#efe4ff'],green:['#328450','#e4f6e9'],orange:['#d17c19','#fff0d8']};
    const colors=themes[c.tone]||themes.gold;
    return '<article class="smc-tile" dir="rtl" style="--smc-color:'+colors[0]+';--smc-bg:'+colors[1]+'">'+
      '<div class="smc-brand" dir="ltr">✦ STEP UP</div>'+
      '<div class="smc-emoji" aria-hidden="true">'+c.icon+'</div>'+
      '<div><div class="smc-title" dir="ltr">'+esc(c.en)+'</div><div class="smc-title-ar">'+esc(c.ar)+'</div></div>'+
      '<div class="smc-name">'+esc(r.studentName)+'</div>'+
      '<div class="smc-unit">الوحدة '+esc(r.unitNumber)+' · '+esc(r.unitTitle)+'</div>'+
      '<div class="smc-message" dir="ltr">'+esc(c.message)+'</div>'+
      '<div class="smc-message">'+esc(c.arabic)+'</div>'+
      '<div class="smc-evidence">'+esc(r.evidence)+'</div>'+
      '<div class="smc-footer">'+esc(cls.name)+' · StepUp</div>'+
    '</article>';
  }
  function printCard(index){
    if(!current.cls||!Number.isInteger(index)||!current.rows[index])return;
    css();
    document.getElementById('stepupMotivationPrint')?.remove();
    const sheet=document.createElement('div');sheet.id='stepupMotivationPrint';
    sheet.innerHTML=tile(current.rows[index],current.cls);
    document.body.appendChild(sheet);
    const cleanup=()=>{sheet.remove();window.removeEventListener('afterprint',cleanup);};
    window.addEventListener('afterprint',cleanup);
    window.print();
  }
  function exportCSV(){
    if(!current.cls)return;
    const cells=[['الفصل','اسم الطالبة','الوحدة','البطاقة التشجيعية','سبب الاستحقاق']];
    current.rows.forEach(r=>cells.push([current.cls.name,r.studentName,r.unitNumber,cardById(r.type).ar,r.evidence]));
    const output=cells.map(row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const link=document.createElement('a');
    const href=URL.createObjectURL(new Blob(['\uFEFF'+output],{type:'text/csv;charset=utf-8'}));
    link.href=href;link.download='StepUp-Encouragement-'+filename(current.cls.code)+'.csv';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
  }
  function render({students,attempts,cls,classSelectHTML}){
    css();
    if(!cls)return '<section class="card" dir="rtl">يرجى إنشاء فصل لعرض البطاقات التشجيعية.</section>';
    const roster=(students||[]).filter(s=>s.role==='student'&&s.classId===cls.id);
    const rows=buildRows(roster,attempts,cls.id);
    current={rows,cls};
    const unique=new Set(rows.map(r=>r.studentId));
    const names=rows.map((r,i)=>{
      const c=cardById(r.type);
      return '<tr><td>'+esc(r.studentName)+'</td><td>الوحدة '+esc(r.unitNumber)+'</td>'+
        '<td><span class="smc-chip">'+c.icon+' '+esc(c.ar)+'</span></td>'+
        '<td>'+esc(r.evidence)+'</td>'+
        '<td><button type="button" class="btn btn-secondary" onclick="STEPUP_MOTIVATION.printCard('+i+')">طباعة البطاقة</button></td></tr>';
    }).join('');
    return '<section class="teacher-reports-v2 smc-view" dir="rtl">'+
      '<div class="smc-head"><div><div class="eyebrow">StepUp · Encouragement</div>'+
      '<h1>البطاقات التشجيعية</h1>'+
      '<p>تقدير التحسن والمثابرة والاستكشاف من نتائج التدريب المحفوظة، دون اشتراط اجتياز الوحدة أو إصدار شهادة إتقان.</p></div>'+
      '<div class="smc-actions"><button class="btn btn-secondary" onclick="PROVE.setTeacherTab(\'motivation\')">تحديث القائمة</button>'+
      '<button class="btn btn-primary" onclick="STEPUP_MOTIVATION.exportCSV()">تصدير القائمة</button></div></div>'+
      '<div class="teacher-report-toolbar card" dir="ltr">'+classSelectHTML+
      '<div class="teacher-report-code"><span>Class Code</span><strong>'+esc(cls.code||'')+'</strong></div></div>'+
      '<div class="smc-stats"><div class="smc-stat"><span>طالبات الفصل</span><strong>'+roster.length+'</strong></div>'+
      '<div class="smc-stat"><span>الطالبات المستحقات للتشجيع</span><strong>'+unique.size+'</strong></div>'+
      '<div class="smc-stat"><span>البطاقات المكتسبة</span><strong>'+rows.length+'</strong></div></div>'+
      '<div class="card teacher-students-table"><div class="teacher-card-head"><h2>سجل البطاقات — '+esc(cls.name)+'</h2>'+
      '<span class="teacher-code-pill">'+rows.length+' بطاقة</span></div>'+
      '<div class="table-wrap"><table><thead><tr><th>الطالبة</th><th>الوحدة</th><th>البطاقة</th><th>دليل الاستحقاق</th><th>الإجراء</th></tr></thead>'+
      '<tbody>'+ (names||'<tr><td colspan="5" class="smc-empty">لا توجد بطاقات مستحقة حتى الآن. ستظهر عند استيفاء معايير التشجيع.</td></tr>') +
      '</tbody></table></div></div>'+
      '<p class="smc-note">تظهر بطاقة واحدة من كل نوع للطالبة في الوحدة نفسها، وتُحتسب من نتائج التدريب المحفوظة دون التأثير في شهادات إتقان الوحدات.</p>'+
    '</section>';
  }
  // Reuse the exact approved award definitions in students' own card gallery.
  window.STEPUP_MOTIVATION={render,buildRows,evaluateUnit,printCard,exportCSV,
    getCards:()=>CARDS.map(card=>({...card}))};
})();