/* ===== v21: give ticked airlines without dates a sign / go-live month in one click (Forecast) ===== */
(function(){
  if(document.getElementById('v21-css')) return;
  const st=document.createElement('style'); st.id='v21-css';
  st.textContent='.und21{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;color:var(--ink)}.und21 label{display:inline-flex;gap:6px;align-items:center;font-size:12.5px}';
  document.head.appendChild(st);
})();
const und21=()=>fcApRows14(fcF()).filter(x=>x.on&&x.undated&&x.ok);
const forecastBase21=forecast;
forecast=function(M){
  const h=forecastBase21(M); if(readOnly) return h;
  const und=und21(); if(!und.length) return h;
  const d0=ymFromIndex(monthIndex(asOfYm())+6);
  const ctl='<span class="und21"><label>Sign in <input type="month" class="in w-m" id="und21-sign" value="'+d0+'" aria-label="Sign month"></label><label>go live <input type="number" class="in w-xs" id="und21-gap" value="2" min="0" step="1" aria-label="Months from signing to go-live"> months later</label><button class="btn small cta-outline" data-act="und21-set">Give these '+und.length+' airlines these dates</button></span>';
  return h.replace(/(<p class="fc16-warn">[\s\S]*?)(<\/p>)/,'$1'+ctl+'$2');
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act="und21-set"]'); if(!b||readOnly) return;
  const s=(document.getElementById('und21-sign')||{}).value||'', g=Math.max(0,parseInt((document.getElementById('und21-gap')||{}).value,10)||0);
  if(!/^\d{4}-\d{2}$/.test(s)){ toast('Pick a sign month first.'); return; }
  const live=ymFromIndex(monthIndex(s)+g), ids=new Set(und21().map(x=>x.a.id)); let n=0;
  state.airlines.forEach(a=>{ if(ids.has(a.id)){ a.cohort=''; a.signMonth=s; a.goLiveMonth=live; n++; } });
  commit();
  toast(n+' airline'+(n===1?'':'s')+' now sign in '+ymLabel(s)+' and go live in '+ymLabel(live)+'. Change any of them on the Pipeline tab; click Save to keep it.');
});
