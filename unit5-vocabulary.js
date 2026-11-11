/* STEP UP | Unit 5 exercise vocabulary from Listen & Discuss, Real Talk and After Reading
 * Student Book exercises only; grammar vocabulary excluded.
 * Separate supplemental practice does not change the 28-question mastery bank.
 */
(function(){
  'use strict';
  var sourceGroups=[["Nouns • Listen & Discuss",[["badge","an identification or achievement symbol"],["equipment","tools or items needed for a task"],["fog","a thick cloud near the ground that reduces visibility"],["helmet","a hard protective covering for the head"],["injury","physical harm to the body"],["intersection","a place where roads meet or cross"],["knee pad","protective padding worn over a knee"],["ostrich","a very large, fast-running flightless bird"],["risk","the possibility of harm or danger"],["shock","a sudden strong feeling of surprise or distress"],["snowstorm","a storm with heavy snow and wind"]]],["Verbs • Accidents & Safety",[["adjust","change something slightly to make it fit or work better"],["avoid","stay away from or prevent contact with"],["crash","hit something violently in an accident"],["encounter","meet or experience something unexpectedly"],["misjudge","estimate or assess something incorrectly"],["obey","follow a rule or instruction"],["occur","happen or take place"],["pay attention","focus carefully on something"],["prevent","stop something from happening"],["release","let go or allow something to be free"],["skid","slide out of control on a slippery surface"],["speed","move or drive faster than is safe or allowed"],["swerve","change direction suddenly"],["tailgate","drive dangerously close behind another vehicle"],["weave","move from side to side while going forward"]]],["Adjectives • Road Safety",[["aggressive","ready to attack or behave forcefully"],["cautious","careful to avoid danger or mistakes"],["distracted","unable to focus because attention is elsewhere"],["drowsy","sleepy and struggling to stay alert"],["injured","physically hurt or harmed"],["rude","impolite and disrespectful"],["severe","very serious or intense"],["unconscious","not awake or aware of surroundings"]]],["Injury Verbs",[["break","cause something, such as a bone, to separate into pieces"],["burn","injure with heat, fire or a hot substance"],["cut","wound using something sharp"],["die","stop being alive"],["fracture","crack or break a bone"],["poke","push or jab with a finger or pointed object"],["scar","leave a permanent mark after a wound heals"],["slip","lose footing and slide unexpectedly"],["sprain","injure a joint by twisting a ligament"]]],["Reflexive Pronouns • Grammar Vocabulary",[["herself","the same female person as the subject she"],["himself","the same male person as the subject he"],["itself","the same thing or animal as the subject it"],["myself","the same person as the subject I"],["ourselves","the same people as the subject we"],["themselves","the same people as the subject they"],["yourself","the same one person addressed as you"],["yourselves","the same multiple people addressed as you"]]],["Connectors • Cause & Result",[["because","introduces a reason or cause"],["so","introduces a result or consequence"]]],["Real Talk • Conversation",[["I guess","I am not completely sure"],["lucky day","a day when something fortunate happens"],["look at it this way","consider the situation from another perspective"],["stuck in","caught in a place and unable to get out"]]],["After Reading • Textbook Page 75",[["bald","having no hair on the head"],["to challenge","to contest or fight against"],["to weave through","to move through by turning to avoid obstacles"],["to hurl","to throw with great force"],["to burst","to break open or explode suddenly"],["to recover","to get better after an injury or illness"]]]];  // Only the three vocabulary exercise sources requested by the teacher.
  // Grammar pronouns and connectors are intentionally excluded.
  var groups=[
    ["Listen & Discuss",sourceGroups.slice(0,4).flatMap(function(g){return g[1];})],
    ["Real Talk",sourceGroups[6][1]],
    ["After Reading",sourceGroups[7][1]]
  ];
  var entries=[];
  groups.forEach(function(g){g[1].forEach(function(pair){entries.push({group:g[0],word:pair[0],meaning:pair[1]});});});
  var keyPrefix='stepup-unit5-vocabulary-v2-', active=null, selected=null, saving=false;
  function userId(){try{return window.firebase.auth().currentUser?.uid||null;}catch(_){return null;}}
  function key(){return keyPrefix+(userId()||'guest');}
  function read(){try{return JSON.parse(localStorage.getItem(key())||'null');}catch(_){return null;}}
  function write(value){try{localStorage.setItem(key(),JSON.stringify(value));return true;}catch(_){return false;}}
  function clear(){try{localStorage.removeItem(key());}catch(_){}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function host(){return document.querySelector('.student-view');}
  function glossary(){
    return '<section class="journey-focus-task" style="text-align:left"><details class="u5-vocab-glossary"><summary style="cursor:pointer;font-weight:800">Unit 5 Exercise Vocabulary · '+entries.length+' items</summary>'+
      '<p>Vocabulary from Listen & Discuss, Real Talk and After Reading exercises only.</p>'+
      groups.map(function(g){return '<details style="margin:8px 0;padding:10px;border:1px solid #d6e4ed;border-radius:10px"><summary style="cursor:pointer;font-weight:700">'+esc(g[0])+' ('+g[1].length+')</summary>'+
        '<ul dir="ltr" style="line-height:1.9;padding-left:22px">'+g[1].map(function(p){return '<li><b>'+esc(p[0])+'</b> — '+esc(p[1])+'</li>';}).join('')+'</ul></details>';}).join('')+
      '</details><button type="button" class="journey-main-btn" style="margin-top:10px" onclick="STEPUP_U5_VOCAB.begin()">Practice All Vocabulary · '+entries.length+' Questions</button>'+
      '<small style="display:block;margin-top:8px">Extra vocabulary practice. Your certificate keeps its original mastery rules.</small></section>';
  }
  function attach(target){if(target&&target.dataset.unit==='u5'){var wrapper=document.createElement('div');wrapper.innerHTML=glossary();target.appendChild(wrapper.firstElementChild);}}
  function options(index){
    var item=entries[index],candidates=entries.filter(function(v){return v.meaning!==item.meaning&&v.group===item.group;});
    if(candidates.length<3)candidates=entries.filter(function(v){return v.meaning!==item.meaning;});
    var offset=index%Math.max(1,candidates.length),other=[];
    for(var j=0;j<candidates.length&&other.length<3;j++){var x=candidates[(offset+j)%candidates.length];if(!other.includes(x.meaning))other.push(x.meaning);}
    var answer=index%4,values=other.slice();values.splice(answer,0,item.meaning);
    return {choices:values,answer:answer};
  }
  function session(){
    var r=read();return r&&r.uid===userId()&&r.answers&&Array.isArray(r.answers)&&r.answers.length===entries.length?r:null;
  }
  function begin(){
    var id=userId(),h=host();if(!h)return;
    if(!id){h.innerHTML='<section class="journey-content-card">Sign in to practise Unit 5 vocabulary.</section>';return;}
    var r=session();
    if(!r||r.answers.every(Boolean)){
      r={uid:id,startedAt:new Date().toISOString(),answers:Array(entries.length).fill(null)};
      if(!write(r)){h.innerHTML='<section class="journey-content-card">Unable to save progress on this device.</section>';return;}
    }
    active=true;selected=null;render();
  }
  function position(r){return r.answers.findIndex(function(a){return a===null;});}
  function render(){
    var h=host(),r=session();if(!h||!r||!active)return;
    var index=position(r);if(index<0){finish();return;}
    var item=entries[index],quiz=options(index),progress=index/entries.length;
    selected=null;
    h.innerHTML='<section class="journey-content-card" style="max-width:800px;margin:auto">'+
      '<button class="journey-link-btn" type="button" onclick="STEPUP_U5_VOCAB.exit()">← Unit 5</button>'+
      '<p class="journey-kicker">Unit 5 · '+esc(item.group)+'</p>'+
      '<h2>Vocabulary · Question '+(index+1)+' / '+entries.length+'</h2>'+
      '<div style="height:8px;background:#dfebf1;border-radius:8px;overflow:hidden"><div style="width:'+(progress*100)+'%;height:100%;background:#287c8a"></div></div>'+
      '<h3 dir="ltr" style="margin-top:20px">What does “'+esc(item.word)+'” mean?</h3>'+
      '<div class="u56-review-options" style="display:grid;gap:8px">'+quiz.choices.map(function(c,i){return '<button type="button" data-option="'+i+'" style="min-height:52px;text-align:left;border:2px solid #ccdae5;border-radius:11px;padding:12px;background:#fff;color:#163d59" onclick="STEPUP_U5_VOCAB.select('+i+')">'+String.fromCharCode(65+i)+'. '+esc(c)+'</button>';}).join('')+'</div>'+
      '<button class="journey-main-btn" style="margin-top:12px" disabled data-confirm="1" onclick="STEPUP_U5_VOCAB.confirm()">Confirm Answer</button></section>';
  }
  function select(index){
    var h=host(),r=session(),i=r&&position(r);if(!h||i<0||saving)return;
    if(!Number.isInteger(index)||index<0||index>3)return;
    selected=index;
    h.querySelectorAll('[data-option]').forEach(function(b,k){b.style.borderColor=k===index?'#287c8a':'#ccdae5';b.style.background=k===index?'#e5f4fb':'#fff';});
    var b=h.querySelector('[data-confirm]');if(b)b.disabled=false;
  }
  function confirm(){
    var r=session(),h=host(),i=r&&position(r);if(!r||!h||i<0||selected===null||saving)return;
    var item=entries[i],quiz=options(i),answer=selected,ok=answer===quiz.answer;
    r.answers[i]={question_id:'U5-VOC-'+String(i+1).padStart(3,'0'),stem:'What does '+item.word+' mean?',skill:item.group,selected:answer,correctAnswer:quiz.answer,correct:ok,selectedText:quiz.choices[answer],correctText:item.meaning,explanation:item.word+' means '+item.meaning+'.'};
    if(!write(r))return;
    selected=null;
    h.innerHTML='<section class="journey-content-card" style="max-width:800px;margin:auto">'+
      '<h2>'+(ok?'Correct!':'Not quite')+'</h2>'+
      '<h3 dir="ltr">'+esc(item.word)+'</h3>'+
      '<p dir="ltr"><b>Your answer:</b> '+esc(quiz.choices[answer])+'</p>'+
      (!ok?'<p dir="ltr"><b>Correct answer:</b> '+esc(item.meaning)+'</p>':'')+
      '<p class="answer-explanation" dir="ltr"><b>Meaning:</b> '+esc(item.meaning)+'</p>'+
      '<button type="button" class="journey-main-btn" onclick="STEPUP_U5_VOCAB.next()">'+(position(r)<0?'See Vocabulary Result':'Next Question')+'</button></section>';
  }
  function next(){if(!active||saving)return;render();}
  async function finish(){
    if(saving||!active)return;
    var r=session(),h=host();if(!r||!h||position(r)>=0)return;
    var score=r.answers.filter(function(a){return a.correct;}).length;
    var data={recordKind:'vocabulary-coverage',trainingId:'u5-vocabulary-all',trainingTitle:'Unit 5 Exercise Vocabulary',
      trainingType:'vocabulary',studyMethod:'unit5-exercise-vocabulary-v2',unitId:'u5',unitNumber:5,
      score:score,total:entries.length,percentage:Math.round(100*score/entries.length),
      answers:r.answers,startedAt:r.startedAt,submittedAt:new Date().toISOString()};
    saving=true;h.innerHTML='<section class="journey-content-card"><h2>Saving vocabulary practice…</h2></section>';
    try{
      if(typeof window.PROVE?.recordJourneyAttempt!=='function')throw Error('No save method');
      var result=await window.PROVE.recordJourneyAttempt(data);
      if(!result||result.studentId!==r.uid)throw Error('Save not confirmed');
      active=false;clear();h.innerHTML='<section class="journey-content-card" style="max-width:800px;margin:auto">'+
        '<h2>Unit 5 · Vocabulary Complete</h2><div class="journey-result-score">'+score+'/'+entries.length+'</div>'+
        '<p>All '+entries.length+' vocabulary items practised. Result saved.</p>'+
        '<p>This is separate from the unit certificate.</p>'+
        '<button class="journey-main-btn" onclick="STEPUP_U5_VOCAB.exit()">Back to Unit 5</button> '+
        '<button class="journey-link-btn" onclick="STEPUP_U5_VOCAB.begin()">Practice Again</button></section>';
    }catch(e){h.innerHTML='<section class="journey-content-card"><h2>Result not saved</h2><p>Your vocabulary answers are safe on this device.</p><button class="journey-main-btn" onclick="STEPUP_U5_VOCAB.retry()">Retry Saving</button></section>';}
    finally{saving=false;}
  }
  function retry(){active=true;finish();}
  function exit(){active=false;selected=null;window.STEPUP_JOURNEY?.openUnit('u5');}
  window.STEPUP_U5_VOCAB={groups:groups,entries:entries,attach:attach,begin:begin,select:select,confirm:confirm,next:next,finish:finish,retry:retry,exit:exit,session:session};
})();