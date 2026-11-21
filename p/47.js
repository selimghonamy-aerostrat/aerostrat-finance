/* ===== v47: (1) the Forecast follows the airlines you pick. When you pick airlines, every cost is worked out as if
   ONLY those airlines sign: per-airline costs (per live airline, aircraft, pilot, seat, new airline, % of revenue),
   fees that grow with airlines, salary raises and hires set by ARR or by number of live airlines, and bonuses.
   Before, these were copied from the whole plan, so they grew as airlines outside the selection went live.
   Fixed and date-based costs are the same either way. (2) a "Financial health" panel on the Forecast for the chosen
   year, with the cost of one airline. ===== */
(function(){
  try{ if(document.getElementById('v47-css')) return; const st=document.createElement('style'); st.id='v47-css';
    st.textContent=['.h47 summary{cursor:pointer;list-style:none;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}',
      '.h47 summary::-webkit-details-marker{display:none}','.h47 summary h3{margin:0}',
      '.h47 summary h3::before{content:"▸ ";color:var(--muted)}','.h47[open] summary h3::before{content:"▾ "}',
      '.h47g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:12px 0 4px}',
      '.h47t{border:1px solid var(--line);border-left:4px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--panel)}',
      '.h47t.good{border-left-color:#2e9e6b}','.h47t.watch{border-left-color:#e0a100}','.h47t.risk{border-left-color:#e5484d}',
      '.h47t .l{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}',
      '.h47t b{display:block;font-size:19px;margin:2px 0}',
      '.h47t em{font-style:normal;font-size:11.5px;font-weight:700;padding:1px 8px;border-radius:99px;display:inline-block}',
      '.h47t.good em{background:rgba(46,158,107,.15);color:#2e9e6b}','.h47t.watch em{background:rgba(224,161,0,.16);color:#b98400}',
      '.h47t.risk em{background:rgba(229,72,77,.15);color:#e5484d}',
      '.h47t p{margin:6px 0 0;font-size:12.5px;color:var(--muted);line-height:1.4}','.h47 h4{margin:16px 0 0}',
      '.h47 .hint47{font-size:12.5px;color:var(--muted);margin:6px 0 0}'].join(' ');
    document.head.appendChild(st); }catch(e){}
})();

/* ---------- 1) the forecast follows the picked airlines ---------- */
const fcFilteredBase47=fcFiltered;
fcFiltered=function(F){
  const M=fcFilteredBase47(F);
  try{
    if(!M||M.fix47||fcCost29()!=='full'||!M.costSynced30||!M.s) return M;
    M.fix47=true;
    const M0=compute(M.s,view.scenario); try{ addBonuses(M.s,M0); }catch(e){}
    let run=0;
    M.months.forEach((m,i)=>{
      const g=M0.months[i]; if(!g) return;
      ['tools','salaries','hires','fees','bonus','bonusFee','fixedCosts','varCosts','salaryEach','fimpl'].forEach(k=>{ m[k]=num(g[k]); });
      m.byType=Object.assign({},g.byType); m.costItems=Object.assign({},g.costItems); m.hireItems=Object.assign({},g.hireItems);
      m.feeItems=Object.assign({},g.feeItems); m.bonusBy=Object.assign({},g.bonusBy||{});
      const d=num(g.costs)-num(m.costs);
      if(Math.abs(d)>1e-9){ m.costs=num(g.costs); m.net=num(m.net)-d; if('cashOut' in m) m.cashOut=num(m.cashOut)+d; run+=d; }
      if(run){ m.cash=num(m.cash)-run; if('cashB' in m) m.cashB=num(m.cashB)-run; }
    });
    M.costSynced47=true;
    try{ M.R=runwayInfo(M.s,M); }catch(e){}
    try{ bonusBreakEven(M); }catch(e){}
  }catch(e){ console.warn('v47',e); }
  return M;
};

/* ---------- 2) financial health for the chosen year ---------- */
function health47(M,Y,partial){
  const I=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===Y) I.push(i); }); if(!I.length) return '';
  const ms=I.map(i=>M.months[i]), n=ms.length, S=f=>ms.reduce((t,m)=>t+num(f(m)),0);
  const rows=f32Rows(M,I), RF=rows.find(r=>r.id==='k45f'), RV=rows.find(r=>r.id==='k45v');
  const rev=S(m=>m.revenue), lic=S(m=>m.recurring), impl=S(m=>m.impl), cost=S(m=>m.costs), net=S(m=>m.net);
  const fx=RF?S(m=>RF.f(m)):cost, vx=RV?S(m=>RV.f(m)):0;
  const S0=(M.s&&M.s.costs)?M.s:state;
  let once=S(m=>m.fimpl);
  (S0.costs||[]).forEach(c=>{ if(c.basis==='perNewAirline') once+=S(m=>(m.costItems||{})[c.id]); });
  (S0.fees||[]).forEach(f=>{ if(f.basis==='perNewAirline') once+=S(m=>(m.feeItems||{})[f.id]); });
  const runC=Math.max(0,vx-once), signed=S(m=>m.newSigned), avgL=S(m=>m.live)/n;
  const cashOf=m=>num(m.cashB!==undefined?m.cashB:m.cash);
  let lo=ms[0]; ms.forEach(m=>{ if(cashOf(m)<cashOf(lo)) lo=m; });
  const cashEnd=cashOf(ms[n-1]), mCost=cost/n, mFix=fx/n;
  const margin=rev?net/rev*100:NaN, cover=fx>0?lic/fx:Infinity, months=mCost>0?cashEnd/mCost:Infinity, oneShare=rev?impl/rev*100:0;
  const contrib=avgL>0?(lic-runC)/(avgL*n):0, be=contrib>0?mFix/contrib:Infinity;
  const pill={good:'Healthy',watch:'Watch',risk:'Needs action'};
  const tile=(st,label,val,txt)=>'<div class="h47t '+st+'"><span class="l">'+label+'</span><b>'+val+'</b>'+(st?'<em>'+pill[st]+'</em>':'')+'<p>'+txt+'</p></div>';
  const x=v=>isFinite(v)?(Math.round(v*10)/10)+'×':'–';
  const T=[];
  T.push(tile(!isFinite(margin)?'watch':margin>=20?'good':margin>=0?'watch':'risk','Net margin',isFinite(margin)?pct(margin):'–',
    isFinite(margin)?'Of every $100 earned in '+Y+', $'+Math.round(margin)+' is left after all costs. Aim for 20% or more.':'No revenue this year.'));
  const lv=cashOf(lo);
  T.push(tile(lv<0?'risk':lv<3*mCost?'watch':'good','Lowest cash',$(lv),
    (lv<0?'Cash goes below zero in '+esc(ymLabel(lo.ym))+'. You need opening cash, funding or faster payment before then.':'Lowest month-end balance, in '+esc(ymLabel(lo.ym))+'. Keep at least 3 months of costs ('+$(3*mCost)+').')));
  T.push(tile(months>=12?'good':months>=6?'watch':'risk','Months of costs in the bank',isFinite(months)?(months<0?'0':Math.round(months)):'–',
    'Cash at the end of '+Y+' would pay this many months of costs if no money came in. Aim for 12 or more.'));
  T.push(tile(cover>=1.5?'good':cover>=1?'watch':'risk','Licences cover fixed costs',x(cover),
    'Licence money repeats every year; implementation fees do not. Fixed costs should be paid by licences alone. Aim for 1.5× or more.'));
  T.push(tile(!isFinite(be)?'risk':avgL>=2*be?'good':avgL>=be?'watch':'risk','Break-even airlines',isFinite(be)?String(Math.max(1,Math.ceil(be-1e-9))):'–',
    'Live airlines needed for licences to pay the fixed costs. You have '+(Math.round(avgL*10)/10)+' live on average in '+Y+'.'));
  T.push(tile(oneShare<=25?'good':oneShare<=50?'watch':'risk','One-time money',pct(oneShare),
    'Share of revenue from implementation fees, which do not come back next year. Under 25% is healthy.'));
  const P=[];
  if(avgL>0){
    P.push(tile('','Running cost per airline',$(runC/avgL/n)+' / month','Per-airline cost lines (hosting, database, AI…) for one live airline.'));
    P.push(tile('','One-time cost at signing',signed?$(once/signed):'–','Founders’ share and any per-new-airline costs, for each airline that signs.'));
    P.push(tile('','Share of fixed costs',$(fx/avgL)+' / year','Fixed costs of '+Y+' ('+$(fx)+') shared over '+(Math.round(avgL*10)/10)+' live airlines.'));
    P.push(tile('','All-in cost per airline',$(cost/avgL)+' / year','Everything above together: what one airline costs you in '+Y+'.'));
    P.push(tile('','Revenue per airline',$(rev/avgL)+' / year','Licence and implementation money from one airline in '+Y+'.'));
    P.push(tile(net>=0?'good':'risk','Profit per airline',$(net/avgL)+' / year','Revenue minus all-in cost, for one airline.'));
  }
  return '<details class="panel mb h47" open><summary><h3>Financial health '+Y+'</h3><span class="muted small">'+(partial?'For the airlines picked on this page. ':'')+'Green is healthy, amber needs watching, red needs action.</span></summary>'+
    '<div class="h47g">'+T.join('')+'</div>'+
    (P.length?'<h4>One airline in '+Y+'</h4><div class="h47g">'+P.join('')+'</div>':'<p class="hint47">No airline is live in '+Y+' yet, so there is no cost per airline.</p>')+
    '</details>';
}
const f32TableBase47=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase47(M,Y,canEdit,partial);
  try{
    const p=health47(M,String(Y),partial);
    let k=h.indexOf('<div class="y44">'); if(k<0) k=h.indexOf('<div class="panel flush mb">');
    h=k>=0?h.slice(0,k)+p+h.slice(k):p+h;
  }catch(e){ console.warn('v47 health',e); }
  return h;
};
