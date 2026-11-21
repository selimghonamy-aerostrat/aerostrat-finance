/* ===== v44: forecast table explains itself — clearer section notes, a Cash section that adds up line by line
   (start + received + funding − paid out = end), a new "Why profit and cash differ" section, and a one-line
   summary of the year above the table. Numbers are unchanged; only how they are shown. ===== */
(function(){
  try{ if(document.getElementById('v44-css')) return; const st=document.createElement('style'); st.id='v44-css';
    st.textContent=['.y44{border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:10px;background:var(--panel);padding:12px 16px;margin:0 0 12px;font-size:13.5px;line-height:1.55}',
      '.y44 b{font-weight:700}','.y44 .g{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:8px}','.y44 .g div{min-width:150px}','.y44 .g span{display:block;font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}','.y44 .g strong{font-size:16px}',
      'table.t32 tr.eq44 td{border-top:2px solid var(--line);font-weight:700}','table.t32 td .op44{display:inline-block;width:14px;color:var(--muted);font-weight:600}'].join('\n');
    document.head.appendChild(st); }catch(e){}
})();
/* clearer notes on each section */
(function(){
  const NOTE={rev:'what each month earns: a licence is spread evenly over its months from go-live; implementation counts in the signing month',
    cost:'what STRATOS spends each month',prof:'revenue minus costs: what each month really earned',
    cash:'money in the bank: start + money received − money paid out = end'};
  SECS32.forEach(s=>{ if(NOTE[s[0]]) s[2]=NOTE[s[0]]; });
  if(!SECS32.some(s=>s[0]==='why44')){ const i=SECS32.findIndex(s=>s[0]==='cash'); SECS32.splice(i>=0?i+1:SECS32.length,0,['why44','Why profit and cash differ','yearly billing collects a whole year up front; profit counts it month by month']); }
})();
/* month-by-month cash pieces */
function cash44(M,i){
  const m=M.months[i]||{}, endOf=x=>num(x&&x.cashB!==undefined?x.cashB:x&&x.cash);
  const end=endOf(m), inn=num(m.cashIn), fund=num(m.funding), out=num(m.cashOut);
  const start=i>0?endOf(M.months[i-1]):end-inn-fund+out;
  return {start,end,inn,fund,out,other:end-start-inn-fund+out};
}
function adv44(M,i){ let t=0; for(let k=0;k<=i;k++){ const m=M.months[k]; t+=num(m.cashIn)-num(m.revenue); } return t; }
const f32RowsBase44=f32Rows;
f32Rows=function(M,I){
  const R=f32RowsBase44(M,I).filter(r=>r.sec!=='cash');
  const idx=m=>M.months.indexOf(m);
  const row=(sec,id,label,f,o)=>Object.assign({sec,id,label,f,kind:'flow'},o||{});
  const at=R.findIndex(r=>r.sec==='cust'), add=[
    row('cash','c44s','Cash at start of month',m=>cash44(M,idx(m)).start,{kind:'stock',cls:'sub',keep:1}),
    row('cash','c44i','+ Money received from airlines',m=>cash44(M,idx(m)).inn,{cls:'sub',keep:1}),
    row('cash','c44f','+ Funding received',m=>cash44(M,idx(m)).fund,{cls:'sub'}),
    row('cash','c44o','− Money paid out (costs, tax, payouts)',m=>-cash44(M,idx(m)).out,{cls:'sub',keep:1}),
    row('cash','c44x','± Other cash items',m=>cash44(M,idx(m)).other,{cls:'sub'}),
    row('cash','c44e','= Cash at end of month',m=>cash44(M,idx(m)).end,{kind:'stock',cls:'key eq44',keep:1}),
    row('why44','w44n','Net profit',m=>m.net,{cls:'sub',keep:1}),
    row('why44','w44t','+ Received early (+) or still to come (−)',m=>num(m.cashIn)-num(m.revenue),{cls:'sub',keep:1}),
    row('why44','w44f','+ Funding received',m=>m.funding,{cls:'sub'}),
    row('why44','w44p','− Tax, payouts and loan repayments',m=>-(num(m.cashOut)-num(m.costs)),{cls:'sub'}),
    row('why44','w44x','± Other cash items',m=>cash44(M,idx(m)).other,{cls:'sub'}),
    row('why44','w44c','= Change in cash',m=>{ const c=cash44(M,idx(m)); return c.end-c.start; },{cls:'key eq44',keep:1}),
    row('why44','w44b','Balance: paid in advance, not yet earned',m=>adv44(M,idx(m)),{kind:'stock',cls:'sub',keep:1})
  ];
  R.splice(at>=0?at:R.length,0,...add);
  return R;
};
const f32TableBase44=f32Table;
f32Table=function(M,Y,canEdit,partial){
  let h=f32TableBase44(M,Y,canEdit,partial);
  try{
    const I=[]; M.months.forEach((m,i)=>{ if(m.ym.slice(0,4)===String(Y)) I.push(i); }); if(!I.length) return h;
    const first=cash44(M,I[0]), last=cash44(M,I[I.length-1]);
    /* the Year column of "Cash at start of month" shows the start of the year */
    h=h.replace(/(<td>Cash at start of month<\/td>[\s\S]*?)<td class="n tot[^"]*">[^<]*<\/td>(<\/tr>)/,(m0,a,b)=>a+'<td class="n tot">'+$(first.start)+'</td>'+b);
    /* the balance row: the Year column is the balance at the end of the year (already so, stock) */
    let net=0, rev=0, inn=0, fund=0, pay=0, other=0;
    I.forEach(i=>{ const m=M.months[i], c=cash44(M,i); net+=num(m.net); rev+=num(m.revenue); inn+=num(m.cashIn); fund+=num(m.funding); pay+=num(m.cashOut)-num(m.costs); other+=c.other; });
    const t=inn-rev, dc=last.end-first.start, bal=adv44(M,I[I.length-1]);
    const parts=[];
    if(Math.abs(t)>=1) parts.push(t>0?'airlines paid <b>'+$(t)+'</b> up front for months that are earned later (yearly billing)':'<b>'+$(-t)+'</b> earned in '+Y+' is still to be collected (payment terms or quarterly/monthly billing)');
    if(Math.abs(fund)>=1) parts.push('funding of <b>'+$(fund)+'</b> came in');
    if(Math.abs(pay)>=1) parts.push('<b>'+$(pay)+'</b> went out on tax, payouts or loan repayments');
    if(Math.abs(other)>=1) parts.push('other cash items of <b>'+$(other)+'</b>');
    const box='<div class="y44"><b>'+Y+' in one line:</b> AeroStrat earns a profit of <b>'+$(net)+'</b>. Cash '+(dc>=0?'grows':'falls')+' by <b>'+$(Math.abs(dc))+'</b>, from '+$(first.start)+' to '+$(last.end)+'.'+
      (parts.length?' They differ because '+parts.join(', ')+'.':' Profit and cash match this year.')+
      (bal>=1?' At the end of '+Y+', '+$(bal)+' in the bank is money paid in advance for later months: it becomes profit then, not now.':'')+
      '<div class="g"><div><span>Profit '+Y+'</span><strong>'+$(net)+'</strong></div><div><span>Money received '+Y+'</span><strong>'+$(inn)+'</strong></div><div><span>Change in cash</span><strong>'+$(dc)+'</strong></div><div><span>Cash at end of '+Y+'</span><strong>'+$(last.end)+'</strong></div></div></div>';
    const k=h.indexOf('<div class="panel flush mb">');
    h=k>=0?h.slice(0,k)+box+h.slice(k):box+h;
  }catch(e){}
  return h;
};
