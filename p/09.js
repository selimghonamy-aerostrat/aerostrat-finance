/* ===== v9: founder bonuses, playground calculator, richer forecast, in-app back navigation ===== */
(function(){const st=document.createElement('style');st.textContent='.pg-strip{position:sticky;top:46px;z-index:4;background:var(--bg);padding:8px 0 2px;margin-bottom:6px}.pg-strip .kpis{margin-bottom:8px}.lever{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.lever:last-child{border-bottom:0}.lever label{font-size:13px;font-weight:600}.lever .lv{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}.lever input[type=range]{grid-column:1/-1;width:100%;accent-color:var(--c-deep)}.lever .fhint{grid-column:1/-1}details.pgsec{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);margin-bottom:12px}details.pgsec>summary{cursor:pointer;padding:14px 16px;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:12px;list-style:none}details.pgsec>summary::-webkit-details-marker{display:none}details.pgsec>summary:after{content:"+";color:var(--muted);font-size:18px;line-height:1}details.pgsec[open]>summary:after{content:"\\2212"}details.pgsec>summary>span:first-child{flex:1}details.pgsec>.pgbody{padding:0 16px 16px}.calc-res{font-size:20px;font-weight:700;margin:2px 0}.calc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}.calc-card{border:1px solid var(--line);border-radius:8px;padding:12px}.sens td.hl{outline:2px solid var(--c-deep);outline-offset:-2px;font-weight:700}.heat-a{background:color-mix(in srgb,var(--coral) 24%,transparent)}.heat-b{background:color-mix(in srgb,var(--coral) 11%,transparent)}.heat-c{background:color-mix(in srgb,var(--good) 11%,transparent)}.heat-d{background:color-mix(in srgb,var(--good) 24%,transparent)}.chips.pgch{margin-bottom:12px}td .block{display:block}@media (max-width:700px){.pg-strip{position:static}}';document.head.appendChild(st);})();

/* ---------- founder bonuses (engine add-on, runs after compute) ---------- */
const BONUS_BASES={pctProfit:'% of profit (shared pool)',pctRevenue:'% of revenue (shared pool)',pctNewArr:'% of new ARR (shared pool)',fixed:'Fixed amount each',salaryMonths:'Months of salary each'};
const BONUS_POOL=new Set(['pctProfit','pctRevenue','pctNewArr']);
SEC_LABEL.bonuses='Founder bonuses';
function newBonus(kind){
  const b={id:uid('b'),include:true,name:'Yearly profit share',freq:'annual',basis:'pctProfit',rate:10,amount:1000,currency:MAINC(),who:'',payLag:1,startMonth:'',minArr:'',needProfit:true,cashGuard:true,capEach:''};
  if(kind==='quarter') Object.assign(b,{name:'Quarterly bonus',freq:'quarterly',basis:'fixed',amount:500});
  if(kind==='salary') Object.assign(b,{name:'13th-month salary',basis:'salaryMonths',amount:1});
  return b;
}
function bonusRecipients(s,b){
  const F=s.founders||[], w=b.who||'';
  const L=w==='all'?F:w?F.filter(f=>f.name===w):F.filter(f=>f.onPayroll);
  return L.map(f=>({name:f.name||'Founder',share:num(f.share,100)}));
}
function addBonuses(s,M){
  const ms=M.months, N=ms.length; ms.forEach(m=>{m.bonus=0;m.bonusBy={};}); M.bonusLog=[];
  const B=(s.bonuses||[]).filter(b=>b.include!==false); if(!B.length||!N) return M;
  const S=s.settings, smShare=Math.max(0,Math.min(100,num(S.salesSalaryShare)))/100, start=monthIndex(ms[0].ym);
  const pre=ms.map(m=>({net:m.net,rev:m.revenue,arr:m.liveARR,each:m.salaryEach}));
  const payFees=(s.fees||[]).filter(f=>f.include!==false&&f.basis==='pctPayroll');
  const events=[];
  for(const b of B){
    const q=b.freq==='quarterly', lag=Math.max(0,Math.round(num(b.payLag,1))), from=isSet(b.startMonth)?monthIndex(b.startMonth):-Infinity, fx=fxOf(s,b.currency||'USD');
    const per={}; ms.forEach((m,i)=>{const k=q?byQuarter(m.ym):byYear(m.ym);(per[k]||(per[k]=[])).push(i);});
    for(const k in per){
      const idx=per[k], last=idx[idx.length-1], endMo=+ms[last].ym.slice(5,7);
      if(q?endMo%3!==0:endMo!==12) continue;
      if(monthIndex(ms[last].ym)<from) continue;
      const profit=idx.reduce((a,i)=>a+pre[i].net,0), rev=idx.reduce((a,i)=>a+pre[i].rev,0), arr0=idx[0]>0?pre[idx[0]-1].arr:0, newArr=pre[last].arr-arr0;
      const R=bonusRecipients(s,b); if(!R.length) continue;
      const ev={b,period:k,pay:last+lag,profit,rev,newArr,arrEnd:pre[last].arr,total:0,each:{},skip:'',capped:false,guarded:false};
      ev.ym=ev.pay<N?ms[ev.pay].ym:ymFromIndex(start+ev.pay);
      events.push(ev);
      if(isSet(b.minArr)&&num(b.minArr)>0&&pre[last].arr<num(b.minArr)*fx){ev.skip='arr';continue;}
      if(b.needProfit!==false&&profit<=0){ev.skip='profit';continue;}
      const frac=idx.length/(q?3:12), tot=R.reduce((a,r)=>a+r.share,0)||1;
      if(b.basis==='fixed') R.forEach(r=>ev.each[r.name]=num(b.amount)*fx*frac);
      else if(b.basis==='salaryMonths') R.forEach(r=>ev.each[r.name]=num(b.amount)*pre[last].each*r.share/100);
      else { const base=b.basis==='pctRevenue'?rev:b.basis==='pctNewArr'?Math.max(0,newArr):Math.max(0,profit), pool=base*num(b.rate)/100; R.forEach(r=>ev.each[r.name]=pool*r.share/tot); }
      if(isSet(b.capEach)&&num(b.capEach)>0){ const cap=num(b.capEach)*fx; for(const n in ev.each) if(ev.each[n]>cap){ev.each[n]=cap;ev.capped=true;} }
      ev.total=Object.values(ev.each).reduce((a,v)=>a+v,0);
    }
  }
  events.sort((a,b)=>a.pay-b.pay);
  const feeRate=i=>{let t=0;const m=start+i;for(const f of payFees){const fs=isSet(f.startMonth)?monthIndex(f.startMonth):start,fe=isSet(f.endMonth)?monthIndex(f.endMonth):Infinity;if(m>=fs&&m<=fe)t+=num(f.rate)/100;}return t;};
  const cashAt=j=>{let c=num(S.openingCash);for(let i=0;i<=j;i++){const m=ms[i];c+=m.cashIn+m.funding-m.cashOut;}return c;};
  for(const ev of events){
    if(ev.skip||!(ev.total>0)) continue;
    if(ev.pay>=N){ev.skip='horizon';continue;}
    const fr=feeRate(ev.pay);
    if(ev.b.cashGuard!==false){ const room=cashAt(ev.pay)-num(S.minCash); if(room<ev.total*(1+fr)){ const f=Math.max(0,room)/(ev.total*(1+fr)); for(const n in ev.each) ev.each[n]*=f; ev.total*=f; ev.guarded=true; if(ev.total<1){ev.total=0;ev.each={};ev.skip='cash';continue;} } }
    const m=ms[ev.pay], fee=ev.total*fr;
    m.bonus+=ev.total; m.bonusFee=(m.bonusFee||0)+fee; for(const n in ev.each) m.bonusBy[n]=(m.bonusBy[n]||0)+ev.each[n];
    m.salaries+=ev.total; m.byType.ga+=ev.total*(1-smShare)+fee; m.byType.sm+=ev.total*smShare;
    if(fee){ m.fees+=fee; payFees.forEach(f=>{m.feeItems[f.id]=(m.feeItems[f.id]||0)+ev.total*num(f.rate)/100;}); }
    m.costs+=ev.total+fee; m.net-=ev.total+fee; m.cashOut+=ev.total+fee;
  }
  let c=num(S.openingCash); ms.forEach(m=>{c+=m.cashIn+m.funding-m.cashOut; m.cash=c;});
  M.bonusLog=events;
  return M;
}
function bonusBreakEven(M){ if(!M.months.some(m=>m.bonus)) return; const ms=M.months; M.R.beWithBonus=M.R.be; M.R.be=null; for(let i=0;i<ms.length;i++){ if(ms[i].revenue>0&&ms.slice(i).every(m=>m.net+(m.bonus||0)+(m.bonusFee||0)>=0)){ M.R.be=ms[i]; break; } } const i0=Math.max(0,ms.findIndex(m=>monthIndex(m.ym)>=monthIndex(M.asOf))); M.R.cashBe=null; for(let i=i0;i<ms.length;i++){ if(ms.slice(i).every(x=>x.cashIn-x.costs+(x.bonus||0)+(x.bonusFee||0)>=0)){ M.R.cashBe=ms[i]; break; } } }
function modelFor(sc,mode){const s=applyScenario(state,sc);const M=compute(s,mode||view.scenario);addBonuses(s,M);blendActuals(s,M,asOfYm());M.R=runwayInfo(s,M);bonusBreakEven(M);M.s=s;M.sc=sc;return M;}
function founderPay(M,s){
  const ys=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4))));
  return (s.founders||[]).map(f=>({name:f.name,on:!!f.onPayroll,rows:ys.map(y=>{let sal=0,bon=0;M.months.forEach(m=>{if(!m.ym.startsWith(y))return;if(f.onPayroll)sal+=m.salaryEach*num(f.share,100)/100;bon+=(m.bonusBy&&m.bonusBy[f.name])||0;});return {y,sal,bon};})}));
}
function founderPayTable(M,s){
  const P=founderPay(M,s), ys=P.length?P[0].rows.map(r=>r.y):[];
  if(!P.length) return '';
  return '<div class="tbl-wrap inner"><table class="fin"><thead><tr><th>Pay per founder (salary + bonus)</th>'+ys.map(y=>'<th class="n">'+y+'</th>').join('')+'</tr></thead><tbody>'+
    P.map(f=>'<tr><td>'+esc(f.name)+(f.on?'':' <span class="muted small">off payroll</span>')+'</td>'+f.rows.map(r=>'<td class="n">'+$(r.sal+r.bon)+(r.bon?'<span class="muted small block">incl. bonus '+$k(r.bon)+'</span>':'')+'</td>').join('')+'</tr>').join('')+
    '<tr class="total"><td>All founders</td>'+ys.map((y,i)=>'<td class="n">'+$(P.reduce((a,f)=>a+f.rows[i].sal+f.rows[i].bon,0))+'</td>').join('')+'</tr></tbody></table></div>';
}
function bonusRulesTable(B,bind,pref,founders,pg){
  const who=[{v:'',l:'Founders on payroll'},{v:'all',l:'All founders'},...(founders||[]).map(f=>({v:f.name,l:f.name}))];
  return '<table class="fin"><thead><tr><th>On</th><th>Bonus</th><th>Paid</th><th>Based on</th><th class="n">Rate / amount</th><th>Cur.</th><th>Paid to</th><th class="n" title="Months after the quarter or year closes">Pay lag (mo)</th><th>From</th><th class="n">Only if ARR ≥</th><th title="Skip the payout when that period made a loss">Needs profit</th><th title="Reduce or skip a payout that would take cash below your minimum">Protect cash</th><th class="n">Cap each</th><th></th></tr></thead><tbody>'+
    B.map((b,i)=>{const p=pref+'.'+i, pool=BONUS_POOL.has(b.basis);
      return '<tr class="'+(b.include===false?'off':'')+'"><td>'+bind(p+'.include',{type:'checkbox',label:'Include bonus'})+'</td><td>'+bind(p+'.name',{w:'w-l',label:'Bonus name'})+'</td><td>'+bind(p+'.freq',{type:'select',options:[{v:'annual',l:'Yearly'},{v:'quarterly',l:'Quarterly'}],w:'w-s',label:'Paid'})+'</td><td>'+bind(p+'.basis',{type:'select',options:Object.entries(BONUS_BASES).map(([v,l])=>({v,l})),w:'w-l',label:'Based on'})+'</td><td><span class="adjl">'+(pool?bind(p+'.rate',{num:1,w:'w-xs',label:'Rate'})+'<span class="muted small">%</span>':bind(p+'.amount',{num:1,w:'w-s',label:b.basis==='salaryMonths'?'Months of salary':'Amount each'})+(b.basis==='salaryMonths'?'<span class="muted small">mo</span>':''))+'</span></td><td>'+bind(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'})+'</td><td>'+bind(p+'.who',{type:'select',options:who,w:'w-m',label:'Paid to'})+'</td><td>'+bind(p+'.payLag',{num:1,w:'w-xs',label:'Pay lag'})+'</td><td>'+bind(p+'.startMonth',{type:'month',w:'w-m',label:'First period'})+'</td><td>'+bind(p+'.minArr',{num:1,blank:1,w:'w-s',ph:'Any',label:'Minimum live ARR'})+'</td><td>'+bind(p+'.needProfit',{type:'checkbox',label:'Needs profit'})+'</td><td>'+bind(p+'.cashGuard',{type:'checkbox',label:'Protect minimum cash'})+'</td><td>'+bind(p+'.capEach',{num:1,blank:1,w:'w-s',ph:'None',label:'Cap per person'})+'</td><td>'+(pg?'<button class="btn icon" data-act="pg-del" data-k="bonuses" data-i="'+i+'" aria-label="Remove bonus">✕</button>':del('del-bonus',i,'','Remove bonus'))+'</td></tr>';}).join('')+'</tbody></table>';
}
function bonusPayouts(M){
  const L=(M.bonusLog||[]); if(!L.length) return '';
  const st=ev=>ev.skip==='profit'?'<span class="muted">Skipped: loss in period</span>':ev.skip==='arr'?'<span class="muted">Skipped: ARR below minimum</span>':ev.skip==='horizon'?'<span class="muted">Due after the forecast window</span>':ev.skip==='cash'?'<span class="neg">Skipped: would break minimum cash</span>':ev.guarded?'<span class="warn-text">Reduced to protect minimum cash</span>':ev.capped?'<span class="pos">Paid, capped</span>':'<span class="pos">Paid</span>';
  const paid=L.filter(e=>!e.skip&&e.total>0), shown=L.slice(0,40);
  return '<h3 class="mt">Payouts in this plan</h3><div class="tbl-wrap"><table class="fin"><thead><tr><th>Bonus</th><th>For</th><th>Paid in</th><th class="n">Period profit</th><th class="n">Total</th><th>Per founder</th><th>Status</th></tr></thead><tbody>'+
    shown.map(e=>'<tr><td>'+esc(e.b.name||'Bonus')+'</td><td>'+esc(e.period)+'</td><td>'+ymLabel(e.ym)+'</td><td class="n '+(e.profit<0?'neg':'')+'">'+$(e.profit)+'</td><td class="n"><b>'+(e.total>0?$(e.total):'–')+'</b></td><td class="small">'+(e.total>0?Object.entries(e.each).map(([n,v])=>esc(n)+' '+$k(v)).join(' · '):'')+'</td><td class="small">'+st(e)+'</td></tr>').join('')+
    '<tr class="total"><td colspan="4">Total paid in the forecast window</td><td class="n">'+$(paid.reduce((a,e)=>a+e.total,0))+'</td><td colspan="2"></td></tr></tbody></table></div>'+(L.length>40?'<p class="hint">'+(L.length-40)+' more periods not shown.</p>':'');
}
function bonusPanel(M){
  const B=state.bonuses||[], can=!readOnly&&!cfgLocked;
  let h='<div class="panel flush mb" id="bonuses"><div class="panel-head pad"><div><h3>Founder bonuses</h3><p class="muted small sd">Yearly or quarterly bonuses on top of the salary ladder. They count as founder pay, so they reduce profit, cash and runway on every tab.</p></div><div class="toolbar">'+(can?'<button class="btn small" data-act="add-bonus" data-v="profit">Add yearly profit share</button><button class="btn small" data-act="add-bonus" data-v="quarter">Add quarterly bonus</button><button class="btn small" data-act="add-bonus" data-v="salary">Add 13th-month salary</button>':'')+'</div></div>';
  if(!B.length) h+='<div class="empty"><b>No bonuses yet.</b><span class="muted">Add a yearly profit share, a fixed quarterly bonus or a 13th-month salary. Each one pays only when its conditions are met.</span></div>';
  else h+='<div class="tbl-wrap inner">'+bonusRulesTable(B,inp,'bonuses',state.founders,false)+'</div><div class="pad-x">'+bonusPayouts(M)+'<p class="hint">Pool bonuses are split between the founders by their salary %. A period is a calendar quarter or year; it is paid the set number of months after it closes. Amounts use the bonus currency and convert to '+esc(MAINC())+'.</p></div>';
  h+=founderPayTable(M,M.s||state);
  return h+'</div>';
}
function teamView(M){ return founders(M).replace('<div class="eyebrow">Founders</div><h2>Salary ladder</h2>','<div class="eyebrow">Team</div><h2>Founders, bonuses and hiring</h2>')+'<div class="mt"></div>'+bonusPanel(M)+hiringPanel(M); }
SECS.splice(Math.max(0,SECS.findIndex(x=>x[0]==='founders')+1),0,['bonuses','Founder bonuses']);
function accessSection(sec){
  const can=!readOnly&&!cfgLocked, B=state.bonuses||[];
  const bh=sec('bonuses','Founder bonuses','Yearly or quarterly bonuses on top of the salary ladder. Payouts and each founder’s total pay are on the Team tab.',B.length?'<div class="tbl-wrap">'+bonusRulesTable(B,inp,'bonuses',state.founders,false)+'</div>':'<p class="muted">No bonuses yet.</p>',can?'<div class="toolbar"><button class="btn small" data-act="add-bonus" data-v="profit">Add yearly profit share</button><button class="btn small" data-act="add-bonus" data-v="quarter">Add quarterly bonus</button></div>':'');
  const lvl=readOnly?'view':cfgLocked?'interact':(isOwnerV?'owner':'admin');
  let hb='<p><b>'+esc(ACCESS_TXT[lvl])+'</b></p><p class="muted small">Editors change everything; contributors update the pipeline, invoices and actuals. Every save is kept below with who made it.</p>';
  hb+='<div class="toolbar mt"><button class="btn" data-act="load-history">'+(histList?'Refresh saved versions':'Show saved versions')+'</button></div>';
  if(histLoading) hb+='<p class="muted mt">Loading saved versions…</p>';
  else if(histList&&!histList.length) hb+='<p class="muted mt">No saved versions yet. They start with your next save.</p>';
  else if(histList) hb+='<div class="tbl-wrap mt"><table><thead><tr><th>Saved</th><th>By</th><th>What changed</th><th></th></tr></thead><tbody>'+histList.map((x,i)=>'<tr><td>'+esc(fmtWhen(x.savedAt))+'</td><td>'+esc(x.byName||'Someone')+'</td><td class="wrapcell small">'+esc((x.summary||[]).join(' · ')||'—')+'</td><td>'+(readOnly?'':'<button class="btn small" data-act="restore-version" data-i="'+i+'">Restore</button>')+'</td></tr>').join('')+'</tbody></table></div><p class="hint">Restoring loads that version as unsaved changes. Click Save to make it current; the version you replace stays in this list.</p>';
  return bh+sec('access','Access & history','',hb);
}

/* ---------- PLAYGROUND: a private what-if calculator ---------- */
const LS_PG='stratos-playground-v1';
let PG=null;
function pgKnobs(){return {price:0,impl:0,delay:0,prob:0,fleet:0,costs:0,salary:0,renew:'',addN:0,addFleet:8,addProduct:'',addStart:'',addEvery:2,addProb:100,addCountry:'',fundAmt:0,fundMonth:'',mode:''};}
function pgInit(force){
  if(PG&&!force) return;
  let saved=null; if(!force){ try{saved=JSON.parse(lsGet(LS_PG)||'null');}catch(e){} }
  if(saved&&saved.s&&saved.k){ try{ PG={s:patchFx(migrate(saved.s)),k:Object.assign(pgKnobs(),saved.k),c:saved.c,open:saved.open,at:saved.at}; }catch(e){ PG=null; } }
  if(!PG||force) PG={s:JSON.parse(JSON.stringify(state)),k:pgKnobs(),at:new Date().toISOString(),open:(PG&&PG.open)||{levers:true}};
  if(!PG.s.bonuses) PG.s.bonuses=[];
  PG.c=Object.assign({fleet:10,product:'',country:'',targetArr:500000,targetSalary:2000},PG.c||{});
  PG.open=PG.open||{levers:true};
}
const pgSave=()=>lsSet(LS_PG,JSON.stringify(PG));
function pgApply(src,k){
  const c=JSON.parse(JSON.stringify(src)), pa=1+num(k.price)/100, ia=1+num(k.impl)/100, ca=1+num(k.costs)/100, sa=1+num(k.salary)/100, fa=1+num(k.fleet)/100, d=Math.round(num(k.delay));
  c.products.forEach(p=>{p.rates=p.rates.map(v=>num(v)*pa);p.impl=p.impl.map(v=>num(v)*ia);});
  ['cabinRate','adminRate','instructorRate'].forEach(x=>c.seatPrices[x]=num(c.seatPrices[x])*pa);
  const shift=ym=>{const m=monthIndex(ym);return isFinite(m)?ymFromIndex(m+d):ym;};
  c.airlines.forEach(a=>{
    if(d&&a.status!=='Live'&&a.status!=='Signed'){const t=timingOf(c,a);a.signMonth=t.sign?shift(t.sign):'';a.goLiveMonth=t.live?shift(t.live):'';}
    a.prob=Math.max(0,Math.min(100,num(a.prob)+num(k.prob)));
    if(fa!==1){a.fleet=Math.max(0,num(a.fleet)*fa);['pilots','cabin','instructors'].forEach(f=>{if(isSet(a[f]))a[f]=Math.round(num(a[f])*fa);});}
    if(isSet(a.implOverride)) a.implOverride=num(a.implOverride)*ia;
  });
  c.costs.forEach(x=>{if(x.basis!=='pctRevenue')x.amount=num(x.amount)*ca;});
  (c.hires||[]).forEach(h=>{h.salary=num(h.salary)*ca;});
  if(sa!==1){c.salary.base=num(c.salary.base)*sa;c.salary.steps.forEach(x=>{x.salary=num(x.salary)*sa;});}
  if(isSet(k.renew)) c.settings.renewalRate=num(k.renew);
  const n=Math.max(0,Math.min(60,Math.round(num(k.addN))));
  if(n){ let s0=monthIndex(k.addStart); if(!isFinite(s0)) s0=monthIndex(asOfYm())+3; const ev=Math.max(0,Math.round(num(k.addEvery,1)));
    for(let i=0;i<n;i++){const sm=s0+i*ev;c.airlines.push({id:'pgx'+i,name:'Extra airline '+(i+1),country:k.addCountry||'',fleet:num(k.addFleet,8),pilots:'',cabin:'',instructors:'',admins:'',product:k.addProduct||c.products[0].id,cohort:'',signMonth:ymFromIndex(sm),goLiveMonth:ymFromIndex(sm+1),status:'Pipeline',prob:num(k.addProb,100),billing:'annual',discount:0,growth:0,implOverride:'',include:true,notes:'',renewProb:''});} }
  if(num(k.fundAmt)>0) c.funding=(c.funding||[]).concat([{id:'pgf',name:'Extra funding',type:'grant',investor:'',amount:num(k.fundAmt),currency:MAINC(),month:k.fundMonth||ymFromIndex(monthIndex(asOfYm())+3),include:true}]);
  return c;
}
function pgRun(s,mode){const M=compute(s,mode);addBonuses(s,M);blendActuals(s,M,asOfYm());M.R=runwayInfo(s,M);bonusBreakEven(M);M.s=s;return M;}
function pgIn(path,o){
  o=o||{}; let v=getPath(PG,path); const id='pg-'+path.replace(/\./g,'-'), sub=path.startsWith('s.')?path.slice(2):'';
  const money=!!sub&&MONEY_RX.test(sub)&&o.type!=='select'; if(money){o=Object.assign({},o,{num:1}); if(isSet(v)) v=Math.round(num(v)/DR()*100)/100;}
  const t=o.type||'text', cls='in '+(o.num?'num ':'')+(o.w||''), lab=o.label?' aria-label="'+esc(o.label)+'"':'';
  if(t==='select') return '<select id="'+id+'" class="'+cls+'" data-pg="'+path+'"'+(o.num?' data-kind="num"':'')+lab+'>'+o.options.map(x=>opt(x,v)).join('')+'</select>';
  if(t==='checkbox') return '<input id="'+id+'" type="checkbox" data-pg="'+path+'" data-kind="bool"'+((/\.include$/.test(path)?v!==false:v)?' checked':'')+lab+'>';
  if(t==='range') return '<input id="'+id+'" type="range" class="pgr" min="'+o.min+'" max="'+o.max+'" step="'+(o.step||1)+'" data-pg="'+path+'" data-kind="num" value="'+esc(num(v))+'"'+lab+'>';
  return '<input id="'+id+'" class="'+cls+'" type="'+(t==='month'?'month':o.num?'number':'text')+'"'+(o.num?' step="any" inputmode="decimal" data-kind="'+(money?'money':'num')+'"':'')+(o.blank?' data-blank="1"':'')+' data-pg="'+path+'" value="'+esc(v==null?'':v)+'"'+(o.ph!=null?' placeholder="'+esc(o.ph)+'"':'')+lab+'>';
}
function pgFmtKnob(path,v){ v=num(v); const k=path.split('.').pop();
  if(k==='delay') return v===0?'As planned':(v>0?v+' mo later':(-v)+' mo earlier');
  if(k==='prob') return (v>0?'+':'')+v+' pts';
  if(k==='addN') return v+' airline'+(v===1?'':'s');
  return (v>0?'+':'')+v+'%'; }
function pgDelta(a,b,money,goodUp){
  const d=a-b; if(!isFinite(d)||Math.abs(d)<(money?0.5:0.05)) return '<span class="muted">Same as plan</span>';
  const up=d>0, good=goodUp===false?!up:up;
  return '<span class="'+(good?'pos':'neg')+'">'+(up?'+':'−')+(money?$k(Math.abs(d)):fmtCount(Math.abs(d)))+'</span> <span class="muted">vs plan '+(money?$k(b):fmtCount(b))+'</span>';
}
function pgChanges(){
  const k=PG.k, out=[], pc=(v,l)=>{if(num(v))out.push(l+' '+(num(v)>0?'+':'')+num(v)+'%');};
  pc(k.price,'Prices'); pc(k.impl,'Implementation'); pc(k.fleet,'Fleet'); pc(k.costs,'Costs'); pc(k.salary,'Salaries');
  if(num(k.delay)) out.push('Deals '+pgFmtKnob('delay',k.delay)); if(num(k.prob)) out.push('Probability '+pgFmtKnob('prob',k.prob));
  if(isSet(k.renew)) out.push('Renewal '+num(k.renew)+'%'); if(num(k.addN)) out.push(num(k.addN)+' extra airline'+(num(k.addN)===1?'':'s')); if(num(k.fundAmt)>0) out.push('Extra funding '+$k(num(k.fundAmt)*DR()));
  const L={products:'Prices edited',seatPrices:'Seat prices edited',ratios:'Crew ratios edited',airlines:'Airlines edited',costs:'Costs edited',salary:'Salary ladder edited',founders:'Founders edited',bonuses:'Bonuses edited',hires:'Hires edited',funding:'Funding edited'};
  for(const x in L) if(JSON.stringify(PG.s[x]||[])!==JSON.stringify(state[x]||[])) out.push(L[x]);
  const strip=o=>{const c=Object.assign({},o);delete c.currencies;return JSON.stringify(c);};
  if(strip(PG.s.settings)!==strip(state.settings)) out.push('Settings edited');
  return out;
}
function pgSec(k,t,note,body){ return '<details class="pgsec" data-pgsec="'+k+'"'+(PG.open[k]?' open':'')+'><summary><span>'+t+'</span><span class="muted small">'+note+'</span></summary><div class="pgbody">'+body+'</div></details>'; }
function pgDelBtn(k,i){ return '<button class="btn icon" data-act="pg-del" data-k="'+k+'" data-i="'+i+'" aria-label="Remove">✕</button>'; }
function pgView(){
  pgInit();
  const mode=PG.k.mode||view.scenario, P=pgRun(pgApply(PG.s,PG.k),mode), B=modelFor({id:'base'},mode), S=PG.s, sA=P.s;
  const ysP=aggregate(P.months,byYear), ysB=aggregate(B.months,byYear), yrs=ysP.map(g=>g.key);
  const y1=yrs.includes('2027')?'2027':yrs[0], y2=yrs.includes('2028')?'2028':yrs[yrs.length-1];
  const Y=(ys,k)=>ys.find(g=>g.key===k)||{revenue:0,net:0,costs:0,salaries:0};
  const E=(M,k)=>M.months.filter(m=>m.ym.startsWith(k)).pop()||M.months[M.months.length-1];
  const endP=P.months[P.months.length-1], endB=B.months[B.months.length-1];
  const payAvg=(M,s,y)=>{const F=founderPay(M,s).filter(f=>f.on);return F.length?F.reduce((t,f)=>{const r=f.rows.find(r=>r.y===y);return t+(r?r.sal+r.bon:0);},0)/F.length:0;};
  const can=!readOnly&&!cfgLocked, ch=pgChanges();
  let h='<div class="sec-head"><div><div class="eyebrow">Playground</div><h2>Try any change and see the result</h2><p>A private copy of your plan, kept only in this browser. Move the levers or edit any detail below; the saved plan doesn’t change unless you click “Apply to plan”.</p></div><div class="toolbar">'+pgIn('k.mode',{type:'select',options:[{v:'',l:'Mode: as top bar ('+(view.scenario==='plan'?'Plan':'Weighted')+')'},{v:'plan',l:'Mode: Plan'},{v:'weighted',l:'Mode: Weighted'}],w:'w-xl',label:'Playground mode'})+'<button class="btn" data-act="pg-levers">Reset levers</button><button class="btn" data-act="pg-reset">Start again from the plan</button>'+(can?'<button class="btn cta-outline" data-act="pg-apply">Apply to plan</button>':'')+'</div></div>';
  h+='<div class="chips pgch">'+(ch.length?ch.map(x=>'<span class="chip" style="--cc:var(--c-sky)">'+esc(x)+'</span>').join(''):'<span class="muted small">No changes yet: the playground matches your plan.</span>')+'</div>';
  const K=(l,a,b,o)=>{o=o||{};return kpi(l,o.txt||(o.cnt?fmtCount(a):$k(a)),(o.txt?o.sub:pgDelta(a,b,!o.cnt,o.goodUp)),o.cls);};
  h+='<div class="pg-strip"><div class="kpis">'+
    K('ARR end of '+y1,E(P,y1).liveARR,E(B,y1).liveARR,{cls:'lead'})+
    K('ARR end of '+yrs[yrs.length-1],endP.liveARR,endB.liveARR,{cls:'sky'})+
    K('Revenue '+y2,Y(ysP,y2).revenue,Y(ysB,y2).revenue)+
    K('Net profit '+y2,Y(ysP,y2).net,Y(ysB,y2).net)+
    K('Lowest cash',P.R.minCash.v,B.R.minCash.v,{cls:P.R.minCash.v<0?'alert':''})+
    K('Break-even',0,0,{txt:P.R.be?ymLabel(P.R.be.ym):'Not in horizon',sub:'Plan: '+(B.R.be?ymLabel(B.R.be.ym):'not in horizon')})+
    K('Pay per founder '+y2,payAvg(P,sA,y2),payAvg(B,B.s,y2))+
    K('Airlines live at end',endP.live,endB.live,{cnt:1})+
  '</div></div>';
  // levers + charts
  const lever=(path,l,min,max,step,hint)=>{const id='pg-'+path.replace(/\./g,'-');return '<div class="lever"><label for="'+id+'">'+l+'</label><span class="lv" id="'+id+'-v">'+pgFmtKnob(path,getPath(PG,path))+'</span>'+pgIn(path,{type:'range',min,max,step,label:l})+(hint?'<span class="fhint">'+hint+'</span>':'')+'</div>';};
  const ctyOpts=[{v:'',l:'No country'},...Array.from(new Set([...S.regions.flatMap(r=>r.countries.map(c=>c.name)),...S.airlines.map(a=>a.country).filter(Boolean)])).map(c=>({v:c,l:c}))];
  const prodOpts=S.products.map(p=>({v:p.id,l:p.short||p.name}));
  h+='<div class="grid2 mb"><div class="panel"><h3>Quick levers</h3>'+
    lever('k.price','License and seat prices',-50,100,5,'Applied to every product, tier and seat price')+
    lever('k.impl','Implementation fees',-100,100,5)+
    lever('k.delay','Unsigned deals',-6,12,1,'Moves signing and go-live for airlines not yet Signed or Live')+
    lever('k.fleet','Fleet size of every airline',-50,100,5,'Pilots and crew scale with it')+
    lever('k.prob','Close probability',-50,50,5,'Only changes the Weighted mode')+
    lever('k.costs','Costs and hires',-50,100,5)+
    lever('k.salary','Founder salary ladder',-50,200,10,'Base salary and every step')+
    '<div class="fields mt">'+fld('Renewal rate %',pgIn('k.renew',{num:1,blank:1,ph:String(num(S.settings.renewalRate,100)),label:'Renewal rate'}),'Blank keeps each airline’s own')+'</div></div>';
  const ls=(ma,mb,f)=>[{name:'Plan',color:'var(--c-deep40)',values:mb.months.map(f),dash:'5 4'},{name:'Playground',color:'var(--c-sky)',values:ma.months.map(f)}];
  const sa=ls(P,B,m=>m.liveARR), sc=ls(P,B,m=>m.cashB), lab=P.months.map(m=>m.ym);
  h+='<div class="panel"><h3>Live ARR</h3>'+lineChart(lab,sa,{w:600,h:220,label:'Live ARR, plan versus playground'})+legendOf(sa)+'<h3 class="mt">Cash balance</h3>'+lineChart(lab,sc,{w:600,h:220,label:'Cash, plan versus playground'})+legendOf(sc)+'</div></div>';
  // extra airlines + funding
  h+='<div class="grid2 mb"><div class="panel"><h3>Add new airlines</h3>'+lever('k.addN','Extra airlines',0,30,1,'Added on top of your pipeline, one after another')+
    '<div class="fields mt">'+fld('Fleet each',pgIn('k.addFleet',{num:1}))+fld('Product',pgIn('k.addProduct',{type:'select',options:[{v:'',l:prodOpts[0]?prodOpts[0].l:'—'},...prodOpts.slice(1)]}))+fld('First signs',pgIn('k.addStart',{type:'month'}),'Blank = in 3 months')+fld('Months between',pgIn('k.addEvery',{num:1}))+fld('Country',pgIn('k.addCountry',{type:'select',options:ctyOpts}),'Sets taxes and payment terms')+fld('Probability %',pgIn('k.addProb',{num:1}),'Weighted mode only')+'</div></div>';
  h+='<div class="panel"><h3>Add funding</h3><div class="fields">'+fld('Amount ('+esc(MAINC())+')',pgIn('k.fundAmt',{num:1}))+fld('Month',pgIn('k.fundMonth',{type:'month'}),'Blank = in 3 months')+'</div><p class="hint">Cash only: it doesn’t change the cap table. Use the Funding section below for SAFEs and equity rounds.</p>';
  // calculators
  const c=PG.c, fake={id:'calc',name:'calc',country:c.country||'',fleet:num(c.fleet,10),pilots:'',cabin:'',instructors:'',admins:'',product:c.product||sA.products[0].id,billing:'annual',discount:0,growth:0,implOverride:''};
  const e=airlineEcon(sA,fake,0), arrPer=e.arr, endY=E(P,y2), fixedMo=endY.costs, beN=arrPer?fixedMo*12/arrPer:Infinity;
  const tgt=num(c.targetArr)*DR(), tgtN=arrPer?Math.max(0,tgt-endP.liveARR)/arrPer:Infinity;
  const share=(sA.founders||[]).filter(f=>f.onPayroll).reduce((t,f)=>t+num(f.share,100)/100,0), tSal=num(c.targetSalary)*DR(), extra=Math.max(0,tSal-endY.salaryEach)*12*share, salN=arrPer?extra/arrPer:Infinity;
  const nf=v=>isFinite(v)?(Math.ceil(v*10)/10).toFixed(1).replace(/\.0$/,''):'–';
  h+='<h3 class="mt">Quick calculators</h3><div class="fields mb">'+fld('Fleet of one airline',pgIn('c.fleet',{num:1}))+fld('Product',pgIn('c.product',{type:'select',options:[{v:'',l:prodOpts[0]?prodOpts[0].l:'—'},...prodOpts.slice(1)]}))+fld('Country',pgIn('c.country',{type:'select',options:ctyOpts}))+fld('ARR target ('+esc(MAINC())+')',pgIn('c.targetArr',{num:1}))+fld('Salary each target /mo',pgIn('c.targetSalary',{num:1}))+'</div><div class="calc-grid">'+
    '<div class="calc-card"><span class="muted small">One airline like this pays</span><div class="calc-res">'+$(arrPer)+'<span class="unit"> /yr</span></div><span class="small muted">+ '+$(e.impl)+' implementation · '+e.pilots+' pilots · '+$2(e.perPilotMonth)+' per pilot/mo</span></div>'+
    '<div class="calc-card"><span class="muted small">Airlines like this to cover all monthly costs ('+$k(fixedMo)+'/mo, end of '+y2+')</span><div class="calc-res">'+nf(beN)+'</div><span class="small muted">You have '+fmtCount(endY.live)+' live then</span></div>'+
    '<div class="calc-card"><span class="muted small">More airlines like this to reach '+$k(tgt)+' ARR</span><div class="calc-res">'+nf(tgtN)+'</div><span class="small muted">On top of '+$k(endP.liveARR)+' ARR at the end of the forecast</span></div>'+
    '<div class="calc-card"><span class="muted small">To pay each founder '+$(tSal)+'/mo from '+y2+'</span><div class="calc-res">'+(extra>0?'+'+$k(extra)+'<span class="unit"> /yr</span>':'Already covered')+'</div><span class="small muted">'+(extra>0?'About '+nf(salN)+' more airlines like this':'The ladder pays '+$(endY.salaryEach)+'/mo then')+'</span></div>'+
  '</div></div></div>';
  // year comparison
  const row=(l,f,cls,o)=>{o=o||{};return '<tr class="'+(cls||'')+'"><td>'+l+'</td>'+yrs.map(k=>{const a=f(Y(ysP,k),E(P,k),P,k), b=f(Y(ysB,k),E(B,k),B,k), d=a-b;return '<td class="n"><span class="'+(a<0&&!o.cnt?'neg':'')+'">'+(o.cnt?fmtCount(a):$(a))+'</span>'+(Math.abs(d)>=(o.cnt?0.05:0.5)?'<span class="small block '+((o.goodUp===false?d<0:d>0)?'pos':'neg')+'">'+(d>0?'+':'−')+(o.cnt?fmtCount(Math.abs(d)):$k(Math.abs(d)))+'</span>':'')+'</td>';}).join('')+'</tr>';};
