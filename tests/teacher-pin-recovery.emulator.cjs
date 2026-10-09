// Run with the official Firebase Auth emulator on 127.0.0.1:9099.
// Only the Auth SDK is emulated. Firestore is a permission-checked test store.
// No production project or real student account is contacted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {createHash,webcrypto} = require('node:crypto');
const sdk = require('firebase/compat/app');
require('firebase/compat/auth');

const config = {projectId:'demo-stepup-pin',apiKey:'demo-key',authDomain:'demo-stepup-pin.firebaseapp.com'};
const emulator = 'http://127.0.0.1:9099';
const docs = new Map();
let passwordChanges = 0;
let failWrites = 0;
function setup(name) {
  const app = sdk.initializeApp(config,name);
  app.auth().useEmulator(emulator,{disableWarnings:true});
  return app;
}
function database(auth) {
  return {collection(name){
    assert.equal(name,'users');
    return {doc(id){return {
      async get(options){
        assert.equal(options.source,'server');
        const user=auth.currentUser;
        const target=docs.get(id);
        const me=docs.get(user.uid);
        assert.ok(user.uid===id || (me.role==='teacher' && target.teacherId===user.uid),'profile read must obey ownership');
        return {exists:!!target,data:()=>({...target})};
      },
      async update(update){
        assert.equal(auth.currentUser.uid,id,'PIN update is authenticated as the same student');
        assert.equal(docs.get(id).role,'student');
        assert.deepEqual(Object.keys(update),['pin'],'shipped rules allow students to update only PIN/name');
        if(failWrites>0){failWrites--;throw Object.assign(new Error('offline'),{code:'unavailable'});}
        Object.assign(docs.get(id),update);
      }
    };}};
  }};
}

(async()=>{
  const primary=setup('[DEFAULT]');
  await primary.auth().setPersistence(sdk.auth.Auth.Persistence.NONE);
  const teacher=(await primary.auth().createUserWithEmailAndPassword('pin-test-teacher@example.test','Teacher!0057')).user;
  docs.set(teacher.uid,{role:'teacher',status:'active'});
  const profile={role:'student',displayName:'QA Student',classCode:'MG1-QA',teacherId:teacher.uid,classId:'class-qa',pin:'1234'};
  const hash=createHash('sha256').update('MG1-QA|qa student').digest('hex');
  const email='s_'+hash.slice(0,24)+'@students.proveit.local';
  const password=pin=>pin+'Aa!'+hash.slice(0,4);
  const seed=setup('seed');
  await seed.auth().setPersistence(sdk.auth.Auth.Persistence.NONE);
  const student=(await seed.auth().createUserWithEmailAndPassword(email,password(profile.pin))).user;
  docs.set(student.uid,profile);
  const achievements={attempts:[{studentId:student.uid,percentage:90}],certificates:[{studentId:student.uid,unit:'u1'}]};
  const original=JSON.stringify(achievements);
  await seed.auth().signOut();await seed.delete();

  const auth=()=>primary.auth();auth.Auth=sdk.auth.Auth;
  const facade={apps:sdk.apps,auth,firestore:()=>database(primary.auth()),initializeApp(options,name){
    assert.equal(options.projectId,'demo-stepup-pin');
    const app=setup(name);
    const a=app.auth();
    return {auth:()=>({setPersistence:p=>a.setPersistence(p),signOut:()=>a.signOut(),
      async signInWithEmailAndPassword(email,password){
        const login=await a.signInWithEmailAndPassword(email,password);
        return {user:{uid:login.user.uid,async updatePassword(password){passwordChanges++;return login.user.updatePassword(password);}}};
      }}),firestore:()=>database(a),delete:()=>app.delete()};
  }};
  const context=vm.createContext({firebase:facade,PROVEIT_CONFIG:{firebase:config},crypto:webcrypto,TextEncoder,Uint8Array,Array,Set,Date,Error,String,Promise,navigator:{}});
  context.window=context;
  vm.runInContext(fs.readFileSync(require.resolve('../teacher-pin-recovery.js'),'utf8'),context);
  const api=context.STEPUP_PIN_RECOVERY;
  const result=await api.reset(student.uid,'0057');
  assert.equal(result.status,'saved');assert.equal(profile.pin,'0057');assert.equal(primary.auth().currentUser.uid,teacher.uid);
  const probe=setup('probe');await probe.auth().setPersistence(sdk.auth.Auth.Persistence.NONE);
  await assert.rejects(probe.auth().signInWithEmailAndPassword(email,password('1234')));
  assert.equal((await probe.auth().signInWithEmailAndPassword(email,password('0057'))).user.uid,student.uid);
  await probe.auth().signOut();

  failWrites=1;
  const partial=await api.reset(student.uid,'0061');
  assert.equal(partial.status,'profile-pending');assert.equal(profile.pin,'0057');
  assert.equal((await probe.auth().signInWithEmailAndPassword(email,password('0061'))).user.uid,student.uid);
  await probe.auth().signOut();
  const repair=await api.repair(student.uid,'0061');
  assert.equal(repair.status,'saved');assert.equal(profile.pin,'0061');assert.equal(passwordChanges,2);
  assert.equal(primary.auth().currentUser.uid,teacher.uid);assert.equal(JSON.stringify(achievements),original);
  await probe.delete();await primary.auth().signOut();await primary.delete();
  console.log('PASS: official Firebase Auth SDK accepts the new PIN and rejects the old PIN on the same UID.');
  console.log('PASS: in-memory secondary Auth leaves the teacher signed in; a failed PIN write can be repaired.');
})().catch(async e=>{console.error(e);for(const app of sdk.apps){try{await app.delete();}catch(_){}}process.exitCode=1;});
