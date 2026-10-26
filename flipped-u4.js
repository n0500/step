/* STEP UP — Unit 4 Flipped Reading | The Forgotten Wallet
 * Self-paced preparation, independently assigned per class.
 * Original textbook recording: MG Bk 1 F-SA_2025_2-07.mp3 (CD2/Track07).
 * Does not create mastery attempts, change unit access or issue certificates.
 */
(function(){
'use strict';
const VERSION='20261026-1';
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
const defaultState=()=>({step:0,opening:'',opinion:'',completed:false});
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
 const done=!!localGet(profile.id)?.completed;
 if(!deepLinkHandled&&new URLSearchParams(location.search).get('flipped')==='u4'){
   deepLinkHandled=true;Promise.resolve().then(()=>open());
 }
 return '<section class="fw-entry"><div class="fw-entry-art" aria-hidden="true">🍽️ <span>💳</span></div><div class="fw-entry-copy"><small>UNIT 4 · FLIPPED READING</small><h2>The Forgotten Wallet</h2><p>One mistake. A big invention! · A short story you can discover at your own pace.</p></div><button type="button" onclick="STEPUP_FLIPPED_U4.open()">'+(done?'Explore Again':'Discover the Story')+'</button></section>';
}
function teacherCard(cls){
 if(!cls)return '';
 const enabled=cls.flippedU4Enabled===true;
 const arg=JSON.stringify(cls.id).replace(/\"/g,'&quot;');
 const codeArg=JSON.stringify(cls.code||'').replace(/\"/g,'&quot;');
 return '<section class="fw-teacher" data-fw-class="'+e(cls.id)+'"><div class="fw-teacher-intro"><small>UNIT 4 · FLIPPED CLASSROOM</small><h2>The Forgotten Wallet</h2><p>Share a quick audio-supported story before class. Unit 4 does not have to be open for regular practice.</p><div class="fw-teacher-pills"><span>Original textbook recording</span><span>No scores or certificates</span><span>Student progress saved</span></div></div><div class="fw-teacher-actions"><span class="fw-teacher-status">'+(enabled?'Available to this class':'Not assigned yet')+'</span><button type="button" onclick="STEPUP_FLIPPED_U4.setEnabled('+arg+','+(!enabled)+')">'+(enabled?'Close Assignment':'Assign to This Class')+'</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.report('+arg+')">View Participation</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.copyLink('+codeArg+')">Copy Student Link</button></div><div class="fw-report" id="fw-report-'+e(cls.id)+'" hidden></div></section>';
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
   const value=r&&r.assignmentKind===TASK?r:(local||defaultState());
   state={...defaultState(),step:Math.max(0,Math.min(5,Number(value.progressStep??value.step)||0)),opening:value.opening||'',opinion:value.opinion||'',completed:!!value.completed};
   modal=document.createElement('div');modal.className='fw-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','The Forgotten Wallet');
   document.body.appendChild(modal);
   modal.addEventListener('click',click);render();
 }catch(err){console.warn('Flipped Reading access',err);alert(err.message?.includes('not been assigned')?'This story is not open for your class yet.':'Could not start the story. Check your connection and try again.');}
}
function persist(){
 if(!ctx)return;
 localSet(ctx.uid,{...state,version:1});
 const data={assignmentKind:TASK,studentId:ctx.uid,teacherId:ctx.teacherId,classId:ctx.classId,
   studentName:ctx.profile.displayName||'',opening:state.opening,opinion:state.opinion,
   progressStep:state.step,completed:!!state.completed,updatedAt:new Date().toISOString()};
 if(state.completed)data.completedAt=new Date().toISOString();
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
 {ico:'👔',year:'1949',title:'A small mistake',text:'Frank McNamara was having dinner in New York. When the bill arrived, he realized he had left his wallet in another suit.',line:'One forgotten wallet. One big question.'},
 {ico:'💳',year:'1950',title:'A clever idea',text:'He returned with a Diners Club card. Instead of paying cash for his meal, he signed the bill.',line:'What if you could pay without cash?'},
 {ico:'🌍',year:'1952 and beyond',title:'An idea spreads',text:'More businesses accepted the card. Soon it was used beyond restaurants, and payment cards changed everyday life.',line:'A mistake became an opportunity.'}
];
function render(){
 if(!modal)return;
 const steps=['Your choice','Discover','Discover','Discover','Think','Done'];
 const progress=Math.round(Math.max(0,Math.min(5,state.step))/5*100);
 const head='<header class="fw-head"><div><small>STEP UP · UNIT 4 · READING STORY</small><h1>The Forgotten Wallet</h1><p>One mistake. A big invention!</p></div><button type="button" data-fw="close" aria-label="Close activity">✕</button></header><div class="fw-progress" role="progressbar" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+progress+'%"></span></div>';
 let body='';
 if(state.step===0){
   body='<div class="fw-scene-art">🍽️ <span>🧥</span></div><div class="fw-scene"><span class="fw-eyebrow">NEW YORK · 1949</span><h2>Oh no! I forgot my wallet!</h2><p>The waiter brings the bill, but the customer has no money with him.</p><h3>What would you do?</h3><div class="fw-answers">'+[['borrow','Ask someone for help'],['return','Go home for my wallet'],['idea','Think of another way to pay']].map(x=>'<button type="button" data-fw="opening" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">There are no wrong answers. Just choose what you would do.</p></div>';
 }else if(state.step>=1&&state.step<=3){
   const s=scenes[state.step-1];
   body='<div class="fw-scene-art">'+s.ico+'</div><div class="fw-scene"><span class="fw-eyebrow">'+e(s.year)+' · PART '+state.step+' OF 3</span><h2>'+e(s.title)+'</h2><p>'+e(s.text)+'</p><div class="fw-quote">'+e(s.line)+'</div><div class="fw-nav"><button type="button" data-fw="back">Back</button><button class="fw-primary" type="button" data-fw="next">'+(state.step===3?'One Last Question':'See What Happens Next')+'</button></div></div>';
 }else if(state.step===4){
   body='<div class="fw-scene-art">💡 <span>🌎</span></div><div class="fw-scene"><span class="fw-eyebrow">YOUR OPINION</span><h2>Can one mistake change the world?</h2><p>Choose what you think. Your teacher can use your answer to start the class discussion.</p><div class="fw-answers">'+[['yes','Yes, it can!'],['maybe','Maybe. It depends.'],['no','No, not by itself.']].map(x=>'<button type="button" data-fw="opinion" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">No grades. No perfect answer.</p></div>';
 }else{
   body='<div class="fw-scene-art">✨ 💳</div><div class="fw-scene"><span class="fw-eyebrow">STORY COMPLETE</span><h2>You are ready for class!</h2><p>You discovered how one forgotten wallet inspired a new way to pay.</p><div class="fw-quote">There is one more question to explore together in class…</div><button class="fw-primary" type="button" data-fw="close">Done for Today</button><button class="fw-restart" type="button" data-fw="restart">Explore the story again</button></div>';
 }
 modal.innerHTML='<div class="fw-sheet">'+head+'<main class="fw-main">'+body+'</main><section class="fw-audio"><div><b>🎧 Listen to the original Reading</b><small>Mega Goal 1 · Unit 4 · CD 2, Track 07 · 3:23</small></div><button type="button" id="fwAudioButton" data-fw="loadAudio">'+(audioURL?'Show audio player':'Load original audio')+'</button><div class="fw-audio-player" id="fwAudioPlayer"></div></section><footer><span id="fwSync">Your progress is saved · No grades or certificates</span><span>'+e(steps[state.step])+'</span></footer></div>';
 if(audioURL)attachAudio();
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
 const b=event.target.closest('[data-fw]');if(!b||!modal?.contains(b))return;
 const a=b.dataset.fw;
 if(a==='close')return close();
 if(a==='loadAudio')return showAudio();
 if(a==='opening'){state.opening=b.dataset.choice;state.step=1;persist();render();return;}
 if(a==='next'&&state.step<4){state.step++;persist();render();return;}
 if(a==='back'&&state.step>1&&state.step<5){state.step--;persist();render();return;}
 if(a==='opinion'){state.opinion=b.dataset.choice;state.step=5;state.completed=true;persist();render();return;}
 if(a==='restart'){state.step=0;state.opening='';state.opinion='';localSet(ctx.uid,{...state,version:1});render();return;}
}
function init(){window.addEventListener('pagehide',()=>{stopAudio();if(audioURL)URL.revokeObjectURL(audioURL);audioURL='';});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.STEPUP_FLIPPED_U4={studentCard,teacherCard,setEnabled,report,copyLink,open,close,loadOriginalAudio,version:VERSION,
  _checkClass:checkClass,_audioParts:ids,_audioSha:AUDIO_SHA256,_scenes:scenes};
})();