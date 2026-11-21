  const bon=(M,k)=>M.months.filter(m=>m.ym.startsWith(k)).reduce((a,m)=>a+(m.bonus||0),0);
  h+='<div class="panel flush mb"><div class="panel-head pad"><h3>Playground by year</h3><span class="muted small">Small figures show the change against the plan</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+yrs.map(k=>'<th class="n">'+k+'</th>').join('')+'</tr></thead><tbody>'+
    row('Revenue',g=>g.revenue,'strong')+row('Total costs',g=>g.costs,'',{goodUp:false})+row('Founder pay (salaries + bonuses)',g=>g.salaries,'sub',{goodUp:false})+row('of which bonuses',(g,e,M,k)=>bon(M,k),'sub',{goodUp:false})+row('Net profit',g=>g.net,'total')+row('Cash at year end',(g,e)=>e.cashB)+row('ARR at year end',(g,e)=>e.liveARR,'strong')+row('Airlines live',(g,e)=>e.live,'',{cnt:1})+
    '</tbody></table></div></div>';
  // detail sections
  let pb='';
  S.products.forEach((p,pi)=>{pb+='<h3 class="mt">'+esc(p.name)+' <span class="muted small">'+esc(p.currency||'USD')+'</span></h3><div class="tbl-wrap"><table><thead><tr><th></th>'+S.bands.map(b=>'<th class="n">'+esc(b.label)+'</th>').join('')+'</tr></thead><tbody><tr><td>Per pilot / month</td>'+S.bands.map((b,bi)=>'<td>'+pgIn('s.products.'+pi+'.rates.'+bi,{num:1,w:'w-s',label:b.label+' rate'})+'</td>').join('')+'</tr><tr><td>Implementation</td>'+S.bands.map((b,bi)=>'<td>'+pgIn('s.products.'+pi+'.impl.'+bi,{num:1,w:'w-s',label:b.label+' implementation'})+'</td>').join('')+'</tr></tbody></table></div>';});
  pb+='<div class="fields mt">'+fld('Cabin crew /seat/mo',pgIn('s.seatPrices.cabinRate',{num:1}))+fld('Admin /user/mo',pgIn('s.seatPrices.adminRate',{num:1}))+fld('Instructor /user/mo',pgIn('s.seatPrices.instructorRate',{num:1}))+fld('Monthly billing premium %',pgIn('s.settings.monthlyPremium',{num:1}))+fld('Price increase at renewal %',pgIn('s.settings.priceIncrease',{num:1}))+fld('Pilots per aircraft',pgIn('s.ratios.pilotsPerAircraft',{num:1}))+fld('Cabin crew per aircraft',pgIn('s.ratios.cabinPerAircraft',{num:1}))+fld('Instructors per aircraft',pgIn('s.ratios.instructorsPerAircraft',{num:1}))+'</div><p class="hint">The price lever is applied on top of these numbers.</p>';
  const Pm=new Map(P.airlines.map(x=>[x.a.id,x]));
  const ab='<div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="airlines">Add airline</button></div><div class="tbl-wrap"><table class="fin"><thead><tr><th>In</th><th>Airline</th><th>Country</th><th>Status</th><th>Product</th><th class="n">Fleet</th><th class="n">Pilots</th><th class="n">Prob %</th><th>Signs</th><th>Goes live</th><th>Billing</th><th class="n">Disc. %</th><th class="n">ARR yr 1</th><th></th></tr></thead><tbody>'+
    S.airlines.map((a,i)=>{const p='s.airlines.'+i, x=Pm.get(a.id), tm=timingOf(S,a);return '<tr class="'+(a.include===false||a.status==='Lost'?'off':'')+'"><td>'+pgIn(p+'.include',{type:'checkbox',label:'Include '+a.name})+'</td><td>'+pgIn(p+'.name',{w:'w-l',label:'Airline'})+'</td><td>'+pgIn(p+'.country',{type:'select',options:ctyOpts,w:'w-m',label:'Country'})+'</td><td>'+pgIn(p+'.status',{type:'select',options:STATUSES,w:'w-s',label:'Status'})+'</td><td>'+pgIn(p+'.product',{type:'select',options:prodOpts,w:'w-s',label:'Product'})+'</td><td>'+pgIn(p+'.fleet',{num:1,w:'w-xs',label:'Fleet'})+'</td><td>'+pgIn(p+'.pilots',{num:1,blank:1,w:'w-xs',ph:String(Math.round(num(a.fleet)*num(S.ratios.pilotsPerAircraft))),label:'Pilots'})+'</td><td>'+pgIn(p+'.prob',{num:1,w:'w-xs',label:'Probability'})+'</td><td>'+pgIn(p+'.signMonth',{type:'month',w:'w-m',label:'Signs'})+(a.signMonth?'':'<span class="inh">'+ymLabel(tm.sign)+'</span>')+'</td><td>'+pgIn(p+'.goLiveMonth',{type:'month',w:'w-m',label:'Goes live'})+(a.goLiveMonth?'':'<span class="inh">'+ymLabel(tm.live)+'</span>')+'</td><td>'+pgIn(p+'.billing',{type:'select',options:[{v:'annual',l:'Annual'},{v:'monthly',l:'Monthly'}],w:'w-s',label:'Billing'})+'</td><td>'+pgIn(p+'.discount',{num:1,w:'w-xs',label:'Discount'})+'</td><td class="n"><b>'+(x?$(x.e.arr):'–')+'</b></td><td>'+pgDelBtn('airlines',i)+'</td></tr>';}).join('')+'</tbody></table></div><p class="hint">Blank dates follow the airline’s cohort (shown under the field). ARR includes the levers above.</p>';
  const cb='<div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="costs">Add cost</button></div><div class="tbl-wrap"><table class="fin"><thead><tr><th>Item</th><th>Charged</th><th class="n">Amount</th><th>Cur.</th><th>Billing</th><th class="n">Qty</th><th class="n">Growth %/yr</th><th>Starts</th><th>Ends</th><th class="n">'+y2+'</th><th></th></tr></thead><tbody>'+
    S.costs.map((x,i)=>{const p='s.costs.'+i;return '<tr><td>'+pgIn(p+'.name',{w:'w-l',label:'Cost'})+'</td><td>'+pgIn(p+'.basis',{type:'select',options:Object.entries(COST_BASES).map(([v,l])=>({v,l})),w:'w-l',label:'Charged'})+'</td><td>'+pgIn(p+'.amount',{num:1,w:'w-s',label:'Amount'})+'</td><td>'+(x.basis==='pctRevenue'?'%':pgIn(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'}))+'</td><td>'+pgIn(p+'.freq',{type:'select',options:[{v:'monthly',l:'Monthly'},{v:'yearly',l:'Yearly'},{v:'once',l:'One-time'}],w:'w-s',label:'Billing'})+'</td><td>'+pgIn(p+'.qty',{num:1,w:'w-xs',label:'Quantity'})+'</td><td>'+pgIn(p+'.growth',{num:1,w:'w-xs',label:'Growth'})+'</td><td>'+pgIn(p+'.startMonth',{type:'month',w:'w-m',label:'Start'})+'</td><td>'+pgIn(p+'.endMonth',{type:'month',w:'w-m',label:'End'})+'</td><td class="n">'+$((Y(ysP,y2).costItems||{})[x.id]||0)+'</td><td>'+pgDelBtn('costs',i)+'</td></tr>';}).join('')+'</tbody></table></div><p class="hint">The costs lever is applied on top of these amounts.</p>';
  const L=S.salary;
  const sb='<div class="fields mb">'+fld('Base salary each /mo ('+esc(MAINC())+')',pgIn('s.salary.base',{num:1}))+fld('Salaries start',pgIn('s.salary.startMonth',{type:'month'}))+fld('Lag after ARR is reached (mo)',pgIn('s.salary.lagMonths',{num:1}))+fld('Minimum gap between steps (mo)',pgIn('s.salary.minGapMonths',{num:1}))+'</div>'+
    '<div class="tbl-wrap mb"><table><thead><tr><th class="n">When live ARR reaches</th><th class="n">Salary each /mo</th><th>Takes effect (blank = auto)</th><th>Lands in playground</th><th></th></tr></thead><tbody>'+L.steps.map((x,i)=>{const lg=P.stepLog.find(l=>l.idx===i);return '<tr><td>'+pgIn('s.salary.steps.'+i+'.arr',{num:1,w:'w-m',label:'ARR threshold'})+'</td><td>'+pgIn('s.salary.steps.'+i+'.salary',{num:1,w:'w-s',label:'Salary'})+'</td><td>'+pgIn('s.salary.steps.'+i+'.month',{type:'month',w:'w-m',label:'Effective month'})+'</td><td>'+(lg?ymLabel(lg.ym):'<span class="muted">Not reached</span>')+'</td><td>'+pgDelBtn('salary.steps',i)+'</td></tr>';}).join('')+'</tbody></table></div><div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="salary.steps">Add salary step</button></div>'+
    '<div class="tbl-wrap mb"><table><thead><tr><th>Founder</th><th>On payroll</th><th class="n">Salary %</th></tr></thead><tbody>'+S.founders.map((f,i)=>'<tr><td>'+pgIn('s.founders.'+i+'.name',{w:'w-m',label:'Name'})+'</td><td>'+pgIn('s.founders.'+i+'.onPayroll',{type:'checkbox',label:'On payroll'})+'</td><td>'+pgIn('s.founders.'+i+'.share',{num:1,w:'w-xs',label:'Salary share'})+'</td></tr>').join('')+'</tbody></table></div>'+
    '<h3 class="mt">Bonuses</h3><div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="bonuses" data-v="profit">Add yearly profit share</button><button class="btn small" data-act="pg-add" data-k="bonuses" data-v="quarter">Add quarterly bonus</button><button class="btn small" data-act="pg-add" data-k="bonuses" data-v="salary">Add 13th-month salary</button></div>'+
    (S.bonuses.length?'<div class="tbl-wrap">'+bonusRulesTable(S.bonuses,pgIn,'s.bonuses',S.founders,true)+'</div>'+bonusPayouts(P):'<p class="muted">No bonuses in the playground yet.</p>')+'<div class="mt">'+founderPayTable(P,sA)+'</div>';
  const trig=[{v:'month',l:'On a date'},{v:'arr',l:'When live ARR reaches'},{v:'live',l:'When airlines live reach'}];
  const hb='<div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="hires">Add role</button></div>'+((S.hires||[]).length?'<div class="tbl-wrap"><table class="fin"><thead><tr><th>In</th><th>Role</th><th class="n">Salary /mo</th><th>Cur.</th><th>Trigger</th><th>Starts</th><th>Ends</th><th>Starts in playground</th><th></th></tr></thead><tbody>'+S.hires.map((x,i)=>{const p='s.hires.'+i, lg=(P.hireLog||[]).find(l=>l.id===x.id);return '<tr class="'+(x.include===false?'off':'')+'"><td>'+pgIn(p+'.include',{type:'checkbox',label:'Include'})+'</td><td>'+pgIn(p+'.role',{w:'w-l',label:'Role'})+'</td><td>'+pgIn(p+'.salary',{num:1,w:'w-s',label:'Salary'})+'</td><td>'+pgIn(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'})+'</td><td>'+pgIn(p+'.trigger',{type:'select',options:trig,w:'w-l',label:'Trigger'})+'</td><td>'+(x.trigger==='month'||!x.trigger?pgIn(p+'.month',{type:'month',w:'w-m',label:'Start'}):pgIn(p+'.value',{num:1,w:'w-s',label:'Trigger value'}))+'</td><td>'+pgIn(p+'.endMonth',{type:'month',w:'w-m',label:'End'})+'</td><td>'+(lg&&lg.start?ymLabel(lg.start):'<span class="muted">Not reached</span>')+'</td><td>'+pgDelBtn('hires',i)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="muted">No hires in the playground.</p>');
  const typeO=[{v:'equity',l:'Equity'},{v:'safe',l:'SAFE'},{v:'grant',l:'Grant'},{v:'loan',l:'Loan'}];
  const fb='<div class="fields mb">'+fld('Opening cash ('+esc(MAINC())+')',pgIn('s.settings.openingCash',{num:1}))+fld('Minimum cash ('+esc(MAINC())+')',pgIn('s.settings.minCash',{num:1}))+fld('Collection rate %',pgIn('s.settings.collectionRate',{num:1}))+'</div><div class="toolbar mb"><button class="btn small" data-act="pg-add" data-k="funding">Add funding round</button></div>'+((S.funding||[]).length?'<div class="tbl-wrap"><table class="fin"><thead><tr><th>In</th><th>Name</th><th>Type</th><th class="n">Amount</th><th>Cur.</th><th>Month</th><th></th></tr></thead><tbody>'+S.funding.map((f,i)=>{const p='s.funding.'+i;return '<tr class="'+(f.include===false?'off':'')+'"><td>'+pgIn(p+'.include',{type:'checkbox',label:'Include'})+'</td><td>'+pgIn(p+'.name',{w:'w-m',label:'Name'})+'</td><td>'+pgIn(p+'.type',{type:'select',options:typeO,w:'w-s',label:'Type'})+'</td><td>'+pgIn(p+'.amount',{num:1,w:'w-s',label:'Amount'})+'</td><td>'+pgIn(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'})+'</td><td>'+pgIn(p+'.month',{type:'month',w:'w-m',label:'Month'})+'</td><td>'+pgDelBtn('funding',i)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="muted">No funding rounds in the playground.</p>');
  const live=S.airlines.filter(a=>a.include!==false&&a.status!=='Lost').length;
  h+=pgSec('pricing','Pricing','Rates, implementation and seat prices',pb)+pgSec('airlines','Airlines',live+' in plan · fleet, pilots, dates, product',ab)+pgSec('costs','Costs',S.costs.length+' items',cb)+pgSec('pay','Founder salaries and bonuses',S.bonuses.length+' bonus rule'+(S.bonuses.length===1?'':'s'),sb)+pgSec('hires','Hiring',(S.hires||[]).length+' roles',hb)+pgSec('cash','Cash and funding','Opening cash, minimum cash, rounds',fb);
  return h;
}
function pgAction(a,b){
  const i=+b.dataset.i, k=b.dataset.k;
  if(a==='pg-reset'){ PG=null; lsDel(LS_PG); pgInit(true); pgSave(); render(); toast('Playground reset to your current plan'); return; }
  if(a==='pg-levers'){ PG.k=pgKnobs(); pgSave(); render(); return; }
  if(a==='pg-apply'){
    if(readOnly||cfgLocked){ toast('Only editors can apply the playground to the plan.'); return; }
    if(!window.confirm('Copy everything from the playground into the plan? The levers are built into the numbers. You can still Discard before saving.')) return;
    const n=pgApply(PG.s,PG.k); n.airlines.forEach(x=>{if(/^pgx/.test(x.id)){x.id=uid('a');x.stageLog=[];x.contact={name:'',role:'',email:'',phone:''};x.nextAction='';x.nextActionDate='';x.baselineSign=timingOf(n,x).sign||'';}}); (n.funding||[]).forEach(f=>{if(f.id==='pgf')f.id=uid('f');});
    n.settings.currencies=state.settings.currencies;
    state=n; PG={s:JSON.parse(JSON.stringify(n)),k:pgKnobs(),c:PG.c,open:PG.open,at:new Date().toISOString()}; pgSave(); commit(); toast('Playground copied into the plan. Review it, then click Save.'); return;
  }
  if(a==='pg-add'){
    const S=PG.s, nm=ymFromIndex(monthIndex(asOfYm())+3);
    if(k==='airlines'){ const l=S.airlines[S.airlines.length-1]||{}; S.airlines.push({id:uid('a'),name:'New airline',country:l.country||'',fleet:6,pilots:'',cabin:'',instructors:'',admins:'',product:S.products[0].id,cohort:'',signMonth:ymFromIndex(monthIndex(nm)-1),goLiveMonth:nm,status:'Pipeline',prob:50,billing:'annual',discount:0,growth:0,implOverride:'',include:true,notes:'',renewProb:''}); }
    else if(k==='costs') S.costs.push({id:uid('c'),name:'New cost',category:'Other',type:'ga',basis:'fixed',growth:0,amount:100,freq:'monthly',currency:MAINC(),qty:1,startMonth:S.settings.startMonth,endMonth:''});
    else if(k==='hires') (S.hires=S.hires||[]).push({id:uid('h'),role:'New role',type:'rd',salary:1000,currency:MAINC(),trigger:'month',month:ymFromIndex(monthIndex(asOfYm())+6),value:'',endMonth:'',growth:0,include:true});
    else if(k==='bonuses') S.bonuses.push(newBonus(b.dataset.v));
    else if(k==='funding') (S.funding=S.funding||[]).push({id:uid('f'),name:'New round',type:'safe',investor:'',amount:100000,currency:MAINC(),month:nm,preMoney:'',cap:'',discount:20,poolPct:0,interest:0,repayMonth:'',include:true});
    else if(k==='salary.steps'){ const s=S.salary.steps, top=s.reduce((m,x)=>num(x.arr)>num(m.arr)?x:m,{arr:0,salary:S.salary.base}); s.push({arr:num(top.arr)+150000,salary:num(top.salary)+500,month:''}); }
    pgSave(); render(); return;
  }
  if(a==='pg-del'){ const arr=getPath(PG.s,k); if(Array.isArray(arr)) arr.splice(i,1); pgSave(); render(); return; }
}

/* ---------- FORECAST (richer) ---------- */
let fcSensCache=null;
function fcBars(groups,lab){
  const W=1000,H=260,pl=56,pr=12,pt=14,pb=34,iw=W-pl-pr,ih=H-pt-pb;
  const mx=Math.max(1,...groups.map(g=>Math.max(g.revenue,g.costs))), mn=Math.min(0,...groups.map(g=>g.net));
  const step=niceStepM((mx-mn)/4), top=Math.ceil(mx/step)*step, bot=Math.floor(mn/step)*step, y=v=>pt+ih-(v-bot)/(top-bot||1)*ih, bw=iw/Math.max(1,groups.length);
  let g=''; for(let v=bot;v<=top+1e-6;v+=step) g+='<line class="'+(Math.abs(v)<1e-9?'ax':'gl')+'" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  const every=Math.ceil(groups.length/14);
  groups.forEach((G,i)=>{const x0=pl+i*bw,w=bw*0.36;
    g+='<rect x="'+(x0+bw*0.12).toFixed(1)+'" y="'+y(Math.max(0,G.revenue)).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(0,y(0)-y(Math.max(0,G.revenue))).toFixed(1)+'" style="fill:var(--c-sky)"><title>'+esc(lab(G))+' · revenue '+$(G.revenue)+'</title></rect>';
    g+='<rect x="'+(x0+bw*0.52).toFixed(1)+'" y="'+y(G.costs).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(0,y(0)-y(G.costs)).toFixed(1)+'" style="fill:var(--c-deep40)"><title>'+esc(lab(G))+' · costs '+$(G.costs)+'</title></rect>';
    if(i%every===0) g+='<text class="yr" x="'+(x0+bw/2)+'" y="'+(H-12)+'" text-anchor="middle">'+esc(lab(G))+'</text>';});
  g+='<polyline points="'+groups.map((G,i)=>(pl+i*bw+bw/2).toFixed(1)+','+y(G.net).toFixed(1)).join(' ')+'" style="fill:none;stroke:var(--coral);stroke-width:2.2"/>';
  groups.forEach((G,i)=>{g+='<circle cx="'+(pl+i*bw+bw/2).toFixed(1)+'" cy="'+y(G.net).toFixed(1)+'" r="3" style="fill:var(--coral)"><title>'+esc(lab(G))+' · net profit '+$(G.net)+'</title></circle>';});
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Revenue, costs and net profit by period">'+g+'</svg>';
}
function fcSensitivity(M){
  const met=view.fcSens||'arr', sc=curScen(), mode=view.scenario, ys=aggregate(M.months,byYear), ty=ys.some(g=>g.key==='2027')?'2027':ys[ys.length-1].key;
  const key=met+'|'+mode+'|'+sc.id+'|'+hash(JSON.stringify(state));
  if(fcSensCache&&fcSensCache.key===key) return fcSensCache.html;
  const base=applyScenario(state,sc), prices=[-20,-10,0,10,20], delays=[0,3,6,9];
  const val=Mx=>{const Y=aggregate(Mx.months,byYear).find(g=>g.key===ty), E=Mx.months.filter(m=>m.ym.startsWith(ty)).pop();return met==='arr'?E.liveARR:met==='rev'?Y.revenue:met==='net'?Y.net:Mx.R.minCash.v;};
  const grid=delays.map(d=>prices.map(p=>val(pgRun(pgApply(base,Object.assign(pgKnobs(),{price:p,delay:d})),mode))));
  const ref=grid[0][2], cls=v=>{const r=(v-ref)/Math.max(Math.abs(ref),1);return r<-0.15?'heat-a':r<-0.03?'heat-b':r>0.15?'heat-d':r>0.03?'heat-c':'';};
  const html='<div class="tbl-wrap"><table class="fin sens"><thead><tr><th>Deal timing ↓ · Prices →</th>'+prices.map(p=>'<th class="n">'+(p>0?'+':'')+p+'%</th>').join('')+'</tr></thead><tbody>'+delays.map((d,di)=>'<tr><td>'+(d?d+' months late':'On time')+'</td>'+grid[di].map((v,pi)=>'<td class="n '+cls(v)+(di===0&&pi===2?' hl':'')+'">'+$k(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  fcSensCache={key,html}; return html;
}
function forecast(M){
  const gran=view.fcGran||'quarter', yr=view.fcYear||'all';
  const keyFn=gran==='month'?(ym=>ym):gran==='year'?byYear:byQuarter, lab=G=>gran==='month'?MON[+G.key.slice(5,7)-1]+' '+G.key.slice(2,4):G.key;
  const all=aggregate(M.months,keyFn), years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4))));
  const groups=gran==='year'||yr==='all'?all:all.filter(g=>(gran==='month'?g.key.slice(0,4):g.key.slice(-4))===yr);
  const ex={}; [[all,keyFn],[aggregate(M.months,byYear),byYear]].forEach(([gs,fn])=>{ gs.forEach(g=>ex[g.key]={bonus:0,cum:0}); M.months.forEach(m=>{ex[fn(m.ym)].bonus+=(m.bonus||0);}); let cum=0; gs.forEach(g=>{cum+=g.net;ex[g.key].cum=cum;}); });
  const regNames=Array.from(new Set(M.airlines.map(x=>x.region)));
  const rows=[
    ...state.products.map(p=>['<i class="dot" style="background:'+cv(p.color)+'"></i> '+esc(p.short)+' licenses',g=>g.byProduct[p.id]||0,'sub']),
    ['Recurring licenses',g=>g.recurring],['Implementation fees',g=>g.impl],['Total revenue',g=>g.revenue,'strong'],
    ['Cost of service',g=>g.byType.cogs,'sub'],['Gross profit',g=>g.revenue-g.byType.cogs,'strong'],['Gross margin',g=>g.revenue?(g.revenue-g.byType.cogs)/g.revenue*100:NaN,'sub','pct'],
    ['Tools and infrastructure',g=>g.tools,'sub'],['Founder salaries',g=>g.salaries-ex[g.key].bonus,'sub'],['Founder bonuses',g=>ex[g.key].bonus,'sub'],['Hires',g=>g.hires,'sub'],['Taxes and fees',g=>g.fees,'sub'],['Total costs',g=>g.costs,'strong'],
    ['Net profit',g=>g.net,'total'],['Net margin',g=>g.revenue?g.net/g.revenue*100:NaN,'sub','pct'],['Cumulative net profit',g=>ex[g.key].cum,'sub'],
    ['Cash collected',g=>g.cashIn,'sub'],['Withholding tax held back',g=>g.wht,'sub'],['Operating cash flow',g=>g.cashIn-g.costs,'sub'],['Funding received',g=>g.funding,'sub'],['Distributions, tax and loan repayments',g=>g.dist+g.distTax+g.loanRepay,'sub'],['Cash at period end (re-forecast)',g=>g.cashB],['ARR at period end',g=>g.liveARR,'strong'],
    ...regNames.map(r=>['<i class="dot" style="background:'+regionColor(r)+'"></i> '+esc(r)+' ARR',g=>(g.arrByRegion||{})[r]||0,'sub']),
    ['Airlines live',g=>g.live,'','count'],['Pilots live',g=>g.livePilotsEnd||0,'sub','count']
  ];
  const full=g=>gran==='month'?1:gran==='quarter'?3:12;
  const table=(gs,title)=>'<div class="panel flush mb"><div class="panel-head pad"><h3>'+title+'</h3><span class="muted small">'+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+esc(curScen().name)+'</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+gs.map(g=>'<th class="n">'+esc(lab(g))+(g.months<full(g)?' <span class="nt">('+g.months+' mo)</span>':'')+'</th>').join('')+'</tr></thead><tbody>'+
    rows.map(([l,f,c,t])=>'<tr class="'+(c||'')+'"><td>'+l+'</td>'+gs.map(g=>{const v=f(g);return '<td class="n '+(t!=='pct'&&t!=='count'&&v<0?'neg':'')+'">'+(t==='pct'?pct(v):t==='count'?fmtCount(v):$(v))+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div></div>';
  const ys=aggregate(M.months,byYear), Yk=k=>ys.find(g=>g.key===k), y1=Yk('2027')?'2027':ys[0].key, y2=Yk('2028')?'2028':ys[ys.length-1].key, R=M.R, end=M.months[M.months.length-1];
  const bonusTot=M.months.reduce((a,m)=>a+(m.bonus||0),0);
  let h='<div class="sec-head"><div><div class="eyebrow">Forecast</div><h2>'+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+esc(curScen().name)+', '+ymLabel(state.settings.startMonth)+' to '+ymLabel(state.settings.endMonth)+'</h2><p>Revenue is recognized monthly from go-live; implementation lands in the signing month. Cash follows billing, country withholding and payment delays. Founder bonuses are included in costs.</p></div><div class="toolbar">'+(downloads?'<button class="btn" data-act="csv">Monthly CSV</button><button class="btn" data-act="xlsx">Excel model</button><button class="btn cta-outline" data-act="pdf">Investor summary PDF</button>':'')+'<button class="btn" data-act="tab" data-v="playground">Open playground</button>'+goto('general','Forecast window')+'</div></div>';
  h+='<div class="kpis">'+kpi('Revenue '+y1,$(Yk(y1).revenue),'Net '+$k(Yk(y1).net),'lead')+kpi('Revenue '+y2,$(Yk(y2).revenue),'Net '+$k(Yk(y2).net),'sky')+kpi('ARR at end',$(end.liveARR),fmtCount(end.live)+' airlines · '+ymLabel(end.ym))+kpi('Lowest cash',$(R.minCash.v),R.minCash.ym?ymLabel(R.minCash.ym):'',R.minCash.v<0?'alert':'')+kpi('Profit break-even',R.be?ymLabel(R.be.ym):'Not in horizon',(bonusTot?'Before bonuses · ':'')+(R.cashBe?'cash break-even '+ymLabel(R.cashBe.ym):'cash break-even not in horizon'))+kpi('Founder bonuses',$(bonusTot),bonusTot?'Across the forecast':'None set · Team tab')+'</div>';
  const segG=[['month','Months'],['quarter','Quarters'],['year','Years']].map(([k,l])=>'<button data-act="fc-gran" data-v="'+k+'" aria-pressed="'+(gran===k)+'">'+l+'</button>').join('');
  const segY=gran==='year'?'':'<div class="seg light" role="group" aria-label="Year">'+['all',...years].map(k=>'<button data-act="fc-year" data-v="'+k+'" aria-pressed="'+(yr===k)+'">'+(k==='all'?'All':k)+'</button>').join('')+'</div>';
  h+='<div class="panel mb"><div class="panel-head"><h3>Revenue, costs and net profit</h3><div class="toolbar"><div class="seg light" role="group" aria-label="Period">'+segG+'</div>'+segY+'</div></div>'+fcBars(groups,lab)+'<div class="legend"><span><i class="sw" style="background:var(--c-sky)"></i>Revenue</span><span><i class="sw" style="background:var(--c-deep40)"></i>Total costs</span><span><i class="sw line" style="background:var(--coral)"></i>Net profit</span></div></div>';
  const idx=M.months.findIndex(m=>m.ym===M.asOf), cs=[{name:'Plan cash',color:'var(--c-deep40)',values:M.months.map(m=>m.cash),dash:'5 4'},{name:'Re-forecast (actuals + plan)',color:'var(--c-deep)',values:M.months.map(m=>m.cashB)},{name:'Live ARR',color:'var(--c-sky)',values:M.months.map(m=>m.liveARR)}];
  h+='<div class="grid2 mb"><div class="panel"><h3>Cash and ARR, month by month</h3>'+lineChart(M.months.map(m=>m.ym),cs,{w:600,h:240,mark:idx,markLabel:'Today',label:'Cash and ARR by month'})+legendOf(cs)+'</div>';
  h+='<div class="panel"><div class="panel-head"><h3>What if prices or deal timing change?</h3><select class="in w-l" data-act="fc-sens" aria-label="Measure">'+[['arr','ARR at end of '+y1],['rev','Revenue '+y1],['net','Net profit '+y1],['cash','Lowest cash']].map(([k,l])=>'<option value="'+k+'"'+((view.fcSens||'arr')===k?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>'+fcSensitivity(M)+'<p class="hint">Each cell reruns the whole model with that price change and that delay on every unsigned deal. The outlined cell is your current plan. Use the Playground tab to test any other change.</p></div></div>';
  h+=table(groups,gran==='month'?'Monthly'+(yr==='all'?'':', '+yr):gran==='quarter'?'Quarterly'+(yr==='all'?'':', '+yr):'Annual');
  if(gran!=='year') h+=table(ys,'Annual');
  return h;
}

/* ---------- tabs, render and in-app back navigation ---------- */
TABS.splice(TABS.findIndex(t=>t[0]==='forecast')+1,0,['playground','Playground']);
const navRS=history.replaceState.bind(history), navPS=history.pushState.bind(history);
history.replaceState=function(s,t,u){ if(typeof u==='string'&&u.charAt(0)==='#') return; return navRS(s,t,u); };
let navPop=false, navWarnAt=0;
function navRoute(){ if(view.airline) return '#airline/'+encodeURIComponent(view.airline); if(view.tab==='countries'&&view.country) return '#countries/'+encodeURIComponent(view.country); return '#'+view.tab; }
function navApply(h){
  h=String(h||'').replace(/^#/,''); const parts=h.split('/'), t=parts[0]; let arg=''; try{arg=decodeURIComponent(parts.slice(1).join('/'));}catch(e){}
  if(t==='airline'&&arg){ view.airline=arg; }
  else if(t==='founders'){ view.tab='team'; view.airline=null; view.country=null; }
  else if(TABS.some(x=>x[0]===t)){ view.tab=t; view.airline=null; view.country=t==='countries'&&arg?arg:null; }
  persistView();
}
function navSync(){ const r=navRoute(); if(location.hash===r) return; if(navPop) navRS({stratos:1},'',r); else navPS({stratos:1},'',r); }
(function(){ if(location.hash&&location.hash!=='#') navApply(location.hash); const r=navRoute(); navRS({stratos:'root',root:1},'',r); navPS({stratos:1},'',r); })();
window.addEventListener('popstate',e=>{
  const st=e.state||{};
  if(st.root){
    if(Date.now()-navWarnAt<4000){ history.back(); return; }
    navWarnAt=Date.now(); navPS({stratos:1},'',navRoute());
    toast('Press back again to leave the finance tracker'+(isDirty()&&!readOnly?'. You have unsaved changes.':'.')); return;
  }
  navApply(location.hash); navPop=true; try{ render(); } finally { navPop=false; } window.scrollTo(0,0);
});
window.addEventListener('beforeunload',e=>{ if(isDirty()&&!readOnly&&!loading){ e.preventDefault(); e.returnValue=''; } });
function render(){
  const ae=document.activeElement, focusId=ae&&ae.id;
  const sx=window.scrollX, sy=window.scrollY, tw=document.querySelector('.tbl-wrap'), tsl=tw?tw.scrollLeft:0;
  document.getElementById('app').innerHTML=shell();
  let h='';
  if(loading){ document.getElementById('content').innerHTML='<div class="panel loadpanel"><span class="spin" aria-hidden="true"></span><div><h3>Loading the latest saved version</h3><p class="muted">Fetching the tracker from the shared database.</p></div></div>'; return; }
  if(dbMode==='offline') h+='<div class="banner warn"><span class="grow">The shared database isn’t available here, so you’re seeing the last saved snapshot read-only.</span></div>';
  else if(dbMode==='noaccess') h+='<div class="banner"><span class="grow">You can view this tracker but not save changes to it.</span></div>';
  if(remoteNewer) h+='<div class="banner warn"><span class="grow">'+esc((remoteNewer.byName||'Someone')+' saved a newer version '+fmtWhen(remoteNewer.at)+'. Saving now will replace it with your version.')+'</span><button class="btn small" data-act="load-remote">Load their version</button><button class="btn small" data-act="keep-mine">Keep mine</button></div>';
  if(restored) h+='<div class="banner"><span class="grow">Your unsaved changes from this browser were restored.</span>'+(readOnly?'':'<button class="btn small" data-act="discard">Discard them</button>')+'</div>';
  if(staleDraft) h+='<div class="banner warn"><span class="grow">A newer version was saved since your last edits in this browser. Your edits are kept but not shown.</span><button class="btn small" data-act="restore-stale">Load my edits</button><button class="btn small" data-act="drop-stale">Delete them</button></div>';
  const M=modelFor(curScen());
  if(curScen().id!=='base'&&view.tab!=='playground') h+='<div class="banner scen" style="--pc:'+cv(curScen().color)+'"><span class="grow"><b>'+esc(curScen().name)+' scenario.</b> Every tab shows the plan with this scenario’s adjustments. Switch back to Base in the top bar.</span><button class="btn small" data-act="use-scen" data-v="base">Back to Base</button></div>';
  if(cfgLocked&&!readOnly) h+='<div class="banner"><span class="grow">You can update airlines, invoices and actuals. Pricing, costs, funding and settings are locked to editors.</span></div>';
  if(view.airline&&!state.airlines.some(x=>x.id===view.airline)) view.airline=null;
  if(view.airline) h+=airlineDetail(view.airline);
  else if(view.tab==='countries') h+=view.country?countryDetail(view.country):countriesView(M);
  else h+=({overview,pipeline,pricing,costs,team:teamView,invoices:invoicesView,actuals:actualsView,funding:fundingView,scenarios:scenariosView,metrics:metricsView,forecast,playground:pgView,settings}[view.tab]||overview)(M);
  h+='<footer class="foot"><span>Last saved version dated '+esc(state.updated||'')+'. A planning model built from your inputs, not accounting records.</span><span class="muted">STRATOS · Intelligence-Driven Aviation</span></footer>';
  document.getElementById('content').innerHTML=h;
  const tw2=document.querySelector('.tbl-wrap'); if(tw2) tw2.scrollLeft=tsl;
  if(pendingScroll){const el=document.getElementById(pendingScroll);pendingScroll=null;if(el){el.scrollIntoView({block:'start'});}} else window.scrollTo(sx,sy);
  if(focusId){const el=document.getElementById(focusId); if(el) el.focus({preventScroll:true});}
  navSync();
}

/* ---------- events for the new modules ---------- */
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return;
  if(el.dataset.pg){
    let v; const k=el.dataset.kind;
    if(k==='bool') v=el.checked;
    else if(k==='num'||k==='money'){ if(el.value===''&&el.dataset.blank) v=''; else { v=parseFloat(el.value); if(!isFinite(v)) v=el.dataset.blank?'':0; else if(k==='money') v=Math.round(v*DR()*1e6)/1e6; } }
    else v=el.value;
    setPath(PG,el.dataset.pg,v); pgSave(); scheduleRender(); return;
  }
  if(el.dataset.act==='fc-sens'){ view.fcSens=el.value; persistView(); scheduleRender(); }
});
document.addEventListener('input',e=>{ const el=e.target; if(el&&el.classList&&el.classList.contains('pgr')){ const o=document.getElementById(el.id+'-v'); if(o) o.textContent=pgFmtKnob(el.dataset.pg,el.value); } });
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.pgsec&&PG){ PG.open[d.dataset.pgsec]=d.open; pgSave(); } },true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.tagName==='SELECT'||b.tagName==='INPUT') return;
  const a=b.dataset.act;
  if(a==='fc-gran'){ view.fcGran=b.dataset.v; if(view.fcGran==='month'&&(!view.fcYear||view.fcYear==='all')) view.fcYear=state.settings.startMonth.slice(0,4)==='2026'?'2027':state.settings.startMonth.slice(0,4); persistView(); render(); return; }
  if(a==='fc-year'){ view.fcYear=b.dataset.v; persistView(); render(); return; }
  if(a.startsWith('pg-')){ pgAction(a,b); return; }
  if(a==='add-bonus'||a==='del-bonus'){
    if(readOnly||cfgLocked) return;
    if(a==='add-bonus'){ state.bonuses=state.bonuses||[]; state.bonuses.push(newBonus(b.dataset.v)); }
    else state.bonuses.splice(+b.dataset.i,1);
    commit();
  }
});
