/* STEP UP — Unit 4 Flipped Reading | The Forgotten Wallet
 * Self-paced preparation, independently assigned per class.
 * Original textbook recording: MG Bk 1 F-SA_2025_2-07.mp3 (CD2/Track07).
 * Does not create mastery attempts, change unit access or issue certificates.
 */
(function(){
'use strict';
const VERSION='20261026-reading-check-1';
const LESSON_VERSION=2;
const MEDIA='assets/audio/mega-goal-1/unit-04/reading-original-part-';
const AUDIO_SIZE=3256291;
const AUDIO_SHA256='1cc207b7fe39a61bcc8666cfd603769517c7beeecc076c7df2f27dab71cae411';
const TASK='u4-forgotten-wallet-v1';
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const db=()=>window.firebase?.apps?.length?firebase.firestore():null;
const user=()=>window.firebase?.apps?.length?firebase.auth().currentUser:null;
const ids=()=>Array.from({length:6},(_,i)=>MEDIA+String(i+1).padStart(2,'0')+'.bin');
const storedId=uid=>TASK+'-'+uid;
const key=uid=>'stepup-flipped-u4-'+uid;
const defaultState=()=>({step:0,opening:'',opinion:'',readConfirmed:false,answers:{},completed:false});
const CHECKS=[
 {id:'q1',skill:'Find a detail',prompt:'Why was Frank McNamara embarrassed at the restaurant?',
  choices:['He arrived late for dinner.','He had left his wallet in another suit.','His credit card was rejected.'],
  correct:1,explain:'Paragraph 2 says that Frank had left his wallet in the other suit.'},
 {id:'q2',skill:'Cause and effect',prompt:'What helped the new way of paying become popular?',
  choices:['Restaurants stopped accepting cash.','Everyone got a credit card immediately.','Many merchants and businesses began accepting the card.'],
  correct:2,explain:'Paragraph 2 explains that merchants adopted charging it, and thousands of businesses accepted the card by 1952.'}
];
const answeredCount=()=>CHECKS.filter(q=>Number.isInteger(state.answers?.[q.id])).length;
const correctCount=()=>CHECKS.filter(q=>state.answers?.[q.id]===q.correct).length;
const hasCompletedCheck=v=>!!(v?.readConfirmed&&CHECKS.every(q=>Number.isInteger(v?.answers?.[q.id])));
let state=defaultState(),ctx=null,modal=null,audio=null,audioURL='',audioLoading=null,writeQueue=Promise.resolve(),deepLinkHandled=false;
function authStudent(){return user()?.uid||'';}
function localGet(uid){try{const raw=JSON.parse(localStorage.getItem(key(uid))||'null');return raw?.version===1?raw.data:null}catch(_){return null;}}
function localSet(uid,data){try{localStorage.setItem(key(uid),JSON.stringify({version:1,data}));}catch(_){}}
async function loadOriginalAudio(){
 if(audioURL)return audioURL;
 if(audioLoading)return audioLoading;
 audioLoading=(async()=>{
   const chunks=await Promise.all(ids().map(async url=>{
      const res=await fetch(url,{cache:'force-cache'});
      if(!res.ok)throw Error('Audio segment '+res.status);
      return res.arrayBuffer();
   }));
   const size=chunks.reduce((sum,item)=>sum+item.byteLength,0);
   if(size!==AUDIO_SIZE)throw Error('Audio size mismatch');
   const blob=new Blob(chunks,{type:'audio/mpeg'});
   const data=await blob.arrayBuffer();
   if(window.crypto?.subtle){
     const digest=await crypto.subtle.digest('SHA-256',data);
     const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
     if(hex!==AUDIO_SHA256)throw Error('Audio checksum mismatch');
   }
   audioURL=URL.createObjectURL(blob);
   return audioURL;
 })().catch(err=>{audioLoading=null;throw err;});
 return audioLoading;
}
function stopAudio(){if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}}
function close(){stopAudio();if(modal){modal.remove();modal=null;}ctx=null;}
function checkClass(cls,uid,role){return !!(cls&&uid&&role==='student'&&cls.flippedU4Enabled===true);}
function studentCard(cls,profile){
 if(!checkClass(cls,profile?.id||authStudent(),profile?.role))return '';
 const cached=localGet(profile.id);
 const done=!!(cached?.completed&&cached?.lessonVersion===LESSON_VERSION&&hasCompletedCheck(cached));
 if(!deepLinkHandled&&new URLSearchParams(location.search).get('flipped')==='u4'){
   deepLinkHandled=true;Promise.resolve().then(()=>open());
 }
 return '<section class="fw-entry"><div class="fw-entry-art" aria-hidden="true">🍽️ <span>💳</span></div><div class="fw-entry-copy"><small>UNIT 4 · FLIPPED READING</small><h2>The Forgotten Wallet</h2><p>Explore the real textbook story, listen if you wish, and try two quick reading questions. No grades.</p></div><button type="button" onclick="STEPUP_FLIPPED_U4.open()">'+(done?'Explore Again':'Discover the Story')+'</button></section>';
}
function teacherCard(cls){
 if(!cls)return '';
 const enabled=cls.flippedU4Enabled===true;
 const arg=JSON.stringify(cls.id).replace(/\"/g,'&quot;');
 const codeArg=JSON.stringify(cls.code||'').replace(/\"/g,'&quot;');
 return '<section class="fw-teacher" data-fw-class="'+e(cls.id)+'"><div class="fw-teacher-intro"><small>UNIT 4 · FLIPPED CLASSROOM</small><h2>The Forgotten Wallet</h2><p>Share the original Unit 4 reading before class with two light comprehension checks. Regular Unit 4 practice stays separate.</p><div class="fw-teacher-pills"><span>Original textbook recording</span><span>2 reading comprehension checks</span><span>No grades or certificates</span><span>Student progress saved</span></div></div><div class="fw-teacher-actions"><span class="fw-teacher-status">'+(enabled?'Available to this class':'Not assigned yet')+'</span><button type="button" onclick="STEPUP_FLIPPED_U4.setEnabled('+arg+','+(!enabled)+')">'+(enabled?'Close Assignment':'Assign to This Class')+'</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.preview()">Preview Story</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.report('+arg+')">View Participation</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.copyLink('+codeArg+')">Copy Student Link</button></div><div class="fw-report" id="fw-report-'+e(cls.id)+'" hidden></div></section>';
}
async function setEnabled(classId,enabled){
 if(!user()||!db()){alert('Sign in to your teacher account.');return;}
 try{
   const doc=await db().collection('classes').doc(classId).get();
   const teacher=await db().collection('users').doc(user().uid).get();
   if(!doc.exists||doc.data().teacherId!==user().uid||teacher.data()?.role!=='teacher')throw Error('Teacher permission required');
   await db().collection('classes').doc(classId).update({flippedU4Enabled:!!enabled});
   window.PROVE?.renderTeacher?.();
 }catch(err){console.warn('Flipped Reading assignment',err);alert('Could not update the assignment. Please retry.');}
}
async function report(classId){
 const el=document.getElementById('fw-report-'+classId);if(!el||!db()||!user())return;
 el.hidden=false;el.innerHTML='<p>Loading class preparation…</p>';
 try{
   const cl=await db().collection('classes').doc(classId).get();
   if(!cl.exists||cl.data().teacherId!==user().uid)throw Error('Access denied');
   const [rosterSnap,subSnap]=await Promise.all([
     db().collection('users').where('teacherId','==',user().uid).get(),
     db().collection('assignmentSubmissions').where('teacherId','==',user().uid).get()
   ]);
   const students=rosterSnap.docs.map(x=>({id:x.id,...x.data()})).filter(x=>x.role==='student'&&x.classId===classId)
     .sort((a,b)=>String(a.displayName||'').localeCompare(String(b.displayName||''),'ar'));
   const saved=new Map(subSnap.docs.map(x=>x.data()).filter(x=>x.assignmentKind===TASK&&x.classId===classId).map(x=>[x.studentId,x]));
   const done=students.filter(s=>saved.get(s.id)?.completed).length;
   const started=students.filter(s=>saved.has(s.id)&&!saved.get(s.id)?.completed).length;
   const notStarted=students.length-done-started;
   const options={yes:'Yes — a mistake can lead to a great idea.',no:'No — one mistake is not enough.',maybe:'Maybe — it depends on what happens next.'};
   el.innerHTML='<div class="fw-stats"><div><b>'+done+'</b><small>Completed</small></div><div><b>'+started+'</b><small>In progress</small></div><div><b>'+notStarted+'</b><small>Not started</small></div></div>'+
   '<p class="fw-report-hint">Class discussion prompt: Can one mistake change the world?</p>'+
   '<div class="fw-roster">'+(students.length?students.map(s=>{
     const v=saved.get(s.id);const status=v?.completed?'Completed':v?'Started':'Not started';
     return '<div><strong>'+e(s.displayName||'Student')+'</strong><span>'+e(status)+'</span><small>'+e(v?.opinion?options[v.opinion]||v.opinion:'')+'</small></div>';
   }).join(''):'<p>No students found in this class.</p>')+'</div>';
 }catch(err){console.warn('Flipped Reading report',err);el.innerHTML='<p>Unable to load results. Check your connection and retry.</p><button type="button" onclick="STEPUP_FLIPPED_U4.report('+JSON.stringify(classId).replace(/\"/g,'&quot;')+')">Retry</button>';}
}
async function open(){
 if(modal)return;
 const uid=authStudent();
 if(!uid||!db()){alert('Please sign in to STEP UP first.');return;}
 try{
   const p=await db().collection('users').doc(uid).get();
   if(!p.exists||p.data().role!=='student')throw Error('Student account required');
   const cl=await db().collection('classes').doc(p.data().classId).get();
   if(!cl.exists||cl.data().flippedU4Enabled!==true)throw Error('This story has not been assigned to your class');
   ctx={uid,profile:p.data(),classId:p.data().classId,teacherId:p.data().teacherId};
   const remote=await db().collection('assignmentSubmissions').doc(storedId(uid)).get().catch(()=>null);
   const r=remote?.exists?remote.data():null;
   const local=localGet(uid);
   const remoteUpdated=Date.parse(r?.updatedAt||'')||0;
   const localUpdated=Date.parse(local?.updatedAt||'')||0;
   const chooseLocal=!!local&&localUpdated>remoteUpdated;
   const value=chooseLocal?local:(r&&r.assignmentKind===TASK?r:(local||defaultState()));
   const upToDate=Number(value.lessonVersion||0)===LESSON_VERSION;
   state={...defaultState(),opening:value.opening||'',opinion:value.opinion||'',
     readConfirmed:upToDate&&value.readConfirmed===true,
     answers:upToDate&&value.answers&&typeof value.answers==='object'?{...value.answers}:{},
     completed:upToDate&&value.completed===true&&hasCompletedCheck(value)};
   // Older story completions remain recorded but require the new text + two reading checks.
   state.step=state.completed?8:upToDate?Math.max(0,Math.min(7,Number(value.progressStep??value.step)||0)):value.completed?4:Math.max(0,Math.min(3,Number(value.progressStep??value.step)||0));
   if(state.step>4&&!state.readConfirmed)state.step=4;
   if(state.step>5&&!Number.isInteger(state.answers.q1))state.step=5;
   if(state.step>6&&!Number.isInteger(state.answers.q2))state.step=6;
   modal=document.createElement('div');modal.className='fw-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','The Forgotten Wallet');
   document.body.appendChild(modal);
   modal.addEventListener('click',click);render();
   if(chooseLocal&&upToDate)persist();
 }catch(err){console.warn('Flipped Reading access',err);alert(err.message?.includes('not been assigned')?'This story is not open for your class yet.':'Could not start the story. Check your connection and try again.');}
}
function preview(){
 if(modal)return;
 ctx=null;state=defaultState();
 modal=document.createElement('div');modal.className='fw-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','The Forgotten Wallet Preview');
 document.body.appendChild(modal);modal.addEventListener('click',click);render();
}
function persist(){
 if(!ctx)return;
 const now=new Date().toISOString();
 localSet(ctx.uid,{...state,lessonVersion:LESSON_VERSION,updatedAt:now,version:1});
 const data={assignmentKind:TASK,studentId:ctx.uid,teacherId:ctx.teacherId,classId:ctx.classId,
   studentName:ctx.profile.displayName||'',opening:state.opening,opinion:state.opinion,
   progressStep:state.step,readConfirmed:state.readConfirmed,answers:{...state.answers},
   comprehensionAnswered:answeredCount(),comprehensionCorrect:correctCount(),lessonVersion:LESSON_VERSION,
   completed:!!state.completed,updatedAt:now};
 if(state.completed&&state.step===8)data.completedAt=now;
 const uid=ctx.uid;
 writeQueue=writeQueue.catch(()=>{}).then(async()=>{
   if(!db()||authStudent()!==uid)return;
   await db().collection('assignmentSubmissions').doc(storedId(uid)).set(data,{merge:true});
 }).catch(err=>{console.warn('Flipped Reading sync failed',err);showSyncNotice();});
}
async function copyLink(classCode){
 const url=new URL(location.href);url.search='';url.searchParams.set('class',String(classCode||''));url.searchParams.set('flipped','u4');url.hash='';
 try{await navigator.clipboard.writeText(url.toString());alert('Student link copied.');}catch(_){window.prompt('Copy student link:',url.toString());}
}
function showSyncNotice(){const x=modal?.querySelector('#fwSync');if(x)x.textContent='Saved on this device. Reopen online to sync.';}
const scenes=[
 {
  "ico": "👔",
  "year": "1949",
  "title": "A small mistake",
  "text": "When the waiter presented the check, Frank realized that he had left his wallet in the other suit.",
  "line": "What would you do?"
 },
 {
  "ico": "💳",
  "year": "1950",
  "title": "A clever idea",
  "text": "When the check came, Frank handed the waiter a small cardboard card, a Diner’s Club Card, and signed for the meal.",
  "line": "What if you could pay without cash?"
 },
 {
  "ico": "🌍",
  "year": "1952 and beyond",
  "title": "An idea spreads",
  "text": "The idea of the credit card quickly expanded outside the United States.",
  "line": "One idea can change our lives."
 }
];
function readingParagraphs(){
 const raw=window.STEPUP_JOURNEY?.data?.units?.find(u=>u.id==='u4')?.reading;
 if(typeof raw!=='string'||!raw.startsWith('The World of Plastic\n\n'))return [];
 const parts=raw.split(/\n\s*\n/).slice(1);
 if(parts.length!==6||!parts.every((p,i)=>p.startsWith((i+1)+'. ')))return [];
 return parts;
}
function render(){
 if(!modal)return;
 const steps=['Curiosity','Discover','Discover','Discover','Read & listen','Find a detail','Cause & effect','Your opinion','Ready'];
 const progress=Math.round(Math.min(8,Math.max(0,state.step))/8*100);
 const head='<header class="fw-head"><div><small>STEP UP · UNIT 4 · TEXTBOOK READING</small><h1>The Forgotten Wallet</h1><p>One mistake. A big invention!</p></div><button type="button" data-fw="close" aria-label="Close activity">✕</button></header><div class="fw-progress" role="progressbar" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+progress+'%"></span></div>';
 let body='';
 if(state.step===0){
   body='<div class="fw-scene-art">🍽️ <span>🧥</span></div><div class="fw-scene"><span class="fw-eyebrow">NEW YORK · 1949</span><h2>Oh no! I forgot my wallet!</h2><p>When the waiter presented the check, Frank realized that he had left his wallet in the other suit.</p><h3>What would you do?</h3><div class="fw-answers">'+[['borrow','Ask someone for help'],['return','Go home for my wallet'],['idea','Think of another way to pay']].map(x=>'<button type="button" data-fw="opening" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">No wrong answer. Just choose what you would do.</p></div>';
 }else if(state.step>=1&&state.step<=3){
   const scene=scenes[state.step-1];
   body='<div class="fw-scene-art">'+e(scene.ico)+'</div><div class="fw-scene"><span class="fw-eyebrow">'+e(scene.year)+' · DISCOVERY '+state.step+'/3</span><h2>'+e(scene.title)+'</h2><p>'+e(scene.text)+'</p><div class="fw-quote">'+e(scene.line)+'</div><div class="fw-nav"><button type="button" data-fw="back">Back</button><button class="fw-primary" type="button" data-fw="next">'+(state.step===3?'Explore the Full Reading':'What Happens Next?')+'</button></div></div>';
 }else if(state.step===4){
   const paras=readingParagraphs();
   if(paras.length!==6){
     body='<div class="fw-scene"><h2>The textbook text is not available right now</h2><p>Refresh STEP UP and try again. This story cannot be marked ready without the original reading.</p><button class="fw-primary" type="button" data-fw="refresh">Retry</button></div>';
   }else{
     body='<div class="fw-reading"><span class="fw-eyebrow">MEGA GOAL 1 · UNIT 4 · PAGE 60</span><h2>The World of Plastic</h2><p class="fw-reading-help">Read the original six paragraphs below. You can also play the textbook audio. Take your time!</p><div class="fw-reading-text">'+paras.map(x=>'<p>'+e(x)+'</p>').join('')+'</div><button class="fw-primary" type="button" data-fw="readingDone">'+(state.readConfirmed?'Continue to Quick Check':'I’ve explored the reading · 2 quick questions')+'</button><p class="fw-note">No timer, no grades. You can return to the text whenever you need it.</p></div>';
   }
 }else if(state.step===5||state.step===6){
   const q=CHECKS[state.step-5],answered=Number.isInteger(state.answers[q.id]),picked=state.answers[q.id],correct=answered&&picked===q.correct;
   body='<div class="fw-scene-art">🔎</div><div class="fw-scene"><span class="fw-eyebrow">QUICK CHECK '+(state.step-4)+'/2 · '+e(q.skill)+'</span><h2>'+e(q.prompt)+'</h2><div class="fw-answers">'+q.choices.map((txt,i)=>'<button type="button" '+(answered?'disabled ':'')+'data-fw="check" data-choice="'+i+'" class="'+(answered&&i===picked?(correct?'fw-answer-right':'fw-answer-try'):'')+'">'+e(txt)+'</button>').join('')+'</div>'+(answered?'<div class="fw-feedback"><strong>'+(correct?'Great reading!':'Good try! Here is the clue.')+'</strong><p>'+e(q.explain)+'</p></div><div class="fw-nav"><button type="button" data-fw="reviewText">Review the text</button><button class="fw-primary" type="button" data-fw="afterCheck">'+(state.step===5?'One More Question':'Share Your Opinion')+'</button></div>':'<p class="fw-note">Choose one answer. Use the story to help you.</p>')+'</div>';
 }else if(state.step===7){
   body='<div class="fw-scene-art">💡 <span>🌎</span></div><div class="fw-scene"><span class="fw-eyebrow">THINK LIKE A READER</span><h2>Can one mistake change the world?</h2><p>There is no single right opinion. Share your idea and discuss it in class.</p><div class="fw-answers">'+[['yes','Yes, it can!'],['maybe','Maybe. It depends.'],['no','No, not by itself.']].map(x=>'<button type="button" data-fw="opinion" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">Your teacher will see the opinion and your two reading checks, not a grade.</p></div>';
 }else{
   body='<div class="fw-scene-art">✨ 💳</div><div class="fw-scene"><span class="fw-eyebrow">YOU ARE READY</span><h2>Great! You’re ready for class!</h2><p>You read the original story and answered both reading questions.</p><div class="fw-quote">Reading check: '+correctCount()+'/2 correct · Let’s discuss your idea together in class.</div><button class="fw-primary" type="button" data-fw="close">Done for Today</button><button class="fw-restart" type="button" data-fw="restart">Explore the story again</button></div>';
 }
 const audioSection='<section class="fw-audio"><div><b>🎧 Original textbook reading audio</b><small>Mega Goal 1 · Unit 4 · CD 2, Track 07 · 3:23</small></div><button type="button" id="fwAudioButton" data-fw="loadAudio">'+(audioURL?'Audio is ready':'Load original audio')+'</button><div class="fw-audio-player" id="fwAudioPlayer"></div></section>';
 if(!modal.querySelector('.fw-sheet')){
   modal.innerHTML='<div class="fw-sheet">'+head+'<main class="fw-main">'+body+'</main>'+audioSection+'<footer><span id="fwSync">Progress saved · No grades or certificates</span><span id="fwStepLabel">'+e(steps[state.step])+'</span></footer></div>';
   if(audioURL)attachAudio();
 }else{
   const main=modal.querySelector('.fw-main');
   if(main)main.innerHTML=body;
   const bar=modal.querySelector('.fw-progress');
   if(bar){bar.setAttribute('aria-valuenow',String(progress));const fill=bar.querySelector('span');if(fill)fill.style.width=progress+'%';}
   const label=modal.querySelector('#fwStepLabel');if(label)label.textContent=steps[state.step];
   const scroller=modal.querySelector('.fw-modal')||modal;if(scroller)scroller.scrollTop=0;
 }
}
function attachAudio(){
 const host=modal?.querySelector('#fwAudioPlayer');if(!host)return;
 const previous=audio?.currentTime||0;const playing=audio?!audio.paused:false;
 // Preserve the playback element across story scenes rather than restarting the track.
 if(audio){host.appendChild(audio);audio.currentTime=previous;if(playing)audio.play().catch(()=>{});return;}
 audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=audioURL;
 audio.setAttribute('aria-label','Original Mega Goal 1 Unit 4 Reading audio');host.appendChild(audio);
}
async function showAudio(){
 const button=modal?.querySelector('#fwAudioButton');if(!button)return;
 button.disabled=true;button.textContent='Loading the textbook recording…';
 try{await loadOriginalAudio();if(!modal)return;button.textContent='Ready to play';button.disabled=false;attachAudio();}
 catch(err){console.error('Original unit 4 reading audio failed',err);button.disabled=false;button.textContent='Retry audio';const msg=modal?.querySelector('#fwSync');if(msg)msg.textContent='Original audio could not load. Please retry with internet access.';}
}
function click(event){
 const b=event.target.closest('[data-fw]');if(!b||!modal?.contains(b)||b.disabled)return;
 const a=b.dataset.fw;
 if(a==='close')return close();
 if(a==='loadAudio')return showAudio();
 if(a==='refresh'){render();return;}
 if(a==='opening'&&state.step===0){state.opening=b.dataset.choice;state.step=1;persist();render();return;}
 if(a==='next'&&state.step>=1&&state.step<4){state.step++;persist();render();return;}
 if(a==='back'&&state.step>1&&state.step<4){state.step--;persist();render();return;}
 if(a==='readingDone'&&state.step===4&&readingParagraphs().length===6){state.readConfirmed=true;state.step=5;persist();render();return;}
 if(a==='check'&&(state.step===5||state.step===6)){
   const q=CHECKS[state.step-5],choice=Number(b.dataset.choice);
   if(!state.readConfirmed||Number.isInteger(state.answers[q.id])||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return;
   state.answers[q.id]=choice;persist();render();return;
 }
 if(a==='reviewText'&&(state.step===5||state.step===6)){state.step=4;persist();render();return;}
 if(a==='afterCheck'&&(state.step===5||state.step===6)){
   const q=CHECKS[state.step-5];if(!Number.isInteger(state.answers[q.id]))return;
   if(state.step===5){state.step=Number.isInteger(state.answers.q2)?7:6;}
   else state.step=7;
   persist();render();return;
 }
 if(a==='opinion'&&state.step===7&&state.readConfirmed&&answeredCount()===2){
   state.opinion=b.dataset.choice;state.step=8;state.completed=true;persist();render();return;
 }
 if(a==='restart'&&state.step===8){state.step=0;state.opening='';state.opinion='';if(!state.completed){state.readConfirmed=false;state.answers={};}render();return;}
}
function init(){window.addEventListener('pagehide',()=>{stopAudio();if(audioURL)URL.revokeObjectURL(audioURL);audioURL='';});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.STEPUP_FLIPPED_U4={studentCard,teacherCard,setEnabled,report,copyLink,preview,open,close,loadOriginalAudio,version:VERSION,
  _checkClass:checkClass,_audioParts:ids,_audioSha:AUDIO_SHA256,_scenes:scenes};
})();