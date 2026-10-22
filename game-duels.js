// Games Arcade friend challenges. Separate from STEP UP mastery and certificate data.
(function(){
"use strict";
const GAME="grammar-rescue", GAME_PATH="games/grammar-rescue/index.html";
const ROUND_NAMES=["Production Lab","Product Showroom","Smart Shopping Mall","The Big Launch"];
const ROUND_QUESTIONS={"1":4,"2":4,"3":7,"4":3};
const ROOM_RE=/^[A-Za-z0-9_-]{20,48}$/;
const PARAM=new URLSearchParams(location.search);
const incoming=PARAM.get("challenge");
if(incoming&&ROOM_RE.test(incoming)){try{sessionStorage.setItem("stepup_game_invite",incoming)}catch(e){}}
let roomId="",roomsUnsubscribe=[],roster=[],roundScores=[],activeRoom="",loading=false,inviteOpened="";
const $=id=>document.getElementById(id);
const clean=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function db(){if(!window.firebase||!firebase.firestore)throw Error("Firebase is unavailable.");return firebase.firestore();}
function signedIn(){const user=window.firebase?.auth?.()?.currentUser;if(!user)throw Error("Please sign in to your STEP UP student account first.");return user;}
async function student(){
 const u=signedIn(),p=await db().collection("users").doc(u.uid).get();
 if(!p.exists||p.data().role!=="student")throw Error("Friend challenges are for signed-in students.");
 const first=String(p.data().displayName||"Player").trim().split(/\s+/)[0].slice(0,40)||"Player";
 return {uid:u.uid,name:first};
}
function idNew(){
 const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);
 return Array.from(bytes,n=>"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[n%64]).join("")+"aa";
}
function roomRef(id){return db().collection("gameChallenges").doc(id)}
function inviteUrl(id){const url=new URL(location.pathname,location.origin);url.searchParams.set("challenge",id);return url.toString()}
function savedKey(uid){return "stepup_duels_"+uid}
function saveRecent(uid,id){
 try{let v=JSON.parse(localStorage.getItem(savedKey(uid))||"[]");if(!Array.isArray(v))v=[];v=[id,...v.filter(x=>x!==id)].slice(0,8);localStorage.setItem(savedKey(uid),JSON.stringify(v))}catch(e){}
}
function stopWatching(){roomsUnsubscribe.forEach(u=>{try{u()}catch(e){}});roomsUnsubscribe=[]}
function closePanel(){stopWatching();$("stepupDuelOverlay")?.remove();roomId="";loading=false}
function errorMessage(e){
 const message=String(e?.code||e?.message||e);
 if(/permission-denied|insufficient.permissions|PERMISSION_DENIED/i.test(message))return "The competition database is not enabled yet. Ask your teacher to activate the Games Arcade rules.";
 if(/unavailable|network|deadline/i.test(message))return "Connection problem. Check your internet and try again.";
 return message.slice(0,230);
}
function showError(e){
 const message=errorMessage(e);const feedback=$("duelFeedback");
 if(feedback){feedback.textContent=message;feedback.classList.add("duel-error")}
 else window.alert(message);
}
function panel(title,body){
 closePanel();
 const overlay=document.createElement("div");
 overlay.id="stepupDuelOverlay";
 overlay.innerHTML='<div class="duel-box" role="dialog" aria-modal="true" aria-label="Friend challenge"><header class="duel-head"><div><div class="duel-kicker">STEP UP · FRIEND CHALLENGE</div><h2>'+clean(title)+'</h2></div><button class="duel-close" data-duel-close aria-label="Close">✕</button></header>'+body+'</div>';
 document.body.appendChild(overlay);
}
function scoreBoard(){
 const table=$("duelScoreboard");if(!table)return;
 const map={};
 for(const p of roster)map[p.uid]={name:p.name,uid:p.uid,points:0,seconds:0,played:0,details:{}};
 for(const s of roundScores){
  const p=map[s.uid];if(!p||p.details[s.roundKey])continue;
  p.details[s.roundKey]=s;p.played++;p.points+=s.points;p.seconds+=s.seconds;
 }
 const sorted=Object.values(map).sort((a,b)=>b.played-a.played||b.points-a.points||a.seconds-b.seconds||a.name.localeCompare(b.name));
 const count=$("duelPlayerCount");if(count)count.textContent=sorted.length+" players joined";
 table.innerHTML=sorted.length?'<div class="duel-table"><div class="duel-th"><span>Rank · Player</span><span>Rounds</span><span>Points</span></div>'+
 sorted.map((p,i)=>'<div class="duel-tr"><span>'+(i===0?'🥇 ':i===1?'🥈 ':i===2?'🥉 ':'#'+(i+1)+' ')+clean(p.name)+'</span><span>'+p.played+'/4</span><strong>'+p.points+'</strong></div>').join("")+'</div>':'<p class="duel-note">You are the first player. Share the invitation link!</p>';
 const roundList=$("duelRoundResults");if(roundList)roundList.innerHTML=ROUND_NAMES.map((name,i)=>{
  const key=String(i+1),finish=roundScores.filter(x=>x.roundKey===key).length;
  return '<div class="duel-round"><b>0'+key+' · '+clean(name)+'</b><small>'+finish+' finished · '+ROUND_QUESTIONS[key]+' challenges</small></div>';
 }).join("");
}
function watchRoom(id){
 stopWatching();roster=[];roundScores=[];
 roomsUnsubscribe.push(roomRef(id).collection("players").onSnapshot(s=>{
  roster=s.docs.map(d=>d.data());scoreBoard();
 },e=>showError(e)));
 roomsUnsubscribe.push(roomRef(id).collection("scores").onSnapshot(s=>{
  roundScores=s.docs.map(d=>d.data());scoreBoard();
 },e=>showError(e)));
}
async function openRoom(id){
 if(!ROOM_RE.test(id))throw Error("Invalid invitation link.");
 const u=await student(),ref=roomRef(id),snap=await ref.get();
 if(!snap.exists||snap.data().gameId!==GAME)throw Error("This challenge link is not available.");
 if(snap.data().expiresAt.toMillis()<=Date.now())throw Error("This challenge link has expired.");
 const player=ref.collection("players").doc(u.uid);
 const exists=await player.get();
 if(!exists.exists)await player.set({uid:u.uid,name:u.name,joinedAt:firebase.firestore.FieldValue.serverTimestamp()});
 saveRecent(u.uid,id);
 roomId=id;
 panel("Grammar Rescue · Competition",
 '<p class="duel-note">4 rounds · 18 challenges. Play anytime—your friends do not need to be online.</p>'+
 '<div class="duel-actions"><button data-duel-copy class="duel-primary">🔗 Copy invite link</button><button data-duel-share class="duel-secondary">Share</button></div>'+
 '<div class="duel-invite-url" id="duelInviteUrl">'+clean(inviteUrl(id))+'</div>'+
 '<div class="duel-steps" id="duelRoundResults"></div>'+
 '<div class="duel-standings-head"><h3>🏆 Leaderboard</h3><small id="duelPlayerCount"></small></div>'+
 '<div id="duelScoreboard"></div>'+
 '<div class="duel-actions"><button data-duel-play class="duel-primary">▶ Start / Continue Game</button>'+
 '<button data-duel-arcade class="duel-secondary">Back to Games</button></div>'+
 '<p id="duelFeedback" class="duel-status">Scores are only for friendly games. They do not change STEP UP mastery or certificates.</p>');
 roomId=id;activeRoom=id;watchRoom(id);
}
async function createRoom(){
 if(loading)return;loading=true;
 try{
  const u=await student(),id=idNew(),ref=roomRef(id);
  await ref.set({gameId:GAME,createdBy:u.uid,schema:1,createdAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:firebase.firestore.Timestamp.fromMillis(Date.now()+6*86400000)});
  await openRoom(id);
 }catch(e){showError(e)}finally{loading=false}
}
async function joinRoom(id){
 if(loading)return;loading=true;
 try{await openRoom(id);try{sessionStorage.removeItem("stepup_game_invite")}catch(e){}}
 catch(e){showError(e)}finally{loading=false}
}
async function showRecent(){
 try{
  const u=await student();
  const ids=JSON.parse(localStorage.getItem(savedKey(u.uid))||"[]");
  if(!Array.isArray(ids)||!ids.length){window.alert("No previous competitions yet. Create one from Grammar Rescue!");return}
  panel("My competitions",'<p class="duel-note">Choose a recent invitation to view scores or play again.</p>'+
   ids.filter(id=>ROOM_RE.test(id)).map(id=>'<button class="duel-recent" data-duel-open="'+id+'">🏆 '+clean(id.slice(0,8))+'… <span>View room →</span></button>').join("")+
   '<p id="duelFeedback" class="duel-status"></p>');
 }catch(e){showError(e)}
}
function startGame(){
 const id=roomId||activeRoom;
 if(!id){showError(Error("Please open a competition room first."));return}
 activeRoom=id;closePanel();
 window.STEPUP_GAMES_ARCADE?.launchGame(GAME_PATH);
 document.querySelector("#stepupArcadeGameOverlay .arc-gamebar")?.insertAdjacentHTML("beforeend",'<button type="button" data-duel-rankings>🏆 Standings</button>');
}
async function copyLink(){
 const url=inviteUrl(roomId);
 try{await navigator.clipboard.writeText(url);const x=$("duelFeedback");if(x){x.textContent="✓ Link copied! Send it to your friends.";x.classList.remove("duel-error")}}
 catch(e){const box=$("duelInviteUrl");if(box){const range=document.createRange();range.selectNodeContents(box);getSelection()?.removeAllRanges();getSelection()?.addRange(range);}showError(Error("Select and copy the link above."))}
}
async function shareLink(){
 const url=inviteUrl(roomId);
 if(navigator.share){try{await navigator.share({title:"STEP UP · Grammar Rescue",text:"Join my Grammar Rescue challenge!",url})}catch(e){if(e.name!=="AbortError")await copyLink()}}
 else await copyLink();
}
async function recordRound(message){
 if(!activeRoom||!ROOM_RE.test(activeRoom))return;
 const id=activeRoom,u=signedIn();
 const round=String(message.round),questions=ROUND_QUESTIONS[round];
 if(message.game!==GAME||!questions||message.questions!==questions)return;
 const mistakes=Math.max(0,Math.min(questions*5,Number(message.mistakes)||0));
 const seconds=Math.max(1,Math.min(7200,Math.round(Number(message.seconds)||1)));
 const ref=roomRef(id).collection("scores").doc(u.uid+"_"+round);
 try{
  if((await ref.get()).exists)return;  // Scores are final per round—replays never rewrite them.
  await ref.set({uid:u.uid,roundKey:round,questions,mistakes,seconds,
   points:questions*10-mistakes*2,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  const bar=document.querySelector("#stepupArcadeGameOverlay .arc-gamebar strong");
  if(bar)bar.textContent="✅ Round "+round+" of 4 saved · Grammar Rescue";
 }catch(e){const bar=document.querySelector("#stepupArcadeGameOverlay .arc-gamebar strong");if(bar)bar.textContent="⚠ Round "+round+" score not saved";}
}
window.addEventListener("message",event=>{
 if(event.origin!==location.origin||event.data?.type!=="STEPUP_DUEL_ROUND")return;
 const frame=document.querySelector("#stepupArcadeGameOverlay iframe.arc-gameframe");
 if(!frame||event.source!==frame.contentWindow)return;
 recordRound(event.data);
});
document.addEventListener("click",event=>{
 const x=event.target;
 if(x.closest("[data-duel-create]")){createRoom();return}
 if(x.closest("[data-duel-close]")){closePanel();return}
 if(x.closest("[data-duel-copy]")){copyLink();return}
 if(x.closest("[data-duel-share]")){shareLink();return}
 if(x.closest("[data-duel-play]")){startGame();return}
 if(x.closest("[data-duel-arcade]")){closePanel();window.STEPUP_GAMES_ARCADE?.open();return}
 if(x.closest("[data-duel-rankings]")){joinRoom(activeRoom);return}
 if(x.closest("[data-duel-recent-list]")){showRecent();return}
 const recent=x.closest("[data-duel-open]");if(recent)joinRoom(recent.dataset.duelOpen);
});
function offerInvite(){
 let id="";try{id=sessionStorage.getItem("stepup_game_invite")||""}catch(e){}
 if(!id||!ROOM_RE.test(id)||id===inviteOpened)return;
 if(!document.querySelector('nav.student-nav[data-role="student"]'))return;
 inviteOpened=id;joinRoom(id);
}
function boot(){
 const app=$("app")||document.body;
 new MutationObserver(offerInvite).observe(app,{childList:true,subtree:true});
 offerInvite();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
window.STEPUP_GAME_DUELS={create:createRoom,join:joinRoom,recent:showRecent,leave:function(){activeRoom="";closePanel()}};
})();