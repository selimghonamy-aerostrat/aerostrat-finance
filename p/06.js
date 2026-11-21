    tt.map(k=>R(COST_TYPES[k],g=>$(g.byType[k])+' <span class="muted small">'+pct(g.revenue?g.byType[k]/g.revenue*100:NaN)+'</span>','sub')).join('')+'</tbody></table></div><p class="hint pad-x">CAC = sales & marketing spend ÷ airlines signed that year. LTV = ARR per airline × gross margin × customer life (1 ÷ churn, capped at '+num(state.settings.ltvCapYears,5)+' years). Payback = CAC ÷ monthly gross profit per airline. Burn multiple = net loss ÷ net new ARR.</p></div>';
  return h;
}

/* ---------- TEAM: hiring plan ---------- */
function hiringPanel(M){
  const H=state.hires, years=aggregate(M.months,byYear), Y=years.find(g=>g.key===view.year)||years[0];
  const startOf=id=>(M.hireLog.find(x=>x.id===id)||{}).start;
  let h='<div class="panel flush mb" id="hiring"><div class="panel-head pad"><div><h3>Hiring plan</h3><p class="muted small sd">Each role starts on a date, when live ARR reaches a level, or when a number of airlines are live. Salaries include the employer on-cost.</p></div><div class="toolbar"><label class="muted small" for="f-settings-employerCost">Employer on-cost %</label>'+inp('settings.employerCost',{num:1,w:'w-xs',label:'Employer on-cost'})+(readOnly?'':'<button class="btn cta-outline small" data-act="add-hire">Add role</button>')+'</div></div>';
  if(!H.length) return h+'<div class="empty"><b>No hires planned.</b><span class="muted">Add roles like a developer, customer success or sales lead, each with a trigger.</span></div></div>';
  const trig=[{v:'month',l:'On a date'},{v:'arr',l:'When live ARR reaches'},{v:'live',l:'When airlines live reach'}];
  h+='<div class="tbl-wrap inner"><table class="fin"><thead><tr><th>Role</th><th>Team</th><th class="n">Salary /mo</th><th>Cur.</th><th>Starts</th><th>Trigger</th><th>Ends</th><th class="n">Raise %/yr</th><th>In plan</th><th>Starts in plan</th><th class="n">Cost '+Y.key+'</th><th></th></tr></thead><tbody>'+H.map((x,i)=>{const p='hires.'+i, st=startOf(x.id);
    return '<tr class="'+(x.include===false?'off':'')+'"><td>'+inp(p+'.role',{w:'w-l',label:'Role'})+'</td><td>'+inp(p+'.type',{type:'select',options:typeOpts(),w:'w-m',label:'Team'})+'</td><td>'+inp(p+'.salary',{num:1,w:'w-s',label:'Monthly salary'})+'</td><td>'+inp(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'})+'</td><td>'+inp(p+'.trigger',{type:'select',options:trig,w:'w-l',label:'Trigger'})+'</td><td>'+(x.trigger==='month'||!x.trigger?inp(p+'.month',{type:'month',w:'w-m',label:'Start month'}):inp(p+'.value',{num:1,w:'w-s',label:'Trigger value',ph:x.trigger==='arr'?'300000':'5'}))+'</td><td>'+inp(p+'.endMonth',{type:'month',w:'w-m',label:'End month'})+'</td><td>'+inp(p+'.growth',{num:1,w:'w-xs',label:'Yearly raise'})+'</td><td>'+inp(p+'.include',{type:'checkbox',label:'Include'})+'</td><td>'+(st?ymLabel(st):'<span class="muted small">Not reached</span>')+'</td><td class="n"><b>'+$(Y.hireItems[x.id]||0)+'</b></td><td>'+del('del-hire',i)+'</td></tr>';}).join('')+'<tr class="total"><td colspan="10">Hiring cost '+Y.key+'</td><td class="n">'+$(Y.hires)+'</td><td></td></tr></tbody></table></div>';
  h+='<div class="tbl-wrap inner"><table class="fin"><thead><tr><th>By year</th>'+years.map(g=>'<th class="n">'+g.key+'</th>').join('')+'</tr></thead><tbody><tr><td>Team cost (hires)</td>'+years.map(g=>'<td class="n">'+$(g.hires)+'</td>').join('')+'</tr><tr class="sub"><td>Founder salaries</td>'+years.map(g=>'<td class="n">'+$(g.salaries)+'</td>').join('')+'</tr><tr class="total"><td>People cost</td>'+years.map(g=>'<td class="n">'+$(g.hires+g.salaries)+'</td>').join('')+'</tr><tr class="sub"><td>As % of revenue</td>'+years.map(g=>'<td class="n">'+pct(g.revenue?(g.hires+g.salaries)/g.revenue*100:NaN)+'</td>').join('')+'</tr></tbody></table></div></div>';
  return h;
}
function teamView(M){ return founders(M).replace('<div class="eyebrow">Founders</div><h2>Salary ladder</h2>','<div class="eyebrow">Team</div><h2>Founders and hiring</h2>')+'<div class="mt"></div>'+hiringPanel(M); }

/* ---------- CRM: airline sales panel + pipeline follow-ups ---------- */
function salesPanel(a,i){
  const p='airlines.'+i, today=todayISO(), es=effSign(a), slip=a.baselineSign&&es?monthIndex(es)-monthIndex(a.baselineSign):0;
  let h='<div class="panel"><div class="panel-head"><h3>Sales and renewal</h3>'+(a.nextActionDate&&a.nextActionDate<today?'<span class="chip st-Lost">Follow-up overdue</span>':'')+'</div><div class="fields two">'+
    fld('Contact name',inp(p+'.contact.name'))+fld('Role',inp(p+'.contact.role',{ph:'Head of Training'}))+fld('Email',inp(p+'.contact.email'))+fld('Phone',inp(p+'.contact.phone'))+fld('Next action',inp(p+'.nextAction',{ph:'Send proposal, book demo…'}))+fld('Next action date',inp(p+'.nextActionDate',{type:'date'}))+
    fld('Renewal probability %',inp(p+'.renewProb',{num:1,blank:1,ph:String(num(state.settings.renewalRate,100))}),isSet(a.renewProb)?'Set by you':'Default from Settings')+
    fld('First planned signing',inp(p+'.baselineSign',{type:'month'}),slip>0?'<span class="neg">Slipped '+slip+' month'+(slip===1?'':'s')+'</span>':slip<0?'Ahead by '+(-slip)+' months':'On the original date')+'</div>'+(readOnly?'':'<div class="toolbar"><button class="btn small" data-act="reset-baseline" data-i="'+i+'">Set baseline to current date ('+ymLabel(es)+')</button></div>');
  const L=(a.stageLog||[]).slice().reverse();
  h+='<h3 class="mt">Stage history</h3>'+(L.length?'<ul class="list-plain">'+L.slice(0,10).map(x=>li(fmtDate(x.date),esc(x.from||'–')+' → '+esc(x.to))).join('')+'</ul>':'<p class="muted small">Status changes are logged here automatically from now on.</p>')+'</div>';
  return h;
}
function followUps(){
  const today=todayISO(), soon=addDays(today,14), asI=monthIndex(asOfYm());
  const items=[];
  state.airlines.forEach(a=>{ if(a.include===false||a.status==='Lost') return;
    if(a.nextActionDate&&a.nextActionDate<=soon) items.push({a,k:a.nextActionDate<today?'bad':'warn',t:(a.nextActionDate<today?'Overdue · ':'Due ')+fmtDate(a.nextActionDate),d:a.nextAction||'Follow up'});
    const es=effSign(a); if(OPEN_ST.includes(a.status)&&isFinite(monthIndex(es))&&monthIndex(es)<asI) items.push({a,k:'warn',t:'Past signing month',d:'Planned '+ymLabel(es)+', still '+a.status});
    else if(OPEN_ST.includes(a.status)&&a.baselineSign&&monthIndex(es)>monthIndex(a.baselineSign)) items.push({a,k:'info',t:'Slipped '+(monthIndex(es)-monthIndex(a.baselineSign))+' mo',d:'First planned '+ymLabel(a.baselineSign)});
  });
  if(!items.length) return '';
  return '<div class="panel mb"><div class="panel-head"><h3>Follow-ups</h3><span class="muted small">Next actions in the next 14 days, missed dates and slipped deals</span></div><ul class="alist">'+items.slice(0,12).map(x=>'<li><span class="adot '+x.k+'"></span><div class="atext"><b>'+esc(x.a.name)+' · '+esc(x.t)+'</b><span class="muted small">'+esc(x.d)+'</span></div><button class="btn small" data-act="open-airline" data-v="'+esc(x.a.id)+'">Open</button></li>').join('')+'</ul>'+(items.length>12?'<p class="hint">'+(items.length-12)+' more not shown.</p>':'')+'</div>';
}

/* ===== v6: extra settings, access & history, exports ===== */
function extraSettings(sec,M){
  const S=state.settings;
  let h='';
  h+=sec('cash','Cash & collections','Sets “today” for actuals and runway, your cash safety line and invoice terms.','<div class="fields">'+fld('As of month',inp('settings.asOfMonth',{type:'month'}),isSet(S.asOfMonth)?'Fixed by you':'Blank = current month ('+ymLabel(todayISO().slice(0,7))+')')+fld('Minimum cash ('+MAINC()+')',inp('settings.minCash',{num:1}),'Alert when the re-forecast drops below')+fld('Payment terms (days)',inp('settings.paymentTermsDays',{num:1}),'Due date on new invoices')+fld('Default renewal rate %',inp('settings.renewalRate',{num:1}),'Share of ARR kept at each renewal')+fld('Collection rate %',inp('settings.collectionRate',{num:1}),'Default for every country')+'</div>');
  const C=S.currencies||[], MC=MAINC(), mainOpts=curCodes();
  const usedBy=code=>(code===MC?1:0)+state.costs.filter(x=>x.currency===code).length+state.hires.filter(x=>x.currency===code).length+(state.fees||[]).filter(x=>x.currency===code).length+state.products.filter(x=>x.currency===code).length+(state.seatPrices.currency===code?1:0)+state.funding.filter(x=>x.currency===code).length+state.invoices.filter(x=>x.currency===code).length+state.competitors.filter(x=>x.currency===code).length;
  const fxLine=liveFx?'Live rates from '+esc(liveFx.src||'currency-api')+', dated '+esc(liveFx.date||'today')+' · checked '+esc(fmtWhen(new Date(liveFx.fetchedAt).toISOString())):fxStatus==='failed'?'The exchange-rate service couldn’t be reached here, so saved rates are used.':'Fetching live rates…';
  let cb='<div class="fields mb">'+fld('Main currency',inp('settings.mainCurrency',{type:'select',options:mainOpts}),'Every total, chart, KPI and export shows in this currency')+'</div>';
  cb+='<div class="tbl-wrap"><table><thead><tr><th>Currency</th><th>Rate</th><th class="n">1 USD =</th><th class="n">Value in '+esc(MC)+'</th><th class="n">Used by</th><th></th></tr></thead><tbody><tr><td><b>USD</b></td><td class="muted small">Base</td><td class="n">1</td><td class="n muted">'+(1/DR()).toFixed(1/DR()<10?4:2)+' '+esc(MC)+'</td><td class="n">'+usedBy('USD')+'</td><td></td></tr>'+
    C.map((c,i)=>{const u=num(c.usd), per=u?1/u:0, used=usedBy(c.code), auto=c.auto!==false, live=liveFx&&liveFx.rates[String(c.code||'').toLowerCase()];
      return '<tr><td>'+inp('settings.currencies.'+i+'.code',{w:'w-xs',label:'Currency code',ph:'e.g. SAR'})+'</td><td><label class="inline">'+inp('settings.currencies.'+i+'.auto',{type:'checkbox',label:'Automatic rate'})+(auto?(live?'Automatic':'<span class="warn-text small">No live rate for this code</span>'):'Manual')+'</label></td><td class="n">'+(auto?'<b>'+(per?per.toFixed(per<10?4:2):'–')+'</b> '+esc(c.code):'<input class="in num w-s" type="number" step="any" data-act="fx-units" data-i="'+i+'" value="'+(per?Math.round(per*1e4)/1e4:'')+'" aria-label="Units per USD"'+(readOnly||cfgLocked?' disabled':'')+'> '+esc(c.code))+'</td><td class="n muted">'+(u?(fxOf(state,c.code)/DR()).toFixed(fxOf(state,c.code)/DR()<10?4:2)+' '+esc(MC):'–')+'</td><td class="n">'+used+'</td><td>'+(used?'':del('del-currency',i))+'</td></tr>';}).join('')+'</tbody></table></div><p class="hint">'+fxLine+'. Automatic currencies refresh each time the tracker opens (at most every 6 hours). Untick “Automatic” to type your own budget rate. Prices, costs, salaries, fees, funding rounds and invoices can each be entered in any currency here; everything converts to '+esc(MC)+' automatically.</p>';
  h+=sec('currencies','Currencies',"Pick the main currency for reporting. Each price and cost keeps the currency you typed it in.",cb,'<div class="toolbar"><button class="btn small" data-act="fx-update">'+(fxStatus==='loading'?'Updating…':'Update rates now')+'</button>'+(cfgLocked||readOnly?'':'<button class="btn small" data-act="add-currency">Add currency</button>')+'</div>');
  const rows=state.regions.flatMap((r,ri)=>r.countries.map((c,ci)=>({r,ri,c,ci})));
  h+=sec('tax','Taxes','Tax rates used across the plan. Withholding tax is held back by the airline and reduces the cash you receive. A payment delay pushes collections later; a lower collection rate models bad debt.','<div class="fields mb">'+fld('Estonian corporate tax on distributions %',inp('settings.corpTaxRate',{num:1}),'Charged as rate/(100−rate) of the net payout')+fld('Employer on-cost on hires %',inp('settings.employerCost',{num:1}),'Payroll taxes and benefits')+'</div><div class="tbl-wrap"><table><thead><tr><th>Region</th><th>Country</th><th class="n">Withholding tax %</th><th class="n">Payment delay (months)</th><th class="n">Collection %</th><th class="n">Airlines</th></tr></thead><tbody>'+rows.map(({r,ri,c,ci})=>{const p='regions.'+ri+'.countries.'+ci;return '<tr><td><i class="dot" style="background:'+cv(r.color)+'"></i>'+esc(r.name)+'</td><td>'+esc(c.name)+'</td><td>'+inp(p+'.wht',{num:1,w:'w-xs',label:'Withholding '+c.name})+'</td><td>'+inp(p+'.payDelay',{num:1,w:'w-xs',label:'Delay '+c.name})+'</td><td>'+inp(p+'.collectRate',{num:1,blank:1,w:'w-xs',ph:String(num(S.collectionRate,100)),label:'Collection '+c.name})+'</td><td class="n">'+state.airlines.filter(a=>a.country===c.name).length+'</td></tr>';}).join('')+'</tbody></table></div><p class="hint">Reference points, to confirm with your accountant: Egypt withholds 20% on royalties and on service fees paid to non-residents unless a tax treaty reduces it, and reduced treaty rates are refunded afterwards rather than applied up front (PwC Worldwide Tax Summaries). Estonia taxes distributed profit at 22/78 in 2026; the planned rise to 24% was cancelled. Because an OÜ pays no tax on retained profit, foreign withholding usually can’t be credited, so treat it as a real cost.</p>');
  const FE=state.fees||[], yrs=M?aggregate(M.months,byYear):[], YY=yrs.find(g=>g.key===view.year)||yrs[1]||yrs[0];
  const scopeG=[{label:'Everywhere',options:[{v:'',l:'All countries'}]},{label:'Region',options:state.regions.map(r=>({v:'r:'+r.id,l:r.name}))},...state.regions.map(r=>({label:r.name,options:r.countries.map(c=>({v:'c:'+c.name,l:c.name}))}))];
  const scoped=new Set(['pctCollected','pctRevenue','perPayment','perNewAirline']);
  let fb='<div class="tbl-wrap"><table class="fin fees"><thead><tr><th>On</th><th>Tax or fee</th><th>Charged as</th><th class="n">Rate % / amount</th><th>Cur.</th><th>Applies in</th><th>Starts</th><th>Ends</th><th>Cost type</th><th class="n">'+(YY?YY.key:'')+'</th><th>Note</th><th></th></tr></thead><tbody>'+
    FE.map((f,i)=>{const p='fees.'+i, pc=FEE_PCT.has(f.basis);return '<tr class="'+(f.include===false?'off':'')+'"><td>'+inp(p+'.include',{type:'checkbox',label:'Include '+f.name})+'</td><td>'+inp(p+'.name',{w:'w-l',label:'Name'})+'</td><td>'+inp(p+'.basis',{type:'select',options:Object.entries(FEE_BASES).map(([v,l])=>({v,l})),w:'w-l',label:'Charged as'})+'</td><td><span class="adjl">'+(pc?inp(p+'.rate',{num:1,w:'w-s',label:'Rate'})+'<span class="muted small">%</span>':inp(p+'.amount',{num:1,w:'w-s',label:'Amount'}))+'</span></td><td>'+(pc?'':inp(p+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'}))+'</td><td>'+(scoped.has(f.basis)?inp(p+'.scope',{type:'select',groups:scopeG,w:'w-m',label:'Applies in'}):'<span class="muted small">Company-wide</span>')+'</td><td>'+inp(p+'.startMonth',{type:'month',w:'w-m',label:'Start'})+'</td><td>'+inp(p+'.endMonth',{type:'month',w:'w-m',label:'End'})+'</td><td>'+inp(p+'.type',{type:'select',options:typeOpts(),w:'w-m',label:'Cost type'})+'</td><td class="n"><b>'+(YY?$(YY.feeItems[f.id]||0):'–')+'</b></td><td>'+inp(p+'.note',{w:'w-l',label:'Note'})+'</td><td>'+del('del-fee',i)+'</td></tr>';}).join('')+
    '<tr class="total"><td colspan="9">Taxes and fees switched on'+(YY?' · '+YY.key:'')+'</td><td class="n">'+(YY?$(YY.fees):'–')+'</td><td colspan="2"></td></tr></tbody></table></div><p class="hint">Rows start switched off with typical values: tick “On” to add a fee to the forecast. Percentages of cash collected, revenue and payments can apply everywhere, to one region or to one country. Fees count as costs, so they reduce profit, cash, runway and the unit economics.</p>';
  h+=sec('fees','Extra fees','Bank, FX, commission, payroll, legal and other charges on top of your cost items.',fb,cfgLocked||readOnly?'':'<button class="btn small" data-act="add-fee">Add tax or fee</button>');
  h+=sec('econ','Unit economics','Inputs for CAC, LTV and payback on the Metrics tab.','<div class="fields">'+fld('Founder time spent selling %',inp('settings.salesSalaryShare',{num:1}),'Share of founder salaries counted as sales & marketing')+fld('LTV customer life cap (years)',inp('settings.ltvCapYears',{num:1}),'Used when churn is zero or very low')+'</div><p class="hint">Cost types are set per cost item on the Costs tab and per role on the Team tab.</p>');
  return h;
}
const ACCESS_TXT={owner:'You own this tracker and can change everything.',admin:'You’re an editor and can change everything.',interact:'You’re a contributor: you can update airlines, invoices and actuals. Pricing, costs, funding and settings are locked to editors.',view:'You can view this tracker but not change it.'};
function accessSection(sec){
  const lvl=readOnly?'view':cfgLocked?'interact':(isOwnerV?'owner':'admin');
  let hb='<p><b>'+esc(ACCESS_TXT[lvl])+'</b></p><p class="muted small">Who can do what follows the Share menu: Editors change everything; Contributors update the pipeline, invoices and actuals; Viewers only read. Every save is kept below with who made it.</p>';
  hb+='<div class="toolbar mt"><button class="btn" data-act="load-history">'+(histList?'Refresh saved versions':'Show saved versions')+'</button></div>';
  if(histLoading) hb+='<p class="muted mt">Loading saved versions…</p>';
  else if(histList&&!histList.length) hb+='<p class="muted mt">No saved versions yet. They start with your next save.</p>';
  else if(histList) hb+='<div class="tbl-wrap mt"><table><thead><tr><th>Saved</th><th>By</th><th>What changed</th><th></th></tr></thead><tbody>'+histList.map((x,i)=>'<tr><td>'+esc(fmtWhen(x.savedAt))+'</td><td>'+esc(x.byName||'Someone')+'</td><td class="wrapcell small">'+esc((x.summary||[]).join(' · ')||'—')+'</td><td>'+(readOnly?'':'<button class="btn small" data-act="restore-version" data-i="'+i+'">Restore</button>')+'</td></tr>').join('')+'</tbody></table></div><p class="hint">Restoring loads that version as unsaved changes. Click Save to make it current; the version you replace stays in this list.</p>';
  return sec('access','Access & history','',hb);
}

/* ---------- change summary ---------- */
const SEC_LABEL={fees:'Taxes & fees',settings:'General settings',regions:'Regions & countries',bands:'Tiers',products:'Products & prices',seatPrices:'Seat prices',ratios:'Crew ratios',cohorts:'Cohorts',competitors:'Competitors',costs:'Costs',salary:'Salary ladder',founders:'Founders',hires:'Hiring plan',funding:'Funding',distributions:'Distributions',capTable:'Cap table',scenarios:'Scenarios',invoices:'Invoices',actuals:'Actuals'};
function changeSummary(a,b){
  const out=[];
  if(!a) return ['First save'];
  const A=a.airlines||[], B=b.airlines||[], ida=new Map(A.map(x=>[x.id,x])), idb=new Map(B.map(x=>[x.id,x]));
  const added=B.filter(x=>!ida.has(x.id)).map(x=>x.name), removed=A.filter(x=>!idb.has(x.id)).map(x=>x.name), changed=B.filter(x=>ida.has(x.id)&&JSON.stringify(ida.get(x.id))!==JSON.stringify(x)).map(x=>x.name);
  if(added.length) out.push('Added '+added.slice(0,3).join(', ')+(added.length>3?' +'+(added.length-3):''));
  if(removed.length) out.push('Removed '+removed.slice(0,3).join(', ')+(removed.length>3?' +'+(removed.length-3):''));
  if(changed.length) out.push('Edited '+changed.slice(0,3).join(', ')+(changed.length>3?' +'+(changed.length-3)+' more':''));
  for(const k in SEC_LABEL) if(JSON.stringify(a[k])!==JSON.stringify(b[k])) out.push(SEC_LABEL[k]);
  return out.length?out:['No changes'];
}

/* ---------- exports ---------- */
const libCache={};
function loadLib(url,test){
  if(test()) return Promise.resolve();
  if(libCache[url]) return libCache[url];
  return libCache[url]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=url;s.async=true;s.onload=()=>test()?res():rej(new Error('lib'));s.onerror=()=>{delete libCache[url];rej(new Error('load'));};document.head.appendChild(s);});
}
async function exportXLSX(){
  if(!downloads) return;
  try{ await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>window.XLSX); }catch(e){ toast('Couldn’t load the Excel builder. Check your connection and try again.'); return; }
  const X=window.XLSX, M=modelFor(curScen()), wb=X.utils.book_new(), r2=v=>Math.round(v*100)/100, rm=v=>Math.round(cvt(v)*100)/100;
  const add=(name,rows,w)=>{const ws=X.utils.aoa_to_sheet(rows); if(w) ws['!cols']=w.map(x=>({wch:x})); X.utils.book_append_sheet(wb,ws,name);};
  const mh=['Month','Licenses','Implementation','Revenue','Tools & costs','Founder salaries','Hires','Taxes & fees','Total costs','Net profit','Billed','Cash collected','Withholding tax','Funding','Distributions + tax','Cash (plan)','Cash (re-forecast)','Live ARR','Airlines live','New ARR','Expansion ARR','Churned ARR'];
  add('Monthly',[mh,...M.months.map(m=>[m.ym,rm(m.recurring),rm(m.impl),rm(m.revenue),rm(m.tools),rm(m.salaries),rm(m.hires),rm(m.fees),rm(m.costs),rm(m.net),rm(m.billed),rm(m.cashIn),rm(m.wht),rm(m.funding),rm(m.dist+m.distTax),rm(m.cash),rm(m.cashB),rm(m.liveARR),rm(m.live),rm(m.arrNew),rm(m.arrExp),rm(m.arrChurn)])],[10,...mh.slice(1).map(()=>14)]);
  const ys=aggregate(M.months,byYear);
  add('Annual',[['Year',...ys.map(g=>g.key)],...[['Revenue','revenue'],['Licenses','recurring'],['Implementation','impl'],['Total costs','costs'],['Net profit','net'],['Cash collected','cashIn'],['Funding','funding'],['New ARR','arrNew'],['Expansion ARR','arrExp'],['Churned ARR','arrChurn']].map(([l,k])=>[l,...ys.map(g=>rm(g[k]))]),['ARR at year end',...ys.map(g=>rm(g.liveARR))],['Cash at year end (re-forecast)',...ys.map(g=>rm(g.cashB))],['Amounts in '+MAINC()]],[30,...ys.map(()=>14)]);
  add('Airlines',[['Airline','Country','Region','Status','Product','Fleet','Pilots','Probability %','Signs','Go-live','Billing','Discount %','ARR year 1','Implementation','Renewal %','Contact','Next action','Next action date','Notes'],...state.airlines.map(a=>{const e=airlineEcon(state,a,0),t=timingOf(state,a),r=regionOf(state,a.country);return [a.name,a.country,r?r.name:'',a.status,e.product.short,num(a.fleet),e.pilots,num(a.prob),t.sign,t.live,a.billing,num(a.discount),rm(e.arr),rm(e.impl),isSet(a.renewProb)?num(a.renewProb):num(state.settings.renewalRate,100),(a.contact&&a.contact.name)||'',a.nextAction||'',a.nextActionDate||'',a.notes||''];})],[24,12,16,12,10,6,7,8,9,9,8,8,12,12,8,18,24,12,30]);
  add('Costs',[['Item','Category','Type','Charged','Amount','Currency','Billing','Qty','Growth %','Start','End'],...state.costs.map(c=>[c.name,c.category,COST_TYPES[c.type||'ga'],COST_BASES[c.basis||'fixed'],num(c.amount),c.currency,c.freq,num(c.qty,1),num(c.growth),c.startMonth,c.endMonth])],[22,16,22,22,10,8,9,6,8,9,9]);
  add('Taxes & fees',[['Name','Charged as','Rate %','Amount','Currency','Applies in','Start','End','Type','On'],...(state.fees||[]).map(f=>[f.name,FEE_BASES[f.basis],FEE_PCT.has(f.basis)?num(f.rate):'',FEE_PCT.has(f.basis)?'':num(f.amount),f.currency||'USD',f.scope||'All',f.startMonth,f.endMonth,COST_TYPES[f.type||'ga'],f.include===false?'No':'Yes'])],[34,24,8,10,8,16,9,9,22,6]);
  const nameOf=id=>{const a=state.airlines.find(x=>x.id===id);return a?a.name:'';};
  add('Invoices',[['Number','Airline','Type','Issued','Due','Amount','Currency','Paid on','Paid amount','Note'],...state.invoices.map(v=>[v.number,nameOf(v.airline),v.kind,v.issue,v.due,num(v.amount),v.currency||'USD',v.paidDate,isSet(v.paidAmount)?num(v.paidAmount):(v.paidDate?num(v.amount):''),v.note])],[16,24,14,11,11,12,11,12,30]);
  add('Funding',[['Name','Type','Investor','Amount','Currency','Month','Pre-money','Cap','Discount %','Pool %','In plan'],...state.funding.map(f=>[f.name,f.type,f.investor||'',num(f.amount),f.currency||'USD',f.month,num(f.preMoney)||'',num(f.cap)||'',num(f.discount)||'',num(f.poolPct)||'',f.include!==false?'Yes':'No'])],[18,10,18,12,9,12,12,10,8,8]);
  const CT=capTable(state); const names=Array.from(new Set(CT.steps.flatMap(s=>s.rows.map(r=>r.name))));
  add('Cap table',[['Holder',...CT.steps.map(s=>s.label+' %')],...names.map(n=>[n,...CT.steps.map(s=>{const r=s.rows.find(x=>x.name===n);return r&&s.total?r2(r.shares/s.total*100):'';})])],[22,...CT.steps.map(()=>14)]);
  const buf=X.write(wb,{bookType:'xlsx',type:'array'});
  try{await downloads.save({filename:'stratos-financial-model-'+MAINC()+'-'+todayISO()+'.xlsx',data:buf});toast('Excel model saved');}catch(err){if(err&&err.code!=='declined')toast('Couldn’t save the Excel file here.');}
}
async function exportPDF(){
  if(!downloads) return;
  try{ await loadLib('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); }catch(e){ toast('Couldn’t load the PDF builder. Check your connection and try again.'); return; }
  const {jsPDF}=window.jspdf, d=new jsPDF({unit:'pt',format:'a4'}), W=595.28, H=841.89, mL=36, cw=W-72;
  const M=modelFor(curScen()), R=M.R, ys=aggregate(M.months,byYear), ends=ys.map(g=>M.months.filter(m=>m.ym.startsWith(g.key)).pop());
  const DEEP=[0,52,140], SKY=[63,158,232], CORAL=[255,99,65], GREY=[86,97,115], INK=[11,18,32], LINE=[214,221,229], LIGHT=[236,240,243];
  const txt=(s,x,y,o)=>{o=o||{};d.setFont('helvetica',o.b?'bold':'normal');d.setFontSize(o.s||9);d.setTextColor(...(o.c||INK));d.text(String(s),x,y,{align:o.a||'left',maxWidth:o.mw});};
  d.setFillColor(...DEEP); d.rect(0,0,W,92,'F'); d.setFillColor(...SKY); d.rect(0,92,W*0.62,3,'F'); d.setFillColor(153,174,209); d.rect(W*0.62,92,W*0.24,3,'F'); d.setFillColor(...CORAL); d.rect(W*0.86,92,W*0.14,3,'F');
  try{ d.addImage(LOGOS.white,'PNG',mL,18,105,56); }catch(e){ txt('STRATOS',mL,52,{s:22,b:1,c:[255,255,255]}); }
  txt('Investor summary',W-mL,40,{s:16,b:1,c:[255,255,255],a:'right'});
  txt(fmtDate(todayISO())+' · '+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+curScen().name+' scenario · '+MAINC(),W-mL,58,{s:9,c:[185,200,230],a:'right'});
  txt('EBT/CBTA + TMS training platform for airlines · Estonia OÜ, Cairo team',W-mL,74,{s:8.5,c:[185,200,230],a:'right'});
  let y=118;
  const Yk=k=>ys.find(g=>g.key===k)||{revenue:0,net:0}, E=k=>{const i=ys.findIndex(g=>g.key===k);return i>=0?ends[i]:M.months[M.months.length-1];};
  const tiles=[['ARR end 2027',$k(E('2027').liveARR)],['ARR end 2028',$k(E('2028').liveARR)],['Revenue 2027',$k(Yk('2027').revenue)],['Revenue 2028',$k(Yk('2028').revenue)],['Airlines live 2028',fmtCount(E('2028').live)],['Break-even',R.be?ymLabel(R.be.ym):'–']];
  const tw=(cw-5*8)/6;
  tiles.forEach((t,i)=>{const x=mL+i*(tw+8); d.setFillColor(...(i===0?DEEP:LIGHT)); d.roundedRect(x,y,tw,52,4,4,'F'); txt(t[0].toUpperCase(),x+8,y+15,{s:6.5,b:1,c:i===0?[185,200,230]:DEEP}); txt(t[1],x+8,y+38,{s:14,b:1,c:i===0?[255,255,255]:INK});});
  y+=72;
  // chart: revenue and ARR by year
  txt('Revenue and ARR by year',mL,y,{s:11,b:1}); y+=10;
  const ch=150, chW=cw*0.58, mx=Math.max(1,...ys.map((g,i)=>Math.max(g.revenue,ends[i].liveARR))), step=niceStepM(mx/4), top=Math.ceil(mx/step)*step, py=v=>y+ch-v/top*ch, bw=chW/ys.length;
  d.setDrawColor(...LINE); d.setLineWidth(0.5);
  for(let v=0;v<=top+1e-6;v+=step){ d.line(mL+34,py(v),mL+chW,py(v)); txt($k(v),mL+30,py(v)+3,{s:6.5,c:GREY,a:'right'}); }
  ys.forEach((g,i)=>{const x=mL+34+i*((chW-34)/ys.length), w=(chW-34)/ys.length; d.setFillColor(...SKY); d.rect(x+w*0.14,py(g.revenue),w*0.34,ch-(py(g.revenue)-y),'F'); d.setFillColor(...DEEP); d.rect(x+w*0.52,py(ends[i].liveARR),w*0.34,ch-(py(ends[i].liveARR)-y),'F'); txt(g.key+(g.months<12?'*':''),x+w/2,y+ch+11,{s:7.5,c:GREY,a:'center'});});
  d.setFillColor(...SKY); d.rect(mL+34,y+ch+18,7,7,'F'); txt('Revenue',mL+45,y+ch+24,{s:7,c:GREY}); d.setFillColor(...DEEP); d.rect(mL+90,y+ch+18,7,7,'F'); txt('ARR at year end',mL+101,y+ch+24,{s:7,c:GREY});
  // right column: unit economics
  const ux=mL+chW+20, uw=cw-chW-20, yi=Math.max(0,ys.findIndex(g=>g.key==='2028')), u=unitEcon(M.s,ys[yi],ends[yi]);
  txt('Unit economics · '+ys[yi].key,ux,y-10,{s:11,b:1});
  const ue=[['ARR per airline',$(u.arpa)],['Gross margin',isFinite(u.gm)?pct(u.gm*100):'–'],['CAC',isFinite(u.cac)?$(u.cac):'–'],['LTV : CAC',isFinite(u.ltvCac)?u.ltvCac.toFixed(1)+'×':'–'],['CAC payback',isFinite(u.payback)?Math.round(u.payback)+' months':'–'],['Net revenue retention',isFinite(u.nrr)?pct(u.nrr*100):'–'],['Revenue per pilot',$2(u.revPerPilot)+'/mo'],['Runway',R.neg?R.runway+' months':'Through '+ymLabel(state.settings.endMonth)]];
  ue.forEach((r,i)=>{const yy=y+8+i*19; txt(r[0],ux,yy,{s:8.5,c:GREY}); txt(r[1],ux+uw,yy,{s:9,b:1,a:'right'}); d.setDrawColor(...LINE); d.line(ux,yy+6,ux+uw,yy+6);});
  y+=ch+44;
  // annual table
  txt('Annual plan',mL,y,{s:11,b:1}); y+=8;
  const cols=['',...ys.map(g=>g.key)], rws=[['Revenue',g=>g.revenue],['Total costs',g=>g.costs],['Net profit',g=>g.net],['Cash collected',g=>g.cashIn],['Funding',g=>g.funding]];
  const c0=120, cwc=(cw-c0)/(cols.length-1);
  d.setFillColor(...LIGHT); d.rect(mL,y,cw,16,'F'); cols.forEach((c,i)=>txt(c,i===0?mL+6:mL+c0+cwc*i-6,y+11,{s:7.5,b:1,c:DEEP,a:i===0?'left':'right'}));
  y+=16;
  rws.forEach(([l,f])=>{ txt(l,mL+6,y+11,{s:8}); ys.forEach((g,i)=>{const v=f(g); txt($(v),mL+c0+cwc*(i+1)-6,y+11,{s:8,a:'right',c:v<0?CORAL:INK});}); d.setDrawColor(...LINE); d.line(mL,y+16,mL+cw,y+16); y+=16; });
  [['ARR at year end',(g,i)=>ends[i].liveARR],['Cash at year end',(g,i)=>ends[i].cashB]].forEach(([l,f])=>{ txt(l,mL+6,y+11,{s:8,b:1}); ys.forEach((g,i)=>{const v=f(g,i); txt($(v),mL+c0+cwc*(i+1)-6,y+11,{s:8,b:1,a:'right',c:v<0?CORAL:INK});}); d.line(mL,y+16,mL+cw,y+16); y+=16; });
  y+=20;
  // pipeline by region + funding
  const half=(cw-20)/2;
  txt('Pipeline by region',mL,y,{s:11,b:1}); txt('Funding plan',mL+half+20,y,{s:11,b:1});
  const reg={}; state.airlines.filter(a=>a.include!==false&&a.status!=='Lost').forEach(a=>{const r=regionOf(state,a.country),k=r?r.name:'Unassigned',e=airlineEcon(state,a,0),o=reg[k]||(reg[k]={n:0,fleet:0,arr:0,w:0});o.n++;o.fleet+=num(a.fleet);o.arr+=e.arr;o.w+=e.arr*num(a.prob)/100;});
  let yy=y+8; d.setFillColor(...LIGHT); d.rect(mL,yy,half,15,'F'); [['Region',0,'left'],['Airlines',half*0.5,'right'],['Full ARR',half*0.75,'right'],['Weighted',half-4,'right']].forEach(([l,x,a])=>txt(l,mL+(a==='left'?6:x),yy+10.5,{s:7,b:1,c:DEEP,a})); yy+=15;
