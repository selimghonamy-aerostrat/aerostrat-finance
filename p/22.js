/* ===== v22: fleet-size filter · implementation fees you expect to collect, by year · company costs shared into filtered forecasts · one editable "Key assumptions" panel ===== */
(function(){
  if(document.getElementById('v22-css')) return;
  const st=document.createElement('style'); st.id='v22-css';
  st.textContent=[
  '.fl22{display:inline-flex;gap:6px;align-items:center;font-size:12.5px;color:var(--muted);margin-left:4px}',
  '.fl22 .in{width:70px}',
  'details.as22>summary{cursor:pointer;list-style:none;display:flex;gap:12px;align-items:center;flex-wrap:wrap}',
  'details.as22>summary::-webkit-details-marker{display:none}',
  'details.as22>summary h3::before{content:"▸";display:inline-block;width:14px;color:var(--muted)}',
  'details.as22[open]>summary h3::before{content:"▾"}',
  '.as22 h4{margin:16px 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
  '.as22 .yr22{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}',
  '.as22 .yr22 .field .in{width:80px}',
  '.as22 table td{padding:5px 8px}',
  '.cost22{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}',
  '.cost22 .btn[aria-pressed="true"]{background:var(--c-deep);border-color:var(--c-deep);color:#fff}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* =====================================================================
   1) IMPLEMENTATION FEES YOU EXPECT TO COLLECT, BY SIGNING YEAR
      settings.implPct = { "2026": 50, ... }  (blank = 100%)
      Applied inside the calculation, so Pipeline, Countries, Forecast, cash, Metrics and exports all agree.
   ===================================================================== */
const airlineEconBase22=airlineEcon;
airlineEcon=function(s,a,k){
  const e=airlineEconBase22(s,a,k);
  const P=s&&s.settings&&s.settings.implPct;
  if(P&&a&&e){
    const y=String((timingOf(s,a)||{}).sign||'').slice(0,4), v=y?P[y]:undefined;
    if(isSet(v)) e.impl=e.impl*Math.max(0,num(v))/100;
  }
  return e;
};
const implPctOf22=y=>{ const P=state.settings.implPct||{}; return isSet(P[y])?num(P[y]):100; };

/* =====================================================================
   2) FLEET-SIZE FILTER (Pipeline and Forecast, kept separately)
   ===================================================================== */
function fleet22(k){
  const F=(view.fleet22&&view.fleet22[k])||{};
  const min=isSet(F.min)&&F.min!==null?num(F.min):null, max=isSet(F.max)&&F.max!==null?num(F.max):null;
  return {min,max,on:min!==null||max!==null};
}
function fleetOk22(a,f){ if(!f.on) return true; const n=num(a.fleet); return (f.min===null||n>=f.min)&&(f.max===null||n<=f.max); }
function setFleet22(k,min,max){ view.fleet22=Object.assign({},view.fleet22||{}); view.fleet22[k]={min:min,max:max}; persistView(); render(); }
const FLEET_PRESETS22=[['1–10',1,10],['11–30',11,30],['31–70',31,70],['1–70',1,70],['Over 70',71,null]];
function fleetRow22(k){
  const f=fleet22(k);
  const chips=FLEET_PRESETS22.map(([l,a,b])=>'<button class="chip19" data-act="f22-preset" data-k="'+k+'" data-min="'+a+'" data-max="'+(b===null?'':b)+'" aria-pressed="'+(f.min===a&&f.max===b)+'">'+l+'</button>').join('')+
    '<button class="chip19" data-act="f22-preset" data-k="'+k+'" data-min="" data-max="" aria-pressed="'+(!f.on)+'">Any size</button>';
  const box='<span class="fl22">from <input class="in num" type="number" min="0" step="1" data-act="f22-min" data-k="'+k+'" value="'+(f.min===null?'':f.min)+'" placeholder="0" aria-label="Minimum aircraft"> to <input class="in num" type="number" min="0" step="1" data-act="f22-max" data-k="'+k+'" value="'+(f.max===null?'':f.max)+'" placeholder="any" aria-label="Maximum aircraft"> aircraft</span>';
  return '<div class="f19-row"><span class="f19-lab">Fleet size</span><div class="chips19">'+chips+box+'</div></div>';
}
/* chip bars: count only airlines in the fleet range, and show the fleet row */
const chipBarBase22=chipBar19;
chipBar19=function(prefix,regIds,ctys,list,label){
  const k=prefix==='pr19'?'pr':'fc', f=fleet22(k);
  let h=chipBarBase22(prefix,regIds,ctys,(list||[]).filter(a=>a&&fleetOk22(a,f)),label);
  const tools='<div class="f19-row"><span class="f19-lab"></span><div class="f19-tools">';
  const i=h.lastIndexOf(tools);
  h=i>=0?h.slice(0,i)+fleetRow22(k)+h.slice(i):h;
  if(f.on&&!(regIds.length||ctys.length)) h=h.replace('All regions and countries · ','All regions · fleet '+(f.min===null?'up to '+f.max:f.max===null?f.min+'+':f.min+'–'+f.max)+' aircraft · ');
  if(f.on&&h.indexOf('data-act="'+prefix+'-clear"')<0) h=h.replace('</span></div></div></div>','</span><button class="btn small" data-act="'+prefix+'-clear">Show everything</button></div></div></div>');
  return h;
};
/* pipeline: hide airlines outside the fleet range (keeps every row bound to the right airline) */
let realAll22=null;
const pipelineBase22=pipeline;
pipeline=function(){
  const f=fleet22('pr'); if(!f.on) return pipelineBase22();
  const real=state.airlines, sp=new Array(real.length);
  real.forEach((a,i)=>{ if(fleetOk22(a,f)) sp[i]=a; });
  realAll22=real; state.airlines=sp;
  try{ return pipelineBase22(); } finally { state.airlines=real; realAll22=null; }
};
const imp18MissingBase22=imp18Missing;
imp18Missing=function(){
  if(!realAll22) return imp18MissingBase22();
  const keep=state.airlines; state.airlines=realAll22;
  try{ return imp18MissingBase22(); } finally { state.airlines=keep; }
};
/* forecast: airline list respects the fleet range */
const fcApRowsBase22=fcApRows14;
fcApRows14=function(F){ const f=fleet22('fc'); return fcApRowsBase22(F).filter(x=>fleetOk22(x.a,f)); };

/* =====================================================================
   3) FILTERED FORECAST: company costs, founder pay and hires shared in by revenue (default), or left out
   ===================================================================== */
let costShare22=null;
fcFiltered=function(F){
  const sc=curScen(), base=applyScenario(state,sc), s=JSON.parse(JSON.stringify(base));
  const fl=fleet22('fc'), partial=!!(F.regions.length||F.countries.length||F.product||fl.on);
  s.airlines=s.airlines.filter(a=>a.status!=='Lost'&&a.include!==false&&fcScope19(F,a)&&fleetOk22(a,fl));
  fcUndated=0;
  const ids=new Set(s.airlines.map(a=>a.id));
  s.invoices=(s.invoices||[]).filter(v=>ids.has(v.airline));
  s.actuals={};
  if(partial){
    s.costs=[]; s.hires=[]; s.fees=[]; s.funding=[]; s.distributions=[]; s.bonuses=[];
    s.salary=Object.assign({},s.salary,{base:0,steps:[]});
    s.settings=Object.assign({},s.settings,{openingCash:0,minCash:0});
  }
  const M=compute(s,view.scenario); addBonuses(s,M); blendActuals(s,M,asOfYm());
  costShare22=null;
  if(partial&&view.fcCost!=='out'){
    const Mf=modelFor(sc), tr=M.months.reduce((t,m)=>t+m.revenue,0), tf=Mf.months.reduce((t,m)=>t+m.revenue,0);
    const share=tf>0?tr/tf:0; costShare22=share;
    let cash=0;
    M.months.forEach((m,i)=>{
      const g=Mf.months[i]; if(!g) return;
      ['tools','salaries','hires','fees','bonus','fixedCosts','varCosts'].forEach(k2=>{ m[k2]=num(g[k2])*share; });
      m.byType={}; for(const t in g.byType) m.byType[t]=num(g.byType[t])*share;
      m.costItems={}; for(const c in (g.costItems||{})) m.costItems[c]=num(g.costItems[c])*share;
      m.hireItems={}; for(const c in (g.hireItems||{})) m.hireItems[c]=num(g.hireItems[c])*share;
      m.feeItems={}; for(const c in (g.feeItems||{})) m.feeItems[c]=num(g.feeItems[c])*share;
      m.salaryEach=g.salaryEach;
      m.costs=num(g.costs)*share; m.net=m.revenue-m.costs; m.cashOut=m.costs;
      cash+=m.cashIn-m.cashOut; m.cash=cash; m.cashB=cash;
    });
  }
  M.R=runwayInfo(s,M); M.s=s; M.sc=sc; return M;
};

/* =====================================================================
   4) KEY ASSUMPTIONS: one editable panel, bound to the same data as the other tabs
   ===================================================================== */
function assumptions22(M){
  const years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4))));
  const implBy={}; years.forEach(y=>implBy[y]=0); M.months.forEach(m=>{ implBy[m.ym.slice(0,4)]+=m.impl; });
  const S=state.settings, open=view.fcD14&&view.fcD14.as22?' open':'';
  const locked=readOnly||cfgLocked;
  let h='<details class="panel mb as22" data-d14="as22"'+open+'><summary><h3>Key assumptions</h3><span class="muted small">Change them here or on their own tabs. Every tab uses the same numbers and updates at once.'+(locked?' View only for your account.':'')+'</span></summary>';
  h+='<h4>Implementation fees you expect to collect</h4><p class="muted small" style="margin:0 0 8px">For airlines that sign in each year. 100% = every fee collected; blank = 100%. Lower it for a year you are not sure about.</p><div class="yr22">'+
    years.map(y=>fld(y+' <span class="muted">· '+$k(implBy[y])+'</span>','<span class="adjl">'+inp('settings.implPct.'+y,{num:1,blank:1,ph:'100',label:'Implementation fees collected in '+y})+'<span class="muted small">%</span></span>')).join('')+'</div>';
  h+='<h4>Pricing and collection</h4><div class="fields">'+
    fld('Price increase at renewal %',inp('settings.priceIncrease',{num:1}))+
    fld('Monthly billing premium %',inp('settings.monthlyPremium',{num:1}))+
    fld('Renewal rate %',inp('settings.renewalRate',{num:1}))+
    fld('Collection rate %',inp('settings.collectionRate',{num:1}))+
    fld('Pilots per aircraft',inp('ratios.pilotsPerAircraft',{num:1}))+'</div>';
  h+='<h4>Cash</h4><div class="fields">'+fld('Opening cash ('+esc(MAINC())+')',inp('settings.openingCash',{num:1}))+fld('Minimum cash ('+esc(MAINC())+')',inp('settings.minCash',{num:1}))+'</div>';
  h+='<h4>Founder pay</h4><div class="fields">'+fld('Base salary each /mo ('+esc(MAINC())+')',inp('salary.base',{num:1}))+fld('Salaries start',inp('salary.startMonth',{type:'month'}))+'</div>'+
    ((state.founders||[]).length?'<div class="tbl-wrap mt"><table><thead><tr><th>Founder</th><th>On payroll</th><th class="n">Salary %</th></tr></thead><tbody>'+state.founders.map((f,i)=>'<tr><td>'+esc(f.name||'Founder')+'</td><td>'+inp('founders.'+i+'.onPayroll',{type:'checkbox',label:'On payroll'})+'</td><td>'+inp('founders.'+i+'.share',{num:1,w:'w-xs',label:'Salary share'})+'</td></tr>').join('')+'</tbody></table></div>':'')+
    '<p class="hint">Salary steps and bonuses are on the Team tab.</p>';
  const freq=[{v:'monthly',l:'Monthly'},{v:'yearly',l:'Yearly'},{v:'once',l:'One-time'}];
  h+='<h4>Costs</h4>'+((state.costs||[]).length?'<div class="tbl-wrap"><table><thead><tr><th>Cost</th><th class="n">Amount</th><th>Cur.</th><th>Billing</th><th class="n">Qty</th><th>Starts</th><th>Ends</th></tr></thead><tbody>'+
    state.costs.map((c,i)=>{ const p='costs.'+i; return '<tr><td>'+inp(p+'.name',{w:'w-l',label:'Cost name'})+'</td><td>'+inp(p+'.amount',{num:1,w:'w-s',label:'Amount'})+'</td><td class="small">'+(c.basis==='pctRevenue'?'% rev.':esc(c.currency||'USD'))+'</td><td>'+inp(p+'.freq',{type:'select',options:freq,w:'w-s',label:'Billing'})+'</td><td>'+inp(p+'.qty',{num:1,w:'w-xs',label:'Quantity'})+'</td><td>'+inp(p+'.startMonth',{type:'month',w:'w-m',label:'Start'})+'</td><td>'+inp(p+'.endMonth',{type:'month',w:'w-m',label:'End'})+'</td></tr>'; }).join('')+'</tbody></table></div>':'<p class="muted">No costs yet.</p>')+
    '<div class="toolbar mt"><button class="btn small" data-act="tab" data-v="costs">Add or remove costs on the Costs tab</button></div>';
  h+='<h4>Hires</h4>'+((state.hires||[]).length?'<div class="tbl-wrap"><table><thead><tr><th>In</th><th>Role</th><th class="n">Salary /mo</th><th>Cur.</th><th>Starts (date or trigger)</th></tr></thead><tbody>'+
    state.hires.map((x,i)=>{ const p='hires.'+i; return '<tr class="'+(x.include===false?'off':'')+'"><td>'+inp(p+'.include',{type:'checkbox',label:'Include'})+'</td><td>'+inp(p+'.role',{w:'w-l',label:'Role'})+'</td><td>'+inp(p+'.salary',{num:1,w:'w-s',label:'Salary'})+'</td><td class="small">'+esc(x.currency||'USD')+'</td><td>'+(x.trigger==='month'||!x.trigger?inp(p+'.month',{type:'month',w:'w-m',label:'Start'}):'<span class="small muted">When '+(x.trigger==='arr'?'live ARR reaches '+$k(num(x.value)):'live airlines reach '+num(x.value))+'</span>')+'</td></tr>'; }).join('')+'</tbody></table></div>':'<p class="muted">No hires planned.</p>')+
    '<div class="toolbar mt"><button class="btn small" data-act="tab" data-v="team">Plan hires and bonuses on the Team tab</button></div>';
  return h+'</details>';
}

/* =====================================================================
   5) FORECAST page assembly: assumptions panel, cost-sharing switch, fleet-only hint
   ===================================================================== */
const forecastBase22=forecast;
forecast=function(M){
  const F=fcF(), fl=fleet22('fc'), any=!!(F.regions.length||F.countries.length||F.product||fl.on);
  let h=forecastBase22(M);
  const sw=(any?'<div class="cost22"><span class="muted small" style="align-self:center">Company costs, founder pay and hires:</span><button class="btn small" data-act="f22-cost" data-v="share" aria-pressed="'+(view.fcCost!=='out')+'">Share by revenue</button><button class="btn small" data-act="f22-cost" data-v="out" aria-pressed="'+(view.fcCost==='out')+'">Leave out</button></div>':'');
  const n=fcApRows14(F).filter(x=>x.on).length;
  const hint=any?'<p class="hint"><b>'+n+' ticked airline'+(n===1?'':'s')+'</b> in this selection feed the numbers below. '+
    (view.fcCost==='out'?'Company costs, founder pay, hires and funding are left out, so profit here is before overheads.':'This selection earns '+pct((costShare22||0)*100)+' of the whole forecast’s revenue, so it carries that share of company costs, founder pay, hires and fees; profit and cash below are an estimate for this slice. Funding and opening cash are left out.')+'</p>'+sw:null;
  if(hint) h=h.replace(/<p class="hint">(?:<b>\d+ ticked airline|Whole company\. Pick one)[\s\S]*?<\/p>/,hint);
  const k=h.indexOf('<details class="panel mb fcap"');
  const panel=assumptions22(M);
  return k>=0?h.slice(0,k)+panel+h.slice(k):h+panel;
};
/* Pricing tab: the same implementation-fee setting next to the prices */
const pricingBase22=pricing;
pricing=function(M){
  const MM=M||modelFor(curScen());
  const years=Array.from(new Set(MM.months.map(m=>m.ym.slice(0,4))));
  return pricingBase22(M)+'<div class="panel mb"><h3>Implementation fees you expect to collect</h3><p class="muted small" style="margin:0 0 10px">For airlines signing in each year. 100% = all collected; blank = 100%. The same setting is in Forecast → Key assumptions.</p><div class="fields">'+
    years.map(y=>fld(y,'<span class="adjl">'+inp('settings.implPct.'+y,{num:1,blank:1,ph:'100',label:'Implementation fees collected in '+y})+'<span class="muted small">%</span></span>')).join('')+'</div></div>';
};

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act;
  if(a==='f22-preset'){ const mn=b.dataset.min===''?null:num(b.dataset.min), mx=b.dataset.max===''?null:num(b.dataset.max); setFleet22(b.dataset.k,mn,mx); return; }
  if(a==='f22-cost'){ view.fcCost=b.dataset.v==='out'?'out':'share'; persistView(); render(); return; }
  if(a==='pr19-clear'||a==='fc19-clear'||a==='fc-f-reset'){ const k=a==='pr19-clear'?'pr':'fc'; if(view.fleet22&&view.fleet22[k]){ view.fleet22=Object.assign({},view.fleet22); delete view.fleet22[k]; persistView(); } }
},true);
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return; const a=el.dataset.act;
  if(a!=='f22-min'&&a!=='f22-max') return;
  const f=fleet22(el.dataset.k), v=el.value===''?null:Math.max(0,num(el.value));
  setFleet22(el.dataset.k,a==='f22-min'?v:f.min,a==='f22-max'?v:f.max);
});
