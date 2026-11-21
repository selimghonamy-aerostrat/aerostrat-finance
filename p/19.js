/* ===== v19: choose several regions and countries at once (Pipeline and Forecast) · target-size import (1–70 aircraft) · fixes ===== */
(function(){
  if(document.getElementById('v19-css')) return;
  const st=document.createElement('style'); st.id='v19-css';
  st.textContent=[
  '.f19{display:grid;gap:8px;margin:0 0 14px}',
  '.f19-row{display:grid;grid-template-columns:86px minmax(0,1fr);gap:10px;align-items:start}',
  '.f19-lab{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-top:6px}',
  '.chips19{display:flex;flex-wrap:wrap;gap:6px}',
  '.chip19{--rc:var(--c-deep40);border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:4px 10px;font:500 12.5px var(--f-ui);cursor:pointer;display:inline-flex;gap:6px;align-items:center}',
  '.chip19 .dot{margin:0;background:var(--rc)}',
  '.chip19 .n19{color:var(--muted);font-size:11.5px}',
  '.chip19:hover{border-color:var(--rc)}',
  '.chip19[aria-pressed="true"]{background:color-mix(in srgb,var(--rc) 16%,var(--panel));border-color:var(--rc);font-weight:600}',
  '.f19-sum{font-size:12px;color:var(--muted)}',
  '.f19-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
  '@media (max-width:640px){.f19-row{grid-template-columns:1fr}.f19-lab{padding-top:0}}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* ---------- shared helpers ---------- */
const regName19=a=>{ const r=regionOf(state,a.country); return r?r.name:'Unassigned'; };
const regId19=a=>{ const r=regionOf(state,a.country); return r?r.id:'__none'; };
/* rule: if any countries are picked, show those countries; otherwise show the picked regions; nothing picked = everything */
function match19(a,regIds,ctys){
  if(ctys.length) return ctys.includes(a.country||'');
  if(regIds.length) return regIds.includes(regId19(a));
  return true;
}
function regionsWithUnassigned19(list){
  const R=state.regions.map(r=>({id:r.id,name:r.name,color:cv(r.color),countries:r.countries.map(c=>c.name)}));
  const known=new Set(R.flatMap(r=>r.countries)), extra=Array.from(new Set(list.filter(a=>a&&a.country&&!known.has(a.country)).map(a=>a.country))).sort();
  if(list.some(a=>a&&(!a.country||!known.has(a.country)))) R.push({id:'__none',name:'Unassigned',color:'var(--c-grey)',countries:extra});
  return R;
}
/* chip bar used by both tabs */
function chipBar19(prefix,regIds,ctys,list,label){
  const live=list.filter(a=>a&&a.status!=='Lost');
  const R=regionsWithUnassigned19(list);
  const nReg=id=>live.filter(a=>regId19(a)===id).length, nCty=c=>live.filter(a=>(a.country||'')===c).length;
  const regChips=R.map(r=>'<button class="chip19" style="--rc:'+r.color+'" data-act="'+prefix+'-region" data-v="'+esc(r.id)+'" aria-pressed="'+regIds.includes(r.id)+'"><i class="dot"></i>'+esc(r.name)+' <span class="n19">'+nReg(r.id)+'</span></button>').join('');
  const pool=regIds.length?R.filter(r=>regIds.includes(r.id)):R;
  const cl=[]; pool.forEach(r=>r.countries.forEach(c=>{ if((nCty(c)||ctys.includes(c))&&!cl.some(x=>x.c===c)) cl.push({c,color:r.color}); }));
  ctys.forEach(c=>{ if(!cl.some(x=>x.c===c)) cl.push({c,color:'var(--c-grey)'}); });
  const ctyChips=cl.length?cl.map(x=>'<button class="chip19" style="--rc:'+x.color+'" data-act="'+prefix+'-country" data-v="'+esc(x.c)+'" aria-pressed="'+ctys.includes(x.c)+'"><i class="dot"></i>'+esc(x.c)+' <span class="n19">'+nCty(x.c)+'</span></button>').join(''):'<span class="f19-sum">No airlines listed in '+(regIds.length?'these regions':'any country')+' yet.</span>';
  const shown=live.filter(a=>match19(a,regIds,ctys)).length;
  const sum=(regIds.length||ctys.length)?shown+' airline'+(shown===1?'':'s')+' in '+(ctys.length?ctys.length+' countr'+(ctys.length===1?'y':'ies'):regIds.length+' region'+(regIds.length===1?'':'s')):'All regions and countries · '+live.length+' airlines';
  return '<div class="f19">'+
    '<div class="f19-row"><span class="f19-lab">Regions</span><div class="chips19">'+regChips+'</div></div>'+
    '<div class="f19-row"><span class="f19-lab">Countries</span><div class="chips19">'+ctyChips+'</div></div>'+
    '<div class="f19-row"><span class="f19-lab"></span><div class="f19-tools"><span class="f19-sum">'+esc(label||'Showing')+': '+sum+'. Click to add or remove; pick countries to narrow inside the regions.</span>'+((regIds.length||ctys.length)?'<button class="btn small" data-act="'+prefix+'-clear">Show everything</button>':'')+'</div></div>'+
  '</div>';
}
function toggle19(arr,v){ const i=arr.indexOf(v); if(i>=0) arr.splice(i,1); else arr.push(v); return arr; }
function dropCountriesOf19(ctys,regId){
  const r=state.regions.find(x=>x.id===regId); const set=new Set(r?r.countries.map(c=>c.name):[]);
  return ctys.filter(c=>regId==='__none'?regionOf(state,c)!=null:!set.has(c));
}

/* =====================================================================
   PIPELINE: several regions / countries at once
   ===================================================================== */
let pipeAll19=null;
function pr19(){ const p=view.pr19||{}; return {regions:Array.isArray(p.regions)?p.regions.slice():[],countries:Array.isArray(p.countries)?p.countries.slice():[]}; }
regionCards15=function(){
  const all=(pipeAll19||state.airlines).filter(Boolean), P=pr19();
  const rows=all.map(a=>({a,e:airlineEcon(state,a,0),rid:regId19(a)}));
  const tot=list=>{ const t={n:0,pilots:0,arr:0}; list.forEach(x=>{ if(x.a.status==='Lost') return; t.n++; t.pilots+=x.e.pilots; t.arr+=x.e.arr; }); return t; };
  const R=regionsWithUnassigned19(all);
  const cards=R.map(rg=>{
    const inR=rows.filter(x=>x.rid===rg.id); if(rg.id==='__none'&&!inR.length) return '';
    const T=tot(inR);
    const cl=rg.countries.map(c=>({name:c,t:tot(inR.filter(x=>(x.a.country||'')===c))}));
    if(rg.id==='__none'&&inR.some(x=>!x.a.country)) cl.push({name:'',t:tot(inR.filter(x=>!x.a.country))});
    cl.sort((p,q)=>(q.t.arr-p.t.arr)||(q.t.n-p.t.n)||p.name.localeCompare(q.name));
    const on=P.regions.includes(rg.id)||P.countries.some(c=>rg.countries.includes(c));
    return '<div class="rcard rc14'+(on?' on':'')+'" style="--rc:'+rg.color+'">'+
      '<button class="rc14-head" data-act="pr19-region" data-v="'+esc(rg.id)+'" aria-pressed="'+P.regions.includes(rg.id)+'" title="Add or remove '+esc(rg.name)+' in the table below"><span class="rname">'+esc(rg.name)+'</span><span class="rval">'+$k(T.arr)+'</span><span class="rsub">'+T.n+' airlines · '+rg.countries.length+' countries</span></button>'+
      '<div class="rc14-cols"><span>Country</span><span>Airlines</span><span>Pilots</span><span>ARR</span></div>'+
      '<ul class="rc14-list">'+cl.map(c=>'<li><button class="rc14-row'+(c.t.n?'':' zero')+'" '+(c.name?'data-act="open-country" data-v="'+esc(c.name)+'" title="Open '+esc(c.name)+'"':'disabled')+'><span>'+esc(c.name||'No country set')+'</span><span>'+(c.t.n||'–')+'</span><span>'+(c.t.pilots?c.t.pilots.toLocaleString():'–')+'</span><span>'+(c.t.arr?$k(c.t.arr):'–')+'</span></button></li>').join('')+'</ul>'+
      '<div class="rc14-foot"><span>Region total</span><span>'+T.n+'</span><span>'+(T.pilots?T.pilots.toLocaleString():'–')+'</span><span>'+$k(T.arr)+'</span></div>'+
    '</div>';
  }).join('');
  return '<div class="region-strip rs14">'+cards+'</div>'+chipBar19('pr19',P.regions,P.countries,all,'Table shows');
};
const pipelineBase19=pipeline;
pipeline=function(){
  view.filterRegion='All';
  const P=pr19(), real=state.airlines; let h;
  pipeAll19=real;
  try{
    if(P.regions.length||P.countries.length){
      const sp=new Array(real.length); real.forEach((a,i)=>{ if(match19(a,P.regions,P.countries)) sp[i]=a; });
      state.airlines=sp;
      try{ h=pipelineBase19(); } finally { state.airlines=real; }
    } else h=pipelineBase19();
  } finally { pipeAll19=null; }
  return h.replace(/<select class="in w-m" data-act="filterRegion"[\s\S]*?<\/select>/,'').replace(' researched airlines in ',' researched airlines with 1–70 aircraft in ');
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act; if(!a||a.indexOf('pr19-')!==0) return;
  const P=pr19();
  if(a==='pr19-region'){ const was=P.regions.includes(b.dataset.v); toggle19(P.regions,b.dataset.v); if(was) P.countries=dropCountriesOf19(P.countries,b.dataset.v); }
  else if(a==='pr19-country') toggle19(P.countries,b.dataset.v);
  else if(a==='pr19-clear'){ P.regions=[]; P.countries=[]; }
  view.pr19=P; view.collapsed={}; persistView(); render();
});

/* =====================================================================
   FORECAST: several regions / countries at once
   ===================================================================== */
fcF=function(){
  const v=view.fcF||{};
  let regions=Array.isArray(v.regions)?v.regions.slice():(v.region&&!String(v.region).includes(',')?[v.region]:[]);
  let countries=Array.isArray(v.countries)?v.countries.slice():(v.country&&!String(v.country).includes(',')?[v.country]:[]);
  return {regions,countries,product:v.product||'',prospects:false,off:[],region:regions.join(','),country:countries.join(',')};
};
const fcScope19=(F,a)=>match19(a,F.regions,F.countries)&&(!F.product||(a.product||(state.products[0]&&state.products[0].id))===F.product);
fcFiltered=function(F){
  const sc=curScen(), base=applyScenario(state,sc), s=JSON.parse(JSON.stringify(base));
  const partial=!!(F.regions.length||F.countries.length||F.product);
  s.airlines=s.airlines.filter(a=>a.status!=='Lost'&&a.include!==false&&fcScope19(F,a));
  fcUndated=0;
  const ids=new Set(s.airlines.map(a=>a.id));
  s.invoices=(s.invoices||[]).filter(v=>ids.has(v.airline));
  s.actuals={};
  if(partial){
    s.costs=[]; s.hires=[]; s.fees=[]; s.funding=[]; s.distributions=[]; s.bonuses=[];
    s.salary=Object.assign({},s.salary,{base:0,steps:[]});
    s.settings=Object.assign({},s.settings,{openingCash:0,minCash:0});
  }
  const M=compute(s,view.scenario); addBonuses(s,M); blendActuals(s,M,asOfYm()); M.R=runwayInfo(s,M); M.s=s; M.sc=sc; return M;
};
fcApRows14=function(F){
  return state.airlines.filter(a=>fcScope19(F,a)).map(a=>{
    const r=regionOf(state,a.country), tm=timingOf(state,a);
    return {a,e:airlineEcon(state,a,0),ok:a.status!=='Lost'&&!readOnly,on:a.status!=='Lost'&&a.include!==false,reg:r?r.name:'Unassigned',cty:ctyKey14(a),undated:!isFinite(monthIndex(tm.sign))||!isFinite(monthIndex(tm.live))};
  });
};
const forecastBase19=forecast;
forecast=function(M){
  const F=fcF(), any=!!(F.regions.length||F.countries.length||F.product);
  let h=forecastBase19(M);
  /* heading: no "Plan case" label */
  h=h.replace(/<h2>(?:Plan|Weighted) case · /,'<h2>'+(view.scenario==='weighted'?'Weighted · ':''));
  /* replace the single-choice filter panel with multi-select chips */
  const years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4)))), yr=view.fcYear||'all';
  const sel=(act,opts,v,lab)=>'<div class="field"><label>'+lab+'</label><select class="in" data-act="'+act+'" aria-label="'+lab+'">'+opts.map(([k,l])=>'<option value="'+esc(k)+'"'+(String(v)===String(k)?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';
  const n=fcApRows14(F).filter(x=>x.on).length;
  const bar='<div class="panel mb"><div class="panel-head"><h3>Filter the forecast</h3>'+(any||yr!=='all'?'<button class="btn small" data-act="fc-f-reset">Clear filters</button>':'')+'</div>'+
    chipBar19('fc19',F.regions,F.countries,state.airlines,'Forecast covers')+
    '<div class="fields" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))">'+
      sel('fc-f-product',[['','All products'],...state.products.map(p=>[p.id,p.short||p.name])],F.product,'Product')+
      sel('fc-year',[['all','All years'],...years.map(y=>[y,y])],yr,'Year in the tables')+
    '</div>'+
    (any?'<p class="hint"><b>'+n+' ticked airline'+(n===1?'':'s')+'</b> in this selection feed the numbers below. Revenue, ARR and cash collected are for these airlines only; company costs, salaries, bonuses and funding are left out because they are not split by country or product.</p>':'<p class="hint">Whole company. Pick one or more regions or countries to see just those airlines; tick airlines in the list below to choose what the forecast includes.</p>')+
  '</div>';
  h=h.replace(/<div class="panel mb"><div class="panel-head"><h3>Filter the forecast<\/h3>[\s\S]*?(?=<details class="panel mb fcap")/,bar);
  /* a whole-company list of hundreds of airlines starts closed */
  if(!any&&!(view.fcD14&&view.fcD14.ap!==undefined)) h=h.replace('<details class="panel mb fcap" data-d14="ap" open>','<details class="panel mb fcap" data-d14="ap">');
  return h;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act; if(!a||a.indexOf('fc19-')!==0) return;
  const F=fcF();
  if(a==='fc19-region'){ const was=F.regions.includes(b.dataset.v); toggle19(F.regions,b.dataset.v); if(was) F.countries=dropCountriesOf19(F.countries,b.dataset.v); }
  else if(a==='fc19-country') toggle19(F.countries,b.dataset.v);
  else if(a==='fc19-clear'){ F.regions=[]; F.countries=[]; }
  view.fcF={regions:F.regions,countries:F.countries,product:F.product}; persistView(); render();
});
/* product select: keep the multi-select choices (the older handler rebuilt the filter from single values) */
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act!=='fc-f-product') return;
  e.stopImmediatePropagation();
  const F=fcF(); view.fcF={regions:F.regions,countries:F.countries,product:el.value}; persistView(); render();
},true);

/* ---------- fix: "Key lines only" also showed whole sections whose id matched a row id ---------- */
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act!=='fc-preset'||el.tagName!=='SELECT') return;
  e.stopImmediatePropagation();
  const p=el.value, rows=ptRows14({airlines:state.airlines.map(a=>({region:regName19(a)}))}).rows;
  const SECS={pl:['rev','gp','cost','prof'],cash:['cash','arr']}, IDS={sum:['revenue','gp','costs','net','nm','cashB','liveARR','live']};
  if(p==='all') view.fcHideRows=[];
  else if(SECS[p]) view.fcHideRows=rows.filter(r=>!SECS[p].includes(r.sec)).map(r=>r.id);
  else if(IDS[p]) view.fcHideRows=rows.filter(r=>!IDS[p].includes(r.id)).map(r=>r.id);
  view.fcPreset=p; persistView(); render();
},true);

/* =====================================================================
   IMPORT: only target-size airlines (1–70 aircraft); smarter duplicate check
   ===================================================================== */
const IMP19_MAX=70;
for(let i=IMP18.length-1;i>=0;i--){ const n=+IMP18[i][2]; if(!(n>=1&&n<=IMP19_MAX)) IMP18.splice(i,1); }
const norm19=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\(.*?\)/g,'').replace(/[^a-z0-9]/g,'').replace(/(airlines|airline|airways)$/,'');
imp18Missing=function(){
  const list=(pipeAll19||state.airlines).filter(Boolean);
  const have=new Set(list.map(a=>norm19(a.country)+'|'+norm19(a.name))), names=new Set(list.map(a=>norm19(a.name)));
  const seen=new Set();
  return IMP18.filter(r=>{ const k=norm19(r[0])+'|'+norm19(r[1]); if(seen.has(k)||have.has(k)||names.has(norm19(r[1]))) return false; seen.add(k); return +r[2]>=1&&+r[2]<=IMP19_MAX; });
};
