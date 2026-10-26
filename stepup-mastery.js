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
        context_excerpt:q.context_excerpt||'',context_match:q.context_match||'',context_paragraph:q.context_paragraph||null,
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

  // Saved Practice Again runs are certificate evidence in their own right.
  // Verify the original question IDs, coverage and score, rather than trusting
  // a rounded percentage or an optional Extra Challenge result.
  function fullReviewResult(id,record){
    const req=requirements(id),a=record;
    if(!req?.length || !a || a.recordKind!=='smart-full-review' ||
      a.trainingId!=='smart-full-review-'+id || a.unitId!==id ||
      a.studyMethod!=='full-original-bank' || Number(a.total)!==req.length ||
      !Array.isArray(a.answers) || a.answers.length!==req.length)return null;
    const expected=new Set(req.map(q=>String(q.section)+'|'+String(q.questionId))),seen=new Set();
    for(const answer of a.answers){
      const key=String(answer?.section)+'|'+String(answer?.question_id||answer?.questionId);
      if(!expected.has(key)||seen.has(key)||typeof answer?.correct!=='boolean')return null;
      seen.add(key);
    }
    if(seen.size!==expected.size)return null;
    const score=a.answers.filter(q=>q.correct===true).length,total=req.length;
    if(Number(a.score)!==score || Number(a.percentage)!==Math.round(score*100/total))return null;
    return {score,total,accuracy:Math.round(score*10000/total)/100,
      qualifies:score*100>=PASS*total,submittedAt:a.submittedAt||'',reviewRunId:a.reviewRunId||''};
  }
  function bestFullReview(id,records){
    let best=null;
    for(const record of records||[]){
      if(record?.recordKind!=='smart-full-review')continue;
      const result=fullReviewResult(id,record);
      if(result&&(!best||result.score>best.score||
        result.score===best.score&&result.submittedAt>best.submittedAt))best=result;
    }
    return best;
  }

  // Credits every correct answer once across all saved attempts, by unit.
  // STEP practice is not a certificate requirement.
  function progressDetails(id,records){
    const req=requirements(id);
    if(!req||!req.length)return {earned:false,answered:0,total:0,correct:0,accuracy:0,remaining:0,incorrect:0,sections:[]};
    const sourceBank=bank(id)||[],titles=new Map();
    sourceBank.forEach(q=>{if(q?.section&&!titles.has(String(q.section)))titles.set(String(q.section),String(q.sectionTitle||q.skill||q.section));});
    const questions=new Map(),stages=new Map(),sectionRows=new Map();
    req.forEach(r=>{
      const section=String(r.section),key=section+'|'+String(r.questionId);
      questions.set(key,{section,answered:false,correct:false});
      stages.set(String(r.trainingId),section);
      if(!sectionRows.has(section))sectionRows.set(section,{key:section,title:titles.get(section)||section,answered:0,total:0,correct:0,remaining:0,incorrect:0});
      sectionRows.get(section).total++;
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
      const isReview=a.recordKind==='smart-full-review';
      if(isReview&&!fullReviewResult(id,a))continue;
      const isMixed=isReview||a.trainingId===trainingId(id);
      const section=isMixed?null:stages.get(String(a.trainingId));
      if(!isMixed&&!section || !Array.isArray(a.answers))continue;
      a.answers.forEach(ans=>{
        const key=(isMixed?String(ans?.section):section)+'|'+String(ans?.question_id||ans?.questionId);
        const q=questions.get(key);
        if(!q)return;
        q.answered=true;
        if(ans.correct===true||ans.bestCorrect===true)q.correct=true;
      });
    }
    let answered=0,correct=0;
    questions.forEach(q=>{
      const row=sectionRows.get(q.section);
      if(q.answered){answered++;row.answered++;}
      if(q.correct){correct++;row.correct++;}
    });
    sectionRows.forEach(row=>{row.remaining=row.total-row.answered;row.incorrect=row.answered-row.correct;});
    const total=req.length;
    return {earned:total>0&&answered===total&&correct*100>=PASS*total,
      answered,total,correct,accuracy:total?Math.round(correct/total*10000)/100:0,
      remaining:total-answered,incorrect:answered-correct,sections:Array.from(sectionRows.values())};
  }
  function cumulativeStatus(id,records){
    const details=progressDetails(id,records);
    return {earned:details.earned,answered:details.answered,total:details.total,
      correct:details.correct,accuracy:details.accuracy};
  }
  // Teacher-authorized, one-time remedy for the Unit 2 Practice interruption.
  // Only evidence saved before the fix can qualify. This does not manufacture
  // answers for Reading/Listening or change the normal 80% completion policy.
  function interruptionException(id,records){
    if(id!=='u2')return null;
    const cutoff=Date.parse('2026-10-19T01:31:43.000Z');
    const history=(records||[]).filter(a=>{
      const date=Date.parse(a?.submittedAt||'');
      return Number.isFinite(date)&&date<=cutoff;
    });
    const sections=new Set(['vocab','grammar','functions']);
    const req=requirements(id);
    const core=req?.filter(q=>sections.has(q.section));
    if(!core||core.length!==22)return null;
    const trainings=new Set(core.map(q=>q.trainingId));
    const firstSkills=history.filter(a=>a.recordKind==='question'
      ? a.examUnit===id&&sections.has(a.examSection) : trainings.has(a.trainingId));
    const completed=cumulativeStatus(id,firstSkills),saved=cumulativeStatus(id,history);
    if(completed.answered!==22 || completed.correct*100<PASS*22 ||
      saved.answered>=saved.total || saved.correct*100<PASS*saved.answered)return null;
    return {reason:'u2-practice-interruption-20261019',cutoff:'2026-10-19T01:31:43.000Z',
      answered:saved.answered,correct:saved.correct,total:saved.total,
      accuracy:Math.round(saved.correct*10000/saved.answered)/100};
  }
  function status(id,records){
    if(!modules[id])return {earned:false,mode:'unsupported',accuracy:0};
    const old=legacyStatus(id,records),check=bestCheck(id,records),progress=cumulativeStatus(id,records),fullReview=bestFullReview(id,records);
    const evidence={progress,best:check,legacy:old,fullReview};
    const reviewAccuracy=fullReview?.qualifies?progress.accuracy:0;
    if(old.earned)return {earned:true,mode:'legacy',accuracy:Math.max(old.accuracy,reviewAccuracy),...evidence};
    if(check?.qualifies)return {earned:true,mode:'assessment',accuracy:Math.max(check.accuracy,reviewAccuracy),...evidence};
    if(fullReview?.qualifies)return {earned:true,mode:'practice-again',accuracy:progress.accuracy,...evidence};
    if(progress.earned)return {earned:true,mode:'cumulative',accuracy:progress.accuracy,...evidence};
    const exception=interruptionException(id,records);
    if(exception)return {earned:true,mode:'teacher-approved',accuracy:exception.accuracy,...evidence,exception};
    return {earned:false,mode:'pending',accuracy:progress.accuracy,...evidence};
  }

  let attempts=[],student=null,session=null,saving=false,openUnitIds=new Set();
  function hydrate(a,p,o){
    if(Array.isArray(a))attempts=a;
    if(p&&p.role==='student')student=p;
    if(Array.isArray(o))openUnitIds=new Set(o.map(x=>typeof x==='string'?x:x?.id).filter(Boolean));
  }
  function recordSaved(record){
    if(!student||!record||record.studentId!==(student.id||student.uid))return;
    try{if(window.firebase?.auth&&window.firebase.auth().currentUser?.uid!==record.studentId)return;}catch(_){return;}
    attempts=attempts.concat(record);
  }
  function studentStatus(id){return status(id,attempts);}
  const J=window.STEPUP_JOURNEY;
  if(J){
    ['html','homeHTML','progressHTML'].forEach(name=>{
      const orig=J[name];
      if(typeof orig!=='function')return;
      J[name]=function(a,o,p){hydrate(a,p,o);return orig.apply(this,arguments);};
    });
  }
  // Refresh certificate eligibility only after the online save succeeds.
  const recordAttempt=window.PROVE?.recordJourneyAttempt;
  if(typeof recordAttempt==='function')window.PROVE.recordJourneyAttempt=async function(){
    const saved=await recordAttempt.apply(this,arguments);
    recordSaved(saved);
    return saved;
  };
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
      '.sum-whats-left{display:block;background:#fff;border-color:#cfe0eb;padding:20px}',
      '.sum-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;flex-wrap:wrap}',
      '.sum-kicker{display:block;color:#247b70;font-size:12px;font-weight:900;letter-spacing:.11em;margin-bottom:5px}',
      '.sum-certificate-state{border-radius:999px;background:#eef3f8;color:#38506b;padding:7px 11px;font-size:12px;font-weight:900}',
      '.sum-certificate-state.earned{background:#e4f5ea;color:#216b48}',
      '.sum-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:16px 0}',
      '.sum-stats span{display:flex;flex-direction:column;gap:2px;padding:11px 12px;background:#f3f7fa;border-radius:12px;color:#65758a;font-size:12px}',
      '.sum-stats b{color:#193b5d;font-size:17px}',
      '.sum-section-list{display:grid;gap:7px;margin:13px 0 17px}',
      '.sum-section-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #e0e9ef;border-radius:11px;background:#fbfdfe}',
      '.sum-section-row span{min-width:0}.sum-section-row b{display:block;color:#263f59;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sum-section-row small{color:#6b7b8e}',
      '.sum-section-row em{font-style:normal;font-size:12px;font-weight:900;color:#8a5c16;white-space:nowrap}.sum-section-row.complete em{color:#23704c}',
      '.sum-card-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.sum-card-note{color:#66788b;font-size:12px!important;flex:1 1 230px}',
      '.sum-home-card{margin:0 0 18px;padding:19px;background:#fff;border:1px solid #d8e5ed;border-radius:18px}',
      '.sum-home-card h2{margin:3px 0 4px;color:#162f50}.sum-home-card>p{margin:0 0 13px;color:#65758a}',
      '.sum-home-units{display:grid;gap:8px}.sum-home-unit{width:100%;border:1px solid #dce7ee;background:#f8fbfd;border-radius:13px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;color:#203a58;cursor:pointer}',
      '.sum-home-unit span{display:flex;flex-direction:column;gap:3px}.sum-home-unit small{color:#67798c}.sum-home-unit em{font-style:normal;font-weight:900;color:#285f89;white-space:nowrap}.sum-home-unit.earned em{color:#23704c}',
      '.sum-map-note{margin-top:10px;padding:9px 10px;border-radius:10px;background:#edf5f8;color:#31556c;font-size:12px;font-weight:800;line-height:1.45}.sum-map-note.earned{background:#e7f5eb;color:#216b48}.sum-map-note small{display:block;margin-top:2px;color:inherit;font-weight:600}',
      '.journey-unit-hero .sxc-u1-award,.journey-unit-hero .sxc-u2-award{display:none!important}',
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
      '@media(max-width:650px){.sum-card{padding:14px}.sum-stats{grid-template-columns:repeat(3,1fr)}.sum-section-row{align-items:flex-start}.sum-home-unit{align-items:flex-start}.sum-test .sum-question{padding:15px}.sum-test .sum-options button{font-size:16px}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function infoUnit(id){const u=unitData(id);return 'Unit '+(u?.number||id.replace('u',''))+(u?.title?' · '+u.title:'');}
  function progressSummary(id){
    const st=studentStatus(id),d=progressDetails(id,attempts),need=Math.max(0,Math.ceil(d.total*PASS/100)-d.correct);
    if(st.earned)return {tone:'earned',label:'Certificate earned ✓',detail:d.total?d.correct+'/'+d.total+' correct':'Unit mastered',need:0,...d};
    if(!d.answered)return {tone:'ready',label:'Not started',detail:d.total+' questions to complete',need,...d};
    if(d.remaining){
      const parts=d.sections.filter(s=>s.remaining).map(s=>s.title+': '+s.remaining+' left');
      return {tone:'pending',label:d.remaining+' question'+(d.remaining===1?'':'s')+' left',detail:parts.slice(0,2).join(' • '),need,...d};
    }
    return {tone:'fix',label:need+' more correct '+(need===1?'answer':'answers')+' needed',detail:d.correct+'/'+d.total+' correct • '+d.accuracy+'%',need,...d};
  }
  // Certificates are unlocked by the existing guided review, not a new test.
  function cardHTML(id){
    const st=studentStatus(id),d=progressDetails(id,attempts),need=Math.max(0,Math.ceil(d.total*PASS/100)-d.correct);
    const title=st.earned?'Nothing missing — certificate earned':d.remaining
      ? d.remaining+' question'+(d.remaining===1?'':'s')+' left'
      : need+' more correct '+(need===1?'answer':'answers')+' needed';
    const intro=st.earned
      ? (st.mode==='teacher-approved'?'Your certificate is available from your saved practice results.':'You completed the unit goal and reached at least 80% mastery.')
      : d.remaining?'Finish the questions below. Your saved correct answers still count.':'You answered every question. Correct the remaining mistakes to reach 80%.';
    const rows=d.sections.map(s=>{
      const state=s.remaining?s.remaining+' left':s.incorrect?s.incorrect+' to fix':'✓ Complete';
      return '<div class="sum-section-row '+(!s.remaining&&!s.incorrect?'complete':'')+'"><span><b>'+esc(s.title)+'</b><small>'+s.correct+'/'+s.total+' correct</small></span><em>'+state+'</em></div>';
    }).join('');
    const action=st.earned
      ? '<button type="button" data-mastery-view="'+id+'">View Certificate</button>'
      : '<button type="button" data-mastery-continue="'+id+'">'+(d.remaining?'Continue '+d.remaining+' remaining':'Fix '+need+' '+(need===1?'answer':'answers'))+'</button>';
    return '<div class="sum-card sum-whats-left"><div class="sum-card-head"><div><span class="sum-kicker">WHAT’S LEFT?</span><strong>'+title+'</strong><p>'+intro+'</p></div>'+
      '<span class="sum-certificate-state '+(st.earned?'earned':'')+'">'+(st.earned?'Certificate earned':'Certificate goal · 80%')+'</span></div>'+
      '<div class="sum-stats"><span><b>'+d.answered+'/'+d.total+'</b>Answered</span><span><b>'+d.correct+'/'+d.total+'</b>Correct</span><span><b>'+d.accuracy+'%</b>Mastery</span></div>'+
      '<div class="sum-section-list">'+rows+'</div><div class="sum-card-actions">'+action+
      '<p class="sum-card-note">Every correct answer stays credited after a retry.</p></div></div>';
  }
  function decorateHome(view){
    const home=view.querySelector('.student-home-clean');if(!home)return;
    const units=(J.data.units||[]).filter(u=>(openUnitIds.size?openUnitIds.has(u.id):u.id==='u1')&&requirements(u.id)?.length);
    if(!units.length)return;
    const summaries=units.map(u=>({u,s:progressSummary(u.id)}));
    const sig=summaries.map(x=>[x.u.id,x.s.answered,x.s.correct,x.s.label].join(':')).join('|');
    let card=home.querySelector('.sum-home-card');
    if(card?.getAttribute('data-sig')===sig)return;
    if(!card){card=document.createElement('section');card.className='sum-home-card';const welcome=home.querySelector('.student-welcome');welcome?.insertAdjacentElement('afterend',card);if(!welcome)home.prepend(card);}
    card.setAttribute('data-sig',sig);
    card.innerHTML='<span class="sum-kicker">YOUR UNIT CHECKLIST</span><h2>What’s left?</h2><p>Open a unit to continue exactly where you need.</p><div class="sum-home-units">'+summaries.map(x=>
      '<button type="button" class="sum-home-unit '+(x.s.tone==='earned'?'earned':'')+'" data-mastery-open="'+x.u.id+'"><span><b>Unit '+x.u.number+' · '+esc(x.u.title)+'</b><small>'+esc(x.s.detail)+'</small></span><em>'+esc(x.s.label)+'</em></button>'
    ).join('')+'</div>';
    card.querySelectorAll('[data-mastery-open]').forEach(b=>b.addEventListener('click',()=>openUnit(b.getAttribute('data-mastery-open'))));
  }
  function decorateUnitMap(view){
    view.querySelectorAll('.journey-unit-card:not(.locked)').forEach(card=>{
      const title=card.querySelector('h3')?.textContent.trim(),u=(J.data.units||[]).find(x=>x.title===title);if(!u||!requirements(u.id)?.length)return;
      const s=progressSummary(u.id),sig=[s.answered,s.correct,s.label,s.detail].join('|');
      let note=card.querySelector('.sum-map-note');if(note?.getAttribute('data-sig')===sig)return;
      if(!note){note=document.createElement('div');note.className='sum-map-note';card.appendChild(note);}
      note.setAttribute('data-sig',sig);note.className='sum-map-note '+(s.tone==='earned'?'earned':'');
      note.innerHTML=esc(s.label)+(s.detail?'<small>'+esc(s.detail)+'</small>':'');
    });
  }
  function decorate(){
    if(!student||!J||session)return;
    const view=renderHost();
    if(!view)return;
    decorateHome(view);decorateUnitMap(view);
    const title=view.querySelector('.journey-unit-hero h1');
    if(!title)return;
    const unit=(J.data.units||[]).find(u=>u.title===title.textContent.trim());
    if(!unit||!modules[unit.id])return;
    const hero=view.querySelector('.journey-unit-hero');if(!hero)return;
    const st=studentStatus(unit.id),p=st.progress||{};
    const signature=[unit.id,st.mode,st.accuracy,p.answered||0,p.correct||0,p.total||0].join('|');
    let block=hero.querySelector('.sum-card-slot');
    if(block?.getAttribute('data-sig')===signature)return;
    if(!block){block=document.createElement('div');block.className='sum-card-slot';hero.appendChild(block);}
    block.setAttribute('data-sig',signature);block.innerHTML=cardHTML(unit.id);
    block.querySelector('[data-mastery-view]')?.addEventListener('click',()=>viewCertificate(unit.id));
    block.querySelector('[data-mastery-continue]')?.addEventListener('click',()=>continueUnit(unit.id));
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
  function continueUnit(id){
    if(!student)return;
    if(studentStatus(id).earned)return viewCertificate(id);
    if(window.STEPUP_SMART?.isFullActive?.(id))return window.STEPUP_SMART.advance(id);
    const work=progressDetails(id,attempts).sections.find(s=>s.remaining>0)||progressDetails(id,attempts).sections.find(s=>s.incorrect>0);
    if(!work)return openUnit(id);
    session=null;stopAudio();
    if(['u4','u5','u6'].includes(id))return J?.go?.(id,work.key);
    const unitApi=api(id);if(!unitApi)return;
    if(id==='u2'&&work.key==='reading'&&typeof unitApi.readingLesson==='function')return unitApi.readingLesson(true);
    if(typeof unitApi.start==='function')return unitApi.start(work.key,false,true);
    return unitApi.open?.();
  }
  // The standalone mastery test has been retired.
  function start(id){openUnit(id);}
  function contextHTML(q){
    if(q.context_excerpt&&window.STEPUP_U4_CONTEXT?.render)return window.STEPUP_U4_CONTEXT.render(q);
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
  window.STEPUP_MASTERY={PASS,LEGACY_CUTOFF,status,legacyStatus,cumulativeStatus,progressDetails,bestCheck,fullReviewResult,bestFullReview,recordSaved,bank,requirements,validBank,
    studentStatus,start,choose,prev,next,finish,retrySubmit,exit,openUnit,continueUnit,viewCertificate,listen,stopAudio,decorate,hydrate};
})();
