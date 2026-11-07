// Selected STEP compilation items, adapted with new contexts and checked answers.
// Optional practice only: never part of the textbook mastery bank.
(function(){
 'use strict';
 const sourceUrl='https://masnod.net/wp-content/uploads/2023/12/%D9%86%D9%85%D9%88%D8%B0%D8%AC-%D8%A7%D8%AE%D8%AA%D8%A8%D8%A7%D8%B1-%D8%B3%D8%AA%D9%8A%D8%A8-9-pdf8.pdf';
 const items=[
  ['Passive • Past','These gifts ___ by our visitors yesterday.',['bought','were bought','have bought','buy'],1,'The gifts receive the action. Use were + past participle for a completed past event.','Who receives the action?','p. 20, Q37'],
  ['Passive • Present Perfect','Several new clinics ___ in our town since 2020.',['have built','has been built','have been built','building'],2,'Clinics receive the action and are plural. Since 2020 links the past to now: have been + past participle.','Look for a plural passive form with since.','p. 23, Q19'],
  ['Comparatives','This scooter is ___ than that bicycle.',['fastest','fast','most fast','faster'],3,'A comparison of two things uses the comparative. Fast becomes faster; than introduces the second item.','Compare two things using -er.','p. 23, Q21'],
  ['Superlatives','Of all our bags, this one is ___ largest.',['the','than','more','as'],0,'A superlative identifies one item in a whole group. Use the before largest.','Of all signals a superlative.','p. 20, Q34'],
  ['Possessive Pronouns','Does this tablet belong to you? Yes, it is ___.',['my','mine','me','I'],1,'Mine replaces my tablet and stands alone. My needs a noun after it.','Choose a possessive pronoun that can stand alone.','p. 1, Q4'],
  ['Passive • Materials','Our shopping bag ___ from reused fabric last week.',['made','makes','was made','has make'],2,'The bag receives the action. Last week requires the past: was + made.','A singular object receives an action in the past.','p. 41, Q46']
 ];
 window.STEPUP_U4_STEP_BANK=items.map(function(x,i){return {
  question_id:'U4-STEP-C'+String(i+1).padStart(2,'0'),unit_id:'MG1_U4',
  prompt:x[1],choices:x[2],answer:x[3],skill:x[0],explanation:x[4],hint:x[5],
  source_type:'Adapted STEP compilation question',
  source_ref:'Adapted from @ozayz22 STEP compilation • '+x[6],source_url:sourceUrl,
  stage:'STEP Practice',certificate_eligible:false,mastery_points:0
 };});
})();
