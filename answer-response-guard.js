/* STEP UP • Responsive answer selection on unreliable mobile networks.
   Choose immediately highlights the selected option. One in-flight save per
   session/question; never fabricate saved results, skip questions or issue
   duplicate writes on impatient repeated taps. */
(function(){
  'use strict';
  const active = new WeakMap();
  const STYLE='stepupAnswerResponseCSS';
  function css(){
    if(document.getElementById(STYLE))return;
    const e=document.createElement('style');e.id=STYLE;
    e.textContent=[
      '.journey-options button.sar-picked,.journey-options button.sar-picked:disabled{background:#eaf5ff!important;border:2px solid #2274be!important;color:#164f80!important;opacity:1!important}',
      '.journey-options button.sar-busy:disabled{cursor:progress!important;opacity:.75}',
      '.sar-notice{font-size:14px;line-height:1.7;color:#244664;background:#edf5ff;border:1px solid #b8d4f2;border-radius:12px;padding:11px 13px;margin:11px 0;font-weight:700}',
      '.sar-notice.sar-slow{background:#fff9eb;border-color:#edcf87;color:#765419}',
      '.sar-notice.sar-error{background:#fff0ee;border-color:#f0b6b3;color:#8d2727}',
      '.sar-retry{background:#fff;border:1px solid #bc6969;color:#8d2727;border-radius:9px;padding:8px 12px;margin-top:8px;display:block;font-size:14px;font-weight:750;cursor:pointer}',
      '@media(max-width:650px){.journey-options button{min-height:52px;touch-action:manipulation}}'
    ].join('\n');
    document.head.appendChild(e);
  }
  function opts(){
    return document.querySelector('.student-view .journey-options');
  }
  function show(text,kind){
    const h=opts();if(!h)return null;
    let n=h.parentElement.querySelector('.sar-notice');
    if(!n){n=document.createElement('div');n.className='sar-notice';h.insertAdjacentElement('afterend',n);}
    n.className='sar-notice'+(kind?' sar-'+kind:'');
    n.textContent=text;
    n.setAttribute('role','status');n.setAttribute('aria-live','polite');
    return n;
  }
  function selection(selected){
    const h=opts();if(!h)return;
    [...h.querySelectorAll('button')].forEach((b,i)=>{
      b.disabled=true;
      b.classList.toggle('sar-picked',i===selected);
      b.classList.toggle('sar-busy',i!==selected);
      b.setAttribute('aria-pressed',i===selected?'true':'false');
    });
  }
  function showError(error,selected,isActive){
    const e=show('This answer was not saved. Check your connection and try again.','error');
    if(!e)return;
    const btn=document.createElement('button');btn.type='button';btn.className='sar-retry';
    btn.textContent='Retry saving my answer';
    btn.addEventListener('click',()=>{
      if(!isActive())return;
      e.remove();
      const x=opts();if(!x)return;
      const choices=[...x.querySelectorAll('button')];
      choices.forEach(button=>button.disabled=false);
      choices[selected]?.click();
    });
    e.appendChild(btn);
  }
  function submit({session,questionId,position,selected,persist,isActive,onStart,onSlow,onSaved,onError}){
    if(!session||typeof session!=='object')return;
    // A save can finish after the student has opened another page. Only the
    // original question may receive its feedback; do not replace the new view.
    const questionHost=opts();
    if(!questionHost||!isActive())return;
    const isCurrent=()=>questionHost.isConnected && opts()===questionHost && isActive();
    css();
    const prev=active.get(session);
    if(prev && prev.position===position && prev.questionId===questionId){
      if(prev.running){
        show('Your selected answer is still being saved. Keep this page open; feedback will appear when saving finishes.','slow');
        return;
      }
      active.delete(session);
    }
    const job={questionId,position,selected,running:true};
    active.set(session,job);
    selection(selected);
    show('Saving your answer… Please keep this question open.');
    onStart?.();
    job.timer=setTimeout(()=>{
      if(!job.running||active.get(session)!==job||!isCurrent())return;
      show('Connection is slow. Your choice is selected; we are still saving it securely. Please check your connection.','slow');
      onSlow?.();
    },4200);
    Promise.resolve().then(persist).then(record=>{
      clearTimeout(job.timer);job.running=false;
      if(active.get(session)===job)active.delete(session);
      if(isCurrent())onSaved(record);
    },error=>{
      clearTimeout(job.timer);job.running=false;
      if(active.get(session)===job)active.delete(session);
      if(!isCurrent())return;
      try{onError(error);}finally{showError(error,selected,isActive);}
    });
  }
  window.STEPUP_ANSWER_RESPONSE={submit,css};
})();
