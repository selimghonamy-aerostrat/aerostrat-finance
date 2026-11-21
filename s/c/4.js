      return '<tr><td class="full"><span class="nm">' + esc(a.name) + '</span>' + (researchFor(a.name) && !have ? '<div class="sm">Playbook research will be added</div>' : '') + '</td><td data-l="Country">' + esc(a.country || '—') + (r ? '<div class="sm">' + esc(r) + '</div>' : '') + '</td><td class="n" data-l="Fleet">' + esc(a.fleet || '') + '</td><td class="sm" data-l="In Finance">' + esc(a.status || 'Pipeline') + '</td><td class="ls-rm">' + (have ? '<a class="btn small ghost" href="#lead/' + esc(have.id) + '">In Leads · open</a>' : '<button class="btn small cta" data-act="add-pick" data-v="' + esc(a.id) + '">Add to Leads</button>') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
    if (list.length > shown.length) h += '<p class="ls-note">Showing ' + shown.length + ' of ' + list.length + '. Type a name or pick a country to narrow the list.</p>';
    return h + '</div>';
  }
  function boardView(rows) {
    const cols = FUNNEL.map(s => [s, rows.filter(l => (l.stage || 'Researched') === s)]);
    const out = rows.filter(l => !FUNNEL.includes(l.stage || 'Researched'));
    let h = '<div class="ls-board" tabindex="0" aria-label="Leads by stage">' + cols.map(([s, list]) => '<section class="ls-col"><header><span>' + pill(s) + '</span><span class="sm">' + list.length + (list.length ? ' · ' + moneyK(list.reduce((t, l) => t + arrOf(l), 0)) : '') + '</span></header>' + (list.length ? list.map(l => { const e = econ(l), nx = nextStage(l.stage); return '<article class="ls-card" data-open="' + esc(l.id) + '"><a class="nm ls-name" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a><div class="sm">' + esc([l.country, l.wave, l.owner].filter(Boolean).join(' · ')) + '</div>' + (l.nextActionDate ? '<div class="sm">Next: <span class="ls-due ' + dueClass(l.nextActionDate) + '">' + esc(fdate(l.nextActionDate)) + '</span></div>' : '') + '<div class="ls-card-f"><span>' + (e ? moneyK(e.year) + '/yr' : '') + ' ' + coldChip(l) + '</span>' + (nx ? '<button class="ls-mv" data-act="advance" data-id="' + esc(l.id) + '" title="Move to ' + esc(nx) + '" aria-label="Move ' + esc(l.name) + ' to ' + esc(nx) + '">' + esc(nx) + ' ›</button>' : '') + '</div></article>'; }).join('') : '<div class="ls-col-empty">None</div>') + '</section>').join('') + '</div>';
    if (out.length) h += '<p class="ls-note">Not on the board: ' + out.map(l => '<a class="linkish" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a> (' + esc(l.stage) + ')').join(', ') + '</p>';
    return h;
  }

  /* ---------- one lead ---------- */
  function stepper(l) {
    const cur = STAGES.indexOf(l.stage || 'Researched'), side = cur > I_ONB;
    return '<nav class="ls-steps" aria-label="Sales stage">' + FUNNEL.map((s, i) => { const d = (l.dates || {})[STAGE_DATE[s]]; const cls = !side && i < cur ? 'done' : !side && i === cur ? 'cur' : ''; return '<button type="button" class="ls-step ' + cls + '" data-act="set-stage" data-id="' + esc(l.id) + '" data-v="' + esc(s) + '"' + (cls === 'cur' ? ' aria-current="step"' : '') + '><span class="ls-step-n">' + (cls === 'done' ? '✓' : i + 1) + '</span><span class="ls-step-t">' + esc(s) + '</span><small>' + (d ? esc(fdate(d)) : '&nbsp;') + '</small></button>'; }).join('') + '</nav>';
  }
  function nextPanel(l) {
    const st = l.stage || 'Researched', s = STEP[st], nx = nextStage(st);
    if (!isOpen(l) && st !== 'Onboarded') return '<div class="ls-next-box muted-box"><b>' + esc(st) + '.</b> ' + (st === 'Lost' ? 'Log the reason in Sales status. ' : st === 'Nurture' ? 'One useful touch every 6–8 weeks. ' : '') + 'Pick a stage above to bring it back into the pipeline.</div>';
    let h = '<div class="ls-next-box"><div class="ls-next-t"><span class="k">Next step</span><p>' + esc(s ? s.do : '') + '</p>' + (s && s.gate ? '<p class="ls-gate"><b>Gate to move on:</b> ' + esc(s.gate) + '</p>' : '') + '</div><div class="ls-next-a">';
    (s && s.emails || []).forEach((k, n) => { const e = emailFor(l, k); if (!e) return; h += '<a class="btn' + (n ? ' ghost' : '') + '" href="' + esc(mailto(e)) + '">Open “' + esc(e.name) + '”</a><button class="btn ghost" data-act="copy-email" data-id="' + esc(l.id) + '" data-v="' + k + '" aria-label="Copy ' + esc(e.name) + '">Copy</button>'; });
    if (nx) h += '<button class="btn cta" data-act="advance" data-id="' + esc(l.id) + '">Done — move to ' + esc(nx) + '</button>';
    h += '</div>';
    if (s && s.emails && !((l.contacts || []).some(c => c.email))) h += '<p class="ls-note">Add a contact with an email address below so emails open addressed to them.</p>';
    if (s && s.emails && s.emails.some(k => ['intro', 'followup'].includes(k)) && (!data.settings.overviewVideoLink || !data.settings.demoClipLink || !data.settings.bookingLink)) h += '<p class="ls-note">Add the overview video, demo clip and booking links in <a class="linkish" data-act="tab" data-v="settings">Settings</a> so they fill in automatically.</p>';
    if (s && s.emails && s.emails.some(k => ['demoData', 'welcome'].includes(k)) && !l.driveLink) h += '<p class="ls-note">Add the airline’s shared-drive link under Airline so {DriveLink} fills in.</p>';
    return h + '</div>';
  }
  function checklists(l) {
    const i = STAGES.indexOf(l.stage || 'Researched'); if (i > I_ONB) return '';
    const groups = CHECKS.filter(g => i >= STAGES.indexOf(g.from) && (!g.to || i < STAGES.indexOf(g.to) || Object.keys(l.checks || {}).some(k => k.startsWith(g.key + '.')))); if (!groups.length) return '';
    return groups.map(g => { const done = g.items.filter(([k]) => (l.checks || {})[g.key + '.' + k]).length; return '<div class="ls-panel"><div class="ls-ph"><div><h3>' + esc(g.title) + '</h3><p class="sub">' + esc(g.sub) + '</p></div><span class="ls-prog' + (done === g.items.length ? ' full' : '') + '">' + done + ' of ' + g.items.length + '</span></div><ul class="ls-checks">' + g.items.map(([k, lab]) => { const d = (l.checks || {})[g.key + '.' + k]; return '<li><label><input type="checkbox" data-f="chk:' + esc(l.id) + ':' + g.key + '.' + k + '"' + (d ? ' checked' : '') + '><span>' + esc(lab) + '</span></label>' + (d ? '<span class="sm">' + esc(fdate(d)) + '</span>' : '') + '</li>'; }).join('') + '</ul></div>'; }).join('');
  }
  function financePanel(l) {
    let h = '<div class="ls-panel" id="finance"><div class="ls-ph"><div><h3>Finance and billing</h3><p class="sub">The same airline in Finance. Money is recorded there; this panel shows it.</p></div><a class="btn small ghost" href="/#actuals">Open Finance</a></div>';
    if (finLoading && !finState) return h + '<p class="ls-note">Reading Finance…</p></div>';
    if (!finState) return h + '<div class="ls-banner warn"><span class="grow">Finance could not be read' + (finError ? ': ' + esc(finError) : '') + '.</span><button class="btn small" data-act="fin-reload">Try again</button></div></div>';
    const a = finAir(l), opts = (finState.airlines || []).slice().sort((x, y) => ((x.country === l.country ? 0 : 1) - (y.country === l.country ? 0 : 1)) || String(x.name).localeCompare(String(y.name))).map(x => [x.id, x.name + (x.country ? ' · ' + x.country : '')]);
    h += '<div class="ls-fgrid"><label class="wide">Airline in Finance' + sel('lead:' + l.id + ':finId', [['__none', 'Not in Finance yet: offer to add it in Finance']].concat(opts), a ? a.id : (l.finNone ? '__none' : ''), '— pick the airline —') + '</label></div>';
    if (!a) return h + '<p class="ls-note">' + (l.finNone ? 'Finance will be offered to add this airline (Finance → Overview → Updates from Sales).' : 'Pick the airline so status, sign and go-live dates, contract terms and payments stay in step.') + '</p></div>';
    h += '<div class="ls-calc"><div>Status in Finance<b>' + esc(a.status || 'Pipeline') + '</b></div><div>Sign month<b>' + esc(a.signMonth ? fdate(a.signMonth) : '—') + '</b></div><div>Go-live month<b>' + esc(a.goLiveMonth ? fdate(a.goLiveMonth) : '—') + '</b></div><div>Implementation fee<b>' + feeChip(l) + '</b></div></div>';
    const ch = syncChanges(l, a);
    if (ch.length) h += '<div class="ls-banner"><span class="grow"><b>Waiting to be applied in Finance:</b> ' + ch.map(c => esc(c.lab) + ' ' + esc(c.from === '' ? '—' : c.from) + ' → ' + esc(c.to)).join(' · ') + '. A Finance user applies them from Finance → Overview → Updates from Sales, then saves.</span></div>';
    const inv = finInvoices(l);
    if (inv.length) h += '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Invoice</th><th>Kind</th><th>Issued</th><th>Due</th><th class="n">Amount</th><th>Status</th></tr></thead><tbody>' + inv.map(v => { const st = invSt(v); return '<tr><td class="nm full">' + esc(v.number || '') + '</td><td data-l="Kind">' + esc(v.kind || '') + '</td><td data-l="Issued">' + esc(fdate(v.issue)) + '</td><td data-l="Due">' + esc(fdate(v.due)) + '</td><td class="n" data-l="Amount">' + esc((v.currency && v.currency !== 'USD' ? v.currency + ' ' : '$') + Math.round(num(v.amount)).toLocaleString('en-US')) + '</td><td data-l="Status"><span class="ls-fee ' + (st === 'Paid' ? 'paid' : st === 'Overdue' ? 'over' : 'open') + '">' + st + (v.paidDate ? ' ' + esc(fdate(v.paidDate)) : '') + '</span></td></tr>'; }).join('') + '</tbody></table></div>';
    else h += '<p class="ls-note">No invoices in Finance for this airline yet.</p>';
    return h + '</div>';
  }
  function reqList(l, list, title, sub, prefix) {
    const R = l.req || {}, groups = [], rd = reqDone(l, list);
    list.forEach(x => { let g = groups.find(y => y.name === x[1]); if (!g) groups.push(g = { name: x[1], items: [] }); g.items.push(x); });
    let h = '<div class="ls-panel"><div class="ls-ph"><div><h3>' + esc(title) + '</h3><p class="sub">' + sub + '</p></div><span class="ls-prog' + (rd.done === rd.all ? ' full' : '') + '">' + rd.done + ' of ' + rd.all + ' required</span></div>';
    h += groups.map(g => { const gd = reqDone(l, g.items); return '<details class="ls-req"' + (gd.done < gd.all && gd.any ? ' open' : '') + '><summary><span class="grow">' + esc(g.name) + '</span>' + bar(gd.done, gd.all) + '</summary><ul class="ls-checks">' + g.items.map(x => { const r = R[x[0]]; return '<li><span class="ls-req-i"><b>' + esc(x[0]) + '</b> ' + esc(x[2]) + (x[3] !== 'Required' ? ' <span class="sm">(' + esc(x[3]) + ')</span>' : '') + '</span><span class="ls-req-s">' + (r ? '<span class="sm">' + esc(fdate(r.d)) + '</span>' : '') + sel('req:' + l.id + ':' + x[0], REQ_ST, r ? r.s : '', '—', x[0]) + '</span></li>'; }).join('') + '</ul></details>'; }).join('');
    return h + '</div>';
  }
  function reqPanels(l) {
    const i = STAGES.indexOf(l.stage || 'Researched'); if (i > I_ONB) return '';
    let h = '';
    if (i >= I_SIGNED) h += reqList(l, REQ_FULL, 'Implementation requirements (AS-ONB-02)', 'What the airline sends after signing and payment, the Training Director’s setup, and the go-live checks. Mark each item as it comes in.', 'full');
    if (i >= STAGES.indexOf('HQ discovery') && (i < I_SIGNED || reqDone(l, REQ_DEMO).any)) h += reqList(l, REQ_DEMO, 'Demo requirements (AS-ONB-01)', 'What the airline sends to build its own demo. No crew data at this stage.', 'demo');
    return h;
  }
  /* ---------- onboarding workspace ---------- */
  function onboardingView() {
    const L = data.leads, demo = L.filter(l => ['HQ discovery', 'Building demo', 'Demo presented'].includes(l.stage)), cust = L.filter(isCustomer);
    const by = st => cust.filter(l => l.stage === st).length;
    let h = head('Onboarding', 'Every airline from its demo to go-live: what has come in, what is missing, and whether it has paid.');
    h += '<div class="ls-kpis">' + kpi('Building demos', demo.length, 'HQ meeting to demo presented', 'lead') + kpi('Signed, awaiting payment', by('Signed'), 'Onboarding starts after payment', by('Signed') ? 'alert' : '') + kpi('In onboarding', by('Paid') + by('Implementation'), by('Paid') + ' paid · ' + by('Implementation') + ' implementing') + kpi('Onboarded', by('Onboarded'), 'live on AeroStrat Training') + '</div>';
    const S = REQ_FULL.filter(x => x[0][0] === 'S'), G = REQ_FULL.filter(x => x[0][0] === 'G'), AET = REQ_FULL.filter(x => 'AET'.includes(x[0][0]));
    h += '<div class="ls-panel"><h3>Customers</h3><p class="sub">Signed to onboarded. Onboarding starts once the implementation fee is paid in Finance.</p>';
    h += cust.length ? '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Airline</th><th>Stage</th><th>Fee</th><th>Requirements</th><th>Setup</th><th>Go-live checks</th><th>Go-live</th><th>Owner</th></tr></thead><tbody>' + cust.sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)).map(l => { const r1 = reqDone(l, AET), r2 = reqDone(l, S), r3 = reqDone(l, G); return '<tr data-open="' + esc(l.id) + '"><td class="full"><a class="nm ls-name" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a><div class="sm">' + esc(l.country || '') + '</div></td><td data-l="Stage">' + pill(l.stage) + '</td><td data-l="Fee">' + feeChip(l) + '</td><td data-l="Requirements">' + bar(r1.done, r1.all) + '</td><td data-l="Setup">' + bar(r2.done, r2.all) + '</td><td data-l="Go-live checks">' + bar(r3.done, r3.all) + '</td><td data-l="Go-live">' + esc(fdate((l.dates || {}).goLive || '')) + '</td><td data-l="Owner">' + esc(l.owner || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="ls-empty">No signed airlines yet.</div>';
    h += '</div><div class="ls-panel"><h3>Demos in progress</h3><p class="sub">The airline’s demo pack (AS-ONB-01) and the demo date.</p>';
    h += demo.length ? '<div class="ls-wrap"><table class="ls-table ls-cards c3"><thead><tr><th>Airline</th><th>Stage</th><th>Demo pack</th><th>Demo date</th><th>Next action</th><th>Owner</th></tr></thead><tbody>' + demo.map(l => { const r = reqDone(l, REQ_DEMO); return '<tr data-open="' + esc(l.id) + '"><td class="full"><a class="nm ls-name" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a><div class="sm">' + esc(l.country || '') + '</div></td><td data-l="Stage">' + pill(l.stage) + '</td><td data-l="Demo pack">' + bar(r.done, r.all) + '</td><td data-l="Demo date">' + esc(fdate((l.dates || {}).demoDate || '')) + '</td><td class="sm ls-next" data-l="Next action">' + esc(l.nextAction || '') + '</td><td data-l="Owner">' + esc(l.owner || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="ls-empty">No demos in progress.</div>';
    return h + '</div>';
  }
  const fbPill = t => '<span class="ls-pill fb-' + FB_TYPES.indexOf(t) + '">' + esc(t) + '</span>';
  function fbList(list, showLead) {
    if (!list.length) return '<div class="ls-empty">No feedback logged yet.</div>';
    return '<div class="ls-fb">' + list.map(f => { const l = data.leads.find(x => x.id === f.leadId); return '<div class="ls-fb-it' + (f.status === 'Open' && ['Objection', 'Question'].includes(f.type) ? ' open' : '') + '"><div class="ls-fb-h">' + fbPill(f.type) + '<span class="sm">' + esc(fdate(f.date)) + ' · ' + esc(f.where || '') + (f.from ? ' · ' + esc(f.from) : '') + '</span>' + (showLead && l ? '<a class="linkish nm" href="#lead/' + esc(l.id) + '">' + esc(l.name) + '</a>' : '') + '<span class="grow"></span>' + sel('fb:' + f.id + ':status', FB_STATUS, f.status || 'Open', null, 'Status') + '<button class="ls-del" data-act="del-fb" data-id="' + esc(f.id) + '" aria-label="Remove feedback">Remove</button></div><p class="ls-fb-t">' + esc(f.text) + '</p><input class="in" aria-label="Our response" data-f="fb:' + f.id + ':response" placeholder="Our response or promise" value="' + esc(f.response || '') + '"></div>'; }).join('') + '</div>';
  }
  function fbForm(leadId) {
    const n = view.fbN;
    return '<div class="ls-fbform">' + (leadId ? '' : sel('fbn:lead', data.leads.slice().sort((a, b) => a.name < b.name ? -1 : 1).map(l => [l.id, l.name]), n.lead || '', 'Airline…', 'Airline')) + '<input class="in" type="date" aria-label="Date" data-f="fbn:date" value="' + esc(n.date || today()) + '">' + sel('fbn:where', FB_WHERE, n.where || '', 'Where…', 'Where') + sel('fbn:type', FB_TYPES, n.type || '', 'Type…', 'Type') + '<input class="in" aria-label="From" data-f="fbn:from" placeholder="From (name, title)" value="' + esc(n.from || '') + '"><input class="in ls-wide" aria-label="What they said" data-f="fbn:text" placeholder="What they said, in their words" value="' + esc(n.text || '') + '"><button class="btn small cta" data-act="add-fb" data-id="' + esc(leadId || '') + '">Add feedback</button></div>';
  }
  function feedbackView() {
    const f = view.fbF, all = data.feedback.slice().sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1);
    const list = all.filter(x => (!f.lead || x.leadId === f.lead) && (!f.type || x.type === f.type) && (!f.status || x.status === f.status));
    const open = all.filter(x => x.status === 'Open').length, asks = all.filter(x => x.status === 'Open' && ['Objection', 'Question'].includes(x.type)).length, req = all.filter(x => x.type === 'Feature request' && x.status !== 'Done').length;
    let h = head('Feedback', all.length + ' entries · ' + open + ' open · ' + asks + ' objections or questions to answer · ' + req + ' feature requests');
    h += '<div class="ls-panel"><h3>Log feedback</h3><p class="sub">One entry per point. Answer every objection and question within 2 working days.</p>' + (data.leads.length ? fbForm('') : '<div class="ls-empty">Import or add an airline first.</div>') + '</div>';
    h += '<div class="ls-toolbar">' + sel('ff:lead', data.leads.slice().sort((a, b) => a.name < b.name ? -1 : 1).map(l => [l.id, l.name]), f.lead, 'All airlines', 'Airline') + sel('ff:type', FB_TYPES, f.type, 'All types', 'Type') + sel('ff:status', FB_STATUS, f.status, 'All statuses', 'Status') + '</div>';
    return h + '<div class="ls-panel">' + fbList(list, true) + '</div>';
  }
  function priceTable(l) {
    const e = econ(l);
    if (!e) return '<p class="ls-note">Add the fleet size or confirmed pilots to see the price.</p>';
    const per = e.bill !== 1 ? ' (' + (l.billing === 'monthly' ? '+' + price.monthly : '+' + price.quarterly) + '% for ' + l.billing + ' billing)' : '';
    const row = (lab, n, each, mo, note) => '<tr><td>' + lab + (note ? '<div class="sm">' + note + '</div>' : '') + '</td><td class="n">' + n + '</td><td class="n">' + money2(each) + '</td><td class="n">' + money(mo) + '</td><td class="n">' + money(mo * 12) + '</td></tr>';
    let rows = row('Pilots · ' + esc(e.tier), e.pilots + (e.est ? ' <span class="sm">est.</span>' : ''), e.each.pilots, e.m.pilots, e.est ? 'fleet × ' + price.ratios.pilotsPerAircraft + ' per aircraft' : '');
    rows += e.S.instructor ? row('Instructors / examiners', Math.round(e.instr) + (isSet(l.instructors) ? '' : ' <span class="sm">est.</span>'), e.each.instructors, e.m.instructors, isSet(l.instructors) ? '' : price.ratios.instructorsPerAircraft + ' per aircraft') : '';
    rows += e.S.admin ? row('Admins', e.admins + (isSet(l.admins) ? '' : ' <span class="sm">est.</span>'), e.each.admin, e.m.admin, isSet(l.admins) ? '' : price.ratios.adminsPerAirline + ' per airline') : '';
    rows += e.cabinOn ? row('Cabin crew', e.cabin + (isSet(l.cabin) ? '' : ' <span class="sm">est.</span>'), e.each.cabin, e.m.cabin, isSet(l.cabin) ? '' : price.ratios.cabinPerAircraft + ' per aircraft') : '';
    const mrow = (lab, n, each, mo) => '<li><span class="t">' + lab + '</span><span class="c">' + n + ' × ' + money2(each) + '</span><b>' + money(mo) + '<small>/mo</small></b></li>';
    const mlist = '<ul class="ls-price-m">' + mrow('Pilots · ' + esc(e.tier), e.pilots, e.each.pilots, e.m.pilots) + (e.S.instructor ? mrow('Instructors', Math.round(e.instr), e.each.instructors, e.m.instructors) : '') + (e.S.admin ? mrow('Admins', e.admins, e.each.admin, e.m.admin) : '') + (e.cabinOn ? mrow('Cabin crew', e.cabin, e.each.cabin, e.m.cabin) : '') + '<li class="tot"><span class="t">Licence' + esc(per) + '</span><b>' + money(e.month) + '<small>/mo</small> · ' + money(e.year) + '<small>/yr</small></b></li><li class="tot"><span class="t">Implementation (one-time)</span><b>' + money(e.impl) + '</b></li><li class="tot big"><span class="t">First year</span><b>' + money(e.year + e.impl) + '</b></li></ul>';
    return mlist + '<div class="ls-wrap ls-price"><table class="ls-table"><thead><tr><th>' + esc(e.P.name) + '</th><th class="n">People</th><th class="n">Per person / month</th><th class="n">Per month</th><th class="n">Per year</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr><td>Licence' + esc(per) + (e.adj ? '<div class="sm">' + (e.adj > 0 ? '+' : '') + e.adj + '% price adjustment for ' + esc(l.country) + '</div>' : '') + (num(l.discount) ? '<div class="sm">' + num(l.discount) + '% discount</div>' : '') + '</td><td></td><td></td><td class="n">' + money(e.month) + '</td><td class="n">' + money(e.year) + '</td></tr><tr><td>Implementation (one-time)</td><td></td><td></td><td></td><td class="n">' + money(e.impl) + '</td></tr><tr class="ls-total"><td>First year</td><td></td><td></td><td></td><td class="n">' + money(e.year + e.impl) + '</td></tr></tfoot></table></div>' +
      '<p class="ls-note">Prices ' + (priceSrc === 'finance' ? 'from Finance → Pricing' : priceSrc === 'saved' ? 'saved from Finance ' + esc(fdate(price.at)) : 'not read from Finance yet') + '. Weighted value at this stage: ' + money(e.year * probOf(l) / 100) + ' (' + probOf(l) + '% chance).</p>';
  }
  function leadView() {
    const l = data.leads.find(x => x.id === view.lead);
    if (!l) return '<div class="ls-crumbs"><a data-act="tab" data-v="leads">← Leads</a></div><div class="ls-panel ls-empty">This airline is not in Leads any more.</div>';
    const F = k => 'lead:' + l.id + ':' + k, inp = (k, ph, type, extra) => '<input class="in" data-f="' + F(k) + '" type="' + (type || 'text') + '"' + (type === 'number' ? ' inputmode="decimal"' : '') + ' value="' + esc(l[k] == null ? '' : l[k]) + '" placeholder="' + esc(ph || '') + '"' + (extra || '') + '>';
    const P = productFor(l), e = econ(l), S = (P && P.seats) || {};
    let h = '<div class="ls-crumbs"><a data-act="tab" data-v="leads">← Leads</a><span class="muted">/ ' + esc(l.country || '') + '</span></div>';
    h += '<div class="ls-title"><h2>' + esc(l.name) + '</h2>' + pill(l.stage || 'Researched') + ppill(l.priority) + (l.wave ? '<span class="ls-pill">' + esc(l.wave) + '</span>' : '') + coldChip(l) + '<span class="spacer"></span>' + (e ? '<span class="ls-title-v">' + money(e.year) + '<small> / year</small></span>' : '') + '</div>';
    h += stepper(l) + nextPanel(l);
    h += '<div class="ls-panel"><h3>Sales status</h3><p class="sub">Who owns it and what happens next</p><div class="ls-fgrid">' +
