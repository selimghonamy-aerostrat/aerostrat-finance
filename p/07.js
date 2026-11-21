  Object.entries(reg).sort((a,b)=>b[1].arr-a[1].arr).forEach(([k,o])=>{ txt(k,mL+6,yy+10.5,{s:8}); txt(String(o.n),mL+half*0.5,yy+10.5,{s:8,a:'right'}); txt($k(o.arr),mL+half*0.75,yy+10.5,{s:8,a:'right'}); txt($k(o.w),mL+half-4,yy+10.5,{s:8,a:'right'}); d.line(mL,yy+15,mL+half,yy+15); yy+=15; });
  const fx=mL+half+20; let fy=y+8; const FR=state.funding.filter(f=>f.include!==false);
  if(!FR.length) txt('No rounds in the plan yet.',fx,fy+12,{s:8.5,c:GREY});
  FR.forEach(f=>{ txt(f.name+' · '+({equity:'Equity',safe:'SAFE',grant:'Grant',loan:'Loan'}[f.type]||''),fx,fy+11,{s:8.5,b:1}); txt($k(usdOf(f.amount,f.currency))+' · '+ymLabel(f.month),fx+half,fy+11,{s:8.5,a:'right'}); d.line(fx,fy+16,fx+half,fy+16); fy+=17; });
  const CT=capTable(state), last=CT.steps[CT.steps.length-1];
  if(last.total){ fy+=8; txt('Founders after '+last.label+': '+pct(last.rows.filter(r=>r.kind==='founder').reduce((a,r)=>a+r.shares,0)/last.total*100),fx,fy+11,{s:8.5,c:GREY}); }
  // footer
  d.setDrawColor(...LINE); d.line(mL,H-46,W-mL,H-46);
  txt('Planning model built from management assumptions; not audited accounts. '+(ys.some(g=>g.months<12)?'* Partial year. ':'')+'Generated from the STRATOS Finance Tracker.',mL,H-32,{s:7,c:GREY,mw:cw});
  txt('STRATOS · Intelligence-Driven Aviation',W-mL,H-20,{s:7,c:DEEP,a:'right',b:1});
  const buf=d.output('arraybuffer');
  try{await downloads.save({filename:'stratos-investor-summary-'+todayISO()+'.pdf',data:buf});toast('Investor summary saved');}catch(err){if(err&&err.code!=='declined')toast('Couldn’t save the PDF here.');}
}

/* ---------- shell ---------- */
function shell(){
  const dirty=isDirty();
  const stTxt=loading?'Loading…':readOnly?'View only':dirty?'Unsaved changes':(meta.savedAt?'Saved '+fmtWhen(meta.savedAt)+(meta.savedByName?' by '+meta.savedByName:''):'All changes saved');
  return '<header class="bar"><div class="wrap"><div class="brand"><img src="'+LOGOS.white+'" alt="STRATOS Intelligence-Driven Aviation"><span class="divider"></span><span class="app">Finance Tracker<small>Forecast · pricing · costs · founder pay</small></span></div><span class="spacer"></span>'+
    '<select class="in scen-pick" data-act="pick-scen" aria-label="Scenario">'+(state.scenarios||[]).map(s=>'<option value="'+esc(s.id)+'"'+(s.id===curScen().id?' selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select>'+
    '<div class="seg" role="group" aria-label="Probability mode"><button data-act="scenario" data-v="plan" aria-pressed="'+(view.scenario==='plan')+'">Plan</button><button data-act="scenario" data-v="weighted" aria-pressed="'+(view.scenario==='weighted')+'">Weighted</button></div>'+
    '<div class="savebox"><span class="savestate '+(dirty&&!readOnly?'dirty':'')+'" role="status">'+esc(stTxt)+'</span>'+(readOnly||loading?'':(dirty?'<button class="btn ghost-light small" data-act="discard">Discard</button>':'')+'<button class="btn cta" data-act="save" '+(dirty&&!busy?'':'disabled')+'>'+(busy?'Saving…':'Save')+'</button>')+'</div></div><div class="ribbon"></div></header>'+
    '<nav class="tabs" aria-label="Sections"><div class="wrap" role="tablist">'+TABS.map(([k,l])=>'<button role="tab" data-act="tab" data-v="'+k+'" aria-selected="'+(view.tab===k)+'">'+l+'</button>').join('')+'</div></nav><main><div class="wrap" id="content"></div></main>';
}
function render(){
  const ae=document.activeElement, focusId=ae&&ae.id;
  const sx=window.scrollX, sy=window.scrollY, tw=document.querySelector('.tbl-wrap'), tsl=tw?tw.scrollLeft:0;
  document.getElementById('app').innerHTML=shell();
  let h='';
  if(loading){ document.getElementById('content').innerHTML='<div class="panel loadpanel"><span class="spin" aria-hidden="true"></span><div><h3>Loading the latest saved version</h3><p class="muted">Fetching the tracker from the shared database.</p></div></div>'; return; }
  if(dbMode==='offline') h+='<div class="banner warn"><span class="grow">The shared database isn’t available in this view, so you’re seeing the last published snapshot read-only. Open the tracker in Claude while signed in to edit and save.</span></div>';
  else if(dbMode==='noaccess') h+='<div class="banner"><span class="grow">You can view this tracker but not save changes to it.</span></div>';
  if(remoteNewer) h+='<div class="banner warn"><span class="grow">'+esc((remoteNewer.byName||'Someone')+' saved a newer version '+fmtWhen(remoteNewer.at)+'. Saving now will replace it with your version.')+'</span><button class="btn small" data-act="load-remote">Load their version</button><button class="btn small" data-act="keep-mine">Keep mine</button></div>';
  if(restored) h+='<div class="banner"><span class="grow">Your unsaved changes from this browser were restored.</span>'+(readOnly?'':'<button class="btn small" data-act="discard">Discard them</button>')+'</div>';
  if(staleDraft) h+='<div class="banner warn"><span class="grow">A newer version was saved since your last edits in this browser. Your edits are kept but not shown.</span><button class="btn small" data-act="restore-stale">Load my edits</button><button class="btn small" data-act="drop-stale">Delete them</button></div>';
  const M=modelFor(curScen());
  if(curScen().id!=='base') h+='<div class="banner scen" style="--pc:'+cv(curScen().color)+'"><span class="grow"><b>'+esc(curScen().name)+' scenario.</b> Every tab shows the plan with this scenario’s adjustments. Switch back to Base in the top bar.</span><button class="btn small" data-act="use-scen" data-v="base">Back to Base</button></div>';
  if(cfgLocked&&!readOnly) h+='<div class="banner"><span class="grow">You can update airlines, invoices and actuals. Pricing, costs, funding and settings are locked to editors.</span></div>';
  if(view.airline&&!state.airlines.some(x=>x.id===view.airline)) view.airline=null;
  if(view.airline) h+=airlineDetail(view.airline);
  else if(view.tab==='countries') h+=view.country?countryDetail(view.country):countriesView(M);
  else h+=({overview,pipeline,pricing,costs,team:teamView,invoices:invoicesView,actuals:actualsView,funding:fundingView,scenarios:scenariosView,metrics:metricsView,forecast,settings}[view.tab]||overview)(M);
  h+='<footer class="foot"><span>Last saved version dated '+esc(state.updated||'')+'. A planning model built from your inputs, not accounting records.</span><span class="muted">STRATOS · Intelligence-Driven Aviation</span></footer>';
  document.getElementById('content').innerHTML=h;
  const tw2=document.querySelector('.tbl-wrap'); if(tw2) tw2.scrollLeft=tsl;
  if(pendingScroll){const el=document.getElementById(pendingScroll);pendingScroll=null;if(el){el.scrollIntoView({block:'start'});}} else window.scrollTo(sx,sy);
  if(focusId){const el=document.getElementById(focusId); if(el) el.focus({preventScroll:true});}
}
let rTimer=null;
const scheduleRender=()=>{clearTimeout(rTimer);rTimer=setTimeout(render,0);};
const persistView=()=>lsSet(LS_VIEW,JSON.stringify(view));
function commit(){
  saveDraft();
  scheduleRender();
}
function fmtWhen(iso){ if(!iso) return ''; const d=new Date(iso); if(isNaN(d)) return ''; const today=new Date(); const same=d.toDateString()===today.toDateString(); return (same?'today':MON[d.getMonth()]+' '+d.getDate()+(d.getFullYear()!==today.getFullYear()?' '+d.getFullYear():''))+' at '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function toast(msg){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3400);}

/* ---------- events ---------- */
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.bind){
    let v;
    if(el.dataset.kind==='bool') v=el.checked;
    else if(el.dataset.kind==='num'||el.dataset.kind==='money'){ if(el.value===''&&el.dataset.blank) v=''; else { v=parseFloat(el.value); if(!isFinite(v)) v=el.dataset.blank?'':0; else if(el.dataset.kind==='money') v=Math.round(v*DR()*1e6)/1e6; } }
    else v=el.value;
    const old=getPath(state,el.dataset.bind);
    setPath(state,el.dataset.bind,v);
    if(el.dataset.rename==='country'&&old!==v) state.airlines.forEach(a=>{if(a.country===old)a.country=v;});
    if(el.dataset.rename==='country'&&old!==v) (state.fees||[]).forEach(f=>{if(f.scope==='c:'+old)f.scope='c:'+v;});
    if(el.dataset.rename==='cohort'&&old!==v) state.airlines.forEach(a=>{if(a.cohort===old)a.cohort=v;});
    {const mm=/^airlines\.(\d+)\.status$/.exec(el.dataset.bind); if(mm&&old!==v){const ar=state.airlines[+mm[1]]; ar.stageLog=(ar.stageLog||[]).concat([{date:todayISO(),from:old,to:v}]);}}
    {const mm=/^settings\.currencies\.(\d+)\.code$/.exec(el.dataset.bind); if(mm&&old!==v){state.costs.forEach(c=>{if(c.currency===old)c.currency=v;});state.hires.forEach(c=>{if(c.currency===old)c.currency=v;});}}
    commit(); return;
  }
  const a=el.dataset.act;
  if(el.dataset.q){view.quote[el.dataset.q]=el.value;persistView();scheduleRender();return;}
  if(a==='groupBy'){view.groupBy=el.value;persistView();scheduleRender();}
  else if(a==='filterRegion'){view.filterRegion=el.value;persistView();scheduleRender();}
  else if(a==='theme'){view.theme=el.value;persistView();applyTheme();scheduleRender();}
  else if(a==='scen'){view.scenario=el.value;persistView();scheduleRender();}
  else if(a==='fx-units'&&!readOnly&&!cfgLocked){ const c=state.settings.currencies[+el.dataset.i], u=parseFloat(el.value); if(c&&u>0){ c.usd=Math.round(1/u*1e8)/1e8; c.auto=false; commit(); } }
  else if(a==='pick-scen'){view.scen=el.value;persistView();scheduleRender();}
  else if(a==='ex-region'&&!readOnly&&!cfgLocked){const sc=state.scenarios[+el.dataset.s], r=el.dataset.r; sc.excludeRegions=(sc.excludeRegions||[]).filter(x=>x!==r); if(el.checked) sc.excludeRegions.push(r); commit();}
  else if(a==='move-country'&&!readOnly){const r=+el.dataset.r,c=+el.dataset.c,to=+el.value;if(to!==r){const [x]=state.regions[r].countries.splice(c,1);state.regions[to].countries.push(x);}commit();}
  else if(a==='loadfile'&&el.files&&el.files[0]){const fr=new FileReader();fr.onload=()=>{try{const s=patchFx(migrate(JSON.parse(fr.result)));if(!s.airlines||!s.products)throw 0;if(cfgLocked){OPS_KEYS.forEach(k=>state[k]=s[k]);}else state=s;commit();toast('Backup loaded. Click Save to keep it.');}catch(err){toast('That file isn’t a tracker backup.');}};fr.readAsText(el.files[0]);}
});
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.matches&&e.target.matches('tr[data-act]')){e.target.click();return;} if(e.key==='Enter'&&e.target.id&&e.target.id.startsWith('newc-')){const b=document.querySelector('[data-act=add-country][data-r="'+e.target.id.slice(5)+'"]');if(b)b.click();} });
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.tagName==='SELECT'||b.tagName==='INPUT') return;
  const a=b.dataset.act, i=+b.dataset.i;
  switch(a){
    case 'tab': view.tab=b.dataset.v; view.airline=null; if(view.tab!=='countries') view.country=null; else if(b.getAttribute('aria-selected')==='true') view.country=null; persistView(); try{history.replaceState(null,'','#'+view.tab);}catch(err){} render(); window.scrollTo(0,0); return;
    case 'scenario': view.scenario=b.dataset.v; persistView(); render(); return;
    case 'year': view.year=b.dataset.v; persistView(); render(); return;
    case 'toggle-group': {const k=b.dataset.k; if(view.collapsed[k]) delete view.collapsed[k]; else view.collapsed[k]=true; persistView(); render(); return;}
    case 'collapse-all': {const fns=groupKeyFns(); view.collapsed={}; state.airlines.forEach(x=>{const k=view.groupBy==='region'?'r:'+fns.region(x):view.groupBy+':'+fns[view.groupBy](x); view.collapsed[k]=true;}); persistView(); render(); return;}
    case 'expand-all': view.collapsed={}; persistView(); render(); return;
    case 'pick-region': view.filterRegion=view.filterRegion===b.dataset.v?'All':b.dataset.v; persistView(); render(); return;
    case 'goto-settings': view.tab='settings'; pendingScroll='set-'+b.dataset.v; persistView(); try{history.replaceState(null,'','#settings');}catch(err){} render(); return;
    case 'set-jump': {const el=document.getElementById('set-'+b.dataset.v); if(el) el.scrollIntoView({block:'start',behavior:'smooth'}); return;}
    case 'open-country': view.tab='countries'; view.country=b.dataset.v; view.airline=null; persistView(); try{history.replaceState(null,'','#countries');}catch(err){} render(); window.scrollTo(0,0); return;
    case 'back-countries': view.country=null; view.airline=null; persistView(); render(); window.scrollTo(0,0); return;
    case 'open-airline': view.airline=b.dataset.v; persistView(); render(); window.scrollTo(0,0); return;
    case 'close-airline': view.airline=null; persistView(); render(); window.scrollTo(0,0); return;
    case 'save': save(); return;
    case 'discard': state=JSON.parse(CANON); restored=false; remoteNewer=null; lsDel(LS_DRAFT); render(); toast('Changes discarded'); return;
    case 'load-remote': state=JSON.parse(CANON); remoteNewer=null; restored=false; lsDel(LS_DRAFT); render(); toast('Loaded the latest saved version'); return;
    case 'keep-mine': remoteNewer=null; saveDraft(); render(); return;
    case 'restore-stale': state=staleDraft.state; staleDraft=null; commit(); return;
    case 'drop-stale': staleDraft=null; lsDel(LS_DRAFT); render(); return;
    case 'csv': exportCSV(); return;
    case 'backup': backup(); return;
    case 'xlsx': exportXLSX(); return;
    case 'pdf': exportPDF(); return;
    case 'inv-filter': view.invFilter=b.dataset.v; persistView(); render(); return;
    case 'use-scen': view.scen=b.dataset.v; persistView(); render(); return;
    case 'load-history': loadHistory(); return;
    case 'fx-update': fetchFx(true); return;
  }
  if(readOnly) return;
  if(cfgLocked&&!OPS_ACTS.has(a)){ if(['color','add-hire','add-round','add-scen','add-cost','add-currency','add-holder','add-dist'].includes(a)||a.startsWith('add-')||a.startsWith('del-')) toast('Only editors can change this.'); return; }
  const S=state;
  switch(a){
    case 'add-airline': {const rg=S.regions.find(r=>r.name===view.filterRegion), last=S.airlines[S.airlines.length-1]||{}; S.airlines.push(newAirline({country:rg&&rg.countries[0]?rg.countries[0].name:(last.country||'')})); view.collapsed={}; break;}
    case 'dup-airline': {const c=JSON.parse(JSON.stringify(S.airlines[i])); c.id=uid('a'); c.name+=' (copy)'; c.stageLog=[]; S.airlines.splice(i+1,0,c); break;}
    case 'del-airline': S.airlines.splice(i,1); break;
    case 'del-airline-detail': S.airlines.splice(i,1); view.airline=null; persistView(); break;
    case 'add-airline-country': {const c=b.dataset.v, last=S.airlines.filter(x=>x.country===c).pop()||{}; const na=newAirline({country:c,cohort:last.cohort||''}), id=na.id; S.airlines.push(na); view.airline=id; persistView(); commit(); window.scrollTo(0,0); return;}
    case 'add-cost': S.costs.push({id:uid('c'),name:'New cost',category:'Other',basis:'fixed',growth:0,amount:0,freq:'monthly',currency:'USD',qty:1,startMonth:S.settings.startMonth,endMonth:''}); break;
    case 'del-cost': S.costs.splice(i,1); break;
    case 'add-band': {const B=S.bands, last=B[B.length-1], prev=B[B.length-2]; last.maxPilots=(prev?num(prev.maxPilots):0)+200; B.push({label:'Tier '+(B.length+1),maxPilots:null}); S.products.forEach(p=>{p.rates.push(Math.max(0,num(p.rates[p.rates.length-1])-1));p.impl.push(num(p.impl[p.impl.length-1])+2000);}); break;}
    case 'del-band': S.bands.splice(i,1); S.bands[S.bands.length-1].maxPilots=null; S.products.forEach(p=>{p.rates.splice(i,1);p.impl.splice(i,1);}); break;
    case 'add-product': S.products.push({id:uid('p'),name:'New product',short:'New',color:'sky60',rates:S.bands.map(()=>0),impl:S.bands.map(()=>0),seats:{cabin:false,admin:false,instructor:false}}); break;
    case 'del-product': {const id=S.products[i].id; S.products.splice(i,1); S.airlines.forEach(x=>{if(x.product===id)x.product=S.products[0].id;}); break;}
    case 'add-region': S.regions.push({id:uid('r'),name:'New region',color:'deep40',countries:[]}); break;
    case 'del-region': S.regions.splice(i,1); break;
    case 'add-country': {const r=+b.dataset.r, el=document.getElementById('newc-'+r), v=el&&el.value.trim(); if(!v) return; S.regions.forEach(x=>x.countries=x.countries.filter(c=>c.name!==v)); S.regions[r].countries.push({name:v}); break;}
    case 'del-country': S.regions[+b.dataset.r].countries.splice(i,1); break;
    case 'color': setPath(S,b.dataset.path,b.dataset.v); break;
    case 'add-cohort': {let n=S.cohorts.length, id; do{id=String.fromCharCode(65+n++);}while(S.cohorts.some(c=>c.id===id)); S.cohorts.push({id,name:'Cohort '+id,signMonth:S.settings.startMonth,goLiveMonth:S.settings.startMonth}); break;}
    case 'del-cohort': {const id=S.cohorts[i].id, c=S.cohorts[i]; S.airlines.forEach(x=>{if(x.cohort===id){x.cohort='';x.signMonth=x.signMonth||c.signMonth;x.goLiveMonth=x.goLiveMonth||c.goLiveMonth;}}); S.cohorts.splice(i,1); break;}
    case 'add-step': {const s=S.salary.steps, top=s.reduce((m,x)=>num(x.arr)>num(m.arr)?x:m,{arr:0,salary:S.salary.base}); s.push({arr:num(top.arr)+150000,salary:num(top.salary)+500,month:''}); break;}
    case 'del-step': S.salary.steps.splice(i,1); break;
    case 'add-founder': S.founders.push({name:'New founder',role:'',onPayroll:false,share:100}); break;
    case 'del-founder': S.founders.splice(i,1); break;
    case 'add-comp': S.competitors.push({name:'Competitor',perPilot:0,currency:MAINC(),note:''}); break;
    case 'gen-invoices': {const sel=document.getElementById('genAir'); const n=generateInvoices(sel?sel.value:''); toast(n?n+' invoice'+(n===1?'':'s')+' created from the plan':'No new invoices: the plan’s invoices up to '+ymLabel(ymFromIndex(monthIndex(asOfYm())+3))+' already exist.'); break;}
    case 'add-invoice': {const t=todayISO(), seq=S.invoices.filter(v=>(v.issue||'').slice(0,7)===t.slice(0,7)).length+1; S.invoices.push({id:uid('i'),number:'INV-'+t.slice(0,7).replace('-','')+'-'+String(seq).padStart(2,'0'),airline:'',kind:'License',issue:t,due:addDays(t,num(S.settings.paymentTermsDays,30)),amount:0,paidDate:'',paidAmount:'',note:'',planKey:''}); view.invFilter='all'; break;}
    case 'del-invoice': S.invoices.splice(i,1); break;
    case 'inv-paid': S.invoices[i].paidDate=todayISO(); break;
    case 'add-round': S.funding.push({id:uid('f'),name:'New round',type:'safe',investor:'',amount:100000,month:ymFromIndex(monthIndex(asOfYm())+3),preMoney:'',cap:'',discount:20,poolPct:0,interest:0,repayMonth:'',include:true}); break;
    case 'del-round': S.funding.splice(i,1); break;
    case 'add-holder': S.capTable.holders.push({name:'New shareholder',kind:'employee',shares:''}); break;
    case 'del-holder': S.capTable.holders.splice(i,1); break;
    case 'add-dist': S.distributions.push({id:uid('d'),month:ymFromIndex(monthIndex(asOfYm())+12),amount:10000,note:''}); break;
    case 'del-dist': S.distributions.splice(i,1); break;
    case 'add-scen': S.scenarios.push({id:uid('s'),name:'New scenario',color:'deep60',delay:0,probAdj:0,priceAdj:0,costAdj:0,renewAdj:0,excludeRegions:[],noFunding:false}); break;
    case 'del-scen': {const id=S.scenarios[i].id; S.scenarios.splice(i,1); if(view.scen===id){view.scen='base';persistView();} break;}
    case 'add-hire': S.hires.push({id:uid('h'),role:'New role',type:'rd',salary:1000,currency:'USD',trigger:'month',month:ymFromIndex(monthIndex(asOfYm())+6),value:'',endMonth:'',growth:0,include:true}); break;
    case 'del-hire': S.hires.splice(i,1); break;
    case 'add-fee': S.fees.push({id:uid('fee'),name:'New tax or fee',basis:'pctCollected',rate:1,amount:0,currency:'USD',scope:'',startMonth:'',endMonth:'',type:'ga',include:true,note:''}); break;
    case 'del-fee': S.fees.splice(i,1); break;
    case 'reset-baseline': S.airlines[i].baselineSign=effSign(S.airlines[i])||''; break;
    case 'add-currency': S.settings.currencies.push({code:'',usd:1,auto:true}); break;
    case 'del-currency': S.settings.currencies.splice(i,1); break;
    case 'restore-version': {const x=histList&&histList[i]; if(!x) return; (async()=>{ let st=x.state; if(!st&&db){ try{ const d=await db.doc(HIST+'/'+x.id).get(); st=d.exists&&d.data()&&d.data().state; }catch(e){} } if(!st){ toast('Couldn’t load that version. Try again.'); return; } const s=patchFx(migrate(JSON.parse(JSON.stringify(st)))); if(cfgLocked) OPS_KEYS.forEach(k=>state[k]=s[k]); else state=s; restored=false; commit(); toast('Version from '+fmtWhen(x.savedAt)+' loaded. Click Save to make it current.'); })(); return;}
    case 'del-comp': S.competitors.splice(i,1); break;
    default: return;
  }
  commit();
});

/* ---------- save (shared database: core = editors only, ops = contributors) ---------- */
const CORE_PATH='core/config', OPS_PATH='ops/data', LEGACY_PATH='tracker/state', HIST='history', HIST_KEEP=60;
function splitState(st){ const core={}, ops={}; for(const k in st){ if(OPS_KEYS.includes(k)) ops[k]=st[k]; else core[k]=st[k]; } return {core,ops}; }
async function writeDoc(path,body){
  try{ await db.doc(path).set(body); }
  catch(err){ if(err&&err.code==='unavailable'){ await new Promise(r=>setTimeout(r,600+Math.random()*900)); await db.doc(path).set(body); } else throw err; }
}
async function save(){
  if(busy||readOnly||loading||!db) return;
  const st=JSON.parse(JSON.stringify(state)); st.updated=new Date().toISOString().slice(0,10);
  const prev=JSON.parse(CANON), P=splitState(prev), N=splitState(st);
  const coreChanged=JSON.stringify(Object.assign({},P.core,{updated:0}))!==JSON.stringify(Object.assign({},N.core,{updated:0}));
  const opsChanged=JSON.stringify(P.ops)!==JSON.stringify(N.ops);
  const at=new Date().toISOString(), by=myId||'';
  busy=true; render(); saveDraft();
  try{
    if(coreChanged&&!cfgLocked) await writeDoc(CORE_PATH,{state:N.core,savedAt:at,savedBy:by});
    if(opsChanged||!remoteParts.ops) await writeDoc(OPS_PATH,{state:N.ops,savedAt:at,savedBy:by});
    if(!remoteParts.core&&!cfgLocked&&!coreChanged) await writeDoc(CORE_PATH,{state:N.core,savedAt:at,savedBy:by});
    const summary=changeSummary(remoteParts.core||remoteParts.ops?prev:null,st);
    if(cfgLocked){ st.version=prev.version; Object.keys(P.core).forEach(k=>st[k]=prev[k]); }
    remoteParts.core={state:splitState(st).core,savedAt:at,savedBy:by}; remoteParts.ops={state:splitState(st).ops,savedAt:at,savedBy:by};
    state=setBase(st); remoteNewer=null; restored=false; staleDraft=null; lsDel(LS_DRAFT);
    meta={savedAt:at,savedBy:by,savedByName:meta.myName||'',myName:meta.myName};
    busy=false; render(); toast('Saved to the database');
    db.collection(HIST).add({state:st,savedAt:at,savedBy:by,summary}).then(()=>{ if(histList) loadHistory(true); pruneHistory(); }).catch(()=>{});
  }catch(err){
    busy=false; const c=err&&err.code;
    if(c==='invalid_argument'&&JSON.stringify(st).length<250000){ readOnly=true; dbMode='noaccess'; toast('You don’t have permission to save. Your edits stay in this browser.'); }
    else if(c==='invalid_argument'||c==='quota_exceeded') toast('The tracker is too large to save. Remove some rows and try again.');
    else if(c==='resource_exhausted') toast('Saving too often. Wait a moment and save again.');
    else if(c==='revoked'){ readOnly=true; dbMode='noaccess'; toast('Saving is no longer available here. Your edits stay in this browser.'); }
    else toast('Save failed. Your edits are kept in this browser; try again in a moment.');
    render();
  }
}
let pruning=false;
async function pruneHistory(){
  if(pruning||!db) return; pruning=true;
  try{ const q=await db.collection(HIST).orderBy('savedAt','desc').limit(200).get(); const old=q.docs.slice(HIST_KEEP); for(const d of old){ try{ await db.doc(HIST+'/'+d.id).delete(); }catch(e){ break; } } }catch(e){}
  pruning=false;
}
async function loadHistory(quiet){
  if(!db){ toast('Saved versions need the shared database.'); return; }
  histLoading=!quiet; if(!quiet) render();
  try{
    const q=await db.collection(HIST).orderBy('savedAt','desc').limit(HIST_KEEP).get();
    const rows=q.docs.map(d=>Object.assign({id:d.id},d.data()));
    const ids=Array.from(new Set(rows.map(r=>r.savedBy).filter(Boolean)));
    let P={}; if(userApi&&ids.length){ try{ P=await userApi.profiles(ids)||{}; }catch(e){} }
    histList=rows.map(r=>Object.assign({},r,{byName:(P[r.savedBy]&&P[r.savedBy].name)||(r.savedBy&&r.savedBy===myId?meta.myName:'')||''}));
  }catch(e){ histList=histList||[]; toast('Couldn’t load saved versions. Try again in a moment.'); }
  histLoading=false; render();
}
async function resolveName(id){
  if(!id) return '';
  if(id===myId&&meta.myName) return meta.myName;
  if(!userApi) return '';
  try{ const p=await userApi.profiles([id]); return (p&&p[id]&&p[id].name)||''; }catch(e){ return ''; }
}
const remoteParts={core:null,ops:null}; const firstSeen={core:false,ops:false};
function combinedRemote(){
  const base=splitState(JSON.parse(CANON));
  const core=remoteParts.core?remoteParts.core.state:base.core, ops=remoteParts.ops?remoteParts.ops.state:base.ops;
  return Object.assign({},core,ops);
}
function latestMeta(){ const c=remoteParts.core||{}, o=remoteParts.ops||{}; return (c.savedAt||'')>(o.savedAt||'')?c:o; }
async function finishFirstLoad(){
  if(!loading) return;
  if(!remoteParts.core&&!remoteParts.ops){
    // fall back to the earlier single-document storage, then the page snapshot
    try{ const L=await db.doc(LEGACY_PATH).get(); if(L.exists&&L.data()&&L.data().state){ const d=L.data(); const sp=splitState(d.state); remoteParts.core={state:sp.core,savedAt:d.savedAt||'',savedBy:d.savedBy||'',legacy:true}; remoteParts.ops={state:sp.ops,savedAt:d.savedAt||'',savedBy:d.savedBy||'',legacy:true}; } }catch(e){}
  }
  if(remoteParts.core||remoteParts.ops){ state=setBase(combinedRemote()); state=JSON.parse(CANON); const m=latestMeta(); meta.savedAt=m.savedAt||''; meta.savedBy=m.savedBy||''; resolveName(meta.savedBy).then(n=>{meta.savedByName=n; render();}); }
  if(remoteParts.core&&remoteParts.core.legacy){ remoteParts.core=null; remoteParts.ops=null; }
  loading=false; applyDraft(); render();
}
function onPart(part,snap){
  const d=snap.exists?snap.data():null;
  remoteParts[part]=d&&d.state&&typeof d.state==='object'?{state:d.state,savedAt:d.savedAt||'',savedBy:d.savedBy||''}:null;
  if(loading){ firstSeen[part]=true; if(firstSeen.core&&firstSeen.ops) finishFirstLoad(); return; }
  if(!remoteParts[part]) return;
  const incoming=patchFx(migrate(JSON.parse(JSON.stringify(combinedRemote())))), incStr=JSON.stringify(incoming);
  if(incStr===CANON){ const m=latestMeta(); if(m.savedAt&&m.savedAt!==meta.savedAt){ meta.savedAt=m.savedAt; meta.savedBy=m.savedBy; resolveName(m.savedBy).then(n=>{meta.savedByName=n; render();}); } return; }
  const wasDirty=isDirty(), prevState=state;
  setBase(incoming);
  const m=latestMeta(); meta.savedAt=m.savedAt||''; meta.savedBy=m.savedBy||''; meta.savedByName='';
  resolveName(meta.savedBy).then(n=>{ meta.savedByName=n; if(remoteNewer) remoteNewer.byName=n; scheduleRender(); });
  if(wasDirty&&JSON.stringify(prevState)!==incStr){ state=prevState; remoteNewer={at:m.savedAt||'',byName:''}; saveDraft(); }
  else { state=JSON.parse(CANON); remoteNewer=null; if(!snap.metadata||!snap.metadata.hasPendingWrites) toast('Updated with the latest saved version'); }
  scheduleRender();
}
const unsubs={};
function subscribe(part,path){
  if(unsubs[part]) unsubs[part]();
  unsubs[part]=db.doc(path).onSnapshot(s=>onPart(part,s), err=>{
    const c=err&&err.code;
    if(c==='unavailable'){ setTimeout(()=>subscribe(part,path),1500+Math.random()*1500); return; }
    if(loading){ firstSeen[part]=true; if(firstSeen.core&&firstSeen.ops) finishFirstLoad(); }
    if(c==='revoked'){ readOnly=true; dbMode='noaccess'; }
    render();
  });
}
async function initData(){
  if(!(window.claude&&window.claude.use)) return false;
  try{ db=await window.claude.use('db'); }catch(e){ db=null; }
  try{ userApi=await window.claude.use('user'); }catch(e){ userApi=null; }
  if(userApi){
    try{ const me=await userApi.me(); myId=me.id||null; meta.myName=me.name||''; isOwnerV=!!me.isOwner; if(me.canEdit===false&&!me.isOwner) cfgLocked=true; }catch(e){}
    try{ if(!myId) myId=await userApi.id(); }catch(e){}
  }
  if(!db){ dbMode='offline'; readOnly=true; cfgLocked=false; loading=false; render(); return true; }
  dbMode='live';
  if(userApi){ try{ const w=await userApi.can('data.write'); if(w===false){ readOnly=true; dbMode='noaccess'; } }catch(e){} }
  subscribe('core',CORE_PATH); subscribe('ops',OPS_PATH);
  setTimeout(()=>{ if(loading){ firstSeen.core=firstSeen.ops=true; finishFirstLoad(); } },8000);
  return true;
}

/* ---------- downloads ---------- */
async function exportCSV(){
  if(!downloads) return;
  const M=compute(state,view.scenario);
  const M2=modelFor(curScen()); const head=['Month','Recurring','Implementation','Revenue','Tools & infra','Salaries','Hires','Total costs','Net','Cash collected','Funding','Cash balance (re-forecast)','Live ARR','Airlines live','Salary each',...state.products.map(p=>p.short+' licenses')];
  const lines=[head.map(x=>'"'+x+'"').join(',')].concat(M2.months.map(m=>[m.ym,m.recurring,m.impl,m.revenue,m.tools,m.salaries,m.hires,m.costs,m.net,m.cashIn,m.funding,m.cashB,m.liveARR,m.live,m.salaryEach,...state.products.map(p=>m.byProduct[p.id]||0)].map((v,i)=>i===0?v:(Math.round(v*100)/100)).join(',')));
  try{await downloads.save({filename:'stratos-forecast-'+view.scenario+'.csv',data:lines.join('\n')});toast('CSV saved');}catch(err){if(err&&err.code!=='declined')toast('Couldn’t export the CSV here.');}
}
async function backup(){
  if(!downloads) return;
  try{await downloads.save({filename:'stratos-finance-backup-'+new Date().toISOString().slice(0,10)+'.json',data:JSON.stringify(state,null,2)});toast('Backup saved');}catch(err){if(err&&err.code!=='declined')toast('Couldn’t save the backup here.');}
}

