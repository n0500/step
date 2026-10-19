const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');

const root=path.join(__dirname,'..');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture(records){
  const dom=new JSDOM('<div id="app"><section class="student-view"></section></div>',{
    url:'https://n0500.github.io/step/',runScripts:'outside-only',pretendToBeVisual:true
  });
  const w=dom.window,calls=[];
  const profile={id:'student-1',role:'student',displayName:'Test Student'};
  const unit={id:'u1',number:1,title:'Big Changes'};
  const bank=[
    {section:'grammar',sectionTitle:'Grammar',id:'g1',prompt:'G1',choices:['A','B'],answer:0},
    {section:'grammar',sectionTitle:'Grammar',id:'g2',prompt:'G2',choices:['A','B'],answer:0},
    {section:'grammar',sectionTitle:'Grammar',id:'g3',prompt:'G3',choices:['A','B'],answer:0},
    {section:'reading',sectionTitle:'Reading',id:'r1',prompt:'R1',choices:['A','B'],answer:0},
    {section:'reading',sectionTitle:'Reading',id:'r2',prompt:'R2',choices:['A','B'],answer:0}
  ];
  const requirements=bank.map(q=>({section:q.section,questionId:q.id,trainingId:'journey-u1-'+q.section}));
  w.firebase={auth:()=>({currentUser:{uid:profile.id}})};
  w.PROVE={async recordJourneyAttempt(payload){return {...payload,studentId:profile.id};}};
  w.STEPUP_CELEBRATE={showCertificate:u=>calls.push(['certificate',u.id])};
  w.STEPUP_U1_REVIEW={
    getCertificateRequirements:()=>requirements,
    getMasteryBank:()=>bank,
    open:()=>calls.push(['open','u1']),
    start:(section,forceAll,continuePath)=>calls.push(['start',section,forceAll,continuePath])
  };
  w.STEPUP_JOURNEY={
    data:{units:[unit]},
    html(){return '<div class="journey-unit-grid"><button class="journey-unit-card"><h3>Big Changes</h3></button></div>';},
    homeHTML(){return '<div class="student-home-clean"><div class="student-welcome">Welcome</div></div>';},
    progressHTML(){return '';},
    openUnit:id=>calls.push(['journey-open',id]),
    go:(id,section)=>calls.push(['go',id,section])
  };
  w.eval(fs.readFileSync(path.join(root,'stepup-mastery.js'),'utf8'));
  const hydrate=()=>w.STEPUP_JOURNEY.html(records,['u1'],profile);
  hydrate();
  return {dom,w,calls,profile,records,view:()=>w.document.querySelector('.student-view'),hydrate};
}

function question(id,correct,section=id.startsWith('r')?'reading':'grammar'){
  return {recordKind:'question',examUnit:'u1',examSection:section,questionId:id,
    studentId:'student-1',correct,bestCorrect:correct,submittedAt:'2026-10-19T12:00:00.000Z'};
}

test('unit map and home show exact remaining questions by skill',async()=>{
  const f=fixture([question('g1',true),question('g2',false),question('g3',true)]);
  try{
    f.view().innerHTML=f.w.STEPUP_JOURNEY.homeHTML(f.records,['u1'],f.profile);
    await wait(20);
    const home=f.view().querySelector('.sum-home-card');
    assert.ok(home);
    assert.match(home.textContent,/What’s left\?/);
    assert.match(home.textContent,/2 questions left/);
    assert.match(home.textContent,/Reading: 2 left/);

    f.view().innerHTML=f.w.STEPUP_JOURNEY.html(f.records,['u1'],f.profile);
    await wait(20);
    const note=f.view().querySelector('.sum-map-note');
    assert.ok(note);
    assert.match(note.textContent,/2 questions left/);
    assert.match(note.textContent,/Reading: 2 left/);

    f.view().innerHTML='<section class="journey-unit-hero"><h1>Big Changes</h1></section>';
    await wait(20);
    const panel=f.view().querySelector('.sum-whats-left');
    assert.ok(panel);
    assert.match(panel.textContent,/2 questions left/);
    assert.match(panel.textContent,/Grammar2\/3 correct1 to fix/);
    assert.match(panel.textContent,/Reading0\/2 correct2 left/);
    panel.querySelector('[data-mastery-continue]').click();
    assert.deepEqual(f.calls.at(-1),['start','reading',false,true]);
  }finally{f.dom.window.close();}
});

test('completed low score tells the student exactly how many answers to fix',async()=>{
  const records=[question('g1',true),question('g2',false),question('g3',true),question('r1',true),question('r2',false)];
  const f=fixture(records);
  try{
    f.view().innerHTML='<section class="journey-unit-hero"><h1>Big Changes</h1></section>';
    await wait(20);
    const panel=f.view().querySelector('.sum-whats-left');
    assert.match(panel.textContent,/1 more correct answer needed/);
    assert.match(panel.textContent,/5\/5Answered/);
    assert.match(panel.textContent,/3\/5Correct/);
    assert.equal(panel.querySelector('[data-mastery-continue]').textContent,'Fix 1 answer');
    panel.querySelector('[data-mastery-continue]').click();
    assert.deepEqual(f.calls.at(-1),['start','grammar',false,true]);
  }finally{f.dom.window.close();}
});

test('80 percent mastery replaces missing work with an earned certificate action',async()=>{
  const records=[question('g1',true),question('g2',true),question('g3',true),question('r1',true),question('r2',false)];
  const f=fixture(records);
  try{
    const details=f.w.STEPUP_MASTERY.progressDetails('u1',records);
    assert.equal(details.answered,5);
    assert.equal(details.correct,4);
    assert.equal(details.accuracy,80);
    assert.equal(f.w.STEPUP_MASTERY.status('u1',records).earned,true);
    f.view().innerHTML='<section class="journey-unit-hero"><h1>Big Changes</h1></section>';
    await wait(20);
    const panel=f.view().querySelector('.sum-whats-left');
    assert.match(panel.textContent,/Nothing missing — certificate earned/);
    assert.equal(panel.querySelector('[data-mastery-continue]'),null);
    panel.querySelector('[data-mastery-view]').click();
    assert.deepEqual(f.calls.at(-1),['certificate','u1']);
  }finally{f.dom.window.close();}
});

