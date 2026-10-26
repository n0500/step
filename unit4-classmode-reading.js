/* STEP UP · Unit 4 Reading Class Mode · 2026-10-26
   Teacher-only activity: does not write student attempts, class access, or certificates. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unit=()=>window.STEPUP_JOURNEY?.data?.units?.find(x=>x.id==='u4');
const paragraphs=()=>String(unit()?.reading||'').split(/\n\s*\n/).slice(1).map(p=>p.trim().replace(/^\d+\.\s*/,'')).filter(Boolean);
const questions=()=>{const m=unit()?.missions?.find(x=>x.type==='reading');return(window.STEPUP_JOURNEY?.data?.questions||[]).filter(q=>q.unit_id==='MG1_U4'&&q.mission===m?.source&&q.stage==='Mastery');};
const answer=q=>['option_a_id','option_b_id','option_c_id','option_d_id'].findIndex(k=>q[k]===q.correct_option_id);
const opts=q=>['option_a_text','option_b_text','option_c_text','option_d_text'].map(k=>q[k]);
const S={box:null,mode:'read',part:0,all:false,index:0,selected:-1,reveal:false,time:40,running:false,timer:null,audio:null,audioLoading:false,audioSequence:0,activeCue:-1,syncShift:0};
function stopTimer(){if(S.timer)clearInterval(S.timer);S.timer=null;S.running=false;}
const sync=()=>window.STEPUP_FLIPPED_U4;
const fallbackParagraphStarts=[9.469,35.912,105.784,160.864,175.880,187.645,201.013];
const paragraphStarts=()=>sync()?._paragraphCues?.length===7?sync()._paragraphCues:fallbackParagraphStarts;
const sentenceCues=()=>sync()?._cueTimes?.length===29?sync()._cueTimes:[];
const sentenceParts=paragraph=>sync()?._splitSentences?.(paragraph)||[paragraph];
function close(){stopTimer();stopAudio();S.box?.remove();S.box=null;}
function stopAudio(){
 S.audioSequence++;
 if(S.audio){S.audio.pause();S.audio=null;}
 S.audioLoading=false;S.activeCue=-1;
}
function timeCue(seconds){
 const cues=sentenceCues(),ends=paragraphStarts();
 if(!cues.length||seconds<cues[0]||seconds>=ends[6])return -1;
 let lo=0,hi=cues.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(cues[mid]<=seconds)lo=mid;else hi=mid-1;}
 return lo;
}
function paragraphForTime(seconds){
 const cue=paragraphStarts();
 if(seconds<cue[0]||seconds>=cue[6])return -1;
 for(let i=0;i<6;i++)if(seconds<cue[i+1])return i;
 return -1;
}
function sourceParagraphMarkup(para,i){
 const p=paragraphs();
 const offset=p.slice(0,i).reduce((n,x)=>n+sentenceParts(x).length,0);
 return '<p class="u4r-source-paragraph" data-u4r-paragraph="'+i+'"><small>Paragraph '+(i+1)+'</small>'+
  sentenceParts(para).map((part,j)=>'<span class="u4r-sentence" data-u4r-cue="'+(offset+j)+'">'+esc(part)+'</span>').join('')+'</p>';
}
function updateHighlight(force=false){
 if(!S.box||S.mode!=='read'||!S.audio)return;
 const seconds=S.audio.currentTime+S.syncShift;
 const active=timeCue(seconds);
 if(!force&&active===S.activeCue)return;
 S.activeCue=active;
 const nodes=S.box.querySelectorAll('.u4r-sentence');
 let visible=null;
 nodes.forEach(n=>{
   const marked=Number(n.dataset.u4rCue)===active;
   n.classList.toggle('u4r-current',marked);
   if(marked){n.setAttribute('aria-current','true');visible=n;}
   else n.removeAttribute('aria-current');
 });
 const display=S.box.querySelector('.u4r-passage');
 if(visible&&display){
   const gap=visible.getBoundingClientRect().top-display.getBoundingClientRect().top;
   if(gap<35||gap>display.clientHeight*.65){
     const amount=Math.max(0,display.scrollTop+gap-display.clientHeight*.25);
     if(display.scrollTo)display.scrollTo({top:amount,behavior:'auto'});
     else display.scrollTop=amount;
   }
 }
 const stamp=S.box.querySelector('#u4r-synced');
 if(stamp)stamp.textContent=active>=0?'Following textbook recording · '+(paragraphForTime(seconds)+1)+'/6':'Ready to follow';
}
function onSoundTick(){
 if(!S.audio||!S.box)return;
 if(!S.all){
   const next=paragraphStarts()[S.part+1];
   if(S.audio.currentTime>=next-.035&&!S.audio.paused){S.audio.pause();}
 }
 updateHighlight();
}
async function speak(){
 if(S.mode!=='read'||!S.box)return;
 const button=S.box.querySelector('[data-act="audio"]'),seq=++S.audioSequence;
 if(button){button.disabled=true;button.textContent='Loading original recording…';}
 try{
   const uri=await sync()?.loadOriginalAudio?.();
   if(!uri||seq!==S.audioSequence||!S.box||S.mode!=='read')return;
   if(!S.audio||S.audio.src!==uri){
     if(S.audio)S.audio.pause();
     S.audio=new Audio(uri);
     for(const type of ['timeupdate','seeked','playing','pause','ended'])S.audio.addEventListener(type,onSoundTick);
   }else S.audio.pause();
   const start=paragraphStarts()[S.all?0:S.part],stop=paragraphStarts()[S.all?6:S.part+1];
   S.audio.currentTime=start;
   S.activeCue=-1;updateHighlight(true);
   await S.audio.play();
   if(!S.all&&S.audio.currentTime>=stop)S.audio.pause();
 }catch(error){
   console.warn('Unit 4 Class Mode original audio',error);
   const status=S.box?.querySelector('#u4r-synced');
   if(status)status.textContent='Original audio unavailable. Check your connection and retry.';
 }finally{
   const btn=S.box?.querySelector('[data-act="audio"]');
   if(btn){btn.disabled=false;btn.textContent='▶ Play original recording';}
 }
}
function pauseSound(){if(S.audio)S.audio.pause();}
function screen(){
  if(!S.box)return;
  const p=paragraphs(),q=questions()[S.index];
  if(p.length!==6||questions().length!==3||questions().some(x=>answer(x)<0)){
    S.box.innerHTML='<div class="u4r-wrap"><button data-act="close">Exit</button><h2>Reading content is unavailable.</h2></div>';return;
  }
  const head='<header class="u4r-header"><div><small>STEP UP · UNIT 4 · CLASS MODE</small><h1>The World of Plastic</h1><p>Mega Goal 1 · Reading p. 60 · exact 2025 Student Book text</p></div><button data-act="close">Exit Class Mode</button></header>';
  const tabs='<nav class="u4r-tabs"><button '+(S.mode==='read'?'class="active" ':'')+'data-act="read">Read Together</button><button '+(S.mode==='quiz'?'class="active" ':'')+'data-act="quiz">Comprehension Questions</button></nav>';
  let body='';
  if(S.mode==='read'){
    const text=S.all?p.map((x,i)=>sourceParagraphMarkup(x,i)).join(''):sourceParagraphMarkup(p[S.part],S.part);
    body='<section class="u4r-card"><h2>Read · Understand · Discuss</h2><div class="u4r-passage">'+text+'</div><div class="u4r-controls"><button data-act="prevPart" '+(S.part===0?'disabled':'')+'>Previous</button><button data-act="audio">▶ Play original recording</button><button data-act="stopAudio">■ Pause</button><span class="u4r-synced" id="u4r-synced">Ready to follow</span><button data-act="full">'+(S.all?'Single Paragraph':'Full Text')+'</button><button data-act="nextPart" '+(S.part===5?'disabled':'')+'>Next Paragraph</button><button data-act="quiz" class="primary">Start Questions</button></div></section>';
  }else{
    const choices=opts(q).map((c,i)=>'<button class="u4r-opt '+(S.selected===i?'selected ':'')+(S.reveal&&answer(q)===i?'correct ':S.reveal&&S.selected===i?'wrong ':'')+'" data-act="choose" data-num="'+i+'" '+(S.reveal?'disabled':'')+'><b>'+String.fromCharCode(65+i)+'</b><span>'+esc(c)+'</span></button>').join('');
    const evidence=S.index===0?[p[0],p[5]]:S.index===1?[p[1]]:[p[2]];
    body='<div class="u4r-grid"><section class="u4r-card"><div class="u4r-qt"><h2>Reading Comprehension</h2><b>Question '+(S.index+1)+' / 3</b></div><h3>'+esc(q.prompt)+'</h3><div class="u4r-options">'+choices+'</div>'+(S.reveal?'<p class="u4r-result"><b>Correct: '+String.fromCharCode(65+answer(q))+'</b> · '+esc(q.explanation||'')+'</p>':'')+'<div class="u4r-controls"><button data-act="prevQ" '+(S.index===0?'disabled':'')+'>Previous</button><button data-act="reveal" '+(S.reveal?'disabled':'')+'>Reveal Answer</button><button data-act="nextQ" class="primary">'+(S.index===2?'Finish':'Next Question')+'</button></div></section><aside class="u4r-card evidence"><div class="u4r-timer"><strong id="u4rClock">'+S.time+'s</strong><button data-act="timer">'+(S.running?'Pause':'Start 40s')+'</button><button data-act="reset">Reset</button></div><h2>Find the Evidence</h2>'+evidence.map(x=>'<p>'+esc(x)+'</p>').join('')+'<button data-act="audio">▶ Read Evidence</button></aside></div>';
  }
  S.box.innerHTML='<div class="u4r-wrap">'+head+tabs+body+'<footer>Original textbook recording · Sentence highlighting follows the actual recording timeline · Student scores and certificates are unchanged.</footer></div>';
  if(S.mode==='read'&&S.audio)updateHighlight(true);
}
function goQ(i){stopTimer();stopAudio();S.mode='quiz';S.index=i;S.selected=-1;S.reveal=false;S.time=40;screen();}
function handle(e){
  const b=e.target.closest('[data-act]');
  if(!b||!S.box?.contains(b)||b.disabled)return;
  const a=b.dataset.act;
  if(a==='close'){close();return;}
  if(a==='read'){stopTimer();stopAudio();S.mode='read';screen();return;}
  if(a==='quiz'){goQ(0);return;}
  if(a==='prevPart'){pauseSound();S.part=Math.max(0,S.part-1);screen();return;}
  if(a==='nextPart'){pauseSound();S.part=Math.min(5,S.part+1);screen();return;}
  if(a==='full'){pauseSound();S.all=!S.all;screen();return;}
  if(a==='audio'){speak();return;}
  if(a==='stopAudio'){pauseSound();return;}
  if(a==='choose'&&!S.reveal){S.selected=Number(b.dataset.num);screen();return;}
  if(a==='reveal'){stopTimer();S.reveal=true;screen();return;}
  if(a==='prevQ'){goQ(Math.max(0,S.index-1));return;}
  if(a==='nextQ'){S.index===2?close():goQ(S.index+1);return;}
  if(a==='reset'){stopTimer();S.time=40;screen();return;}
  if(a==='timer'){
    if(S.running){stopTimer();screen();return;}
    if(S.time<=0)S.time=40;
    S.running=true;
    S.timer=setInterval(()=>{S.time=Math.max(0,S.time-1);const el=S.box?.querySelector('#u4rClock');if(el)el.textContent=S.time+'s';if(!S.time){stopTimer();screen();}},1000);
    screen();return;
  }
}
function open(){
  if(S.box)return;
  if(!unit()||paragraphs().length!==6||questions().length!==3){alert('Unit 4 Reading is not available.');return;}
  stopTimer();stopAudio();S.mode='read';S.part=0;S.all=false;S.index=0;S.time=40;S.selected=-1;S.reveal=false;
  S.box=document.createElement('div');S.box.className='u4r-overlay';S.box.addEventListener('click',handle);document.body.appendChild(S.box);screen();
}
function panel(){
  const page=document.querySelector('.teacher-classmode-v2');
  if(!page||page.querySelector('.u4r-launch'))return;
  const box=document.createElement('section');box.className='u4r-launch';
  box.innerHTML='<div><small>UNIT 4 · READING CLASS MODE</small><h2>The World of Plastic</h2><p>Six paragraphs · audio · three comprehension questions · 40-second timer</p></div><button type="button">Teach Reading</button>';
  box.querySelector('button').addEventListener('click',open);
  page.insertBefore(box,page.children[1]||null);
}
function style(){
  if(document.querySelector('#u4rStyles'))return;
  const s=document.createElement('style');s.id='u4rStyles';
  s.textContent=[
  '.u4r-launch{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:16px 0;padding:20px;border:1px solid #c9dbea;border-radius:16px;background:#f4f9fd;color:#173a54}.u4r-launch small{font-weight:800}.u4r-launch h2{margin:5px 0;font-size:23px}.u4r-launch p{margin:0}.u4r-launch button{background:#175d8d;color:#fff;border:0;border-radius:12px;padding:16px 23px;font-size:18px;font-weight:800;cursor:pointer}',
  '.u4r-overlay{position:fixed;inset:0;z-index:999999;overflow:auto;background:#edf3f8;color:#1a334a;direction:ltr;font-family:Arial,Tajawal,sans-serif}.u4r-wrap{max-width:1500px;min-height:100vh;margin:auto;padding:24px 30px;box-sizing:border-box}.u4r-header{display:flex;justify-content:space-between;align-items:center;gap:15px}.u4r-header small{font-size:14px;font-weight:800;color:#2b759c}.u4r-header h1{font-size:clamp(30px,3.4vw,48px);color:#164767;margin:8px 0}.u4r-header p{font-size:15px;color:#62788b}.u4r-overlay button{cursor:pointer;border-radius:12px;font-family:inherit}.u4r-header button{font-size:16px;border:1px solid #ccdbe7;background:white;padding:13px 19px;font-weight:750}',
  '.u4r-tabs{display:flex;gap:12px;margin:18px 0}.u4r-tabs button{font-size:19px;padding:13px 22px;border:1px solid #c8d6e5;background:white;color:#29536c;font-weight:700}.u4r-tabs button.active{background:#175d8d;color:white;border-color:#175d8d}.u4r-card{background:#fff;border:1px solid #dbe4eb;border-radius:18px;padding:24px;min-width:0}.u4r-card h2{font-size:24px;margin:0 0 18px}.u4r-passage{padding:24px;background:#f8fafc;border-radius:14px;max-height:57vh;overflow:auto}.u4r-passage p{font-size:clamp(23px,2.3vw,32px);line-height:1.7;margin:0 0 18px}.u4r-passage small{display:block;font-size:15px;color:#34739b;font-weight:800}',
  '.u4r-controls{display:flex;flex-wrap:wrap;gap:10px;margin-top:19px}.u4r-controls button,.u4r-timer button,.u4r-card.evidence>button{font-size:17px;font-weight:750;background:#ecf4fa;color:#175b82;border:1px solid #b7d1e3;padding:12px 16px}.u4r-controls button.primary{background:#175d8d;color:white}.u4r-overlay button:disabled{opacity:.35;cursor:not-allowed}.u4r-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,.8fr);gap:20px}.u4r-qt{display:flex;align-items:center;justify-content:space-between}.u4r-qt b{font-size:18px;color:#175d8d}.u4r-card h3{font-size:clamp(23px,2.6vw,34px);line-height:1.4;margin:12px 0 20px}',
  '.u4r-options{display:grid;gap:11px}.u4r-opt{display:flex;align-items:center;text-align:left;gap:15px;width:100%;font-size:clamp(18px,1.8vw,25px);line-height:1.4;border:2px solid #dbe5ed;background:#f8fafc;padding:14px;color:#1b3b54}.u4r-opt b{display:grid;place-items:center;flex:none;width:35px;height:35px;border-radius:9px;background:#dfeaf3}.u4r-opt.selected{border-color:#2c81b4;background:#eaf6ff}.u4r-opt.correct{border-color:#16835a;background:#e9f8ef}.u4r-opt.wrong{border-color:#b94c4c;background:#fff0ef}.u4r-result{background:#e9f8ed;border-radius:12px;padding:14px;color:#176143;font-size:17px}',
  '.u4r-timer{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.u4r-timer strong{font-size:32px;color:#175d8d;min-width:72px}.u4r-card.evidence h2{margin-top:18px}.u4r-card.evidence p{font-size:18px;line-height:1.65;background:#f7fafc;border-radius:11px;padding:16px}.u4r-wrap footer{font-size:13px;margin:14px 0;color:#657b8e}@media(max-width:850px){.u4r-wrap{padding:14px}.u4r-grid{grid-template-columns:1fr}.u4r-launch{flex-wrap:wrap}.u4r-passage{max-height:none}.u4r-header{align-items:flex-start}.u4r-tabs{flex-wrap:wrap}}'
  ].join('\n');
  s.textContent += "\n.u4r-sentence{border-radius:5px;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}.u4r-sentence.u4r-current{background:#b9e5f3;color:#123c56;box-shadow:0 0 0 3px #b9e5f3;font-weight:800}.u4r-source-paragraph{scroll-margin-top:40px}.u4r-synced{font-size:15px;font-weight:800;color:#327594;align-self:center;padding:9px 12px;background:#e9f5fa;border-radius:10px}.u4r-passage{scroll-behavior:auto}.u4r-passage p{line-height:1.8}.u4r-controls button[data-act=audio]{background:#1b6189;color:#fff}";
  document.head.appendChild(s);
}
function init(){
  style();panel();
  new MutationObserver(panel).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>{stopTimer();stopAudio();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.STEPUP_U4_CLASSMODE_READING={open,close,paragraphs,questions,version:'20261026-original-audio-aligned-1',_sentenceMarkup:sourceParagraphMarkup,_timeCue:timeCue,_paragraphForTime:paragraphForTime};
})();