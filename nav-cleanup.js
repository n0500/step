(function(){
  'use strict';

  function syncStudentNav(){
    const nav=document.querySelector('.student-nav[data-role="student"]');
    if(!nav) return;

    ['mg1AssistantTab','mg1WritingTab','mg1DictionaryTab'].forEach(id=>{
      const btn=document.getElementById(id);
      if(btn){
        btn.hidden=true;
        btn.setAttribute('aria-hidden','true');
        btn.tabIndex=-1;
      }
    });

    const inAssistantTool=!!document.querySelector('.mg1-assistant-shell,.mg1-writing-shell,.mg1-dict-shell');
    if(inAssistantTool){
      nav.querySelectorAll('.role-tab').forEach(btn=>btn.classList.remove('active'));
      nav.querySelector('[data-student-tab="assistant"]')?.classList.add('active');
    }
  }

  const observer=new MutationObserver(syncStudentNav);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',syncStudentNav,{once:true});
  syncStudentNav();
})();
