/* STEP UP | Units 5 & 6 textbook-aligned compact learning banks.
 * Practice passages below are original teaching summaries, NOT verbatim textbook text.
 * For complete passages, consult Mega Goal 1 Student Book pp. 78-79 and 92-93.
 * Listening questions follow original Conversation tracks: CD2/13 and CD2/20.
 * Keeps Firebase records, access controls, certificates and historical attempts untouched.
 */
(function(){
  'use strict';
  const J=window.STEPUP_JOURNEY;
  if(!J?.data?.units||!Array.isArray(J.data.questions))return;
  const specs={
    5:{
      title:'Did You Hurt Yourself?',
      objective:'Describe accidents, explain causes, express agreement, and talk about safety.',
      readingTitle:'Unusual Accidents and Deaths',
      reading:`Unusual Accidents and Deaths
Adapted study summary — read the complete original passage in your Student Book (pp. 78–79).

1. According to a legend, the Greek writer Aeschylus was bald. An eagle mistook his head for a rock and appeared to hurl a tortoise toward it. The incident had a tragic ending.

2. Another unusual event happened near Abha in Saudi Arabia. An ostrich escaped onto a busy highway and had to weave through traffic. Avoiding the unexpected bird was a challenge for drivers.

3. Some accidents had happier endings. Skydiver Bob Hail survived when both of his parachutes failed. Drag racer Phil Lamattina survived when his car became airborne and burst into flames during a race.

4. Railway worker Phineas Gage also survived a serious accident involving an explosion. In time, he was able to recover. The reading contrasts tragic accidents with surprising escapes.`,
      listening:'Original Unit 5 Conversation (CD2 Track 13): Samir and Jasem describe their road and cycling accidents. Samir skidded on oil while riding a motorcycle, crashed into a car, and says his helmet probably saved his life. Jasem swerved to avoid a squirrel while cycling in a park and hit a tree. They talk about injuries and lucky escapes.',
      sections:[
        ['m1','Real Talk & Accident Expressions','Conversation • useful expressions'],
        ['m2','Reflexive Pronouns','myself • yourself • himself • herself • ourselves • themselves'],
        ['m3','Because, So, So & Neither','Cause and effect • agreement'],
        ['m4','Form, Meaning & Function','must / should • adverbs of manner'],
        ['m5','Unusual Accidents and Deaths','Reading • main idea • scanning • inference'],
        ['m7','Vocabulary in Context','After Reading • six clues from the story'],
        ['m6','Samir & Jasem','Listening • original Conversation • CD2 Track 13']
      ],
      questions:[
        [1,'Real Talk','“I guess” shows that the speaker ___.','is not completely sure',['is giving an order','has finished a task','disagrees angrily'],'I guess signals uncertainty.'],
        [1,'Real Talk','“Look at it this way” is used to ___.','introduce another way of thinking',['ask for directions','describe an injury','tell someone to turn around'],'The speaker offers a different perspective.'],
        [2,'Reflexive Pronouns','Maha cut ___ while preparing lunch.','herself',['himself','itself','themselves'],'The subject Maha and the object are the same person: herself.'],
        [2,'Reflexive Pronouns','My brother hurt ___ when he fell.','himself',['herself','yourself','ourselves'],'A male singular subject takes himself.'],
        [2,'Reflexive Pronouns','We painted the safety posters ___.','ourselves',['themselves','himself','myself'],'We takes ourselves; it also emphasizes doing something without help.'],
        [2,'Reflexive Pronouns','I fixed my bicycle by ___.','myself',['yourself','ourselves','herself'],'I takes myself. By myself means without help.'],
        [3,'Because versus So','The road was slippery, ___ the car skidded.','so',['because','neither','although'],'So introduces the result.'],
        [3,'Because versus So','She wore a helmet ___ she wanted to protect her head.','because',['so','neither','and so'],'Because gives the reason.'],
        [3,'Agreement • So','A: I wear a helmet. B: So ___ I.','do',['did','am','have'],'Use So do I with present simple I wear.'],
        [3,'Agreement • Neither','A: I have never broken a leg. B: Neither ___ I.','have',['do','did','am'],'Use Neither have I with present perfect.'],
        [4,'FMF • Must','A red traffic light means you ___ stop.','must',['might','should not','could'],'Must expresses a rule or obligation.'],
        [4,'FMF • Must Not','Drivers ___ park on a sidewalk.','must not',['must to','should to','can to'],'Must not means something is prohibited.'],
        [4,'FMF • Should','You ___ pay attention when crossing a road.','should',['should to','must not','ought'],'Should expresses advice.'],
        [4,'FMF • Adverbs','The careful driver drove ___.','carefully',['careful','care','more careful'],'Carefully is the adverb of manner.'],
        [4,'FMF • Irregular Adverbs','She is a good driver. She drives ___.','well',['good','goodly','bestly'],'The adverb of good is well.'],
        [5,'Reading • Main Idea','What does the reading mainly compare?','Unusual accidents with tragic endings and lucky escapes',['Types of public transportation','Reasons to become a writer','Different advertising methods'],'The article tells stories with both unhappy and happy endings.'],
        [5,'Reading • Detail','What did the eagle mistake for a rock?','Aeschylus’s bald head',['A car windshield','A parachute','An ostrich'],'Look at the opening incident involving the writer.'],
        [5,'Reading • Scanning','Where was an ostrich spotted in traffic?','Near Abha in Saudi Arabia',['At a hospital in London','At a race in Australia','At an airport in Canada'],'Scan paragraph 2 for the place.'],
        [5,'Reading • Inference','What do Bob Hail and Phil Lamattina have in common?','Both survived very dangerous accidents',['Both were famous writers','Both had minor bicycle falls','Both repaired a plane'],'Both stories describe unusual escapes.'],
        [7,'Vocabulary • After Reading','The word “bald” means ___.','having no hair on the head',['wearing a helmet','afraid of heights','very tired'],'The eagle mistook a head for a rock.','According to a legend, the Greek writer Aeschylus was bald.','bald',1],
        [7,'Vocabulary • After Reading','The verb “hurl” means ___.','throw with great force',['walk slowly','hold carefully','read aloud'],'The tortoise moved toward the head from above.','An eagle mistook his head for a rock and appeared to hurl a tortoise toward it.','hurl',1],
        [7,'Vocabulary • After Reading','The phrase “weave through” means ___.','move among obstacles while changing direction',['stop suddenly','remain completely still','fall from the sky'],'A bird moved among cars.','An ostrich escaped onto a busy highway and had to weave through traffic.','weave through',2],
        [7,'Vocabulary • After Reading','A “challenge” is ___.','something difficult to do',['a simple daily routine','a written invitation','a type of bird'],'Think of what the drivers faced.','Avoiding the unexpected bird was a challenge for drivers.','challenge',2],
        [7,'Vocabulary • After Reading','To “burst” into flames means to ___.','suddenly catch fire',['move safely away','land softly','return to normal'],'The race car caught fire.','Drag racer Phil Lamattina survived when his car became airborne and burst into flames during a race.','burst',3],
        [7,'Vocabulary • After Reading','To “recover” means to ___.','get better after an injury',['cause an accident','become more dangerous','move between cars'],'Think about the worker after the accident.','In time, he was able to recover.','recover',4],
        [6,'Listening • Detail','Why did Samir crash his motorcycle?','It skidded on a patch of oil.',['A squirrel crossed the park.','The fuel ran out.','He forgot his bicycle.'],'Samir says his motorcycle skidded on oil.'],
        [6,'Listening • Detail','What probably saved Samir’s life?','His helmet',['His phone','His backpack','His shoes'],'He was wearing a helmet.'],
        [6,'Listening • Detail','Why did Jasem hit a tree?','He swerved to avoid a squirrel.',['He was escaping from a dog.','He was racing in a car.','He fell from a plane.'],'Jasem says a squirrel appeared, and he swerved.']
      ]
    },
    6:{
      title:'Take My Advice',
      objective:'Discuss problems, give advice, use phrasal verbs, and make healthy choices.',
      readingTitle:'Breaking the Habit—Getting Healthy',
      reading:`Breaking the Habit—Getting Healthy
Adapted study summary — read the complete original passage in your Student Book (pp. 92–93).

1. Eating too much junk food can become a habit. Some people feel addicted to fast food and reach for it as soon as they get hungry. Comfort eating is choosing food to deal with sadness or stress rather than hunger.

2. The article explains that healthy meals can still be enjoyable. A person might choose salad instead of extra fries. Eating heavy junk-food meals may leave some people sleepy or tired.

3. To cut down on junk food, you can reduce how much you eat gradually. Others prefer to give up junk food for a period of time. If a friend offers you fast food, you can politely turn down the offer and choose something healthier.

4. An occasional setback does not mean failure. Set achievable goals, follow your plan, and treat yourself kindly. Lasting change takes time and a practical decision.`,
      listening:'Original Unit 6 Conversation (CD2 Track 20): Mohammed feels down about upcoming exams and classmates who constantly call him for help. Hussain advises him to explain that he also needs time to study. Other classmates call Hussain first to find out Mohammed’s mood. Hussain would like Mohammed to talk to them.',
      sections:[
        ['m1','Real Talk & Useful Expressions','Conversation • how to express feelings'],
        ['m2','Giving Advice','should • ought to • had better • could'],
        ['m3','Two- and Three-Word Verbs','put off • turn down • give up • look out for • get along with'],
        ['m4','Form, Meaning & Function','how much / how many • quantities • time clauses'],
        ['m5','Breaking the Habit—Getting Healthy','Reading • identifying evidence'],
        ['m7','Vocabulary in Context','After Reading • six clues from the story'],
        ['m6','Hussain & Mohammed','Listening • original Conversation • CD2 Track 20']
      ],
      questions:[
        [1,'Real Talk','“Feeling down” means ___.','feeling sad or discouraged',['looking down the stairs','feeling hungry','exercising often'],'The phrase describes Mohammed’s mood.'],
        [1,'Real Talk','“To be honest” introduces ___.','a sincere or direct opinion',['a direction to a place','a rule about traffic','a request for money'],'The speaker makes a statement more direct.'],
        [2,'Grammar • Should','You seem tired. You ___ get some rest.','should',['should to','shoulding','should have to'],'Should + base verb gives advice.'],
        [2,'Grammar • Ought To','You ___ explain your problem to a friend.','ought to',['ought','oughting','are ought'],'Ought to + base verb expresses advice.'],
        [2,'Grammar • Had Better','You had better ___ early before the exam.','sleep',['to sleep','sleeping','slept'],'Had better is followed by the base verb.'],
        [2,'Grammar • Negative Advice','You ___ skip sleep before your exam.','should not',['should to not','ought','had better to'],'Should not advises against an action.'],
        [3,'Phrasal Verbs • Give Up','“I give up!” means “I ___.”','stop trying',['start again immediately','turn left','wake up late'],'Give up means stop trying.'],
        [3,'Phrasal Verbs • Turn Down','If you do not want the offer, you can ___ it.','turn down',['look after','give in','put on'],'Turn down means refuse.'],
        [3,'Phrasal Verbs • Put Off','Don’t ___ studying until the last night.','put off',['put on','take off','get in'],'Put off means postpone.'],
        [3,'Phrasal Verbs • Look Out For','He only ___ himself instead of helping his friends.','looks out for',['puts up with','turns down','gets over'],'Look out for yourself can mean prioritize your own interests.'],
        [4,'FMF • How Much','___ water do you drink daily?','How much',['How many','How long many','How few'],'Use how much with the noncount noun water.'],
        [4,'FMF • How Many','___ vegetables do you usually eat?','How many',['How much','How far','How old'],'Use how many with a plural count noun.'],
        [4,'FMF • A Little','There is only ___ milk left.','a little',['a few','many','few'],'A little goes with noncount nouns.'],
        [4,'FMF • A Few','I eat ___ pieces of fruit each day.','a few',['a little','much','little'],'A few goes with plural count nouns.'],
        [4,'FMF • Time Clause','When you ___ home, have a healthy meal.','get',['will get','getting','gotten'],'In a future time clause after when, use the present simple.'],
        [5,'Reading • Main Idea','What is the main message of the passage?','Recognize unhealthy habits and make realistic changes',['Never eat vegetables','All fast food is healthy','Friends should choose every meal'],'The article offers practical ways to change eating habits.'],
        [5,'Reading • Detail','What is comfort eating?','Eating to cope with feelings rather than hunger',['Eating only breakfast','Cooking for a large family','Having a healthy snack after sport'],'The passage links stress or sadness with eating.'],
        [5,'Reading • Detail','Which choice is suggested instead of extra fries?','Salad',['Another burger','A sweet drink','Two desserts'],'A small substitution can improve a meal.'],
        [5,'Reading • Inference','If you eat fast food once after starting a healthier plan, you should ___.','continue your plan instead of giving up',['stop trying forever','ignore every goal','always eat fast food'],'One setback does not undo progress.'],
        [7,'Vocabulary • Context','Someone who is “addicted” ___.','finds it very hard to stop a habit',['always eats slowly','never feels stressed','cannot cook'],'This describes a difficult-to-break habit.','Some people feel addicted to fast food and reach for it as soon as they get hungry.','addicted',1],
        [7,'Vocabulary • Context','“Comfort eating” means ___.','eating to manage uncomfortable feelings',['eating at a restaurant','sharing food with friends','learning a recipe'],'Notice the link to emotions.','Comfort eating is choosing food to deal with sadness or stress rather than hunger.','Comfort eating',1],
        [7,'Vocabulary • Context','To “cut down on” means ___.','reduce the amount of something',['increase it every day','completely forget it','buy it online'],'Think about eating less junk food.','To cut down on junk food, you can reduce how much you eat gradually.','cut down on',3],
        [7,'Vocabulary • Context','“Give up” means ___.','stop a habit or activity',['continue without change','order more food','ask for directions'],'The passage contrasts stopping with gradual reduction.','Others prefer to give up junk food for a period of time.','give up',3],
        [7,'Vocabulary • Context','To “turn down” an offer means ___.','refuse it politely',['accept immediately','repeat it loudly','pay for it'],'Someone offers fast food.','If a friend offers you fast food, you can politely turn down the offer and choose something healthier.','turn down',3],
        [7,'Vocabulary • Context','“Achievable” goals are ___.','realistic and possible to reach',['impossible to complete','very expensive','unrelated to your plan'],'The writer recommends realistic goals.','Set achievable goals, follow your plan, and treat yourself kindly.','achievable',4],
        [6,'Listening • Main Idea','What is Mohammed worried about?','Exams and classmates asking for constant help',['A cycling accident','A missing wallet','A broken refrigerator'],'Mohammed is under pressure from studying and phone calls.'],
        [6,'Listening • Detail','What does Hussain advise Mohammed to do?','Tell classmates he also needs time to study',['Stop going to school','Answer every call at once','Skip all his exams'],'Hussain says classmates cannot expect him to be free all the time.'],
        [6,'Listening • Detail','Why do classmates call Hussain first?','To find out what mood Mohammed is in',['To borrow a bike','To plan a meal','To buy a helmet'],'They want to know Mohammed’s mood before contacting him.']
      ]
    }
  };
  const opt=['opt_a','opt_b','opt_c','opt_d'];
  const allNew=[];
  const results={};
  Object.keys(specs).forEach(k=>{
    const n=Number(k),s=specs[n];
    const u=J.data.units.find(x=>Number(x.number)===n);
    if(!u)throw Error('Unit not found: '+n);
    u.title=s.title;u.objective=s.objective;u.reading=s.reading;u.listening=s.listening;
    const later=u.missions.find(m=>m.id==='m7');
    if(!later)throw Error('Vocabulary mission not found: '+n);
    later.type='core';later.source='7. Vocabulary in Context';
    u.missions=['m1','m2','m3','m4','m5','m7','m6'].map(id=>u.missions.find(m=>m.id===id)).filter(Boolean);
    if(u.missions.length!==7)throw Error('Wrong mission count for '+n);
    s.sections.forEach(([id,title,sub])=>{
      const m=u.missions.find(x=>x.id===id);
      m.title=title;m.sub=sub;
    });
    const passage=s.reading.split(/\n\s*\n/);
    const counts={};
    s.questions.forEach((q,i)=>{
      const [num,skill,prompt,right,wrong,explanation,excerpt,needle,paragraph]=q;
      if(wrong.length!==3 || new Set([right,...wrong]).size!==4)throw Error('Duplicate/invalid answers: U'+n+' '+i);
      const m=u.missions.find(x=>x.id==='m'+num);
      if(!m)throw Error('Missing mission: '+n+','+num);
      const answer=i%4,choices=[...wrong];choices.splice(answer,0,right);
      const stage='Mastery';
      const data={
        question_id:'U'+n+'R-'+String(i+1).padStart(3,'0'),unit_id:'MG1_U'+n,mission:m.source,
        stage,skill,difficulty:'متوسط',question_type:'multiple_choice',
        source_type:num===6?'Textbook Conversation listening review':'Teacher-created textbook-aligned practice',
        source_ref:num===6?'Mega Goal 1 • Unit '+n+' • Conversation • CD2 Track '+(n===5?'13':'20'):(num===5||num===7?'Mega Goal 1 • Unit '+n+' • Reading pp. '+(n===5?'78–79':'92–93'):'Mega Goal 1 • Unit '+n+' • Grammar / Conversation / FMF'),
        source_original_text:'Original review question (not copied from the textbook).',
        prompt,option_a_id:opt[0],option_a_text:choices[0],option_b_id:opt[1],option_b_text:choices[1],
        option_c_id:opt[2],option_c_text:choices[2],option_d_id:opt[3],option_d_text:choices[3],
        correct_option_id:opt[answer],explanation,hint:num===7?'Find the highlighted clue in the reading summary.':explanation,
        next_if_correct:'update_mastery',next_if_wrong:'update_mastery',
        pool_id:'U'+n+'_'+m.id+'_Mastery',mastery_points:1,attempt_limit:2,
        certificate_eligible:true,randomize_options:false,review_status:'معتمد'
      };
      if(excerpt){
        if(!passage[paragraph]?.includes(excerpt)||!excerpt.toLowerCase().includes(needle.toLowerCase()))throw Error('Bad passage context '+n+' '+i);
        data.context_excerpt=excerpt;data.context_match=needle;data.context_paragraph=paragraph;
      }
      counts[num]=(counts[num]||0)+1;allNew.push(data);
    });
    if(s.questions.length!==28||[2,4,4,5,4,6,3].some((v,i)=>counts[[1,2,3,4,5,7,6][i]]!==v))throw Error('Bad question counts for U'+n+': '+JSON.stringify(counts));
    results['u'+n]={ready:true,questionCount:s.questions.length,reading:'textbook-aligned summary',listening:'CD2 Track '+(n===5?'13':'20'),teacherControlled:true};
  });
  const old=J.data.questions.filter(q=>q.unit_id!=='MG1_U5'&&q.unit_id!=='MG1_U6');
  J.data.questions=old.concat(allNew);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.STEPUP_U56_CONTEXT={render(q){
    if(!q?.context_excerpt||!q.context_match)return '';
    const s=q.context_excerpt,t=q.context_match,j=s.toLowerCase().indexOf(t.toLowerCase());
    if(j<0)return '';
    const v=escape(s.slice(0,j))+'<mark style="background:#fff0a6;color:#19344e;padding:2px 3px;border-radius:3px;font-weight:900">'+escape(s.slice(j,j+t.length))+'</mark>'+escape(s.slice(j+t.length));
    return '<section dir="ltr" style="margin:12px 0 16px;padding:15px;border-radius:13px;border:1px solid #c5dce6;background:#f4fafb;color:#18344d;text-align:left;line-height:1.85"><small style="font-weight:800;color:#226579">📖 Reading • Paragraph '+escape(q.context_paragraph)+'</small><p style="font-size:clamp(16px,2.2vw,21px)">'+v+'</p><small>Use the highlighted word and its surrounding context.</small></section>';
  }};
  window.STEPUP_U56_CONTENT=results;
})();