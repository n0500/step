
const levels=[
  {
    "tense": "Factory routine",
    "tag": "QUALITY CONTROL",
    "name": "Vehicle inspection",
    "words": [
      "were",
      "before shipment.",
      "inspected",
      "Every vehicle",
      "have been",
      "is",
      "inspect",
      "will be"
    ],
    "solution": [
      "Every vehicle",
      "is",
      "inspected",
      "before shipment."
    ],
    "prompt": "Quality inspectors check every vehicle before shipment, as part of the factory's daily routine. Rewrite their procedure for our label without saying who checks it.",
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
      "The new models",
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
      "The new models",
      "have been",
      "inspected",
      "today."
    ],
    "prompt": "The technicians have just finished checking the new models. Their results matter NOW because the shipment can leave. Write the completion update.",
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
  "2": {
    "heading": "Product <span>Showroom</span>",
    "label": "MISSION 02 / PRODUCT SHOWROOM",
    "sub": "Read the clues. Make a choice you can defend.",
    "art": "var(--showroom-art)",
    "scene": "PRODUCT SHOWROOM",
    "onair": "CUSTOMERS WAITING",
    "tasks": [
      {
        "kind": "select",
        "topic": "COMPARATIVES IN CONTEXT",
        "title": "The phone buyer",
        "instruction": "Find the only phone that meets EVERY condition.",
        "dialog": "I can spend up to $800. I need a phone lighter than the 210 g model. But the 155 g model has too little battery life for me.",
        "emoji": "📱",
        "sceneTitle": "Compare three specifications",
        "sceneDesc": "A decision must satisfy the weight AND budget clues.",
        "cards": [
          {
            "icon": "📱",
            "name": "Phone A",
            "note": "210 g · 5,000 mAh",
            "tag": "$720"
          },
          {
            "icon": "📱",
            "name": "Phone B",
            "note": "155 g · 2,800 mAh",
            "tag": "$790"
          },
          {
            "icon": "📱",
            "name": "Phone C",
            "note": "182 g · 4,300 mAh",
            "tag": "$760"
          }
        ],
        "answer": 2,
        "explain": "Phone C meets the budget, is lighter than A, and avoids the small-battery model B.",
        "hint": "First eliminate the weight the buyer rejects. Then check both remaining conditions."
      },
      {
        "kind": "select",
        "topic": "SUPERLATIVE CLAIMS",
        "title": "Which ad is accurate?",
        "instruction": "Choose an advertisement that is BOTH true and grammatical.",
        "dialog": "Battery test: Model A lasts 8 hours, Model B lasts 13 hours, and Model C lasts 11 hours. Only one claim may go live.",
        "emoji": "🔋",
        "sceneTitle": "Verify the battery advertisement",
        "sceneDesc": "Use the data and the superlative correctly.",
        "cards": [
          {
            "icon": "🔋",
            "name": "Model C has the longest battery life.",
            "note": "Claim A"
          },
          {
            "icon": "🔋",
            "name": "Model B has the longest battery life.",
            "note": "Claim B"
          },
          {
            "icon": "🔋",
            "name": "Model B has the most longest battery life.",
            "note": "Claim C"
          }
        ],
        "answer": 1,
        "explain": "13 hours is the highest duration. The correct superlative is the longest, without most.",
        "hint": "Compare all three values, then make sure the superlative is not doubled."
      },
      {
        "kind": "pair",
        "topic": "AS ... AS",
        "title": "Same weight AND capacity",
        "instruction": "Select TWO bags equally heavy AND equally spacious.",
        "dialog": "My friend and I need equally heavy bags with the same capacity. The prices do not matter.",
        "emoji": "🧳",
        "sceneTitle": "Match two specifications",
        "sceneDesc": "A weight match alone is not enough.",
        "cards": [
          {
            "icon": "🧳",
            "name": "Bag A",
            "note": "2.1 kg · 25 L",
            "tag": "$90"
          },
          {
            "icon": "🧳",
            "name": "Bag B",
            "note": "2.1 kg · 30 L",
            "tag": "$90"
          },
          {
            "icon": "🧳",
            "name": "Bag C",
            "note": "2.1 kg · 25 L",
            "tag": "$110"
          }
        ],
        "answer": [
          0,
          2
        ],
        "explain": "A is as heavy as C, and A is as spacious as C. Both weigh 2.1 kg and hold 25 L.",
        "hint": "Every bag has the same weight. Which two ALSO hold the same number of liters?"
      },
      {
        "kind": "select",
        "topic": "SENSE VERBS + LIKE",
        "title": "The mystery speaker",
        "instruction": "Choose the description supported by BOTH sensory clues.",
        "dialog": "The speaker makes a low buzzing sound. Its case feels soft, just like velvet. There is no picture on the screen.",
        "emoji": "🔊",
        "sceneTitle": "Describe what you notice",
        "sceneDesc": "Do not confuse sounds, appearance and touch.",
        "cards": [
          {
            "icon": "👀",
            "name": "It looks like a bee and feels like velvet.",
            "note": "Description A"
          },
          {
            "icon": "🎵",
            "name": "It sounds like a bee and feels like velvet.",
            "note": "Description B"
          },
          {
            "icon": "🖐️",
            "name": "It sounds like velvet and feels like a bee.",
            "note": "Description C"
          }
        ],
        "answer": 1,
        "explain": "Sounds like describes the buzzing; feels like describes the soft surface. Both clues are needed.",
        "hint": "Match each sensory clue to the sense used to notice it."
      }
    ]
  },
  "3": {
    "heading": "Smart Shopping <span>Mall</span>",
    "label": "MISSION 03 / FORM, MEANING & FUNCTION",
    "sub": "Solve real shopping problems using precise English.",
    "art": "var(--mall-art)",
    "scene": "SMART SHOPPING MALL",
    "onair": "CUSTOMERS WAITING",
    "tasks": [
      {
        "kind": "select",
        "topic": "DEMONSTRATIVES",
        "title": "The distant display",
        "instruction": "Write the shopkeeper’s sentence, not the customer’s.",
        "dialog": "The SHOPKEEPER is standing beside one silver watch. TWO gold watches are far across the aisle, near the customer. The shopkeeper wants to advertise the gold watches.",
        "emoji": "⌚",
        "sceneTitle": "See the scene from the speaker’s position",
        "sceneDesc": "Distance and number both matter.",
        "cards": [
          {
            "icon": "⌚",
            "name": "Those gold watches are on sale.",
            "note": "Sign A"
          },
          {
            "icon": "⌚",
            "name": "These gold watches are on sale.",
            "note": "Sign B"
          },
          {
            "icon": "⌚",
            "name": "That gold watches are on sale.",
            "note": "Sign C"
          }
        ],
        "answer": 0,
        "explain": "Those is used for two or more items far from the speaker. The speaker is the shopkeeper.",
        "hint": "Who is speaking? Where are the gold watches relative to that person?"
      },
      {
        "kind": "arrange",
        "topic": "NEGATIVE IMPERATIVES",
        "title": "Protect the display",
        "instruction": "Build a polite warning; extra word tiles are traps.",
        "dialog": "Visitors are touching a delicate screen and leaving fingerprints. The manager needs a polite sign telling people NOT to touch it.",
        "emoji": "🚫",
        "sceneTitle": "Create a safety instruction",
        "sceneDesc": "A warning requires a negative command.",
        "words": [
          "touches",
          "Please",
          "do not",
          "touching",
          "the display.",
          "touch",
          "not to",
          "do"
        ],
        "solution": [
          "Please",
          "do not",
          "touch",
          "the display."
        ],
        "explain": "A polite negative imperative can use Please + do not + base verb.",
        "hint": "A negative command needs do not before the base form of the action verb."
      },
      {
        "kind": "select",
        "topic": "A / AN BY SOUND",
        "title": "The tricky articles",
        "instruction": "Only one advertisement uses BOTH articles correctly.",
        "dialog": "The offer includes an hour-long demo and a notebook bearing a university logo. Listen to the BEGINNING SOUNDS, not only the first letters.",
        "emoji": "📝",
        "sceneTitle": "Two articles, one decision",
        "sceneDesc": "Silent h and the /y/ sound can be misleading.",
        "cards": [
          {
            "icon": "📝",
            "name": "A hour-long demo and an university notebook.",
            "note": "Label A"
          },
          {
            "icon": "📝",
            "name": "An hour-long demo and a university notebook.",
            "note": "Label B"
          },
          {
            "icon": "📝",
            "name": "An hour-long demo and an university notebook.",
            "note": "Label C"
          }
        ],
        "answer": 1,
        "explain": "Hour begins with a vowel sound, so an; university begins with /y/, so a.",
        "hint": "The h in hour is silent, while university begins with a consonant /y/ sound."
      },
      {
        "kind": "select",
        "topic": "POSSESSIVE PRONOUNS",
        "title": "Sort the earbuds",
        "instruction": "Choose the clerk’s reply without repeating “earbuds.”",
        "dialog": "The clerk is speaking TO YOU. She points to blue earbuds that belong to YOU, and red earbuds that belong to HER. Which statement should the clerk say?",
        "emoji": "🎧",
        "sceneTitle": "Who owns which pair?",
        "sceneDesc": "Follow the speaker’s point of view.",
        "cards": [
          {
            "icon": "🎧",
            "name": "The blue ones are hers; the red ones are yours.",
            "note": "Reply A"
          },
          {
            "icon": "🎧",
            "name": "The blue ones are yours; the red ones are hers.",
            "note": "Reply B"
          },
          {
            "icon": "🎧",
            "name": "The blue ones are mine; the red ones are theirs.",
            "note": "Reply C"
          }
        ],
        "answer": 1,
        "explain": "The listener owns blue, so yours; the clerk owns red, so hers.",
        "hint": "In the clerk’s sentence, which pronoun refers to the person she is speaking to?"
      },
      {
        "kind": "select",
        "topic": "WHOSE / OWNERSHIP",
        "title": "A shared purchase",
        "instruction": "Give the correct answer to “Whose...?”",
        "dialog": "Ali and Faisal bought these headphones TOGETHER. Neither boy owns them alone. A customer asks, “Whose headphones are these?”",
        "emoji": "🎧",
        "sceneTitle": "Find the shared owner",
        "sceneDesc": "One object can belong to more than one person.",
        "cards": [
          {
            "icon": "🎧",
            "name": "They're his.",
            "note": "Reply A"
          },
          {
            "icon": "🎧",
            "name": "They're ours.",
            "note": "Reply B"
          },
          {
            "icon": "🎧",
            "name": "They're theirs.",
            "note": "Reply C"
          }
        ],
        "answer": 2,
        "explain": "The headphones belong to two other people, so they are theirs.",
        "hint": "The speaker is not Ali or Faisal. Choose the pronoun for ownership by two other people."
      },
      {
        "kind": "select",
        "topic": "ONE / ONES",
        "title": "The cheaper chargers",
        "instruction": "Choose a reply that preserves BOTH quantity and price.",
        "dialog": "The customer needs THREE chargers. The three BLUE chargers cost $105 altogether, while three BLACK chargers cost $150. What should the assistant recommend?",
        "emoji": "🔌",
        "sceneTitle": "Quantity matters",
        "sceneDesc": "A plural noun needs the correct replacement word.",
        "cards": [
          {
            "icon": "🔌",
            "name": "Take the blue one.",
            "note": "Reply A"
          },
          {
            "icon": "🔌",
            "name": "Take the black ones.",
            "note": "Reply B"
          },
          {
            "icon": "🔌",
            "name": "Take the blue ones.",
            "note": "Reply C"
          }
        ],
        "answer": 2,
        "explain": "Three chargers are plural, so ones replaces chargers; the blue group is cheaper.",
        "hint": "The customer needs three, not one. Then compare the total prices."
      },
      {
        "kind": "select",
        "topic": "TOO / ENOUGH",
        "title": "Fit the customer",
        "instruction": "Approve the only true, grammatically accurate recommendation.",
        "dialog": "The customer needs size M and has no more than $200. Jacket A is size S for $120; Jacket B is size M for $180; Jacket C is size M for $250.",
        "emoji": "🧥",
        "sceneTitle": "Explain the best choice",
        "sceneDesc": "Use both the size and budget evidence.",
        "cards": [
          {
            "icon": "🧥",
            "name": "Jacket A is big enough but too expensive.",
            "note": "Advice A"
          },
          {
            "icon": "🧥",
            "name": "Jacket B is large enough and inexpensive enough.",
            "note": "Advice B"
          },
          {
            "icon": "🧥",
            "name": "Jacket C is cheap enough but too small.",
            "note": "Advice C"
          }
        ],
        "answer": 1,
        "explain": "Jacket B fits size M and costs less than $200. A is too small, while C is too expensive.",
        "hint": "Check the size requirement first, then check which price stays inside the budget."
      }
    ]
  },
  "4": {
    "heading": "The Big <span>Launch</span>",
    "label": "FINAL MISSION / SAVE THE CAMPAIGN",
    "sub": "Final quality control: combine meaning, grammar, and evidence.",
    "art": "var(--launch-art)",
    "scene": "LIVE ADVERTISING CAMPAIGN",
    "onair": "PRE-LAUNCH",
    "tasks": [
      {
        "kind": "select",
        "topic": "FINAL · TWO PASSIVE TENSES",
        "title": "Correct the factory report",
        "instruction": "Choose the ONLY passive report that preserves both time clues.",
        "dialog": "Engineers installed the machines last Monday. Quality inspectors test them every Friday. The launch team needs an accurate passive-voice summary.",
        "emoji": "🏭",
        "sceneTitle": "Past event + regular routine",
        "sceneDesc": "Both clauses must match the original meaning.",
        "cards": [
          {
            "icon": "📄",
            "name": "The machines were installed last Monday and are tested every Friday.",
            "note": "Report A"
          },
          {
            "icon": "📄",
            "name": "The machines are installed last Monday and were tested every Friday.",
            "note": "Report B"
          },
          {
            "icon": "📄",
            "name": "The machines have been installed last Monday and will be tested every Friday.",
            "note": "Report C"
          }
        ],
        "answer": 0,
        "explain": "Were installed reports a finished past event; are tested describes a routine that happens every Friday.",
        "hint": "One clause happened on a specific past day; the other describes a recurring schedule.",
      "reasonChoices": [{"icon":"🧠","name":"Both actions happened last Monday, so both verbs must use were."},{"icon":"🧠","name":"A specific finished day needs past passive; a repeated Friday routine needs present passive."},{"icon":"🧠","name":"Every Friday is a future plan, so the second clause needs will be."}],
      "reasonAnswer": 1,
      "reasonHint": "Identify which clue names a finished day, and which describes a repeated habit."
      },
      {
        "kind": "select",
        "topic": "FINAL · TWO COMPARISONS",
        "title": "Check the camera promotion",
        "instruction": "Publish only a claim that is grammatically correct AND supported by the table.",
        "dialog": "Camera A: $520, 3-year warranty. Camera B: $600, 2-year warranty. Camera C: $760, 1-year warranty.",
        "emoji": "📷",
        "sceneTitle": "Prices and warranties",
        "sceneDesc": "The correct claim needs two true comparisons.",
        "cards": [
          {
            "icon": "📷",
            "name": "Camera B is the least expensive and has the longest warranty.",
            "note": "Claim A"
          },
          {
            "icon": "📷",
            "name": "Camera A is less expensive than B and has the longest warranty.",
            "note": "Claim B"
          },
          {
            "icon": "📷",
            "name": "Camera C is as inexpensive as A and has a longer warranty.",
            "note": "Claim C"
          }
        ],
        "answer": 1,
        "explain": "A is cheaper than B ($520 vs $600) and has the longest warranty of all three (3 years).",
        "hint": "A claim must be correct for BOTH price and warranty, not just one.",
      "reasonChoices": [{"icon":"🧠","name":"A costs less than B, and its three-year warranty exceeds both other warranties."},{"icon":"🧠","name":"The longest warranty always means the product is the cheapest, regardless of its price."},{"icon":"🧠","name":"Camera A and Camera C have equal warranties, but Camera A costs less."}],
      "reasonAnswer": 0,
      "reasonHint": "Recheck each of the two comparisons against the figures."
      },
      {
        "kind": "select",
        "topic": "FINAL · DISTANCE + OWNERSHIP",
        "title": "Authorize the last announcement",
        "instruction": "Think from the SHOPKEEPER’s point of view.",
        "dialog": "The shopkeeper is beside ONE black speaker she owns. TWO red speakers belong to the customer and are far across the store. What should the shopkeeper say?",
        "emoji": "🚀",
        "sceneTitle": "The final language check",
        "sceneDesc": "Get distance, number, and ownership right at once.",
        "cards": [
          {
            "icon": "🔊",
            "name": "These red speakers are yours, but that black one is mine.",
            "note": "Announcement A"
          },
          {
            "icon": "🔊",
            "name": "Those red speakers are mine, but this black one is yours.",
            "note": "Announcement B"
          },
          {
            "icon": "🔊",
            "name": "Those red speakers are yours, but this black one is mine.",
            "note": "Announcement C"
          }
        ],
        "answer": 2,
        "explain": "Those = far and plural; this = near and singular. Yours belongs to the customer and mine to the shopkeeper.",
        "hint": "Work from the speaker’s position. Compare near/far, one/two, and who owns each item.",
      "reasonChoices": [{"icon":"🧠","name":"These always points to a single nearby object, and that always to several distant ones."},{"icon":"🧠","name":"Because the customer is near the red pair, the shopkeeper must say these."},{"icon":"🧠","name":"Those matches the distant pair; this matches the nearby single speaker; yours/mine match the owners."}],
      "reasonAnswer": 2,
      "reasonHint": "A complete reason must explain distance, singular/plural, and ownership."
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
