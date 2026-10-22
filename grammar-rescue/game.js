(function(){
"use strict";
/* STEP UP · Grammar Rescue — standalone demonstration.
   No Firebase, student data, mastery records or certificates accessed. */
var missionData=[
{id:"factory",name:"Production Lab",sub:"Passive Voice · 4 Tenses",icon:"🏭",art:"🚘",actor:"🤖",category:"PRODUCTION CONTROL",theme:"factory",blurb:"Repair the labels and restart the production line.",items:[
{id:"f1",type:"arrange",topic:"Present Passive",title:"Start the car factory",tag:"🚘 CAR FACTORY",art:"🚘",prompt:"Our new car needs the correct label.",instruction:"Tap the words in order to complete the sentence.",words:["in Japan.","This car","made","is"],answer:["This car","is","made","in Japan."],hint:"Present passive = am / is / are + past participle.",success:"The car is made in Japan. Production can begin!"},
{id:"f2",type:"arrange",topic:"Past Passive",title:"Open the museum exhibit",tag:"🏎️ INVENTION STATION",art:"🏎️",prompt:"The museum needs a label for an important invention.",instruction:"Arrange the words to describe the past.",words:["in 1886.","invented","The first car","was"],answer:["The first car","was","invented","in 1886."],hint:"Past passive = was / were + past participle.",success:"The first car was invented in 1886. History restored!"},
{id:"f3",type:"arrange",topic:"Present Perfect Passive",title:"Release the shipment",tag:"📦 GLOBAL SHIPPING",art:"📦",prompt:"Travel products are ready for the international market.",instruction:"Complete the shipping report.",words:["worldwide.","have been","Our products","used"],answer:["Our products","have been","used","worldwide."],hint:"Present perfect passive = have / has been + past participle.",success:"Our products have been used worldwide. Shipment cleared!"},
{id:"f4",type:"arrange",topic:"Future Passive",title:"Prepare the new launch",tag:"🚀 FUTURE STATION",art:"🚀",prompt:"The company wants to announce next year's model.",instruction:"Make a correct future passive sentence.",words:["will be","next year.","launched","The new model"],answer:["The new model","will be","launched","next year."],hint:"Future passive = will be + past participle.",success:"The new model will be launched next year. Lab restored!"}
]},
{id:"showroom",name:"Product Showroom",sub:"Comparisons & Sense Verbs",icon:"🏬",art:"📱",actor:"👩🏻‍💼",category:"CUSTOMER ADVICE",theme:"showroom",blurb:"Help shoppers compare products and choose wisely.",items:[
{id:"s1",type:"cards",topic:"Comparative",title:"Find a lighter phone",tag:"📱 TECH SHOWROOM",art:"📱",prompt:"The customer needs a phone that is lighter than Phone A (200 g).",instruction:"Tap the best product for the customer.",cards:[{icon:"📱",title:"Phone A",meta:"200 g · Reference phone"},{icon:"📱",title:"Phone B",meta:"150 g · Lighter"},{icon:"📱",title:"Phone C",meta:"220 g · Heavier"}],answer:1,hint:"Use the comparative: lighter than. Choose a weight below 200 g.",success:"Phone B is lighter than Phone A. The customer is happy!"},
{id:"s2",type:"cards",topic:"Superlative",title:"Find the most expensive",tag:"💻 LAPTOP CORNER",art:"💻",prompt:"Which laptop is the most expensive?",instruction:"Compare the three prices and choose.",cards:[{icon:"💻",title:"Laptop A",meta:"$800"},{icon:"💻",title:"Laptop B",meta:"$1,200"},{icon:"💻",title:"Laptop C",meta:"$950"}],answer:1,hint:"The most expensive = the product with the highest price.",success:"Laptop B is the most expensive of the three."},
{id:"s3",type:"cards",topic:"As … as",title:"Find the equal price",tag:"🧳 TRAVEL COLLECTION",art:"🧳",prompt:"This suitcase costs $300. Choose the bag that is as expensive as the suitcase.",instruction:"Find the product with the same price.",cards:[{icon:"🎒",title:"Bag A",meta:"$240"},{icon:"👜",title:"Bag B",meta:"$300"},{icon:"🧳",title:"Bag C",meta:"$360"}],answer:1,hint:"as + adjective + as expresses equality. Both prices must match.",success:"Bag B is as expensive as the suitcase."},
{id:"s4",type:"text",topic:"Sense Verbs + Like",title:"Repair the perfume ad",tag:"🌸 FRAGRANCE STUDIO",art:"🌷",prompt:"This new perfume ______ roses.",instruction:"Choose the expression that describes the scent.",choices:["looks like","smells like","sounds like","tastes like"],answer:1,hint:"Perfume has a scent. Which sense verb describes smells?",success:"This new perfume smells like roses. The advertisement is approved!"}
]},
{id:"mall",name:"Smart Shopping Mall",sub:"Form, Meaning and Function",icon:"🛍️",art:"🛍️",actor:"👩🏽‍🦱",category:"SHOPPING CHALLENGES",theme:"mall",blurb:"Seven mini-games: point, shop, locate and help customers.",items:[
{id:"m1",type:"text",topic:"Demonstratives",title:"Point to the bags",tag:"👜 ACCESSORIES STORE",art:"👜",prompt:"Two bags are close to you. Complete: “______ are my bags.”",instruction:"Choose the demonstrative for plural objects nearby.",choices:["This","That","These","Those"],answer:2,hint:"Near + plural = these.",success:"These are my bags. You pointed to the right items!"},
{id:"m2",type:"arrange",topic:"Imperatives",title:"Build the new slogan",tag:"📣 ADVERTISEMENT STUDIO",art:"📣",prompt:"Turn the advice into a short command: You should buy this new tablet today.",instruction:"Tap the words to make an advertising imperative.",words:["today!","this","Buy","tablet","new"],answer:["Buy","this","new","tablet","today!"],hint:"An imperative begins with the base form of the verb (Buy).",success:"Buy this new tablet today! The billboard is ready."},
{id:"m3",type:"text",topic:"A / An",title:"Label the umbrella",tag:"☂️ GIFT STORE",art:"☂️",prompt:"Which product label is correct?",instruction:"Choose the correct article and noun.",choices:["a umbrella","an umbrella","an tablet","a apple"],answer:1,hint:"Use an before a vowel sound: /ʌ/ in umbrella.",success:"An umbrella — correct article, label printed!"},
{id:"m4",type:"cards",topic:"Possessive Pronouns",title:"Return the backpack",tag:"🎒 LOST AND FOUND",art:"🎒",prompt:"Maha says, “I lost my backpack.” You found it. What should you tell the staff?",instruction:"Tap the correct message.",cards:[{icon:"🎒",title:"It is her.",meta:"Wrong pronoun"},{icon:"🎒",title:"It is hers.",meta:"Possessive pronoun"},{icon:"🎒",title:"It is she.",meta:"Subject pronoun"}],answer:1,hint:"A possessive pronoun can stand alone. Use hers, not her.",success:"It is hers. Maha gets her backpack back!"},
{id:"m5",type:"text",topic:"Whose",title:"Ask about the boots",tag:"👢 LOST PROPERTY",art:"🥾",prompt:"You need to find the owner of some boots. Which question should you ask?",instruction:"Choose the question about ownership.",choices:["Who boots are these?","Whose boots are these?","Which boots are these?","Whose is boots these?"],answer:1,hint:"Whose + noun asks who owns something.",success:"Whose boots are these? Now you can find the owner."},
{id:"m6",type:"cards",topic:"One / Ones",title:"Find the blue ones",tag:"👟 FOOTWEAR SHOP",art:"👟",prompt:"A customer says, “I don't want the red shoes. I'd like the blue ones.”",instruction:"Choose the pair she wants.",cards:[{icon:"👠",title:"Red shoes",meta:"Red · Pair"},{icon:"👟",title:"Blue shoes",meta:"Blue · Pair"},{icon:"🥾",title:"Black boots",meta:"Black · Pair"}],answer:1,hint:"Ones replaces a plural noun (shoes). Look for the blue pair.",success:"The blue ones! The customer has found her shoes."},
{id:"m7",type:"cards",topic:"Too / Enough",title:"Help the customer",tag:"🧥 FASHION CORNER",art:"🧥",prompt:"A customer needs a medium jacket and can spend up to $200. Which jacket is suitable?",instruction:"Check both the size and the price.",cards:[{icon:"🧥",title:"Jacket A",meta:"Small · $120"},{icon:"🧥",title:"Jacket B",meta:"Medium · $180"},{icon:"🧥",title:"Jacket C",meta:"Medium · $250"}],answer:1,hint:"A is too small. C is too expensive. Which one meets both conditions?",success:"Jacket B is big enough and isn't too expensive. Perfect choice!"}
]},
{id:"final",name:"The Big Launch",sub:"Mixed Grammar Finale",icon:"🚀",art:"🚀",actor:"👩🏻‍💼",category:"FINAL CAMPAIGN REVIEW",theme:"final",blurb:"Repair the final campaign and see it launch.",items:[
{id:"x1",type:"text",topic:"Passive Voice",title:"Fix the car billboard",tag:"📺 BILLBOARD CONTROL",art:"🚘",prompt:"The billboard says: “This car make in Japan.”",instruction:"Tap the corrected advertisement.",choices:["This car is made in Japan.","This car is make in Japan.","This car made in Japan.","This car is making in Japan."],answer:0,hint:"Use present passive: is + past participle.",success:"This car is made in Japan. First billboard repaired!"},
{id:"x2",type:"text",topic:"Comparison",title:"Repair the comparison",tag:"📱 ADVERTISEMENT CONTROL",art:"📱",prompt:"The advertisement says: “This phone is more fast than the old one.”",instruction:"Choose the grammatically correct sentence.",choices:["This phone is most fast than the old one.","This phone is faster than the old one.","This phone is the faster than the old one.","This phone is fast than the old one."],answer:1,hint:"Fast is a short adjective. Use faster than.",success:"This phone is faster than the old one. Comparison repaired!"},
{id:"x3",type:"text",topic:"Demonstratives",title:"Fix the product label",tag:"🛍️ CAMPAIGN CHECK",art:"🛍️",prompt:"Only one tablet is far away. The sign says: “These tablet is amazing.”",instruction:"Choose the correct reference.",choices:["Those tablet is amazing.","This tablet are amazing.","That tablet is amazing.","These tablet are amazing."],answer:2,hint:"For one object far away, use that.",success:"That tablet is amazing. Product label repaired!"},
{id:"x4",type:"text",topic:"Too / Enough",title:"Approve the final slogan",tag:"🚀 READY FOR LAUNCH",art:"🚀",prompt:"The final advertisement says: “It's not big ______ for the whole family.”",instruction:"Choose the correct expression.",choices:["too","enough","as","many"],answer:1,hint:"Enough follows the adjective: big enough.",success:"It's not big enough for the whole family. Campaign ready to launch!"}
]}
];
var allIds=new Set();missionData.forEach(function(m){m.items.forEach(function(q){allIds.add(q.id);});});
var done={};
try{var stored=JSON.parse(localStorage.getItem("stepup-grammar-rescue-standalone-v1")||"{}");if(stored&&typeof stored==="object"){Object.keys(stored).forEach(function(k){if(allIds.has(k)&&stored[k]===true)done[k]=true;});}}catch(e){}
var M=0,Q=0,selected=null,ordered=[],solved=false;
function el(id){return document.getElementById(id);}
function node(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;}
function persist(){try{localStorage.setItem("stepup-grammar-rescue-standalone-v1",JSON.stringify(done));}catch(e){}}
function count(m){return m.items.reduce(function(a,q){return a+(done[q.id]?1:0)},0);}
function countAll(){return Object.keys(done).length;}
function renderMap(){
var total=Array.from(allIds).length,n=countAll();
el("map-count").textContent=n+" / "+total+" challenges";
el("map-pct").textContent=Math.round(n/total*100)+"%";
el("map-bar").style.width=(n/total*100)+"%";
var box=el("mission-cards");box.replaceChildren();
missionData.forEach(function(m,i){
 var c=node("button","mission-card"+(count(m)===m.items.length?" selected":"" ));c.type="button";c.setAttribute("aria-label","Open "+m.name+", "+count(m)+" of "+m.items.length+" done");
 var art=node("div","card-scene");art.append(node("div","card-icon",m.icon),node("span","card-number","MISSION 0"+(i+1)),node("span","card-status",count(m)===m.items.length?"✅ Complete":count(m)? "⭐ In progress":"▶ Play"));
 var info=node("div","card-info");info.append(node("strong","",m.name),node("p","",m.sub));
 var foot=node("div","card-foot");foot.append(node("span","",count(m)+"/"+m.items.length+" challenges"),node("span","","Play →"));info.append(foot);
 c.append(art,info);c.addEventListener("click",function(){openMission(i);});box.append(c);
});
}
function firstUnfinished(){for(var i=0;i<missionData.length;i++){if(count(missionData[i])<missionData[i].items.length)return i;}return 0;}
function openMap(){el("result-overlay").classList.add("hidden");el("game-view").classList.add("hidden");el("map-view").classList.remove("hidden");renderMap();window.scrollTo(0,0);}
function openMission(i){M=i;Q=missionData[i].items.findIndex(function(q){return !done[q.id];});if(Q<0)Q=0;el("map-view").classList.add("hidden");el("game-view").classList.remove("hidden");el("result-overlay").classList.add("hidden");drawQuestion();window.scrollTo(0,0);}
function current(){return missionData[M].items[Q];}
function drawQuestion(){
var m=missionData[M],q=current();selected=null;ordered=[];solved=false;
el("mission-pill").textContent="MISSION 0"+(M+1);el("mission-title").textContent=m.name;el("mission-subtitle").textContent=m.sub;
el("step-caption").textContent="Challenge "+(Q+1)+" / "+m.items.length;
el("step-track").style.width=(Q/m.items.length*100)+"%";
el("stage").className="stage stage-"+m.theme;
el("stage-label").textContent=q.tag;el("stage-status").textContent="● WAITING";el("stage-status").className="stage-status";
el("stage-readout").textContent="🟡 Mission awaiting your answer";el("stage-stars").textContent=(count(m))+" / "+m.items.length+" ✓";
el("art-main").textContent=q.art||m.art;el("stage-actor").textContent=m.actor;
el("actor-talk").textContent=q.title+" — Can you help?";
el("activity-category").textContent=m.category+" · "+q.topic.toUpperCase();
el("activity-number").textContent=String(Q+1).padStart(2,"0")+" / "+String(m.items.length).padStart(2,"0");
el("question-title").textContent=q.title;el("question-subtitle").textContent=q.instruction;
el("prompt-icon").textContent=q.art;el("prompt-label").textContent=q.topic.toUpperCase();el("question-prompt").textContent=q.prompt;
el("hint-box").textContent="💡 "+q.hint;el("hint-box").classList.add("hidden");
el("feedback").className="feedback hidden";el("feedback").textContent="";
el("check-button").textContent="Check Answer →";renderInteraction();
}
function makeButton(label,cls,handler){var b=node("button",cls,label);b.type="button";b.addEventListener("click",handler);return b;}
function renderInteraction(){
var q=current(),root=el("interaction-area");root.replaceChildren();
if(q.type==="arrange"){
 root.append(node("div","section-caption","YOUR SENTENCE"));
 var area=node("div","answer-box");
 if(!ordered.length)area.append(node("span","answer-placeholder","Tap the word cards below in the correct order…"));
 ordered.forEach(function(idx,pos){var bt=makeButton(q.words[idx]+" ×","word chosen",function(){if(solved)return;ordered.splice(pos,1);renderInteraction();});bt.disabled=solved;area.append(bt);});
 root.append(area,node("div","section-caption","AVAILABLE WORD CARDS"));
 var bank=node("div","words");
 q.words.forEach(function(w,i){var bt=makeButton(w,"word",function(){if(solved)return;ordered.push(i);renderInteraction();});bt.disabled=solved||ordered.includes(i);if(bt.disabled)bt.classList.add("used");bank.append(bt);});root.append(bank);
}else if(q.type==="cards"){
 root.append(node("div","section-caption","SELECT THE CORRECT PRODUCT OR MESSAGE"));
 var grid=node("div","select-grid"+(q.cards.length===4?" four":""));
 q.cards.forEach(function(c,i){
 var btn=node("button","option-card"+(i===selected?" chosen":""));btn.type="button";btn.disabled=solved;btn.setAttribute("aria-pressed",i===selected?"true":"false");
 btn.append(node("span","option-icon",c.icon),node("span","option-title",c.title),node("span","option-meta",c.meta));
 btn.addEventListener("click",function(){selected=i;renderInteraction();});grid.append(btn);
 });root.append(grid);
}else{
 root.append(node("div","section-caption","CHOOSE THE CORRECT ANSWER"));
 var grid2=node("div","plain-options");
 q.choices.forEach(function(c,i){var btn=makeButton(c,"text-option"+(i===selected?" chosen":""),function(){selected=i;renderInteraction();});btn.disabled=solved;btn.setAttribute("aria-pressed",i===selected?"true":"false");grid2.append(btn);});root.append(grid2);
}
el("check-button").disabled=!(solved||(q.type==="arrange"?ordered.length===q.words.length:selected!=null));
}
function success(){
var q=current(),m=missionData[M];solved=true;
done[q.id]=true;persist();
el("stage").classList.add("correct");el("stage-status").textContent="✓ APPROVED";el("stage-status").classList.add("good");
el("stage-readout").textContent="🟢 "+(M===0?"Conveyor activated":M===3?"Billboard repaired":"Customer satisfied");
el("actor-talk").textContent="Amazing! "+q.success;el("stage-stars").textContent=count(m)+" / "+m.items.length+" ✓";
el("step-track").style.width=((Q+1)/m.items.length*100)+"%";
el("feedback").className="feedback";el("feedback").textContent="✓ "+q.success;
el("check-button").textContent=Q===m.items.length-1?(M===3?"Launch Campaign! 🚀":"Complete Mission →"):"Next Challenge →";
renderInteraction();
}
function check(){
var q=current();
if(solved){if(Q<missionData[M].items.length-1){Q++;drawQuestion();window.scrollTo(0,0);}else{showResult();}return;}
if(q.type==="arrange"&&ordered.length!==q.words.length)return;
if(q.type!=="arrange"&&selected===null)return;
var correct=q.type==="arrange"?ordered.map(function(i){return q.words[i]}).join(" ")===q.answer.join(" "):selected===q.answer;
if(correct){success();}else{el("feedback").className="feedback bad";el("feedback").textContent="Not yet — take another look at the clue. You can change your answer and retry.";el("actor-talk").textContent="Almost! Look at the clue and try again.";el("stage-status").textContent="⚠ CHECK AGAIN";}
}
function showResult(){
var last=M===missionData.length-1;
el("result-icon").textContent=last?"🎉🚀🏆":missionData[M].icon+" ⭐";
el("result-kicker").textContent=last?"CAMPAIGN LAUNCHED!":"MISSION COMPLETE";
el("result-title").textContent=last?"You saved the Big Launch!":missionData[M].name+" complete!";
el("result-description").textContent=last?"The advertisements are repaired and the city is celebrating. Great grammar work!":"Excellent work! "+count(missionData[M])+" challenges completed in "+missionData[M].name+".";
el("reward-ribbon").textContent=last?"🎆 ⭐ ⭐ ⭐ 🎆":"⭐ ⭐ ⭐";
el("result-next").textContent=last?"Replay Finale ↻":"Next Mission →";
el("result-overlay").classList.remove("hidden");
}
el("quick-start").addEventListener("click",function(){openMission(firstUnfinished());});
el("back-map").addEventListener("click",openMap);
el("hint-button").addEventListener("click",function(){el("hint-box").classList.toggle("hidden");});
el("clear-button").addEventListener("click",function(){if(solved)return;selected=null;ordered=[];el("feedback").className="feedback hidden";el("stage-status").textContent="● WAITING";el("actor-talk").textContent=current().title+" — Can you help?";renderInteraction();});
el("check-button").addEventListener("click",check);
el("result-map").addEventListener("click",openMap);
el("result-next").addEventListener("click",function(){el("result-overlay").classList.add("hidden");if(M<missionData.length-1){openMission(M+1);}else{openMission(M);}});
el("reset-progress").addEventListener("click",function(){if(window.confirm("Restart the standalone Grammar Rescue demo? This will only erase demo progress on this device.")){done={};persist();openMap();}});
el("result-overlay").addEventListener("click",function(evt){if(evt.target===el("result-overlay"))openMap();});
document.addEventListener("keydown",function(evt){if(evt.key==="Escape"&&!el("result-overlay").classList.contains("hidden"))openMap();});
renderMap();
})();