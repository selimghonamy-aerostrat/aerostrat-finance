/* ===== v46: simpler forecast table, as Mohamed asked: the "Why profit and cash differ" section and the two
   "cost for each live airline" lines are taken out. Numbers are unchanged. ===== */
(function(){ const i=SECS32.findIndex(s=>s[0]==='why44'); if(i>=0) SECS32.splice(i,1); })();
const f32RowsBase46=f32Rows;
f32Rows=function(M,I){
  return f32RowsBase46(M,I).filter(r=>r.sec!=='why44'&&r.id!=='k45a'&&r.id!=='k45b');
};
