/* ===== v15: Pipeline region boxes show the full money of every country (all listed airlines except Lost) ===== */
function regionCards15(){
  const fns=groupKeyFns();
  const rows=state.airlines.map(a=>({a,e:airlineEcon(state,a,0),reg:fns.region(a)}));
  const tot=list=>{
    const t={n:0,pilots:0,arr:0};
    list.forEach(x=>{ if(x.a.status==='Lost') return; t.n++; t.pilots+=x.e.pilots; t.arr+=x.e.arr; });
    return t;
  };
  return '<div class="region-strip rs14">'+state.regions.map(rg=>{
    const inR=rows.filter(x=>x.reg===rg.name), T=tot(inR);
    const cl=rg.countries.map(c=>({name:c.name,t:tot(inR.filter(x=>x.a.country===c.name))}));
    cl.sort((p,q)=>(q.t.arr-p.t.arr)||(q.t.n-p.t.n)||p.name.localeCompare(q.name));
    return '<div class="rcard rc14'+(view.filterRegion===rg.name?' on':'')+'" style="--rc:'+cv(rg.color)+'">'+
      '<button class="rc14-head" data-act="pick-region" data-v="'+esc(rg.name)+'" title="Show only '+esc(rg.name)+' in the table below"><span class="rname">'+esc(rg.name)+'</span><span class="rval">'+$k(T.arr)+'</span><span class="rsub">'+T.n+' airlines · '+rg.countries.length+' countries</span></button>'+
      '<div class="rc14-cols"><span>Country</span><span>Airlines</span><span>Pilots</span><span>ARR</span></div>'+
      '<ul class="rc14-list">'+cl.map(c=>'<li><button class="rc14-row'+(c.t.n?'':' zero')+'" data-act="open-country" data-v="'+esc(c.name)+'" title="Open '+esc(c.name)+'"><span>'+esc(c.name)+'</span><span>'+(c.t.n||'–')+'</span><span>'+(c.t.pilots?c.t.pilots.toLocaleString():'–')+'</span><span>'+(c.t.arr?$k(c.t.arr):'–')+'</span></button></li>').join('')+'</ul>'+
      '<div class="rc14-foot"><span>Region total</span><span>'+T.n+'</span><span>'+(T.pilots?T.pilots.toLocaleString():'–')+'</span><span>'+$k(T.arr)+'</span></div>'+
    '</div>';
  }).join('')+'</div>';
}
pipeline=function(){
  const h=pipelineBase14();
  const s=h.indexOf('<div class="region-strip">'); if(s<0) return h;
  const e=h.indexOf('</div>',s); if(e<0) return h;
  return h.slice(0,s)+regionCards15()+h.slice(e+6);
};
/* forecast tables: no "Plan case · <scenario>" label in the table headers */
const forecast15Base=forecast;
forecast=function(M){
  return forecast15Base(M).replace(/(<div class="panel-head pad"><h3>(?:Monthly|Quarterly|Annual)[^<]*<\/h3>)<span class="muted small">(?:Plan|Weighted) case · [^<]*?( · \d+ manual figures?)?<\/span>/g,(m,h3,ov)=>h3+(ov?'<span class="muted small">'+ov.slice(3)+'</span>':''));
};
