/* ===== v41: implementation money shown as one clear sum with every signing listed (fee, each founder's share, kept)
   · "Aircraft added by year" rebuilt: fleet, pilots, renewal month and the extra licence each addition brings,
   worked out from the same model as the forecast table. ===== */

(function(){ try{ if(document.getElementById('v41-css')) return; const st=document.createElement('style'); st.id='v41-css';
  st.textContent=[
  '.im41{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:14px 16px;margin:0 0 14px}',
  '.im41 .eq{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px}',
  '.im41 .t{flex:1 1 150px;border-radius:10px;padding:10px 12px;background:var(--tint)}',
  '.im41 .t span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
  '.im41 .t b{display:block;font-size:20px;margin-top:2px;white-space:nowrap}','.im41 .t small{display:block;color:var(--muted);font-size:12px;margin-top:2px}',
  '.im41 .op{align-self:center;font-size:22px;color:var(--muted);padding:0 2px}',
  '.im41 .t.keep{background:var(--good-soft,#e6f5ec)}','.im41 .t.keep b{color:var(--good,#1a7f4b)}','.im41 .t.lic{background:transparent;border:1px dashed var(--line)}',
  '.im41 details{margin-top:10px}','.im41 summary{cursor:pointer;font-size:13px;color:var(--c-deep)}',
  '.im41 table td,.im41 table th{white-space:nowrap}',
  '.fp41 summary{cursor:pointer;list-style:none;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}','.fp41 summary::-webkit-details-marker{display:none}',
  '.fp41 summary h3{margin:0}','.fp41 summary h3::before{content:"▸ ";color:var(--muted)}','.fp41[open] summary h3::before{content:"▾ "}',
  '.fp41 .sum41{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:12px 0}',
  '.fp41 .sum41 div{border:1px solid var(--line);border-radius:10px;padding:8px 12px}','.fp41 .sum41 span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}','.fp41 .sum41 b{font-size:18px}',
  '.fp41 td{vertical-align:top;white-space:nowrap}','.fp41 .in{width:58px;text-align:right}',
  '.fp41 .c41{display:block;font-size:11.5px;color:var(--muted);line-height:1.35;margin-top:3px}','.fp41 .c41 b{color:var(--ink)}',
  '.fp41 .up41{color:var(--good,#1a7f4b);font-weight:700}','.fp41 .pre41{color:var(--muted);font-size:12px}',
  '.fp41 .an41{display:block;font-size:11.5px;color:var(--muted);margin-top:2px}'
  ].join('\n'); document.head.appendChild(st); }catch(e){} })();

/* ---------- 1) implementation money: one sum + every signing ---------- */
let last41=null;
const f32TableBase41=f32Table;
f32Table=function(M,Y,canEdit,partial){ last41={M,Y}; return f32TableBase41(M,Y,canEdit,partial); };
function implPanel41(M,Y){
  const t0=monthIndex(M.months[0].ym), F=fShare36(state), per=F.total, names=F.each.filter(f=>f.amt>0);
  let fee=0, fs=0, lic=0; M.months.forEach(m=>{ if(m.ym.slice(0,4)===Y){ fee+=num(m.impl); fs+=num(m.fimpl); lic+=num(m.recurring); } });
  const rows=[];
  (M.airlines||[]).forEach(x=>{
    if(!x||!x.e||!isFinite(x.sign)) return; const ym=ymFromIndex(x.sign); if(ym.slice(0,4)!==Y) return;
    const imp=num(x.e.impl)*num(x.w,1); if(!(imp>0)) return;
    const share=num(x.fimpl), sc=per?share/per:0;
    rows.push({ym,name:x.a.name,imp,share,each:names.map(f=>Math.max(0,f.amt)*sc),w:num(x.w,1)});
  });
  rows.sort((a,b)=>a.ym.localeCompare(b.ym)||String(a.name).localeCompare(String(b.name)));
  const n=rows.length, sumImp=rows.reduce((t,r)=>t+r.imp,0), sumFs=rows.reduce((t,r)=>t+r.share,0);
  const who=names.length?names.map(f=>esc(f.name)+' '+$(f.amt)).join(' + '):'nobody';
  let h='<div class="im41"><div class="eq">'+
    '<div class="t"><span>Implementation fees '+esc(Y)+'</span><b>'+$(fee)+'</b><small>'+n+' signing'+(n===1?'':'s')+', one-time</small></div><div class="op">−</div>'+
    '<div class="t"><span>Founders’ share</span><b>'+$(fs)+'</b><small>'+(per?n+' × '+$(per)+' ('+who+')':'switched off')+'</small></div><div class="op">=</div>'+
    '<div class="t keep"><span>Implementation STRATOS keeps</span><b>'+$(fee-fs)+'</b><small>'+(fee?Math.round((fee-fs)/fee*100)+'% of the fees':'')+'</small></div>'+
    '<div class="t lic"><span>Licence money '+esc(Y)+' (separate)</span><b>'+$(lic)+'</b><small>repeats every year</small></div></div>';
  if(Math.abs(sumImp-fee)>1||Math.abs(sumFs-fs)>1) h+='<p class="hint">The fee total includes figures you typed into the table, so it differs from the list of signings below by '+$(fee-sumImp)+'.</p>';
  if(n) h+='<details'+(view.im41?' open':'')+' data-d41="im"><summary>See each signing ('+n+')</summary><div class="tbl-wrap"><table class="fin"><thead><tr><th>Month</th><th>Airline</th><th class="n">Implementation fee</th>'+names.map(f=>'<th class="n">'+esc(f.name)+'</th>').join('')+'<th class="n">STRATOS keeps</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td>'+esc(ymLabel(r.ym))+'</td><td>'+esc(r.name)+(r.w<0.999?' <span class="muted small">('+Math.round(r.w*100)+'% weighted)</span>':'')+'</td><td class="n">'+$(r.imp)+'</td>'+r.each.map(v=>'<td class="n">'+(v>=0.5?'−'+$(v):'–')+'</td>').join('')+'<td class="n"><b>'+$(r.imp-r.share)+'</b></td></tr>').join('')+
    '<tr class="total"><td></td><td>Total</td><td class="n">'+$(sumImp)+'</td>'+names.map((f,j)=>'<td class="n">−'+$(rows.reduce((t,r)=>t+r.each[j],0))+'</td>').join('')+'<td class="n"><b>'+$(sumImp-sumFs)+'</b></td></tr></tbody></table></div>'+
    '<p class="hint">Each founder takes their amount from every implementation fee (never more than the fee). Change who takes what on the Pricing tab.</p></details>';
  return h+'</div>';
}
const forecastBase41=forecast;
forecast=function(M){
  last41=null; let h=forecastBase41(M);
  try{
    h=h.replace(/<div class="f32-kpi"><span>Founders’ share of impl\.<\/span><b>[^<]*<\/b><\/div><div class="f32-kpi"><span>Implementation kept<\/span><b>[^<]*<\/b><\/div>/,'');
    if(last41){ const p=implPanel41(last41.M,String(last41.Y)), at=h.indexOf('<details class="panel f32-filter"'); h=at>=0?h.slice(0,at)+p+h.slice(at):h; }
  }catch(e){ console.warn('v41 impl',e); }
  return h;
};

/* ---------- 2) Aircraft added by year ---------- */
fleetPanel40=function(){
  const can=!readOnly&&!cfgLocked, MM=modelFor(curScen()), ms=MM.months, t0=monthIndex(ms[0].ym);
  const ys=Array.from(new Set(ms.map(m=>m.ym.slice(0,4))));
  const X=(MM.airlines||[]).filter(x=>x&&x.a&&isFinite(x.live)&&typeof x.econ==='function');
  if(!X.length) return '';
  const lab=i=>ymLabel(ymFromIndex(i));
  const noPlan=(x,k)=>airlineEconBase40(state,state.airlines.find(a=>a.id===x.a.id)||x.a,k);
  const rev=(x,i,e)=>e.arr*num(x.w,1)*Math.pow(num(x.renew,1),Math.floor((t0+i-x.live)/12))/12;
  const totAdd={}, totExtra={}, totFleet={}; let grand=0, arrUp=0, nAir=0;
  const rows=X.slice().sort((p,q)=>num(q.a.fleet)-num(p.a.fleet)||String(p.a.name).localeCompare(String(q.a.name))).map(x=>{
    const a=state.airlines.find(z=>z.id===x.a.id)||x.a, P=a.fleetPlan||{}, pl=liveIdx40(state,a), py=isFinite(pl)?+ymFromIndex(pl).slice(0,4):NaN;
    let rowExtra=0, any=false;
    const cells=ys.map(y=>{
      const I=[]; ms.forEach((m,i)=>{ if(m.ym.slice(0,4)===y) I.push(i); });
      const last=I[I.length-1], mEnd=t0+last;
      if(mEnd<x.live) return '<td class="n"><span class="pre41">not live yet</span></td>';
      let extra=0; I.forEach(i=>{ const m=t0+i; if(m<x.live) return; const k=Math.floor((m-x.live)/12); extra+=rev(x,i,x.econ(k))-rev(x,i,noPlan(x,k)); });
      rowExtra+=extra; totExtra[y]=(totExtra[y]||0)+extra;
      const kE=Math.floor((mEnd-x.live)/12), e=x.econ(kE); totFleet[y]=(totFleet[y]||0)+num(e.fleet);
      const v=num(P[y]); if(v){ any=true; totAdd[y]=(totAdd[y]||0)+v; }
      let renew=''; for(let k=1;k<40;k++){ const r=x.live+12*k; if(+ymFromIndex(r).slice(0,4)===+y){ renew=lab(r); break; } }
      const editable=can&&isFinite(py)&&+y>py;
      const box=editable?'<input class="in" type="number" step="1" min="0" data-act="fp40" data-v="'+esc(a.id)+'" data-y="'+y+'" value="'+(v||'')+'" placeholder="+0" aria-label="'+esc(a.name)+' aircraft added in '+y+'">':(+y===py?'<span class="pre41">go-live year</span>':(v?'+'+v:''));
      return '<td class="n">'+box+'<span class="c41"><b>'+fc40(e.fleet)+'</b> aircraft · '+fc40(e.pilots)+' pilots'+
        (v&&renew?'<br>+'+v+' billed from '+esc(renew):'')+(Math.abs(extra)>=0.5?'<br><span class="up41">+'+$(extra)+'</span> licence':'')+'</span></td>';
    }).join('');
    const kL=Math.floor((t0+ms.length-1-x.live)/12), up=(x.econ(kL).arr-noPlan(x,kL).arr)*num(x.w,1)*Math.pow(num(x.renew,1),kL);
    if(any){ nAir++; arrUp+=up; } grand+=rowExtra;
    const bl=a.billing==='monthly'?'monthly':a.billing==='quarterly'?'quarterly':'annual';
    return '<tr><td><b>'+esc(a.name)+'</b><span class="an41">'+esc(a.country||'')+' · starts with '+fc40(a.fleet)+' aircraft · live '+esc(lab(x.live))+' · renews every '+esc(MON[(x.live%12+12)%12]||'')+' · '+bl+(num(a.growth)?' · also +'+num(a.growth)+'/yr':'')+'</span></td>'+cells+'<td class="n">'+(Math.abs(rowExtra)>=0.5?'<span class="up41">+'+$(rowExtra)+'</span>':'–')+'</td></tr>';
  });
  const anyPlan=Object.keys(totAdd).length>0;
  const open=view.fp40!==undefined?!!view.fp40:anyPlan;
  const foot='<tr class="total"><td>Aircraft added</td>'+ys.map(y=>'<td class="n">'+(totAdd[y]?'+'+fc40(totAdd[y]):'–')+'</td>').join('')+'<td></td></tr>'+
    '<tr class="total"><td>Fleet at year end (these airlines)</td>'+ys.map(y=>'<td class="n">'+(totFleet[y]?fc40(totFleet[y]):'–')+'</td>').join('')+'<td></td></tr>'+
    '<tr class="total"><td>Extra licence from added aircraft</td>'+ys.map(y=>'<td class="n">'+(Math.abs(totExtra[y]||0)>=0.5?'+'+$(totExtra[y]):'–')+'</td>').join('')+'<td class="n"><b>'+(grand>=0.5?'+'+$(grand):'–')+'</b></td></tr>';
  const lastY=ys[ys.length-1];
  return '<details class="panel mb fp41" data-d40="1"'+(open?' open':'')+'><summary><h3>Aircraft added by year</h3><span class="muted small">Plan fleet growth per airline. Every number here comes from the same model as the forecast table.</span></summary>'+
    '<div class="sum41"><div><span>Aircraft added</span><b>'+fc40(Object.values(totAdd).reduce((t,v)=>t+v,0))+'</b></div><div><span>Airlines growing</span><b>'+nAir+'</b></div><div><span>Extra licence, whole forecast</span><b>'+(grand>=0.5?'+'+$(grand):'$0')+'</b></div><div><span>Extra ARR by end of '+esc(lastY)+'</span><b>'+(arrUp>=0.5?'+'+$(arrUp):'$0')+'</b></div></div>'+
    '<div class="tbl-wrap"><table class="fin"><thead><tr><th>Airline</th>'+ys.map(y=>'<th class="n">'+y+'</th>').join('')+'<th class="n">Extra licence</th></tr></thead><tbody>'+rows.join('')+foot+'</tbody></table></div>'+
    '<p class="hint"><b>How it works:</b> type the number of aircraft an airline adds in a year. They are billed from that year’s contract renewal (shown under the box), so a July renewal adds half a year of extra licence in that year and a full year after. Each cell shows the fleet and pilots at the end of the year and the extra licence the added aircraft bring that year. New pilots pay the rate of the tier the airline grows into; admins stay the same; the quarterly or monthly premium applies to the added licence too; the implementation fee does not change. Weighted cases scale the money by each airline’s probability. Only airlines in the forecast are listed; tick a prospect in to plan it here. For the go-live year, change the airline’s starting fleet.</p></details>';
};
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.d41==='im'){ view.im41=d.open; persistView(); } },true);
