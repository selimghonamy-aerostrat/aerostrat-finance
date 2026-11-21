/* ===== v50: one portal. Workspace switch Sales · Onboarding · Finance, and "Updates from Sales & Onboarding":
   the changes recorded there (status, sign and go-live months, contract terms, new airlines) are offered here,
   and a Finance user applies them and saves as usual. Sales never writes to Finance data; Finance only reads
   /api/sales. Applying a signing creates the implementation fee invoice from the plan. ===== */
(function(){
  if(document.getElementById('v50-css')) return;
  const st=document.createElement('style'); st.id='v50-css'; st.textContent=[
    '.s50{margin-bottom:16px}',
    '.s50 .s50-h{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}',
    '.s50 .s50-h .grow{flex:1;min-width:220px}',
    '.s50 h3{margin:0 0 4px}',
    '.s50 .s50-ok{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}',
    '.s50 table{width:100%;border-collapse:collapse;font-size:13px;margin-top:10px}',
    '.s50 th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);padding:7px 8px;border-bottom:1px solid var(--line)}',
    '.s50 td{padding:8px;border-bottom:1px solid var(--line);vertical-align:top}',
    '.s50 td.s50-a{white-space:nowrap;text-align:right}',
    '.s50 .s50-new{display:inline-block;font-size:11px;font-weight:700;padding:1px 7px;border-radius:999px;background:var(--good-soft,#e3f4ea);color:var(--good,#1d7a46);margin-left:6px}',
    '.s50 .s50-to{font-weight:600;color:var(--navy)}',
    '.s50 .btn.small{margin-left:4px}',
    '@media (max-width:760px){.s50 thead{display:none}.s50 tr{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;padding:10px 0;border-bottom:1px solid var(--line)}.s50 td{border:0;padding:0}.s50 td:first-child,.s50 td.s50-a{grid-column:1/-1;text-align:left}}'
  ].join('\n');
  document.head.appendChild(st);
})();
let sales50=null, sales50Err='', sales50Busy=false;
const IGN50='aerostrat-fin-ignored-v1';
const ign50=()=>{ try{ return JSON.parse(localStorage.getItem(IGN50)||'{}'); }catch(e){ return {}; } };
const esc50=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm50=s=>String(s||'').toLowerCase().replace(/\(.*?\)/g,'').replace(/[^a-z0-9]+/g,' ').trim();
async function loadSales50(){
  if(sales50Busy) return; sales50Busy=true;
  try{
    const au=JSON.parse(localStorage.getItem('stratos-auth-v1')||'null');
    const r=await fetch('/api/sales',{headers:{'x-app-key':au?au.key:'','x-app-user':au?au.name:''},cache:'no-store'});
    if(!r.ok) throw new Error('Sales answered '+r.status);
    const j=await r.json(); sales50=(j.exists&&j.data)?j.data:{leads:[]}; sales50Err='';
  }catch(e){ sales50Err=String(e&&e.message||e); }
  sales50Busy=false; try{ render(); }catch(e){}
}
/* the same rules as Sales & Onboarding (syncChanges in s/sales.js) */
const STAGES50=['Researched','Contact found','First touch','HQ discovery','Building demo','Demo presented','C-level meeting','Proposal sent','Signed','Paid','Implementation','Onboarded','Nurture','Lost','Do not approach'];
const CUST50=['Signed','Paid','Implementation','Onboarded'];
const RANK50={Pipeline:0,Contacted:1,Demo:2,Negotiating:3,Signed:4,Live:5};
const FST50={'Researched':'Pipeline','Contact found':'Pipeline','First touch':'Contacted','HQ discovery':'Demo','Building demo':'Demo','Demo presented':'Demo','C-level meeting':'Negotiating','Proposal sent':'Negotiating','Signed':'Signed','Paid':'Signed','Implementation':'Signed','Onboarded':'Live','Lost':'Lost'};
function changes50(l,a){
  const out=[], str=v=>(v==null?'':String(v));
  const want=FST50[l.stage||'Researched'], cur=a.status||'Pipeline';
  if(want&&(want==='Lost'?cur!=='Lost':cur!=='Lost'&&RANK50[want]>(RANK50[cur]==null?-1:RANK50[cur]))) out.push({k:'status',lab:'Status',from:cur,to:want});
  const D=l.dates||{}, ym=v=>String(v).slice(0,7);
  if(D.signed&&str(a.signMonth)!==ym(D.signed)) out.push({k:'signMonth',lab:'Sign month',from:a.signMonth||'',to:ym(D.signed)});
  const gl=D.goLive||D.onboarded;
  if(gl&&str(a.goLiveMonth)!==ym(gl)) out.push({k:'goLiveMonth',lab:'Go-live month',from:a.goLiveMonth||'',to:ym(gl)});
  if(CUST50.includes(l.stage)){
    [['product','Product'],['billing','Billing']].forEach(([k,lab])=>{ if(l[k]&&str(a[k])!==str(l[k])) out.push({k,lab,from:a[k]||'',to:l[k]}); });
    [['pilotsConfirmed','pilots','Pilots'],['instructors','instructors','Instructors'],['admins','admins','Admins'],['cabin','cabin','Cabin crew'],['discount','discount','Discount %'],['implOverride','implOverride','Implementation fee']].forEach(([lk,fk,lab])=>{
      let v=l[lk]; if(lk==='cabin'&&l.cabinOn===false) v=0;
      if(isSet(v)&&(!isSet(a[fk])||num(a[fk])!==num(v))) out.push({k:fk,lab,from:a[fk]==null?'':a[fk],to:num(v)});
    });
  }
  return out;
}
function finFor50(l){
  let a=l.finId?state.airlines.find(x=>x.id===l.finId):null;
  if(!a&&!l.finId&&!l.finNone) a=state.airlines.find(x=>norm50(x.name)===norm50(l.name)&&(x.country||'')===(l.country||''))||null;
  return a;
}
function updates50(){
  if(!sales50) return [];
  const out=[], ig=ign50();
  (sales50.leads||[]).forEach(l=>{
    const stg=l.stage||'Researched'; if(stg==='Do not approach') return;
    const a=finFor50(l);
    if(a){ changes50(l,a).forEach(c=>out.push({key:a.id+'|'+c.k+'|'+c.to,l,a,c})); return; }
    if(stg==='Lost'||stg==='Nurture') return;
    if(l.finNone||STAGES50.indexOf(stg)>=STAGES50.indexOf('First touch')) out.push({key:'new|'+l.id,l,a:null,c:{k:'new',lab:'Add to Finance',from:'',to:FST50[stg]||'Pipeline'}});
  });
  return out.filter(u=>!ig[u.key]);
}
function apply50(list){
  if(readOnly){ toast('View only: you cannot change Finance here.'); return; }
  let n=0; const signed=new Set();
  list.forEach(u=>{
    let a=u.a;
    if(u.c.k==='new'){
      a=newAirline({name:u.l.name||'New airline',country:u.l.country||'',fleet:num(u.l.fleet)||4,status:'Pipeline',notes:'Added from Sales & Onboarding'});
      state.airlines.push(a); n++;
      changes50(u.l,a).forEach(c=>{ a[c.k]=c.to; if((c.k==='status'&&c.to==='Signed')||c.k==='signMonth') signed.add(a.id); });
      return;
    }
    if(!state.airlines.includes(a)) return;
    a[u.c.k]=u.c.to; n++;
    if((u.c.k==='status'&&(u.c.to==='Signed'||u.c.to==='Live'))||u.c.k==='signMonth'||u.c.k==='goLiveMonth') signed.add(a.id);
  });
  let inv=0; signed.forEach(id=>{ const a=state.airlines.find(x=>x.id===id); if(a&&(a.status==='Signed'||a.status==='Live')) inv+=generateInvoices(id)||0; });
  commit();
  toast(n+' update'+(n===1?'':'s')+' applied'+(inv?', '+inv+' invoice'+(inv===1?'':'s')+' created from the plan':'')+'. Click Save to keep them.');
}
function panel50(){
  const U=updates50(), stale=sales50Err?'<p class="muted small">Sales & Onboarding could not be read: '+esc50(sales50Err)+'.</p>':'';
  if(!U.length) return '<div class="panel s50"><div class="s50-ok"><span class="adot good"></span><span>Finance is in step with Sales &amp; Onboarding.</span><span class="grow"></span><button class="btn small" data-s50="refresh">Check again</button></div>'+stale+'</div>';
  const rows=U.map((u,i)=>'<tr><td><b>'+esc50(u.l.name)+'</b>'+(u.c.k==='new'?'<span class="s50-new">New</span>':'')+'<div class="muted small">'+esc50(u.l.stage||'')+(u.l.country?' · '+esc50(u.l.country):'')+'</div></td><td>'+esc50(u.c.lab)+'</td><td>'+esc50(u.c.k==='new'?'Not in Finance':(u.c.from===''?'—':u.c.from))+'</td><td class="s50-to">'+esc50(u.c.k==='new'?'Add as '+u.c.to:u.c.to)+'</td><td class="s50-a"><button class="btn small cta" data-s50="apply" data-i="'+i+'"'+(readOnly?' disabled':'')+'>Apply</button><button class="btn small" data-s50="ignore" data-i="'+i+'">Ignore</button></td></tr>').join('');
  return '<div class="panel s50"><div class="s50-h"><div class="grow"><h3>Updates from Sales &amp; Onboarding <span class="muted">('+U.length+')</span></h3><p class="muted small">Recorded in Sales &amp; Onboarding. Nothing changes in Finance until you apply them and Save. Applying a signing creates the implementation fee invoice.</p></div><button class="btn small" data-s50="refresh">Check again</button><button class="btn small cta" data-s50="all"'+(readOnly?' disabled':'')+'>Apply all ('+U.length+')</button></div>'
    +'<table><thead><tr><th>Airline</th><th>Change</th><th>Finance now</th><th>Sales says</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>'+stale+'</div>';
}
function paint50(){
  if(loading||!(view.tab==='overview'||view.tab==='pipeline')) return;
  if(!sales50&&!sales50Err) return;
  const c=document.getElementById('content'); if(!c) return;
  const old=document.getElementById('s50'); if(old) old.remove();
  const d=document.createElement('div'); d.id='s50'; d.innerHTML=panel50(); c.insertBefore(d,c.firstChild);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-s50]'); if(!b) return;
  e.preventDefault();
  const act=b.dataset.s50, U=updates50();
  if(act==='refresh'){ loadSales50(); return; }
  if(act==='all'){ apply50(U); return; }
  const u=U[+b.dataset.i]; if(!u) return;
  if(act==='apply') apply50([u]);
  else if(act==='ignore'){ const ig=ign50(); ig[u.key]=new Date().toISOString(); try{ localStorage.setItem(IGN50,JSON.stringify(ig)); }catch(err){} render(); }
});
const shellBase50=shell;
shell=function(){
  return shellBase50().replace(/<nav class="ws-switch"[\s\S]*?<\/nav>/,'<nav class="ws-switch" aria-label="Workspace"><a href="/sales#overview">Sales</a><a href="/sales#onboarding">Onboarding</a><a href="/#overview" aria-current="page">Finance</a></nav>');
};
const renderBase50=render;
render=function(){ const r=renderBase50.apply(this,arguments); try{ paint50(); }catch(e){} return r; };
setTimeout(loadSales50,1200); setInterval(()=>{ if(!document.hidden) loadSales50(); },300000);
