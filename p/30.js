/* ===== v30: a filtered forecast carries the company's exact cost plan, synced with Costs & team,
   plus an itemised "All costs in this forecast" table (every cost line, founder pay, bonus, hire and fee). ===== */
const fcFilteredBase30=fcFiltered;
fcFiltered=function(F){
  const M=fcFilteredBase30(F);
  if(fcCost29()!=='full') return M;
  const Mf=modelFor(curScen()); let d=0;
  M.months.forEach((m,i)=>{
    const g=Mf.months[i]; if(!g) return;
    const old=num(m.costs);
    ['tools','salaries','hires','fees','bonus','bonusFee','fixedCosts','varCosts','salaryEach'].forEach(k=>{ m[k]=num(g[k]); });
    m.byType=Object.assign({},g.byType); m.costItems=Object.assign({},g.costItems); m.hireItems=Object.assign({},g.hireItems);
    m.feeItems=Object.assign({},g.feeItems); m.bonusBy=Object.assign({},g.bonusBy||{});
    m.costs=num(g.costs); m.net=num(m.revenue)-m.costs;
    if('cashOut' in m) m.cashOut=num(m.cashOut)+(m.costs-old);
    d+=m.costs-old; m.cash=num(m.cash)-d; m.cashB=num(m.cashB)-d;
  });
  M.costSynced30=true; M.R=runwayInfo(M.s,M); try{ bonusBreakEven(M); }catch(e){}
  return M;
};
let fcLastM30=null;
const fcFilteredWrap30=fcFiltered;
fcFiltered=function(F){ const M=fcFilteredWrap30(F); if(!fcLastM30) fcLastM30=M; return M; };

function costTable30(M,partial){
  const mode=fcCost29(), ys=aggregate(M.months,byYear), cols=ys.concat([Object.assign(aggregate(M.months,()=>'All years')[0],{isT:true})]);
  const bon={}; M.months.forEach(m=>{ const y=m.ym.slice(0,4); bon[y]=(bon[y]||0)+num(m.bonus); bon['All years']=(bon['All years']||0)+num(m.bonus); });
  const cell=(v,g)=>'<td class="n'+(g.isT?' fcx-tot':'')+'">'+(Math.abs(v)<0.5?'<span class="muted">–</span>':$(v))+'</td>';
  const rows=[], sec=t=>rows.push('<tr class="fcx-sec"><td colspan="'+(cols.length+1)+'"><div><b>'+t+'</b></div></td></tr>');
  const line=(label,sub,f,cls)=>rows.push('<tr class="'+(cls||'sub')+'"><td class="fcx-l">'+label+(sub?'<span class="fcx-d">'+sub+'</span>':'')+'</td>'+cols.map(g=>cell(f(g),g)).join('')+'</tr>');
  const freqL={monthly:'a month',yearly:'a year',once:'one-time'};
  const C=state.costs||[], Hs=state.hires||[], Fs=state.fees||[];
  sec('Company costs');
  if(C.length) C.forEach(c=>line(esc(c.name||'Cost'),(c.basis==='pctRevenue'?num(c.amount)+'% of revenue':$(num(c.amount))+' '+(c.currency&&c.currency!==MAINC()?esc(c.currency)+' ':'')+(freqL[c.freq]||'a month')+(num(c.qty)>1?' × '+num(c.qty):''))+(c.startMonth?' · from '+esc(ymLabel(c.startMonth)):'')+(c.endMonth?' to '+esc(ymLabel(c.endMonth)):''),g=>num((g.costItems||{})[c.id])));
  else rows.push('<tr><td class="fcx-l muted" colspan="'+(cols.length+1)+'">No company costs yet.</td></tr>');
  sec('Founder pay');
  line('Founder salaries','',g=>num(g.salaries)-num(bon[g.key]));
  line('Founder bonuses','',g=>num(bon[g.key]));
  sec('Hires');
  if(Hs.length) Hs.forEach(h=>line(esc(h.role||'Hire'),(h.include===false?'Switched off':$(num(h.salary))+' a month · '+(h.trigger==='arr'?'starts when live ARR reaches '+$k(num(h.value)):h.trigger==='live'?'starts when '+num(h.value)+' airlines are live':(h.month?'starts '+esc(ymLabel(h.month)):'no start date'))),g=>num((g.hireItems||{})[h.id])));
  else rows.push('<tr><td class="fcx-l muted" colspan="'+(cols.length+1)+'">No hires planned.</td></tr>');
  if(Fs.length||cols.some(g=>num(g.fees))){ sec('Taxes and fees'); Fs.forEach(f=>line(esc(f.name||'Fee'),'',g=>num((g.feeItems||{})[f.id]))); }
  const known=g=>Object.values(g.costItems||{}).reduce((t,v)=>t+num(v),0)+num(g.salaries)+Object.values(g.hireItems||{}).reduce((t,v)=>t+num(v),0)+Object.values(g.feeItems||{}).reduce((t,v)=>t+num(v),0);
  if(cols.some(g=>Math.abs(num(g.costs)-known(g))>1)) line('Other','Costs not tied to one line',g=>num(g.costs)-known(g));
  line('<b>Total costs</b>','',g=>num(g.costs),'strong');
  line('Revenue'+(partial?' from the selected airlines':''),'',g=>num(g.revenue));
  rows.push('<tr class="total"><td class="fcx-l">Profit</td>'+cols.map(g=>{ const v=num(g.revenue)-num(g.costs); return '<td class="n'+(g.isT?' fcx-tot':'')+(v<0?' neg':'')+'">'+$(v)+'</td>'; }).join('')+'</tr>');
  const by=meta.savedByName?' by '+esc(meta.savedByName):'';
  const syncTxt=(typeof isDirty==='function'&&isDirty()?'Includes your unsaved changes. ':'')+(meta.savedAt?'Last saved '+esc(fmtWhen(meta.savedAt))+by+'. ':'')+'Checks for newer saves every 30 seconds and updates on its own.';
  const what=!partial?'Whole company plan.':mode==='full'?'The company’s full cost plan, exactly as on Costs & team, against revenue from the selected airlines only.':mode==='share'?'This selection’s share of company costs ('+pct((costShare22||0)*100)+', in line with its revenue).':'Company costs are switched off for this selection.';
  return '<div class="panel flush mb" id="costs30"><div class="panel-head pad"><h3>All costs in this forecast</h3><div class="toolbar"><span class="muted small">'+what+'</span>'+(readOnly?'':'<button class="btn small" data-act="tab" data-v="costs">Edit costs</button>')+'</div></div>'+
    '<p class="hint" style="margin:0;padding:0 16px 10px"><span class="sync30"></span>Synced with Costs & team. '+syncTxt+'</p>'+
    '<div class="tbl-wrap inner"><table class="fin fcxt"><thead><tr><th>Cost</th>'+cols.map(g=>'<th class="n'+(g.isT?' fcx-tot':'')+'">'+esc(g.key)+(!g.isT&&g.months<12?' <span class="nt">('+g.months+' mo)</span>':'')+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div></div>';
}
(function(){ try{ if(document.getElementById('v30-css')) return; const st=document.createElement('style'); st.id='v30-css';
  st.textContent='.sync30{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--good,#2e9d6b);margin-right:6px;vertical-align:middle}'+
  '#costs30 table.fcxt th:first-child,#costs30 table.fcxt td.fcx-l{position:sticky;left:0;z-index:1;background:var(--panel);min-width:220px}'+
  '#costs30 .fcx-d{display:block;font-size:11.5px;color:var(--muted);font-weight:400;margin-top:2px}'+
  '#costs30 tr.fcx-sec td{background:var(--tint)}#costs30 tr.fcx-sec b{font-size:12px;letter-spacing:.06em;text-transform:uppercase}'+
  '#costs30 td.fcx-tot,#costs30 th.fcx-tot{font-weight:600;border-left:1px solid var(--line)}';
  document.head.appendChild(st); }catch(e){} })();

const forecastBase30=forecast;
forecast=function(M){
  fcLastM30=null;
  let h=forecastBase30(M);
  const F=fcF(), fl=fleet22('fc'), partial=!!(F.regions.length||F.countries.length||F.product||fl.on);
  h=h.replace('All company costs, founder salaries, hires, funding and opening cash are counted in full, so this is STRATOS as if only these airlines sign.',
    'Costs are the company’s full plan, exactly as on Costs & team (every cost line, founder pay, bonuses, hires and fees), synced automatically. Funding and opening cash are included, so cash below is STRATOS as if only these airlines sign.');
  h=h.replace('>Count in full</button>','>Company plan (synced)</button>');
  const Mx=partial&&fcLastM30?fcLastM30:M, panel=costTable30(Mx,partial);
  const marks=['<p class="hint" style="margin:0 0 10px"><b>Founder salaries:</b>','<div class="panel mb wf25"'];
  for(const mk of marks){ const k=h.indexOf(mk); if(k>=0) return h.slice(0,k)+panel+h.slice(k); }
  return h+panel;
};
