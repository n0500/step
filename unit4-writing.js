/* STEP UP • Unit 4 Writing Corner — product history, optional practice.
   This writing pad is local to the open page; it does not submit a grade,
   change certificate requirements, or persist student text on a server. */
(function(){
 'use strict';
 var J=window.STEPUP_JOURNEY;
 if(!J||J.__u4writing)return;
 var draft={product:'',timeline:'',paragraph:''};
 var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
 var style=document.createElement('style');
 style.id='stepupU4WritingStyle';
 style.textContent='.u4-writing-entry{margin-top:15px;padding:18px 20px;border:1px solid #c6d9ed;border-radius:15px;background:linear-gradient(130deg,#ecf5ff,#fffaf0);color:#173658}.u4-writing-entry h3{font-size:22px;margin:4px 0 8px}.u4-writing-entry p{font-size:15px;line-height:1.6;margin:0 0 12px}.u4-writing-entry button,.u4-writing-pad button{min-height:43px;border:0;border-radius:10px;background:#1b5e9e;color:white;font-size:16px;font-weight:750;padding:10px 18px;cursor:pointer}.u4-writing-pad{margin:18px auto;max-width:950px;background:#fff;color:#193551;padding:22px;border-radius:18px;border:1px solid #d2e2f1;box-shadow:0 12px 35px #17314b14}.u4-writing-pad h2{font-size:27px;margin:5px 0 10px}.u4-writing-pad p{line-height:1.75}.u4-writing-pad label{display:block;font-size:16px;font-weight:750;margin:18px 0 7px}.u4-writing-pad input,.u4-writing-pad textarea{width:100%;font:inherit;padding:12px;border:2px solid #dae4ed;border-radius:10px;direction:ltr;color:#172f49;background:#fff}.u4-writing-pad textarea{resize:vertical;min-height:115px;line-height:1.7}.u4-writing-pad .u4-tips{background:#eef6fd;border-left:4px solid #3184ba;padding:12px 14px;line-height:1.7;margin-top:12px;border-radius:8px}.u4-writing-pad .u4-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.u4-writing-pad button.secondary{background:#e7edf5;color:#18334f}.u4-writing-pad .u4-feedback{padding:15px;background:#f1f8f2;border-radius:10px;margin-top:15px;line-height:1.7}.u4-writing-pad .u4-note{color:#63768c;font-size:13px;margin:12px 0 0}@media(max-width:600px){.u4-writing-pad{padding:16px}}';
 document.head.appendChild(style);
 function attach(){
   var root=document.querySelector('.student-view');
   if(!root||root.querySelector('.u4-writing-entry'))return;
   var card=document.createElement('section');
   card.className='u4-writing-entry';
   card.innerHTML='<b>✍️ WRITING CORNER · UNIT 4</b><h3>A Product History</h3>'+
    '<p>Plan a timeline and write a short history of an invention, inspired by <em>The Invention of the Cell Phone</em> (pp. 62–63).</p>'+
    '<button onclick="STEPUP_U4_WRITING.open()">Open Writing Practice</button>';
   root.appendChild(card);
 }
 function capture(){
  ['product','timeline','paragraph'].forEach(function(k){
   var el=document.getElementById('u4-writing-'+k);
   if(el)draft[k]=el.value;
  });
 }
 function open(){
  var h=document.querySelector('.student-view');
  if(!h)return;
  h.innerHTML='<div class="u4-writing-pad" dir="ltr">'+
   '<div class="journey-kicker">MEGA GOAL 1 · UNIT 4 · WRITING</div>'+
   '<h2>The History of a Product</h2>'+
   '<p><strong>Task:</strong> Choose a product or invention. Organize its main developments by year. Write a 40–80 word paragraph in chronological order.</p>'+
   '<div class="u4-tips"><strong>Textbook model: Cell Phone</strong><br>'+
   '1843 — Michael Faraday studies electricity in space.<br>'+
   '1865 — Mahlon Loomis sends messages wirelessly.<br>'+
   '1973 — Martin Cooper makes the first portable cellular-phone call.<br>'+
   '1977 — Public trials begin in Chicago.<br>'+
   '1988 — The CTIA establishes industry goals and standards.<br>'+
   'Useful connectors: <strong>First · Later · In 1973 · After that · Finally · Today</strong></div>'+
   '<label for="u4-writing-product">1. Product or invention</label><input id="u4-writing-product" placeholder="e.g. the cell phone" value="'+esc(draft.product)+'">'+
   '<label for="u4-writing-timeline">2. Timeline (one year and event on each line)</label><textarea id="u4-writing-timeline" rows="4" placeholder="1973 — Martin Cooper made a portable call.">'+esc(draft.timeline)+'</textarea>'+
   '<label for="u4-writing-paragraph">3. Your paragraph (40–80 words)</label><textarea id="u4-writing-paragraph" rows="6" placeholder="The history of ... began in ...">'+esc(draft.paragraph)+'</textarea>'+
   '<div class="u4-actions"><button type="button" onclick="STEPUP_U4_WRITING.check()">Check my plan</button>'+
   '<button class="secondary" type="button" onclick="STEPUP_U4_WRITING.back()">Back to Unit 4</button></div>'+
   '<div id="u4-writing-feedback" aria-live="polite"></div>'+
   '<p class="u4-note">Practice only. This is a self-check, not an AI grade. Your draft is not submitted or counted toward a certificate.</p>'+
   '</div>';
 }
 function check(){
   capture();
   var words=draft.paragraph.trim().split(/\s+/).filter(Boolean);
   var dates=(draft.timeline+' '+draft.paragraph).match(/\b(?:18|19|20)\d\d\b/g)||[];
   var n=new Set(dates).size;
   var connectors=/\b(first|later|then|after|finally|today|in \d{4})\b/i.test(draft.paragraph);
   var checklist=[
    [draft.product.trim().length>2,'A product or invention is named.'],
    [n>=2,'At least two dated developments are included.'],
    [words.length>=40,'The paragraph is at least 40 words long.'],
    [connectors,'A chronological linking expression is used.']
   ];
   var feedback=document.getElementById('u4-writing-feedback');
   if(feedback)feedback.innerHTML='<div class="u4-feedback"><strong>Your writing checklist</strong><ul>'+
    checklist.map(function(row){return '<li>'+(row[0]?'✓ ':'○ ')+esc(row[1])+'</li>';}).join('')+
    '</ul><small>'+words.length+' words · '+n+' different years mentioned. Check factual accuracy, sentence structure, and spelling yourself or with your teacher.</small></div>';
 }
 function back(){capture();J.openUnit('u4');}
 var previous=J.openUnit.bind(J);
 J.openUnit=function(id){var out=previous(id);if(id==='u4')attach();return out;};
 J.__u4writing=true;
 window.STEPUP_U4_WRITING={open:open,check:check,back:back};
})();
