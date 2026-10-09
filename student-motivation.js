/* StepUp • Student encouragement cards • 2026-10-09
   Uses the SAME eligibility logic and copy as teacher-motivation.js.
   No new Firebase collections or writes. Cards survive by deriving from
   the student's saved, authenticated journey attempt history.
   A congratulation appears only on a newly saved, qualifying attempt. */
(function(){
  'use strict';
  const J=window.STEPUP_JOURNEY;
  const P=window.PROVE;
  const M=window.STEPUP_MOTIVATION;
  if(!J||!P||typeof M?.evaluateUnit!=='function'||typeof M?.getCards!=='function')return;

  const STYLE_ID='stepupStudentMotivationStyles';
  const TOAST_ID='stepupStudentMotivationToast';
  const escapeHTML=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cards=M.getCards();
  const info=id=>cards.find(c=>c.id===id)||null;
  const allUnits=()=>J.data?.units||[];
  const unitName=id=>{const u=allUnits().find(x=>x.id===id);return u?('Unit '+u.number+' · '+u.title):id;};
  const unitOf=a=>String(a?.trainingId||'').match(/^journey-(u\d+)-/)?.[1]||null;
  let current={uid:'',name:'',attempts:[],initialized:false};
  let toastTimer=null;

  function style(){
    if(document.getElementById(STYLE_ID))return;
    const css=document.createElement('style');css.id=STYLE_ID;
    css.textContent=[
      ".ssm-stars{margin:16px 0;padding:18px 20px;border:1px solid #dce7f4;border-radius:18px;background:#f8fbff;box-shadow:0 4px 16px rgba(20,48,80,.035)}",
      ".ssm-stars-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}",
      ".ssm-stars h2{font-size:20px;line-height:1.5;font-weight:850;color:#243e60;margin:0}",
      ".ssm-stars-count{border-radius:999px;padding:5px 12px;background:#e9f1ff;color:#305a84;font-size:13px;font-weight:800}",
      ".ssm-stars-sub{display:block;color:#647991;font-size:13px;margin:4px 0 0}",
      ".ssm-stars-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:13px}",
      ".ssm-star{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:13px;background:#fff;border:1px solid #dce6f1;min-width:0}",
      ".ssm-star-icon{font-size:27px;flex-shrink:0;line-height:1.2}",
      ".ssm-star-name{font-size:15px;font-weight:850;color:#284969;line-height:1.4}",
      ".ssm-star-info{font-size:12px;color:#657891;line-height:1.5;display:block}",
      ".ssm-star-empty{font-size:14px;color:#65758a;margin:12px 0 0;line-height:1.75}",
      ".ssm-toast{position:fixed;top:90px;right:18px;z-index:100100;width:min(390px,calc(100vw - 36px));box-sizing:border-box;border:1px solid #d6e5f2;border-left:5px solid #2e8e7f;border-radius:17px;background:#fff;box-shadow:0 15px 45px rgba(17,39,72,.22);padding:15px 18px;direction:rtl}",
      ".ssm-toast-head{display:flex;align-items:start;justify-content:space-between;gap:10px}",
      ".ssm-toast b{display:block;color:#1d4761;font-size:18px}",
      ".ssm-toast p{font-size:14px;line-height:1.7;color:#40546d;margin:7px 0 11px}",
      ".ssm-btn{padding:10px 17px;min-height:42px;border:0;background:#265f9c;border-radius:12px;color:#fff;font-size:14px;font-weight:800;cursor:pointer}",
      ".ssm-btn:focus-visible,.ssm-close:focus-visible{outline:3px solid #5191ea;outline-offset:3px}",
      ".ssm-close{width:30px;height:30px;border:0;border-radius:9px;background:#f3f6fa;font-size:18px;color:#354a68;cursor:pointer;flex-shrink:0}",
      "@media(max-width:600px){.ssm-stars{padding:15px}.ssm-stars-grid{grid-template-columns:1fr 1fr}.ssm-star{padding:10px}.ssm-star-name{font-size:14px}.ssm-toast{top:auto;bottom:24px;right:12px;width:calc(100vw - 24px)}}",
      "@media(max-width:410px){.ssm-stars-grid{grid-template-columns:1fr}}",
    ].join('\n');
    document.head.appendChild(css);
  }

  function calculate(list=current.attempts,uid=current.uid){
    if(!uid||!Array.isArray(list))return [];
    const mine=list.filter(a=>a&&a.studentId===uid);
    const output=[];
    for(const u of allUnits()){
      if(!/^u\d+$/.test(String(u.id)))continue;
      for(const a of M.evaluateUnit(mine,u.id)){
        if(info(a.type))output.push({id:u.id+'|'+a.type,unitId:u.id,type:a.type,
          evidence:a.evidence,unitNumber:u.number,unitTitle:u.title,meta:info(a.type)});
      }
    }
    return output.sort((a,b)=>a.unitNumber-b.unitNumber||cards.findIndex(c=>c.id===a.type)-cards.findIndex(c=>c.id===b.type));
  }

  function hydrate(attempts,profile){
    if(profile?.role!=='student'||!profile.id||!Array.isArray(attempts))return;
    if(current.uid!==String(profile.id)){
      dismissToast();
    }
    current={uid:String(profile.id),name:String(profile.displayName||'').trim(),
      attempts,initialized:true};
  }

  // Compact earned stars live in My Progress. Home and Journey remain uncluttered.
  function starsHTML(){
    style();
    const earned=calculate();
    return '<section class="ssm-stars" dir="rtl" aria-label="نجومي">'+
      '<div class="ssm-stars-head"><div><h2>⭐ My Stars · نجومي</h2>'+
      '<span class="ssm-stars-sub">نجوم تقدر تقدمك ومثابرتك في التعلم</span></div>'+
      '<span class="ssm-stars-count">'+earned.length+' '+(earned.length===1?'نجمة':'نجوم')+'</span></div>'+
      (earned.length?'<div class="ssm-stars-grid">'+earned.map(a=>
        '<div class="ssm-star" title="'+escapeHTML(a.evidence)+'">'+
        '<span class="ssm-star-icon" aria-hidden="true">'+a.meta.icon+'</span>'+
        '<div><strong class="ssm-star-name">'+escapeHTML(a.meta.ar)+'</strong>'+
        '<span class="ssm-star-info">'+escapeHTML(a.meta.en)+' · Unit '+a.unitNumber+'</span></div></div>'
       ).join('')+'</div>':
       '<p class="ssm-star-empty">كل تقدم يصنع فرقًا! ستظهر نجومك هنا بعد استحقاقها. 🌱</p>')+
      '</section>';
  }

  // Home/Journey only update identity and saved attempts; no card gallery there.
  // The Progress view contains My Certificates followed by compact My Stars.
  for(const method of ['homeHTML','html','progressHTML']){
    const original=J[method];
    if(typeof original!=='function')continue;
    J[method]=function(attempts,openUnits,profile){
      if(profile?.role!=='student'||!profile.id||!Array.isArray(attempts))
        return original.apply(this,arguments);
      hydrate(attempts,profile);
      const result=original.apply(this,arguments);
      return method==='progressHTML'&&typeof result==='string'?result+starsHTML():result;
    };
  }

  function goToStars(){
    dismissToast();
    P.setStudentTab?.('progress');
  }

  function dismissToast(){
    if(toastTimer){clearTimeout(toastTimer);toastTimer=null;}
    document.getElementById(TOAST_ID)?.remove();
  }
  function celebrate(newAwards){
    if(!newAwards.length||!current.uid)return;
    style();dismissToast();
    const titles=newAwards.map(a=>a.meta.icon+' '+a.meta.ar).join('، ');
    const node=document.createElement('div');node.id=TOAST_ID;node.className='ssm-toast';
    node.setAttribute('role','status');node.setAttribute('aria-live','polite');
    node.innerHTML='<div class="ssm-toast-head"><b>🎉 مبروك! نجمة تشجيعية جديدة</b>'+
      '<button type="button" class="ssm-close" aria-label="إغلاق" data-toast-close>×</button></div>'+
      '<p>استحققتِ '+escapeHTML(titles)+' في '+escapeHTML(unitName(newAwards[0].unitId))+
      '. تقدّمك يستحق التقدير، وأضيفت إلى نجومك!</p>'+
      '<button type="button" class="ssm-btn" data-stars>عرض نجومي</button>';
    node.querySelector('[data-toast-close]')?.addEventListener('click',dismissToast);
    node.querySelector('[data-stars]')?.addEventListener('click',goToStars);
    document.body.appendChild(node);
    toastTimer=setTimeout(dismissToast,11000);
  }

  // Announce only changes caused by a NEW, successfully saved unit attempt.
  // Previously earned stars are calculated from saved attempts without replaying toasts.
  if(typeof P.recordJourneyAttempt==='function'&&!P.recordJourneyAttempt.__studentMotivation){
    const original=P.recordJourneyAttempt;
    const wrapped=async function(payload){
      const uid=current.uid,unit=unitOf(payload);
      const eligible=current.initialized&&!!uid&&!!unit;
      const prior=eligible?current.attempts.slice():[];
      const before=eligible?new Set(calculate(prior,uid).map(a=>a.id)):new Set();
      const saved=await original.apply(this,arguments); // Do not celebrate failed saves.
      if(!eligible||!saved||String(saved.studentId)!==uid||uid!==current.uid)return saved;
      const history=prior.concat(saved);
      current.attempts=history; // Actual saved result; ignore synthetic wrapper duplicates.
      const earned=calculate(history,uid);
      const added=earned.filter(a=>!before.has(a.id)&&a.unitId===unit);
      if(added.length)celebrate(added);
      return saved;
    };
    wrapped.__studentMotivation=true;
    P.recordJourneyAttempt=wrapped;
  }

  if(typeof P.logout==='function'){
    const oldLogout=P.logout;
    P.logout=function(){dismissToast();current={uid:'',name:'',attempts:[],initialized:false};return oldLogout.apply(this,arguments);};
  }

  window.STEPUP_STUDENT_MOTIVATION={calculate,starsHTML,goToStars};
})();