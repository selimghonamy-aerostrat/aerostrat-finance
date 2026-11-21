    welcome: { name: 'Welcome + implementation requirements', subject: 'AeroStrat Training onboarding: what we need from {Airline} (EBT and TMS)', body: 'Dear Capt. {LastName},\n\nWelcome to AeroStrat. To set up {Airline} on AeroStrat Training, we need information from your team for both parts of the platform: EBT and the Training Management System (TMS). The attached Airline Implementation Requirements checklist lists every item, with its exact format.\n\nATTACHED\n1. AeroStrat_Airline_Implementation_Requirements.pdf\n2. AeroStrat_TMS_Demo_Crew_and_Ground_Training_Records.xlsx (template with mock data)\n3. AeroStrat_TMS_Demo_Travel_Documents.xlsx (template with mock data)\n4. The data-processing agreement, for signature\n\nFIRST: THE DATA-PROCESSING AGREEMENT\nPlease sign it before uploading anything about your crew. Nothing is loaded until it is signed.\n\nEBT (32 items in 7 sections)\nCompany identity; people; EBT phase and check structure; forms; modules and the three-year cycle; standards and policies; optional items. Items you already sent for the demo only need confirming.\n\nTMS (27 items in 3 groups)\nCrew and ground training records; travel documents (leave the document number blank); two exports from your LMS or e-learning provider, exactly as the system produces them.\n\nUPLOADS\nEverything goes to your secure shared folder: {DriveLink}. The files contain personal data, so please upload them there and not by email.\n\nONE ACTION FOR YOUR IT TEAM\nPlease allow-list our sending domain, aero-strat.com, so platform emails reach your staff.\n\nHOW WE SUGGEST YOU START\nThe forms, the EBT pilot roster and the TMS Crew Master sheet take the longest, so it helps to start with those. Anything you cannot send is defaulted only with your written approval. Who will be our point of contact, and when would suit you for a kickoff call?\n\nIf you need any assistance, you can email us, or we can have a short call whenever you like.' + SIG },
    golive: { name: 'Go-live', subject: '{Airline} is live on AeroStrat Training', body: 'Dear Capt. {LastName},\n\n{Airline} is now live on AeroStrat Training. For the next 30 days we will check in every {Day} and answer any issue within {ResponseTime}.\n\nWe would like to book a 30-day review on {Date} to look at usage, open points and your team’s feedback.' + SIG }
  };

  /* Research from the AeroStrat outreach playbook (Nov 2026), applied when these Egyptian airlines are imported */
  const RESEARCH = {
    'nile air': { wave: 'Wave 1', priority: 'A', stage: 'Contact found', owner: 'Selim', nextAction: 'Send the combined AeroStrat Training email + video to Aly; book a feedback call', nextActionDate: '2026-11-19', contacts: [{ name: 'Aly', title: 'Training Director', email: 'training.manager@nileair.com', linkedin: '', phone: '' }], notes: 'Met in person; onboarding documents for EBT + TMS in progress. Warm lead — skip the cold email sequence.' },
    'nesma airlines': { wave: 'Wave 1', priority: 'A', owner: 'Selim', fleet: 13, fleetAsOf: '2026-10', fleetSource: 'https://www.ch-aviation.com/news/172874-egypts-flyplus-adds-wet-leased-a320-200-capacity', nextAction: 'Find Head of Training / Training Manager on LinkedIn', nextActionDate: '2026-11-26', contacts: [{ name: 'Karim Baky', title: 'CEO', email: '', linkedin: '', phone: '' }, { name: 'Amr Mokhlis', title: 'Commercial Director', email: '', linkedin: '', phone: '' }], notes: 'Rebranded to flyplus. In-house fleet 8 A320 + 5 A321, plus 3 wet-leased aircraft (Oct 2026).' },
    'air cairo': { wave: 'Wave 2', priority: 'B', owner: 'Selim', fleet: 41, fleetAsOf: '2026-09', fleetSource: 'https://www.ch-aviation.com/news/171629-air-cairo-orders-fifteen-a320-200ns-directly-from-airbus', nextAction: 'Check whether training sits with the EgyptAir group', nextActionDate: '2027-01-15', contacts: [{ name: 'Hussein Sherif', title: 'Chairman & CEO', email: '', linkedin: '', phone: '' }], notes: '20 A320neo, 12 A320, 6 ATR72-600, 3 E190; target 82 aircraft in four years. EgyptAir majority-owned.' },
    'almasria universal airlines': { wave: 'Excluded', stage: 'Do not approach', notes: 'Capt. Mougy’s employer and the demo-data source — conflict-of-interest check before any approach.' },
    'pyramids airlines': { wave: 'Excluded', stage: 'Do not approach', notes: 'Capt. Mougy’s employer — any approach goes through Selim after a conflict check. Fleet: A321 + 737-800 from Nov 2026; plans to establish EBT.' }
  };
  const researchFor = name => { const n = norm(name); if (RESEARCH[n]) return RESEARCH[n]; if (n.includes('flyplus') || n.includes('nesma')) return RESEARCH['nesma airlines']; return null; };

  /* Pricing used when Finance cannot be read and nothing was saved yet (Finance's bundle tiers; seat prices unknown) */
  const DEFAULT_PRICE = { at: '', products: [{ id: 'bundle', name: 'EBT/CBTA + TMS bundle', bands: [{ label: 'Tier 1', maxPilots: 100 }, { label: 'Tier 2', maxPilots: 180 }, { label: 'Tier 3', maxPilots: null }], rates: [17, 14, 12], impl: [4000, 8000, 12000], seats: { cabin: true, admin: true, instructor: true }, currency: 'USD' }], seatPrices: { cabinRate: 0, adminRate: 0, instructorRate: 0, currency: 'USD' }, ratios: { pilotsPerAircraft: 10, cabinPerAircraft: 0, instructorsPerAircraft: 0, adminsPerAirline: 0 }, quarterly: 10, monthly: 15, fx: { eurUsd: 1, currencies: [], main: 'USD' }, adj: {} };

  let data = null, base = '', role = null, dirty = false, busy = false, loading = true, logo = '';
  let conflict = null, staleDraft = null, finState = null, finLoading = false, finError = '', toastT = 0;
  let price = DEFAULT_PRICE, priceSrc = 'default';
  const view = { tab: 'overview', lead: null, mode: 'list', f: { q: '', country: '', wave: '', stage: '', owner: '' }, imp: { country: 'Egypt', picked: {} }, actF: { lead: '', channel: '' }, tpl: 'intro', fbF: { lead: '', type: '', status: '' }, fbN: {}, add: null };
  try { const m = localStorage.getItem('aerostrat-sales-mode'); if (m === 'board' || m === 'list') view.mode = m; } catch (e) {}

  /* ---------- helpers ---------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v, d) => { const n = parseFloat(v); return isFinite(n) ? n : (d || 0); };
  const isSet = v => v !== '' && v != null && isFinite(parseFloat(v));
  const norm = s => String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const nid = p => (p || 'l') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const daysSince = iso => iso ? Math.floor((new Date(today() + 'T12:00:00') - new Date(String(iso).slice(0, 10) + 'T12:00:00')) / 864e5) : Infinity;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = iso => { if (!iso) return ''; const p = String(iso).split('-'); if (p.length < 2) return iso; return (p[2] ? Number(p[2].slice(0, 2)) + ' ' : '') + MON[Number(p[1]) - 1] + ' ' + p[0]; };
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const money2 = n => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const moneyK = n => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'k' : money(n);
  const when = iso => { if (!iso) return ''; const d = new Date(iso), s = (Date.now() - d) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toTimeString().slice(0, 5); };
  const sel = (f, opts, v, blank, label) => '<select class="in" data-f="' + f + '"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' + (blank != null ? '<option value="">' + esc(blank) + '</option>' : '') + opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(val) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(lab) + '</option>'; }).join('') + '</select>';
  const pill = st => st ? '<span class="ls-pill s' + Math.max(0, STAGES.indexOf(st)) + '">' + esc(st) + '</span>' : '';
  const ppill = p => p ? '<span class="ls-pill p' + p.toLowerCase() + '">' + esc(p) + '</span>' : '';
  const link = u => u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(host(u)) + '</a>' : '';
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
  function toast(t) { let el = $('.ls-toast'); if (!el) { el = document.createElement('div'); el.className = 'ls-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = t; clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 3200); }

  function blank() {
    return { version: 2, savedAt: '', savedBy: '', settings: { overviewVideoLink: '', demoClipLink: '', bookingLink: '', prob: Object.assign({}, PROB) }, templates: JSON.parse(JSON.stringify(TEMPLATES)), templatesVersion: TPL_VERSION, pricing: null, leads: [], activity: [], feedback: [] };
  }
  function fix(d) {
    const b = blank(); d = Object.assign(b, d || {});
    d.settings = Object.assign(blank().settings, d.settings || {});
    if (d.settings.videoLink && !d.settings.overviewVideoLink) d.settings.overviewVideoLink = d.settings.videoLink;
    delete d.settings.videoLink;
    d.settings.prob = Object.assign({}, PROB, d.settings.prob || {});
    Object.keys(d.settings.prob).forEach(k => { if (!(k in PROB)) delete d.settings.prob[k]; });
    if (d.templatesVersion !== TPL_VERSION) { d.templates = {}; d.templatesVersion = TPL_VERSION; }
    d.templates = d.templates || {}; Object.keys(TEMPLATES).forEach(k => { d.templates[k] = Object.assign({}, TEMPLATES[k], d.templates[k] || {}); });
    Object.keys(d.templates).forEach(k => { if (!TEMPLATES[k]) delete d.templates[k]; });
    d.leads = (d.leads || []).map(l => {
      l = Object.assign({ contacts: [], dates: {} }, l); l.dates = l.dates || {};
      if (OLD_STAGE[l.stage]) l.stage = OLD_STAGE[l.stage];
      if (l.stage && !STAGES.includes(l.stage)) l.stage = 'Researched';
      const D = l.dates, mv = (from, to) => { if (D[from] && !D[to]) D[to] = D[from]; delete D[from]; };
      mv('videoSent', 'firstTouch'); mv('introSent', 'firstTouch'); mv('meeting', 'hq'); mv('onboarding', 'hq'); mv('demo', 'demoPresented'); delete D.watched;
      l.checks = l.checks || {}; l.req = l.req || {};
      return l;
    });
    d.activity = d.activity || [];
    d.feedback = d.feedback || [];
    return d;
  }

  /* ---------- pricing: read from Finance (same model as Finance's airlineEcon, first contract year) ---------- */
  function priceFromFinance(st) {
    const S = st.settings || {}, adj = {};
    (st.regions || []).forEach(r => (r.countries || []).forEach(c => { if (num(c.priceAdj)) adj[c.name] = num(c.priceAdj); }));
    return {
      at: new Date().toISOString(),
      products: (st.products || []).map(p => ({ id: p.id, name: p.name || p.short || 'Product', bands: (Array.isArray(p.bands) && p.bands.length ? p.bands : st.bands || []).map(b => ({ label: b.label, maxPilots: b.maxPilots })), rates: (p.rates || []).map(x => num(x)), impl: (p.impl || []).map(x => num(x)), seats: Object.assign({ cabin: false, admin: false, instructor: false }, p.seats || {}), currency: p.currency || 'USD' })),
      seatPrices: { cabinRate: num((st.seatPrices || {}).cabinRate), adminRate: num((st.seatPrices || {}).adminRate), instructorRate: num((st.seatPrices || {}).instructorRate), currency: (st.seatPrices || {}).currency || 'USD' },
      ratios: { pilotsPerAircraft: num((st.ratios || {}).pilotsPerAircraft, 10), cabinPerAircraft: num((st.ratios || {}).cabinPerAircraft), instructorsPerAircraft: num((st.ratios || {}).instructorsPerAircraft), adminsPerAirline: num((st.ratios || {}).adminsPerAirline) },
      quarterly: num(S.quarterlyPremium), monthly: num(S.monthlyPremium),
      fx: { eurUsd: num(S.eurUsd, 1), currencies: S.currencies || [], main: S.mainCurrency || 'USD' }, adj
    };
  }
  const samePrice = (a, b) => { const k = x => JSON.stringify(Object.assign({}, x, { at: '' })); return !!a && !!b && k(a) === k(b); };
  function fxOf(cur) {
    if (!cur || cur === 'USD') return 1; if (cur === 'MAIN') cur = price.fx.main || 'USD'; if (cur === 'USD') return 1;
    const c = (price.fx.currencies || []).find(x => x.code === cur); if (c) return num(c.usd, 1);
    return cur === 'EUR' ? num(price.fx.eurUsd, 1) : 1;
  }
  const productFor = l => { const ps = price.products || []; return ps.find(p => p.id === (l.product || 'bundle')) || ps.find(p => p.id === 'bundle') || ps[0]; };
  function bandIdx(P, p) { const b = P.bands || []; for (let i = 0; i < b.length; i++) { const m = b[i].maxPilots; if (i === b.length - 1 || m === '' || m == null || p <= num(m)) return i; } return 0; }
  /* one airline's price, year one: pilots × tier price + instructor, admin and cabin seats, × billing premium, country adjustment and discount */
  function econ(l) {
    const P = productFor(l); if (!P) return null;
    const r = price.ratios, sp = price.seatPrices, fleet = num(l.fleet);
    const pilots = num(l.pilotsConfirmed) > 0 ? Math.round(num(l.pilotsConfirmed)) : Math.round(fleet * num(r.pilotsPerAircraft));
    if (!pilots) return null;
    const S = P.seats || {};
    const instr = isSet(l.instructors) ? num(l.instructors) : fleet * num(r.instructorsPerAircraft);
    const admins = isSet(l.admins) ? num(l.admins) : num(r.adminsPerAirline);
    const cabinOn = !!S.cabin && l.cabinOn !== false;
    const cabin = cabinOn ? (isSet(l.cabin) ? Math.round(num(l.cabin)) : Math.round(fleet * num(r.cabinPerAircraft))) : 0;
    const t = bandIdx(P, pilots), pf = fxOf(P.currency), sf = fxOf(sp.currency);
    const adj = 1 + num(price.adj[l.country]) / 100, disc = 1 - num(l.discount) / 100;
    const bill = l.billing === 'quarterly' ? 1 + num(price.quarterly) / 100 : l.billing === 'monthly' ? 1 + num(price.monthly) / 100 : 1;
    const k = adj * disc * bill;
    const each = { pilots: num(P.rates[t]) * pf * k, instructors: S.instructor ? num(sp.instructorRate) * sf * k : 0, admin: S.admin ? num(sp.adminRate) * sf * k : 0, cabin: cabinOn ? num(sp.cabinRate) * sf * k : 0 };
    const m = { pilots: pilots * each.pilots, instructors: S.instructor ? instr * each.instructors : 0, admin: S.admin ? admins * each.admin : 0, cabin: cabin * each.cabin };
    const month = m.pilots + m.instructors + m.admin + m.cabin;
    const impl = isSet(l.implOverride) ? num(l.implOverride) : num(P.impl[t]) * pf * adj;
    return { P, t, tier: (P.bands[t] || {}).label || 'Tier ' + (t + 1), pilots, instr, admins, cabin, cabinOn, S, each, m, month, year: month * 12, impl, est: !(num(l.pilotsConfirmed) > 0), adj: num(price.adj[l.country]), bill };
  }
  const arrOf = l => { const e = econ(l); return e ? e.year : 0; };
  const probOf = l => (isCustomer(l) ? 100 : isActive(l) ? num(data.settings.prob[l.stage || 'Researched']) : 0);
  const isActive = l => ACTIVE.includes(l.stage || 'Researched');
  const isCustomer = l => CUSTOMER.includes(l.stage);
  const isOpen = l => { const i = STAGES.indexOf(l.stage || 'Researched'); return i >= 0 && i < I_ONB; };
  const dueClass = d => !d ? '' : d < today() ? 'over' : d <= addDays(today(), 7) ? 'soon' : '';
  function lastTouch(l) {
    let t = ''; Object.values(l.dates || {}).forEach(d => { if (d && d > t) t = d; });
    data.activity.forEach(a => { if (a.leadId === l.id && a.date && a.date > t) t = a.date; });
    return t;
  }
  const isCold = l => { const i = STAGES.indexOf(l.stage || 'Researched'); return i >= 2 && i <= 7 && daysSince(lastTouch(l)) >= COLD_DAYS; };
  const coldChip = l => isCold(l) ? '<span class="ls-cold" title="No contact logged for ' + COLD_DAYS + '+ days">Going cold</span>' : '';
  const nextStage = st => { const i = STAGES.indexOf(st || 'Researched'); return i >= 0 && i < I_ONB ? STAGES[i + 1] : null; };
  function setStage(l, st, viaButton) {
    if (!st || (l.stage || 'Researched') === st) return;
    l.stage = st; l.dates = l.dates || {}; const dk = STAGE_DATE[st]; if (dk && !l.dates[dk]) l.dates[dk] = today();
    if (viaButton) {
      data.activity.push({ id: nid('a'), leadId: l.id, date: today(), channel: STAGE_CH[st] || 'Other', text: 'Stage: ' + st, next: '', by: auth ? auth.name : '' });
      const s = STEP[st];
      if (s) { l.nextAction = s.do; l.nextActionDate = s.days ? addDays(today(), s.days) : ''; }
      else l.nextActionDate = '';
      if (st === 'Onboarded' && l.dates && !l.dates.goLive) l.dates.goLive = today();
    }
  }

  /* ---------- Finance link: the airline in Finance, its invoices, the payment gate, and the updates Finance will be offered ---------- */
  function finAir(l) {
    if (!finState || !Array.isArray(finState.airlines)) return null;
    let a = l.finId ? finState.airlines.find(x => x.id === l.finId) : null;
    if (!a && !l.finId) { a = finState.airlines.find(x => norm(x.name) === norm(l.name) && (x.country || '') === (l.country || '')) || null; if (a) l.finId = a.id; }
    return a || null;
  }
  const finInvoices = l => { const a = finAir(l); return a ? (finState.invoices || []).filter(v => v.airline === a.id) : []; };
  const invSt = v => v.paidDate ? 'Paid' : v.issue && v.issue > today() ? 'Scheduled' : v.due && v.due < today() ? 'Overdue' : 'Open';
  function feeState(l) {
    if (!finState) return { s: 'unknown' };
    const a = finAir(l); if (!a) return { s: 'unlinked' };
    const imp = finInvoices(l).filter(v => v.kind === 'Implementation');
    if (imp.length) return imp.every(v => v.paidDate) ? { s: 'paid', date: imp.map(v => v.paidDate).sort().pop(), inv: imp } : { s: 'unpaid', inv: imp };
    if (isSet(a.implOverride) && num(a.implOverride) === 0) return { s: 'none' };
    return { s: 'noinv' };
  }
  const feeOK = l => ['paid', 'none'].includes(feeState(l).s);
  const FEE_TXT = { unknown: 'Finance could not be read, so the payment cannot be checked yet.', unlinked: 'Link this airline to its airline in Finance first (Finance and billing panel), so the payment can be checked.', noinv: 'There is no implementation fee invoice in Finance yet. Apply the signing in Finance (Overview → Updates from Sales) to create it.', unpaid: 'The implementation fee is not paid yet in Finance.' };
  function gateBlock(l, st) {
    const to = STAGES.indexOf(st), from = STAGES.indexOf(l.stage || 'Researched');
    if (to < I_PAID || to > I_ONB || (from >= I_PAID && from <= I_ONB) || feeOK(l)) return '';
    return 'Onboarding starts after payment. ' + FEE_TXT[feeState(l).s];
  }
  function autoPaid() {
    if (!data || !finState) return;
    const moved = [];
    data.leads.forEach(l => { if (l.stage !== 'Signed') return; const f = feeState(l); if (f.s !== 'paid') return; setStage(l, 'Paid', true); if (f.date) l.dates.paid = f.date; moved.push(l.name); });
    if (moved.length) { touch(); toast(moved.join(', ') + ': implementation fee paid in Finance, moved to Paid. Save to keep this.'); }
  }
  /* the same rules as Finance module 50 (Updates from Sales) */
  const FIN_RANK = { Pipeline: 0, Contacted: 1, Demo: 2, Negotiating: 3, Signed: 4, Live: 5 };
  const FIN_ST = { 'Researched': 'Pipeline', 'Contact found': 'Pipeline', 'First touch': 'Contacted', 'HQ discovery': 'Demo', 'Building demo': 'Demo', 'Demo presented': 'Demo', 'C-level meeting': 'Negotiating', 'Proposal sent': 'Negotiating', 'Signed': 'Signed', 'Paid': 'Signed', 'Implementation': 'Signed', 'Onboarded': 'Live', 'Lost': 'Lost' };
  function syncChanges(l, a) {
    const out = [], str = v => (v == null ? '' : String(v));
    const want = FIN_ST[l.stage || 'Researched'], cur = a.status || 'Pipeline';
    if (want && (want === 'Lost' ? cur !== 'Lost' : cur !== 'Lost' && FIN_RANK[want] > (FIN_RANK[cur] == null ? -1 : FIN_RANK[cur]))) out.push({ k: 'status', lab: 'Status', from: cur, to: want });
    const D = l.dates || {}, ym = v => String(v).slice(0, 7);
    if (D.signed && str(a.signMonth) !== ym(D.signed)) out.push({ k: 'signMonth', lab: 'Sign month', from: a.signMonth || '', to: ym(D.signed) });
    const gl = D.goLive || D.onboarded;
    if (gl && str(a.goLiveMonth) !== ym(gl)) out.push({ k: 'goLiveMonth', lab: 'Go-live month', from: a.goLiveMonth || '', to: ym(gl) });
    if (CUSTOMER.includes(l.stage)) {
      [['product', 'Product'], ['billing', 'Billing']].forEach(([k, lab]) => { if (l[k] && str(a[k]) !== str(l[k])) out.push({ k, lab, from: a[k] || '', to: l[k] }); });
      [['pilotsConfirmed', 'pilots', 'Pilots'], ['instructors', 'instructors', 'Instructors'], ['admins', 'admins', 'Admins'], ['cabin', 'cabin', 'Cabin crew'], ['discount', 'discount', 'Discount %'], ['implOverride', 'implOverride', 'Implementation fee']].forEach(([lk, fk, lab]) => {
        let v = l[lk]; if (lk === 'cabin' && l.cabinOn === false) v = 0;
        if (isSet(v) && (!isSet(a[fk]) || num(a[fk]) !== num(v))) out.push({ k: fk, lab, from: a[fk] == null ? '' : a[fk], to: num(v) });
      });
    }
    return out;
  }
  function reqDone(l, list) {
    const R = l.req || {}, need = list.filter(x => !x[3].startsWith('Optional'));
    return { done: need.filter(x => R[x[0]]).length, all: need.length, any: list.filter(x => R[x[0]]).length };
  }
  const bar = (d, n) => '<span class="ls-bar" title="' + d + ' of ' + n + '"><span style="width:' + (n ? Math.round(d / n * 100) : 0) + '%"></span></span><span class="ls-bar-t">' + d + '/' + n + '</span>';
  function feeChip(l) {
    const f = feeState(l), t = { paid: ['Paid', 'paid'], none: ['No fee', 'paid'], unpaid: [(f.inv || []).some(v => invSt(v) === 'Overdue') ? 'Overdue' : 'Invoiced', (f.inv || []).some(v => invSt(v) === 'Overdue') ? 'over' : 'open'], noinv: ['No invoice', 'open'], unlinked: ['Not linked', 'open'], unknown: ['…', 'open'] }[f.s];
    return '<span class="ls-fee ' + t[1] + '">' + t[0] + '</span>';
  }

  /* ---------- emails ---------- */
  function fill(txt, l) {
    const c = (l.contacts || []).find(x => x.email) || (l.contacts || [])[0] || {};
    const parts = String(c.name || '').trim().split(/\s+/).filter(Boolean);
