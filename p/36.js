/* ===== v36: founders take a share of every implementation fee (default $1,000 each, editable, can be switched off
   or changed per founder) · implementation money and licence money shown apart, never added together. ===== */

/* ---------- 1) settings ---------- */
function mig36(s){
  if(!s||!s.settings||num(s.settings.fimpl36)>=1) return false;
  if(!isSet(s.settings.fImplEach)) s.settings.fImplEach=1000;
  if(s.settings.fImplOn===undefined) s.settings.fImplOn=true;
  s.settings.fimpl36=1; return true;
}
const applyDraftBase36=applyDraft;
applyDraft=function(){
  applyDraftBase36();
  if(readOnly||cfgLocked) return;
  if(mig36(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Founders now take $1,000 each from every implementation fee. Change it on the Pricing tab. Press Save to keep it.'),2100); }
};
/* what each founder takes from one implementation */
function fShare36(s){
  const S=(s&&s.settings)||{}; if(S.fImplOn===false) return {each:[],total:0};
  const def=isSet(S.fImplEach)?num(S.fImplEach):1000;
  const each=((s&&s.founders)||[]).map(f=>({name:f.name||'Founder',amt:isSet(f.implCut)?num(f.implCut):def}));
  return {each,total:each.reduce((t,f)=>t+Math.max(0,f.amt),0)};
}

/* ---------- 2) model: a cost in the month the contract is signed, paid out when the fee is collected ---------- */
const computeBase36=compute;
compute=function(s,scenario){
  const M=computeBase36(s,scenario);
  M.months.forEach(m=>{ m.fimpl=0; });
  const per=fShare36(s&&s.founders?s:state).total;
  (M.airlines||[]).forEach(x=>{ if(x) x.fimpl=0; });
  if(!per) return M;
  const N=M.months.length, t0=monthIndex(M.months[0].ym), d=new Array(N).fill(0);
  (M.airlines||[]).forEach(x=>{
    if(!x||!x.e||!(num(x.e.impl)>0)||!isFinite(x.sign)) return;
    const i=x.sign-t0; if(i<0||i>=N) return;
    const amt=Math.min(per,num(x.e.impl))*num(x.w,1); if(!amt) return;
    x.fimpl=amt;
    const m=M.months[i]; m.fimpl+=amt; m.costs=num(m.costs)+amt; m.net=num(m.net)-amt; if(m.byType) m.byType.ga=num(m.byType.ga)+amt;
    const j=Math.min(N-1,i+num(x.delay)); if('cashOut' in M.months[j]) M.months[j].cashOut+=amt; d[j]-=amt;
  });
  let run=0; M.months.forEach((m,i)=>{ run+=d[i]; if(run){ m.cash=num(m.cash)+run; if('cashB' in m) m.cashB=num(m.cashB)+run; } });
  return M;
};

/* ---------- 3) forecast table: a founder-share cost line and a block that keeps the two kinds of money apart ---------- */
if(!SECS32.some(x=>x[0]==='split')){ const i=SECS32.findIndex(x=>x[0]==='rev'); SECS32.splice(i+1,0,['split','Implementation and licences, kept apart','implementation is one-time money, licences repeat every year']); }
const f32RowsBase36=f32Rows;
f32Rows=function(M,I){
  const R=f32RowsBase36(M,I), out=[];
  const row=(sec,id,label,f,o)=>Object.assign({sec,id,label,f,kind:'flow'},o||{});
  R.forEach(r=>{
    if(r.id==='oth'){ const f0=r.f; r=Object.assign({},r,{f:m=>num(f0(m))-num(m.fimpl)}); }
    out.push(r);
    if(r.id==='revenue'){
      out.push(row('split','x36lic','Licence money (all products)',m=>m.recurring,{cls:'key',keep:1}));
      out.push(row('split','x36imp','Implementation fees',m=>m.impl,{cls:'sub',keep:1}));
      out.push(row('split','x36fs','Founders’ share of implementation',m=>-num(m.fimpl),{cls:'sub'}));
      out.push(row('split','x36kept','Implementation money STRATOS keeps',m=>num(m.impl)-num(m.fimpl),{cls:'key',keep:1}));
    }
    if(r.id==='bon') out.push(row('cost','x36fc','Founders’ share of implementation',m=>m.fimpl,{cls:'sub'}));
  });
  return out;
};
/* the top numbers: show implementation, founders' share and licences on their own */
let last36=null;
const f32TableBase36=f32Table;
f32Table=function(M,Y,canEdit,partial){ last36={M,Y}; return f32TableBase36(M,Y,canEdit,partial); };
const forecastBase36=forecast;
forecast=function(M){
  last36=null; let h=forecastBase36(M); if(!last36) return h;
  try{
    const Y=String(last36.Y); let fs=0, im=0; last36.M.months.forEach(m=>{ if(m.ym.slice(0,4)===Y){ fs+=num(m.fimpl); im+=num(m.impl); } });
    const k=(l,v)=>'<div class="f32-kpi"><span>'+l+'</span><b>'+v+'</b></div>';
    const add=k('Founders’ share of impl.',$(fs))+k('Implementation kept',$(im-fs));
    const re=/(<div class="f32-kpi"><span>Implementation fees<\/span><b>[^<]*<\/b><\/div>)/;
    /* shown in the implementation box under the top numbers instead (v41); a plain-string replace here turned $1x,xxx into a copy of the box */
    void add; void re;
  }catch(e){ console.warn('v36 kpi',e); }
  return h;
};

/* ---------- 4) where you change it: Pricing tab (and Settings, which shows the same editor) ---------- */
const prices34Base36=prices34;
prices34=function(M){
  const S=state.settings||{}, F=fShare36(state), lock=readOnly||cfgLocked, def=isSet(S.fImplEach)?num(S.fImplEach):1000;
  let p='<div class="panel mb"><h3>Founders’ share of each implementation fee</h3>'+
    '<p class="hint">Every time an airline signs, each founder takes this amount out of its implementation fee. It is not a fixed rule: switch it off, change the amount for everyone, or set a different amount for one founder (leave a founder’s box empty to use the amount for everyone, put 0 to leave them out).</p>'+
    '<div class="fields">'+fld('Founders take a share',inp('settings.fImplOn',{type:'checkbox',label:'Founders take a share of implementation fees'}))+fld('Amount for each founder, per implementation',inp('settings.fImplEach',{num:1}))+'</div>';
  if(S.fImplOn!==false) p+='<div class="tbl-wrap"><table class="fin"><thead><tr><th>Founder</th><th class="n">Their amount (empty = '+$(def)+')</th><th class="n">Takes per implementation</th></tr></thead><tbody>'+
    (state.founders||[]).map((f,i)=>'<tr><td>'+esc(f.name||'Founder')+'</td><td class="n">'+inp('founders.'+i+'.implCut',{num:1,label:'Amount for '+(f.name||'founder')})+'</td><td class="n">'+$(F.each[i]?Math.max(0,F.each[i].amt):0)+'</td></tr>').join('')+
    '<tr class="total"><td>All founders</td><td></td><td class="n"><b>'+$(F.total)+'</b></td></tr></tbody></table></div>'+
    '<p class="hint">It is counted as a cost in the month the contract is signed and paid when the airline pays the fee. It never takes more than the fee itself. Example: an $8,000 implementation leaves STRATOS '+$(Math.max(0,8000-F.total))+'.</p>';
  p+=(lock?'':'')+'</div>';
  const h=prices34Base36(M), at=h.indexOf('<div class="panel mb"><h3>Seats and billing');
  return at>=0?h.slice(0,at)+p+h.slice(at):h+p;
};
