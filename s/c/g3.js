
  /* ---------- the edit drawer (one record at a time) ---------- */
  function gDrawer() {
    const O = view.g.open; if (!O) return '';
    let title = '', body = '';
    if (O.k === 'out') { const r = gFind('outreach', O.id); if (!r) return ''; title = r.airline; body = gOutForm(r); }
    else if (O.k === 'conf') { const c = gFind('conferences', O.id); if (!c) return ''; title = c.name || 'Conference'; body = gConfForm(c); }
    else if (O.k === 'chan') { const c = gFind('channels', O.id); if (!c) return ''; title = c.name || 'Channel'; body = gChanForm(c); }
    else if (O.k === 'strat') { const s = gFind('strategies', O.id); if (!s) return ''; title = s.source || 'Contact source'; body = gStratForm(s); }
    return '<div class="gr-scrim" data-act="g-close"></div><aside class="gr-drawer" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><header><h3>' + esc(title) + '</h3><button class="btn small ghost" data-act="g-close">Close</button></header><div class="gr-drawer-b">' + body + '</div></aside>';
  }
  const gIn = (f, v, type, ph, extra) => '<input class="in" data-f="' + f + '" type="' + (type || 'text') + '"' + (type === 'number' ? ' inputmode="decimal"' : '') + ' value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(ph || '') + '"' + (extra || '') + '>';
  function gOutForm(r) {
    const F = k => 'go:' + r.id + ':' + k, l = gLead(r), ro = l ? ' disabled' : '', a = gFin(r);
    const fins = finState && Array.isArray(finState.airlines) ? finState.airlines.slice().sort((x, y) => ((norm(x.country) === norm(r.country) ? 0 : 1) - (norm(y.country) === norm(r.country) ? 0 : 1)) || String(x.name).localeCompare(String(y.name))).map(x => [x.id, x.name + (x.country ? ' · ' + x.country : '') + (x.fleet ? ' · ' + x.fleet + ' aircraft' : '')]) : [];
    let h = '';
    if (l) h += '<div class="ls-banner"><span class="grow"><b>Promoted to Lead</b> — ' + esc(l.name) + ' is at “' + esc(l.stage || 'Researched') + '”. This outreach row is kept read-only.</span><a class="btn small cta" href="#lead/' + esc(l.id) + '">Open lead</a></div>';
    else if (r.lead_id) h += '<div class="ls-banner warn"><span class="grow">The lead this row was promoted to has been removed from Leads. You can promote it again.</span></div>';
    h += '<div class="ls-fgrid"><label class="wide">Airline in Finance' + (fins.length ? sel(F('linked_airline_id'), [['__none', 'Not in Finance']].concat(fins), a ? a.id : (r.fin_none || !r.linked_airline_id ? '__none' : r.linked_airline_id), null, 'Airline in Finance').replace('<select', '<select' + ro) : '<span class="sm">' + (finError ? 'Finance could not be read.' : 'Reading Finance…') + '</span>') + '</label>';
    if (a) h += '<div class="wide gr-ro"><div><span class="k">Airline</span><b>' + esc(a.name) + '</b></div><div><span class="k">Country</span><b>' + esc(a.country || '—') + '</b></div><div><span class="k">Fleet (from Finance)</span><b>' + esc(a.fleet || '—') + '</b>' + (num(r.aircraft) && num(r.aircraft) !== num(a.fleet) ? '<span class="sm">outreach list: ' + esc(r.aircraft) + '</span>' : '') + '</div></div>';
    else h += '<label>Airline' + gIn(F('airline'), r.airline, 'text', '', ro) + '</label><label>Country' + gIn(F('country'), r.country, 'text', '', ro) + '</label><label>Aircraft' + gIn(F('aircraft'), r.aircraft, 'number', '', ro) + '</label>' + (gNotInFin(r) ? '<p class="wide ls-note"><span class="gr-flag">Not in Finance</span> No Finance airline matches this name and country. Pick it above if it exists under another name.</p>' : '');
    h += '<label>Region' + gIn(F('region'), r.region, 'text', 'North Africa / East Africa', ro) + '</label><label>Planned week' + gIn(F('planned_week'), r.planned_week, 'date', '', ro) + '</label><label>Owner' + sel(F('owner'), gOwners(r.owner), r.owner, '—', 'Owner').replace('<select', '<select' + ro) + '</label>';
    h += '<label>Status' + sel(F('status'), l ? G_STATUS : G_STATUS.filter(s => s !== 'Promoted to Lead'), r.status, null, 'Status').replace('<select', '<select' + ro) + '</label><label>Ownership' + sel(F('ownership'), G_OWNERSHIP, r.ownership, null, 'Ownership').replace('<select', '<select' + ro) + '</label></div>';
    h += '<h4 class="ls-h4">Contact</h4><div class="ls-fgrid"><label>Name' + gIn(F('contact_name'), r.contact_name, 'text', '', ro) + '</label><label>Title' + gIn(F('contact_title'), r.contact_title, 'text', 'Training Director', ro) + '</label><label class="wide">Email' + gIn(F('contact_email'), r.contact_email, 'email', 'name@airline.com', ro) + (r.contact_email && !gEmailOk(r.contact_email) ? '<span class="gr-flag">This is not a valid email address.</span>' : '') + '</label><label>Source' + sel(F('contact_source'), G_SRC, r.contact_source, '—', 'Source').replace('<select', '<select' + ro) + '</label><label>Email verified' + sel(F('email_verified'), [['no', 'No'], ['yes', 'Yes']], r.email_verified, null, 'Email verified').replace('<select', '<select' + ro) + '</label></div>';
    h += '<h4 class="ls-h4">Touches</h4><div class="ls-fgrid"><label>Last touch' + gIn(F('last_touch_date'), r.last_touch_date, 'date', '', ro) + '</label><label>Next follow-up' + gIn(F('next_follow_up_date'), r.next_follow_up_date, 'date', '', ro) + '</label><label>Touch count' + gIn(F('touch_count'), r.touch_count, 'number', '0', ro) + '</label><label class="wide">Notes<textarea class="in" data-f="' + F('notes') + '"' + ro + '>' + esc(r.notes) + '</textarea></label></div>';
    if ((r.touches || []).length) h += '<ul class="gr-hist">' + r.touches.slice().reverse().map(t => '<li><span class="sm">' + esc(fdate(t.date)) + '</span> ' + esc(t.status) + (t.by ? ' <span class="sm">· ' + esc(t.by) + '</span>' : '') + '</li>').join('') + '</ul>';
    h += '<h4 class="ls-h4">Copy an email</h4><div class="gr-btns">' + data.growthTemplates.map(t => '<button class="btn small ghost" data-act="g-tpl-copy" data-v="' + esc(t.id) + '" data-id="' + esc(r.id) + '">' + esc(t.name) + '</button>').join('') + '</div>';
    h += '<div class="gr-foot">' + (l ? '<a class="btn cta" href="#lead/' + esc(l.id) + '">Open lead</a>' : '<button class="btn cta" data-act="g-promote" data-id="' + esc(r.id) + '">Promote to Lead</button>') + '<span class="grow"></span><button class="ls-del" data-act="g-del" data-k="out" data-id="' + esc(r.id) + '">Delete row</button></div>';
    return h;
  }

  /* ---------- conferences ---------- */
  const gRange = c => { if (!c.start_date) return ''; const s = fdate(c.start_date); if (!c.end_date || c.end_date === c.start_date) return s; const [y1, m1] = c.start_date.split('-'), [y2, m2, d2] = c.end_date.split('-'); return y1 === y2 && m1 === m2 ? Number(c.start_date.slice(8)) + '–' + Number(d2) + ' ' + MON[Number(m1) - 1] + ' ' + y1 : s + ' – ' + fdate(c.end_date); };
  function gConfMonth(c) {
    if (c.start_date) return c.start_date.slice(0, 7);
    const m = String(c.date_note || '').match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
    if (m) { const i = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m[1].toLowerCase()); return m[2] + '-' + String(i + 1).padStart(2, '0'); }
    return '9999';
  }
  function gConfView() {
    const f = view.g.c, q = norm(f.q), C = data.conferences;
    const list = C.filter(c => (!f.tier || String(c.tier) === f.tier) && (!f.decision || c.decision === f.decision) && (!q || norm(c.name + ' ' + c.place + ' ' + c.notes + ' ' + c.airlines_to_meet).includes(q)));
    const bud = C.filter(c => c.decision === 'Attend' || c.decision === 'Maybe').reduce((t, c) => t + num(c.budget), 0);
    let h = head('Conferences', 'Where to meet airlines in person. Dates are from the organiser pages; confirm before booking.', '<button class="btn cta" data-act="g-c-add">Add conference</button>');
    h += '<div class="ls-kpis">' + kpi('Budget: Attend + Maybe', money(bud), C.filter(c => c.decision === 'Attend').length + ' attend · ' + C.filter(c => c.decision === 'Maybe').length + ' maybe', 'lead') + kpi('Tier 1 events', C.filter(c => String(c.tier) === '1').length, 'highest priority') + kpi('Booked or registered', C.filter(c => c.status === 'Booked' || c.status === 'Registered').length, 'of ' + C.length) + kpi('People met', C.reduce((t, c) => t + (c.people || []).length, 0), 'logged across events') + '</div>';
    h += '<div class="ls-toolbar"><input class="in ls-search" type="search" data-f="gcf:q" aria-label="Search conferences" placeholder="Search name, place, notes" value="' + esc(f.q) + '">' + sel('gcf:tier', C_TIER.map(t => [t, 'Tier ' + t]), f.tier, 'All tiers', 'Tier') + sel('gcf:decision', C_DEC, f.decision, 'All decisions', 'Decision') + '</div>';
    if (!list.length) return h + '<div class="ls-panel ls-empty">No conference matches.</div>';
    const by = {}; list.forEach(c => (by[gConfMonth(c)] = by[gConfMonth(c)] || []).push(c));
    Object.keys(by).sort().forEach(m => {
      h += '<div class="ls-group">' + esc(m === '9999' ? 'Date not set' : MON[Number(m.slice(5)) - 1] + ' ' + m.slice(0, 4)) + ' · ' + by[m].length + '</div><div class="gr-cards">' + by[m].sort((a, b) => (a.start_date || 'z') < (b.start_date || 'z') ? -1 : 1).map(c => '<article class="gr-card" data-act="g-open" data-k="conf" data-id="' + esc(c.id) + '" tabindex="0"><div class="gr-card-h"><span class="ls-pill gr-t' + esc(c.tier) + '">Tier ' + esc(c.tier) + '</span><span class="ls-pill' + (c.decision === 'Attend' ? ' s9' : c.decision === 'Skip' ? ' s13' : ' s7') + '">' + esc(c.decision || '—') + '</span><span class="sm">' + esc(c.status) + '</span></div><div class="nm">' + esc(c.name) + '</div><div class="sm">' + esc([gRange(c) || (c.date_note || '').split('.')[0], c.place].filter(Boolean).join(' · ')) + '</div><div class="gr-card-f"><span>' + (num(c.budget) ? money(num(c.budget)) : '') + (c.route ? ' <span class="sm">' + esc(c.route) + '</span>' : '') + ((c.people || []).length ? ' <span class="sm">· ' + c.people.length + ' met</span>' : '') + '</span>' + (gHttp(c.link) ? gLink(c.link, 'Website ↗') : '') + '</div></article>').join('') + '</div>';
    });
    return h;
  }
  function gConfForm(c) {
    const F = k => 'gc:' + c.id + ':' + k;
    let h = '<div class="ls-fgrid"><label class="wide">Name' + gIn(F('name'), c.name) + '</label><label>Start' + gIn(F('start_date'), c.start_date, 'date') + '</label><label>End' + gIn(F('end_date'), c.end_date, 'date') + '</label><label class="wide">Date note' + gIn(F('date_note'), c.date_note, 'text', 'e.g. September 2027 TBC') + '</label><label>Place' + gIn(F('place'), c.place) + '</label><label>Tier' + sel(F('tier'), C_TIER, c.tier, null, 'Tier') + '</label><label>Decision' + sel(F('decision'), C_DEC, c.decision, '—', 'Decision') + '</label><label>Route' + sel(F('route'), C_ROUTE, c.route, '—', 'Route') + '</label><label>Status' + sel(F('status'), C_STATUS, c.status, null, 'Status') + '</label><label>Budget (USD)' + gIn(F('budget'), c.budget, 'number', '0') + '</label>';
    h += '<label class="wide">Link' + gIn(F('link'), c.link, 'url', 'https://…') + (c.link && !gHttp(c.link) ? '<span class="gr-flag">Only http:// or https:// links are allowed; this one will not be shown as a link.</span>' : gHttp(c.link) ? '<span class="sm">' + gLink(c.link, 'Open ' + host(c.link) + ' ↗') + '</span>' : '') + '</label><label class="wide">Airlines to meet' + gIn(F('airlines_to_meet'), c.airlines_to_meet, 'text', 'e.g. Auric Air, Proflight Zambia') + '</label><label class="wide">Notes<textarea class="in gr-notes" data-f="' + F('notes') + '" placeholder="Agenda, contacts, logistics, what we learned">' + esc(c.notes) + '</textarea></label></div>';
    h += '<h4 class="ls-h4">People met</h4>' + ((c.people || []).length ? '<div class="gr-people">' + c.people.map((p, i) => { const r = p.outreach_id && gFind('outreach', p.outreach_id); return '<div class="gr-person"><div class="ls-fgrid">' + [['name', 'Name', 'text'], ['airline', 'Airline', 'text'], ['role', 'Role', 'text'], ['email', 'Email', 'email']].map(([k, lab, ty]) => '<label>' + lab + gIn('gp:' + c.id + ':' + i + ':' + k, p[k], ty) + (k === 'email' && p.email && !gEmailOk(p.email) ? '<span class="gr-flag">invalid email</span>' : '') + '</label>').join('') + '</div><div class="gr-btns">' + (r ? '<button class="btn small ghost" data-act="g-open" data-k="out" data-id="' + esc(r.id) + '">In Outreach: ' + esc(r.airline) + '</button>' : '<button class="btn small" data-act="g-p-out" data-id="' + esc(c.id) + '" data-i="' + i + '">Add to Outreach</button>') + '<span class="grow"></span><button class="ls-del" data-act="g-p-del" data-id="' + esc(c.id) + '" data-i="' + i + '">Remove</button></div></div>'; }).join('') + '</div>' : '<p class="ls-note">Nobody logged yet.</p>');
    h += '<div class="gr-btns"><button class="btn small" data-act="g-p-add" data-id="' + esc(c.id) + '">Add person</button></div>';
    return h + '<div class="gr-foot"><span class="grow"></span><button class="ls-del" data-act="g-del" data-k="conf" data-id="' + esc(c.id) + '">Delete conference</button></div>';
  }
  function gPersonToOut(c, i) {
    const p = c.people[i]; if (!p) return;
    if (!String(p.airline || '').trim()) { toast('Type the person’s airline first.'); return; }
    const fin = finState && (finState.airlines || []).find(a => norm(a.name) === norm(p.airline));
    const same = data.outreach.filter(r => norm(r.airline) === norm(p.airline) || (fin && r.linked_airline_id === fin.id));
    const ex = same.find(r => fin && r.linked_airline_id === fin.id) || same.find(r => fin && norm(r.country) === norm(fin.country)) || same[0];
    if (ex) { p.outreach_id = ex.id; if (gNoContact(ex) && !gPromoted(ex)) { ex.contact_name = p.name || ''; ex.contact_title = p.role || ''; ex.contact_email = p.email || ''; ex.contact_source = 'Event'; ex.updated_at = gNow(); } touch(); toast('Linked to ' + ex.airline + ' in Outreach.'); render(); return; }
    const r = gRow({ airline: fin ? fin.name : p.airline.trim(), country: fin ? fin.country || '' : '', aircraft: fin ? num(fin.fleet) || '' : '', linked_airline_id: fin ? fin.id : '', fin_none: !fin, contact_name: p.name || '', contact_title: p.role || '', contact_email: p.email || '', contact_source: 'Event', owner: gMe(), status: 'Contact found', notes: 'Met at ' + c.name + (c.start_date ? ' (' + fdate(c.start_date) + ')' : '') + '.' });
    r.region = r.country ? gRegion(r.country) : '';
    data.outreach.push(r); p.outreach_id = r.id; touch(); toast(r.airline + ' added to Outreach (source Event). Save to keep it.'); render();
  }

  /* ---------- channels ---------- */
  function gChanView() {
    const C = data.channels, all = C.reduce((t, c) => t + c.steps.length, 0), done = C.reduce((t, c) => t + c.steps.filter(s => s.done).length, 0);
    let h = head('Channels', 'Every way we find airlines, with the steps to work each one.', '<button class="btn cta" data-act="g-h-add">Add channel</button>');
    h += '<div class="ls-kpis">' + kpi('Channels', C.length, C.filter(c => c.priority === 'Primary').length + ' primary', 'lead') + kpi('Steps done', done + ' / ' + all, all ? Math.round(done / all * 100) + '%' : '') + kpi('Steps overdue', C.reduce((t, c) => t + c.steps.filter(s => !s.done && s.due_date && s.due_date < today()).length, 0), 'past their due date') + kpi('Yearly target', C.reduce((t, c) => t + num(c.target), 0), 'airlines, all channels') + '</div>';
    CH_PRI.forEach(p => {
      const list = C.filter(c => (c.priority || 'Secondary') === p); if (!list.length) return;
      h += '<div class="ls-group">' + esc(p) + ' · ' + list.length + '</div><div class="gr-cards">' + list.map(c => { const d = c.steps.filter(s => s.done).length, nx = c.steps.filter(s => !s.done).slice(0, 2); return '<article class="gr-card" data-act="g-open" data-k="chan" data-id="' + esc(c.id) + '" tabindex="0"><div class="gr-card-h"><span class="sm">' + esc([c.owner, c.status].filter(Boolean).join(' · ')) + '</span><span class="grow"></span>' + bar(d, c.steps.length) + '</div><div class="nm">' + esc(c.name) + '</div>' + (nx.length ? '<ul class="gr-mini">' + nx.map(s => '<li>' + esc(s.text) + (s.due_date ? ' <span class="ls-due ' + dueClass(s.due_date) + '">' + esc(fdate(s.due_date)) + '</span>' : '') + '</li>').join('') + '</ul>' : '<div class="sm">All steps done.</div>') + (num(c.target) ? '<div class="gr-card-f"><span class="sm">Target ' + esc(c.target) + ' airlines a year</span></div>' : '') + '</article>'; }).join('') + '</div>';
    });
    return h;
  }
  function gStepsEditor(kind, id, steps, withMeta) {
    return '<ol class="gr-steps">' + steps.map((s, i) => { const txt = withMeta ? s.text : s; return '<li class="' + (withMeta && s.done ? 'done' : '') + '">' + (withMeta ? '<input type="checkbox" data-f="' + kind + ':' + id + ':' + i + ':done" aria-label="Done"' + (s.done ? ' checked' : '') + '>' : '<span class="gr-n">' + (i + 1) + '</span>') + '<div class="gr-step-b"><input class="in" data-f="' + kind + ':' + id + ':' + i + ':text" aria-label="Step ' + (i + 1) + '" value="' + esc(txt) + '">' + (withMeta ? '<div class="gr-step-m">' + sel(kind + ':' + id + ':' + i + ':owner', gOwners(s.owner), s.owner, 'Owner…', 'Owner') + '<input class="in" type="date" aria-label="Due date" data-f="' + kind + ':' + id + ':' + i + ':due_date" value="' + esc(s.due_date) + '">' + (s.done ? '<span class="sm">done ' + esc(fdate(s.done)) + '</span>' : '') + '</div>' : '') + '</div><span class="gr-step-a"><button class="gr-ic" data-act="g-st-mv" data-k="' + kind + '" data-id="' + esc(id) + '" data-i="' + i + '" data-v="-1" aria-label="Move up"' + (i ? '' : ' disabled') + '>↑</button><button class="gr-ic" data-act="g-st-mv" data-k="' + kind + '" data-id="' + esc(id) + '" data-i="' + i + '" data-v="1" aria-label="Move down"' + (i < steps.length - 1 ? '' : ' disabled') + '>↓</button><button class="gr-ic del" data-act="g-st-del" data-k="' + kind + '" data-id="' + esc(id) + '" data-i="' + i + '" aria-label="Remove step">×</button></span></li>'; }).join('') + '</ol><div class="gr-btns"><button class="btn small" data-act="g-st-add" data-k="' + kind + '" data-id="' + esc(id) + '">Add step</button></div>';
  }
  function gChanForm(c) {
    const F = k => 'gch:' + c.id + ':' + k, d = c.steps.filter(s => s.done).length;
    return '<div class="ls-fgrid"><label class="wide">Name' + gIn(F('name'), c.name) + '</label><label>Priority' + sel(F('priority'), CH_PRI, c.priority, null, 'Priority') + '</label><label>Owner' + sel(F('owner'), gOwners(c.owner), c.owner, '—', 'Owner') + '</label><label>Status' + sel(F('status'), CH_STATUS, c.status, null, 'Status') + '</label><label>Yearly target (airlines)' + gIn(F('target'), c.target, 'number', '0') + '</label><label class="wide">Notes<textarea class="in" data-f="' + F('notes') + '">' + esc(c.notes) + '</textarea></label></div><h4 class="ls-h4">Steps <span class="sm">' + d + ' of ' + c.steps.length + ' done</span></h4>' + gStepsEditor('gs', c.id, c.steps, true) + '<div class="gr-foot"><span class="grow"></span><button class="ls-del" data-act="g-del" data-k="chan" data-id="' + esc(c.id) + '">Delete channel</button></div>';
  }

  /* ---------- contact strategy ---------- */
  function gStratView() {
    let h = head('Contact strategy', 'Where we find the right people at each airline, and how we work each source.', '<button class="btn cta" data-act="g-s-add">Add source</button>');
    h += '<div class="gr-cards">' + data.strategies.map(s => '<article class="gr-card" data-act="g-open" data-k="strat" data-id="' + esc(s.id) + '" tabindex="0"><div class="gr-card-h"><span class="gr-stars" aria-label="Rating ' + esc(s.rating || 'not set') + '">' + (num(s.rating) ? '★'.repeat(num(s.rating)) + '<span class="off">' + '★'.repeat(5 - num(s.rating)) + '</span>' : '<span class="sm">Not rated</span>') + '</span><span class="grow"></span>' + (s.cost_note ? '<span class="sm">' + esc(s.cost_note) + '</span>' : '') + '</div><div class="nm">' + esc(s.source) + '</div><div class="sm">' + esc(s.best_for) + '</div>' + (s.steps.length ? '<ol class="gr-mini">' + s.steps.slice(0, 3).map(t => '<li>' + esc(t) + '</li>').join('') + (s.steps.length > 3 ? '<li class="sm">+' + (s.steps.length - 3) + ' more</li>' : '') + '</ol>' : '') + '</article>').join('') + '</div>';
    const rows = G_SRC.concat(['']).map(src => { const R = data.outreach.filter(r => (r.contact_source || '') === src); return [src || 'No source set', R.filter(r => !gNoContact(r)).length, R.filter(r => r.email_verified === 'yes').length, R.filter(gEmailed).length, R.filter(gReplied).length, R.filter(gPromoted).length]; }).filter(x => x.slice(1).some(Boolean) || x[0] !== 'No source set');
    h += '<div class="ls-panel"><h3>Results by source</h3><p class="sub">Read from Airline outreach (contact_source). Updates as you work.</p><div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Source</th><th class="n">Contacts found</th><th class="n">Emails verified</th><th class="n">Emails sent</th><th class="n">Replies</th><th class="n">Promoted leads</th></tr></thead><tbody>' + rows.map(x => '<tr><td class="nm full">' + esc(x[0]) + '</td>' + ['Contacts found', 'Emails verified', 'Emails sent', 'Replies', 'Promoted leads'].map((lab, i) => '<td class="n" data-l="' + lab + '">' + x[i + 1] + '</td>').join('') + '</tr>').join('') + '</tbody></table></div></div>';
    return h;
  }
  function gStratForm(s) {
    const F = k => 'gst:' + s.id + ':' + k;
    return '<div class="ls-fgrid"><label class="wide">Source' + gIn(F('source'), s.source) + '</label><label class="wide">Best for' + gIn(F('best_for'), s.best_for) + '</label><label>Rating' + sel(F('rating'), ['1', '2', '3', '4', '5'].map(n => [n, n + ' of 5']), s.rating, '—', 'Rating') + '</label><label>Cost note' + gIn(F('cost_note'), s.cost_note, 'text', 'e.g. Free tier, paid plans') + '</label><label class="wide">Notes<textarea class="in" data-f="' + F('notes') + '">' + esc(s.notes) + '</textarea></label></div><h4 class="ls-h4">Steps</h4>' + gStepsEditor('gss', s.id, s.steps, false) + '<div class="gr-foot"><span class="grow"></span><button class="ls-del" data-act="g-del" data-k="strat" data-id="' + esc(s.id) + '">Delete source</button></div>';
  }

  /* ---------- templates ---------- */
  function gTplView() {
    const T = data.growthTemplates.find(x => x.id === view.g.tpl) || data.growthTemplates[0];
    const r = view.g.tplRow && gFind('outreach', view.g.tplRow);
    let h = head('Templates', 'Outreach emails with merge fields {airline} {contact_name} {fleet} {sender}. Copy fills them from the selected airline; nothing is sent from the portal.');
    if (!T) return h + '<div class="ls-panel ls-empty">No templates.</div>';
    h += '<div class="ls-panel"><div class="ls-seg gr-wrapseg" role="group" aria-label="Template">' + data.growthTemplates.map(t => '<button type="button" data-act="g-tpl" data-v="' + esc(t.id) + '" aria-pressed="' + (t.id === T.id) + '">' + esc(t.name) + '</button>').join('') + '</div>';
    h += '<div class="ls-fgrid" style="margin-top:12px"><label class="wide">Name' + gIn('gt:' + T.id + ':name', T.name) + '</label><label class="wide">Subject' + gIn('gt:' + T.id + ':subject', T.subject) + '</label><label class="wide">Text<textarea class="in ls-tpl" data-f="gt:' + T.id + ':body">' + esc(T.body) + '</textarea></label></div>' + (G_TPL.some(x => x.id === T.id) ? '<button class="btn small ghost" data-act="g-tpl-reset" data-v="' + esc(T.id) + '">Back to the starter text</button>' : '') + '</div>';
    h += '<div class="ls-panel"><h3>Fill and copy</h3><p class="sub">Pick an outreach airline; fields it does not have stay in braces.</p><div class="ls-toolbar">' + sel('gx:tplrow', data.outreach.slice().sort((a, b) => a.airline.localeCompare(b.airline)).map(x => [x.id, x.airline + ' · ' + x.country]), view.g.tplRow, 'Airline…', 'Airline') + '<button class="btn cta" data-act="g-tpl-copy" data-v="' + esc(T.id) + '" data-id="' + esc(r ? r.id : '') + '">Copy</button></div><pre class="gr-pre">' + esc(gTplText(T.id, r || null)) + '</pre></div>';
    return h;
  }

  /* ---------- Today (Growth landing page) ---------- */
  function gTodayView() {
    const t = today(), wk = addDays(t, 14), O = data.outreach.filter(r => !G_CLOSED.includes(r.status) && !gPromoted(r) && r.next_follow_up_date);
    const L = data.leads.filter(isOpen), steps = [];
    data.channels.forEach(c => c.steps.forEach(s => { if (!s.done && s.due_date) steps.push({ c, s }); }));
    const it = (lab, sub, date, act) => '<li>' + act + '<span class="grow"><b>' + esc(lab) + '</b><span class="sm"> · ' + esc(sub) + '</span></span><span class="ls-due ' + dueClass(date) + '">' + esc(fdate(date)) + '</span></li>';
    const oA = r => '<button class="linkish gr-lb" data-act="g-open" data-k="out" data-id="' + esc(r.id) + '">Outreach</button>', lA = l => '<a class="linkish gr-lb" href="#lead/' + esc(l.id) + '">Lead</a>', cA = c => '<button class="linkish gr-lb" data-act="g-open" data-k="chan" data-id="' + esc(c.id) + '">Channel</button>';
    const dueT = O.filter(r => r.next_follow_up_date === t).map(r => it(r.airline, r.status + (r.owner ? ' · ' + r.owner : ''), r.next_follow_up_date, oA(r))).concat(L.filter(l => l.nextActionDate === t).map(l => it(l.name, l.nextAction || '', l.nextActionDate, lA(l)))).concat(steps.filter(x => x.s.due_date === t).map(x => it(x.s.text, x.c.name, x.s.due_date, cA(x.c))));
    const over = O.filter(r => r.next_follow_up_date < t).map(r => it(r.airline, r.status + (r.owner ? ' · ' + r.owner : ''), r.next_follow_up_date, oA(r))).concat(L.filter(l => isActive(l) && l.nextActionDate && l.nextActionDate < t).map(l => it(l.name, l.nextAction || '', l.nextActionDate, lA(l)))).concat(steps.filter(x => x.s.due_date < t).map(x => it(x.s.text, x.c.name, x.s.due_date, cA(x.c))));
    const meet = [];
    data.leads.forEach(l => [['hq', 'HQ meeting'], ['demoDate', 'Demo'], ['cLevel', 'C-level meeting']].forEach(([k, lab]) => { const d = (l.dates || {})[k]; if (d && d >= t && d <= wk) meet.push([d, it(l.name, lab, d, lA(l))]); }));
    data.conferences.forEach(c => { if (c.start_date && c.decision !== 'Skip' && (c.end_date || c.start_date) >= t && c.start_date <= addDays(t, 30)) meet.push([c.start_date, it(c.name, (c.place || '') + ' · ' + c.decision, c.start_date, '<button class="linkish gr-lb" data-act="g-open" data-k="conf" data-id="' + esc(c.id) + '">Event</button>')]); });
    meet.sort((a, b) => a[0] < b[0] ? -1 : 1);
    const box = (title, sub, items, cls) => '<div class="ls-panel gr-today ' + (cls || '') + '"><h3>' + esc(title) + ' <span class="ls-prog' + (items.length ? '' : ' full') + '">' + items.length + '</span></h3><p class="sub">' + esc(sub) + '</p>' + (items.length ? '<ul class="gr-list">' + items.slice(0, 25).join('') + '</ul>' + (items.length > 25 ? '<p class="ls-note">+' + (items.length - 25) + ' more</p>' : '') : '<div class="ls-empty">Nothing here.</div>') + '</div>';
    let h = head('Growth', 'Finding airlines before they become leads: outreach, events, channels and how we reach the right people.');
    h += gKpis();
    h += '<div class="gr-3">' + box('Follow-ups due today', 'Outreach, leads and channel steps dated today', dueT) + box('Overdue', 'Past their date', over, over.length ? 'over' : '') + box('Meetings and events', 'Lead meetings in the next 14 days; events in the next 30', meet.map(x => x[1])) + '</div>';
    const pay = data.leads.filter(l => ['Paid', 'Implementation', 'Onboarded'].includes(l.stage));
    h += '<div class="ls-panel"><h3>Targets: paying airlines</h3><p class="sub">Airlines at Paid, Implementation or Onboarded in Leads, counted by the year the implementation fee was paid (cumulative).</p><div class="gr-targets">' + G_TARGETS.map(([y, n]) => { const c = pay.filter(l => String((l.dates || {}).paid || t).slice(0, 4) <= String(y)).length; return '<div><span class="k">' + y + '</span><b>' + c + ' <small>of ' + n + '</small></b>' + bar(Math.min(c, n), n) + '</div>'; }).join('') + '</div></div>';
    const W = gWeekend();
    h += '<div class="ls-panel"><h3>Working days</h3><p class="sub">Follow-up dates skip these weekend days (Egypt: Friday and Saturday).</p><div class="gr-days">' + G_DAYS.map(([d, n]) => '<label class="ls-check"><input type="checkbox" data-f="gw:' + d + '"' + (W.includes(d) ? ' checked' : '') + '> ' + n + '</label>').join('') + '</div></div>';
    return h;
  }

  /* ---------- onboarding milestones on a signed lead (contract, invoice, data import, training, first report, case study) ---------- */
  function gMsHint(l, k) {
    if (k === 'contract' && l.req && l.req.A1) return 'Contract signed is marked in AS-ONB-02';
    if (k === 'invoice') { const s = feeState(l).s; return s === 'paid' ? 'Paid in Finance' : s === 'unpaid' ? 'Invoiced in Finance, not paid yet' : s === 'noinv' ? 'No invoice in Finance yet' : ''; }
    if (k === 'import') { const r = reqDone(l, REQ_FULL.filter(x => x[0][0] === 'T')); return r.done ? 'TMS data ' + r.done + '/' + r.all + ' in AS-ONB-02' : ''; }
    return '';
  }
  const gMsDone = l => G_MS.filter(([k]) => ((l.milestones || {})[k] || {}).done).length;
  const gMsBar = l => STAGES.indexOf(l.stage) >= I_SIGNED && STAGES.indexOf(l.stage) <= I_ONB ? bar(gMsDone(l), G_MS.length) : '';
  function msPanel(l) {
    const i = STAGES.indexOf(l.stage || 'Researched'); if (i < I_SIGNED || i > I_ONB) return '';
    const M = l.milestones || {}, d = gMsDone(l);
    return '<div class="ls-panel" id="milestones"><div class="ls-ph"><div><h3>Onboarding checklist</h3><p class="sub">Created when the airline signed. An owner and a date for each step.</p></div><span class="ls-prog' + (d === G_MS.length ? ' full' : '') + '">' + d + ' of ' + G_MS.length + '</span></div><ul class="ls-checks gr-ms">' + G_MS.map(([k, lab]) => { const m = M[k] || {}, hint = gMsHint(l, k); return '<li><label><input type="checkbox" data-f="ms:' + esc(l.id) + ':' + k + ':done"' + (m.done ? ' checked' : '') + '><span>' + esc(lab) + (hint ? '<span class="sm gr-hint">' + esc(hint) + '</span>' : '') + '</span></label><span class="ls-req-s">' + sel('ms:' + l.id + ':' + k + ':owner', gOwners(m.owner), m.owner || '', 'Owner…', 'Owner') + '<input class="in" type="date" aria-label="Date for ' + esc(lab) + '" data-f="ms:' + esc(l.id) + ':' + k + ':date" value="' + esc(m.date || '') + '"></span></li>'; }).join('') + '</ul></div>';
  }
  function gLeadSource(l) {
    if (!l.source && !l.outreachId) return '';
    const r = l.outreachId && gFind('outreach', l.outreachId);
    return '<p class="ls-note gr-src">Source: ' + esc(l.source || 'Outreach') + (r ? ' · <a class="linkish" href="#growth/outreach" data-act="g-open" data-k="out" data-id="' + esc(r.id) + '">outreach row</a>' : '') + '</p>';
  }
  /* the top of the sales funnel: outreach airlines not in Leads yet (its own bar; existing numbers unchanged) */
  function gFunnelRow() {
    const n = (data.outreach || []).filter(r => !gPromoted(r) && r.status !== 'Not a fit' && r.ownership !== 'state').length;
    return '<button type="button" class="ls-frow gr-frow" data-act="g-page" data-v="outreach" title="Outreach airlines not promoted to Leads yet (Growth)"><span>Outreach <small>(not in Leads)</small></span><span class="bar2"><span style="width:' + (n ? 100 : 0) + '%"></span></span><span class="n">' + n + '</span></button>';
  }
