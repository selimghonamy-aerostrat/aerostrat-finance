/* ===== v23: active airlines only — trims the researched import, and flags airlines in your list that have stopped flying ===== */
/* 1) researched import: drop entries whose current activity is not confirmed */
const DROP23=['LyddAir','Air Belgium','FLYYO','Yanair','Skyline Express','Blue Bird Aviation','Fly Angola','AeroJet','Mont Gabaon Airlines','Niger Airlines','Fly Jordan','Medsky Airways','i-Fly Air','ROMCargo Airlines','Icar Air','Fly Oya'];
(function(){ const d=new Set(DROP23.map(norm19)); for(let i=IMP18.length-1;i>=0;i--) if(d.has(norm19(IMP18[i][1]))) IMP18.splice(i,1); })();

/* 2) airlines known to have stopped flying (name, country, when) */
const CEASED23=[
 ['Lufthansa CityLine','Germany','Apr 2026'],['PLAY','Iceland','Sep 2025'],['Fly Play','Iceland','Sep 2025'],['SmartLynx Airlines','Latvia','Nov 2025'],['SmartLynx','Latvia','Nov 2025'],
 ['Eastern Airways','United Kingdom','Oct 2025'],['Blue Islands','United Kingdom','Nov 2025'],['Ascend Airways UK','United Kingdom','Apr 2026'],['Aer Lingus UK','United Kingdom','Mar 2026'],
 ['Flybe','United Kingdom','Jan 2023'],['Jota Aviation','United Kingdom','2022'],['Thomas Cook Airlines','United Kingdom','2019'],['Air Antilles','France','Apr 2026'],
 ['Xfly','Estonia','Nov 2024'],['Nordica','Estonia','Nov 2024'],['Bluebird Nordic','Iceland','Apr 2024'],['Novair','Sweden','2023'],['Air Leap','Norway','2022'],
 ['CargoLogic Germany','Germany','2022'],['Air Berlin','Germany','2017'],['Germania','Germany','2019'],['Czech Airlines','Czechia','Oct 2024'],['Alitalia','Italy','2021'],['Air Italy','Italy','2020'],['Ernest Airlines','Italy','2021'],
 ['Air Moldova','Moldova','2023'],['Ukraine International Airlines','Ukraine','2022'],['Bees Airlines','Ukraine','2022'],['Blue Panorama','Italy','2024'],['Ellinair','Greece','2023'],['Orange2Fly','Greece','2023'],
 ['Izhavia','Russia','Aug 2026'],['Angara Airlines','Russia','Nov 2025'],['AirBridgeCargo','Russia','2022'],['Lumiwings','Greece','Sep 2025'],['Air Albania','Albania','Dec 2025'],
 ['Wizz Air Abu Dhabi','United Arab Emirates','Sep 2025'],['Royal Wings','Jordan','2018'],['Wings of Lebanon','Lebanon','2020'],['Zagrosjet','Iraq','2018'],['Cham Wings','Syria','replaced by Fly Cham'],
 ['Comair','South Africa','2022'],['Kulula','South Africa','2022'],['Mango Airlines','South Africa','2022'],['Mango','South Africa','2022'],['South African Express','South Africa','2020'],
 ['Congo Airways','DR Congo','grounded'],['Fly540','Kenya','2022'],['Kaya Airlines','Mozambique','ceased'],["Int'Air Îles",'Comoros','ceased'],['AB Aviation','Comoros','licence suspended'],['Tsaradia','Madagascar','merged'],
 ['Air Burundi','Burundi','2009'],['Eritrean Airlines','Eritrea','no service'],['Somali Airlines','Somalia','not relaunched'],['Air Djibouti','Djibouti','no aircraft of its own'],
 ['Air Leisure','Egypt','2018'],['FlyEgypt','Egypt','Oct 2024'],['Libyan Arab Air Cargo','Libya','ceased'],['Colombe Airlines','Côte d\'Ivoire','2017'],['Nouvelle Air Affaires Gabon','Gabon','2013'],
 ['Sun Air','Sudan','idle'],['Green Flag Aviation','Sudan','idle'],['Trans Air Cargo Service','DR Congo','aircraft damaged Sep 2026'],['Air Belgium','Belgium','bankrupt Apr 2025']
];
const C23={'uae':'unitedarabemirates','emirates':'unitedarabemirates','uk':'unitedkingdom','greatbritain':'unitedkingdom','england':'unitedkingdom','drc':'drcongo','democraticrepublicofthecongo':'drcongo','congokinshasa':'drcongo','czechrepublic':'czechia','ivorycoast':'cotedivoire','southafricarepublic':'southafrica'};
const cn23=c=>{const k=norm19(c||'');return C23[k]||k;};
const ceasedMap23=new Map(CEASED23.map(([n,c,w])=>[norm19(n),{c,w}]));
function ceased23(){
  const out=[]; const dis=new Set((view.ceased23Keep)||[]);
  state.airlines.forEach((a,i)=>{ if(!a) return; const m=ceasedMap23.get(norm19(a.name)); if(!m||dis.has(a.id)) return;
    if(a.country&&m.c&&cn23(a.country)!==cn23(m.c)) return;
    out.push({i,a,when:m.w}); });
  return out;
}
const pipelineBase23=pipeline;
pipeline=function(){
  const h=pipelineBase23(); if(readOnly) return h;
  const L=ceased23(); if(!L.length) return h;
  const names=L.map(x=>esc(x.a.name)+' <span class="muted">('+esc(x.a.country||'')+(x.when?' · '+esc(x.when):'')+')</span>').join(', ');
  const banner='<div class="banner warn"><span class="grow"><b>'+L.length+' airline'+(L.length===1?' in your list has':'s in your list have')+' stopped flying:</b> '+names+'. Remove them so every tab counts active airlines only.</span><button class="btn small cta-outline" data-act="ceased23-remove">Remove '+(L.length===1?'it':'them')+'</button><button class="btn small" data-act="ceased23-keep">Keep</button></div>';
  const k=h.indexOf('<div class="region-strip');
  return k>=0?h.slice(0,k)+banner+h.slice(k):banner+h;
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return; const a=b.dataset.act;
  if(a==='ceased23-remove'&&!readOnly){ const ids=new Set(ceased23().map(x=>x.a.id)); const n=ids.size; state.airlines=state.airlines.filter(x=>!ids.has(x.id)); commit(); toast(n+' inactive airline'+(n===1?'':'s')+' removed. Click Save to keep the change.'); }
  if(a==='ceased23-keep'){ view.ceased23Keep=Array.from(new Set([...(view.ceased23Keep||[]),...ceased23().map(x=>x.a.id)])); persistView(); render(); }
});
