/* ===== v42: hires and office costs that start when a target is reached (airlines live, airlines signed, live ARR or
   monthly revenue) — planned right in the forecast, with the month each one starts and what it costs each year. ===== */

/* ---------- 1) more trigger kinds ---------- */
const TRIG42=[{v:'month',l:'On a date'},{v:'live',l:'When airlines live reach'},{v:'signed',l:'When airlines signed reach'},{v:'arr',l:'When live ARR reaches'},{v:'rev',l:'When monthly revenue reaches'}];
function trigStart42(t,val,months,start){
  let cum=0; const v=num(val);
  for(let i=0;i<months.length;i++){ const mo=months[i]; cum+=num(mo.newSigned);
    if(t==='live'&&num(mo.live)>=v-1e-9) return start+i;
    if(t==='signed'&&cum>=v-1e-9) return start+i;
    if(t==='arr'&&num(mo.liveARR)>=v) return start+i;
    if(t==='rev'&&num(mo.recurring)+num(mo.impl)>=v) return start+i; }
  return Infinity;
}
const hireStartBase42=hireStart;
hireStart=function(s,h,months,start){
  if(h&&(h.trigger==='signed'||h.trigger==='rev')){ if(h.include===false) return Infinity; return trigStart42(h.trigger,h.value,months,start); }
  return hireStartBase42(s,h,months,start);
};

/* ---------- 2) office and other costs with a trigger: start in the month the target is first reached ---------- */
const isTrig42=c=>c&&c.trigger&&c.trigger!=='month';
const computeBase42=compute;
compute=function(s,scenario){
  const C=(s&&s.costs)||[];
  if(!C.some(isTrig42)) return computeBase42(s,scenario);
  const M0=computeBase42(Object.assign({},s,{costs:C.filter(c=>!isTrig42(c))}),scenario);
  const start=monthIndex(M0.months[0].ym), info={};
  const C2=[]; C.forEach(c=>{
    if(!isTrig42(c)){ C2.push(c); return; }
    const t=trigStart42(c.trigger,c.value,M0.months,start); info[c.id]=t;
    if(!isFinite(t)) return;
    const own=monthIndex(c.startMonth), st=isFinite(own)?Math.max(own,t):t;
    C2.push(Object.assign({},c,{startMonth:ymFromIndex(st)}));
  });
  const M=computeBase42(Object.assign({},s,{costs:C2}),scenario);
  M.trig42=info; return M;
};

/* ---------- 3) styles ---------- */
(function(){ try{ if(document.getElementById('v42-css')) return; const st=document.createElement('style'); st.id='v42-css';
  st.textContent=[
  '.gp42 summary{cursor:pointer;list-style:none;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}','.gp42 summary::-webkit-details-marker{display:none}',
  '.gp42 summary h3{margin:0}','.gp42 summary h3::before{content:"▸ ";color:var(--muted)}','.gp42[open] summary h3::before{content:"▾ "}',
  '.gp42 td{vertical-align:middle;white-space:nowrap}','.gp42 .in.w-s{width:92px}','.gp42 .in.w-m{width:150px}',
  '.gp42 .st42{font-weight:700}','.gp42 .no42{color:var(--coral)}','.gp42 .tg42{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;background:var(--tint);color:var(--muted)}',
  '.gp42 .sum42{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:12px 0}',
  '.gp42 .sum42 div{border:1px solid var(--line);border-radius:10px;padding:8px 12px}','.gp42 .sum42 span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}','.gp42 .sum42 b{font-size:18px}',
  '.gp42 .x42{border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:14px}','.gp42 .x42:hover{color:var(--coral)}',
  '.gp42 h4{margin:14px 0 6px}'
  ].join('\n'); document.head.appendChild(st); }catch(e){} })();

/* ---------- 4) the forecast panel ---------- */
function growthPanel42(){
  const can=!readOnly&&!cfgLocked, MM=modelFor(curScen()), ms=MM.months, t0=monthIndex(ms[0].ym), last=ms[ms.length-1];
  const ys=Array.from(new Set(ms.map(m=>m.ym.slice(0,4))));
  const trigTxt=(t,v,mo)=>t==='live'?num(v)+' airlines live':t==='signed'?num(v)+' airlines signed':t==='arr'?'live ARR '+$(num(v)):t==='rev'?'monthly revenue '+$(num(v)):(mo?ymLabel(mo):'no date');
  const firstAt=f=>{ for(let i=0;i<ms.length;i++) if(Math.abs(num(f(ms[i])))>=0.5) return i; return -1; };
  const yearSum=(f,y)=>ms.reduce((t,m)=>t+(m.ym.slice(0,4)===y?num(f(m)):0),0);
  const H=state.hires||[], C=state.costs||[];
  const CI=C.map((c,i)=>({c,i})).filter(o=>isTrig42(o.c)||/office|rent|workspace/i.test((o.c.category||'')+' '+(o.c.name||'')));
  const startCell=(i,cond)=>i>=0?'<span class="st42">'+esc(ymLabel(ms[i].ym))+'</span>':'<span class="no42">not reached by '+esc(ymLabel(last.ym))+'</span>';
  let tot={}, nOn=0;
  const valIn=(base,x)=>(x.trigger==='month'||!x.trigger)?inp(base+(base.indexOf('hires')===0?'.month':'.startMonth'),{type:'month',w:'w-m',label:'Start month'}):inp(base+'.value',{num:1,w:'w-s',label:'Target',ph:x.trigger==='arr'||x.trigger==='rev'?'100000':'5'});
  const hRows=H.map((h,i)=>{
    const f=m=>(m.hireItems||{})[h.id], s=firstAt(f); if(s>=0) nOn++;
    ys.forEach(y=>{ tot[y]=(tot[y]||0)+yearSum(f,y); });
    const base='hires.'+i;
    return '<tr><td>'+(can?inp(base+'.role',{w:'w-m',label:'Role'}):esc(h.role||'Hire'))+'</td><td class="n">'+(can?inp(base+'.salary',{num:1,w:'w-s',label:'Monthly salary'}):$(num(h.salary)))+'</td>'+
      '<td>'+(can?inp(base+'.trigger',{type:'select',options:TRIG42,w:'w-m',label:'Starts'}):'<span class="tg42">'+esc((TRIG42.find(t=>t.v===(h.trigger||'month'))||{}).l||'')+'</span>')+'</td><td>'+(can?valIn(base,h):esc(trigTxt(h.trigger,h.value,h.month)))+'</td>'+
      '<td>'+(h.include===false?'<span class="muted">switched off</span>':startCell(s))+'</td>'+ys.map(y=>{ const v=yearSum(f,y); return '<td class="n">'+(Math.abs(v)>=0.5?$(v):'–')+'</td>'; }).join('')+
      '<td>'+(can?inp(base+'.include',{type:'checkbox',label:'Include '+(h.role||'hire')})+' <button class="x42" data-act="x42" data-k="hires" data-i="'+i+'" title="Remove" aria-label="Remove">✕</button>':'')+'</td></tr>';
  }).join('');
  const cRows=CI.map(({c,i})=>{
    const f=m=>(m.costItems||{})[c.id], s=firstAt(f); if(s>=0) nOn++;
    ys.forEach(y=>{ tot[y]=(tot[y]||0)+yearSum(f,y); });
    const base='costs.'+i, per=c.freq==='yearly'?' a year':c.freq==='once'?' once':' a month';
    return '<tr><td>'+(can?inp(base+'.name',{w:'w-m',label:'Cost name'}):esc(c.name||'Cost'))+'</td><td class="n">'+(can?inp(base+'.amount',{num:1,w:'w-s',label:'Amount'}):$(num(c.amount)))+'<span class="muted small">'+per+'</span></td>'+
      '<td>'+(can?inp(base+'.trigger',{type:'select',options:TRIG42,w:'w-m',label:'Starts'}):'<span class="tg42">'+esc((TRIG42.find(t=>t.v===(c.trigger||'month'))||{}).l||'')+'</span>')+'</td><td>'+(can?valIn(base,c):esc(trigTxt(c.trigger,c.value,c.startMonth)))+'</td>'+
      '<td>'+startCell(s)+'</td>'+ys.map(y=>{ const v=yearSum(f,y); return '<td class="n">'+(Math.abs(v)>=0.5?$(v):'–')+'</td>'; }).join('')+
      '<td>'+(can?'<button class="x42" data-act="x42" data-k="costs" data-i="'+i+'" title="Remove" aria-label="Remove">✕</button>':'')+'</td></tr>';
  }).join('');
  const head='<thead><tr><th>Name</th><th class="n">Cost</th><th>Starts</th><th>Target</th><th>Starts in</th>'+ys.map(y=>'<th class="n">'+y+'</th>').join('')+'<th></th></tr></thead>';
  const open=view.gp42!==undefined?!!view.gp42:true;
  const totAll=Object.values(tot).reduce((t,v)=>t+v,0);
  return '<details class="panel mb gp42" data-d42="1"'+(open?' open':'')+'><summary><h3>Hires and office: start when you reach a target</h3><span class="muted small">Pick what each one waits for: a date, a number of airlines live or signed, live ARR or monthly revenue.</span></summary>'+
    '<div class="sum42"><div><span>Hires planned</span><b>'+H.filter(h=>h.include!==false).length+'</b></div><div><span>Office and other lines</span><b>'+CI.length+'</b></div><div><span>Started within the forecast</span><b>'+nOn+'</b></div><div><span>Their cost, whole forecast</span><b>'+$(totAll)+'</b></div></div>'+
    '<h4>Hires</h4><div class="tbl-wrap"><table class="fin">'+head+'<tbody>'+(hRows||'<tr><td colspan="'+(6+ys.length)+'" class="muted">No hires yet.</td></tr>')+'</tbody></table></div>'+
    (can?'<div class="toolbar mt"><button class="btn small" data-act="h42-add">+ Add a hire</button></div>':'')+
    '<h4>Office and other costs</h4><div class="tbl-wrap"><table class="fin">'+head+'<tbody>'+(cRows||'<tr><td colspan="'+(6+ys.length)+'" class="muted">No office costs yet.</td></tr>')+'</tbody></table></div>'+
    (can?'<div class="toolbar mt"><button class="btn small" data-act="c42-add">+ Add office cost</button></div>':'')+
    '<p class="hint"><b>How it works:</b> the start month is the first month the forecast reaches the target (airlines live and ARR follow the case you are viewing, so the weighted case can start later). Salaries and costs then run every month and show up in Costs, Profit and Cash in the table above. Monthly revenue means licences plus implementation in that month. A date you set on an office cost is the earliest it can start. Press Save to keep changes.</p></details>';
}
const forecastBase42=forecast;
forecast=function(M){ let h=forecastBase42(M); try{ h+=growthPanel42(); }catch(e){ console.warn('v42',e); } return h; };

/* ---------- 5) buttons ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act;
  if(a!=='h42-add'&&a!=='c42-add'&&a!=='x42') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(readOnly||cfgLocked){ toast('View only.'); return; }
  const S=state, st=(S.settings&&S.settings.startMonth)||asOfYm();
  if(a==='h42-add'){ S.hires=S.hires||[]; S.hires.push({id:uid('h'),role:'New hire',type:'rd',salary:1500,currency:'USD',trigger:'live',month:'',value:5,endMonth:'',growth:0,include:true}); toast('Hire added: starts when 5 airlines are live. Change it in the row.'); }
  else if(a==='c42-add'){ S.costs=S.costs||[]; S.costs.push({id:uid('c'),name:'Office rent',category:'Office',basis:'fixed',growth:0,amount:1000,freq:'monthly',currency:'USD',qty:1,startMonth:st,endMonth:'',trigger:'live',value:5}); toast('Office cost added: starts when 5 airlines are live. Change it in the row.'); }
  else { const k=b.dataset.k, i=+b.dataset.i, L=S[k]; if(!Array.isArray(L)||!L[i]) return; const nm=L[i].role||L[i].name||'Line'; L.splice(i,1); toast(nm+' removed. Press Save to keep it.'); }
  view.gp42=true; persistView(); commit();
},true);
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.d42){ view.gp42=d.open; persistView(); } },true);
