/* ===== v14: countries inside the Pipeline region boxes · airline/country picker in the Forecast · professional, editable forecast table ===== */

/* ---------- styles ---------- */
(function(){
  if(document.getElementById('v14-css')) return;
  const st=document.createElement('style'); st.id='v14-css';
  st.textContent=[
  /* pipeline region boxes */
  '.rs14{grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));align-items:start}',
  '.rcard.rc14{display:block;padding:0;cursor:default;overflow:hidden}',
  '.rc14-head{width:100%;text-align:left;border:0;background:none;padding:10px 12px 8px;cursor:pointer;display:grid;gap:2px;color:inherit}',
  '.rc14-head:hover .rname{text-decoration:underline}',
  '.rc14-cols,.rc14-row,.rc14-foot{display:grid;grid-template-columns:minmax(0,1fr) 52px 56px 66px;gap:6px;align-items:center;width:100%;padding:4px 12px;font-size:12px}',
  '.rc14-cols{color:var(--muted);font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-top:1px solid var(--line);padding-top:6px}',
  '.rc14-cols span:nth-child(n+2),.rc14-row span:nth-child(n+2),.rc14-foot span:nth-child(n+2){text-align:right}',
  '.rc14-list{list-style:none;margin:0;padding:0}',
  '.rc14-row{border:0;background:none;text-align:left;cursor:pointer;color:inherit}',
  '.rc14-row:hover{background:var(--tint)}',
  '.rc14-row.zero{color:var(--muted)}',
  '.rc14-row span:first-child,.rc14-foot span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.rc14-foot{border-top:1px solid var(--line);font-weight:700;margin-top:2px;padding-bottom:7px}',
  /* forecast airline picker */
  '.fcap summary{cursor:pointer;display:flex;gap:12px;align-items:center;flex-wrap:wrap;list-style:none}',
  '.fcap summary::-webkit-details-marker{display:none}',
  '.fcap summary h3::before{content:"▸";display:inline-block;width:14px;color:var(--muted)}',
  '.fcap[open] summary h3::before{content:"▾"}',
  '.fcap .toolbar{margin:12px 0 8px}',
  '.fcap-t td,.fcap-t th{padding:5px 10px}',
  '.fcap-t tr.rg td{background:var(--tint);font-weight:700}',
  '.fcap-t tr.cg td{background:var(--tint-2);font-weight:600}',
  '.fcap-t tr.rg td:first-child{box-shadow:inset 5px 0 0 var(--rc)}',
  '.fcap-t tr.cg td:first-child{box-shadow:inset 5px 0 0 color-mix(in srgb,var(--rc) 45%,transparent);padding-left:22px}',
  '.fcap-t tr.ar td:first-child{padding-left:42px}',
  '.fcap-t tr.ar.off14 td{opacity:.5}',
  '.fcap-t label.inline{min-height:0;gap:8px}',
  '.fcap-t .why14{font-size:11px;color:var(--muted)}',
  /* professional forecast table */
  '.pt14-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:0 16px 10px}',
  '.pt14-bar .sp{flex:1}',
  '.btn[aria-pressed="true"]{background:var(--c-deep);border-color:var(--c-deep);color:#fff}',
  '.pt14-opts{display:flex;gap:10px;flex-wrap:wrap;padding:0 16px 10px}',
  '.pt14-opts details{border:1px solid var(--line);border-radius:8px;background:var(--panel);padding:6px 10px;min-width:200px;max-width:100%}',
  '.pt14-opts summary{cursor:pointer;font-weight:600;font-size:12.5px}',
  '.chkgrid14{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:4px 14px;margin-top:8px}',
  '.chkgrid14 h4{grid-column:1/-1;margin:8px 0 0;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
  '.chk14{display:inline-flex;gap:7px;align-items:center;font-size:12.5px;white-space:nowrap}',
  'table.pt14 thead th{position:sticky;top:0;z-index:2}',
  'table.pt14 th:first-child{min-width:230px}',
  'table.pt14 tr.sec14 td{background:var(--navy);color:var(--on-navy);font-weight:700;letter-spacing:.03em;border-bottom:0;padding-top:6px;padding-bottom:6px}',
  'table.pt14 tr.sec14 td:first-child{background:var(--navy)}',
  'table.pt14 tr.sec14 .sectoggle{border:0;background:none;color:inherit;font:inherit;cursor:pointer;display:inline-flex;gap:8px;align-items:center;padding:0}',
  'table.pt14 tr.r14:hover td{background:var(--tint-2)}',
  'table.pt14 tr.r14:hover td:first-child{background:var(--tint-2)}',
  'table.pt14 tr.r14.sub td:first-child .lb14{padding-left:14px}',
  'table.pt14 tr.r14.total td{background:var(--tint);border-top:1px solid var(--c-deep40)}',
  'table.pt14 tr.r14.total td:first-child{background:var(--tint)}',
  'table.pt14 td.tot14,table.pt14 th.tot14{background:var(--field);border-left:2px solid var(--line);font-weight:600}',
  'table.pt14 tr.r14.total td.tot14{background:var(--tint)}',
  'table.pt14 td.ovon{background:var(--warn-soft);box-shadow:inset 3px 0 0 var(--warn)}',
  'table.pt14 .in.ov14{width:104px;text-align:right;background:var(--panel);border-color:var(--line)}',
  'table.pt14 .ovx{border:0;background:none;color:var(--warn);cursor:pointer;font-size:13px;padding:0 0 0 4px}',
  'table.pt14 .dl14{display:block;font-size:10.5px;font-weight:500;line-height:1.1;color:var(--muted)}',
  'table.pt14 .dl14.up{color:var(--good)}',
  'table.pt14 .dl14.dn{color:var(--coral)}',
  '.lb14 .dot{margin-right:6px}',
  '.pt14-note{padding:0 16px 12px;margin:0}'
  ].join('\n');
  document.head.appendChild(st);
})();

/* =====================================================================
   1) PIPELINE: every country, with its numbers, visible inside each region box
   ===================================================================== */
const pipelineBase14=pipeline;
function regionCards14(){
  const fns=groupKeyFns();
  const rows=state.airlines.map(a=>({a,e:airlineEcon(state,a,0),reg:fns.region(a)}));
  const tot=list=>{
    const t={n:0,pilots:0,arr:0,w:0};
    list.forEach(x=>{ if(x.a.include===false||x.a.status==='Lost') return; t.n++; t.pilots+=x.e.pilots; t.arr+=x.e.arr; t.w+=x.e.arr*num(x.a.prob)/100; });
    return t;
  };
  return '<div class="region-strip rs14">'+state.regions.map(rg=>{
    const inR=rows.filter(x=>x.reg===rg.name), T=tot(inR);
    const cl=rg.countries.map(c=>({name:c.name,t:tot(inR.filter(x=>x.a.country===c.name))}));
    cl.sort((p,q)=>(q.t.arr-p.t.arr)||(q.t.n-p.t.n)||p.name.localeCompare(q.name));
    return '<div class="rcard rc14'+(view.filterRegion===rg.name?' on':'')+'" style="--rc:'+cv(rg.color)+'">'+
      '<button class="rc14-head" data-act="pick-region" data-v="'+esc(rg.name)+'" title="Show only '+esc(rg.name)+' in the table below"><span class="rname">'+esc(rg.name)+'</span><span class="rval">'+$k(T.arr)+'</span><span class="rsub">'+T.n+' airlines · '+rg.countries.length+' countries'+(T.w?' · weighted '+$k(T.w):'')+'</span></button>'+
      '<div class="rc14-cols"><span>Country</span><span>Airlines</span><span>Pilots</span><span>ARR</span></div>'+
      '<ul class="rc14-list">'+cl.map(c=>'<li><button class="rc14-row'+(c.t.n?'':' zero')+'" data-act="open-country" data-v="'+esc(c.name)+'" title="Open '+esc(c.name)+'"><span>'+esc(c.name)+'</span><span>'+c.t.n+'</span><span>'+(c.t.pilots?c.t.pilots.toLocaleString():'–')+'</span><span>'+(c.t.arr?$k(c.t.arr):'–')+'</span></button></li>').join('')+'</ul>'+
      '<div class="rc14-foot"><span>Region total</span><span>'+T.n+'</span><span>'+(T.pilots?T.pilots.toLocaleString():'–')+'</span><span>'+$k(T.arr)+'</span></div>'+
    '</div>';
  }).join('')+'</div>';
}
pipeline=function(){
  const h=pipelineBase14();
  const s=h.indexOf('<div class="region-strip">'); if(s<0) return h;
  const e=h.indexOf('</div>',s); if(e<0) return h;
  return h.slice(0,s)+regionCards14()+h.slice(e+6);
};

/* =====================================================================
   2) FORECAST: choose airlines / countries / regions that feed the forecast
      view.fcF.off = ids of airlines the user has unticked
   ===================================================================== */
const ctyKey14=a=>a.country||'No country';
fcF=function(){
  const F=Object.assign({region:'',country:'',product:'',prospects:false,off:[]},view.fcF||{});
  if(!Array.isArray(F.off)) F.off=[];
  return F;
};
const fcPartial14=F=>!!(F.region||F.country||F.product);
const fcActive14=F=>!!(F.region||F.country||F.product||F.prospects||(F.off&&F.off.length));
fcFiltered=function(F){
  const sc=curScen(), base=applyScenario(state,sc), s=JSON.parse(JSON.stringify(base));
  const off=new Set(F.off||[]), partial=fcPartial14(F);
  const keep=a=>{
    if(a.status==='Lost') return false;
    if(a.include===false&&!F.prospects) return false;
    if(off.has(a.id)) return false;
    const r=regionOf(s,a.country);
    if(F.region&&(!r||r.id!==F.region)) return false;
    if(F.country&&a.country!==F.country) return false;
    if(F.product&&(a.product||s.products[0].id)!==F.product) return false;
    return true;
  };
  const d0=monthIndex(asOfYm())+6; let undated=0;
  s.airlines=s.airlines.filter(keep).map(a=>{
    if(a.include===false){ const t=timingOf(s,a); if(!isFinite(monthIndex(t.sign))||!isFinite(monthIndex(t.live))){ a.signMonth=ymFromIndex(d0); a.goLiveMonth=ymFromIndex(d0+1); undated++; } }
    return Object.assign(a,{include:true});
  });
  fcUndated=undated;
  const ids=new Set(s.airlines.map(a=>a.id));
  s.invoices=(s.invoices||[]).filter(v=>ids.has(v.airline));
  s.actuals={};
  if(partial){
    /* a slice of the company: company-wide costs and funding cannot be split by country or product */
    s.costs=[]; s.hires=[]; s.fees=[]; s.funding=[]; s.distributions=[]; s.bonuses=[];
    s.salary=Object.assign({},s.salary,{base:0,steps:[]});
    s.settings=Object.assign({},s.settings,{openingCash:0,minCash:0});
  }
  const M=compute(s,view.scenario); addBonuses(s,M); blendActuals(s,M,asOfYm()); M.R=runwayInfo(s,M); M.s=s; M.sc=sc; return M;
};

/* the airlines the picker lists, with their on/off state */
function fcApRows14(F){
  const off=new Set(F.off), pd=state.products[0]&&state.products[0].id;
  const inScope=a=>{
    const r=regionOf(state,a.country);
    if(F.region&&(!r||r.id!==F.region)) return false;
    if(F.country&&a.country!==F.country) return false;
    if(F.product&&(a.product||pd)!==F.product) return false;
    return true;
  };
  return state.airlines.filter(inScope).map(a=>{
    const ok=a.status!=='Lost'&&(a.include!==false||F.prospects), r=regionOf(state,a.country);
    return {a,e:airlineEcon(state,a,0),ok,on:ok&&!off.has(a.id),reg:r?r.name:'Unassigned',cty:ctyKey14(a)};
  });
}
function fcPanel14(F){
  const rows=fcApRows14(F);
  const open=view.fcD14&&view.fcD14.ap!==undefined?!!view.fcD14.ap:!!(F.region||F.country);
  const okN=rows.filter(x=>x.ok).length, onN=rows.filter(x=>x.on).length;
  const sumOf=list=>list.reduce((t,x)=>{ if(x.on){ t.arr+=x.e.arr; t.impl+=x.e.impl; t.fleet+=num(x.a.fleet); t.pilots+=x.e.pilots; } return t; },{arr:0,impl:0,fleet:0,pilots:0});
  const chk=(act,v,list,label)=>{
    const ok=list.filter(x=>x.ok), on=ok.filter(x=>x.on).length;
    const all=ok.length>0&&on===ok.length, part=on>0&&on<ok.length;
    return '<label class="inline"><input type="checkbox" data-act="'+act+'" data-v="'+esc(v)+'"'+(all?' checked':'')+(part?' data-ind="1"':'')+(ok.length?'':' disabled')+' aria-label="'+esc(label)+'"> '+esc(label)+'</label>';
  };
  const regOrder=state.regions.map(r=>({name:r.name,color:cv(r.color),cs:r.countries.map(c=>c.name)}));
  if(rows.some(x=>x.reg==='Unassigned')) regOrder.push({name:'Unassigned',color:'var(--c-grey)',cs:[]});
  let body='';
  regOrder.forEach(rg=>{
    const inR=rows.filter(x=>x.reg===rg.name); if(!inR.length) return;
    const S=sumOf(inR), ctys=rg.cs.filter(c=>inR.some(x=>x.cty===c));
    inR.forEach(x=>{ if(!ctys.includes(x.cty)) ctys.push(x.cty); });
    body+='<tr class="rg" style="--rc:'+rg.color+'"><td>'+chk('fc-ap-region',rg.name,inR,rg.name)+'</td><td colspan="3"><span class="muted small">'+inR.filter(x=>x.on).length+' of '+inR.filter(x=>x.ok).length+' selected</span></td><td class="n">'+S.fleet+'</td><td class="n">'+S.pilots.toLocaleString()+'</td><td class="n">'+$(S.arr)+'</td><td class="n">'+$(S.impl)+'</td></tr>';
    ctys.forEach(cn=>{
      const inC=inR.filter(x=>x.cty===cn), C=sumOf(inC);
      body+='<tr class="cg" style="--rc:'+rg.color+'"><td>'+chk('fc-ap-country',cn,inC,cn)+'</td><td colspan="3"><span class="muted small">'+inC.filter(x=>x.on).length+' of '+inC.filter(x=>x.ok).length+' selected</span></td><td class="n">'+C.fleet+'</td><td class="n">'+C.pilots.toLocaleString()+'</td><td class="n">'+$(C.arr)+'</td><td class="n">'+$(C.impl)+'</td></tr>';
      inC.forEach(x=>{
        const a=x.a, why=a.status==='Lost'?'Lost deal':a.include===false?'Not in plan':'';
        body+='<tr class="ar'+(x.on?'':' off14')+'"><td><label class="inline"><input type="checkbox" data-act="fc-ap-airline" data-v="'+esc(a.id)+'"'+(x.on?' checked':'')+(x.ok?'':' disabled')+' aria-label="Include '+esc(a.name)+'"> '+esc(a.name)+'</label>'+(why?' <span class="why14">'+why+'</span>':'')+'</td>'+
          '<td><span class="chip st-'+esc(a.status)+'">'+esc(a.status)+'</span></td><td>'+esc(x.e.product.short||x.e.product.name)+'</td><td class="n">'+num(a.prob)+'%</td>'+
          '<td class="n">'+num(a.fleet)+'</td><td class="n">'+x.e.pilots.toLocaleString()+'</td><td class="n"><b>'+$(x.e.arr)+'</b></td><td class="n">'+$(x.e.impl)+'</td></tr>';
      });
    });
  });
  const T=sumOf(rows);
  return '<details class="panel mb fcap" data-d14="ap"'+(open?' open':'')+'><summary><h3>Airlines in this forecast</h3><span class="muted small">'+onN+' of '+okN+' selected'+(F.off.length?' · '+F.off.length+' unticked':'')+'</span></summary>'+
    '<div class="toolbar"><button class="btn small" data-act="fc-ap-all">Select all</button><button class="btn small" data-act="fc-ap-none">Select none</button><span class="muted small">Tick or untick an airline, a country or a whole region. The forecast recalculates with only the ticked airlines.</span></div>'+
    (rows.length?'<div class="tbl-wrap"><table class="fin fcap-t"><thead><tr><th>Region · country · airline</th><th>Status</th><th>Product</th><th class="n">Prob</th><th class="n">Fleet</th><th class="n">Pilots</th><th class="n">ARR yr 1</th><th class="n">Impl.</th></tr></thead><tbody>'+body+
      '<tr class="total"><td>Selected total</td><td colspan="3"></td><td class="n">'+T.fleet+'</td><td class="n">'+T.pilots.toLocaleString()+'</td><td class="n">'+$(T.arr)+'</td><td class="n">'+$(T.impl)+'</td></tr></tbody></table></div>':'<p class="muted">No airlines match these filters.</p>')+
    '<p class="hint">ARR yr 1 and Implementation are the first contract year before the weighting and timing of the chosen case. Lost deals are never included; airlines not ticked “In” on the Pipeline tab can be added with “Include prospects”.</p></details>';
}
function fcApIds14(F,kind,val){
  return fcApRows14(F).filter(x=>x.ok&&(kind==='all'||(kind==='region'&&x.reg===val)||(kind==='country'&&x.cty===val)||(kind==='airline'&&x.a.id===val))).map(x=>x.a.id);
}
function fcApSet14(ids,turnOn){
  const F=fcF(), off=new Set(F.off);
  ids.forEach(id=>{ if(turnOn) off.delete(id); else off.add(id); });
  F.off=Array.from(off); view.fcF=F; persistView(); render();
}

/* =====================================================================
   3) FORECAST TABLE: sections, show/hide rows and periods, manual overrides, totals, changes, CSV
   ===================================================================== */
const PT14_SECS=[['rev','Revenue'],['gp','Gross profit'],['cost','Operating costs'],['prof','Net profit'],['cash','Cash'],['arr','ARR and customers']];
let ptLast14=null;
function ptRows14(M){
  const R=[], regNames=Array.from(new Set(M.airlines.map(x=>x.region)));
  const add=(sec,id,label,o)=>R.push(Object.assign({sec,id,label,kind:'flow',cls:''},o||{}));
  state.products.forEach(p=>add('rev','p:'+p.id,(p.short||p.name)+' licenses',{edit:1,dot:cv(p.color),cls:'sub'}));
  add('rev','recurring','Recurring licenses',{cls:'strong'});
  add('rev','impl','Implementation fees',{edit:1});
  add('rev','revenue','Total revenue',{cls:'total',delta:1});
  add('gp','cogs','Cost of service',{cls:'sub'});
  add('gp','gp','Gross profit',{cls:'strong',delta:1});
  add('gp','gm','Gross margin',{kind:'pct',cls:'sub'});
  add('cost','tools','Tools and infrastructure',{edit:1});
  add('cost','sal','Founder salaries',{edit:1});
  add('cost','bon','Founder bonuses',{edit:1});
  add('cost','hires','Hires',{edit:1});
  add('cost','fees','Taxes and fees',{edit:1});
  add('cost','costs','Total costs',{cls:'total',delta:1});
  add('prof','net','Net profit',{cls:'total',delta:1});
  add('prof','nm','Net margin',{kind:'pct',cls:'sub'});
  add('prof','cum','Cumulative net profit',{kind:'stock',cls:'sub'});
  add('cash','cashIn','Cash collected',{cls:'sub'});
  add('cash','wht','Withholding tax held back',{cls:'sub'});
  add('cash','ocf','Operating cash flow',{cls:'sub'});
  add('cash','funding','Funding received',{cls:'sub'});
  add('cash','dist','Distributions, tax and loan repayments',{cls:'sub'});
  add('cash','cashB','Cash at period end (re-forecast)',{kind:'stock',cls:'strong'});
  add('arr','liveARR','ARR at period end',{kind:'stock',cls:'strong',delta:1});
  regNames.forEach(r=>add('arr','r:'+r,r+' ARR',{kind:'stock',cls:'sub',dot:regionColor(r)}));
  add('arr','live','Airlines live',{kind:'count'});
  add('arr','pilots','Pilots live',{kind:'count',cls:'sub'});
  return {rows:R,regNames};
}
/* adjusted figures for every period (manual overrides applied), keyed by period key */
function ptCalc14(M,all,keyFn,gran,ov,products,regNames){
  const bon={}; all.forEach(g=>{bon[g.key]=0;});
  M.months.forEach(m=>{ const k=keyFn(m.ym); if(k in bon) bon[k]+=(m.bonus||0); });
  const out={}; let cum=0;
  all.forEach(g=>{
    const b=bon[g.key]||0, v={}, d={rev:0,cost:0}, ovn={};
    const leaf=(id,base,kind)=>{
      const k=gran+'|'+id+'|'+g.key;
      const has=ov&&Object.prototype.hasOwnProperty.call(ov,k)&&isFinite(ov[k]);
      const x=has?ov[k]:base; v[id]=x; v['base:'+id]=base;
      if(has){ ovn[id]=true; if(kind==='rev') d.rev+=x-base; else d.cost+=x-base; }
    };
    products.forEach(p=>leaf('p:'+p.id,g.byProduct[p.id]||0,'rev'));
    leaf('impl',g.impl,'rev'); leaf('tools',g.tools,'cost'); leaf('sal',g.salaries-b,'cost'); leaf('bon',b,'cost'); leaf('hires',g.hires,'cost'); leaf('fees',g.fees,'cost');
    const dp=products.reduce((a,p)=>a+(v['p:'+p.id]-(g.byProduct[p.id]||0)),0);
    v.recurring=g.recurring+dp; v.revenue=g.revenue+d.rev; v.cogs=g.byType.cogs; v.gp=v.revenue-v.cogs; v.gm=v.revenue?v.gp/v.revenue*100:NaN;
    v.costs=g.costs+d.cost; v.net=g.net+d.rev-d.cost; v.nm=v.revenue?v.net/v.revenue*100:NaN; cum+=v.net; v.cum=cum;
    v.cashIn=g.cashIn; v.wht=g.wht; v.ocf=g.cashIn-g.costs; v.funding=g.funding; v.dist=g.dist+g.distTax+g.loanRepay; v.cashB=g.cashB;
    v.liveARR=g.liveARR; v.live=g.live; v.pilots=g.livePilotsEnd||0;
    regNames.forEach(r=>{ v['r:'+r]=(g.arrByRegion||{})[r]||0; });
    v.ovn=ovn; out[g.key]=v;
  });
  return out;
}
function ptFmt14(kind,v,unit){
  if(!isFinite(v)) return '–';
  if(kind==='pct') return pct(v);
  if(kind==='count') return fmtCount(v);
  return unit==='k'?$k(v):$(v);
}
const PT14_PRESETS={
  all:null,
  pl:['rev','gp','cost','prof'],
  cash:['cash','arr'],
  sum:['revenue','gp','costs','net','nm','cashB','liveARR','live']
};
function ptTable14(M,gran,yr,main){
  const keyFn=gran==='month'?(ym=>ym):gran==='year'?byYear:byQuarter, lab=G=>gran==='month'?MON[+G.key.slice(5,7)-1]+' '+G.key.slice(2,4):G.key;
  const all=aggregate(M.months,keyFn), years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4))));
  const shown=gran==='year'||yr==='all'?all:all.filter(g=>(gran==='month'?g.key.slice(0,4):g.key.slice(-4))===yr);
  const hideCols=new Set(main?(view.fcHideCols||[]):[]), hideRows=new Set(view.fcHideRows||[]), secCol=view.fcSec||{};
  const vis=shown.filter(g=>!hideCols.has(g.key));
  const {rows,regNames}=ptRows14(M), unit=view.fcUnit==='k'?'k':'full', showTot=view.fcNoTotal!==true, edit=!!view.fcEdit, delta=!!view.fcDelta;
  const ov=view.fcOv||{}, calc=ptCalc14(M,all,keyFn,gran,ov,state.products,regNames);
  const prevOf={}; all.forEach((g,i)=>{ prevOf[g.key]=i>0?all[i-1].key:null; });
  const full=gran==='month'?1:gran==='quarter'?3:12;
  const ovCount=Object.keys(ov).filter(k=>k.indexOf(gran+'|')===0).length;
  const rowVisible=r=>!hideRows.has(r.id);
  /* totals over the visible periods */
  const tot={}; 
  rows.forEach(r=>{
    if(r.kind==='flow') tot[r.id]=vis.reduce((a,g)=>a+calc[g.key][r.id],0);
    else tot[r.id]=vis.length?calc[vis[vis.length-1].key][r.id]:NaN;
  });
  if(vis.length){ const rv=tot.revenue; tot.gm=rv?tot.gp/rv*100:NaN; tot.nm=rv?tot.net/rv*100:NaN; }
  const title=gran==='month'?'Monthly'+(yr==='all'?'':', '+yr):gran==='quarter'?'Quarterly'+(yr==='all'?'':', '+yr):'Annual';
  const nCols=vis.length+1+(showTot?1:0);
  let body='';
  PT14_SECS.forEach(([sid,sname])=>{
    const rs=rows.filter(r=>r.sec===sid&&rowVisible(r)); if(!rs.length) return;
    const col=!!secCol[sid];
    body+='<tr class="sec14"><td class="lbl14"><button class="sectoggle" data-act="fc-sec" data-v="'+sid+'" aria-expanded="'+!col+'"><span>'+(col?'▸':'▾')+'</span>'+esc(sname)+'</button></td><td colspan="'+(nCols-1)+'"></td></tr>';
    if(col) return;
    rs.forEach(r=>{
      let cells='';
      vis.forEach(g=>{
        const v=calc[g.key][r.id], isOv=!!(calc[g.key].ovn&&calc[g.key].ovn[r.id]);
        if(edit&&r.edit){
          const bv=calc[g.key]['base:'+r.id];
          cells+='<td class="n'+(isOv?' ovon':'')+'"><input class="in num ov14" type="number" step="any" inputmode="decimal" data-fcov="'+esc(r.id)+'" data-key="'+esc(g.key)+'" data-gran="'+gran+'" data-base="'+bv+'" value="'+(Math.round(cvt(v)*100)/100)+'" aria-label="'+esc(r.label+' '+lab(g))+'">'+(isOv?'<button class="ovx" data-act="fc-ov-clear" data-id="'+esc(r.id)+'" data-key="'+esc(g.key)+'" data-gran="'+gran+'" title="Back to the model value" aria-label="Reset to model value">↺</button>':'')+'</td>';
        } else {
          let dl='';
          if(delta&&r.delta&&prevOf[g.key]){
            const pv=calc[prevOf[g.key]][r.id];
            if(isFinite(pv)&&Math.abs(pv)>0.5&&isFinite(v)){ const ch=(v-pv)/Math.abs(pv)*100; dl='<span class="dl14 '+(ch>=0.05?'up':ch<=-0.05?'dn':'')+'">'+(ch>=0?'▲ ':'▼ ')+Math.abs(Math.round(ch*10)/10)+'%</span>'; }
          }
          cells+='<td class="n'+(r.kind!=='pct'&&r.kind!=='count'&&v<0?' neg':'')+(isOv?' ovon':'')+'"'+(isOv?' title="Manual figure. Model value: '+esc($(calc[g.key]['base:'+r.id]))+'"':'')+'>'+ptFmt14(r.kind,v,unit)+dl+'</td>';
        }
      });
      if(showTot){ const t=tot[r.id]; cells+='<td class="n tot14'+(r.kind!=='pct'&&r.kind!=='count'&&t<0?' neg':'')+'">'+(vis.length?ptFmt14(r.kind,t,unit):'–')+'</td>'; }
      body+='<tr class="r14 '+r.cls+'"><td class="lbl14"><span class="lb14">'+(r.dot?'<i class="dot" style="background:'+r.dot+'"></i>':'')+esc(r.label)+(r.edit&&edit?' <span class="muted small">✎</span>':'')+'</span></td>'+cells+'</tr>';
    });
  });
  const thead='<thead><tr><th>Line</th>'+vis.map(g=>'<th class="n">'+esc(lab(g))+(g.months<full?' <span class="nt">('+g.months+' mo)</span>':'')+'</th>').join('')+(showTot?'<th class="n tot14">'+(vis.length?'Total / end':'Total')+'</th>':'')+'</tr></thead>';
  /* controls */
  let ctl='';
  if(main){
    const preset=(view.fcPreset||'all');
    ctl+='<div class="pt14-bar">'+
      '<button class="btn small" data-act="fc-edit" aria-pressed="'+edit+'" title="Type your own figures into the highlighted rows">'+(edit?'Editing figures':'Edit figures')+'</button>'+
      '<select class="in w-m" data-act="fc-preset" aria-label="Rows to show">'+[['all','All rows'],['pl','Profit and loss'],['cash','Cash and ARR'],['sum','Key lines only'],...(preset==='custom'?[['custom','Custom selection']]:[])].map(([k,l])=>'<option value="'+k+'"'+(preset===k?' selected':'')+'>'+l+'</option>').join('')+'</select>'+
      '<button class="btn small" data-act="fc-delta" aria-pressed="'+delta+'">Show change vs previous</button>'+
      '<button class="btn small" data-act="fc-total" aria-pressed="'+showTot+'">Total column</button>'+
      '<div class="seg light" role="group" aria-label="Units"><button data-act="fc-unit" data-v="full" aria-pressed="'+(unit==='full')+'">Full</button><button data-act="fc-unit" data-v="k" aria-pressed="'+(unit==='k')+'">Short (K/M)</button></div>'+
      '<button class="btn small" data-act="fc-secs" data-v="collapse">Collapse all</button><button class="btn small" data-act="fc-secs" data-v="expand">Expand all</button>'+
      '<span class="sp"></span>'+
      (ovCount?'<button class="btn small cta-outline" data-act="fc-ov-reset" data-gran="'+gran+'">Reset '+ovCount+' manual figure'+(ovCount===1?'':'s')+'</button>':'')+
      '<button class="btn small" data-act="fc-tcsv">Export CSV</button></div>';
    const dOpen=n=>view.fcD14&&view.fcD14[n]?' open':'';
    ctl+='<div class="pt14-opts"><details data-d14="rows"'+dOpen('rows')+'><summary>Rows ('+rows.filter(rowVisible).length+' of '+rows.length+')</summary><div class="chkgrid14">'+
      PT14_SECS.map(([sid,sname])=>'<h4>'+esc(sname)+'</h4>'+rows.filter(r=>r.sec===sid).map(r=>'<label class="chk14"><input type="checkbox" data-act="fc-row-vis" data-v="'+esc(r.id)+'"'+(rowVisible(r)?' checked':'')+'> '+esc(r.label)+'</label>').join('')).join('')+'</div></details>'+
      '<details data-d14="cols"'+dOpen('cols')+'><summary>Periods ('+vis.length+' of '+shown.length+')</summary><div class="toolbar" style="margin-top:8px"><button class="btn small" data-act="fc-cols" data-v="all">All</button><button class="btn small" data-act="fc-cols" data-v="none">None</button></div><div class="chkgrid14">'+
      shown.map(g=>'<label class="chk14"><input type="checkbox" data-act="fc-col-vis" data-v="'+esc(g.key)+'"'+(hideCols.has(g.key)?'':' checked')+'> '+esc(lab(g))+'</label>').join('')+'</div></details></div>';
  }
  const note=main?'<p class="pt14-note muted small">'+(edit?'<b>Editing:</b> type over any highlighted figure. Subtotals, margins and cumulative profit recalculate; cash and ARR stay as the model has them. ':'')+'Manual figures are a what-if on this screen only (kept in this browser, never written to the plan). “Total / end” adds flows over the shown periods and takes the last period for balances such as cash and ARR.</p>':'';
  if(main) ptLast14={title,vis:vis.map(g=>({key:g.key,label:lab(g)})),rows:rows.filter(rowVisible).map(r=>({id:r.id,label:r.label,kind:r.kind})),calc,tot,showTot};
  return '<div class="panel flush mb"><div class="panel-head pad"><h3>'+title+'</h3><span class="muted small">'+(view.scenario==='plan'?'Plan case':'Weighted case')+' · '+esc(curScen().name)+(ovCount?' · '+ovCount+' manual figure'+(ovCount===1?'':'s'):'')+'</span></div>'+ctl+
    (vis.length?'<div class="tbl-wrap inner"><table class="fin pt14">'+thead+'<tbody>'+body+'</tbody></table></div>':'<p class="muted pt14-note">No periods selected. Open “Periods” above and tick at least one.</p>')+note+'</div>';
}
function ptSection14(M){
  const gran=view.fcGran||'quarter', yr=view.fcYear||'all';
  return ptTable14(M,gran,yr,true)+(gran!=='year'?ptTable14(M,'year','all',false):'');
}
function ptCsv14(){
  const L=ptLast14; if(!L){ return; }
  const q=s=>'"'+String(s).replace(/"/g,'""')+'"', cell=(r,v)=>r.kind==='pct'||r.kind==='count'?(isFinite(v)?Math.round(v*100)/100:''):(isFinite(v)?Math.round(cvt(v)*100)/100:'');
  const lines=[[q('Line ('+MAINC()+')'),...L.vis.map(c=>q(c.label)),...(L.showTot?[q('Total / end')]:[])].join(',')];
  L.rows.forEach(r=>lines.push([q(r.label),...L.vis.map(c=>cell(r,L.calc[c.key][r.id])),...(L.showTot?[cell(r,L.tot[r.id])]:[])].join(',')));
  const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}), a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='stratos-forecast-'+L.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.csv';
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500);
}

/* ---------- the forecast page: filter bar + airline picker + new tables ---------- */
forecast=function(M){
  const F=fcF(), active=fcActive14(F), partial=fcPartial14(F);
  const Mx=active?fcFiltered(F):M;
  let h=fcFilterBase(Mx);
  const cut=/<div class="panel flush mb"><div class="panel-head pad"><h3>(Monthly|Quarterly|Annual)/.exec(h);
  if(cut) h=h.slice(0,cut.index);
  const reg=state.regions.find(r=>r.id===F.region);
  const ctys=reg?reg.countries.map(c=>c.name):Array.from(new Set(state.airlines.filter(a=>F.prospects||a.include!==false).map(a=>a.country).filter(Boolean))).sort();
  const years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4)))), yr=view.fcYear||'all';
  const sel=(act,opts,v,lab)=>'<div class="field"><label>'+lab+'</label><select class="in" data-act="'+act+'" aria-label="'+lab+'">'+opts.map(([k,l])=>'<option value="'+esc(k)+'"'+(String(v)===String(k)?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div>';
  const n=Mx.airlines.length;
  const bar='<div class="panel mb"><div class="panel-head"><h3>Filter the forecast</h3>'+(active||yr!=='all'?'<button class="btn small" data-act="fc-f-reset">Clear filters</button>':'')+'</div><div class="fields" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))">'+
    sel('fc-f-region',[['','All regions'],...state.regions.map(r=>[r.id,r.name])],F.region,'Region')+
    sel('fc-f-country',[['',reg?'All of '+reg.name:'All countries'],...ctys.map(c=>[c,c])],F.country,'Country')+
    sel('fc-f-product',[['','All products'],...state.products.map(p=>[p.id,p.short||p.name])],F.product,'Product')+
    sel('fc-year',[['all','All years'],...years.map(y=>[y,y])],yr,'Year')+
    '<div class="field"><label>Airlines</label><label class="inline"><input type="checkbox" data-act="fc-f-prospects"'+(F.prospects?' checked':'')+'> Include prospects</label></div>'+
    '</div>'+(active?'<p class="hint"><b>'+n+' airline'+(n===1?'':'s')+'</b> in this forecast'+(F.prospects?', prospects included as if won'+(fcUndated?' ('+fcUndated+' without dates assumed to sign in '+ymLabel(ymFromIndex(monthIndex(asOfYm())+6))+' and go live a month later)':''):'')+'. '+
      (partial?'Revenue, ARR and cash collected are for these airlines only; company costs, salaries, bonuses and funding are left out because they are not split by country or product.':'Company costs, salaries, hires and funding are kept as planned, so profit and cash show the effect of dropping or adding these airlines.')+'</p>':
      '<p class="hint">Showing the whole company. Pick a region, country or product, or untick airlines in the list below, to recompute the forecast for just those airlines. The year picks the period shown in the monthly and quarterly tables.</p>')+'</div>';
  const panel=fcPanel14(F);
  const k=h.indexOf('<div class="kpis">');
  h=k>=0?h.slice(0,k)+bar+panel+h.slice(k):bar+panel+h;
  return h+ptSection14(Mx);
};

/* ---------- events ---------- */
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.d14){ view.fcD14=Object.assign({},view.fcD14||{}); view.fcD14[d.dataset.d14]=d.open; persistView(); } },true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.tagName==='SELECT'||b.tagName==='INPUT') return;
  const a=b.dataset.act; if(!a||a.indexOf('fc-')!==0) return;
  const F=fcF();
  if(a==='fc-ap-all'){ fcApSet14(fcApIds14(F,'all'),true); return; }
  if(a==='fc-ap-none'){ fcApSet14(fcApIds14(F,'all'),false); return; }
  if(a==='fc-edit'){ view.fcEdit=!view.fcEdit; persistView(); render(); return; }
  if(a==='fc-delta'){ view.fcDelta=!view.fcDelta; persistView(); render(); return; }
  if(a==='fc-total'){ view.fcNoTotal=view.fcNoTotal!==true; persistView(); render(); return; }
  if(a==='fc-unit'){ view.fcUnit=b.dataset.v==='k'?'k':'full'; persistView(); render(); return; }
  if(a==='fc-sec'){ view.fcSec=Object.assign({},view.fcSec||{}); view.fcSec[b.dataset.v]=!view.fcSec[b.dataset.v]; persistView(); render(); return; }
  if(a==='fc-secs'){ const o={}; if(b.dataset.v==='collapse') PT14_SECS.forEach(([s])=>{o[s]=true;}); view.fcSec=o; persistView(); render(); return; }
  if(a==='fc-cols'){
    const shown=ptLast14?ptLast14.vis.map(c=>c.key):[]; const hid=new Set(view.fcHideCols||[]);
    /* "All"/"None" act on the periods currently listed (the hidden ones are not in ptLast14.vis, so list from the checkboxes) */
    const keys=Array.from(document.querySelectorAll('input[data-act="fc-col-vis"]')).map(i=>i.dataset.v);
    keys.forEach(k=>{ if(b.dataset.v==='all') hid.delete(k); else hid.add(k); });
    view.fcHideCols=Array.from(hid); persistView(); render(); return;
  }
  if(a==='fc-ov-reset'){ const g=b.dataset.gran, ov=Object.assign({},view.fcOv||{}); Object.keys(ov).forEach(k=>{ if(k.indexOf(g+'|')===0) delete ov[k]; }); view.fcOv=ov; persistView(); render(); return; }
  if(a==='fc-ov-clear'){ const ov=Object.assign({},view.fcOv||{}); delete ov[b.dataset.gran+'|'+b.dataset.id+'|'+b.dataset.key]; view.fcOv=ov; persistView(); render(); return; }
  if(a==='fc-tcsv'){ ptCsv14(); return; }
});
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return;
  if(el.dataset.fcov!==undefined&&el.tagName==='INPUT'){
    const k=el.dataset.gran+'|'+el.dataset.fcov+'|'+el.dataset.key, ov=Object.assign({},view.fcOv||{}), raw=el.value.trim();
    if(raw==='') delete ov[k];
    else { const x=parseFloat(raw); if(isFinite(x)){ const iv=x*DR(); if(Math.abs(iv-num(el.dataset.base))<0.5) delete ov[k]; else ov[k]=iv; } }
    view.fcOv=ov; persistView(); render(); return;
  }
  const a=el.dataset.act; if(!a||a.indexOf('fc-')!==0) return;
  const F=fcF();
  if(a==='fc-ap-airline'||a==='fc-ap-country'||a==='fc-ap-region'){
    const kind=a.slice(6), ids=fcApIds14(F,kind==='airline'?'airline':kind,el.dataset.v);
    fcApSet14(ids,el.checked); return;
  }
  if(a==='fc-row-vis'){ const hid=new Set(view.fcHideRows||[]); if(el.checked) hid.delete(el.dataset.v); else hid.add(el.dataset.v); view.fcHideRows=Array.from(hid); view.fcPreset='custom'; persistView(); render(); return; }
  if(a==='fc-col-vis'){ const hid=new Set(view.fcHideCols||[]); if(el.checked) hid.delete(el.dataset.v); else hid.add(el.dataset.v); view.fcHideCols=Array.from(hid); persistView(); render(); return; }
  if(a==='fc-preset'&&el.tagName==='SELECT'){
    const p=el.value, keep=PT14_PRESETS[p];
    if(!keep){ view.fcHideRows=[]; }
    else {
      const rows=ptRows14({airlines:state.airlines.map(a=>({region:(regionOf(state,a.country)||{name:'Unassigned'}).name}))}).rows;
      view.fcHideRows=rows.filter(r=>!(keep.includes(r.sec)||keep.includes(r.id))).map(r=>r.id);
    }
    view.fcPreset=p; persistView(); render();
  }
});

/* "some of the group is ticked" needs a script-set flag */
const render14Base=render;
render=function(){
  const r=render14Base.apply(this,arguments);
  try{ document.querySelectorAll('input[data-ind="1"]').forEach(i=>{ i.indeterminate=true; }); }catch(e){}
  return r;
};
