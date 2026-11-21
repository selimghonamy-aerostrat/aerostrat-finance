  h+='<div class="grid2"><div class="panel"><h3>Quick quote</h3><div class="fields mb">'+
    fld('Fleet (aircraft)','<input id="q-fleet" class="in num" type="number" min="0" data-q="fleet" value="'+esc(Q.fleet)+'">')+
    fld('Product','<select id="q-product" class="in" data-q="product">'+P.map(p=>'<option value="'+p.id+'"'+(p.id===Q.product?' selected':'')+'>'+esc(p.short)+'</option>').join('')+'</select>')+
    fld('Billing','<select id="q-billing" class="in" data-q="billing"><option value="annual"'+(Q.billing==='annual'?' selected':'')+'>Annual</option><option value="monthly"'+(Q.billing==='monthly'?' selected':'')+'>Monthly +'+S.monthlyPremium+'%</option></select>')+
    fld('Discount %','<input id="q-discount" class="in num" type="number" min="0" max="100" data-q="discount" value="'+esc(Q.discount)+'">')+'</div><ul class="list-plain">'+
    li('Pilots / cabin crew / instructors / admins',qe.pilots+' / '+(qe.product.seats.cabin?qe.cabin:'–')+' / '+(qe.product.seats.instructor?fmtCount(qe.instructors):'–')+' / '+(qe.product.seats.admin?qe.admins:'–'))+li('Tier',esc(B[qe.tier0].label)+' at '+$2(qe.rate)+'/pilot')+li('Pilot seats',$(qe.seats.pilots))+li('Cabin, admin and instructor seats',$(qe.seats.cabin+qe.seats.admin+qe.seats.instructors))+li('Annual license',$(qe.arr))+li('Implementation',$(qe.impl))+li('Year 1 total',$(qe.arr+qe.impl))+li('All-in per pilot per month',$2(qe.perPilotMonth))+'</ul>'+
    '<h3 class="mt">Same fleet, every product</h3><div class="tbl-wrap"><table><thead><tr><th>Product</th><th class="n">Annual</th><th class="n">Impl.</th><th class="n">Year 1</th></tr></thead><tbody>'+P.map(p=>{const e=airlineEcon(state,Object.assign({},qa,{product:p.id}),0);return '<tr><td><i class="dot" style="background:'+cv(p.color)+'"></i> '+esc(p.short)+'</td><td class="n">'+$(e.arr)+'</td><td class="n">'+$(e.impl)+'</td><td class="n"><b>'+$(e.arr+e.impl)+'</b></td></tr>';}).join('')+'</tbody></table></div></div>';
  const C=state.competitors, bars=[...P.map(p=>({name:'STRATOS '+p.short,v:pr(p,'rates',0),c:cv(p.color)})),...C.map(c=>({name:c.name,v:usdOf(c.perPilot,c.currency),c:'var(--c-grey)'}))], mx=Math.max(1,...bars.map(b=>b.v));
  h+='<div class="panel"><div class="panel-head"><h3>Pilot seat price vs competitors</h3>'+goto('competitors','Edit competitors')+'</div>'+bars.map(b=>'<div class="hbar"><span class="lbl" title="'+esc(b.name)+'">'+esc(b.name)+'</span><span class="track"><span class="fill" style="width:'+(b.v/mx*100)+'%;background:'+b.c+'"></span></span><span class="hv">'+$2(b.v)+'</span></div>').join('')+'<ul class="list-plain mt">'+C.map(c=>li(esc(c.name),'<span class="small" style="font-weight:500">'+esc(c.note)+'</span>')).join('')+'</ul><div class="hint">Per pilot per month at Tier 1. Competitor figures are what you collected; they price different scopes.</div></div></div>';
  return h;
}

/* ---------- COSTS ---------- */
function unitLabel(c){
  const b=c.basis||'fixed', cur=curSym(c.currency);
  if(b==='pctRevenue') return '% of revenue';
  if(b==='perNewAirline') return cur+' per new airline, once';
  const per={fixed:'',perAirline:' per airline',perAircraft:' per aircraft',perPilot:' per pilot',perSeat:' per seat'}[b]||'';
  const f=c.freq==='yearly'?' a year':c.freq==='once'?' once':' a month';
  return cur+per+f;
}
function costChart(years,cats,colorOf){
  const W=620,H=250,pl=52,pr=10,pt=14,pb=28,iw=W-pl-pr,ih=H-pt-pb;
  const tot=years.map(y=>cats.reduce((a,c)=>a+(y.byCat[c]||0),0)), mx=Math.max(1,...tot,...years.map(y=>y.revenue*0));
  const step=niceStepM(mx/4), top=Math.ceil(mx/step)*step, bw=iw/years.length, y=v=>pt+ih-v/top*ih;
  let g='';
  for(let v=0;v<=top+1e-6;v+=step) g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  years.forEach((yr,i)=>{let base=pt+ih;const x=pl+i*bw+bw*0.2,w=bw*0.6;
    cats.forEach(c=>{const v=yr.byCat[c]||0;if(v<=0)return;const h=v/top*ih;base-=h;g+='<rect x="'+x.toFixed(1)+'" y="'+base.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" style="fill:'+colorOf(c)+'"><title>'+yr.key+' · '+esc(c)+' '+$(v)+'</title></rect>';});
    g+='<text class="yr" x="'+(x+w/2)+'" y="'+(H-8)+'" text-anchor="middle">'+yr.key+'</text><text x="'+(x+w/2)+'" y="'+(base-5)+'" text-anchor="middle">'+$k(tot[i])+'</text>';});
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Costs by year and category">'+g+'</svg>';
}
function costs(M){
  const years=aggregate(M.months,byYear), Y=years.find(g=>g.key===view.year)||years[0];
  const ym=M.months.filter(m=>m.ym.startsWith(Y.key)), endM=ym[ym.length-1];
  const items=state.costs.map((c,i)=>({c,i}));
  const catOf=c=>c.category||'Other';
  const SAL='Founder salaries';
  const cats=Array.from(new Set(items.map(x=>catOf(x.c)))); cats.push(SAL);
  const palette=['var(--c-deep)','var(--c-sky)','var(--c-deep60)','var(--c-sky60)','var(--c-deep40)','var(--c-deep80)','var(--c-grey)'];
  const colorOf=c=>c===SAL?'var(--c-coral)':palette[cats.indexOf(c)%palette.length];
  years.forEach(yr=>{yr.byCat={};items.forEach(({c})=>{yr.byCat[catOf(c)]=(yr.byCat[catOf(c)]||0)+(yr.costItems[c.id]||0);});yr.byCat[SAL]=yr.salaries;});
  const live=endM.live, pilots=endM.livePilots, mrr=endM.recurring;
  const rr=c=>{const cs=isSet(c.startMonth)?monthIndex(c.startMonth):-Infinity, ce=isSet(c.endMonth)?monthIndex(c.endMonth):Infinity, m=monthIndex(endM.ym); if(m<cs||m>ce) return 0; return costMonthlyUSD(state,c,Object.assign({},endM,{newSigned:Y.newSigned/Y.months}))*Math.pow(1+num(c.growth)/100,Math.max(0,Math.floor((m-cs)/12)));};
  let fixedTools=0,varRun=0; items.forEach(({c})=>{const v=rr(c); if((c.basis||'fixed')==='fixed') fixedTools+=v; else varRun+=v;});
  const fixedRun=fixedTools+endM.salaries+endM.hires+endM.fees, runRate=fixedRun+varRun;
  const avgARR=live?endM.liveARR/live:0, varPerAirlineYr=live?Y.varCosts/Y.months*12/live:0, contrib=avgARR-varPerAirlineYr;
  const beAirlines=contrib>0?fixedRun*12/contrib:Infinity;
  const burnMonths=M.months.filter(m=>m.net<0).length;
  const cashMin=Math.min(...M.months.map(m=>m.cash)), cashMinM=M.months.find(m=>m.cash===cashMin);
  const cmpRow=(l,v,s)=>li(l,v+(s?' <span class="muted small" style="font-weight:500">'+s+'</span>':''));
  let h='<div class="sec-head"><div><div class="eyebrow">Costs</div><h2>Operating costs '+Y.key+'</h2><p>Each cost can be fixed or scale with the business: per live airline, aircraft, pilot or seat, per new airline at signing, or a share of revenue. Pick monthly, yearly or one-time billing, and an optional yearly growth rate.</p></div><div class="toolbar"><span class="muted small">Year</span><div class="seg light" role="group" aria-label="Year">'+years.map(g=>'<button data-act="year" data-v="'+g.key+'" aria-pressed="'+(g.key===Y.key)+'">'+g.key+'</button>').join('')+'</div>'+goto('fees','Taxes & fees')+'</div></div>';
  h+='<div class="kpis">'+
    kpi('Total costs '+Y.key,$(Y.costs),Y.months<12?Y.months+' months':'Tools '+$k(Y.tools)+' · salaries '+$k(Y.salaries),'lead')+
    kpi('Costs as % of revenue',pct(Y.revenue?Y.costs/Y.revenue*100:NaN),'Revenue '+$k(Y.revenue),'sky')+
    kpi('Monthly run rate',$(runRate)+'<span class="unit"> /mo</span>','End of '+Y.key)+
    kpi('Fixed / variable',$k(Y.fixedCosts+Y.salaries)+' / '+$k(Y.varCosts),pct(Y.costs?(Y.varCosts)/Y.costs*100:0)+' variable')+
    kpi('Cost per live airline',live?$(runRate*12/live)+'<span class="unit"> /yr</span>':'–',fmtCount(live)+' airlines live')+
    kpi('Cost per pilot',pilots?$2(runRate/pilots)+'<span class="unit"> /mo</span>':'–',Math.round(pilots).toLocaleString()+' pilots live')+
  '</div>';
  // editable table
  const basisOpts=Object.entries(COST_BASES).map(([v,l])=>({v,l}));
  h+='<div class="panel flush mb"><div class="panel-head pad"><h3>Cost items</h3><div class="toolbar">'+(readOnly?'':'<button class="btn cta-outline small" data-act="add-cost">Add cost</button>')+'</div></div><div class="tbl-wrap inner"><table class="fin costs"><thead><tr><th>Item</th><th>Category</th><th>Type</th><th>Charged</th><th class="n">Amount</th><th>Unit</th><th>Billing</th><th>Cur.</th><th class="n">Qty</th><th class="n">Growth %/yr</th><th>Starts</th><th>Ends</th><th class="n">Now /mo</th><th class="n">'+Y.key+'</th><th class="n">Share</th><th></th></tr></thead><tbody>';
  const datalist='<datalist id="costcats">'+Array.from(new Set(['Tools','Infrastructure','Company admin','Sales','Travel','Office','Payroll','Marketing','Legal','Payment fees',...cats.filter(c=>c!==SAL)])).map(c=>'<option value="'+esc(c)+'">').join('')+'</datalist>';
  items.forEach(({c,i})=>{
    const p='costs.'+i, b=c.basis||'fixed', varb=b==='pctRevenue'||b==='perNewAirline';
    const yv=Y.costItems[c.id]||0;
    h+='<tr><td><span class="rowname" style="--rc:'+colorOf(catOf(c))+'">'+inp(p+'.name',{w:'w-l',label:'Cost item'})+'</span></td><td>'+inp(p+'.category',{w:'w-m',label:'Category',list:'costcats'})+'</td><td>'+inp(p+'.type',{type:'select',options:typeOpts(),w:'w-l',label:'Cost type'})+'</td><td>'+inp(p+'.basis',{type:'select',options:basisOpts,w:'w-l',label:'Charged'})+'</td><td>'+inp(p+'.amount',{num:1,w:'w-s',label:'Amount'})+'</td><td class="muted small">'+unitLabel(c)+'</td><td>'+(varb?'<span class="muted small">'+(b==='pctRevenue'?'Monthly':'At signing')+'</span>':inp(p+'.freq',{type:'select',options:[{v:'monthly',l:'Monthly'},{v:'yearly',l:'Yearly'},{v:'once',l:'One-time'}],w:'w-s',label:'Billing'}))+'</td><td>'+(b==='pctRevenue'?'':inp(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'}))+'</td><td>'+inp(p+'.qty',{num:1,w:'w-xs',label:'Quantity'})+'</td><td>'+(b==='pctRevenue'?'':inp(p+'.growth',{num:1,w:'w-xs',label:'Yearly growth'}))+'</td><td>'+inp(p+'.startMonth',{type:'month',w:'w-m',label:'Start'})+'</td><td>'+inp(p+'.endMonth',{type:'month',w:'w-m',label:'End'})+'</td><td class="n">'+$(rr(c))+'</td><td class="n"><b>'+$(yv)+'</b></td><td class="n muted">'+pct(Y.costs?yv/Y.costs*100:0)+'</td><td>'+del('del-cost',i)+'</td></tr>';
  });
  h+='<tr class="sub"><td><span class="rowname" style="--rc:var(--c-coral)">Founder salaries</span></td><td>'+SAL+'</td><td class="muted small">G&amp;A / S&amp;M</td><td>Salary ladder</td><td class="n">'+$(endM.salaryEach)+'</td><td class="muted small">each a month</td><td colspan="5"><button class="linkish small" data-act="tab" data-v="team">Edit on Team tab →</button></td><td class="n">'+$(endM.salaries)+'</td><td class="n"><b>'+$(Y.salaries)+'</b></td><td class="n muted">'+pct(Y.costs?Y.salaries/Y.costs*100:0)+'</td><td></td></tr>';
  h+=(M.months.some(m=>m.hires)?'<tr class="sub"><td><span class="rowname" style="--rc:var(--c-deep80)">Hires</span></td><td>Team</td><td class="muted small">Per role</td><td>Hiring plan</td><td class="n"></td><td></td><td colspan="5"><button class="linkish small" data-act="tab" data-v="team">Edit on Team tab →</button></td><td class="n">'+$(endM.hires)+'</td><td class="n"><b>'+$(Y.hires)+'</b></td><td class="n muted">'+pct(Y.costs?Y.hires/Y.costs*100:0)+'</td><td></td></tr>':'');
  h+=(state.fees||[]).some(f=>f.include!==false)?'<tr class="sub"><td><span class="rowname" style="--rc:var(--c-grey)">Taxes &amp; fees</span></td><td>Fees</td><td class="muted small">Per fee</td><td>Settings</td><td class="n"></td><td></td><td colspan="5"><button class="linkish small" data-act="goto-settings" data-v="fees">Edit in Settings →</button></td><td class="n">'+$(endM.fees)+'</td><td class="n"><b>'+$(Y.fees)+'</b></td><td class="n muted">'+pct(Y.costs?Y.fees/Y.costs*100:0)+'</td><td></td></tr>':'';
  h+='<tr class="total"><td colspan="12">Total costs</td><td class="n">'+$(runRate)+'</td><td class="n">'+$(Y.costs)+'</td><td class="n">100%</td><td></td></tr></tbody></table></div>'+datalist+'<p class="hint pad-x">“Now /mo” is the run rate at the end of '+Y.key+'. Per-airline, aircraft, pilot and seat costs count airlines live in each month; yearly items are charged in their start month each year for everyone live then. Growth raises the amount at each anniversary of the start month.</p></div>';
  // chart + metrics
  h+='<div class="grid2 mb"><div class="panel"><h3>Costs by year and category</h3>'+costChart(years,cats,colorOf)+'<div class="legend">'+cats.map(c=>'<span><i class="sw" style="background:'+colorOf(c)+'"></i>'+esc(c)+'</span>').join('')+'</div></div>';
  h+='<div class="panel"><h3>Cost metrics · end of '+Y.key+'</h3><ul class="list-plain">'+
    cmpRow('Fixed costs (incl. salaries)',$(fixedRun)+'/mo',$(fixedRun*12)+'/yr')+
    cmpRow('Variable costs',$(varRun)+'/mo',$(varRun*12)+'/yr')+
    cmpRow('Average ARR per live airline',$(avgARR))+
    cmpRow('Variable cost per airline',$(varPerAirlineYr)+'/yr')+
    cmpRow('Contribution per airline',$(contrib)+'/yr',avgARR?pct(contrib/avgARR*100)+' margin':'')+
    cmpRow('Airlines needed to cover fixed costs',isFinite(beAirlines)?beAirlines.toFixed(1):'–',isFinite(beAirlines)?'you have '+fmtCount(live):'')+
    cmpRow('Monthly licenses vs costs',$(mrr)+' / '+$(runRate),runRate?pct(mrr/runRate*100)+' coverage':'')+
    cmpRow('Cost per $1 of revenue '+Y.key,Y.revenue?'$'+(Y.costs/Y.revenue).toFixed(2):'–')+
    cmpRow('Months with a loss',String(burnMonths),'in the forecast window')+
    cmpRow('Lowest cash balance',$(cashMin),cashMinM?ymLabel(cashMinM.ym):'')+
  '</ul></div></div>';
  // by year table
  h+='<div class="panel flush"><div class="panel-head pad"><h3>Costs by year</h3><span class="muted small">'+(view.scenario==='plan'?'Plan case':'Weighted case')+'</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+years.map(y=>'<th class="n">'+y.key+(y.months<12?' <span class="nt">('+y.months+' mo)</span>':'')+'</th>').join('')+'</tr></thead><tbody>';
  cats.filter(c=>c!==SAL).forEach(cat=>{
    h+='<tr class="strong"><td><i class="dot" style="background:'+colorOf(cat)+'"></i>'+esc(cat)+'</td>'+years.map(y=>'<td class="n">'+$(y.byCat[cat]||0)+'</td>').join('')+'</tr>';
    items.filter(x=>catOf(x.c)===cat).forEach(({c})=>{h+='<tr class="sub"><td style="padding-left:28px">'+esc(c.name)+' <span class="small">· '+esc(COST_BASES[c.basis||'fixed'])+'</span></td>'+years.map(y=>'<td class="n">'+$(y.costItems[c.id]||0)+'</td>').join('')+'</tr>';});
  });
  h+='<tr class="strong"><td><i class="dot" style="background:var(--c-coral)"></i>'+SAL+'</td>'+years.map(y=>'<td class="n">'+$(y.salaries)+'</td>').join('')+'</tr>'+
    '<tr class="total"><td>Total costs</td>'+years.map(y=>'<td class="n">'+$(y.costs)+'</td>').join('')+'</tr>'+
    '<tr class="sub"><td>Fixed (incl. salaries)</td>'+years.map(y=>'<td class="n">'+$(y.fixedCosts+y.salaries)+'</td>').join('')+'</tr>'+
    '<tr class="sub"><td>Variable</td>'+years.map(y=>'<td class="n">'+$(y.varCosts)+'</td>').join('')+'</tr>'+
    '<tr><td>Revenue</td>'+years.map(y=>'<td class="n">'+$(y.revenue)+'</td>').join('')+'</tr>'+
    '<tr class="sub"><td>Costs as % of revenue</td>'+years.map(y=>'<td class="n">'+pct(y.revenue?y.costs/y.revenue*100:NaN)+'</td>').join('')+'</tr>'+
    '<tr class="sub"><td>Cost per live airline (year end, annualized)</td>'+years.map(y=>'<td class="n">'+(y.live?$((M.months.filter(m=>m.ym.startsWith(y.key)).pop().costs*12)/y.live):'–')+'</td>').join('')+'</tr>'+
    '<tr class="total"><td>Net profit</td>'+years.map(y=>'<td class="n '+(y.net<0?'neg':'')+'">'+$(y.net)+'</td>').join('')+'</tr></tbody></table></div></div>';
  return h;
}

/* ---------- FOUNDERS ---------- */
function founders(M){
  const L=state.salary, yrs=aggregate(M.months,byYear), pay=state.founders.filter(f=>f.onPayroll);
  const order=L.steps.map((s,i)=>({s,i})).sort((a,b)=>num(a.s.arr)-num(b.s.arr));
  const now=M.months[0], last=M.months[M.months.length-1];
  const nextStep=order.find(o=>!M.stepLog.some(l=>l.idx===o.i));
  let h='<div class="sec-head"><div><div class="eyebrow">Founders</div><h2>Salary ladder</h2><p>Each step unlocks when live ARR reaches its threshold, takes effect after the lag, and waits for the minimum gap after the previous step. Type a date in “Takes effect” to set a step by hand; clear it to go back to automatic timing.</p></div><div class="toolbar">'+goto('salary','All salary settings')+'</div></div>';
  h+='<div class="kpis">'+kpi('Salary each now',$(now.salaryEach)+'<span class="unit"> /mo</span>',ymLabel(now.ym),'lead')+kpi('Salary each at end',$(last.salaryEach)+'<span class="unit"> /mo</span>',ymLabel(last.ym),'sky')+kpi('Next step',nextStep?$(nextStep.s.salary)+'<span class="unit"> /mo</span>':'All reached',nextStep?'At '+$k(num(nextStep.s.arr))+' live ARR':'')+kpi('On payroll',String(pay.length),pay.map(f=>esc(f.name)).join(', ')||'Nobody')+'</div>';
  h+='<div class="grid2 mb"><div class="panel"><div class="panel-head"><h3>When each step lands</h3>'+(readOnly?'':'<button class="btn small" data-act="add-step">Add step</button>')+'</div><div class="fields mb">'+fld('Lag after ARR is reached (months)',inp('salary.lagMonths',{num:1}))+fld('Minimum gap between steps (months)',inp('salary.minGapMonths',{num:1}))+'</div>';
  h+='<div class="ladder"><div class="lrow base"><div class="lwhen">'+inp('salary.startMonth',{type:'month',w:'w-m',label:'Salaries start'})+'</div><div class="lwhat"><b>Base salary</b><span class="muted small">Paid from this month</span></div><div class="lpay">'+inp('salary.base',{num:1,w:'w-s',label:'Base salary'})+'<span class="muted small">/mo each</span></div><div></div></div>';
  order.forEach(({s,i})=>{
    const log=M.stepLog.find(l=>l.idx===i), p='salary.steps.'+i;
    let why;
    if(!log) why=isSet(s.month)?'Set for '+ymLabel(s.month)+', outside the forecast window.':'Live ARR doesn’t reach '+$k(num(s.arr))+' in this scenario.';
    else if(log.reason==='manual') why='Set by you.'+(log.reachedYm?' Live ARR passes '+$k(log.threshold)+' in '+ymLabel(log.reachedYm)+'.':'');
    else if(log.reason==='gap') why='Live ARR passed '+$k(log.threshold)+' in '+ymLabel(log.reachedYm)+'. Held until '+L.minGapMonths+' months after the previous step.';
    else why='Live ARR passed '+$k(log.threshold)+' in '+ymLabel(log.reachedYm)+'. Paid '+L.lagMonths+' month'+(num(L.lagMonths)===1?'':'s')+' later, once collections are in.';
    h+='<div class="lrow'+(log?'':' pending')+'"><div class="lwhen">'+inp(p+'.month',{type:'month',w:'w-m',label:'Takes effect'})+'<span class="inh">'+(isSet(s.month)?'Manual':log?'Auto · '+ymLabel(log.ym):'Not reached')+'</span></div><div class="lwhat"><span class="small muted">When live ARR reaches</span>'+inp(p+'.arr',{num:1,w:'w-m',label:'ARR threshold'})+'<span class="why">'+why+'</span></div><div class="lpay">'+inp(p+'.salary',{num:1,w:'w-s',label:'Salary'})+'<span class="muted small">/mo each</span></div><div>'+del('del-step',i,'','Remove step')+'</div></div>';
  });
  h+='</div></div>';
  h+='<div class="panel"><div class="panel-head"><h3>Founders</h3>'+(readOnly?'':'<button class="btn small" data-act="add-founder">Add founder</button>')+'</div><div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>On payroll</th><th class="n" title="Share of the ladder salary">Salary %</th><th></th></tr></thead><tbody>'+state.founders.map((f,i)=>'<tr><td>'+inp('founders.'+i+'.name',{w:'w-m',label:'Name'})+'</td><td>'+inp('founders.'+i+'.role',{w:'w-m',label:'Role'})+'</td><td>'+inp('founders.'+i+'.onPayroll',{type:'checkbox',label:'On payroll'})+'</td><td>'+inp('founders.'+i+'.share',{num:1,w:'w-xs',label:'Salary share'})+'</td><td>'+del('del-founder',i)+'</td></tr>').join('')+'</tbody></table></div><p class="hint">Salary % scales the ladder for one person (100% = the full step). Founders off payroll receive nothing in this plan.</p>'+
    '<h3 class="mt">Steps as a share of ARR</h3><ul class="list-plain">'+order.map(({s})=>{const comb=pay.reduce((a,f)=>a+num(s.salary)*12*num(f.share,100)/100,0);return li($(num(s.salary))+'/mo each at '+$k(num(s.arr)),$(comb)+'/yr · '+pct(num(s.arr)?comb/num(s.arr)*100:NaN));}).join('')+'</ul></div></div>';
  h+='<div class="tbl-wrap"><table class="fin"><thead><tr><th>Year</th>'+yrs.map(y=>'<th class="n">'+y.key+'</th>').join('')+'</tr></thead><tbody>'+
    pay.map(f=>'<tr><td>'+esc(f.name)+'</td>'+yrs.map(y=>{const tot=pay.reduce((a,g)=>a+num(g.share,100),0)||1;return '<td class="n">'+$(y.salaries*num(f.share,100)/tot)+'</td>';}).join('')+'</tr>').join('')+
    '<tr class="strong"><td>Combined salaries</td>'+yrs.map(y=>'<td class="n">'+$(y.salaries)+'</td>').join('')+'</tr><tr class="sub"><td>As % of revenue</td>'+yrs.map(y=>'<td class="n">'+pct(y.revenue?y.salaries/y.revenue*100:NaN)+'</td>').join('')+'</tr><tr class="total"><td>Profit kept in company</td>'+yrs.map(y=>'<td class="n '+(y.net<0?'neg':'')+'">'+$(y.net)+'</td>').join('')+'</tr></tbody></table></div>';
  return h;
}

/* ---------- FORECAST ---------- */
function forecast(M){
  const q=aggregate(M.months,byQuarter).filter(g=>+g.key.slice(-4)<=2027), y=aggregate(M.months,byYear);
  const regNames=Array.from(new Set(M.airlines.map(x=>x.region)));
  const rows=[
    ...state.products.map(p=>['<i class="dot" style="background:'+cv(p.color)+'"></i> '+esc(p.short)+' licenses',g=>g.byProduct[p.id]||0,'sub']),
    ['Recurring licenses',g=>g.recurring],['Implementation fees',g=>g.impl],['Total revenue',g=>g.revenue,'strong'],
    ['Tools and infrastructure',g=>g.tools,'sub'],['Founder salaries',g=>g.salaries,'sub'],['Hires',g=>g.hires,'sub'],['Taxes and fees',g=>g.fees,'sub'],['Total costs',g=>g.costs,'strong'],
    ['Net profit',g=>g.net,'total'],['Net margin',g=>g.revenue?g.net/g.revenue*100:NaN,'sub','pct'],
    ['Cash collected',g=>g.cashIn,'sub'],['Withholding tax held back',g=>g.wht,'sub'],['Funding received',g=>g.funding,'sub'],['Distributions and tax',g=>g.dist+g.distTax+g.loanRepay,'sub'],['Cash at period end (re-forecast)',g=>g.cashB],['ARR at period end',g=>g.liveARR,'strong'],
    ...regNames.map(r=>['<i class="dot" style="background:'+regionColor(r)+'"></i> '+esc(r)+' ARR',g=>(g.arrByRegion||{})[r]||0,'sub']),
    ['Airlines live',g=>g.live,'','count']
  ];
  const table=(groups,title)=>'<div class="panel flush mb"><div class="panel-head pad"><h3>'+title+'</h3></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+groups.map(g=>'<th class="n">'+g.key+(g.months<(g.key.startsWith('Q')?3:12)?' <span class="nt">('+g.months+' mo)</span>':'')+'</th>').join('')+'</tr></thead><tbody>'+
    rows.map(([l,f,c,t])=>'<tr class="'+(c||'')+'"><td>'+l+'</td>'+groups.map(g=>{const v=f(g);return '<td class="n '+(t!=='pct'&&t!=='count'&&v<0?'neg':'')+'">'+(t==='pct'?pct(v):t==='count'?fmtCount(v):$(v))+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div></div>';
  let h='<div class="sec-head"><div><div class="eyebrow">Forecast</div><h2>'+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+esc(curScen().name)+', '+ymLabel(state.settings.startMonth)+' to '+ymLabel(state.settings.endMonth)+'</h2><p>Revenue is recognized monthly from go-live; implementation lands in the signing month. Cash follows billing: annual licenses are collected at go-live and each anniversary.</p></div><div class="toolbar">'+(downloads?'<button class="btn" data-act="csv">Monthly CSV</button><button class="btn" data-act="xlsx">Excel model</button><button class="btn cta-outline" data-act="pdf">Investor summary PDF</button>':'')+goto('general','Forecast window')+'</div></div>';
  return h+table(q,'Quarterly, 2026–2027')+table(y,'Annual');
}

/* ---------- COUNTRIES ---------- */
function subsetModel(filterFn){
  const s2=Object.assign({},state,{airlines:state.airlines.filter(filterFn),costs:[],salary:Object.assign({},state.salary,{base:0,steps:[]}),settings:Object.assign({},state.settings,{openingCash:0})});
  return compute(s2,view.scenario);
}
function countryStats(name){
  const list=state.airlines.map((a,i)=>({a,i,e:airlineEcon(state,a,0)})).filter(x=>x.a.country===name);
  const on=list.filter(x=>x.a.include!==false&&x.a.status!=='Lost');
  const t={n:on.length,listed:list.length,fleet:0,pilots:0,arr:0,impl:0,w:0};
  on.forEach(x=>{t.fleet+=num(x.a.fleet);t.pilots+=x.e.pilots;t.arr+=x.e.arr;t.impl+=x.e.impl;t.w+=x.e.arr*num(x.a.prob)/100;});
  return {list,t};
}
function countriesView(M){
  const totalARR=state.airlines.filter(a=>a.include!==false&&a.status!=='Lost').reduce((s,a)=>s+airlineEcon(state,a,0).arr,0);
  let h='<div class="sec-head"><div><div class="eyebrow">Countries</div><h2>Every country at a glance</h2><p>Open a country to see and edit its airlines, its revenue over time and its price adjustment.</p></div><div class="toolbar">'+goto('regions','Manage regions and countries')+'</div></div>';
  const regs=state.regions.map(r=>({name:r.name,color:cv(r.color),countries:r.countries.map(c=>c.name)}));
  const known=new Set(regs.flatMap(r=>r.countries)), extra=Array.from(new Set(state.airlines.map(a=>a.country).filter(c=>c&&!known.has(c))));
  if(extra.length) regs.push({name:'Unassigned',color:'var(--c-grey)',countries:extra});
  regs.forEach(r=>{
    h+='<section class="mb"><div class="rtitle" style="--rc:'+r.color+'"><span>'+esc(r.name)+'</span><span class="muted small">'+r.countries.length+' countries</span></div><div class="ccards">';
    r.countries.forEach(c=>{const {t}=countryStats(c), cty=countryOf(state,c), adj=cty?num(cty.priceAdj):0;
      h+='<button class="ccard" data-act="open-country" data-v="'+esc(c)+'" style="--rc:'+r.color+'"><span class="cname">'+esc(c)+(adj?'<span class="chip adj">'+(adj>0?'+':'')+adj+'% price</span>':'')+'</span><span class="cval">'+$(t.arr)+'</span><span class="csub">'+t.n+' airline'+(t.n===1?'':'s')+' · '+t.fleet+' aircraft · '+t.pilots+' pilots</span><span class="track"><span class="fill" style="width:'+(totalARR?Math.max(t.arr?1:0,t.arr/totalARR*100):0)+'%;background:'+r.color+'"></span></span><span class="csub">'+pct(totalARR?t.arr/totalARR*100:0)+' of ARR · weighted '+$k(t.w)+'</span></button>';});
    h+='</div></section>';
  });
  return h;
}
function countryDetail(name){
  const {list,t}=countryStats(name), reg=regionOf(state,name), cty=countryOf(state,name);
  const color=reg?cv(reg.color):'var(--c-grey)';
  const SM=subsetModel(a=>a.country===name), yrs=aggregate(SM.months,byYear);
  let h='<div class="crumbs"><button class="btn small" data-act="back-countries">← All countries</button><span class="muted small">'+esc(reg?reg.name:'Unassigned')+' / '+esc(name)+'</span></div>';
  h+='<div class="hero" style="--rc:'+color+'"><div><div class="eyebrow">'+esc(reg?reg.name:'Unassigned')+'</div><h2 class="big">'+esc(name)+'</h2><p class="muted">'+t.n+' of '+t.listed+' airlines in plan · '+(view.scenario==='plan'?'Plan case':'Weighted case')+'</p></div><div class="toolbar">'+(readOnly?'':'<button class="btn cta-outline" data-act="add-airline-country" data-v="'+esc(name)+'">Add airline in '+esc(name)+'</button>')+'</div></div>';
  h+='<div class="kpis">'+kpi('Full ARR',$(t.arr),'Weighted '+$(t.w),'lead')+kpi('Implementation',$(t.impl),'One-time, at signing','sky')+kpi('Fleet',String(t.fleet),'aircraft')+kpi('Pilots',t.pilots.toLocaleString(),t.fleet?(t.pilots/t.fleet).toFixed(1)+' per aircraft':'')+kpi('Avg ARR per airline',t.n?$(t.arr/t.n):'–','Year 1')+'</div>';
  if(cty){
    const ri=state.regions.indexOf(reg), ci=reg.countries.indexOf(cty);
    h+='<div class="panel mb"><div class="panel-head"><h3>Country settings</h3></div><div class="fields" style="grid-template-columns:minmax(150px,200px) minmax(0,1fr)">'+fld('Price adjustment %',inp('regions.'+ri+'.countries.'+ci+'.priceAdj',{num:1}),'Applied to licenses and implementation here')+fld('Notes',inp('regions.'+ri+'.countries.'+ci+'.notes',{ph:'Payments, regulator, sanctions…'}))+'</div></div>';
  }
  h+='<div class="panel mb"><div class="panel-head"><h3>Airlines</h3><span class="muted small">Click an airline to open all its details</span></div>';
  if(!list.length) h+='<p class="muted">No airlines in '+esc(name)+' yet.</p>';
  else h+='<div class="tbl-wrap"><table class="fin clickable"><thead><tr><th>Airline</th><th>Status</th><th>Product</th><th class="n">Fleet</th><th class="n">Pilots</th><th>Tier</th><th class="n">Prob %</th><th>Go-live</th><th class="n">ARR yr 1</th><th class="n">Impl.</th><th></th></tr></thead><tbody>'+list.map(({a,i,e})=>{const tm=timingOf(state,a);return '<tr class="'+(a.include===false||a.status==='Lost'?'off':'')+'" data-act="open-airline" data-v="'+esc(a.id)+'" tabindex="0"><td><b>'+esc(a.name)+'</b></td><td><span class="chip st-'+esc(a.status)+'">'+esc(a.status)+'</span></td><td><span class="chip" style="--cc:'+cv(e.product.color)+'">'+esc(e.product.short)+'</span></td><td class="n">'+num(a.fleet)+'</td><td class="n">'+e.pilots+'</td><td>'+esc(state.bands[e.tier0].label)+'</td><td class="n">'+num(a.prob)+'</td><td>'+ymLabel(tm.live)+'</td><td class="n"><b>'+$(e.arr)+'</b></td><td class="n">'+$(e.impl)+'</td><td class="n"><span class="open">Open →</span></td></tr>';}).join('')+'<tr class="total"><td>Total in plan</td><td></td><td></td><td class="n">'+t.fleet+'</td><td class="n">'+t.pilots+'</td><td></td><td></td><td></td><td class="n">'+$(t.arr)+'</td><td class="n">'+$(t.impl)+'</td><td></td></tr></tbody></table></div>';
  h+='</div>';
  h+='<div class="panel flush"><div class="panel-head pad"><h3>'+esc(name)+' revenue by year</h3></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+yrs.map(y=>'<th class="n">'+y.key+'</th>').join('')+'</tr></thead><tbody><tr><td>Licenses</td>'+yrs.map(y=>'<td class="n">'+$(y.recurring)+'</td>').join('')+'</tr><tr><td>Implementation</td>'+yrs.map(y=>'<td class="n">'+$(y.impl)+'</td>').join('')+'</tr><tr class="strong"><td>Total revenue</td>'+yrs.map(y=>'<td class="n">'+$(y.revenue)+'</td>').join('')+'</tr><tr class="sub"><td>Cash collected</td>'+yrs.map(y=>'<td class="n">'+$(y.cashIn)+'</td>').join('')+'</tr><tr class="total"><td>ARR at year end</td>'+yrs.map(y=>'<td class="n">'+$(y.liveARR)+'</td>').join('')+'</tr></tbody></table></div></div>';
  return h;
}

