
  /* ---------- Growth: fields (data-f) ---------- */
  function growthField(p, v, el, isChange) {
    const G = view.g, k0 = p[0];
    if (k0 === 'gof') { G.o[p[1]] = p[1] === 'state' ? !!v : v; G.sel = {}; return 'render'; }
    if (k0 === 'gcf') { G.c[p[1]] = v; return 'render'; }
    if (k0 === 'gw') { const d = +p[1], W = gWeekend().filter(x => x !== d); if (v) W.push(d); data.settings.weekend = W.sort(); touch(); return 'calc'; }
    if (k0 === 'gx') {
      const k = p[1];
      if (k === 'sel') { if (v) G.sel[p[2]] = true; else delete G.sel[p[2]]; return isChange ? 'calc' : ''; }
      if (k === 'selall') { gRows().forEach(r => { if (v) G.sel[r.id] = true; else delete G.sel[r.id]; }); return 'calc'; }
      if (k === 'bowner' && v) { let n = 0; data.outreach.forEach(r => { if (G.sel[r.id] && !gPromoted(r)) { r.owner = v; r.updated_at = gNow(); n++; } }); touch(); toast('Owner set to ' + v + ' on ' + n + ' rows.'); return 'calc'; }
      if (k === 'bweek') { if (!isChange || !gDateOk(v)) return ''; let n = 0; data.outreach.forEach(r => { if (G.sel[r.id] && !gPromoted(r)) { r.planned_week = v; r.updated_at = gNow(); n++; } }); touch(); toast('Planned week set on ' + n + ' rows.'); return 'calc'; }
      if (k === 'tplrow') { G.tplRow = v; return 'calc'; }
      if (k === 'csv') {
        const file = isChange && el.files && el.files[0]; if (!file) return '';
        if (file.size > 2e6) { toast('That file is too large (2 MB at most).'); el.value = ''; return ''; }
        const fr = new FileReader(); fr.onload = () => { G.imp = Object.assign({ name: file.name }, gImpParse(fr.result)); G.add = null; render(); }; fr.onerror = () => toast('Could not read that file.'); fr.readAsText(file); return '';
      }
      if (G.add && ['afin', 'aname', 'acountry', 'aac', 'aweek'].includes(k)) { G.add[{ afin: 'fin', aname: 'name', acountry: 'country', aac: 'ac', aweek: 'week' }[k]] = v; return k === 'afin' ? 'calc' : (k === 'aname' || k === 'acountry') ? 'live' : ''; }
      return '';
    }
    if (k0 === 'go') {
      const r = gFind('outreach', p[1]); if (!r || gPromoted(r)) return ''; const k = p[2];
      if (k === 'airline' || k === 'country') {
        if (!isChange) return '';
        const name = k === 'airline' ? v.trim() : r.airline, country = k === 'country' ? v.trim() : r.country;
        if (!name) { toast('The airline name cannot be empty.'); return 'calc'; }
        const d = gDup(name, country, r.id); if (d) { toast(d.airline + ' (' + (d.country || '—') + ') is already in outreach. One row per airline.'); return 'calc'; }
        r[k] = k === 'airline' ? name : country; if (k === 'country' && !r.region) r.region = gRegion(country);
      } else if (k === 'linked_airline_id') {
        if (v === '__none') { r.linked_airline_id = ''; r.fin_none = true; }
        else {
          const a = (finState.airlines || []).find(x => x.id === v); if (!a) return '';
          const d = data.outreach.find(x => x.id !== r.id && (x.linked_airline_id === a.id || gKey(x.airline, x.country) === gKey(a.name, a.country)));
          if (d) { toast(d.airline + ' is already in outreach and linked to this Finance airline.'); return 'calc'; }
          r.linked_airline_id = a.id; r.fin_none = false; r.airline = a.name; r.country = a.country || r.country; if (!r.aircraft) r.aircraft = num(a.fleet) || '';
        }
      } else if (k === 'status') gSetStatus(r, v);
      else if (k === 'touch_count' || k === 'aircraft') r[k] = v === '' ? '' : Math.max(0, Math.round(num(v)));
      else r[k] = v;
      r.updated_at = gNow(); touch();
      return ['status', 'owner', 'ownership', 'contact_source', 'email_verified', 'planned_week', 'next_follow_up_date', 'linked_airline_id', 'airline', 'country', 'region'].includes(k) || (k === 'contact_email' && isChange) ? 'calc' : '';
    }
    if (k0 === 'gc') {
      const c = gFind('conferences', p[1]); if (!c) return ''; const k = p[2];
      if (k === 'budget') c.budget = v === '' ? '' : Math.max(0, num(v)); else c[k] = v;
      if (k === 'start_date' && v && (!c.end_date || c.end_date < v)) c.end_date = v;
      touch(); return ['tier', 'decision', 'route', 'status', 'start_date', 'end_date'].includes(k) || (isChange && ['link', 'name', 'budget', 'place'].includes(k)) ? 'calc' : '';
    }
    if (k0 === 'gp') { const c = gFind('conferences', p[1]), q = c && c.people[+p[2]]; if (!q) return ''; q[p[3]] = v; touch(); return isChange && p[3] === 'email' ? 'calc' : ''; }
    if (k0 === 'gch') { const c = gFind('channels', p[1]); if (!c) return ''; c[p[2]] = p[2] === 'target' ? (v === '' ? '' : Math.max(0, Math.round(num(v)))) : v; touch(); return ['priority', 'owner', 'status'].includes(p[2]) || (isChange && p[2] === 'name') ? 'calc' : ''; }
    if (k0 === 'gs') { const c = gFind('channels', p[1]), s = c && c.steps[+p[2]]; if (!s) return ''; s[p[3]] = p[3] === 'done' ? (v ? today() : '') : v; touch(); return p[3] === 'text' ? '' : 'calc'; }
    if (k0 === 'gst') { const s = gFind('strategies', p[1]); if (!s) return ''; s[p[2]] = v; touch(); return ['rating'].includes(p[2]) || (isChange && p[2] === 'source') ? 'calc' : ''; }
    if (k0 === 'gss') { const s = gFind('strategies', p[1]); if (!s) return ''; s.steps[+p[2]] = v; touch(); return ''; }
    if (k0 === 'gt') { const T = data.growthTemplates.find(x => x.id === p[1]); if (!T) return ''; T[p[2]] = v; touch(); return isChange ? 'calc' : ''; }
    if (k0 === 'ms') { const l = data.leads.find(x => x.id === p[1]); if (!l) return ''; l.milestones = l.milestones || {}; const m = l.milestones[p[2]] = l.milestones[p[2]] || { done: '', owner: '', date: '' }; m[p[3]] = p[3] === 'done' ? (v ? today() : '') : v; touch(); return 'calc'; }
    return '';
  }

  /* ---------- Growth: clicks (data-act="g-…") ---------- */
  function gColl(k) { return { out: 'outreach', conf: 'conferences', chan: 'channels', strat: 'strategies' }[k]; }
  const G_KPAGE = { out: 'outreach', conf: 'conferences', chan: 'channels', strat: 'strategy' };
  function gGo(page) { view.tab = 'growth'; view.g.page = page; view.g.open = null; view.lead = null; if (location.hash !== '#growth/' + page) location.hash = 'growth/' + page; window.scrollTo(0, 0); render(); }
  async function growthClick(a, b, e) {
    const G = view.g, id = b.dataset.id;
    if (a === 'g-page') { e.preventDefault(); gGo(b.dataset.v); return; }
    if (a === 'g-open') {
      if (e.target !== b && e.target.closest('input,select,textarea,label,a:not([data-act]),button:not([data-act="g-open"])')) return;
      e.preventDefault();
      if (view.tab !== 'growth') { view.tab = 'growth'; view.lead = null; G.page = G_KPAGE[b.dataset.k] || G.page; location.hash = 'growth/' + G.page; }
      G.open = { k: b.dataset.k, id }; render(); setTimeout(() => { const d = $('.gr-drawer .in'); if (d && !window.matchMedia('(pointer:coarse)').matches) d.focus({ preventScroll: true }); }, 20); return;
    }
    if (a === 'g-close') { G.open = null; render(); return; }
    if (a === 'g-save-seed') { save(false); return; }
    if (a === 'g-omode') { G.o.mode = b.dataset.v; G.sel = {}; render(); return; }
    if (a === 'g-o-clear') { Object.assign(G.o, { q: '', owner: '', status: '', source: '' }); G.sel = {}; render(); return; }
    if (a === 'g-o-add') { G.add = { fin: '', name: '', country: '', ac: '', week: '' }; G.imp = null; if (!finState && !finLoading) loadFin(true); render(); return; }
    if (a === 'g-o-add-close') { G.add = null; render(); return; }
    if (a === 'g-o-add-go') { gOutAdd(); return; }
    if (a === 'g-o-csv') { gOutCSV(b.dataset.v === 'sel'); return; }
    if (a === 'g-imp-close') { G.imp = null; render(); return; }
    if (a === 'g-imp-go') { gImpApply(); return; }
    if (a === 'g-b-clear') { G.sel = {}; render(); return; }
    if (a === 'g-b-sent') { let n = 0, skip = 0; data.outreach.forEach(r => { if (!G.sel[r.id]) return; if (gPromoted(r) || G_CLOSED.includes(r.status)) { skip++; return; } gSetStatus(r, 'Email sent'); n++; }); touch(); toast(n + ' marked Email sent; follow-ups set for ' + fdate(addWork(today(), 5)) + '.' + (skip ? ' ' + skip + ' skipped (replied, not a fit or promoted).' : '')); render(); return; }
    if (a === 'g-promote') { const r = gFind('outreach', id); if (r) gPromote(r); return; }
    if (a === 'g-del') {
      const coll = gColl(b.dataset.k), x = gFind(coll, id); if (!x) return;
      const nm = x.airline || x.name || x.source || 'this item';
      if (!confirmLeave('Delete ' + nm + '?' + (b.dataset.k === 'out' && gPromoted(x) ? ' Its lead stays in Leads.' : '') + ' You can Discard before saving to undo.')) return;
      data[coll] = data[coll].filter(y => y.id !== id); if (b.dataset.k === 'out') { delete G.sel[id]; data.conferences.forEach(c => c.people.forEach(p => { if (p.outreach_id === id) p.outreach_id = ''; })); }
      G.open = null; touch(); toast(nm + ' deleted. Save to keep this.'); render(); return;
    }
    if (a === 'g-c-add') { const c = gConf({ name: 'New conference', decision: 'Maybe' }); data.conferences.push(c); G.open = { k: 'conf', id: c.id }; touch(); render(); return; }
    if (a === 'g-p-add') { const c = gFind('conferences', id); if (!c) return; c.people.push({ id: nid('p'), name: '', airline: '', role: '', email: '', outreach_id: '' }); touch(); render(); return; }
    if (a === 'g-p-del') { const c = gFind('conferences', id); if (!c) return; c.people.splice(+b.dataset.i, 1); touch(); render(); return; }
    if (a === 'g-p-out') { const c = gFind('conferences', id); if (c) gPersonToOut(c, +b.dataset.i); return; }
    if (a === 'g-h-add') { const c = gChan({ name: 'New channel', steps: [gStep('')] }); data.channels.push(c); G.open = { k: 'chan', id: c.id }; touch(); render(); return; }
    if (a === 'g-s-add') { const s = gStrat({ source: 'New source', steps: [''] }); data.strategies.push(s); G.open = { k: 'strat', id: s.id }; touch(); render(); return; }
    if (a === 'g-st-add' || a === 'g-st-del' || a === 'g-st-mv') {
      const isCh = b.dataset.k === 'gs', x = gFind(isCh ? 'channels' : 'strategies', id); if (!x) return; const S = x.steps, i = +b.dataset.i;
      if (a === 'g-st-add') S.push(isCh ? gStep('') : '');
      else if (a === 'g-st-del') S.splice(i, 1);
      else { const j = i + (+b.dataset.v); if (j < 0 || j >= S.length) return; const t = S[i]; S[i] = S[j]; S[j] = t; }
      touch(); render();
      if (a === 'g-st-add') setTimeout(() => { const ins = document.querySelectorAll('.gr-steps .gr-step-b > .in'); if (ins.length) ins[ins.length - 1].focus(); }, 20);
      return;
    }
    if (a === 'g-tpl') { G.tpl = b.dataset.v; render(); return; }
    if (a === 'g-tpl-reset') { const d = G_TPL.find(t => t.id === b.dataset.v), T = data.growthTemplates.find(t => t.id === b.dataset.v); if (!d || !T || !confirmLeave('Replace this template with the starter text?')) return; Object.assign(T, d); touch(); render(); return; }
    if (a === 'g-tpl-copy') {
      const r = id ? gFind('outreach', id) : null;
      if (!r) { toast('Pick an airline first.'); return; }
      const txt = gTplText(b.dataset.v, r);
      if (await copyText(txt)) toast('Copied' + (/\{(airline|contact_name|fleet|sender)\}/.test(txt) ? ' — some merge fields are still empty.' : '. Paste it into your mail app.')); else toast('Could not copy.');
      return;
    }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && view.g.open) { view.g.open = null; render(); } });
