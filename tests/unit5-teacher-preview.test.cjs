const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('preview uses actual Unit 5 scripts and only memory for answers, review and FMF',async()=>{
 const source=read('unit5-teacher-preview.html'),dom=new JSDOM(source,{url:'https://n0500.github.io/step/unit5-teacher-preview.html',runScripts:'outside-only'}),w=dom.window;
 try{
  w.fetch=()=>assert.fail('No network writes');w.HTMLElement.prototype.scrollIntoView=function(){};
  for(const s of w.document.querySelectorAll('script'))w.eval(s.src?read(new URL(s.src).pathname.split('/').at(-1)):s.textContent);
  await new Promise(r=>setTimeout(r,100));
  assert.ok(w.document.querySelector('[data-unit="u5"]'));
  assert.equal(w.firebase.firestore,undefined);
  const J=w.STEPUP_JOURNEY,h=w.document.querySelector('.student-view');J.startCore('u5',0);
  const count=J.data.questions.filter(q=>q.unit_id==='MG1_U5'&&q.mission===J.data.units.find(u=>u.id==='u5').missions[0].source).length;
  for(let i=0;i<count;i++){J.answer(0);assert.ok(h.querySelector('.answer-explanation'));await J.feedbackNext();}
  assert.match(h.textContent,/Result saved/);assert.ok(w.STEPUP_MASTERY.progressDetails('u5').answered>0);
  w.previewHome();w.STEPUP_U56_PRACTICE.begin('u5');w.STEPUP_U56_PRACTICE.select(0);w.STEPUP_U56_PRACTICE.confirm();assert.match(h.textContent,/Your answer:/);
  assert.ok(w.localStorage.getItem('stepup-u56-full-review-v1-teacher-preview-u5'));
  w.STEPUP_U5_LIVE.openStudent();assert.match(h.textContent,/Safety Mission/);
  assert.match(source,/connect-src 'none'/);assert.doesNotMatch(source,/firebase-config|firebasejs|app\.js/);
 }finally{w.close();}
});
test('teacher-only dialog is sandboxed and closes cleanly',()=>{
 const dom=new JSDOM('<button id="launch">Preview</button>',{url:'https://n0500.github.io/step/',runScripts:'outside-only'}),w=dom.window;
 try{
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  const app=read('app.js'),fn=app.slice(app.indexOf('  function previewUnit5(){'),app.indexOf('  function previewUnit4(){'));
  w.eval('var state={profile:{role:"student"}};'+fn);w.previewUnit5();assert.equal(w.document.querySelector('dialog'),null);
  w.eval('state.profile.role="teacher"');w.document.querySelector('#launch').focus();w.previewUnit5();
  const dialog=w.document.querySelector('dialog'),frame=dialog.querySelector('iframe');assert.equal(frame.getAttribute('sandbox'),'allow-scripts allow-modals');assert.equal(dialog.open,true);
  dialog.querySelector('button').click();assert.equal(w.document.querySelector('iframe'),null);assert.equal(w.document.activeElement.id,'launch');
  assert.equal((app.match(/onclick="PROVE.previewUnit5\(\)"/g)||[]).length,2);
 }finally{w.close();}
});
