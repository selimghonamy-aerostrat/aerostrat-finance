    const V = { Airline: l.name || '', Name: c.name || '', FirstName: parts[0] || '', LastName: parts.length ? parts[parts.length - 1] : '{LastName}', Title: c.title || '', Fleet: l.fleet || '', OverviewVideoLink: data.settings.overviewVideoLink || '{OverviewVideoLink}', VideoLink: data.settings.overviewVideoLink || '{VideoLink}', DemoClipLink: data.settings.demoClipLink || '{DemoClipLink}', BookingLink: data.settings.bookingLink || '{BookingLink}', DriveLink: l.driveLink || '{DriveLink}', DemoDate: (l.dates || {}).demoDate ? fdate(l.dates.demoDate) : 'a date we agree together' };
    return String(txt || '').replace(/\{(\w+)\}/g, (m, k) => V[k] != null ? String(V[k]) : m);
  }
  function emailFor(l, key) {
    const T = data.templates[key]; if (!T) return null;
    const c = (l.contacts || []).find(x => x.email) || {};
    return { to: c.email || '', subject: fill(T.subject, l), body: fill(T.body, l), name: T.name };
  }
  const mailto = e => 'mailto:' + encodeURIComponent(e.to) + '?subject=' + encodeURIComponent(e.subject) + '&body=' + encodeURIComponent(e.body);

  /* ---------- server ---------- */
  const hdr = () => ({ 'x-app-key': auth ? auth.key : '', 'x-app-user': auth ? auth.name : '', 'content-type': 'application/json' });
  async function api(method, body) {
    const r = await fetch('/api/sales', { method, headers: hdr(), body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    if (r.status === 401) { try { localStorage.removeItem(LS); } catch (e) {} location.reload(); throw new Error('signed out'); }
    const j = await r.json().catch(() => ({}));
    if (r.status === 409) { const e = new Error('conflict'); e.conflict = j; throw e; }
    if (!r.ok) throw new Error(j.error || ('Server error ' + r.status));
    return j;
  }
  function usePrice() {
    if (priceSrc === 'finance') return;
    if (data && data.pricing && (data.pricing.products || []).length) { price = data.pricing; priceSrc = 'saved'; } else { price = DEFAULT_PRICE; priceSrc = 'default'; }
  }
  async function load() {
    const j = await api('GET');
    role = j.role; data = fix(j.exists ? j.data : null); base = j.exists ? (j.savedAt || '') : '';
    let dr = null; try { dr = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) {}
    if (dr && dr.data) { if ((dr.base || '') === base) { data = fix(dr.data); dirty = true; toast('Your unsaved changes from this browser were restored.'); } else staleDraft = dr; }
    usePrice(); loading = false;
  }
  function keepDraft() { try { localStorage.setItem(DRAFT, JSON.stringify({ base, data })); } catch (e) {} }
  function dropDraft() { try { localStorage.removeItem(DRAFT); } catch (e) {} }
  function touch() { dirty = true; keepDraft(); paintSave(); }
  async function save(force) {
    if (busy) return; busy = true; paintSave();
    if (priceSrc === 'finance') data.pricing = price;
    try {
      const j = await api('PUT', { base, data, force: !!force });
      base = j.savedAt; data.savedAt = j.savedAt; data.savedBy = j.savedBy; dirty = false; conflict = null; gMigrated = false; dropDraft(); toast('Saved.');
    } catch (e) {
      if (e.conflict) conflict = e.conflict; else toast('Could not save: ' + e.message);
    }
    busy = false; render();
  }
  async function loadFin(quiet) {
    if (finLoading) return; finLoading = true; finError = '';
    try {
      const r = await fetch('/api/db?bootstrap', { headers: hdr(), cache: 'no-store' });
      if (!r.ok) throw new Error('Finance answered ' + r.status);
      const j = await r.json(); finState = j.state || j;
      if (!Array.isArray(finState.airlines)) throw new Error('No airline list found in Finance');
      if (Array.isArray(finState.products) && finState.products.length) {
        const p = priceFromFinance(finState), changed = data && data.pricing && !samePrice(p, data.pricing);
        price = p; priceSrc = 'finance';
        if (changed && !quiet) toast('Prices updated from Finance.');
      }
    } catch (e) { finError = e.message; finState = null; }
    finLoading = false; if (data) { autoPaid(); render(); }
  }

  /* ---------- shell ---------- */
  function saveText() { return busy ? 'Saving…' : dirty ? 'Unsaved changes' : base ? 'Saved ' + when(base) + (data.savedBy ? ' by ' + data.savedBy : '') : 'Nothing saved yet'; }
  function saveBox() { return '<span class="savestate ' + (dirty ? 'dirty' : '') + '" role="status">' + esc(saveText()) + '</span>' + (dirty && !busy ? '<button class="btn ghost-light small" data-act="discard">Discard</button>' : '') + '<button class="btn cta" data-act="save" ' + (dirty && !busy ? '' : 'disabled') + '>' + (busy ? 'Saving…' : 'Save') + '</button>'; }
  function paintSave() { const b = $('.savebox'); if (b) b.innerHTML = saveBox(); }
  function shell() {
    return '<header class="bar"><div class="wrap"><div class="brand"><img src="' + esc(logo) + '" alt="AeroStrat Intelligence Driven Aviation"><span class="divider"></span><span class="app">Sales &amp; Onboarding<small>Airlines · outreach · onboarding</small></span></div>' + SWITCH() + '<span class="spacer"></span><div class="savebox">' + saveBox() + '</div></div><div class="ribbon"></div></header>' +
      '<nav class="tabs" aria-label="Sections"><div class="wrap" role="tablist">' + TABS.map(([k, l]) => '<button role="tab" data-act="tab" data-v="' + k + '" aria-selected="' + (view.tab === k || (view.tab === 'lead' && k === 'leads')) + '">' + l + '</button>').join('') + '</div></nav><main><div class="wrap" id="content"></div></main>';
  }
  function render() {
    const ae = document.activeElement, fid = ae && ae.dataset && ae.dataset.f, ss = ae && ae.selectionStart, sy = window.scrollY;
    const bx = $('.ls-board'), bsx = bx ? bx.scrollLeft : 0, gdr = $('.gr-drawer-b'), gds = gdr ? gdr.scrollTop : 0;
    $('#app').innerHTML = shell();
    if (loading) { $('#content').innerHTML = '<div class="ls-panel"><span class="spin" aria-hidden="true"></span> Loading leads…</div>'; return; }
    let h = '';
    if (conflict) h += '<div class="ls-banner warn"><span class="grow"><b>' + esc(conflict.savedBy || 'Someone') + ' saved a newer version ' + esc(when(conflict.savedAt)) + '.</b> Saving now would replace it.</span><button class="btn small" data-act="load-theirs">Load their version</button><button class="btn small" data-act="force-save">Save mine anyway</button></div>';
    if (staleDraft) h += '<div class="ls-banner warn"><span class="grow">You have unsaved edits from earlier in this browser, but a newer version was saved since.</span><button class="btn small" data-act="draft-load">Load my edits</button><button class="btn small" data-act="draft-drop">Delete them</button></div>';
    const t = view.tab;
    h += t === 'lead' ? leadView() : t === 'leads' ? leadsView() : t === 'growth' ? growthView() : t === 'followups' ? followView() : t === 'onboarding' ? onboardingView() : t === 'feedback' ? feedbackView() : t === 'activity' ? activityView() : t === 'import' ? importView() : t === 'settings' ? settingsView() : overview();
    $('#content').innerHTML = h;
    const tw = $('.tabs .wrap'), ta = tw && tw.querySelector('[aria-selected="true"]'); if (tw && ta && tw.scrollWidth > tw.clientWidth) tw.scrollLeft = Math.max(0, ta.offsetLeft - (tw.clientWidth - ta.offsetWidth) / 2);
    const nb = $('.ls-board'); if (nb && bsx) nb.scrollLeft = bsx;
    const ndr = $('.gr-drawer-b'); if (ndr && gds) ndr.scrollTop = gds;
    const cs = $('.ls-steps .cur'); if (cs) { const w = cs.parentElement; if (w.scrollWidth > w.clientWidth) w.scrollLeft = Math.max(0, cs.offsetLeft - 16); }
    if (fid) { const el = document.querySelector('[data-f="' + CSS.escape(fid) + '"]'); if (el) { el.focus(); try { if (ss != null && el.setSelectionRange) el.setSelectionRange(ss, ss); } catch (e) {} } }
    window.scrollTo(0, sy);
  }
  function go(tab, lead) { view.tab = tab; view.lead = lead || null; location.hash = tab === 'lead' ? 'lead/' + lead : tab; window.scrollTo(0, 0); render(); }
  function fromHash() { const h = decodeURIComponent(location.hash.replace(/^#/, '')); if (h.startsWith('lead/')) { view.tab = 'lead'; view.lead = h.slice(5); } else if (h === 'growth' || h.startsWith('growth/')) { view.tab = 'growth'; view.lead = null; const pg = h.split('/')[1]; if (pg && G_PAGES.some(([k]) => k === pg)) view.g.page = pg; } else if (TABS.some(([k]) => k === h)) { view.tab = h; view.lead = null; } }
  const head = (t, p, right) => '<div class="ls-head"><div class="grow"><h2>' + esc(t) + '</h2>' + (p ? '<p class="muted">' + esc(p) + '</p>' : '') + '</div>' + (right || '') + '</div>';
  const kpi = (k, v, s, cls) => '<div class="ls-kpi ' + (cls || '') + '"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div><div class="s">' + esc(s) + '</div></div>';
  function priceNote() {
    if (priceSrc === 'finance') return '';
    return '<div class="ls-banner' + (priceSrc === 'default' ? ' warn' : '') + '"><span class="grow">' + (priceSrc === 'default' ? 'Prices could not be read from Finance yet, so estimates use the bundle tiers only (no instructor, admin or cabin seats).' : 'Using the prices saved ' + esc(fdate(price.at)) + ' — Finance could not be read just now.') + '</span><button class="btn small" data-act="fin-reload">Read prices from Finance</button></div>';
  }

  /* ---------- overview ---------- */
  function overview() {
    const L = data.leads, act = L.filter(isActive), talking = L.filter(l => TALKING.includes(l.stage)), signed = L.filter(isCustomer), asks = data.feedback.filter(x => x.status === 'Open' && ['Objection', 'Question'].includes(x.type));
    const over = act.filter(l => l.nextActionDate && l.nextActionDate < today()), week = act.filter(l => l.nextActionDate && l.nextActionDate >= today() && l.nextActionDate <= addDays(today(), 7));
    const cold = L.filter(isCold);
    const pipeVal = act.reduce((s, l) => s + arrOf(l), 0), signedVal = signed.reduce((s, l) => s + arrOf(l), 0), weighted = act.reduce((s, l) => s + arrOf(l) * probOf(l) / 100, 0);
    if (!L.length) return head('Overview', 'Your airline leads, outreach and follow-ups, kept apart from the finance numbers.') + '<div class="ls-panel ls-empty">No leads yet. Start by importing the airlines of a country from Finance.<br><br><button class="btn cta" data-act="tab" data-v="import">Import from Finance</button></div>';
    let h = head('Overview', L.length + ' airlines in Leads · ' + act.length + ' active') + priceNote();
    h += '<div class="ls-kpis">' + kpi('Active leads', act.length, 'Researched to proposal sent', 'lead') + kpi('In conversation', talking.length, 'HQ meeting to proposal') + kpi('Customers', signed.length, signed.length ? moneyK(signedVal) + ' a year · ' + L.filter(l => l.stage === 'Onboarded').length + ' onboarded' : 'none yet') + kpi('Pipeline value', moneyK(pipeVal), 'yearly licence, active leads') + kpi('Weighted pipeline', moneyK(weighted), 'value × chance of signing by stage') + kpi('Needs attention', over.length + cold.length + asks.length, over.length + ' overdue · ' + cold.length + ' going cold · ' + asks.length + ' feedback to answer', over.length + cold.length + asks.length ? 'alert' : '') + '</div>';
    if (finState && Array.isArray(finState.invoices)) {
      const IV = finState.invoices, usd = v => num(v.amount) * fxOf(v.currency || 'USD'), issued = IV.filter(v => !v.issue || v.issue <= today());
      const inv = issued.reduce((t, v) => t + usd(v), 0), paid = issued.filter(v => v.paidDate).reduce((t, v) => t + (isSet(v.paidAmount) ? num(v.paidAmount) * fxOf(v.currency || 'USD') : usd(v)), 0), od = issued.filter(v => !v.paidDate && v.due && v.due < today());
      const wait = L.filter(l => l.stage === 'Signed').length;
      h += '<div class="ls-kpis">' + kpi('Invoiced to date', moneyK(inv), 'from Finance') + kpi('Collected', moneyK(paid), inv ? Math.round(paid / inv * 100) + '% of invoiced' : 'nothing invoiced yet') + kpi('Overdue', moneyK(od.reduce((t, v) => t + usd(v), 0)), od.length + ' invoice' + (od.length === 1 ? '' : 's') + ' past due', od.length ? 'alert' : '') + kpi('Signed, not paid yet', wait, 'onboarding waits for payment', wait ? 'alert' : '') + '</div>';
    }
    const counts = FUNNEL.map(s => [s, L.filter(l => (l.stage || 'Researched') === s).length]), mx = Math.max(1, ...counts.map(c => c[1]));
    h += '<div class="ls-grid"><div class="ls-panel"><h3>Where every airline stands</h3><p class="sub">Airlines at each stage · click a stage to see them</p><div class="ls-funnel">' + gFunnelRow() + counts.map(([s, n]) => '<button type="button" class="ls-frow' + (CUSTOMER.includes(s) ? ' signed' : '') + '" data-act="stage-filter" data-v="' + esc(s) + '"><span>' + esc(s) + '</span><span class="bar2"><span style="width:' + (n ? Math.max(3, n / mx * 100) : 0) + '%"></span></span><span class="n">' + n + '</span></button>').join('') + '</div>';
    const side = ['Nurture', 'Lost', 'Do not approach'].map(s => s + ' ' + L.filter(l => l.stage === s).length).join(' · ');
    h += '<p class="ls-note">' + esc(side) + '</p></div>';
    const next = act.filter(l => l.nextActionDate).sort((a, b) => a.nextActionDate < b.nextActionDate ? -1 : 1).slice(0, 8);
    h += '<div class="ls-panel"><h3>Next follow-ups</h3><p class="sub">Soonest first</p>' + (next.length ? '<table class="ls-table">' + next.map(l => '<tr data-open="' + esc(l.id) + '"><td><div class="nm">' + esc(l.name) + '</div><div class="sm">' + esc(l.nextAction || '') + '</div></td><td class="n"><span class="ls-due ' + dueClass(l.nextActionDate) + '">' + esc(fdate(l.nextActionDate)) + '</span><div class="sm">' + esc(l.owner || '') + '</div></td></tr>').join('') + '</table>' : '<div class="ls-empty">No dated next actions yet.</div>') + '</div></div>';
    const byC = {}; L.forEach(l => { const c = l.country || '—'; byC[c] = byC[c] || { n: 0, a: 0, t: 0, v: 0, w: 0 }; byC[c].n++; if (isActive(l)) { byC[c].a++; byC[c].v += arrOf(l); byC[c].w += arrOf(l) * probOf(l) / 100; } if (TALKING.includes(l.stage)) byC[c].t++; });
    h += '<div class="ls-panel"><h3>By country</h3><p class="sub">Values count active leads only</p><table class="ls-table ls-cards c2"><thead><tr><th>Country</th><th class="n">Airlines</th><th class="n">Active</th><th class="n">In conversation</th><th class="n">Pipeline value</th><th class="n">Weighted</th></tr></thead><tbody>' + Object.entries(byC).sort((a, b) => b[1].v - a[1].v).map(([c, v]) => '<tr><td class="nm full">' + esc(c) + '</td><td class="n" data-l="Airlines">' + v.n + '</td><td class="n" data-l="Active">' + v.a + '</td><td class="n" data-l="In conversation">' + v.t + '</td><td class="n" data-l="Pipeline value">' + money(v.v) + '</td><td class="n" data-l="Weighted">' + money(v.w) + '</td></tr>').join('') + '</tbody></table></div>';
    return h;
  }

  /* ---------- leads list and board ---------- */
  function filtered() {
    const f = view.f, q = norm(f.q);
    return data.leads.filter(l => (!f.country || l.country === f.country) && (!f.wave || (l.wave || '') === (f.wave === '—' ? '' : f.wave)) && (!f.stage || (l.stage || 'Researched') === f.stage) && (!f.owner || l.owner === f.owner) && (!q || norm(l.name + ' ' + (l.notes || '') + ' ' + (l.contacts || []).map(c => c.name).join(' ')).includes(q)));
  }
  const sortLeads = rows => rows.sort((a, b) => (WAVES.indexOf(a.wave) + 1 || 9) - (WAVES.indexOf(b.wave) + 1 || 9) || (PRI.indexOf(a.priority) + 1 || 9) - (PRI.indexOf(b.priority) + 1 || 9) || num(b.fleet) - num(a.fleet));
  function leadsView() {
    const countries = [...new Set(data.leads.map(l => l.country).filter(Boolean))].sort();
    const rows = sortLeads(filtered());
    const toggle = '<div class="ls-seg" role="group" aria-label="View"><button type="button" data-act="mode" data-v="list" aria-pressed="' + (view.mode === 'list') + '">List</button><button type="button" data-act="mode" data-v="board" aria-pressed="' + (view.mode === 'board') + '">Board</button></div>';
    let h = head('Leads', rows.length + ' of ' + data.leads.length + ' airlines', toggle + '<button class="btn" data-act="csv">Export CSV</button><button class="btn cta" data-act="add-lead">Add airline</button>');
    h += '<div class="ls-toolbar"><input class="in ls-search" type="search" data-f="f:q" aria-label="Search" placeholder="Search airline, contact, notes" value="' + esc(view.f.q) + '">' + sel('f:country', countries, view.f.country, 'All countries', 'Country') + sel('f:wave', WAVES.concat(['—']), view.f.wave, 'All waves', 'Wave') + sel('f:stage', STAGES, view.f.stage, 'All stages', 'Stage') + sel('f:owner', OWNERS, view.f.owner, 'All owners', 'Owner') + (view.f.q || view.f.country || view.f.wave || view.f.stage || view.f.owner ? '<button class="btn small ghost" data-act="clear-f">Clear filters</button>' : '') + '</div>';
    h += addPanel();
    if (!data.leads.length) return h + (view.add ? '' : '<div class="ls-panel ls-empty">No leads yet. <a class="linkish" data-act="tab" data-v="import">Import airlines from Finance</a> or add one by hand.</div>');
    if (!rows.length) return h + '<div class="ls-panel ls-empty">No airline matches these filters.</div>';
    if (view.mode === 'board') return h + boardView(rows);
    h += '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Airline</th><th>Wave</th><th>Pri.</th><th>Stage</th><th>Owner</th><th>Next action</th><th>Due</th><th class="n">Fleet</th><th class="n">Pilots</th><th>Tier</th><th class="n">Yearly licence</th></tr></thead><tbody>';
    h += rows.map(l => { const e = econ(l); return '<tr data-open="' + esc(l.id) + '"><td class="full"><a class="nm ls-name" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a><div class="sm">' + esc(l.country || '') + ' ' + coldChip(l) + '</div></td><td data-l="Wave">' + esc(l.wave || '') + '</td><td data-l="Priority">' + ppill(l.priority) + '</td><td data-l="Stage">' + pill(l.stage || 'Researched') + '</td><td data-l="Owner">' + esc(l.owner || '') + '</td><td class="sm full ls-next" data-l="Next action">' + esc(l.nextAction || '') + '</td><td data-l="Due">' + (l.nextActionDate ? '<span class="ls-due ' + (isActive(l) ? dueClass(l.nextActionDate) : '') + '">' + esc(fdate(l.nextActionDate)) + '</span>' : '') + '</td><td class="n" data-l="Fleet">' + esc(l.fleet || '') + '</td><td class="n" data-l="Pilots">' + (e ? e.pilots + (e.est ? '<span class="sm"> est.</span>' : '') : '') + '</td><td data-l="Tier">' + (e ? esc(e.tier) : '') + '</td><td class="n" data-l="Yearly licence">' + (e ? money(e.year) : '') + '</td></tr>'; }).join('');
    return h + '</tbody></table></div>';
  }
  /* ---------- add an airline: pick one already in the portal, or add a new one ---------- */
  function addPanel() {
    const A = view.add; if (!A) return '';
    const seg = '<div class="ls-seg" role="group" aria-label="How to add">' + [['portal', 'From the portal'], ['new', 'New airline']].map(([k, l]) => '<button type="button" data-act="add-mode" data-v="' + k + '" aria-pressed="' + (A.mode === k) + '">' + l + '</button>').join('') + '</div>';
    let h = '<div class="ls-panel ls-add" id="ls-add"><div class="ls-ph"><div><h3>Add an airline</h3><p class="sub">Pick one that is already in the portal (Finance and Markets), or add a new one.</p></div><button class="btn small ghost" data-act="add-close">Close</button></div>' + seg;
    const all = finState && Array.isArray(finState.airlines) ? finState.airlines : null;
    if (A.mode === 'new') {
      const nm = norm(A.name), inL = nm && data.leads.find(l => norm(l.name) === nm), inP = nm && all && all.find(a => norm(a.name) === nm);
      const known = [...new Set((all || []).map(a => a.country).concat(data.leads.map(l => l.country)).filter(Boolean))].sort();
      h += '<div class="ls-fgrid" style="margin-top:12px"><label>Airline name<input class="in" data-f="add:name" value="' + esc(A.name) + '" placeholder="e.g. Air Sinai" autocomplete="off"></label><label>Country<input class="in" list="ls-add-c" data-f="add:ncountry" value="' + esc(A.ncountry) + '" placeholder="e.g. Egypt"></label><label>Fleet (aircraft)<input class="in" type="number" inputmode="numeric" min="0" data-f="add:fleet" value="' + esc(A.fleet) + '"></label></div><datalist id="ls-add-c">' + known.map(c => '<option value="' + esc(c) + '">').join('') + '</datalist>';
      if (inL) h += '<div class="ls-banner warn"><span class="grow"><b>' + esc(inL.name) + '</b> is already in Leads.</span><a class="btn small" href="#lead/' + esc(inL.id) + '">Open it</a></div>';
      else if (inP) h += '<div class="ls-banner warn"><span class="grow"><b>' + esc(inP.name) + '</b> is already in the portal' + (inP.country ? ' (' + esc(inP.country) + ', ' + esc(inP.fleet || '?') + ' aircraft)' : '') + '. Add it from there to keep its fleet, source and Finance link.</span><button class="btn small cta" data-act="add-pick" data-v="' + esc(inP.id) + '">Add from the portal</button></div>';
      h += '<div class="ls-add-go"><button class="btn cta" data-act="add-new"' + (A.name.trim() && !inL ? '' : ' disabled') + '>Add new airline</button><span class="ls-note">A new airline is offered to Finance (Overview → Updates from Sales), so the portal keeps one list.</span></div>';
      return h + '</div>';
    }
    if (!all) {
      if (finError) return h + '<div class="ls-banner warn"><span class="grow">Could not read the airlines in the portal: ' + esc(finError) + '</span><button class="btn small" data-act="fin-reload">Try again</button></div></div>';
      if (!finLoading) setTimeout(() => loadFin(true), 0);
      return h + '<p class="ls-note"><span class="spin" aria-hidden="true"></span> Reading the airlines in the portal…</p></div>';
    }
    const cs = [...new Set(all.map(a => a.country).filter(Boolean))].sort().map(c => [c, c + ' (' + all.filter(a => a.country === c).length + ')']);
    const q = norm(A.q), list = all.filter(a => (!A.country || a.country === A.country) && (!q || norm(a.name).includes(q)))
      .sort((a, b) => (inLeads(a) ? 1 : 0) - (inLeads(b) ? 1 : 0) || num(b.fleet) - num(a.fleet) || String(a.name).localeCompare(String(b.name)));
    const fresh = list.filter(a => !inLeads(a)).length;
    h += '<div class="ls-toolbar" style="margin:12px 0 8px"><input class="in ls-search" type="search" data-f="add:q" aria-label="Search the airlines in the portal" placeholder="Search ' + all.length + ' airlines by name" value="' + esc(A.q) + '" autocomplete="off">' + sel('add:country', cs, A.country, 'All countries', 'Country') + '<span class="sm">' + list.length + ' found · ' + fresh + ' not in Leads yet</span></div>';
    if (!list.length) return h + '<div class="ls-empty">No airline in the portal matches. <a class="linkish" data-act="add-mode" data-v="new">Add it as a new airline</a>.</div></div>';
    const shown = list.slice(0, 40);
    h += '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Airline</th><th>Country</th><th class="n">Fleet</th><th>In Finance</th><th></th></tr></thead><tbody>' + shown.map(a => {
      const have = inLeads(a), r = regionName(a.country);
