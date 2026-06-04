// ╔═══════════════════════════════════════════════════════════════╗
// ║  Whisky – Kategorie-spezifische Logik                         ║
// ╚═══════════════════════════════════════════════════════════════╝

const App = {
  CATEGORY: 'whisky',
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

  // ── Form ───────────────────────────────────────────────────────
  resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = 'Neue Whisky-Verkostung';
    ['name','distillery','region','age','abv','cask','price','nose','palate','finish','notes'].forEach(f => {
      document.getElementById('f-' + f).value = '';
    });
    document.getElementById('f-country').value = '';
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-score').value = 80;
    document.getElementById('scoreVal').textContent = '80';
    UI.setStars(3);
    UI.setPhotoData(null);
    document.getElementById('f-photo').value = '';
  },

  loadIntoForm(t) {
    document.getElementById('editId').value = t.id;
    document.getElementById('formTitle').textContent = 'Whisky-Verkostung bearbeiten';
    document.getElementById('f-name').value = t.name || '';
    document.getElementById('f-distillery').value = t.distillery || '';
    document.getElementById('f-country').value = t.country || '';
    document.getElementById('f-region').value = t.region || '';
    document.getElementById('f-age').value = t.age || '';
    document.getElementById('f-abv').value = t.abv || '';
    document.getElementById('f-cask').value = t.cask || '';
    document.getElementById('f-date').value = t.date || '';
    document.getElementById('f-price').value = t.price || '';
    document.getElementById('f-score').value = t.score || 80;
    document.getElementById('scoreVal').textContent = t.score || 80;
    UI.setStars(t.stars || 3);
    document.getElementById('f-nose').value = t.nose || '';
    document.getElementById('f-palate').value = t.palate || '';
    document.getElementById('f-finish').value = t.finish || '';
    document.getElementById('f-notes').value = t.notes || '';
    UI.setPhotoData(t.photo || null);
  },

  async save() {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { TJ.notify('Bitte gib einen Namen ein', 'error'); return; }

    const editId = document.getElementById('editId').value;
    const entry = {
      id: editId || Date.now().toString(),
      name,
      distillery: document.getElementById('f-distillery').value.trim(),
      country: document.getElementById('f-country').value,
      region: document.getElementById('f-region').value.trim(),
      age: document.getElementById('f-age').value,
      abv: document.getElementById('f-abv').value,
      cask: document.getElementById('f-cask').value.trim(),
      date: document.getElementById('f-date').value,
      price: document.getElementById('f-price').value,
      score: parseInt(document.getElementById('f-score').value),
      stars: UI.getStars(),
      nose: document.getElementById('f-nose').value.trim(),
      palate: document.getElementById('f-palate').value.trim(),
      finish: document.getElementById('f-finish').value.trim(),
      notes: document.getElementById('f-notes').value.trim(),
      photo: UI.getPhotoData(),
      updated: new Date().toISOString(),
    };

    TJ.upsertItem(this.CATEGORY, entry);
    TJ.saveCache();
    await TJ.saveData();
    this.resetForm();
    TJ.notify(editId ? '✅ Verkostung aktualisiert' : '✅ Verkostung gespeichert', 'success');
    UI.switchTab('collection');
  },

  // ── Render: Sammlung ──────────────────────────────────────────
  renderCollection() {
    const container = document.getElementById('cardsContainer');
    const query = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortSelect').value;

    let list = TJ.getItems(this.CATEGORY).filter(t => {
      if (this.favFilterActive && !t.favorite) return false;
      return (t.name || '').toLowerCase().includes(query) ||
        (t.distillery || '').toLowerCase().includes(query) ||
        (t.country || '').toLowerCase().includes(query) ||
        (t.region || '').toLowerCase().includes(query);
    });

    list.sort((a, b) => {
      if (sort === 'date-desc') return parseInt(b.id) - parseInt(a.id);
      if (sort === 'date-asc') return parseInt(a.id) - parseInt(b.id);
      if (sort === 'score-desc') return (b.score || 0) - (a.score || 0);
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    if (list.length === 0) {
      container.innerHTML = UI.emptyState('🥃',
        query ? 'Keine Ergebnisse gefunden.' : 'Noch keine Whisky-Verkostungen. Füge deine erste hinzu!');
      return;
    }

    container.innerHTML = '<div class="cards-grid">' + list.map(t => `
      <div class="tasting-card" onclick="App.openModal('${t.id}')">
        <button class="fav-btn${t.favorite ? ' active' : ''}" onclick="App.toggleFavorite('${t.id}', event)" title="Favorit">${t.favorite ? '♥' : '♡'}</button>
        ${t.photo
          ? `<img class="card-img" src="${t.photo}" alt="${escapeHtml(t.name)}" />`
          : `<div class="card-img-placeholder">🥃</div>`}
        <div class="card-body">
          <div class="card-name">${escapeHtml(t.name)}</div>
          <div class="card-sub">${escapeHtml(t.distillery) || '—'}</div>
          <div class="card-meta">
            ${t.country ? `<span class="badge accent">${escapeHtml(t.country)}</span>` : ''}
            ${t.age ? `<span class="badge">${escapeHtml(t.age)} Jahre</span>` : ''}
            ${t.abv ? `<span class="badge">${escapeHtml(t.abv)}%</span>` : ''}
            ${t.cask ? `<span class="badge">${escapeHtml(t.cask)}</span>` : ''}
          </div>
          <div class="card-score">
            <span class="score-badge">${t.score}</span>
            <span class="stars-display">${starsHtml(t.stars)}</span>
          </div>
          ${t.nose ? `<div class="card-note">${escapeHtml(t.nose)}</div>` : ''}
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
    document.getElementById('modalSubtitle').textContent = t.distillery || '';

    let html = '';
    if (t.photo) html += `<img class="modal-img" src="${t.photo}" />`;
    html += '<div class="detail-grid">';
    if (t.country) html += this.detail('Land', escapeHtml(t.country));
    if (t.region) html += this.detail('Region', escapeHtml(t.region));
    if (t.age) html += this.detail('Alter', escapeHtml(t.age) + ' Jahre');
    if (t.abv) html += this.detail('ABV', escapeHtml(t.abv) + '%');
    if (t.cask) html += this.detail('Fass / Finish', escapeHtml(t.cask));
    if (t.price) html += this.detail('Preis', escapeHtml(t.price) + ' €');
    if (t.date) html += this.detail('Verkostet am', formatDate(t.date));
    html += this.detail('Bewertung',
      `<span class="score-badge">${t.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(t.stars)}</span>`);
    html += '</div>';

    if (t.nose) html += this.section('🌸 Nase', escapeHtml(t.nose));
    if (t.palate) html += this.section('👅 Gaumen', escapeHtml(t.palate));
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
    const countries = [...new Set(items.map(t => t.country).filter(Boolean))];
    const byCountry = {};
    items.forEach(t => { if (t.country) byCountry[t.country] = (byCountry[t.country] || 0) + 1; });
    const topCountry = Object.entries(byCountry).sort((a, b) => b[1] - a[1])[0];

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${items.length}</div><div class="stat-label">Verkostungen</div></div>
        <div class="stat-card"><div class="stat-value">${avg}</div><div class="stat-label">Ø Punkte</div></div>
        <div class="stat-card"><div class="stat-value">${countries.length}</div><div class="stat-label">Länder</div></div>
        ${topCountry ? `<div class="stat-card"><div class="stat-value">${topCountry[1]}</div><div class="stat-label">aus ${escapeHtml(topCountry[0])}</div></div>` : ''}
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Bester Whisky</h2>
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:0.5rem">
          ${best.photo ? `<img src="${best.photo}" style="height:80px;border-radius:6px;object-fit:cover" />` : '<div style="font-size:3rem">🥇</div>'}
          <div>
            <div style="font-size:1.3rem;color:var(--amber-light)">${escapeHtml(best.name)}</div>
            <div style="color:var(--text-muted)">${escapeHtml(best.distillery) || ''} ${best.country ? '· ' + escapeHtml(best.country) : ''}</div>
            <div style="margin-top:0.5rem"><span class="score-badge">${best.score}/100</span> &nbsp; <span class="stars-display">${starsHtml(best.stars)}</span></div>
          </div>
        </div>
      </div>
      <div class="form-card" style="margin-bottom:1.5rem">
        <h2>Nach Herkunft</h2>
        <div style="margin-top:1rem">
          ${Object.entries(byCountry).sort((a,b)=>b[1]-a[1]).map(([c,n]) => `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem">
              <span style="min-width:120px;color:var(--text-muted)">${escapeHtml(c)}</span>
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
              ${t.photo ? `<img src="${t.photo}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;flex-shrink:0" />` : `<div style="width:40px;height:40px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">🥃</div>`}
              <div style="flex:1;min-width:0">
                <div style="color:var(--amber-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.name)}</div>
                <div style="color:var(--text-muted);font-size:0.8rem">${escapeHtml(t.distillery||'')}${t.country?' · '+escapeHtml(t.country):''}</div>
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

  // ── Tab-Wechsel-Hook ──────────────────────────────────────────
  onTabSwitch(name) {
    if (name === 'collection') this.renderCollection();
    if (name === 'stats') this.renderStats();
    if (name === 'settings') UI.renderSettingsContent();
  },
};

// ── Layout zusammenbauen ──────────────────────────────────────
document.getElementById('headerContainer').innerHTML = UI.renderHeader({
  icon: '🥃',
  title: 'Whisky',
  subtitle: 'Single Malt, Bourbon & Co.',
  accent: 'whisky',
});
document.getElementById('setupContainer').innerHTML = UI.renderSetupModal();
document.getElementById('starPickerContainer').innerHTML = UI.renderStarPicker();
document.getElementById('photoUploadContainer').innerHTML = UI.renderPhotoUpload();
document.getElementById('settingsContainer').innerHTML = UI.renderSettingsTab();
document.getElementById('detailModalContainer').innerHTML = UI.renderDetailModal();

// Backdrop-Click
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

TJ.init('whisky');
