/* ===== v11: full country lists (UN geoscheme) for Africa, Europe, GCC and Levant ===== */
const GEO_V=2, GEO_DROP=['Israel','Palestine'];
const GEO=[
 ['r1','North Africa','deep',['Algeria','Egypt','Libya','Morocco','Sudan','Tunisia']],
 ['r5','West Africa','sky',['Benin','Burkina Faso','Cabo Verde',"Côte d'Ivoire",'Gambia','Ghana','Guinea','Guinea-Bissau','Liberia','Mali','Mauritania','Niger','Nigeria','Senegal','Sierra Leone','Togo']],
 ['r-eaf','East Africa','sky60',['Burundi','Comoros','Djibouti','Eritrea','Ethiopia','Kenya','Madagascar','Malawi','Mauritius','Mozambique','Rwanda','Seychelles','Somalia','South Sudan','Tanzania','Uganda','Zambia','Zimbabwe']],
 ['r-caf','Central Africa','deep80',['Angola','Cameroon','Central African Republic','Chad','Congo','DR Congo','Equatorial Guinea','Gabon','São Tomé and Príncipe']],
 ['r-saf','Southern Africa','deep60',['Botswana','Eswatini','Lesotho','Namibia','South Africa']],
 ['r2','Levant','coral',['Jordan','Lebanon','Syria']],
 ['r3','GCC','deep40',['Bahrain','Kuwait','Oman','Qatar','Saudi Arabia','United Arab Emirates']],
 ['r-neu','Northern Europe','grey',['Denmark','Estonia','Finland','Iceland','Ireland','Latvia','Lithuania','Norway','Sweden','United Kingdom']],
 ['r-weu','Western Europe','grey',['Austria','Belgium','France','Germany','Liechtenstein','Luxembourg','Monaco','Netherlands','Switzerland']],
 ['r-eeu','Eastern Europe','grey',['Belarus','Bulgaria','Czechia','Hungary','Moldova','Poland','Romania','Russia','Slovakia','Ukraine']],
 ['r4','Southern Europe','grey',['Albania','Andorra','Bosnia and Herzegovina','Croatia','Cyprus','Greece','Italy','Malta','Montenegro','North Macedonia','Portugal','San Marino','Serbia','Slovenia','Spain','Turkey','Vatican City']]
];
const GEO_EU=new Set(['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czechia','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Poland','Portugal','Romania','Slovakia','Slovenia','Spain','Sweden']);
const GEO_NOTE={Cyprus:'EU member. UN groups it with Western Asia.',Turkey:'Transcontinental. UN groups it with Western Asia.'};
const GEO_ALIAS={UAE:'United Arab Emirates','Czech Republic':'Czechia',Swaziland:'Eswatini','Ivory Coast':"Côte d'Ivoire",'Cape Verde':'Cabo Verde','DRC':'DR Congo'};
function geoMigrate(s){
  if(!s||!s.settings||num(s.settings.geoV)>=GEO_V) return false;
  if(num(s.settings.geoV)>=1){ const used=new Set((s.airlines||[]).map(a=>a.country)); (s.regions||[]).forEach(r=>{ r.countries=r.countries.filter(c=>!(GEO_DROP.includes(c.name)&&!used.has(c.name))); }); s.settings.geoV=GEO_V; return true; }
  const old={}, oldReg={}; (s.regions||[]).forEach(r=>{ oldReg[r.id]=r; r.countries.forEach(c=>{ old[GEO_ALIAS[c.name]||c.name]=Object.assign({},c,{_from:r.id}); }); });
  const placed=new Set(), regs=GEO.map(([id,name,color,list])=>({id,name,color:(oldReg[id]&&oldReg[id].color&&['r1','r2','r3'].includes(id))?oldReg[id].color:color,countries:list.map(n=>{ placed.add(n); const o=old[n]||{}; const note=o.notes||(GEO_EU.has(n)?(GEO_NOTE[n]||'EU member'):(GEO_NOTE[n]||'')); return {name:n,priceAdj:num(o.priceAdj),notes:note,wht:num(o.wht),payDelay:num(o.payDelay),collectRate:isSet(o.collectRate)?o.collectRate:''}; })}));
  const left=Object.entries(old).filter(([n])=>!placed.has(n));
  if(left.length){ const other={id:'r-other',name:'Middle East and other',color:'grey',countries:[]};
    left.forEach(([n,o])=>{ const c=Object.assign({},o,{name:n}); delete c._from; other.countries.push(c); }); regs.push(other); }
  s.regions=regs;
  (s.airlines||[]).forEach(a=>{ if(GEO_ALIAS[a.country]) a.country=GEO_ALIAS[a.country]; });
  (s.fees||[]).forEach(f=>{ if(f.scope&&f.scope.startsWith('c:')&&GEO_ALIAS[f.scope.slice(2)]) f.scope='c:'+GEO_ALIAS[f.scope.slice(2)]; });
  s.settings.geoV=GEO_V;
  return true;
}
const geoApplyDraft=applyDraft;
applyDraft=function(){
  geoApplyDraft();
  if(readOnly||cfgLocked) return;
  if(geoMigrate(state)){ restored=false; saveDraft(); setTimeout(()=>toast('Country list updated. Click Save to keep it.'),600); }
};
/* ---------- pick a region, list its countries, add airlines by country ---------- */
const ctyViewBase=countriesView;
countriesView=function(M){
  const sel=view.ctyRegion||'all', reg=state.regions.find(r=>r.id===sel), canCfg=!readOnly&&!cfgLocked;
  const picker='<div class="panel mb"><div class="toolbar"><label class="muted small" for="cty-region">Region</label><select id="cty-region" class="in w-xl" data-act="cty-region"><option value="all">All regions (cards)</option>'+state.regions.map(r=>'<option value="'+esc(r.id)+'"'+(sel===r.id?' selected':'')+'>'+esc(r.name)+' · '+r.countries.length+' countries</option>').join('')+'</select><span class="muted small">Pick a region to list all its countries and add airlines country by country.</span></div></div>';
  if(!reg){ const h=ctyViewBase(M), k=h.indexOf('<section'); return k>=0?h.slice(0,k)+picker+h.slice(k):h+picker; }
  const rows=reg.countries.map(c=>{const {t}=countryStats(c.name);return {c,t};});
  const tot=rows.reduce((a,x)=>({n:a.n+x.t.n,fleet:a.fleet+x.t.fleet,arr:a.arr+x.t.arr,w:a.w+x.t.w}),{n:0,fleet:0,arr:0,w:0});
  let h='<div class="sec-head"><div><div class="eyebrow">Countries · '+esc(reg.name)+'</div><h2>'+reg.countries.length+' countries in '+esc(reg.name)+'</h2><p>'+tot.n+' airline'+(tot.n===1?'':'s')+' in plan · '+$(tot.arr)+' ARR · weighted '+$k(tot.w)+'</p></div><div class="toolbar">'+(canCfg?'<input id="newc-'+state.regions.indexOf(reg)+'" class="in w-m" placeholder="New country" aria-label="New country in '+esc(reg.name)+'"><button class="btn small" data-act="add-country" data-r="'+state.regions.indexOf(reg)+'">Add country</button>':'')+'</div></div>'+picker;
  h+='<div class="panel flush"><div class="tbl-wrap inner"><table class="fin"><thead><tr><th>Country</th><th class="n">Airlines</th><th class="n">Fleet</th><th class="n">Pilots</th><th class="n">ARR</th><th class="n">Weighted</th><th>Notes</th><th></th></tr></thead><tbody>'+
    rows.map(({c,t})=>'<tr><td><button class="linkish" data-act="open-country" data-v="'+esc(c.name)+'"><b>'+esc(c.name)+'</b></button></td><td class="n">'+t.n+'</td><td class="n">'+t.fleet+'</td><td class="n">'+t.pilots+'</td><td class="n">'+(t.arr?$(t.arr):'<span class="muted">–</span>')+'</td><td class="n">'+(t.w?$k(t.w):'<span class="muted">–</span>')+'</td><td class="small muted">'+esc(c.notes||'')+'</td><td class="n">'+(readOnly?'':'<button class="btn small cta-outline" data-act="add-airline-country" data-v="'+esc(c.name)+'">+ Add airline</button>')+'</td></tr>').join('')+
    '<tr class="total"><td>Total</td><td class="n">'+tot.n+'</td><td class="n">'+tot.fleet+'</td><td></td><td class="n">'+$(tot.arr)+'</td><td class="n">'+$k(tot.w)+'</td><td colspan="2"></td></tr></tbody></table></div></div>';
  return h;
};
const airDetailBase=airlineDetail;
airlineDetail=function(id){
  const h=airDetailBase(id), i=state.airlines.findIndex(a=>a.id===id); if(i<0) return h;
  const a=state.airlines[i], cur=regionOf(state,a.country), rid=(view.airReg&&view.airReg[id]!=null)?view.airReg[id]:(cur?cur.id:''), reg=state.regions.find(r=>r.id===rid);
  const dis=readOnly?' disabled':'', list=reg?reg.countries.map(c=>c.name):[], has=list.includes(a.country);
  const regSel='<select id="air-region-'+i+'" class="in" data-act="air-region" data-v="'+esc(id)+'" aria-label="Region"'+dis+'><option value="">Choose a region</option>'+state.regions.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===rid?' selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select>';
  const ctySel='<select id="f-airlines-'+i+'-country" class="in" data-bind="airlines.'+i+'.country" aria-label="Country"'+dis+'>'+(has?'':'<option value="" selected>'+(reg?'Choose a country':'Pick a region first')+'</option>')+list.map(c=>'<option value="'+esc(c)+'"'+(c===a.country?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select>';
  const rx=new RegExp('<div class="field"><label>Country</label><select id="f-airlines-'+i+'-country"[\\s\\S]*?</select></div>');
  return h.replace(rx,fld('Region',regSel)+fld('Country',ctySel,reg?reg.countries.length+' countries in '+esc(reg.name):''));
};
document.addEventListener('change',e=>{
  const el=e.target; if(!el||!el.dataset) return;
  if(el.dataset.act==='cty-region'){ view.ctyRegion=el.value; view.country=null; persistView(); render(); }
  else if(el.dataset.act==='air-region'){ view.airReg=view.airReg||{}; view.airReg[el.dataset.v]=el.value; render(); }
});
/* ---------- money figures for prospects (airlines kept out of the forecast) ---------- */
const csBase=countryStats;
countryStats=function(name){ const r=csBase(name), P=r.list.filter(x=>x.a.include===false&&x.a.status!=='Lost'); r.t.pn=P.length; r.t.pfleet=P.reduce((s,x)=>s+num(x.a.fleet),0); r.t.ppilots=P.reduce((s,x)=>s+x.e.pilots,0); r.t.parr=P.reduce((s,x)=>s+x.e.arr,0); r.t.pimpl=P.reduce((s,x)=>s+x.e.impl,0); return r; };
const ctyRegionTable=countriesView;
countriesView=function(M){
  const sel=view.ctyRegion||'all', reg=state.regions.find(r=>r.id===sel);
  if(reg){
    let h=ctyRegionTable(M); const rows=reg.countries.map(c=>({c,t:countryStats(c.name).t})), P=rows.reduce((a,x)=>({n:a.n+x.t.pn,arr:a.arr+x.t.parr,impl:a.impl+x.t.pimpl}),{n:0,arr:0,impl:0});
    h=h.replace('<th class="n">Weighted</th><th>Notes</th>','<th class="n">Weighted</th><th class="n">Prospects</th><th class="n">Potential ARR</th><th class="n">Potential impl.</th><th>Notes</th>');
    rows.forEach(({c,t})=>{ const k=h.indexOf('data-v="'+esc(c.name)+'"><b>'), cell='<td class="small muted">'; if(k<0) return; const j=h.indexOf(cell,k); if(j<0) return;
      h=h.slice(0,j)+'<td class="n">'+(t.pn||'<span class="muted">–</span>')+'</td><td class="n">'+(t.parr?$(t.parr):'<span class="muted">–</span>')+'</td><td class="n">'+(t.pimpl?$(t.pimpl):'<span class="muted">–</span>')+'</td>'+h.slice(j); });
    h=h.replace('<td colspan="2"></td></tr></tbody>','<td class="n">'+P.n+'</td><td class="n">'+$(P.arr)+'</td><td class="n">'+$(P.impl)+'</td><td colspan="2"></td></tr></tbody>');
    h=h.replace(/(<\/h2><p>[^<]*)<\/p>/,'$1'+(P.n?' · '+P.n+' prospect'+(P.n===1?'':'s')+' worth '+$(P.arr)+' a year if all were won':'')+'</p>');
    return h+'<p class="hint">Prospects are airlines with “In forecast” switched off. Their ARR and implementation are what they would pay at your current prices if won; they are not counted in the plan. Switch an airline into the forecast on its page.</p>';
  }
  const can=!readOnly&&!cfgLocked;
  const totalARR=state.airlines.filter(a=>a.include!==false&&a.status!=='Lost').reduce((s,a)=>s+airlineEcon(state,a,0).arr,0);
  const picker='<div class="panel mb"><div class="toolbar"><label class="muted small" for="cty-region">Region</label><select id="cty-region" class="in w-xl" data-act="cty-region"><option value="all">All regions (cards)</option>'+state.regions.map(r=>'<option value="'+esc(r.id)+'">'+esc(r.name)+' · '+r.countries.length+' countries</option>').join('')+'</select><span class="muted small">Pick a region to list all its countries and add airlines country by country.</span></div></div>';
  let h='<div class="sec-head"><div><div class="eyebrow">Countries</div><h2>Every country at a glance</h2><p>Plan ARR counts airlines in the forecast. Prospects show what the other airlines would pay if won.</p></div><div class="toolbar">'+(can?'<input id="newr" class="in w-l" placeholder="New region name" aria-label="New region name"><button class="btn cta-outline" data-act="add-region-named">Add region</button>':'')+goto('regions','Manage in Settings')+'</div></div>'+picker;
  const regs=state.regions.map((r,ri)=>({ri,name:r.name,color:cv(r.color),countries:r.countries.map(c=>c.name)}));
  const known=new Set(regs.flatMap(r=>r.countries)), extra=Array.from(new Set(state.airlines.map(a=>a.country).filter(c=>c&&!known.has(c))));
  if(extra.length) regs.push({ri:-1,name:'Unassigned',color:'var(--c-grey)',countries:extra});
  regs.forEach(r=>{
    const st=r.countries.map(c=>countryStats(c).t), parr=st.reduce((a,t)=>a+t.parr,0), pn=st.reduce((a,t)=>a+t.pn,0);
    h+='<section class="mb"><div class="rtitle" style="--rc:'+r.color+'"><span>'+esc(r.name)+'</span><span class="muted small">'+r.countries.length+' countr'+(r.countries.length===1?'y':'ies')+(pn?' · '+pn+' prospects · potential '+$k(parr):'')+'</span>'+(can&&r.ri>=0?'<span class="toolbar" style="margin-left:auto"><input id="newc-'+r.ri+'" class="in w-m" placeholder="New country" aria-label="New country in '+esc(r.name)+'"><button class="btn small" data-act="add-country" data-r="'+r.ri+'">Add country</button></span>':'')+'</div>';
    if(!r.countries.length) h+='<p class="muted small">No countries yet. Type a name above and click Add country.</p>';
    else{ h+='<div class="ccards">';
      r.countries.forEach((c,ci)=>{const t=st[ci], cty=countryOf(state,c), adj=cty?num(cty.priceAdj):0;
        h+='<button class="ccard" data-act="open-country" data-v="'+esc(c)+'" style="--rc:'+r.color+'"><span class="cname">'+esc(c)+(adj?'<span class="chip adj">'+(adj>0?'+':'')+adj+'% price</span>':'')+'</span><span class="cval">'+(t.n||!t.pn?$(t.arr):$(t.parr)+'<span class="unit"> potential</span>')+'</span><span class="csub">'+(t.n||!t.pn?t.n+' in plan · '+t.fleet+' aircraft · '+t.pilots+' pilots':t.pn+' airline'+(t.pn===1?'':'s')+' · '+t.pfleet+' aircraft · '+t.ppilots+' pilots')+'</span><span class="track"><span class="fill" style="width:'+(totalARR?Math.max(t.arr?1:0,t.arr/totalARR*100):0)+'%;background:'+r.color+'"></span></span>'+(t.pn&&t.n?'<span class="csub"><b>+ '+t.pn+' prospect'+(t.pn===1?'':'s')+'</b> · '+t.pfleet+' aircraft · potential '+$k(t.parr)+'/yr</span>':'')+'<span class="csub">'+(t.n?pct(totalARR?t.arr/totalARR*100:0)+' of plan ARR · weighted '+$k(t.w):t.pn?'Prospects, not in the plan yet · impl. '+$k(t.pimpl):'Open to add airlines →')+'</span></button>';});
      h+='</div>'; }
    h+='</section>';
  });
  return h;
};
const cdBase=countryDetail;
countryDetail=function(name){
  const h=cdBase(name), t=countryStats(name).t; if(!t.pn) return h;
  const row='<div class="kpis">'+kpi('Prospect airlines',String(t.pn),'Not in the forecast yet','sky')+kpi('Prospect fleet',String(t.pfleet),'aircraft')+kpi('Prospect pilots',t.ppilots.toLocaleString(),'From crew ratios')+kpi('Potential ARR',$(t.parr),'If all were won, year 1')+kpi('Potential implementation',$(t.pimpl),'One-time')+'</div>';
  const k=h.indexOf('<div class="kpis">'), p=k<0?-1:h.indexOf('<div class="panel',k);
  if(k<0||p<0) return h+row;
  return t.n?h.slice(0,p)+row+h.slice(p):h.slice(0,k)+row+h.slice(p);
};
