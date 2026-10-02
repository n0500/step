// StepUp • Unit 3 Class Mode Reading lesson — approved routine
(() => {
  'use strict';
  const state={step:0,selected:{},revealed:false,rate:.9,speechToken:0,observer:null};
  const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const unit=()=> (window.STEPUP_JOURNEY?.data?.units||[]).find(u=>u.id==='u3'||Number(u.number)===3);
  const paragraphs=()=>String(unit()?.reading||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const VOCAB=[
    ['gather','to come together'],['witness','to see an event'],['obsolete','outdated / no longer used'],
    ['vault','a secure chamber or safe'],['withstand','to resist or survive']
  ];
  const QUICK=[
    {stem:'What was buried in Tulsa in 1957?',choices:['A brand-new Plymouth Belvedere car','A school bus','A train','A boat'],answer:0,explanation:'Paragraph 1 identifies the time capsule as a brand-new Plymouth Belvedere car.'},
    {stem:'Why were five gallons of gas put in the car?',choices:['In case fuel was unavailable in 2007','To clean the car','To make the car heavier','To pay for the raffle'],answer:0,explanation:'Paragraph 2 says gas was included in case the engine became obsolete and no fuel was available.'},
    {stem:'Who could win the car?',choices:["The person who guessed Tulsa’s 2007 population most closely",'The mayor','The oldest person there','The car dealer'],answer:0,explanation:'Paragraph 3 explains that the winner would be the person whose population guess was closest.'},
    {stem:'What happened when the vault was opened in 2007?',choices:['The car was damaged by moisture and rust','The car was missing','The vault was empty','The car looked brand new'],answer:0,explanation:'Paragraph 4 says moisture entered and the vehicle was covered in rust.'},
    {stem:'Who lived to see the car unearthed?',choices:['Teddy and Gene','Henry only','The mayor and Henry','No one from 1957'],answer:0,explanation:'Paragraph 5 says Teddy and Gene were still alive when the car was unearthed.'}
  ];
  const STRATEGIES=[
    {name:'Main Idea',tip:'Choose the idea that covers the whole text, not one paragraph.',stem:'What is the main idea of “The Tulsa Time Capsule”?',choices:['A car was buried and opened 50 years later to show life in 1957.','Tulsa needed a new car.','People stopped driving cars.','A museum bought an old car.'],answer:0,explanation:'This choice covers the complete story: burial, purpose, and opening 50 years later.'},
    {name:'Reference',tip:'Look back for the closest logical noun that the pronoun can replace.',stem:'In “It lay there for 50 years,” what does “It” refer to?',choices:['The concrete vault','The Plymouth car','The courthouse','The flag'],answer:1,explanation:'The previous sentence says the Plymouth was lowered into the vault, so “It” refers to the car.'},
    {name:'Inference',tip:'Combine clues. The answer may not be copied word-for-word from the text.',stem:'What can we infer about the vault after it was opened in 2007?',choices:['It completely protected the car.','It did not fully protect the car from moisture.','Nobody knew where it was.','It had been opened many times.'],answer:1,explanation:'The rusty car and moisture damage show the vault did not protect it completely.'}
  ];

  function preferredVoice(){
    if(!('speechSynthesis' in window))return null;
    const vs=speechSynthesis.getVoices()||[];
    return vs.find(v=>/^en-US/i.test(v.lang))||vs.find(v=>/^en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;
  }
  function stopSpeech(){if('speechSynthesis' in window)speechSynthesis.cancel();state.speechToken++;}
  function speak(text,rate=state.rate){
    if(!('speechSynthesis' in window)){alert('Read Aloud is not available on this device/browser.');return;}
    stopSpeech(); const u=new SpeechSynthesisUtterance(String(text||''));u.lang='en-US';u.rate=rate;const v=preferredVoice();if(v)u.voice=v;speechSynthesis.speak(u);
  }
  function vocabHTML(){
    return `<div class="u3tr-vocab-grid">${VOCAB.map(([w,m])=>`<article><div><b>${esc(w)}</b><button onclick="STEPUP_U3_TEACH_READING.say('${w.replace(/'/g,"\\'")}')">🔊</button></div><span>${esc(m)}</span></article>`).join('')}</div><p class="u3tr-note">These words come from the Unit 3 reading. Students will meet them again while reading the paragraphs.</p>`;
  }
  function questionHTML(q,label='Quick Check'){
    const sel=state.selected[state.step],has=Number.isInteger(sel);
    return `<div class="u3tr-q"><span class="u3tr-strategy">${esc(label)}</span><h2 dir="ltr">${esc(q.stem)}</h2><div class="u3tr-choices">${q.choices.map((c,i)=>`<button class="${has&&sel===i?'selected':''} ${state.revealed&&i===q.answer?'correct':''} ${state.revealed&&has&&sel===i&&i!==q.answer?'wrong':''}" onclick="STEPUP_U3_TEACH_READING.choose(${i})"><span>${String.fromCharCode(65+i)}</span><b>${esc(c)}</b></button>`).join('')}</div>${has?`<button class="u3tr-check" onclick="STEPUP_U3_TEACH_READING.check()">${state.revealed?'Checked ✓':'Check Answer'}</button>`:'<button class="u3tr-check" disabled>Choose an answer first</button>'}${state.revealed?`<div class="u3tr-feedback"><b>${sel===q.answer?'✓ Correct':'Correct answer: '+String.fromCharCode(65+q.answer)}</b><p>${esc(q.explanation)}</p></div>`:''}</div>`;
  }
  function paragraphHTML(i){const ps=paragraphs(),p=ps[i]||'';return `<div class="u3tr-audio"><button onclick="STEPUP_U3_TEACH_READING.readParagraph(${i})">🔊 Read Paragraph ${i+1}</button><button onclick="STEPUP_U3_TEACH_READING.stop()">■ Stop</button></div><article class="u3tr-passage" dir="ltr"><span>Paragraph ${i+1}</span><p>${esc(p)}</p></article>${questionHTML(QUICK[i])}`;}
  function strategyHTML(i){const q=STRATEGIES[i];return `<div class="u3tr-strategy-card"><div><span>STEP Reading Strategy</span><h2>${esc(q.name)}</h2><p>${esc(q.tip)}</p></div><div class="u3tr-rule">${i===0?'Read the question → think about the whole passage → reject narrow details':i===1?'Find the pronoun → look backward → test the nearest logical noun':'Find two clues → connect them → reject unsupported choices'}</div></div>${questionHTML(q,q.name)}`;}
  function afterReadingHTML(){
    const rows=[
      ['1','What was the purpose of burying the car for 50 years?','To show future people who they were and how they lived in Tulsa in 1957.'],
      ['2','Why did the organizers include five gallons of gas for the car?','In case the combustion engine became obsolete and fuel was unavailable in 2007.'],
      ['4','Who was going to be the winner of the contest?',"The person who guessed Tulsa’s approximate population in 2007 most closely."],
      ['5','What was the bad news in 2007?','Moisture had damaged the car and some of the contents.']
    ];
    return `<div class="u3tr-book"><span>📘 After Reading • Exercise B</span><b>Student Book • p. 41</b></div><div class="u3tr-after">${rows.map(r=>`<details><summary><b>${r[0]}.</b> ${esc(r[1])}</summary><p>${esc(r[2])}</p></details>`).join('')}</div><p class="u3tr-note">Open each answer only after the class has discussed the evidence.</p>`;
  }
  function steps(){
    return [
      {k:'Before Reading',t:'The Tulsa Time Capsule',b:`<div class="u3tr-hero"><span>Unit 3 • Reading</span><h2>The Tulsa Time Capsule</h2><p>Ask the class: <b>What do you think a time capsule is?</b></p><p>Then ask: <b>What might people put inside one to represent life today?</b></p></div>`},
      {k:'Vocabulary',t:'Words before we read',b:vocabHTML()},
      ...paragraphs().map((_,i)=>({k:`Read & Listen • ${i+1}/5`,t:`Paragraph ${i+1}`,b:paragraphHTML(i)})),
      {k:'STEP Strategy 1',t:'Main Idea',b:strategyHTML(0)},
      {k:'STEP Strategy 2',t:'Reference',b:strategyHTML(1)},
      {k:'STEP Strategy 3',t:'Inference',b:strategyHTML(2)},
      {k:'After Reading',t:'Use evidence from the textbook',b:afterReadingHTML()},
      {k:'Finish',t:'Ready for Student Mode',b:`<div class="u3tr-finish"><span>✓</span><h2>Reading Complete</h2><p>Students have read the original text, checked each paragraph, and practised <b>Main Idea, Reference, and Inference</b>.</p><div><b>Next:</b> Student Mode • 7 Reading questions</div></div>`}
    ];
  }
  function render(){
    stopSpeech(); const app=document.getElementById('app');if(!app)return;const ss=steps(),s=ss[state.step]||ss[0],pct=Math.round((state.step+1)/ss.length*100);
    app.innerHTML=`<div class="u3tr-shell"><header><div><strong>StepUp • Teach Reading</strong><small>Unit 3 • What Will Be, Will Be</small></div><div><b>${state.step+1}/${ss.length}</b><button onclick="STEPUP_U3_TEACH_READING.exit()">Exit Lesson</button></div></header><div class="u3tr-progress"><i style="width:${pct}%"></i></div><main><div class="u3tr-head"><div><span>${esc(s.k)}</span><h1>${esc(s.t)}</h1></div></div><section class="u3tr-content">${s.b}</section><footer><button onclick="STEPUP_U3_TEACH_READING.prev()" ${state.step===0?'disabled':''}>← Back</button><div>${ss.map((_,i)=>`<i class="${i===state.step?'active':i<state.step?'done':''}"></i>`).join('')}</div>${state.step<ss.length-1?'<button class="primary" onclick="STEPUP_U3_TEACH_READING.next()">Next →</button>':'<button class="primary" onclick="STEPUP_U3_TEACH_READING.finish()">Finish Lesson ✓</button>'}</footer></main></div>`;
  }
  function start(){if(!document.querySelector('.teacher-classmode-v2')){alert('Open Teacher > Class Mode first.');return;}state.step=0;state.selected={};state.revealed=false;render();}
  function next(){if(state.step<steps().length-1){state.step++;state.revealed=false;render();}}
  function prev(){if(state.step>0){state.step--;state.revealed=false;render();}}
  function choose(i){state.selected[state.step]=Number(i);state.revealed=false;render();}
  function check(){if(Number.isInteger(state.selected[state.step])){state.revealed=true;render();}}
  function exitLesson(){stopSpeech();state.step=0;state.revealed=false;if(window.PROVE?.setTeacherTab)window.PROVE.setTeacherTab('classmode');}
  function finish(){exitLesson();}
  function injectPanel(){
    const page=document.querySelector('.teacher-classmode-v2');if(!page||page.querySelector('.u3tr-panel'))return;
    const panel=document.createElement('section');panel.className='u3tr-panel';panel.innerHTML=`<div><span>Unit 3 • What Will Be, Will Be</span><h2>Reading Class Mode</h2><p>The Tulsa Time Capsule • original textbook text • paragraph audio • STEP strategies • After Reading</p></div><button>👩‍🏫 Teach Reading</button>`;
    panel.querySelector('button').addEventListener('click',start);page.insertBefore(panel,page.children[1]||page.firstChild);
  }
  function injectStyles(){if(document.getElementById('u3trStyles'))return;const s=document.createElement('style');s.id='u3trStyles';s.textContent=`
    .u3tr-panel{margin:16px 0;padding:18px 20px;border:1px solid #d9e4f0;border-radius:20px;background:linear-gradient(135deg,#f3f8ff,#fff7fd);display:flex;align-items:center;justify-content:space-between;gap:18px;box-shadow:0 8px 24px rgba(23,50,77,.05)}.u3tr-panel span{font-size:12px;font-weight:900;color:#6750d8;text-transform:uppercase}.u3tr-panel h2{margin:4px 0;font-size:24px;color:#172033}.u3tr-panel p{margin:0;color:#667085}.u3tr-panel button{border:0;border-radius:14px;background:#315bd6;color:#fff;padding:13px 18px;font-weight:900;cursor:pointer;white-space:nowrap}
    .u3tr-shell{min-height:100vh;background:linear-gradient(180deg,#f6f9fd,#fff);color:#172033;font-family:Arial,Tahoma,"Segoe UI",sans-serif}.u3tr-shell>header{height:76px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #dfe7f0;position:sticky;top:0;z-index:5}.u3tr-shell>header strong{display:block;font-size:19px}.u3tr-shell>header small{display:block;color:#667085;margin-top:3px}.u3tr-shell>header>div:last-child{display:flex;gap:12px;align-items:center}.u3tr-shell>header button{border:1px solid #d9e2ec;background:#fff;border-radius:11px;padding:9px 12px;font-weight:800;cursor:pointer}.u3tr-progress{height:5px;background:#e8eef5}.u3tr-progress i{display:block;height:100%;background:linear-gradient(90deg,#1769e0,#8f4ee8)}.u3tr-shell main{max-width:1240px;margin:0 auto;padding:28px}.u3tr-head span{font-size:13px;font-weight:900;color:#6750d8;text-transform:uppercase}.u3tr-head h1{font-size:36px;margin:5px 0 20px}.u3tr-content{min-height:520px;background:#fff;border:1px solid #dfe7f0;border-radius:26px;padding:30px;box-shadow:0 12px 30px rgba(23,50,77,.05)}.u3tr-shell footer{display:grid;grid-template-columns:130px 1fr 130px;gap:12px;align-items:center;margin-top:18px}.u3tr-shell footer>div{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}.u3tr-shell footer i{width:9px;height:9px;border-radius:50%;background:#d9e1ea}.u3tr-shell footer i.active{background:#6750d8;transform:scale(1.25)}.u3tr-shell footer i.done{background:#8fcfae}.u3tr-shell footer button{border:1px solid #d9e2ec;background:#fff;border-radius:12px;padding:11px;font-weight:900;cursor:pointer}.u3tr-shell footer .primary{background:#315bd6;color:#fff;border-color:#315bd6}.u3tr-shell footer button:disabled{opacity:.35;cursor:default}
    .u3tr-hero{max-width:850px;margin:25px auto;text-align:center;padding:34px;border:1px solid #e0e6ef;border-radius:24px;background:linear-gradient(145deg,#fbfdff,#f8f4ff)}.u3tr-hero>span{font-weight:900;color:#6750d8}.u3tr-hero h2{font-size:40px;margin:8px 0 24px}.u3tr-hero p{font-size:22px;line-height:1.55;margin:12px 0}.u3tr-vocab-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.u3tr-vocab-grid article{border:1px solid #dfe6ee;border-radius:18px;padding:18px;background:#fbfdff}.u3tr-vocab-grid article>div{display:flex;justify-content:space-between;align-items:center;gap:8px}.u3tr-vocab-grid b{font-size:22px;color:#4f45b5}.u3tr-vocab-grid button{border:0;background:#edf4ff;border-radius:10px;padding:7px 9px;cursor:pointer}.u3tr-vocab-grid span{display:block;color:#5d6b7d;margin-top:10px;font-size:15px;line-height:1.45}.u3tr-note{margin-top:18px;padding:13px 15px;border-radius:14px;background:#f1f6fb;color:#4d6077;font-weight:700}
    .u3tr-audio{display:flex;gap:9px;margin-bottom:14px}.u3tr-audio button{border:1px solid #d8e2ed;background:#f5f9ff;border-radius:11px;padding:10px 13px;font-weight:900;cursor:pointer}.u3tr-passage{font-size:21px;line-height:1.8;border:1px solid #e0e6ee;border-radius:20px;padding:22px;background:#fff}.u3tr-passage>span{display:inline-block;font-size:12px;font-weight:900;color:#6750d8;background:#f1efff;border-radius:999px;padding:5px 9px}.u3tr-passage p{margin:12px 0 0}.u3tr-q{margin-top:18px;border-top:1px solid #e6ebf1;padding-top:20px}.u3tr-strategy{display:inline-block;padding:6px 9px;border-radius:999px;background:#eef4ff;color:#315bd6;font-size:12px;font-weight:900}.u3tr-q h2{font-size:26px;line-height:1.35}.u3tr-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.u3tr-choices button{display:flex;gap:11px;align-items:flex-start;text-align:left;border:1px solid #dfe6ee;border-radius:15px;background:#fff;padding:13px;cursor:pointer;font-size:16px}.u3tr-choices button span{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#eef3f9;font-weight:900}.u3tr-choices button.selected{border-color:#7c6ce8;background:#f7f5ff}.u3tr-choices button.correct{border-color:#4aad7a;background:#effaf4}.u3tr-choices button.wrong{border-color:#d96b6b;background:#fff3f3}.u3tr-check{margin-top:12px;border:0;border-radius:12px;padding:11px 16px;background:#315bd6;color:#fff;font-weight:900;cursor:pointer}.u3tr-check:disabled{opacity:.4}.u3tr-feedback{margin-top:12px;padding:13px 15px;border-radius:14px;background:#f1f7fb}.u3tr-feedback p{margin:6px 0 0;line-height:1.5}
    .u3tr-strategy-card{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center;padding:22px;border:1px solid #e0e6ef;border-radius:20px;background:linear-gradient(145deg,#fbfdff,#f8f4ff)}.u3tr-strategy-card span{font-size:12px;font-weight:900;color:#6750d8;text-transform:uppercase}.u3tr-strategy-card h2{font-size:31px;margin:6px 0}.u3tr-strategy-card p{font-size:17px;line-height:1.55;color:#596a7c}.u3tr-rule{padding:18px;border-radius:16px;background:#fff;border:1px solid #dfe6ee;font-size:18px;line-height:1.6;font-weight:800;color:#32465c}.u3tr-book{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:14px;background:#eef5ff;color:#315274;font-weight:900}.u3tr-after{display:grid;gap:10px;margin-top:14px}.u3tr-after details{border:1px solid #dfe6ee;border-radius:14px;background:#fff;overflow:hidden}.u3tr-after summary{padding:14px 16px;cursor:pointer;font-size:18px;line-height:1.45}.u3tr-after details p{margin:0;padding:13px 16px;background:#f5f9ff;color:#38516a;font-size:16px}.u3tr-finish{max-width:720px;margin:50px auto;text-align:center}.u3tr-finish>span{width:62px;height:62px;margin:0 auto 14px;display:grid;place-items:center;border-radius:50%;background:#e8f7ee;color:#188454;font-size:28px;font-weight:900}.u3tr-finish h2{font-size:34px;margin:0 0 10px}.u3tr-finish p{font-size:18px;line-height:1.6;color:#596a7c}.u3tr-finish>div{margin-top:18px;padding:15px;border-radius:14px;background:#eef5ff}
    @media(max-width:900px){.u3tr-vocab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.u3tr-choices,.u3tr-strategy-card{grid-template-columns:1fr}.u3tr-content{padding:20px;min-height:auto}.u3tr-shell main{padding:18px 14px}.u3tr-head h1{font-size:29px}.u3tr-hero h2{font-size:32px}.u3tr-panel{align-items:flex-start;flex-direction:column}.u3tr-shell footer{grid-template-columns:95px 1fr 95px}}
  `;document.head.appendChild(s);}
  function sync(){injectStyles();injectPanel();}
  const boot=()=>{sync();if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();}state.observer=new MutationObserver(sync);state.observer.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pagehide',stopSpeech);window.addEventListener('beforeunload',stopSpeech);
  window.STEPUP_U3_TEACH_READING={start,next,prev,choose,check,exit:exitLesson,finish,readParagraph:i=>speak(paragraphs()[i]||''),say:w=>speak(w,.8),stop:stopSpeech};
})();
