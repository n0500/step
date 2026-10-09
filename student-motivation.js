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
  const DIALOG_ID='stepupStudentMotivationDialog';
  const TOAST_ID='stepupStudentMotivationToast';
  const escapeHTML=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cards=M.getCards();
  const info=id=>cards.find(c=>c.id===id)||null;
  const allUnits=()=>J.data?.units||[];
  const unitName=id=>{const u=allUnits().find(x=>x.id===id);return u?('Unit '+u.number+' · '+u.title):id;};
  const unitOf=a=>String(a?.trainingId||'').match(/^journey-(u\d+)-/)?.[1]||null;
  let current={uid:'',name:'',attempts:[],initialized:false};
  let toastTimer=null,restoreFocus=null;

  function style(){
    if(document.getElementById(STYLE_ID))return;
    const css=document.createElement('style');css.id=STYLE_ID;
    css.textContent=[
      '.ssm-shelf{margin:18px 0;padding:20px 24px;border:1px solid #dce7f4;border-radius:21px;background:linear-gradient(115deg,#fff,#f3f7ff);box-shadow:0 7px 22px rgba(19,49,88,.045)}',
      '.ssm-shelf-main{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:13px}',
      '.ssm-shelf-heading{display:flex;align-items:center;gap:12px}',
      '.ssm-shelf-icon{display:grid;place-items:center;width:49px;height:49px;font-size:25px;background:#e9efff;border-radius:15px}',
      '.ssm-shelf h2{font-size:21px;line-height:1.35;color:#233657;margin:0;font-weight:850}',
      '.ssm-shelf small{display:block;font-size:13px;color:#687991;margin-top:2px}',
      '.ssm-shelf p{font-size:14px;line-height:1.65;color:#596b81;margin:10px 0 0}',
      '.ssm-preview{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:11px}',
      '.ssm-preview span{display:inline-block;padding:6px 11px;border-radius:99px;border:1px solid #dbe3f3;background:#fff;font-size:13px;font-weight:700;color:#3b5475}',
      '.ssm-btn{padding:11px 18px;min-height:44px;border:0;background:#265f9c;border-radius:13px;color:#fff;font-size:15px;font-weight:800;cursor:pointer}',
      '.ssm-btn:focus-visible,.ssm-close:focus-visible{outline:3px solid #5191ea;outline-offset:3px}',
      '.ssm-overlay{position:fixed;inset:0;z-index:100200;background:rgba(15,27,46,.62);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box}',
      '.ssm-dialog{background:#fff;border-radius:23px;width:min(940px,100%);max-height:min(90vh,1000px);display:flex;flex-direction:column;box-shadow:0 28px 75px rgba(0,0,0,.28);overflow:hidden}',
      '.ssm-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:22px 26px 16px;border-bottom:1px solid #ebeff5}',
      '.ssm-dialog h2{font-size:25px;color:#263c60;margin:0}',
      '.ssm-dialog-head p{color:#64748b;font-size:14px;margin:7px 0 0;line-height:1.6}',
      '.ssm-close{width:43px;height:43px;border:1px solid #dce5ee;border-radius:13px;background:#f6f9fc;font-size:23px;color:#354a68;cursor:pointer;flex-shrink:0}',
      '.ssm-scroll{padding:20px 25px 26px;overflow:auto;overscroll-behavior:contain}',
      '.ssm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}',
      '.ssm-award{--accent:#c28d28;--tint:#fff7e5;border:1.5px solid color-mix(in srgb,var(--accent) 30%,#dde4ed);border-radius:18px;background:linear-gradient(145deg,#fff,var(--tint));padding:18px;position:relative}',
      '.ssm-award-top{display:flex;align-items:center;gap:12px}',
      '.ssm-emoji{font-size:37px;line-height:1.2}',
      '.ssm-award strong{font-size:18px;color:var(--accent);display:block;line-height:1.5}',
      '.ssm-award em{display:block;font-style:normal;color:#43556f;font-size:14px;font-weight:750}',
      '.ssm-award p{font-size:14px;line-height:1.65;color:#3f4d61;margin:11px 0 0}',
      '.ssm-unit{font-size:13px!important;color:#6e7890!important;font-weight:700}',
      '.ssm-evidence{border-radius:11px;background:#ffffffb8;border:1px solid #e7e9ee;padding:10px 12px;font-size:13px;color:#40536b;margin-top:12px;line-height:1.6}',
      '.ssm-empty{border:1px dashed #cbd7e6;background:#f8fbff;border-radius:16px;padding:30px;text-align:center;color:#62758d;line-height:1.8}',
      '.ssm-toast{position:fixed;top:90px;right:18px;z-index:100100;width:min(380px,calc(100vw - 36px));box-sizing:border-box;border:1px solid #d6e5f2;border-left:5px solid #2e8e7f;border-radius:17px;background:#fff;box-shadow:0 15px 45px rgba(17,39,72,.22);padding:15px 18px;direction:rtl}',
      '.ssm-toast-head{display:flex;align-items:start;justify-content:space-between;gap:10px}',
      '.ssm-toast b{display:block;color:#1d4761;font-size:18px}',
      '.ssm-toast p{font-size:14px;line-height:1.6;color:#40546d;margin:7px 0 11px}',
      '.ssm-toast .ssm-btn{font-size:13px;min-height:39px;padding:8px 13px}',
      '.ssm-toast .ssm-close{width:30px;height:30px;border:0;border-radius:9px;font-size:18px}',
      '@media(max-width:600px){.ssm-shelf{padding:16px}.ssm-shelf h2{font-size:19px}.ssm-grid{grid-template-columns:1fr}.ssm-overlay{padding:9px}.ssm-dialog-head{padding:17px 16px}.ssm-scroll{padding:14px}.ssm-dialog h2{font-size:22px}.ssm-toast{top:auto;bottom:24px;right:12px;width:calc(100vw - 24px)}}'
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
      dismissToast();closeGallery();
    }
    current={uid:String(profile.id),name:String(profile.displayName||'').trim(),
      attempts,initialized:true};
  }

  function shelfHTML(){
    style();
    const earned=calculate(),preview=earned.slice(0,4);
    const summary=earned.length?('You have '+earned.length+' encouragement '+(earned.length===1?'card':'cards')+'.'):
      'Every improvement counts. Your earned cards will appear here.';
    return '<section class="ssm-shelf" dir="rtl" aria-label="بطاقاتي التشجيعية">'+
      '<div class="ssm-shelf-main"><div class="ssm-shelf-heading"><span class="ssm-shelf-icon">🌟</span>'+
      '<div><h2>بطاقاتي التشجيعية</h2><small>My Encouragement Cards · '+earned.length+' مكتسبة</small></div></div>'+
      '<button type="button" class="ssm-btn" onclick="STEPUP_STUDENT_MOTIVATION.openGallery()">View My Cards</button></div>'+
      '<p>'+escapeHTML(summary)+'</p>'+
      (preview.length?'<div class="ssm-preview">'+preview.map(a=>
         '<span>'+a.meta.icon+' '+escapeHTML(a.meta.en)+' · Unit '+a.unitNumber+'</span>').join('')+
         (earned.length>4?'<span>+'+(earned.length-4)+' more</span>':'')+'</div>':'')+
      '</section>';
  }

  // Wrap only the student's Home and My Journey views; preserve all original UI.
  for(const method of ['homeHTML','html']){
    const orig=J[method];
    if(typeof orig!=='function')continue;
    J[method]=function(attempts,openUnits,profile){
      if(profile?.role!=='student'||!profile.id||!Array.isArray(attempts))
        return orig.apply(this,arguments);
      hydrate(attempts,profile);
      const result=orig.apply(this,arguments);
      return typeof result==='string'?result+shelfHTML():result;
    };
  }

  function colors(tone){
    return ({gold:['#9d6e18','#fff3d8'],pink:['#b64272','#fff0f5'],
      blue:['#2764ad','#ecf4ff'],violet:['#7954b4','#f4efff'],
      green:['#2a8153','#edfaef'],orange:['#ad6a20','#fff3e3']})[tone]||['#9d6e18','#fff3d8'];
  }
  function awardHTML(a){
    const meta=a.meta,tone=colors(meta.tone);
    return '<article class="ssm-award" style="--accent:'+tone[0]+';--tint:'+tone[1]+'">'+
      '<div class="ssm-award-top"><span class="ssm-emoji" aria-hidden="true">'+meta.icon+'</span>'+
      '<div><strong>'+escapeHTML(meta.ar)+'</strong><em>'+escapeHTML(meta.en)+'</em></div></div>'+
      '<p class="ssm-unit">'+escapeHTML(unitName(a.unitId))+'</p>'+
      '<p dir="ltr">'+escapeHTML(meta.message)+'</p>'+
      '<p>'+escapeHTML(meta.arabic)+'</p>'+
      '<div class="ssm-evidence"><b>سبب الاستحقاق:</b> '+escapeHTML(a.evidence)+'</div></article>';
  }
  function openGallery(){
    if(!current.uid||!current.initialized)return;
    style();dismissToast();closeGallery();
    const earned=calculate();
    restoreFocus=document.activeElement;
    const outer=document.createElement('div');outer.id=DIALOG_ID;
    outer.className='ssm-overlay';outer.setAttribute('role','presentation');
    outer.innerHTML='<div class="ssm-dialog" role="dialog" aria-modal="true" aria-labelledby="ssmDialogTitle" dir="rtl">'+
      '<div class="ssm-dialog-head"><div><h2 id="ssmDialogTitle">🌟 بطاقاتي التشجيعية</h2>'+
      '<p>My Encouragement Cards · '+earned.length+' '+(earned.length===1?'card':'cards')+
      ' · تقدير لجهودك وتقدمك في كل وحدة</p></div>'+
      '<button type="button" class="ssm-close" aria-label="إغلاق" data-close>×</button></div>'+
      '<div class="ssm-scroll">'+(earned.length?'<div class="ssm-grid">'+earned.map(awardHTML).join('')+'</div>':
        '<div class="ssm-empty">بطاقاتك تظهر هنا بعد تحقيق شروط التشجيع من محاولات التدريب المحفوظة.<br>استمري في التعلم والتقدم! 🌱</div>')+
      '</div></div>';
    outer.addEventListener('click',e=>{if(e.target===outer||e.target.closest('[data-close]'))closeGallery();});
    document.body.appendChild(outer);
    outer.querySelector('[data-close]')?.focus();
  }
  function closeGallery(){
    document.getElementById(DIALOG_ID)?.remove();
    try{restoreFocus?.focus?.();}catch(_){}
    restoreFocus=null;
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById(DIALOG_ID)){e.stopPropagation();closeGallery();}
  });

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
    node.innerHTML='<div class="ssm-toast-head"><b>🎉 مبروك! بطاقة تشجيعية جديدة</b>'+
      '<button type="button" class="ssm-close" aria-label="إغلاق" data-toast-close>×</button></div>'+
      '<p>استحققتِ '+escapeHTML(titles)+' في '+escapeHTML(unitName(newAwards[0].unitId))+
      '. تقدّمك يستحق التقدير!</p>'+
      '<button type="button" class="ssm-btn" data-gallery>عرض بطاقاتي</button>';
    node.querySelector('[data-toast-close]')?.addEventListener('click',dismissToast);
    node.querySelector('[data-gallery]')?.addEventListener('click',openGallery);
    document.body.appendChild(node);
    toastTimer=setTimeout(dismissToast,11000);
  }

  // Announce only changes caused by a NEW, successfully saved unit attempt.
  // The old saved attempts are displayed in the gallery without replaying popups.
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
    P.logout=function(){dismissToast();closeGallery();current={uid:'',name:'',attempts:[],initialized:false};return oldLogout.apply(this,arguments);};
  }

  window.STEPUP_STUDENT_MOTIVATION={calculate,openGallery,closeGallery,shelfHTML};
})();