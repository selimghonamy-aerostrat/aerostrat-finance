/* ===== v28: tab order — Actuals right after Overview ===== */
{ const i=TABS.findIndex(t=>t[0]==='actuals'); if(i>1){ const t=TABS.splice(i,1)[0]; TABS.splice(1,0,t); } }
