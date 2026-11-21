/* ===== v31: Yearly plan — add conferences, events and other spend per year (saved with the plan, flows into every
   forecast, cash and tab) · the Annual table is editable and its edits are saved and real · every cost line, hire,
   fee and plan item is shown inside the forecast tables (the separate "All costs" panel is folded in). ===== */
const YP_CATS31=[['Conferences & events','sm'],['Marketing','sm'],['Travel','ga'],['Training','ga'],['Legal & admin','ga'],['Other','ga']];
const ypType31=c=>{ const x=YP_CATS31.find(z=>z[0]===c); return x?x[1]:'ga'; };
function ypState31(){ if(!state.yearPlan||typeof state.yearPlan!=='object') state.yearPlan={}; const Y=state.yearPlan; if(!Array.isArray(Y.items)) Y.items=[]; if(!Y.ov||typeof Y.ov!=='object') Y.ov={}; return Y; }
const ypItems31=()=>((state.yearPlan&&state.yearPlan.items)||[]).filter(Boolean);
const ypLocked31=()=>readOnly||cfgLocked;

/* ---------- 1) calculation: plan lines become dated costs; saved annual edits adjust the model ---------- */
function ypCosts31(s,items){
  const S=s.settings||{}, st=monthIndex(S.startMonth||'2026-10'), en=monthIndex(S.endMonth||'2030-12'), MC=S.mainCurrency||'USD', out=[];
  items.forEach(x=>{
    Object.keys(x.amounts||{}).forEach(Y=>{
      const a=num(x.amounts[Y]); if(!a||!/^\d{4}$/.test(Y)) return;
      const base={id:'yp:'+x.id+':'+Y,name:x.name||'Plan item',category:x.cat||'Other',type:ypType31(x.cat),basis:'fixed',growth:0,qty:1,currency:MC};
      if(/^\d\d$/.test(x.when||'')){ const m=monthIndex(Y+'-'+x.when); if(m<st||m>en) return; out.push(Object.assign(base,{freq:'once',amount:a,startMonth:Y+'-'+x.when,endMonth:''})); }
      else { const a0=Math.max(monthIndex(Y+'-01'),st), a1=Math.min(monthIndex(Y+'-12'),en), n=a1-a0+1; if(n<=0) return; out.push(Object.assign(base,{freq:'monthly',amount:a/n,startMonth:ymFromIndex(a0),endMonth:ymFromIndex(a1)})); }
    });
  });
  return out;
}
function ypAdjust31(s,M,ov){
  const yrs={}; M.months.forEach((m,i)=>{ const y=m.ym.slice(0,4); (yrs[y]=yrs[y]||[]).push(i); });
  const inc=L=>(L||[]).filter(a=>a&&a.include!==false&&a.status!=='Lost').length;
  const fullRev=inc(s.airlines)===inc(state.airlines);
  const keys=Object.keys(ov).map(k=>{ const p=k.split('|'); return {k,id:p[1],y:p[2],v:num(ov[k])}; }).filter(o=>o.id&&yrs[o.y]&&isFinite(o.v));
  const rank=id=>/^(ci|hi|fi):/.test(id)?0:/^(tools|hires|fees|sal)$/.test(id)?1:2;
  keys.sort((a,b)=>rank(a.id)-rank(b.id));
  const cd=new Array(M.months.length).fill(0); M.ypBase=M.ypBase||{};
  const sum=(I,f)=>I.reduce((t,i)=>t+num(f(M.months[i])),0);
  const planOf=m=>Object.keys(m.costItems||{}).reduce((t,c)=>t+(c.indexOf('yp:')===0?num(m.costItems[c]):0),0);
  keys.forEach(o=>{
    const I=yrs[o.y], id=o.id; let base, cost=true, apply;
    const bump=(m,obj,key,dm)=>{ m[obj]=m[obj]||{}; m[obj][key]=num(m[obj][key])+dm; };
    if(id.indexOf('ci:')===0){ const c=id.slice(3); base=sum(I,m=>(m.costItems||{})[c]); apply=(m,dm)=>{ bump(m,'costItems',c,dm); m.tools+=dm; }; }
    else if(id.indexOf('hi:')===0){ const c=id.slice(3); base=sum(I,m=>(m.hireItems||{})[c]); apply=(m,dm)=>{ bump(m,'hireItems',c,dm); m.hires+=dm; }; }
    else if(id.indexOf('fi:')===0){ const c=id.slice(3); base=sum(I,m=>(m.feeItems||{})[c]); apply=(m,dm)=>{ bump(m,'feeItems',c,dm); m.fees+=dm; }; }
    else if(id==='tools'){ base=sum(I,m=>m.tools)-sum(I,planOf); apply=(m,dm)=>{ bump(m,'costItems','adj:tools',dm); m.tools+=dm; }; }
    else if(id==='hires'){ base=sum(I,m=>m.hires); apply=(m,dm)=>{ bump(m,'hireItems','adj:hires',dm); m.hires+=dm; }; }
    else if(id==='fees'){ base=sum(I,m=>m.fees); apply=(m,dm)=>{ bump(m,'feeItems','adj:fees',dm); m.fees+=dm; }; }
    else if(id==='sal'){ base=sum(I,m=>m.salaries); apply=(m,dm)=>{ m.salaries+=dm; }; }
    else if(id==='impl'&&fullRev){ cost=false; base=sum(I,m=>m.impl); apply=(m,dm)=>{ m.impl+=dm; }; }
    else if(id.indexOf('p:')===0&&fullRev){ cost=false; const p=id.slice(2); base=sum(I,m=>(m.byProduct||{})[p]); apply=(m,dm)=>{ bump(m,'byProduct',p,dm); m.recurring+=dm; }; }
    else return;
    M.ypBase[id+'|'+o.y]=base;
    const dm=(o.v-base)/I.length; if(Math.abs(dm)<1e-9) return;
    I.forEach(i=>{ const m=M.months[i]; apply(m,dm);
      if(cost){ m.costs+=dm; m.net-=dm; if(m.byType) m.byType.ga=num(m.byType.ga)+dm; if('cashOut' in m) m.cashOut+=dm; cd[i]-=dm; }
      else { m.revenue+=dm; m.net+=dm; m.billed=num(m.billed)+dm; m.cashIn+=dm; cd[i]+=dm; } });
  });
  let run=0; M.months.forEach((m,i)=>{ run+=cd[i]; if(run){ m.cash=num(m.cash)+run; if('cashB' in m) m.cashB=num(m.cashB)+run; } });
}
const computeBase31=compute;
compute=function(s,scenario){
  const YP=(s&&s.yearPlan)||{}, items=(YP.items||[]).filter(x=>x&&x.on!==false), ov=YP.ov||{};
  const zeroed=s&&Array.isArray(s.costs)&&!s.costs.length&&s.salary&&!num(s.salary.base)&&!((s.salary.steps||[]).length);
  if(zeroed||(!items.length&&!Object.keys(ov).length)) return computeBase31(s,scenario);
  const s2=items.length?Object.assign({},s,{costs:(s.costs||[]).concat(ypCosts31(s,items))}):s;
  const M=computeBase31(s2,scenario);
  if(Object.keys(ov).length) ypAdjust31(s,M,ov);
  return M;
};

/* ---------- 2) forecast tables: every cost line inside; annual table editable and saved ---------- */
let ypGran31='quarter';
const fcPartial31=()=>{ const F=fcF(), fl=fleet22('fc'); return !!((F.regions||[]).length||(F.countries||[]).length||F.product||fl.on); };
const ptRowsBase31=ptRows14;
ptRows14=function(M){
  const r=ptRowsBase31(M), det=view.fcDet!==false, ed=ypGran31==='year'?1:0, out=[];
  const D=(id,label,edit)=>({sec:'cost',id,label,kind:'flow',cls:'sub det',edit:edit?1:0});
  r.rows.forEach(row=>{
    if(row.id==='bon'&&ypGran31==='year') row=Object.assign({},row,{edit:0});
    out.push(row);
    if(row.id==='tools'){
      if(det) (state.costs||[]).forEach(c=>out.push(D('ci:'+c.id,c.name||'Cost',ed)));
      out.push({sec:'cost',id:'ypt',label:'Yearly plan items',kind:'flow',cls:'sub'});
      if(det) ypItems31().filter(x=>x.on!==false).forEach(x=>out.push(D('yp:'+x.id,(x.name||'Plan item')+' · '+(x.cat||'Other'),0)));
    }
    if(row.id==='hires'&&det) (state.hires||[]).forEach(h=>out.push(D('hi:'+h.id,h.role||'Hire',ed)));
    if(row.id==='fees'&&det) (state.fees||[]).forEach(f=>out.push(D('fi:'+f.id,f.name||'Fee',ed)));
  });
  r.rows=out; return r;
};
const ptCalcBase31=ptCalc14;
ptCalc14=function(M,all,keyFn,gran,ov,products,regNames){
  const out=ptCalcBase31(M,all,keyFn,gran,ov,products,regNames);
  const idx={}; M.months.forEach((m,i)=>{ const k=keyFn(m.ym); (idx[k]=idx[k]||[]).push(i); });
  const S=(k,f)=>(idx[k]||[]).reduce((t,i)=>t+num(f(M.months[i])),0);
  const pre=(m,p)=>Object.keys(m.costItems||{}).reduce((t,c)=>t+(c.indexOf(p)===0?num(m.costItems[c]):0),0);
  const has=(id,k)=>!!ov&&Object.prototype.hasOwnProperty.call(ov,gran+'|'+id+'|'+k);
  let cum=0;
  all.forEach(g=>{
    const v=out[g.key]; if(!v) return; v.ovn=v.ovn||{};
    const plan=S(g.key,m=>pre(m,'yp:'));
    (state.costs||[]).forEach(c=>{ v['ci:'+c.id]=S(g.key,m=>(m.costItems||{})[c.id]); });
    ypItems31().forEach(x=>{ v['yp:'+x.id]=S(g.key,m=>pre(m,'yp:'+x.id+':')); });
    (state.hires||[]).forEach(h=>{ v['hi:'+h.id]=S(g.key,m=>(m.hireItems||{})[h.id]); });
    (state.fees||[]).forEach(f=>{ v['fi:'+f.id]=S(g.key,m=>(m.feeItems||{})[f.id]); });
    v.ypt=plan;
    if(!v.ovn.tools) v.tools-=plan;
    v['base:tools']=num(v['base:tools'])-plan;
    if(gran==='year'){
      const B=M.ypBase||{};
      Object.keys(v).forEach(k=>{ if(k.indexOf('base:')===0||k==='ovn') return; if(B[k+'|'+g.key]!==undefined){ v['base:'+k]=B[k+'|'+g.key]; } if(has(k,g.key)) v.ovn[k]=true; });
      ['ci:','hi:','fi:'].forEach(p=>Object.keys(v).forEach(k=>{ if(k.indexOf(p)===0&&v['base:'+k]===undefined) v['base:'+k]=v[k]; }));
      v.recurring=g.recurring; v.revenue=g.revenue; v.costs=g.costs; v.net=g.net; v.gp=v.revenue-v.cogs;
      v.gm=v.revenue?v.gp/v.revenue*100:NaN; v.nm=v.revenue?v.net/v.revenue*100:NaN; cum+=v.net; v.cum=cum;
    } else {
      ['ci:','hi:','fi:'].forEach(p=>Object.keys(v).forEach(k=>{ if(k.indexOf(p)===0) v['base:'+k]=v[k]; }));
    }
  });
  return out;
};
const ptTableBase31=ptTable14;
ptTable14=function(M,gran,yr,main){
  if(gran!=='year'){ ypGran31=gran; try{ return ptTableBase31(M,gran,yr,main); } finally{ ypGran31='quarter'; } }
  const partial=fcPartial31(), keepOv=view.fcOv, keepEd=view.fcEdit, yov=(state.yearPlan&&state.yearPlan.ov)||{}, o={};
  Object.keys(keepOv||{}).forEach(k=>{ if(k.indexOf('year|')!==0) o[k]=keepOv[k]; });
  if(!partial) Object.assign(o,yov);
  const ed=!partial&&!!view.ypEdit&&!ypLocked31();
  view.fcOv=o; view.fcEdit=ed; ypGran31='year';
  let h; try{ h=ptTableBase31(M,gran,yr,main); } finally{ view.fcOv=keepOv; view.fcEdit=keepEd; ypGran31='quarter'; }
  const n=Object.keys(yov).length;
  const bar=partial?'<span class="muted small">A region, country, product or fleet filter is on. Clear it to edit the annual plan; the figures below are for this selection.</span>':
    (ypLocked31()?'<span class="muted small">View only for your account.</span>':'<button class="btn small" data-act="yp-edit" aria-pressed="'+ed+'">'+(ed?'Done editing':'Edit annual figures')+'</button>'+(n?'<button class="btn small cta-outline" data-act="yp-ov-reset">Undo '+n+' annual edit'+(n===1?'':'s')+'</button>':''))+
    '<span class="sp"></span><span class="muted small">Annual edits are part of the plan: press Save to keep them. They change profit, cash and every tab.</span>';
  if(main) h=h.replace(/<button class="btn small" data-act="fc-edit"[^>]*>[^<]*<\/button>/,bar.replace('<span class="sp"></span>','')).replace(/<button class="btn small cta-outline" data-act="fc-ov-reset"[^>]*>[^<]*<\/button>/,'');
  else h=h.replace('<div class="tbl-wrap inner">','<div class="pt14-bar">'+bar+'</div><div class="tbl-wrap inner">');
  h=h.replace(/<h3>Annual<\/h3>/,'<h3>Annual plan</h3>');
  const note='<p class="pt14-note muted small">'+(ed?'<b>Editing:</b> type over a highlighted figure to set your plan for that year. ':'')+'An edited cost is spread evenly over the months of that year; edited revenue is counted as collected in the same months. ↺ puts a figure back to the forecast. Add conferences, events and other spend in the Yearly plan above.</p>';
  if(main) h=h.replace(/<p class="pt14-note muted small">[\s\S]*?<\/p>/,note); else h=h.replace(/<\/table><\/div><\/div>$/,'</table></div>'+note+'</div>');
  return h;
};
/* the per-line costs panel from v30 now lives inside the tables */
costTable30=function(){ return ''; };

/* ---------- 3) Yearly plan panel ---------- */
function ypPanel31(M){
  const Y=(state.yearPlan&&state.yearPlan.items)||[], years=Array.from(new Set(M.months.map(m=>m.ym.slice(0,4))));
  const cat=view.ypCat||'', lock=ypLocked31(), ys=aggregate(M.months,byYear);
  const planY={}; years.forEach(y=>planY[y]=0);
  M.months.forEach(m=>{ const y=m.ym.slice(0,4); Object.keys(m.costItems||{}).forEach(c=>{ if(c.indexOf('yp:')===0) planY[y]+=num(m.costItems[c]); }); });
  const whenOpts=[{v:'',l:'Spread over the year'}].concat(MON.map((mn,i)=>({v:String(i+1).padStart(2,'0'),l:'All in '+mn})));
  const rows=Y.map((x,i)=>({x,i})).filter(o=>o.x&&(!cat||(o.x.cat||'Other')===cat));
  const cnt={}; Y.forEach(x=>{ if(x){ const c=x.cat||'Other'; cnt[c]=(cnt[c]||0)+1; } });
  let h='<div class="panel mb yp31"><div class="panel-head"><h3>Yearly plan</h3><span class="muted small">Add conferences, events, travel or any other spend for each year. It is saved with the plan and flows into the forecast, cash and every tab.</span></div>';
  h+='<div class="yp31-bar">'+(lock?'':YP_CATS31.map(([c])=>'<button class="btn small" data-act="yp-add" data-v="'+esc(c)+'">+ '+esc(c)+'</button>').join(''))+'</div>';
  h+='<div class="yp31-bar"><span class="muted small">Show</span>'+[['','All lines ('+Y.filter(Boolean).length+')']].concat(YP_CATS31.filter(([c])=>cnt[c]).map(([c])=>[c,c+' ('+cnt[c]+')'])).map(([v,l])=>'<button class="chip19" data-act="yp-cat" data-v="'+esc(v)+'" aria-pressed="'+(cat===v)+'">'+esc(l)+'</button>').join('')+'</div>';
  h+='<div class="tbl-wrap"><table class="fin yp31t"><thead><tr><th>In</th><th>Line</th><th>Category</th><th>When</th>'+years.map(y=>'<th class="n">'+y+'</th>').join('')+'<th class="n">Total</th><th></th></tr></thead><tbody>';
  if(!rows.length) h+='<tr><td colspan="'+(years.length+6)+'" class="muted">'+(Y.length?'No lines in this category.':'No plan lines yet. Use the buttons above to add a conference, event or any other cost, then type the amount for each year.')+'</td></tr>';
  rows.forEach(({x,i})=>{
    const p='yearPlan.items.'+i, tot=years.reduce((t,y)=>t+num((x.amounts||{})[y]),0);
    h+='<tr class="'+(x.on===false?'off':'')+'"><td>'+inp(p+'.on',{type:'checkbox',label:'Include'})+'</td><td>'+inp(p+'.name',{w:'w-l',label:'Line name'})+'</td><td>'+inp(p+'.cat',{type:'select',options:YP_CATS31.map(([c])=>({v:c,l:c})),w:'w-m',label:'Category'})+'</td><td>'+inp(p+'.when',{type:'select',options:whenOpts,w:'w-m',label:'When'})+'</td>'+
      years.map(y=>'<td class="n">'+inp(p+'.amounts.'+y,{num:1,blank:1,ph:'0',w:'w-s',label:(x.name||'Line')+' '+y})+'</td>').join('')+'<td class="n"><b>'+$(tot)+'</b></td><td>'+(lock?'':'<button class="btn icon" data-act="yp-del" data-i="'+i+'" aria-label="Remove line">✕</button>')+'</td></tr>';
  });
  const r=(l,f,cls)=>'<tr class="'+(cls||'')+'"><td colspan="4">'+l+'</td>'+ys.map(g=>{ const v=f(g); return '<td class="n'+(v<0?' neg':'')+'">'+$(v)+'</td>'; }).join('')+'<td class="n"><b>'+$(ys.reduce((t,g)=>t+f(g),0))+'</b></td><td></td></tr>';
  h+='<tr class="total"><td colspan="4">Yearly plan lines</td>'+ys.map(g=>'<td class="n">'+$(planY[g.key]||0)+'</td>').join('')+'<td class="n"><b>'+$(Object.values(planY).reduce((t,v)=>t+v,0))+'</b></td><td></td></tr>';
  h+='<tr class="yp31-h"><td colspan="'+(years.length+6)+'">The whole plan by year (whole company, with every edit)</td></tr>'+
    r('Revenue',g=>g.revenue,'strong')+r('Costs from the forecast',g=>g.costs-(planY[g.key]||0))+r('Yearly plan lines',g=>planY[g.key]||0)+r('Total costs',g=>g.costs,'strong')+r('Profit',g=>g.net,'total');
  const endOf=k=>{ const L=M.months.filter(m=>m.ym.slice(0,4)===k); return L[L.length-1]||{}; };
  h+='<tr><td colspan="4">Cash at year end</td>'+ys.map(g=>{ const v=num(endOf(g.key).cashB!==undefined?endOf(g.key).cashB:endOf(g.key).cash); return '<td class="n'+(v<0?' neg':'')+'">'+$(v)+'</td>'; }).join('')+'<td></td><td></td></tr>';
  h+='<tr><td colspan="4">ARR at year end</td>'+ys.map(g=>'<td class="n">'+$(num(endOf(g.key).liveARR))+'</td>').join('')+'<td></td><td></td></tr>';
  h+='</tbody></table></div>';
  const by=meta.savedByName?' by '+esc(meta.savedByName):'';
  h+='<p class="hint"><span class="sync31"></span>Synced with Costs & team and the pipeline'+(meta.savedAt?' · last saved '+esc(fmtWhen(meta.savedAt))+by:'')+'. Checks for newer saves every 30 seconds. '+(typeof isDirty==='function'&&isDirty()?'<b>You have unsaved changes; press Save to share them.</b> ':'')+'Amounts are in '+esc(MAINC())+'. “Spread over the year” splits the amount evenly across the months of that year in the forecast; pick a month to book it all at once.</p>';
  return h+'</div>';
}

/* ---------- 4) page assembly ---------- */
(function(){ try{ if(document.getElementById('v31-css')) return; const st=document.createElement('style'); st.id='v31-css';
  st.textContent=['.yp31-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 10px}',
  'table.yp31t td{padding:5px 8px;vertical-align:middle}','table.yp31t .in.w-s{width:96px;text-align:right}','table.yp31t tr.off td{opacity:.55}',
  'table.yp31t tr.yp31-h td{background:var(--tint);font-size:11.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);padding-top:12px}',
  '.sync31{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--good,#2e9d6b);margin-right:6px;vertical-align:middle}',
  'table.pt14 tr.r14.det td{font-size:12.5px}','table.pt14 tr.r14.det td:first-child .lb14{padding-left:30px;color:var(--muted)}',
  'table.pt14 tr.r14.det td:first-child .lb14::before{content:"– "}'].join('\n');
  document.head.appendChild(st); }catch(e){} })();
const forecastBase31=forecast;
forecast=function(M){
  let h=forecastBase31(M);
  const det=view.fcDet!==false;
  h=h.replace('<span class="sp"></span>','<button class="btn small" data-act="yp-det" aria-pressed="'+det+'">Cost lines</button><span class="sp"></span>');
  const Mw=fcPartial31()?modelFor(curScen()):M, panel=ypPanel31(Mw);
  const k=h.search(/<div class="panel flush mb"><div class="panel-head pad"><h3>(Monthly|Quarterly|Annual)/);
  return k>=0?h.slice(0,k)+panel+h.slice(k):h+panel;
};
/* Costs & team: show the yearly plan lines too */
const costsBase31=costs;
costs=function(M){
  const h=costsBase31(M), L=ypItems31().filter(x=>x.on!==false);
  if(!L.length) return h;
  const years=Array.from(new Set(L.flatMap(x=>Object.keys(x.amounts||{}).filter(y=>num(x.amounts[y]))))).sort();
  return h+'<div class="panel mb"><div class="panel-head"><h3>Yearly plan lines</h3><button class="btn small" data-act="tab" data-v="forecast">Edit on the Forecast tab</button></div><div class="tbl-wrap"><table class="fin"><thead><tr><th>Line</th><th>Category</th>'+years.map(y=>'<th class="n">'+y+'</th>').join('')+'</tr></thead><tbody>'+
    L.map(x=>'<tr><td>'+esc(x.name||'Plan item')+'</td><td>'+esc(x.cat||'Other')+'</td>'+years.map(y=>'<td class="n">'+(num((x.amounts||{})[y])?$(num(x.amounts[y])):'–')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></div>';
};

/* ---------- events ---------- */
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.fcov===undefined||el.dataset.gran!=='year') return;
  e.stopImmediatePropagation(); e.stopPropagation();
  if(ypLocked31()){ toast('Only editors can change this.'); render(); return; }
  const Y=ypState31(), k='year|'+el.dataset.fcov+'|'+el.dataset.key, raw=el.value.trim();
  if(raw==='') delete Y.ov[k];
  else { const x=parseFloat(raw); if(isFinite(x)){ const iv=x*DR(); if(Math.abs(iv-num(el.dataset.base))<0.5) delete Y.ov[k]; else Y.ov[k]=iv; } }
  commit();
},true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.tagName==='INPUT'||b.tagName==='SELECT') return; const a=b.dataset.act;
  const yearOv=(a==='fc-ov-clear'||a==='fc-ov-reset')&&b.dataset.gran==='year';
  if(!(yearOv||a.indexOf('yp-')===0)) return;
  e.stopImmediatePropagation(); e.stopPropagation();
  if(a==='yp-det'){ view.fcDet=view.fcDet===false; persistView(); render(); return; }
  if(a==='yp-cat'){ view.ypCat=b.dataset.v||''; persistView(); render(); return; }
  if(a==='yp-edit'){ view.ypEdit=!view.ypEdit; persistView(); render(); return; }
  if(ypLocked31()){ toast('Only editors can change this.'); return; }
  const Y=ypState31();
  if(a==='fc-ov-clear'){ delete Y.ov['year|'+b.dataset.id+'|'+b.dataset.key]; commit(); return; }
  if(a==='fc-ov-reset'||a==='yp-ov-reset'){ Y.ov={}; commit(); toast('Annual figures are back to the forecast. Press Save to keep it.'); return; }
  if(a==='yp-add'){ const c=b.dataset.v||'Other'; Y.items.push({id:uid('yp'),name:c==='Conferences & events'?'New conference':'New '+c.toLowerCase()+' cost',cat:c,when:'',on:true,amounts:{}}); if(view.ypCat&&view.ypCat!==c) view.ypCat=''; commit(); return; }
  if(a==='yp-del'){ const i=+b.dataset.i; if(Y.items[i]){ Y.items.splice(i,1); commit(); } return; }
},true);
