function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}}
try{const v=JSON.parse(lsGet(LS_VIEW)||'null'); if(v) view=Object.assign(view,v,{quote:Object.assign(view.quote,v.quote||{})});}catch(e){}
const TABS=[['overview','Overview'],['pipeline','Pipeline'],['countries','Countries'],['pricing','Pricing'],['costs','Costs'],['team','Team'],['invoices','Invoices'],['actuals','Actuals'],['funding','Funding'],['scenarios','Scenarios'],['metrics','Metrics'],['forecast','Forecast'],['settings','Settings']];
if(view.tab==='founders') view.tab='team';
{const hh=location.hash.slice(1)==='founders'?'team':location.hash.slice(1); if(TABS.some(t=>t[0]===hh)) view.tab=hh;}
const isDirty=()=>JSON.stringify(state)!==CANON;
function setBase(obj){ const s=migrate(JSON.parse(JSON.stringify(obj))); BASE_HASH=hash(JSON.stringify(s)); patchFx(s); CANON=JSON.stringify(s); return s; }
/* ---------- live exchange rates (per viewer, cached a few hours) ---------- */
const LS_FX='stratos-fx-v1'; let liveFx=null, fxStatus='';
try{ const c=JSON.parse(lsGet(LS_FX)||'null'); if(c&&c.rates) liveFx=c; }catch(e){}
function patchFx(st){ if(!liveFx||!st||!st.settings) return st; (st.settings.currencies||[]).forEach(c=>{ if(c.auto!==false){ const r=liveFx.rates[String(c.code||'').toLowerCase()]; if(r>0) c.usd=Math.round(1/r*1e8)/1e8; } }); return st; }
function applyLiveFx(){ patchFx(state); try{ const b=JSON.parse(CANON); patchFx(b); CANON=JSON.stringify(b); }catch(e){} if(staleDraft) patchFx(staleDraft.state); }
async function fetchFx(force){
  if(!force&&liveFx&&Date.now()-(liveFx.fetchedAt||0)<6*3600e3){ applyLiveFx(); return; }
  const srcs=[['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',j=>j&&j.usd&&{date:j.date,rates:j.usd}],['https://latest.currency-api.pages.dev/v1/currencies/usd.json',j=>j&&j.usd&&{date:j.date,rates:j.usd}],['https://open.er-api.com/v6/latest/USD',j=>j&&j.rates&&{date:(j.time_last_update_utc||'').slice(5,16),rates:Object.fromEntries(Object.entries(j.rates).map(([k,v])=>[k.toLowerCase(),v]))}]];
  fxStatus='loading'; if(force) render();
  for(const [u,parse] of srcs){
    try{ const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),6000); const r=await fetch(u,{signal:ctl.signal}); clearTimeout(t); if(!r.ok) continue; const p=parse(await r.json()); if(!p||!p.rates) continue;
      liveFx={date:p.date||'',rates:p.rates,fetchedAt:Date.now(),src:u.split('/')[2]}; lsSet(LS_FX,JSON.stringify(liveFx)); fxStatus='ok'; applyLiveFx(); render(); if(force) toast('Exchange rates updated ('+(liveFx.date||'today')+')'); return; }catch(e){}
  }
  fxStatus='failed'; if(liveFx) applyLiveFx(); render(); if(force) toast('Couldn’t reach the exchange-rate service here. Using the saved rates; you can type rates by hand.');
}
function applyDraft(){
  try{
    const d=JSON.parse(lsGet(LS_DRAFT)||'null');
    if(!d||!d.state) return;
    if(d.schema!==4){ const ds=patchFx(migrate(d.state)); if(JSON.stringify(ds)!==CANON) staleDraft={state:ds}; else lsDel(LS_DRAFT); return; }
    const ds=patchFx(migrate(d.state));
    if(JSON.stringify(ds)===CANON){ lsDel(LS_DRAFT); return; }
    if(d.basedOn===BASE_HASH){ state=ds; restored=true; } else staleDraft={state:ds};
  }catch(e){}
}
const saveDraft=()=>{ if(isDirty()) lsSet(LS_DRAFT,JSON.stringify({schema:4,basedOn:BASE_HASH,state})); else lsDel(LS_DRAFT); };
function applyTheme(){ const r=document.documentElement; if(view.theme==='light'||view.theme==='dark') r.setAttribute('data-theme',view.theme); else if(HOST_THEME) r.setAttribute('data-theme',HOST_THEME); else r.removeAttribute('data-theme'); }
applyTheme();

/* ---------- formatting ---------- */
const SYM={USD:'$',EUR:'€',GBP:'£',EGP:'E£'};
const MAINC=()=>(state&&state.settings&&state.settings.mainCurrency)||'USD';
const DR=()=>fxOf(state,MAINC())||1;
const msym=()=>SYM[MAINC()]||MAINC()+' ';
const cvt=n=>n/DR();
const usdOf=(v,cur)=>num(v)*fxOf(state,cur);
const pr=(p,k,i)=>num(p[k][i])*fxOf(state,p.currency);
const $=n=>{const v=Math.round(cvt(n));return (v<0?'-':'')+msym()+Math.abs(v).toLocaleString('en-US');};
const $2=n=>{n=cvt(n);return (n<0?'-':'')+msym()+Math.abs(n).toFixed(2);};
const $k=n=>{n=cvt(n);const a=Math.abs(n),s=(n<0?'-':'')+msym();if(a>=1e6)return s+(a/1e6).toFixed(2).replace(/\.?0+$/,'')+'M';if(a>=1e4)return s+Math.round(a/1e3)+'K';if(a>=1e3)return s+(a/1e3).toFixed(1).replace(/\.0$/,'')+'K';return s+Math.round(a);};
const pct=n=>isFinite(n)?(Math.round(n*10)/10)+'%':'–';
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ymLabel=ym=>ym&&/^\d{4}-\d{2}$/.test(ym)?MON[+ym.slice(5,7)-1]+' '+ym.slice(0,4):'–';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtCount=n=>Math.abs(n-Math.round(n))<1e-6?String(Math.round(n)):n.toFixed(1);
const STATUSES=['Pipeline','Contacted','Demo','Negotiating','Signed','Live','Lost'];
const COLORS=[['deep','Deep Blue'],['deep80','Deep Blue 80%'],['deep60','Deep Blue 60%'],['deep40','Deep Blue 40%'],['sky','Sky Blue'],['sky60','Sky Blue 60%'],['coral','Coral Orange'],['grey','Unbiased Grey']];
const cv=c=>'var(--c-'+(COLORS.some(x=>x[0]===c)?c:'deep')+')';
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ---------- binding ---------- */
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o);}
function setPath(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null||typeof a[ks[i]]!=='object')a[ks[i]]={};a=a[ks[i]];}a[ks[ks.length-1]]=v;}
function attrs(o,path){return (o.label?' aria-label="'+esc(o.label)+'"':'')+(readOnly||(cfgLocked&&path&&!isOpsPath(path))?' disabled':'')+(o.rename?' data-rename="'+o.rename+'"':'');}
function opt(o,v){const val=typeof o==='object'?o.v:o,lab=typeof o==='object'?o.l:o;return '<option value="'+esc(val)+'"'+(String(v)===String(val)?' selected':'')+'>'+esc(lab)+'</option>';}
const MONEY_RX=/^(settings\.(openingCash|minCash)|salary\.base|salary\.steps\.\d+\.(arr|salary)|airlines\.\d+\.implOverride|actuals\.[^.]+\.(invoiced|collected|spent)|distributions\.\d+\.amount)$/;
function inp(path,o){
  o=o||{};
  let v=getPath(state,path); const id='f-'+path.replace(/\./g,'-');
  const money=MONEY_RX.test(path)&&o.type!=='select';
  if(money){ o=Object.assign({},o,{num:1}); if(isSet(v)) v=Math.round(num(v)/DR()*100)/100; }
  const t=o.type||'text', cls='in '+(o.num?'num ':'')+(o.w||'');
  if(t==='select'){
    let body=o.groups?o.groups.map(g=>'<optgroup label="'+esc(g.label)+'">'+g.options.map(x=>opt(x,v)).join('')+'</optgroup>').join(''):o.options.map(x=>opt(x,v)).join('');
    return '<select id="'+id+'" class="'+cls+'" data-bind="'+path+'"'+(o.num?' data-kind="num"':'')+attrs(o,path)+'>'+body+'</select>';
  }
  if(t==='checkbox') return '<input id="'+id+'" type="checkbox" data-bind="'+path+'" data-kind="bool"'+(v?' checked':'')+attrs(o,path)+'>';
  const ph=o.ph!=null?' placeholder="'+esc(o.ph)+'"':'';
  return '<input id="'+id+'" class="'+cls+'" type="'+(t==='month'?'month':t==='date'?'date':(o.num?'number':'text'))+'"'+(o.num?' step="any" inputmode="decimal" data-kind="'+(money?'money':'num')+'"':'')+(o.blank?' data-blank="1"':'')+(o.list?' list="'+o.list+'"':'')+' data-bind="'+path+'" value="'+esc(v==null?'':v)+'"'+ph+attrs(o,path)+'>';
}
const fld=(l,c,h)=>'<div class="field"><label>'+l+'</label>'+c+(h?'<span class="fhint">'+h+'</span>':'')+'</div>';
const kpi=(l,v,s,cls)=>'<div class="kpi '+(cls||'')+'"><div class="eyebrow">'+l+'</div><div class="v">'+v+'</div><div class="s">'+(s||'')+'</div></div>';
const li=(a,b)=>'<li><span class="muted">'+a+'</span><b>'+b+'</b></li>';
const del=(act,i,extra,label)=>readOnly||(cfgLocked&&!OPS_ACTS.has(act))?'':'<button class="btn icon" data-act="'+act+'" data-i="'+i+'"'+(extra||'')+' aria-label="'+esc(label||'Remove')+'">✕</button>';
const goto=(sec,label)=>'<button class="btn small" data-act="goto-settings" data-v="'+sec+'">'+(label||'Edit in Settings')+'</button>';
function hbar(l,v,tot,color,sub){return '<div class="hbar"><span class="lbl" title="'+esc(l)+'">'+(color?'<i class="dot" style="background:'+color+'"></i>':'')+esc(l)+'</span><span class="track"><span class="fill" style="width:'+(tot?Math.max(1,v/tot*100):0)+'%;background:'+(color||'var(--sky)')+'"></span></span><span class="hv">'+$k(v)+' <span class="muted">'+(sub!=null?sub:pct(tot?v/tot*100:0))+'</span></span></div>';}
function countryGroups(){
  const g=state.regions.map(r=>({label:r.name,options:r.countries.map(c=>c.name)}));
  const known=new Set(state.regions.flatMap(r=>r.countries.map(c=>c.name)));
  const extra=Array.from(new Set(state.airlines.map(a=>a.country).filter(c=>c&&!known.has(c))));
  if(extra.length) g.push({label:'Unassigned',options:extra});
  return g;
}
function regionColor(name){const r=state.regions.find(x=>x.name===name);return r?cv(r.color):'var(--c-grey)';}
function productColor(id){const p=state.products.find(x=>x.id===id);return p?cv(p.color):'var(--c-grey)';}
function bandRange(i){const b=state.bands,lo=i===0?1:num(b[i-1].maxPilots)+1;return i===b.length-1||!isSet(b[i].maxPilots)?lo+'+ pilots':lo+'–'+num(b[i].maxPilots)+' pilots';}

/* ---------- charts ---------- */
const niceStepM=v=>niceStep(cvt(v))*DR();
function niceStep(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
function revenueChart(months){
  const W=1000,H=280,pl=54,pr=12,pt=16,pb=34,iw=W-pl-pr,ih=H-pt-pb;
  const maxV=Math.max(1,...months.map(m=>Math.max(m.revenue,m.costs)));
  const step=niceStepM(maxV/4), top=Math.ceil(maxV/step)*step, bw=iw/months.length, y=v=>pt+ih-v/top*ih;
  let g='';
  for(let v=0;v<=top+1e-6;v+=step) g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  months.forEach((m,i)=>{
    const x=pl+i*bw+bw*0.15,w=bw*0.7; let base=pt+ih;
    state.products.forEach(p=>{const v=m.byProduct[p.id]||0;if(v<=0)return;const h=v/top*ih;base-=h;g+='<rect x="'+x.toFixed(1)+'" y="'+base.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" style="fill:'+cv(p.color)+'"><title>'+ymLabel(m.ym)+' · '+esc(p.short)+' licenses '+$(v)+'</title></rect>';});
    if(m.impl>0){const h=m.impl/top*ih;base-=h;g+='<rect class="imp" x="'+x.toFixed(1)+'" y="'+base.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'"><title>'+ymLabel(m.ym)+' · implementation '+$(m.impl)+'</title></rect>';}
    if(m.ym.slice(5)==='01'||i===0) g+='<line class="ax" x1="'+(pl+i*bw)+'" x2="'+(pl+i*bw)+'" y1="'+pt+'" y2="'+(pt+ih)+'"/><text class="yr" x="'+(pl+i*bw+4)+'" y="'+(H-12)+'">'+(i===0?ymLabel(m.ym):m.ym.slice(0,4))+'</text>';
  });
  g+='<polyline class="cost" points="'+months.map((m,i)=>(pl+i*bw+bw/2).toFixed(1)+','+y(m.costs).toFixed(1)).join(' ')+'"/>';
  g+='<line class="ax" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(pt+ih)+'" y2="'+(pt+ih)+'"/>';
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Monthly revenue and costs">'+g+'</svg>';
}
function cashChart(months){
  const W=600,H=240,pl=50,pr=10,pt=14,pb=30,iw=W-pl-pr,ih=H-pt-pb;
  const cv_=m=>m.cashB!=null?m.cashB:m.cash, vals=months.map(cv_), mx=Math.max(1,...vals), mn=Math.min(0,...vals);
  const step=niceStepM((mx-mn)/4), top=Math.ceil(mx/step)*step, bot=Math.floor(mn/step)*step;
  const x=i=>pl+i/(months.length-1||1)*iw, y=v=>pt+ih-(v-bot)/(top-bot||1)*ih;
  let g='';
  for(let v=bot;v<=top+1e-6;v+=step) g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+$k(v)+'</text>';
  months.forEach((m,i)=>{ if((m.ym.slice(5)==='01'&&i>=4)||i===0) g+='<text class="yr" x="'+(x(i)+4)+'" y="'+(H-10)+'">'+(i===0?ymLabel(m.ym):m.ym.slice(0,4))+'</text>'; });
  const line=months.map((m,i)=>x(i).toFixed(1)+','+y(cv_(m)).toFixed(1)).join(' ');
  g='<polygon class="cash-area" points="'+x(0)+','+y(Math.max(0,bot))+' '+line+' '+x(months.length-1)+','+y(Math.max(0,bot))+'"/>'+g+'<polyline class="cash" points="'+line+'"/>';
  g+='<circle class="cash-dot" cx="'+x(months.length-1)+'" cy="'+y(cv_(months[months.length-1]))+'" r="4"/>';
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cash balance">'+g+'</svg>';
}

/* ---------- OVERVIEW ---------- */
function overview(M){
  const years=aggregate(M.months,byYear), Y=years.find(g=>g.key===view.year)||years[0];
  const ym=M.months.filter(m=>m.ym.startsWith(Y.key)), exit=ym[ym.length-1];
  const fullARR=M.airlines.reduce((a,x)=>a+x.e.arr*x.w,0), count=M.airlines.reduce((a,x)=>a+x.w,0);
  const avgARR=count?fullARR/count:0, annualCosts=Y.costs/Y.months*12;
  const byRegion={},byProduct={},byStatus={};
  M.airlines.forEach(x=>{byRegion[x.region]=(byRegion[x.region]||0)+x.e.arr*x.w;byProduct[x.e.product.id]=(byProduct[x.e.product.id]||0)+x.e.arr*x.w;});
  state.airlines.forEach(a=>{if(a.include!==false)byStatus[a.status]=(byStatus[a.status]||0)+1;});
  const top=M.airlines.slice().sort((a,b)=>b.e.arr*b.w-a.e.arr*a.w).slice(0,6);
  const firstLive=M.months.find(m=>m.recurring>0), be=M.months.find(m=>m.recurring>0&&m.recurring>=m.costs);
  const reserve=exit.cash/(exit.costs||1);
  let h='';
  if(view.scenario==='weighted') h+='<div class="banner"><span class="grow"><b>Weighted view.</b> Each airline’s revenue is multiplied by its close probability on the Pipeline tab. The probabilities are planning assumptions, not sales data.</span></div>';
  h+='<div class="sec-head"><div><div class="eyebrow">Overview</div><h2>'+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+state.airlines.filter(a=>a.include!==false&&a.status!=='Lost').length+' airlines in '+Object.keys(byRegion).length+' regions</h2></div><div class="toolbar"><span class="muted small">Year</span><div class="seg light" role="group" aria-label="Year">'+years.map(g=>'<button data-act="year" data-v="'+g.key+'" aria-pressed="'+(g.key===Y.key)+'">'+g.key+'</button>').join('')+'</div>'+(downloads?'<button class="btn cta-outline" data-act="pdf">Investor summary PDF</button>':'')+'</div></div>';
  h+=alertsPanel(M);
  h+='<div class="kpis">'+runwayKpis(M)+'</div>';
  h+='<div class="kpis">'+
    kpi('Revenue '+Y.key,$(Y.revenue),Y.months<12?Y.months+' months · impl. '+$k(Y.impl):'Licenses '+$k(Y.recurring)+' · impl. '+$k(Y.impl),'lead')+
    kpi('Net profit '+Y.key,'<span class="'+(Y.net<0?'neg':'')+'">'+$(Y.net)+'</span>','Margin '+pct(Y.revenue?Y.net/Y.revenue*100:NaN),'sky')+
    kpi('ARR at end of '+Y.key,$(exit.liveARR),fmtCount(exit.live)+' airlines live')+
    kpi('Total costs '+Y.key,$(Y.costs),'Tools '+$k(Y.tools)+' · salaries '+$k(Y.salaries))+
    kpi('Cash at end of '+Y.key,'<span class="'+(exit.cash<0?'neg':'')+'">'+$(exit.cash)+'</span>',isFinite(reserve)?(Math.round(reserve*10)/10)+' months of costs held':'')+
    kpi('Founder salary each',$(exit.salaryEach)+'<span class="unit"> /mo</span>','At end of '+Y.key)+
  '</div>';
  h+='<div class="panel mb"><div class="panel-head"><h3>Monthly revenue and costs</h3><span class="muted small">Licenses spread monthly from go-live · implementation in the signing month</span></div>'+revenueChart(M.months)+
    '<div class="legend">'+state.products.map(p=>'<span><i class="sw" style="background:'+cv(p.color)+'"></i>'+esc(p.short)+' licenses</span>').join('')+'<span><i class="sw imp-sw"></i>Implementation fees</span><span><i class="sw line" style="background:var(--coral)"></i>Total costs</span></div></div>';
  h+='<div class="grid3 mb">';
  h+='<div class="panel"><div class="panel-head"><h3>ARR by region</h3>'+goto('regions','Edit regions')+'</div>'+Object.entries(byRegion).sort((a,b)=>b[1]-a[1]).map(([r,v])=>hbar(r,v,fullARR,regionColor(r))).join('')+'<div class="hint">Full book '+$(fullARR)+' across '+fmtCount(count)+' airlines.</div></div>';
  h+='<div class="panel"><h3>ARR by product</h3>'+state.products.filter(p=>byProduct[p.id]).map(p=>hbar(p.short,byProduct[p.id],fullARR,cv(p.color))).join('')+(Object.keys(byProduct).length?'':'<p class="muted">No airlines in plan.</p>')+'<h3 class="mt">Pipeline by status</h3><div class="chips">'+STATUSES.filter(s=>byStatus[s]).map(s=>'<span class="chip st-'+s+'">'+s+' · '+byStatus[s]+'</span>').join('')+'</div></div>';
  h+='<div class="panel"><h3>Largest accounts</h3>'+top.map(x=>hbar(x.a.name,x.e.arr*x.w,fullARR,regionColor(x.region))).join('')+'<div class="hint">'+(top[0]?esc(top[0].a.name)+' is '+pct(top[0].e.arr*top[0].w/fullARR*100)+' of ARR.':'')+'</div></div>';
  h+='</div><div class="grid2">';
  h+='<div class="panel"><h3>Cash balance</h3>'+cashChart(M.months)+'<div class="hint">Re-forecast: actual months from the Actuals tab, then the plan. Annual licenses are collected at go-live and each anniversary, after country withholding, delays and collection rates. Includes funding. Opening cash '+$(state.settings.openingCash)+'.</div></div>';
  h+='<div class="panel"><h3>Milestones</h3><ul class="list-plain">'+
    li('First recurring revenue',firstLive?ymLabel(firstLive.ym):'Not in horizon')+
    li('Licenses cover monthly costs',be?ymLabel(be.ym):'Not in horizon')+
    M.stepLog.map(s=>li('Salary to '+$(s.salary)+'/mo each',ymLabel(s.ym))).join('')+
    li('Airlines needed to cover '+Y.key+' costs',avgARR?(annualCosts/avgARR).toFixed(1)+' at '+$k(avgARR)+' avg ARR':'–')+
    li('Monthly costs at end of '+Y.key,$(exit.costs))+'</ul></div>';
  return h+'</div>';
}

/* ---------- PIPELINE ---------- */
function groupKeyFns(){
  return {
    region:a=>{const r=regionOf(state,a.country);return r?r.name:'Unassigned';},
    country:a=>a.country||'No country',
    cohort:a=>{const c=state.cohorts.find(c=>c.id===a.cohort);return c?c.name:'No cohort';},
    status:a=>a.status,
    product:a=>productOf(state,a).name
  };
}
function pipeline(){
  const r=state.ratios, fns=groupKeyFns();
  const all=state.airlines.map((a,i)=>({a,i,e:airlineEcon(state,a,0),reg:fns.region(a)}));
  const rows=all.filter(x=>view.filterRegion==='All'||x.reg===view.filterRegion);
  const on=rows.filter(x=>x.a.include!==false&&x.a.status!=='Lost');
  const sum=list=>{const t={n:0,fleet:0,pilots:0,arr:0,impl:0,w:0};list.filter(x=>x.a.include!==false&&x.a.status!=='Lost').forEach(x=>{t.n++;t.fleet+=num(x.a.fleet);t.pilots+=x.e.pilots;t.arr+=x.e.arr;t.impl+=x.e.impl;t.w+=x.e.arr*num(x.a.prob)/100;});return t;};
  const T=sum(rows);
  const regionNames=['All',...state.regions.map(x=>x.name)]; if(all.some(x=>x.reg==='Unassigned')) regionNames.push('Unassigned');
  let h='<div class="sec-head"><div><div class="eyebrow">Pipeline</div><h2>Airlines by '+({region:'region and country',country:'country',cohort:'cohort',status:'status',product:'product'}[view.groupBy])+'</h2><p>Blank pilot, cabin crew and instructor cells use the fleet ratios ('+r.pilotsPerAircraft+' pilots, '+r.cabinPerAircraft+' cabin crew and '+r.instructorsPerAircraft+' instructors per aircraft). Blank dates follow the airline’s cohort. Lost or unticked airlines drop out of every forecast.</p></div>'+
    '<div class="toolbar"><label class="muted small" for="groupBy">Group by</label><select id="groupBy" class="in w-m" data-act="groupBy">'+[['region','Region'],['country','Country'],['cohort','Cohort'],['status','Status'],['product','Product']].map(([v,l])=>'<option value="'+v+'"'+(v===view.groupBy?' selected':'')+'>'+l+'</option>').join('')+'</select>'+
    '<select class="in w-m" data-act="filterRegion" aria-label="Filter by region">'+regionNames.map(c=>'<option'+(c===view.filterRegion?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select>'+
    '<button class="btn" data-act="collapse-all">Collapse all</button><button class="btn" data-act="expand-all">Expand all</button>'+(readOnly?'':'<button class="btn cta-outline" data-act="add-airline">Add airline</button>')+'</div></div>';
  h+='<div class="region-strip">'+state.regions.map(rg=>{const t=sum(all.filter(x=>x.reg===rg.name));return '<button class="rcard'+(view.filterRegion===rg.name?' on':'')+'" data-act="pick-region" data-v="'+esc(rg.name)+'" style="--rc:'+cv(rg.color)+'"><span class="rname">'+esc(rg.name)+'</span><span class="rval">'+$k(t.arr)+'</span><span class="rsub">'+t.n+' airlines · '+rg.countries.length+' countries</span></button>';}).join('')+'</div>';
  h+=followUps();
  h+='<div class="kpis">'+kpi('Airlines in view',String(T.n),'of '+state.airlines.length+' listed','lead')+kpi('Fleet / pilots',T.fleet+' / '+T.pilots.toLocaleString(),'aircraft / pilots')+kpi('Full ARR',$(T.arr),'Weighted '+$(T.w),'sky')+kpi('Implementation',$(T.impl),'One-time, at signing')+'</div>';
  const cohortOpts=[{v:'',l:'Custom dates'},...state.cohorts.map(c=>({v:c.id,l:c.id}))];
  const prodOpts=state.products.map(p=>({v:p.id,l:p.short}));
  const COLS=24;
  const head='<thead><tr><th>Airline</th><th>In</th><th>Country</th><th>Product</th><th>Cohort</th><th class="n">Fleet</th><th class="n" title="Aircraft added each contract year">+Fleet/yr</th><th class="n">Pilots</th><th class="n">Cabin</th><th class="n">Instr.</th><th>Status</th><th class="n">Prob %</th><th>Signs</th><th>Go-live</th><th>Billing</th><th class="n">Disc. %</th><th class="n">Impl. fee</th><th>Tier</th><th class="n">ARR yr 1</th><th class="n">Impl.</th><th class="n">$/pilot/mo</th><th>Notes</th><th></th><th></th></tr></thead>';
  const rowHTML=({a,i,e})=>{
    const p='airlines.'+i, off=a.include===false||a.status==='Lost', tm=timingOf(state,a);
    const fl=num(a.fleet);
    const dateCell=(field,inh)=>'<td>'+inp(p+'.'+field,{type:'month',w:'w-m',label:field})+(a[field]?'':'<span class="inh">'+(inh?'Cohort · '+ymLabel(inh):'Set a date')+'</span>')+'</td>';
    return '<tr class="'+(off?'off':'')+'"><td><span class="rowname" style="--rc:'+regionColor(fns.region(a))+'">'+inp(p+'.name',{w:'w-l',label:'Airline name'})+'</span></td><td>'+inp(p+'.include',{type:'checkbox',label:'Include '+a.name})+'</td>'+
      '<td>'+inp(p+'.country',{type:'select',groups:countryGroups(),w:'w-m',label:'Country'})+'</td><td>'+inp(p+'.product',{type:'select',options:prodOpts,w:'w-s',label:'Product'})+'</td><td>'+inp(p+'.cohort',{type:'select',options:cohortOpts,w:'w-s',label:'Cohort'})+'</td>'+
      '<td>'+inp(p+'.fleet',{num:1,w:'w-xs',label:'Fleet'})+'</td><td>'+inp(p+'.growth',{num:1,w:'w-xs',label:'Aircraft added per year'})+'</td><td>'+inp(p+'.pilots',{num:1,blank:1,w:'w-xs',ph:String(Math.round(fl*r.pilotsPerAircraft)),label:'Pilots'})+'</td><td>'+inp(p+'.cabin',{num:1,blank:1,w:'w-xs',ph:String(Math.round(fl*r.cabinPerAircraft)),label:'Cabin crew'})+'</td><td>'+inp(p+'.instructors',{num:1,blank:1,w:'w-xs',ph:fmtCount(fl*r.instructorsPerAircraft),label:'Instructors'})+'</td>'+
      '<td>'+inp(p+'.status',{type:'select',options:STATUSES,w:'w-m',label:'Status'})+'</td><td>'+inp(p+'.prob',{num:1,w:'w-xs',label:'Probability'})+'</td>'+dateCell('signMonth',tm.cohort&&tm.cohort.signMonth)+dateCell('goLiveMonth',tm.cohort&&tm.cohort.goLiveMonth)+
      '<td>'+inp(p+'.billing',{type:'select',options:[{v:'annual',l:'Annual'},{v:'monthly',l:'Monthly +'+state.settings.monthlyPremium+'%'}],w:'w-m',label:'Billing'})+'</td><td>'+inp(p+'.discount',{num:1,w:'w-xs',label:'Discount'})+'</td><td>'+inp(p+'.implOverride',{num:1,blank:1,w:'w-s',ph:String(Math.round(cvt(num(e.product.impl[e.tier0])*fxOf(state,e.product.currency)*(1+num((countryOf(state,a.country)||{}).priceAdj)/100)))),label:'Implementation fee override'})+'</td>'+
      '<td><span class="chip" style="--cc:'+cv(e.product.color)+'">'+esc(state.bands[e.tier0]?state.bands[e.tier0].label:'')+'</span></td><td class="n"><b>'+$(e.arr)+'</b></td><td class="n">'+$(e.impl)+'</td><td class="n muted">'+$2(e.perPilotMonth)+'</td>'+
      '<td>'+inp(p+'.notes',{w:'w-xl',label:'Notes'})+'</td><td><button class="btn small open-btn" data-act="open-airline" data-v="'+esc(a.id)+'" aria-label="Open '+esc(a.name)+'">Open</button>'+(readOnly?'':'<button class="btn icon plain" data-act="dup-airline" data-i="'+i+'" aria-label="Duplicate '+esc(a.name)+'" title="Duplicate">⧉</button>')+'</td><td>'+del('del-airline',i,'','Remove '+a.name)+'</td></tr>';
  };
  const groupRow=(key,label,t,color,level,country)=>{const c=!!view.collapsed[key];return '<tr class="grp l'+level+'" style="--rc:'+color+'"><td colspan="5"><button class="gtoggle" data-act="toggle-group" data-k="'+esc(key)+'" aria-expanded="'+!c+'"><span class="caret">'+(c?'▸':'▾')+'</span>'+esc(label)+'<span class="gcount">'+t.n+' airline'+(t.n===1?'':'s')+'</span></button>'+(country?'<button class="linkish small" data-act="open-country" data-v="'+esc(country)+'">View country →</button>':'')+'</td><td class="n">'+t.fleet+'</td><td></td><td class="n">'+t.pilots.toLocaleString()+'</td><td colspan="10"></td><td class="n">'+$(t.arr)+'</td><td class="n">'+$(t.impl)+'</td><td colspan="4" class="muted small">Weighted '+$(t.w)+'</td></tr>';};
  let body='';
  if(view.groupBy==='region'){
    const regs=[...state.regions.map(x=>({name:x.name,color:cv(x.color),countries:x.countries.map(c=>c.name)}))];
    if(rows.some(x=>x.reg==='Unassigned')) regs.push({name:'Unassigned',color:'var(--c-grey)',countries:Array.from(new Set(rows.filter(x=>x.reg==='Unassigned').map(x=>x.a.country)))});
    regs.forEach(rg=>{
      const inR=rows.filter(x=>x.reg===rg.name); if(!inR.length) return;
      const rk='r:'+rg.name; body+=groupRow(rk,rg.name,sum(inR),rg.color,1);
      if(view.collapsed[rk]) return;
      rg.countries.forEach(cn=>{const inC=inR.filter(x=>x.a.country===cn); if(!inC.length) return; const ck='c:'+rg.name+':'+cn; body+=groupRow(ck,cn,sum(inC),rg.color,2,cn); if(!view.collapsed[ck]) body+=inC.map(rowHTML).join('');});
    });
  } else {
    const fn=fns[view.groupBy], keys=[];
    rows.forEach(x=>{const k=fn(x.a); if(!keys.includes(k)) keys.push(k);});
    keys.forEach(k=>{const inG=rows.filter(x=>fn(x.a)===k), gk=view.groupBy+':'+k; const color=view.groupBy==='product'?productColor(inG[0].a.product):view.groupBy==='country'?regionColor(inG[0].reg):'var(--c-deep)'; body+=groupRow(gk,k,sum(inG),color,1,view.groupBy==='country'?k:null); if(!view.collapsed[gk]) body+=inG.map(rowHTML).join('');});
  }
  body+='<tr class="total"><td colspan="5">Total in view</td><td class="n">'+T.fleet+'</td><td></td><td class="n">'+T.pilots.toLocaleString()+'</td><td colspan="10"></td><td class="n">'+$(T.arr)+'</td><td class="n">'+$(T.impl)+'</td><td colspan="4" class="muted small">Weighted '+$(T.w)+'</td></tr>';
  h+='<div class="tbl-wrap"><table class="fin pipe">'+head+'<tbody>'+body+'</tbody></table></div><p class="hint">ARR yr 1 is the first contract year. Fleet growth adds aircraft at each renewal; new pilots above the signing headcount pay the rate of the tier the airline grows into. Implementation fee overrides replace the tier fee for that airline.</p>';
  return h;
}

/* ---------- PRICING ---------- */
function pricing(){
  const P=state.products, B=state.bands, S=state.settings, sp=state.seatPrices;
  let h='<div class="sec-head"><div><div class="eyebrow">Pricing</div><h2>Products, tiers and quotes</h2><p>Cliff pricing by pilot headcount. An airline can buy one module on its own or the bundle. Seat add-ons follow each product’s settings.</p></div><div class="toolbar">'+goto('products','Edit products and tiers')+'</div></div>';
  h+='<div class="grid3 mb">'+P.map(p=>'<div class="panel pcard" style="--pc:'+cv(p.color)+'"><div class="eyebrow">'+esc(p.short)+'</div><h3 class="pname">'+esc(p.name)+'</h3><table class="mini"><thead><tr><th>Tier</th><th class="n">Per pilot/mo</th><th class="n">Monthly</th><th class="n">Impl.</th></tr></thead><tbody>'+B.map((b,i)=>'<tr><td>'+esc(b.label)+'<span class="muted small block">'+bandRange(i)+'</span></td><td class="n"><b>'+$2(pr(p,'rates',i))+'</b></td><td class="n muted">'+$2(pr(p,'rates',i)*(1+num(S.monthlyPremium)/100))+'</td><td class="n">'+$k(pr(p,'impl',i))+'</td></tr>').join('')+'</tbody></table><div class="chips mt">'+[['cabin','Cabin crew '+$2(usdOf(sp.cabinRate,sp.currency))],['admin','Admin '+$2(usdOf(sp.adminRate,sp.currency))],['instructor','Instructor '+$2(usdOf(sp.instructorRate,sp.currency))]].map(([k,l])=>'<span class="chip '+(p.seats[k]?'on':'offc')+'">'+(p.seats[k]?'✓ ':'— ')+l+'</span>').join('')+'</div></div>').join('')+'</div>';
  const bun=P.find(p=>p.id==='bundle'), ebt=P.find(p=>p.id==='ebt'), tms=P.find(p=>p.id==='tms');
  if(bun&&ebt&&tms){
    h+='<div class="panel mb"><h3>Bundle vs buying both modules</h3><div class="tbl-wrap"><table><thead><tr><th>Tier</th><th class="n">EBT/CBTA</th><th class="n">TMS</th><th class="n">Both separately</th><th class="n">Bundle</th><th class="n">Saving / pilot</th><th class="n">Impl. separately</th><th class="n">Impl. bundle</th><th class="n">Impl. saving</th></tr></thead><tbody>'+
      B.map((b,i)=>{const sep=pr(ebt,'rates',i)+pr(tms,'rates',i),bu=pr(bun,'rates',i),is=pr(ebt,'impl',i)+pr(tms,'impl',i),ib=pr(bun,'impl',i);return '<tr><td>'+esc(b.label)+' <span class="muted small">'+bandRange(i)+'</span></td><td class="n">'+$2(pr(ebt,'rates',i))+'</td><td class="n">'+$2(pr(tms,'rates',i))+'</td><td class="n">'+$2(sep)+'</td><td class="n"><b>'+$2(bu)+'</b></td><td class="n '+(sep-bu<0?'neg':'pos')+'">'+$2(sep-bu)+' ('+pct(sep?(sep-bu)/sep*100:NaN)+')</td><td class="n">'+$(is)+'</td><td class="n"><b>'+$(ib)+'</b></td><td class="n '+(is-ib<0?'neg':'pos')+'">'+$(is-ib)+' ('+pct(is?(is-ib)/is*100:NaN)+')</td></tr>';}).join('')+'</tbody></table></div><p class="hint">Seat add-ons (cabin crew, admin, instructor) are charged once, on whichever product includes them.</p></div>';
  }
  const Q=view.quote, qa={fleet:num(Q.fleet),pilots:'',cabin:'',instructors:'',admins:'',product:Q.product,billing:Q.billing,discount:Q.discount};
  const qe=airlineEcon(state,qa,0);
