/* ===== v43: AeroStrat brand (guidelines issue 002.3, Nov 2026) — company name on every screen, PDF and file name;
   new logo (from the guidelines) in the header, login and investor PDF; brand colours and font come from /brand.css ===== */
const RB43=s=>String(s).replace(/\bSTRATOS\b/g,'AeroStrat').replace(/Intelligence-Driven Aviation/g,'Intelligence Driven Aviation');
const HAS43=s=>typeof s==='string'&&(s.indexOf('STRATOS')>=0||s.indexOf('Intelligence-Driven')>=0);
try{ document.title='AeroStrat Finance Tracker'; }catch(e){}
/* 1) every text on screen (never inside inputs, so your data is untouched) */
const SKIP43={INPUT:1,TEXTAREA:1,SCRIPT:1,STYLE:1,NOSCRIPT:1};
function fix43(root){
  if(!root) return;
  if(root.nodeType===3){ if(HAS43(root.nodeValue)&&!(root.parentNode&&SKIP43[root.parentNode.nodeName])) root.nodeValue=RB43(root.nodeValue); return; }
  if(root.nodeType!==1||SKIP43[root.nodeName]||root.isContentEditable) return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ const p=n.parentNode; return p&&!SKIP43[p.nodeName]&&!(p.isContentEditable)&&HAS43(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }});
  const L=[]; while(w.nextNode()) L.push(w.currentNode); L.forEach(n=>{ n.nodeValue=RB43(n.nodeValue); });
  const at=[root,...root.querySelectorAll('[alt],[title],[aria-label],[placeholder]')];
  at.forEach(el=>{ ['alt','title','aria-label','placeholder'].forEach(k=>{ const v=el.getAttribute&&el.getAttribute(k); if(HAS43(v)) el.setAttribute(k,RB43(v)); }); });
}
try{
  fix43(document.body);
  new MutationObserver(ms=>{ ms.forEach(m=>{ if(m.type==='characterData') fix43(m.target); else m.addedNodes.forEach(fix43); }); }).observe(document.body,{childList:true,subtree:true,characterData:true});
}catch(e){}
/* 2) file names: stratos-… becomes aerostrat-… */
try{
  if(typeof downloads!=='undefined'&&downloads&&downloads.save&&!downloads.save.__ab43){ const sv=downloads.save; const f=function(o){ if(o&&typeof o.filename==='string') o=Object.assign({},o,{filename:o.filename.replace(/^stratos-/i,'aerostrat-')}); return sv.call(downloads,o); }; f.__ab43=1; downloads.save=f; }
}catch(e){}
try{
  const ck43=HTMLAnchorElement.prototype.click;
  if(!ck43.__ab43){ const f=function(){ try{ if(this.download) this.download=this.download.replace(/^stratos-/i,'aerostrat-'); }catch(e){} return ck43.apply(this,arguments); }; f.__ab43=1; HTMLAnchorElement.prototype.click=f; }
}catch(e){}
/* 3) investor PDF: brand text, and the new logo drawn as a picture (the PDF builder needs PNG) */
let png43=null;
try{
  const im=new Image();
  im.onload=()=>{ try{ const c=document.createElement('canvas'); c.width=750; c.height=400; const x=c.getContext('2d'); const r=(im.naturalHeight&&im.naturalWidth)?im.naturalHeight/im.naturalWidth:70/409, w=700, h=w*r; x.drawImage(im,25,(400-h)/2,w,h); png43=c.toDataURL('image/png'); }catch(e){} };
  im.src=LOGOS.white;
}catch(e){}
function wrapPdf43(v){
  if(!v||!v.jsPDF||v.__ab43) return v;
  const O=v.jsPDF;
  const J=function(){ const d=new O(...arguments);
    const t=d.text; d.text=function(s){ const a=Array.prototype.slice.call(arguments); if(typeof a[0]==='string') a[0]=RB43(a[0]); else if(Array.isArray(a[0])) a[0]=a[0].map(z=>typeof z==='string'?RB43(z):z); return t.apply(d,a); };
    const ai=d.addImage; d.addImage=function(img){ const a=Array.prototype.slice.call(arguments); if(typeof a[0]==='string'&&/\.svg(\?|$)/i.test(a[0])){ if(!png43) throw new Error('logo'); a[0]=png43; } return ai.apply(d,a); };
    return d; };
  J.prototype=O.prototype; Object.keys(O).forEach(k=>{ try{ J[k]=O[k]; }catch(e){} }); J.API=O.API;
  return Object.assign({},v,{jsPDF:J,__ab43:1});
}
try{
  let jp43=window.jspdf?wrapPdf43(window.jspdf):undefined;
  Object.defineProperty(window,'jspdf',{configurable:true,get(){ if(jp43&&jp43.jsPDF&&!jp43.__ab43) jp43=wrapPdf43(jp43); return jp43; },set(v){ jp43=v; }});
}catch(e){}
