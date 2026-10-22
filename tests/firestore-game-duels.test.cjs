const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {initializeTestEnvironment,assertSucceeds,assertFails}=require("@firebase/rules-unit-testing");
const {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc,serverTimestamp,Timestamp}=require("firebase/firestore");

test("Signed-in students can create and join private rooms, scores cannot be rewritten",async()=>{
 const env=await initializeTestEnvironment({
  projectId:"demo-step-c44ef",
  firestore:{host:"127.0.0.1",port:8080,rules:fs.readFileSync("firestore.rules","utf8")}
 });
 try{
  await env.withSecurityRulesDisabled(async ctx=>{
   await setDoc(doc(ctx.firestore(),"users","student1"),{role:"student",displayName:"Maha",classId:"c1",teacherId:"t1"});
   await setDoc(doc(ctx.firestore(),"users","student2"),{role:"student",displayName:"Lana",classId:"c1",teacherId:"t1"});
   await setDoc(doc(ctx.firestore(),"users","teacher1"),{role:"teacher",displayName:"Teacher",classId:"c1",teacherId:"t1",status:"active"});
  });
  const a=env.authenticatedContext("student1").firestore();
  const b=env.authenticatedContext("student2").firestore();
  const t=env.authenticatedContext("teacher1").firestore();
  const anon=env.unauthenticatedContext().firestore();
  const roomId="abcdEFGHijklMNOPqrst";
  const room=doc(a,"gameChallenges",roomId);
  const payload={gameId:"grammar-rescue",createdBy:"student1",schema:1,createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+6*86400000)};
  await assertSucceeds(setDoc(room,payload));
  await assertFails(setDoc(doc(b,"gameChallenges","abcdefghijabcdefghij"),payload));
  await assertFails(getDocs(collection(a,"gameChallenges")));
  await assertFails(getDoc(doc(anon,"gameChallenges",roomId)));
  await assertFails(getDoc(doc(t,"gameChallenges",roomId)));
  await assertSucceeds(getDoc(doc(b,"gameChallenges",roomId)));
  const alice=doc(a,"gameChallenges",roomId,"players","student1");
  const bob=doc(b,"gameChallenges",roomId,"players","student2");
  await assertSucceeds(getDoc(alice)); // no player doc yet
  await assertSucceeds(setDoc(alice,{uid:"student1",name:"Maha",joinedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(b,"gameChallenges",roomId,"players","student1"),{uid:"student1",name:"Wrong",joinedAt:serverTimestamp()}));
  await assertFails(getDocs(collection(b,"gameChallenges",roomId,"players")));
  await assertSucceeds(setDoc(bob,{uid:"student2",name:"Lana",joinedAt:serverTimestamp()}));
  await assertSucceeds(getDocs(collection(b,"gameChallenges",roomId,"players")));
  const scores=collection(a,"gameChallenges",roomId,"scores");
  const scoreDoc=doc(scores,"student1_1");
  await assertSucceeds(setDoc(scoreDoc,{uid:"student1",roundKey:"1",questions:4,mistakes:1,seconds:53,points:38,createdAt:serverTimestamp()}));
  await assertSucceeds(getDocs(collection(b,"gameChallenges",roomId,"scores")));
  await assertFails(updateDoc(scoreDoc,{points:40}));
  await assertFails(deleteDoc(scoreDoc));
  await assertFails(setDoc(doc(b,"gameChallenges",roomId,"scores","student1_2"),{uid:"student1",roundKey:"2",questions:4,mistakes:0,seconds:12,points:40,createdAt:serverTimestamp()}));
  await assertFails(setDoc(doc(b,"gameChallenges",roomId,"scores","student2_3"),{uid:"student2",roundKey:"3",questions:4,mistakes:0,seconds:12,points:40,createdAt:serverTimestamp()}));
  assert.ok((await getDoc(scoreDoc)).exists());
 }finally{await env.cleanup()}
});
