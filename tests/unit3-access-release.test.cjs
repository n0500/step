const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');

const root=path.join(__dirname,'..');
const load=(w,file)=>w.eval(fs.readFileSync(path.join(root,file),'utf8'));
async function until(check){
  for(let i=0;i<80;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}
  assert.fail('student dashboard did not finish rendering');
}

function fixture(unitAccessRelease){
  const dom=new JSDOM('<div id="app"></div>',{url:'https://n0500.github.io/step/?class=MG1-QA',runScripts:'outside-only',virtualConsole:new VirtualConsole()});
  const w=dom.window;
  Object.defineProperty(w,'crypto',{value:webcrypto});w.TextEncoder=TextEncoder;
  load(w,'data.js');
  let shown=[];
  w.STEPUP_U3_REVIEW={};
  w.STEPUP_JOURNEY={
    data:{units:[{id:'u3',number:3,title:'What Will Be, Will Be',missions:[]}]},
    homeHTML(_attempts,open){shown=open.map(u=>u.id);return '<div data-open-units="'+shown.join(',')+'"></div>';},
    html(_attempts,open){shown=open.map(u=>u.id);return '<div data-open-units="'+shown.join(',')+'"></div>';},
    progressHTML(){return '';}
  };
  const student={id:'student-1',role:'student',displayName:'QA Student',classId:'class-1',classCode:'MG1-QA',teacherId:'teacher-1'};
  const cls={id:'class-1',name:'QA Class',code:'MG1-QA',teacherId:'teacher-1',openUnits:['u1','u2']};
  if(unitAccessRelease!==undefined)cls.unitAccessRelease=unitAccessRelease;
  let observer;
  const auth={currentUser:{uid:student.id},onAuthStateChanged(fn){observer=fn;return()=>{};}};
  const db={collection(name){return {
    doc(id){return {async get(){const value=name==='users'?student:name==='classes'?cls:null;return {exists:!!value,id,data:()=>({...value})};}};},
    where(){return this;},async get(){return {docs:[]};}
  };}};
  w.PROVEIT_CONFIG={firebase:{enabled:true,projectId:'qa'},ownerEmail:'owner@example.test'};
  w.firebase={apps:[{}],auth:()=>auth,firestore:()=>db};
  return {dom,w,get shown(){return shown;},async boot(){load(w,'app.js');await observer(auth.currentUser);await until(()=>w.document.querySelector('[data-open-units]'));}};
}

test('the Unit 3 release opens it for every existing class without changing saved attempts',async()=>{
  const f=fixture();
  try{
    await f.boot();
    assert.equal(f.shown.join(','),'u1,u3');
    assert.equal(f.w.document.querySelector('[data-open-units]').getAttribute('data-open-units'),'u1,u3');
  }finally{f.dom.window.close();}
});

test('a later teacher access choice can still close Unit 3',async()=>{
  const f=fixture(3);
  try{
    await f.boot();
    assert.equal(f.shown.join(','),'u1');
  }finally{f.dom.window.close();}
});
