/* ===== v45: costs split into FIXED costs (paid whatever the number of airlines) and PER-AIRLINE costs (grow with each
   airline), with a subtotal for each, the total, and what each live airline costs — in the Forecast table and in a new
   "What one airline costs you" panel on Costs & team. Numbers are unchanged; only how they are grouped. ===== */
(function(){
  try{ if(document.getElementById('v45-css')) return; const st=document.createElement('style'); st.id='v45-css';
    st.textContent=['table.t32 tr.grp45 td:first-child{font-weight:700}','table.t32 tr.rate45 td{font-style:italic}',
      '.ac45 table{width:100%}','.ac45 td,.ac45 th{white-space:nowrap}','.ac45 .note{font-size:12.5px;color:var(--muted);margin:6px 0 0}',
      '.ac45 .two{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}'].join(' ');
    document.head.appendChild(st); }catch(e){}
})();
/* which cost lines grow with airlines */
const VARB45=new Set(['perAirline','perAircraft','perPilot','perSeat','perNewAirline','pctRevenue']);
const VARFEE45=new Set(['pctCollected','pctRevenue','perPayment','perNewAirline']);
function isVarRow45(id){
  if(id==='x36fc') return true;
  if(id.indexOf('ci:')===0){ const c=(state.costs||[]).find(x=>'ci:'+x.id===id); return !!c&&VARB45.has(c.basis||'fixed'); }
  if(id.indexOf('fi:')===0){ const f=(state.fees||[]).find(x=>'fi:'+x.id===id); return !!f&&VARFEE45.has(f.basis); }
  return false;
}
const BASIS45={perAirline:'per live airline',perAircraft:'per live aircraft',perPilot:'per live pilot',perSeat:'per live user seat',perNewAirline:'per new airline (once)',pctRevenue:'% of revenue'};
const f32RowsBase45=f32Rows;
f32Rows=function(M,I){
  const R=f32RowsBase45(M,I);
  const cost=R.filter(r=>r.sec==='cost'&&r.id!=='costs'), tot=R.find(r=>r.sec==='cost'&&r.id==='costs');
  if(!cost.length||!tot) return R;
  const V=cost.filter(r=>isVarRow45(r.id)), F=cost.filter(r=>!isVarRow45(r.id));
  const sumOf=L=>m=>L.reduce((t,r)=>t+num(r.f(m)),0);
  const row=(id,label,f,o)=>Object.assign({sec:'cost',id,label,f,kind:'flow'},o||{});
  const fixT=row('k45f','Fixed costs: total (paid whatever the number of airlines)',sumOf(F),{cls:'key grp45',keep:1});
  const varT=row('k45v','Per-airline costs: total (grow with each airline)',sumOf(V),{cls:'key grp45',keep:1});
  const live=m=>num(m.live);
  const rate=[
    row('k45a','Per-airline costs for each live airline',m=>live(m)?sumOf(V)(m)/live(m):0,{kind:'stock',cls:'sub rate45',keep:1}),
    row('k45b','All-in cost for each live airline (incl. its share of fixed costs)',m=>live(m)?num(m.costs)/live(m):0,{kind:'stock',cls:'sub rate45',keep:1})
  ];
  const out=[]; let done=false;
  R.forEach(r=>{
    if(r.sec==='cost'&&r.id!=='costs') return;
    if(r.sec==='cost'&&r.id==='costs'&&!done){ done=true; out.push(...F,fixT,...V,varT,Object.assign({},r,{label:'Total costs (fixed + per-airline)'}),...rate); return; }
    out.push(r);
  });
  return out;
};
/* Year column of the two "each live airline" rows: cost for the year ÷ average airlines live in the year */
const f32TableBase45=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase45(M,Y,canEdit,partial);
  try{
    const I=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===String(Y)) I.push(i); }); if(!I.length) return h;
    const rows=f32Rows(M,I), V=rows.find(r=>r.id==='k45v');
    let v=0,c=0,l=0; I.forEach(i=>{ const m=M.months[i]; v+=num(V?V.f(m):0); c+=num(m.costs); l+=num(m.live); });
    const avg=l/I.length;
    const put=(label,val)=>{ const a=h.indexOf('<td>'+label+'</td>'); if(a<0) return; const e=h.indexOf('</tr>',a); const s0=h.lastIndexOf('<td class="n tot',e); if(e<0||s0<a) return; h=h.slice(0,s0)+'<td class="n tot" title="For the whole year, per average live airline">'+(avg>0?$(val/avg):'–')+'</td>'+h.slice(e); };
    put('Per-airline costs for each live airline',v);
    put('All-in cost for each live airline (incl. its share of fixed costs)',c);
  }catch(e){}
  return h;
};
/* Costs & team: what one airline costs you */
function airlineCost45(Mx){
  const M=(Mx&&Mx.months)?Mx:modelFor(curScen());
  const per={}; M.months.forEach(m=>{ const y=m.ym.slice(0,4); const o=per[y]||(per[y]={live:0,n:0,var:0,fix:0,rev:0,cost:0}); o.n++; o.live+=num(m.live); o.rev+=num(m.revenue); o.cost+=num(m.costs);
    let v=num(m.fimpl); (state.costs||[]).forEach(c=>{ if(VARB45.has(c.basis||'fixed')) v+=num((m.costItems||{})[c.id]); }); (state.fees||[]).forEach(f=>{ if(VARFEE45.has(f.basis)) v+=num((m.feeItems||{})[f.id]); });
    o.var+=v; o.fix+=num(m.costs)-v; });
  const yrs=Object.keys(per).sort();
  const cell=v=>'<td class="n'+(v<-0.5?' neg':'')+'">'+(isFinite(v)&&Math.abs(v)>=0.5?$(v):'–')+'</td>';
  const avgL=y=>per[y].live/per[y].n;
  const tr=(l,f,cls)=>'<tr'+(cls?' class="'+cls+'"':'')+'><td>'+l+'</td>'+yrs.map(y=>cell(f(per[y],avgL(y)))).join('')+'</tr>';
  let t='<div class="tbl-wrap"><table class="fin"><thead><tr><th>Each year</th>'+yrs.map(y=>'<th class="n">'+y+'</th>').join('')+'</tr></thead><tbody>'+
    '<tr><td>Airlines live (average over the year)</td>'+yrs.map(y=>'<td class="n">'+(avgL(y)?avgL(y).toFixed(1):'–')+'</td>').join('')+'</tr>'+
    tr('Fixed costs',o=>o.fix)+tr('Per-airline costs',o=>o.var)+tr('Total costs',o=>o.cost,'strong')+
    tr('Per-airline costs for one airline',(o,a)=>a?o.var/a:NaN,'total')+tr('Its share of fixed costs',(o,a)=>a?o.fix/a:NaN)+tr('All-in cost of one airline',(o,a)=>a?o.cost/a:NaN,'strong')+
    tr('Revenue from one airline',(o,a)=>a?o.rev/a:NaN)+tr('Profit from one airline',(o,a)=>a?(o.rev-o.cost)/a:NaN,'total')+
    '</tbody></table></div><p class="note">Per year, divided by the average number of airlines live that year. Per-airline costs grow with each airline; fixed costs are shared out over however many airlines are live.</p>';
  /* the cost lines that come with one airline */
  let ref=null; for(let i=M.months.length-1;i>=0;i--){ if(num(M.months[i].live)>0){ ref=M.months[i]; break; } }
  const L=(state.costs||[]).filter(c=>VARB45.has(c.basis||'fixed'));
  const FL=(state.fees||[]).filter(f=>VARFEE45.has(f.basis));
  const fs=(typeof fShare36==='function')?fShare36(state).total:0;
  let u='';
  if(ref&&(L.length||FL.length||fs>0)){
    const lv=num(ref.live), d={live:1,liveFleet:num(ref.liveFleet)/lv,livePilots:num(ref.livePilots)/lv,liveSeats:num(ref.liveSeats)/lv,revenue:num(ref.recurring)/lv,newSigned:1};
    const rows=L.map(c=>{ const v=costMonthlyUSD(state,c,d), once=c.basis==='perNewAirline'; return {name:c.name||'Cost',basis:BASIS45[c.basis]||c.basis,mo:once?0:v,once:once?v:0}; });
    /* fees that grow with airlines: their average in the plan, per live airline each month (or per airline signed) */
    let lm=0, sg=0; M.months.forEach(m=>{ lm+=num(m.live); sg+=num(m.newSigned); });
    FL.forEach(f=>{ let t=0; M.months.forEach(m=>{ t+=num((m.feeItems||{})[f.id]); }); const once=f.basis==='perNewAirline';
      rows.push({name:f.name||'Fee',basis:(FEE_BASES[f.basis]||f.basis)+' (plan average)',mo:once?0:(lm?t/lm:0),once:once?(sg?t/sg:0):0}); });
    if(fs>0) rows.push({name:'Founders’ share of the implementation fee',basis:'per new airline (once)',mo:0,once:fs});
    const sm=rows.reduce((t,r)=>t+r.mo,0), so=rows.reduce((t,r)=>t+r.once,0);
    u='<div class="tbl-wrap"><table class="fin"><thead><tr><th>Cost line</th><th>How it is charged</th><th class="n">Per month</th><th class="n">Once, at signing</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td class="muted">'+esc(r.basis)+'</td><td class="n">'+(r.mo?$(r.mo):'–')+'</td><td class="n">'+(r.once?$(r.once):'–')+'</td></tr>').join('')+
      '<tr class="total"><td>One airline</td><td></td><td class="n">'+$(sm)+'</td><td class="n">'+(so?$(so):'–')+'</td></tr>'+
      '<tr><td>One airline for a year</td><td></td><td class="n">'+$(sm*12)+'</td><td class="n">'+(so?'+ '+$(so)+' once':'')+'</td></tr></tbody></table></div>'+
      '<p class="note">Worked out for an average live airline in your plan ('+d.liveFleet.toFixed(0)+' aircraft, '+Math.round(d.livePilots)+' pilots). Change these lines in Costs below.</p>';
  } else u='<p class="muted">No per-airline cost lines yet. Add a cost in Costs below and set it to "per live airline", "per aircraft", "per pilot" or "per new airline".</p>';
  return '<div class="panel mb ac45"><div class="panel-head"><h3>What one airline costs you</h3><span class="muted small">Fixed costs vs costs that come with each airline</span></div><div class="two"><div><h4 style="margin:4px 0 8px">Costs that come with one airline</h4>'+u+'</div><div><h4 style="margin:4px 0 8px">Fixed and per-airline costs, per airline</h4>'+t+'</div></div></div>';
}
const costsBase45=costs;
costs=function(M){
  const h=costsBase45(M); let p=''; try{ p=airlineCost45(M); }catch(e){ p=''; }
  const k=h.indexOf('<details class="sec25"');
  return k>=0?h.slice(0,k)+p+h.slice(k):p+h;
};
