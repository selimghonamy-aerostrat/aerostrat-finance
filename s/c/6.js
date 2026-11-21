    const q = v => { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const txt = [cols.map(c => q(c[0])).join(',')].concat(data.leads.map(l => cols.map(c => q(c[1](l))).join(','))).join('\n');
    const u = URL.createObjectURL(new Blob([String.fromCharCode(65279) + txt], { type: 'text/csv' })), a = document.createElement('a'); a.href = u; a.download = 'aerostrat-leads-' + today() + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  }

  /* ---------- events ---------- */
  function setField(f, v, el) {
    const p = f.split(':');
    if (p[0] === 'f') { view.f[p[1]] = v; return 'render'; }
    if (p[0] === 'af') { view.actF[p[1]] = v; return 'render'; }
    if (p[0] === 'new') { const m = { lead: 'newLead', channel: 'newChannel', date: 'date', text: 'text', next: 'next' }; view.actF[m[p[1]]] = v; return ''; }
    if (p[0] === 'add') { if (!view.add) return ''; view.add[p[1]] = v; return ['q', 'country', 'name'].includes(p[1]) ? 'render' : ''; }
    if (p[0] === 'imp') { if (p[1] === 'country') { view.imp.country = v; view.imp.picked = {}; return 'render'; } if (p[1] === 'pick') { view.imp.picked[p.slice(2).join(':')] = el.checked; return 'render'; } }
    if (p[0] === 'set') { data.settings[p[1]] = v; touch(); return ''; }
    if (p[0] === 'tpl') { data.templates[p[1]][p[2]] = v; touch(); return ''; }
    if (p[0] === 'ff') { view.fbF[p[1]] = v; return 'render'; }
    if (p[0] === 'fbn') { view.fbN[p[1]] = v; return ''; }
    if (p[0] === 'fb') { const f = data.feedback.find(x => x.id === p[1]); if (!f) return ''; f[p[2]] = v; touch(); return p[2] === 'status' ? 'calc' : ''; }
    if (p[0] === 'prob') { data.settings.prob[p.slice(1).join(':')] = Math.max(0, Math.min(100, num(v))); touch(); return 'calc'; }
    const l = data.leads.find(x => x.id === p[1]); if (!l) return '';
    if (p[0] === 'lead') {
      const k = p[2];
      if (k === 'finId' && v === '__none') { l.finId = ''; l.finNone = true; touch(); return 'calc'; }
      if (k === 'finId') l.finNone = false;
      if (k === 'stage') { const g = gateBlock(l, v); if (g) { toast(g); return 'calc'; } setStage(l, v, false); }
      else if (k === 'cabinOn') l.cabinOn = !!v;
      else l[k] = v;
      touch();
      return ['stage', 'wave', 'priority', 'owner', 'fleet', 'pilotsConfirmed', 'nextActionDate', 'name', 'product', 'billing', 'instructors', 'admins', 'cabin', 'cabinOn', 'discount', 'implOverride', 'country', 'route', 'lostReason', 'finId'].includes(k) ? 'calc' : '';
    }
    if (p[0] === 'req') { l.req = l.req || {}; if (v) l.req[p[2]] = { s: v, d: today() }; else delete l.req[p[2]]; touch(); return 'calc'; }
    if (p[0] === 'chk') { l.checks = l.checks || {}; if (v) l.checks[p[2]] = today(); else delete l.checks[p[2]]; touch(); return 'calc'; }
    if (p[0] === 'contact') { l.contacts[+p[2]][p[3]] = v; touch(); return ''; }
    if (p[0] === 'date') { l.dates = l.dates || {}; l.dates[p[2]] = v; touch(); return ''; }
    return '';
  }
  function onField(e, isChange) {
    const el = e.target.closest('[data-f]'); if (!el) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    const r = setField(el.dataset.f, v, el);
    if (r === 'render' && (isChange || ['f:q', 'add:q', 'add:name'].includes(el.dataset.f))) render();
    else if (r === 'calc' && isChange) render();
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (er) {} ta.remove(); return ok;
    }
  }
  async function onClick(e) {
    const o = e.target.closest('[data-open]'); if (o && !e.target.closest('input,select,button,a,textarea')) { go('lead', o.dataset.open); return; }
    const ol = e.target.closest('[data-open-l]'); if (ol) { e.preventDefault(); go('lead', ol.dataset.openL); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act, id = b.dataset.id;
    if (a === 'tab') { e.preventDefault(); go(b.dataset.v); }
    else if (a === 'save') save(false);
    else if (a === 'force-save') save(true);
    else if (a === 'discard') { if (!confirmLeave('Discard your unsaved changes?')) return; dropDraft(); dirty = false; loading = true; render(); await load(); render(); }
    else if (a === 'load-theirs') { data = fix(conflict.data); base = conflict.savedAt; conflict = null; dirty = false; dropDraft(); usePrice(); render(); }
    else if (a === 'draft-load') { data = fix(staleDraft.data); staleDraft = null; dirty = true; keepDraft(); render(); }
    else if (a === 'draft-drop') { staleDraft = null; dropDraft(); render(); }
    else if (a === 'mode') { view.mode = b.dataset.v; try { localStorage.setItem('aerostrat-sales-mode', view.mode); } catch (er) {} render(); }
    else if (a === 'clear-f') { view.f = { q: '', country: '', wave: '', stage: '', owner: '' }; render(); }
    else if (a === 'stage-filter') { view.f = { q: '', country: '', wave: '', stage: b.dataset.v, owner: '' }; view.mode = 'list'; go('leads'); }
    else if (a === 'set-stage' || a === 'advance') {
      const l = data.leads.find(x => x.id === id); if (!l) return;
      const st = a === 'advance' ? nextStage(l.stage) : b.dataset.v; if (!st || st === (l.stage || 'Researched')) return;
      const g = gateBlock(l, st); if (g) { toast(g); return; }
      setStage(l, st, true); touch(); toast(l.name + ' → ' + st + '. Next step and follow-up date updated.'); render();
    }
    else if (a === 'copy-email') { const l = data.leads.find(x => x.id === id); const m = l && emailFor(l, b.dataset.v); if (m && await copyText('Subject: ' + m.subject + '\n\n' + m.body)) toast('Email copied. Paste it into your mail app.'); else toast('Could not copy.'); }
    else if (a === 'tpl') { view.tpl = b.dataset.v; render(); }
    else if (a === 'tpl-reset') { const k = b.dataset.v; if (!confirmLeave('Replace this email text with the SOP version?')) return; data.templates[k] = JSON.parse(JSON.stringify(TEMPLATES[k])); touch(); render(); }
    else if (a === 'add-lead') { view.add = { mode: 'portal', q: '', country: view.f.country || '', name: '', ncountry: view.f.country || '', fleet: '' }; if (!finState && !finLoading) loadFin(true); if (view.tab !== 'leads') go('leads'); else render(); setTimeout(() => { const s = $('#ls-add'); if (s) { if (s.scrollIntoView) s.scrollIntoView({ block: 'start', behavior: 'smooth' }); const i = s.querySelector('input'); if (i) i.focus({ preventScroll: true }); } }, 30); }
    else if (a === 'add-mode') { if (view.add) { view.add.mode = b.dataset.v; render(); const i = $('#ls-add input'); if (i) i.focus({ preventScroll: true }); } }
    else if (a === 'add-close') { view.add = null; render(); }
    else if (a === 'add-pick') {
      const f = finState && (finState.airlines || []).find(x => x.id === b.dataset.v); if (!f) return;
      const have = inLeads(f); if (have) { view.add = null; go('lead', have.id); return; }
      const l = fromFin(f); data.leads.push(l); view.add = null; touch(); toast(l.name + ' added to Leads from the portal. Save to keep it.'); go('lead', l.id);
    }
    else if (a === 'add-new') {
      const A = view.add || {}, name = String(A.name || '').trim(); if (!name) { toast('Type the airline name first.'); return; }
      const dup = data.leads.find(l => norm(l.name) === norm(name)); if (dup) { toast(dup.name + ' is already in Leads.'); go('lead', dup.id); return; }
      const country = String(A.ncountry || '').trim();
      const l = { id: nid(), name, country, region: regionName(country), fleet: num(A.fleet) > 0 ? Math.round(num(A.fleet)) : '', product: 'bundle', billing: 'annual', stage: 'Researched', nextAction: STEP.Researched.do, contacts: [], dates: {}, finNone: true, createdAt: new Date().toISOString() };
      data.leads.push(l); view.add = null; touch(); toast(name + ' added. Save to keep it.'); go('lead', l.id);
    }
    else if (a === 'del-lead') { const l = data.leads.find(x => x.id === id); if (!l || !confirmLeave('Remove ' + l.name + ' and its activity from Leads? Finance is not affected. You can Discard before saving to undo.')) return; data.leads = data.leads.filter(x => x.id !== id); data.activity = data.activity.filter(x => x.leadId !== id); data.feedback = data.feedback.filter(x => x.leadId !== id); touch(); go('leads'); }
    else if (a === 'add-contact') { const l = data.leads.find(x => x.id === id); l.contacts.push({ name: '', title: '', email: '', linkedin: '', phone: '' }); touch(); render(); }
    else if (a === 'del-contact') { const l = data.leads.find(x => x.id === id); l.contacts.splice(+b.dataset.i, 1); touch(); render(); }
    else if (a === 'add-act') {
      const lid = id || view.actF.newLead; const txt = (view.actF.text || '').trim();
      if (!lid) { toast('Pick the airline first.'); return; } if (!txt) { toast('Write what happened first.'); return; }
      data.activity.push({ id: nid('a'), leadId: lid, date: view.actF.date || today(), channel: view.actF.newChannel || 'Email', text: txt, next: (view.actF.next || '').trim(), by: auth ? auth.name : '' });
      if (view.actF.next) { const l = data.leads.find(x => x.id === lid); if (l) l.nextAction = view.actF.next.trim(); }
      view.actF.text = ''; view.actF.next = ''; touch(); render();
    }
    else if (a === 'add-fb') {
      const n = view.fbN, lid = id || n.lead, txt = (n.text || '').trim();
      if (!lid) { toast('Pick the airline first.'); return; } if (!n.type) { toast('Pick the type of feedback.'); return; } if (!txt) { toast('Write what they said first.'); return; }
      data.feedback.push({ id: nid('f'), leadId: lid, date: n.date || today(), where: n.where || '', type: n.type, from: (n.from || '').trim(), text: txt, response: '', status: 'Open', by: auth ? auth.name : '' });
      view.fbN = { lead: id ? '' : n.lead, where: n.where, date: n.date }; touch(); toast('Feedback logged.'); render();
    }
    else if (a === 'del-fb') { if (!confirmLeave('Remove this feedback entry?')) return; data.feedback = data.feedback.filter(x => x.id !== id); touch(); render(); }
    else if (a === 'del-act') { data.activity = data.activity.filter(x => x.id !== id); touch(); render(); }
    else if (a === 'csv') csv();
    else if (a === 'fin-reload') { finState = null; finError = ''; await loadFin(false); if (finError) toast('Could not read Finance: ' + finError); else if (priceSrc === 'finance') toast('Prices read from Finance.'); }
    else if (a === 'imp-all') { (finState.airlines || []).filter(x => x.country === view.imp.country && !inLeads(x)).forEach(x => view.imp.picked[x.id || x.name] = true); render(); }
    else if (a === 'imp-go') {
      const add = (finState.airlines || []).filter(x => x.country === view.imp.country && !inLeads(x) && view.imp.picked[x.id || x.name]).map(fromFin);
      data.leads = data.leads.concat(add); view.imp.picked = {}; touch(); toast(add.length + ' airline' + (add.length === 1 ? '' : 's') + ' imported. Click Save to keep them.'); render();
    }
    else if (a === 'imp-refresh') {
      let n = 0; (finState.airlines || []).filter(x => x.country === view.imp.country).forEach(x => { const l = inLeads(x); if (!l) return; const s = parseSrc(x.notes); if (num(x.fleet) && num(x.fleet) !== num(l.fleet) || (s.url && s.url !== l.fleetSource)) { if (num(x.fleet)) l.fleet = num(x.fleet); if (s.url) { l.fleetSource = s.url; l.fleetAsOf = s.asOf; } n++; } });
      if (n) touch(); toast(n ? n + ' updated from Finance. Click Save to keep it.' : 'Already the same as Finance.'); render();
    }
  }
  const confirmLeave = m => window.confirm(m);

  /* ---------- start ---------- */
  async function start() {
    try { const lg = await fetch('/logos.json').then(r => r.json()); logo = lg.white || ''; } catch (e) {}
    fromHash(); render();
    const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'fab-save49'; fab.textContent = 'Save changes'; fab.hidden = true; document.body.appendChild(fab);
    fab.addEventListener('click', () => save(false));
    const upd = () => { const bar = $('.bar'); fab.hidden = !(dirty && !busy && bar && bar.getBoundingClientRect().bottom < 0); };
    window.addEventListener('scroll', upd, { passive: true }); setInterval(upd, 700);
    const out = document.createElement('button'); out.className = 'signout'; out.textContent = 'Sign out'; out.onclick = () => { if (dirty && !confirmLeave('You have unsaved changes. Sign out anyway?')) return; dirty = false; try { localStorage.removeItem(LS); } catch (e) {} location.reload(); }; document.body.appendChild(out);
    try { await load(); } catch (e) { if (String(e.message) === 'signed out') return; loading = false; data = fix(null); toast('Could not load leads: ' + e.message); }
    render();
    loadFin(true);
  }
  ((f) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f) : f())(() => {
    const login = $('#login'), f = $('#loginForm'), msg = $('#loginMsg');
    fetch('/logos.json').then(r => r.json()).then(l => { $('#lgLogo').src = l.white; }).catch(() => {});
    document.addEventListener('click', onClick);
    document.addEventListener('input', e => onField(e, false));
    document.addEventListener('change', e => onField(e, true));
    window.addEventListener('hashchange', () => { fromHash(); if (data) render(); });
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    if (auth && auth.key) { login.remove(); start(); }
    else login.hidden = false;
    f.addEventListener('submit', async e => {
      e.preventDefault(); msg.textContent = 'Checking…';
      auth = { name: f.name.value.trim(), key: f.pw.value };
      try {
        const r = await fetch('/api/db?auth', { headers: { 'x-app-key': auth.key, 'x-app-user': auth.name } });
        if (r.status === 401) { msg.textContent = 'Wrong username or password.'; auth = null; return; }
        if (!r.ok) throw 0;
        try { localStorage.setItem(LS, JSON.stringify(auth)); } catch (err) {}
        login.remove(); start();
      } catch (err) { msg.textContent = 'Couldn’t reach the server. Try again.'; }
    });
  });
})();
