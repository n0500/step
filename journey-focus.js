(function(){
  'use strict';

  function text(el){ return (el?.textContent || '').trim(); }
  function reviewApi(unitId){
    return {u1:window.STEPUP_U1_REVIEW,u2:window.STEPUP_U2_EXAM,u3:window.STEPUP_U3_REVIEW}[unitId];
  }

  function makeRoadmap(masterCard, stops){
    const unitId=stops.find(s=>s.dataset.reviewUnit)?.dataset.reviewUnit;
    const api=reviewApi(unitId);
    if (api?.sectionProgress && stops.some(s => s.hasAttribute('data-review-section'))) {
      const wrap = document.createElement('div');
      wrap.className = 'journey-focus-roadmap';
      wrap.dataset.reviewUnit = unitId;
      wrap.style.gridTemplateColumns=`repeat(${stops.length},minmax(0,1fr))`;
      wrap.setAttribute('aria-label',`Unit ${unitId.slice(1)} skill accuracy`);
      stops.forEach(stop => {
        const key = stop.dataset.reviewSection;
        if (!key) return;
        const state = api.sectionProgress(key);
        if (!state) return;
        const stage = document.createElement('button');
        stage.type = 'button';
        stage.className = `journey-focus-stage ${state.mastered?'done':''} ${state.missed?'needs-review':''} ${stop.classList.contains('current')?'current':''}`;
        stage.dataset.reviewSection = key;
        stage.dataset.needsReview = state.missed>0?'1':'0';
        stage.setAttribute('aria-label',`${text(stop.querySelector('b'))}: ${state.reviewCorrect} of ${state.total} answers correct. ${state.missed?'Needs review':state.mastered?'All answers correct':`${state.answered} answered`}`);
        const dot = document.createElement('span'); dot.className = 'journey-focus-dot';
        dot.textContent = state.mastered ? '✓' : state.missed ? '↻' : String(wrap.children.length+1);
        const label = document.createElement('small'); label.textContent = text(stop.querySelector('b')).replace('Final Challenge','Final');
        const status = document.createElement('em'); status.className='journey-review-status';
        status.textContent = state.missed ? 'Needs review' : state.mastered ? 'Correct' : state.answered ? 'In progress' : 'Ready';
        const score = document.createElement('span'); score.className='journey-review-score';score.textContent=`${state.reviewCorrect}/${state.total}`;
        stage.append(dot,label,status,score);
        const action=stop.getAttribute('onclick');
        stage.addEventListener('click',()=>{
          try{ if(action) Function(action)(); else api.start(key); }catch(e){ console.error('StepUp review action failed',e); }
        });
        wrap.appendChild(stage);
      });
      return wrap;
    }
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
    const rawAction=current.getAttribute('onclick') || '';
    const action=(title==='STEP Practice' && rawAction==='STEPUP_U2_EXAM.stepIntro()')
      ? 'STEPUP_U2_EXAM.startTimedStep()'
      : rawAction;
    return {
      eyebrow:title==='STEP Practice'?'STEP':title.replace('Final Challenge','Final'),
      title,
      meta:durations[title] || '2–4 min',
      detail,
      action,
      button:current.dataset.needsReview==='1'?'Review missed answers':title==='Final Challenge'?'Start challenge':'Start'
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

  function simplifyUnit4(host,hero,master,uid='u4'){
    const M=window.STEPUP_MASTERY,J=window.STEPUP_JOURNEY;
    if(!M)return;
    const unit=J.data.units.find(u=>u.id===uid);
    const d=M.progressDetails(uid),earned=M.studentStatus(uid).earned;
    const labels={'core-1':'Real Talk','core-2':uid==='u5'?'Reflexive Pronouns':'Passive','core-3':uid==='u5'?'Because / So · So / Neither':'Comparisons','core-4':'Functions',reading:'Reading','core-5':'Vocabulary',listening:'Listening'};
    const groups=[['Vocab',['core-1','core-5']],['Grammar',['core-2','core-3']],['Functions',['core-4']],['Read',['reading']],['Listen',['listening']]];
    const summary=keys=>keys.reduce((a,key)=>{const s=d.sections.find(s=>s.key===key);if(s)for(const k of ['correct','total','answered','incorrect','remaining'])a[k]+=s[k];return a;},{correct:0,total:0,answered:0,incorrect:0,remaining:0});
    const shell=document.createElement('div');shell.className='journey-focus-shell';shell.dataset.unit=uid;
    shell.innerHTML=`<section class="journey-focus-head" data-review-unit="${uid}" data-ring-pct="${Math.round(d.accuracy)}" data-ring-label="mastery"><div class="journey-focus-head-copy"><span>Unit ${unit.number} • Review</span><h1>${unit.title}</h1><p>${uid==='u5'?'Complete the unit questions in one sequence. Your progress is saved.':'Review each skill and practise any answers you missed.'}</p></div><div class="journey-focus-progress-row"><strong>${d.answered}/${d.total} questions answered</strong></div><div class="u2-progress-stats"><span><b>${d.answered}/${d.total}</b><small>Questions answered</small></span><span><b>${d.correct}/${d.total}</b><small>Mastery · ${Math.round(d.accuracy)}%</small></span></div><small class="journey-review-skill-count">${groups.filter(g=>{const s=summary(g[1]);return s.total&&s.correct===s.total;}).length} of 5 skills correct · Tap a skill to review</small><div class="sxc-u2-award ${earned?'unlocked':''}"><span class="sxc-u2-award-icon">${earned?'🏆':'◇'}</span><div><b>${earned?'Certificate unlocked':'Certificate goal · 80%'}</b><small>Cumulative accuracy · ${d.accuracy}%</small></div></div></section>`;
    const roadmap=document.createElement('div');roadmap.className='journey-focus-roadmap';roadmap.dataset.reviewUnit=uid;roadmap.setAttribute('aria-label','Unit '+unit.number+' skills');
    const choose=document.createElement('section');choose.className='journey-focus-task';choose.hidden=true;
    groups.forEach(([label,keys],i)=>{
      const s=summary(keys),done=s.total>0&&s.correct===s.total;
      const b=document.createElement('button');b.type='button';b.dataset.skill=label;b.className='journey-focus-stage '+(done?'done':s.incorrect?'needs-review':'');
      b.innerHTML=`<span class="journey-focus-dot">${done?'✓':s.incorrect?'↻':i+1}</span><small>${label}</small><em class="journey-review-status">${done?'Correct':s.incorrect?'Review':s.answered?'In progress':'Ready'}</em><span class="journey-review-score">${s.correct}/${s.total}</span>`;
      b.addEventListener('click',()=>{
        if(keys.length===1)return J.go(uid,keys[0]);
        choose.hidden=false;choose.innerHTML='<h2>'+label+'</h2><div class="u4-lesson-choices"></div>';
        keys.forEach(key=>{const row=d.sections.find(s=>s.key===key),btn=document.createElement('button');btn.type='button';btn.className='journey-link-btn';btn.textContent=labels[key]+' · '+row.correct+'/'+row.total;btn.dataset.lesson=key;btn.addEventListener('click',()=>J.go(uid,key));choose.querySelector('div').append(btn);});
        choose.scrollIntoView?.({block:'nearest',behavior:'smooth'});
      });roadmap.append(b);
    });
    const step=document.createElement('button');step.type='button';step.className='journey-focus-stage'+(host.querySelector('.journey-stop.done[onclick*="startStep"]')?' done':'');step.dataset.skill='STEP';step.innerHTML='<span class="journey-focus-dot">⚡</span><small>STEP</small><em class="journey-review-status">Optional</em>';step.addEventListener('click',()=>J.startStep(uid));roadmap.append(step);
    shell.append(roadmap,choose);
    if(false&&uid==='u5'&&window.STEPUP_U5_LIVE){const live=document.createElement('button');live.type='button';live.className='journey-link-btn';live.textContent='FMF Live Lesson · Learn + Quick Check + Exit Ticket';live.addEventListener('click',()=>window.STEPUP_U5_LIVE.openStudent());shell.append(live);}
    if(false&&uid==='u5'){
      const guide=document.createElement('details');guide.className='journey-focus-task';
      guide.innerHTML=`<summary>Grammar · Quick Review</summary><div dir="ltr" style="line-height:1.8;text-align:left">
      <p><b>Reflexive pronouns:</b> I → myself; you → yourself/yourselves; he → himself; she → herself; it → itself; we → ourselves; they → themselves.<br>I hurt myself. We did it by ourselves (without help).</p>
      <p><b>Because = reason:</b> She stayed home because she was ill.<br><b>So = result:</b> She was ill, so she stayed home.</p>
      <p><b>Positive agreement:</b> So + auxiliary + subject. “I am careful.” → “So am I.” “I wear a helmet.” → “So do I.” “I fell.” → “So did I.”</p>
      <p><b>Negative agreement:</b> Neither + auxiliary + subject. “I don't drive.” → “Neither do I.” “I haven't fallen.” → “Neither have I.” Do not add not after neither.</p>
      <p>“Me too” is a common conversational reply to a positive statement. “So am I / So do I” uses the auxiliary that matches the first statement.</p>
      <button type="button" class="journey-link-btn" onclick="STEPUP_JOURNEY.startStep('u5','grammar')">Practise all three grammar topics</button></div>`;
      shell.append(guide);
    }
    const pending=window.STEPUP_U56_PRACTICE?.pending(uid);
    const card=taskCard(uid==='u5'
       ? {title:'All Unit 5 Questions in One Flow',meta:'Continuous Review · '+d.total+' questions',
          detail:'Questions move automatically from vocabulary to grammar, functions, reading and listening. One final result at the end; saved attempts and certificate rules stay unchanged.',
          action:"STEPUP_U56_PRACTICE.begin('u5')",button:pending?'Resume Continuous Questions':'Start All Questions'}
       : {title:d.incorrect?'Review your mistakes':d.remaining?'Continue learning':'All answers correct',meta:'Unit Review · '+d.total+' questions',detail:d.incorrect?d.incorrect+' answers to review. Your saved correct answers still count.':d.remaining?d.remaining+' questions left. Tap any skill above to continue.':'Revisit any skill or practise the whole unit.',action:"STEPUP_U56_PRACTICE.begin('"+uid+"')",button:pending?'Resume Review':'Practice Again'});
    const actions=document.createElement('div');actions.className='u4-lesson-choices';
    if(d.incorrect||d.remaining){const b=document.createElement('button');b.type='button';b.className='journey-link-btn';b.textContent=d.remaining?'Continue Learning':'Review Mistakes';b.dataset.u4Action='review';b.addEventListener('click',()=>M.reviewUnit(uid));actions.append(b);}
    if(earned){const b=document.createElement('button');b.type='button';b.className='journey-link-btn';b.textContent='View Certificate';b.dataset.u4Action='certificate';b.addEventListener('click',()=>M.viewCertificate(uid));actions.append(b);}
    card.append(actions);const back=document.createElement('button');back.type='button';back.className='journey-focus-back-secondary';back.textContent='Back to units';back.addEventListener('click',()=>window.PROVE?.setStudentTab?.('journey'));card.append(back);if(uid==='u5')shell.insertBefore(card,roadmap);else shell.append(card);
 
    host.querySelector('.journey-breadcrumb')?.remove();hero.replaceWith(shell);master.remove();
    host.querySelectorAll('.journey-stops,.journey-celebrate,.sum-card-slot,.u56-full-entry').forEach(el=>el.remove());
  }

  function simplifyUnit(){
    const host=document.querySelector('.student-view');
    const hero=host?.querySelector('.journey-unit-hero');
    const master=host?.querySelector('.journey-master-card');
    if(!host||!hero||!master||host.querySelector('.journey-focus-shell')) return;

    const unitTitle=text(hero.querySelector('h1'));
    const compactUnit=window.STEPUP_JOURNEY?.data?.units?.find(u=>['u4','u5'].includes(u.id)&&u.title===unitTitle);
    if(compactUnit){
      simplifyUnit4(host,hero,master,compactUnit.id);return;
    }

    const unitId=hero.dataset.reviewUnit;
    const api=reviewApi(unitId);
    const review=!!api?.sectionProgress;
    const stops=review ? [...host.querySelectorAll('.journey-stop[data-review-section]')] : [...host.querySelectorAll('.journey-stops .journey-stop')];
    const complete=!review && !!host.querySelector('.journey-celebrate');
    const task=(review?null:currentMasterTask(master)) || currentJourneyStop(stops);

    const kicker=text(hero.querySelector('.journey-kicker'));
    const title=text(hero.querySelector('h1'));
    const objective=text(hero.querySelector('p'));
    const progress=hero.querySelector('.journey-mini-progress i')?.style.width || '0%';
    const g=review?api.getProgress():null;
    const progressText=review ? `${g.answered}/${g.total} questions answered` : text(hero.querySelector('small')) || '0/5 stops complete';

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

    if (review) {
      const head = shell.querySelector('.journey-focus-head');
      head.dataset.reviewUnit = unitId;
      head.dataset.ringPct = hero.dataset.ringPct;
      head.dataset.ringLabel = hero.dataset.ringLabel;
      hero.querySelectorAll('.u1-review-stats,.u2-progress-stats,.u3-review-stats,.journey-review-skill-count,.sxc-u2-award,.u3-cert-goal').forEach(el => head.appendChild(el));
    }

    shell.appendChild(makeRoadmap(master,stops));
    // Put the next useful action where the student reads her result.
    // When the entire approved bank is correct, Practice Again should be the
    // single primary CTA; the old card buried it below the 150px spacer.
    const fullyMastered=review && g && Number(g.total)>0 &&
      Number(g.answered)===Number(g.total) && Number(g.reviewCorrect)===Number(g.total);
    const replayReady=review && !!window.STEPUP_SMART?.canPracticeAgain?.(unitId);
    if(replayReady){
      shell.classList.add('journey-focus-replay-ready');
      const card=taskCard({
        title:fullyMastered?'All answers correct':'Review the whole unit',meta:'Full Unit Review · '+g.total+' questions',
        detail:'Review all '+g.total+' original questions. Resume where you stopped; your result appears after the last skill. Your certificate stays safe.',
        action:"STEPUP_SMART.beginFull('"+unitId+"')",button:'Practice Again'
      });
      card.classList.add('complete');
      const back=document.createElement('button');
      back.type='button';
      back.className='journey-focus-back-secondary';
      back.textContent='Back to units';
      back.addEventListener('click',()=>window.PROVE?.setStudentTab?.('journey'));
      card.appendChild(back);
      shell.appendChild(card);
    } else {
      const primaryTask=unitId==='u2' && typeof api?.continueReview==='function'
        ? {...(task || {title:'Review complete',meta:'All skills answered',detail:'See your final result and review your mistakes.'}),
          action:'STEPUP_U2_EXAM.continueReview()',button:Number(g?.answered)===Number(g?.total)?'See My Learning Level':'Continue Review'}
        : task;
      shell.appendChild(complete?completeCard():taskCard(primaryTask||(review ? {title:'All answers correct',meta:'Review complete',detail:'You can revisit any skill above. Your saved answers and certificates are kept.',action:"PROVE.setStudentTab('journey')",button:'Back to units'} : {eyebrow:'Next',title:'Continue your journey',meta:'2–4 min',detail:'One small step at a time.',action:"PROVE.setStudentTab('journey')",button:'Continue'})));
    }

    const breadcrumb=host.querySelector('.journey-breadcrumb');
    if(breadcrumb) breadcrumb.remove();
    hero.replaceWith(shell);
    // The compact review header and skill buttons already show this result.
    if(review) host.querySelectorAll('.sum-card-slot').forEach(el=>el.remove());
    if(replayReady){
      // Remove the duplicate standalone review action, including the large
      // visual gap it created beneath the finished result card.
      host.querySelector('.smart-unit-panel[data-smart-banner="'+unitId+'"]')?.remove();
    }
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
