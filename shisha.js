// ╔═══════════════════════════════════════════════════════════════╗
// ║  Shisha-Tabak – Kategorie-spezifische Logik                   ║
// ╚═══════════════════════════════════════════════════════════════╝

const App = {
  CATEGORY: 'shisha',
  currentModalId: null,
  favFilterActive: false,

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
    const items = TJ.getItems(this.CATEGORY);
    const item = items.find(x => x.id === id);
    if (!item) return;
    item.favorite = !item.favorite;
    TJ.saveCache();
    await TJ.saveData();
    this.renderCollection();
  },

  FIELDS: ['name','brand','flavor','base','cut','moisture','bowl','heat',
           'date','price','weight','smoke','heatBehavior','stamina','nicotine',
           'taste','draw','notes'],

  // ── Form ───────────────────────────────────────────────────────
  resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Neue Shisha-Verkostung';
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
  },

  loadIntoForm(t) {
    document.getElementById('editId').value = t.id;
    document.getElementById('formTitle').textContent = 'Shisha-Verkostung bearbeiten';
    this.FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) el.value = t[f] || '';
    });
    document.getElementById('f-score').value = t.score || 80;
    document.getElementById('scoreVal').textContent = t.score || 80;
    UI.setStars(t.stars || 3);
    UI.setPhotoData(t.photo || null);
  },

  async save() {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { TJ.notify('Bitte gib einen Namen ein', 'error'); return; }

    const editId = document.getElementById('editId').value;
    const entry = { id: editId || Date.now().toString() };
    this.FIELDS.forEach(f => {
      const el = document.getElementById('f-' + f);
      if (el) entry[f] = (el.value || '').trim ? el.value.trim() : el.value;
    });
    entry.score = parseInt(document.getElementById('f-score').value);
    entry.stars = UI.getStars();
    entry.photo = UI.getPhotoData();
    entry.updated = new Date().toISOString();

    TJ.upsertItem(this.CATEGORY, entry);
    TJ.saveCache();
    await TJ.saveData();
    this.resetForm();
    TJ.notify(editId ? '✅ Verkostung aktualisiert' : '✅ Verkostung gespeichert', 'success');
    UI.switchTab('collection');
  },

  // ── Render: Sammlung ──────────────────────────────────────────
  populateFilters() {
    const items = TJ.getItems(this.CATEGORY);
    if (items.length === 0) return;

    const brands = [...new Set(items.map(t => t.brand).filter(Boolean))].sort();
    const flavors = [...new Set(items.map(t => t.flavor).filter(Boolean))].sort();

    const brandEl = document.getElementById('filterBrand');
    const flavorEl = document.getElementById('filterFlavor');
    if (!brandEl || !flavorEl) return;

    const selectedBrand = brandEl.value;
    const selectedFlavor = flavorEl.value;

    brandEl.innerHTML = '<option value="">Alle Marken</option>' +
      brands.map(b => `<option value="${b}" ${b === selectedBrand ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('');
    flavorEl.innerHTML = '<option value="">Alle Geschmacksrichtungen</option>' +
      flavors.map(f => `<option value="${f}" ${f === selectedFlavor ? 'selected' : ''}>${escapeHtml(f)}</option>`).join('');
  },

  renderCollection() {
    this.populateFilters();
    const container = document.getElementById('cardsContainer');
    const query = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortSelect').value;
    const filterBrand = document.getElementById('filterBrand').value;
    const filterFlavor = document.getElementById('filterFlavor').value;
    const filterStars = document.getElementById('filterStars').value;

    let list = TJ.getItems(this.CATEGORY).filter(t => {
      if (this.favFilterActive && !t.favorite) return false;
      if (query && !(
        (t.name || '').toLowerCase().includes(query) ||
        (t.brand || '').toLowerCase().includes(query) ||
        (t.flavor || '').toLowerCase().includes(query)
      )) return false;
      if (filterBrand && t.brand !== filterBrand) return false;
      if (filterFlavor && t.flavor !== filterFlavor) return false;
      if (filterStars && String(t.stars) !== filterStars) return false;
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
      container.innerHTML = UI.emptyState('💨',
        query ? 'Keine Ergebnisse gefunden.' : 'Noch keine Shisha-Verkostungen. Füge deine erste hinzu!');
      return;
    }

    container.innerHTML = '<div class="cards-grid">' + list.map(t => `
      <div class="tasting-card" onclick="App.openModal('${t.id}')">
        <button class="fav-btn${t.favorite ? ' active' : ''}" onclick="App.toggleFavorite('${t.id}', event)" title="Favorit">${t.favorite ? '♥' : '♡'}</button>
        ${t.photo
          ? `<img class="card-img" src="${t.photo}" alt="${escapeHtml(t.name)}" />`
          : `<div class="card-img-placeholder">💨</div>`}
        <div class="card-body">
          <div class="card-name">${escapeHtml(t.name)}</div>
          <div class="card-sub">${escapeHtml(t.brand) || '—'}</div>
          <div class="card-meta">
            ${t.flavor ? `<span class="badge accent">${escapeHtml(t.flavor)}</span>` : ''}
            ${t.base ? `<span class="badge">${escapeHtml(t.base)}</span>` : ''}
            ${t.weight ? `<span class="badge">${escapeHtml(t.weight)} g</span>` : ''}
            ${t.price && t.weight ? `<span class="badge">${(parseFloat(t.price)/parseFloat(t.weight)).toFixed(2)} €/g</span>` : ''}
            ${t.smoke ? `<span class="badge">💨 ${escapeHtml(t.smoke)}</span>` : ''}
            ${t.nicotine ? `<span class="badge">N: ${escapeHtml(t.nicotine)}</span>` : ''}
          </div>
          <div class="card-score">
            <span class="score-badge">${t.score}</span>
            <span class="stars-display">${starsHtml(t.stars)}</span>
          </div>
          ${t.taste ? `<div class="card-note">${escapeHtml(t.taste)}</div>` : ''}
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
    document.getElementById('modalSubtitle').textContent = t.brand || '';

    let html = '';
    if (t.photo) html += `<img class="modal-img" src="${t.photo}" />`;
    html += '<div class="detail-grid">';
    if (t.flavor) html += this.detail('Geschmacksrichtung', escapeHtml(t.flavor));
    if (t.base) html += this.detail('Tabakbasis', escapeHtml(t.base));
    if (t.cut) html += this.detail('Schnitt', escapeHtml(t.cut));
    if (t.moisture) html += this.detail('Feuchtigkeit', escapeHtml(t.moisture));
    if (t.bowl) html += this.detail('Kopf / Bowl', escapeHtml(t.bowl));
    if (t.heat) html += this.detail('Hitze-Setup', escapeHtml(t.heat));
    if (t.smoke) html += this.detail('Rauchentwicklung', escapeHtml(t.smoke));
    if (t.heatBehavior) html += this.detail('Hitze-Verhalten', escapeHtml(t.heatBehavior));
    if (t.stamina) html += this.detail('Durchhaltevermögen', escapeHtml(t.stamina));
    if (t.nicotine) html += this.detail('Nikotinstärke', escapeHtml(t.nicotine));
    if (t.price) html += this.detail('Preis', escapeHtml(t.price) + ' €' +
      (t.weight ? ` <span style="color:var(--text-muted);font-size:0.85rem">(${(parseFloat(t.price) / parseFloat(t.weight)).toFixed(2)} €/g)</span>` : ''));
    if (t.weight) html += this.detail('Verpackungsgröße', escapeHtml(t.weight) + ' g');
    if (t.date) html += this.detail('Verkostet am', formatDate(t.date));
    html += this.detail('Bewertung',
      `<span class="score-badge">${t.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(t.stars)}</span>`);
    html += '</div>';

    if (t.taste) html += this.section('🌸 Geschmack', escapeHtml(t.taste));
    if (t.draw) html += this.section('💨 Zugverhalten', escapeHtml(t.draw));
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

  // ── Stats ──────────────────────────────────────────────────────
  renderStats() {
    const el = document.getElementById('statsContent');
    const items = TJ.getItems(this.CATEGORY);
    if (items.length === 0) {
      el.innerHTML = UI.emptyState('📊', 'Noch keine Daten vorhanden.');
      return;
    }
    const avg = Math.round(items.reduce((s, t) => s + (t.score || 0), 0) / items.length);
    const best = items.reduce((a, b) => (b.score || 0) > (a.score || 0) ? b : a);
    const brands = [...new Set(items.map(t => t.brand).filter(Boolean))];
    const byBrand = {};
    items.forEach(t => { if (t.brand) byBrand[t.brand] = (byBrand[t.brand] || 0) + 1; });
    const byFlavor = {};
    items.forEach(t => { if (t.flavor) byFlavor[t.flavor] = (byFlavor[t.flavor] || 0) + 1; });
    const topFlavor = Object.entries(byFlavor).sort((a, b) => b[1] - a[1])[0];

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${items.length}</div><div class="stat-label">Verkostungen</div></div>
        <div class="stat-card"><div class="stat-value">${avg}</div><div class="stat-label">Ø Punkte</div></div>
        <div class="stat-card"><div class="stat-value">${brands.length}</div><div class="stat-label">Marken</div></div>
        ${topFlavor ? `<div class="stat-card"><div class="stat-value">${topFlavor[1]}</div><div class="stat-label">${escapeHtml(topFlavor[0])}</div></div>` : ''}
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Bester Tabak</h2>
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:0.5rem">
          ${best.photo ? `<img src="${best.photo}" style="height:80px;border-radius:6px;object-fit:cover" />` : '<div style="font-size:3rem">🥇</div>'}
          <div>
            <div style="font-size:1.3rem;color:var(--amber-light)">${escapeHtml(best.name)}</div>
            <div style="color:var(--text-muted)">${escapeHtml(best.brand) || ''} ${best.flavor ? '· ' + escapeHtml(best.flavor) : ''}</div>
            <div style="margin-top:0.5rem"><span class="score-badge">${best.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(best.stars)}</span></div>
          </div>
        </div>
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Nach Geschmacksrichtung</h2>
        <div style="margin-top:1rem">
          ${Object.entries(byFlavor).sort((a,b)=>b[1]-a[1]).map(([c,n]) => `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem">
              <span style="min-width:140px;color:var(--text-muted)">${escapeHtml(c)}</span>
              <div style="flex:1;background:var(--bg3);border-radius:20px;height:14px;overflow:hidden">
                <div style="height:100%;width:${Math.round(n/items.length*100)}%;background:linear-gradient(90deg,var(--amber-dark),var(--amber));border-radius:20px"></div>
              </div>
              <span style="color:var(--amber-light);min-width:2ch">${n}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="form-card">
        <h2>Top Marken</h2>
        <div style="margin-top:1rem">
          ${Object.entries(byBrand).sort((a,b)=>b[1]-a[1]).slice(0, 8).map(([c,n]) => `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem">
              <span style="min-width:140px;color:var(--text-muted)">${escapeHtml(c)}</span>
              <div style="flex:1;background:var(--bg3);border-radius:20px;height:14px;overflow:hidden">
                <div style="height:100%;width:${Math.round(n/items.length*100)}%;background:linear-gradient(90deg,var(--amber-dark),var(--amber));border-radius:20px"></div>
              </div>
              <span style="color:var(--amber-light);min-width:2ch">${n}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  onTabSwitch(name) {
    if (name === 'collection') this.renderCollection();
    if (name === 'stats') this.renderStats();
    if (name === 'settings') UI.renderSettingsContent();
  },
};

// ── Layout zusammenbauen ──────────────────────────────────────
document.getElementById('headerContainer').innerHTML = UI.renderHeader({
  icon: '💨',
  title: 'Shisha-Tabak',
  subtitle: 'Sorten & Verkostungsnotizen',
  accent: 'shisha',
});
document.getElementById('setupContainer').innerHTML = UI.renderSetupModal();
document.getElementById('starPickerContainer').innerHTML = UI.renderStarPicker();
document.getElementById('photoUploadContainer').innerHTML = UI.renderPhotoUpload();
document.getElementById('settingsContainer').innerHTML = UI.renderSettingsTab();
document.getElementById('detailModalContainer').innerHTML = UI.renderDetailModal();

document.getElementById('detailModal').addEventListener('click', e => {
  if (e.target.id === 'detailModal') UI.closeDetailModal();
});

document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

function onDataLoaded() {
  const activeTab = document.querySelector('.tab-btn.active');
  const tab = activeTab ? activeTab.dataset.tab : 'collection';
  App.onTabSwitch(tab);
}
function onSetupComplete() { App.renderCollection(); }

TJ.init('shisha');
