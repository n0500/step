// StepUp • Unit 3 textbook-aligned content override — 2026-10-01
(() => {
  'use strict';
  const J = window.STEPUP_JOURNEY;
  if (!J?.data) return;

  const u = (J.data.units || []).find(x => x.id === 'u3' || Number(x.number) === 3);
  if (!u) return;

  u.title = 'What Will Be, Will Be';
  u.objective = 'Make predictions, express opinions, and make and respond to suggestions.';
  const missions = u.missions || [];
  const rename = [
    ['m1','Vocabulary & Real Talk','Vocabulary in context • Real Talk'],
    ['m2','Will or Be Going To?','Predictions • plans • decisions'],
    ['m3','Future in Progress','Future progressive • future arrangements'],
    ['m4','Form, Meaning & Function','Suggestions • Wh-questions • tag questions'],
    ['m5','The Tulsa Time Capsule','Reading • evidence from the text'],
    ['m6','Graduation Predictions','Listening • past achievements & future plans'],
    ['m7','Unit 3 Final Challenge','Full Unit 3 review']
  ];
  rename.forEach(([id,title,sub]) => { const m=missions.find(x=>x.id===id); if(m){m.title=title;m.sub=sub;} });

  // Student-book reading (Unit 3, pp. 40–41): same textbook passage, not a parallel text.
  u.reading = `1 A crowd of people gathered outside the courthouse in Tulsa, Oklahoma, in June 1957, to witness the burial of an unusual time capsule: a brand-new gold-and-white Plymouth Belvedere car. The city leaders explained: “In exactly 50 years time, this car will be unearthed to show the world who we were and how we lived in Tulsa in 1957.”

2 The automobile contained a flag, a city phone directory, an unpaid parking ticket, and the contents of a woman’s purse: bobby pins, a ladies’ powder compact, a plastic rain cap, several combs, a tube of lipstick, a pack of gum, a wad of tissues, $2.73 in bills and coins. Five gallons of gas were also included, in case the combustion engine became obsolete by 2007 and no fuel was available.

3 The event attracted all sorts of people to Denver Avenue that day in 1957. Some thought that the idea of burying a new car was dumb; others thought it was brilliant. Raffle tickets (for the car) were sold. The person to guess the approximate population of Tulsa in 2007 would win. “I’ll never be alive,” said Teddy Baxter, aged 6. “Sure you will,” answered his brother Henry, who was 19. “I might not be, but you’ll be around for sure.” Gene McDaniel, who was 20 at the time, thought: “In 2007, I’ll be 70—I’ll never make it.”

4 The Plymouth was wrapped in protective materials and lowered into a concrete vault, which was supposed to withstand even a nuclear attack. It lay there for 50 years. On June 13, 2007, the vault was opened, and the car was raised as thousands of people watched. The organizer of the event said: “Ladies and gentlemen, I present you Miss Belvedere.” Unfortunately the tomb was unable to protect the car from moisture, and the vintage vehicle was covered in rust. The contents of a “typical” woman’s handbag in the glove compartment looked like a lump of rotted leather. The microfilm that recorded the names of the contestants wasn’t found. There was a bit of disappointment that the items were not in better condition. However, some items inside the time capsule were in good shape—they included a U.S. flag and some historical documents, such as aerial maps of the city and postcards.

5 The good news is that when the Belvedere was unearthed, Teddy and Gene were still alive. They never thought they would be here to see it happen. Someone present said, “It’s our King Tut’s tomb. It’s like a fairy tale.”`;

  // Teacher-guide audioscript (Unit 3 Listening): original listening script for in-app TTS.
  u.listening = `Today is a very important day for all of you. It marks the end of your high school days and the beginning of a new life for you. From here, some of you will go off to college and others will be starting jobs. I’ve known you all through high school. And some of you I’ve known since kindergarten, when you were only six years old.

Ibrahim Al-Onazy, no one could run like you in school races. You have become a really good athlete, and I’m sure you’re going to make a fine physical education teacher when you finish college.

Steven Walker, you always had to prove your point, and you could argue your points well and give a lot of good reasons. You have been a great captain of our debate team. I’m certain you’re going to be a successful lawyer, and I wish you the best of luck at college and then at law school.

Saeed Al-Yami, you always had a great scientific mind, and you truly deserve that scholarship to the School of Science and Technology. Our school is going to miss you. We’re going to lose our science researcher temporarily. I say temporarily because in the future we’ll probably be reading about your work in scientific journals and the press. We might even watch you being interviewed on television.

Jim Miller, you were always busy raising money and working for good causes and charities. You’ll be a wonderful social worker after you finish college.

Whatever road you may take, I’m sure you’ll always remember the days you spent at Riverside High. The friends you made and the good times you had are things you will never forget.`;

  const old = (J.data.questions || []).filter(q => q.unit_id !== 'MG1_U3');
  const src = {
    v:'Mega Goal 1 • Unit 3 • Conversation / Real Talk p. 39',
    rv:'Mega Goal 1 • Unit 3 • After Reading vocabulary p. 41',
    g:'Mega Goal 1 • Unit 3 • Grammar pp. 36–37',
    f:'Mega Goal 1 • Unit 3 • Form, Meaning and Function pp. 44–45',
    r:'Mega Goal 1 • Unit 3 • Reading pp. 40–41',
    l:'Mega Goal 1 • Unit 3 • Listening p. 38 / Teacher Guide audioscript',
    revV:'Revision: MG1 Revision 1st term 1447 (3) • Vocabulary',
    revG:'Revision: MG1 Revision 1st term 1447 (3) + MG -1 - General revision (grammar)'
  };
  const mission = id => missions.find(m=>m.id===id)?.source || '';
  function Q(id, missionId, stage, skill, prompt, choices, answer, explanation, hint, source){
    const ids=['opt_a','opt_b','opt_c','opt_d'];
    return {
      question_id:id, unit_id:'MG1_U3', mission:mission(missionId), stage, skill,
      difficulty:'متوسط', question_type:'multiple_choice',
      source_type:String(source||'').startsWith('Revision:') ? 'User-provided curriculum revision' : 'Textbook-aligned review',
      source_ref:source,
      source_original_text:String(source||'').startsWith('Revision:')
        ? 'Question retained from the curriculum revision materials provided by the teacher.'
        : 'مراجعة مبنية على محتوى Unit 3 في كتاب الطالب ودليل المعلم.',
      prompt,
      option_a_id:ids[0], option_a_text:choices[0],
      option_b_id:ids[1], option_b_text:choices[1],
      option_c_id:ids[2], option_c_text:choices[2],
      option_d_id:ids[3], option_d_text:choices[3],
      correct_option_id:ids[answer], explanation, hint,
      next_if_correct:'update_mastery', next_if_wrong:'update_mastery',
      pool_id:'U3_REVIEW', mastery_points:1, attempt_limit:2, certificate_eligible:true,
      randomize_options:false, review_status:'معتمد'
    };
  }

  const q=[];
  // APPROVED Unit 3 review — concise core path.
  // 31 required questions: 5 Vocabulary/Real Talk + 5 Future Forms +
  // 4 Form, Meaning & Function + 7 Reading + 4 Listening + 6 Final Challenge.

  // Vocabulary & Real Talk — revision first, then textbook vocabulary / Real Talk.
  q.push(Q('U3R-V-M1','m1','Mastery','Vocabulary','The phrase (to witness) means:',['engine','to help','to see an event'],2,'To witness means to see an event.','Choose the meaning used in the revision sheet.',src.revV));
  q.push(Q('U3R-V-M2','m1','Mastery','Vocabulary','The phrase (to gather) means:',['to separate',"don\'t join",'to come together'],2,'To gather means to come together.','Choose the meaning used in the revision sheet.',src.revV));
  q.push(Q('U3R-V-M3','m1','Mastery','Vocabulary','The word “obsolete” means:',['complete','outdated','high-tech'],1,'Obsolete means outdated.','This word appears in The Tulsa Time Capsule.',src.rv));
  q.push(Q('U3R-V-M4','m1','Mastery','Real Talk','In the Unit 3 conversation, “Certainly” is closest to ___.',['Yes, of course.','Maybe later.','I disagree.','I have no idea.'],0,'“Certainly” is used to say yes confidently.','It is a positive, confident response.',src.v));
  q.push(Q('U3R-V-M5','m1','Mastery','Real Talk','“No kidding?” is used to express ___.',['pleasant surprise','a warning','disagreement','a future plan'],0,'“No kidding?” expresses surprise in the conversation.','Think about the reporter reacting to the robot.',src.v));

  // Future forms — five focused questions.
  q.push(Q('U3R-A-M1','m2','Mastery','Future with Will','She will ___ her room.',['cleaned','clean','cleaning'],1,'After will, use the base form: clean.','will + base verb',src.revG));
  q.push(Q('U3R-A-M2','m2','Mastery','Will vs Be Going To','What are your vacation plans? I ___ spend a month in Abha.',['am going to','went to','have','was'],0,'Be going to is used for a plan that is already made or decided.','This is a planned future action.',src.g));
  q.push(Q('U3R-B-M1','m3','Mastery','Future Progressive','At this time tomorrow, I ___ in the ocean.',['will be swimming','swam','am swim','have swum'],0,'Future progressive uses will + be + verb-ing for an action in progress at a future time.','At this time tomorrow = action in progress in the future.',src.g));
  q.push(Q('U3R-B-M2','m3','Mastery','Present Progressive for the Future','When ___ they ___ to Dubai? — Tonight.',['are / flying','did / fly','have / flown','do / flew'],0,'The present progressive can describe a scheduled future arrangement.','The answer gives a future schedule: tonight.',src.f));
  q.push(Q('U3R-A-M3','m2','Mastery','Will • decision now','We don’t have any milk. I ___ get some from the store.',['will','got','getting','have'],0,'Will can be used for a decision made at the moment of speaking.','The speaker decides now.',src.g));

  // Form, Meaning & Function — four questions.
  q.push(Q('U3R-C-M1','m4','Mastery','Tag Questions','She is from London, ___?', ["isn\'t she",'is she','do they'],0,'An affirmative sentence with is takes the negative tag isn’t she.','Positive statement → negative tag.',src.revG));
  q.push(Q('U3R-C-M2','m4','Mastery','Tag Questions','Global warming will melt the ice at the poles, ___?',['will it','won’t it','doesn’t it','isn’t it'],1,'An affirmative statement with will takes the negative tag won’t it.','Positive will statement → won’t + pronoun.',src.f));
  q.push(Q('U3R-C-M3','m4','Mastery','Information Questions','___ will you go? — I’ll go to Najran.',['Where','Who','When','How many'],0,'Where asks about a place.','The answer is a place.',src.f));
  q.push(Q('U3R-C-M4','m4','Mastery','Making Suggestions','___ making a time capsule for the school project?',['How about','How many','How long','What time'],0,'How about + verb-ing is used to make a suggestion.','After “How about”, use an -ing form.',src.f));

  // Reading — original textbook passage: four comprehension questions + three STEP strategies.
  q.push(Q('U3R-READ-M1','m5','Mastery','Reading • Detail','Why was the car buried for 50 years?',['To show future people how people lived in 1957.','To sell it later.','To protect it from traffic.','To hide it from the public.'],0,'The city leaders wanted the car to show future people who they were and how they lived in Tulsa in 1957.','Find the reason given by the city leaders in paragraph 1.',src.r));
  q.push(Q('U3R-READ-M2','m5','Mastery','Reading • Detail','Why did the organizers include five gallons of gas?',['In case gasoline was no longer available in 2007.','To clean the car.','To make the car heavier.','To sell the gas.'],0,'Gas was included in case the combustion engine became obsolete and no fuel was available in 2007.','Scan paragraph 2 for “gas”.',src.r));
  q.push(Q('U3R-READ-M3','m5','Mastery','Reading • Detail','Who was going to win the contest?',['The person who guessed Tulsa’s 2007 population most accurately.','The oldest person in Tulsa.','The owner of the car.','The mayor.'],0,'The winner would be the person who guessed the approximate population of Tulsa in 2007.','Look at paragraph 3 and the contest.',src.r));
  q.push(Q('U3R-READ-M4','m5','Mastery','Reading • Detail','What was the bad news when the car was opened in 2007?',['The car had disappeared.','The vault was empty.','Moisture had damaged the car.','The car had been sold.'],2,'The vault did not fully protect the car from moisture, and the vehicle was covered in rust.','Find the contrast after “Unfortunately”.',src.r));
  q.push(Q('U3R-READ-S1','m5','Mastery','Reading Strategy • Main Idea','What is the main idea of “The Tulsa Time Capsule”?',['A car was buried and opened 50 years later to show life in 1957.','Tulsa needed a new car.','People stopped driving cars.','A museum bought an old car.'],0,'The whole passage follows the burial of the Plymouth as a time capsule and what happened when it was opened 50 years later.','Choose the idea that covers the whole passage, not one detail.',src.r));
  q.push(Q('U3R-READ-S2','m5','Mastery','Reading Strategy • Reference','In the sentence “It lay there for 50 years,” what does “It” refer to?',['The concrete vault','The Plymouth car','The courthouse','The flag'],1,'“It” refers to the Plymouth car that had just been lowered into the concrete vault.','Look back for the closest logical noun before “It”.',src.r));
  q.push(Q('U3R-READ-S3','m5','Mastery','Reading Strategy • Inference','What can we infer about the vault after it was opened in 2007?',['It completely protected the car.','It did not fully protect the car from moisture.','Nobody knew where it was.','It had been opened many times.'],1,'The car was rusty and the text says the tomb was unable to protect it from moisture, so the vault was not fully effective.','Combine clues; the answer is supported even if it is not stated in exactly these words.',src.r));

  // Listening — original teacher-guide audioscript.
  q.push(Q('U3R-LIST-M1','m6','Mastery','Listening • Detail','What will Ibrahim become?',['A physical education teacher','A lawyer','A science researcher','A social worker'],0,'The principal predicts Ibrahim will become a physical education teacher.','Listen for Ibrahim and school races.',src.l));
  q.push(Q('U3R-LIST-M2','m6','Mastery','Listening • Detail','What will Steven become?',['A scientist','A lawyer','A teacher','A social worker'],1,'The principal predicts Steven will become a successful lawyer.','Listen for the debate team.',src.l));
  q.push(Q('U3R-LIST-M3','m6','Mastery','Listening • Detail','What will Saeed become?',['A science researcher','A lawyer','A physical education teacher','A social worker'],0,'The principal links Saeed’s scientific mind and scholarship to a future in research.','Listen for science journals and research.',src.l));
  q.push(Q('U3R-LIST-M4','m6','Mastery','Listening • Detail','What will Jim become?',['A social worker','A scientist','A pilot','A lawyer'],0,'The principal predicts Jim will become a social worker.','Listen for good causes and charities.',src.l));

  // Final Challenge — six short mixed checks; no repetition of the 31-item path.
  q.push(Q('U3R-FIN-01','m7','Final Challenge','Final Challenge','People ___ more free time in the future.',['are going to have','had','having','has'],0,'Be going to can be used for a prediction about the future.','Use a future form.',src.g));
  q.push(Q('U3R-FIN-02','m7','Final Challenge','Final Challenge','A week from today, I ___ on the beach.',['will be relaxing','relaxed','am relax','have relaxed'],0,'Future progressive describes an action that will be in progress at a future time.','A week from today.',src.g));
  q.push(Q('U3R-FIN-03','m7','Final Challenge','Final Challenge','People won’t live on other planets in 100 years, ___?',['won’t they','will they','are they','do they'],1,'A negative statement with will takes a positive tag: will they?','Negative statement → positive tag.',src.f));
  q.push(Q('U3R-FIN-04','m7','Final Challenge','Final Challenge','When ___ the new cars coming out?',['are','did','have','were'],0,'The present progressive can describe scheduled future events: When are ... coming out?','Look for the auxiliary used with “coming”.',src.f));
  q.push(Q('U3R-FIN-05','m7','Final Challenge','Final Challenge','“Why don’t we design a robot to help with the cleaning?” — “___”',['Yes, why not! That sounds great!','Last week.','I am a robot.','At the museum yesterday.'],0,'This is an appropriate positive response to a suggestion.','Choose the response that accepts the suggestion.',src.f));
  q.push(Q('U3R-FIN-06','m7','Final Challenge','Final Challenge','Are we going to travel to other planets?',['I think so.','Yesterday.','At school.','Because a car.'],0,'“I think so” is a natural response expressing an opinion about a future prediction.','Choose the response that answers the yes/no future question.',src.g));

  J.data.questions = old.concat(q);
})();
