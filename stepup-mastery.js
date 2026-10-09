/* STEP UP • certificate policy 2026-10-09
   Protect every legacy-earned certificate using immutable pre-migration evidence.
   Restore cumulative >=80% mastery for all six units.
   Previously earned certificates remain valid; STEP seals stay independent. */
(function(){
  'use strict';
  const PASS=80;
  // Transition window protects certificates earned on the previous version
  // immediately before deployment across CDN/browser caches on 9 October.
  const LEGACY_CUTOFF='2026-10-09T08:45:00.000Z';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modules={u1:()=>window.STEPUP_U1_REVIEW,u2:()=>window.STEPUP_U2_EXAM,u3:()=>window.STEPUP_U3_REVIEW,u4:()=>window.STEPUP_JOURNEY,u5:()=>window.STEPUP_JOURNEY,u6:()=>window.STEPUP_JOURNEY};
  const unitData=id=>(window.STEPUP_JOURNEY?.data?.units||[]).find(u=>u.id===id);
  const api=id=>modules[id]?.()||null;
  const trainingId=id=>'journey-'+id+'-mastery-check';
  function futureBank(id){
    const u=unitData(id),all=window.STEPUP_JOURNEY?.data?.questions||[];
    if(!u)return [];
    const missions=u.missions||[],result=[];
    for(const q of all){
      if(q.unit_id!=='MG1_U'+u.number || q.review_status==='مستبعد')continue;
      const i=missions.findIndex(m=>m.source===q.mission);
      if(i<0)continue;
      const mission=missions[i];
      if(q.stage!==(mission.type==='final'?'Final Challenge':'Mastery'))continue;
      const coreNumber=missions.slice(0,i+1).filter(m=>m.type==='core').length;
      const section=mission.type==='core'?'core-'+coreNumber:mission.type;
      const answer=['option_a_id','option_b_id','option_c_id','option_d_id'].findIndex(k=>q[k]===q.correct_option_id);
      result.push({section,sectionTitle:mission.title||section,id:q.question_id,prompt:q.prompt,
        choices:[q.option_a_text,q.option_b_text,q.option_c_text,q.option_d_text],answer,
        context:section==='reading'?String(u.reading||''):'',
        audio:section==='listening'?String(u.listening||''):''});
    }
    return result;
  }
  const requirements=id=>{
    try{
      if(['u4','u5','u6'].includes(id))return futureBank(id).map(q=>({section:q.section,questionId:q.id,trainingId:'journey-'+id+'-'+q.section}));
      const r=api(id)?.getCertificateRequirements?.();
      return Array.isArray(r)&&r.length?r:null;
    }catch(_){return null;}
  };
  function bank(id){
    try{if(['u4','u5','u6'].includes(id))return futureBank(id);const b=api(id)?.getMasteryBank?.();return Array.isArray(b)?b:null;}catch(_){return null;}
  }
  function validBank(id){
    const r=requirements(id),b=bank(id);
    if(!r||!b||b.length!==r.length||!b.length)return false;
    const a=new Set();
    return b.every(q=>{
      const key=String(q.section)+'|'+String(q.id);
      if(a.has(key)||!r.some(x=>String(x.section)+'|'+String(x.questionId)===key))return false;
      a.add(key);
      return typeof q.prompt==='string'&&q.prompt.length>0&&Array.isArray(q.choices)&&
        q.choices.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length;
    });
  }

  function isLegacy(a){
    if(!a||!a.submittedAt)return false;
    const date=Date.parse(a.submittedAt);
    return Number.isFinite(date)&&date<=Date.parse(LEGACY_CUTOFF);
  }
  // Rebuild the historic certificate condition using only results already
  // saved by migration time, NEVER including answers from later practice.
  function futureLegacyStatus(id,records){
    const u=unitData(id);
    if(!u)return {earned:false,answered:0,total:0,correct:0,accuracy:0};
    const count=(u.missions||[]).filter(m=>m.type==='core').length;
    const names=[...Array.from({length:count},(_,i)=>'core-'+(i+1)),'reading','listening','step','final'];
    const cutoff=(records||[]).filter(a=>isLegacy(a)&&a.recordKind!=='question');
    const results=names.map(name=>{
      const matches=cutoff.filter(a=>a.trainingId==='journey-'+id+'-'+name);
      return matches.length?Math.max(...matches.map(a=>Number(a.percentage||0))):-1;
    });
    const pass=results.every((pct,i)=>pct>= (names[i]==='step'?0:names[i]==='final'?83:67));
    const scores=results.filter((x,i)=>x>=0 && names[i]!=='step'&& names[i]!=='final');
    return {earned:pass,answered:results.filter(x=>x>=0).length,total:names.length,
      correct:results.filter((x,i)=>x>=(names[i]==='step'?0:names[i]==='final'?83:67)).length,
      accuracy:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0};
  }
  function legacyStatus(id,records){
    if(['u4','u5','u6'].includes(id))return futureLegacyStatus(id,records);
    const req=requirements(id);
    if(!req)return {earned:false,answered:0,total:0,correct:0,accuracy:0};
    const questionIndex=new Map();
    const stages=new Map();
    req.forEach(q=>{
      const k=String(q.section)+'|'+String(q.questionId);
      questionIndex.set(k,{answered:false,correct:false});
      stages.set(String(q.trainingId),String(q.section));
    });
    for(const a of records||[]){
      if(!isLegacy(a))continue;
      if(a.recordKind==='question'){
        if(a.examUnit!==id)continue;
        const q=questionIndex.get(String(a.examSection)+'|'+String(a.questionId));
        if(!q)continue;
        q.answered=true;
        if(a.correct===true||a.bestCorrect===true)q.correct=true;
      }else if(Array.isArray(a.answers)){
        const section=stages.get(String(a.trainingId));
        if(!section)continue;
        a.answers.forEach(answer=>{
          const key=section+'|'+String(answer?.question_id||answer?.questionId);
          const q=questionIndex.get(key);
          if(!q)return;
          q.answered=true;
          if(answer.correct===true||answer.bestCorrect===true)q.correct=true;
        });
      }
    }
    let answered=0,correct=0;
    questionIndex.forEach(x=>{if(x.answered)answered++;if(x.correct)correct++;});
    const accuracy=answered?Math.round(correct/answered*100):0;
    return {earned:answered===req.length && accuracy>=PASS,
      answered,total:req.length,correct,accuracy};
  }

  function bestCheck(id,records){
    if(!validBank(id))return null;
    const n=bank(id).length;
    let best=null;
    for(const a of records||[]){
      if(!a || a.recordKind==='question'||a.trainingId!==trainingId(id))continue;
      if(Number(a.total)!==n||!Array.isArray(a.answers)||a.answers.length!==n)continue;
      // Guard against partial attempts and corrupted score aggregates.
      const keys=new Set(a.answers.map(q=>String(q.section)+'|'+String(q.question_id)));
      if(keys.size!==n)continue;
      const score=a.answers.filter(q=>q.correct===true).length;
      if(Number(a.score)!==score||Math.abs(Math.round(score/n*10000)/100-Number(a.percentage))>0.011)continue;
      if(!best||score>best.score)best={score,total:n,accuracy:Math.round(score/n*10000)/100,qualifies:score*100>=PASS*n,submittedAt:a.submittedAt||''};
    }
    return best;
  }

  // Credits every correct answer once across all saved attempts, by unit.
  // STEP practice is not a certificate requirement.
  function cumulativeStatus(id,records){
    const req=requirements(id);
    if(!req||!req.length)return {earned:false,answered:0,total:0,correct:0,accuracy:0};
    const questions=new Map(),stages=new Map();
    req.forEach(r=>{
      questions.set(String(r.section)+'|'+String(r.questionId),{answered:false,correct:false});
      stages.set(String(r.trainingId),String(r.section));
    });
    for(const a of records||[]){
      if(!a)continue;
      if(a.recordKind==='question'){
        if(a.examUnit!==id)continue;
        const q=questions.get(String(a.examSection)+'|'+String(a.questionId));
        if(!q)continue;
        q.answered=true;
        if(a.correct===true||a.bestCorrect===true)q.correct=true;
        continue;
      }
      const isAssessment=a.trainingId===trainingId(id);
      const section=isAssessment?null:stages.get(String(a.trainingId));
      if(!isAssessment&&!section || !Array.isArray(a.answers))continue;
      a.answers.forEach(ans=>{
        const key=(isAssessment?String(ans?.section):section)+'|'+String(ans?.question_id||ans?.questionId);
        const q=questions.get(key);
        if(!q)return;
        q.answered=true;
        if(ans.correct===true||ans.bestCorrect===true)q.correct=true;
      });
    }
    let answered=0,correct=0;
    questions.forEach(q=>{if(q.answered)answered++;if(q.correct)correct++;});
    const total=req.length;
    return {earned:total>0&&answered===total&&correct*100>=PASS*total,
      answered,total,correct,accuracy:total?Math.round(correct/total*10000)/100:0};
  }
  function status(id,records){
    if(!modules[id])return {earned:false,mode:'unsupported',accuracy:0};
    const old=legacyStatus(id,records),check=bestCheck(id,records),progress=cumulativeStatus(id,records);
    if(old.earned)return {earned:true,mode:'legacy',accuracy:old.accuracy,progress,best:check,legacy:old};
    if(check?.qualifies)return {earned:true,mode:'assessment',accuracy:check.accuracy,progress,best:check,legacy:old};
    if(progress.earned)return {earned:true,mode:'cumulative',accuracy:progress.accuracy,progress,best:check,legacy:old};
    return {earned:false,mode:'pending',accuracy:progress.accuracy,progress,best:check,legacy:old};
  }

  let attempts=[],student=null,session=null,saving=false;
  function hydrate(a,p){if(Array.isArray(a))attempts=a;if(p&&p.role==='student')student=p;}
  function studentStatus(id){return status(id,attempts);}
  const J=window.STEPUP_JOURNEY;
  if(J){
    ['html','homeHTML','progressHTML'].forEach(name=>{
      const orig=J[name];
      if(typeof orig!=='function')return;
      J[name]=function(a,o,p){hydrate(a,p);return orig.apply(this,arguments);};
    });
  }
  const renderHost=()=>document.querySelector('.student-view');
  function css(){
    if(document.getElementById('stepupMasteryCSS'))return;
    const style=document.createElement('style');style.id='stepupMasteryCSS';
    style.textContent=[
      '.sum-card{margin-top:18px;padding:17px 19px;background:#f7fafc;border:2px solid #cfddea;border-radius:18px;display:flex;align-items:center;gap:16px;justify-content:space-between;flex-wrap:wrap}',
      '.sum-card strong{display:block;color:#17395b;font-size:20px;margin-bottom:6px}',
      '.sum-card p{margin:3px 0;color:#42546b;font-size:15px;line-height:1.7}',
      '.sum-card button,.sum-action{border:0;border-radius:13px;background:#245b8e;color:white;min-height:47px;padding:11px 20px;font-size:16px;font-weight:800;cursor:pointer}',
      '.sum-card button:disabled{background:#a0aec0;cursor:not-allowed}',
      '.sum-test{max-width:1000px;margin:0 auto;padding:12px 0 35px}',
      '.sum-test h1{font-size:clamp(24px,3vw,32px);color:#153859}',
      '.sum-test .sum-summary{background:white;border:1px solid #dce7f0;padding:20px;border-radius:18px;line-height:1.8}',
      '.sum-test .sum-progress{height:10px;background:#e0eaf3;border-radius:10px;overflow:hidden;margin:15px 0}',
      '.sum-test .sum-progress>i{display:block;height:100%;background:#247b92}',
      '.sum-test .sum-question{background:white;border:1px solid #dce7f0;border-radius:18px;padding:22px;margin-top:13px}',
      '.sum-test .sum-question h2{color:#143457;font-size:clamp(20px,2.5vw,26px);line-height:1.6}',
      '.sum-test .sum-options{display:grid;gap:10px;margin:20px 0}',
      '.sum-test .sum-options button{background:#fff;border:2px solid #d3deea;border-radius:13px;padding:14px 17px;text-align:left;line-height:1.5;font-size:18px;color:#1a2e48;cursor:pointer;display:flex;gap:12px}',
      '.sum-test .sum-options button[aria-pressed="true"]{background:#e7f7f3;border-color:#168076;font-weight:800}',
      '.sum-test .sum-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:18px}',
      '.sum-test .sum-alt{background:#f3f6fa;color:#255178;border:1px solid #c5d4e3}',
      '.sum-test .sum-context{white-space:pre-wrap;background:#f7f9fc;border-left:4px solid #3b83ad;border-radius:12px;padding:18px;color:#253c55;max-height:310px;overflow:auto;line-height:1.9}',
      '.sum-test .sum-error{padding:15px;border-radius:12px;background:#fff0ef;color:#8a2929;line-height:1.7}',
      '@media(max-width:650px){.sum-card{padding:14px}.sum-test .sum-question{padding:15px}.sum-test .sum-options button{font-size:16px}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function infoUnit(id){const u=unitData(id);return 'Unit '+(u?.number||id.replace('u',''))+(u?.title?' · '+u.title:'');}
  // Certificates are unlocked by the existing guided review, not a new test.
  function cardHTML(id){
    const st=studentStatus(id),p=st.progress||{answered:0,total:0,correct:0,accuracy:0};
    if(st.earned){
      const description=st.mode==='legacy'||st.mode==='assessment'
        ? 'Your previously earned certificate remains available.'
        : 'You reached the 80% goal through saved practice.';
      return '<div class="sum-card"><div><strong>🏆 Unit mastered</strong><p>'+description+
        '</p></div><button type="button" data-mastery-view="'+id+'">View Certificate</button></div>';
    }
    const need=Math.max(0,Math.ceil(p.total*PASS/100)-p.correct);
    return '<div class="sum-card"><div><strong>🎯 Unit Certificate Goal · 80%</strong>'+
      '<p>Correct answers: '+p.correct+'/'+p.total+' · Questions attempted: '+p.answered+'/'+p.total+'</p>'+
      '<p>'+(p.answered<p.total?'Complete the remaining review questions.':
        'Review missed answers. '+need+' more correct '+(need===1?'answer':'answers')+' needed.')+'</p>'+
      '<p>Each correct answer remains credited after a retry. No separate test.</p></div></div>';
  }
  function decorate(){
    if(!student||!J||session)return;
    const view=renderHost();
    if(!view)return;
    const title=view.querySelector('.journey-unit-hero h1');
    if(!title)return;
    const unit=(J.data.units||[]).find(u=>u.title===title.textContent.trim());
    if(!unit||!modules[unit.id])return;
    const hero=view.querySelector('.journey-unit-hero');if(!hero)return;
    const signature=[unit.id,studentStatus(unit.id).mode,studentStatus(unit.id).accuracy,readyToCheck(unit.id),bank(unit.id)?.length].join('|');
    let block=hero.querySelector('.sum-card-slot');
    if(block?.getAttribute('data-sig')===signature)return;
    if(!block){block=document.createElement('div');block.className='sum-card-slot';hero.appendChild(block);}
    block.setAttribute('data-sig',signature);block.innerHTML=cardHTML(unit.id);
    block.querySelector('[data-mastery-view]')?.addEventListener('click',()=>viewCertificate(unit.id));
  }
  let scheduled=false;
  const host=document.getElementById('app');
  if(host&&typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;try{decorate();}catch(e){console.warn('Mastery card',e)}});})
      .observe(host,{childList:true,subtree:true});
  }
  function viewCertificate(id){
    const u=unitData(id);if(u&&studentStatus(id).earned)window.STEPUP_CELEBRATE?.showCertificate?.(u);
  }
  // The standalone mastery test has been retired.
  function start(id){openUnit(id);}
  function contextHTML(q){
    if(q.section==='reading'&&q.context){
      return '<details open><summary>📖 Reading passage</summary><div class="sum-context" dir="ltr">'+esc(q.context)+'</div></details>';
    }
    if(q.section==='listening'&&q.audio){
      return '<div class="sum-summary"><strong>🎧 Listening</strong><p>Play the audio as many times as needed.</p>'+
        '<button type="button" class="sum-action" onclick="STEPUP_MASTERY.listen()">▶ Listen</button> '+
        '<button type="button" class="sum-action sum-alt" onclick="STEPUP_MASTERY.stopAudio()">■ Stop</button>'+
        (!('speechSynthesis' in window)?'<p>Audio is unavailable on this device. Please use a device with text-to-speech support.</p>':'')+
        '</div>';
    }
    return '';
  }
  function show(){
    const h=renderHost();if(!h||!session)return;
    const {questions,pos,unitId,answers}=session;
    const q=questions[pos],selected=answers[pos];
    const done=answers.filter(x=>x!==null).length;
    h.innerHTML='<section class="sum-test">'+
      '<button type="button" class="sum-action sum-alt" onclick="STEPUP_MASTERY.exit()">← Back to unit</button>'+
      '<div class="sum-summary"><span class="journey-kicker">CERTIFICATE MASTERY CHECK</span><h1>'+esc(infoUnit(unitId))+'</h1>'+
      '<p>Score at least 80% in this complete attempt to earn your unit certificate. You may try again after finishing.</p>'+
      '<div class="sum-progress"><i style="width:'+Math.round((pos+1)/questions.length*100)+'%"></i></div>'+
      '<strong>Question '+(pos+1)+' / '+questions.length+' · Answered '+done+'</strong></div>'+
      contextHTML(q)+
      '<div class="sum-question"><span class="journey-kicker">'+esc(q.sectionTitle)+'</span>'+
      '<h2 dir="ltr">'+esc(q.prompt)+'</h2><div class="sum-options">'+
      q.choices.map((c,i)=>'<button type="button" aria-pressed="'+(selected===i?'true':'false')+'" onclick="STEPUP_MASTERY.choose('+i+')">'+
        '<b>'+String.fromCharCode(65+i)+'.</b><span>'+esc(c)+'</span></button>').join('')+
      '</div><div class="sum-actions"><button type="button" class="sum-action sum-alt" '+(pos===0?'disabled':'')+' onclick="STEPUP_MASTERY.prev()">Previous</button>'+
      '<button type="button" class="sum-action" '+(selected===null||saving?'disabled':'')+' onclick="STEPUP_MASTERY.next()">'+
      (pos===questions.length-1?'Submit complete attempt':'Next Question →')+'</button></div></div></section>';
  }
  function choose(i){if(!session||saving)return;const q=session.questions[session.pos];if(!Number.isInteger(i)||i<0||i>=q.choices.length)return;session.answers[session.pos]=i;show();}
  function prev(){if(!session||saving)return;session.pos=Math.max(0,session.pos-1);show();}
  function next(){
    if(!session||saving||session.answers[session.pos]===null)return;
    if(session.pos<session.questions.length-1){session.pos++;show();return;}
    finish();
  }
  function stopAudio(){try{window.speechSynthesis?.cancel();}catch(_){}}
  function listen(){
    if(!session||!('speechSynthesis' in window))return;
    const q=session.questions[session.pos];if(!q?.audio)return;
    stopAudio();
    const speech=new SpeechSynthesisUtterance(q.audio);speech.lang='en-US';speech.rate=.88;
    window.speechSynthesis.speak(speech);
  }
  function exit(){
    if(saving)return;
    const id=session?.unitId;session=null;stopAudio();
    if(id)openUnit(id);
  }
  async function finish(){
    if(!session||saving||session.answers.some(a=>a===null))return;
    const completed=session;saving=true;stopAudio();
    const answers=completed.questions.map((q,i)=>({
      section:q.section,question_id:q.id,selected:completed.answers[i],
      correct:completed.answers[i]===q.answer,skill:q.sectionTitle
    }));
    const score=answers.filter(x=>x.correct).length,total=answers.length,percentage=Math.round(score/total*10000)/100;
    const payload={trainingId:trainingId(completed.unitId),trainingTitle:'Unit '+completed.unitId.slice(1)+' Mastery Check',
      trainingType:'mastery-check',unitId:completed.unitId,unitNumber:Number(completed.unitId.slice(1)),
      score,total,percentage,answers,
      elapsedSeconds:Math.max(1,Math.round((Date.now()-completed.started)/1000)),studyMethod:'full-unit-single-attempt'};
    const h=renderHost();
    try{
      const saved=await window.PROVE.recordJourneyAttempt(payload);
      attempts.push(saved&&saved.studentId?saved:{...payload,studentId:student?.id,submittedAt:new Date().toISOString()});
      session=null;
      if(!h)return;
      const earned=score*100>=PASS*total;
      h.innerHTML='<section class="sum-test"><div class="sum-summary"><h1>'+(earned?'🏆 Unit mastered!':'Keep going! You can try again.')+'</h1>'+
        '<p><strong>Score: '+score+'/'+total+' · '+percentage+'%</strong></p>'+
        '<p>'+(earned?'You earned your unit certificate.':'Review the unit and try another complete attempt. Your progress is saved.')+'</p>'+
        '<div class="sum-actions"><button class="sum-action sum-alt" onclick="STEPUP_MASTERY.openUnit(\''+completed.unitId+'\')">Back to Unit</button>'+
        (earned?'<button class="sum-action" onclick="STEPUP_MASTERY.viewCertificate(\''+completed.unitId+'\')">View Certificate</button>':
          '<button class="sum-action" onclick="STEPUP_MASTERY.start(\''+completed.unitId+'\')">Try Again</button>')+
        '</div></div></section>';
    }catch(e){
      if(h)h.innerHTML='<section class="sum-test"><div class="sum-error">Your result could not be confirmed as saved. Please check your connection and try submitting again.</div>'+
        '<button class="sum-action" onclick="STEPUP_MASTERY.retrySubmit()">Save result again</button></section>';
    }finally{saving=false;}
  }
  function retrySubmit(){if(!saving)finish();}
  function openUnit(id){
    session=null;stopAudio();
    if(['u4','u5','u6'].includes(id))J?.openUnit?.(id);
    else api(id)?.open?.();
  }
  css();
  window.STEPUP_MASTERY={PASS,LEGACY_CUTOFF,status,legacyStatus,cumulativeStatus,bestCheck,bank,requirements,validBank,
    studentStatus,readyToCheck,start,choose,prev,next,finish,retrySubmit,exit,openUnit,viewCertificate,listen,stopAudio,decorate,hydrate};
})();