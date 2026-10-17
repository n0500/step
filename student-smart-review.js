/* STEP UP student review upgrade: safe overlay; no changes to certificate logic. */
(function () {
  'use strict';
  var VERSION='20261017-1', activeChoice=null, selecting=false, recentAttempts=[];
  var challenge=null;
  var Q={
    u1:[
      {skill:'Simple Present vs Present Progressive',p:'Listen! The children ___ outside right now.',c:['play','are playing','played','have played'],a:1,e:'Right now describes an action happening at the moment.'},
      {skill:'Present Perfect',p:'Sara ___ her homework, so she can relax now.',c:['has finished','finished yesterday','was finishing','finishes last night'],a:0,e:'Present perfect connects a completed action with a present result.'},
      {skill:'Past Progressive',p:'I ___ dinner when the lights went out.',c:['cook','have cooked','was cooking','am cooking'],a:2,e:'Use was/were + -ing for the action in progress when another event happened.'},
      {skill:'Stative verbs',p:'Which sentence is correct?',c:['I am knowing the answer.','I know the answer.','I knowing the answer.','I have knowing the answer.'],a:1,e:'Know is usually a stative verb and is not used in progressive form.'},
      {skill:'Vocabulary in context',p:'A discovery that transformed communication had a great ___ on society.',c:['effect','habit','routine','delay'],a:0,e:'An effect is a change or result caused by something.'}
    ],
    u2:[
      {skill:'Present Perfect Progressive',p:'They ___ for the interview since 8 a.m.',c:['prepare','have been preparing','prepared yesterday','are prepare'],a:1,e:'Since gives the starting time of an action continuing until now.'},
      {skill:'Present Perfect Simple',p:'She ___ three job applications this week.',c:['has sent','has been send','send','was sending every day'],a:0,e:'Use have/has + past participle to emphasize a completed number or result.'},
      {skill:'Adjective + Preposition + Gerund',p:'Omar is interested ___ working with animals.',c:['at','on','in','for'],a:2,e:'The correct expression is interested in + verb-ing.'},
      {skill:'Relative Pronouns',p:'A mechanic is a person ___ repairs vehicles.',c:['which','where','when','who'],a:3,e:'Who introduces a relative clause referring to a person.'},
      {skill:'Prepositions of Time',p:'The interview starts ___ Monday morning.',c:['in','on','at','to'],a:1,e:'Use on with days of the week.'}
    ],
    u3:[
      {skill:'Will vs Be Going To',p:'The doorbell is ringing. I ___ answer it!',c:['am going to','will','was going to','have'],a:1,e:'Will can express a decision made at the moment of speaking.'},
      {skill:'Be Going To',p:'Look at those dark clouds. It ___ rain.',c:['will be','has','is going to','was'],a:2,e:'Be going to expresses a prediction based on present evidence.'},
      {skill:'Be Going To',p:'Maha has bought a ticket. She ___ travel tomorrow.',c:['is going to','will have','was traveling','travels yesterday'],a:0,e:'A prior plan or intention uses be going to.'},
      {skill:'Will',p:'I think scientists ___ develop better batteries in the future.',c:['are','will','were','have'],a:1,e:'Will is used for future predictions or opinions.'},
      {skill:'Be Going To',p:'We ___ study medicine; we have already decided.',c:['will deciding','are going to','was','will have'],a:1,e:'A decision or plan made earlier uses be going to.'}
    ]
  };
  function el(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function userId(){try{return window.firebase.auth().currentUser&&window.firebase.auth().currentUser.uid||null;}catch(_){return null;}}
  function storageKey(s){var id=userId();return id?'stepup-smart-'+VERSION+'-'+id+'-'+s:null;}
  function load(k){try{var key=storageKey(k);return key?JSON.parse(localStorage.getItem(key)||'null'):null;}catch(_){return null;}}
  function store(k,v){try{var key=storageKey(k);if(key)localStorage.setItem(key,JSON.stringify(v));}catch(e){console.warn('Local progress unavailable',e);}}
  function remove(k){try{var key=storageKey(k);if(key)localStorage.removeItem(key);}catch(_){}}
  function api(unit){return ({u1:window.STEPUP_U1_REVIEW,u2:window.STEPUP_U2_EXAM,u3:window.STEPUP_U3_REVIEW})[unit]||null;}
  function bank(unit){try{return (api(unit)&&api(unit).getMasteryBank&&api(unit).getMasteryBank())||[];}catch(_){return [];}}
  function sections(unit){return Array.from(new Set(bank(unit).map(function(q){return q.section;})));}
  function run(unit){var r=load('run-'+unit);return r&&r.uid===userId()&&Array.isArray(r.keys)?r:null;}
  function result(unit){
    var all=recentAttempts.filter(function(a){return a.recordKind==='smart-full-review'&&a.unitId===unit;});
    var saved=load('last-'+unit);
    if(saved&&saved.recordKind==='smart-full-review')all.push(saved);
    all.sort(function(a,b){return Date.parse(b.submittedAt||0)-Date.parse(a.submittedAt||0);});
    return all[0]||null;
  }
  function banner(unit){
    var earned=false;try{earned=!!window.STEPUP_MASTERY.studentStatus(unit).earned;}catch(_){}
    var r=run(unit),b=bank(unit);
    if(!b.length)return '';
    var latest=result(unit);
    var label=earned?'Practice Again':'Continue Review';
    var description=earned?'Revisit all '+b.length+' original questions. Your certificate stays safe.':'Your answers continue counting towards your unit certificate.';
    // Students can revisit complete review without a certificate only through their regular Review Path.
    return '<section class="smart-unit-panel" data-smart-banner="'+el(unit)+'"><div><strong>'+el(label)+'</strong><p>'+el(description)+'</p></div>'+
      (earned?'<button type="button" onclick="STEPUP_SMART.beginFull(\''+unit+'\')">'+(r?'Resume Full Review':'Practice Again')+' →</button>':'<button type="button" onclick="'+(unit==='u1'?'STEPUP_U1_REVIEW':unit==='u2'?'STEPUP_U2_EXAM':'STEPUP_U3_REVIEW')+'.start(\''+(api(unit).getProgress&&api(unit).getProgress().nextSection||b[0].section)+'\')">Continue Review →</button>')+
      (latest?'<small>Latest full review: '+Number(latest.percentage||0)+'%</small>':'<small>A full review helps you see your current level.</small>')+'</section>';
  }
  function beginFull(unit){
    var b=bank(unit), uid=userId();
    if(!uid||!b.length)return;
    var r=run(unit);
    if(!r||r.keys.length!==b.length||r.keys.some(function(k,i){return k!==b[i].section+'|'+b[i].id;})){
      r={uid:uid,unit:unit,startedAt:new Date().toISOString(),keys:b.map(function(q){return q.section+'|'+q.id;}),answers:{},runId:Date.now()+'-'+Math.random().toString(36).slice(2)};
      store('run-'+unit,r);
    }
    advance(unit);
  }
  function resumePosition(unit,section,queue){
    var r=run(unit);if(!r)return 0;
    var pos=0;
    while(pos<queue.length&&r.answers[section+'|'+queue[pos]])pos++;
    return pos;
  }
  function advance(unit){
    var r=run(unit),b=bank(unit),a=api(unit);
    if(!r||!a)return;
    var remaining=b.find(function(q){return !r.answers[q.section+'|'+q.id];});
    if(remaining){a.start(remaining.section,true);return;}
    finishFull(unit);
  }
  function onSaved(record){
    if(!record||record.recordKind!=='question'||!/^u[123]$/.test(record.examUnit||''))return;
    var unit=record.examUnit,r=run(unit);
    if(!r)return;
    var key=record.examSection+'|'+record.questionId;
    if(r.keys.indexOf(key)<0||r.answers[key])return;
    var q=bank(unit).find(function(x){return x.section+'|'+x.id===key;});
    r.answers[key]={question_id:record.questionId,section:record.examSection,skill:record.skill||q&&q.skill||q&&q.sectionTitle||'Review',stem:record.stem||q&&q.prompt||'',
      correct:record.correct===true,selectedText:record.selectedText||'',correctText:record.correctText||q&&q.choices&&q.choices[q.answer]||'',explanation:record.explanation||q&&q.explanation||''};
    store('run-'+unit,r);
  }
  async function finishFull(unit){
    var r=run(unit),b=bank(unit),h=document.querySelector('.student-view');if(!r||!b.length||!h)return;
    if(b.some(function(q){return !r.answers[q.section+'|'+q.id];})){advance(unit);return;}
    var all=b.map(function(q){return r.answers[q.section+'|'+q.id];});
    var score=all.filter(function(q){return q.correct;}).length,total=all.length,percentage=Math.round(100*score/total);
    var payload={recordKind:'smart-full-review',trainingId:'smart-full-review-'+unit,trainingTitle:'Unit '+unit.slice(1)+' Complete Review',
      trainingType:'review',studyMethod:'full-original-bank',unitId:unit,unitNumber:Number(unit.slice(1)),score:score,total:total,percentage:percentage,attemptScore:score,attemptTotal:total,attemptPercentage:percentage,
      answers:all,startedAt:r.startedAt,submittedAt:new Date().toISOString(),reviewRunId:r.runId};
    h.innerHTML='<section class="smart-results"><h2>Saving your full review…</h2><p>Your original answers are protected.</p></section>';
    try{
      if(!window.PROVE||typeof PROVE.recordJourneyAttempt!=='function')throw new Error('Student save service unavailable');
      await PROVE.recordJourneyAttempt(payload);
      remove('run-'+unit);store('last-'+unit,payload);
      recentAttempts.push(payload);
      h.innerHTML=reportHTML(payload)+ '<div class="smart-footer-action"><button type="button" onclick="STEPUP_SMART.openUnit(\''+unit+'\')">Back to Unit '+unit.slice(1)+'</button></div>';
    }catch(e){console.error('Full review save failed',e);h.innerHTML='<section class="smart-results" role="alert"><h2>Result not saved yet</h2><p>Your confirmed question answers are safe. Please check your connection, then retry saving.</p><button type="button" onclick="STEPUP_SMART.advance(\''+unit+'\')">Retry saving result</button></section>';}
  }
  function scoreGroups(a){
    var by={};
    (a.answers||[]).forEach(function(q){var s=q.skill||'Other',x=by[s]||(by[s]={name:s,correct:0,total:0,errors:[]});x.total++;if(q.correct)x.correct++;else x.errors.push(q);});
    return Object.values(by).sort(function(a,b){return (a.correct/a.total)-(b.correct/b.total);});
  }
  function reportHTML(a){
    var groups=scoreGroups(a),mistakes=(a.answers||[]).filter(function(q){return !q.correct;}),unit=a.unitId;
    var previous=recentAttempts.filter(function(x){return x.recordKind==='smart-full-review'&&x.unitId===unit&&x.reviewRunId!==a.reviewRunId;})
      .sort(function(x,y){return Date.parse(y.submittedAt||0)-Date.parse(x.submittedAt||0);})[0];
    var compare=previous?'<span>Change from previous: '+(a.percentage-previous.percentage>0?'+':'')+(a.percentage-previous.percentage)+' percentage points</span>':'<span>First recorded full review</span>';
    var rows=groups.map(function(g){var p=Math.round(g.correct*100/g.total);return '<div class="smart-skill"><span>'+el(g.name)+'</span><b>'+p+'% ('+g.correct+'/'+g.total+')</b><div class="smart-track"><i style="width:'+p+'%"></i></div></div>';}).join('');
    var focus=groups.filter(function(g){return g.errors.length;}).map(function(g){
      var strong=g.errors.length>1&&g.total>=2,first=g.errors[0];
      return '<li><b>'+el(g.name)+'</b> — '+(strong?'Prioritize this lesson':'Review this point')+' ('+g.errors.length+' missed) <button type="button" class="smart-focus-action" data-unit="'+el(unit)+'" data-section="'+encodeURIComponent(first.section)+'" data-skill="'+encodeURIComponent(g.name)+'" onclick="STEPUP_SMART.reviewSkill(this.dataset.unit,this.dataset.section,this.dataset.skill)">Review Lesson →</button></li>';
    }).join('');
    var mis=mistakes.map(function(q,i){return '<details class="smart-mistake"><summary>'+el((i+1)+'. '+q.skill)+' — '+el(q.stem)+'</summary><p><b>Your answer:</b> '+el(q.selectedText)+'</p><p><b>Correct:</b> '+el(q.correctText)+'</p><p>'+el(q.explanation||'Review the lesson and check the clue in the question.')+'</p></details>';}).join('');
    var unlocked=a.percentage===100&&Q[unit]&&Q[unit].length===5;
    return '<section class="smart-results"><small>STEP UP · Unit '+el(unit&&unit.slice(1))+' · Full review</small><h2>My Learning Level</h2><div class="smart-score">'+a.percentage+'% <small>'+a.score+'/'+a.total+' correct</small></div><p>'+compare+'</p><h3>My Skills</h3>'+rows+
      (mistakes.length?'<h3>Review My Mistakes ('+mistakes.length+')</h3>'+mis+'<h3>Lessons to Review</h3><ul>'+focus+'</ul>':
        '<p class="smart-success">You answered every original review question correctly.</p>')+
      (unit==='u1'?'<p class="smart-writing">Writing · The Internet: review your writing task separately. Multiple-choice results do not assess your writing.</p>':'')+
      (unlocked?'<aside class="smart-challenge-entry"><b>Extra Challenge unlocked ✨</b><p>5 new questions · entirely optional · no effect on certificates.</p><button type="button" onclick="STEPUP_SMART.startChallenge(\''+unit+'\')">Try 5 new questions</button></aside>':'')+'</section>';
  }
  function partialReport(unit){
    var b=bank(unit),items=recentAttempts.filter(function(a){return a.recordKind==='question'&&a.examUnit===unit;});
    if(!b.length)return '<p>Lesson data not available yet.</p>';
    var answers=[];
    b.forEach(function(q){
      var rows=items.filter(function(a){return a.examSection===q.section&&a.questionId===q.id;});
      rows.sort(function(a,c){return Date.parse(c.submittedAt||0)-Date.parse(a.submittedAt||0);});
      var rec=rows[0];if(rec)answers.push({section:q.section,skill:q.skill||q.sectionTitle||'Review',correct:rec.correct===true,
        stem:q.prompt,selectedText:rec.selectedText||'',correctText:q.choices[q.answer],explanation:q.explanation||''});
    });
    if(!answers.length)return '<p>No answers recorded yet. Start your Review Path to measure your skills.</p>';
    var errors=answers.filter(function(a){return !a.correct;});
    var groups=scoreGroups({answers:answers});
    var msg='<p><b>Partial check:</b> '+answers.length+'/'+b.length+' original questions attempted. This is not a complete level or exam readiness score.</p>';
    msg+='<p>Latest answers on covered questions: '+Math.round(answers.filter(function(a){return a.correct;}).length*100/answers.length)+'%. Reattempted questions may change this figure.</p>';
    if(groups.some(function(g){return g.errors.length;})){
      msg+='<h4>Lessons to Review</h4><ul>'+groups.filter(function(g){return g.errors.length;}).map(function(g){return '<li>'+el(g.name)+' — '+g.errors.length+' incorrect answer(s)</li>';}).join('')+'</ul>';
    }
    if(errors.length)msg+='<details class="smart-mistake"><summary>Review My Mistakes · '+errors.length+'</summary>'+errors.map(function(e){return '<p><b>'+el(e.skill)+'</b>: '+el(e.stem)+'<br>Your answer: '+el(e.selectedText)+'<br>Correct: '+el(e.correctText)+'</p>';}).join('')+'</details>';
    return msg;
  }
  function progressHTML(attempts){
    recentAttempts=Array.isArray(attempts)?attempts.slice():[];
    var reports=['u1','u2','u3'].map(function(unit){
      var a=result(unit);
      return a?'<div class="smart-progress-entry"><h3>Unit '+unit.slice(1)+' · Latest full review</h3>'+reportHTML(a)+'</div>':
        '<div class="smart-progress-entry"><h3>Unit '+unit.slice(1)+' · Review in progress</h3>'+partialReport(unit)+'</div>';
    });
    return '<section class="smart-progress-dashboard"><h2>My Learning Level</h2><p>A full-review score shows your current result. Partial reviews are labeled clearly; previous certificates stay separate.</p>'+reports.join('')+'</section>';
  }
  function reviewSkill(unit,sectionEncoded,skillEncoded){
    var a=api(unit),section=decodeURIComponent(sectionEncoded),skill=decodeURIComponent(skillEncoded);
    if(!a||!bank(unit).some(function(q){return q.section===section;}))return;
    if(unit==='u2'&&typeof a.practiceWeakness==='function')a.practiceWeakness(encodeURIComponent(section),encodeURIComponent(skill));
    else a.start(section);
  }
  function startChallenge(unit){
    var latest=result(unit);
    if(!latest||Number(latest.percentage)!==100||!Q[unit])return;
    challenge={unit:unit,pos:0,answers:[]};
    renderChallenge();
  }
  function renderChallenge(){
    if(!challenge)return;var h=document.querySelector('.student-view');if(!h)return;
    var q=Q[challenge.unit][challenge.pos];
    h.innerHTML='<section class="smart-results"><small>Extra Challenge · optional · '+(challenge.pos+1)+'/5</small><h2>'+el(q.p)+'</h2><div class="smart-challenge-options">'+q.c.map(function(x,i){return '<button type="button" onclick="STEPUP_SMART.challengeChoose('+i+')">'+String.fromCharCode(65+i)+'. '+el(x)+'</button>';}).join('')+'</div><p>No effect on your certificate.</p><button type="button" class="smart-skip" onclick="STEPUP_SMART.openUnit(\''+challenge.unit+'\')">Exit challenge</button></section>';
  }
  function challengeChoose(i){
    if(!challenge)return;var q=Q[challenge.unit][challenge.pos],h=document.querySelector('.student-view');
    if(!Number.isInteger(i)||i<0||i>=q.c.length||!h)return;
    challenge.answers.push({skill:q.skill,correct:i===q.a});
    h.innerHTML='<section class="smart-results"><h2>'+(i===q.a?'Correct!':'Keep learning')+'</h2><p><b>Correct answer:</b> '+el(q.c[q.a])+'</p><p>'+el(q.e)+'</p><button type="button" onclick="STEPUP_SMART.challengeNext()">Continue →</button></section>';
  }
  function challengeNext(){
    if(!challenge)return;challenge.pos++;
    if(challenge.pos<5)return renderChallenge();
    var h=document.querySelector('.student-view'),c=challenge,score=c.answers.filter(function(a){return a.correct;}).length;challenge=null;
    if(h)h.innerHTML='<section class="smart-results"><h2>Extra Challenge complete</h2><div class="smart-score">'+score+'/5</div><p>New examples help check understanding beyond the original question bank. Your certificate was not changed.</p><button type="button" onclick="STEPUP_SMART.openUnit(\''+c.unit+'\')">Back to Unit</button></section>';
  }
  function openUnit(unit){var a=api(unit);if(a)a.open();}
  function enHint(q){var s=String(q.skill||'').toLowerCase();if(s.includes('reading'))return 'Find evidence in the passage before choosing.';if(s.includes('listening'))return 'Listen for the key detail, not just a familiar word.';if(s.includes('present'))return 'Look for time expressions and decide whether the action is habitual, ongoing, or connected to now.';if(s.includes('past'))return 'Notice the order of past events and which action was in progress.';if(s.includes('vocab')||s.includes('talk'))return 'Use the sentence context and eliminate choices that do not fit.';return 'Read the time clue or meaning carefully, then eliminate unlikely choices.';}
  function enrich(){
    var host=document.querySelector('.student-view');if(!host)return;
    var hero=host.querySelector('.journey-unit-hero[data-review-unit]');
    if(hero&&!hero.querySelector('.smart-unit-panel')){
      var unit=hero.getAttribute('data-review-unit');if(api(unit))hero.insertAdjacentHTML('beforeend',banner(unit));
    }
    var opts=host.querySelector('.journey-question-card .journey-options');
    if(opts&&!opts.parentElement.querySelector('.smart-confirm')){
      var choices=Array.prototype.slice.call(opts.querySelectorAll('button'));
      if(choices.length&&choices.every(function(b){return /STEPUP_(?:U1_REVIEW|U2_EXAM|U3_REVIEW|JOURNEY)\.answer\(|STEPUP_U3_REVIEW\.stepAnswer\(/.test(b.getAttribute('onclick')||'');})){
        opts.insertAdjacentHTML('afterend','<button type="button" class="smart-confirm" disabled>Confirm Answer</button><small class="smart-choice-note">Select an option. You can change it before confirming.</small>');
        var confirm=opts.parentElement.querySelector('.smart-confirm');
        confirm.addEventListener('click',function(){
          var idx=choices.findIndex(function(b){return b.classList.contains('smart-selected');});
          if(idx<0)return;
          confirm.disabled=true;confirm.textContent='Saving…';
          selecting=true;try{choices[idx].click();}finally{selecting=false;}
        });
        if(!opts.parentElement.querySelector('.u2-help-actions')){
          var unitId=(choices[0].getAttribute('onclick')||'').includes('U1_REVIEW')?'u1':(choices[0].getAttribute('onclick')||'').includes('U3_REVIEW')?'u3':null;
          var title=host.querySelector('.journey-question-card h2'),q=bank(unitId).find(function(x){return title&&x.prompt.trim()===title.textContent.trim();});
          if(q){
            var wrap=document.createElement('div');wrap.className='smart-hint-area';
            wrap.innerHTML='<button type="button" data-mode="en">English Hint</button><button type="button" data-mode="ar">مساعدة بالعربي</button><p class="smart-hint-text" hidden></p>';
            opts.parentElement.insertBefore(wrap,confirm.nextSibling);
            wrap.addEventListener('click',function(e){var b=e.target.closest('[data-mode]');if(!b)return;var text=wrap.querySelector('p'),msg=b.dataset.mode==='ar'?(q.hint||'ابحثي عن الكلمة المفتاحية واستبعدي الخيارات غير المناسبة.'):enHint(q);text.textContent=msg;text.dir=b.dataset.mode==='ar'?'rtl':'ltr';text.hidden=!text.hidden&&text.textContent===msg;});
          }
        }
      }
    }
    var fullUnit=host.querySelector('.journey-result');
    if(fullUnit&&!fullUnit.querySelector('[data-smart-next]')){
      var r=['u1','u2','u3'].map(function(u){return run(u);}).find(function(x){return x&&Object.keys(x.answers).length;});
      if(r){
        var bankItems=bank(r.unit),remaining=bankItems.filter(function(q){return !r.answers[q.section+'|'+q.id];}).length;
        var footer=fullUnit.querySelector('.journey-result-actions')||fullUnit;
        var b=document.createElement('button');b.type='button';b.className='smart-next';b.dataset.smartNext='1';
        b.textContent=remaining?'Continue Full Review · '+remaining+' left':'See My Learning Level';
        b.addEventListener('click',function(){advance(r.unit);});
        footer.insertBefore(b,footer.firstChild);
        // Keep the full review journey primary instead of the normal section retry.
      }
    }
  }
  document.addEventListener('click',function(e){
    if(selecting)return;
    var btn=e.target.closest&&e.target.closest('.student-view .journey-options button');
    if(!btn||!btn.closest('.journey-question-card'))return;
    if(!/STEPUP_(?:U1_REVIEW|U2_EXAM|U3_REVIEW|JOURNEY)\.answer\(|STEPUP_U3_REVIEW\.stepAnswer\(/.test(btn.getAttribute('onclick')||''))return;
    var opts=btn.closest('.journey-options'),confirm=opts.parentElement.querySelector('.smart-confirm');
    if(!confirm)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    opts.querySelectorAll('button').forEach(function(b){b.classList.remove('smart-selected');b.setAttribute('aria-pressed','false');});
    btn.classList.add('smart-selected');btn.setAttribute('aria-pressed','true');confirm.disabled=false;confirm.textContent='Confirm Answer';
  },true);
  function setup(){
    if(window.STEPUP_ANSWER_RESPONSE&&!window.STEPUP_ANSWER_RESPONSE.__smart){
      var oldSubmit=STEPUP_ANSWER_RESPONSE.submit;
      STEPUP_ANSWER_RESPONSE.submit=function(args){
        var saved=args.onSaved;args.onSaved=function(record){onSaved(record);return saved&&saved(record);};
        return oldSubmit.call(STEPUP_ANSWER_RESPONSE,args);
      };
      STEPUP_ANSWER_RESPONSE.__smart=true;
    }
    if(window.STEPUP_JOURNEY&&!STEPUP_JOURNEY.__smartProgress){
      var prior=STEPUP_JOURNEY.progressHTML;
      STEPUP_JOURNEY.progressHTML=function(a,o,p){return progressHTML(a)+prior.call(this,a,o,p);};
      STEPUP_JOURNEY.__smartProgress=true;
    }
    var observer=new MutationObserver(function(){enrich();});
    observer.observe(document.body,{subtree:true,childList:true});
    enrich();
  }
  var style=document.createElement('style');style.id='stepupSmartStyles';
  style.textContent='.smart-unit-panel{margin:15px 0 0;padding:16px;border:1px solid #dae7ef;border-radius:16px;background:#fff;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}.smart-unit-panel p{margin:5px 0;color:#526477;font-size:13px}.smart-unit-panel small{width:100%;color:#61748b}.smart-unit-panel button,.smart-next,.smart-confirm,.smart-results button,.smart-footer-action button{border:0;border-radius:12px;padding:12px 17px;font-size:15px;font-weight:800;background:#284f88;color:white;cursor:pointer}.smart-confirm{display:block;width:100%;margin:12px 0 5px;min-height:52px}.smart-confirm:disabled{opacity:.45;cursor:not-allowed}.smart-choice-note{display:block;text-align:center;color:#637587;font-size:12px}.journey-options button.smart-selected{border:2px solid #2761a8!important;background:#e9f2ff!important;box-shadow:0 0 0 2px #d0e1fb}.smart-hint-area{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.smart-hint-area button{padding:8px 12px;border:1px solid #becfe1;background:white;border-radius:10px;color:#284f88;font-weight:700}.smart-hint-text{flex-basis:100%;padding:12px;background:#f5f8fd;border-radius:10px;color:#284261;line-height:1.6}.smart-results,.smart-progress-dashboard{margin:15px 0;padding:20px;background:#fff;border-radius:18px;border:1px solid #dce6ee;color:#20334d}.smart-results h2,.smart-progress-dashboard h2{margin:6px 0 12px}.smart-results h3{margin:20px 0 10px}.smart-score{padding:13px;text-align:center;font-size:33px;font-weight:900;background:#eaf6f0;border-radius:14px;color:#23674c}.smart-score small{font-size:13px;display:block}.smart-skill{margin:11px 0;display:grid;grid-template-columns:1fr auto;gap:6px;font-size:13px}.smart-track{grid-column:1/-1;height:8px;border-radius:8px;background:#e5edf5;overflow:hidden}.smart-track i{height:100%;display:block;background:#2e8975}.smart-mistake{margin:10px 0;padding:12px;border:1px solid #e0e7ee;border-radius:12px}.smart-mistake summary{font-weight:700;cursor:pointer}.smart-mistake p{font-size:14px}.smart-success{padding:11px;background:#e7f6eb;border-radius:12px}.smart-challenge-entry{margin-top:20px;padding:16px;border-radius:14px;border:1px solid #d7e0ec}.smart-challenge-entry button{background:#455f90}.smart-progress-entry{margin:16px 0}.smart-progress-entry .smart-results{background:#fbfdff}.smart-challenge-options{display:grid;gap:10px}.smart-challenge-options button{background:#f4f7fb;color:#223a58;border:1px solid #cfdae8;text-align:left}.smart-results .smart-skip{background:transparent;color:#455f90;border:1px solid #ced9e5}.smart-writing{font-size:13px;color:#526477}.smart-next{margin:6px!important;background:#286c63!important;order:-1}.smart-focus-action{padding:4px 9px!important;margin-left:7px!important;font-size:12px!important;background:#e8f0fb!important;color:#254f82!important}.smart-footer-action{margin:14px 0;text-align:center}@media(max-width:520px){.smart-unit-panel{display:block}.smart-unit-panel button{margin-top:10px;width:100%}.smart-results{padding:14px}}';
  document.head.appendChild(style);
  window.STEPUP_SMART={version:VERSION,banner:banner,beginFull:beginFull,resumePosition:resumePosition,advance:advance,onSaved:onSaved,finishFull:finishFull,
    progressHTML:progressHTML,reportHTML:reportHTML,openUnit:openUnit,reviewSkill:reviewSkill,startChallenge:startChallenge,challengeChoose:challengeChoose,challengeNext:challengeNext};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();