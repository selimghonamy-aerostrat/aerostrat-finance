/* ===== v52: Libya, Algeria, Tunisia and Sudan airlines from Planespotters (country operator lists, Nov 2026) —
   active aircraft only (parked and on-order left out), active airlines only. Government, air force and private
   aircraft are not airlines and are left out. Fleet numbers are corrected, active airlines missing from the list are
   added as prospects (not in the forecast until ticked), and airlines with no active aircraft are removed (one you
   have worked on — ticked, signed or dated — is kept and marked to check instead). ===== */
const PS52=c=>'https://www.planespotters.net/country/operators/'+c;
/* per country: the airlines with active aircraft, and the last name on the Planespotters list (anything after it
   alphabetically was not in the list we checked, so it is left as it is) */
const C52={
  Libya:{last:'Petro Air',list:[
    ['Air Libya',5,'3 CRJ-200, 2 Avro RJ100'],
    ['Berniq Airways',4,'4 A320'],
    ['Buraq Air',5,'4 A320, 1 E190'],
    ['Crown Airlines',1,'1 A320'],
    ['Fly Oya',3,'1 A320, 1 B777-200, 1 A330-200 leased from Air Anka'],
    ['Ghadames Air',1,'1 B777-200'],
    ['Global Air Transport',1,'1 ERJ-145'],
    ['Libyan Airlines',1,'1 A320'],
    ['Libyan Express',2,'1 ATR 42, 1 B737-400'],
    ['Libyan Wings',2,'2 A319'],
    ['Medsky Airways',4,'3 A320 (2 operated by Malta MedAir), 1 E195 leased from Marathon'],
    ['Petro Air',11,'7 DHC-6 Twin Otter, 2 Dash 8-300, 2 E170']]},
  Algeria:{last:'Tassili Travail Aérien',list:[
    ['Air Algérie',56,'24 B737-800, 3 B737 MAX 8, 2 B737-700, 1 B737-600, 6 A330-200, 6 A330-900, 14 ATR 72'],
    ['Domestic Airlines',15,'6 B737-800, 4 Dash 8-400, 4 Dash 8-200, 1 ATR 72'],
    ['Star Aviation',5,'5 DHC-6 Twin Otter (3 leased from Zimex)'],
    ['Tassili Travail Aérien',2,'2 Cessna 408 SkyCourier (aerial work)']]},
  Tunisia:{last:'Tunisavia',list:[
    ['Cargo Wings Express',2,'2 B737-300 freighters'],
    ['Nouvelair',15,'12 A320-200, 3 A320neo'],
    ['Tunisair',10,'8 A320-200, 1 A320neo, 1 A330-200'],
    ['Tunisair Express',1,'1 ATR 72'],
    ['Tunisavia',1,'1 DHC-6 Twin Otter (a second one is leased out to Trans Maldivian)']]},
  Sudan:{last:'Tarco Aviation',list:[
    ['Badr Airlines',5,'3 B737-800, 2 CRJ-200'],
    ['Blue Bird Aviation',1,'1 DHC-6 Twin Otter'],
    ['Sudan Airways',1,'1 A320'],
    ['Tarco Aviation',5,'4 B737-800, 1 B737-300']]}
};
const ALIAS52={ghadamesairtransport:'ghadamesair',buraqairtransport:'buraqair',libyanexpressairtransport:'libyanexpress',libyanarab:'libyan',flyoyaa:'flyoya',oya:'flyoya',crownair:'crown',globalair:'globalairtransport',
  tassili:'domestic',tassiliair:'domestic',domesticairlinestassili:'domestic',nouvelairtunisie:'nouvelair',tarco:'tarcoaviation',tarcoair:'tarcoaviation',badrair:'badr',staraviationalgeria:'staraviation',tunisairexpres:'tunisairexpress'};
const key52=n=>{ const k=norm19(n); return ALIAS52[k]||k; };
const ctry52=c=>{ const k=norm19(c); return Object.keys(C52).find(x=>norm19(x)===k)||''; };
const MAP52={}; Object.keys(C52).forEach(c=>{ MAP52[c]=new Map(C52[c].list.map(r=>[key52(r[0]),r])); });
const note52=(c,r)=>'Planespotters Nov 2026: '+r[1]+' active aircraft ('+r[2]+') · '+PS52(c);
/* the "ready to add" research list uses the new numbers */
try{ for(let i=IMP18.length-1;i>=0;i--){ if(ctry52(IMP18[i][0])) IMP18.splice(i,1); }
  Object.keys(C52).forEach(c=>C52[c].list.forEach(r=>IMP18.push([c,r[0],r[1],'2026-11',PS52(c)]))); }catch(e){}
const worked52=a=>!((a.status||'Pipeline')==='Pipeline'&&!a.include&&!a.signMonth&&!a.goLiveMonth);
function mig52(s){
  if(!s||!s.settings||!Array.isArray(s.airlines)) return null;
  const done=Object.assign({},s.settings.ps52||{}), todo=Object.keys(C52).filter(c=>!done[c]); if(!todo.length) return null;
  const R={countries:todo,upd:0,add:0,del:[],mark:[]}, seen={}; todo.forEach(c=>seen[c]=new Set());
  const keep=[];
  s.airlines.forEach(a=>{
    const c=a&&ctry52(a.country); if(!c||todo.indexOf(c)<0){ keep.push(a); return; }
    const k=key52(a.name), r=MAP52[c].get(k);
    if(r){ seen[c].add(k);
      if(num(a.fleet)!==r[1]){ a.fleet=r[1]; R.upd++; }
      const rest=String(a.notes||'').split('|').map(x=>x.trim()).filter(x=>x&&x.indexOf('Planespotters Nov 2026')!==0&&!/^Researched [A-Za-z]+ 20[0-9][0-9]: fleet/.test(x));
      a.notes=[note52(c,r)].concat(rest).join(' | ').slice(0,600); keep.push(a); return; }
    if(norm19(a.name)>norm19(C52[c].last)){ keep.push(a); return; }
    if(worked52(a)){ if(!/no active aircraft/i.test(a.notes||'')) a.notes=('No active aircraft on Planespotters (Nov 2026), check before counting on it'+(a.notes?' | '+a.notes:'')).slice(0,600); R.mark.push(a.name); keep.push(a); }
    else R.del.push(a.name);
  });
  s.airlines=keep;
  todo.forEach(c=>C52[c].list.forEach(r=>{ if(seen[c].has(key52(r[0]))) return;
    s.airlines.push(newAirline({name:r[0],country:c,fleet:r[1],pilots:'',cohort:'',status:'Pipeline',prob:10,include:false,signMonth:'',goLiveMonth:'',notes:note52(c,r)})); R.add++; }));
  todo.forEach(c=>done[c]=1); s.settings.ps52=done; return R;
}
const applyDraftBase52=applyDraft;
applyDraft=function(){
  applyDraftBase52();
  if(readOnly||cfgLocked) return;
  const R=mig52(state);
  if(R){ restored=false; saveDraft(); window.__ps52=R;
    const parts=[]; if(R.upd) parts.push(R.upd+' fleet'+(R.upd===1?'':'s')+' corrected'); if(R.add) parts.push(R.add+' added'); if(R.del.length) parts.push(R.del.length+' inactive removed'); if(R.mark.length) parts.push(R.mark.length+' marked to check');
    setTimeout(()=>toast(R.countries.join(', ')+' airlines updated from Planespotters (active aircraft only)'+(parts.length?': '+parts.join(', '):'')+'. Press Save to keep it.'),3800); }
};
