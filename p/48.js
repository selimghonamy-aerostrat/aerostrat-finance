/* ===== v48: (1) founders' share of implementation by fee tier — e.g. $500 each on a $4,000 fee, $1,000 each on
   $8,000 — editable on Costs & team (tiers, on/off, who takes it). (2) Costs & team follows the airlines picked on
   the Forecast, so salary steps ("When each step lands"), hires, per-airline costs and totals match the Forecast
   table. A button switches back to the whole plan. ===== */
(function(){
  try{ if(document.getElementById('v48-css')) return; const st=document.createElement('style'); st.id='v48-css';
    st.textContent=['.sync48{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;border-left:4px solid var(--navy,#00348c)}',
      '.sync48 p{margin:0;flex:1 1 320px;font-size:13.5px;line-height:1.5}',
      '.fs48 table{width:auto;min-width:420px}','.fs48 td,.fs48 th{white-space:nowrap}',
      '.fs48 .who48{display:flex;flex-wrap:wrap;gap:6px 18px;margin:6px 0 12px}','.fs48 .who48 label{display:inline-flex;gap:6px;align-items:center;cursor:pointer}',
      '.fs48 .ex48{margin:10px 0 0;padding-left:18px;font-size:13px;line-height:1.6}'].join(' ');
    document.head.appendChild(st); }catch(e){}
})();

/* ---------- 1) the rule ---------- */
const DEF48=[{max:4000,each:500},{max:'',each:1000}];
function tiers48(s){
  const S=(s&&s.settings)||{}, T=Array.isArray(S.fImplTiers)?S.fImplTiers:DEF48;
  return T.map(t=>({max:isSet(t.max)&&num(t.max)>0?num(t.max):Infinity,each:Math.max(0,num(t.each))})).sort((a,b)=>a.max-b.max);
}
function each48(s,fee){ const T=tiers48(s); if(!T.length) return 0; const f=num(fee); const t=T.find(x=>f<=x.max+1e-9)||T[T.length-1]; return t.each; }
function takes48(f){ return !(f&&isSet(f.implCut)&&num(f.implCut)===0); }
function takers48(s){ return ((s&&s.founders)||[]).filter(takes48); }
function total48(s,fee){ const S=(s&&s.settings)||{}; if(S.fImplOn===false) return 0; return each48(s,fee)*takers48(s).length; }
function rule48(s){
  const T=tiers48(s); if(!T.length) return 'no tiers set';
  return T.map((t,i)=>$(t.each)+' each '+(t.max===Infinity?(i&&isFinite(T[i-1].max)?'above '+$(T[i-1].max):'on every fee'):'on fees up to '+$(t.max))).join(', ');
}
/* fShare36 now knows the fee; without a fee it gives the average over the airlines in the plan */
fShare36=function(s,fee){
  const S=(s&&s.settings)||{}; if(S.fImplOn===false) return {each:[],total:0};
  let amt;
  if(fee!==undefined) amt=each48(s,fee);
  else {
    let t=0,n=0;
    ((s&&s.airlines)||[]).filter(a=>a&&a.include!==false&&a.status!=='Lost').forEach(a=>{ try{ const e=airlineEcon(s,a,0), im=num(e&&e.impl); if(im>0){ t+=each48(s,im); n++; } }catch(err){} });
    amt=n?t/n:each48(s,Infinity);
  }
  const each=((s&&s.founders)||[]).map(f=>({name:f.name||'Founder',amt:takes48(f)?amt:0}));
  return {each,total:each.reduce((t,f)=>t+f.amt,0)};
};
/* the model: each signing gets the share for its own fee */
const computeBase48=compute;
compute=function(s,sc){
  const M=computeBase48(s,sc);
  try{
    const S0=(s&&s.founders)?s:state, N=M.months.length; if(!N) return M;
    const t0=monthIndex(M.months[0].ym), dd=new Array(N).fill(0);
    (M.airlines||[]).forEach(x=>{
      if(!x||!x.e||!(num(x.e.impl)>0)||!isFinite(x.sign)) return;
      const i=x.sign-t0; if(i<0||i>=N) return;
      const fee=num(x.e.impl), amt=Math.min(total48(S0,fee),fee)*num(x.w,1), d=amt-num(x.fimpl); if(Math.abs(d)<1e-9) return;
      x.fimpl=amt; const m=M.months[i];
      m.fimpl=num(m.fimpl)+d; m.costs=num(m.costs)+d; m.net=num(m.net)-d; if(m.byType) m.byType.ga=num(m.byType.ga)+d;
      const j=Math.min(N-1,i+num(x.delay)); if('cashOut' in M.months[j]) M.months[j].cashOut=num(M.months[j].cashOut)+d; dd[j]-=d;
    });
    let run=0; M.months.forEach((m,i)=>{ run+=dd[i]; if(run){ m.cash=num(m.cash)+run; if('cashB' in m) m.cashB=num(m.cashB)+run; } });
  }catch(e){ console.warn('v48',e); }
  return M;
};
/* saved data: add the tiers once (founders who had their own amount now follow the tiers; 0 still means "does not take it") */
function mig48(s){
  if(!s||!s.settings||num(s.settings.fimpl48)>=1) return false;
  if(!Array.isArray(s.settings.fImplTiers)) s.settings.fImplTiers=DEF48.map(t=>Object.assign({},t));
  (s.founders||[]).forEach(f=>{ if(isSet(f.implCut)&&num(f.implCut)>0) delete f.implCut; });
  s.settings.fimpl48=1; return true;
}
const applyDraftBase48=applyDraft;
applyDraft=function(){
  applyDraftBase48();
  if(readOnly||cfgLocked) return;
  if(mig48(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Founders’ share is now set by implementation fee: $500 each up to $4,000, $1,000 each above. Change it on Costs & team. Press Save to keep it.'),3200); }
};

/* ---------- 2) where you change it: Costs & team ---------- */
function fpanel48(){
  const S=state.settings||{}, lock=readOnly||cfgLocked, on=S.fImplOn!==false;
  const T=Array.isArray(S.fImplTiers)?S.fImplTiers:DEF48, tk=takers48(state), n=tk.length;
  const sorted=tiers48(state);
  let h='<div class="panel mb fs48"><div class="panel-head"><h3>Founders’ share of implementation fees</h3><span class="muted small">Taken from each airline’s implementation fee when it signs</span></div>'+
    '<label class="inline" style="display:inline-flex;gap:8px;align-items:center;margin:0 0 8px">'+inp('settings.fImplOn',{type:'checkbox',label:'Founders take a share'})+' Founders take a share of implementation fees</label>';
  if(on){
    h+='<div class="who48"><span class="muted small">Who takes it:</span>'+(state.founders||[]).map((f,i)=>'<label><input type="checkbox" data-act48="who" data-i="'+i+'"'+(takes48(f)?' checked':'')+(lock?' disabled':'')+'> '+esc(f.name||'Founder')+'</label>').join('')+'</div>'+
      '<div class="tbl-wrap"><table class="fin"><thead><tr><th>Implementation fee up to</th><th>Each founder takes</th><th class="n">All founders ('+n+')</th><th></th></tr></thead><tbody>'+
      T.map((t,i)=>'<tr><td>'+inp('settings.fImplTiers.'+i+'.max',{num:1,w:'w-m',label:'Fee up to',ph:'any higher fee'})+'</td><td>'+inp('settings.fImplTiers.'+i+'.each',{num:1,w:'w-s',label:'Each founder takes'})+'</td><td class="n">'+$(Math.max(0,num(t.each))*n)+'</td><td>'+(lock?'':'<button class="btn small" data-act="f48-del" data-i="'+i+'" aria-label="Remove this tier" title="Remove this tier">✕</button>')+'</td></tr>').join('')+
      '</tbody></table></div>'+(lock?'':'<button class="btn small" data-act="f48-add" style="margin-top:8px">+ Add tier</button>');
    const ex=[]; let prev=0;
    sorted.forEach(t=>{ const fee=isFinite(t.max)?t.max:(prev?prev*2:8000); prev=isFinite(t.max)?t.max:prev; const tot=Math.min(t.each*n,fee);
      ex.push('<li>Fee of '+$(fee)+': '+(n?tk.map(f=>esc(f.name||'Founder')+' '+$(t.each)).join(' + ')+' = '+$(tot):'nobody takes a share')+' · AeroStrat keeps <b>'+$(fee-tot)+'</b></li>'); });
    h+='<ul class="ex48">'+ex.join('')+'</ul><p class="hint">Leave “fee up to” empty for the last tier so it covers any higher fee. A share is never more than the fee itself. It is counted as a cost in the signing month and paid when the airline pays.</p>';
  } else h+='<p class="hint">Switched off: founders take nothing from implementation fees.</p>';
  return h+'</div>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="f48-add"],[data-act="f48-del"],[data-act="cw48"]'); if(!b) return;
  const a=b.dataset.act;
  if(a==='cw48'){ view.cw48=!view.cw48; if(!view.cw48) delete view.cw48; persistView(); render(); return; }
  if(readOnly||cfgLocked){ toast('Only editors can change this.'); return; }
  const S=state.settings; if(!Array.isArray(S.fImplTiers)) S.fImplTiers=DEF48.map(t=>Object.assign({},t));
  if(a==='f48-add'){ const fin=S.fImplTiers.filter(t=>isSet(t.max)&&num(t.max)>0).map(t=>num(t.max)), top=fin.length?Math.max.apply(null,fin):0, last=S.fImplTiers[S.fImplTiers.length-1];
    S.fImplTiers.push({max:top?top+4000:4000,each:last?num(last.each):500}); }
  if(a==='f48-del'){ const i=+b.dataset.i; if(i>=0) S.fImplTiers.splice(i,1); }
  commit();
});
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act48!=='who') return;
  if(readOnly||cfgLocked) return;
  const f=(state.founders||[])[+el.dataset.i]; if(!f) return;
  if(el.checked) delete f.implCut; else f.implCut=0;
  commit();
});
/* Pricing tab: the old flat-amount editor becomes a pointer to Costs & team */
const prices34Base48=prices34;
prices34=function(M){
  let h=prices34Base48(M);
  try{
    const a=h.indexOf('<div class="panel mb"><h3>Founders’ share of each implementation fee</h3>');
    if(a>=0){ const b=h.indexOf('<div class="panel mb"><h3>Seats and billing',a);
      const p='<div class="panel mb"><h3>Founders’ share of each implementation fee</h3><p class="hint">'+(state.settings.fImplOn===false?'Switched off.':'Set by the size of the fee: '+rule48(state)+' ('+takers48(state).map(f=>esc(f.name||'Founder')).join(', ')+').')+' Change it on Costs & team.</p><button class="btn small" data-act="tab" data-v="costs">Open Costs & team</button></div>';
      if(b>a) h=h.slice(0,a)+p+h.slice(b); }
  }catch(e){}
  return h;
};
/* Forecast: the implementation box describes the tiers */
const implPanel41Base48=implPanel41;
implPanel41=function(M,Y){
  let h=implPanel41Base48(M,Y);
  try{
    let n=0; (M.airlines||[]).forEach(x=>{ if(x&&x.e&&isFinite(x.sign)&&ymFromIndex(x.sign).slice(0,4)===Y&&num(x.e.impl)>0) n++; });
    const off=state.settings.fImplOn===false, who=takers48(state).map(f=>esc(f.name||'Founder')).join(' + ');
    const txt=off?'switched off':n+' signing'+(n===1?'':'s')+' · '+(who||'nobody')+': '+rule48(state);
    const k=h.indexOf('Founders’ share</span><b>');
    if(k>=0){ const a=h.indexOf('<small>',k), b=h.indexOf('</small>',a); if(a>0&&b>a) h=h.slice(0,a+7)+txt+h.slice(b); }
    h=h.split('Change who takes what on the Pricing tab.').join('Change the amounts on Costs & team.').split('Implementation STRATOS keeps').join('Implementation AeroStrat keeps').split('STRATOS keeps').join('AeroStrat keeps');
  }catch(e){}
  return h;
};

/* ---------- 3) Costs & team follows the Forecast selection ---------- */
function sel48(){
  try{ const F=fcF(), fl=fleet22('fc'); if(!(F.regions.length||F.countries.length||F.product||fl.on)) return null; if(fcCost29()!=='full') return null; return F; }catch(e){ return null; }
}
const costsBase48=costs;
costs=function(M){
  const F=sel48(); let M2=M;
  if(F&&!view.cw48){ try{ const X=fcFiltered(F); if(X&&X.months&&X.months.length===M.months.length) M2=X; }catch(e){ M2=M; } }
  let h=costsBase48(M2);
  h=h.split('What STRATOS spends').join('What AeroStrat spends').split('Every forecast and country page uses these numbers.').join(F&&!view.cw48?'Worked out for the airlines picked on the Forecast.':'Every forecast and country page uses these numbers.');
  let bn='';
  if(F){
    const rn=x=>{ const r=(state.regions||[]).find(q=>q.id===x||q.name===x); return r?r.name:x; };
    const where=F.countries.length?F.countries.join(', '):F.regions.length?F.regions.map(rn).join(', '):'';
    const n=M2!==M?((M2.s&&M2.s.airlines)||[]).length:0;
    bn=view.cw48?'<div class="panel mb sync48"><p><b>Showing the whole plan.</b> The Forecast has a selection'+(where?' ('+esc(where)+')':'')+'; this page ignores it.</p><button class="btn small" data-act="cw48">Follow the Forecast selection</button></div>'
      :'<div class="panel mb sync48"><p><b>This page follows your Forecast: '+n+' airline'+(n===1?'':'s')+(where?' in '+esc(where):'')+'.</b> Salary steps, hires, per-airline costs and every total below are worked out as if only these airlines sign, the same as the Forecast table.</p><button class="btn small" data-act="cw48">Show the whole plan</button></div>';
  }
  let k=h.indexOf('<div class="panel mb ac45"'); if(k<0) k=h.indexOf('<details class="sec25"');
  if(k>=0) h=h.slice(0,k)+bn+h.slice(k); else h=bn+h;
  const k2=h.indexOf('<details class="sec25"'); const fp=fpanel48();
  return k2>=0?h.slice(0,k2)+fp+h.slice(k2):h+fp;
};
