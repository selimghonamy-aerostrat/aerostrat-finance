/* ===== STRATOS finance engine v2 (pure) ===== */
function monthIndex(ym){ if(!ym||typeof ym!=='string') return NaN; const [y,m]=ym.split('-').map(Number); return y*12+(m-1); }
function ymFromIndex(i){ const y=Math.floor(i/12), m=i%12+1; return y+'-'+String(m).padStart(2,'0'); }
function num(v,d){ const n=parseFloat(v); return isFinite(n)?n:(d||0); }
function isSet(v){ return v!==''&&v!==null&&v!==undefined; }

function bandFor(s,pilots){
  const b=s.bands;
  for(let i=0;i<b.length;i++){ const max=b[i].maxPilots; if(i===b.length-1||!isSet(max)||pilots<=num(max)) return i; }
  return b.length-1;
}
function productOf(s,a){ return s.products.find(p=>p.id===a.product)||s.products[0]; }
function timingOf(s,a){
  const c=s.cohorts.find(c=>c.id===a.cohort);
  return { sign:a.signMonth||(c&&c.signMonth)||'', live:a.goLiveMonth||(c&&c.goLiveMonth)||'', cohort:c };
}
function regionOf(s,country){
  for(const r of s.regions) if(r.countries.some(c=>c.name===country)) return r;
  return null;
}
function countryOf(s,name){ for(const r of s.regions){ const c=r.countries.find(c=>c.name===name); if(c) return c; } return null; }
/* k = contract year index (0 = first year after go-live). */
function airlineEcon(s,a,k){
  k=k||0;
  const r=s.ratios, P=productOf(s,a), sp=s.seatPrices, S=s.settings;
  const fleet0=num(a.fleet), fleet=Math.max(0,fleet0+num(a.growth)*k);
  const f=fleet0?fleet/fleet0:1;
  const pilots0=isSet(a.pilots)?num(a.pilots):Math.round(fleet0*num(r.pilotsPerAircraft));
  const pilots=isSet(a.pilots)?Math.round(num(a.pilots)*f):Math.round(fleet*num(r.pilotsPerAircraft));
  const cabin=isSet(a.cabin)?Math.round(num(a.cabin)*f):Math.round(fleet*num(r.cabinPerAircraft));
  const instructors=isSet(a.instructors)?num(a.instructors)*f:fleet*num(r.instructorsPerAircraft);
  const admins=isSet(a.admins)?num(a.admins):num(r.adminsPerAirline);
  const t0=bandFor(s,pilots0), t=bandFor(s,pilots);
  const pf=fxOf(s,P.currency), sf=fxOf(s,sp.currency);
  const rate0=num(P.rates[t0])*pf, rateNew=num(P.rates[t])*pf;
  const prem=a.billing==='monthly'?1+num(S.monthlyPremium)/100:1;
  const inc=Math.pow(1+num(S.priceIncrease)/100,k);
  const disc=1-num(a.discount)/100;
  const cty=countryOf(s,a.country), adj=1+num(cty&&cty.priceAdj)/100;
  const mult=12*prem*inc*disc*adj;
  const seats={
    pilots:(Math.min(pilots,pilots0)*rate0+Math.max(0,pilots-pilots0)*rateNew)*mult,
    cabin:P.seats.cabin?cabin*num(sp.cabinRate)*sf*mult:0,
    admin:P.seats.admin?admins*num(sp.adminRate)*sf*mult:0,
    instructors:P.seats.instructor?instructors*num(sp.instructorRate)*sf*mult:0
  };
  const arr=seats.pilots+seats.cabin+seats.admin+seats.instructors;
  const impl=isSet(a.implOverride)?num(a.implOverride):num(P.impl[t0])*pf*adj;
  return {fleet,pilots,pilots0,cabin,instructors,admins,tier:t,tier0:t0,rate:rate0,product:P,impl,seats,arr,
    perPilotMonth:pilots?arr/12/pilots:0};
}
function fxOf(s,cur){
  if(!cur||cur==='USD') return 1;
  if(cur==='MAIN') cur=(s.settings&&s.settings.mainCurrency)||'USD';
  if(cur==='USD') return 1;
  const L=(s.settings&&s.settings.currencies)||[];
  const c=L.find(x=>x.code===cur);
  if(c) return num(c.usd,1);
  if(cur==='EUR') return num(s.settings.eurUsd,1);
  return 1;
}
const COST_TYPES={cogs:'Cost of service (COGS)',sm:'Sales & marketing',rd:'Product & engineering',ga:'General & admin'};
const COST_TYPES_SHORT={cogs:'Cost of service',sm:'Sales & marketing',rd:'Product & eng.',ga:'General & admin'};
const FEE_BASES={pctCollected:'% of cash collected',pctRevenue:'% of revenue',perPayment:'$ per customer payment',perNewAirline:'$ per new airline signed',pctPayroll:'% of salaries & hires',pctFunding:'% of funding raised',monthly:'$ per month',yearly:'$ per year',once:'$ once'};
const FEE_PCT=new Set(['pctCollected','pctRevenue','pctPayroll','pctFunding']);
const COST_BASES={fixed:'Fixed',perAirline:'Per live airline',perAircraft:'Per live aircraft',perPilot:'Per live pilot',perSeat:'Per live seat (all users)',perNewAirline:'Per new airline (onboarding)',pctRevenue:'% of revenue'};
/* cost of item c in month m, given that month's drivers */
function costAt(s,c,m,start,mo){
  const fx=fxOf(s,c.currency);
  let cs=isSet(c.startMonth)?monthIndex(c.startMonth):start; if(!isFinite(cs)) cs=start;
  const ce=isSet(c.endMonth)?monthIndex(c.endMonth):Infinity;
  if(m<cs||m>ce) return 0;
  const grow=Math.pow(1+num(c.growth)/100,Math.floor((m-cs)/12));
  const amt=num(c.amount)*num(c.qty,1)*fx*grow, b=c.basis||'fixed';
  if(b==='pctRevenue') return mo.revenue*num(c.amount)/100*num(c.qty,1);
  if(b==='perNewAirline') return amt*mo.newSigned;
  let base;
  if(c.freq==='yearly') base=(m-cs)%12===0?amt:0;
  else if(c.freq==='once') base=m===cs?amt:0;
  else base=amt;
  const drv=b==='perAirline'?mo.live:b==='perAircraft'?mo.liveFleet:b==='perPilot'?mo.livePilots:b==='perSeat'?mo.liveSeats:1;
  return base*drv;
}
function costMonthlyUSD(s,c,drivers){ // run-rate per month at given drivers (defaults to 1 unit)
  const fx=fxOf(s,c.currency), amt=num(c.amount)*num(c.qty,1)*fx, b=c.basis||'fixed', d=drivers||{};
  if(b==='pctRevenue') return (d.revenue||0)*num(c.amount)/100*num(c.qty,1);
  if(b==='perNewAirline') return amt*(d.newSigned||0);
  const per=c.freq==='yearly'?amt/12:c.freq==='once'?0:amt;
  const drv=b==='perAirline'?(d.live||0):b==='perAircraft'?(d.liveFleet||0):b==='perPilot'?(d.livePilots||0):b==='perSeat'?(d.liveSeats||0):1;
  return per*drv;
}

function renewOf(s,a){ return Math.max(0,Math.min(100,isSet(a.renewProb)?num(a.renewProb):num(s.settings.renewalRate,100)))/100; }
function hireStart(s,h,months,start){
  if(h.include===false) return Infinity;
  const t=h.trigger||'month';
  if(t==='month'){ const m=monthIndex(h.month); return isFinite(m)?m:Infinity; }
  for(let i=0;i<months.length;i++){ const mo=months[i]; if(t==='arr'&&mo.liveARR>=num(h.value)) return start+i; if(t==='live'&&mo.live>=num(h.value)-1e-9) return start+i; }
  return Infinity;
}
function compute(s,scenario){
  const S=s.settings;
  let start=monthIndex(S.startMonth||'2026-10'), end=monthIndex(S.endMonth||'2030-12');
  if(!isFinite(start)) start=monthIndex('2026-10');
  if(!isFinite(end)||end<start) end=start+11;
  const N=Math.min(end-start+1,180);
  const months=[];
  for(let i=0;i<N;i++) months.push({ym:ymFromIndex(start+i),recurring:0,impl:0,tools:0,salaries:0,hires:0,liveARR:0,live:0,liveFleet:0,livePilots:0,liveSeats:0,newSigned:0,newLive:0,billed:0,cashIn:0,wht:0,funding:0,loanRepay:0,dist:0,distTax:0,fees:0,events:0,feeItems:{},byCty:{},salaryEach:0,fixedCosts:0,varCosts:0,arrNew:0,arrExp:0,arrChurn:0,byProduct:{},arrByRegion:{},costItems:{},byType:{cogs:0,sm:0,rd:0,ga:0},hireItems:{}});
  const weighted=scenario==='weighted';
  const airlines=(s.airlines||[]).filter(a=>a.include!==false&&a.status!=='Lost').map(a=>{
    const tm=timingOf(s,a), reg=regionOf(s,a.country), cty=countryOf(s,a.country);
    const w=weighted?num(a.prob)/100:1;
    return {a,e:airlineEcon(s,a,0),w,sign:monthIndex(tm.sign),live:monthIndex(tm.live),region:reg?reg.name:'Unassigned',renew:renewOf(s,a),
      wht:num(cty&&cty.wht)/100, delay:Math.max(0,Math.round(num(cty&&cty.payDelay))), collect:(cty&&isSet(cty.collectRate)?num(cty.collectRate):num(S.collectionRate,100))/100};
  });
  const cty_=(mo,c)=>mo.byCty[c]||(mo.byCty[c]={rev:0,col:0,ev:0,neu:0});
  const addCash=(i,amt,x)=>{ months[i].billed+=amt; const j=i+x.delay; if(j<N){ const net=amt*x.collect, got=net*(1-x.wht); months[j].cashIn+=got; months[j].wht+=net*x.wht; const b=cty_(months[j],x.a.country||''); b.col+=got; b.ev+=x.w; months[j].events+=x.w; } };
  for(const x of airlines){
    const cache={};
    const econ=k=>cache[k]||(cache[k]=airlineEcon(s,x.a,k));
    x.econ=econ;
    for(let i=0;i<N;i++){
      const m=start+i, mo=months[i];
      if(m===x.sign){ mo.impl+=x.e.impl*x.w; addCash(i,x.e.impl*x.w,x); mo.newSigned+=x.w; const b=cty_(mo,x.a.country||''); b.rev+=x.e.impl*x.w; b.neu+=x.w; }
      if(isFinite(x.live)&&m>=x.live){
        const k=Math.floor((m-x.live)/12), surv=Math.pow(x.renew,k), e=econ(k), arr=e.arr*x.w*surv, sw=x.w*surv;
        if(m===x.live){ mo.arrNew+=arr; mo.newLive+=x.w; }
        else if(k>=1&&(m-x.live)%12===0){ const prev=econ(k-1).arr*x.w*Math.pow(x.renew,k-1); mo.arrChurn+=prev*(1-x.renew); mo.arrExp+=arr-prev*x.renew; }
        cty_(mo,x.a.country||'').rev+=arr/12;
        mo.recurring+=arr/12; mo.liveARR+=arr; mo.live+=sw; mo.liveFleet+=e.fleet*sw; mo.livePilots+=e.pilots*sw; mo.liveSeats+=(e.pilots+(e.product.seats.cabin?e.cabin:0)+(e.product.seats.admin?e.admins:0)+(e.product.seats.instructor?e.instructors:0))*sw;
        mo.byProduct[e.product.id]=(mo.byProduct[e.product.id]||0)+arr/12;
        mo.arrByRegion[x.region]=(mo.arrByRegion[x.region]||0)+arr;
        if(x.a.billing==='monthly') addCash(i,arr/12,x);
        else if((m-x.live)%12===0) addCash(i,arr,x);
      }
    }
  }
  // salary ladder
  const L=s.salary;
  const steps=L.steps.map((st,idx)=>Object.assign({idx},st)).sort((a,b)=>num(a.arr)-num(b.arr));
  const payroll=s.founders.filter(f=>f.onPayroll);
  let salStart=isSet(L.startMonth)?monthIndex(L.startMonth):start; if(!isFinite(salStart)) salStart=start;
  let level=-1,lastChange=-1e9; const reached={}, stepLog=[];
  for(let i=0;i<N;i++){
    const m=start+i, mo=months[i];
    steps.forEach((st,k)=>{ if(reached[k]===undefined&&mo.liveARR>=num(st.arr)) reached[k]=m; });
    const nx=level+1;
    if(nx<steps.length){
      const st=steps[nx];
      if(isSet(st.month)){
        const om=monthIndex(st.month);
        if(isFinite(om)&&m>=om){ level=nx; lastChange=m;
          stepLog.push({idx:st.idx,ym:mo.ym,salary:num(st.salary),threshold:num(st.arr),reachedYm:reached[nx]!==undefined?ymFromIndex(reached[nx]):'',reason:'manual'}); }
      } else if(reached[nx]!==undefined&&m>=reached[nx]+num(L.lagMonths)&&m-lastChange>=num(L.minGapMonths)){
        level=nx; lastChange=m;
        stepLog.push({idx:st.idx,ym:mo.ym,salary:num(st.salary),threshold:num(st.arr),reachedYm:ymFromIndex(reached[nx]),reason:m>reached[nx]+num(L.lagMonths)?'gap':'lag'});
      }
    }
    const each=level<0?num(L.base):num(steps[level].salary);
    mo.salaryEach=m>=salStart?each:0;
    mo.salaries=m>=salStart?payroll.reduce((a,f)=>a+each*num(f.share,100)/100,0):0;
  }
  for(const mo of months) mo.revenue=mo.recurring+mo.impl;
  // hires (triggered by month, live ARR or live airlines)
  const onCost=1+num(S.employerCost)/100, hireLog=[];
  for(const h of (s.hires||[])){
    const hs=hireStart(s,h,months,start), fx=fxOf(s,h.currency);
    hireLog.push({id:h.id,start:isFinite(hs)?ymFromIndex(hs):''});
    if(!isFinite(hs)) continue;
    for(let i=Math.max(0,hs-start);i<N;i++){ const m=start+i, mo=months[i];
      const he=isSet(h.endMonth)?monthIndex(h.endMonth):Infinity; if(m>he) break;
      const v=num(h.salary)*fx*onCost*Math.pow(1+num(h.growth)/100,Math.floor((m-hs)/12));
      mo.hires+=v; mo.hireItems[h.id]=v; mo.byType[h.type||'rd']+=v; }
  }
  const smShare=Math.max(0,Math.min(100,num(S.salesSalaryShare)))/100;
  for(const c of s.costs) for(let i=0;i<N;i++){ const mo=months[i], v=costAt(s,c,start+i,start,mo); mo.tools+=v; mo.costItems[c.id]=(mo.costItems[c.id]||0)+v; mo.byType[c.type||'ga']+=v; if((c.basis||'fixed')==='fixed') mo.fixedCosts+=v; else mo.varCosts+=v; }
  // funding, loans, distributions
  for(const f of (s.funding||[])){ if(f.include===false) continue; const ff=fxOf(s,f.currency), i=monthIndex(f.month)-start; if(i>=0&&i<N) months[i].funding+=num(f.amount)*ff;
    if(f.type==='loan'&&isSet(f.repayMonth)){ const j=monthIndex(f.repayMonth)-start; if(j>=0&&j<N) months[j].loanRepay+=num(f.amount)*ff*(1+num(f.interest)/100*Math.max(0,(monthIndex(f.repayMonth)-monthIndex(f.month))/12)); } }
  const cr=num(S.corpTaxRate,22)/100;
  for(const d of (s.distributions||[])){ const i=monthIndex(d.month)-start; if(i>=0&&i<N){ months[i].dist+=num(d.amount); months[i].distTax+=cr<1?num(d.amount)*cr/(1-cr):0; } }
  // taxes & fees (editable in Settings)
  const inScope=(f,c)=>{ const sc=f.scope||''; if(!sc) return true; if(sc.startsWith('c:')) return sc.slice(2)===c; if(sc.startsWith('r:')){ const r=(s.regions||[]).find(x=>x.id===sc.slice(2)); return !!(r&&r.countries.some(k=>k.name===c)); } return true; };
  for(const f of (s.fees||[])){ if(f.include===false) continue;
    let fs=isSet(f.startMonth)?monthIndex(f.startMonth):start; if(!isFinite(fs)) fs=start; const fe=isSet(f.endMonth)?monthIndex(f.endMonth):Infinity;
    const rate=num(f.rate)/100, amt=num(f.amount)*fxOf(s,f.currency);
    for(let i=0;i<N;i++){ const m=start+i, mo=months[i]; if(m<fs||m>fe) continue;
      let base=0, scoped=false; const b=f.basis||'pctCollected';
      const sum=k=>{ let t=0; for(const c in mo.byCty) if(inScope(f,c)) t+=mo.byCty[c][k]; return t; };
      if(b==='pctCollected') base=sum('col')*rate;
      else if(b==='pctRevenue') base=sum('rev')*rate;
      else if(b==='perPayment') base=sum('ev')*amt;
      else if(b==='perNewAirline') base=sum('neu')*amt;
      else if(b==='pctPayroll') base=(mo.salaries+mo.hires)*rate;
      else if(b==='pctFunding') base=mo.funding*rate;
      else if(b==='monthly') base=amt;
      else if(b==='yearly') base=(m-fs)%12===0?amt:0;
      else if(b==='once') base=m===fs?amt:0;
      if(base){ mo.fees+=base; mo.feeItems[f.id]=(mo.feeItems[f.id]||0)+base; mo.byType[f.type||'ga']+=base; }
    }
  }
  let cash=num(S.openingCash);
  for(const mo of months){
    mo.byType.ga+=mo.salaries*(1-smShare); mo.byType.sm+=mo.salaries*smShare;
    mo.revenue=mo.recurring+mo.impl; mo.costs=mo.tools+mo.salaries+mo.hires+mo.fees; mo.net=mo.revenue-mo.costs;
    mo.cashOut=mo.costs+mo.dist+mo.distTax+mo.loanRepay;
    cash+=mo.cashIn+mo.funding-mo.cashOut; mo.cash=cash;
  }
  const pending=steps.filter(st=>!stepLog.some(l=>l.idx===st.idx)).map(st=>({idx:st.idx,salary:num(st.salary),threshold:num(st.arr),manual:isSet(st.month)}));
  return {months,airlines,stepLog,pending,hireLog,start};
}
/* Re-forecast: actual months (up to asOf) replace plan cash flows; plan continues afterwards. */
function invoiceTotals(s){
  const inv={},col={};
  for(const v of (s.invoices||[])){
    const vf=fxOf(s,v.currency), im=(v.issue||'').slice(0,7); if(im) inv[im]=(inv[im]||0)+num(v.amount)*vf;
    if(v.paidDate){ const pm=v.paidDate.slice(0,7); col[pm]=(col[pm]||0)+(isSet(v.paidAmount)?num(v.paidAmount):num(v.amount))*vf; }
  }
  return {inv,col};
}
function blendActuals(s,M,asOf){
  const T=invoiceTotals(s), A=s.actuals||{}, asI=monthIndex(asOf);
  let cash=num(s.settings.openingCash), lastActual=null;
  for(const mo of M.months){
    const a=A[mo.ym]||{}, mi=monthIndex(mo.ym), past=mi<=asI;
    const invoiced=isSet(a.invoiced)?num(a.invoiced):(T.inv[mo.ym]||0), collected=isSet(a.collected)?num(a.collected):(T.col[mo.ym]||0);
    const has=past&&(isSet(a.invoiced)||isSet(a.collected)||isSet(a.spent)||T.inv[mo.ym]||T.col[mo.ym]);
    const spent=isSet(a.spent)?num(a.spent):(has?mo.costs:0);
    mo.act={has:!!has,invoiced,collected,spent,note:a.note||'',autoInv:!isSet(a.invoiced),autoCol:!isSet(a.collected),autoSpent:!isSet(a.spent)};
    if(has){ cash+=collected+mo.funding-spent-mo.dist-mo.distTax-mo.loanRepay; lastActual=mo.ym; mo.actual=true; }
    else { cash+=mo.cashIn+mo.funding-mo.cashOut; mo.actual=false; }
    mo.cashB=cash;
  }
  M.lastActual=lastActual; M.asOf=asOf;
  return M;
}
function runwayInfo(s,M){
  const asI=monthIndex(M.asOf), ms=M.months, i0=Math.max(0,ms.findIndex(m=>monthIndex(m.ym)>=asI));
  const now=ms[i0]||ms[0];
  let neg=null; for(let i=i0;i<ms.length;i++){ if(ms[i].cashB<0){ neg=ms[i]; break; } }
  const runway=neg?monthIndex(neg.ym)-monthIndex(now.ym):null;
  let be=null; for(let i=0;i<ms.length;i++){ if(ms.slice(i).every(m=>m.net>=0)&&ms[i].revenue>0){ be=ms[i]; break; } }
  let cashBe=null; for(let i=i0;i<ms.length;i++){ const m=ms[i]; if(ms.slice(i).every(x=>x.cashIn-x.costs>=0)){ cashBe=m; break; } }
  const last3=ms.slice(Math.max(0,i0-2),i0+1), burn=last3.length?last3.reduce((a,m)=>a+(m.actual?m.act.spent-m.act.collected:m.cashOut-m.cashIn),0)/last3.length:0;
  const minC=ms.slice(i0).reduce((a,m)=>m.cashB<a.v?{v:m.cashB,ym:m.ym}:a,{v:Infinity,ym:''});
  const below=ms.slice(i0).find(m=>m.cashB<num(s.settings.minCash));
  return {now,runway,neg,be,cashBe,burn,minCash:minC,below,horizon:ms.length-i0};
}
/* Unit economics per period group (from aggregate) */
function unitEcon(s,g,end){
  const ren=(s.airlines||[]).filter(a=>a.include!==false&&a.status!=='Lost');
  const avgRenew=ren.length?ren.reduce((t,a)=>t+renewOf(s,a),0)/ren.length:num(s.settings.renewalRate,100)/100;
  const churn=1-avgRenew, arpa=end.live?end.liveARR/end.live:0;
  const gm=g.revenue?(g.revenue-g.byType.cogs)/g.revenue:NaN;
  const cac=g.newSigned>0&&g.byType.sm>0?g.byType.sm/g.newSigned:NaN;
  const cap=num(s.settings.ltvCapYears,5);
  const life=churn>0?Math.min(1/churn,cap):cap;
  const ltv=arpa*(isFinite(gm)?gm:1)*life;
  const payback=isFinite(cac)&&arpa?cac/(arpa/12*(isFinite(gm)?gm:1)):NaN;
  const startARR=g.startARR||0, nrr=startARR?(startARR+g.arrExp-g.arrChurn)/startARR:NaN;
  return {arpa,gm,cac,ltv,payback,ltvCac:isFinite(cac)&&cac>0?ltv/cac:NaN,churn,life,nrr,revPerPilot:end.livePilots?end.recurring/end.livePilots:0,burnMultiple:g.net<0&&g.arrNew+g.arrExp-g.arrChurn>0?-g.net/(g.arrNew+g.arrExp-g.arrChurn):NaN};
}
/* Cap table: rounds applied in month order. */
function capTable(s){
  const holders=(s.capTable&&s.capTable.holders||[]).map(h=>({name:h.name,kind:h.kind||'founder',shares:num(h.shares)}));
  const rounds=(s.funding||[]).filter(f=>f.include!==false&&(f.type==='equity'||f.type==='safe')).slice().sort((a,b)=>(monthIndex(a.month)||0)-(monthIndex(b.month)||0));
  const steps=[], safes=[];
  const total=()=>holders.reduce((a,h)=>a+h.shares,0);
  steps.push({label:'Today',month:'',rows:holders.map(h=>Object.assign({},h)),total:total(),price:NaN,post:NaN});
  for(const r of rounds){
    if(r.type==='safe'){ safes.push(r); continue; }
    const pre=total(); if(!pre){ steps.push({label:r.name,month:r.month,error:'Enter founder shares first',rows:[],total:0}); continue; }
    const rf=fxOf(s,r.currency), price=num(r.preMoney)*rf/pre;
    for(const sf of safes){
      const sff=fxOf(s,sf.currency), capP=isSet(sf.cap)&&num(sf.cap)>0?num(sf.cap)*sff/pre:Infinity, discP=price*(1-num(sf.discount)/100);
      const p=Math.min(capP,isSet(sf.discount)&&num(sf.discount)>0?discP:price);
      holders.push({name:sf.investor||sf.name,kind:'investor',shares:p>0?num(sf.amount)*sff/p:0,via:'SAFE · '+sf.name});
    }
    safes.length=0;
    if(price>0) holders.push({name:r.investor||r.name,kind:'investor',shares:num(r.amount)*rf/price});
    const pool=num(r.poolPct)/100;
    if(pool>0){ const poolNow=holders.filter(h=>h.kind==='pool').reduce((a,h)=>a+h.shares,0), T=total(); const need=(pool*T-poolNow)/(1-pool); if(need>0){ const ph=holders.find(h=>h.kind==='pool'); if(ph) ph.shares+=need; else holders.push({name:'Option pool',kind:'pool',shares:need}); } }
    steps.push({label:r.name,month:r.month,rows:holders.map(h=>Object.assign({},h)),total:total(),price,post:price*total()});
  }
  return {steps,openSafes:safes};
}
/* Named scenario applied on a deep copy. */
function applyScenario(s,sc){
  if(!sc||sc.id==='base') return s;
  const c=JSON.parse(JSON.stringify(s)), d=Math.round(num(sc.delay)), pa=1+num(sc.priceAdj)/100, ca=1+num(sc.costAdj)/100;
  const shift=ym=>{const m=monthIndex(ym);return isFinite(m)?ymFromIndex(m+d):ym;};
  const ex=new Set(sc.excludeRegions||[]);
  c.airlines.forEach(a=>{
    if(d){ const t=timingOf(c,a); if(a.status!=='Live'&&a.status!=='Signed'){ a.signMonth=t.sign?shift(t.sign):''; a.goLiveMonth=t.live?shift(t.live):''; } }
    a.prob=Math.max(0,Math.min(100,num(a.prob)+num(sc.probAdj)));
    if(isSet(a.renewProb)) a.renewProb=Math.max(0,Math.min(100,num(a.renewProb)+num(sc.renewAdj)));
    const r=regionOf(c,a.country); if(r&&ex.has(r.id)) a.include=false;
    if(isSet(a.implOverride)) a.implOverride=num(a.implOverride)*pa;
  });
  c.settings.renewalRate=Math.max(0,Math.min(100,num(c.settings.renewalRate,100)+num(sc.renewAdj)));
  c.products.forEach(p=>{p.rates=p.rates.map(v=>num(v)*pa);p.impl=p.impl.map(v=>num(v)*pa);});
  ['cabinRate','adminRate','instructorRate'].forEach(k=>c.seatPrices[k]=num(c.seatPrices[k])*pa);
  c.costs.forEach(x=>{ if(x.basis!=='pctRevenue') x.amount=num(x.amount)*ca; });
  (c.hires||[]).forEach(h=>{ h.salary=num(h.salary)*ca; });
  if(sc.noFunding) (c.funding||[]).forEach(f=>f.include=false);
  return c;
}
function aggregate(months,keyFn){
  const out=[],idx={}; let prevARR=0;
  for(const m of months){
    const k=keyFn(m.ym);
    if(!(k in idx)){ idx[k]=out.length; out.push({key:k,recurring:0,impl:0,revenue:0,tools:0,salaries:0,hires:0,costs:0,net:0,billed:0,cashIn:0,wht:0,funding:0,loanRepay:0,dist:0,distTax:0,fees:0,feeItems:{},cashOut:0,fixedCosts:0,varCosts:0,newSigned:0,newLive:0,arrNew:0,arrExp:0,arrChurn:0,months:0,byProduct:{},costItems:{},hireItems:{},byType:{cogs:0,sm:0,rd:0,ga:0},startARR:prevARR}); }
    const g=out[idx[k]];
    ['recurring','impl','revenue','tools','salaries','hires','costs','net','billed','cashIn','wht','funding','loanRepay','dist','distTax','fees','cashOut','fixedCosts','varCosts','newSigned','newLive','arrNew','arrExp','arrChurn'].forEach(f=>g[f]+=m[f]||0);
    for(const t in m.byType) g.byType[t]+=m.byType[t];
    for(const c in (m.hireItems||{})) g.hireItems[c]=(g.hireItems[c]||0)+m.hireItems[c];
    for(const c in (m.feeItems||{})) g.feeItems[c]=(g.feeItems[c]||0)+m.feeItems[c];
    for(const c in m.costItems) g.costItems[c]=(g.costItems[c]||0)+m.costItems[c];
    g.liveFleet=m.liveFleet; g.livePilots=m.livePilots; g.liveSeats=m.liveSeats;
    for(const p in m.byProduct) g.byProduct[p]=(g.byProduct[p]||0)+m.byProduct[p];
    g.months++; g.cash=m.cash; g.cashB=m.cashB; g.recurringEnd=m.recurring; g.livePilotsEnd=m.livePilots; prevARR=m.liveARR; g.liveARR=m.liveARR; g.live=m.live; g.salaryEach=m.salaryEach; g.arrByRegion=m.arrByRegion;
  }
  return out;
}
const byYear=ym=>ym.slice(0,4);
const byQuarter=ym=>{const m=+ym.slice(5,7); return 'Q'+Math.ceil(m/3)+' '+ym.slice(0,4);};

function addCurrency(s){
  const S=s.settings;
  if(!S.mainCurrency) S.mainCurrency='USD';
  const seen=new Set(['USD']);
  S.currencies=(S.currencies||[]).filter(c=>{ const k=String(c.code||'').toUpperCase().trim(); if(!k||seen.has(k)) return false; seen.add(k); c.code=k; if(c.auto===undefined) c.auto=true; return true; });
  [['SAR',0.2667],['AED',0.2723],['KWD',3.217],['LYD',0.1557],['GBP',1.333]].forEach(([k,u])=>{ if(!seen.has(k)){ S.currencies.push({code:k,usd:u,auto:true}); seen.add(k); } });
  (s.products||[]).forEach(p=>{ if(!p.currency) p.currency='USD'; });
  if(s.seatPrices&&!s.seatPrices.currency) s.seatPrices.currency='USD';
  (s.funding||[]).forEach(f=>{ if(!f.currency) f.currency='USD'; });
  (s.invoices||[]).forEach(v=>{ if(!v.currency) v.currency='USD'; });
  (s.competitors||[]).forEach(c=>{ if(!c.currency) c.currency='USD'; });
}
function addFees(s){
  if(s.fees) return;
  const f=(id,name,basis,v,type,note)=>Object.assign({id,name,basis,rate:FEE_PCT.has(basis)?v:0,amount:FEE_PCT.has(basis)?0:v,currency:'USD',scope:'',startMonth:'',endMonth:'',type,include:false,note});
  s.fees=[
    f('fx1','Incoming international transfer (SWIFT)','perPayment',35,'cogs','Bank charge per airline payment received'),
    f('fx2','FX conversion and bank spread','pctCollected',1,'cogs','When airlines pay in local currency'),
    f('fx3','Sales commission / local agent','pctRevenue',10,'sm','Partner or reseller share of revenue'),
    f('fx4','Employer social insurance on salaries','pctPayroll',18.75,'ga','Egypt employer share, check current rate and cap'),
    f('fx5','Legal and closing costs on funding','pctFunding',3,'ga','Lawyers, notary, registry on each round'),
    f('fx6','Onboarding travel per new airline','perNewAirline',1500,'cogs','Site visit and training trip'),
    f('fx7','Accounting and annual report (Estonia)','monthly',150,'ga','Bookkeeping, annual report filing')
  ];
}
function migrate(s){
  s=migrate2(s);
  if(s.version>=5) return s;
  s=JSON.parse(JSON.stringify(s));
  if(s.version===3){ addFees(s); s.version=4; }
  if(s.version===4){ addCurrency(s); s.version=5; return s; }
  const S=s.settings;
  if(!S.currencies) S.currencies=[{code:'EUR',usd:num(S.eurUsd,1.15)},{code:'EGP',usd:0.0188}];
  const def={minCash:5000,renewalRate:100,employerCost:0,salesSalaryShare:0,ltvCapYears:5,corpTaxRate:22,paymentTermsDays:30,asOfMonth:''};
  for(const k in def) if(S[k]===undefined) S[k]=def[k];
  s.regions.forEach(r=>r.countries.forEach(c=>{ if(c.wht===undefined) c.wht=0; if(c.payDelay===undefined) c.payDelay=0; if(c.collectRate===undefined) c.collectRate=''; }));
  const typeOf=c=>/infra|hosting|database|server|ai serv/i.test((c.category||'')+' '+c.name)?'cogs':/sales|market|travel|event/i.test(c.category||'')?'sm':/tool/i.test(c.category||'')?'rd':'ga';
  s.costs.forEach(c=>{ if(!c.type) c.type=typeOf(c); });
  s.airlines.forEach(a=>{
    const t=timingOf(s,a);
    if(a.renewProb===undefined) a.renewProb='';
    if(!a.contact) a.contact={name:'',role:'',email:'',phone:''};
    if(a.nextAction===undefined) a.nextAction='';
    if(a.nextActionDate===undefined) a.nextActionDate='';
    if(!a.stageLog) a.stageLog=[];
    if(a.baselineSign===undefined) a.baselineSign=t.sign||'';
  });
  if(!s.hires) s.hires=[];
  if(!s.funding) s.funding=[];
  if(!s.distributions) s.distributions=[];
  if(!s.capTable) s.capTable={holders:s.founders.map(f=>({name:f.name,kind:'founder',shares:''}))};
  if(!s.scenarios) s.scenarios=[
    {id:'base',name:'Base',color:'deep',delay:0,probAdj:0,priceAdj:0,costAdj:0,renewAdj:0,excludeRegions:[],noFunding:false},
    {id:'up',name:'Upside',color:'sky',delay:0,probAdj:15,priceAdj:0,costAdj:0,renewAdj:0,excludeRegions:[],noFunding:false},
    {id:'down',name:'Downside',color:'coral',delay:3,probAdj:-15,priceAdj:-10,costAdj:10,renewAdj:-10,excludeRegions:[],noFunding:false}];
  if(!s.actuals) s.actuals={};
  if(!s.invoices) s.invoices=[];
  addFees(s);
  addCurrency(s);
  s.version=5;
  return s;
}
/* migrate older saved shapes to v2 */
function migrate2(s){
  if(s.version>=2) return s;
  const P=s.pricing||{};
  const countries=Array.from(new Set((s.airlines||[]).map(a=>a.country)));
  const regionMap={Egypt:'North Africa',Libya:'North Africa',Kuwait:'GCC',Syria:'Levant'};
  const regions=[];
  countries.forEach(c=>{const rn=regionMap[c]||'Other';let r=regions.find(x=>x.name===rn);if(!r){r={id:'r'+(regions.length+1),name:rn,color:'deep',countries:[]};regions.push(r);}r.countries.push({name:c});});
  return {
    version:2, updated:s.updated,
    settings:Object.assign({priceIncrease:0,monthlyPremium:P.monthlyPremium||10},s.settings),
    regions,
    bands:(P.tiers||[]).map(t=>({label:t.label,maxPilots:t.maxPilots})),
    products:[{id:'bundle',name:P.product||'EBT/CBTA + TMS bundle',short:'Bundle',color:'deep',rates:(P.tiers||[]).map(t=>t.rate),impl:(P.tiers||[]).map(t=>t.impl),seats:{cabin:true,admin:true,instructor:true}}],
    seatPrices:{cabinRate:P.cabinRate,adminRate:P.adminRate,instructorRate:P.instructorRate},
    ratios:s.ratios, competitors:s.competitors||[],
    cohorts:Array.from(new Set((s.airlines||[]).map(a=>a.cohort).filter(Boolean))).map(c=>({id:c,name:'Cohort '+c,signMonth:'',goLiveMonth:''})),
    airlines:(s.airlines||[]).map(a=>Object.assign({product:'bundle',discount:0,growth:0,implOverride:'',instructors:''},a)),
    costs:(s.costs||[]).map(c=>({id:c.id,name:c.name,category:c.category,amount:c.monthly,freq:'monthly',basis:'fixed',growth:0,currency:c.currency,qty:c.qty,startMonth:c.startMonth,endMonth:''})),
    salary:{base:s.salary.base,startMonth:s.salary.startMonth,lagMonths:s.salary.lagMonths,minGapMonths:s.salary.minGapMonths,steps:s.salary.steps.map(x=>Object.assign({month:''},x))},
    founders:(s.salary.founders||[]).map(f=>Object.assign({share:100},f))
  };
}
if(typeof module!=='undefined') module.exports={FEE_BASES,FEE_PCT,COST_TYPES,COST_TYPES_SHORT,fxOf,blendActuals,runwayInfo,unitEcon,capTable,applyScenario,invoiceTotals,ymFromIndex,COST_BASES,countryOf,compute,aggregate,byYear,byQuarter,airlineEcon,monthIndex,migrate,timingOf,regionOf,costMonthlyUSD};

/* ===== STRATOS Finance Tracker app v2 ===== */
(function(){
const LOGOS=JSON.parse(document.getElementById('logos').textContent);
/* The embedded #state is only the fallback snapshot; the shared database doc is the source of truth. */
const SNAPSHOT=migrate(JSON.parse(document.getElementById('state').textContent));
const DOC_PATH='tracker/state';
let state=JSON.parse(JSON.stringify(SNAPSHOT)), CANON=JSON.stringify(state), BASE_HASH=hash(CANON);
const LS_DRAFT='stratos-fin-draft', LS_VIEW='stratos-fin-view2';
const HOST_THEME=document.documentElement.getAttribute('data-theme');
let view={scen:'base',invFilter:'all',country:null,airline:null,tab:'overview',scenario:'plan',year:'2027',groupBy:'region',filterRegion:'All',collapsed:{},theme:'system',quote:{fleet:12,product:'bundle',billing:'annual',discount:0}};
let readOnly=false, staleDraft=null, restored=false, downloads=null, busy=false, pendingScroll=null;
let db=null, userApi=null, myId=null, loading=true, dbMode='connecting', remoteNewer=null, meta={savedAt:'',savedBy:'',savedByName:''};
let cfgLocked=false, isOwnerV=false, histList=null, histLoading=false;
const OPS_KEYS=['airlines','invoices','actuals'];
const isOpsPath=p=>OPS_KEYS.some(k=>p===k||p.startsWith(k+'.'));
const OPS_ACTS=new Set(['add-airline','dup-airline','del-airline','del-airline-detail','add-airline-country','gen-invoices','add-invoice','del-invoice','inv-paid','reset-baseline','discard','restore-stale','drop-stale','restore-version']);

function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h>>>0);}
