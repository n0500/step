// StepUp • Teacher navigation
// Keeps the teacher's main destinations clear. Tool tabs that other modules add
// (MG1 Assistant, Writing Coach, Dictionary, Teaching Hub) are moved into the
// "Tools" row instead of crowding the main bar.
(function(){
  "use strict";
  var TOOL_IDS = ["mg1AssistantTab","mg1WritingTab","mg1DictionaryTab","stepupTeachingHubTab"];
  var TOOL_LABELS={mg1AssistantTab:"المساعد الذكي",mg1WritingTab:"تدريب الكتابة",mg1DictionaryTab:"القاموس",stepupTeachingHubTab:"مركز التدريس"};
  var queued = false;

  function navs(){ return document.querySelectorAll('.role-tabs[data-role="teacher"]'); }

  function showGroup(nav,group){
    nav.querySelectorAll(".teacher-subtabs").forEach(function(row){
      row.hidden = row.dataset.group !== group;
    });
    var button=nav.querySelector('.teacher-group-btn[data-group="tools"]');
    if(button)button.setAttribute('aria-expanded',String(group==='tools'));
  }

  function organize(){
    queued = false;
    navs().forEach(function(nav){
      var tools = nav.querySelector('.teacher-subtabs[data-group="tools"]');
      if(!tools) return;
      TOOL_IDS.forEach(function(id){
        var b = nav.querySelector("#" + id);
        if(b && b.parentNode !== tools) tools.appendChild(b);
        if(b && b.textContent!==TOOL_LABELS[id])b.textContent=TOOL_LABELS[id];
      });
      // Anything else another module appended straight to the bar is a tool too.
      Array.prototype.slice.call(nav.children).forEach(function(el){
        if(el.matches && el.matches("button.role-tab")) tools.appendChild(el);
      });
      var toolsBtn = nav.querySelector('.teacher-group-btn[data-group="tools"]');
      var studentsBtn = nav.querySelector('.teacher-group-btn[data-group="students"]');
      if(toolsBtn) toolsBtn.hidden = !tools.children.length;
      if(tools.querySelector(".role-tab.active")){
        nav.querySelectorAll('.teacher-nav-main .role-tab').forEach(function(b){b.classList.remove("active");});
        if(toolsBtn) toolsBtn.classList.add("active");
        if(studentsBtn) studentsBtn.classList.remove("active");
        nav.querySelectorAll('.teacher-subtabs[data-group="students"] .role-tab').forEach(function(b){ b.classList.remove("active"); });
        showGroup(nav,"tools");
      }
      if(toolsBtn)toolsBtn.setAttribute('aria-expanded',String(!tools.hidden));
    });
    var main = document.querySelector("main.container.teacher-loading");
    if(main && !document.querySelector(".teacher-nav")) main.classList.remove("teacher-loading");
  }

  function schedule(){
    if(queued) return;
    queued = true;
    requestAnimationFrame(organize);
  }

  function toggleTools(){
    navs().forEach(function(nav){
      var row = nav.querySelector('.teacher-subtabs[data-group="tools"]');
      if(!row) return;
      var open = row.hidden;
      showGroup(nav, open ? "tools" : (nav.querySelector('.teacher-group-btn[data-group="students"].active') ? "students" : ""));
    });
  }

  window.STEPUP_TEACHER_NAV = { toggleTools: toggleTools, organize: organize };

  new MutationObserver(function(list){
    for(var i=0;i<list.length;i++){
      var t = list[i].target;
      if(t.closest && (t.closest(".role-tabs") || t.id === "app" || t.matches("main.container"))){ schedule(); return; }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});
  schedule();
})();

