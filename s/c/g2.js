
  /* ---------- Growth: shell ---------- */
  function growthView() {
    const P = view.g.page;
    let h = '<nav class="gr-nav ls-seg" aria-label="Growth pages">' + G_PAGES.map(([k, l]) => '<button type="button" data-act="g-page" data-v="' + k + '" aria-pressed="' + (P === k) + '">' + esc(l) + '</button>').join('') + '</nav>';
    if (gMigrated) h += '<div class="ls-banner"><span class="grow"><b>Growth starter data added:</b> 61 outreach airlines, 16 conferences, 14 channels, 8 contact sources and 5 email templates. Save to keep them for everyone.</span>' + (dirty ? '' : '<button class="btn small cta" data-act="g-save-seed">Save now</button>') + '</div>';
    h += P === 'outreach' ? gOutView() : P === 'conferences' ? gConfView() : P === 'channels' ? gChanView() : P === 'strategy' ? gStratView() : P === 'templates' ? gTplView() : gTodayView();
    return h + gDrawer();
  }
  function gKpis() {
    const O = data.outreach, vis = O.filter(r => r.ownership !== 'state');
    const promoted = O.filter(gPromoted), talking = promoted.filter(r => { const l = gLead(r); return l && (TALKING.includes(l.stage) || isCustomer(l)); });
    const dueToday = O.filter(gDue).length;
    return '<div class="ls-kpis gr-kpis">' + kpi('Airlines', vis.length, O.length - vis.length ? (O.length - vis.length) + ' state-owned hidden' : 'in outreach', 'lead') + kpi('Emailed', O.filter(gEmailed).length, 'at least one email sent') + kpi('Replied', O.filter(gReplied).length, 'replied or promoted') + kpi('In conversation', talking.length, 'promoted leads, HQ meeting onwards') + kpi('Promoted', promoted.length, 'now in Leads') + kpi('Follow-ups due', dueToday, 'today or overdue', dueToday ? 'alert' : '') + '</div>';
  }

  /* ---------- airline outreach ---------- */
  function gRows() {
    const f = view.g.o, q = norm(f.q);
    return data.outreach.filter(r => (f.state || r.ownership !== 'state') && (!f.owner || (r.owner || '') === (f.owner === '—' ? '' : f.owner)) && (!f.status || r.status === f.status) && (!f.source || (r.contact_source || '') === (f.source === '—' ? '' : f.source))
      && (f.mode !== 'due' || gDue(r)) && (f.mode !== 'nocontact' || (gNoContact(r) && !gPromoted(r)))
      && (!q || norm([r.airline, r.country, r.region, r.contact_name, r.contact_title, r.contact_email, r.notes].join(' ')).includes(q)));
  }
  function gOutView() {
    const f = view.g.o, rows = gRows(), S = view.g.sel, nSel = rows.filter(r => S[r.id]).length;
    const seg = '<div class="ls-seg" role="group" aria-label="View">' + [['plan', 'By region and week'], ['due', 'Follow-ups due'], ['nocontact', 'No contact yet'], ['all', 'All']].map(([k, l]) => '<button type="button" data-act="g-omode" data-v="' + k + '" aria-pressed="' + (f.mode === k) + '">' + l + '</button>').join('') + '</div>';
    let h = head('Airline outreach', 'The cold phase before an airline replies. When it replies, promote it to Leads and the lead takes over.', '<button class="btn" data-act="g-o-csv">Export CSV</button><label class="btn gr-file">Import CSV<input type="file" accept=".csv,text/csv" data-f="gx:csv" hidden></label><button class="btn cta" data-act="g-o-add">Add airline</button>');
    h += gKpis();
    h += '<div class="ls-toolbar">' + seg + '</div><div class="ls-toolbar"><input class="in ls-search" type="search" data-f="gof:q" aria-label="Search outreach" placeholder="Search airline, country, contact, notes" value="' + esc(f.q) + '">' + sel('gof:owner', OWNERS.concat(['—']), f.owner, 'All owners', 'Owner') + sel('gof:status', G_STATUS, f.status, 'All statuses', 'Status') + sel('gof:source', G_SRC.concat(['—']), f.source, 'All sources', 'Source') + '<label class="ls-check gr-toggle"><input type="checkbox" data-f="gof:state"' + (f.state ? ' checked' : '') + '> Show state-owned</label>' + (f.q || f.owner || f.status || f.source ? '<button class="btn small ghost" data-act="g-o-clear">Clear filters</button>' : '') + '</div>';
    h += gAddPanel() + gImpPanel();
    if (nSel) h += '<div class="gr-bulk" role="region" aria-label="Bulk actions"><b>' + nSel + ' selected</b>' + sel('gx:bowner', OWNERS, '', 'Set owner…', 'Set owner') + '<label class="gr-bl">Planned week<input class="in" type="date" data-f="gx:bweek" aria-label="Set planned week"></label><button class="btn small" data-act="g-b-sent">Mark Email sent</button><button class="btn small" data-act="g-o-csv" data-v="sel">Export selected</button><button class="btn small ghost" data-act="g-b-clear">Clear selection</button></div>';
    if (!data.outreach.length) return h + (view.g.add ? '' : '<div class="ls-panel ls-empty">No outreach airlines yet. Add one or import a CSV.</div>');
    if (!rows.length) return h + '<div class="ls-panel ls-empty">' + (f.mode === 'due' ? 'No follow-ups due. ' : f.mode === 'nocontact' ? 'Every airline has a contact. ' : '') + 'No airline matches.</div>';
    const all = rows.every(r => S[r.id]);
    let t = '<div class="ls-wrap"><table class="ls-table ls-cards c3 gr-out"><thead><tr><th class="gr-cb"><input type="checkbox" data-f="gx:selall" aria-label="Select all shown"' + (all ? ' checked' : '') + '></th><th>Airline</th><th class="n">Fleet</th><th>Week</th><th>Owner</th><th>Status</th><th>Contact</th><th>Source</th><th>Last touch</th><th>Next follow-up</th><th class="n">Touches</th></tr></thead><tbody>';
    const rowH = r => {
      const fin = gFin(r), fl = gFleet(r), l = gLead(r);
      return '<tr data-act="g-open" data-k="out" data-id="' + esc(r.id) + '" class="gr-click"><td class="gr-cb"><input type="checkbox" data-f="gx:sel:' + esc(r.id) + '" aria-label="Select ' + esc(r.airline) + '"' + (S[r.id] ? ' checked' : '') + '></td><td class="full"><span class="nm">' + esc(r.airline) + '</span><div class="sm">' + esc(r.country) + (r.ownership === 'state' ? ' · <span class="ls-cold">State-owned</span>' : '') + (gNotInFin(r) ? ' <span class="gr-flag" title="No matching airline in Finance">Not in Finance</span>' : '') + (l ? ' · <a class="linkish" href="#lead/' + esc(l.id) + '">Open lead</a>' : '') + '</div></td><td class="n" data-l="Fleet">' + esc(fl) + (fin && num(fin.fleet) && num(r.aircraft) && num(fin.fleet) !== num(r.aircraft) ? '<div class="sm" title="Aircraft count on the outreach list">list ' + esc(r.aircraft) + '</div>' : '') + '</td><td data-l="Week">' + esc(r.planned_week ? fdate(r.planned_week) : '') + '</td><td data-l="Owner">' + esc(r.owner) + '</td><td data-l="Status">' + gPill(r.status) + '</td><td class="full" data-l="Contact">' + (r.contact_name || r.contact_email ? '<div>' + esc(r.contact_name) + (r.contact_title ? ' <span class="sm">· ' + esc(r.contact_title) + '</span>' : '') + '</div><div class="sm">' + esc(r.contact_email) + (r.contact_email ? (gEmailOk(r.contact_email) ? (r.email_verified === 'yes' ? ' <span class="gr-ok" title="Verified">✓ verified</span>' : '') : ' <span class="gr-flag">invalid email</span>') : '') + '</div>' : '') + '</td><td data-l="Source">' + esc(r.contact_source) + '</td><td data-l="Last touch">' + esc(fdate(r.last_touch_date)) + '</td><td data-l="Next follow-up">' + (r.next_follow_up_date ? '<span class="ls-due ' + (G_CLOSED.includes(r.status) || gPromoted(r) ? '' : dueClass(r.next_follow_up_date)) + '">' + esc(fdate(r.next_follow_up_date)) + '</span>' : '') + '</td><td class="n" data-l="Touches">' + (num(r.touch_count) || '') + '</td></tr>';
    };
    if (f.mode === 'plan') {
      const groups = {};
      rows.forEach(r => { const k = (r.region || '—') + '\u0001' + (r.country || '—') + '\u0001' + (r.planned_week || '9999'); (groups[k] = groups[k] || []).push(r); });
      const RO = ['North Africa', 'East Africa'];
      let lastReg = '';
      Object.keys(groups).sort((a, b) => { const [ra, ca, wa] = a.split('\u0001'), [rb, cb, wb] = b.split('\u0001'); return ((RO.indexOf(ra) + 1 || 9) - (RO.indexOf(rb) + 1 || 9)) || ra.localeCompare(rb) || (wa < wb ? -1 : wa > wb ? 1 : ca.localeCompare(cb)); }).forEach(k => {
        const [reg, c, w] = k.split('\u0001'), list = groups[k].sort((a, b) => num(gFleet(b)) - num(gFleet(a)));
        if (reg !== lastReg) { t += '<tr class="gr-grp gr-reg"><td colspan="11">' + esc(reg) + ' · ' + rows.filter(r => (r.region || '—') === reg).length + '</td></tr>'; lastReg = reg; }
        t += '<tr class="gr-grp"><td colspan="11">' + esc(c) + ' · ' + esc(w === '9999' ? 'No week set' : gWeek(w)) + ' · ' + list.length + '</td></tr>' + list.map(rowH).join('');
      });
    } else t += rows.sort((a, b) => f.mode === 'due' ? (a.next_follow_up_date < b.next_follow_up_date ? -1 : 1) : a.airline.localeCompare(b.airline)).map(rowH).join('');
    return h + t + '</tbody></table></div><p class="ls-note">' + rows.length + ' of ' + data.outreach.length + ' airlines shown. Follow-up dates skip ' + esc(gWeekend().map(d => G_DAYS[d][1]).join(' and ') || 'no days') + ' (set on the Today page).</p>';
  }
  function gAddPanel() {
    const A = view.g.add; if (!A) return '';
    const all = finState && Array.isArray(finState.airlines) ? finState.airlines : [];
    const taken = new Set(data.outreach.map(r => r.linked_airline_id).filter(Boolean));
    const opts = all.filter(a => !taken.has(a.id)).sort((a, b) => String(a.country).localeCompare(String(b.country)) || String(a.name).localeCompare(String(b.name))).map(a => [a.id, a.name + ' · ' + (a.country || '—') + (a.fleet ? ' · ' + a.fleet + ' aircraft' : '')]);
    const dup = A.name.trim() && gDup(A.name, A.country);
    return '<div class="ls-panel ls-add"><div class="ls-ph"><div><h3>Add an airline to outreach</h3><p class="sub">Pick it from Finance so the fleet is never typed twice, or type a new one (it will be flagged “Not in Finance”).</p></div><button class="btn small ghost" data-act="g-o-add-close">Close</button></div><div class="ls-fgrid"><label class="wide">Airline in Finance' + sel('gx:afin', opts, A.fin, all.length ? '— not in Finance / type below —' : (finError ? 'Finance could not be read' : 'Reading Finance…'), 'Airline in Finance') + '</label>' + (A.fin ? '' : '<label>Airline name<input class="in" data-f="gx:aname" value="' + esc(A.name) + '" autocomplete="off"></label><label>Country<input class="in" data-f="gx:acountry" value="' + esc(A.country) + '"></label><label>Aircraft<input class="in" type="number" min="0" inputmode="numeric" data-f="gx:aac" value="' + esc(A.ac) + '"></label>') + '<label>Planned week<input class="in" type="date" data-f="gx:aweek" value="' + esc(A.week) + '"></label></div>' + (dup ? '<div class="ls-banner warn"><span class="grow"><b>' + esc(dup.airline) + '</b> (' + esc(dup.country) + ') is already in outreach. One row per airline.</span><button class="btn small" data-act="g-open" data-k="out" data-id="' + esc(dup.id) + '">Open it</button></div>' : '') + '<div class="ls-add-go"><button class="btn cta" data-act="g-o-add-go"' + ((A.fin || A.name.trim()) && !dup ? '' : ' disabled') + '>Add to outreach</button></div></div>';
  }
  function gOutAdd() {
    const A = view.g.add; let o;
    if (A.fin) { const a = (finState.airlines || []).find(x => x.id === A.fin); if (!a) return; o = { airline: a.name, country: a.country || '', aircraft: num(a.fleet) || '', linked_airline_id: a.id }; }
    else o = { airline: A.name.trim(), country: A.country.trim(), aircraft: num(A.ac) > 0 ? Math.round(num(A.ac)) : '', fin_none: true };
    const d = gDup(o.airline, o.country) || (o.linked_airline_id && data.outreach.find(x => x.linked_airline_id === o.linked_airline_id));
    if (d) { toast(d.airline + ' is already in outreach. One row per airline.'); return; }
    const r = gRow(Object.assign(o, { region: gRegion(o.country), planned_week: A.week || '', owner: '' }));
    data.outreach.push(r); view.g.add = null; touch(); toast(r.airline + ' added to outreach. Save to keep it.'); view.g.open = { k: 'out', id: r.id }; render();
  }
  /* ---------- CSV export and import (with a preview) ---------- */
  function gOutCSV(onlySel) {
    const rows = onlySel ? data.outreach.filter(r => view.g.sel[r.id]) : gRows();
    const txt = [G_FIELDS.join(',')].concat(rows.map(r => G_FIELDS.map(k => gQ(k === 'aircraft' ? gFleet(r) : r[k])).join(','))).join('\n');
    gDownload('aerostrat-outreach-' + today() + '.csv', txt); toast(rows.length + ' rows exported.');
  }
  function gImpParse(text) {
    const rows = gParseCSV(text); if (!rows.length) return { error: 'The file is empty.' };
    const hd = rows[0].map(x => String(x).trim().toLowerCase().replace(/\s+/g, '_'));
    if (!hd.includes('airline')) return { error: 'The first row must name the columns, including “airline”. Expected: ' + G_FIELDS.join(', ') };
    const unknown = hd.filter(x => x && !G_FIELDS.includes(x));
    const seen = {}, items = rows.slice(1).map((cells, i) => {
      const o = {}; hd.forEach((k, j) => { if (G_FIELDS.includes(k)) o[k] = String(cells[j] == null ? '' : cells[j]).trim(); });
      const err = [];
      if (!o.airline) err.push('airline is empty');
      if (o.status && !G_STATUS.includes(o.status)) err.push('unknown status “' + o.status + '”');
      if (o.status === 'Promoted to Lead') err.push('use the Promote button, not the CSV, to promote');
      if (o.ownership && !G_OWNERSHIP.some(x => x[0] === o.ownership.toLowerCase())) err.push('ownership must be private, state or unknown');
      if (o.contact_source && !G_SRC.includes(o.contact_source)) err.push('unknown contact_source “' + o.contact_source + '”');
      if (o.contact_email && !gEmailOk(o.contact_email)) err.push('invalid email');
      if (o.email_verified && !['yes', 'no'].includes(o.email_verified.toLowerCase())) err.push('email_verified must be yes or no');
      ['planned_week', 'last_touch_date', 'next_follow_up_date'].forEach(k => { if (o[k] && !gDateOk(o[k])) err.push(k + ' must be YYYY-MM-DD'); });
      if (o.touch_count && !(num(o.touch_count, -1) >= 0)) err.push('touch_count must be a number');
      if (o.aircraft && !(num(o.aircraft, -1) >= 0)) err.push('aircraft must be a number');
      if (o.linked_airline_id && finState && !(finState.airlines || []).some(a => a.id === o.linked_airline_id)) err.push('linked_airline_id is not a Finance airline');
      const ex = (o.id && data.outreach.find(x => x.id === o.id)) || (o.airline && gDup(o.airline, o.country || ''));
      const k = gKey(o.airline, o.country); if (o.airline && seen[k]) err.push('same airline as row ' + seen[k]); seen[k] = i + 2;
      return { line: i + 2, o, err, ex: ex ? ex.id : '' };
    });
    return { items, unknown };
  }
  function gImpPanel() {
    const I = view.g.imp; if (!I) return '';
    let h = '<div class="ls-panel ls-add"><div class="ls-ph"><div><h3>Import preview: ' + esc(I.name) + '</h3><p class="sub">Nothing is changed until you confirm. Rows that match an airline already in outreach update it; the others are added.</p></div><button class="btn small ghost" data-act="g-imp-close">Cancel</button></div>';
    if (I.error) return h + '<div class="ls-banner warn"><span class="grow">' + esc(I.error) + '</span></div></div>';
    const ok = I.items.filter(x => !x.err.length), bad = I.items.length - ok.length;
    h += '<p class="small">' + ok.filter(x => !x.ex).length + ' new · ' + ok.filter(x => x.ex).length + ' updates · <b' + (bad ? ' class="gr-bad"' : '') + '>' + bad + ' with errors (skipped)</b>' + (I.unknown.length ? ' · ignored columns: ' + esc(I.unknown.join(', ')) : '') + '</p>';
    h += '<div class="ls-wrap gr-impw"><table class="ls-table ls-cards c2"><thead><tr><th>Line</th><th>Airline</th><th>Country</th><th>Status</th><th>Contact</th><th>Result</th></tr></thead><tbody>' + I.items.slice(0, 200).map(x => '<tr><td data-l="Line">' + x.line + '</td><td class="nm" data-l="Airline">' + esc(x.o.airline) + '</td><td data-l="Country">' + esc(x.o.country || '') + '</td><td data-l="Status">' + esc(x.o.status || '') + '</td><td data-l="Contact">' + esc([x.o.contact_name, x.o.contact_email].filter(Boolean).join(' · ')) + '</td><td class="full" data-l="Result">' + (x.err.length ? '<span class="gr-flag">' + esc(x.err.join('; ')) + '</span>' : x.ex ? 'Update' : 'New') + '</td></tr>').join('') + '</tbody></table></div>';
    return h + '<div class="ls-add-go"><button class="btn cta" data-act="g-imp-go"' + (ok.length ? '' : ' disabled') + '>Import ' + ok.length + ' rows</button></div></div>';
  }
  function gImpApply() {
    const I = view.g.imp; let add = 0, upd = 0;
    I.items.filter(x => !x.err.length).forEach(x => {
      const o = Object.assign({}, x.o); delete o.lead_id; delete o.id; delete o.created_at; delete o.updated_at;
      if (o.ownership) o.ownership = o.ownership.toLowerCase(); if (o.email_verified) o.email_verified = o.email_verified.toLowerCase();
      if (o.touch_count !== undefined) o.touch_count = Math.round(num(o.touch_count)); if (o.aircraft) o.aircraft = Math.round(num(o.aircraft));
      Object.keys(o).forEach(k => { if (o[k] === '' && k !== 'notes') delete o[k]; });
      const ex = x.ex && gFind('outreach', x.ex);
      if (ex) { if (gPromoted(ex)) return; Object.assign(ex, o); ex.updated_at = gNow(); upd++; }
      else { const r = gRow(o); if (!r.region) r.region = gRegion(r.country); data.outreach.push(r); add++; }
    });
    view.g.imp = null; touch(); toast(add + ' added, ' + upd + ' updated. Save to keep them.'); render();
  }
  /* ---------- promote to Lead (the single bridge into Leads) ---------- */
  function gPromote(r) {
    if (gPromoted(r)) { go('lead', r.lead_id); return; }
    const ex = gLeadFor(r);
    if (ex) {
      if (!confirmLeave(ex.name + ' is already in Leads (' + (ex.stage || 'Researched') + '). Link this outreach row to that lead instead of creating a new one?')) return;
      r.lead_id = ex.id; r.status = 'Promoted to Lead'; r.updated_at = gNow(); ex.outreachId = r.id; if (!ex.source) ex.source = 'Outreach: ' + (r.contact_source || 'Other');
      touch(); toast(r.airline + ' linked to the existing lead. Save to keep it.'); render(); return;
    }
    const a = gFin(r), wasReplied = r.status === 'Replied' && (num(r.touch_count) > 0 || !!r.last_touch_date);
    const l = a ? fromFin(a) : { id: nid(), name: r.airline, country: r.country, region: r.region || regionName(r.country), fleet: num(r.aircraft) || '', product: 'bundle', billing: 'annual', stage: 'Researched', nextAction: STEP.Researched.do, contacts: [], dates: {}, finNone: true, createdAt: new Date().toISOString() };
    l.source = 'Outreach: ' + (r.contact_source || 'Other'); l.outreachId = r.id;
    if (!l.route) l.route = r.contact_source === 'Referral' ? 'Warm intro (other)' : 'Own outreach';
    if (!l.owner && r.owner) l.owner = r.owner;
    if (r.contact_name || r.contact_email) l.contacts = [{ name: r.contact_name || '', title: r.contact_title || '', email: r.contact_email || '', linkedin: '', phone: '' }].concat((l.contacts || []).filter(c => norm(c.name) !== norm(r.contact_name) || !r.contact_name));
    const hist = (r.touches || []).map(t => '- ' + fdate(t.date) + ': ' + t.status + (t.by ? ' (' + t.by + ')' : '')).join('\n');
    l.notes = [l.notes, 'From Outreach, ' + fdate(today()) + ' (' + r.status + ', ' + (num(r.touch_count) || 0) + ' touches, source ' + (r.contact_source || '—') + ').', r.notes ? 'Notes:\n' + r.notes : '', hist ? 'Touch history:\n' + hist : ''].filter(Boolean).join('\n\n');
    data.leads.push(l);
    setStage(l, wasReplied ? 'First touch' : 'Contact found', true);
    if (wasReplied && r.last_touch_date) l.dates.firstTouch = r.last_touch_date;
    r.lead_id = l.id; r.status = 'Promoted to Lead'; r.next_follow_up_date = ''; r.updated_at = gNow(); r.touches = (r.touches || []).concat([{ date: today(), status: 'Promoted to Lead', by: auth ? auth.name : '' }]);
    view.g.open = null; touch(); toast(l.name + ' promoted to Leads at “' + l.stage + '”. Save to keep it.'); go('lead', l.id);
  }
