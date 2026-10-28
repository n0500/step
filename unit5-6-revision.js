/* StepUp | Teacher revision questions for Mega Goal 1 Units 5 & 6.
 * Sources: MG1 Revision 1st term 1447.pptx and MG -1 - General revision (grammar).pdf.
 * Question and original options preserved when valid; one distractor added to fit 4-option UI.
 * Inserted within the existing 28-question unit mastery banks; no duplicated Final Challenge.
 */
(function(){
  'use strict';
  const j=window.STEPUP_JOURNEY;
  if(!j || !j.data || !Array.isArray(j.data.questions) || !window.STEPUP_U56_CONTENT) return;
  const sourceNames={
    ppt:'MG1 Revision 1st term 1447 .pptx',
    pdf:'MG -1 - General revision ( grammar ).pdf'
  };
  const reviews=[{"u":5,"m":1,"slot":1,"key":"PPT-S2-Q31","source":"ppt","qnum":"slide 2, Q31","original":"The word (stuck in) means [a-unable to move / b-turn / c-see].","prompt":"The phrase “stuck in” means ___.","choices":["unable to move","turn","see","to agree"],"correct":0,"explanation":"Stuck in means caught and unable to get out.","needle":null},{"u":5,"m":2,"slot":0,"key":"PPT-S1-Q03","source":"ppt","qnum":"slide 1, Q3","original":"I burned [a-myself / b-himself / c-herself] when I was making fries.","prompt":"I burned ___ when I was making fries.","choices":["myself","himself","herself","ourselves"],"correct":0,"explanation":"I takes the reflexive pronoun myself.","needle":null},{"u":5,"m":2,"slot":1,"key":"PDF-P1-Q12","source":"pdf","qnum":"page 1, Q12","original":"Sara cut (a-myself / b-herself / c-himself) while she was peeling potatoes.","prompt":"Sara cut ___ while she was peeling potatoes.","choices":["myself","herself","himself","themselves"],"correct":1,"explanation":"Sara takes the reflexive pronoun herself.","needle":null},{"u":5,"m":3,"slot":0,"key":"PPT-S1-Q10","source":"ppt","qnum":"slide 1, Q10","original":"I broke my arm. [a-Neither did I / b-So did I / c-Neither do I].","prompt":"A: I broke my arm. B: ___.","choices":["Neither did I","So did I","Neither do I","So do I"],"correct":1,"explanation":"Positive past agreement uses So did I.","needle":null},{"u":5,"m":3,"slot":1,"key":"PDF-P1-Q15","source":"pdf","qnum":"page 1, Q15","original":"I did not want to wake up late (a-so / b-because / c-no) I used two alarm clocks.","prompt":"I did not want to wake up late, ___ I used two alarm clocks.","choices":["so","because","no","neither"],"correct":0,"explanation":"So shows the result.","needle":null},{"u":5,"m":3,"slot":2,"key":"PDF-P1-Q21","source":"pdf","qnum":"page 1, Q21","original":"I have never fallen down those stairs. (Neither I have / Neither have I / So have I).","prompt":"A: I have never fallen down those stairs. B: ___.","choices":["Neither I have","Neither have I","So have I","So did I"],"correct":1,"explanation":"Use Neither have I for negative present perfect agreement.","needle":null},{"u":5,"m":3,"slot":3,"key":"PDF-P1-Q22","source":"pdf","qnum":"page 1, Q22","original":"The water wasn’t clean (so / because / neither) we didn’t swim.","prompt":"The water wasn’t clean, ___ we didn’t swim.","choices":["so","because","neither","although"],"correct":0,"explanation":"So introduces the consequence.","needle":null},{"u":5,"m":4,"slot":0,"key":"PPT-S1-Q02","source":"ppt","qnum":"slide 1, Q2","original":"The pharmacy is next [a-to / b-on / c-in] the bookstore.","prompt":"The pharmacy is next ___ the bookstore.","choices":["to","on","in","at"],"correct":0,"explanation":"Use next to for location.","needle":null},{"u":5,"m":4,"slot":1,"key":"PDF-P1-Q18","source":"pdf","qnum":"page 1, Q18","original":"You mustn’t (a-speaks / b-speaking / c-speak) on the phone when driving.","prompt":"You mustn’t ___ on the phone when driving.","choices":["speaks","speaking","speak","spoke"],"correct":2,"explanation":"Mustn't + base verb.","needle":null},{"u":5,"m":4,"slot":2,"key":"PDF-P1-Q16","source":"pdf","qnum":"page 1, Q16","original":"They drive (a-danger / b-dangerous / c-dangerously).","prompt":"They drive ___.","choices":["danger","dangerous","dangerously","dangerousness"],"correct":2,"explanation":"An adverb of manner describes how someone drives.","needle":null},{"u":5,"m":4,"slot":3,"key":"PDF-P1-Q24","source":"pdf","qnum":"page 1, Q24","original":"You should (paying / pay / pays) attention to the road.","prompt":"You should ___ attention to the road.","choices":["paying","pay","pays","paid"],"correct":1,"explanation":"Should is followed by the base form.","needle":null},{"u":5,"m":4,"slot":4,"key":"PPT-S1-Q16","source":"ppt","qnum":"slide 1, Q16","original":"Where is the museum? (a-Turn / b-Go / c-Cross) straight ahead on the street.","prompt":"Where is the museum? ___ straight ahead on the street.","choices":["Turn","Go","Cross","Turning"],"correct":1,"explanation":"Go straight ahead gives directions.","needle":null},{"u":5,"m":7,"slot":0,"key":"PPT-S2-Q22","source":"ppt","qnum":"slide 2, Q22","original":"The word (bald) means [a-having no car / b-to move / c-having no hair].","prompt":"The word “bald” means ___.","choices":["having no car","to move","having no hair","not wearing shoes"],"correct":2,"explanation":"Bald means having no hair on the head.","needle":"bald"},{"u":5,"m":7,"slot":4,"key":"PPT-S2-Q29","source":"ppt","qnum":"slide 2, Q29","original":"The phrase (to burst) means [a-to explode / b-to end / c-to drink].","prompt":"The verb “burst” means ___.","choices":["to explode","to end","to drink","to listen"],"correct":0,"explanation":"Burst means to break open suddenly.","needle":"burst"},{"u":5,"m":7,"slot":5,"key":"PPT-S2-Q23","source":"ppt","qnum":"slide 2, Q23","original":"The phrase (to recover) means [a-to end / b-to get worse / c-to get better].","prompt":"To “recover” means ___.","choices":["to end","to get worse","to get better","to lose"],"correct":2,"explanation":"Recover means to get better.","needle":"recovered"},{"u":6,"m":1,"slot":0,"key":"PPT-S2-Q30","source":"ppt","qnum":"slide 2, Q30","original":"The word (feeling down) means [a-feeling depressed / b-happy / c-selfish].","prompt":"The expression “feeling down” means ___.","choices":["feeling depressed","happy","selfish","feeling hungry"],"correct":0,"explanation":"Feeling down means feeling sad or depressed.","needle":null},{"u":6,"m":2,"slot":0,"key":"PDF-P2-Q27","source":"pdf","qnum":"page 2, Q27","original":"You should (eats / eating / eat) healthy food.","prompt":"You should ___ healthy food.","choices":["eats","eating","eat","eaten"],"correct":2,"explanation":"Should + base verb.","needle":null},{"u":6,"m":2,"slot":1,"key":"PDF-P2-Q29","source":"pdf","qnum":"page 2, Q29","original":"They ought to (start / started / starts) saving money for their future.","prompt":"They ought to ___ saving money for their future.","choices":["start","started","starts","starting"],"correct":0,"explanation":"Ought to + base verb.","needle":null},{"u":6,"m":2,"slot":2,"key":"PDF-P1-Q20","source":"pdf","qnum":"page 1, Q20","original":"You had better (goes / go / went) home.","prompt":"You had better ___ home.","choices":["goes","go","went","going"],"correct":1,"explanation":"Had better + base verb.","needle":null},{"u":6,"m":2,"slot":3,"key":"PDF-P2-Q30","source":"pdf","qnum":"page 2, Q30","original":"He (not ought to / ought to not / ought not to) smoke in his office.","prompt":"He ___ smoke in his office.","choices":["not ought to","ought to not","ought not to","ought not"],"correct":2,"explanation":"Use ought not to + base verb.","needle":null},{"u":6,"m":4,"slot":0,"key":"PPT-S1-Q07","source":"ppt","qnum":"slide 1, Q7","original":"How [a-much / b-many / c-few] water do you drink?","prompt":"How ___ water do you drink?","choices":["much","many","few","several"],"correct":0,"explanation":"How much + uncountable noun.","needle":null},{"u":6,"m":4,"slot":1,"key":"PDF-P1-Q14","source":"pdf","qnum":"page 1, Q14","original":"How (a-many / b-much / c-long) cars in the gallery?","prompt":"How ___ cars are in the gallery?","choices":["many","much","long","little"],"correct":0,"explanation":"How many + plural count noun. Added are for grammatical correctness.","needle":null},{"u":6,"m":4,"slot":2,"key":"PDF-P1-Q19","source":"pdf","qnum":"page 1, Q19","original":"He has (a-much / b-a little / c-a lot of) friends.","prompt":"He has ___ friends.","choices":["much","a little","a lot of","little"],"correct":2,"explanation":"A lot of is used with plural count nouns.","needle":null},{"u":6,"m":4,"slot":3,"key":"PDF-P2-Q28","source":"pdf","qnum":"page 2, Q28","original":"They have a (little / many / few) sugar.","prompt":"They have a ___ sugar.","choices":["little","many","few","several"],"correct":0,"explanation":"Sugar is uncountable, so a little sugar.","needle":null},{"u":6,"m":4,"slot":4,"key":"PPT-S1-Q15","source":"ppt","qnum":"slide 1, Q15","original":"What do you do [a-where / b-when / c-how] you have a flue?","prompt":"What do you do ___ you have the flu?","choices":["where","when","how","which"],"correct":1,"explanation":"When introduces the time situation; normalized source typo flue to flu.","needle":null}];
  const list=j.data.questions, staged=new Map(), seen=new Set(), byUnit={u5:0,u6:0};
  const opts=['a','b','c','d'];
  for(const item of reviews){
    const u=j.data.units.find(x=>Number(x.number)===item.u);
    const mission=u&&u.missions.find(x=>x.id==='m'+item.m);
    if(!mission) throw Error('Review mission missing: '+item.key);
    const matches=list.map((q,i)=>(q.unit_id==='MG1_U'+item.u && q.mission===mission.source && q.stage==='Mastery')?i:-1).filter(i=>i>=0);
    const index=matches[item.slot];
    if(index==null || seen.has(index)) throw Error('Review question slot invalid: '+item.key);
    seen.add(index);
    const q=Object.assign({},list[index],{
      question_id:'U'+item.u+'-REV-'+item.key,
      skill:list[index].skill,
      prompt:item.prompt,
      correct_option_id:'opt_'+opts[item.correct],
      explanation:item.explanation,
      hint:item.needle?'Read the highlighted clue in the original textbook passage.':item.explanation,
      source_type:'Teacher-supplied revision question',
      source_ref:sourceNames[item.source]+' • '+item.qnum,
      source_original_text:item.original,
      review_status:'معتمد'
    });
    for(let i=0;i<4;i++) q['option_'+opts[i]+'_text']=item.choices[i];
    if(item.needle){
      const book=String(u.reading||'');
      const at=book.toLowerCase().indexOf(item.needle.toLowerCase());
      if(at<0) throw Error('Missing original reading clue: '+item.key);
      const start=Math.max(book.lastIndexOf('.',at-1)+1,book.lastIndexOf('\n',at-1)+1);
      const stop=book.indexOf('.',at+item.needle.length);
      q.context_excerpt=book.slice(start,stop<0?Math.min(book.length,at+180):stop+1).trim().slice(0,450);
      q.context_match=book.slice(at,at+item.needle.length);
      q.context_paragraph=Math.max(1,book.slice(0,at).split(/\n\s*\n/).length);
      if(!q.context_excerpt.toLowerCase().includes(q.context_match.toLowerCase()))throw Error('Reading clue mismatch '+item.key);
    }else{
      delete q.context_excerpt;
      delete q.context_match;
      delete q.context_paragraph;
    }
    staged.set(index,q);
    byUnit['u'+item.u]++;
  }
  if(staged.size!==25||byUnit.u5!==15||byUnit.u6!==10)throw Error('Revision coverage validation failed');
  const revised=list.map((q,i)=>staged.get(i)||q);
  for(const unit of [5,6]){
    const bank=revised.filter(q=>q.unit_id==='MG1_U'+unit && q.stage==='Mastery');
    if(bank.length!==28||new Set(bank.map(q=>q.question_id)).size!==28)throw Error('Unit '+unit+' question-bank integrity failed');
    const r=bank.filter(q=>q.source_type==='Teacher-supplied revision question');
    if(r.length!==byUnit['u'+unit])throw Error('Unit '+unit+' review count mismatch');
  }
  j.data.questions=revised;
  window.STEPUP_U56_REVISION={ready:true,total:staged.size,byUnit,sourceNames};
})();