/* ===== v53: finishes the Planespotters update for Libya, Algeria, Tunisia and Sudan (p/52). The first pass kept
   inactive airlines that were ticked into the plan or had a status, and could leave two records for one airline
   (e.g. "Ghadames Air" and "Ghadames Air Transport", "Libyan Airlines" and "Libyan Arab Airlines"). This pass:
   one record per airline (the one you worked on most is kept; invoices move with it), fleet = active aircraft,
   every airline with no active aircraft removed (only Signed or Live customers are kept, marked to check), missing
   active airlines added as prospects. It runs once by itself; afterwards a Pipeline banner offers it again if the
   list drifts from Planespotters. ===== */
const KEEPST53=new Set(['Signed','Live']);
const score53=a=>(KEEPST53.has(a.status)?100:((a.status&&a.status!=='Pipeline'&&a.status!=='Lost')?50:0))+(a.include!==false?10:0)+((a.signMonth||a.goLiveMonth)?5:0)+((a.contact&&a.contact.name)?1:0);
function plan53(s){
  const P={fix:[],dups:[],del:[],mark:[],add:[]};
  if(!s||!Array.isArray(s.airlines)) return P;
  const groups={};
  s.airlines.forEach(a=>{ const c=a&&ctry52(a.country); if(!c) return; const k=key52(a.name);
    if(MAP52[c].get(k)){ const g=groups[c+'|'+k]||(groups[c+'|'+k]={c,k,r:MAP52[c].get(k),L:[]}); g.L.push(a); return; }
    if(norm19(a.name)>norm19(C52[c].last)) return;
    const inv=(s.invoices||[]).some(v=>v&&v.airline===a.id);
    if(KEEPST53.has(a.status)||inv){ if(!/no active aircraft/i.test(a.notes||'')) P.mark.push(a); }
    else P.del.push(a); });
  Object.keys(groups).forEach(id=>{ const g=groups[id];
    const L=g.L.slice().sort((x,y)=>score53(y)-score53(x)), keep=L[0];
    L.slice(1).forEach(d=>P.dups.push({d,keep}));
    if(num(keep.fleet)!==g.r[1]||String(keep.notes||'').indexOf(note52(g.c,g.r))!==0) P.fix.push({a:keep,c:g.c,r:g.r}); });
  Object.keys(C52).forEach(c=>C52[c].list.forEach(r=>{ if(!groups[c+'|'+key52(r[0])]) P.add.push({c,r}); }));
  return P;
}
const size53=P=>P.fix.length+P.dups.length+P.del.length+P.mark.length+P.add.length;
function apply53(s,P){
  const gone=new Set();
  P.fix.forEach(({a,c,r})=>{ a.fleet=r[1];
    const rest=String(a.notes||'').split('|').map(x=>x.trim()).filter(x=>x&&x.indexOf('Planespotters Nov 2026')!==0&&!/^Researched [A-Za-z]+ 20[0-9][0-9]: fleet/.test(x)&&!/^No active aircraft on Planespotters/.test(x));
    a.notes=[note52(c,r)].concat(rest).join(' | ').slice(0,600); });
  P.dups.forEach(({d,keep})=>{
    if(!(keep.contact&&keep.contact.name)&&d.contact&&d.contact.name) keep.contact=d.contact;
    (s.invoices||[]).forEach(v=>{ if(v&&v.airline===d.id) v.airline=keep.id; });
    gone.add(d.id); });
  P.del.forEach(a=>gone.add(a.id));
  P.mark.forEach(a=>{ a.notes=('No active aircraft on Planespotters (Nov 2026), check before counting on it'+(a.notes?' | '+a.notes:'')).slice(0,600); });
  s.airlines=s.airlines.filter(a=>!(a&&gone.has(a.id)));
  P.add.forEach(({c,r})=>s.airlines.push(newAirline({name:r[0],country:c,fleet:r[1],pilots:'',cohort:'',status:'Pipeline',prob:10,include:false,signMonth:'',goLiveMonth:'',notes:note52(c,r)})));
}
function say53(P){
  const p=[]; if(P.fix.length) p.push(P.fix.length+' fleet'+(P.fix.length===1?'':'s')+' set'); if(P.dups.length) p.push(P.dups.length+' duplicate'+(P.dups.length===1?'':'s')+' merged ('+P.dups.map(x=>x.d.name+' → '+x.keep.name).join(', ')+')');
  if(P.del.length) p.push(P.del.length+' inactive removed ('+P.del.map(a=>a.name).join(', ')+')'); if(P.mark.length) p.push(P.mark.length+' signed/live kept to check ('+P.mark.map(a=>a.name).join(', ')+')'); if(P.add.length) p.push(P.add.length+' added');
  return p.join('; ');
}
const applyDraftBase53=applyDraft;
applyDraft=function(){
  applyDraftBase53();
  if(readOnly||cfgLocked||!state||!state.settings||num(state.settings.ps53)>=1) return;
  const P=plan53(state), n=size53(P); window.__ps53={n,txt:say53(P)}; if(!n) return;
  apply53(state,P); state.settings.ps53=1; restored=false; saveDraft();
  const c=[]; if(P.dups.length) c.push(P.dups.length+' duplicates merged'); if(P.del.length) c.push(P.del.length+' inactive removed'); if(P.fix.length) c.push(P.fix.length+' fleets set'); if(P.add.length) c.push(P.add.length+' added'); if(P.mark.length) c.push(P.mark.length+' kept to check');
  setTimeout(()=>toast('North Africa airlines matched to Planespotters ('+c.join(', ')+'). Press Save to keep it.'),4200);
};
/* afterwards: a banner on the Pipeline if the list no longer matches */
const pipelineBase53=pipeline;
pipeline=function(){
  const h=pipelineBase53(); if(readOnly||cfgLocked) return h;
  let P; try{ P=plan53(state); }catch(e){ return h; } if(!size53(P)) return h;
  const banner='<div class="banner warn"><span class="grow"><b>Libya, Algeria, Tunisia and Sudan don’t match Planespotters (Nov 2026):</b> '+esc(say53(P))+'.</span><button class="btn small cta-outline" data-act="ps53-fix">Fix now</button></div>';
  const k=h.indexOf('<div class="region-strip');
  return k>=0?h.slice(0,k)+banner+h.slice(k):banner+h;
};
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-act="ps53-fix"]'); if(!b||readOnly||cfgLocked) return;
  const P=plan53(state); apply53(state,P); commit(); toast('Done: '+say53(P)+'. Press Save to keep it.'); });
