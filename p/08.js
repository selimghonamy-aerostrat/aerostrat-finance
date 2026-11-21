document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){ e.preventDefault(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); setTimeout(save,0); } });
/* ---------- boot ---------- */
render();
let bootTries=0;
function boot(){
  if(!(window.claude&&window.claude.use)){
    if(++bootTries<20){ setTimeout(boot,400); return; }
    dbMode='offline'; readOnly=true; loading=false; render(); return;
  }
  initData();
  fetchFx(false);
  window.claude.use('downloads').then(d=>{downloads=d; if(d&&(view.tab==='forecast'||view.tab==='settings')) render();}).catch(()=>{});
}
boot();
})();

