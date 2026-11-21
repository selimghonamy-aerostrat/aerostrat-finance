/* ===== v37: only Selim and Seif take the founders' share of implementation fees (others set to $0, still editable). ===== */
function mig37(s){
  if(!s||!s.settings||!Array.isArray(s.founders)||num(s.settings.fimpl37)>=1) return false;
  s.founders.forEach(f=>{ const n=String(f&&f.name||'').trim().toLowerCase(); if(!/^(selim|seif)\b/.test(n)) f.implCut=0; else if(num(f.implCut)===0&&isSet(f.implCut)) delete f.implCut; });
  s.settings.fimpl37=1; return true;
}
const applyDraftBase37=applyDraft;
applyDraft=function(){
  applyDraftBase37();
  if(readOnly||cfgLocked) return;
  if(mig37(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Founders’ share of implementation: only Selim and Seif take it now ($1,000 each). Press Save to keep it.'),2800); }
};
