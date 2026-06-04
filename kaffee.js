// ╔═══════════════════════════════════════════════════════════════╗
// ║  Kaffee – Kategorie-spezifische Logik                         ║
// ╚═══════════════════════════════════════════════════════════════╝

const App = {
  CATEGORY: 'kaffee',
  currentModalId: null,
  favFilterActive: false,

  // ── Maschinenverwaltung ───────────────────────────────────────
  getMachines() {
    return (TJ.data.meta && TJ.data.meta.machines) || [];
  },

  async saveMachines(machines) {
    if (!TJ.data.meta) TJ.data.meta = {};
    TJ.data.meta.machines = machines;
    TJ.saveCache();
    await TJ.saveData();
  },

  populateMachineDropdown() {
    const sel = document.getElementById('f-machine');
    if (!sel) return;
    const current = sel.value;
    const machines = this.getMachines();
    sel.innerHTML = '<option value="">— Bitte wählen —</option>' +
      machines.map(m => `<option value="${escapeHtml(m.name)}" ${m.name === current ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('');
  },

  // ── Favoriten ─────────────────────────────────────────────────
  toggleFavFilter() {
    this.favFilterActive = !this.favFilterActive;
    const btn = document.getElementById('filterFavBtn');
    if (btn) {
      btn.classList.toggle('active', this.favFilterActive);
      btn.textContent = this.favFilterActive ? '♥ Favoriten' : '♡ Favoriten';
    }
    this.renderCollection();
  },

  async toggleFavorite(id, event) {
    event.stopPropagation();
    const item = TJ.getItems(this.CATEGORY).find(x => x.id === id);
    if (!item) return;
    item.favorite = !item.favorite;
    TJ.saveCache();
    await TJ.saveData();
    this.renderCollection();
  },

  // ── Form ───────────────────────────────────────────────────────
  FIELDS: ['name','roastery','origin','region','roast','process','date','price','weight',
           'machine','grind','dose','time','water','temp','aroma','taste','finish','notes'],

  resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Neue Kaffee-Verkostung';
    this.FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) el.value = '';
    });
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-score').value = 80;
    document.getElementById('scoreVal').textContent = '80';
    UI.setStars(3);
    UI.setPhotoData(null);
    document.getElementById('f-photo').value = '';
    this.populateMachineDropdown();
  },

  loadIntoForm(t) {
    document.getElementById('editId').value = t.id;
    document.getElementById('formTitle').textContent = 'Kaffee-Verkostung bearbeiten';
    this.FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) el.value = t[f] || '';
    });
    document.getElementById('f-score').value = t.score || 80;
    document.getElementById('scoreVal').textContent = t.score || 80;
    UI.setStars(t.stars || 3);
    UI.setPhotoData(t.photo || null);
    this.populateMachineDropdown();
  },

  async save() {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { TJ.notify('Bitte gib einen Namen ein', 'error'); return; }

    const editId = document.getElementById('editId').value;
    const entry = { id: editId || Date.now().toString() };
    this.FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) entry[f] = el.value.trim ? el.value.trim() : el.value;
    });
    entry.score = parseInt(document.getElementById('f-score').value);
    entry.stars = UI.getStars();
    entry.photo = UI.getPhotoData();
    entry.favorite = TJ.getItems(this.CATEGORY).find(x => x.id === editId)?.favorite || false;
    entry.updated = new Date().toISOString();

    TJ.upsertItem(this.CATEGORY, entry);
    TJ.saveCache();
    await TJ.saveData();
    this.resetForm();
    TJ.notify(editId ? '✅ Verkostung aktualisiert' : '✅ Verkostung gespeichert', 'success');
    UI.switchTab('collection');
  },

  // ── Filter befüllen ───────────────────────────────────────────
  populateFilters() {
    const items = TJ.getItems(this.CATEGORY);
    if (items.length === 0) return;

    const roasteries = [...new Set(items.map(t => t.roastery).filter(Boolean))].sort();
    const origins = [...new Set(items.map(t => t.origin).filter(Boolean))].sort();
    const machines = [...new Set(items.map(t => t.machine).filter(Boolean))].sort();

    const roastEl = document.getElementById('filterRoastery');
    const origEl = document.getElementById('filterOrigin');
    const machEl = document.getElementById('filterMachine');
    if (!roastEl || !origEl || !machEl) return;

    const sr = roastEl.value, so = origEl.value, sm = machEl.value;
    roastEl.innerHTML = '<option value="">Alle Röstereien</option>' +
      roasteries.map(r => `<option value="${r}" ${r === sr ? 'selected' : ''}>${escapeHtml(r)}</option>`).join('');
    origEl.innerHTML = '<option value="">Alle Herkunftsländer</option>' +
      origins.map(o => `<option value="${o}" ${o === so ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('');
    machEl.innerHTML = '<option value="">Alle Maschinen</option>' +
      machines.map(m => `<option value="${m}" ${m === sm ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('');
  },

  // ── Sammlung rendern ──────────────────────────────────────────
  renderCollection() {
    this.populateFilters();
    const container = document.getElementById('cardsContainer');
    const query = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortSelect').value;
    const filterRoastery = document.getElementById('filterRoastery').value;
    const filterOrigin = document.getElementById('filterOrigin').value;
    const filterMachine = document.getElementById('filterMachine').value;

    let list = TJ.getItems(this.CATEGORY).filter(t => {
      if (this.favFilterActive && !t.favorite) return false;
      if (filterRoastery && t.roastery !== filterRoastery) return false;
      if (filterOrigin && t.origin !== filterOrigin) return false;
      if (filterMachine && t.machine !== filterMachine) return false;
      if (query && !(
        (t.name || '').toLowerCase().includes(query) ||
        (t.roastery || '').toLowerCase().includes(query) ||
        (t.origin || '').toLowerCase().includes(query)
      )) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sort === 'date-desc') return parseInt(b.id) - parseInt(a.id);
      if (sort === 'date-asc') return parseInt(a.id) - parseInt(b.id);
      if (sort === 'score-desc') return (b.score || 0) - (a.score || 0);
      if (sort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    if (list.length === 0) {
      container.innerHTML = UI.emptyState('☕', query ? 'Keine Ergebnisse gefunden.' : 'Noch keine Kaffee-Verkostungen. Füge deine erste hinzu!');
      return;
    }

    container.innerHTML = '<div class="cards-grid">' + list.map(t => `
      <div class="tasting-card" onclick="App.openModal('${t.id}')">
        <button class="fav-btn${t.favorite ? ' active' : ''}" onclick="App.toggleFavorite('${t.id}', event)" title="Favorit">${t.favorite ? '♥' : '♡'}</button>
        ${t.photo
          ? `<img class="card-img" src="${t.photo}" alt="${escapeHtml(t.name)}" />`
          : `<div class="card-img-placeholder">☕</div>`}
        <div class="card-body">
          <div class="card-name">${escapeHtml(t.name)}</div>
          <div class="card-sub">${escapeHtml(t.roastery || '—')}</div>
          <div class="card-meta">
            ${t.origin ? `<span class="badge accent">${escapeHtml(t.origin)}</span>` : ''}
            ${t.roast ? `<span class="badge">${escapeHtml(t.roast)}</span>` : ''}
            ${t.process ? `<span class="badge">${escapeHtml(t.process)}</span>` : ''}
            ${t.machine ? `<span class="badge">☕ ${escapeHtml(t.machine)}</span>` : ''}
          </div>
          ${t.dose || t.time ? `
          <div class="card-meta" style="margin-top:0.3rem">
            ${t.dose ? `<span class="badge">${escapeHtml(t.dose)}g</span>` : ''}
            ${t.time ? `<span class="badge">${escapeHtml(t.time)}sek</span>` : ''}
            ${t.water ? `<span class="badge">${escapeHtml(t.water)}ml</span>` : ''}
            ${t.price && t.weight ? `<span class="badge">${(parseFloat(t.price)/parseFloat(t.weight)).toFixed(2)} €/g</span>` : ''}
          </div>` : ''}
          <div class="card-score">
            <span class="score-badge">${t.score}</span>
            <span class="stars-display">${starsHtml(t.stars)}</span>
          </div>
          ${t.aroma ? `<div class="card-note">${escapeHtml(t.aroma)}</div>` : ''}
          ${t.date ? `<div class="card-date">📅 ${formatDate(t.date)}</div>` : ''}
        </div>
      </div>
    `).join('') + '</div>';
  },

  // ── Modal ──────────────────────────────────────────────────────
  openModal(id) {
    const t = TJ.getItems(this.CATEGORY).find(x => x.id === id);
    if (!t) return;
    this.currentModalId = id;
    document.getElementById('modalName').textContent = t.name;
    document.getElementById('modalSubtitle').textContent = t.roastery || '';

    let html = '';
    if (t.photo) html += `<img class="modal-img" src="${t.photo}" />`;
    html += '<div class="detail-grid">';
    if (t.origin) html += this.detail('Herkunft', escapeHtml(t.origin));
    if (t.region) html += this.detail('Region / Farm', escapeHtml(t.region));
    if (t.roast) html += this.detail('Röstgrad', escapeHtml(t.roast));
    if (t.process) html += this.detail('Verarbeitung', escapeHtml(t.process));
    if (t.price) html += this.detail('Preis', escapeHtml(t.price) + ' €' +
      (t.weight ? ` <span style="color:var(--text-muted);font-size:0.85rem">(${(parseFloat(t.price)/parseFloat(t.weight)).toFixed(2)} €/g)</span>` : ''));
    if (t.weight) html += this.detail('Gewicht', escapeHtml(t.weight) + ' g');
    if (t.date) html += this.detail('Verkostet am', formatDate(t.date));
    html += '</div>';

    if (t.machine || t.grind || t.dose || t.time || t.water || t.temp) {
      html += '<div class="detail-grid" style="margin-top:1rem">';
      if (t.machine) html += this.detail('Maschine', escapeHtml(t.machine));
      if (t.grind) html += this.detail('Mahlgrad', escapeHtml(t.grind));
      if (t.dose) html += this.detail('Kaffeemenge', escapeHtml(t.dose) + ' g');
      if (t.time) html += this.detail('Bezugszeit', escapeHtml(t.time) + ' sek');
      if (t.water) html += this.detail('Wassermenge', escapeHtml(t.water) + ' ml');
      if (t.temp) html += this.detail('Temperatur', escapeHtml(t.temp) + ' °C');
      html += '</div>';
    }

    html += this.detail('Bewertung',
      `<span class="score-badge">${t.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(t.stars)}</span>`);

    if (t.aroma) html += this.section('☕ Aroma', escapeHtml(t.aroma));
    if (t.taste) html += this.section('👅 Geschmack', escapeHtml(t.taste));
    if (t.finish) html += this.section('🔥 Abgang', escapeHtml(t.finish));
    if (t.notes) html += this.section('📝 Notizen', escapeHtml(t.notes));

    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('open');
  },

  detail(lbl, val) {
    return `<div class="detail-item"><label>${lbl}</label><span>${val}</span></div>`;
  },
  section(title, text) {
    return `<div class="tasting-section"><h3>${title}</h3><p>${text}</p></div>`;
  },

  editFromModal() {
    const t = TJ.getItems(this.CATEGORY).find(x => x.id === this.currentModalId);
    if (!t) return;
    UI.closeDetailModal();
    this.loadIntoForm(t);
    UI.switchTab('add');
  },

  async deleteFromModal() {
    if (!confirm('Verkostung wirklich löschen?')) return;
    TJ.removeItem(this.CATEGORY, this.currentModalId);
    TJ.saveCache();
    await TJ.saveData();
    UI.closeDetailModal();
    TJ.notify('🗑 Verkostung gelöscht', 'success');
    this.renderCollection();
  },

  // ── Statistiken ───────────────────────────────────────────────
  renderStats() {
    const el = document.getElementById('statsContent');
    const items = TJ.getItems(this.CATEGORY);
    if (items.length === 0) {
      el.innerHTML = UI.emptyState('📊', 'Noch keine Daten vorhanden.');
      return;
    }
    const avg = Math.round(items.reduce((s, t) => s + (t.score || 0), 0) / items.length);
    const best = items.reduce((a, b) => (b.score || 0) > (a.score || 0) ? b : a);
    const roasteries = [...new Set(items.map(t => t.roastery).filter(Boolean))];
    const byOrigin = {};
    items.forEach(t => { if (t.origin) byOrigin[t.origin] = (byOrigin[t.origin] || 0) + 1; });

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${items.length}</div><div class="stat-label">Verkostungen</div></div>
        <div class="stat-card"><div class="stat-value">${avg}</div><div class="stat-label">Ø Punkte</div></div>
        <div class="stat-card"><div class="stat-value">${roasteries.length}</div><div class="stat-label">Röstereien</div></div>
        <div class="stat-card"><div class="stat-value">${Object.keys(byOrigin).length}</div><div class="stat-label">Länder</div></div>
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Bester Kaffee</h2>
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:0.5rem">
          ${best.photo ? `<img src="${best.photo}" style="height:80px;border-radius:6px;object-fit:cover" />` : '<div style="font-size:3rem">🥇</div>'}
          <div>
            <div style="font-size:1.3rem;color:var(--amber-light)">${escapeHtml(best.name)}</div>
            <div style="color:var(--text-muted)">${escapeHtml(best.roastery || '')}${best.origin ? ' · ' + escapeHtml(best.origin) : ''}</div>
            <div style="margin-top:0.5rem"><span class="score-badge">${best.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(best.stars)}</span></div>
          </div>
        </div>
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Nach Herkunft</h2>
        <div style="margin-top:1rem">
          ${Object.entries(byOrigin).sort((a,b)=>b[1]-a[1]).map(([c,n]) => `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem">
              <span style="min-width:130px;color:var(--text-muted)">${escapeHtml(c)}</span>
              <div style="flex:1;background:var(--bg3);border-radius:20px;height:14px;overflow:hidden">
                <div style="height:100%;width:${Math.round(n/items.length*100)}%;background:linear-gradient(90deg,var(--amber-dark),var(--amber));border-radius:20px"></div>
              </div>
              <span style="color:var(--amber-light);min-width:2ch">${n}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="form-card">
        <h2>🏆 Top 10</h2>
        <div style="margin-top:1rem">
          ${[...items].sort((a,b) => (b.score||0) - (a.score||0)).slice(0,10).map((t,i) => `
            <div onclick="App.openModal('${t.id}')" style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;cursor:pointer;padding:0.5rem;border-radius:8px;transition:background 0.15s" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">
              <div style="min-width:1.8rem;font-size:1.1rem;font-weight:bold;color:${i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--text-muted)'};text-align:center">${i+1}</div>
              ${t.photo ? `<img src="${t.photo}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;flex-shrink:0" />` : `<div style="width:40px;height:40px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">☕</div>`}
              <div style="flex:1;min-width:0">
                <div style="color:var(--amber-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.name)}</div>
                <div style="color:var(--text-muted);font-size:0.8rem">${escapeHtml(t.roastery||'')}${t.origin?' · '+escapeHtml(t.origin):''}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.4rem;flex-shrink:0">
                <span class="score-badge">${t.score}</span>
                ${t.favorite ? '<span style="color:#e05575">♥</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ── Kategorie-Einstellungen (Maschinen) ───────────────────────
  renderCategorySettings() {
    const machines = this.getMachines();
    return `
<div id="tab-settings" class="tab-content">
  <div class="form-card" style="margin-bottom:1.5rem">
    <h2>☕ Meine Kaffeemaschinen</h2>
    <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.25rem">Maschinen werden im Dropdown beim Erfassen einer Verkostung angezeigt.</p>
    <div id="machineList" style="margin-bottom:1rem"></div>
    <div style="display:flex;gap:0.5rem;align-items:flex-start;flex-wrap:wrap">
      <input type="text" id="newMachineName" placeholder="Maschinenname z.B. La Marzocco Linea Mini" style="flex:1;min-width:200px" />
      <input type="text" id="newMachineNote" placeholder="Notiz (optional)" style="flex:1;min-width:150px" />
      <button class="btn btn-primary" onclick="App.addMachine()">+ Hinzufügen</button>
    </div>
  </div>
  <div class="form-card">
    <h2>Globale Einstellungen</h2>
    <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">GitHub-Verbindung, Google Drive, Import &amp; Export – auf der Übersichtsseite.</p>
    <a href="settings.html" class="btn btn-primary" style="text-decoration:none;display:inline-block;margin-top:1rem">⚙️ Globale Einstellungen öffnen</a>
  </div>
</div>`;
  },

  renderMachineList() {
    const machines = this.getMachines();
    const el = document.getElementById('machineList');
    if (!el) return;
    if (machines.length === 0) {
      el.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem">Noch keine Maschinen angelegt.</p>`;
      return;
    }
    el.innerHTML = machines.map((m, i) => `
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <div style="color:var(--amber-light)">${escapeHtml(m.name)}</div>
          ${m.note ? `<div style="color:var(--text-muted);font-size:0.85rem">${escapeHtml(m.note)}</div>` : ''}
        </div>
        <button onclick="App.deleteMachine(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem" title="Löschen">🗑</button>
      </div>
    `).join('');
  },

  async addMachine() {
    const name = document.getElementById('newMachineName').value.trim();
    if (!name) { TJ.notify('Bitte Namen eingeben', 'error'); return; }
    const note = document.getElementById('newMachineNote').value.trim();
    const machines = this.getMachines();
    if (machines.find(m => m.name === name)) { TJ.notify('Maschine bereits vorhanden', 'error'); return; }
    machines.push({ name, note });
    await this.saveMachines(machines);
    document.getElementById('newMachineName').value = '';
    document.getElementById('newMachineNote').value = '';
    this.renderMachineList();
    this.populateMachineDropdown();
    TJ.notify('✅ Maschine gespeichert', 'success');
  },

  async deleteMachine(index) {
    if (!confirm('Maschine wirklich löschen?')) return;
    const machines = this.getMachines();
    machines.splice(index, 1);
    await this.saveMachines(machines);
    this.renderMachineList();
    this.populateMachineDropdown();
    TJ.notify('🗑 Maschine gelöscht', 'success');
  },

  // ── Tab-Wechsel-Hook ──────────────────────────────────────────
  onTabSwitch(name) {
    App._activeTab = name;
    if (name === 'collection') this.renderCollection();
    if (name === 'stats') this.renderStats();
    if (name === 'settings') this.renderMachineList();
  },
};

// ── Layout zusammenbauen ──────────────────────────────────────
document.getElementById('headerContainer').innerHTML = UI.renderHeader({
  icon: '☕',
  title: 'Kaffee',
  subtitle: 'Espresso, Filter & Spezialitäten',
  accent: 'kaffee',
});
document.getElementById('setupContainer').innerHTML = UI.renderSetupModal();
document.getElementById('starPickerContainer').innerHTML = UI.renderStarPicker();
document.getElementById('photoUploadContainer').innerHTML = UI.renderPhotoUpload();
document.getElementById('settingsContainer').innerHTML = App.renderCategorySettings();
document.getElementById('detailModalContainer').innerHTML = UI.renderDetailModal();

document.getElementById('detailModal').addEventListener('click', e => {
  if (e.target.id === 'detailModal') UI.closeDetailModal();
});

document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

function onDataLoaded() {
  UI.updateHeaderTitle('Kaffee');
  App.populateMachineDropdown();
  if (typeof App !== 'undefined') App.onTabSwitch(App._activeTab || 'collection');
}
function onSetupComplete() { App.renderCollection(); }

TJ.init('kaffee');
