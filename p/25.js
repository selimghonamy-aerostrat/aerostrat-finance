/* ===== v25: simpler tracker — 6 tabs (Overview, Pipeline, Countries, Forecast, Costs & team, Settings) ·
   Overview = forecast summary · Forecast includes the what-if ("sign them all on one date") ·
   country pages show their share of costs · fleet growth plan per airline · implementation fee per airline ===== */
(function(){
  if(document.getElementById('v25-css')) return;
  const st=document.createElement('style'); st.id='v25-css';
  st.textContent=[
  '.scen-pick{display:none!important}',
  'details.sec25{margin:0 0 16px;border:1px solid var(--line);border-radius:12px;background:var(--card,transparent)}',
  'details.sec25>summary{cursor:pointer;list-style:none;padding:14px 18px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px}',
  'details.sec25>summary::-webkit-details-marker{display:none}',
  'details.sec25>summary::before{content:"▸";color:var(--muted);width:14px}',
  'details.sec25[open]>summary::before{content:"▾"}',
  'details.sec25>summary .muted{font-weight:400;font-size:12.5px}',
  'details.sec25>.in25{padding:0 18px 18px}',
  '.wf25 .row25{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:6px 0 10px}',
  '.wf25 .row25 label{display:inline-flex;gap:6px;align-items:center;font-size:13px}',
  '.fp25 td{padding:5px 8px}',
  '.ov25-st{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 0}',
  '.ov25-st .chip{font-size:12.5px}',
  'td.neg25{color:var(--neg,#c0392b)}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* ---------- 1) tabs ---------- */
TABS.length=0;
[['overview','Overview'],['pipeline','Pipeline'],['countries','Countries'],['forecast','Forecast'],['costs','Costs & team'],['settings','Settings']].forEach(t=>TABS.push(t));
const TABMAP25={pricing:'settings',team:'costs',funding:'costs',founders:'costs',playground:'forecast',metrics:'overview',actuals:'overview',invoices:'overview',scenarios:'overview'};
const norm25=()=>{
  if(TABMAP25[view.tab]) view.tab=TABMAP25[view.tab];
  if(!TABS.some(t=>t[0]===view.tab)) view.tab='overview';
  const base=(state.scenarios||[]).find(x=>x.id==='base')||(state.scenarios||[])[0];
  if(base&&view.scen!==base.id) view.scen=base.id;
};
norm25();
const renderBase25=render;
render=function(){ norm25(); return renderBase25.apply(this,arguments); };
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="tab"]'); if(b&&TABMAP25[b.dataset.v]) b.dataset.v=TABMAP25[b.dataset.v];
},true);

/* collapsible section used on merged pages; remembers open/closed per viewer */
function sec25(key,title,sub,body,openDefault){
  const d=view.d25||{}, open=(key in d)?d[key]:openDefault;
  return '<details class="sec25" data-d25="'+key+'"'+(open?' open':'')+'><summary>'+title+(sub?' <span class="muted">'+sub+'</span>':'')+'</summary><div class="in25">'+body+'</div></details>';
}
document.addEventListener('toggle',e=>{
  const d=e.target; if(!d||!d.dataset||!d.dataset.d25) return;
  view.d25=Object.assign({},view.d25||{}); view.d25[d.dataset.d25]=d.open; persistView();
},true);

/* ---------- 2) calculation: fleet growth plan + implementation fee per airline (no per-year % any more) ---------- */
function fleetPlan25(a){ return (a&&Array.isArray(a.fleetPlan)?a.fleetPlan:[]).filter(p=>p&&isSet(p.year)&&isSet(p.fleet)&&num(p.fleet)>0).sort((x,y)=>num(x.year)-num(y.year)); }
airlineEcon=function(s,a,k){
  k=k||0;
  let b=a;
  const P=fleetPlan25(a);
  if(P.length){
    const tm=timingOf(s,a); let li=monthIndex(tm.live); if(!isFinite(li)) li=monthIndex(tm.sign);
    const fleetAt=kk=>{
      const y=isFinite(li)?num(ymFromIndex(li+12*kk).slice(0,4)):NaN;
      let f=num(a.fleet)+num(a.growth)*kk;
      P.forEach(p=>{ if(isFinite(y)&&num(p.year)<=y) f=num(p.fleet); });
      return Math.max(0,f);
    };
    const F0=fleetAt(0), Fk=fleetAt(k), sc=num(a.fleet)?F0/num(a.fleet):1;
    b=Object.assign({},a,{fleet:F0,growth:k>0?(Fk-F0)/k:0});
    ['pilots','cabin','instructors'].forEach(f=>{ if(isSet(a[f])) b[f]=Math.round(num(a[f])*sc); });
  }
  const e=airlineEconBase22(s,b,k);
  if(a&&a.noImpl) e.impl=0;
  return e;
};

/* ---------- 3) OVERVIEW: forecast summary ---------- */
overview=function(M){
  const ys=aggregate(M.months,byYear);
  const inF=state.airlines.filter(a=>a&&a.include!==false&&a.status!=='Lost');
  const ctys=new Set(inF.map(a=>a.country||''));
  const tot=ys.reduce((t,g)=>({rev:t.rev+g.revenue,cost:t.cost+g.costs,net:t.net+g.net}),{rev:0,cost:0,net:0});
  const last=ys[ys.length-1]||{}, R=M.R||{};
  let low=null; M.months.forEach(m=>{ if(low===null||m.cashB<low.cashB) low=m; });
  let h='<div class="sec-head"><div><div class="eyebrow">Overview</div><h2>STRATOS forecast at a glance</h2><p>Based on the '+inF.length+' airline'+(inF.length===1?'':'s')+' ticked on the Forecast tab, with all company costs. Change which airlines count, their dates and fleets on the Forecast and Pipeline tabs.</p></div><div class="toolbar"><button class="btn cta-outline" data-act="tab" data-v="forecast">Open the forecast</button><button class="btn" data-act="tab" data-v="pipeline">Open the pipeline</button></div></div>';
  h+='<div class="kpis">'+
    kpi('Airlines in the forecast',String(inF.length),ctys.size+' countr'+(ctys.size===1?'y':'ies'),'lead')+
    kpi('ARR at end of '+(last.key||''),$(last.liveARR||0),(last.live?Math.round(last.live):0)+' airlines live')+
    kpi('Revenue, all years',$(tot.rev),'Licences and implementation','sky')+
    kpi('Profit, all years',$(tot.net),'After all costs')+
    kpi('Lowest cash',low?$(low.cashB):'–',low?ymLabel(low.ym)+(R.cashBe?' · break-even '+ymLabel(R.cashBe.ym):' · no break-even in range'):'')+
  '</div>';
  const row=(l,f,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+ys.map(g=>{ const v=f(g); return '<td class="n'+(v<0?' neg25':'')+'">'+$(v)+'</td>'; }).join('')+'</tr>';
  h+='<div class="panel flush mb"><div class="panel-head pad"><h3>Forecast by year</h3><span class="muted small">Whole company</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+ys.map(g=>'<th class="n">'+g.key+'</th>').join('')+'</tr></thead><tbody>'+
    row('Licences',g=>g.recurring)+row('Implementation fees',g=>g.impl)+row('Total revenue',g=>g.revenue,'strong')+
    row('Costs, salaries and hires',g=>-g.costs)+row('Profit',g=>g.net,'total')+row('Cash at year end',g=>g.cashB)+
    row('ARR at year end',g=>g.liveARR,'strong')+
    '<tr><td>Airlines live at year end</td>'+ys.map(g=>'<td class="n">'+Math.round(g.live||0)+'</td>').join('')+'</tr>'+
    '</tbody></table></div></div>';
  /* pipeline by status (every listed airline) */
  const st={}; state.airlines.forEach(a=>{ if(!a) return; const k=a.status||'Pipeline'; st[k]=(st[k]||0)+1; });
  const order=['Live','Signed','Negotiating','Demo','Contacted','Pipeline','Lost'];
  const keys=Object.keys(st).sort((x,y)=>(order.indexOf(x)<0?99:order.indexOf(x))-(order.indexOf(y)<0?99:order.indexOf(y)));
  /* top countries by year-1 ARR (airlines in the forecast) */
  const byC={}; inF.forEach(a=>{ const c=a.country||'Unassigned'; const e=airlineEcon(state,a,0); const o=byC[c]||(byC[c]={n:0,arr:0,fleet:0}); o.n++; o.arr+=e.arr; o.fleet+=num(a.fleet); });
  const top=Object.entries(byC).sort((x,y)=>y[1].arr-x[1].arr).slice(0,10);
  h+='<div class="grid2 mb"><div class="panel"><h3>Pipeline</h3><p class="muted small">'+state.airlines.filter(Boolean).length+' airlines listed</p><div class="ov25-st">'+keys.map(k=>'<span class="chip st-'+esc(k)+'">'+esc(k)+' · '+st[k]+'</span>').join('')+'</div></div>'+
    '<div class="panel"><h3>Top countries in the forecast</h3>'+(top.length?'<div class="tbl-wrap"><table class="fin clickable"><thead><tr><th>Country</th><th class="n">Airlines</th><th class="n">Fleet</th><th class="n">ARR yr 1</th></tr></thead><tbody>'+
      top.map(([c,o])=>'<tr data-act="open-country25" data-v="'+esc(c)+'" tabindex="0"><td><b>'+esc(c)+'</b></td><td class="n">'+o.n+'</td><td class="n">'+o.fleet+'</td><td class="n">'+$(o.arr)+'</td></tr>').join('')+'</tbody></table></div>':'<p class="muted">No airlines ticked in the forecast yet.</p>')+'</div></div>';
  return h;
};
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-act="open-country25"]'); if(!r) return;
  view.tab='countries'; view.country=r.dataset.v; view.airline=null; persistView(); render(); window.scrollTo(0,0);
});

/* ---------- 4) FORECAST: what-if "sign them all on one date"; no implementation-% block ---------- */
function wf25(){ const W=view.wf25||{}; return {sign:W.sign||'',gap:isSet(W.gap)?Math.max(0,Math.round(num(W.gap))):2,only:!!W.only,on:!!W.on&&/^\d{4}-\d{2}$/.test(W.sign||'')}; }
function wfIds25(F){ const W=wf25(); return new Set(fcApRows14(F).filter(x=>x.a.status!=='Lost'&&(W.only?x.on:true)).map(x=>x.a.id)); }
function wfModel25(F){
  const W=wf25(), ids=wfIds25(F), live=ymFromIndex(monthIndex(W.sign)+W.gap);
  const saved=state, s2=JSON.parse(JSON.stringify(state));
  s2.airlines.forEach(a=>{ if(a&&ids.has(a.id)){ a.include=true; a.cohort=''; a.signMonth=W.sign; a.goLiveMonth=live; } });
  state=s2;
  try{ return fcFiltered(F); } finally { state=saved; }
}
function wfPanel25(F){
  const W=wf25(), n=wfIds25(F).size, d0=W.sign||ymFromIndex(monthIndex(asOfYm())+3);
  let h='<div class="panel mb wf25"><div class="panel-head"><h3>What if they all sign on one date?</h3><span class="muted small">Try it without changing your saved dates</span></div>'+
    '<div class="row25"><label>Sign in <input type="month" class="in w-m" id="wf25-sign" value="'+esc(d0)+'" aria-label="Sign month"></label>'+
    '<label>go live <input type="number" class="in w-xs" id="wf25-gap" min="0" step="1" value="'+W.gap+'" aria-label="Months to go-live"> months later</label>'+
    '<label><input type="checkbox" id="wf25-only"'+(W.only?' checked':'')+'> only the ticked airlines</label>'+
    '<button class="btn small cta-outline" data-act="wf25-show">Show the forecast</button>'+(W.on?'<button class="btn small" data-act="wf25-clear">Back to my dates</button>':'')+'</div>'+
    '<p class="muted small" style="margin:0">Uses the '+n+' airline'+(n===1?'':'s')+' '+(W.only?'ticked ':'listed ')+'in the selection below (regions, countries, fleet size).</p>';
  if(W.on){
    const P=fcFiltered(F), X=wfModel25(F), yp=aggregate(P.months,byYear), yx=aggregate(X.months,byYear);
    const row=(l,f,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+yx.map((g,i)=>{ const v=f(g,yp[i]||{}); return '<td class="n'+(v<0?' neg25':'')+'">'+$(v)+'</td>'; }).join('')+'</tr>';
    h+='<div class="tbl-wrap mt"><table class="fin"><thead><tr><th>All sign '+esc(ymLabel(W.sign))+', live '+esc(ymLabel(ymFromIndex(monthIndex(W.sign)+W.gap)))+'</th>'+yx.map(g=>'<th class="n">'+g.key+'</th>').join('')+'</tr></thead><tbody>'+
      row('Total revenue',g=>g.revenue,'strong')+row('Licences',g=>g.recurring)+row('Implementation fees',g=>g.impl)+row('Costs, salaries and hires',g=>-g.costs)+row('Profit',g=>g.net,'total')+row('Cash at year end',g=>g.cashB)+row('ARR at year end',g=>g.liveARR,'strong')+
      row('Revenue with your saved dates',(g,p)=>num(p.revenue))+row('Difference in revenue',(g,p)=>g.revenue-num(p.revenue))+
      '</tbody></table></div>'+
      (readOnly?'':'<div class="toolbar mt"><button class="btn small" data-act="wf25-apply">Save these dates to the '+n+' airlines</button><span class="muted small">Optional. Click Save afterwards to keep it.</span></div>');
  }
  return h+'</div>';
}
const forecastBase25=forecast;
forecast=function(M){
  let h=forecastBase25(M);
  h=h.replace(/<h4>Implementation fees you expect to collect<\/h4>[\s\S]*?(?=<h4>Pricing and collection<\/h4>)/,'<h4>Implementation fees</h4><p class="muted small" style="margin:0 0 8px">Set per airline on its page: change the amount, or tick "No implementation fee".</p>');
  const panel=wfPanel25(fcF());
  const k=h.indexOf('<details class="panel mb as22"');
  return k>=0?h.slice(0,k)+panel+h.slice(k):h+panel;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act;
  if(a==='wf25-show'){ const s=(document.getElementById('wf25-sign')||{}).value||'', g=(document.getElementById('wf25-gap')||{}).value, o=!!(document.getElementById('wf25-only')||{}).checked;
    if(!/^\d{4}-\d{2}$/.test(s)){ toast('Pick a sign month first.'); return; }
    view.wf25={sign:s,gap:g===''?2:g,only:o,on:true}; persistView(); render(); return; }
  if(a==='wf25-clear'){ view.wf25=Object.assign({},view.wf25||{},{on:false}); persistView(); render(); return; }
  if(a==='wf25-apply'&&!readOnly){ const W=wf25(); if(!W.on) return; const ids=wfIds25(fcF()), live=ymFromIndex(monthIndex(W.sign)+W.gap); let n=0;
    state.airlines.forEach(x=>{ if(x&&ids.has(x.id)){ x.cohort=''; x.signMonth=W.sign; x.goLiveMonth=live; x.include=true; n++; } });
    view.wf25=Object.assign({},view.wf25,{on:false}); persistView(); commit();
    toast(n+' airlines now sign in '+ymLabel(W.sign)+' and go live in '+ymLabel(live)+'. Click Save to keep it.'); }
});

/* ---------- 5) COUNTRY page: revenue, its share of company costs, and profit by year ---------- */
function ctyCost25(name){
  const Mc=modelFor(curScen()), SM=subsetModel(a=>a.country===name);
  const yc=aggregate(Mc.months,byYear), ys=aggregate(SM.months,byYear);
  const rows=ys.map((g,i)=>{ const c=yc[i]||{revenue:0,costs:0}; const sh=c.revenue>0?g.revenue/c.revenue:0; const cost=num(c.costs)*sh; return {key:g.key,rev:g.revenue,sh,cost,net:g.revenue-cost,arr:g.liveARR}; });
  const cell=v=>'<td class="n'+(v<0?' neg25':'')+'">'+$(v)+'</td>';
  return '<div class="panel flush mb"><div class="panel-head pad"><h3>'+esc(name)+': revenue, costs and profit by year</h3><span class="muted small">Costs are this country’s share of all company costs, salaries and hires, in proportion to its revenue. Assumes every listed airline here signs on its dates.</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+rows.map(r=>'<th class="n">'+r.key+'</th>').join('')+'</tr></thead><tbody>'+
    '<tr class="strong"><td>Revenue</td>'+rows.map(r=>cell(r.rev)).join('')+'</tr>'+
    '<tr><td>Share of company revenue</td>'+rows.map(r=>'<td class="n">'+pct(r.sh*100)+'</td>').join('')+'</tr>'+
    '<tr><td>Share of costs</td>'+rows.map(r=>cell(-r.cost)).join('')+'</tr>'+
    '<tr class="total"><td>Profit</td>'+rows.map(r=>cell(r.net)).join('')+'</tr>'+
    '<tr><td>ARR at year end</td>'+rows.map(r=>cell(r.arr)).join('')+'</tr>'+
    '</tbody></table></div></div>';
}
const cdBase25=countryDetail;
countryDetail=function(name){
  const h=cdBase25(name), panel=allIn16(()=>ctyCost25(name));
  const k=h.indexOf('<div class="panel mb"><div class="panel-head"><h3>Airlines</h3>');
  return k>=0?h.slice(0,k)+panel+h.slice(k):h+panel;
};

/* ---------- 6) AIRLINE page: fleet growth plan + no-fee switch ---------- */
const adBase25=airlineDetail;
airlineDetail=function(id){
  const h=adBase25(id), i=state.airlines.findIndex(a=>a&&a.id===id); if(i<0) return h;
  const a=state.airlines[i], p='airlines.'+i, P=Array.isArray(a.fleetPlan)?a.fleetPlan:[];
  let panel='<div class="panel mb fp25"><div class="panel-head"><h3>Fleet growth plan</h3><span class="muted small">If you know this airline will grow, add the year and its fleet from then on. The forecast uses it from that year’s contract renewal.</span></div>';
  panel+=P.length?'<div class="tbl-wrap"><table><thead><tr><th>From year</th><th class="n">Fleet</th><th></th></tr></thead><tbody>'+P.map((x,j)=>'<tr><td>'+inp(p+'.fleetPlan.'+j+'.year',{num:1,w:'w-s',ph:'2028',label:'Year'})+'</td><td>'+inp(p+'.fleetPlan.'+j+'.fleet',{num:1,w:'w-xs',ph:String(num(a.fleet)),label:'Fleet'})+'</td><td>'+(readOnly?'':'<button class="btn small" data-act="fp25-del" data-i="'+i+'" data-j="'+j+'" aria-label="Remove">✕</button>')+'</td></tr>').join('')+'</tbody></table></div>':'<p class="muted small">No growth planned. Today’s fleet: '+num(a.fleet)+' aircraft'+(num(a.growth)?' (+'+num(a.growth)+' per year)':'')+'.</p>';
  if(!readOnly) panel+='<div class="toolbar mt"><button class="btn small" data-act="fp25-add" data-i="'+i+'">Add a fleet change</button></div>';
  panel+='<div class="fields mt">'+fld('Implementation fee','<label class="small"><input type="checkbox" '+(a.noImpl?'checked ':'')+(readOnly?'disabled ':'')+'data-act="noimpl25" data-i="'+i+'"> No implementation fee for this airline</label>','Leave unticked to charge it at signing (amount above)')+'</div>';
  panel+='</div>';
  const k=h.indexOf('<div class="panel"><h3>Timing</h3>');
  return k>=0?h.slice(0,k)+panel+h.slice(k):h+panel;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||readOnly) return; const a=b.dataset.act;
  if(a==='fp25-add'){ const x=state.airlines[+b.dataset.i]; if(!x) return; const P=Array.isArray(x.fleetPlan)?x.fleetPlan:[]; const lastY=P.length?num(P[P.length-1].year)+1:num(asOfYm().slice(0,4))+2; x.fleetPlan=P.concat([{year:lastY,fleet:num(x.fleet)}]); commit(); }
  if(a==='fp25-del'){ const x=state.airlines[+b.dataset.i]; if(!x||!Array.isArray(x.fleetPlan)) return; x.fleetPlan.splice(+b.dataset.j,1); commit(); }
});
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act!=='noimpl25'||readOnly) return;
  const x=state.airlines[+el.dataset.i]; if(!x) return; if(el.checked) x.noImpl=true; else delete x.noImpl; commit();
});

/* ---------- 7) COSTS & TEAM and SETTINGS: merged pages ---------- */
const costsBase25=costs, teamBase25=teamView, fundBase25=fundingView, settingsBase25=settings, pricingBase25=pricing;
costs=function(M){
  return '<div class="sec-head"><div><div class="eyebrow">Costs & team</div><h2>What STRATOS spends</h2><p>Company costs, founder pay, hires and funding in one place. Every forecast and country page uses these numbers.</p></div></div>'+
    sec25('costs','Costs','Tools, hosting, services',costsBase25(M),true)+
    sec25('team','Founders, salaries and hires','',teamBase25(M),true)+
    sec25('funding','Funding','Investment and loans',fundBase25(M),false);
};
settings=function(M){
  let pr=pricingBase25(M);
  const k=pr.lastIndexOf('<div class="panel mb"><h3>Implementation fees you expect to collect</h3>');
  if(k>=0) pr=pr.slice(0,k);
  return '<div class="sec-head"><div><div class="eyebrow">Settings</div><h2>Prices and settings</h2><p>Product prices and implementation fees first; everything else below. Implementation fees can also be changed or switched off per airline on its page.</p></div></div>'+
    sec25('pricing','Prices and implementation fees','',pr,true)+
    sec25('settings','More settings','Regions, currencies, dates, sharing and data',settingsBase25(M),false);
};
