/* ===== v17: the Pipeline opens with every airline showing (all regions, all groups expanded) ===== */
try{
  if(!sessionStorage.getItem('stratos-v17-open')){ view.filterRegion='All'; view.collapsed={}; persistView(); sessionStorage.setItem('stratos-v17-open','1'); }
}catch(e){ view.filterRegion='All'; view.collapsed={}; }
