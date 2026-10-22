const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');

for(const file of ['game-duels.js','games-arcade.js','games/grammar-rescue/game.js']){
 test('JavaScript parses: '+file,()=>{
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{filename:file}));
 });
}
test('18 tasks and four distinct game rounds are configured',()=>{
 const game=fs.readFileSync(path.join(__dirname,'..','games/grammar-rescue/game.js'),'utf8');
 const a=/const levels=([\s\S]*?);\nlet level=/.exec(game);
 const b=/const chapters=([\s\S]*?);\nlet currentChapter=/.exec(game);
 assert.ok(a&&b);
 const levels=JSON.parse(a[1]),chapters=JSON.parse(b[1]);
 assert.equal(levels.length,4);
 assert.deepEqual([2,3,4].map(n=>chapters[n].tasks.length),[4,7,3]);
 assert.match(game,/reportDuelRound\(1,4/);
 assert.match(game,/reportDuelRound\(currentChapter/);
});
function site(){
 const dom=new JSDOM('<!doctype html><html><body><div id="app"><nav class="role-tabs student-nav" data-role="student"></nav></div></body></html>',{
   url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true
 });
 dom.window.eval(fs.readFileSync(path.join(__dirname,'..','games-arcade.js'),'utf8'));
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 return dom;
}
test('student sees Games and Challenge Friends but no changes to training',()=>{
 const dom=site(),{document}=dom.window;
 const nav=document.querySelector('.student-nav');
 assert.ok(nav.querySelector('[data-arc-open]'));
 nav.querySelector('[data-arc-open]').click();
 assert.equal(document.querySelectorAll('.arc-unit').length,6);
 assert.equal(document.querySelectorAll('[data-duel-create]').length,1);
 assert.match(document.querySelector('#stepupGamesArcade').textContent,/Grammar Rescue/);
 assert.match(document.querySelector('#stepupGamesArcade').textContent,/Play Solo/);
 document.querySelector('[data-arc-game="Grammar Rescue"]').click();
 assert.ok(document.querySelector('#stepupArcadeGameOverlay iframe'));
 assert.match(document.querySelector('#stepupArcadeGameOverlay iframe').getAttribute('src'),/games\/grammar-rescue\/index.html/);
 dom.window.close();
});
function fakeFirebase(){
 const records=new Map();
 const current={uid:'student_001'};
 const TS={serverTimestamp:()=>new Date(),fromMillis:(n)=>({toMillis:()=>n})};
 function coll(base){
  return {doc:id=>doc(base+'/'+id),onSnapshot(fn){
    const prefix=base+'/';
    fn({docs:[...records.entries()].filter(([k])=>k.startsWith(prefix)&&!k.slice(prefix.length).includes('/')).map(([key,val])=>({id:key.slice(prefix.length),data:()=>val}))});
    return ()=>{};
  }};
 }
 function doc(key){
  return {id:key.split('/').pop(),async get(){const v=records.get(key);return {exists:!!v,id:key.split('/').pop(),data:()=>v}},async set(v){records.set(key,v)},collection:sub=>coll(key+'/'+sub)};
 }
 records.set('users/student_001',{role:'student',displayName:'Maha Almutairi'});
 const f=()=>({collection:coll});
 f.FieldValue={serverTimestamp:TS.serverTimestamp};
 f.Timestamp={fromMillis:TS.fromMillis};
 return {records,current,firebase:{auth:()=>({currentUser:current}),firestore:f}};
}
test('create invite link, join and save each round only once',async()=>{
 const dom=site(),w=dom.window,backend=fakeFirebase();
 w.firebase=backend.firebase;
 w.eval(fs.readFileSync(path.join(__dirname,'..','game-duels.js'),'utf8'));
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 await w.STEPUP_GAME_DUELS.create();
 const panel=w.document.querySelector('#stepupDuelOverlay');
 assert.ok(panel,'Competition modal created');
 const invitation=panel.querySelector('#duelInviteUrl').textContent;
 assert.match(invitation,/\/step\/\?challenge=[A-Za-z0-9_-]{20,48}/);
 assert.ok(panel.querySelector('[data-duel-copy]'));
 assert.ok(panel.querySelector('#duelScoreboard'));
 assert.ok([...backend.records.keys()].some(k=>k.startsWith('gameChallenges/')));
 panel.querySelector('[data-duel-play]').click();
 const frame=w.document.querySelector('#stepupArcadeGameOverlay iframe');
 assert.ok(frame,'Original Grammar Rescue game launched in competition');
 const payload={type:'STEPUP_DUEL_ROUND',game:'grammar-rescue',round:'1',questions:4,mistakes:1,seconds:92};
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data:payload}));
 await new Promise(r=>setTimeout(r,15));
 let scores=[...backend.records.entries()].filter(([key])=>key.includes('/scores/'));
 assert.equal(scores.length,1);
 assert.equal(scores[0][1].points,38);
 w.dispatchEvent(new w.MessageEvent('message',{origin:w.location.origin,source:frame.contentWindow,data:payload}));
 await new Promise(r=>setTimeout(r,15));
 scores=[...backend.records.entries()].filter(([key])=>key.includes('/scores/'));
 assert.equal(scores.length,1,'Duplicate round cannot overwrite saved score');
 dom.window.close();
});
