/* ===== v16: one pool of airlines. Pipeline and Countries show every airline the same way;
   the Forecast tab's airline list is the only place that chooses which airlines feed the forecast. ===== */
(function(){
  if(document.getElementById('v16-css')) return;
  const st=document.createElement('style'); st.id='v16-css';
  st.textContent='.fc16-warn{margin:0 0 10px;padding:8px 12px;border-radius:8px;background:var(--warn-soft);color:var(--warn);font-size:12.5px}';
  document.head.appendChild(st);
})();
/* render a view as if every airline were in the pool (no prospect split, no shading); Lost stays Lost */
function allIn16(fn){
  const prev=state.airlines.map(a=>a.include);
  state.airlines.forEach(a=>{ a.include=true; });
  try{ return fn(); } finally { state.airlines.forEach((a,i)=>{ if(prev[i]===undefined) delete a.include; else a.include=prev[i]; }); }
}
const words16=h=>h
  .replace(/(\d+) in plan · /g,(m,n)=>n+(n==='1'?' airline · ':' airlines · '))
  .replace(/ airline(s?) in plan/g,' airline$1')
  .replace(/% of plan ARR/g,'% of total ARR')
  .replace('Plan ARR counts airlines in the forecast. Prospects show what the other airlines would pay if won.','Every listed airline counts here except Lost deals. Choose which ones feed the forecast on the Forecast tab.')
  .replace(/<p class="hint">Prospects are airlines[\s\S]*?<\/p>/,'');

/* ---------- Pipeline: no "In" column, no shading ---------- */
const pipelineBase16=pipeline;
pipeline=function(){
  let h=allIn16(()=>pipelineBase16());
  h=h.replace('<th>In</th>','').replace(/<td><input id="f-airlines-\d+-include"[^>]*><\/td>/g,'');
  h=h.replace(/<table class="fin pipe">[\s\S]*?<\/table>/,t=>t.replace(/colspan="5"/g,'colspan="4"'));
  h=h.replace('Lost or unticked airlines drop out of every forecast.','Lost deals drop out. Choose which airlines feed the forecast on the Forecast tab.');
  return h;
};

/* ---------- Countries: every airline shown the same way ---------- */
const ctyBase16=countriesView, cdBase16=countryDetail;
countriesView=function(M){ return words16(allIn16(()=>ctyBase16(M))); };
countryDetail=function(name){ return words16(allIn16(()=>cdBase16(name))); };

/* ---------- Forecast: ticking an airline sets whether it is in the forecast (saved with Save) ---------- */
fcF=function(){ const F=Object.assign({region:'',country:'',product:''},view.fcF||{}); F.prospects=false; F.off=[]; return F; };
fcApRows14=function(F){
  const pd=state.products[0]&&state.products[0].id;
  const inScope=a=>{
    const r=regionOf(state,a.country);
    if(F.region&&(!r||r.id!==F.region)) return false;
    if(F.country&&a.country!==F.country) return false;
    if(F.product&&(a.product||pd)!==F.product) return false;
    return true;
  };
  return state.airlines.filter(inScope).map(a=>{
    const ok=a.status!=='Lost'&&!readOnly, r=regionOf(state,a.country), tm=timingOf(state,a);
    return {a,e:airlineEcon(state,a,0),ok,on:a.status!=='Lost'&&a.include!==false,reg:r?r.name:'Unassigned',cty:ctyKey14(a),undated:!isFinite(monthIndex(tm.sign))||!isFinite(monthIndex(tm.live))};
  });
};
fcApSet14=function(ids,turnOn){
  if(readOnly) return;
  const set=new Set(ids);
  state.airlines.forEach(a=>{ if(set.has(a.id)&&a.status!=='Lost') a.include=!!turnOn; });
  commit();
};
const forecastBase16=forecast;
forecast=function(M){
  const F=fcF();
  let h=forecastBase16(M);
  h=h.replace(/<div class="field"><label>Airlines<\/label><label class="inline"><input type="checkbox" data-act="fc-f-prospects"[^>]*> Include prospects<\/label><\/div>/,'');
  h=h.replace(/ <span class="why14">Not in plan<\/span>/g,'');
  h=h.replace('Showing the whole company. Pick a region, country or product, or untick airlines in the list below, to recompute the forecast for just those airlines.','Showing the whole company. Tick airlines in the list below to choose what the forecast includes. Pick a region, country or product to see just that slice.');
  h=h.replace(/<p class="hint">ARR yr 1 and Implementation[\s\S]*?<\/p><\/details>/,'<p class="hint">This list is the only switch for the forecast: ticked airlines are in, unticked are out, on every tab. '+(readOnly?'You can view the list but not change it.':'Ticks are part of the plan, so press Save to keep them for everyone.')+' Lost deals can’t be ticked. ARR yr 1 and implementation are the first contract year at current prices.</p></details>');
  if(!(view.fcD14&&view.fcD14.ap!==undefined)) h=h.replace('<details class="panel mb fcap" data-d14="ap">','<details class="panel mb fcap" data-d14="ap" open>');
  const und=fcApRows14(F).filter(x=>x.on&&x.undated);
  if(und.length){
    const names=und.slice(0,6).map(x=>esc(x.a.name)).join(', ')+(und.length>6?' and '+(und.length-6)+' more':'');
    h=h.replace(/(<details class="panel mb fcap"[^>]*><summary>[\s\S]*?<\/summary>)/,'$1<p class="fc16-warn">'+und.length+' ticked airline'+(und.length===1?' has':'s have')+' no sign or go-live date, so '+(und.length===1?'it adds':'they add')+' nothing to the forecast yet: '+names+'. Set the dates on the Pipeline tab.</p>');
  }
  return h;
};
