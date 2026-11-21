/* ===== v10: Overview = real money only; all forecast content lives on the Forecast tab ===== */
function overview(M){
  const today=todayISO(), S=state.settings, I=state.invoices||[];
  const act=M.months.filter(m=>m.actual), collected=act.reduce((a,m)=>a+m.act.collected,0), spent=act.reduce((a,m)=>a+m.act.spent,0);
  const cash=num(S.openingCash)+collected-spent;
  const issued=I.filter(v=>v.issue&&v.issue<=today), invoiced=issued.reduce((a,v)=>a+ivU(v),0), unpaid=issued.filter(v=>!v.paidDate), unpaidV=unpaid.reduce((a,v)=>a+ivU(v),0);
  const A=state.airlines.filter(a=>a.include!==false), arrOf=a=>airlineEcon(state,a,0).arr;
  const stOf=a=>a.status||'Pipeline', live=A.filter(a=>stOf(a)==='Live'), signed=A.filter(a=>stOf(a)==='Signed'), open=A.filter(a=>OPEN_ST.includes(stOf(a)));
  const liveARR=live.reduce((t,a)=>t+arrOf(a),0), signedARR=signed.reduce((t,a)=>t+arrOf(a),0), openARR=open.reduce((t,a)=>t+arrOf(a),0), openW=open.reduce((t,a)=>t+arrOf(a)*num(a.prob)/100,0);
  const nothing=!act.length&&!issued.length&&!live.length&&!signed.length;
  let h='<div class="sec-head"><div><div class="eyebrow">Overview</div><h2>Where STRATOS stands today</h2><p>Only what has actually happened: money received and spent, invoices sent and airlines won. Projections are on the Forecast tab.</p></div><div class="toolbar"><button class="btn cta-outline" data-act="tab" data-v="forecast">Open the forecast</button></div></div>';
  if(nothing) h+='<div class="banner"><span class="grow"><b>Nothing recorded yet, so everything starts at zero.</b> Record payments on the Invoices tab, monthly spending on the Actuals tab, and move an airline to Signed or Live on the Pipeline tab when it happens.</span><button class="btn small" data-act="tab" data-v="actuals">Actuals</button><button class="btn small" data-act="tab" data-v="invoices">Invoices</button></div>';
  h+='<div class="kpis">'+
    kpi('Cash in the bank',$(cash),(num(S.openingCash)?'Opening '+$k(num(S.openingCash))+' + collected − spent':'Collected − spent'),'lead')+
    kpi('Money collected',$(collected),act.length?act.length+' month'+(act.length===1?'':'s')+' recorded':'Nothing received yet','sky')+
    kpi('Money spent',$(spent),act.length?'From the Actuals tab':'Nothing recorded yet')+
    kpi('Invoiced',$(invoiced),unpaid.length?$(unpaidV)+' still unpaid':issued.length?'All paid':'No invoices sent')+
    kpi('Live ARR',$(liveARR),live.length+' airline'+(live.length===1?'':'s')+' live')+
    kpi('Signed, not live yet',$(signedARR),signed.length+' contract'+(signed.length===1?'':'s'))+
  '</div>';
  const AL=alertList(M).filter(x=>x.go!=='funding');
  h+=AL.length?'<div class="panel mb alerts"><div class="panel-head"><h3>Needs attention</h3><span class="muted small">'+AL.length+' item'+(AL.length===1?'':'s')+'</span></div><ul class="alist">'+AL.map(x=>'<li><span class="adot '+x.lv+'"></span><div class="atext"><b>'+esc(x.t)+'</b><span class="muted small">'+x.d+'</span></div><button class="btn small" data-act="tab" data-v="'+x.go+'">'+esc(x.btn)+'</button></li>').join('')+'</ul></div>':'<div class="panel mb alerts ok"><span class="adot good"></span><div><b>Nothing needs attention.</b> <span class="muted">No overdue invoices, late deals or missed follow-ups.</span></div></div>';
  const st=['Pipeline','Contacted','Demo','Negotiating','Signed','Live','Lost'], cnt=s=>state.airlines.filter(a=>stOf(a)===s&&(s==='Lost'||a.include!==false)).length, arrS=s=>state.airlines.filter(a=>stOf(a)===s&&a.include!==false).reduce((t,a)=>t+arrOf(a),0);
  h+='<div class="grid2 mb"><div class="panel"><div class="panel-head"><h3>Pipeline today</h3><button class="btn small" data-act="tab" data-v="pipeline">Open pipeline</button></div><div class="tbl-wrap"><table><thead><tr><th>Stage</th><th class="n">Airlines</th><th class="n">ARR if won</th></tr></thead><tbody>'+
    st.map(s=>'<tr><td><span class="chip st-'+s+'">'+s+'</span></td><td class="n">'+cnt(s)+'</td><td class="n">'+(s==='Lost'?'–':$(arrS(s)))+'</td></tr>').join('')+
    '<tr class="total"><td>Open deals</td><td class="n">'+open.length+'</td><td class="n">'+$(openARR)+'</td></tr></tbody></table></div><p class="hint">Open deals are worth '+$(openW)+' a year weighted by close probability. That is potential, not money in.</p></div>';
  const fu=followUps();
  h+='<div>'+(fu||'<div class="panel"><h3>Follow-ups</h3><p class="muted">No follow-ups due in the next 14 days. Add a next action and date on any airline.</p></div>')+'</div></div>';
  const recent=I.filter(v=>v.paidDate||(v.issue&&v.issue<=today)).sort((a,b)=>(b.paidDate||b.issue||'').localeCompare(a.paidDate||a.issue||'')).slice(0,6), nameOf=id=>{const a=state.airlines.find(x=>x.id===id);return a?a.name:'—';};
  h+='<div class="grid2"><div class="panel"><div class="panel-head"><h3>Latest money in</h3><button class="btn small" data-act="tab" data-v="invoices">Invoices</button></div>'+(recent.length?'<ul class="list-plain">'+recent.map(v=>li(esc(nameOf(v.airline))+' · '+esc(v.number||'')+' · '+(v.paidDate?'paid '+fmtDate(v.paidDate):'sent '+fmtDate(v.issue)),$(v.paidDate?ivPaidU(v):ivU(v)))).join('')+'</ul>':'<p class="muted">No invoices sent or paid yet.</p>')+'</div>';
  h+='<div class="panel"><div class="panel-head"><h3>Spending by month</h3><button class="btn small" data-act="tab" data-v="actuals">Actuals</button></div>'+(act.length?'<ul class="list-plain">'+act.slice(-6).reverse().map(m=>li(ymLabel(m.ym),'in '+$(m.act.collected)+' · out '+$(m.act.spent))).join('')+'</ul>':'<p class="muted">No months recorded yet. On the Actuals tab, type what you really spent and received each month.</p>')+'</div></div>';
  return h;
}
const forecastBase=forecast;
forecast=function(M){
  let h=forecastBase(M);
  const years=aggregate(M.months,byYear), Y=years.find(g=>g.key===view.year)||years.find(g=>g.key==='2027')||years[0];
  const exit=M.months.filter(m=>m.ym.startsWith(Y.key)).pop();
  const fullARR=M.airlines.reduce((a,x)=>a+x.e.arr*x.w,0), count=M.airlines.reduce((a,x)=>a+x.w,0), avgARR=count?fullARR/count:0, annualCosts=Y.costs/Y.months*12;
  const byRegion={},byProduct={}; M.airlines.forEach(x=>{byRegion[x.region]=(byRegion[x.region]||0)+x.e.arr*x.w;byProduct[x.e.product.id]=(byProduct[x.e.product.id]||0)+x.e.arr*x.w;});
  const top=M.airlines.slice().sort((a,b)=>b.e.arr*b.w-a.e.arr*a.w).slice(0,6);
  const firstLive=M.months.find(m=>m.recurring>0), be=M.months.find(m=>m.recurring>0&&m.recurring>=m.costs);
  const cashAlerts=alertList(M).filter(x=>x.go==='funding');
  let x='';
  if(view.scenario==='weighted') x+='<div class="banner"><span class="grow"><b>Weighted view.</b> Each airline’s revenue is multiplied by its close probability.</span></div>';
  if(cashAlerts.length) x+='<div class="panel mb alerts"><div class="panel-head"><h3>Forecast warnings</h3></div><ul class="alist">'+cashAlerts.map(a=>'<li><span class="adot '+a.lv+'"></span><div class="atext"><b>'+esc(a.t)+'</b><span class="muted small">'+a.d+'</span></div><button class="btn small" data-act="tab" data-v="funding">Funding</button></li>').join('')+'</ul></div>';
  x+='<div class="kpis">'+runwayKpis(M).replace('<div class="eyebrow">Cash today</div>','<div class="eyebrow">Plan cash this month</div>')+'</div>';
  x+='<div class="panel mb"><div class="panel-head"><h3>Monthly revenue by product</h3><span class="muted small">Licenses spread monthly from go-live · implementation in the signing month</span></div>'+revenueChart(M.months)+
    '<div class="legend">'+state.products.map(p=>'<span><i class="sw" style="background:'+cv(p.color)+'"></i>'+esc(p.short)+' licenses</span>').join('')+'<span><i class="sw imp-sw"></i>Implementation fees</span><span><i class="sw line" style="background:var(--coral)"></i>Total costs</span></div></div>';
  x+='<div class="grid3 mb"><div class="panel"><div class="panel-head"><h3>Expected ARR by region</h3>'+goto('regions','Edit regions')+'</div>'+Object.entries(byRegion).sort((a,b)=>b[1]-a[1]).map(([r,v])=>hbar(r,v,fullARR,regionColor(r))).join('')+'<div class="hint">Full book '+$(fullARR)+' across '+fmtCount(count)+' airlines.</div></div>';
  x+='<div class="panel"><h3>Expected ARR by product</h3>'+state.products.filter(p=>byProduct[p.id]).map(p=>hbar(p.short,byProduct[p.id],fullARR,cv(p.color))).join('')+(Object.keys(byProduct).length?'':'<p class="muted">No airlines in plan.</p>')+'</div>';
  x+='<div class="panel"><h3>Largest expected accounts</h3>'+top.map(t=>hbar(t.a.name,t.e.arr*t.w,fullARR,regionColor(t.region))).join('')+'<div class="hint">'+(top[0]?esc(top[0].a.name)+' would be '+pct(top[0].e.arr*top[0].w/fullARR*100)+' of ARR.':'')+'</div></div></div>';
  x+='<div class="grid2 mb"><div class="panel"><h3>Expected cash balance</h3>'+cashChart(M.months)+'<div class="hint">Plan from opening cash '+$(state.settings.openingCash)+', with any months you recorded on the Actuals tab. Includes funding, withholding tax and payment delays.</div></div>';
  x+='<div class="panel"><div class="panel-head"><h3>Expected milestones</h3><div class="seg light" role="group" aria-label="Year">'+years.map(g=>'<button data-act="year" data-v="'+g.key+'" aria-pressed="'+(g.key===Y.key)+'">'+g.key+'</button>').join('')+'</div></div><ul class="list-plain">'+
    li('First recurring revenue',firstLive?ymLabel(firstLive.ym):'Not in horizon')+
    li('Licenses cover monthly costs',be?ymLabel(be.ym):'Not in horizon')+
    M.stepLog.map(s=>li('Salary to '+$(s.salary)+'/mo each',ymLabel(s.ym))).join('')+
    li('Airlines needed to cover '+Y.key+' costs',avgARR?(annualCosts/avgARR).toFixed(1)+' at '+$k(avgARR)+' avg ARR':'–')+
    li('ARR at end of '+Y.key,$(exit.liveARR)+' · '+fmtCount(exit.live)+' airlines')+
    li('Monthly costs at end of '+Y.key,$(exit.costs))+
    li('Founder salary each, end of '+Y.key,$(exit.salaryEach)+'/mo')+'</ul></div></div>';
  const mark='<div class="panel mb"><div class="panel-head"><h3>Revenue, costs and net profit</h3>';
  const i=h.indexOf(mark);
  return i>=0?h.slice(0,i)+x+h.slice(i):h+x;
};
/* ---------- Countries tab: add regions, countries and airlines in place ---------- */
countriesView=function(M){
  const can=!readOnly&&!cfgLocked;
  const totalARR=state.airlines.filter(a=>a.include!==false&&a.status!=='Lost').reduce((s,a)=>s+airlineEcon(state,a,0).arr,0);
  let h='<div class="sec-head"><div><div class="eyebrow">Countries</div><h2>Every country at a glance</h2><p>Add a region, add countries inside it, then open a country to add its airlines.</p></div><div class="toolbar">'+(can?'<input id="newr" class="in w-l" placeholder="New region name" aria-label="New region name"><button class="btn cta-outline" data-act="add-region-named">Add region</button>':'')+goto('regions','Manage in Settings')+'</div></div>';
  const regs=state.regions.map((r,ri)=>({ri,name:r.name,color:cv(r.color),countries:r.countries.map(c=>c.name)}));
  const known=new Set(regs.flatMap(r=>r.countries)), extra=Array.from(new Set(state.airlines.map(a=>a.country).filter(c=>c&&!known.has(c))));
  if(extra.length) regs.push({ri:-1,name:'Unassigned',color:'var(--c-grey)',countries:extra});
  regs.forEach(r=>{
    h+='<section class="mb"><div class="rtitle" style="--rc:'+r.color+'"><span>'+esc(r.name)+'</span><span class="muted small">'+r.countries.length+' countr'+(r.countries.length===1?'y':'ies')+'</span>'+(can&&r.ri>=0?'<span class="toolbar" style="margin-left:auto"><input id="newc-'+r.ri+'" class="in w-m" placeholder="New country" aria-label="New country in '+esc(r.name)+'"><button class="btn small" data-act="add-country" data-r="'+r.ri+'">Add country</button></span>':'')+'</div>';
    if(!r.countries.length) h+='<p class="muted small">No countries yet. Type a name above and click Add country.</p>';
    else{ h+='<div class="ccards">';
      r.countries.forEach(c=>{const {t}=countryStats(c), cty=countryOf(state,c), adj=cty?num(cty.priceAdj):0;
        h+='<button class="ccard" data-act="open-country" data-v="'+esc(c)+'" style="--rc:'+r.color+'"><span class="cname">'+esc(c)+(adj?'<span class="chip adj">'+(adj>0?'+':'')+adj+'% price</span>':'')+'</span><span class="cval">'+$(t.arr)+'</span><span class="csub">'+t.n+' airline'+(t.n===1?'':'s')+' · '+t.fleet+' aircraft · '+t.pilots+' pilots</span><span class="track"><span class="fill" style="width:'+(totalARR?Math.max(t.arr?1:0,t.arr/totalARR*100):0)+'%;background:'+r.color+'"></span></span><span class="csub">'+(t.listed?pct(totalARR?t.arr/totalARR*100:0)+' of ARR · weighted '+$k(t.w):'Open to add airlines →')+'</span></button>';});
      h+='</div>'; }
    h+='</section>';
  });
  return h;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="add-region-named"]'); if(!b||readOnly||cfgLocked) return;
  const el=document.getElementById('newr'), v=el&&el.value.trim(); if(!v){ toast('Type a region name first.'); return; }
  if(state.regions.some(r=>r.name.toLowerCase()===v.toLowerCase())){ toast('That region already exists.'); return; }
  const used=new Set(state.regions.map(r=>r.color)), col=(COLORS.find(c=>!used.has(c[0]))||COLORS[0])[0];
  state.regions.push({id:uid('r'),name:v,color:col,countries:[]}); commit(); toast('Region '+v+' added. Now add its countries.');
});
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target&&e.target.id==='newr'){ const b=document.querySelector('[data-act="add-region-named"]'); if(b) b.click(); } });
