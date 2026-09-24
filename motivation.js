(() => {
  const VERSION = "20260924-pro-ui-1";
  const SEEN_KEY = "stepup_motivation_seen_attempt_v1";
  let lastSignature = "";
  let pending = false;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toDate = (v) => {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const dayKey = d => {
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  const addDays = (d,n) => { const x=new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()+n); return x; };

  function pointsForAttempt(a){
    const p=Math.max(0,Math.min(100,Number(a?.percentage||0)));
    return 25 + (p>=95?35:p>=80?25:p>=60?15:8);
  }

  function gamify(attempts){
    const xp=attempts.reduce((s,a)=>s+pointsForAttempt(a),0);
    const levels=[
      {min:0,name:"Explorer"},
      {min:300,name:"Momentum"},
      {min:700,name:"Achiever"},
      {min:1200,name:"Trailblazer"},
      {min:1800,name:"Champion"},
      {min:2600,name:"Master"}
    ];
    let idx=0;
    for(let i=0;i<levels.length;i++) if(xp>=levels[i].min) idx=i;
    const cur=levels[idx], next=levels[idx+1]||null;
    const levelNum=idx+1;
    const within=next?xp-cur.min:1;
    const span=next?next.min-cur.min:1;
    const progress=next?Math.max(4,Math.min(100,Math.round(within/span*100))):100;
    const remaining=next?Math.max(0,next.min-xp):0;

    const active=new Set(attempts.map(a=>toDate(a.submittedAt||a.createdAt)).filter(Boolean).map(dayKey));
    const today=new Date(); today.setHours(0,0,0,0);
    let cursor=active.has(dayKey(today))?today:addDays(today,-1);
    let streak=0;
    while(active.has(dayKey(cursor))){streak++;cursor=addDays(cursor,-1);}
    return {xp,levelNum,name:cur.name,nextName:next?.name||"Master",progress,remaining,streak,todayDone:active.has(dayKey(today))};
  }

  async function loadAttempts(){
    try{
      if (!window.firebase?.auth || !window.firebase?.firestore) return [];
      const user=firebase.auth().currentUser;
      if(!user) return [];
      const snap=await firebase.firestore().collection("attempts").where("studentId","==",user.uid).get();
      return snap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(e){
      console.warn("StepUp motivation: attempts unavailable",e);
      return [];
    }
  }

  function colorJourneyStops(){
    document.querySelectorAll('.journey-stop').forEach(stop=>{
      const t=(stop.textContent||"").toLowerCase();
      stop.classList.remove('stage-master','stage-read','stage-listen','stage-step','stage-final');
      if(t.includes('master')) stop.classList.add('stage-master');
      else if(t.includes('read')) stop.classList.add('stage-read');
      else if(t.includes('listen')) stop.classList.add('stage-listen');
      else if(t.includes('step')) stop.classList.add('stage-step');
      else if(t.includes('final')) stop.classList.add('stage-final');
    });
  }

  function enhanceNextMove(){
    const card=document.querySelector('.journey-continue');
    if(!card) return;
    const kicker=card.querySelector('.journey-kicker');
    if(kicker) kicker.textContent='Your next move';
    const btn=card.querySelector('.journey-main-btn');
    if(btn) btn.innerHTML='Start session <span aria-hidden="true">→</span>';
    if(!card.querySelector('.motivation-time')){
      const copy=card.querySelector('.journey-continue-copy')||card.firstElementChild;
      if(copy){
        const tag=document.createElement('span');
        tag.className='motivation-time';
        tag.textContent='2–4 min session';
        copy.insertBefore(tag, copy.querySelector('.journey-mini-progress')||null);
      }
    }
  }

  function insertMotivationUI(stats){
    const home=document.querySelector('.student-home-clean');
    if(!home) return;
    document.getElementById('stepupMotivation')?.remove();
    document.getElementById('stepupQuickWin')?.remove();

    const welcome=home.querySelector('.student-welcome');
    const nextCard=home.querySelector('.journey-continue');
    const nextTitle=nextCard?.querySelector('h2')?.textContent?.trim()||'your next stop';
    const nextTask=nextCard?.querySelector('p strong')?.textContent?.trim()||'Keep moving';

    const panel=document.createElement('section');
    panel.id='stepupMotivation';
    panel.className='motivation-panel';
    panel.innerHTML=`
      <div class="motivation-level">
        <span class="motivation-level-no">Level ${stats.levelNum}</span>
        <div><b>${esc(stats.name)}</b><small>${stats.xp} XP</small></div>
      </div>
      <div class="motivation-xp">
        <div class="motivation-xp-line"><span>${stats.nextName==='Master'&&stats.remaining===0?'Top level reached':'Next level'}</span><strong>${stats.remaining?`${stats.remaining} XP to ${esc(stats.nextName)}`:'Keep your momentum'}</strong></div>
        <div class="motivation-xp-track"><i style="width:${stats.progress}%"></i></div>
      </div>
      <div class="motivation-streak ${stats.streak?'hot':''}">
        <span class="motivation-streak-mark">↗</span><div><b>${stats.streak} day${stats.streak===1?'':'s'}</b><small>${stats.todayDone?'Today counts ✓':'A quick win keeps it going'}</small></div>
      </div>`;
    if(welcome) welcome.insertAdjacentElement('afterend',panel); else home.prepend(panel);

    const quick=document.createElement('section');
    quick.id='stepupQuickWin';
    quick.className='quick-win-card';
    quick.innerHTML=`
      <div class="quick-win-icon">01</div>
      <div class="quick-win-copy"><span>Today's focus</span><b>${esc(nextTask)}</b><small>${esc(nextTitle)} • one small step</small></div>
      <button type="button">Open</button>`;
    quick.querySelector('button').addEventListener('click',()=>{
      const continueBtn=document.querySelector('.journey-continue .journey-main-btn');
      if(continueBtn) continueBtn.click(); else window.PROVE?.setStudentTab?.('journey');
    });
    if(nextCard) nextCard.insertAdjacentElement('afterend',quick); else panel.insertAdjacentElement('afterend',quick);

    const weekly=home.querySelector('.student-weekly-card');
    if(weekly) weekly.classList.add('motivation-weekly-secondary');
  }

  function maybeCelebrate(attempts){
    if(!attempts.length) return;
    const sorted=[...attempts].sort((a,b)=>(toDate(b.submittedAt||b.createdAt)?.getTime()||0)-(toDate(a.submittedAt||a.createdAt)?.getTime()||0));
    const latest=sorted[0];
    const d=toDate(latest.submittedAt||latest.createdAt);
    if(!d || Date.now()-d.getTime()>15*60*1000) return;
    const key=`${latest.id||latest.trainingId||''}|${d.toISOString()}`;
    const seen=localStorage.getItem(SEEN_KEY);
    if(seen===key) return;
    localStorage.setItem(SEEN_KEY,key);
    const toast=document.createElement('div');
    toast.className='motivation-toast';
    toast.innerHTML=`<span>✓</span><div><b>Progress saved</b><small>+${pointsForAttempt(latest)} XP • keep going</small></div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add('show'));
    setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),350)},3500);
  }

  async function refresh(){
    if(pending) return;
    const home=document.querySelector('.student-home-clean');
    if(!home){ colorJourneyStops(); return; }
    pending=true;
    try{
      enhanceNextMove();
      const attempts=await loadAttempts();
      const signature=`${attempts.length}|${attempts.reduce((m,a)=>Math.max(m,toDate(a.submittedAt||a.createdAt)?.getTime()||0),0)}`;
      if(signature!==lastSignature || !document.getElementById('stepupMotivation')){
        lastSignature=signature;
        insertMotivationUI(gamify(attempts));
        maybeCelebrate(attempts);
      }
      colorJourneyStops();
    }finally{pending=false;}
  }

  const observer=new MutationObserver(()=>{
    clearTimeout(observer._t);
    observer._t=setTimeout(refresh,90);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',refresh);
  window.addEventListener('load',refresh);
  setTimeout(refresh,700);
  window.STEPUP_MOTIVATION={version:VERSION,refresh};
})();
