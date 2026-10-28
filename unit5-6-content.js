/* STEP UP | Units 5 & 6 textbook-aligned compact learning banks.
 * Reading passages transcribed from the teacher-supplied 2025 Student Book; PDF glyphs normalized.
 * Passages sourced from Mega Goal 1 Student Book pp. 74 and 88.
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
      reading:"Unusual Accidents and Deaths\n\nMany people are interested in stories of unusual accidents—some of these stories have happy endings, but some, unfortunately, have unhappy ones.\n\nUNHAPPY ENDINGS\n\nAccording to the legend, the ancient Greek playwright Aeschylus was killed when an eagle dropped a tortoise on his head. The bird was trying to break the tortoise’s shell on a rock in order to eat it. Aeschylus was bald, and the eagle thought the unfortunate man’s head was a good rock on which it could break the shell.\n\nAn eight-foot tall ostrich was seen weaving through heavy traffic on a Saudi Arabian highway, near Abha. One of the drivers filmed the scene and uploaded it on the internet. No one tried to stop and catch the 180-kg bird that was taller than humans and ran at almost 70 km per hour. It had probably escaped from a farm and ran into heavy traffic instead of the wild.\n\nSome people worry about being hit from things falling from outer space. There is only one person in all recorded history who has been killed by a meteorite—Manfredo Settala. The tragedy happened in 1680.\n\nAhmad Ali lost his eight-year-old son in a drowning accident at a friend’s house. His son had been invited to join other children at a friend’s house to play and swim in the pool. According to the invitation a lifeguard was going to be present. The young boy was really excited and begged his father to let him go. So, Ahmad Ali picked him up from school and drove him to his friend’s house before 1:00 p.m. That was the last time he saw him alive.\n\nHAPPY ENDINGS\n\nA German soldier was riding in the back seat of a World War I plane when the engine stalled as a result of an unusual gust of wind. He fell out of his seat while the plane was high above the ground. As he was falling, the plane’s engine started again, and he landed back in his own seat. The pilot was then able to land the plane safely.\n\nBob Hail jumped out of an airplane in November 1972, but his main parachute failed to open. His backup parachute also failed. Bob dropped about 3,000 feet (900 meters) at 80 miles (128 km) per hour and hit the ground face first. After a moment, he got up and walked away with only minor injuries. It was an amazing escape.\n\nIn September 2007, Phil Lamattina escaped death when he was driving at over 300 miles (500 km) per hour in a drag race in Brisbane, Australia. Phil was racing down the track when his car became airborne, split in two, and burst into a fireball. He was knocked out, but he survived. Although he was in the midst of the ball of fire, Phil was burned only on the tip of his finger. When his brothers later showed him the video of the accident, Phil couldn’t believe he was watching himself—and that he had such a lucky escape.\n\nRailroad worker Phineas P. Gage was working with some dynamite when it exploded unexpectedly. A bar that was 3 feet (1 meter) long and that weighed 13 pounds (6 kg) went clear through his head. He remained conscious, but was unable to see out of his left eye. After a while, his sight returned, and he fully recovered.",
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
        [7,'Vocabulary • After Reading','The verb “explode” means ___.','burst suddenly with force',['walk slowly','hold carefully','read aloud'],'Find the accident involving dynamite.','An eagle mistook his head for a rock and appeared to hurl a tortoise toward it.','exploded',1],
        [7,'Vocabulary • After Reading','The phrase “weave through” means ___.','move among obstacles while changing direction',['stop suddenly','remain completely still','fall from the sky'],'A bird moved among cars.','An ostrich escaped onto a busy highway and had to weave through traffic.','weaving through',2],
        [7,'Vocabulary • After Reading','“Conscious” means ___.','awake and aware',['a simple daily routine','a written invitation','a type of bird'],'Find how Phineas Gage felt after the explosion.','Avoiding the unexpected bird was a challenge for drivers.','conscious',2],
        [7,'Vocabulary • After Reading','To “burst” into flames means to ___.','suddenly catch fire',['move safely away','land softly','return to normal'],'The race car caught fire.','Drag racer Phil Lamattina survived when his car became airborne and burst into flames during a race.','burst',3],
        [7,'Vocabulary • After Reading','To “recover” means to ___.','get better after an injury',['cause an accident','become more dangerous','move between cars'],'Think about the worker after the accident.','In time, he was able to recover.','recovered',4],
        [6,'Listening • Detail','Why did Samir crash his motorcycle?','It skidded on a patch of oil.',['A squirrel crossed the park.','The fuel ran out.','He forgot his bicycle.'],'Samir says his motorcycle skidded on oil.'],
        [6,'Listening • Detail','What probably saved Samir’s life?','His helmet',['His phone','His backpack','His shoes'],'He was wearing a helmet.'],
        [6,'Listening • Detail','Why did Jasem hit a tree?','He swerved to avoid a squirrel.',['He was escaping from a dog.','He was racing in a car.','He fell from a plane.'],'Jasem says a squirrel appeared, and he swerved.']
      ]
    },
    6:{
      title:'Take My Advice',
      objective:'Discuss problems, give advice, use phrasal verbs, and make healthy choices.',
      readingTitle:'Breaking the Habit—Getting Healthy',
      reading:"Breaking the habit—Getting healthy\n\nGood eating habits contribute to health and fitness and make you feel strong. “What is so good about a diet of vegetables and fruit combined with lean meat, preferably chicken or fish?”, you might ask. If you are very tired, hungry, and upset there is nothing better than a juicy beef burger with fries or a giant pizza, you think. That’s probably true if your brain has gotten used to the pleasure felt when tasting junk food. But is it good for you? Does it help you stay fit and control your weight? How do you feel after you’ve had a meal? Are you sure it’s not time to break the habit?\n\nThe following is a checklist to help you decide if it’s time for you or a friend to change eating habits. Just ONE “warning sign” should be enough reason to take action.\n\n• You shouldn’t think ‘junk food’ the minute you start feeling hungry. There never is an acceptable reason for this. It is a definite sign of a habit that is on the way to becoming an addiction.\n\n• Comfort eating is usually associated with junk food and in general, high calorie food that is also high in carbohydrates [starch and sugar] and saturated fat. If you run to the nearest fast food chain every time you feel down, you know it is out of control.\n\n• A healthy, nutritious meal does not have to be bland and boring. When pushed you can picture appetizing dishes that do not contain fries or fatty ingredients but you still prefer to get hold of a beef burger or a pizza. You know it’s not the best food for you. You know that you are going to feel sleepy and tired after you have eaten.\n\n• To be honest, healthy is a relative term. It all depends on what your alternatives are. There are ‘healthier’ choices you can make even at a fast food restaurant. You might, for example, order salad as a side dish instead of a second helping of fries. You could avoid condiments such as ketchup or mayonnaise, or eat a chicken burger. You know all this, you have promised yourself to do it next time you are there, but somehow it never happens. You keep on insisting that those dishes take longer to prepare.\n\nBut breaking a habit can leave you feeling down. Don’t worry, this is quite common; and it shouldn’t last very long if you stick to your decision to give up junk food.\n\n• You ought to decide on your own if it’s best to cut down on the amount of junk food you eat, gradually over a period of time, or whether it’s best to stop altogether for some time.\n\n• You should allow yourself some time to do it successfully\n\n• You shouldn’t give up simply because you were with friends and joined them for dinner at a fast food restaurant, or because you helped yourself to a few fries.\n\n• Pick up some menus from different restaurants and read them carefully, paying attention to the ingredients of each dish. Then highlight the dishes that you find interesting.\n\n• You might go to the supermarket and wander around making a list of all the food and ingredients that you find attractive.\n\n• If a friend insists on offering you junk food, turn down the offer and treat yourself to something nice. The important thing is to regain control and only eat junk food when nothing else is available or very occasionally for a change.\n\n• Make a list of all the things you enjoy doing but had to give up because you gained weight or do not feel energetic enough. Decide what you would like to do again and when. Set yourself goals that are achievable and enjoyable. Treat yourself right!",
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
        [7,'Vocabulary • Context','The word “addiction” means ___','a habit that is very difficult to control',['always eats slowly','never feels stressed','cannot cook'],'This describes a difficult-to-break habit.','Some people feel addicted to fast food and reach for it as soon as they get hungry.','addiction',1],
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
        source_ref:num===6?'Mega Goal 1 • Unit '+n+' • Conversation • CD2 Track '+(n===5?'13':'20'):(num===5||num===7?'Mega Goal 1 • Unit '+n+' • Reading pp. '+(n===5?'74–75':'88–89'):'Mega Goal 1 • Unit '+n+' • Grammar / Conversation / FMF'),
        source_original_text:'Original review question (not copied from the textbook).',
        prompt,option_a_id:opt[0],option_a_text:choices[0],option_b_id:opt[1],option_b_text:choices[1],
        option_c_id:opt[2],option_c_text:choices[2],option_d_id:opt[3],option_d_text:choices[3],
        correct_option_id:opt[answer],explanation,hint:num===7?'Find the highlighted clue in the original reading.':explanation,
        next_if_correct:'update_mastery',next_if_wrong:'update_mastery',
        pool_id:'U'+n+'_'+m.id+'_Mastery',mastery_points:1,attempt_limit:2,
        certificate_eligible:true,randomize_options:false,review_status:'معتمد'
      };
      if(excerpt){
        const original=s.reading;
        const at=original.toLowerCase().indexOf(String(needle).toLowerCase());
        if(at<0)throw Error('Vocabulary clue not found in original reading U'+n+' '+needle);
        const st=Math.max(original.lastIndexOf('.',at-1)+1,original.lastIndexOf(String.fromCharCode(10),at-1)+1,at-130);
        const en=original.indexOf('.',at+needle.length);
        const end=en<0?Math.min(original.length,at+160):Math.min(original.length,en+1);
        data.context_excerpt=original.slice(st,end).trim();
        data.context_match=original.slice(at,at+needle.length);
        data.context_paragraph=Math.max(1,original.slice(0,at).split(String.fromCharCode(10,10)).length);
      }
      counts[num]=(counts[num]||0)+1;allNew.push(data);
    });
    if(s.questions.length!==28||[2,4,4,5,4,6,3].some((v,i)=>counts[[1,2,3,4,5,7,6][i]]!==v))throw Error('Bad question counts for U'+n+': '+JSON.stringify(counts));
    results['u'+n]={ready:true,questionCount:s.questions.length,reading:'original 2025 Student Book passage',listening:'CD2 Track '+(n===5?'13':'20'),teacherControlled:true};
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