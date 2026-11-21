
  /* ===== Growth (schema 3): airline outreach, conferences, channels, contact strategy, templates =====
     Stored in the same /api/sales document as Leads, in new collections: outreach, conferences, channels,
     strategies, growthTemplates ("templates" is already the Leads email texts). Seeded once on first load. */
  const G_SCHEMA = 3;
  const G_STATUS = ['Not started', 'Contact found', 'Email sent', 'Follow-up 1', 'Follow-up 2', 'Replied', 'Not a fit', 'Promoted to Lead'];
  const G_PILL = { 'Not started': 0, 'Contact found': 1, 'Email sent': 2, 'Follow-up 1': 3, 'Follow-up 2': 4, 'Replied': 9, 'Not a fit': 13, 'Promoted to Lead': 11 };
  const G_CLOSED = ['Replied', 'Not a fit', 'Promoted to Lead'];
  const G_OWNERSHIP = [['private', 'Private'], ['state', 'State'], ['unknown', 'Unknown']];
  const G_SRC = ['Apollo', 'LinkedIn', 'Airline website', 'Event', 'Referral', 'Association', 'Other'];
  const G_FIELDS = ['id', 'region', 'country', 'airline', 'aircraft', 'planned_week', 'owner', 'status', 'ownership', 'contact_name', 'contact_title', 'contact_email', 'contact_source', 'email_verified', 'last_touch_date', 'next_follow_up_date', 'touch_count', 'notes', 'linked_airline_id', 'lead_id', 'created_at', 'updated_at'];
  const G_PAGES = [['today', 'Today'], ['outreach', 'Airline outreach'], ['conferences', 'Conferences'], ['channels', 'Channels'], ['strategy', 'Contact strategy'], ['templates', 'Templates']];
  const G_TARGETS = [[2027, 15], [2028, 28], [2029, 42]];
  const G_NA = ['Libya', 'Tunisia', 'Algeria', 'Sudan', 'Egypt', 'Morocco'];
  const G_DAYS = [[0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat']];
  const C_TIER = ['1', '2', '3'], C_DEC = ['Attend', 'Maybe', 'Skip'], C_ROUTE = ['Attend', 'Exhibit', 'Speak'], C_STATUS = ['Idea', 'Registered', 'Booked', 'Done'];
  const CH_PRI = ['Primary', 'Secondary', 'Later'], CH_STATUS = ['Not started', 'Active', 'Paused', 'Done'];
  const G_MS = [['contract', 'Contract'], ['invoice', 'Invoice (implementation fee)'], ['import', 'Data import'], ['training', 'Instructor training'], ['report', 'First report'], ['case', 'Case study']];

  /* the 61 privately owned airlines of the outreach plan (Nov 2026): country, planned week, [airline, aircraft] */
  const G_SEED_OUT = [
    ['Libya', '2026-11-30', [['Petro Air', 11], ['Air Libya', 5], ['Buraq Air', 5], ['Berniq Airways', 4], ['Medsky Airways', 4], ['Fly OYA', 3], ['Libyan Express', 2], ['Libyan Wings', 2], ['Crown Airlines', 1], ['Ghadames Air Transport', 1], ['Global Air Transport', 1]]],
    ['Tunisia', '2026-11-30', [['Nouvelair', 15], ['Cargo Wings Express', 2], ['Tunisavia', 1]]],
    ['Algeria', '2026-11-30', [['Star Aviation', 5]]],
    ['Sudan', '2026-11-30', [['Badr Airlines', 5], ['Tarco Aviation', 5], ['Blue Bird Aviation', 1]]],
    ['Kenya', '2026-12-07', [['Renegade Air', 21], ['Safarilink Aviation', 15], ['Aircraft Leasing Services (ALS)', 13], ['Phoenix Aviation', 13], ['Mombasa Air Safari', 12], ['Skyward Express', 11], ['748 Air Services', 10], ['Blue Bird Aviation (Kenya)', 8], ['Advantage Air', 6], ['DAC East Africa', 4], ['i-Fly Air', 4], ['Jetlite Air', 4]]],
    ['Kenya', '2026-12-14', [['Astral Aviation', 3], ['Fanjet Express', 3], ['Jetways Airlines', 3], ['Safe Air Company', 3], ['Airkenya Express', 2], ['Buffair Services', 2], ['Freedom Airline Express', 2], ['Jubba Airways (Kenya)', 2], ['African Express Airways', 1], ['Airworks Kenya', 1], ['DragonFly', 1], ['EastAfrican', 1]]],
    ['Tanzania', '2026-12-21', [['Auric Air', 25], ['Coastal Aviation', 9], ['Flightlink', 7], ['Air Excel', 6], ['Regional Air', 5], ['ZanAir', 5], ['As Salaam Air', 3]]],
    ['Uganda', '2026-12-21', [['BAR Aviation Uganda', 19], ['Eagle Air', 4]]],
    ['Ethiopia', '2026-12-21', [['National Airways Ethiopia', 5], ['East African Aviation', 4], ['Trans Nation Airways', 1]]],
    ['Somalia', '2026-12-28', [['Daallo Airlines', 4], ['Maandeeq Air', 3], ['Fajr Airlines', 1], ['KESOM Air', 1]]],
    ['Zambia', '2026-12-28', [['Proflight Zambia', 13]]],
    ['Zimbabwe', '2026-12-28', [['CATS (Central Air Transport Services)', 5]]],
    ['Malawi', '2026-12-28', [['FlyNyasa', 5]]]
  ];
  const C_NOTE = 'Per organiser pages, 21 Nov 2026, confirm before booking.';
  /* name, start, end, date note (TBC), place, tier, link, decision */
  const G_SEED_CONF = [
    ['ICAO AI in Aviation Symposium', '2027-02-01', '2027-02-03', '', 'Dubai', '2', 'https://www.icao.int/events/AAAI2027'],
    ['CAPA Airline Leader Summit: Airlines in Transition', '2027-04-08', '2027-04-09', '', 'Bratislava', '2', 'https://centreforaviation.com/events'],
    ['WATS (World Aviation Training Summit)', '2027-04-21', '2027-04-22', '', 'Orlando', '1', 'https://www.halldale.com/wats-2026-world-aviation-training-summit'],
    ['ICAO Global Implementation Support Symposium', '2027-05-24', '2027-05-27', '', 'Luanda', '2', 'https://www.icao.int/events/giss2027'],
    ['Flight Safety Foundation Safety Forum', '2027-05-25', '2027-05-26', '', 'Brussels', '3', 'https://eurocontrol.int/event/safety-forum-2027'],
    ['AviaDev Africa', '2027-06-09', '2027-06-11', '', 'Lusaka', '1', 'https://theflyingengineer.com/aviation-events/aviadev-africa-2027/'],
    ['Paris Air Show', '2027-06-14', '2027-06-20', '', 'Le Bourget', '2', 'https://www.bdli.de/en/dates/paris-air-show'],
    ['APATS', '2027-08-25', '2027-08-26', '', 'Bangkok', '3', 'https://www.halldale.com/apats2027'],
    ['Aviation AFRICA Summit', '', '', 'September 2027 TBC', '', '1', ''],
    ['AIR Expo Africa', '2027-11-10', '2027-11-11', '', 'Johannesburg', '2', 'https://theflyingengineer.com/aviation-events/air-expo-africa-2027/'],
    ['AFRAA Annual General Assembly', '', '', 'November 2027 TBC', '', '1', 'https://www.afraa.org'],
    ['AACO AGM', '', '', 'November 2027 TBC', '', '2', 'https://aaco.org'],
    ['Dubai Airshow', '2027-11-15', '2027-11-19', '', 'Dubai', '2', ''],
    ['AFRAA Aviation Stakeholders Convention and Safety Summit', '', '', 'Spring 2027 TBC', '', '1', 'https://www.afraa.org'],
    ['Routes Europe', '2027-04-20', '2027-04-22', '', 'Antalya', '3', 'https://www.routesonline.com/events/290/routes-europe-2027/about-hosts/', 'Skip'],
    ['Routes World', '2027-10-17', '2027-10-19', '', 'Barcelona', '3', 'https://www.routesonline.com/', 'Skip']
  ];
  /* name, priority, starter steps */
  const G_SEED_CH = [
    ['Warm network and referrals', 'Primary', ['List 30 people at airlines', 'Ask each for one introduction', 'Log each in Outreach with source Referral', 'Thank and report back']],
    ['Direct outbound', 'Primary', ['Find the contact', 'Send the onboarding email', 'Follow up on day 5', 'Follow up on day 10', 'Call', 'Book a demo']],
    ['Reference airlines', 'Primary', ['Agree founding-airline terms', 'Get a quote and written permission', 'Write a one-page case study', 'Attach it to every email']],
    ['Conferences', 'Primary', ['Choose the Tier 1 events', 'Book meetings 4 weeks before', 'Send the one-pager', 'Follow up within 3 days']],
    ['Industry associations (AFRAA, AACO)', 'Secondary', ['Find the training or safety committee contact', 'Offer a workshop', 'Ask for member introductions']],
    ['Aviation authorities', 'Secondary', ['Find the EBT/CBTA contact', 'Share a briefing', 'Ask which airlines are transitioning']],
    ['Training ecosystem', 'Secondary', ['List LMS vendors, simulator centres and consultants', 'Agree a referral arrangement', 'Track referrals']],
    ['Free CBTA/EBT workshops', 'Secondary', ['Choose a topic', 'Co-host with an association', 'Collect attendees', 'Follow up with a demo offer']],
    ['Pilot communities and unions', 'Secondary', ['Share a short explainer', 'Offer a pilot-facing demo', 'Log inbound requests']],
    ['Lessors, OEM support, insurers and auditors', 'Secondary', ['List the 10 most relevant', 'Hold one meeting with each', 'Agree how they introduce operators']],
    ['Airline-owned flight schools, ATOs and MRO groups', 'Secondary', ['List them by airline', 'Approach through the airline contact']],
    ['LinkedIn referral loop', 'Secondary', ['After every conversation, ask for two more names', 'Add them to Outreach']],
    ['AeroConnect funnel (from Jan 2027)', 'Later', ['Plan the AeroConnect funnel for January 2027']],
    ['Regional agents (2029, only after 10 paying airlines)', 'Later', ['Revisit once 10 airlines are paying']]
  ];
  /* source, best for, steps, cost note */
  const G_SEED_ST = [
    ['Apollo.io', 'Named training and flight-operations contacts with email addresses', ['Filter by title: training, chief pilot, flight operations', 'Filter by industry: airlines', 'Filter by country', 'Verify every email before sending'], ''],
    ['LinkedIn / Sales Navigator', 'Finding the right person and a warm path to them', ['Find the right person', 'Look for a warm path (shared connections)', 'Connect before emailing'], ''],
    ['Airline websites', 'Official addresses and current management', ['Check the contact page', 'Check the press page', 'Check the AOC pages'], ''],
    ['Association member lists (AFRAA, AACO) and event attendee lists', 'Members and attendees we can approach with context', ['Get the member lists', 'Get the attendee lists of the events we attend', 'Match names to airlines in Outreach'], ''],
    ['Regulator operator lists', 'Complete lists of operators per country', ['Download the operator (AOC) list of each regulator', 'Add missing private airlines to Outreach'], ''],
    ['ch-aviation, CAPA, Routesonline', 'Fleet data, news and management names', ['Check what the free pages show first', 'Use for fleet and management data'], 'Mostly paid'],
    ['Own network of pilots and instructors', 'Warm introductions to training departments', ['List the pilots and instructors we know at each airline', 'Ask each for the right training contact', 'Log them in Outreach with source Referral'], ''],
    ['Verification routine', 'Keeping the sending domain healthy', ['Verify every email before sending', 'Limit the number of sends per day', 'Log the source on every Outreach row'], '']
  ];
  const G_SIG = '\n\nKind regards,\n{sender}\nAeroStrat | Intelligence Driven Aviation\naero-strat.com';
  const G_TPL = [
    { id: 'onboarding', name: 'Onboarding email', subject: 'AeroStrat Training for {airline}', body: 'Dear {contact_name},\n\nI am {sender} from AeroStrat. We build software for airline training departments: EBT and CBTA grading on your own forms, and tracking of every qualification and expiry in one place.\n\nWith a fleet of {fleet} aircraft, {airline} is the kind of operator we built AeroStrat Training for. Could we show you the platform in a 30-minute call in the coming weeks?' + G_SIG },
    { id: 'followup1', name: 'Follow-up 1', subject: 'Re: AeroStrat Training for {airline}', body: 'Dear {contact_name},\n\nA short follow-up on my email last week. If it would help, we can show AeroStrat Training to your team on a 30-minute call at a time that suits you.' + G_SIG },
    { id: 'followup2', name: 'Follow-up 2', subject: 'Re: AeroStrat Training for {airline}', body: 'Dear {contact_name},\n\nI do not want to fill your inbox, so this is my last note for now. If EBT or CBTA grading and training records are on your agenda for {airline} this year, I would be glad to talk. Otherwise, could you point me to the right person in your training department?' + G_SIG },
    { id: 'meeting', name: 'Meeting request', subject: '{airline} x AeroStrat: 30 minutes?', body: 'Dear {contact_name},\n\nThank you for your reply. Could we book 30 minutes to show you AeroStrat Training on {airline}’s fleet of {fleet} aircraft and hear how your team works today? Please suggest two times that suit you, or reply with a good number to call.' + G_SIG },
    { id: 'proposal', name: 'Proposal covering email', subject: 'AeroStrat Training proposal for {airline}', body: 'Dear {contact_name},\n\nPlease find attached our proposal for {airline}: scope, pricing, implementation plan and service levels. I would be glad to walk you through it on a short call this week.' + G_SIG }
  ];

  view.g = { page: 'today', o: { q: '', owner: '', status: '', source: '', mode: 'plan', state: false }, sel: {}, open: null, add: null, imp: null, c: { q: '', tier: '', decision: '' }, tplRow: '', tpl: 'onboarding' };
  let gMigrated = false;

  /* ---------- helpers ---------- */
  const gIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const gHttp = u => /^https?:\/\/[^\s<>"']+$/i.test(String(u || '').trim());
  const gEmailOk = e => /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(String(e || '').trim());
  const gDateOk = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) && !isNaN(new Date(d + 'T12:00:00'));
  const gNow = () => new Date().toISOString();
  const gMe = () => { const n = String(auth && auth.name || '').trim(); return OWNERS.find(o => o.toLowerCase() === n.toLowerCase()) || n; };
  const gOwners = cur => OWNERS.concat(cur && !OWNERS.includes(cur) ? [cur] : []);
  const gWeekend = () => Array.isArray(data.settings.weekend) ? data.settings.weekend : [5, 6];
  function addWork(iso, n) {
    const W = gWeekend(); if (W.length >= 7) return addDays(iso, n);
    const d = new Date(iso + 'T12:00:00'); let k = 0;
    while (k < n) { d.setDate(d.getDate() + 1); if (!W.includes(d.getDay())) k++; }
    return gIso(d);
  }
  const gRegion = c => G_NA.includes(c) ? 'North Africa' : (regionName(c) || 'East Africa');
  const gKey = (name, country) => norm(name) + '|' + norm(country);
  const gPill = st => '<span class="ls-pill s' + (G_PILL[st] || 0) + '">' + esc(st) + '</span>';
  const gWeek = iso => iso ? 'Week of ' + fdate(iso) : 'No week set';
  const gLink = (u, t) => gHttp(u) ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(t || host(u)) + '</a>' : '';
  const gFind = (coll, id) => (data[coll] || []).find(x => x.id === id);
  function gRow(o) {
    return Object.assign({ id: nid('o'), region: '', country: '', airline: '', aircraft: '', planned_week: '', owner: '', status: 'Not started', ownership: 'unknown', contact_name: '', contact_title: '', contact_email: '', contact_source: '', email_verified: 'no', last_touch_date: '', next_follow_up_date: '', touch_count: 0, notes: '', linked_airline_id: '', lead_id: '', created_at: gNow(), updated_at: gNow(), touches: [] }, o || {});
  }
  function gConf(o) { return Object.assign({ id: nid('c'), name: '', start_date: '', end_date: '', date_note: '', place: '', tier: '2', decision: 'Maybe', route: 'Attend', budget: '', link: '', airlines_to_meet: '', status: 'Idea', notes: '', people: [] }, o || {}); }
  function gChan(o) { return Object.assign({ id: nid('h'), name: '', priority: 'Secondary', owner: '', status: 'Not started', target: '', notes: '', steps: [] }, o || {}); }
  function gStrat(o) { return Object.assign({ id: nid('s'), source: '', best_for: '', steps: [], cost_note: '', rating: '', notes: '' }, o || {}); }
  const gStep = text => ({ id: nid('t'), text: text || '', done: '', owner: '', due_date: '' });

  function gSeed() {
    const out = []; let n = 0;
    G_SEED_OUT.forEach(([country, week, list]) => list.forEach(([airline, ac]) => out.push(gRow({ id: 'o-seed-' + (++n), region: G_NA.includes(country) ? 'North Africa' : 'East Africa', country, airline, aircraft: ac, planned_week: week }))));
    return {
      outreach: out,
      conferences: G_SEED_CONF.map(([name, s, e, tbc, place, tier, link, dec], i) => gConf({ id: 'c-seed-' + (i + 1), name, start_date: s, end_date: e, date_note: (tbc ? tbc + '. ' : '') + C_NOTE, place, tier, link, decision: dec || 'Maybe' })),
      channels: G_SEED_CH.map(([name, pri, steps], i) => gChan({ id: 'h-seed-' + (i + 1), name, priority: pri, steps: steps.map(gStep) })),
      strategies: G_SEED_ST.map(([source, best, steps, cost], i) => gStrat({ id: 's-seed-' + (i + 1), source, best_for: best, steps: steps.slice(), cost_note: cost })),
      growthTemplates: G_TPL.map(t => Object.assign({}, t))
    };
  }
  /* migration: create the Growth collections from the seed once (schema < 3); never touch them after that */
  function growthFix(d) {
    const v = num(d.schema_version);
    if (v < G_SCHEMA) {
      const S = gSeed();
      Object.keys(S).forEach(k => { if (!Array.isArray(d[k])) { d[k] = S[k]; gMigrated = true; } });
      d.schema_version = G_SCHEMA;
    }
    ['outreach', 'conferences', 'channels', 'strategies', 'growthTemplates'].forEach(k => { if (!Array.isArray(d[k])) d[k] = []; });
    d.outreach = d.outreach.map(gRow); d.conferences = d.conferences.map(c => { c = gConf(c); c.people = Array.isArray(c.people) ? c.people : []; return c; });
    d.channels = d.channels.map(c => { c = gChan(c); c.steps = (c.steps || []).map(s => Object.assign(gStep(), s)); return c; });
    d.strategies = d.strategies.map(s => { s = gStrat(s); s.steps = (s.steps || []).map(String); return s; });
    G_TPL.forEach(t => { if (!d.growthTemplates.some(x => x.id === t.id)) d.growthTemplates.push(Object.assign({}, t)); });
    if (!Array.isArray(d.settings.weekend)) d.settings.weekend = [5, 6];
    return d;
  }

  /* ---------- links to Finance (read-only) and to Leads ---------- */
  function gFin(r) {
    if (!finState || !Array.isArray(finState.airlines)) return null;
    let a = r.linked_airline_id ? finState.airlines.find(x => x.id === r.linked_airline_id) : null;
    if (!a && !r.linked_airline_id && !r.fin_none) { a = finState.airlines.find(x => norm(x.name) === norm(r.airline) && norm(x.country) === norm(r.country)) || null; if (a) r.linked_airline_id = a.id; }
    return a || null;
  }
  const gNotInFin = r => !!finState && Array.isArray(finState.airlines) && !gFin(r);
  const gFleet = r => { const a = gFin(r); return a && num(a.fleet) ? num(a.fleet) : r.aircraft; };
  const gLead = r => r.lead_id ? data.leads.find(l => l.id === r.lead_id) || null : null;
  const gPromoted = r => !!gLead(r);
  const gLeadFor = r => data.leads.find(l => (r.linked_airline_id && l.finId === r.linked_airline_id) || (norm(l.name) === norm(r.airline) && norm(l.country) === norm(r.country)));
  const gDup = (name, country, exceptId) => data.outreach.find(x => x.id !== exceptId && gKey(x.airline, x.country) === gKey(name, country));
  const gDue = r => !G_CLOSED.includes(r.status) && !gPromoted(r) && r.next_follow_up_date && r.next_follow_up_date <= today();
  const gNoContact = r => !String(r.contact_name || '').trim() && !String(r.contact_email || '').trim();
  const gEmailed = r => num(r.touch_count) > 0 || ['Email sent', 'Follow-up 1', 'Follow-up 2', 'Replied'].includes(r.status);
  const gReplied = r => r.status === 'Replied' || gPromoted(r);

  /* status rules: Email sent → follow-up in 5 working days; Follow-up 1 → 5 more; after Follow-up 2 no further date */
  function gSetStatus(r, st) {
    if (!st || st === r.status || st === 'Promoted to Lead') return;
    const t = today(); r.status = st;
    if (st === 'Email sent' || st === 'Follow-up 1' || st === 'Follow-up 2') {
      r.last_touch_date = t; r.touch_count = num(r.touch_count) + 1;
      r.next_follow_up_date = st === 'Follow-up 2' ? '' : addWork(t, 5);
    } else if (G_CLOSED.includes(st)) r.next_follow_up_date = '';
    r.touches = (r.touches || []).concat([{ date: t, status: st, by: auth ? auth.name : '' }]);
    r.updated_at = gNow();
  }
  /* merge fields {airline} {contact_name} {fleet} {sender} */
  function gFill(txt, r) {
    const V = { airline: r ? r.airline : '', contact_name: r && String(r.contact_name || '').trim() ? r.contact_name : '', fleet: r ? gFleet(r) : '', sender: auth ? (gMe() || auth.name) : '' };
    return String(txt || '').replace(/\{(\w+)\}/g, (m, k) => V[k] != null && V[k] !== '' ? String(V[k]) : m);
  }
  function gTplText(id, r) { const T = data.growthTemplates.find(x => x.id === id); return T ? 'Subject: ' + gFill(T.subject, r) + '\n\n' + gFill(T.body, r) : ''; }
  function gDownload(name, txt) { const u = URL.createObjectURL(new Blob([String.fromCharCode(65279) + txt], { type: 'text/csv' })), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
  const gQ = v => { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  function gParseCSV(text) {
    const rows = []; let row = [], cur = '', q = false; text = String(text || '').replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(x => String(x).trim() !== ''));
  }
