/* ===== v27: Overview = signed airlines + pipeline (no forecast) · Countries live inside Pipeline ·
   new "Actuals" tab: signed/live airlines with what was really invoiced and paid, invoices, monthly actuals ===== */
TABS.length=0;
[['overview','Overview'],['pipeline','Pipeline'],['forecast','Forecast'],['actuals','Actuals'],['costs','Costs & team'],['settings','Settings']].forEach(t=>TABS.push(t));
delete TABMAP25.actuals; TABMAP25.invoices='actuals'; TABMAP25.countries='pipeline';
norm25();
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="tab"]'); if(b&&b.dataset.v==='pipeline'){ view.country=null; view.airline=null; }
},true);

/* Pipeline: a country opened from the region boxes shows its full page (airlines, revenue, costs) */
const pipelineBase27=pipeline;
pipeline=function(M){
  if(view.country) return countryDetail(view.country).replace('← All countries','← Pipeline');
  return pipelineBase27(M);
};

const invOf27=id=>{ const today=todayISO(); const I=(state.invoices||[]).filter(v=>v&&v.airline===id&&v.issue&&v.issue<=today);
  return {n:I.length,inv:I.reduce((t,v)=>t+ivU(v),0),paid:I.filter(v=>v.paidDate).reduce((t,v)=>t+ivPaidU(v),0)}; };
const won27=()=>state.airlines.filter(a=>a&&(a.status==='Signed'||a.status==='Live'));

/* ---------- OVERVIEW: what is real today ---------- */
overview=function(){
  const W=won27(), open=state.airlines.filter(a=>a&&a.status!=='Signed'&&a.status!=='Live'&&a.status!=='Lost');
  const E=a=>airlineEcon(state,a,0);
  const wArr=W.reduce((t,a)=>t+E(a).arr,0), wImpl=W.reduce((t,a)=>t+E(a).impl,0);
  const oArr=open.reduce((t,a)=>t+E(a).arr,0);
  const iv=W.map(a=>invOf27(a.id)), invT=iv.reduce((t,x)=>t+x.inv,0), paidT=iv.reduce((t,x)=>t+x.paid,0);
  let h='<div class="sec-head"><div><div class="eyebrow">Overview</div><h2>Where STRATOS stands today</h2><p>Signed airlines and the pipeline only. To see projections, open the Forecast.</p></div><div class="toolbar"><button class="btn cta-outline" data-act="tab" data-v="pipeline">Open the pipeline</button><button class="btn" data-act="tab" data-v="forecast">Open the forecast</button></div></div>';
  h+='<div class="kpis">'+
    kpi('Signed and live airlines',String(W.length),W.filter(a=>a.status==='Live').length+' live · '+W.filter(a=>a.status==='Signed').length+' signed','lead')+
    kpi('Their yearly licence value',$(wArr),'ARR, year 1')+
    kpi('Their implementation fees',$(wImpl),'One-time','sky')+
    kpi('Invoiced so far',$(invT),'Paid '+$(paidT)+' · open '+$(invT-paidT))+
    kpi('Open pipeline',String(open.length)+' airlines',$(oArr)+' ARR if all are won')+
  '</div>';
  /* signed & live airlines */
  h+='<div class="panel flush mb"><div class="panel-head pad"><h3>Signed and live airlines</h3><span class="muted small">Click an airline to open it</span></div>';
  if(!W.length) h+='<p class="muted pad">No airlines signed yet. Mark an airline as Signed or Live on the Pipeline tab.</p>';
  else h+='<div class="tbl-wrap inner"><table class="fin clickable"><thead><tr><th>Airline</th><th>Country</th><th>Status</th><th class="n">Fleet</th><th>Signed</th><th>Go-live</th><th class="n">ARR</th><th class="n">Impl. fee</th><th class="n">Invoiced</th><th class="n">Paid</th></tr></thead><tbody>'+
    W.map((a,i)=>{ const e=E(a), tm=timingOf(state,a), x=iv[i]; return '<tr data-act="open-airline" data-v="'+esc(a.id)+'" tabindex="0"><td><b>'+esc(a.name)+'</b></td><td>'+esc(a.country||'')+'</td><td><span class="chip st-'+esc(a.status)+'">'+esc(a.status)+'</span></td><td class="n">'+num(a.fleet)+'</td><td>'+ymLabel(tm.sign)+'</td><td>'+ymLabel(tm.live)+'</td><td class="n"><b>'+$(e.arr)+'</b></td><td class="n">'+$(e.impl)+'</td><td class="n">'+$(x.inv)+'</td><td class="n">'+$(x.paid)+'</td></tr>'; }).join('')+
    '<tr class="total"><td>Total</td><td></td><td></td><td class="n">'+W.reduce((t,a)=>t+num(a.fleet),0)+'</td><td></td><td></td><td class="n">'+$(wArr)+'</td><td class="n">'+$(wImpl)+'</td><td class="n">'+$(invT)+'</td><td class="n">'+$(paidT)+'</td></tr></tbody></table></div>';
  h+='</div>';
  /* pipeline by stage and by region */
  const order=['Negotiating','Demo','Contacted','Pipeline'];
  const st={}; open.forEach(a=>{ const k=a.status||'Pipeline'; const o=st[k]||(st[k]={n:0,arr:0,fleet:0}); o.n++; o.arr+=E(a).arr; o.fleet+=num(a.fleet); });
  const keys=Object.keys(st).sort((x,y)=>(order.indexOf(x)<0?99:order.indexOf(x))-(order.indexOf(y)<0?99:order.indexOf(y)));
  const rg={}; state.airlines.forEach(a=>{ if(!a||a.status==='Lost') return; const r=regionOf(state,a.country), k=r?r.name:'Unassigned'; const o=rg[k]||(rg[k]={won:0,wArr:0,open:0,oArr:0}); const won=a.status==='Signed'||a.status==='Live'; if(won){o.won++;o.wArr+=E(a).arr;} else {o.open++;o.oArr+=E(a).arr;} });
  h+='<div class="grid2 mb"><div class="panel"><h3>Pipeline by stage</h3>'+(keys.length?'<div class="tbl-wrap"><table class="fin"><thead><tr><th>Stage</th><th class="n">Airlines</th><th class="n">Fleet</th><th class="n">ARR if won</th></tr></thead><tbody>'+
      keys.map(k=>'<tr><td><span class="chip st-'+esc(k)+'">'+esc(k)+'</span></td><td class="n">'+st[k].n+'</td><td class="n">'+st[k].fleet+'</td><td class="n">'+$(st[k].arr)+'</td></tr>').join('')+'</tbody></table></div>':'<p class="muted">No open deals.</p>')+'</div>'+
    '<div class="panel"><h3>By region</h3><div class="tbl-wrap"><table class="fin"><thead><tr><th>Region</th><th class="n">Signed</th><th class="n">Signed ARR</th><th class="n">In pipeline</th><th class="n">Pipeline ARR</th></tr></thead><tbody>'+
      Object.entries(rg).sort((x,y)=>(y[1].wArr+y[1].oArr)-(x[1].wArr+x[1].oArr)).map(([k,o])=>'<tr><td>'+esc(k)+'</td><td class="n">'+o.won+'</td><td class="n">'+$(o.wArr)+'</td><td class="n">'+o.open+'</td><td class="n">'+$(o.oArr)+'</td></tr>').join('')+'</tbody></table></div></div></div>';
  return h;
};

/* ---------- ACTUALS: what really happened, per airline ---------- */
const actualsBase27=actualsView, invoicesBase27=invoicesView;
actualsView=function(M){
  const W=won27();
  let t='';
  if(!W.length) t='<p class="muted">No signed or live airlines yet.</p>';
  else t='<div class="tbl-wrap"><table class="fin clickable"><thead><tr><th>Airline</th><th>Status</th><th class="n">Invoices</th><th class="n">Invoiced</th><th class="n">Paid</th><th class="n">Still open</th><th>Last invoice</th></tr></thead><tbody>'+
    W.map(a=>{ const x=invOf27(a.id); const last=(state.invoices||[]).filter(v=>v&&v.airline===a.id&&v.issue).map(v=>v.issue).sort().pop()||''; return '<tr data-act="open-airline" data-v="'+esc(a.id)+'" tabindex="0"><td><b>'+esc(a.name)+'</b> <span class="muted small">'+esc(a.country||'')+'</span></td><td><span class="chip st-'+esc(a.status)+'">'+esc(a.status)+'</span></td><td class="n">'+x.n+'</td><td class="n">'+$(x.inv)+'</td><td class="n">'+$(x.paid)+'</td><td class="n">'+$(x.inv-x.paid)+'</td><td>'+(last?esc(last):'–')+'</td></tr>'; }).join('')+'</tbody></table></div>';
  return '<div class="sec-head"><div><div class="eyebrow">Actuals</div><h2>What really happened</h2><p>Signed and live airlines, the invoices you sent them and the money received. Add invoices below; record monthly totals in the last section if you want the cash numbers to use real figures.</p></div></div>'+
    sec25('act-airlines','Airlines','Signed and live',t,true)+
    sec25('act-invoices','Invoices','Sent and paid',invoicesBase27(M),true)+
    sec25('act-months','Monthly actuals','Money received and spent per month',actualsBase27(M),false);
};
