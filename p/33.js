/* ===== v33: Forecast table shows, month by month, which airline signs (implementation fee) and goes live (licence),
   with a row per airline whose sign and go-live months you can pick right in the table. ===== */
(function(){ try{ if(document.getElementById('v33-css')) return; const st=document.createElement('style'); st.id='v33-css';
  st.textContent=[
  'table.t32 th .jb{display:block;font-size:10.5px;font-weight:600;color:var(--c-deep);margin-top:2px}',
  'table.t32 td.jc{vertical-align:top;white-space:normal;min-width:88px}',
  '.j33s,.j33l{display:inline-block;border-radius:999px;padding:1px 7px;font-size:11px;font-weight:700;white-space:nowrap}',
  '.j33s{background:var(--warn-soft);color:var(--warn);border:1px solid var(--warn)}',
  '.j33l{background:var(--good-soft);color:var(--good);border:1px solid var(--good)}',
  'table.t32 td.jc small{display:block;font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap}',
  'table.t32 td.lic{background:color-mix(in srgb,var(--good) 9%,var(--panel));color:var(--muted);font-size:12px}',
  'table.t32 tr.air td:first-child{padding-left:14px}',
  'table.t32 tr.air .an{font-weight:600;color:var(--ink);background:none;border:0;padding:0;cursor:pointer;text-align:left;font:inherit}',
  'table.t32 tr.air .an:hover{text-decoration:underline}',
  'table.t32 tr.air .am{display:block;font-size:11.5px;color:var(--muted);margin-top:1px}',
  'table.t32 .jsel{display:flex;gap:6px;margin-top:5px;flex-wrap:wrap}',
  'table.t32 .jsel label{display:inline-flex;flex-direction:column;font-size:10.5px;color:var(--muted);gap:2px}',
  'table.t32 .jsel select{font:inherit;font-size:12px;padding:2px 4px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}',
  'table.t32 tr.who td{white-space:normal;vertical-align:top;font-size:11.5px;line-height:1.5}',
  'table.t32 tr.who td div{white-space:nowrap}',
  'table.t32 tr.sec .secbtn{margin-left:12px;border:1px solid rgba(255,255,255,.4);background:transparent;color:inherit;border-radius:6px;padding:1px 8px;font:600 11px var(--f-ui);cursor:pointer;text-transform:none;letter-spacing:0}',
  '.f33-legend{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;padding:8px 16px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--line)}',
  '.f33-legend .sw{display:inline-block;width:14px;height:10px;border-radius:3px;background:color-mix(in srgb,var(--good) 18%,var(--panel));border:1px solid var(--good);vertical-align:middle;margin-right:4px}'
  ].join('\n');
  document.head.appendChild(st); }catch(e){} })();

function air33(M,Y){
  const t0=monthIndex(M.months[0].ym), I=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===Y) I.push(i); });
  const y0=monthIndex(Y+'-01'), y1=monthIndex(Y+'-12');
  const arrAt=(x,i)=>{ const m=t0+i; if(!isFinite(x.live)||m<x.live||!x.econ) return 0; const k=Math.floor((m-x.live)/12); return x.econ(k).arr*x.w*Math.pow(x.renew,k); };
  const revAt=(x,i)=>(t0+i===x.sign?num(x.e.impl)*x.w:0)+arrAt(x,i)/12;
  const all=M.airlines.map(x=>({x,idx:state.airlines.findIndex(a=>a&&a.id===x.a.id)}));
  const rel=o=>{ const x=o.x; if(!isFinite(x.sign)&&!isFinite(x.live)) return true; if((x.sign>=y0&&x.sign<=y1)||(x.live>=y0&&x.live<=y1)) return true; return I.some(i=>revAt(x,i)>0.5); };
  const later=all.filter(o=>!rel(o)&&((isFinite(o.x.sign)&&o.x.sign>y1)||(isFinite(o.x.live)&&o.x.live>y1)));
  const rows=(view.allAir33?all:all.filter(rel)).sort((p,q)=>((isFinite(p.x.sign)?p.x.sign:1e9)-(isFinite(q.x.sign)?q.x.sign:1e9))||((isFinite(p.x.live)?p.x.live:1e9)-(isFinite(q.x.live)?q.x.live:1e9))||String(p.x.a.name).localeCompare(String(q.x.a.name)));
  return {t0,I,arrAt,revAt,all,rows,later};
}
const f32TableBase33=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase33(M,Y,canEdit,partial);
  const D=air33(M,Y), {t0,I,arrAt,revAt}=D, nowYm=asOfYm(), col=view.col32||{};
  const canDate=!readOnly, dates=canDate&&(!!view.ed33||(canEdit&&!!view.ed32));
  const lab=ym=>MONS32[+ym.slice(5,7)-1]+' '+ym.slice(2,4);
  const opts=(cur)=>'<option value=""'+(cur?'':' selected')+'>Not set</option>'+M.months.map(m=>'<option value="'+m.ym+'"'+(m.ym===cur?' selected':'')+'>'+lab(m.ym)+'</option>').join('');
  /* header: how many sign / go live each month */
  const cnt=i=>{ const m=t0+i; let s=0,l=0; D.all.forEach(o=>{ if(o.x.sign===m) s++; if(o.x.live===m) l++; }); return {s,l}; };
  const thead='<thead><tr><th>'+esc(Y)+'</th>'+I.map(i=>{ const c=cnt(i), ym=M.months[i].ym; return '<th class="'+(ym===nowYm?'now':'')+'">'+MONS32[+ym.slice(5,7)-1]+(c.s||c.l?'<span class="jb">'+(c.s?'✍'+c.s:'')+(c.s&&c.l?' · ':'')+(c.l?'▶'+c.l:'')+'</span>':'')+'</th>'; }).join('')+'<th class="tot">Year</th></tr></thead>';
  h=h.replace(/<thead>[\s\S]*?<\/thead>/,thead);
  /* airlines section */
  const closed=!!col.air, nS=D.all.filter(o=>o.x.sign>=monthIndex(Y+'-01')&&o.x.sign<=monthIndex(Y+'-12')).length, nL=D.all.filter(o=>o.x.live>=monthIndex(Y+'-01')&&o.x.live<=monthIndex(Y+'-12')).length;
  let s='<tr class="sec" data-act="s32" data-v="air"><td colspan="'+(I.length+2)+'">'+(closed?'▸ ':'▾ ')+'Airlines<span>'+nS+' sign and '+nL+' go live in '+esc(Y)+' · ✍ sign = implementation fee · ▶ live = licence starts</span>'+
    (canDate?'<button class="secbtn" data-act="ed33">'+(dates?'Done picking dates':'Pick dates')+'</button>':'')+'<button class="secbtn" data-act="al33">'+(view.allAir33?'Only '+esc(Y)+' airlines':'Show every airline')+'</button></td></tr>';
  if(!closed){
    s+='<tr class="who"><td><b>Who joins</b></td>'+I.map(i=>{ const m=t0+i, S=D.all.filter(o=>o.x.sign===m), L=D.all.filter(o=>o.x.live===m);
      return '<td class="'+(M.months[i].ym===nowYm?'now':'')+'">'+S.map(o=>'<div title="Signs: implementation fee '+esc($(num(o.x.e.impl)*o.x.w))+'"><span class="j33s">✍</span> '+esc(o.x.a.name)+'</div>').join('')+L.map(o=>'<div title="Goes live: licence '+esc($(arrAt(o.x,i)))+' a year"><span class="j33l">▶</span> '+esc(o.x.a.name)+'</div>').join('')+(S.length||L.length?'':'<span class="muted">–</span>')+'</td>'; }).join('')+'<td class="tot">'+nS+' ✍ · '+nL+' ▶</td></tr>';
    D.rows.forEach(o=>{
      const x=o.x, a=x.a, prod=(x.e.product&&(x.e.product.short||x.e.product.name))||'Licence', und=!isFinite(x.sign)||!isFinite(x.live);
      const t=timingOf(state,state.airlines[o.idx]||a);
      let label='<button class="an" data-act="open-airline" data-v="'+esc(a.id)+'">'+esc(a.name)+'</button><span class="am">'+esc(a.country||'')+' · '+esc(prod)+(und?' · <b>no dates yet</b>':' · signs '+lab(ymFromIndex(x.sign))+' · live '+lab(ymFromIndex(x.live)))+'</span>';
      if(dates&&o.idx>=0) label+='<div class="jsel"><label>Signs<select data-act="j33" data-f="sign" data-i="'+o.idx+'" aria-label="'+esc(a.name)+' sign month">'+opts(isFinite(x.sign)?ymFromIndex(x.sign):(t.sign||''))+'</select></label><label>Goes live<select data-act="j33" data-f="live" data-i="'+o.idx+'" aria-label="'+esc(a.name)+' go-live month">'+opts(isFinite(x.live)?ymFromIndex(x.live):(t.live||''))+'</select></label></div>';
      let tot=0;
      const cells=I.map(i=>{ const m=t0+i, r=revAt(x,i); tot+=r; const now=M.months[i].ym===nowYm?' now':'';
        const parts=[];
        if(m===x.sign) parts.push('<span class="j33s">✍ Signs</span><small>impl. '+(num(x.e.impl)?$(num(x.e.impl)*x.w):'none')+'</small>');
        if(m===x.live) parts.push('<span class="j33l">▶ Live</span><small>'+esc(prod)+' '+$k(arrAt(x,i))+'/yr</small><small>'+(a.billing==='monthly'?'billed monthly':'billed yearly')+'</small>');
        if(parts.length) return '<td class="jc'+now+'">'+parts.join('')+'</td>';
        if(isFinite(x.live)&&m>x.live) return '<td class="n lic'+now+'" title="Licence earned this month">'+$(arrAt(x,i)/12)+'</td>';
        return '<td class="n'+now+'"><span class="muted">·</span></td>'; }).join('');
      s+='<tr class="air"><td>'+label+'</td>'+cells+'<td class="n tot">'+(tot>0.5?$(tot):'–')+'</td></tr>';
    });
    if(!D.rows.length) s+='<tr><td colspan="'+(I.length+2)+'" class="muted">No airlines sign, go live or earn in '+esc(Y)+'.</td></tr>';
    if(D.later.length&&!view.allAir33) s+='<tr><td colspan="'+(I.length+2)+'" class="muted small">'+D.later.length+' more airline'+(D.later.length===1?' joins':'s join')+' after '+esc(Y)+'. Use “Show every airline” to see and move them.</td></tr>';
  }
  h=h.replace('<tbody>','<tbody>'+s);
  const legend='<div class="f33-legend"><span><span class="j33s">✍ Signs</span> implementation fee is charged that month</span><span><span class="j33l">▶ Live</span> licence starts (yearly value shown)</span><span><i class="sw"></i>licence earned each month after go-live</span>'+(canDate?'<span>Press <b>Pick dates</b> to choose each airline’s months.</span>':'')+'</div>';
  h=h.replace('<div class="tbl-wrap inner">',legend+'<div class="tbl-wrap inner">');
  return h;
};
const forecastBase33=forecast;
forecast=function(M){
  let h=forecastBase33(M);
  const L=last32; if(!L) return h;
  const D=air33(L.M,L.Y), y0=monthIndex(L.Y+'-01'), y1=monthIndex(L.Y+'-12');
  const nS=D.all.filter(o=>o.x.sign>=y0&&o.x.sign<=y1).length, nL=D.all.filter(o=>o.x.live>=y0&&o.x.live<=y1).length;
  const impl=L.I.reduce((t,i)=>t+num(L.M.months[i].impl),0), lic=L.I.reduce((t,i)=>t+num(L.M.months[i].recurring),0);
  const und=D.all.filter(o=>!isFinite(o.x.sign)||!isFinite(o.x.live)).length;
  const extra='<div class="f32-kpi"><span>Airlines joining</span><b>'+nS+' sign · '+nL+' live</b></div><div class="f32-kpi"><span>Implementation fees</span><b>'+$(impl)+'</b></div><div class="f32-kpi"><span>Licence revenue</span><b>'+$(lic)+'</b></div>';
  h=h.replace('</div><details class="panel f32-filter"',extra+'</div>'+(und?'<div class="banner warn" style="margin:0 0 14px"><span class="grow"><b>'+und+' ticked airline'+(und===1?' has':'s have')+' no sign or go-live month</b>, so '+(und===1?'it adds':'they add')+' nothing yet. Press “Pick dates” in the Airlines section of the table to set them.</span></div>':'')+'<details class="panel f32-filter"');
  return h;
};
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset||el.dataset.act!=='j33') return;
  e.stopImmediatePropagation();
  if(readOnly){ toast('View only.'); render(); return; }
  const a=state.airlines[+el.dataset.i]; if(!a) return;
  const t=timingOf(state,a), v=el.value, f=el.dataset.f;
  let sg=isSet(a.signMonth)?a.signMonth:(t.sign||''), lv=isSet(a.goLiveMonth)?a.goLiveMonth:(t.live||'');
  const gap=(isFinite(monthIndex(sg))&&isFinite(monthIndex(lv)))?Math.max(0,monthIndex(lv)-monthIndex(sg)):1;
  if(f==='sign'){ sg=v; if(v&&(!lv||!isFinite(monthIndex(lv))||monthIndex(lv)<monthIndex(v))) lv=ymFromIndex(monthIndex(v)+gap); }
  else { lv=v; if(v&&(!sg||!isFinite(monthIndex(sg))||monthIndex(sg)>monthIndex(v))) sg=ymFromIndex(monthIndex(v)-Math.min(gap,1)); }
  a.signMonth=sg; a.goLiveMonth=lv; a.cohort='';
  commit(); toast(a.name+': signs '+(sg||'not set')+', live '+(lv||'not set')+'. Press Save to keep it.');
},true);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act; if(a!=='ed33'&&a!=='al33') return;
  e.stopImmediatePropagation(); e.preventDefault();
  if(a==='ed33'){ view.ed33=!view.ed33; if(!view.ed33&&view.ed32) view.ed32=false; }
  else view.allAir33=!view.allAir33;
  if(view.col32&&view.col32.air){ view.col32=Object.assign({},view.col32,{air:false}); }
  persistView(); render();
},true);
