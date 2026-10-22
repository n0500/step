
const levels=[
  {
    "tense": "Factory Label",
    "tag": "PRODUCTION LINE 01",
    "name": "Daily production",
    "words": [
      "Cars",
      "made",
      "are",
      "in this factory.",
      "is"
    ],
    "solution": [
      "Cars",
      "are",
      "made",
      "in this factory."
    ],
    "prompt": "Workers make cars here every day. Complete the factory label using the passive voice.",
    "description": "A daily production fact needs a correct label.",
    "explain": "Cars is plural, so use are + past participle: Cars are made in this factory.",
    "hint": "The subject is plural: cars. Which helper verb agrees with it?",
    "scene": "Daily production is underway."
  },
  {
    "tense": "History Label",
    "tag": "PRODUCTION LINE 02",
    "name": "A historic car",
    "words": [
      "was",
      "The car",
      "repaired",
      "yesterday.",
      "is"
    ],
    "solution": [
      "The car",
      "was",
      "repaired",
      "yesterday."
    ],
    "prompt": "A mechanic repaired this car yesterday. Make a label about what happened.",
    "description": "Use the time clue to fix the museum label.",
    "explain": "Yesterday refers to a completed past event. Use was + past participle.",
    "hint": "Yesterday tells you the action happened in the past.",
    "scene": "The workshop record needs a label."
  },
  {
    "tense": "Quality Update",
    "tag": "PRODUCTION LINE 03",
    "name": "Delivery completed",
    "words": [
      "have been",
      "The orders",
      "delivered",
      "already.",
      "has been"
    ],
    "solution": [
      "The orders",
      "have been",
      "delivered",
      "already."
    ],
    "prompt": "All the orders are ready to go. Workers finished delivering them. Update the delivery board.",
    "description": "Show a completed action with a result now.",
    "explain": "With the plural subject orders, use have been + past participle.",
    "hint": "The orders is plural. Choose the plural form of have/has been.",
    "scene": "Delivery status: complete."
  },
  {
    "tense": "Launch Plan",
    "tag": "PRODUCTION LINE 04",
    "name": "New model announcement",
    "words": [
      "next month.",
      "will be",
      "The new model",
      "launched",
      "was"
    ],
    "solution": [
      "The new model",
      "will be",
      "launched",
      "next month."
    ],
    "prompt": "The company plans to introduce a new model next month. Finish the future announcement.",
    "description": "The model has not launched yet.",
    "explain": "For a future passive action, use will be + past participle.",
    "hint": "Next month is in the future.",
    "scene": "A new product is coming."
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
  "2": {
    "heading": "Product <span>Showroom</span>",
    "label": "MISSION 02 / PRODUCT SHOWROOM",
    "sub": "Compare products and help shoppers choose.",
    "art": "var(--showroom-art)",
    "scene": "PRODUCT SHOWROOM",
    "onair": "CUSTOMERS WAITING",
    "tasks": [
      {
        "kind": "select",
        "topic": "COMPARATIVE",
        "title": "Find the perfect phone",
        "instruction": "Read the weights and choose the right phone.",
        "dialog": "I want a phone lighter than Phone A, but heavier than Phone B.",
        "emoji": "📱",
        "sceneTitle": "Compare phone weights",
        "sceneDesc": "Which phone fits the comparison?",
        "cards": [
          {
            "icon": "📱",
            "name": "Phone A",
            "note": "210 g",
            "tag": "MODEL A"
          },
          {
            "icon": "📱",
            "name": "Phone B",
            "note": "150 g",
            "tag": "MODEL B"
          },
          {
            "icon": "📱",
            "name": "Phone C",
            "note": "180 g",
            "tag": "MODEL C"
          }
        ],
        "answer": 2,
        "explain": "Phone C (180 g) is lighter than A (210 g) and heavier than B (150 g).",
        "hint": "Find the phone with a weight between 150 g and 210 g."
      },
      {
        "kind": "select",
        "topic": "SUPERLATIVE",
        "title": "The best battery",
        "instruction": "Choose the correct statement about the longest battery life.",
        "dialog": "Laptop A lasts 7 hours. Laptop B lasts 12 hours. Laptop C lasts 9 hours.",
        "emoji": "💻",
        "sceneTitle": "Battery comparison",
        "sceneDesc": "Check the number and the grammar.",
        "cards": [
          {
            "icon": "🔋",
            "name": "Laptop A lasts the longest.",
            "note": "Option A"
          },
          {
            "icon": "🔋",
            "name": "Laptop B lasts the longest.",
            "note": "Option B"
          },
          {
            "icon": "🔋",
            "name": "Laptop C lasts the longest.",
            "note": "Option C"
          }
        ],
        "answer": 1,
        "explain": "Laptop B lasts 12 hours, longer than A and C. It lasts the longest.",
        "hint": "Compare 7, 12 and 9 hours."
      },
      {
        "kind": "pair",
        "topic": "AS ... AS",
        "title": "Match the bags",
        "instruction": "Choose TWO bags that are as heavy as each other.",
        "dialog": "My sister and I need bags of the same weight. Help us find a pair.",
        "emoji": "🧳",
        "sceneTitle": "Equal-weight challenge",
        "sceneDesc": "Pick two bags with equal weights.",
        "cards": [
          {
            "icon": "🧳",
            "name": "Bag A",
            "note": "2.5 kg"
          },
          {
            "icon": "🧳",
            "name": "Bag B",
            "note": "3 kg"
          },
          {
            "icon": "🧳",
            "name": "Bag C",
            "note": "2.5 kg"
          }
        ],
        "answer": [
          0,
          2
        ],
        "explain": "Bag A is as heavy as Bag C because both weigh 2.5 kg.",
        "hint": "Look for two matching numbers."
      },
      {
        "kind": "select",
        "topic": "SENSE VERBS + LIKE",
        "title": "What is that smell?",
        "instruction": "Choose the sentence that describes the perfume.",
        "dialog": "This perfume has a scent similar to roses.",
        "emoji": "🌹",
        "sceneTitle": "Perfume counter",
        "sceneDesc": "Choose the sense verb that fits.",
        "cards": [
          {
            "icon": "🌹",
            "name": "It smells like roses.",
            "note": "Option A"
          },
          {
            "icon": "🌹",
            "name": "It looks like roses.",
            "note": "Option B"
          },
          {
            "icon": "🌹",
            "name": "It sounds like roses.",
            "note": "Option C"
          }
        ],
        "answer": 0,
        "explain": "We use smells like to describe a similar scent.",
        "hint": "Use the sense verb connected to your nose."
      }
    ]
  },
  "3": {
    "heading": "Smart Shopping <span>Mall</span>",
    "label": "MISSION 03 / FORM, MEANING & FUNCTION",
    "sub": "Solve seven quick shopping challenges.",
    "art": "var(--mall-art)",
    "scene": "SMART SHOPPING MALL",
    "onair": "CUSTOMERS WAITING",
    "tasks": [
      {
        "kind": "select",
        "topic": "DEMONSTRATIVES",
        "title": "The shoes over there",
        "instruction": "Choose the correct sentence.",
        "dialog": "A customer points to TWO shoes far away from her.",
        "emoji": "👟",
        "sceneTitle": "Near or far?",
        "sceneDesc": "Think about distance and number.",
        "cards": [
          {
            "icon": "👟",
            "name": "Those shoes are nice.",
            "note": "Option A"
          },
          {
            "icon": "👟",
            "name": "These shoes are nice.",
            "note": "Option B"
          },
          {
            "icon": "👟",
            "name": "That shoes are nice.",
            "note": "Option C"
          }
        ],
        "answer": 0,
        "explain": "Those is used for plural items that are far away.",
        "hint": "Two shoes = plural; far away = not these."
      },
      {
        "kind": "arrange",
        "topic": "IMPERATIVES",
        "title": "Keep the screen clean",
        "instruction": "Arrange the words to make a warning.",
        "dialog": "Visitors must not touch the new tablet on display.",
        "emoji": "📣",
        "sceneTitle": "Safety sign",
        "sceneDesc": "Create a negative command.",
        "words": [
          "the screen.",
          "touch",
          "Don’t",
          "touches",
          "Do"
        ],
        "solution": [
          "Don’t",
          "touch",
          "the screen."
        ],
        "explain": "A negative command starts with Don’t + base verb.",
        "hint": "Start with Don’t, then the base verb."
      },
      {
        "kind": "select",
        "topic": "A / AN",
        "title": "The missing article",
        "instruction": "Choose the correct product label.",
        "dialog": "A customer needs something to use on a rainy day. Which label is correct?",
        "emoji": "☂️",
        "sceneTitle": "Label check",
        "sceneDesc": "Listen for the first sound.",
        "cards": [
          {
            "icon": "☂️",
            "name": "an umbrella",
            "note": "Label A"
          },
          {
            "icon": "☂️",
            "name": "a umbrella",
            "note": "Label B"
          },
          {
            "icon": "☂️",
            "name": "an umbrellas",
            "note": "Label C"
          }
        ],
        "answer": 0,
        "explain": "Umbrella begins with a vowel sound. Use an with a singular countable noun.",
        "hint": "Say umbrella aloud. Does it begin with a vowel sound?"
      },
      {
        "kind": "select",
        "topic": "POSSESSIVE PRONOUNS",
        "title": "Lost shoes",
        "instruction": "Complete Sara’s sentence.",
        "dialog": "Sara says, “These shoes belong to me. They are ____.”",
        "emoji": "👟",
        "sceneTitle": "Lost and found",
        "sceneDesc": "Choose the correct possessive pronoun.",
        "cards": [
          {
            "icon": "👟",
            "name": "mine",
            "note": "Option A"
          },
          {
            "icon": "👟",
            "name": "my",
            "note": "Option B"
          },
          {
            "icon": "👟",
            "name": "me",
            "note": "Option C"
          }
        ],
        "answer": 0,
        "explain": "Mine replaces my shoes and shows ownership without another noun.",
        "hint": "You need a word that can stand alone after “They are”."
      },
      {
        "kind": "select",
        "topic": "WHOSE",
        "title": "Whose headphones?",
        "instruction": "Answer the customer’s question.",
        "dialog": "Whose headphones are these? They belong to Omar.",
        "emoji": "🎧",
        "sceneTitle": "Ownership detective",
        "sceneDesc": "Who owns the headphones?",
        "cards": [
          {
            "icon": "🎧",
            "name": "They’re hers.",
            "note": "Option A"
          },
          {
            "icon": "🎧",
            "name": "They’re his.",
            "note": "Option B"
          },
          {
            "icon": "🎧",
            "name": "They’re theirs.",
            "note": "Option C"
          }
        ],
        "answer": 1,
        "explain": "Omar is one male owner, so the headphones are his.",
        "hint": "Which pronoun shows possession by one boy?"
      },
      {
        "kind": "select",
        "topic": "ONE / ONES",
        "title": "Choose the blue shoes",
        "instruction": "Fill in the missing word.",
        "dialog": "I like these shoes, but I want the blue ____.",
        "emoji": "👟",
        "sceneTitle": "Shoe counter",
        "sceneDesc": "Choose a word that replaces a plural noun.",
        "cards": [
          {
            "icon": "👟",
            "name": "ones",
            "note": "Option A"
          },
          {
            "icon": "👟",
            "name": "one",
            "note": "Option B"
          },
          {
            "icon": "👟",
            "name": "it",
            "note": "Option C"
          }
        ],
        "answer": 0,
        "explain": "Ones replaces the plural noun shoes.",
        "hint": "Shoes is plural. Use the plural replacement word."
      },
      {
        "kind": "select",
        "topic": "TOO / ENOUGH",
        "title": "The expensive jacket",
        "instruction": "Complete the customer’s sentence.",
        "dialog": "The jacket costs $250. I only have $200. It is ____.",
        "emoji": "🧥",
        "sceneTitle": "Shopping budget",
        "sceneDesc": "What is the problem with the price?",
        "cards": [
          {
            "icon": "🧥",
            "name": "too expensive",
            "note": "Option A"
          },
          {
            "icon": "🧥",
            "name": "expensive enough",
            "note": "Option B"
          },
          {
            "icon": "🧥",
            "name": "too cheap",
            "note": "Option C"
          }
        ],
        "answer": 0,
        "explain": "The jacket costs more than the customer can pay, so it is too expensive.",
        "hint": "The price is higher than the money available."
      }
    ]
  },
  "4": {
    "heading": "The Big <span>Launch</span>",
    "label": "FINAL MISSION / SAVE THE CAMPAIGN",
    "sub": "Three final choices to complete the launch.",
    "art": "var(--launch-art)",
    "scene": "LIVE ADVERTISING CAMPAIGN",
    "onair": "PRE-LAUNCH",
    "tasks": [
      {
        "kind": "select",
        "topic": "FINAL · PASSIVE VOICE",
        "title": "Check the factory ad",
        "instruction": "Choose the correct advertisement.",
        "dialog": "A factory in Italy makes these shoes. Which sentence should we put on the poster?",
        "emoji": "🏭",
        "sceneTitle": "Factory quality check",
        "sceneDesc": "Check the passive verb.",
        "cards": [
          {
            "icon": "👟",
            "name": "These shoes are made in Italy.",
            "note": "Version A"
          },
          {
            "icon": "👟",
            "name": "These shoes is made in Italy.",
            "note": "Version B"
          },
          {
            "icon": "👟",
            "name": "These shoes are make in Italy.",
            "note": "Version C"
          }
        ],
        "answer": 0,
        "explain": "Shoes is plural. The present passive uses are + past participle.",
        "hint": "Plural shoes takes are, followed by the past participle made."
      },
      {
        "kind": "select",
        "topic": "FINAL · COMPARATIVES",
        "title": "The lighter phone",
        "instruction": "Choose the true comparison.",
        "dialog": "The old phone weighs 190 g. The new phone weighs 160 g.",
        "emoji": "📱",
        "sceneTitle": "New product claim",
        "sceneDesc": "Which comparison can we publish?",
        "cards": [
          {
            "icon": "📱",
            "name": "The new phone is heavier than the old one.",
            "note": "Claim A"
          },
          {
            "icon": "📱",
            "name": "The new phone is lighter than the old one.",
            "note": "Claim B"
          },
          {
            "icon": "📱",
            "name": "The new phone is as heavy as the old one.",
            "note": "Claim C"
          }
        ],
        "answer": 1,
        "explain": "160 g is less than 190 g, so the new phone is lighter.",
        "hint": "Compare the weights. A lower number means a lighter phone."
      },
      {
        "kind": "select",
        "topic": "FINAL · DEMONSTRATIVES",
        "title": "The last shop sign",
        "instruction": "Choose the correct sentence.",
        "dialog": "Maha points to TWO bags across the room. They belong to her friend Sara.",
        "emoji": "👜",
        "sceneTitle": "Launch authorization",
        "sceneDesc": "Combine distance, number, and ownership.",
        "cards": [
          {
            "icon": "👜",
            "name": "Those bags are hers.",
            "note": "Sign A"
          },
          {
            "icon": "👜",
            "name": "These bags are hers.",
            "note": "Sign B"
          },
          {
            "icon": "👜",
            "name": "That bags are hers.",
            "note": "Sign C"
          }
        ],
        "answer": 0,
        "explain": "Those is used for plural items far away; hers shows they belong to Sara.",
        "hint": "Two bags far away = those. Sara owns them."
      }
    ]
  }
};
let currentChapter=2,index=0,selection=[],solved=false,hintShown=false,reasonPhase=false;
const completed={1:false,2:false,3:false,4:false};
const completedCounts={2:0,3:0,4:0};
function factoryComplete(){return Array.isArray(window.passed)&&window.passed.every(Boolean)||completed[1];}
function changeHeader(){const earned=4+(completedCounts[2]||0)+(completedCounts[3]||0)+(completedCounts[4]||0);$gr('starCounter').textContent='⭐ '+earned+' / 18';}
function missionView(chapter,which=0){
 const chapterReady=chapter===1||completed[chapter-1];if(!chapterReady){showMap();return;}
 if(chapter===1){document.body.classList.remove('gr-active');$gr('gr-stage').style.display='none';document.querySelector('.app > .page-head').hidden=false;document.querySelector('.app > .mission-layout').hidden=false;document.querySelector('.app > .footnote').hidden=false;hideMap();window.scrollTo({top:0,behavior:'instant'});return;}
 currentChapter=chapter;index=which;solved=false;selection=[];hintShown=false;reasonPhase=false;
 document.body.classList.add('gr-active');document.querySelector('.app > .page-head').hidden=true;document.querySelector('.app > .mission-layout').hidden=true;document.querySelector('.app > .footnote').hidden=true;
 $gr('gr-stage').style.display='block';hideMap();renderQuestion();changeHeader();window.scrollTo({top:0,behavior:'instant'});
}
function renderQuestion(){
 const chapter=chapters[currentChapter],t=chapter.tasks[index];
 $gr('gr-chapter-label').textContent=chapter.label;$gr('gr-heading').innerHTML=chapter.heading;$gr('gr-subhead').textContent=chapter.sub;
 $gr('gr-question-count').textContent='CHALLENGE '+(index+1)+' OF '+chapter.tasks.length;
 $gr('gr-topic').textContent=reasonPhase?'REASON CHECK':t.topic;$gr('gr-quest-title').textContent=reasonPhase?'Prove your decision':t.title;$gr('gr-quest-instruction').textContent=reasonPhase?'Choose WHY your answer is correct.':t.instruction;
 $gr('gr-avatar').textContent=t.emoji;$gr('gr-customer-message').textContent=reasonPhase?'“Good choice. Now show the evidence that supports it.”':'“'+t.dialog+'”';
 $gr('gr-scene').style.setProperty('--gr-art',chapter.art);$gr('gr-scene-label').textContent=chapter.scene;$gr('gr-onair').textContent=chapter.onair;
 $gr('gr-scene-emoji').textContent=t.emoji;$gr('gr-scene-title').textContent=solved?'Great job!':t.sceneTitle;$gr('gr-scene-desc').textContent=solved?'The campaign is one step closer to launch.':t.sceneDesc;
 $gr('gr-progress-count').textContent=completedCounts[currentChapter]+' / '+chapter.tasks.length+' completed';$gr('gr-progress-fill').style.width=(completedCounts[currentChapter]/chapter.tasks.length*100)+'%';
 const wordsMode=t.kind==='arrange';$gr('gr-builder').hidden=!wordsMode;$gr('gr-choices').hidden=wordsMode;$gr('gr-reset').hidden=!wordsMode;
 $gr('gr-check').hidden=t.kind==='select'||solved;$gr('gr-next').hidden=!solved;$gr('gr-hint').disabled=solved;$gr('gr-reset').disabled=solved;
 $gr('gr-feedback').className='gr-note';$gr('gr-feedback').textContent=solved?'✓ '+t.explain:reasonPhase?'Your answer is selected. Defend it with evidence.':'Choose the correct answer to save this part of the campaign.';
 $gr('gr-reward').className=solved?'gr-reward show':'gr-reward';$gr('gr-reward').textContent=solved?'✅ Approved! '+t.explain:'';
 if(wordsMode){renderWords(t);}else{renderCards(t);}
}
function renderCards(t){const cards=reasonPhase&&t.reasonChoices?t.reasonChoices:t.cards; const correctAnswer=reasonPhase?t.reasonAnswer:t.answer;
 $gr('gr-choices').classList.toggle('reading-choices',cards.some(c=>c.name.length>35));
 $gr('gr-choices').innerHTML=cards.map((c,i)=>{
 const pick=selection.includes(i),ok=solved&&(Array.isArray(correctAnswer)?correctAnswer.includes(i):correctAnswer===i);
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
 if(reasonPhase){if(n===t.reasonAnswer){selection=[n];completeQuestion();}else{selection=[n];renderCards(t);grFeedback('The explanation does not support every clue. Try again.',true);}return;}
 if(t.kind==='pair'){
  if(selection.includes(n))selection=selection.filter(v=>v!==n);else if(selection.length<2)selection.push(n);else selection=[selection[1],n];renderCards(t);return;
 }
 if(t.kind!=='select')return;
 if(n===t.answer){selection=[n];if(t.reasonChoices){reasonPhase=true;selection=[];renderQuestion();grFeedback('Your answer fits. Now explain why it fits.');}else completeQuestion();}
 else{selection=[n];renderCards(t);grFeedback('Not approved yet. Check every clue before trying another option.',true);}
}
function completeQuestion(){const t=chapters[currentChapter].tasks[index];if(solved)return;solved=true;completedCounts[currentChapter]=Math.max(completedCounts[currentChapter],index+1);
 $gr('gr-scene').classList.add('gr-flash');setTimeout(()=>$gr('gr-scene').classList.remove('gr-flash'),700);renderQuestion();changeHeader();
}
function checkSelection(){if(solved)return;const t=chapters[currentChapter].tasks[index];
 if(t.kind==='arrange'){
  if(selection.length<t.solution.length){grFeedback('Please select all '+t.solution.length+' words first.',true);return;}
  const ok=selection.every((w,i)=>t.words[w]===t.solution[i]);if(ok)completeQuestion();else grFeedback('Not quite. Check the imperative structure before submitting again.',true);
 }else if(t.kind==='pair'){
  if(selection.length!==2){grFeedback('Choose TWO bags before checking.',true);return;}
  const good=t.answer.every(v=>selection.includes(v));if(good)completeQuestion();else grFeedback('This pair does not satisfy both requirements. Compare their measurements again.',true);
 }
}
function nextChallenge(){if(!solved)return;const chapter=chapters[currentChapter];if(index<chapter.tasks.length-1){index++;selection=[];solved=false;hintShown=false;reasonPhase=false;renderQuestion();window.scrollTo({top:0,behavior:'smooth'});return;}
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
$gr('gr-hint').addEventListener('click',()=>{if(solved)return;const t=chapters[currentChapter].tasks[index];grFeedback('💡 '+(reasonPhase&&t.reasonHint?t.reasonHint:t.hint));});
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
