/* ===== v40: billing chosen per airline right in the forecast (annual / quarterly / monthly) · premiums apply to the
   whole licence (pilots, cabin crew, admins, instructors), never to implementation · aircraft added by year per
   airline, billed from that year's renewal, synced into every number. ===== */

/* ---------- 1) aircraft added in a given year ----------
   a.fleetPlan = {"2028":5,"2030":3}. Extra aircraft join at the airline's contract renewal in that year (contract
   year k starts at go-live + 12k months). Additions in the go-live year or earlier belong in the starting fleet. */
function liveIdx40(s,a){ try{ return monthIndex(timingOf(s||state,a).live); }catch(e){ return NaN; } }
function planAdd40(s,a,k){
  const P=a&&a.fleetPlan; if(!P||!k) return 0;
  const L=liveIdx40(s,a); if(!isFinite(L)) return 0;
  const y0=+ymFromIndex(L).slice(0,4), yk=+ymFromIndex(L+12*k).slice(0,4);
  let t=0; Object.keys(P).forEach(y=>{ const yy=+y, v=num(P[y]); if(yy>y0&&yy<=yk) t+=v; }); return t;
}
const airlineEconBase40=airlineEcon;
airlineEcon=function(s,a,k){
  k=k||0;
  if(!a) return airlineEconBase40(s,a,k);
  let b=a;
  const add=k>0?planAdd40(s,a,k):0;
  if(add) b=Object.assign({},a,{growth:(num(a.growth)*k+add)/k});
  let e=airlineEconBase40(s,b,k);
  /* quarterly: the per-pilot list price stays the list price; the +% sits on the whole licence total */
  if(a.billing==='quarterly'){ const f=1+num(s&&s.settings&&s.settings.quarterlyPremium)/100; if(f&&f!==1) e=Object.assign({},e,{rate:num(e.rate)/f}); }
  return e;
};

/* ---------- 2) styles ---------- */
(function(){ try{ if(document.getElementById('v40-css')) return; const st=document.createElement('style'); st.id='v40-css';
  st.textContent=[
  '.bill40{margin-top:4px;font-size:12px;padding:2px 6px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:inherit}',
  '.fp40 td,.fp40 th{white-space:nowrap}','.fp40 .in{width:64px;text-align:right}','.fp40 .tot40{display:block;font-size:11px;color:var(--muted)}',
  '.fp40 .base40{color:var(--muted);font-size:12px}','.fp40 tr.has40 td:first-child b{color:var(--c-deep)}',
  '.bx40{margin:10px 0 0;padding:10px 12px;border-radius:8px;background:var(--tint);font-size:13px}'
  ].join('\n'); document.head.appendChild(st); }catch(e){} })();

/* ---------- 3) forecast: billing picker on every airline row ---------- */
const BILL40=[['annual','Annual'],['quarterly','Quarterly'],['monthly','Monthly']];
const billLab40=a=>{ const S=state.settings||{}; return a.billing==='monthly'?'billed monthly (+'+num(S.monthlyPremium)+'%)':a.billing==='quarterly'?'billed quarterly (+'+num(S.quarterlyPremium)+'%)':'billed yearly'; };
const f32TableBase40=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase40(M,Y,canEdit,partial);
  try{
    const S=state.settings||{}, can=!readOnly&&!cfgLocked;
    const byId={}; state.airlines.forEach(a=>{ byId[a.id]=a; });
    h=h.replace(/<small>billed (yearly|monthly|quarterly)<\/small>/g,'');
    h=h.replace(/(<button class="an" data-act="open-airline" data-v="([^"]+)">[\s\S]*?<\/button><span class="am">[\s\S]*?<\/span>)/g,(m,all,id)=>{
      const a=byId[id]; if(!a) return m;
      if(!can) return all+'<span class="am">'+esc(billLab40(a))+'</span>';
      const cur=a.billing==='monthly'||a.billing==='quarterly'?a.billing:'annual';
      return all+'<select class="bill40" data-act="bill40" data-v="'+esc(id)+'" aria-label="How '+esc(a.name)+' pays">'+BILL40.map(([v,l])=>'<option value="'+v+'"'+(v===cur?' selected':'')+'>'+l+(v==='quarterly'?' +'+num(S.quarterlyPremium)+'%':v==='monthly'?' +'+num(S.monthlyPremium)+'%':'')+'</option>').join('')+'</select>';
    });
  }catch(e){ console.warn('v40 bill',e); }
  return h;
};

/* ---------- 4) forecast: aircraft added by year ---------- */
function fleetPanel40(){
  const can=!readOnly&&!cfgLocked;
  const L=state.airlines.map((a,i)=>({a,i,L:liveIdx40(state,a)})).filter(o=>o.a.status!=='Lost'&&(o.a.include!==false||(o.a.fleetPlan&&Object.keys(o.a.fleetPlan).length))&&isFinite(o.L));
  if(!L.length) return '';
  const Ms=modelFor(curScen()).months, ys=Array.from(new Set(Ms.map(m=>m.ym.slice(0,4))));
  const has=L.some(o=>o.a.fleetPlan&&Object.keys(o.a.fleetPlan).some(y=>num(o.a.fleetPlan[y])));
  const open=view.fp40!==undefined?!!view.fp40:has;
  L.sort((x,y)=>num(y.a.fleet)-num(x.a.fleet)||String(x.a.name).localeCompare(String(y.a.name)));
  let rows='', addAll={};
  L.forEach(o=>{
    const a=o.a, y0=+ymFromIndex(o.L).slice(0,4), P=a.fleetPlan||{}, g=num(a.growth); let fl=num(a.fleet), any=false;
    const cells=ys.map(y=>{
      const yy=+y;
      if(yy<y0) return '<td class="n base40">–</td>';
      if(yy===y0) return '<td class="n"><span class="base40">starts '+fc40(fl)+'</span></td>';
      const v=num(P[y]); if(v) any=true; fl+=v+(g||0); addAll[y]=(addAll[y]||0)+v;
      const inp=can?'<input class="in" type="number" step="1" min="0" data-act="fp40" data-v="'+esc(a.id)+'" data-y="'+y+'" value="'+(v||'')+'" placeholder="0" aria-label="'+esc(a.name)+' aircraft added in '+y+'">':(v?'+'+fc40(v):'–');
      return '<td class="n">'+inp+'<span class="tot40">'+fc40(fl)+' aircraft</span></td>';
    }).join('');
    rows+='<tr class="'+(any?'has40':'')+'"><td><b>'+esc(a.name)+'</b><span class="tot40">'+esc(a.country||'')+' · live '+esc(ymLabel(ymFromIndex(o.L)))+(g?' · +'+g+'/yr growth':'')+(a.include===false?' · prospect':'')+'</span></td>'+cells+'</tr>';
  });
  const foot='<tr class="total"><td>Aircraft added</td>'+ys.map(y=>'<td class="n">'+(addAll[y]?'+'+fc40(addAll[y]):'–')+'</td>').join('')+'</tr>';
  return '<details class="panel mb fp40" data-d40="1"'+(open?' open':'')+'><summary><h3>Aircraft added by year</h3><span class="muted small">Type how many aircraft each airline adds in a year. Pilots, crew and the licence grow with it.</span></summary>'+
    '<div class="tbl-wrap"><table class="fin"><thead><tr><th>Airline</th>'+ys.map(y=>'<th class="n">'+y+'</th>').join('')+'</tr></thead><tbody>'+rows+foot+'</tbody></table></div>'+
    '<p class="hint">Extra aircraft are billed from the airline’s contract renewal in that year (one year after go-live, then every year). New pilots pay the rate of the tier the airline grows into. For the go-live year, change the airline’s starting fleet instead. The implementation fee does not change.</p></details>';
}
const fc40=n=>Math.round(num(n)).toLocaleString('en-US');
const forecastBase40=forecast;
forecast=function(M){ let h=forecastBase40(M); try{ h+=fleetPanel40(); }catch(e){ console.warn('v40 fleet',e); } return h; };

/* ---------- 5) Pricing: say clearly what the premium is on ---------- */
const prices34Base40=prices34;
prices34=function(M){
  let h=prices34Base40(M);
  try{
    const S=state.settings||{}, q=num(S.quarterlyPremium), mo=num(S.monthlyPremium);
    h=h.replace(/<th class="n">Quarterly \(\+[^)]*\)<\/th><th class="n">Monthly \(\+[^)]*\)<\/th>/g,'<th class="n">Per pilot if quarterly (+'+q+'%)</th><th class="n">Per pilot if monthly (+'+mo+'%)</th>');
    h=h.replace(/billed yearly \(quarterly \+[^,]*, monthly \+[^)]*\)\./g,'billed yearly. Quarterly billing adds '+q+'% and monthly adds '+mo+'% to the whole licence (pilots, cabin crew, admins and instructors). The implementation fee never changes.');
    /* each example: what the same airline pays a year on each billing choice */
    h=h.replace(/(<div class="ex">[\s\S]*?a year<\/b>, plus ([^<]*?) implementation\.<\/div>)/g,(m,all,impl)=>{
      const n=all.match(/→ <b>\$?([\d,\.]+)[^<]*a year<\/b>/); if(!n) return all;
      return all.replace(/<\/div>$/,'<div class="bx40">Whole licence a year: <b>annual '+$(num(n[1].replace(/,/g,'')))+'</b> · quarterly '+$(num(n[1].replace(/,/g,''))*(1+q/100))+' (4 × '+$(num(n[1].replace(/,/g,''))*(1+q/100)/4)+') · monthly '+$(num(n[1].replace(/,/g,''))*(1+mo/100))+' (12 × '+$(num(n[1].replace(/,/g,''))*(1+mo/100)/12)+'). Implementation stays '+impl+'.</div></div>');
    });
  }catch(e){ console.warn('v40 prices',e); }
  return h;
};

/* ---------- 6) events ---------- */
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return; const act=el.dataset.act;
  if(act!=='bill40'&&act!=='fp40') return;
  e.stopImmediatePropagation();
  if(readOnly||cfgLocked){ toast('View only.'); render(); return; }
  const a=state.airlines.find(x=>x.id===el.dataset.v); if(!a) return;
  if(act==='bill40'){
    a.billing=el.value==='monthly'||el.value==='quarterly'?el.value:'annual';
    commit(); toast(a.name+' now '+billLab40(a)+'. Press Save to keep it.');
  } else {
    const y=el.dataset.y, v=Math.max(0,Math.round(num(el.value)));
    const P=Object.assign({},a.fleetPlan||{}); if(v) P[y]=v; else delete P[y];
    a.fleetPlan=P; view.fp40=true; persistView();
    commit(); toast(a.name+': '+(v?'+'+v+' aircraft in '+y:'no aircraft added in '+y)+'. Press Save to keep it.');
  }
},true);
document.addEventListener('toggle',e=>{ const d=e.target; if(d&&d.dataset&&d.dataset.d40){ view.fp40=d.open; persistView(); } },true);
