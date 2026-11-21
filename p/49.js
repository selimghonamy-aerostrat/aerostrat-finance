/* ===== v49: workspace switch (Finance | Leads & Sales) + responsive layer for every screen size.
   Leads & Sales is its own page (/sales) with its own data (/api/sales); nothing in Finance reads or changes it. ===== */
(function(){
  if(document.getElementById('v49-css')) return;
  const st=document.createElement('style'); st.id='v49-css';
  st.textContent=[
  /* workspace switch */
  '.ws-switch{display:inline-flex;gap:2px;padding:3px;border-radius:999px;background:rgba(255,255,255,.12);flex:none}',
  '.ws-switch a{color:var(--on-navy-muted);text-decoration:none;font-size:13px;font-weight:600;padding:6px 14px;border-radius:999px;white-space:nowrap}',
  '.ws-switch a[aria-current="page"]{background:#fff;color:var(--navy)}',
  '.ws-switch a:not([aria-current]):hover{color:#fff;background:rgba(255,255,255,.1)}',
  /* header: one row on wide screens, tidy rows below */
  '.bar .wrap{row-gap:10px}',
  '@media (max-width:1399px){.bar .brand .divider,.bar .brand .app{display:none}}',
  '@media (max-width:1099px){.bar .brand{order:1}.bar .ws-switch{order:2}.bar .spacer{order:3}.bar .savebox{order:4}.bar .wrap>:not(.brand):not(.ws-switch):not(.spacer):not(.savebox){order:5}}',
  '@media (max-width:760px){.bar .wrap{padding-block:10px;column-gap:8px}.ws-switch{margin-left:auto}.ws-switch a{padding:6px 11px;font-size:12.5px}.bar .spacer{display:none}.bar .savebox{width:100%;gap:8px}.bar .savebox .savestate{margin-right:auto;font-size:12px}.t49{display:none}.theme32 button{padding-inline:10px}}',
  /* tabs rail: fade at the edge when it scrolls */
  '@media (max-width:900px){.tabs .wrap{-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent);scroll-padding-inline:16px}.tabs button{padding:12px 10px 10px}}',
  /* wide tables keep the first column in view while scrolling sideways */
  '.tbl-wrap{-webkit-overflow-scrolling:touch}',
  '.tbl-wrap table th:first-child,.tbl-wrap table td:first-child{position:sticky;left:0;z-index:1;background:var(--panel);box-shadow:1px 0 0 var(--line)}',
  /* sign-out sits at the end of the page instead of covering content */
  '.signout{position:static;display:block;margin:28px max(16px,env(safe-area-inset-right,0px)) calc(84px + env(safe-area-inset-bottom,0px)) auto;opacity:1}',
  /* floating Save when the header has scrolled away */
  '.fab-save49{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:40;background:var(--coral);color:#fff;border:0;border-radius:999px;padding:12px 20px;font:600 14px var(--f-ui);box-shadow:0 6px 18px rgba(0,0,0,.25);cursor:pointer}',
  '.toast{max-width:calc(100vw - 32px);box-sizing:border-box}',
  /* touch screens: 16px text stops phones zooming into fields; bigger tap targets */
  '@media (pointer:coarse){.in,select.in,textarea.in,.login .in{font-size:16px}.btn{min-height:36px}.tabs button{min-height:44px}}'
  ].join('\n');
  document.head.appendChild(st);
  const fab=document.createElement('button'); fab.type='button'; fab.className='fab-save49'; fab.textContent='Save changes'; fab.hidden=true; document.body.appendChild(fab);
  fab.addEventListener('click',()=>{ const b=document.querySelector('.bar [data-act="save"]'); if(b&&!b.disabled) b.click(); });
  const upd=()=>{ const bar=document.querySelector('.bar'), b=document.querySelector('.bar [data-act="save"]'); fab.hidden=!(bar&&b&&!b.disabled&&bar.getBoundingClientRect().bottom<0); };
  window.addEventListener('scroll',upd,{passive:true}); setInterval(upd,700);
})();
const shellBase49=shell;
shell=function(){
  let h=shellBase49();
  const sw='<nav class="ws-switch" aria-label="Workspace"><a href="/#overview" aria-current="page">Finance</a><a href="/sales">Leads &amp; Sales</a></nav>';
  const k=h.indexOf('<span class="spacer"></span>');
  if(k>=0) h=h.slice(0,k)+sw+h.slice(k);
  return h.replace('>☀ Light<',' aria-label="Light mode"><span aria-hidden="true">☀</span><span class="t49"> Light</span><').replace('>☾ Dark<',' aria-label="Dark mode"><span aria-hidden="true">☾</span><span class="t49"> Dark</span><');
};
const renderBase49=render;
render=function(){
  const r=renderBase49.apply(this,arguments);
  try{ const w=document.querySelector('.tabs .wrap'), a=w&&w.querySelector('[aria-selected="true"]'); if(w&&a&&w.scrollWidth>w.clientWidth) w.scrollLeft=Math.max(0,a.offsetLeft-(w.clientWidth-a.offsetWidth)/2); }catch(e){}
  return r;
};
