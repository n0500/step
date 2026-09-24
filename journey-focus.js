(function(){
  'use strict';

  function text(el){ return (el?.textContent || '').trim(); }

  function makeRoadmap(masterCard, stops){
    const masterCount=text(masterCard.querySelector('.journey-stage-title > b')) || '0/4';
    const [doneCount,totalCount]=masterCount.split('/').map(Number);
    const masterDone=Number.isFinite(doneCount)&&Number.isFinite(totalCount)&&totalCount>0&&doneCount>=totalCount;
    const masterCurrent=!masterDone && !!masterCard.querySelector('.journey-subtask:not(.done):not(.locked)');

    const stages=[
      {label:'Master',done:masterDone,current:masterCurrent},
      ...stops.map(stop=>({
        label:text(stop.querySelector('.journey-stop-copy b')).replace('STEP Practice','STEP').replace('Final Challenge','Final'),
        done:stop.classList.contains('done'),
        current:stop.classList.contains('current')
      }))
    ];

    const wrap=document.createElement('div');
    wrap.className='journey-focus-roadmap';
    wrap.setAttribute('aria-label','Unit journey progress');
    wrap.innerHTML=stages.map((s,i)=>`
      <div class="journey-focus-stage ${s.done?'done':''} ${s.current?'current':''}">
        <span class="journey-focus-dot">${s.done?'✓':i+1}</span>
        <small>${s.label}</small>
      </div>`).join('');
    return wrap;
  }

  function currentMasterTask(masterCard){
    const tasks=[...masterCard.querySelectorAll('.journey-subtask')];
    const current=tasks.find(b=>!b.classList.contains('done')&&!b.classList.contains('locked'));
    if(!current) return null;
    const idx=tasks.indexOf(current)+1;
    return {
      eyebrow:'Master',
      title:text(current.querySelector('b')) || 'Master the Unit',
      meta:`Skill ${idx} of ${tasks.length} • 2–3 min`,
      detail:'Quick adaptive check',
      action:current.getAttribute('onclick') || '',
      button:'Start'
    };
  }

  function currentJourneyStop(stops){
    const current=stops.find(s=>s.classList.contains('current')) || stops.find(s=>!s.classList.contains('done')&&!s.classList.contains('locked'));
    if(!current) return null;
    const title=text(current.querySelector('.journey-stop-copy b')) || 'Continue';
    const detail=text(current.querySelector('.journey-stop-copy small')) || 'Continue your journey.';
    const durations={Read:'3–4 min',Listen:'3–4 min','STEP Practice':'4–5 min','Final Challenge':'6–8 min'};
    return {
      eyebrow:title==='STEP Practice'?'STEP':title.replace('Final Challenge','Final'),
      title,
      meta:durations[title] || '2–4 min',
      detail,
      action:current.getAttribute('onclick') || '',
      button:title==='Final Challenge'?'Start challenge':'Start'
    };
  }

  function taskCard(task){
    const section=document.createElement('section');
    section.className='journey-focus-task';
    section.innerHTML=`
      <div class="journey-focus-task-top">
        <span class="journey-focus-eyebrow">Now</span>
        <span class="journey-focus-time">${task.meta}</span>
      </div>
      <h2>${task.title}</h2>
      <p>${task.detail}</p>
      <button class="journey-focus-start" type="button">${task.button}<span aria-hidden="true">→</span></button>`;
    const btn=section.querySelector('button');
    btn.addEventListener('click',()=>{
      if(!task.action) return;
      try{ Function(task.action)(); }catch(e){ console.error('StepUp journey action failed',e); }
    });
    return section;
  }

  function completeCard(){
    const section=document.createElement('section');
    section.className='journey-focus-task complete';
    section.innerHTML=`
      <div class="journey-focus-task-top"><span class="journey-focus-eyebrow">Complete</span></div>
      <h2>Unit complete</h2>
      <p>You finished all five stops. Revisit the unit anytime for a quick refresh.</p>
      <button class="journey-focus-start" type="button">Back to units<span aria-hidden="true">→</span></button>`;
    section.querySelector('button').addEventListener('click',()=>window.PROVE?.setStudentTab?.('journey'));
    return section;
  }

  function simplifyUnit(){
    const host=document.querySelector('.student-view');
    const hero=host?.querySelector('.journey-unit-hero');
    const master=host?.querySelector('.journey-master-card');
    if(!host||!hero||!master||host.querySelector('.journey-focus-shell')) return;

    const stops=[...host.querySelectorAll('.journey-stops .journey-stop')];
    const complete=!!host.querySelector('.journey-celebrate');
    const task=currentMasterTask(master) || currentJourneyStop(stops);

    const kicker=text(hero.querySelector('.journey-kicker'));
    const title=text(hero.querySelector('h1'));
    const objective=text(hero.querySelector('p'));
    const progress=hero.querySelector('.journey-mini-progress i')?.style.width || '0%';
    const progressText=text(hero.querySelector('small')) || '0/5 stops complete';

    const shell=document.createElement('div');
    shell.className='journey-focus-shell';
    shell.innerHTML=`
      <section class="journey-focus-head">
        <div class="journey-focus-head-copy">
          <span>${kicker}</span>
          <h1>${title}</h1>
          <p>${objective}</p>
        </div>
        <div class="journey-focus-progress-row">
          <strong>${progressText}</strong>
          <div class="journey-focus-progress"><i style="width:${progress}"></i></div>
        </div>
      </section>`;

    shell.appendChild(makeRoadmap(master,stops));
    shell.appendChild(complete?completeCard():taskCard(task||{eyebrow:'Next',title:'Continue your journey',meta:'2–4 min',detail:'One small step at a time.',action:"PROVE.setStudentTab('journey')",button:'Continue'}));

    const breadcrumb=host.querySelector('.journey-breadcrumb');
    if(breadcrumb) breadcrumb.remove();
    hero.replaceWith(shell);
    master.remove();
    host.querySelector('.journey-stops')?.remove();
    host.querySelector('.journey-celebrate')?.remove();
  }

  let timer=null;
  const observer=new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(simplifyUnit,50);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',simplifyUnit);
  window.addEventListener('load',simplifyUnit);
  setTimeout(simplifyUnit,400);
})();
