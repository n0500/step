(function(){
  'use strict';
  var THREE_URLS=['https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.min.js','https://unpkg.com/three@0.166.1/build/three.module.min.js'];
  var scenes=[
    {id:'phone',tag:'Decision now',title:'The phone is ringing',context:'You hear the phone ring and decide at this moment to answer it.',correct:'will',sentence:"I'll answer it.",reason:'Use will for a decision made at the moment of speaking.',clue:'The phone starts ringing first. The decision to answer happens NOW.'},
    {id:'travel',tag:'Plan before now',title:'The trip is already planned',context:'Sara bought her ticket yesterday and packed her suitcase.',correct:'going',sentence:'She is going to travel tomorrow.',reason:'Use be going to for a plan decided before now.',clue:'The packed suitcase and boarding pass show a plan that already exists.'},
    {id:'clouds',tag:'Evidence now',title:'Look at the sky',context:'You can see very dark clouds outside the window.',correct:'going',sentence:"It's going to rain.",reason:'Use be going to for a prediction based on present evidence.',clue:'The dark clouds are visible evidence right now.'},
    {id:'opinion',tag:'Prediction / opinion',title:'What do you think?',context:'There is no visible evidence. You are simply giving an opinion about the future.',correct:'will',sentence:'I think our team will win.',reason:'Use will for a prediction or opinion without present evidence.',clue:'There is no clue in the room that proves the result. “I think …” is an opinion.'}
  ];
  var state=null;

  function loadThree(){
    if(window.THREE&&window.THREE.Scene)return Promise.resolve(window.THREE);
    if(window.__stepUp3D)return window.__stepUp3D;
    var urls=(window.STEPUP_THREE_URL?[window.STEPUP_THREE_URL]:[]).concat(THREE_URLS);
    var attempt=function(i){
      if(i>=urls.length)return Promise.reject(new Error('THREE unavailable'));
      return import(urls[i]).then(function(m){if(!m||!m.Scene)throw new Error('bad module');return m;}).catch(function(){return attempt(i+1);});
    };
    window.__stepUp3D=attempt(0).catch(function(e){window.__stepUp3D=null;throw e;});
    return window.__stepUp3D;
  }

  function inject(){
    var root=document.querySelector('.teacher-classmode-v2');
    if(!root||root.querySelector('[data-future3d]'))return;
    /* Keep the prototype teacher-only and tied to Unit 3 when unit text is visible. */
    if(!/Unit\s*3/i.test(root.textContent||''))return;
    var card=document.createElement('div');card.className='card future3d-launch';card.setAttribute('data-future3d','1');
    card.innerHTML='<div class="future3d-launch-copy"><div class="eyebrow">Unit 3 • Visual Lab</div><h2>3D Future Lab</h2><p class="muted">Will vs Be Going To • Explore a realistic scene, find the evidence, then choose the future form.</p><div class="future3d-tags"><span>Interactive 3D</span><span>Form</span><span>Meaning</span><span>Function</span></div></div><button class="btn btn-primary" data-future3d-open>Start 3D Lab</button>';
    var anchor=root.querySelector('.teacher-classmode-controls')||root.querySelector('.teacher-section-head');if(anchor)anchor.insertAdjacentElement('afterend',card);
    card.querySelector('[data-future3d-open]').onclick=open;
  }
  function watch(){inject();new MutationObserver(inject).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});}

  function open(){
    close();document.body.classList.add('future3d-open');
    var o=document.createElement('div');o.id='future3dLab';o.className='future3d-overlay';
    o.innerHTML='<header><div><small>Class Mode • Unit 3</small><strong>3D Future Lab — Will vs Be Going To</strong></div><div class="future3d-header-actions"><span>Teacher-led • no student scores</span><button data-close>Exit Lab</button></div></header><div class="future3d-layout"><aside><div class="future3d-progress" data-progress></div><small data-tag></small><h1 data-title></h1><p data-context></p><div class="future3d-prompt"><span>LOOK → THINK → CHOOSE</span><h3>Which future form fits the meaning?</h3></div><div class="future3d-answers"><button data-a="will">WILL</button><button data-a="going">BE GOING TO</button></div><button class="future3d-clue" data-clue>Reveal the visual clue</button><div data-feedback class="future3d-feedback"></div><div class="future3d-nav"><button data-prev>← Previous</button><button data-next>Next →</button></div></aside><main><div class="future3d-stage"><div data-loading class="future3d-loading"><span></span><b>Building realistic 3D scene…</b></div><div data-canvas class="future3d-canvas"></div><div class="future3d-scene-label"><span data-scene-place>Future Room</span><b data-scene-instruction>Drag gently to look around • click objects to inspect</b></div><div data-tip class="future3d-tip"></div><div class="future3d-controls"><span>↔ Drag to look</span><span>● Click objects</span></div></div><div class="future3d-fmf"><div><span>FORM</span><b data-form>Choose a future form</b></div><div><span>MEANING</span><b data-meaning>Find the clue</b></div><div><span>FUNCTION</span><b data-function>Explain why it fits</b></div></div></main></div>';
    document.body.appendChild(o);document.addEventListener('keydown',onKey);
    state={o:o,i:0,T:null,scene:null,camera:null,renderer:null,world:null,scenario:null,raf:0,resize:null,interactive:[],evidence:[],animations:[],pointer:{down:false,x:0,y:0,yaw:0,pitch:0},cameraGoal:null,cameraTarget:null,room:null,clock:null,raycaster:null,mouse:null,hover:null};
    o.querySelector('[data-close]').onclick=close;o.querySelector('[data-prev]').onclick=function(){go(-1);};o.querySelector('[data-next]').onclick=function(){go(1);};o.querySelector('[data-clue]').onclick=clue;
    Array.prototype.forEach.call(o.querySelectorAll('[data-a]'),function(b){b.onclick=function(){answer(b.getAttribute('data-a'));};});
    renderText();
    loadThree().then(function(T){if(!state)return;init3D(T);buildScenario();var l=o.querySelector('[data-loading]');if(l)l.classList.add('done');setTimeout(function(){if(l&&l.parentNode)l.remove();},400);}).catch(function(){var l=o.querySelector('[data-loading]');if(l){l.innerHTML='<b>3D could not load.</b><small>Check the internet connection and reopen the lab.</small>';}});
  }

  function renderText(){
    var s=scenes[state.i],o=state.o;
    o.querySelector('[data-tag]').textContent='Scene '+(state.i+1)+' of '+scenes.length+' • '+s.tag;
    o.querySelector('[data-title]').textContent=s.title;o.querySelector('[data-context]').textContent=s.context;o.querySelector('[data-tip]').textContent='';o.querySelector('[data-feedback]').innerHTML='';
    o.querySelector('[data-form]').textContent='Choose a future form';o.querySelector('[data-meaning]').textContent='Find the clue';o.querySelector('[data-function]').textContent='Explain why it fits';
    o.querySelector('[data-prev]').disabled=state.i===0;o.querySelector('[data-next]').textContent=state.i===scenes.length-1?'Finish Lab':'Next →';
    o.querySelector('[data-progress]').innerHTML=scenes.map(function(x,i){return '<i class="'+(i===state.i?'active':i<state.i?'done':'')+'"></i>';}).join('');
    Array.prototype.forEach.call(o.querySelectorAll('[data-a]'),function(b){b.className='';});
  }
  function answer(a){
    var s=scenes[state.i],ok=a===s.correct,o=state.o,b=o.querySelector('[data-a="'+a+'"]');
    Array.prototype.forEach.call(o.querySelectorAll('[data-a]'),function(x){x.classList.remove('correct','wrong');});b.classList.add(ok?'correct':'wrong');
    o.querySelector('[data-feedback]').innerHTML=ok?'<b>Correct ✓</b><strong>'+s.sentence+'</strong><p>'+s.reason+'</p>':'<b class="future3d-notquite">Not quite.</b><p>'+s.clue+'</p>';
    if(ok){o.querySelector('[data-form]').textContent=s.correct==='will'?'will + base verb':'am / is / are + going to + base verb';o.querySelector('[data-meaning]').textContent=s.tag;o.querySelector('[data-function]').textContent=s.reason;}
    revealEvidence();
  }
  function clue(){var s=scenes[state.i];state.o.querySelector('[data-tip]').textContent=s.clue;state.o.querySelector('[data-meaning]').textContent=s.tag;revealEvidence();}
  function go(d){if(d>0&&state.i===scenes.length-1){finish();return;}var n=Math.max(0,Math.min(scenes.length-1,state.i+d));if(n===state.i)return;state.i=n;renderText();buildScenario();}

  function finish(){
    var a=state.o.querySelector('aside');
    a.innerHTML='<small>Final comparison</small><h1>Same future. Different reason.</h1><p>Ask the class to identify the meaning first, then choose the form.</p><div class="future3d-compare will"><b>WILL</b><span>decision made now</span><span>prediction / opinion</span></div><div class="future3d-compare going"><b>BE GOING TO</b><span>plan decided before now</span><span>prediction with present evidence</span></div><button class="future3d-clue" data-restart>Restart scenes</button><button class="future3d-exit2" data-exit2>Back to Class Mode</button>';
    a.querySelector('[data-restart]').onclick=function(){close();open();};a.querySelector('[data-exit2]').onclick=close;
    if(state&&state.scenario){clearGroup(state.scenario);state.interactive=[];state.evidence=[];state.animations=[];resetRoom();buildFinalScene();}
  }

  function init3D(T){
    var host=state.o.querySelector('[data-canvas]'),scene=new T.Scene();
    scene.background=new T.Color(0xdfe9f1);scene.fog=new T.Fog(0xdfe9f1,18,38);
    var camera=new T.PerspectiveCamera(43,1,.08,80);camera.position.set(7.4,4.5,10.5);
    var renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;host.appendChild(renderer.domElement);
    var world=new T.Group(),scenario=new T.Group();scene.add(world);world.add(scenario);
    state.T=T;state.scene=scene;state.camera=camera;state.renderer=renderer;state.world=world;state.scenario=scenario;state.clock=new T.Clock();state.raycaster=new T.Raycaster();state.mouse=new T.Vector2();
    buildRoom();
    state.cameraGoal=new T.Vector3(7.4,4.5,10.5);state.cameraTarget=new T.Vector3(0,1.5,-1.4);
    addLights();
    var resize=function(){if(!state)return;var r=host.getBoundingClientRect();renderer.setSize(Math.max(320,r.width),Math.max(320,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();};state.resize=resize;window.addEventListener('resize',resize);resize();
    bindPointer(renderer.domElement);
    (function tick(){if(!state)return;state.raf=requestAnimationFrame(tick);var dt=Math.min(.05,state.clock.getDelta());animate(dt);renderer.render(scene,camera);})();
  }

  function addLights(){
    var T=state.T;
    var hemi=new T.HemisphereLight(0xeaf6ff,0x69594a,1.7);state.scene.add(hemi);
    var sun=new T.DirectionalLight(0xfff2dc,3.2);sun.position.set(4.5,9,5);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;sun.shadow.bias=-.0004;state.scene.add(sun);
    var warm=new T.PointLight(0xffc982,14,8,2);warm.position.set(-3.9,4.2,-.8);state.scene.add(warm);state.room.warmLight=warm;
    var windowLight=new T.SpotLight(0xbcdcff,28,20,.72,.55,1.2);windowLight.position.set(3.2,5,-3.7);windowLight.target.position.set(0,0,2);state.scene.add(windowLight,windowLight.target);state.room.windowLight=windowLight;
  }

  function buildRoom(){
    var T=state.T,w=state.world;state.room={};
    var floorTex=makeWoodTexture();floorTex.wrapS=floorTex.wrapT=T.RepeatWrapping;floorTex.repeat.set(3.2,4.2);floorTex.anisotropy=Math.min(8,state.renderer.capabilities.getMaxAnisotropy());
    var floor=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshStandardMaterial({map:floorTex,color:0xffffff,roughness:.72,metalness:.02}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;w.add(floor);
    var wallMat=new T.MeshStandardMaterial({color:0xf0ede7,roughness:.92});
    var back=new T.Mesh(new T.PlaneGeometry(14,6.5),wallMat);back.position.set(0,3.25,-5);back.receiveShadow=true;w.add(back);
    var left=new T.Mesh(new T.PlaneGeometry(14,6.5),new T.MeshStandardMaterial({color:0xe8e3dc,roughness:.95}));left.rotation.y=Math.PI/2;left.position.set(-7,3.25,2);w.add(left);
    var ceiling=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshStandardMaterial({color:0xf8f7f4,roughness:1}));ceiling.rotation.x=Math.PI/2;ceiling.position.y=6.5;w.add(ceiling);
    /* Rug */
    var rug=new T.Mesh(new T.PlaneGeometry(6.4,4.0),new T.MeshStandardMaterial({color:0xb7b0a4,roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(-.6,.015,.2);rug.receiveShadow=true;w.add(rug);
    /* Window with frame and sky */
    var sky=new T.Mesh(new T.PlaneGeometry(4.9,3.1),new T.MeshBasicMaterial({color:0x91b7d6}));sky.position.set(2.45,3.35,-5.06);w.add(sky);state.room.sky=sky;
    var glass=new T.Mesh(new T.PlaneGeometry(4.65,2.9),new T.MeshPhysicalMaterial({color:0xd8edfa,transparent:true,opacity:.16,roughness:.08,metalness:0,transmission:.12}));glass.position.set(2.45,3.35,-4.93);w.add(glass);
    var frameMat=new T.MeshStandardMaterial({color:0xf6f5f0,roughness:.55});
    [[0,3.35,4.9,.13],[2.45,1.9,.13,3.05],[2.45,4.8,.13,3.05],[4.9,3.35,.13,3.05]].forEach(function(v){var m=new T.Mesh(new T.BoxGeometry(v[2],v[3],.12),frameMat);m.position.set(v[0],v[1],-4.82);w.add(m);});
    var mid=new T.Mesh(new T.BoxGeometry(.11,3.0,.13),frameMat);mid.position.set(2.45,3.35,-4.81);w.add(mid);
    var curtainMat=new T.MeshStandardMaterial({color:0xd6cbbd,roughness:1});
    [-.25,5.15].forEach(function(x){var c=new T.Mesh(new T.BoxGeometry(.72,3.6,.3),curtainMat);c.position.set(x,3.4,-4.62);c.castShadow=true;w.add(c);});
    /* Sofa */
    var sofa=new T.Group();sofa.position.set(-1.45,0,1.05);var fabric=0xb5bec2;
    var base=roundedBox(4.6,.65,1.55,.18,fabric);base.position.y=.55;sofa.add(base);
    var backC=roundedBox(4.7,1.45,.55,.2,0x9fa9ae);backC.position.set(0,1.45,-.52);backC.rotation.x=-.10;sofa.add(backC);
    [-1.55,0,1.55].forEach(function(x){var c=roundedBox(1.42,.35,1.32,.16,0xc7ced1);c.position.set(x,.94,.02);sofa.add(c);});
    [-2.42,2.42].forEach(function(x){var arm=roundedBox(.44,.9,1.5,.16,0xa7b0b5);arm.position.set(x,.92,0);sofa.add(arm);});w.add(sofa);state.room.sofa=sofa;
    /* Side table */
    var table=new T.Group();table.position.set(-4.45,0,.45);var top=new T.Mesh(new T.CylinderGeometry(.76,.76,.13,40),new T.MeshStandardMaterial({color:0x8a5d42,roughness:.5}));top.position.y=1.0;top.castShadow=true;table.add(top);var leg=new T.Mesh(new T.CylinderGeometry(.16,.24,.85,24),new T.MeshStandardMaterial({color:0x3d4143,roughness:.45,metalness:.35}));leg.position.y=.52;leg.castShadow=true;table.add(leg);w.add(table);state.room.sideTable=table;
    /* Floor lamp */
    var lamp=new T.Group();lamp.position.set(-5.35,0,-1.35);var pole=new T.Mesh(new T.CylinderGeometry(.055,.07,3.7,16),new T.MeshStandardMaterial({color:0x2f3437,metalness:.55,roughness:.35}));pole.position.y=1.85;lamp.add(pole);var shade=new T.Mesh(new T.CylinderGeometry(.38,.68,.78,24,1,true),new T.MeshStandardMaterial({color:0xeee1c4,side:T.DoubleSide,roughness:.9}));shade.position.y=3.55;lamp.add(shade);var glow=new T.PointLight(0xffc479,7,5,2);glow.position.y=3.35;lamp.add(glow);w.add(lamp);
    /* Console / entry */
    var consoleTop=roundedBox(2.45,.17,.62,.08,0x7c624f);consoleTop.position.set(4.9,1.18,1.1);w.add(consoleTop);[-1,1].forEach(function(s){var leg=box(.16,1.12,.52,0x54463b);leg.position.set(4.9+s*.91,.56,1.1);w.add(leg);});
    /* Art */
    var art=roundedBox(2.3,1.45,.09,.06,0xd6c9b8);art.position.set(-2.2,3.65,-4.78);w.add(art);var inner=roundedBox(1.95,1.12,.04,.03,0x708d8e);inner.position.set(-2.2,3.65,-4.70);w.add(inner);
    /* TV */
    var tvFrame=roundedBox(3.0,1.75,.15,.09,0x20282d);tvFrame.position.set(-3.9,3.55,-4.73);w.add(tvFrame);var tvScreen=screenPlane(2.76,1.5,makeScreenTexture('MATCH TONIGHT','BLUE  vs  GOLD','0  –  0'));tvScreen.position.set(-3.9,3.55,-4.63);w.add(tvScreen);state.room.tv=tvScreen;
    /* Base plant */
    var pot=new T.Mesh(new T.CylinderGeometry(.42,.32,.62,22),new T.MeshStandardMaterial({color:0xb57f59,roughness:.8}));pot.position.set(5.65,.31,-2.7);w.add(pot);for(var i=0;i<8;i++){var leaf=new T.Mesh(new T.SphereGeometry(.18,12,8),new T.MeshStandardMaterial({color:0x5c8663,roughness:.9}));leaf.scale.set(.65,2.3,.4);leaf.rotation.z=(i-4)*.2;leaf.position.set(5.65+(i-3.5)*.09,.9+Math.abs(i-3.5)*.06,-2.7);w.add(leaf);}
  }

  function makeWoodTexture(){
    var c=document.createElement('canvas');c.width=512;c.height=512;var x=c.getContext('2d');x.fillStyle='#a98466';x.fillRect(0,0,512,512);var h=64;for(var y=0;y<512;y+=h){var offset=(y/h)%2?64:0;for(var i=-1;i<5;i++){var px=i*128+offset;var g=x.createLinearGradient(px,y,px+128,y+h);g.addColorStop(0,'#9a765b');g.addColorStop(.45,'#b08b6d');g.addColorStop(1,'#987158');x.fillStyle=g;x.fillRect(px+1,y+1,126,h-2);x.strokeStyle='rgba(79,54,40,.18)';x.strokeRect(px+1,y+1,126,h-2);for(var k=0;k<4;k++){x.strokeStyle='rgba(255,255,255,.055)';x.beginPath();x.moveTo(px+8,y+12+k*12);x.bezierCurveTo(px+40,y+8+k*11,px+78,y+18+k*10,px+118,y+11+k*12);x.stroke();}}}var t=new state.T.CanvasTexture(c);t.colorSpace=state.T.SRGBColorSpace;return t;
  }
  function makeScreenTexture(top,mid,bottom){var c=document.createElement('canvas');c.width=1024;c.height=560;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,1024,560);g.addColorStop(0,'#0c2844');g.addColorStop(1,'#1d4b6f');x.fillStyle=g;x.fillRect(0,0,1024,560);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(60,65,904,430);x.textAlign='center';x.fillStyle='#b9d8ef';x.font='700 42px Arial';x.fillText(top,512,150);x.fillStyle='#fff';x.font='800 68px Arial';x.fillText(mid,512,275);x.fillStyle='#ffd977';x.font='900 92px Arial';x.fillText(bottom,512,410);var t=new state.T.CanvasTexture(c);t.colorSpace=state.T.SRGBColorSpace;t.minFilter=state.T.LinearFilter;return t;}
  function makePhoneTexture(){var c=document.createElement('canvas');c.width=360;c.height=720;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,0,720);g.addColorStop(0,'#0c2e4e');g.addColorStop(1,'#071520');x.fillStyle=g;x.fillRect(0,0,360,720);x.fillStyle='#d9f2ff';x.font='700 22px Arial';x.textAlign='center';x.fillText('INCOMING CALL',180,115);x.fillStyle='#fff';x.font='800 30px Arial';x.fillText('Home',180,160);x.strokeStyle='#6de09b';x.lineWidth=12;x.beginPath();x.arc(180,450,54,0,Math.PI*2);x.stroke();x.fillStyle='#6de09b';x.font='700 22px Arial';x.fillText('ANSWER',180,555);var t=new state.T.CanvasTexture(c);t.colorSpace=state.T.SRGBColorSpace;return t;}
  function makeTicketTexture(){var c=document.createElement('canvas');c.width=700;c.height=300;var x=c.getContext('2d');x.fillStyle='#f7f0df';x.fillRect(0,0,700,300);x.fillStyle='#163958';x.font='800 38px Arial';x.fillText('BOARDING PASS',45,70);x.font='700 28px Arial';x.fillText('RIYADH  →  DUBAI',45,135);x.fillStyle='#6a7a86';x.font='600 21px Arial';x.fillText('TOMORROW • 08:30',45,185);x.fillStyle='#d1aa52';x.fillRect(530,0,170,300);x.fillStyle='#fff';x.font='900 44px Arial';x.fillText('A12',575,155);for(var i=0;i<20;i++){x.fillStyle=i%2?'#fff':'#17324d';x.fillRect(52+i*10,225,6,42);}var t=new state.T.CanvasTexture(c);t.colorSpace=state.T.SRGBColorSpace;return t;}
  function makeLabel(text,bg){var c=document.createElement('canvas');c.width=512;c.height=160;var x=c.getContext('2d');x.fillStyle=bg||'rgba(18,48,72,.92)';roundRect2D(x,8,8,496,144,30);x.fill();x.fillStyle='#fff';x.font='800 44px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,82);var t=new state.T.CanvasTexture(c);t.colorSpace=state.T.SRGBColorSpace;var m=new state.T.SpriteMaterial({map:t,transparent:true,depthTest:false});var s=new state.T.Sprite(m);s.scale.set(2.55,.8,1);return s;}
  function roundRect2D(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  function roundedShape(w,h,r){var s=new state.T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function roundedBox(w,h,d,r,c,opts){var T=state.T,g=new T.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(r*.28,.07),bevelThickness:Math.min(d*.09,.05),curveSegments:6});g.center();var mat=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.58,metalness:.03},opts||{}));var m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m;}
  function box(w,h,d,c,opts){var m=new state.T.Mesh(new state.T.BoxGeometry(w,h,d),new state.T.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.03},opts||{})));m.castShadow=true;m.receiveShadow=true;return m;}
  function screenPlane(w,h,tex){var m=new state.T.Mesh(new state.T.PlaneGeometry(w,h),new state.T.MeshBasicMaterial({map:tex,toneMapped:false}));return m;}
  function addInteractive(obj,type){obj.userData.inspect=type;state.interactive.push(obj);return obj;}
  function setEvidence(list){state.evidence=list.filter(Boolean);state.evidence.forEach(function(o){o.userData.baseScale=o.scale.clone();});}
  function clearGroup(g){if(!g)return;while(g.children.length){var c=g.children.pop();c.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(function(m){if(m.map)m.map.dispose();m.dispose();});else{if(o.material.map)o.material.map.dispose();o.material.dispose();}}});}}

  function buildScenario(){
    if(!state||!state.scenario)return;clearGroup(state.scenario);state.interactive=[];state.evidence=[];state.animations=[];state.pointer.yaw=0;state.pointer.pitch=0;resetRoom();
    var id=scenes[state.i].id;if(id==='phone')buildPhone();if(id==='travel')buildTravel();if(id==='clouds')buildClouds();if(id==='opinion')buildOpinion();
  }
  function resetRoom(){var r=state.room;if(!r)return;r.sky.material.color.set(0x91b7d6);r.windowLight.color.set(0xbcdcff);r.windowLight.intensity=28;r.warmLight.intensity=14;}
  function buildPhone(){
    var T=state.T,g=state.scenario;
    var phone=new T.Group();var shell=roundedBox(1.05,1.92,.13,.14,0x161d22,{roughness:.3,metalness:.3});shell.rotation.x=-Math.PI/2;phone.add(shell);
    var scr=screenPlane(.88,1.66,makePhoneTexture());scr.rotation.x=-Math.PI/2;scr.rotation.z=Math.PI;scr.position.y=.085;phone.add(scr);phone.position.set(-4.42,1.18,.42);phone.rotation.z=-.16;g.add(phone);addInteractive(phone,'phone');
    var ring=new T.Group();for(var i=0;i<3;i++){var tor=new T.Mesh(new T.TorusGeometry(.72+i*.18,.018,8,48),new T.MeshBasicMaterial({color:0x64c8ff,transparent:true,opacity:.42-i*.09,depthWrite:false}));tor.rotation.x=-Math.PI/2;tor.position.set(-4.42,1.36,.42);ring.add(tor);}g.add(ring);state.animations.push({type:'ring',obj:ring,t:0});setEvidence([phone]);
    var label=makeLabel('RINGING NOW', 'rgba(12,69,105,.93)');label.position.set(-3.75,2.38,.4);g.add(label);
    setCamera([-6.2,3.55,5.7],[-4.1,1.25,.3]);state.o.querySelector('[data-scene-place]').textContent='Living room • phone call';state.o.querySelector('[data-scene-instruction]').textContent='Look at what happens first: the phone rings, then the decision is made.';
  }
  function buildTravel(){
    var T=state.T,g=state.scenario;
    var bag=new T.Group(),caseM=roundedBox(1.65,2.25,.68,.18,0x4d6682,{roughness:.42});bag.add(caseM);var trimMat=new T.MeshStandardMaterial({color:0x273746,roughness:.38,metalness:.3});[-.58,.58].forEach(function(x){var strip=new T.Mesh(new T.BoxGeometry(.055,1.9,.73),trimMat);strip.position.x=x;bag.add(strip);});var handle=new T.Mesh(new T.TorusGeometry(.35,.055,10,24,Math.PI),trimMat);handle.rotation.z=Math.PI;handle.position.y=1.35;bag.add(handle);[-.55,.55].forEach(function(x){var wheel=new T.Mesh(new T.CylinderGeometry(.11,.11,.12,16),trimMat);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-1.2,.25);bag.add(wheel);});bag.position.set(4.9,1.25,.45);g.add(bag);addInteractive(bag,'suitcase');
    var ticket=roundedBox(1.6,.68,.035,.06,0xf5ead4,{roughness:.65});ticket.rotation.x=-Math.PI/2;ticket.rotation.z=-.14;ticket.position.set(4.75,1.34,1.08);var ticketFace=screenPlane(1.5,.58,makeTicketTexture());ticketFace.rotation.x=-Math.PI/2;ticketFace.rotation.z=Math.PI-.14;ticketFace.position.set(4.75,1.37,1.08);g.add(ticket,ticketFace);addInteractive(ticketFace,'ticket');
    var passport=roundedBox(.78,1.0,.05,.06,0x355c61,{roughness:.55});passport.rotation.x=-Math.PI/2;passport.rotation.z=.28;passport.position.set(5.55,1.33,1.08);g.add(passport);setEvidence([bag,ticketFace]);
    var label=makeLabel('ALREADY PACKED', 'rgba(62,83,109,.94)');label.position.set(4.5,3.15,.35);g.add(label);
    setCamera([7.1,3.9,6.1],[4.75,1.4,.55]);state.o.querySelector('[data-scene-place]').textContent='Entry area • tomorrow’s trip';state.o.querySelector('[data-scene-instruction]').textContent='Inspect the suitcase and boarding pass. Are they evidence of a previous plan?';
  }
  function buildClouds(){
    var T=state.T,g=state.scenario;
    state.room.sky.material.color.set(0x536575);
    state.room.windowLight.color.set(0x91a8ba);
    state.room.windowLight.intensity=11;
    state.room.warmLight.intensity=7;

    /* Storm clouds stay OUTSIDE the room: between the sky plane and the glass. */
    var texCanvas=document.createElement('canvas');
    texCanvas.width=256;texCanvas.height=256;
    var cx=texCanvas.getContext('2d');
    var grad=cx.createRadialGradient(128,122,12,128,128,122);
    grad.addColorStop(0,'rgba(255,255,255,.98)');
    grad.addColorStop(.38,'rgba(245,248,250,.95)');
    grad.addColorStop(.68,'rgba(210,219,226,.72)');
    grad.addColorStop(.9,'rgba(160,173,184,.28)');
    grad.addColorStop(1,'rgba(130,145,158,0)');
    cx.fillStyle=grad;cx.fillRect(0,0,256,256);
    var cloudTex=new T.CanvasTexture(texCanvas);
    cloudTex.colorSpace=T.SRGBColorSpace;
    cloudTex.minFilter=T.LinearFilter;
    cloudTex.magFilter=T.LinearFilter;

    var clouds=new T.Group();
    var puffData=[
      [0.65,4.02,1.10,.62,0x70808c,.84],
      [1.20,4.24,1.25,.72,0x788996,.90],
      [1.80,4.08,1.42,.78,0x657581,.94],
      [2.45,4.30,1.58,.90,0x748490,.94],
      [3.10,4.12,1.48,.80,0x606f7a,.94],
      [3.72,4.26,1.22,.68,0x778792,.88],
      [4.18,3.98,1.04,.60,0x64737e,.86],
      [1.00,3.62,1.28,.66,0x56646f,.92],
      [1.72,3.55,1.50,.72,0x4b5964,.94],
      [2.45,3.62,1.72,.80,0x46535e,.96],
      [3.18,3.53,1.55,.72,0x4c5964,.95],
      [3.88,3.62,1.28,.64,0x56646f,.92],
      [1.45,3.28,1.20,.52,0x3f4b55,.82],
      [2.18,3.25,1.45,.56,0x39454f,.88],
      [2.92,3.23,1.48,.56,0x39454f,.88],
      [3.58,3.30,1.16,.50,0x414e58,.82]
    ];
    puffData.forEach(function(v,i){
      var mat=new T.SpriteMaterial({
        map:cloudTex,
        color:v[4],
        transparent:true,
        opacity:v[5],
        depthWrite:false,
        depthTest:true,
        fog:false
      });
      var p=new T.Sprite(mat);
      p.position.set(v[0],v[1],-4.985-(i%3)*.002);
      p.scale.set(v[2]*1.55,v[2]*v[3],1);
      clouds.add(p);
    });
    clouds.renderOrder=1;
    g.add(clouds);
    addInteractive(clouds,'clouds');

    /* Soft rain also remains outside, just behind the window glass. */
    var rain=new T.Group();
    for(var i=0;i<38;i++){
      var line=new T.Mesh(
        new T.BoxGeometry(.012,.34,.008),
        new T.MeshBasicMaterial({color:0xa9cde2,transparent:true,opacity:.34,depthWrite:false})
      );
      line.position.set(.28+(i%10)*.45,2.0+((i*43)%245)/100,-4.972-(i%4)*.001);
      line.rotation.z=-.08;
      rain.add(line);
    }
    g.add(rain);
    state.animations.push({type:'rain',obj:rain});
    setEvidence([clouds]);

    var label=makeLabel('VISIBLE EVIDENCE', 'rgba(37,54,68,.92)');
    label.position.set(2.45,5.16,-4.70);
    label.scale.set(2.15,.66,1);
    g.add(label);

    setCamera([5.85,3.72,5.45],[2.45,3.62,-4.95]);
    state.o.querySelector('[data-scene-place]').textContent='Window • storm approaching';
    state.o.querySelector('[data-scene-instruction]').textContent='Look through the window: dark storm clouds are visible evidence for the prediction.';
  }
  function buildOpinion(){
    var T=state.T,g=state.scenario;state.room.sky.material.color.set(0x91b7d6);state.room.windowLight.color.set(0xbcdcff);state.room.windowLight.intensity=28;state.room.warmLight.intensity=14;
    var person=new T.Group();var torso=roundedBox(.9,1.28,.5,.18,0x334f78);torso.position.y=1.15;person.add(torso);var head=new T.Mesh(new T.SphereGeometry(.36,20,14),new T.MeshStandardMaterial({color:0xd7a57e,roughness:.85}));head.position.y=2.08;head.castShadow=true;person.add(head);var hair=new T.Mesh(new T.SphereGeometry(.37,20,10,0,Math.PI*2,0,Math.PI*.58),new T.MeshStandardMaterial({color:0x30251f,roughness:.9}));hair.position.set(0,2.18,-.02);person.add(hair);person.position.set(-1.05,.82,.6);person.rotation.y=-.35;g.add(person);addInteractive(person,'person');
    var thought=makeLabel('I think…', 'rgba(50,76,108,.94)');thought.position.set(.3,3.35,.2);thought.scale.set(1.9,.62,1);g.add(thought);setEvidence([person]);
    setCamera([3.8,3.5,7.8],[-1.4,2.0,-2.0]);state.o.querySelector('[data-scene-place]').textContent='Living room • match prediction';state.o.querySelector('[data-scene-instruction]').textContent='No result is visible yet. This is simply a personal prediction.';
  }
  function buildFinalScene(){
    var g=state.scenario;var left=roundedBox(2.6,2.15,.3,.16,0x315f96,{roughness:.42});left.position.set(-1.7,3.05,-1.6);g.add(left);var right=roundedBox(2.6,2.15,.3,.16,0x548769,{roughness:.42});right.position.set(1.7,3.05,-1.6);g.add(right);var l=makeLabel('WILL', 'rgba(34,78,125,.96)');l.position.set(-1.7,3.05,-1.32);g.add(l);var r=makeLabel('BE GOING TO', 'rgba(61,113,82,.96)');r.position.set(1.7,3.05,-1.32);r.scale.set(2.25,.72,1);g.add(r);setCamera([0,4.3,8.4],[0,2.6,-1.6]);state.o.querySelector('[data-scene-place]').textContent='Final comparison';state.o.querySelector('[data-scene-instruction]').textContent='Meaning first → then choose the form.';
  }

  function setCamera(pos,target){if(!state||!state.T)return;state.cameraGoal=new state.T.Vector3(pos[0],pos[1],pos[2]);state.cameraTarget=new state.T.Vector3(target[0],target[1],target[2]);}
  function animate(dt){
    if(!state)return;var T=state.T,t=performance.now()/1000;
    state.animations.forEach(function(a){if(a.type==='ring'){a.obj.children.forEach(function(x,i){var k=1+((t*.65+i*.24)%1)*.23;x.scale.setScalar(k);x.material.opacity=.5-((t*.65+i*.24)%1)*.34;});}if(a.type==='rain'){a.obj.children.forEach(function(x,i){x.position.y-=dt*(1.4+(i%5)*.16);if(x.position.y<1.45)x.position.y=4.8;});}});
    if(state.cameraGoal&&state.cameraTarget){var yaw=state.pointer.yaw,pitch=state.pointer.pitch;var base=state.cameraGoal.clone();var offset=base.clone().sub(state.cameraTarget);var sph=new T.Spherical().setFromVector3(offset);sph.theta+=yaw;sph.phi=Math.max(.55,Math.min(1.35,sph.phi+pitch));var desired=new T.Vector3().setFromSpherical(sph).add(state.cameraTarget);state.camera.position.lerp(desired,1-Math.pow(.001,dt));var look=state.cameraTarget.clone();state.camera.lookAt(look);}
  }

  function bindPointer(canvas){
    canvas.addEventListener('pointerdown',function(e){if(!state)return;state.pointer.down=true;state.pointer.x=e.clientX;state.pointer.y=e.clientY;canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointerup',function(e){if(!state)return;var dx=Math.abs(e.clientX-state.pointer.x),dy=Math.abs(e.clientY-state.pointer.y);state.pointer.down=false;if(dx<7&&dy<7)inspectAt(e,canvas);});
    canvas.addEventListener('pointercancel',function(){if(state)state.pointer.down=false;});
    canvas.addEventListener('pointermove',function(e){if(!state)return;if(state.pointer.down){var dx=e.clientX-state.pointer.x,dy=e.clientY-state.pointer.y;state.pointer.yaw=Math.max(-.32,Math.min(.32,state.pointer.yaw-dx*.0035));state.pointer.pitch=Math.max(-.12,Math.min(.12,state.pointer.pitch+dy*.0025));state.pointer.x=e.clientX;state.pointer.y=e.clientY;}else hoverAt(e,canvas);});
  }
  function raycastAt(e,canvas){var r=canvas.getBoundingClientRect();state.mouse.x=((e.clientX-r.left)/r.width)*2-1;state.mouse.y=-((e.clientY-r.top)/r.height)*2+1;state.raycaster.setFromCamera(state.mouse,state.camera);return state.raycaster.intersectObjects(state.interactive,true);}
  function rootInspect(o){while(o&&o.parent){if(o.userData&&o.userData.inspect)return o;o=o.parent;}return null;}
  function inspectAt(e,canvas){var hits=raycastAt(e,canvas);if(!hits.length)return;var o=rootInspect(hits[0].object);if(o){clue();revealEvidence();}}
  function hoverAt(e,canvas){var hits=raycastAt(e,canvas),hit=hits.length&&rootInspect(hits[0].object);canvas.style.cursor=hit?'pointer':'grab';state.hover=hit||null;}
  function revealEvidence(){
    if(!state||!state.evidence.length)return;state.evidence.forEach(function(o,idx){var b=o.userData.baseScale||o.scale.clone();o.scale.copy(b).multiplyScalar(1.065);setTimeout(function(){if(o&&o.parent)o.scale.copy(b);},650+idx*80);});
    var s=scenes[state.i];if(state.o){state.o.querySelector('[data-tip]').textContent=s.clue;}
  }

  function onKey(e){if(e.key==='Escape'&&document.getElementById('future3dLab'))close();}
  function close(){
    document.body.classList.remove('future3d-open');var o=document.getElementById('future3dLab');if(o)o.remove();
    if(state){if(state.raf)cancelAnimationFrame(state.raf);if(state.resize)window.removeEventListener('resize',state.resize);try{clearGroup(state.world);if(state.renderer){state.renderer.dispose();state.renderer.forceContextLoss();}}catch(e){}state=null;}
    document.removeEventListener('keydown',onKey);
  }
  window.StepUpFuture3D={open:open,close:close};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
