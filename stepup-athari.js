/* StepUp × Athari design layer.
   Purely visual: adds illustrations, the hero wave, progress rings and entrance motion
   on top of the screens the app already renders. It never changes data or app logic.
   All markup below is constant, hand-authored SVG (no user input). */
(function(){
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- illustrations (64×64 unless noted) ---------- */
  function leaf(x,y,s,r,o){
    return '<g class="sx-lf"><g transform="translate('+x+' '+y+') rotate('+r+' '+(10*s)+' '+(40*s)+') scale('+s+')" opacity="'+(o==null?1:o)+'">'+
      '<path d="M10 39C2 30 0 16 10 1c10 15 8 29 0 38z" fill="#2f8c5f"/>'+
      '<path d="M10 3c6 11 6 22 0 36" fill="#5bb784" opacity=".6"/>'+
      '<path d="M10 38V5" stroke="#1e6b47" stroke-width=".8" fill="none"/></g></g>';
  }
  var TW = function(x,y,c,cls){return '<path class="sx-tw '+(cls||'')+'" d="M'+x+' '+y+'l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="'+(c||'#f3b53d')+'"/>';};

  var ART = {
    change: '<ellipse cx="32" cy="57" rx="22" ry="4" fill="#cfe0f6"/>'+
      '<path d="M14 30a18 18 0 0 1 30-13" stroke="#2a6ff0" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M41 9l6 9-10 2z" fill="#2a6ff0"/>'+
      '<path d="M50 34a18 18 0 0 1-30 13" stroke="#17a36f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M23 55l-6-9 10-2z" fill="#17a36f"/>'+
      '<circle cx="32" cy="32" r="8" fill="#ffd461"/><path d="M32 27v10M27 32h10" stroke="#e39a19" stroke-width="2.4" stroke-linecap="round"/>',
    briefcase: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#dcd8f6"/><rect x="24" y="12" width="16" height="10" rx="3" fill="none" stroke="#5a4fc4" stroke-width="4"/>'+
      '<rect x="8" y="20" width="48" height="32" rx="6" fill="#8f7ee8"/><rect x="8" y="20" width="48" height="13" rx="6" fill="#7a68df"/>'+
      '<rect x="28" y="29" width="8" height="8" rx="2" fill="#ffd461"/><circle cx="50" cy="46" r="9" fill="#17a36f" stroke="#fff" stroke-width="2.5"/><path d="M46 46l3 3 5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    crystal: '<ellipse cx="32" cy="58" rx="20" ry="3.5" fill="#f3dfb6"/><path d="M18 50h28l4 7H14z" fill="#d47f25"/><rect x="20" y="46" width="24" height="5" rx="2" fill="#f39a3c"/>'+
      '<circle cx="32" cy="28" r="18" fill="#8fb3ef"/><circle cx="32" cy="28" r="18" fill="url(#sxg)" /><path d="M22 20a13 13 0 0 1 9-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>'+
      '<defs><radialGradient id="sxg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e8f2fd"/><stop offset="1" stop-color="#2a6ff0"/></radialGradient></defs>'+
      TW(46,4,'#f3b53d')+'<path d="M36 26l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" fill="#fff"/>',
    megaphone: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#f6d9dd"/><path d="M10 26h10l22-12v36L20 38H10z" fill="#f39a3c"/><rect x="8" y="24" width="12" height="16" rx="3" fill="#ec4d6a"/>'+
      '<path d="M16 38l4 12h7l-3-12z" fill="#d8475c"/><path d="M48 22c4 3 4 17 0 20M53 16c7 6 7 26 0 32" stroke="#2a6ff0" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
    aid: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#cdeadc"/><rect x="24" y="10" width="16" height="10" rx="3" fill="none" stroke="#16906a" stroke-width="4"/>'+
      '<rect x="8" y="18" width="48" height="34" rx="7" fill="#fff" stroke="#bfe3d0" stroke-width="2"/><rect x="8" y="18" width="48" height="8" rx="4" fill="#17a36f"/>'+
      '<path d="M28 30h8v6h6v8h-6v6h-8v-6h-6v-8h6z" fill="#ec4d6a"/>',
    advice: '<ellipse cx="32" cy="58" rx="24" ry="3.5" fill="#cfe0f6"/><path d="M6 12h34a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H20l-9 7v-7H6a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" transform="translate(4 0)" fill="#2a6ff0"/>'+
      '<circle cx="18" cy="25" r="2.6" fill="#fff"/><circle cx="26" cy="25" r="2.6" fill="#fff"/><circle cx="34" cy="25" r="2.6" fill="#fff"/>'+
      '<path d="M34 34h20a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-2v6l-8-6H34a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" fill="#17a36f"/><path d="M38 44l3 3 7-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    map: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#cfe0f6"/><path d="M8 14l14-5 20 6 14-5v38l-14 5-20-6-14 5z" fill="#eaf2ff" stroke="#8fb3ef" stroke-width="1.5"/>'+
      '<path d="M22 9v38M42 15v38" stroke="#c3d6f2" stroke-width="1.5"/><path d="M14 42c6-2 6-10 14-12s8-10 16-12" stroke="#2a6ff0" stroke-width="2.8" fill="none" stroke-dasharray="4 4" stroke-linecap="round"/>'+
      '<circle cx="14" cy="42" r="3.5" fill="#17a36f"/><path d="M44 8v14" stroke="#1b4fb8" stroke-width="2.4" stroke-linecap="round"/><path d="M45 8h10l-3 4 3 4H45z" fill="#f3b53d"/>',
    book: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#cdeadc"/><path d="M32 16c-6-5-16-6-24-4v38c8-2 18-1 24 4z" fill="#17a36f"/><path d="M32 16c6-5 16-6 24-4v38c-8-2-18-1-24 4z" fill="#1fa37a"/>'+
      '<path d="M32 18c-5-4-13-5-20-3v32c7-2 15-1 20 3z" fill="#fff"/><path d="M32 18c5-4 13-5 20-3v32c-7-2-15-1-20 3z" fill="#f4fbf7"/>'+
      '<rect x="16" y="22" width="11" height="2.6" rx="1.3" fill="#9bb8e8"/><rect x="16" y="28" width="12" height="2.6" rx="1.3" fill="#9bb8e8"/><rect x="37" y="22" width="11" height="2.6" rx="1.3" fill="#9bb8e8"/><rect x="37" y="28" width="9" height="2.6" rx="1.3" fill="#9bb8e8"/>'+
      '<text x="37" y="41" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#2a6ff0">Aa</text>',
    spark: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#dcd8f6"/><rect x="8" y="12" width="48" height="34" rx="12" fill="#8f7ee8"/><path d="M18 44l-4 12 12-10z" fill="#8f7ee8"/>'+
      '<path d="M32 17l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/><path d="M46 16l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" fill="#ffd461"/>',
    growth: '<ellipse cx="32" cy="57" rx="26" ry="4" fill="#f3dfb6"/><rect class="sx-bar" x="8" y="38" width="10" height="17" rx="2" fill="#f3b53d"/><rect class="sx-bar" x="21" y="30" width="10" height="25" rx="2" fill="#17a36f"/>'+
      '<rect class="sx-bar" x="34" y="24" width="10" height="31" rx="2" fill="#2f7df2"/><rect class="sx-bar" x="47" y="16" width="10" height="39" rx="2" fill="#8f7ee8"/>'+
      '<path d="M8 32L24 20l10 6 20-18" stroke="#f39a3c" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M47 6h9v9" stroke="#f39a3c" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    student: '<ellipse cx="32" cy="57" rx="22" ry="4" fill="#cfe0f6"/><circle cx="32" cy="22" r="10" fill="#f2a48c"/><path d="M14 56c0-14 8-22 18-22s18 8 18 22z" fill="#2a6ff0"/>'+
      '<path d="M18 16l14-7 14 7-14 7z" fill="#1b4fb8"/><path d="M44 17v8" stroke="#f3b53d" stroke-width="2.4" stroke-linecap="round"/><circle cx="44" cy="26" r="2.2" fill="#f3b53d"/>',
    teacher: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#cdeadc"/><rect x="6" y="8" width="36" height="26" rx="3" fill="#17a36f"/><rect x="9" y="11" width="30" height="20" rx="2" fill="#e9f6ef"/>'+
      '<path d="M13 25l6-6 5 4 8-8" stroke="#17a36f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="46" cy="28" r="8" fill="#f2a48c"/><path d="M32 56c0-12 6-18 14-18s14 6 14 18z" fill="#16906a"/>',
    owner: '<ellipse cx="32" cy="57" rx="24" ry="4" fill="#dcd8f6"/><rect x="8" y="10" width="48" height="38" rx="7" fill="#8f7ee8"/><rect x="12" y="16" width="40" height="28" rx="4" fill="#efeefc"/>'+
      '<rect class="sx-bar" x="17" y="30" width="6" height="10" rx="1.5" fill="#2a6ff0"/><rect class="sx-bar" x="26" y="24" width="6" height="16" rx="1.5" fill="#17a36f"/><rect class="sx-bar" x="35" y="20" width="6" height="20" rx="1.5" fill="#f3b53d"/><rect class="sx-bar" x="44" y="26" width="4" height="14" rx="1.5" fill="#ec4d6a"/>',
    parent: '<ellipse cx="32" cy="56" rx="26" ry="5" fill="#f6d9dd"/><circle cx="20" cy="18" r="7" fill="#2a6ff0"/><path d="M6 50c0-12 6-20 14-20s14 8 14 20z" fill="#1d5fd6"/><circle cx="44" cy="20" r="6.5" fill="#1fa37a"/><path d="M31 50c0-11 6-18 13-18s13 7 13 18z" fill="#16906a"/>'+
      '<path d="M32 54c-8-5-13-9-13-14 0-3 2.5-5.5 5.5-5.5 3 0 5.5 2 7.5 4.5 2-2.5 4.5-4.5 7.5-4.5 3 0 5.5 2.5 5.5 5.5 0 5-5 9-13 14z" fill="#ec4d6a"/>',
    bulb: '<g stroke="#f3b53d" stroke-width="2.5" stroke-linecap="round"><path d="M32 4v5M14 12l3.5 3.5M50 12l-3.5 3.5M8 28h5M51 28h5"/></g><circle cx="32" cy="28" r="14" fill="#ffd461"/><path d="M26 38h12v5H26z" fill="#f3b53d"/><rect x="25" y="43" width="14" height="5" rx="2" fill="#3a6fd8"/><rect x="26.5" y="48" width="11" height="5" rx="2" fill="#2a5fc8"/><path d="M28 30l4 4 4-4" stroke="#e39a19" stroke-width="2" fill="none"/>',
    target: '<rect x="8" y="8" width="32" height="44" rx="5" fill="#eaf2ff" stroke="#8fb3ef" stroke-width="1.5"/><circle cx="15" cy="18" r="3" fill="#17a36f"/><rect x="20" y="16.5" width="15" height="3" rx="1.5" fill="#9bb8e8"/><circle cx="15" cy="28" r="3" fill="#17a36f"/><rect x="20" y="26.5" width="15" height="3" rx="1.5" fill="#9bb8e8"/><circle cx="15" cy="38" r="3" fill="#17a36f"/><rect x="20" y="36.5" width="12" height="3" rx="1.5" fill="#9bb8e8"/><circle cx="44" cy="44" r="14" fill="#f39a3c"/><circle cx="44" cy="44" r="10" fill="#fff"/><circle cx="44" cy="44" r="6" fill="#f39a3c"/><circle cx="44" cy="44" r="2.5" fill="#fff"/><path d="M44 44l12-14" stroke="#1b4fb8" stroke-width="2.5" stroke-linecap="round"/><path d="M53 28l5-1-1 5z" fill="#f3b53d"/>',
    lock: '<ellipse cx="32" cy="57" rx="18" ry="3.5" fill="#e3e8ef"/><path d="M22 28v-6a10 10 0 0 1 20 0v6" fill="none" stroke="#9aa6b8" stroke-width="5" stroke-linecap="round"/><rect x="16" y="26" width="32" height="26" rx="7" fill="#b9c3d2"/><circle cx="32" cy="36" r="3.4" fill="#fff"/><rect x="30.5" y="37" width="3" height="7" rx="1.5" fill="#fff"/>'
  };

  /* Large scenes */
  var STAIRS = /* 160×120 — "StepUp": rising steps to a flag */
    leaf(2,50,1.35,-34)+leaf(128,44,1.25,30)+
    '<ellipse cx="82" cy="112" rx="66" ry="6" fill="rgba(0,0,0,.12)"/>'+
    '<rect class="sx-step s1" x="22" y="84" width="30" height="26" rx="4" fill="#8fb3ef"/>'+
    '<rect class="sx-step s2" x="50" y="66" width="30" height="44" rx="4" fill="#5b93f3"/>'+
    '<rect class="sx-step s3" x="78" y="48" width="30" height="62" rx="4" fill="#2a6ff0"/>'+
    '<rect class="sx-step s4" x="106" y="30" width="30" height="80" rx="4" fill="#1b4fb8"/>'+
    '<rect x="22" y="84" width="30" height="6" rx="3" fill="#fff" opacity=".35"/><rect x="50" y="66" width="30" height="6" rx="3" fill="#fff" opacity=".3"/><rect x="78" y="48" width="30" height="6" rx="3" fill="#fff" opacity=".25"/><rect x="106" y="30" width="30" height="6" rx="3" fill="#fff" opacity=".2"/>'+
    '<g class="sx-flag"><path d="M121 30V6" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M122 6h18l-5 6 5 6h-18z" fill="#f3b53d"/></g>'+
    '<g class="sx-hop"><circle cx="37" cy="70" r="7" fill="#f2a48c"/><path d="M28 84c0-7 4-10 9-10s9 3 9 10z" fill="#17a36f"/></g>'+
    TW(8,10,'#ffd461')+TW(146,58,'#5fe0d0','d2');

  var HELPER = /* 150×120 — assistant bubble */
    leaf(4,54,1.3,-32)+leaf(118,50,1.2,30)+
    '<ellipse cx="76" cy="112" rx="50" ry="5" fill="rgba(0,0,0,.12)"/>'+
    '<g class="sx-bob"><rect x="30" y="14" width="92" height="66" rx="22" fill="#fff"/><path d="M52 76l-8 22 26-20z" fill="#fff"/>'+
    '<path d="M76 26l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="#8f7ee8"/>'+
    '<path d="M104 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f3b53d"/><path d="M50 58l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#5fe0d0"/></g>'+
    TW(136,10,'#ffd461');

  var SCENE_SUCCESS = /* 200×150 */
    '<circle cx="100" cy="75" r="62" fill="#e9f6ef"/>'+leaf(24,72,1.2,-34)+leaf(158,70,1.15,30)+
    '<g class="sx-bits"><circle class="b b1" cx="100" cy="75" r="4" fill="#f3b53d"/><rect class="b b2" x="97" y="72" width="6" height="6" rx="1.5" fill="#2a6ff0"/><circle class="b b3" cx="100" cy="75" r="3.5" fill="#ec4d6a"/><rect class="b b4" x="97" y="72" width="6" height="6" rx="1.5" fill="#17a36f"/><circle class="b b5" cx="100" cy="75" r="3" fill="#8f7ee8"/><rect class="b b6" x="97.5" y="72.5" width="5" height="5" rx="1.5" fill="#f39a3c"/></g>'+
    '<circle cx="100" cy="75" r="36" fill="#fff"/>'+
    '<circle class="sx-sring" cx="100" cy="75" r="36" fill="none" stroke="#17674a" stroke-width="7" stroke-linecap="round" stroke-dasharray="227" transform="rotate(-90 100 75)"/>'+
    '<path class="sx-scheck" d="M84 76l11 11 22-24" fill="none" stroke="#17674a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60"/>';

  var SCENE_REVIEW = /* 200×150 */
    '<circle cx="100" cy="75" r="62" fill="#fdf5e4"/>'+leaf(24,72,1.2,-34)+leaf(158,70,1.15,30)+
    '<g transform="translate(58 26) scale(1.3)">'+ART.bulb+'</g>';

  var UNIT_LOOK = {
    1:{art:'change',tone:'sky'}, 2:{art:'briefcase',tone:'lav'}, 3:{art:'crystal',tone:'cream'},
    4:{art:'megaphone',tone:'pink'}, 5:{art:'aid',tone:'mint'}, 6:{art:'advice',tone:'sky'}
  };

  var GLYPH={
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check:'<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.8-5"/>',
    flag:'<path d="M6 20V4.5"/><path d="M6 5h10l-2 3.5 2 3.5H6"/>',
    layers:'<path d="m12 4 8 4-8 4-8-4z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/>',
    lock:'<rect x="5.5" y="10.5" width="13" height="9" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    spark:'<path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5l-1.8-5.7L4.5 10.9 10.2 9z"/>'
  };
  function glyph(n){ return '<svg class="sx-g" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+GLYPH[n]+'</svg>'; }
  function txt(n){ return ((n&&n.textContent)||'').replace(/\s+/g,' ').trim(); }
  function escHtml(t){ return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function svg(inner, vb, cls){
    return '<svg class="'+(cls||'')+'" viewBox="'+(vb||'0 0 64 64')+'" aria-hidden="true" focusable="false">'+inner+'</svg>';
  }
  function el(tag, cls, html){
    var n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; n.setAttribute('data-sx','1'); return n;
  }
  function wave(){
    return svg('<path d="M0 40c60-25 120 10 200-8s140-20 200 0v28H0z" fill="rgba(255,255,255,.07)"/><path d="M0 50c80-15 150 8 220-6s120-12 180 0v16H0z" fill="rgba(120,220,210,.14)"/>','0 0 400 60','sx-wave').replace('<svg ','<svg preserveAspectRatio="none" ');
  }
  function ring(pct, label){
    var c=2*Math.PI*42, f=Math.max(0,Math.min(100,pct))/100*c;
    return '<div class="sx-ring" data-pct="'+pct+'" role="img" aria-label="'+pct+'% '+label+'">'+
      '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="9"/>'+
      (pct>0?'<circle class="sx-ring-fill" cx="50" cy="50" r="42" fill="none" stroke="#5fe0d0" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+f.toFixed(1)+' '+c.toFixed(1)+'" style="--sx-dash:'+f.toFixed(1)+'"/>':'')+
      '</svg><div class="sx-ring-v"><b><span class="sx-count" data-to="'+pct+'">'+pct+'</span>%</b><span>'+label+'</span></div></div>';
  }
  function pctFrom(text){ var m=String(text||'').match(/(\d+)\s*%/); return m?Number(m[1]):0; }
  function fractionPct(text){ var m=String(text||'').match(/(\d+)\s*\/\s*(\d+)/); return m&&Number(m[2])?Math.round(Number(m[1])/Number(m[2])*100):null; }
  function once(node, key){ if(!node||node.getAttribute('data-sx-'+key)) return false; node.setAttribute('data-sx-'+key,'1'); return true; }

  /* ---------- screens ---------- */
  function decorateHome(view){
    var home=view.querySelector('.student-home-clean'); if(!home) return;
    var hero=home.querySelector('.journey-continue');
    if(hero && once(hero,'hero')){
      var copy=hero.querySelector('.journey-continue-copy');
      var pct=pctFrom(txt(hero.querySelector('small')));
      var h2=txt(hero.querySelector('h2'));
      var m=h2.match(/^Unit\s*(\d+)\s*[•·-]\s*(.+)$/i);
      var unitNo=m?m[1]:'', unitTitle=m?m[2]:h2;
      var stopName=txt(hero.querySelector('p strong'));
      var stopDesc=txt(hero.querySelector('p')).replace(stopName,'').replace(/^\s*[—-]\s*/,'');
      var built=el('div','sx-h');
      if(hero.classList.contains('celebration')){
        built.innerHTML='<span class="sx-h-pill">'+glyph('spark')+'Journey complete</span>'+
          '<div class="sx-hero-top"><div><h2 class="sx-h-title">'+escHtml(h2)+'</h2><p class="sx-h-desc">'+escHtml(txt(hero.querySelector('p')))+'</p></div>'+svg(STAIRS,'0 0 160 120','sx-hero-art')+'</div>';
      }else{
        var stops=Math.round(pct/20);
        built.innerHTML='<span class="sx-h-pill"><i class="sx-dot"></i>'+(unitNo?'Unit '+escHtml(unitNo)+' · ':'')+'Your next step</span>'+
          '<div class="sx-hero-top"><div><h2 class="sx-h-title">'+escHtml(unitTitle)+'</h2>'+
          (stopName?'<p class="sx-h-stop">'+glyph('flag')+'<b>'+escHtml(stopName)+'</b></p>':'')+
          (stopDesc?'<p class="sx-h-desc">'+escHtml(stopDesc)+'</p>':'')+'</div>'+ring(pct,'of unit')+'</div>'+
          '<div class="sx-h-chips"><span class="sx-chip">'+glyph('clock')+'<span><b>2–4 min</b><small>Session</small></span></span>'+
          '<span class="sx-chip">'+glyph('check')+'<span><b>'+stops+' of 5</b><small>Stops done</small></span></span></div>';
      }
      hero.insertBefore(built, hero.firstChild);
      if(copy) copy.classList.add('sx-hidden');
      hero.insertAdjacentHTML('beforeend', wave());
    }
    var welcome=home.querySelector('.student-welcome');
    if(welcome && once(welcome,'art')){
      welcome.appendChild(el('div','sx-welcome-art', svg(STAIRS,'0 0 160 120')));
    }
    if(!home.querySelector('.sx-tiles')){
      var tiles=el('section','sx-tiles-wrap',
        '<div class="sx-sec-head"><h2>Shortcuts</h2></div>'+
        '<div class="sx-tiles">'+
        tile('journey','My Journey','All units, one stop at a time','map','sky')+
        tile('dictionary','Dictionary','Look up and save words','book','mint')+
        tile('assistant','Ask Assistant','Help when you need it','spark','lav')+
        tile('progress','My Progress','Skills and results','growth','cream')+
        '</div>');
      tiles.className='sx-tiles-wrap';
      var anchor=home.querySelector('.journey-continue');
      if(anchor && anchor.parentNode===home) anchor.insertAdjacentElement('afterend', tiles); else home.appendChild(tiles);
      tiles.querySelector('.sx-tiles').addEventListener('click', function(e){
        var b=e.target.closest('[data-go]'); if(!b||!window.PROVE) return;
        var go=b.getAttribute('data-go');
        if(go==='dictionary'||go==='assistant') window.PROVE.openStudentTool && window.PROVE.openStudentTool(go);
        else window.PROVE.setStudentTab && window.PROVE.setStudentTab(go);
      });
    }
  }
  function tile(go,title,sub,art,tone){
    return '<button type="button" class="sx-tile tone-'+tone+'" data-go="'+go+'"><span class="sx-tile-txt"><b>'+title+'</b><small>'+sub+'</small></span>'+svg(ART[art],'0 0 64 64','sx-tile-art')+'</button>';
  }

  function decorateJourney(view){
    var head=view.querySelector('.journey-page-head');
    if(head && once(head,'hero')){
      head.classList.add('sx-banner');
      head.appendChild(el('div','sx-banner-art', svg(ART.map)));
    }
    var grid=view.querySelector('.journey-unit-grid');
    if(grid && once(grid,'head')){
      var all=grid.querySelectorAll('.journey-unit-card').length, open=grid.querySelectorAll('.journey-unit-card:not(.locked)').length;
      grid.insertAdjacentElement('beforebegin', el('div','sx-sec-head','<h2>'+glyph('layers')+'Units</h2><span class="sx-count-chip">'+open+' of '+all+' open</span>'));
    }
    view.querySelectorAll('.journey-unit-card').forEach(function(card){
      if(!once(card,'art')) return;
      if(!card.classList.contains('locked')) card.classList.add('sx-open');
      var n=Number((card.querySelector('.journey-unit-num')||{}).textContent)||0;
      var look=UNIT_LOOK[n]||{art:'book',tone:'sky'};
      var locked=card.classList.contains('locked');
      card.classList.add('tone-'+(locked?'mute':look.tone));
      card.appendChild(el('span','sx-unit-art', svg(ART[look.art])));
      if(locked) card.appendChild(el('span','sx-lock-badge', glyph('lock')));
    });
    var extra=view.querySelector('.journey-extra .journey-link-btn');
    if(extra) extra.classList.add('sx-extra');
  }

  function decorateUnit(view){
    var head=view.querySelector('.journey-focus-head, .journey-unit-hero');
    if(head && once(head,'hero')){
      var row=head.querySelector('.journey-focus-progress-row strong, small');
      var pct=fractionPct(row&&row.textContent);
      if(pct==null){ var bar=head.querySelector('.journey-focus-progress i, .journey-mini-progress i'); pct=bar?parseInt(bar.style.width,10)||0:0; }
      var explicitPct=head.getAttribute('data-ring-pct');
      if(explicitPct!==null && Number.isFinite(Number(explicitPct))) pct=Number(explicitPct);
      var copy=head.querySelector('.journey-focus-head-copy');
      var top=el('div','sx-hero-top');
      top.innerHTML=ring(pct,head.getAttribute('data-ring-label') || 'complete');
      if(copy){ head.insertBefore(top, head.firstChild); top.insertBefore(copy, top.firstChild); }
      else head.insertAdjacentElement('afterbegin', top);
      head.insertAdjacentHTML('beforeend', wave());
    }
    var SHORT={'vocabulary & real talk':'Vocab','vocabulary':'Vocab','form, meaning & function':'Functions','language functions':'Functions',
      'reading':'Read','listening':'Listen','reading • step style':'Read','listening • step style':'Listen','final challenge':'Final','step practice':'STEP'};
    view.querySelectorAll('.journey-focus-stage small').forEach(function(sm){
      var full=txt(sm), key=full.toLowerCase().replace(/\s*•\s*\d+\s*questions?$/,'');
      var short=SHORT[key] || (full.length>9 ? full.split(/[\s,&•]+/)[0] : null);
      if(short && short!==full){ sm.textContent=short; sm.setAttribute('title',full); }
    });
    var task=view.querySelector('.journey-focus-task');
    if(task && once(task,'art')){
      var title=(task.querySelector('h2')||{}).textContent||'';
      var art=task.classList.contains('complete')?'growth':/read/i.test(title)?'book':/listen/i.test(title)?'spark':/step/i.test(title)?'target':/final/i.test(title)?'growth':'bulb';
      if(!ART[art]) art='bulb';
      task.appendChild(el('span','sx-task-art', svg(ART[art])));
    }
  }

  function decorateResult(view){
    var r=view.querySelector('.journey-result');
    if(r && once(r,'art')){
      var good=r.classList.contains('good');
      r.insertAdjacentHTML('afterbegin', svg(good?SCENE_SUCCESS:SCENE_REVIEW,'0 0 200 150','sx-scene '+(good?'sx-scene-good':'sx-scene-review')));
    }
    var f=view.querySelector('.journey-feedback');
    if(f && once(f,'art')){
      var ok=f.classList.contains('good');
      var icon=f.querySelector(':scope > span');
      if(icon) icon.innerHTML=svg(ok?ART.growth:ART.bulb);
    }
  }

  function decorateAssistant(view){
    var card=view.querySelector('.assistant-main-card');
    if(card && once(card,'hero')){
      card.appendChild(el('div','sx-hero-art-wrap', svg(HELPER,'0 0 150 120','sx-hero-art')));
      card.insertAdjacentHTML('beforeend', wave());
    }
    view.querySelectorAll('.assistant-mini-tools > button').forEach(function(b,i){
      if(!once(b,'art')) return;
      b.classList.add(i===0?'tone-mint':'tone-cream');
      var ic=b.querySelector(':scope > span'); if(ic) ic.innerHTML=svg(i===0?ART.book:ART.teacher.replace(/#17a36f/g,'#f39a3c'));
    });
  }

  function decorateProgress(view){
    var pc=view.querySelector('.journey-progress-card');
    var ph=view.querySelector('.student-page-head');
    if(pc && ph && /progress/i.test(txt(ph.querySelector('h1'))) && once(ph,'hero')){
      var vals=[].map.call(pc.querySelectorAll('.journey-progress-units b'),function(b){return pctFrom(b.textContent);});
      var avg=vals.length?Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length):0;
      var done=vals.filter(function(v){return v>=100;}).length;
      var h=el('section','sx-progress-hero',
        '<span class="sx-h-pill">'+glyph('spark')+'My Progress</span>'+
        '<div class="sx-hero-top"><div><h2 class="sx-h-title">Keep climbing</h2><p class="sx-h-desc">See what you have mastered and what deserves one quick review.</p></div>'+ring(avg,'journey')+'</div>'+
        '<div class="sx-h-chips"><span class="sx-chip">'+glyph('layers')+'<span><b>'+vals.length+'</b><small>Units open</small></span></span>'+
        '<span class="sx-chip">'+glyph('check')+'<span><b>'+done+'</b><small>Units complete</small></span></span></div>'+wave());
      ph.insertAdjacentElement('beforebegin', h);
      ph.classList.add('sx-hidden');
      return;
    }
    var head=view.querySelector('.student-page-head:not(.sx-hidden)');
    if(head && once(head,'hero')){
      head.classList.add('sx-banner');
      var t=((head.querySelector('h1')||{}).textContent||'').toLowerCase();
      var art=/profile/.test(t)?'student':/library|practice/.test(t)?'target':/tool/.test(t)?'spark':'growth';
      head.appendChild(el('div','sx-banner-art', svg(ART[art])));
    }
    var mc=view.querySelector('.mini-challenge-card');
    if(mc && once(mc,'hero')) mc.insertAdjacentHTML('beforeend', wave());
  }

  function decorateLanding(root){
    var card=root.querySelector('.auth-shell > .card.hero, .auth-shell > .card.student-entry-card');
    if(!card || !once(card,'landing')) return;
    card.classList.add('sx-auth-card');
    var banner=el('div','sx-auth-banner');
    var bcopy=el('div','sx-auth-banner-copy');
    var head=card.querySelector('.student-entry-head');
    var src=head||card;
    ['.hero-badge','.eyebrow','h1','.hero-subtitle','.class-badge'].forEach(function(s){
      var n=src.querySelector(':scope > '+s); if(n) bcopy.appendChild(n);
    });
    var intro=card.querySelector(':scope > p.muted'); if(intro) bcopy.appendChild(intro);
    if(head){ var sch=head.querySelector(':scope > p.muted'); if(sch) bcopy.appendChild(sch); }
    banner.appendChild(bcopy);
    banner.insertAdjacentHTML('beforeend', svg(STAIRS,'0 0 160 120','sx-hero-art'));
    banner.insertAdjacentHTML('beforeend', wave());
    card.insertBefore(banner, card.firstChild);
    if(head && !head.children.length) head.remove();
    decorateRoles(card);
  }
  function decorateRoles(scope){
    scope.querySelectorAll('.role-card').forEach(function(rc){
      if(!once(rc,'art')) return;
      var role=rc.getAttribute('data-role')||(rc.classList.contains('adv-parent-role')?'parent':'');
      var map={student:['student','sky'],teacher:['teacher','mint'],owner:['owner','lav'],parent:['parent','pink']};
      var look=map[role]||['student','sky'];
      rc.classList.add('tone-'+look[1]);
      rc.insertAdjacentHTML('afterbegin', svg(ART[look[0]],'0 0 64 64','sx-role-art'));
    });
  }

  function decorateTeacher(root){
    var hero=root.querySelector('.teacher-hero');
    if(hero && once(hero,'hero')){
      hero.classList.add('sx-teal');
      hero.insertAdjacentHTML('beforeend', wave());
    }
    root.querySelectorAll('.teacher-metric-card').forEach(function(c,i){
      if(once(c,'tone')) c.classList.add('tone-'+['sky','lav','mint','cream'][i%4]);
    });
  }

  /* ---------- class mode: tap an answer to choose it ---------- */
  var cmPick=null; // {key, index}
  function cmKey(){
    var meta=txt(document.querySelector('.classmode-toolbar > div:first-child'));
    return meta+'|'+txt(document.querySelector('.classmode-stem'));
  }
  function decorateClassMode(root){
    var choices=root.querySelectorAll('.classmode-choice');
    if(!choices.length) return;
    choices.forEach(function(c,i){
      if(!c.hasAttribute('role')){ c.setAttribute('role','button'); c.setAttribute('tabindex','0'); c.setAttribute('data-sx-i', String(i)); }
      var picked=!!(cmPick && cmPick.key===cmKey() && cmPick.index===i);
      if(c.classList.contains('sx-picked')!==picked) c.classList.toggle('sx-picked', picked);
      var wrong=picked && !c.classList.contains('correct');
      if(c.classList.contains('sx-wrong')!==wrong) c.classList.toggle('sx-wrong', wrong);
    });
  }
  function onChoose(e){
    var c=e.target.closest && e.target.closest('.classmode-choice'); if(!c) return;
    if(e.type==='keydown' && e.key!=='Enter' && e.key!==' ') return;
    if(e.type==='keydown') e.preventDefault();
    cmPick={key:cmKey(), index:Number(c.getAttribute('data-sx-i'))||0};
    var revealed=!!document.querySelector('.classmode-choice.correct');
    if(!revealed && window.PROVE && window.PROVE.revealClassAnswer) window.PROVE.revealClassAnswer();
    else decorateClassMode(app);
  }
  document.addEventListener('click', onChoose);
  document.addEventListener('keydown', onChoose);

  /* ---------- credits ---------- */
  var CREDIT='<p class="sx-credit-main">Idea &amp; Design: <b>Ms. Nuha Falah Almutairi</b></p>'+
    '<p class="sx-credit-sub">© '+new Date().getFullYear()+' StepUp · All rights reserved</p>';
  function addCredits(root){
    var host=root.querySelector('.auth-shell') || root.querySelector('.student-view') ||
      root.querySelector('main.container') || root.querySelector('.classmode-content');
    if(!host || host.querySelector(':scope > .sx-credit')) return;
    var f=el('footer','sx-credit', CREDIT);
    f.setAttribute('data-sx-in','1');
    host.appendChild(f);
  }

  /* ---------- motion ---------- */
  function animate(scope){
    if(reduceMotion) return;
    var list=scope.querySelectorAll('.student-view > *, .student-view > * > section, .student-home-clean > *, .journey-unit-card, .sx-tile, .journey-focus-shell > *, .assistant-mini-tools > button, .teacher-home-v2 > *, main.container > .card, .auth-shell > .card');
    var i=0;
    list.forEach(function(n){
      if(n.getAttribute('data-sx-in')) return;
      n.setAttribute('data-sx-in','1');
      n.style.setProperty('--sx-d', Math.min(i*55, 520)+'ms');
      n.classList.add('sx-in');
      i++;
    });
    scope.querySelectorAll('.sx-count').forEach(countUp);
  }
  function countUp(node){
    if(node.getAttribute('data-sx-counted')) return; node.setAttribute('data-sx-counted','1');
    var to=Number(node.getAttribute('data-to'))||0; if(reduceMotion||to<=0) return;
    var start=null, dur=900;
    node.textContent='0';
    function step(t){ if(!start) start=t; var p=Math.min(1,(t-start)/dur); var e=1-Math.pow(1-p,3); node.textContent=String(Math.round(to*e)); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* ---------- driver ---------- */
  var app, busy=false, queued=false;
  function screenName(){
    if(!app) return '';
    if(app.querySelector('.auth-shell')) return 'auth';
    if(app.querySelector('.exam-shell, .exam-top')) return 'exam';
    if(app.querySelector('.classmode-shell')) return 'classmode';
    var view=app.querySelector('.student-view');
    if(view){
      if(view.querySelector('.student-home-clean')) return 'home';
      if(view.querySelector('.journey-unit-grid')) return 'journey';
      if(view.querySelector('.journey-focus-shell, .journey-unit-hero')) return 'unit';
      if(view.querySelector('.journey-question-card')) return 'quiz';
      if(view.querySelector('.journey-result, .journey-feedback')) return 'result';
      if(view.querySelector('.journey-content-card')) return 'content';
      if(view.querySelector('.student-assistant-hub')) return 'assistant';
      if(view.querySelector('.journey-progress-card') || /progress/i.test((view.querySelector('.student-page-head h1')||{}).textContent||'')) return 'progress';
      return 'student';
    }
    if(app.querySelector('[data-role="teacher"]')) return 'teacher';
    return 'other';
  }
  function run(){
    queued=false;
    if(busy) return;
    busy=true;
    try{
      if(!document.documentElement.classList.contains('sx')) document.documentElement.classList.add('sx');
      if(!document.body.classList.contains('sx')) document.body.classList.add('sx');
      var name=screenName();
      if(app.getAttribute('data-sx-screen')!==name) app.setAttribute('data-sx-screen', name);
      if(document.body.getAttribute('data-sx-screen')!==name) document.body.setAttribute('data-sx-screen', name);
      var view=app.querySelector('.student-view');
      if(view){
        decorateHome(view); decorateJourney(view); decorateUnit(view);
        decorateResult(view); decorateAssistant(view); decorateProgress(view);
      }
      decorateLanding(app);
      decorateRoles(app);
      decorateTeacher(app);
      decorateClassMode(app);
      animate(app);
    }catch(e){ console.warn('StepUp design layer:', e); }
    finally{ busy=false; }
  }
  function schedule(){ if(queued) return; queued=true; requestAnimationFrame(function(){ requestAnimationFrame(run); }); }

  function start(){
    app=document.getElementById('app'); if(!app) return;
    document.body.classList.add('sx');
    new MutationObserver(function(list){
      if(busy) return;
      for(var i=0;i<list.length;i++){
        var t=list[i].target;
        if(!(t && t.closest && t.closest('.sx-count, .sx-ring'))){ schedule(); return; }
      }
    }).observe(app,{childList:true,subtree:true});
    schedule();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();

