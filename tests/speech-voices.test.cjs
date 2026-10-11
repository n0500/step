const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','speech-voices.js'),'utf8');
const voice=(name,lang='en-US',extra={})=>({name,lang,voiceURI:name,...extra});
function fixture(voices){
  const window={speechSynthesis:{getVoices:()=>voices}};
  vm.runInNewContext(source,{window});
  return{window,pick:count=>Array.from(window.STEPUP_SPEECH.pickEnglish(count))};
}

test('ordinary English speakers replace effect voices at the beginning of the device catalogue',()=>{
  const daniel=voice('Daniel','en-GB'),alex=voice('Alex');
  const f=fixture([voice('Albert'),voice('Bad News'),voice('Bells'),voice('Whisper'),daniel,alex,voice('Maged','ar-SA')]);
  assert.deepEqual(f.pick(2),[alex,daniel]);
});

test('changing catalogue order does not change the chosen speakers',()=>{
  const catalogue=[voice('Boing'),voice('Samantha'),voice('Daniel','en-GB'),voice('Alex'),voice('Google US English')];
  const chosen=fixture(catalogue).pick(2);
  assert.deepEqual(fixture([...catalogue].reverse()).pick(2),chosen);
});

test('different quality variants of one voice do not become two conversation speakers',()=>{
  const alex=voice('Alex (Enhanced)'),samantha=voice('Samantha');
  assert.deepEqual(fixture([alex,voice('Alex'),samantha]).pick(2),[alex,samantha]);
});

test('effect identifiers and non-English languages cannot override a suitable English voice',()=>{
  const ordinary=voice('English reader');
  const f=fixture([voice('English','en-US',{voiceURI:'com.apple.speech.synthesis.voice.Zarvox'}),voice('Daniel','ar-SA'),ordinary]);
  assert.deepEqual(f.pick(2),[ordinary]);
});

test('one ordinary voice remains usable and an effect-only catalogue is not explicitly selected',()=>{
  const samantha=voice('Samantha');
  assert.deepEqual(fixture([voice('Good News'),samantha]).pick(2),[samantha]);
  assert.deepEqual(fixture([voice('Albert'),voice('Bad News')]).pick(2),[]);
});

test('a late device catalogue is read afresh on the next play',()=>{
  const f=fixture([]);
  assert.deepEqual(f.pick(2),[]);
  const daniel=voice('Daniel','en-GB');
  f.window.speechSynthesis.getVoices=()=>[voice('Bad News'),daniel];
  assert.deepEqual(f.pick(2),[daniel]);
});

test('devices without voice enumeration fall back without throwing',()=>{
  const f=fixture([]);
  delete f.window.speechSynthesis;
  assert.deepEqual(f.pick(2),[]);
  f.window.speechSynthesis={getVoices(){throw new Error('unavailable');}};
  assert.deepEqual(f.pick(2),[]);
});
