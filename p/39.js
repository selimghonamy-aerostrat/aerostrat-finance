/* ===== v39: Kenya airlines with their real fleet sizes · Countries tab rebuilt as a drill-down ranked by aircraft:
   regions (most aircraft first) -> countries in the region -> airlines in the country, with a biggest/smallest switch. ===== */

/* ---------- 1) Kenya: add the airlines with accurate fleet counts (existing Kenya airlines get their fleet corrected) ---------- */
const KENYA39=[['748 Air Services',10],['Advantage Air',6],['Air Kenya',2],['Aircraft Leasing Services',13],['Airworks Kenya',1],['Astral Aviation',3],['Blue Bird Aviation',8],['Buff Air Services',2],['DAC East Africa',4],['DragonFly',1],['EastAfrican',1],['Fanjet Express',3],['Fly540',1],['Freedom Airline Express',2],['I-Fly Air',4],['Jambojet',10],['Jetlite Air',4],['Jetways Airlines',3],['Kenya Air Force',2],['Kenya Airways',27]];
const fc39=n=>Math.round(num(n)).toLocaleString('en-US');
const nm39=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
/* names the researched list used for the same airlines */
const ALIAS39={alsaircraftleasingservices:'aircraftleasingservices',als:'aircraftleasingservices',airkenyaexpress:'airkenya',airkenya:'airkenya',buffairservices:'buffairservices',kenyaairwayskq:'kenyaairways',fly540kenya:'fly540'};
const key39=s=>{ const k=nm39(s); return ALIAS39[k]||k; };
const KSET39=new Set(KENYA39.map(r=>key39(r[0])));
/* the "ready to add" research list: Kenya rows now use these numbers (airlines further down the alphabet stay as researched) */
try{ for(let i=IMP18.length-1;i>=0;i--){ const r=IMP18[i]; if(nm39(r[0])==='kenya'&&KSET39.has(key39(r[1]))) IMP18.splice(i,1); }
  KENYA39.forEach(([n,f])=>IMP18.push(['Kenya',n,f,'2026-11','Airline list (Kenya, page 1 of 3), Nov 2026'])); }catch(e){}
function mig39(s){
  if(!s||!s.settings||!Array.isArray(s.airlines)||!Array.isArray(s.regions)||num(s.settings.kenya39)>=1) return 0;
  if(!s.regions.some(r=>(r.countries||[]).some(c=>nm39(c.name)==='kenya'))){
    let r=s.regions.find(r=>/east\s*africa/i.test(r.name||''));
    if(!r){ r={id:uid('r'),name:'East Africa',color:'sky',countries:[]}; s.regions.push(r); }
    r.countries=r.countries||[]; r.countries.push({name:'Kenya',priceAdj:0,notes:''});
  }
  const kn=(s.regions.flatMap(r=>r.countries||[]).find(c=>nm39(c.name)==='kenya')||{}).name||'Kenya';
  let n=0;
  KENYA39.forEach(([name,fleet])=>{
    const ex=s.airlines.filter(a=>nm39(a.country)==='kenya'&&key39(a.name)===key39(name));
    if(ex.length){ ex.forEach(a=>{ if(num(a.fleet)!==fleet){ a.notes=((a.notes?a.notes+' · ':'')+'Fleet corrected '+num(a.fleet)+' → '+fleet+' (Nov 2026 list)').slice(0,400); a.fleet=fleet; n++; } }); return; }
    s.airlines.push(newAirline({name,country:kn,fleet,pilots:'',cohort:'',status:'Pipeline',prob:10,include:false,signMonth:'',goLiveMonth:'',notes:'Fleet '+fleet+' from the Kenya airline list (Nov 2026).'}));
    n++;
  });
  s.settings.kenya39=1; return n||1;
}
const applyDraftBase39=applyDraft;
applyDraft=function(){
  applyDraftBase39();
  if(readOnly||cfgLocked) return;
  const n=mig39(state);
  if(n){ restored=false; saveDraft(); setTimeout(()=>toast('Kenya fleet numbers updated (20 airlines, 107 aircraft). New ones are prospects, not in the forecast until you tick them. Press Save to keep it.'),3400); }
};

/* ---------- 2) styles ---------- */
(function(){ try{ if(document.getElementById('v39-css')) return; const st=document.createElement('style'); st.id='v39-css';
  st.textContent=[
  '.dd39-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:0 0 14px}',
  '.dd39-crumb{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}','.dd39-crumb b{font-size:15px}',
  '.dd39-sort{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}',
  '.dd39-sort button{border:0;background:transparent;color:inherit;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer}',
  '.dd39-sort button[aria-pressed="true"]{background:var(--c-deep);color:#fff}',
  '.dd39-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}',
  '.dd39-card{display:block;width:100%;text-align:left;border:1px solid var(--line);border-left:5px solid var(--rc,var(--c-deep));border-radius:12px;background:var(--panel);padding:14px 16px;cursor:pointer;color:inherit;font:inherit}',
  '.dd39-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-1px)}',
  '.dd39-card .t{display:flex;justify-content:space-between;align-items:baseline;gap:8px}','.dd39-card .t b{font-size:17px}',
  '.dd39-card .big{font-size:26px;font-weight:700;margin:6px 0 2px}','.dd39-card .m{color:var(--muted);font-size:12.5px}',
  '.dd39-card ol{margin:10px 0 0;padding-left:18px;font-size:12.5px;color:var(--muted)}','.dd39-card ol li span{float:right}',
  '.dd39-rank{color:var(--muted);width:30px;font-variant-numeric:tabular-nums}',
  '.dd39-bar{position:relative;height:8px;border-radius:4px;background:var(--tint);min-width:90px}','.dd39-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--rc,var(--c-deep))}',
  '.dd39 table td{vertical-align:middle}','.dd39 .rowbtn{cursor:pointer}','.dd39 .rowbtn:hover td{background:var(--tint)}',
  '.dd39 .zero td{opacity:.55}'
  ].join('\n'); document.head.appendChild(st); }catch(e){} })();

/* a Markets tab (the Countries page) next to Pipeline; it used to be folded into Pipeline */
try{ delete TABMAP25.countries; }catch(e){}
if(!TABS.some(t=>t[0]==='countries')){ const i=TABS.findIndex(t=>t[0]==='pipeline'); TABS.splice(i>=0?i+1:TABS.length,0,['countries','Markets']); }

/* ---------- 3) numbers ---------- */
const sortDir39=()=>view.sort39==='asc'?'asc':'desc';
const ord39=(L,f)=>{ const d=sortDir39()==='asc'?1:-1; return L.slice().sort((a,b)=>d*(f(a)-f(b))||String(a.name).localeCompare(String(b.name))); };
function air39(a){ const e=airlineEcon(state,a,0); return {a,name:a.name||'Airline',fleet:num(a.fleet),pilots:num(e.pilots),arr:num(e.arr),inPlan:a.include!==false&&a.status!=='Lost'}; }
function cty39(name){ const L=state.airlines.filter(a=>a.country===name&&a.status!=='Lost').map(air39);
  return {name,list:L,n:L.length,fleet:L.reduce((t,x)=>t+x.fleet,0),pilots:L.reduce((t,x)=>t+x.pilots,0),arr:L.reduce((t,x)=>t+x.arr,0),inPlan:L.filter(x=>x.inPlan).length}; }
function regs39(){
  const R=state.regions.map(r=>({name:r.name,color:cv(r.color),cs:(r.countries||[]).map(c=>c.name)}));
  const known=new Set(R.flatMap(r=>r.cs)), extra=Array.from(new Set(state.airlines.map(a=>a.country).filter(c=>c&&!known.has(c))));
  if(extra.length) R.push({name:'Unassigned',color:'var(--c-grey)',cs:extra});
  return R.map(r=>{ const C=r.cs.map(cty39); return Object.assign(r,{C,fleet:C.reduce((t,c)=>t+c.fleet,0),n:C.reduce((t,c)=>t+c.n,0),pilots:C.reduce((t,c)=>t+c.pilots,0),arr:C.reduce((t,c)=>t+c.arr,0),withA:C.filter(c=>c.n).length}); });
}
const bar39=(v,max)=>'<div class="dd39-bar"><i style="width:'+(max?Math.max(2,Math.round(v/max*100)):0)+'%"></i></div>';
const sortBtns39=()=>'<div class="dd39-sort" role="group" aria-label="Sort by aircraft"><button data-act="sort39" data-v="desc" aria-pressed="'+(sortDir39()==='desc')+'">Most aircraft first</button><button data-act="sort39" data-v="asc" aria-pressed="'+(sortDir39()==='asc')+'">Fewest first</button></div>';

/* ---------- 4) Countries tab: regions -> countries ---------- */
countriesView=function(M){
  const R=regs39(), sel=view.reg39&&R.find(r=>r.name===view.reg39);
  let h='<div class="dd39">';
  if(!sel){
    const tot=R.reduce((t,r)=>t+r.fleet,0), max=Math.max(1,...R.map(r=>r.fleet));
    h+='<div class="sec-head"><div><div class="eyebrow">Markets</div><h2>Regions by number of aircraft</h2><p>'+fc39(tot)+' aircraft across '+R.reduce((t,r)=>t+r.n,0)+' airlines. Click a region to see its countries, then a country to see its airlines.</p></div></div>';
    h+='<div class="dd39-top"><span class="muted small">Lost deals are not counted.</span>'+sortBtns39()+'</div><div class="dd39-grid">';
    ord39(R,r=>r.fleet).forEach(r=>{
      const top=ord39(r.C.filter(c=>c.n),c=>c.fleet).slice(0,3);
      h+='<button class="dd39-card" style="--rc:'+r.color+'" data-act="reg39" data-v="'+esc(r.name)+'"><div class="t"><b>'+esc(r.name)+'</b><span class="m">'+r.withA+' of '+r.cs.length+' countries have airlines</span></div>'+
        '<div class="big">'+fc39(r.fleet)+' <span class="m">aircraft</span></div>'+bar39(r.fleet,max)+
        '<div class="m" style="margin-top:6px">'+r.n+' airline'+(r.n===1?'':'s')+' · '+fc39((r.pilots))+' pilots · '+$(r.arr)+' a year if all sign</div>'+
        (top.length?'<ol>'+top.map(c=>'<li>'+esc(c.name)+'<span>'+fc39(c.fleet)+' aircraft</span></li>').join('')+'</ol>':'<p class="m" style="margin-top:8px">No airlines yet.</p>')+'</button>';
    });
    h+='</div>';
  } else {
    const C=ord39(sel.C,c=>c.fleet), max=Math.max(1,...C.map(c=>c.fleet));
    h+='<div class="dd39-top"><div class="dd39-crumb"><button class="btn small" data-act="reg39" data-v="">← All regions</button><b style="color:'+sel.color+'">'+esc(sel.name)+'</b><span class="muted">'+fc39(sel.fleet)+' aircraft · '+sel.n+' airlines · '+sel.cs.length+' countries</span></div>'+sortBtns39()+'</div>';
    h+='<div class="panel flush" style="--rc:'+sel.color+'"><div class="tbl-wrap"><table class="fin"><thead><tr><th></th><th>Country</th><th class="n">Aircraft</th><th style="width:28%"></th><th class="n">Airlines</th><th class="n">In forecast</th><th class="n">Pilots</th><th class="n">ARR if all sign</th></tr></thead><tbody>'+
      C.map((c,i)=>'<tr class="rowbtn'+(c.n?'':' zero')+'" data-act="open-country" data-v="'+esc(c.name)+'"><td class="dd39-rank">'+(i+1)+'</td><td><b>'+esc(c.name)+'</b></td><td class="n"><b>'+fc39(c.fleet)+'</b></td><td>'+bar39(c.fleet,max)+'</td><td class="n">'+c.n+'</td><td class="n">'+c.inPlan+'</td><td class="n">'+fc39((c.pilots))+'</td><td class="n">'+(c.arr?$(c.arr):'–')+'</td></tr>').join('')+
      '<tr class="total"><td></td><td>'+esc(sel.name)+'</td><td class="n">'+fc39(sel.fleet)+'</td><td></td><td class="n">'+sel.n+'</td><td class="n">'+sel.C.reduce((t,c)=>t+c.inPlan,0)+'</td><td class="n">'+fc39((sel.pilots))+'</td><td class="n">'+$(sel.arr)+'</td></tr></tbody></table></div></div>'+
      '<p class="hint">Click a country to see its airlines. Countries with no airlines yet are shown faded.</p>';
  }
  return h+'</div>';
};

/* ---------- 5) a country: airlines ranked by aircraft, above the existing country page ---------- */
const countryDetailBase39=countryDetail;
countryDetail=function(name){
  let h=countryDetailBase39(name);
  try{
    const c=cty39(name), reg=regionOf(state,name), rn=reg?reg.name:'Unassigned', color=reg?cv(reg.color):'var(--c-grey)';
    const L=ord39(c.list,x=>x.fleet), max=Math.max(1,...L.map(x=>x.fleet));
    const crumbs='<div class="dd39-top"><div class="dd39-crumb"><button class="btn small" data-act="reg39" data-v="">All regions</button><span class="muted">/</span><button class="btn small" data-act="reg39" data-v="'+esc(rn)+'">'+esc(rn)+'</button><span class="muted">/</span><b>'+esc(name)+'</b><span class="muted">'+fc39(c.fleet)+' aircraft · '+c.n+' airlines</span></div>'+sortBtns39()+'</div>';
    const tbl=L.length?'<div class="panel flush mb" style="--rc:'+color+'"><div class="panel-head pad"><h3>Airlines in '+esc(name)+' by aircraft</h3></div><div class="tbl-wrap"><table class="fin"><thead><tr><th></th><th>Airline</th><th>Status</th><th class="n">Aircraft</th><th style="width:26%"></th><th class="n">Pilots</th><th class="n">ARR yr 1</th></tr></thead><tbody>'+
      L.map((x,i)=>'<tr class="rowbtn" data-act="open-airline" data-v="'+esc(x.a.id)+'"><td class="dd39-rank">'+(i+1)+'</td><td><b>'+esc(x.name)+'</b></td><td><span class="chip st-'+(x.inPlan?esc(x.a.status||'Pipeline'):'Prospect')+'">'+(x.inPlan?esc(x.a.status||'Pipeline'):'Prospect')+'</span></td><td class="n"><b>'+fc39(x.fleet)+'</b></td><td>'+bar39(x.fleet,max)+'</td><td class="n">'+fc39((x.pilots))+'</td><td class="n">'+$(x.arr)+'</td></tr>').join('')+
      '<tr class="total"><td></td><td>'+esc(name)+'</td><td></td><td class="n">'+fc39(c.fleet)+'</td><td></td><td class="n">'+fc39((c.pilots))+'</td><td class="n">'+$(c.arr)+'</td></tr></tbody></table></div></div>':'';
    h=h.replace(/^<div class="crumbs">[\s\S]*?<\/div>/,'');
    const j=h.indexOf('<div class="hero"'); h=crumbs+(j>=0?h.slice(0,j)+tbl+h.slice(j):tbl+h);
  }catch(e){ console.warn('v39 country',e); }
  return h;
};

/* ---------- 6) clicks ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act;
  if(a!=='reg39'&&a!=='sort39') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(a==='reg39'){ view.reg39=b.dataset.v||null; view.tab='countries'; view.country=null; view.airline=null; }
  else view.sort39=b.dataset.v==='asc'?'asc':'desc';
  persistView(); try{ history.replaceState(null,'','#countries'); }catch(err){} render(); if(a==='reg39') window.scrollTo(0,0);
},true);
/* opening a country remembers its region, so "back" lands on that region's list */
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="open-country"]'); if(!b) return;
  const r=regionOf(state,b.dataset.v); view.reg39=r?r.name:'Unassigned';
},true);
