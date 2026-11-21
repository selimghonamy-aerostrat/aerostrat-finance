/* ===== v34: pricing you can edit inside the tracker — each product has its own pilot tiers, per-pilot price and
   implementation fee · new Pricing tab (and the same editor in Settings) · bundle set to $17 / $14 / $12
   for 1–100 / 101–180 / 181+ pilots. ===== */

/* ---------- 1) calculation: each product uses its own tiers ---------- */
const airlineEconBase34=airlineEcon;
airlineEcon=function(s,a,k){
  const P=s&&a&&s.products?productOf(s,a):null;
  if(P&&Array.isArray(P.bands)&&P.bands.length){ const keep=s.bands; s.bands=P.bands; try{ return airlineEconBase34(s,a,k); } finally{ s.bands=keep; } }
  return airlineEconBase34(s,a,k);
};
const bandsOf34=P=>(P&&Array.isArray(P.bands)&&P.bands.length)?P.bands:(state.bands||[]);

/* ---------- 2) one-time update: own tiers for every product, new bundle prices ---------- */
function mig34(s){
  if(!s||!s.settings||!Array.isArray(s.products)||num(s.settings.price34)>=1) return false;
  const G=JSON.parse(JSON.stringify(s.bands||[{label:'Tier 1',maxPilots:100},{label:'Tier 2',maxPilots:300},{label:'Tier 3',maxPilots:null}]));
  s.products.forEach(p=>{
    if(!Array.isArray(p.bands)||!p.bands.length) p.bands=JSON.parse(JSON.stringify(G));
    const n=p.bands.length; p.rates=(p.rates||[]).slice(0,n); p.impl=(p.impl||[]).slice(0,n);
    while(p.rates.length<n) p.rates.push(p.rates.length?p.rates[p.rates.length-1]:0);
    while(p.impl.length<n) p.impl.push(p.impl.length?p.impl[p.impl.length-1]:0);
  });
  const b=s.products.find(p=>p.id==='bundle');
  if(b){ b.bands=[{label:'Tier 1',maxPilots:100},{label:'Tier 2',maxPilots:180},{label:'Tier 3',maxPilots:null}]; b.rates=[17,14,12];
    const im=(b.impl||[]).slice(0,3); while(im.length<3) im.push(im.length?im[im.length-1]:0); b.impl=im; }
  s.settings.price34=1; return true;
}
const applyDraftBase34=applyDraft;
applyDraft=function(){
  applyDraftBase34();
  if(readOnly||cfgLocked) return;
  if(mig34(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Bundle pricing updated to $17 / $14 / $12 (1–100 / 101–180 / 181+ pilots). Press Save to keep it.'),700); }
};

/* ---------- 3) styles ---------- */
(function(){ try{ if(document.getElementById('v34-css')) return; const st=document.createElement('style'); st.id='v34-css';
  st.textContent=[
  '.pp34{border-top:4px solid var(--pc,var(--c-deep))}',
  '.pp34 .ph{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:0 0 12px}',
  '.pp34 .ph .in.w-l{font-weight:700;font-size:15px}',
  '.pp34 .meta{color:var(--muted);font-size:12.5px}',
  '.pp34 table td{padding:6px 8px;vertical-align:middle}','.pp34 table .in.num{width:96px;text-align:right}',
  '.pp34 .rng{white-space:nowrap;font-size:13px}','.pp34 .rng .in{width:76px}',
  '.pp34 .ex{margin:10px 0 0;padding:10px 12px;border-radius:8px;background:var(--tint);font-size:13px}',
  '.pp34 .warn34{color:var(--coral);font-size:12px}',
  '.pp34 .seats{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:13px}','.pp34 .seats label{display:inline-flex;gap:6px;align-items:center}',
  '.pr34-sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:0 0 14px}',
  '.pr34-sum .k{border:1px solid var(--line);border-radius:10px;background:var(--panel);padding:10px 14px;border-left:4px solid var(--pc,var(--c-deep))}',
  '.pr34-sum .k span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}','.pr34-sum .k b{display:block;font-size:18px;margin-top:2px}'
  ].join('\n');
  document.head.appendChild(st); }catch(e){} })();

/* ---------- 4) the editor ---------- */
function prices34(M){
  const P=state.products||[], sp=state.seatPrices||{}, S=state.settings||{}, lock=readOnly||cfgLocked, cur=c=>esc(c&&c!=='MAIN'?c:MAINC());
  const inPlan=state.airlines.filter(a=>a&&a.include!==false&&a.status!=='Lost');
  let h='<div class="sec-head"><div><div class="eyebrow">Pricing</div><h2>Prices, tiers and implementation fees</h2><p>Change any price here. Every airline, forecast, country page and total updates at once. Press Save to keep it for everyone.'+(lock?' <b>View only for your account.</b>':'')+'</p></div><div class="toolbar"><button class="btn" data-act="tab" data-v="forecast">Open the forecast</button></div></div>';
  h+='<div class="pr34-sum">'+P.map(p=>{ const L=inPlan.filter(a=>productOf(state,a).id===p.id), arr=L.reduce((t,a)=>t+airlineEcon(state,a,0).arr,0), imp=L.reduce((t,a)=>t+airlineEcon(state,a,0).impl,0);
    return '<div class="k" style="--pc:'+cv(p.color)+'"><span>'+esc(p.short||p.name)+' · '+L.length+' airline'+(L.length===1?'':'s')+'</span><b>'+$(arr)+' a year</b><span style="text-transform:none;letter-spacing:0">+ '+$(imp)+' implementation</span></div>'; }).join('')+'</div>';
  P.forEach((p,i)=>{
    const B=bandsOf34(p), own=Array.isArray(p.bands)&&p.bands.length, base='products.'+i;
    const bp=own?base+'.bands':'bands';
    let rows='', prevMax=0, bad=false;
    B.forEach((b,j)=>{
      const last=j===B.length-1, from=prevMax+1, mx=num(b.maxPilots);
      if(!last&&isSet(b.maxPilots)&&mx<from) bad=true;
      const prem=num(p.rates&&p.rates[j])*(1+num(S.monthlyPremium)/100), qprem=num(p.rates&&p.rates[j])*(1+num(S.quarterlyPremium)/100);
      rows+='<tr><td>'+inp(bp+'.'+j+'.label',{w:'w-s',label:'Tier name'})+'</td>'+
        '<td class="rng">'+from+' – '+(last?'<b>and above</b>':inp(bp+'.'+j+'.maxPilots',{num:1,label:'Up to pilots'}))+' pilots</td>'+
        '<td class="n">'+inp(base+'.rates.'+j,{num:1,label:(p.short||p.name)+' price per pilot per month, '+(b.label||'tier '+(j+1))})+'</td>'+
        '<td class="n muted small">'+$2(qprem)+'</td><td class="n muted small">'+$2(prem)+'</td>'+
        '<td class="n">'+inp(base+'.impl.'+j,{num:1,label:(p.short||p.name)+' implementation fee, '+(b.label||'tier '+(j+1))})+'</td></tr>';
      prevMax=last?prevMax:(isSet(b.maxPilots)?mx:prevMax);
    });
    const ratio=num(state.ratios&&state.ratios.pilotsPerAircraft,10)||10, exP=num(view.ex34&&view.ex34[p.id],120);
    const e=airlineEcon(state,{fleet:Math.max(1,Math.round(exP/ratio)),pilots:exP,cabin:'',instructors:'',admins:'',product:p.id,billing:'annual',discount:0},0);
    const seatTxt=['cabin','admin','instructors'].filter(k=>num(e.seats[k])>0).map(k=>({cabin:'cabin crew ',admin:'admins ',instructors:'instructors '}[k])+$(e.seats[k])).join(', ');
    h+='<div class="panel mb pp34" style="--pc:'+cv(p.color)+'"><div class="ph">'+inp(base+'.name',{w:'w-l',label:'Product name'})+inp(base+'.short',{w:'w-s',label:'Short name'})+'<span class="meta">Prices in '+cur(p.currency)+' per pilot per month, billed yearly (quarterly +'+num(S.quarterlyPremium)+'%, monthly +'+num(S.monthlyPremium)+'%). Whole airline pays the rate of the tier its pilot count falls in.</span></div>'+
      '<div class="tbl-wrap"><table class="fin"><thead><tr><th>Tier</th><th>Pilots</th><th class="n">Price / pilot / month</th><th class="n">Quarterly (+'+num(S.quarterlyPremium)+'%)</th><th class="n">Monthly (+'+num(S.monthlyPremium)+'%)</th><th class="n">Implementation (one-time)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
      (bad?'<p class="warn34">A tier ends below where it starts. Make each “up to” number bigger than the one above it.</p>':'')+
      (lock?'':'<div class="toolbar mt"><button class="btn small" data-act="pt34-add" data-i="'+i+'">+ Add a tier</button>'+(B.length>1?'<button class="btn small" data-act="pt34-del" data-i="'+i+'">Remove last tier</button>':'')+'</div>')+
      '<div class="seats"><span class="muted">Also charges:</span>'+[['cabin','Cabin crew'],['admin','Admins'],['instructor','Instructors']].map(([k,l])=>'<label>'+inp(base+'.seats.'+k,{type:'checkbox',label:l})+' '+l+'</label>').join('')+'</div>'+
      '<div class="ex">Example: an airline with <input class="in num" style="width:72px" type="number" min="1" step="1" data-act="ex34" data-v="'+esc(p.id)+'" value="'+exP+'" aria-label="Example pilots"> pilots is in <b>'+esc((B[e.tier0]||{}).label||'Tier '+(e.tier0+1))+'</b>: '+$2(e.rate)+' × '+exP+' pilots × 12 = <b>'+$(e.seats.pilots)+'</b> a year'+(seatTxt?' + '+seatTxt:'')+' → <b>'+$(e.arr)+' a year</b>, plus '+$(e.impl)+' implementation.</div></div>';
  });
  h+='<div class="panel mb"><h3>Seats and billing (all products)</h3><div class="fields">'+
    fld('Cabin crew, per person / month',inp('seatPrices.cabinRate',{num:1}))+fld('Admin, per person / month',inp('seatPrices.adminRate',{num:1}))+fld('Instructor, per person / month',inp('seatPrices.instructorRate',{num:1}))+
    fld('Quarterly billing premium %',inp('settings.quarterlyPremium',{num:1}))+fld('Monthly billing premium %',inp('settings.monthlyPremium',{num:1}))+fld('Price increase at each renewal %',inp('settings.priceIncrease',{num:1}))+'</div>'+
    '<p class="hint">Implementation fees can also be changed or switched off for one airline on its own page.</p></div>';
  return h;
}

/* ---------- 5) where it shows: a Pricing tab and the Settings page ---------- */
if(!TABS.some(t=>t[0]==='prices')){ const i=TABS.findIndex(t=>t[0]==='forecast'); TABS.splice(i>=0?i+1:TABS.length,0,['prices','Pricing']); }
const overviewBase34=overview;
overview=function(M){ return view.tab==='prices'?prices34(M):overviewBase34(M); };
const settingsBase34=settings;
settings=function(M){
  const h=settingsBase34(M);
  return h.replace(/(<details class="sec25" data-d25="pricing"[^>]*><summary>[\s\S]*?<\/summary><div class="in25">)[\s\S]*?(<\/div><\/details><details class="sec25" data-d25="settings")/,(m,a,b)=>a+prices34(M).replace(/^<div class="sec-head">[\s\S]*?<\/div><\/div>/,'')+b);
};
const forecastBase34=forecast;
forecast=function(M){ return forecastBase34(M).replace('<div class="f32-years"','<button class="btn small" data-act="tab" data-v="prices" style="margin-right:8px">Edit prices</button><div class="f32-years"'); };

/* ---------- 6) events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act; if(a!=='pt34-add'&&a!=='pt34-del') return;
  e.stopImmediatePropagation();
  if(readOnly||cfgLocked){ toast('Only editors can change prices.'); return; }
  const p=state.products[+b.dataset.i]; if(!p) return;
  if(!Array.isArray(p.bands)||!p.bands.length) p.bands=JSON.parse(JSON.stringify(state.bands||[]));
  const B=p.bands;
  if(a==='pt34-add'){
    const prev=B.length>1?num(B[B.length-2].maxPilots):0, last=B[B.length-1];
    last.maxPilots=Math.max(prev+1,prev+100);
    B.push({label:'Tier '+(B.length+1),maxPilots:null});
    p.rates.push(num(p.rates[p.rates.length-1])); p.impl.push(num(p.impl[p.impl.length-1]));
  } else if(B.length>1){ B.pop(); B[B.length-1].maxPilots=null; p.rates=p.rates.slice(0,B.length); p.impl=p.impl.slice(0,B.length); }
  commit();
},true);
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act!=='ex34') return;
  e.stopImmediatePropagation();
  view.ex34=Object.assign({},view.ex34||{}); view.ex34[el.dataset.v]=Math.max(1,Math.round(num(el.value)||1)); persistView(); render();
},true);
