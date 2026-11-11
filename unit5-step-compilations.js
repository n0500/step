/* Optional STEP practice; adapted contexts and distractors, not official exam claims. */
(function(){
 'use strict';
 const url='https://eduschool40.blog/wp-content/uploads/2019/05/%D8%AA%D9%85%D8%A7%D8%B1%D9%8A%D9%86-5-%D8%A8%D8%AF%D9%88%D9%86-%D8%A7%D9%84%D8%AD%D9%84-1.pdf';
 const rows={
 grammar:[
 ['Reflexive Pronouns','I injured ___ during training.',['my','me','myself','mine'],2,'I takes myself when the subject and object are the same person.','Match the pronoun to I.',7],
 ['Reflexive Pronouns','The players introduced ___ to us.',['themselves','their','them','ourselves'],0,'The plural subject refers back to the same people: themselves.','The players are doing the action to themselves.',54],
 ['Because','She stopped reading ___ the story bored her.',['so','because','neither','despite'],1,'Because introduces a reason followed by a complete clause.','The second clause explains why.',77],
 ['So','Our flight was cancelled, ___ we stayed.',['because','neither','during','so'],3,'So introduces the result of the cancellation.','Cause first, result second.',154],
 ['Agreement • So','A: I enjoy hiking. B: ___ do I.',['Neither','Too','So','Either'],2,'Use So + auxiliary + subject to agree with a positive statement. Enjoy is present simple, so use do.','Agree with a positive statement.',127],
 ['Agreement • Neither','A: I do not watch races. B: Neither ___ I.',['do','am','have','did'],0,'Use Neither do I to agree with a negative present-simple statement.','Keep the same auxiliary and tense.',322]
 ],
 fmf:[
 ['Obligation • Must','Safety rules say cyclists ___ wear helmets.',['must not','must','must to','must wearing'],1,'Must + base verb expresses an obligation. Must not expresses prohibition.','The rule requires wearing a helmet.',137],
 ['Advice • Should','For healthier eating, you ___ eat excessive sweets.',['should to','shoulding','should not to','should not'],3,'Should not + base verb gives advice against an action.','A negative recommendation uses should not.',11],
 ['Adverbs • Manner','The puzzle was solved ___.',['easily','easy','easier','an easy'],0,'Easily is an adverb modifying the action solved. Easy is an adjective.','How was it solved?',155],
 ['Adverbs • Hard','The team trained ___ to improve.',['hardly','hardness','hard','harder than'],2,'Hard is also an adverb meaning with effort. Hardly means almost not.','Choose the word meaning with effort.',145],
 ['Prepositions • Place','Our clinic is ___ Palm Street.',['at','on','to','by of'],1,'Use on with a street name when no building number is given.','Think of a location along a street.',37],
 ['Imperatives • Safety','___ touch that damaged cable.',['Not to','Does not','No','Do not'],3,'Do not + base verb makes a negative imperative.','Give a direct safety instruction.',32]
 ]};
 const titles={grammar:'Grammar',fmf:'Form, Meaning & Function'};
 const banks={};Object.keys(rows).forEach(section=>{banks[section]=rows[section].map((x,i)=>({question_id:'U5-STEP-'+section.toUpperCase()+'-'+(i+1),unit_id:'MG1_U5',section,skill:x[0],prompt:x[1],choices:x[2],answer:x[3],explanation:x[4],hint:x[5],source_ref:'Adapted from Free STEP Academy • Series 5 (Abu Shaimaa) • Q'+x[6],source_url:url,source_type:'Adapted STEP compilation question',certificate_eligible:false,mastery_points:0}));});
 function open(){
  const h=document.querySelector('.student-view');if(!h)return;
  h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u5')">Unit 5</button><span>›</span><b>STEP Practice</b></div><section class="journey-content-card"><h2>Choose your STEP practice</h2><p>Two separate sets • 6 questions each • separate results</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px"><section><h3>Grammar</h3><p>Reflexive pronouns • Because / So • So / Neither</p><button class="journey-main-btn" onclick="STEPUP_JOURNEY.startStep('u5','grammar')">Start Grammar</button></section><section><h3>Form, Meaning &amp; Function</h3><p>Must / Should • Adverbs • Prepositions • Imperatives</p><button class="journey-main-btn" onclick="STEPUP_JOURNEY.startStep('u5','fmf')">Start Form, Meaning &amp; Function</button></section></div><p>Adapted from published STEP compilations. Optional practice; it does not affect the unit certificate.</p></section>`;
 }
 window.STEPUP_U5_STEP={banks,titles,open};
})();
