
const levels=[
  {
    "tense": "Factory routine",
    "tag": "QUALITY CONTROL",
    "name": "Helmet inspection",
    "words": [
      "were",
      "before shipment.",
      "inspected",
      "Every helmet",
      "have been",
      "is",
      "inspect",
      "will be"
    ],
    "solution": [
      "Every helmet",
      "is",
      "inspected",
      "before shipment."
    ],
    "prompt": "Quality inspectors check every helmet before shipment, as part of the factory's daily routine. Rewrite their procedure for our label without saying who checks it.",
    "description": "Choose the correct passive construction for a regular process.",
    "explain": "The regular procedure needs the present passive: singular subject + is + past participle.",
    "hint": "A daily routine needs the tense used for facts and repeated actions.",
    "scene": "A daily safety check."
  },
  {
    "tense": "History archive",
    "tag": "ARCHIVE RECOVERY",
    "name": "First solar model",
    "words": [
      "has been",
      "in 2018.",
      "were",
      "introduced",
      "The first solar-powered model",
      "is",
      "was",
      "introducing",
      "will be"
    ],
    "solution": [
      "The first solar-powered model",
      "was",
      "introduced",
      "in 2018."
    ],
    "prompt": "The museum record says: 'Engineers introduced the first solar-powered model in 2018.' Rewrite it so the model, not the engineers, is the focus.",
    "description": "Repair a historical label using the year as your clue.",
    "explain": "A completed event in a specific past year uses the past passive: was + past participle.",
    "hint": "The year is finished, and the subject refers to one model.",
    "scene": "A historical exhibit."
  },
  {
    "tense": "Delivery update",
    "tag": "SHIPMENT STATUS",
    "name": "Inspection complete",
    "words": [
      "The new devices",
      "has been",
      "inspecting",
      "today.",
      "are",
      "have been",
      "will be",
      "inspected",
      "yesterday."
    ],
    "solution": [
      "The new devices",
      "have been",
      "inspected",
      "today."
    ],
    "prompt": "The technicians have just finished checking the new devices. Their results matter NOW because the shipment can leave. Write the completion update.",
    "description": "Write a result-focused status, not a routine or a future plan.",
    "explain": "Present perfect passive connects completed inspection with its present result: have been + past participle.",
    "hint": "The job is complete and important now. The subject is plural.",
    "scene": "Results ready for release."
  },
  {
    "tense": "Launch forecast",
    "tag": "FUTURE RELEASE",
    "name": "Electric buses",
    "words": [
      "were",
      "assemble",
      "next year.",
      "The electric buses",
      "have been",
      "will be",
      "assembled",
      "last year.",
      "are"
    ],
    "solution": [
      "The electric buses",
      "will be",
      "assembled",
      "next year."
    ],
    "prompt": "No electric buses have been built yet. The company has scheduled production for next year. Write the announcement for customers.",
    "description": "Distinguish a future plan from work already completed.",
    "explain": "A future passive announcement uses will be + past participle.",
    "hint": "Nothing has happened yet. Choose a construction for an action in the future.",
    "scene": "Next year's product plan."
  }
];
let level=0,chosen=[],passed=[false,false,false,false],solved=false,usedHint=false;
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function render(){let q=levels[level];$('steps').innerHTML=levels.map((_,i)=>`<span class="${passed[i]?'done':i===level?'on':''}"></span>`).join('');$('starCounter').textContent=`⭐ ${passed.filter(Boolean).length} / 4`;$('roundLabel').textContent=`CHALLENGE ${level+1} OF 4`;$('difficulty').textContent=q.tag;$('tenseName').textContent=q.tense;$('factoryMarker').textContent=`PRODUCTION LINE 0${level+1}`;$('sceneTitle').textContent=solved?'Product approved!':q.scene;$('sceneDesc').textContent=solved?'The production line is moving again.':q.description;$('robotMessage').textContent=`“${solved?'Excellent! You fixed it. Thank you!':q.prompt}”`;$('machineStatus').textContent=solved?'● Production released':'● Waiting for repair';$('machineStatus').className=`value ${solved?'green':'orange'}`;$('hintNote').hidden=!usedHint;$('hintNote').textContent=`💡 ${q.hint}`;$('answerRow').classList.toggle('good',solved);$('factoryArt').classList.toggle('success',solved);
  $('answerRow').innerHTML=q.solution.map((_,i)=>chosen[i]!==undefined?`<button class="slot filled" data-remove="${i}" ${solved?'disabled':''}>${escapeHTML(chosen[i].word)}</button>`:`<span class="slot ${usedHint&&i===chosen.length?'hinted':''}">${i+1}</span>`).join('');
  $('wordBank').innerHTML=q.words.map((w,i)=>`<button type="button" class="word" data-pick="${i}" ${solved||chosen.some(c=>c.index===i)?'disabled':''}>${escapeHTML(w)}</button>`).join('');
  $('nextBtn').hidden=!solved;$('checkBtn').hidden=solved;$('hintBtn').disabled=solved;$('resetBtn').disabled=solved;$('resultBox').classList.toggle('show',solved);$('explanation').textContent=q.explain;
}
function info(message,type=''){$('feedback').textContent=message;$('feedback').className='status '+type;}
$('wordBank').addEventListener('click',e=>{const tile=e.target.closest('[data-pick]');if(!tile||solved)return;let i=Number(tile.dataset.pick);if(chosen.some(c=>c.index===i)||chosen.length>=levels[level].solution.length)return;chosen.push({index:i,word:levels[level].words[i]});usedHint=false;render();info(chosen.length===levels[level].solution.length?'Ready! Press Check to inspect your sentence.':'Check the clues and choose carefully.');});
$('answerRow').addEventListener('click',e=>{let el=e.target.closest('[data-remove]');if(!el||solved)return;chosen.splice(Number(el.dataset.remove),1);render();info('Word returned to the bank.');});
$('hintBtn').addEventListener('click',()=>{usedHint=true;render();info('Read the highlighted hint, then try again.');});
$('resetBtn').addEventListener('click',()=>{chosen=[];usedHint=false;render();info('Words reset. Try building the sentence again.');});
$('checkBtn').addEventListener('click',()=>{const q=levels[level];if(chosen.length!==q.solution.length){info(`Choose all ${q.solution.length} parts before checking.`,'error');return;}let success=chosen.every((c,i)=>c.word===q.solution[i]);if(!success){info('Not approved yet. Review the time clue and check the auxiliary and participle.','error');$('answerRow').animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:240});return;}solved=true;passed[level]=true;render();info('✓ Perfect! Grammar approved. The product can move forward!','correct');celebrate();});
$('nextBtn').addEventListener('click',()=>{if(level===levels.length-1){window.GRAMMAR_RESCUE_CONTINUE();return;}level++;chosen=[];solved=false;usedHint=false;render();info('New production line unlocked. Arrange the next sentence.');});
$('restartBtn').addEventListener('click',()=>{$('completed').classList.remove('visible');level=0;chosen=[];passed=[false,false,false,false];solved=false;usedHint=false;render();info('New mission started. Choose the words in the correct order.');});
function celebrate(){let colors=['#59efdb','#ffcc65','#a896ff','#ff7bc4','#ebf7ff'];$('confetti').innerHTML=Array.from({length:32},(_,i)=>`<span style="left:${(i*31+7)%100}%;background:${colors[i%5]};animation-delay:${(i%9)*.08}s;transform:rotate(${i*22}deg)"></span>`).join('');setTimeout(()=>{$('confetti').innerHTML='';},2800)}
render();

;
// Grammar Rescue: extended playable adventure. No network, account writes, or certificate changes.
(function(){
'use strict';
const $gr=id=>document.getElementById(id);
const htmlSafe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chapters={
 2:{heading:'Product <span>Showroom</span>',label:'MISSION 02 / PRODUCT SHOWROOM',sub:'Compare products to help the customers.',art:'var(--showroom-art)',scene:'PRODUCT SHOWROOM',onair:'CUSTOMERS WAITING',
  tasks:[
   {kind:'select',topic:'COMPARATIVE',title:'Find the right phone!',instruction:'Compare the weight of three phones.',dialog:'I need a phone lighter than Phone A but heavier than Phone B.',emoji:'📱',sceneTitle:'Choose the right phone',sceneDesc:'Use the weight information to compare products.',cards:[{icon:'📱',name:'Phone A',note:'Heavy model',tag:'210 g'},{icon:'📱',name:'Phone B',note:'Light model',tag:'150 g'},{icon:'📱',name:'Phone C',note:'Mid-weight model',tag:'180 g'}],answer:2,explain:'Phone C is lighter than A (210 g) but heavier than B (150 g).',hint:'The correct weight is between 150 g and 210 g.'},
   {kind:'select',topic:'SUPERLATIVE',title:'The premium laptop',instruction:'Help the shopper find the most expensive laptop.',dialog:'I want the most expensive laptop. Which one should I choose?',emoji:'💻',sceneTitle:'Premium laptops',sceneDesc:'Find the highest price to complete the ad.',cards:[{icon:'💻',name:'Laptop A',note:'Classic',tag:'$800'},{icon:'💻',name:'Laptop B',note:'Premium',tag:'$1,200'},{icon:'💻',name:'Laptop C',note:'Standard',tag:'$950'}],answer:1,explain:'Laptop B is the most expensive. We use the most + adjective to compare three or more.',hint:'Compare all three prices and choose the highest.'},
   {kind:'pair',topic:'AS ... AS',title:'Find the matching bags',instruction:'Choose TWO bags of equal weight.',dialog:'We need two bags that are as heavy as each other.',emoji:'🧳',sceneTitle:'Equal-weight challenge',sceneDesc:'Match products that share the same weight.',cards:[{icon:'🧳',name:'Bag A',note:'Travel suitcase',tag:'2 kg'},{icon:'🧳',name:'Bag B',note:'Travel suitcase',tag:'3 kg'},{icon:'🧳',name:'Bag C',note:'Travel suitcase',tag:'2 kg'}],answer:[0,2],explain:'Bag A is as heavy as Bag C. Both weigh 2 kg.',hint:'The pattern is as + adjective + as. Look for two identical weights.'},
   {kind:'select',topic:'SENSE VERBS + LIKE',title:'The perfume mystery',instruction:'Choose the natural sentence to describe the smell.',dialog:'This perfume has the same scent as roses. How can I describe it?',emoji:'🌹',sceneTitle:'Fragrance station',sceneDesc:'Use the correct sense verb and like + noun.',cards:[{icon:'👃',name:'It smells roses.',note:'Option A'},{icon:'🌹',name:'It smells like roses.',note:'Option B'},{icon:'💬',name:'It sounds roses.',note:'Option C'}],answer:1,explain:'Use smells like + noun: This perfume smells like roses.',hint:'Which sense verb describes a scent? Add like before roses.'}
  ]},
 3:{heading:'Smart Shopping <span>Mall</span>',label:'MISSION 03 / FORM, MEANING & FUNCTION',sub:'Rescue customers in seven mini-missions.',art:'var(--mall-art)',scene:'SMART SHOPPING MALL',onair:'CUSTOMERS WAITING',
  tasks:[
   {kind:'select',topic:'DEMONSTRATIVES',title:'Point & Find',instruction:'Tap the bag the customer means.',dialog:'That red bag over there looks beautiful!',emoji:'👜',sceneTitle:'Find the correct item',sceneDesc:'Near or far? Singular or plural?',cards:[{icon:'🟩',name:'Green bag',note:'Near us',tag:'THIS'},{icon:'👜',name:'Red bag',note:'Far away',tag:'THAT'},{icon:'🎒',name:'Blue backpack',note:'Near us',tag:'THIS'}],answer:1,explain:'That describes one item farther away from the speaker.',hint:'That = singular + far away.'},
   {kind:'arrange',topic:'IMPERATIVES',title:'Make the slogan!',instruction:'Arrange the words to create an advertising command.',dialog:'Our new tablet needs a catchy slogan. Make a command!',emoji:'📣',sceneTitle:'Slogan workshop',sceneDesc:'Write an instruction that makes customers act.',words:['today!','new tablet','Buy','the'],solution:['Buy','the','new tablet','today!'],explain:'Imperatives begin with a base-form verb: Buy the new tablet today!',hint:'Start with a verb in its base form. This is a command.'},
   {kind:'select',topic:'A / AN',title:'The correct label',instruction:'Choose the grammatically correct product label.',dialog:'A customer wants to buy an umbrella. Which shelf label is correct?',emoji:'☂️',sceneTitle:'Packaging check',sceneDesc:'Listen for a vowel sound at the start.',cards:[{icon:'☂️',name:'a umbrella',note:'Label A'},{icon:'☂️',name:'an umbrella',note:'Label B'},{icon:'☂️',name:'a an umbrella',note:'Label C'}],answer:1,explain:'Use an before umbrella because it begins with a vowel sound.',hint:'Umbrella begins with a vowel sound.'},
   {kind:'select',topic:'POSSESSIVE PRONOUNS',title:'Lost & Found',instruction:'Return the correct backpack to Layla.',dialog:'Layla says: “This blue backpack is mine!” Can you find it?',emoji:'🎒',sceneTitle:'Return lost belongings',sceneDesc:'Choose the item that belongs to the customer.',cards:[{icon:'🎒',name:'Red backpack',note:'Owner: Sara'},{icon:'🎒',name:'Green backpack',note:'Owner: Amal'},{icon:'🎒',name:'Blue backpack',note:'Owner: Layla'}],answer:2,explain:'The blue backpack is hers. Mine is a possessive pronoun meaning it belongs to me.',hint:'Layla described both the color and ownership.'},
   {kind:'select',topic:'WHOSE',title:'Who owns the headphones?',instruction:'Choose the correct answer to Whose...?',dialog:'Whose headphones are these? They belong to Omar.',emoji:'🎧',sceneTitle:'Ownership detective',sceneDesc:'Find the appropriate possessive pronoun.',cards:[{icon:'👧',name:"They're hers.",note:'Option A'},{icon:'👦',name:"They're his.",note:'Option B'},{icon:'🧑',name:"They're mine.",note:'Option C'}],answer:1,explain:'Whose asks about ownership. Omar is male, so: They’re his.',hint:'Think of Omar and the possessive pronoun for he.'},
   {kind:'select',topic:'ONE / ONES',title:'Pick the blue ones!',instruction:'Choose the pair the customer is talking about.',dialog:'I like those shoes, but I want the blue ones.',emoji:'👟',sceneTitle:'Find the shoes',sceneDesc:'One replaces a singular noun; ones replaces a plural noun.',cards:[{icon:'👟',name:'Pink shoes',note:'Pair A',tag:'PINK'},{icon:'👟',name:'Blue shoes',note:'Pair B',tag:'BLUE'},{icon:'🥾',name:'Black boots',note:'Pair C',tag:'BLACK'}],answer:1,explain:'Ones refers to the plural noun shoes: the blue ones.',hint:'Shoes is plural. The customer wants BLUE shoes.'},
   {kind:'select',topic:'TOO / ENOUGH',title:'Shopping Rescue',instruction:'Find a medium jacket for $200 or less.',dialog:'I need a medium jacket. I have only $200. Can you help me?',emoji:'🧥',sceneTitle:'Fit & budget mission',sceneDesc:'Choose the item that fits and is affordable.',cards:[{icon:'🧥',name:'Jacket A',note:'Size S',tag:'$120'},{icon:'🧥',name:'Jacket B',note:'Size M',tag:'$180'},{icon:'🧥',name:'Jacket C',note:'Size M',tag:'$250'}],answer:1,explain:'Jacket A is too small. Jacket C is too expensive. Jacket B is big enough and affordable.',hint:'You need size M AND a price below $201.'}
  ]},
 4:{heading:'The Big <span>Launch</span>',label:'FINAL MISSION / SAVE THE CAMPAIGN',sub:'Fix the final advertising mistakes to launch!',art:'var(--launch-art)',scene:'LIVE ADVERTISING CAMPAIGN',onair:'PRE-LAUNCH',
  tasks:[
   {kind:'select',topic:'FINAL · PASSIVE VOICE',title:'Fix the factory ad',instruction:'Select the only correct sentence before publishing.',dialog:'The advertisement says “These shoes is made in Italy.” Fix it!',emoji:'🛠️',sceneTitle:'Final quality control',sceneDesc:'Check subject–verb agreement in the passive.',cards:[{icon:'❌',name:'These shoes is made in Italy.',note:'Version A'},{icon:'✅',name:'These shoes are made in Italy.',note:'Version B'},{icon:'❓',name:'These shoes made in Italy.',note:'Version C'}],answer:1,explain:'Shoes is plural. Present passive: are + past participle.',hint:'These shoes is plural. Use are + V3.'},
   {kind:'select',topic:'FINAL · COMPARATIVES',title:'Fix the comparison',instruction:'Select the correctly written comparison.',dialog:'The advertisement says “This laptop is more faster than the old one.”',emoji:'⚖️',sceneTitle:'Almost ready to launch',sceneDesc:'Avoid double comparatives.',cards:[{icon:'💻',name:'This laptop is faster than the old one.',note:'Version A'},{icon:'💻',name:'This laptop is most faster than the old one.',note:'Version B'},{icon:'💻',name:'This laptop is more fast than the old one.',note:'Version C'}],answer:0,explain:'For fast, use faster than (not more faster).',hint:'For a short adjective like fast, add -er.'},
   {kind:'select',topic:'FINAL · DEMONSTRATIVES',title:'One last correction!',instruction:'Correct the shop announcement.',dialog:'The last sign says “That are my bag.” Fix it to launch!',emoji:'🚀',sceneTitle:'Launch authorization',sceneDesc:'Only one sign remains to be repaired.',cards:[{icon:'👜',name:'That is my bag.',note:'Version A'},{icon:'👜',name:'Those is my bag.',note:'Version B'},{icon:'👜',name:'That are my bag.',note:'Version C'}],answer:0,explain:'That is a singular demonstrative, so use is.',hint:'That points to one thing, so choose is.'}
  ]}
};
let currentChapter=2,index=0,selection=[],solved=false,hintShown=false;
const completed={1:false,2:false,3:false,4:false};
const completedCounts={2:0,3:0,4:0};
function factoryComplete(){return Array.isArray(window.passed)&&window.passed.every(Boolean)||completed[1];}
function changeHeader(){const earned=4+(completedCounts[2]||0)+(completedCounts[3]||0)+(completedCounts[4]||0);$gr('starCounter').textContent='⭐ '+earned+' / 18';}
function missionView(chapter,which=0){
 const chapterReady=chapter===1||completed[chapter-1];if(!chapterReady){showMap();return;}
 if(chapter===1){document.body.classList.remove('gr-active');$gr('gr-stage').style.display='none';document.querySelector('.app > .page-head').hidden=false;document.querySelector('.app > .mission-layout').hidden=false;document.querySelector('.app > .footnote').hidden=false;hideMap();window.scrollTo({top:0,behavior:'instant'});return;}
 currentChapter=chapter;index=which;solved=false;selection=[];hintShown=false;
 document.body.classList.add('gr-active');document.querySelector('.app > .page-head').hidden=true;document.querySelector('.app > .mission-layout').hidden=true;document.querySelector('.app > .footnote').hidden=true;
 $gr('gr-stage').style.display='block';hideMap();renderQuestion();changeHeader();window.scrollTo({top:0,behavior:'instant'});
}
function renderQuestion(){
 const chapter=chapters[currentChapter],t=chapter.tasks[index];
 $gr('gr-chapter-label').textContent=chapter.label;$gr('gr-heading').innerHTML=chapter.heading;$gr('gr-subhead').textContent=chapter.sub;
 $gr('gr-question-count').textContent='CHALLENGE '+(index+1)+' OF '+chapter.tasks.length;
 $gr('gr-topic').textContent=t.topic;$gr('gr-quest-title').textContent=t.title;$gr('gr-quest-instruction').textContent=t.instruction;
 $gr('gr-avatar').textContent=t.emoji;$gr('gr-customer-message').textContent='“'+t.dialog+'”';
 $gr('gr-scene').style.setProperty('--gr-art',chapter.art);$gr('gr-scene-label').textContent=chapter.scene;$gr('gr-onair').textContent=chapter.onair;
 $gr('gr-scene-emoji').textContent=t.emoji;$gr('gr-scene-title').textContent=solved?'Great job!':t.sceneTitle;$gr('gr-scene-desc').textContent=solved?'The campaign is one step closer to launch.':t.sceneDesc;
 $gr('gr-progress-count').textContent=completedCounts[currentChapter]+' / '+chapter.tasks.length+' completed';$gr('gr-progress-fill').style.width=(completedCounts[currentChapter]/chapter.tasks.length*100)+'%';
 const wordsMode=t.kind==='arrange';$gr('gr-builder').hidden=!wordsMode;$gr('gr-choices').hidden=wordsMode;$gr('gr-reset').hidden=!wordsMode;
 $gr('gr-check').hidden=t.kind==='select'||solved;$gr('gr-next').hidden=!solved;$gr('gr-hint').disabled=solved;$gr('gr-reset').disabled=solved;
 $gr('gr-feedback').className='gr-note';$gr('gr-feedback').textContent=solved?'✓ '+t.explain:'Choose the correct answer to save this part of the campaign.';
 $gr('gr-reward').className=solved?'gr-reward show':'gr-reward';$gr('gr-reward').textContent=solved?'✅ Approved! '+t.explain:'';
 if(wordsMode){renderWords(t);}else{renderCards(t);}
}
function renderCards(t){$gr('gr-choices').innerHTML=t.cards.map((c,i)=>{
 const pick=selection.includes(i),ok=solved&&(Array.isArray(t.answer)?t.answer.includes(i):t.answer===i);
 return `<button type="button" data-gr-pick="${i}" class="gr-pick ${pick?'selected':''} ${ok?'correct':''}" ${solved?'disabled':''} aria-pressed="${pick}"><span class="gr-emoji">${htmlSafe(c.icon)}</span><span class="gr-product-name">${htmlSafe(c.name)}</span>${c.note?`<span class="gr-product-note">${htmlSafe(c.note)}</span>`:''}${c.tag?`<span class="gr-infotag">${htmlSafe(c.tag)}</span>`:''}</button>`;
 }).join('');
 if(t.kind==='pair'&&!solved)$gr('gr-feedback').textContent='Select two cards and press Check.';
}
function renderWords(t){$gr('gr-bank').innerHTML=t.words.map((w,i)=>`<button type="button" class="gr-word" data-gr-word="${i}" ${solved||selection.includes(i)?'disabled':''}>${htmlSafe(w)}</button>`).join('');
 $gr('gr-answer').innerHTML=t.solution.map((_,i)=>selection[i]!==undefined?`<button type="button" class="gr-word filled" data-gr-remove="${i}" ${solved?'disabled':''}>${htmlSafe(t.words[selection[i]])}</button>`:`<span class="slot">${i+1}</span>`).join('');
 if(!solved)$gr('gr-feedback').textContent='Tap the word cards in the correct order, then press Check.';
}
function grFeedback(msg,bad=false){$gr('gr-feedback').textContent=msg;$gr('gr-feedback').className='gr-note'+(bad?' bad':'');}
function doPick(n){if(solved)return;const t=chapters[currentChapter].tasks[index];
 if(t.kind==='pair'){
  if(selection.includes(n))selection=selection.filter(v=>v!==n);else if(selection.length<2)selection.push(n);else selection=[selection[1],n];renderCards(t);return;
 }
 if(t.kind!=='select')return;
 if(n===t.answer){selection=[n];completeQuestion();}
 else{selection=[n];renderCards(t);grFeedback('Not quite. '+t.hint,true);}
}
function completeQuestion(){const t=chapters[currentChapter].tasks[index];if(solved)return;solved=true;completedCounts[currentChapter]=Math.max(completedCounts[currentChapter],index+1);
 $gr('gr-scene').classList.add('gr-flash');setTimeout(()=>$gr('gr-scene').classList.remove('gr-flash'),700);renderQuestion();changeHeader();
}
function checkSelection(){if(solved)return;const t=chapters[currentChapter].tasks[index];
 if(t.kind==='arrange'){
  if(selection.length<t.solution.length){grFeedback('Please select all '+t.solution.length+' words first.',true);return;}
  const ok=selection.every((w,i)=>t.words[w]===t.solution[i]);if(ok)completeQuestion();else grFeedback('The word order is not correct yet. '+t.hint,true);
 }else if(t.kind==='pair'){
  if(selection.length!==2){grFeedback('Choose TWO bags before checking.',true);return;}
  const good=t.answer.every(v=>selection.includes(v));if(good)completeQuestion();else grFeedback('These bags are not as heavy as each other. '+t.hint,true);
 }
}
function nextChallenge(){if(!solved)return;const chapter=chapters[currentChapter];if(index<chapter.tasks.length-1){index++;selection=[];solved=false;hintShown=false;renderQuestion();window.scrollTo({top:0,behavior:'smooth'});return;}
 completed[currentChapter]=true; if(currentChapter===4){$gr('gr-win').classList.add('visible');changeHeader();return;}showMap();
}
function showMap(){const a=$gr('gr-map-missions');const titles=[['Production Lab','Passive Voice','🏭'],['Product Showroom','Comparisons & Sense Verbs','🏬'],['Smart Shopping Mall','Form, Meaning & Function','🛍️'],['The Big Launch','Final Grammar Challenge','🚀']];
 a.innerHTML=titles.map((p,i)=>{const n=i+1,done=completed[n],unlocked=n===1||completed[n-1],now=unlocked&&!done;
  return `<button class="gr-map-item ${done?'done':now?'open':''}" data-gr-open="${n}" ${!unlocked?'disabled':''}><span class="number">${done?'✅':unlocked?'⭐':'🔒'}</span><b>${htmlSafe(p[0])}</b><small>${htmlSafe(p[1])}</small><small>${done?'COMPLETED':unlocked?'TAP TO PLAY':'LOCKED'}</small></button>`}).join('');$gr('gr-map').classList.add('visible');}
function hideMap(){$gr('gr-map').classList.remove('visible');}
function navigateMap(n){if(n===1){missionView(1);return;}if(completed[n]){missionView(n,0);return;}if(n===2||completed[n-1])missionView(n,completedCounts[n]);}
$gr('gr-choices').addEventListener('click',e=>{const b=e.target.closest('[data-gr-pick]');if(b)doPick(Number(b.dataset.grPick));});
$gr('gr-bank').addEventListener('click',e=>{const b=e.target.closest('[data-gr-word]');if(!b||solved)return;const t=chapters[currentChapter].tasks[index];let n=Number(b.dataset.grWord);if(!selection.includes(n)&&selection.length<t.solution.length){selection.push(n);renderWords(t);}});
$gr('gr-answer').addEventListener('click',e=>{const b=e.target.closest('[data-gr-remove]');if(!b||solved)return;const t=chapters[currentChapter].tasks[index];selection.splice(Number(b.dataset.grRemove),1);renderWords(t);});
$gr('gr-check').addEventListener('click',checkSelection);
$gr('gr-reset').addEventListener('click',()=>{if(solved)return;selection=[];renderQuestion();});
$gr('gr-hint').addEventListener('click',()=>{if(solved)return;const t=chapters[currentChapter].tasks[index];grFeedback('💡 '+t.hint);});
$gr('gr-next').addEventListener('click',nextChallenge);
$gr('gr-map-button').addEventListener('click',showMap);
$gr('gr-map-close').addEventListener('click',hideMap);
$gr('gr-map-missions').addEventListener('click',e=>{const b=e.target.closest('[data-gr-open]');if(b)navigateMap(Number(b.dataset.grOpen));});
$gr('gr-replay').addEventListener('click',()=>{completed[1]=completed[2]=completed[3]=completed[4]=false;completedCounts[2]=completedCounts[3]=completedCounts[4]=0;$gr('gr-win').classList.remove('visible');window.restartFactoryAdventure();});
$gr('gr-win-map').addEventListener('click',()=>{$gr('gr-win').classList.remove('visible');showMap();});
window.GRAMMAR_RESCUE_CONTINUE=function(){completed[1]=true;showMap();};
window.restartFactoryAdventure=function(){document.getElementById('restartBtn').click();missionView(1);};
window.GRAMMAR_RESCUE_TEST={chapters,completed,completedCounts,open:missionView};
})();
