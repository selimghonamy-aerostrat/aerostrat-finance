/* ===== v12: Forecast filters (region, country, product, year, prospects) recompute the model ===== */
const fcFilterBase=forecast;
let fcUndated=0;
function fcF(){ return Object.assign({region:'',country:'',product:'',prospects:false},view.fcF||{}); }
function fcFiltered(F){
  const sc=curScen(), base=applyScenario(state,sc), s=JSON.parse(JSON.stringify(base));
  const keep=a=>{ if(a.status==='Lost') return false; if(a.include===false&&!F.prospects) return false; const r=regionOf(s,a.country);
    if(F.region&&(!r||r.id!==F.region)) return false; if(F.country&&a.country!==F.country) return false; if(F.product&&(a.product||s.products[0].id)!==F.product) return false; return true; };
  const d0=monthIndex(asOfYm())+6; let undated=0;
  s.airlines=s.airlines.filter(keep).map(a=>{ if(a.include===false){ const t=timingOf(s,a); if(!isFinite(monthIndex(t.sign))||!isFinite(monthIndex(t.live))){ a.signMonth=ymFromIndex(d0); a.goLiveMonth=ymFromIndex(d0+1); undated++; } } return Object.assign(a,{include:true}); });
  fcUndated=undated;
  const ids=new Set(s.airlines.map(a=>a.id));
  s.costs=[]; s.hires=[]; s.fees=[]; s.funding=[]; s.distributions=[]; s.bonuses=[]; s.actuals={};
  s.invoices=(s.invoices||[]).filter(v=>ids.has(v.airline));
  s.salary=Object.assign({},s.salary,{base:0,steps:[]}); s.settings=Object.assign({},s.settings,{openingCash:0,minCash:0});
  const M=compute(s,view.scenario); addBonuses(s,M); blendActuals(s,M,asOfYm()); M.R=runwayInfo(s,M); M.s=s; M.sc=sc; return M;
}
forecast=function(M){
  const F=fcF(), active=!!(F.region||F.country||F.product||F.prospects);
  const Mx=active?fcFiltered(F):M;
  let h=fcFilterBase(Mx);
  const reg=state.regions.find(r=>r.id===F.region);
  const ctys=reg?reg.countries.map(c=>c.name):Array.from(new Set(state.airlines.filter(a=>F.prospects||a.include!==false).map(a=>a.country).filter(Boolean))).sort();
  const years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4)))), yr=view.fcYear||'all';
  const sel=(act,opts,v,lab)=>'<div class="field"><label>'+lab+'</label><select class="in" data-act="'+act+'" aria-label="'+lab+'">'+opts.map(([k,l])=>'<option value="'+esc(k)+'"'+(String(v)===String(k)?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';
  const n=Mx.airlines.length;
  let bar='<div class="panel mb"><div class="panel-head"><h3>Filter the forecast</h3>'+(active||yr!=='all'?'<button class="btn small" data-act="fc-f-reset">Clear filters</button>':'')+'</div><div class="fields" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))">'+
    sel('fc-f-region',[['','All regions'],...state.regions.map(r=>[r.id,r.name])],F.region,'Region')+
    sel('fc-f-country',[['',reg?'All of '+reg.name:'All countries'],...ctys.map(c=>[c,c])],F.country,'Country')+
    sel('fc-f-product',[['','All products'],...state.products.map(p=>[p.id,p.short||p.name])],F.product,'Product')+
    sel('fc-year',[['all','All years'],...years.map(y=>[y,y])],yr,'Year')+
    '<div class="field"><label>Airlines</label><label class="inline"><input type="checkbox" data-act="fc-f-prospects"'+(F.prospects?' checked':'')+'> Include prospects</label></div>'+
    '</div>'+(active?'<p class="hint"><b>'+n+' airline'+(n===1?'':'s')+'</b> match'+(n===1?'es':'')+(F.prospects?', prospects included as if won'+(fcUndated?' ('+fcUndated+' without dates assumed to sign in '+ymLabel(ymFromIndex(monthIndex(asOfYm())+6))+' and go live a month later)':''):'')+'. Revenue, ARR and cash collected are for these airlines only; company costs, salaries, bonuses and funding are left out because they are not split by country or product.</p>':'<p class="hint">Showing the whole company. Pick a region, country or product to recompute the forecast for just those airlines. The year picks the period shown in the monthly and quarterly tables.</p>')+'</div>';
  const k=h.indexOf('<div class="kpis">');
  return k>=0?h.slice(0,k)+bar+h.slice(k):bar+h;
};
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return; const a=el.dataset.act; if(!a||!a.startsWith('fc-f-')) return;
  const F=fcF();
  if(a==='fc-f-region'){ F.region=el.value; F.country=''; }
  else if(a==='fc-f-country'){ F.country=el.value; if(el.value&&!F.region){ const r=regionOf(state,el.value); if(r) F.region=r.id; } }
  else if(a==='fc-f-product') F.product=el.value;
  else if(a==='fc-f-prospects') F.prospects=el.checked;
  view.fcF=F; persistView(); render();
});
document.addEventListener('change',e=>{ const el=e.target; if(el&&el.dataset&&el.dataset.act==='fc-year'&&el.tagName==='SELECT'){ view.fcYear=el.value; if(view.fcGran==='year'&&el.value!=='all') view.fcGran='quarter'; persistView(); render(); } });
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act="fc-f-reset"]'); if(!b) return; view.fcF={}; view.fcYear='all'; persistView(); render(); });
