/* ===== v29: accurate costs in a filtered forecast — by default the selection carries ALL company costs,
   founder salaries, hires, funding and opening cash (STRATOS as if only these airlines sign).
   "Share by revenue" and "Leave out" stay available as options. Founder-pay line shows the inputs. ===== */
const fcFilteredBase29=fcFiltered;
const fcCost29=()=>view.fcCost==='share'||view.fcCost==='out'?view.fcCost:'full';
fcFiltered=function(F){
  if(fcCost29()!=='full') return fcFilteredBase29(F);
  const sc=curScen(), base=applyScenario(state,sc), s=JSON.parse(JSON.stringify(base));
  const fl=fleet22('fc');
  s.airlines=s.airlines.filter(a=>a.status!=='Lost'&&a.include!==false&&fcScope19(F,a)&&fleetOk22(a,fl));
  fcUndated=0;
  const ids=new Set(s.airlines.map(a=>a.id));
  s.invoices=(s.invoices||[]).filter(v=>ids.has(v.airline));
  s.actuals={};
  const M=compute(s,view.scenario); addBonuses(s,M); blendActuals(s,M,asOfYm());
  costShare22=null;
  M.R=runwayInfo(s,M); M.s=s; M.sc=sc; return M;
};
function founderLine29(){
  const L=state.salary||{}, pay=(state.founders||[]).filter(f=>f.onPayroll);
  const each=num(L.base), tot=pay.reduce((t,f)=>t+each*num(f.share,100)/100,0);
  const steps=(L.steps||[]).filter(st=>isSet(st.salary)).sort((a,b)=>num(a.arr)-num(b.arr));
  return '<p class="hint" style="margin:0 0 10px"><b>Founder salaries:</b> '+pay.length+' founder'+(pay.length===1?'':'s')+' on payroll × '+$(each)+' a month = '+$(tot)+' a month ('+$(tot*12)+' a year)'+
    (isSet(L.startMonth)?', from '+esc(ymLabel(L.startMonth)):'')+'.'+
    (steps.length?' Raises to '+steps.map(st=>$(num(st.salary))+(isSet(st.month)?' from '+esc(ymLabel(st.month)):' when live ARR reaches '+$k(num(st.arr)))).join(', then ')+'. Change or remove these steps on Costs & team.':'')+'</p>';
}
const forecastBase29=forecast;
forecast=function(M){
  let h=forecastBase29(M);
  const F=fcF(), fl=fleet22('fc'), any=!!(F.regions.length||F.countries.length||F.product||fl.on), mode=fcCost29();
  if(any){
    const n=fcApRows14(F).filter(x=>x.on).length;
    const txt=mode==='full'?'All company costs, founder salaries, hires, funding and opening cash are counted in full, so this is STRATOS as if only these airlines sign.'
      :mode==='out'?'Company costs, founder salaries, hires and funding are left out, so profit here is before overheads.'
      :'This selection carries '+pct((costShare22||0)*100)+' of company costs, founder salaries and hires (its share of total revenue). Funding and opening cash are left out.';
    const sw='<div class="cost22"><span class="muted small" style="align-self:center">Company costs:</span>'+
      [['full','Count in full'],['share','Share by revenue'],['out','Leave out']].map(([v,l])=>'<button class="btn small" data-act="f29-cost" data-v="'+v+'" aria-pressed="'+(mode===v)+'">'+l+'</button>').join('')+'</div>';
    const hint='<p class="hint"><b>'+n+' ticked airline'+(n===1?'':'s')+'</b> in this selection feed the numbers below. '+txt+'</p>'+sw;
    h=h.replace(/<p class="hint"><b>\d+ ticked airline[\s\S]*?<\/p>(?:<div class="cost22">[\s\S]*?<\/div>)?/,hint);
  }
  const k=h.indexOf('<div class="panel mb wf25"');
  return k>=0?h.slice(0,k)+founderLine29()+h.slice(k):h;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="f29-cost"]'); if(!b) return;
  view.fcCost=b.dataset.v==='full'?undefined:b.dataset.v; if(view.fcCost===undefined) delete view.fcCost; persistView(); render();
});
