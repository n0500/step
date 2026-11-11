const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Unit 5 is released to existing classes while newer teacher closures remain respected',()=>{
  const app=source('app.js');
  const block=app.slice(app.indexOf('const UNIT_ACCESS_RELEASE'),app.indexOf('async function sha256'));
  assert.ok(block.includes('function releasedOpenUnitIds'));
  const access=Function(block+';return {UNIT_ACCESS_RELEASE,releasedOpenUnitIds};')();
  assert.equal(access.UNIT_ACCESS_RELEASE,5);
  assert.ok(access.releasedOpenUnitIds({openUnits:['u1','u3','u4'],unitAccessRelease:3}).includes('u5'));
  assert.ok(access.releasedOpenUnitIds({openUnits:['u1'],unitAccessRelease:0}).includes('u3'));
  assert.ok(access.releasedOpenUnitIds({openUnits:['u1'],unitAccessRelease:0}).includes('u5'));
  assert.ok(!access.releasedOpenUnitIds({openUnits:['u1','u3'],unitAccessRelease:5}).includes('u5'));
  assert.deepEqual(access.releasedOpenUnitIds({openUnits:['u5','u3','u5'],unitAccessRelease:5}),['u1','u3','u5']);
  assert.match(app,/getClassById\(id\)[\s\S]{0,360}withReleasedUnitAccess/);
});

test('Unit 5 vocabulary contains only Real Talk and After Reading',()=>{
  const context={window:{}};
  vm.runInNewContext(source('unit5-vocabulary.js'),context);
  const vocab=context.window.STEPUP_U5_VOCAB;
  assert.ok(vocab);
  assert.equal(vocab.groups.length,2);
  assert.equal(vocab.entries.length,10);
  const labels=vocab.entries.map(x=>x.word.toLowerCase());
  assert.equal(new Set(labels).size,10);
  for(const word of ['i guess','lucky day','look at it this way','stuck in','bald','to challenge','to weave through','to hurl','to burst','to recover'])
    assert.ok(labels.includes(word),'Missing selected vocabulary: '+word);
  assert.ok(vocab.entries.every(x=>x.group==='Real Talk'||x.group==='After Reading'));
});

test('Unit 5 primary flow is continuous; preview and deployment include complete vocabulary',()=>{
  const focus=source('journey-focus.js'),review=source('unit5-6-practice-again.js');
  const index=source('index.html'),preview=source('unit5-teacher-preview.html');
  assert.ok(focus.includes('All Unit 5 Questions in One Flow'));
  assert.ok(focus.includes('Start All Questions'));
  assert.ok(focus.includes('STEPUP_U5_VOCAB?.attach(shell)'));
  assert.ok(review.includes("unit==='u5'?'':(groupDone"));
  assert.ok(review.includes('Next Question'));
  assert.ok(index.indexOf('unit5-vocabulary.js')>index.indexOf('unit5-6-content.js'));
  assert.ok(index.indexOf('unit5-vocabulary.js')<index.indexOf('journey-focus.js'));
  assert.ok(preview.includes('unit5-vocabulary.js'));
  assert.ok(source('unit5-6-content.js').includes('s.questions.length!==28'));
});
