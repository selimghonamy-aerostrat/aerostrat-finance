/* ===== v51: Forecast shows only what you chose, and the whole table fits on screen.
   (1) "Aircraft added by year" follows the region, country, product and fleet filter (before, it listed every
       airline in the company, so countries you had not picked showed up, and its totals counted them).
   (2) The airline list and the region/country chips show only airlines that are in the forecast. Airlines you
       have not ticked (e.g. the Kenya prospects) appear only after "Show airlines not in the forecast".
   (3) Wider Forecast page: the page uses the full screen width and the tables are tighter, so all 12 months,
       the year total and the change column are visible without scrolling sideways. ===== */
(function(){ try{ if(document.getElementById('v51-css')) return; const st=document.createElement('style'); st.id='v51-css';
  st.textContent=[
  'body.fc51 main .wrap{max-width:none;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}',
  'body.fc51 table.t32{width:100%}',
  'body.fc51 table.t32 th,body.fc51 table.t32 td{padding:5px 6px;font-size:12.5px}',
  'body.fc51 table.t32 td.n,body.fc51 table.t32 th.n{white-space:nowrap;font-variant-numeric:tabular-nums}',
  'body.fc51 table.t32 tr>td:first-child,body.fc51 table.t32 tr>th:first-child{min-width:170px;max-width:240px;white-space:normal}',
  'body.fc51 table.t32 .bill40{font-size:11.5px;max-width:110px}',
  'body.fc51 table.t32 input.in{min-width:0;width:100%;padding:3px 4px;font-size:12px}',
  'body.fc51 table.fcap-t th,body.fc51 table.fcap-t td{padding:5px 6px;font-size:12.5px}',
  'body.fc51 table.fcap-t th{white-space:normal;vertical-align:bottom}',
  'body.fc51 table.fcap-t td.n{white-space:nowrap}',
  '.fc51-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:4px 0 12px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--tint-2,rgba(0,0,0,.03));font-size:13px}',
  '.fc51-bar .grow{flex:1;min-width:200px}'
  ].join('\n'); document.head.appendChild(st); }catch(e){} })();

/* the forecast's current selection (null = whole company) */
function sel51(){
  try{ const F=fcF(), fl=fleet22('fc'); return (F.regions.length||F.countries.length||F.product||fl.on)?F:null; }catch(e){ return null; }
}
function inForecast51(a,F){
  if(!a||a.status==='Lost'||a.include===false) return false;
  try{ if(F&&!fcScope19(F,a)) return false; if(!fleetOk22(a,fleet22('fc'))) return false; }catch(e){}
  return true;
}

/* (1) Aircraft added by year: only the airlines in this forecast */
const fleetPanelBase51=fleetPanel40;
fleetPanel40=function(){
  const F=sel51();
  if(!F) return fleetPanelBase51();
  const keep=new Set(state.airlines.filter(a=>inForecast51(a,F)).map(a=>a.id));
  const mf=modelFor;
  modelFor=function(){ const M=mf.apply(this,arguments); return Object.assign({},M,{airlines:(M.airlines||[]).filter(x=>x&&x.a&&keep.has(x.a.id))}); };
  try{ return fleetPanelBase51(); } finally { modelFor=mf; }
};

/* (2) airline list and chips: airlines in the forecast unless "show all" is on */
const fcApRowsBase51=fcApRows14;
fcApRows14=function(F){
  const rows=fcApRowsBase51(F);
  return view.fcAll51?rows:rows.filter(x=>x&&x.on);
};
const chipBarBase51=chipBar19;
chipBar19=function(prefix,regIds,ctys,list,label){
  if(prefix!=='fc19'||view.fcAll51) return chipBarBase51(prefix,regIds,ctys,list,label);
  const shown=(list||[]).filter(a=>a&&a.status!=='Lost'&&a.include!==false);
  let h=chipBarBase51(prefix,regIds,ctys,shown,label);
  /* drop chips with nothing in the forecast, unless they are picked */
  h=h.replace(/<button class="chip19"(?:(?!<\/button>)[\s\S])*?<\/button>/g,m=>(/aria-pressed="false"/.test(m)&&/<span class="n19">0<\/span><\/button>$/.test(m))?'':m);
  return h;
};
const fcPanelBase51=fcPanel14;
fcPanel14=function(F){
  let h=fcPanelBase51(F);
  try{
    const out=state.airlines.filter(a=>a&&a.status!=='Lost'&&a.include===false&&(!F||fcScope19(F,a))).length;
    const inn=state.airlines.filter(a=>inForecast51(a,F)).length;
    if(!out&&!view.fcAll51) return h;
    const bar='<div class="fc51-bar"><span class="grow">'+(view.fcAll51
      ?'Showing every airline. Tick the ones to add to the forecast; '+out+' are not in it yet.'
      :'Showing the '+inn+' airline'+(inn===1?'':'s')+' in this forecast. '+out+' other airline'+(out===1?' is':'s are')+' in the portal but not in the forecast.')+'</span>'+
      '<button class="btn small" data-act="fc51-all">'+(view.fcAll51?'Show only the forecast':'Show airlines not in the forecast ('+out+')')+'</button></div>';
    h=bar+h;
  }catch(e){ console.warn('v51 bar',e); }
  return h;
};
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act="fc51-all"]'); if(!b) return;
  e.preventDefault(); e.stopImmediatePropagation();
  view.fcAll51=!view.fcAll51; persistView(); render();
},true);

/* (3) wide Forecast page */
const renderBase51=render;
render=function(){
  try{ document.body.classList.toggle('fc51',view.tab==='forecast'); }catch(e){}
  return renderBase51.apply(this,arguments);
};
