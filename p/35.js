/* ===== v35: quarterly billing (+10%) next to annual and monthly (+15%) · cash for quarterly airlines arrives every
   3 months · faster pages (the whole-company model is worked out once per change, not on every call). ===== */

/* ---------- 1) one-time settings update ---------- */
function mig35(s){
  if(!s||!s.settings||num(s.settings.bill35)>=1) return false;
  s.settings.monthlyPremium=15; s.settings.quarterlyPremium=10; s.settings.bill35=1; return true;
}
const applyDraftBase35=applyDraft;
applyDraft=function(){
  applyDraftBase35();
  if(readOnly||cfgLocked) return;
  if(mig35(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Billing set: quarterly +10%, monthly +15%. Press Save to keep it.'),1400); }
};

/* ---------- 2) price: quarterly premium ---------- */
const airlineEconBase35=airlineEcon;
airlineEcon=function(s,a,k){
  if(!a||a.billing!=='quarterly') return airlineEconBase35(s,a,k);
  const e=airlineEconBase35(s,Object.assign({},a,{billing:'annual'}),k);
  const f=1+num(s&&s.settings&&s.settings.quarterlyPremium)/100;
  if(f===1) return e;
  const sc={}; Object.keys(e.seats||{}).forEach(x=>{ sc[x]=num(e.seats[x])*f; });
  return Object.assign({},e,{seats:sc,arr:num(e.arr)*f,rate:num(e.rate)*f,perPilotMonth:num(e.perPilotMonth)*f});
};

/* ---------- 3) cash: quarterly airlines pay a quarter of the year every 3 months ---------- */
const computeBase35=compute;
compute=function(s,scenario){
  const M=computeBase35(s,scenario);
  const Q=(M.airlines||[]).filter(x=>x&&x.a&&x.a.billing==='quarterly'&&isFinite(x.live)&&typeof x.econ==='function');
  if(!Q.length) return M;
  const N=M.months.length, t0=monthIndex(M.months[0].ym), d=new Array(N).fill(0);
  const add=(i,amt,x,sign)=>{ if(i<0||i>=N) return; const m=M.months[i]; m.billed=num(m.billed)+sign*amt; const j=i+num(x.delay); if(j>=N) return;
    const net=amt*num(x.collect,1), got=net*(1-num(x.wht)), mj=M.months[j]; mj.cashIn=num(mj.cashIn)+sign*got; mj.wht=num(mj.wht)+sign*net*num(x.wht);
    const c=x.a.country||''; mj.byCty=mj.byCty||{}; const b=mj.byCty[c]||(mj.byCty[c]={rev:0,col:0,ev:0,neu:0}); b.col+=sign*got; d[j]+=sign*got; };
  Q.forEach(x=>{
    for(let i=Math.max(0,x.live-t0);i<N;i++){
      const m=t0+i; if((m-x.live)%12!==0) continue;
      const k=Math.floor((m-x.live)/12), amt=x.econ(k).arr*x.w*Math.pow(x.renew,k);
      add(i,amt,x,-1); for(let q=0;q<4;q++) add(i+3*q,amt/4,x,1);
    }
  });
  let run=0; M.months.forEach((m,i)=>{ run+=d[i]; if(run) m.cash=num(m.cash)+run; });
  return M;
};

/* invoices: quarterly airlines get an invoice every 3 months */
const planEventsBase35=planEvents;
planEvents=function(a,fromI,toI){
  if(!a||a.billing!=='quarterly') return planEventsBase35(a,fromI,toI);
  const ev=planEventsBase35(a,fromI,toI).filter(e=>e.kind!=='License');
  const li=monthIndex(timingOf(state,a).live);
  if(isFinite(li)) for(let m=Math.max(li,fromI);m<=toI;m++){ if((m-li)%3!==0) continue; const k=Math.floor((m-li)/12); ev.push({kind:'License',ym:ymFromIndex(m),amount:airlineEcon(state,a,k).arr/4}); }
  return ev.sort((x,y)=>x.ym.localeCompare(y.ym));
};

/* ---------- 4) billing choice everywhere an airline's billing is picked ---------- */
const inpBase35=inp;
inp=function(path,o){
  if(o&&o.type==='select'&&/(^|\.)billing$/.test(String(path))){
    const S=state.settings||{};
    o=Object.assign({},o,{options:[{v:'annual',l:'Annual'},{v:'quarterly',l:'Quarterly +'+num(S.quarterlyPremium)+'%'},{v:'monthly',l:'Monthly +'+num(S.monthlyPremium)+'%'}]});
  }
  return inpBase35(path,o);
};

/* ---------- 5) speed: remember the whole-company model until something changes ---------- */
const modelForBase35=modelFor; let mf35=null;
modelFor=function(sc,mode){
  let k=null;
  try{ k=(sc&&sc.id)+'|'+(mode||view.scenario)+'|'+asOfYm()+'|'+hash(JSON.stringify(state)); }catch(e){}
  if(k&&mf35&&mf35.k===k) return mf35.M;
  const M=modelForBase35(sc,mode);
  if(k) mf35={k,M};
  return M;
};

/* ---------- 6) the "billed yearly / monthly" note on the forecast airline rows ---------- */
const f32TableBase35=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase35(M,Y,canEdit,partial);
  const q=new Set((M.airlines||[]).filter(x=>x.a&&x.a.billing==='quarterly').map(x=>x.a.id));
  if(!q.size) return h;
  return h.replace(/<tr class="air"><td><button class="an" data-act="open-airline" data-v="([^"]+)">([\s\S]*?)<\/tr>/g,(m,id)=>q.has(id)?m.replace('<small>billed yearly</small>','<small>billed quarterly</small>'):m);
};

/* ---------- 7) "Airlines in this forecast" list shows the same numbers as the forecast table ----------
   ARR yr 1 is a full 12 months of licence; the table counts only the months each airline is live in the year.
   Each row now also shows the licence, implementation and revenue it adds to the chosen year, so the totals match. */
let last35=null;
const f32TableBase35b=f32Table;
f32Table=function(M,Y,canEdit,partial){ last35={M,Y}; return f32TableBase35b(M,Y,canEdit,partial); };
function yearByAir35(M,Y){
  const t0=monthIndex(M.months[0].ym), idx=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===Y) idx.push(i); });
  const out={};
  (M.airlines||[]).forEach(x=>{
    if(!x||!x.a) return; let lic=0, imp=0;
    idx.forEach(i=>{ const m=t0+i;
      if(isFinite(x.live)&&m>=x.live&&typeof x.econ==='function'){ const k=Math.floor((m-x.live)/12); lic+=x.econ(k).arr*x.w*Math.pow(x.renew,k)/12; }
      if(m===x.sign) imp+=num(x.e&&x.e.impl)*num(x.w,1);
    });
    out[x.a.id]={lic,imp,fs:imp?num(x.fimpl):0};
  });
  let tl=0, ti=0, tf=0; idx.forEach(i=>{ tl+=num(M.months[i].recurring); ti+=num(M.months[i].impl); tf+=num(M.months[i].fimpl); });
  return {air:out,tl,ti,tf};
}
const forecastBase35=forecast;
forecast=function(M){
  last35=null;
  let h=forecastBase35(M);
  if(!last35||h.indexOf('fcap-t')<0) return h;
  try{
    const Y=String(last35.Y), R=yearByAir35(last35.M,Y), A=R.air;
    const grp={}; const addG=(k,v)=>{ const g=grp[k]||(grp[k]={lic:0,imp:0,fs:0}); g.lic+=v.lic; g.imp+=v.imp; g.fs+=num(v.fs); };
    state.airlines.forEach(a=>{ const v=A[a.id]; if(!v) return; const r=regionOf(state,a.country); addG('r|'+(r?r.name:'Unassigned'),v); addG('c|'+ctyKey14(a),v); addG('t',v); });
    const d=x=>Math.abs(x)<0.5?'–':$(x);
    const cells=v=>v?'<td class="n"><b>'+d(v.lic)+'</b></td><td class="n">'+d(v.imp)+'</td><td class="n">'+(num(v.fs)>=0.5?'−'+$(v.fs):'–')+'</td><td class="n"><b>'+d(v.imp-num(v.fs))+'</b></td>':'<td class="n muted">–</td><td class="n muted">–</td><td class="n muted">–</td><td class="n muted">–</td>';
    const unesc=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    h=h.replace('<th class="n">ARR yr 1</th><th class="n">Impl.</th></tr></thead>','<th class="n" title="A full 12 months of licence at first-year prices">ARR yr 1 (12 months)</th><th class="n">Impl.</th><th class="n" title="Licence earned in '+Y+': only the months the airline is live">Licences '+Y+'</th><th class="n">Implementation '+Y+'</th><th class="n">Founders’ share '+Y+'</th><th class="n">Implementation kept '+Y+'</th></tr></thead>');
    const a0=h.indexOf('<table class="fin fcap-t">'), a1=a0>=0?h.indexOf('</table>',a0):-1;
    if(a0<0||a1<0) return h;
    let tb=h.slice(a0,a1);
    tb=tb.replace(/(<tr class="(?:rg|cg|ar|ar off14)"[^>]*><td>[^]*?data-act="fc-ap-(region|country|airline)" data-v="([^"]*)"[^]*?)<\/tr>/g,(m,body,kind,v)=>{
      const key=unesc(v), val=kind==='airline'?A[key]:(grp[(kind==='region'?'r|':'c|')+key]||{lic:0,imp:0,fs:0});
      return body+cells(val)+'</tr>';
    });
    h=h.slice(0,a0)+tb+h.slice(a1);
    const T=grp.t||{lic:0,imp:0}, diff=Math.abs(R.tl-T.lic)>1||Math.abs(R.ti-T.imp)>1;
    h=h.replace(/(<tr class="total"><td>Selected total<\/td>[\s\S]*?)<\/tr><\/tbody><\/table>/,(m,body)=>body+'<td class="n"><b>'+$(R.tl)+'</b></td><td class="n">'+$(R.ti)+'</td><td class="n">'+(R.tf>=0.5?'−'+$(R.tf):'–')+'</td><td class="n"><b>'+$(R.ti-R.tf)+'</b></td></tr></tbody></table>');
    h=h.replace(/<p class="hint">ARR yr 1 and Implementation are the first contract year[\s\S]*?<\/p><\/details>/,'<p class="hint"><b>How these numbers match the table below:</b> ARR yr 1 is a full 12 months of licence. <b>Licences '+Y+'</b> counts only the months each airline is live in '+Y+' (an airline that goes live in October adds 3 months), and implementation is counted in the month the contract is signed. Licence money and implementation money are kept apart: the <b>'+Y+'</b> columns match the Licence money, Implementation fees, Founders’ share and Implementation kept lines of the forecast table, and the ARR at year end equals the ARR yr 1 of everyone live by December.'+(diff?' Totals include your manual edits in the forecast table.':'')+' Lost deals are never included.</p></details>');
  }catch(e){ console.warn('v35 list',e); }
  return h;
};

/* ---------- 8) buttons that "sometimes don't work": when you type in a box and then click a button straight away,
   the box saves on blur and the page redraws between mouse-down and mouse-up, so the browser drops the click.
   We remember what was pressed and click the same button on the redrawn page. ---------- */
let pd35=null;
const attrs35=['data-act','data-v','data-i','data-k','data-f','data-g','data-c32','data-id','data-d25','data-d32'];
const sel35=el=>el.tagName.toLowerCase()+attrs35.filter(a=>el.hasAttribute(a)).map(a=>'['+a+'="'+(window.CSS&&CSS.escape?CSS.escape(el.getAttribute(a)):el.getAttribute(a).replace(/"/g,'\\"'))+'"]').join('');
document.addEventListener('pointerdown',e=>{
  pd35=null; if(e.button!==0||!e.target||!e.target.closest) return;
  const el=e.target.closest('[data-act],button,summary,a[href]'); if(!el||el.tagName==='INPUT'||el.tagName==='SELECT'||el.tagName==='TEXTAREA') return;
  try{ const sel=sel35(el), txt=el.textContent.trim(), all=Array.from(document.querySelectorAll(sel)).filter(x=>x.textContent.trim()===txt);
    pd35={el,sel,txt,idx:all.indexOf(el),t:Date.now()}; }catch(err){ pd35=null; }
},true);
let pend35=null;
document.addEventListener('click',e=>{ const p=pend35; if(!p||!e.target||!e.target.closest) return; try{ if(e.target.closest(p.sel)) p.done=true; }catch(err){} },true);
document.addEventListener('pointerup',()=>{
  const p=pd35; pd35=null; if(!p||p.el.isConnected||Date.now()-p.t>4000) return;
  pend35=p;
  setTimeout(()=>{ pend35=null; if(p.done) return; try{
    const all=Array.from(document.querySelectorAll(p.sel)).filter(x=>x.textContent.trim()===p.txt);
    const n=all[p.idx]||(all.length===1?all[0]:null); if(n&&n.isConnected&&!n.disabled) n.click();
  }catch(err){} },40);
},true);
