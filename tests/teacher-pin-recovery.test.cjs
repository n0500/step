const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {createHash, webcrypto} = require('node:crypto');

const code = fs.readFileSync(require.resolve('../teacher-pin-recovery.js'), 'utf8');
const digest = profile => createHash('sha256').update(
  profile.classCode.trim().toUpperCase() + '|' + profile.displayName.toLowerCase().trim().replace(/\s+/g,' ')
).digest('hex');

function fixture(options = {}) {
  const teacher = {role:'teacher',status:'active'};
  const student = {role:'student',teacherId:'teacher-1',classId:'class-1',classCode:'mg1-abc',displayName:'  QA   Student ',pin:'1234'};
  const docs = new Map([['teacher-1',teacher],['student-1',student]]);
  const results = [{studentId:'student-1',percentage:90}];
  const certificates = [{studentId:'student-1',unit:'u1'}];
  const baseline = JSON.stringify({results,certificates});
  const calls = [];
  const authUser = {uid:'teacher-1'};
  const primaryAuth = {currentUser:authUser};
  let accountEmail = 's_' + digest(student).slice(0,24) + '@students.proveit.local';
  let accountPassword = student.pin + 'Aa!' + digest(student).slice(0,4);
  let createCount = 0;
  const ref = (uid,secondary) => ({
    async get(source) {
      assert.equal(source.source,'server');
      assert.deepEqual(Object.keys(source),['source']);
      calls.push([secondary?'student-read':'teacher-read',uid]);
      if(options.getError) throw Object.assign(new Error('offline'),{code:'unavailable'});
      const data = docs.get(uid);
      const copy = data && {...data};
      if(secondary && options.secondaryTeacher) copy.teacherId=options.secondaryTeacher;
      return {exists:!!data,data:()=>copy};
    },
    async update(update) {
      calls.push(['pin-write',uid,update]);
      assert.equal(uid,'student-1');
      assert.equal(secondary,true);
      assert.deepEqual(Object.keys(update),['pin']);
      if(options.writeFailures > 0) {
        options.writeFailures--;
        throw Object.assign(new Error('offline'),{code:'unavailable'});
      }
      Object.assign(docs.get(uid),update);
    }
  });
  const database = secondary => ({collection(name) {
    assert.equal(name,'users','Recovery must not read/write results or certificates');
    return {doc:uid=>ref(uid,secondary)};
  }});
  const authFn = () => primaryAuth;
  authFn.Auth = {Persistence:{NONE:'none'}};
  const firebase = {
    apps:[{}],auth:authFn,firestore:()=>database(false),
    initializeApp(config,name) {
      calls.push(['create-app',name]);
      createCount++;
      assert.equal(config.projectId,'qa-project');
      assert.notEqual(name,'[DEFAULT]');
      const auth = {
        async setPersistence(persistence) {calls.push(['persistence',persistence]);assert.equal(persistence,'none');},
        async signInWithEmailAndPassword(email,password) {
          calls.push(['student-login',email]);
          if(options.pauseLogin) await options.pauseLogin;
          if(email!==accountEmail || password!==accountPassword) {
            throw Object.assign(new Error('wrong credential'),{code:'auth/invalid-credential'});
          }
          if(options.expireTeacher) primaryAuth.currentUser=null;
          return {user:{uid:options.wrongUid || 'student-1',async updatePassword(next) {
            calls.push(['password-change',next]);
            if(options.passwordError) throw Object.assign(new Error('blocked'),{code:'auth/network-request-failed'});
            accountPassword=next;
            if(options.lostResponse) throw Object.assign(new Error('lost response'),{code:'auth/network-request-failed'});
          }}};
        },
        async signOut() {calls.push(['student-signout']);if(options.signoutError) throw new Error('signout failed');}
      };
      return {auth:()=>auth,firestore:()=>database(true),async delete(){calls.push(['delete-app']);}};
    }
  };
  const context = vm.createContext({firebase,PROVEIT_CONFIG:{firebase:{projectId:'qa-project'}},
    crypto:webcrypto,TextEncoder,Uint8Array,Array,Set,Date,Error,String,Promise,console,navigator:{}});
  context.window=context;
  vm.runInContext(code,context);
  return {api:context.STEPUP_PIN_RECOVERY,context,teacher,student,docs,calls,primaryAuth,authUser,
    get createCount(){return createCount;},
    setLinkedEmail(){accountEmail='qa@example.test';},
    verifyPin(pin){return accountPassword===pin+'Aa!'+digest(student).slice(0,4);},
    checkPreserved(){assert.equal(primaryAuth.currentUser,authUser);assert.equal(JSON.stringify({results,certificates}),baseline);}
  };
}

test('changes the actual password on the same UID, then PIN; leaves teacher and achievements intact',async()=>{
  const f=fixture();const before={...f.student};
  const result=await f.api.reset('student-1','0057');
  assert.equal(result.status,'saved');assert.equal(result.studentId,'student-1');
  assert.equal(f.student.pin,'0057');assert.ok(f.verifyPin('0057'));assert.ok(!f.verifyPin('1234'));
  assert.deepEqual(f.student,{...before,pin:'0057'});
  f.checkPreserved();
  assert.ok(f.calls.findIndex(x=>x[0]==='password-change')<f.calls.findIndex(x=>x[0]==='pin-write'));
  assert.deepEqual(f.calls.slice(-2).map(x=>x[0]),['student-signout','delete-app']);
  assert.ok(f.calls.findIndex(x=>x[0]==='persistence')<f.calls.findIndex(x=>x[0]==='student-login'));
});

test('accepts Arabic digits and preserves leading zeroes',async()=>{
  const f=fixture();const result=await f.api.reset('student-1','٠٠٥٧');
  assert.equal(result.pin,'0057');assert.ok(f.verifyPin('0057'));
});

for(const [title,prepare,code] of [
  ['a student caller',f=>{f.teacher.role='student';},'pin/not-teacher'],
  ['an inactive teacher',f=>{f.teacher.status='disabled';},'pin/not-teacher'],
  ['another teacher\'s student',f=>{f.student.teacherId='someone-else';},'pin/not-owned'],
  ['a teacher account as target',f=>{f.student.role='teacher';},'pin/not-owned'],
  ['a missing old PIN',f=>{delete f.student.pin;},'pin/not-saved'],
  ['missing login identity',f=>{delete f.student.classCode;},'pin/missing-identity']
]) test('rejects '+title+' before creating a student session',async()=>{
  const f=fixture();prepare(f);await assert.rejects(f.api.reset('student-1','4321'),{code});
  assert.equal(f.createCount,0);assert.equal(f.calls.filter(x=>x[0]==='password-change').length,0);
  f.checkPreserved();
});

test('does not change a password or create an account when an email-linked login fails',async()=>{
  const f=fixture();f.setLinkedEmail();await assert.rejects(f.api.reset('student-1','4321'),{code:'auth/invalid-credential'});
  assert.equal(f.student.pin,'1234');assert.equal(f.calls.filter(x=>x[0]==='password-change').length,0);
  assert.deepEqual(f.calls.slice(-2).map(x=>x[0]),['student-signout','delete-app']);f.checkPreserved();
});

test('rejects an outdated saved PIN without overwriting the profile',async()=>{
  const f=fixture();f.student.pin='9999';await assert.rejects(f.api.reset('student-1','4321'),{code:'auth/invalid-credential'});
  assert.ok(f.verifyPin('1234'));assert.equal(f.student.pin,'9999');f.checkPreserved();
});

test('verifies the returned student UID before updating',async()=>{
  const f=fixture({wrongUid:'another-account'});await assert.rejects(f.api.reset('student-1','4321'),{code:'pin/identity-mismatch'});
  assert.ok(f.verifyPin('1234'));assert.equal(f.student.pin,'1234');f.checkPreserved();
});

test('re-checks student ownership in the separate session',async()=>{
  const f=fixture({secondaryTeacher:'someone-else'});await assert.rejects(f.api.reset('student-1','4321'),{code:'pin/profile-changed'});
  assert.ok(f.verifyPin('1234'));assert.equal(f.student.pin,'1234');f.checkPreserved();
});

test('a failed Auth update does not write the new PIN',async()=>{
  const f=fixture({passwordError:true});const result=await f.api.reset('student-1','4321');
  assert.equal(result.status,'change-unconfirmed');
  assert.equal(f.student.pin,'1234');assert.ok(f.verifyPin('1234'));
  assert.equal(f.calls.filter(x=>x[0]==='pin-write').length,0);f.checkPreserved();
});

test('a lost response after an accepted password update can be verified and repaired',async()=>{
  const f=fixture({lostResponse:true});const result=await f.api.reset('student-1','4321');
  assert.equal(result.status,'change-unconfirmed');assert.ok(f.verifyPin('4321'));assert.equal(f.student.pin,'1234');
  const repaired=await f.api.repair('student-1',result.pin);
  assert.equal(repaired.status,'saved');assert.equal(f.student.pin,'4321');f.checkPreserved();
});

test('reports a partial write truthfully; retry saves the changed PIN without changing the password twice',async()=>{
  const f=fixture({writeFailures:1});const result=await f.api.reset('student-1','4321');
  assert.equal(result.status,'profile-pending');assert.ok(f.verifyPin('4321'));assert.equal(f.student.pin,'1234');
  const repaired=await f.api.repair('student-1',result.pin);assert.equal(repaired.status,'saved');
  assert.equal(f.student.pin,'4321');assert.equal(f.calls.filter(x=>x[0]==='password-change').length,1);f.checkPreserved();
});

test('blocks duplicate changes while one request is running',async()=>{
  let release;const pauseLogin=new Promise(resolve=>{release=resolve;});const f=fixture({pauseLogin});
  const first=f.api.reset('student-1','4321');
  await new Promise(resolve=>setImmediate(resolve));
  await assert.rejects(f.api.reset('student-1','5678'),{code:'pin/busy'});
  release();await first;assert.equal(f.calls.filter(x=>x[0]==='password-change').length,1);f.checkPreserved();
});

test('respects a lock held by a different browser tab',async()=>{
  const f=fixture();f.context.navigator.locks={request:async(name,options,callback)=>{
    assert.equal(name,'stepup-pin-change-student-1');assert.equal(options.ifAvailable,true);return callback(null);
  }};
  await assert.rejects(f.api.reset('student-1','4321'),{code:'pin/busy'});assert.equal(f.createCount,0);f.checkPreserved();
});

test('removes the secondary app even if sign-out cleanup fails',async()=>{
  const f=fixture({signoutError:true});await f.api.reset('student-1','4321');
  assert.equal(f.calls.at(-1)[0],'delete-app');f.checkPreserved();
});

test('stops if the teacher has logged out before the password change',async()=>{
  const f=fixture({expireTeacher:true});await assert.rejects(f.api.reset('student-1','4321'),{code:'pin/no-session'});
  assert.ok(f.verifyPin('1234'));assert.equal(f.student.pin,'1234');
});

test('invalid or unchanged codes do not modify the student account',async()=>{
  const f=fixture();await assert.rejects(f.api.reset('student-1','12'),{code:'pin/invalid-pin'});
  await assert.rejects(f.api.reset('student-1','1234'),{code:'pin/unchanged'});
  assert.equal(f.createCount,0);assert.ok(f.verifyPin('1234'));f.checkPreserved();
});
