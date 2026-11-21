/* ===== v32: one simple Forecast — pick a year, see its 12 months in one table with everything (revenue, every cost
   line, plan lines, founder pay, hires, fees, profit, cash, ARR), edit any month or the year total, add cost lines.
   Filters tucked into one panel. Light / Dark / Auto switch in the header. ===== */

/* ---------- 1) calculation: saved edits by year and by month ---------- */
ypAdjust31=function(s,M,ov){
  const idxOf={}, yrs={}; M.months.forEach((m,i)=>{ idxOf[m.ym]=i; const y=m.ym.slice(0,4); (yrs[y]=yrs[y]||[]).push(i); });
  const inc=L=>(L||[]).filter(a=>a&&a.include!==false&&a.status!=='Lost').length;
  const fullRev=inc(s.airlines)===inc(state.airlines);
  const keys=Object.keys(ov).map(k=>{ const p=k.split('|'); return {k,g:p[0],id:p[1],p:p[2],v:num(ov[k])}; })
    .filter(o=>o.id&&isFinite(o.v)&&((o.g==='year'&&yrs[o.p])||(o.g==='month'&&idxOf[o.p]!==undefined)));
  const rank=o=>(o.g==='month'?10:0)+(/^(ci|hi|fi|yp):/.test(o.id)?0:/^(tools|hires|fees|sal)$/.test(o.id)?1:2);
  keys.sort((a,b)=>rank(a)-rank(b));
  const cd=new Array(M.months.length).fill(0); M.ypBase=M.ypBase||{};
  const sum=(I,f)=>I.reduce((t,i)=>t+num(f(M.months[i])),0);
  const pre=(m,p)=>Object.keys(m.costItems||{}).reduce((t,c)=>t+(c.indexOf(p)===0?num(m.costItems[c]):0),0);
  const bump=(m,obj,key,dm)=>{ m[obj]=m[obj]||{}; m[obj][key]=num(m[obj][key])+dm; };
  keys.forEach(o=>{
    const I=o.g==='year'?yrs[o.p]:[idxOf[o.p]], id=o.id; let base, cost=true, apply;
    if(id.indexOf('ci:')===0){ const c=id.slice(3); base=sum(I,m=>(m.costItems||{})[c]); apply=(m,dm)=>{ bump(m,'costItems',c,dm); m.tools+=dm; }; }
    else if(id.indexOf('yp:')===0){ const c=id.slice(3); base=sum(I,m=>pre(m,'yp:'+c+':')); apply=(m,dm)=>{ bump(m,'costItems','yp:'+c+':adj',dm); m.tools+=dm; }; }
    else if(id.indexOf('hi:')===0){ const c=id.slice(3); base=sum(I,m=>(m.hireItems||{})[c]); apply=(m,dm)=>{ bump(m,'hireItems',c,dm); m.hires+=dm; }; }
    else if(id.indexOf('fi:')===0){ const c=id.slice(3); base=sum(I,m=>(m.feeItems||{})[c]); apply=(m,dm)=>{ bump(m,'feeItems',c,dm); m.fees+=dm; }; }
    else if(id==='tools'){ base=sum(I,m=>m.tools)-sum(I,m=>pre(m,'yp:')); apply=(m,dm)=>{ bump(m,'costItems','adj:tools',dm); m.tools+=dm; }; }
    else if(id==='hires'){ base=sum(I,m=>m.hires); apply=(m,dm)=>{ bump(m,'hireItems','adj:hires',dm); m.hires+=dm; }; }
    else if(id==='fees'){ base=sum(I,m=>m.fees); apply=(m,dm)=>{ bump(m,'feeItems','adj:fees',dm); m.fees+=dm; }; }
    else if(id==='sal'){ base=sum(I,m=>m.salaries); apply=(m,dm)=>{ m.salaries+=dm; }; }
    else if(id==='impl'&&fullRev){ cost=false; base=sum(I,m=>m.impl); apply=(m,dm)=>{ m.impl+=dm; }; }
    else if(id.indexOf('p:')===0&&fullRev){ cost=false; const p=id.slice(2); base=sum(I,m=>(m.byProduct||{})[p]); apply=(m,dm)=>{ bump(m,'byProduct',p,dm); m.recurring+=dm; }; }
    else return;
    M.ypBase[o.k]=base; if(o.g==='year') M.ypBase[id+'|'+o.p]=base;
    const dm=(o.v-base)/I.length; if(Math.abs(dm)<1e-9) return;
    I.forEach(i=>{ const m=M.months[i]; apply(m,dm);
      if(cost){ m.costs+=dm; m.net-=dm; if(m.byType) m.byType.ga=num(m.byType.ga)+dm; if('cashOut' in m) m.cashOut+=dm; cd[i]-=dm; }
      else { m.revenue+=dm; m.net+=dm; m.billed=num(m.billed)+dm; m.cashIn+=dm; cd[i]+=dm; } });
  });
  let run=0; M.months.forEach((m,i)=>{ run+=cd[i]; if(run){ m.cash=num(m.cash)+run; if('cashB' in m) m.cashB=num(m.cashB)+run; } });
};

/* ---------- 2) styles ---------- */
(function(){ try{ if(document.getElementById('v32-css')) return; const st=document.createElement('style'); st.id='v32-css';
  st.textContent=[
  '.f32-head{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:flex-end;justify-content:space-between;margin:0 0 14px}',
  '.f32-head h2{margin:0}','.f32-years{display:flex;gap:4px;flex-wrap:wrap}',
  '.f32-years button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:8px;padding:7px 14px;font:600 14px var(--f-ui);cursor:pointer}',
  '.f32-years button[aria-pressed="true"]{background:var(--c-deep);border-color:var(--c-deep);color:#fff}',
  '.f32-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:0 0 14px}',
  '.f32-kpi{border:1px solid var(--line);border-radius:10px;background:var(--panel);padding:10px 14px}',
  '.f32-kpi span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
  '.f32-kpi b{display:block;font-size:20px;margin-top:2px;color:var(--ink)}','.f32-kpi b.neg{color:var(--coral)}',
  'details.f32-filter{margin:0 0 14px}','details.f32-filter>summary{cursor:pointer;list-style:none;display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
  'details.f32-filter>summary::-webkit-details-marker{display:none}','details.f32-filter>summary h3{margin:0}',
  'details.f32-filter>summary h3::before{content:"▸ ";color:var(--muted)}','details.f32-filter[open]>summary h3::before{content:"▾ "}',
  '.f32-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line)}',
  '.f32-bar .sp{flex:1}','.f32-bar label{display:inline-flex;gap:6px;align-items:center;font-size:13px;cursor:pointer}',
  '.f32-bar .btn[aria-pressed="true"]{background:var(--c-deep);border-color:var(--c-deep);color:#fff}',
  'table.t32{border-collapse:separate;border-spacing:0;width:100%}',
  'table.t32 th,table.t32 td{padding:6px 10px;white-space:nowrap;border-bottom:1px solid var(--line)}',
  'table.t32 thead th{position:sticky;top:0;z-index:2;background:var(--panel);font-size:12px;color:var(--muted);text-align:right}',
  'table.t32 th:first-child,table.t32 td:first-child{position:sticky;left:0;z-index:1;background:var(--panel);text-align:left;min-width:220px;max-width:280px;white-space:normal}',
  'table.t32 thead th:first-child{z-index:3}',
  'table.t32 td.n{text-align:right;font-variant-numeric:tabular-nums}',
  'table.t32 td.tot,table.t32 th.tot{background:var(--field);font-weight:700;border-left:2px solid var(--line)}',
  'table.t32 td.now,table.t32 th.now{background:color-mix(in srgb,var(--c-sky) 12%,var(--panel))}',
  'table.t32 tr.sec td{background:var(--navy)!important;color:var(--on-navy);font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}',
  'table.t32 tr.sec td span{font-weight:400;text-transform:none;letter-spacing:0;opacity:.8;margin-left:8px}',
  'table.t32 tr.sub td:first-child{padding-left:22px;color:var(--ink)}',
  'table.t32 tr.key td{font-weight:700;background:var(--tint)}','table.t32 tr.key td:first-child{background:var(--tint)}',
  'table.t32 tr.big td{font-weight:800;background:color-mix(in srgb,var(--c-deep) 10%,var(--panel));border-top:2px solid var(--c-deep40)}',
  'table.t32 tr.big td:first-child{background:color-mix(in srgb,var(--c-deep) 10%,var(--panel))}',
  'table.t32 td.neg{color:var(--coral)}','table.t32 tr.muted32 td{color:var(--muted);font-size:12.5px}',
  'table.t32 td.ed{background:var(--warn-soft)}',
  'table.t32 input.c32{width:92px;text-align:right;border:1px solid var(--line);border-radius:6px;padding:3px 6px;background:var(--panel);color:var(--ink);font:inherit}',
  'table.t32 td.ed input.c32{border-color:var(--warn)}',
  'table.t32 .lname{width:100%;max-width:200px}','table.t32 .x32{border:0;background:none;color:var(--muted);cursor:pointer;padding:0 4px}',
  'table.t32 .tag32{font-size:10.5px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:0 6px;margin-left:6px}',
  '.f32-note{padding:10px 16px;margin:0;font-size:12.5px;color:var(--muted)}',
  '.theme32{display:inline-flex;border:1px solid rgba(255,255,255,.35);border-radius:8px;overflow:hidden;margin-right:10px}',
  '.theme32 button{border:0;background:transparent;color:inherit;padding:5px 9px;font:600 12px var(--f-ui);cursor:pointer;opacity:.75}',
  '.theme32 button[aria-pressed="true"]{background:rgba(255,255,255,.22);opacity:1}'
  ].join('\n');
  document.head.appendChild(st); }catch(e){} })();

/* ---------- 3) the page ---------- */
const MONS32=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let last32=null;
function f32Rows(M,I){
  const pre=(m,p)=>Object.keys(m.costItems||{}).reduce((t,c)=>t+(c.indexOf(p)===0?num(m.costItems[c]):0),0);
  const R=[], add=(sec,id,label,f,o)=>R.push(Object.assign({sec,id,label,f,kind:'flow'},o||{}));
  state.products.forEach(p=>add('rev','p:'+p.id,(p.short||p.name)+' licences',m=>(m.byProduct||{})[p.id],{edit:1,cls:'sub'}));
  add('rev','impl','Implementation fees',m=>m.impl,{edit:1,cls:'sub'});
  add('rev','revenue','Total revenue',m=>m.revenue,{cls:'key',keep:1});
  (state.costs||[]).forEach(c=>add('cost','ci:'+c.id,c.name||'Cost',m=>(m.costItems||{})[c.id],{edit:1,cls:'sub'}));
  ((state.yearPlan&&state.yearPlan.items)||[]).forEach((x,i)=>{ if(x&&x.on!==false) add('cost','yp:'+x.id,x.name||'Cost line',m=>pre(m,'yp:'+x.id+':'),{edit:1,cls:'sub',plan:i,keep:1}); });
  add('cost','sal','Founder salaries',m=>num(m.salaries)-num(m.bonus),{edit:1,cls:'sub'});
  add('cost','bon','Founder bonuses',m=>m.bonus,{cls:'sub'});
  (state.hires||[]).forEach(h=>add('cost','hi:'+h.id,h.role||'Hire',m=>(m.hireItems||{})[h.id],{edit:1,cls:'sub'}));
  (state.fees||[]).forEach(f=>add('cost','fi:'+f.id,f.name||'Fee',m=>(m.feeItems||{})[f.id],{edit:1,cls:'sub'}));
  const known=m=>{ let t=num(m.salaries); Object.keys(m.costItems||{}).forEach(c=>{ t+=num(m.costItems[c]); }); Object.keys(m.hireItems||{}).forEach(c=>{ t+=num(m.hireItems[c]); }); Object.keys(m.feeItems||{}).forEach(c=>{ t+=num(m.feeItems[c]); }); return t; };
  const listed=m=>{ let t=num(m.salaries); (state.costs||[]).forEach(c=>{ t+=num((m.costItems||{})[c.id]); }); t+=pre(m,'yp:'); (state.hires||[]).forEach(h=>{ t+=num((m.hireItems||{})[h.id]); }); (state.fees||[]).forEach(f=>{ t+=num((m.feeItems||{})[f.id]); }); return t; };
  add('cost','adj','Adjustments you typed on whole groups',m=>known(m)-listed(m),{cls:'sub muted32'});
  add('cost','oth','Other costs',m=>num(m.costs)-known(m),{cls:'sub muted32'});
  add('cost','costs','Total costs',m=>m.costs,{cls:'key',keep:1});
  add('prof','net','Net profit',m=>m.net,{cls:'big',keep:1});
  add('prof','nm','Net margin',null,{kind:'pct',cls:'sub',keep:1,pct:g=>g.revenue?g.net/g.revenue*100:NaN});
  add('cash','cashIn','Cash collected',m=>m.cashIn,{cls:'sub'});
  add('cash','funding','Funding received',m=>m.funding,{cls:'sub'});
  add('cash','cashB','Cash at end of month',m=>m.cashB!==undefined?m.cashB:m.cash,{kind:'stock',cls:'key',keep:1});
  add('cust','liveARR','ARR (yearly value of live contracts)',m=>m.liveARR,{kind:'stock',cls:'key',keep:1});
  add('cust','live','Airlines live',m=>m.live,{kind:'stock',fmt:'count',cls:'sub',keep:1});
  add('cust','pilots','Pilots live',m=>m.livePilots,{kind:'stock',fmt:'count',cls:'sub'});
  return R;
}
const SECS32=[['rev','Revenue','what airlines pay'],['cost','Costs','every cost line, founder pay, hires and fees'],['prof','Profit',''],['cash','Cash','money in the bank'],['cust','Customers','']];
function f32Table(M,Y,canEdit,partial){
  const I=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===Y) I.push(i); });
  const rows=f32Rows(M,I), edit=canEdit&&!!view.ed32, hideEmpty=view.all32!==true&&!edit, col=view.col32||{};
  const ov=(state.yearPlan&&state.yearPlan.ov)||{}, B=M.ypBase||{}, nowYm=asOfYm();
  const G={revenue:0,net:0}; I.forEach(i=>{ G.revenue+=num(M.months[i].revenue); G.net+=num(M.months[i].net); });
  const val=(r,i)=>r.kind==='pct'?(()=>{ const m=M.months[i]; return m.revenue?m.net/m.revenue*100:NaN; })():num(r.f(M.months[i]));
  const tot=r=>r.kind==='pct'?r.pct(G):r.kind==='stock'?(I.length?num(r.f(M.months[I[I.length-1]])):0):I.reduce((t,i)=>t+num(r.f(M.months[i])),0);
  const fmt=(r,v)=>r.kind==='pct'?(isFinite(v)?pct(v):'–'):r.fmt==='count'?(v?fmtCount(v):'–'):(Math.abs(v)<0.5?'–':$(v));
  const cell=(r,v,key,isT,now)=>{
    const k=(isT?'year|':'month|')+r.id+'|'+key, has=Object.prototype.hasOwnProperty.call(ov,k);
    const cls='n'+(isT?' tot':'')+(now?' now':'')+(has?' ed':'')+(r.kind!=='pct'&&r.fmt!=='count'&&v<-0.5?' neg':'');
    if(edit&&r.edit){ const base=B[k]!==undefined?B[k]:v; return '<td class="'+cls+'"><input id="'+('c32-'+(isT?'y':'m')+'-'+r.id+'-'+key).replace(/[^a-zA-Z0-9_-]/g,'_')+'" class="c32" type="number" step="any" inputmode="decimal" data-c32="'+esc(r.id)+'" data-g="'+(isT?'year':'month')+'" data-k="'+esc(key)+'" data-base="'+base+'" value="'+(Math.round(cvt(v)*100)/100)+'" aria-label="'+esc(r.label+' '+key)+'"></td>'; }
    return '<td class="'+cls+'"'+(has?' title="You set this figure. Forecast was '+esc($(B[k]!==undefined?B[k]:v))+'"':'')+'>'+fmt(r,v)+'</td>';
  };
  let body='', hidden=0;
  SECS32.forEach(([sid,sname,sdesc])=>{
    const rs=rows.filter(r=>r.sec===sid); if(!rs.length) return;
    const closed=!!col[sid];
    let inner='';
    rs.forEach(r=>{
      const vals=I.map(i=>val(r,i)), t=tot(r);
      if(hideEmpty&&!r.keep&&vals.every(v=>!v||Math.abs(v)<0.5)&&!(Math.abs(t)>=0.5)){ hidden++; return; }
      let lab=esc(r.label);
      if(r.plan!==undefined) lab=(edit?'<input class="in lname" data-bind="yearPlan.items.'+r.plan+'.name" value="'+esc(r.label)+'" aria-label="Cost line name">':esc(r.label)+'<span class="tag32">added</span>')+(edit?'<button class="x32" data-act="d32" data-i="'+r.plan+'" title="Remove this cost line" aria-label="Remove">✕</button>':'');
      inner+='<tr class="'+(r.cls||'')+'"><td>'+lab+'</td>'+I.map((i,j)=>cell(r,vals[j],M.months[i].ym,false,M.months[i].ym===nowYm)).join('')+cell(r,t,Y,true,false)+'</tr>';
    });
    body+='<tr class="sec" data-act="s32" data-v="'+sid+'"><td colspan="'+(I.length+2)+'">'+(closed?'▸ ':'▾ ')+sname+(sdesc?'<span>'+sdesc+'</span>':'')+'</td></tr>'+(closed?'':inner);
  });
  last32={Y,I,M,rows};
  const n=Object.keys(ov).length;
  const bar='<div class="f32-bar">'+
    (canEdit?'<button class="btn small" data-act="e32" aria-pressed="'+edit+'">'+(edit?'Done editing':'Edit figures')+'</button><button class="btn small" data-act="a32">+ Add cost line</button>'+(n?'<button class="btn small" data-act="u32">Undo all '+n+' edit'+(n===1?'':'s')+'</button>':''):'<span class="muted small">'+(partial?'Showing a filtered selection. Clear the filter to edit.':'View only for your account.')+'</span>')+
    '<span class="sp"></span>'+(edit?'':'<label><input type="checkbox" data-act="h32"'+(view.all32===true?' checked':'')+'> Show empty lines'+(hidden?' ('+hidden+')':'')+'</label>')+
    '<button class="btn small" data-act="x32">Export CSV</button></div>';
  return '<div class="panel flush mb">'+bar+'<div class="tbl-wrap inner"><table class="t32"><thead><tr><th>'+esc(Y)+'</th>'+I.map(i=>'<th class="'+(M.months[i].ym===nowYm?'now':'')+'">'+MONS32[+M.months[i].ym.slice(5,7)-1]+'</th>').join('')+'<th class="tot">Year</th></tr></thead><tbody>'+body+'</tbody></table></div>'+
    '<p class="f32-note">'+(edit?'<b>Editing.</b> Type over any white box: a month, or the Year column to spread a new total evenly over the year. Highlighted boxes are your figures; clear a box to go back to the forecast. ':'Click a section name to fold it. ')+'Your figures and added cost lines are saved with Save and change cash, profit and every tab.</p></div>';
}
forecast=function(M){
  const F=fcF(), fl=fleet22('fc'), partial=!!(F.regions.length||F.countries.length||F.product||fl.on);
  const Mx=partial?fcFiltered(F):M;
  const years=Array.from(new Set(Mx.months.map(m=>m.ym.slice(0,4))));
  const nowY=asOfYm().slice(0,4);
  let Y=view.fy32&&years.includes(view.fy32)?view.fy32:(years.includes(nowY)&&Mx.months.filter(m=>m.ym.slice(0,4)===nowY).length>=6?nowY:(years.find(y=>Mx.months.filter(m=>m.ym.slice(0,4)===y).length===12)||years[0]));
  const I=Mx.months.filter(m=>m.ym.slice(0,4)===Y), last=I[I.length-1]||{};
  const S=I.reduce((t,m)=>({rev:t.rev+num(m.revenue),cost:t.cost+num(m.costs),net:t.net+num(m.net)}),{rev:0,cost:0,net:0});
  const cash=num(last.cashB!==undefined?last.cashB:last.cash);
  const canEdit=!partial&&!readOnly&&!cfgLocked;
  let h='<div class="f32-head"><div><div class="eyebrow">Forecast</div><h2>'+esc(Y)+(partial?' · selected airlines':'')+'</h2></div><div class="f32-years" role="group" aria-label="Year">'+years.map(y=>'<button data-act="y32" data-v="'+y+'" aria-pressed="'+(y===Y)+'">'+y+'</button>').join('')+'</div></div>';
  const k=(l,v,neg)=>'<div class="f32-kpi"><span>'+l+'</span><b'+(neg?' class="neg"':'')+'>'+v+'</b></div>';
  h+='<div class="f32-kpis">'+k('Revenue',$(S.rev))+k('Costs',$(S.cost))+k('Profit',$(S.net),S.net<0)+k('Cash at year end',$(cash),cash<0)+k('ARR at year end',$(num(last.liveARR)))+'</div>';
  const n=fcApRows14(F).filter(x=>x.on).length, mode=fcCost29();
  const open=partial||(view.fcD32===true);
  h+='<details class="panel f32-filter" data-d32="1"'+(open?' open':'')+'><summary><h3>Which airlines</h3><span class="muted small">'+(partial?n+' airlines in this selection':'Whole company · '+n+' airlines ticked')+'</span>'+(partial?'<button class="btn small" data-act="fc-f-reset">Show everything</button>':'')+'</summary><div style="margin-top:12px">'+
    chipBar19('fc19',F.regions,F.countries,state.airlines,'Forecast covers')+
    '<div class="fields" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))"><div class="field"><label>Product</label><select class="in" data-act="fc-f-product" aria-label="Product">'+[['','All products'],...state.products.map(p=>[p.id,p.short||p.name])].map(([v,l])=>'<option value="'+esc(v)+'"'+(F.product===v?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></div></div>'+
    (partial?'<div class="cost22" style="margin:4px 0 12px"><span class="muted small" style="align-self:center">Company costs for this selection:</span>'+[['full','All of them'],['share','Share by revenue'],['out','Leave out']].map(([v,l])=>'<button class="btn small" data-act="f29-cost" data-v="'+v+'" aria-pressed="'+(mode===v)+'">'+l+'</button>').join('')+'</div>':'')+
    fcPanel14(F)+'</div></details>';
  h+=f32Table(Mx,Y,canEdit,partial);
  return h;
};

/* ---------- 4) light / dark switch in the header ---------- */
const shellBase32=shell;
shell=function(){
  const t=view.theme==='light'||view.theme==='dark'?view.theme:'system';
  const sw='<div class="theme32" role="group" aria-label="Colour mode">'+[['light','☀ Light'],['dark','☾ Dark'],['system','Auto']].map(([v,l])=>'<button data-act="t32" data-v="'+v+'" aria-pressed="'+(t===v)+'">'+l+'</button>').join('')+'</div>';
  return shellBase32().replace('<div class="savebox">',sw+'<div class="savebox">');
};

/* ---------- 5) events ---------- */
function ov32(){ const Y=ypState31(); return Y.ov; }
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return;
  if(el.dataset.c32!==undefined){
    e.stopImmediatePropagation();
    if(readOnly||cfgLocked){ toast('Only editors can change this.'); render(); return; }
    const O=ov32(), k=el.dataset.g+'|'+el.dataset.c32+'|'+el.dataset.k, raw=el.value.trim();
    if(raw==='') delete O[k];
    else { const x=parseFloat(raw); if(isFinite(x)){ const iv=x*DR(); if(Math.abs(iv-num(el.dataset.base))<0.5) delete O[k]; else O[k]=iv; } }
    pendingScroll=null; commit(); return;
  }
  if(el.dataset.act==='h32'){ view.all32=el.checked; persistView(); render(); }
},true);
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.d32){ view.fcD32=d.open; persistView(); } },true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.tagName==='INPUT'||b.tagName==='SELECT') return; const a=b.dataset.act;
  if(!/^(y32|e32|a32|u32|d32|s32|x32|t32)$/.test(a)) return;
  e.stopImmediatePropagation();
  if(a==='t32'){ view.theme=b.dataset.v; persistView(); applyTheme(); render(); return; }
  if(a==='y32'){ view.fy32=b.dataset.v; persistView(); render(); return; }
  if(a==='s32'){ view.col32=Object.assign({},view.col32||{}); view.col32[b.dataset.v]=!view.col32[b.dataset.v]; persistView(); render(); return; }
  if(a==='e32'){ view.ed32=!view.ed32; persistView(); render(); return; }
  if(a==='x32'){ const L=last32; if(!L) return; const q=s=>'"'+String(s).replace(/"/g,'""')+'"';
    const lines=[[q('Line ('+MAINC()+')'),...L.I.map(i=>q(L.M.months[i].ym)),q(L.Y+' total')].join(',')];
    L.rows.forEach(r=>{ const vals=L.I.map(i=>r.kind==='pct'?(()=>{const m=L.M.months[i];return m.revenue?m.net/m.revenue*100:'';})():num(r.f(L.M.months[i]))); const t=r.kind==='pct'?'':r.kind==='stock'?vals[vals.length-1]:vals.reduce((s,v)=>s+num(v),0);
      lines.push([q(r.label),...vals.map(v=>v===''?'':Math.round((r.kind==='pct'?v:cvt(v))*100)/100),t===''?'':Math.round(cvt(t)*100)/100].join(',')); });
    const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}), l=document.createElement('a');
    l.href=URL.createObjectURL(blob); l.download='stratos-forecast-'+L.Y+'.csv'; document.body.appendChild(l); l.click(); setTimeout(()=>{ URL.revokeObjectURL(l.href); l.remove(); },500); return; }
  if(readOnly||cfgLocked){ toast('Only editors can change this.'); return; }
  const Y=ypState31();
  if(a==='a32'){ Y.items.push({id:uid('yp'),name:'New cost line',cat:'Other',when:'',on:true,amounts:{}}); view.ed32=true; persistView(); commit(); toast('Cost line added. Name it and type the amounts in the months.'); return; }
  if(a==='u32'){ Y.ov={}; commit(); toast('All your figures are back to the forecast. Press Save to keep it.'); return; }
  if(a==='d32'){ const i=+b.dataset.i, x=Y.items[i]; if(!x) return; Object.keys(Y.ov).forEach(k=>{ if(k.split('|')[1]==='yp:'+x.id) delete Y.ov[k]; }); Y.items.splice(i,1); commit(); return; }
},true);
