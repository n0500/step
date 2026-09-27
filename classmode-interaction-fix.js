/* StepUp Class Mode interaction fix — 2026-09-27 */
(() => {
  'use strict';

  const VERSION = '20260927-classmode-touch-1';
  let selectedByStem = new Map();
  let paintTimer = null;

  function inClassMode(){
    return !!document.querySelector('.classmode-shell');
  }

  function currentStem(){
    return (document.querySelector('.classmode-stem')?.textContent || '').trim();
  }

  function choiceNodes(){
    return [...document.querySelectorAll('.classmode-choice')];
  }

  function paintSelection(){
    if(!inClassMode()) return;
    const stem = currentStem();
    const selected = selectedByStem.get(stem);
    const choices = choiceNodes();

    choices.forEach((node, index) => {
      node.setAttribute('role','button');
      node.setAttribute('tabindex','0');
      node.setAttribute('aria-label',`Answer ${String.fromCharCode(65+index)}`);
      node.classList.toggle('cm-selected', selected === index);
      node.classList.remove('cm-wrong');

      if(selected === index && document.querySelector('.classmode-explain')){
        if(!node.classList.contains('correct')) node.classList.add('cm-wrong');
      }
    });
  }

  function choose(index){
    if(!inClassMode()) return;
    const stem = currentStem();
    if(!stem) return;

    selectedByStem.set(stem,index);

    if(window.PROVE?.revealClassAnswer){
      window.PROVE.revealClassAnswer();
      requestAnimationFrame(() => requestAnimationFrame(paintSelection));
    }
  }

  function runAction(action){
    if(!window.PROVE) return;

    if(action === 'reveal' && window.PROVE.revealClassAnswer){
      window.PROVE.revealClassAnswer();
    } else if(action === 'next' && window.PROVE.classNext){
      window.PROVE.classNext();
    } else if(action === 'prev' && window.PROVE.classPrev){
      window.PROVE.classPrev();
    } else if(action === 'pause' && window.PROVE.toggleClassPause){
      window.PROVE.toggleClassPause();
    } else if(action === 'exit' && window.PROVE.exitClassMode){
      window.PROVE.exitClassMode();
    }
  }

  function identifyAction(button){
    const onclick = button.getAttribute('onclick') || '';
    if(onclick.includes('PROVE.revealClassAnswer')) return 'reveal';
    if(onclick.includes('PROVE.classNext')) return 'next';
    if(onclick.includes('PROVE.classPrev')) return 'prev';
    if(onclick.includes('PROVE.toggleClassPause')) return 'pause';
    if(onclick.includes('PROVE.exitClassMode')) return 'exit';
    return '';
  }

  document.addEventListener('click', e => {
    if(!inClassMode()) return;

    const choice = e.target.closest('.classmode-choice');
    if(choice){
      e.preventDefault();
      e.stopImmediatePropagation();
      const index = choiceNodes().indexOf(choice);
      if(index >= 0) choose(index);
      return;
    }

    const button = e.target.closest('.classmode-shell button');
    if(!button || button.disabled) return;

    const action = identifyAction(button);
    if(!action) return;

    // Use delegated handling in Class Mode to make iOS taps reliable.
    e.preventDefault();
    e.stopImmediatePropagation();
    runAction(action);
  }, true);

  document.addEventListener('keydown', e => {
    if(!inClassMode()) return;
    const choice = e.target.closest('.classmode-choice');
    if(!choice || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const index = choiceNodes().indexOf(choice);
    if(index >= 0) choose(index);
  }, true);

  const style = document.createElement('style');
  style.id = 'stepupClassModeTouchFix';
  style.textContent = `
    .classmode-shell,
    .classmode-toolbar,
    .classmode-content,
    .classmode-card,
    .exam-actions{
      position:relative;
    }
    .classmode-shell button,
    .classmode-choice{
      pointer-events:auto !important;
      touch-action:manipulation !important;
      -webkit-tap-highlight-color:rgba(37,99,235,.12);
    }
    .classmode-shell button{
      position:relative;
      z-index:5;
    }
    .classmode-choice{
      position:relative;
      z-index:3;
      cursor:pointer !important;
      user-select:none;
      -webkit-user-select:none;
      transition:border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .1s ease;
    }
    .classmode-choice:active{
      transform:scale(.99);
    }
    .classmode-choice.cm-selected{
      border-color:#2563eb !important;
      box-shadow:0 0 0 3px rgba(37,99,235,.12) !important;
      background:#f5f9ff !important;
    }
    .classmode-choice.correct{
      border-color:#15945f !important;
      background:#ecfdf3 !important;
      box-shadow:0 0 0 3px rgba(21,148,95,.10) !important;
    }
    .classmode-choice.cm-wrong{
      border-color:#d9485f !important;
      background:#fff1f3 !important;
      box-shadow:0 0 0 3px rgba(217,72,95,.08) !important;
    }
    .classmode-choice.correct::after,
    .classmode-choice.cm-wrong::after{
      position:absolute;
      right:14px;
      top:50%;
      transform:translateY(-50%);
      font-weight:800;
      font-size:13px;
    }
    .classmode-choice.correct::after{
      content:"✓ Correct";
      color:#116b47;
    }
    .classmode-choice.cm-wrong::after{
      content:"Try again";
      color:#a52f45;
    }
    @media(max-width:520px){
      .classmode-choice.correct::after,
      .classmode-choice.cm-wrong::after{
        right:10px;
        font-size:11px;
      }
    }
  `;
  document.head.appendChild(style);

  new MutationObserver(() => {
    clearTimeout(paintTimer);
    paintTimer = setTimeout(paintSelection,40);
  }).observe(document.getElementById('app') || document.body,{childList:true,subtree:true});

  setTimeout(paintSelection,100);
  setTimeout(paintSelection,500);

  window.STEPUP_CLASSMODE_FIX = {version:VERSION,paintSelection};
})();
