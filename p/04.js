/* ---------- AIRLINE DETAIL ---------- */
function airlineDetail(id){
  const i=state.airlines.findIndex(a=>a.id===id); if(i<0){view.airline=null;return (view.tab==='countries'&&view.country?countryDetail(view.country):pipeline());}
  const a=state.airlines[i], p='airlines.'+i, r=state.ratios, e=airlineEcon(state,a,0), tm=timingOf(state,a), reg=regionOf(state,a.country);
  const color=reg?cv(reg.color):'var(--c-grey)', fl=num(a.fleet);
  const peers=state.airlines.filter(x=>view.country?x.country===view.country:true), pi=peers.indexOf(a);
  const prev=peers[pi-1], next=peers[pi+1];
  const totalARR=state.airlines.filter(x=>x.include!==false&&x.status!=='Lost').reduce((s,x)=>s+airlineEcon(state,x,0).arr,0);
  const SM=subsetModel(x=>x.id===a.id), yrs=aggregate(SM.months,byYear);
  const cohortOpts=[{v:'',l:'Custom dates'},...state.cohorts.map(c=>({v:c.id,l:c.id+' · '+c.name}))];
  const live=monthIndex(tm.live);
  let h='<div class="crumbs"><button class="btn small" data-act="close-airline">← Back</button><span class="muted small">'+esc(reg?reg.name:'Unassigned')+' / <button class="linkish" data-act="open-country" data-v="'+esc(a.country)+'">'+esc(a.country||'No country')+'</button> / '+esc(a.name)+'</span><span class="spacer"></span>'+(prev?'<button class="btn small" data-act="open-airline" data-v="'+esc(prev.id)+'">← '+esc(prev.name)+'</button>':'')+(next?'<button class="btn small" data-act="open-airline" data-v="'+esc(next.id)+'">'+esc(next.name)+' →</button>':'')+'</div>';
  h+='<div class="hero" style="--rc:'+color+'"><div><div class="eyebrow">'+esc(a.country||'No country')+' · '+esc(e.product.name)+'</div><h2 class="big">'+esc(a.name)+'</h2><div class="chips"><span class="chip st-'+esc(a.status)+'">'+esc(a.status)+'</span><span class="chip" style="--cc:'+cv(e.product.color)+'">'+esc(state.bands[e.tier0].label)+' · '+$2(e.rate)+'/pilot</span>'+(a.include===false?'<span class="chip st-Lost">Excluded from forecast</span>':'')+'</div></div><div class="toolbar">'+(readOnly?'':'<button class="btn" data-act="dup-airline" data-i="'+i+'">Duplicate</button><button class="btn danger" data-act="del-airline-detail" data-i="'+i+'">Delete airline</button>')+'</div></div>';
  h+='<div class="kpis">'+kpi('ARR year 1',$(e.arr),pct(totalARR?e.arr/totalARR*100:0)+' of the book','lead')+kpi('Implementation',$(e.impl),isSet(a.implOverride)?'Custom fee':'Tier fee','sky')+kpi('Year 1 total',$(e.arr+e.impl),'License + implementation')+kpi('Weighted ARR',$(e.arr*num(a.prob)/100),num(a.prob)+'% close probability')+kpi('All-in per pilot',$2(e.perPilotMonth),'per month')+'</div>';
  h+='<div class="detail-grid">';
  h+='<div class="panel"><h3>Airline</h3><div class="fields two">'+fld('Name',inp(p+'.name'))+fld('Country',inp(p+'.country',{type:'select',groups:countryGroups()}))+fld('Status',inp(p+'.status',{type:'select',options:STATUSES}))+fld('Close probability %',inp(p+'.prob',{num:1}))+'<div class="field"><label>In forecast</label><label class="inline">'+inp(p+'.include',{type:'checkbox',label:'Include in forecast'})+' Include this airline</label></div>'+'</div>'+fld('Notes',inp(p+'.notes',{ph:'Contacts, contract terms, risks…'}))+'</div>';
  h+='<div class="panel"><h3>Fleet and crew</h3><div class="fields two">'+fld('Fleet (aircraft)',inp(p+'.fleet',{num:1}))+fld('Aircraft added per year',inp(p+'.growth',{num:1}),'Applied at each renewal')+fld('Pilots',inp(p+'.pilots',{num:1,blank:1,ph:String(Math.round(fl*r.pilotsPerAircraft))}),isSet(a.pilots)?'Set by you':'From ratio · '+r.pilotsPerAircraft+' per aircraft')+fld('Cabin crew',inp(p+'.cabin',{num:1,blank:1,ph:String(Math.round(fl*r.cabinPerAircraft))}),isSet(a.cabin)?'Set by you':'From ratio · '+r.cabinPerAircraft+' per aircraft')+fld('Instructors / examiners',inp(p+'.instructors',{num:1,blank:1,ph:fmtCount(fl*r.instructorsPerAircraft)}),isSet(a.instructors)?'Set by you':'From ratio · '+r.instructorsPerAircraft+' per aircraft')+fld('Admins',inp(p+'.admins',{num:1,blank:1,ph:String(r.adminsPerAirline)}),isSet(a.admins)?'Set by you':'Default '+r.adminsPerAirline+' per airline')+'</div></div>';
  h+='<div class="panel"><h3>Product and billing</h3><div class="fields two">'+fld('Product',inp(p+'.product',{type:'select',options:state.products.map(x=>({v:x.id,l:x.name}))}))+fld('Billing',inp(p+'.billing',{type:'select',options:[{v:'annual',l:'Annual license'},{v:'monthly',l:'Monthly +'+state.settings.monthlyPremium+'%'}]}))+fld('Discount %',inp(p+'.discount',{num:1}),'On all recurring seats')+fld('Implementation fee $',inp(p+'.implOverride',{num:1,blank:1,ph:String(Math.round(cvt(num(e.product.impl[e.tier0])*fxOf(state,e.product.currency)*(1+num((countryOf(state,a.country)||{}).priceAdj)/100))))}),isSet(a.implOverride)?'Custom fee':'Tier fee, leave blank to keep')+'</div></div>';
  h+='<div class="panel"><h3>Timing</h3><div class="fields two">'+fld('Cohort',inp(p+'.cohort',{type:'select',options:cohortOpts}))+'<div></div>'+fld('Signs',inp(p+'.signMonth',{type:'month'}),a.signMonth?'Set by you':tm.cohort?'From cohort · '+ymLabel(tm.cohort.signMonth):'No date yet')+fld('Goes live',inp(p+'.goLiveMonth',{type:'month'}),a.goLiveMonth?'Set by you':tm.cohort?'From cohort · '+ymLabel(tm.cohort.goLiveMonth):'No date yet')+'</div><ul class="list-plain mt">'+li('Implementation invoiced',ymLabel(tm.sign))+li('First license month',ymLabel(tm.live))+li('First renewal',isFinite(live)?ymLabel(ymFromIndex(live+12)):'–')+'</ul></div>';
  h+=salesPanel(a,i);
  h+='</div>';
  // seat breakdown
  const rows=[['Pilot seats',e.pilots,e.seats.pilots,true],['Cabin crew seats',e.cabin,e.seats.cabin,e.product.seats.cabin],['Admin seats',e.admins,e.seats.admin,e.product.seats.admin],['Instructor seats',e.instructors,e.seats.instructors,e.product.seats.instructor]];
  h+='<div class="grid2 mb"><div class="panel"><h3>Year 1 license breakdown</h3><div class="tbl-wrap"><table><thead><tr><th>Seat</th><th class="n">Count</th><th class="n">Per month</th><th class="n">Per year</th><th class="n">Share</th></tr></thead><tbody>'+rows.map(([l,c,v,on])=>'<tr class="'+(on?'':'off')+'"><td>'+l+(on?'':' <span class="muted small">(not in '+esc(e.product.short)+')</span>')+'</td><td class="n">'+fmtCount(c)+'</td><td class="n">'+$(v/12)+'</td><td class="n"><b>'+$(v)+'</b></td><td class="n muted">'+pct(e.arr?v/e.arr*100:0)+'</td></tr>').join('')+'<tr class="total"><td>Annual license</td><td></td><td class="n">'+$(e.arr/12)+'</td><td class="n">'+$(e.arr)+'</td><td></td></tr></tbody></table></div></div>';
  h+='<div class="panel"><h3>Contract years</h3><div class="tbl-wrap"><table><thead><tr><th>Year</th><th>Starts</th><th class="n">Fleet</th><th class="n">Pilots</th><th>Tier</th><th class="n">ARR</th></tr></thead><tbody>'+[0,1,2,3,4].map(k=>{const x=airlineEcon(state,a,k);return '<tr><td>Year '+(k+1)+'</td><td>'+(isFinite(live)?ymLabel(ymFromIndex(live+12*k)):'–')+'</td><td class="n">'+fmtCount(x.fleet)+'</td><td class="n">'+x.pilots+'</td><td>'+esc(state.bands[x.tier].label)+'</td><td class="n"><b>'+$(x.arr)+'</b></td></tr>';}).join('')+'</tbody></table></div><p class="hint">Fleet growth '+num(a.growth)+' aircraft a year · price increase '+num(state.settings.priceIncrease)+'% at each renewal. Pilots added above the signing headcount pay the tier they grow into.</p></div></div>';
  h+='<div class="panel flush"><div class="panel-head pad"><h3>Revenue from '+esc(a.name)+' by calendar year</h3><span class="muted small">'+(view.scenario==='plan'?'Plan case':'Weighted by '+num(a.prob)+'%')+'</span></div><div class="tbl-wrap inner"><table class="fin"><thead><tr><th></th>'+yrs.map(y=>'<th class="n">'+y.key+'</th>').join('')+'</tr></thead><tbody><tr><td>Licenses</td>'+yrs.map(y=>'<td class="n">'+$(y.recurring)+'</td>').join('')+'</tr><tr><td>Implementation</td>'+yrs.map(y=>'<td class="n">'+$(y.impl)+'</td>').join('')+'</tr><tr class="strong"><td>Total revenue</td>'+yrs.map(y=>'<td class="n">'+$(y.revenue)+'</td>').join('')+'</tr><tr class="sub"><td>Cash collected</td>'+yrs.map(y=>'<td class="n">'+$(y.cashIn)+'</td>').join('')+'</tr></tbody></table></div></div>';
  return h;
}

/* ---------- SETTINGS ---------- */
const SECS=[['general','General'],['cash','Cash & collections'],['currencies','Currencies'],['tax','Taxes'],['fees','Extra fees'],['econ','Unit economics'],['regions','Regions & countries'],['products','Products & tiers'],['seats','Seats & crew ratios'],['cohorts','Cohorts'],['salary','Salary ladder'],['founders','Founders'],['competitors','Competitors'],['display','Display & data'],['access','Access & history']];
function settings(M){
  const S=state.settings;
  let h='<div class="sec-head"><div><div class="eyebrow">Settings</div><h2>Every assumption in one place</h2><p>Changes apply across all tabs straight away. Click Save to keep them for everyone who opens this tracker.</p></div></div>';
  h+='<div class="set-layout"><nav class="set-nav" aria-label="Settings sections">'+SECS.map(([k,l])=>'<button data-act="set-jump" data-v="'+k+'">'+l+'</button>').join('')+'</nav><div class="set-body">';
  const sec=(k,title,desc,body,tools)=>'<section class="panel set-sec" id="set-'+k+'"><div class="panel-head"><div><h3>'+title+'</h3>'+(desc?'<p class="muted small sd">'+desc+'</p>':'')+'</div>'+(tools||'')+'</div>'+body+'</section>';
  h+=sec('general','General','Forecast window, cash and billing rules.','<div class="fields">'+fld('Forecast starts',inp('settings.startMonth',{type:'month'}))+fld('Forecast ends',inp('settings.endMonth',{type:'month'}))+fld('Opening cash ('+MAINC()+')',inp('settings.openingCash',{num:1}))+fld('Collection rate %',inp('settings.collectionRate',{num:1}),'Share of invoices collected')+fld('Monthly billing premium %',inp('settings.monthlyPremium',{num:1}),'Added when an airline pays monthly')+fld('Price increase at renewal %',inp('settings.priceIncrease',{num:1}),'Applied each contract year')+'</div>');
  h+=extraSettings(sec,M);
  // regions
  const usedBy=c=>state.airlines.filter(a=>a.country===c).length;
  let rb='<div class="regions">'+state.regions.map((rg,ri)=>'<div class="rbox" style="--rc:'+cv(rg.color)+'"><div class="rhead">'+inp('regions.'+ri+'.name',{w:'w-l',label:'Region name'})+swatch('regions.'+ri+'.color',rg.color)+del('del-region',ri,'','Remove region')+'</div><ul class="clist">'+rg.countries.map((c,ci)=>'<li>'+inp('regions.'+ri+'.countries.'+ci+'.name',{w:'w-m',label:'Country',rename:'country'})+'<label class="adjl">'+inp('regions.'+ri+'.countries.'+ci+'.priceAdj',{num:1,w:'w-xs',label:'Price adjustment %'})+'<span class="muted small">%</span></label><button class="linkish small" data-act="open-country" data-v="'+esc(c.name)+'">'+usedBy(c.name)+' airline'+(usedBy(c.name)===1?'':'s')+'</button><select class="in w-s" data-act="move-country" data-r="'+ri+'" data-c="'+ci+'" aria-label="Move to region"'+(readOnly?' disabled':'')+'>'+state.regions.map((x,xi)=>'<option value="'+xi+'"'+(xi===ri?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select>'+del('del-country',ci,' data-r="'+ri+'"','Remove country')+'</li>').join('')+'</ul>'+(readOnly?'':'<div class="addrow"><input id="newc-'+ri+'" class="in" placeholder="Add a country" aria-label="New country in '+esc(rg.name)+'"><button class="btn small" data-act="add-country" data-r="'+ri+'">Add</button></div>')+'</div>').join('')+'</div>';
  h+=sec('regions','Regions & countries','Countries sit inside regions. Airlines pick a country; the pipeline groups them by region. Renaming a country updates its airlines. The % field adjusts prices in that country (for example +15 or -10).',rb,readOnly?'':'<button class="btn small" data-act="add-region">Add region</button>');
  // products
  let pb='<div class="tbl-wrap mb"><table><thead><tr><th>Tier</th><th class="n">Up to pilots</th><th>Range</th><th></th></tr></thead><tbody>'+state.bands.map((b,i)=>'<tr><td>'+inp('bands.'+i+'.label',{w:'w-s',label:'Tier name'})+'</td><td>'+(i===state.bands.length-1?'<span class="muted">and above</span>':inp('bands.'+i+'.maxPilots',{num:1,w:'w-s',label:'Max pilots'}))+'</td><td class="muted small">'+bandRange(i)+'</td><td>'+(state.bands.length>1?del('del-band',i,'','Remove tier'):'')+'</td></tr>').join('')+'</tbody></table></div>';
  pb+=state.products.map((p,pi)=>'<div class="prod" style="--pc:'+cv(p.color)+'"><div class="prow">'+fld('Product name',inp('products.'+pi+'.name',{w:'w-xl'}))+fld('Short name',inp('products.'+pi+'.short',{w:'w-m'}))+fld('Price currency',inp('products.'+pi+'.currency',{type:'select',options:curCodes(),w:'w-s',label:'Price currency'}))+fld('Color',swatch('products.'+pi+'.color',p.color))+'<div class="pdel">'+(state.products.length>1?del('del-product',pi,'','Remove product'):'')+'</div></div><div class="tbl-wrap"><table><thead><tr><th>Tier</th>'+state.bands.map(b=>'<th class="n">'+esc(b.label)+'</th>').join('')+'</tr></thead><tbody><tr><td>Per pilot/mo ('+esc(p.currency||'USD')+')</td>'+state.bands.map((b,bi)=>'<td>'+inp('products.'+pi+'.rates.'+bi,{num:1,w:'w-s',label:b.label+' rate'})+'</td>').join('')+'</tr><tr><td>Implementation ('+esc(p.currency||'USD')+')</td>'+state.bands.map((b,bi)=>'<td>'+inp('products.'+pi+'.impl.'+bi,{num:1,w:'w-s',label:b.label+' implementation'})+'</td>').join('')+'</tr></tbody></table></div><div class="seatchk"><span class="muted small">Includes seats:</span><label>'+inp('products.'+pi+'.seats.cabin',{type:'checkbox'})+' Cabin crew</label><label>'+inp('products.'+pi+'.seats.admin',{type:'checkbox'})+' Admin</label><label>'+inp('products.'+pi+'.seats.instructor',{type:'checkbox'})+' Instructor</label><span class="muted small">· '+state.airlines.filter(a=>a.product===p.id).length+' airlines</span></div></div>').join('');
  h+=sec('products','Products & tiers','Tiers are shared by every product. Each product sets its own rate and implementation fee per tier, and which seat add-ons it charges.',pb,readOnly?'':'<div class="toolbar"><button class="btn small" data-act="add-band">Add tier</button><button class="btn small" data-act="add-product">Add product</button></div>');
  h+=sec('seats','Seats & crew ratios','Seat prices apply to products that include them. Ratios fill any blank pilot, cabin crew or instructor cell in the pipeline.','<div class="fields">'+fld('Seat price currency',inp('seatPrices.currency',{type:'select',options:curCodes()}))+fld('Cabin crew /seat/mo',inp('seatPrices.cabinRate',{num:1}))+fld('Admin /user/mo',inp('seatPrices.adminRate',{num:1}))+fld('Instructor /user/mo',inp('seatPrices.instructorRate',{num:1}))+fld('Pilots per aircraft',inp('ratios.pilotsPerAircraft',{num:1}))+fld('Cabin crew per aircraft',inp('ratios.cabinPerAircraft',{num:1}))+fld('Instructors per aircraft',inp('ratios.instructorsPerAircraft',{num:1}))+fld('Admins per airline',inp('ratios.adminsPerAirline',{num:1}))+'</div>');
  h+=sec('cohorts','Cohorts','Airlines with blank dates follow their cohort. Move a cohort and every airline in it moves.','<div class="tbl-wrap"><table><thead><tr><th>Code</th><th>Name</th><th>Signs</th><th>Go-live</th><th class="n">Airlines</th><th></th></tr></thead><tbody>'+state.cohorts.map((c,i)=>'<tr><td>'+inp('cohorts.'+i+'.id',{w:'w-xs',label:'Cohort code',rename:'cohort'})+'</td><td>'+inp('cohorts.'+i+'.name',{w:'w-xl',label:'Cohort name'})+'</td><td>'+inp('cohorts.'+i+'.signMonth',{type:'month',w:'w-m',label:'Signs'})+'</td><td>'+inp('cohorts.'+i+'.goLiveMonth',{type:'month',w:'w-m',label:'Go-live'})+'</td><td class="n">'+state.airlines.filter(a=>a.cohort===c.id).length+'</td><td>'+del('del-cohort',i)+'</td></tr>').join('')+'</tbody></table></div>',readOnly?'':'<button class="btn small" data-act="add-cohort">Add cohort</button>');
  const L=state.salary;
  h+=sec('salary','Salary ladder','The same rules as the Founders tab.','<div class="fields mb">'+fld('Base salary each /mo ('+MAINC()+')',inp('salary.base',{num:1}))+fld('Salaries start',inp('salary.startMonth',{type:'month'}))+fld('Lag after reaching (months)',inp('salary.lagMonths',{num:1}))+fld('Minimum gap between steps',inp('salary.minGapMonths',{num:1}))+'</div><div class="tbl-wrap"><table><thead><tr><th class="n">Live ARR reaches</th><th class="n">Salary each /mo ('+MAINC()+')</th><th>Takes effect (blank = auto)</th><th></th></tr></thead><tbody>'+L.steps.map((s,i)=>'<tr><td>'+inp('salary.steps.'+i+'.arr',{num:1,w:'w-m',label:'ARR threshold'})+'</td><td>'+inp('salary.steps.'+i+'.salary',{num:1,w:'w-s',label:'Salary'})+'</td><td>'+inp('salary.steps.'+i+'.month',{type:'month',w:'w-m',label:'Effective month'})+'</td><td>'+del('del-step',i)+'</td></tr>').join('')+'</tbody></table></div>',readOnly?'':'<button class="btn small" data-act="add-step">Add step</button>');
  h+=sec('founders','Founders','','<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>On payroll</th><th class="n">Salary %</th><th></th></tr></thead><tbody>'+state.founders.map((f,i)=>'<tr><td>'+inp('founders.'+i+'.name',{w:'w-m',label:'Name'})+'</td><td>'+inp('founders.'+i+'.role',{w:'w-m',label:'Role'})+'</td><td>'+inp('founders.'+i+'.onPayroll',{type:'checkbox',label:'On payroll'})+'</td><td>'+inp('founders.'+i+'.share',{num:1,w:'w-xs',label:'Salary share'})+'</td><td>'+del('del-founder',i)+'</td></tr>').join('')+'</tbody></table></div>',readOnly?'':'<button class="btn small" data-act="add-founder">Add founder</button>');
  h+=sec('competitors','Competitors','Reference prices for the pricing comparison.','<div class="tbl-wrap"><table><thead><tr><th>Name</th><th class="n">Per pilot/mo</th><th>Cur.</th><th>Note</th><th></th></tr></thead><tbody>'+state.competitors.map((c,i)=>'<tr><td>'+inp('competitors.'+i+'.name',{w:'w-m',label:'Competitor'})+'</td><td>'+inp('competitors.'+i+'.perPilot',{num:1,w:'w-s',label:'Price'})+'</td><td>'+inp('competitors.'+i+'.currency',{type:'select',options:curCodes(),w:'w-xs',label:'Currency'})+'</td><td>'+inp('competitors.'+i+'.note',{w:'w-xl',label:'Note'})+'</td><td>'+del('del-comp',i)+'</td></tr>').join('')+'</tbody></table></div>',readOnly?'':'<button class="btn small" data-act="add-comp">Add competitor</button>');
  h+=sec('display','Display & data','Theme is remembered in this browser only. Backups save every setting and row as a file you can load again.','<div class="fields mb">'+fld('Theme','<select id="theme" class="in" data-act="theme"><option value="system"'+(view.theme==='system'?' selected':'')+'>Match system</option><option value="light"'+(view.theme==='light'?' selected':'')+'>Light</option><option value="dark"'+(view.theme==='dark'?' selected':'')+'>Dark</option></select>')+fld('Opening scenario','<select id="scen" class="in" data-act="scen"><option value="plan"'+(view.scenario==='plan'?' selected':'')+'>Plan</option><option value="weighted"'+(view.scenario==='weighted'?' selected':'')+'>Weighted</option></select>')+'</div><div class="toolbar">'+(downloads?'<button class="btn" data-act="backup">Download backup (.json)</button><button class="btn" data-act="xlsx">Excel model (.xlsx)</button><button class="btn" data-act="pdf">Investor summary (.pdf)</button>':'')+(readOnly?'':'<label class="btn filebtn">Load a backup<input id="loadfile" type="file" accept=".json,application/json" data-act="loadfile"></label>')+(readOnly?'':'<button class="btn" data-act="discard">Undo unsaved changes</button>')+'</div>');
  h+=accessSection(sec);
  return h+'</div></div>';
}
function swatch(path,cur){
  const id='f-'+path.replace(/\./g,'-');
  return '<div class="swatches" role="radiogroup" aria-label="Color">'+COLORS.map(([k,l])=>'<button class="sw-btn'+(k===cur?' on':'')+'" style="background:var(--c-'+k+')" data-act="color" data-path="'+path+'" data-v="'+k+'" title="'+l+'" aria-label="'+l+'" role="radio" aria-checked="'+(k===cur)+'"'+(readOnly||cfgLocked?' disabled':'')+'></button>').join('')+'</div>';
}

/* ===== v6 modules: actuals, invoices, funding, scenarios, metrics, hiring, alerts, CRM ===== */
const OPEN_ST=['Pipeline','Contacted','Demo','Negotiating'];
const pad2=n=>String(n).padStart(2,'0');
function todayISO(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function asOfYm(){const S=state.settings;if(isSet(S.asOfMonth)&&/^\d{4}-\d{2}$/.test(S.asOfMonth))return S.asOfMonth;return todayISO().slice(0,7);}
const dayDiff=(a,b)=>Math.round((Date.parse(a)-Date.parse(b))/86400000);
const addDays=(iso,n)=>{const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());};
const fmtDate=iso=>iso&&/^\d{4}-\d{2}-\d{2}/.test(iso)?(+iso.slice(8,10))+' '+MON[+iso.slice(5,7)-1]+' '+iso.slice(0,4):'–';
function curScen(){return (state.scenarios||[]).find(x=>x.id===view.scen)||(state.scenarios||[])[0]||{id:'base',name:'Base'};}
function modelFor(sc,mode){const s=applyScenario(state,sc);const M=compute(s,mode||view.scenario);blendActuals(s,M,asOfYm());M.R=runwayInfo(s,M);M.s=s;M.sc=sc;return M;}
function curCodes(){return ['USD',...(state.settings.currencies||[]).map(c=>c.code).filter(Boolean)];}
function curSym(c){c=c||'USD';return SYM[c]||c+' ';}
const ivU=v=>num(v.amount)*fxOf(state,v.currency);
const ivPaidU=v=>(isSet(v.paidAmount)?num(v.paidAmount):num(v.amount))*fxOf(state,v.currency);
const typeOpts=()=>Object.entries(COST_TYPES).map(([v,l])=>({v,l}));
const effSign=a=>timingOf(state,a).sign;
function newAirline(over){
  const last=state.airlines[state.airlines.length-1]||{};
  const a=Object.assign({id:uid('a'),name:'New airline',country:last.country||'',fleet:4,pilots:'',cabin:'',instructors:'',admins:'',product:state.products[0].id,cohort:last.cohort||'',signMonth:'',goLiveMonth:'',status:'Pipeline',prob:25,billing:'annual',discount:0,growth:0,implOverride:'',include:true,notes:'',renewProb:'',contact:{name:'',role:'',email:'',phone:''},nextAction:'',nextActionDate:'',stageLog:[],baselineSign:''},over||{});
  a.baselineSign=timingOf(state,a).sign||'';
  return a;
}

/* ---------- generic charts ---------- */
function lineChart(labels,series,o){
  o=o||{};
  const W=o.w||1000,H=o.h||260,pl=56,pr=12,pt=14,pb=30,iw=W-pl-pr,ih=H-pt-pb;
  const all=series.flatMap(s=>s.values), mx=Math.max(1,...all), mn=Math.min(0,...all);
  const step=niceStepM((mx-mn)/4), top=Math.ceil(mx/step)*step, bot=Math.floor(mn/step)*step;
  const x=i=>pl+i/(labels.length-1||1)*iw, y=v=>pt+ih-(v-bot)/(top-bot||1)*ih;
  let g='';
  for(let v=bot;v<=top+1e-6;v+=step) g+='<line class="'+(Math.abs(v)<1e-9?'ax':'gl')+'" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  labels.forEach((l,i)=>{ if((l.slice(5)==='01'&&i>=4)||i===0) g+='<text class="yr" x="'+(x(i)+4)+'" y="'+(H-10)+'">'+(i===0?ymLabel(l):l.slice(0,4))+'</text>'; });
  if(o.mark!=null&&o.mark>=0) g+='<line x1="'+x(o.mark)+'" x2="'+x(o.mark)+'" y1="'+pt+'" y2="'+(pt+ih)+'" style="stroke:var(--muted);stroke-dasharray:3 3"/><text x="'+(x(o.mark)+4)+'" y="'+(pt+10)+'">'+esc(o.markLabel||'Today')+'</text>';
  series.forEach(s=>{ g+='<polyline points="'+s.values.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')+'" style="fill:none;stroke:'+s.color+';stroke-width:'+(s.width||2.2)+(s.dash?';stroke-dasharray:'+s.dash:'')+'"><title>'+esc(s.name)+'</title></polyline>'; const L=s.values.length-1; g+='<circle cx="'+x(L)+'" cy="'+y(s.values[L])+'" r="3.5" style="fill:'+s.color+'"/>'; });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.label||'Chart')+'">'+g+'</svg>';
}
const legendOf=series=>'<div class="legend">'+series.map(s=>'<span><i class="sw line" style="background:'+s.color+'"></i>'+esc(s.name)+'</span>').join('')+'</div>';
function waterfall(items){
  const W=620,H=250,pl=56,pr=10,pt=18,pb=34,iw=W-pl-pr,ih=H-pt-pb;
  let run=0; const bars=items.map(it=>{ if(it.total){ const b={l:it.l,y0:0,y1:it.v,c:it.c,v:it.v}; run=it.v; return b; } const b={l:it.l,y0:run,y1:run+it.v,c:it.c,v:it.v}; run+=it.v; return b; });
  const mx=Math.max(1,...bars.map(b=>Math.max(b.y0,b.y1))), step=niceStepM(mx/4), top=Math.ceil(mx/step)*step, bw=iw/bars.length, y=v=>pt+ih-v/top*ih;
  let g='';
  for(let v=0;v<=top+1e-6;v+=step) g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  bars.forEach((b,i)=>{ const x=pl+i*bw+bw*0.18,w=bw*0.64, t=Math.max(b.y0,b.y1), h=Math.max(1,Math.abs(b.y1-b.y0)/top*ih);
    g+='<rect x="'+x.toFixed(1)+'" y="'+y(t).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" style="fill:'+b.c+'"><title>'+esc(b.l)+' '+$(b.v)+'</title></rect><text x="'+(x+w/2)+'" y="'+(y(t)-5)+'" text-anchor="middle">'+(b.v<0?'−':'')+$k(Math.abs(b.v))+'</text><text class="yr" x="'+(x+w/2)+'" y="'+(H-12)+'" text-anchor="middle">'+esc(b.l)+'</text>'; });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="ARR bridge">'+g+'</svg>';
}
function stackBar(parts){ const tot=parts.reduce((a,p)=>a+p.v,0)||1; return '<div class="stackbar">'+parts.map(p=>'<span style="width:'+(p.v/tot*100)+'%;background:'+p.c+'" title="'+esc(p.l)+' '+pct(p.v/tot*100)+'"></span>').join('')+'</div>'; }

/* ---------- ALERTS ---------- */
function alertList(M){
  const R=M.R, S=state.settings, today=todayISO(), asI=monthIndex(asOfYm()), out=[];
  if(R.neg) out.push({lv:'bad',t:R.runway===0?'Cash is below zero now':'Cash runs out in '+ymLabel(R.neg.ym),d:R.runway===0?'The plan has no cash to cover '+ymLabel(R.now.ym)+' costs. Add opening cash or a funding round.':'About '+R.runway+' months of runway on this plan.',go:'funding',btn:'Add funding'});
  else if(R.below) out.push({lv:'warn',t:'Cash drops below your '+$(num(S.minCash))+' minimum in '+ymLabel(R.below.ym),d:'Lowest point '+$(R.minCash.v)+' in '+ymLabel(R.minCash.ym)+'.',go:'funding',btn:'Funding'});
  const od=(state.invoices||[]).filter(v=>!v.paidDate&&v.due&&v.due<today), od30=od.filter(v=>dayDiff(today,v.due)>30);
  if(od30.length) out.push({lv:'bad',t:od30.length+' invoice'+(od30.length===1?'':'s')+' overdue more than 30 days',d:$(od30.reduce((a,v)=>a+ivU(v),0))+' outstanding · oldest '+Math.max(...od30.map(v=>dayDiff(today,v.due)))+' days late.',go:'invoices',btn:'Invoices'});
  else if(od.length) out.push({lv:'warn',t:od.length+' invoice'+(od.length===1?'':'s')+' overdue',d:$(od.reduce((a,v)=>a+ivU(v),0))+' outstanding.',go:'invoices',btn:'Invoices'});
  const live=state.airlines.filter(a=>a.include!==false);
  const past=live.filter(a=>OPEN_ST.includes(a.status)&&isFinite(monthIndex(effSign(a)))&&monthIndex(effSign(a))<asI);
  if(past.length) out.push({lv:'warn',t:past.length+' deal'+(past.length===1?'':'s')+' past the planned signing month',d:past.slice(0,4).map(a=>esc(a.name)+' ('+ymLabel(effSign(a))+')').join(', ')+(past.length>4?' and '+(past.length-4)+' more':'')+'. Move the date or update the status.',go:'pipeline',btn:'Pipeline'});
  const slip=live.filter(a=>OPEN_ST.includes(a.status)&&a.baselineSign&&monthIndex(effSign(a))>monthIndex(a.baselineSign));
  if(slip.length) out.push({lv:'info',t:slip.length+' deal'+(slip.length===1?' has':'s have')+' slipped since first planned',d:slip.slice(0,4).map(a=>esc(a.name)+' +'+(monthIndex(effSign(a))-monthIndex(a.baselineSign))+' mo').join(', ')+'.',go:'pipeline',btn:'Pipeline'});
  const na=live.filter(a=>a.nextActionDate&&a.nextActionDate<today&&a.status!=='Lost');
  if(na.length) out.push({lv:'warn',t:na.length+' follow-up'+(na.length===1?'':'s')+' overdue',d:na.slice(0,4).map(a=>esc(a.name)+': '+esc(a.nextAction||'next action')).join(' · '),go:'pipeline',btn:'Pipeline'});
  const soonEnd=state.costs.filter(c=>isSet(c.endMonth)&&monthIndex(c.endMonth)>=asI&&monthIndex(c.endMonth)<=asI+2);
  const renew=state.costs.filter(c=>c.freq==='yearly'&&isFinite(monthIndex(c.startMonth))&&(asI+1-monthIndex(c.startMonth))%12===0&&asI+1>=monthIndex(c.startMonth));
  if(soonEnd.length||renew.length) out.push({lv:'info',t:'Costs changing soon',d:[...soonEnd.map(c=>esc(c.name)+' ends '+ymLabel(c.endMonth)),...renew.map(c=>esc(c.name)+' renews '+ymLabel(ymFromIndex(asI+1)))].join(' · '),go:'costs',btn:'Costs'});
  const A=state.actuals||{}, prev=ymFromIndex(asI-1);
  if(Object.keys(A).length&&!A[prev]&&monthIndex(prev)>=monthIndex(state.settings.startMonth)) out.push({lv:'info',t:'Actuals for '+ymLabel(prev)+' not entered',d:'Enter what you invoiced, collected and spent so the re-forecast stays accurate.',go:'actuals',btn:'Actuals'});
  return out;
}
function alertsPanel(M){
  const L=alertList(M);
  if(!L.length) return '<div class="panel mb alerts ok"><span class="adot good"></span><div><b>Nothing needs attention.</b> <span class="muted">Cash, invoices, deals and costs are on track.</span></div></div>';
  return '<div class="panel mb alerts"><div class="panel-head"><h3>Needs attention</h3><span class="muted small">'+L.length+' item'+(L.length===1?'':'s')+'</span></div><ul class="alist">'+L.map(x=>'<li><span class="adot '+x.lv+'"></span><div class="atext"><b>'+esc(x.t)+'</b><span class="muted small">'+x.d+'</span></div><button class="btn small" data-act="tab" data-v="'+x.go+'">'+esc(x.btn)+'</button></li>').join('')+'</ul></div>';
}
function runwayKpis(M){ return runwayKpiList(M).join(''); }
function runwayKpiList(M){
  const R=M.R;
  const rw=R.neg?(R.runway===0?'0':String(R.runway))+'<span class="unit"> months</span>':'>'+R.horizon+'<span class="unit"> months</span>';
  return [kpi('Cash runway',rw,R.neg?'Cash below zero in '+ymLabel(R.neg.ym):'Positive through '+ymLabel(state.settings.endMonth),R.neg&&R.runway<6?'alert':''),
    kpi('Break-even (profit)',R.be?ymLabel(R.be.ym):'Not in horizon','Monthly net stays ≥ $0 after'),
    kpi('Monthly burn now',$(Math.max(0,R.burn))+'<span class="unit"> /mo</span>',R.burn<0?'Cash positive · +'+$(-R.burn)+'/mo':'Avg of the last 3 months'),
    kpi('Cash today',$(R.now.cashB),'Re-forecast at '+ymLabel(R.now.ym))];
}

/* ---------- INVOICES ---------- */
function invStatus(v,today){return v.paidDate?'Paid':v.issue&&v.issue>today?'Scheduled':v.due&&v.due<today?'Overdue':'Open';}
