const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {webcrypto,createHash}=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const path=require('node:path');
const root=path.join(__dirname,'..');
const load=(w,file)=>w.eval(fs.readFileSync(path.join(root,file),'utf8'));
async function until(check){for(let i=0;i<60;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}assert.fail('UI did not reach the expected state');}

function fixture(options={}){
  const dom=new JSDOM('<div id="app"></div>',{url:'https://n0500.github.io/step/',runScripts:'outside-only',virtualConsole:new VirtualConsole()});
  const w=dom.window;
  Object.defineProperty(w,'crypto',{value:webcrypto});w.TextEncoder=TextEncoder;
  const teacher={id:'teacher-1',role:'teacher',status:'active',displayName:'QA Teacher'};
  const student={id:'student-1',role:'student',teacherId:teacher.id,classId:'class-1',classCode:'MG1-QA',displayName:options.name||'QA Student',pin:options.missing?undefined:'1234'};
  const missing={...student,id:'missing-1',displayName:'Missing PIN',pin:undefined};
  const docs=new Map([[teacher.id,teacher],[student.id,student],[missing.id,missing]]);
  let observer;let passwordChanges=0;let pinWrites=0;let authPassword='1234';
  const user={uid:teacher.id,email:'teacher@example.test'};
  const auth={currentUser:user,onAuthStateChanged(fn){observer=fn;return()=>{};}};
  const doc=id=>({async get(){
    if(options.quotaError)throw Object.assign(new Error('daily quota'),{code:'resource-exhausted'});
    const p=docs.get(id);return {exists:!!p,id,data:()=>({...p})};
  },async update(v){
    pinWrites++;
    if(options.failWrites>0){options.failWrites--;throw Object.assign(new Error('offline'),{code:'unavailable'});}
    Object.assign(docs.get(id),v);
  }});
  const db={collection(name){return {
    doc,where(){return this;},async get(){
      const values=name==='classes'?[{id:'class-1',name:'QA Class',code:'MG1-QA',teacherId:teacher.id,openUnits:['u1']}]:name==='users'?[student,missing]:[];
      return {docs:values.map(p=>({id:p.id,data:()=>({...p})}))};
    }
  };}};
  const authFn=()=>auth;authFn.Auth={Persistence:{NONE:'none'}};
  w.PROVEIT_CONFIG={firebase:{enabled:true,projectId:'qa-project'},ownerEmail:'owner@example.test'};
  w.firebase={apps:[{}],auth:authFn,firestore:()=>db,initializeApp(){return {
    auth:()=>({async setPersistence(){},async signOut(){},async signInWithEmailAndPassword(email,password){
      const expectedPrefix=authPassword+'Aa!';
      if(!password.startsWith(expectedPrefix))throw Object.assign(new Error('wrong code'),{code:'auth/invalid-credential'});
      return {user:{uid:student.id,async updatePassword(p){passwordChanges++;authPassword=p.slice(0,4);if(options.delayPassword)await options.delayPassword;}}};
    }}),firestore:()=>db,async delete(){}
  };}};
  load(w,'data.js');load(w,'teacher-pin-recovery.js');
  return {dom,w,teacher,student,auth,get changes(){return passwordChanges;},get writes(){return pinWrites;},
    async boot(){load(w,'app.js');await observer(user);await w.PROVE.setTeacherTab('pins');},
    async open(){await w.STEPUP_PIN_RECOVERY.open(student.id);},
    submit(pin){const input=w.document.querySelector('#teacherNewPin');if(pin!==undefined)input.value=pin;w.document.querySelector('.teacher-pin-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));},
    status(){return w.document.querySelector('.teacher-pin-status')?.textContent||'';}
  };
}

test('teacher PINs page exposes the new action for saved PINs and disables it for missing PINs',async()=>{
  const f=fixture();try{
    await f.boot();
    const saved=f.w.document.querySelector('.teacher-pin-reset[data-student-id="student-1"]');
    const missing=f.w.document.querySelector('.teacher-pin-reset[data-student-id="missing-1"]');
    assert.ok(saved);assert.equal(saved.disabled,false);assert.equal(missing.disabled,true);
    saved.click();await until(()=>f.status().includes('اختاري الرمز الجديد'));
    assert.equal(f.w.document.querySelector('.teacher-pin-target').textContent,'QA Student');
    f.submit('0057');await until(()=>f.status().includes('تم تعيين الرمز'));
    assert.equal(f.student.pin,'0057');
    assert.equal(f.w.document.querySelector('.teacher-pin-code').textContent,'0057','teacher list refreshes after success');
    assert.equal(f.auth.currentUser.uid,f.teacher.id);assert.equal(f.changes,1);
  }finally{f.dom.window.close();}
});

test('the dialog never shows success early and blocks repeated submissions',async()=>{
  let release;const delayPassword=new Promise(r=>{release=r;});const f=fixture({delayPassword});
  try{
    await f.open();f.submit('0057');f.submit('0057');
    await until(()=>f.changes===1);
    assert.ok(!f.status().includes('تم تعيين'));assert.equal(f.w.document.querySelector('.teacher-pin-close').disabled,true);
    release();await until(()=>f.status().includes('تم تعيين الرمز'));assert.equal(f.changes,1);
  }finally{release();f.dom.window.close();}
});

test('the partial-write dialog gives the actual new PIN and repairs only the profile',async()=>{
  const f=fixture({failWrites:1});try{
    await f.open();f.submit('0057');await until(()=>f.status().includes('لكن تعذر حفظه'));
    assert.ok(f.status().includes('0057'));assert.equal(f.w.document.querySelector('.teacher-pin-submit').textContent,'إعادة حفظ الرمز');
    assert.equal(f.student.pin,'1234');f.submit();await until(()=>f.status().includes('تم تعيين الرمز'));
    assert.equal(f.student.pin,'0057');assert.equal(f.changes,1);assert.equal(f.writes,2);
  }finally{f.dom.window.close();}
});

test('renders student names as text and rejects an invalid PIN without contacting Auth',async()=>{
  const name='<img src=x onerror=alert(1)>';const f=fixture({name});try{
    await f.open();assert.equal(f.w.document.querySelector('.teacher-pin-target').textContent,name);
    assert.equal(f.w.document.querySelector('.teacher-pin-dialog img'),null);
    f.submit('abcd');assert.equal(f.changes,0);assert.ok(f.status().includes('4 أرقام'));
  }finally{f.dom.window.close();}
});

test('an exhausted daily quota explains the limit without attempting a password change',async()=>{
  const f=fixture({quotaError:true});try{
    await f.open();assert.ok(f.status().includes('حد الاستخدام اليومي المجاني'));
    assert.equal(f.w.document.querySelector('.teacher-pin-submit').disabled,true);assert.equal(f.changes,0);
  }finally{f.dom.window.close();}
});

for(const stale of [true,false])test(stale?'an old captured PIN cannot overwrite a teacher reset':'a new verified PIN repairs an older saved PIN after student login',async()=>{
  const f=fixture();try{
    const captured=stale?'1234':'0057';f.student.pin=stale?'0057':'1234';
    const hash=createHash('sha256').update('MG1-QA|qa student').digest('hex');
    let cb;let checks=0;
    const current={uid:f.student.id,email:'s_'+hash.slice(0,24)+'@students.proveit.local',async reauthenticateWithCredential(c){
      checks++;assert.equal(c.password,captured+'Aa!'+hash.slice(0,4));
      if(stale)throw Object.assign(new Error('old PIN'),{code:'auth/invalid-credential'});
    }};
    const auth=()=>({currentUser:current,onAuthStateChanged(fn){cb=fn;return()=>{};}});
    auth.EmailAuthProvider={credential:(email,password)=>({email,password})};
    f.w.firebase.auth=auth;
    f.w.PROVE={studentContinue(){},studentRegister(){}};
    f.w.sessionStorage.setItem('stepup_pin_to_save',captured);
    load(f.w,'student-account-update.js');cb(current);
    await until(()=>f.w.sessionStorage.getItem('stepup_pin_to_save')===null);
    assert.equal(checks,1);assert.equal(f.student.pin,'0057');assert.equal(f.writes,stale?0:1);
  }finally{f.dom.window.close();}
});
