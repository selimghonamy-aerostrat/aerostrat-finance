      '<label>Stage' + sel(F('stage'), STAGES, l.stage || 'Researched') + '</label>' + (l.stage === 'Lost' ? '<label>Lost reason' + sel(F('lostReason'), LOST, l.lostReason, '—') + '</label>' : '') + '<label>Route' + sel(F('route'), ROUTES, l.route, '—') + '</label><label>Wave' + sel(F('wave'), WAVES, l.wave, '—') + '</label><label>Priority' + sel(F('priority'), PRI, l.priority, '—') + '</label><label>Owner' + sel(F('owner'), OWNERS, l.owner, '—') + '</label>' +
      '<label class="wide">Next action' + inp('nextAction', 'e.g. Send the intro email with the video') + '</label><label>Next action date' + inp('nextActionDate', '', 'date') + '</label></div></div>';
    h += '<div class="ls-panel"><h3>Price</h3><p class="sub">The same prices and rules as Finance. Leave a count empty to use the estimate.</p><div class="ls-fgrid">' +
      '<label>Product' + sel(F('product'), (price.products || []).map(p => [p.id, p.name]), (P && P.id) || '') + '</label><label>Billing' + sel(F('billing'), BILLING.map(([v, n]) => [v, n + (v === 'quarterly' ? ' (+' + price.quarterly + '%)' : v === 'monthly' ? ' (+' + price.monthly + '%)' : '')]), l.billing || 'annual') + '</label>' +
      '<label>Confirmed pilots' + inp('pilotsConfirmed', e && e.est ? 'est. ' + e.pilots : 'number', 'number') + '</label>' +
      (S.instructor ? '<label>Instructors / examiners' + inp('instructors', e ? 'est. ' + Math.round(e.instr) : '', 'number') + '</label>' : '') +
      (S.admin ? '<label>Admins' + inp('admins', 'est. ' + price.ratios.adminsPerAirline, 'number') + '</label>' : '') +
      (S.cabin ? '<label>Cabin crew' + inp('cabin', l.cabinOn === false ? 'not included' : 'est. ' + Math.round(num(l.fleet) * num(price.ratios.cabinPerAircraft)), 'number', l.cabinOn === false ? ' disabled' : '') + '<span class="ls-check"><input type="checkbox" data-f="' + F('cabinOn') + '"' + (l.cabinOn === false ? '' : ' checked') + '> Include cabin crew</span></label>' : '') +
      '<label>Discount %' + inp('discount', '0', 'number') + '</label><label>Implementation fee' + inp('implOverride', e ? 'tier price ' + money(num(e.P.impl[e.t])) : '', 'number') + '</label></div>' + priceTable(l) + '</div>';
    h += financePanel(l);
    h += '<div class="ls-panel"><h3>Airline</h3><p class="sub">' + (l.finId ? 'Imported from Finance ' + esc(fdate(l.importedAt)) + '. Edits here stay in Leads.' : 'Added by hand.') + '</p><div class="ls-fgrid">' +
      '<label>Airline name' + inp('name') + '</label><label>Country' + inp('country') + '</label><label>Region' + inp('region') + '</label><label>Fleet (aircraft)' + inp('fleet', '', 'number') + '</label>' +
      '<label>Fleet as of' + inp('fleetAsOf', 'YYYY-MM') + '</label><label class="wide">Fleet source (link)' + inp('fleetSource', 'https://…', 'url') + '</label>' +
      '<label class="wide">Shared drive link (“' + esc(l.name) + ' x AeroStrat”)' + inp('driveLink', 'https://drive.google.com/…', 'url') + '</label><label>Current training solution' + inp('solution', 'e.g. Excel, FLYCO LMS, EFOS') + '</label><label>EBT status' + inp('ebt', 'Conventional / Mixed EBT / EBT') + '</label>' +
      '<label class="wide">Notes<textarea class="in" data-f="' + F('notes') + '">' + esc(l.notes || '') + '</textarea></label></div>' +
      (l.fleetSource ? '<p class="ls-note ls-src">Fleet source: ' + link(l.fleetSource) + (l.fleetAsOf ? ' · as of ' + esc(fdate(l.fleetAsOf)) : '') + '</p>' : '') + '</div>';
    const fbs = data.feedback.filter(x => x.leadId === l.id).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    h += '<div class="ls-panel"><h3>Feedback</h3><p class="sub">What ' + esc(l.name) + ' liked, worried about, asked for or objected to, and what we answered</p>' + fbForm(l.id) + fbList(fbs, false) + '</div>';
    h += msPanel(l) + reqPanels(l) + checklists(l);
    h += '<div class="ls-panel"><h3>Contacts</h3><p class="sub">Training Director, Training Manager, Chief Pilot and anyone else on the deal. Emails go to the first contact with an email address.</p><div class="ls-wrap"><table class="ls-table ls-row-in ls-cards c2"><thead><tr><th>Name</th><th>Title</th><th>Email</th><th>LinkedIn</th><th>Phone</th><th></th></tr></thead><tbody>' +
      (l.contacts.length ? l.contacts.map((c, i) => '<tr>' + [['name', 'Name', 'text'], ['title', 'Title', 'text'], ['email', 'Email', 'email'], ['linkedin', 'LinkedIn', 'url'], ['phone', 'Phone', 'tel']].map(([k, lab, ty]) => '<td data-l="' + lab + '"><input class="in" type="' + ty + '" aria-label="' + lab + '" data-f="contact:' + l.id + ':' + i + ':' + k + '" value="' + esc(c[k] || '') + '"></td>').join('') + '<td class="ls-rm"><button class="ls-del" data-act="del-contact" data-id="' + esc(l.id) + '" data-i="' + i + '" aria-label="Remove contact">Remove</button></td></tr>').join('') : '<tr><td colspan="6" class="ls-empty full">No contacts yet.</td></tr>') +
      '</tbody></table></div><div style="margin-top:10px"><button class="btn small" data-act="add-contact" data-id="' + esc(l.id) + '">Add contact</button></div></div>';
    h += '<div class="ls-panel"><h3>Outreach dates</h3><p class="sub">Filled in when you move the stage; you can change them</p><div class="ls-fgrid">' + DATES.map(([k, lab]) => '<label>' + esc(lab) + '<input class="in" type="date" data-f="date:' + l.id + ':' + k + '" value="' + esc((l.dates || {})[k] || '') + '"></label>').join('') + '</div></div>';
    const acts = data.activity.filter(a => a.leadId === l.id).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    h += '<div class="ls-panel"><h3>Activity</h3><p class="sub">Every email, call and meeting with ' + esc(l.name) + '</p>' + addActForm(l.id) + actList(acts, false) + '</div>';
    h += '<div class="ls-danger"><button class="ls-del" data-act="del-lead" data-id="' + esc(l.id) + '">Remove ' + esc(l.name) + ' from Leads</button></div>';
    return h;
  }
  function addActForm(leadId) {
    return '<div class="ls-addact">' + (leadId ? '' : sel('new:lead', data.leads.slice().sort((a, b) => a.name < b.name ? -1 : 1).map(l => [l.id, l.name]), view.actF.newLead || '', 'Airline…', 'Airline')) + '<input class="in" type="date" aria-label="Date" data-f="new:date" value="' + esc(view.actF.date || today()) + '">' + sel('new:channel', CHANNELS, view.actF.newChannel || 'Email', null, 'Channel') + '<input class="in ls-wide" aria-label="What happened" data-f="new:text" placeholder="What happened" value="' + esc(view.actF.text || '') + '"><input class="in ls-wide" aria-label="Next step" data-f="new:next" placeholder="Next step (optional)" value="' + esc(view.actF.next || '') + '"><button class="btn small cta" data-act="add-act" data-id="' + esc(leadId || '') + '">Log</button></div>';
  }
  function actList(acts, showLead) {
    if (!acts.length) return '<div class="ls-empty">Nothing logged yet.</div>';
    return '<div class="ls-act">' + acts.map(a => { const l = data.leads.find(x => x.id === a.leadId); return '<div class="it"><span class="d">' + esc(fdate(a.date)) + '</span><span><span class="ls-pill">' + esc(a.channel || '') + '</span></span><div>' + (showLead && l ? '<a class="linkish" data-open-l="' + esc(l.id) + '"><b>' + esc(l.name) + '</b></a> · ' : '') + esc(a.text || '') + (a.next ? '<div class="nx">Next: ' + esc(a.next) + '</div>' : '') + '<div class="nx">' + esc(a.by || '') + '</div></div><button class="ls-del" data-act="del-act" data-id="' + esc(a.id) + '">Remove</button></div>'; }).join('') + '</div>';
  }

  /* ---------- follow-ups ---------- */
  function followView() {
    const act = data.leads.filter(isOpen), t = today(), wk = addDays(t, 7);
    const groups = [['Overdue', act.filter(l => l.nextActionDate && l.nextActionDate < t), 'over'], ['Today and the next 7 days', act.filter(l => l.nextActionDate && l.nextActionDate >= t && l.nextActionDate <= wk), ''], ['Later', act.filter(l => l.nextActionDate && l.nextActionDate > wk), ''], ['No date set', act.filter(l => !l.nextActionDate), '']];
    let h = head('Follow-ups', 'Every airline in the pipeline or in implementation, with its next action. Change a date here, or open the airline to log what happened.');
    const cold = data.leads.filter(isCold);
    if (cold.length) h += '<div class="ls-banner warn"><span class="grow"><b>' + cold.length + ' going cold:</b> ' + cold.map(l => '<a class="linkish" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a>').join(', ') + ' — no contact logged for ' + COLD_DAYS + '+ days.</span></div>';
    groups.forEach(([g, list, cls]) => {
      if (!list.length) return;
      list.sort((a, b) => (a.nextActionDate || '') < (b.nextActionDate || '') ? -1 : 1);
      h += '<div class="ls-group ' + cls + '">' + esc(g) + ' · ' + list.length + '</div><div class="ls-wrap"><table class="ls-table ls-cards c2"><tbody>' + list.map(l => '<tr><td class="full" style="width:28%"><a class="nm ls-name" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a><div class="sm">' + esc(l.country || '') + ' · ' + pill(l.stage || 'Researched') + ' ' + coldChip(l) + '</div></td><td class="full" data-l="Next action">' + esc(l.nextAction || '—') + '</td><td style="width:90px" data-l="Owner">' + esc(l.owner || '—') + '</td><td style="width:170px" data-l="Date"><input class="in" type="date" aria-label="Next action date for ' + esc(l.name) + '" data-f="lead:' + l.id + ':nextActionDate" value="' + esc(l.nextActionDate || '') + '"></td></tr>').join('') + '</tbody></table></div>';
    });
    if (!act.length) h += '<div class="ls-panel ls-empty">No active leads yet.</div>';
    return h;
  }

  /* ---------- activity ---------- */
  function activityView() {
    const f = view.actF, acts = data.activity.filter(a => (!f.lead || a.leadId === f.lead) && (!f.channel || a.channel === f.channel)).sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    let h = head('Activity', data.activity.length + ' entries across all airlines');
    h += '<div class="ls-panel"><h3>Log something</h3><p class="sub">An email sent, a call, a meeting, a demo</p>' + (data.leads.length ? addActForm('') : '<div class="ls-empty">Import or add an airline first.</div>') + '</div>';
    h += '<div class="ls-toolbar">' + sel('af:lead', data.leads.slice().sort((a, b) => a.name < b.name ? -1 : 1).map(l => [l.id, l.name]), f.lead, 'All airlines', 'Airline') + sel('af:channel', CHANNELS, f.channel, 'All channels', 'Channel') + '</div>';
    return h + '<div class="ls-panel">' + actList(acts, true) + '</div>';
  }

  /* ---------- import ---------- */
  function regionName(c) { const r = ((finState && finState.regions) || []).find(r => (r.countries || []).some(x => x.name === c)); return r ? r.name : ''; }
  function parseSrc(notes) { const s = String(notes || ''); const u = (s.match(/https?:\/\/[^\s|·]+/) || [])[0] || ''; const a = (s.match(/as of (\d{4}-\d{2})/) || [])[1] || ''; return { url: u.replace(/[).,;]+$/, ''), asOf: a }; }
  function inLeads(a) { return data.leads.find(l => (l.finId && l.finId === a.id) || (norm(l.name) === norm(a.name) && (l.country || '') === (a.country || ''))); }
  function fromFin(a) {
    const s = parseSrc(a.notes);
    const l = { id: nid(), finId: a.id || '', name: a.name || 'Airline', country: a.country || '', region: regionName(a.country), fleet: num(a.fleet) || '', fleetAsOf: s.asOf, fleetSource: s.url, pilotsConfirmed: num(a.pilots) > 0 ? num(a.pilots) : '', instructors: isSet(a.instructors) ? num(a.instructors) : '', admins: isSet(a.admins) ? num(a.admins) : '', cabin: isSet(a.cabin) ? num(a.cabin) : '', product: a.product || 'bundle', billing: a.billing || 'annual', wave: '', priority: '', stage: 'Researched', owner: '', nextAction: STEP.Researched.do, nextActionDate: '', solution: '', ebt: '', contacts: a.contact ? [{ name: String(a.contact), title: '', email: '', linkedin: '', phone: '' }] : [], dates: {}, notes: '', importedAt: today(), createdAt: new Date().toISOString() };
    const r = researchFor(a.name);
    if (r) Object.keys(r).forEach(k => { if (k === 'contacts') l.contacts = r.contacts.map(c => Object.assign({}, c)).concat(l.contacts); else l[k] = r[k]; });
    return l;
  }
  function importView() {
    let h = head('Import from Finance', 'Copies airlines and their info (name, country, region, fleet, fleet source, seat counts, product, billing) into Leads. Nothing is written back to Finance, and later edits on either side stay where they are made.');
    if (finLoading || (!finState && !finError)) { if (!finLoading) setTimeout(() => loadFin(true), 0); return h + '<div class="ls-panel"><span class="spin" aria-hidden="true"></span> Reading the airlines in Finance…</div>'; }
    if (finError) return h + '<div class="ls-banner warn"><span class="grow">Could not read Finance: ' + esc(finError) + '</span><button class="btn small" data-act="fin-reload">Try again</button></div>';
    const regs = finState.regions || [], countries = [];
    regs.forEach(r => (r.countries || []).forEach(c => countries.push([c.name, c.name + ' · ' + r.name])));
    (finState.airlines || []).forEach(a => { if (a.country && !countries.some(c => c[0] === a.country)) countries.push([a.country, a.country]); });
    const c = view.imp.country, list = (finState.airlines || []).filter(a => a.country === c).sort((a, b) => num(b.fleet) - num(a.fleet));
    const fresh = list.filter(a => !inLeads(a)), picked = fresh.filter(a => view.imp.picked[a.id || a.name]);
    h += '<div class="ls-toolbar"><label class="muted small">Country&nbsp;' + sel('imp:country', countries, c) + '</label><span class="grow"></span>' + (fresh.length ? '<button class="btn small" data-act="imp-all">Select all new (' + fresh.length + ')</button>' : '') + '<button class="btn cta" data-act="imp-go" ' + (picked.length ? '' : 'disabled') + '>Import ' + (picked.length || '') + ' selected</button></div>';
    if (!list.length) return h + '<div class="ls-panel ls-empty">Finance has no airlines in ' + esc(c) + '.</div>';
    h += '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Airline</th><th class="n">Fleet</th><th>As of</th><th>Fleet source</th><th>In Finance</th><th>In Leads</th></tr></thead><tbody>' + list.map(a => { const k = a.id || a.name, s = parseSrc(a.notes), have = inLeads(a); return '<tr><td class="full">' + (have ? '<span class="nm">' + esc(a.name) + '</span>' : '<label class="ls-pick"><input type="checkbox" data-f="imp:pick:' + esc(k) + '"' + (view.imp.picked[k] ? ' checked' : '') + '><span class="nm">' + esc(a.name) + '</span></label>') + (researchFor(a.name) && !have ? '<div class="sm">Research from the playbook will be added</div>' : '') + '</td><td class="n" data-l="Fleet">' + esc(a.fleet || '') + '</td><td data-l="As of">' + esc(fdate(s.asOf)) + '</td><td class="ls-src" data-l="Source">' + link(s.url) + '</td><td class="sm" data-l="In Finance">' + esc(a.status || '') + '</td><td data-l="In Leads">' + (have ? '<a class="linkish" href="#lead/' + esc(have.id) + '">Open</a>' : '<span class="sm">Not yet</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
    const had = list.filter(inLeads);
    if (had.length) h += '<p class="ls-note">' + had.length + ' already in Leads. <a class="linkish" data-act="imp-refresh">Update their fleet and fleet source from Finance</a> (stage, contacts and notes are kept).</p>';
    return h;
  }

  /* ---------- settings ---------- */
  function settingsView() {
    const s = data.settings, P = price;
    let h = head('Settings', 'Prices come from Finance; links, email texts and chances of signing are set here.');
    h += priceNote();
    h += '<div class="ls-panel"><div class="ls-ph"><div><h3>Pricing</h3><p class="sub">' + (priceSrc === 'finance' ? 'Read from Finance → Pricing ' + esc(when(P.at)) + '. To change a price, edit it there.' : priceSrc === 'saved' ? 'Last read from Finance ' + esc(fdate(P.at)) + '.' : 'Not read from Finance yet.') + '</p></div><button class="btn small" data-act="fin-reload">Refresh from Finance</button></div>';
    (P.products || []).forEach(p => {
      const inc = [p.seats.instructor ? 'instructors' : '', p.seats.admin ? 'admins' : '', p.seats.cabin ? 'cabin crew' : ''].filter(Boolean);
      h += '<h4 class="ls-h4">' + esc(p.name) + (p.currency && p.currency !== 'USD' ? ' <span class="sm">(' + esc(p.currency) + ')</span>' : '') + '</h4><div class="ls-wrap"><table class="ls-table"><thead><tr><th>Tier</th><th>Pilots</th><th class="n">Per pilot / month</th><th class="n">Quarterly (+' + P.quarterly + '%)</th><th class="n">Monthly (+' + P.monthly + '%)</th><th class="n">Implementation</th></tr></thead><tbody>' + (p.bands || []).map((b, i) => { const lo = i ? num(p.bands[i - 1].maxPilots) + 1 : 1, hi = b.maxPilots == null || b.maxPilots === '' ? '+' : '–' + b.maxPilots; const r = num(p.rates[i]); return '<tr><td>' + esc(b.label) + '</td><td>' + lo + (hi === '+' ? '+' : hi) + '</td><td class="n">' + money2(r) + '</td><td class="n">' + money2(r * (1 + P.quarterly / 100)) + '</td><td class="n">' + money2(r * (1 + P.monthly / 100)) + '</td><td class="n">' + money(num(p.impl[i])) + '</td></tr>'; }).join('') + '</tbody></table></div><p class="ls-note">Seats included: ' + (inc.length ? esc(inc.join(', ')) : 'none (pilots only)') + '. The whole airline pays the rate of the tier its pilot count falls in.</p>';
    });
    const sp = P.seatPrices, r = P.ratios;
    h += '<div class="ls-seatgrid"><div><span class="k">Instructor / examiner</span><b>' + money2(sp.instructorRate) + '</b><span class="s">per person / month</span></div><div><span class="k">Admin</span><b>' + money2(sp.adminRate) + '</b><span class="s">per person / month</span></div><div><span class="k">Cabin crew</span><b>' + money2(sp.cabinRate) + '</b><span class="s">per person / month</span></div><div><span class="k">Estimates</span><b>' + r.pilotsPerAircraft + ' pilots</b><span class="s">' + r.instructorsPerAircraft + ' instructors and ' + r.cabinPerAircraft + ' cabin crew per aircraft · ' + r.adminsPerAirline + ' admins per airline</span></div></div></div>';
    h += '<div class="ls-panel"><h3>Links used in the emails</h3><p class="sub">Filled into {OverviewVideoLink}, {DemoClipLink} and {BookingLink}. Each airline’s shared drive is set on the airline page ({DriveLink}).</p><div class="ls-fgrid"><label>Overview video (1–2 min)<input class="in" type="url" data-f="set:overviewVideoLink" value="' + esc(s.overviewVideoLink) + '" placeholder="https://…"></label><label>Platform demo clip (3–5 min)<input class="in" type="url" data-f="set:demoClipLink" value="' + esc(s.demoClipLink) + '" placeholder="https://…"></label><label>Meeting booking link<input class="in" type="url" data-f="set:bookingLink" value="' + esc(s.bookingLink) + '" placeholder="https://…"></label></div></div>';
    const T = data.templates[view.tpl] || data.templates.intro;
    h += '<div class="ls-panel"><h3>Email texts</h3><p class="sub">Used by the “Next step” buttons on each airline. Placeholders: {Airline} {FirstName} {LastName} {Name} {Title} {Fleet} {OverviewVideoLink} {DemoClipLink} {BookingLink} {DriveLink} {DemoDate}. Others in braces stay for you to fill in.</p><div class="ls-seg" role="group" aria-label="Email">' + Object.keys(TEMPLATES).map(k => '<button type="button" data-act="tpl" data-v="' + k + '" aria-pressed="' + (view.tpl === k) + '">' + esc(data.templates[k].name) + '</button>').join('') + '</div><div class="ls-fgrid" style="margin-top:12px"><label class="wide">Subject<input class="in" data-f="tpl:' + view.tpl + ':subject" value="' + esc(T.subject) + '"></label><label class="wide">Text<textarea class="in ls-tpl" data-f="tpl:' + view.tpl + ':body">' + esc(T.body) + '</textarea></label></div><button class="btn small ghost" data-act="tpl-reset" data-v="' + view.tpl + '">Back to the SOP text</button></div>';
    h += '<div class="ls-panel"><h3>Chance of signing by stage</h3><p class="sub">Used for the weighted pipeline. Adjust as you learn your real win rates.</p><div class="ls-probgrid">' + ACTIVE.map(st => '<label>' + esc(st) + '<span class="ls-pct"><input class="in" type="number" inputmode="numeric" min="0" max="100" data-f="prob:' + esc(st) + '" value="' + esc(s.prob[st]) + '">%</span></label>').join('') + '</div></div>';
    h += '<div class="ls-panel"><h3>Data</h3><p class="sub">Leads keeps its own saved versions, separate from Finance.</p><p class="small">' + data.leads.length + ' airlines · ' + data.activity.length + ' activity entries · ' + data.feedback.length + ' feedback entries · last saved ' + esc(base ? when(base) + (data.savedBy ? ' by ' + data.savedBy : '') : 'never') + '</p><button class="btn small" data-act="csv">Export leads as CSV</button></div>';
    return h;
  }

  /* ---------- CSV ---------- */
  function csv() {
    const E = l => econ(l) || {};
    const cols = [['Airline', l => l.name], ['Country', l => l.country], ['Region', l => l.region], ['Wave', l => l.wave], ['Priority', l => l.priority], ['Stage', l => l.stage], ['Owner', l => l.owner], ['Route', l => l.route], ['Lost reason', l => l.lostReason], ['Next action', l => l.nextAction], ['Next action date', l => l.nextActionDate], ['Last contact', l => lastTouch(l)], ['Fleet', l => l.fleet], ['Fleet as of', l => l.fleetAsOf], ['Fleet source', l => l.fleetSource], ['Product', l => (productFor(l) || {}).name], ['Billing', l => l.billing || 'annual'], ['Pilots', l => E(l).pilots || ''], ['Pilots confirmed', l => l.pilotsConfirmed], ['Instructors', l => E(l).pilots ? Math.round(E(l).instr) : ''], ['Admins', l => E(l).pilots ? E(l).admins : ''], ['Cabin crew', l => E(l).pilots ? E(l).cabin : ''], ['Tier', l => E(l).tier || ''], ['Licence per month USD', l => E(l).month ? Math.round(E(l).month) : ''], ['Licence per year USD', l => E(l).year ? Math.round(E(l).year) : ''], ['Implementation USD', l => E(l).impl ? Math.round(E(l).impl) : ''], ['Chance of signing %', l => probOf(l)], ['Current solution', l => l.solution], ['EBT status', l => l.ebt], ['Shared drive', l => l.driveLink], ['Feedback entries', l => data.feedback.filter(x => x.leadId === l.id).length], ['Finance status', l => { const a = finAir(l); return a ? a.status || 'Pipeline' : ''; }], ['Implementation fee', l => ({ paid: 'Paid', none: 'No fee', unpaid: 'Invoiced, unpaid', noinv: 'No invoice', unlinked: 'Not linked', unknown: '' })[feeState(l).s]], ['Demo pack', l => { const r = reqDone(l, REQ_DEMO); return r.done + '/' + r.all; }], ['Implementation requirements', l => { const r = reqDone(l, REQ_FULL); return r.done + '/' + r.all; }], ['Contacts', l => (l.contacts || []).map(c => [c.name, c.title, c.email].filter(Boolean).join(' / ')).join('; ')]].concat(DATES.map(([k, lab]) => [lab, l => (l.dates || {})[k] || ''])).concat([['Notes', l => l.notes]]);
    const q = v => { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const txt = [cols.map(c => q(c[0])).join(',')].concat(data.leads.map(l => cols.map(c => q(c[1](l))).join(','))).join('\n');
    const u = URL.createObjectURL(new Blob([String.fromCharCode(65279) + txt], { type: 'text/csv' })), a = document.createElement('a'); a.href = u; a.download = 'aerostrat-leads-' + today() + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  }

