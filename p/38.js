/* ===== v38: when you pick a region, country or airlines, the founders' share follows those airlines only.
   Before, the company-wide cost copy brought in the founders' share of airlines outside the selection, and it
   showed up as "Other costs". ===== */
const fcFilteredBase38=fcFiltered;
fcFiltered=function(F){
  const M=fcFilteredBase38(F);
  if(!M||M.fix38) return M; M.fix38=true;
  try{
    const mode=fcCost29(); if(mode!=='full'&&mode!=='share') return M;
    const G=modelFor(curScen()); let run=0;
    M.months.forEach((m,i)=>{
      const g=G.months[i]; if(!g) return;
      const f=mode==='full'?1:(num(g.costs)?num(m.costs)/num(g.costs):0);
      const dl=num(m.fimpl)-num(g.fimpl)*f;
      if(Math.abs(dl)>1e-9){ m.costs=num(m.costs)+dl; m.net=num(m.net)-dl; if('cashOut' in m) m.cashOut=num(m.cashOut)+dl; run+=dl; }
      if(run){ m.cash=num(m.cash)-run; if('cashB' in m) m.cashB=num(m.cashB)-run; }
    });
    if(run||M.costSynced30){ try{ M.R=runwayInfo(M.s,M); }catch(e){} }
  }catch(e){ console.warn('v38',e); }
  return M;
};
