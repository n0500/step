/* STEP UP | Units 5 & 6: genuine full-bank Practice Again.
 * Uses the existing 28-question certificate banks (including original review).
 * Never replaces historic attempts, changes teacher locks, or counts STEP extras.
 */
(function(){
  'use strict';
  var allowed={u5:true,u6:true}, chosen=null, saving=false, live=null;
  var prefix='stepup-u56-full-review-v1-';
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  function uid(){try{return window.firebase.auth().currentUser?.uid||null;}catch(_){return null;}}
  function bank(unit){if(!allowed[unit])return [];var m=window.STEPUP_MASTERY;return m?.validBank(unit)?m.bank(unit):[];}
  function key(unit){var id=uid();return id?prefix+id+'-'+unit:null;}
  function load(unit){try{var k=key(unit);return k?JSON.parse(localStorage.getItem(k)||'null'):null;}catch(_){return null;}}
  function store(unit,r){try{var k=key(unit);if(k)localStorage.setItem(k,JSON.stringify(r));return !!k;}catch(_){return false;}}
  function clear(unit){try{var k=key(unit);if(k)localStorage.removeItem(k);}catch(_){}}
  function listKeys(b){return b.map(function(q){return q.section+'|'+q.id;});}
  function valid(r,b){return !!(r&&r.uid===uid()&&r.unit&&r.keys&&r.keys.length===b.length&&r.keys.every(function(x,i){return x===b[i].section+'|'+b[i].id;})&&r.answers&&typeof r.answers==='object');}
  function host(){return document.querySelector('.student-view');}
  function currentRun(unit){var b=bank(unit),r=load(unit);return valid(r,b)?r:null;}
  function hasPending(unit){var r=currentRun(unit);return !!(r&&r.keys.some(function(k){return !r.answers[k];}));}
  function banner(){
    var h=host(),hero=h&&h.querySelector('.journey-unit-hero'),heading=hero&&hero.querySelector('h1');
    if(!hero||!heading||hero.getAttribute('data-u56-full-button')==='1')return;
    var u=window.STEPUP_JOURNEY?.data?.units?.find(function(x){return x.title===heading.textContent.trim();});
    if(!u||!allowed[u.id])return;
    var status=window.STEPUP_MASTERY?.studentStatus(u.id);
    if(!status?.earned&&!hasPending(u.id))return;
    hero.setAttribute('data-u56-full-button','1');
    var id=u.id,desc=hasPending(id)?'Resume your saved full review.':'Review all 28 questions, including the original revision questions.';
    hero.insertAdjacentHTML('afterend','<section class="u56-full-entry" style="margin:14px 0;padding:15px;border:1px solid #d0e1eb;border-radius:16px;background:#f5faff"><strong>Practice Again • Unit '+esc(u.number)+'</strong><p style="margin:8px 0">'+esc(desc)+'</p><button type="button" style="min-height:46px;padding:11px 17px;border:0;border-radius:12px;background:#245b8e;color:#fff;font-weight:800" onclick="STEPUP_U56_PRACTICE.begin(\''+id+'\')">'+(hasPending(id)?'Resume Review':'Practice Again')+'</button></section>');
  }
  function begin(unit){
    if(!allowed[unit])return;
    var b=bank(unit),id=uid(),h=host();
    if(!h||!b.length||!id){if(h)h.innerHTML='<section class="journey-content-card">Sign in to review this unit.</section>';return;}
    var r=currentRun(unit);
    if(!r||!r.keys.some(function(k){return !r.answers[k];})){
      r={uid:id,unit:unit,runId:Date.now()+'-'+Math.random().toString(36).slice(2),startedAt:new Date().toISOString(),keys:listKeys(b),answers:{}};
      if(!store(unit,r)){h.innerHTML='<section class="journey-content-card">Unable to save local progress. Please enable local storage and try again.</section>';return;}
    }
    live={uid:id,unit:unit,runId:r.runId};chosen=null;render(unit);
  }
  function active(unit){var r=currentRun(unit);return !!(live&&r&&live.uid===uid()&&live.unit===unit&&live.runId===r.runId);}
  function position(r){return r.keys.findIndex(function(k){return !r.answers[k];});}
  function render(unit){
    var h=host(),r=currentRun(unit),b=bank(unit);
    if(!h||!r||!active(unit))return;
    var i=position(r);
    if(i<0){finish(unit);return;}
    var q=b[i],got=Object.keys(r.answers).length,group=b.filter(function(x){return x.section===q.section;});
    var prior=b.slice(0,i).filter(function(x){return x.section===q.section;}).length;
    chosen=null;
    var context='';
    if(q.context_excerpt&&window.STEPUP_U56_CONTEXT?.render){
      context=window.STEPUP_U56_CONTEXT.render(q);
    }else if(q.section==='reading'&&q.context){
      context='<details><summary>📖 Show the original Reading text</summary><div style="white-space:pre-line;max-height:340px;overflow:auto;padding:12px" dir="ltr">'+esc(q.context)+'</div></details>';
    }else if(q.section==='listening'){
      context='<div><p>Listen to the original textbook Conversation.</p><audio controls playsinline preload="metadata" style="width:100%" src="assets/audio/mega-goal-1/unit-0'+unit.slice(1)+'/conversation.mp3"></audio></div>';
    }
    h.innerHTML='<section class="journey-content-card u56-full-quiz" style="max-width:850px;margin:auto">'+
      '<div class="journey-breadcrumb"><button type="button" onclick="STEPUP_U56_PRACTICE.exit(\''+unit+'\')">← Unit '+unit.slice(1)+'</button> <b>Practice Again</b></div>'+
      '<span class="journey-kicker">Unit '+unit.slice(1)+' • Full original question bank</span>'+
      '<h2>'+esc(q.sectionTitle||q.section)+'</h2>'+
      '<p>Question '+(i+1)+' of '+b.length+' · '+got+' answered · '+(prior+1)+'/'+group.length+' in this skill</p>'+
      '<div style="height:8px;background:#dce9f0;border-radius:8px;overflow:hidden"><div style="height:100%;background:#287c8a;width:'+(100*got/b.length)+'%"></div></div>'+
      context+'<h3 dir="ltr" style="font-size:clamp(19px,3vw,25px);margin:17px 0">'+esc(q.prompt)+'</h3>'+
      '<div class="u56-review-options" style="display:grid;gap:9px">'+q.choices.map(function(x,k){
        return '<button type="button" data-option="'+k+'" onclick="STEPUP_U56_PRACTICE.select('+k+')" style="min-height:52px;padding:12px 15px;text-align:left;border-radius:11px;border:2px solid #c6dae8;background:#fff;color:#173954;font-size:17px;font-weight:600"><b>'+String.fromCharCode(65+k)+'.</b> '+esc(x)+'</button>';
      }).join('')+'</div><p style="font-size:13px">Choose an answer, then confirm.</p>'+
      '<button class="journey-main-btn" type="button" data-confirm="1" disabled onclick="STEPUP_U56_PRACTICE.confirm()">Confirm Answer</button></section>';
  }
  function select(i){
    if(!live||saving)return;
    var r=currentRun(live.unit),b=bank(live.unit),pos=r&&position(r);
    if(!r||pos<0||!Number.isInteger(i)||i<0||i>=b[pos].choices.length)return;
    chosen=i;var h=host();
    if(!h)return;
    h.querySelectorAll('.u56-review-options button').forEach(function(el,k){
      el.style.background=k===i?'#e5f4fb':'#fff';el.style.borderColor=k===i?'#267a9d':'#c6dae8';
      el.setAttribute('aria-pressed',k===i?'true':'false');
    });
    var submit=h.querySelector('[data-confirm]');if(submit)submit.disabled=false;
  }
  function confirm(){
    if(!live||chosen===null||saving)return;
    var unit=live.unit,r=currentRun(unit),b=bank(unit),i=r&&position(r);
    if(!r||i<0||!active(unit))return;
    var q=b[i],choice=chosen,k=r.keys[i];if(r.answers[k])return;
    r.answers[k]={section:q.section,question_id:q.id,skill:q.sectionTitle||q.section,stem:q.prompt,
      correct:choice===q.answer,selected:choice,selectedText:q.choices[choice],
      correctText:q.choices[q.answer],explanation:choice===q.answer?'': 'Review the clue and the correct choice.'};
    if(!store(unit,r))return;
    chosen=null;
    var h=host(),done=position(r)<0,next=done?null:b[position(r)];
    var groupDone=!done&&next.section!==q.section;
    var skillAnswers=b.filter(function(x){return x.section===q.section;}).map(function(x){return r.answers[x.section+'|'+x.id];}).filter(Boolean);
    var groupScore=skillAnswers.filter(function(a){return a.correct;}).length;
    if(h)h.innerHTML='<section class="journey-content-card" style="max-width:800px;margin:auto"><span class="journey-kicker">'+esc(q.sectionTitle||'Skill Review')+'</span>'+
      '<h2>'+(choice===q.answer?'✓ Correct':'Review this answer')+'</h2>'+
      (choice!==q.answer?'<p><b>Correct answer:</b> '+esc(q.choices[q.answer])+'</p>':'')+
      (groupDone||done?'<p><strong>Skill result: '+groupScore+'/'+skillAnswers.length+'</strong></p>':'')+
      '<button class="journey-main-btn" type="button" onclick="STEPUP_U56_PRACTICE.next()">'+(done?'See full review result':groupDone?'Continue to '+esc(next.sectionTitle||next.section):'Next Question')+'</button></section>';
  }
  function next(){if(!live||saving)return;render(live.unit);}
  async function finish(unit){
    if(saving||!active(unit))return;
    var r=currentRun(unit),b=bank(unit),h=host();
    if(!r||!h||position(r)!==-1)return;
    var answers=b.map(function(q){return r.answers[q.section+'|'+q.id];});
    var score=answers.filter(function(a){return a.correct;}).length,total=b.length;
    var data={recordKind:'smart-full-review',trainingId:'smart-full-review-'+unit,
      trainingTitle:'Unit '+unit.slice(1)+' Complete Review',trainingType:'review',studyMethod:'full-original-bank',
      unitId:unit,unitNumber:Number(unit.slice(1)),score:score,total:total,percentage:Math.round(score*100/total),
      attemptScore:score,attemptTotal:total,attemptPercentage:Math.round(score*100/total),
      answers:answers,startedAt:r.startedAt,submittedAt:new Date().toISOString(),reviewRunId:r.runId};
    saving=true;h.innerHTML='<section class="journey-content-card"><h2>Saving your complete review…</h2></section>';
    try{
      if(typeof window.PROVE?.recordJourneyAttempt!=='function')throw Error('Save unavailable');
      var result=await window.PROVE.recordJourneyAttempt(data);
      if(!result?.studentId||result.studentId!==uid())throw Error('Save not confirmed');
      if(currentRun(unit)?.runId!==r.runId)return;
      clear(unit);live=null;
      var eligible=window.STEPUP_MASTERY?.fullReviewResult(unit,result);
      var mastered=!!(eligible&&eligible.qualifies);
      var pieces=[],groups=[...new Set(b.map(function(q){return q.section;}))];
      groups.forEach(function(section){
        var a=answers.filter(function(x){return x.section===section;});
        var label=b.find(function(x){return x.section===section;})?.sectionTitle||section;
        pieces.push('<p>'+esc(label)+': <b>'+a.filter(function(x){return x.correct;}).length+'/'+a.length+'</b></p>');
      });
      h.innerHTML='<section class="journey-content-card" style="max-width:800px;margin:auto">'+
        '<h2>Complete Review • Unit '+unit.slice(1)+'</h2><div class="journey-result-score">'+score+'/'+total+'</div>'+
        '<p><strong>'+Math.round(score*100/total)+'%</strong> · Result saved successfully.</p>'+
        (mastered?'<p>✓ This attempt meets the 80% mastery requirement.</p>':'<p>Less than 80% in this attempt. Review your mistakes and try again.</p>')+
        '<div style="margin:15px 0">'+pieces.join('')+'</div>'+
        '<button class="journey-main-btn" type="button" onclick="STEPUP_U56_PRACTICE.exit(\''+unit+'\')">Back to unit</button> '+
        '<button type="button" onclick="STEPUP_U56_PRACTICE.begin(\''+unit+'\')">Practice Again</button></section>';
    }catch(e){
      h.innerHTML='<section class="journey-content-card" role="alert"><h2>Result not saved</h2><p>Your answers are kept on this device. Check the connection and retry.</p>'+
        '<button class="journey-main-btn" onclick="STEPUP_U56_PRACTICE.retry(\''+unit+'\')">Retry Saving</button></section>';
    }finally{saving=false;}
  }
  function retry(unit){if(!allowed[unit])return;live={uid:uid(),unit:unit,runId:currentRun(unit)?.runId};finish(unit);}
  function exit(unit){live=null;chosen=null;if(allowed[unit])window.STEPUP_JOURNEY?.openUnit(unit);}
  window.STEPUP_U56_PRACTICE={begin:begin,render:render,select:select,confirm:confirm,next:next,finish:finish,retry:retry,exit:exit,
    isActive:active,pending:hasPending,bank:bank};
  var oldOpen=window.STEPUP_JOURNEY?.openUnit;
  if(typeof oldOpen==='function'){
    window.STEPUP_JOURNEY.openUnit=function(){var res=oldOpen.apply(this,arguments);banner();return res;};
  }
  if(typeof MutationObserver!=='undefined'&&document.getElementById('app')){
    new MutationObserver(banner).observe(document.getElementById('app'),{childList:true,subtree:true});
  }
  banner();
})();