// ╔═══════════════════════════════════════════════════════════════╗
// ║  UI – Geteilte UI-Komponenten für alle Kategorien             ║
// ║  Header, Setup-Modal, Notification, Filter, Karten            ║
// ╚═══════════════════════════════════════════════════════════════╝

const UI = {
  // ── Header (kategorie-spezifisch) ──────────────────────────────
  renderHeader(opts) {
    const { icon, title, subtitle, accent } = opts;
    return `
<header class="cat-${accent}">
  <a href="index.html" class="back-link" title="Zur Übersicht">←</a>
  <div class="glass-icon">${icon}</div>
  <div class="header-text">
    <h1>${escapeHtml(title)}</h1>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
  </div>
  <div class="sync-status" id="syncStatus" title="Sync-Status">
    <span class="sync-dot"></span>
    <span class="sync-text">Lade…</span>
  </div>
</header>`;
  },

  // ── Setup-Modal (überall gleich) ───────────────────────────────
  renderSetupModal() {
    return `
<div class="modal-overlay" id="setupModal">
  <div class="modal">
    <div class="modal-header">
      <h2>👋 Willkommen!</h2>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:1rem">Damit deine Verkostungen auf allen Geräten verfügbar sind, brauchen wir deinen GitHub-Zugang. Das passiert nur einmal pro Gerät.</p>

      <div class="setup-step">
        <div class="step-num">1</div>
        <div class="step-content">
          <strong>GitHub Personal Access Token erstellen</strong>
          <p>Klicke auf den folgenden Link – die Berechtigungen sind bereits voreingestellt:</p>
          <a href="https://github.com/settings/tokens/new?description=Tasting%20Journal&scopes=gist" target="_blank" class="btn btn-primary" style="margin-top:0.5rem;display:inline-block;text-decoration:none">
            🔑 Token erstellen
          </a>
          <p class="hint">Wähle „No expiration" für unbegrenzte Gültigkeit oder ein längeres Ablaufdatum. Klicke unten auf „Generate token" und kopiere den Token.</p>
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">2</div>
        <div class="step-content">
          <strong>Token hier einfügen</strong>
          <input type="password" id="setupToken" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" />
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">3</div>
        <div class="step-content">
          <strong>Gist-ID (optional)</strong>
          <p>Wenn du bereits einen Gist hast (z.B. weil du auf einem anderen Gerät schon eingerichtet hast), füge die Gist-ID hier ein. Lass das Feld leer, um einen neuen Gist anzulegen.</p>
          <input type="text" id="setupGistId" placeholder="z.B. abc123def456 (leer lassen für neu)" autocomplete="off" />
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="TJ.setupComplete()">✓ Einrichten</button>
    </div>
  </div>
</div>`;
  },

  // ── Generisches Detail-Modal ───────────────────────────────────
  renderDetailModal() {
    return `
<div class="modal-overlay" id="detailModal">
  <div class="modal">
    <div class="modal-header">
      <div>
        <h2 id="modalName"></h2>
        <div style="color:var(--text-muted);font-size:0.9rem;margin-top:0.25rem" id="modalSubtitle"></div>
      </div>
      <button class="modal-close" onclick="UI.closeDetailModal()">✕</button>
    </div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="App.editFromModal()">✏️ Bearbeiten</button>
      <button class="btn btn-danger" onclick="App.deleteFromModal()">🗑 Löschen</button>
      <button class="btn btn-primary" onclick="UI.closeDetailModal()">Schließen</button>
    </div>
  </div>
</div>`;
  },

  closeDetailModal() {
    document.getElementById('detailModal').classList.remove('open');
    if (window.App) App.currentModalId = null;
  },

  // ── Star-Picker ────────────────────────────────────────────────
  renderStarPicker() {
    return `
<div class="star-container">
  <input type="radio" name="stars" id="s5" value="5" /><label for="s5">★</label>
  <input type="radio" name="stars" id="s4" value="4" /><label for="s4">★</label>
  <input type="radio" name="stars" id="s3" value="3" checked /><label for="s3">★</label>
  <input type="radio" name="stars" id="s2" value="2" /><label for="s2">★</label>
  <input type="radio" name="stars" id="s1" value="1" /><label for="s1">★</label>
</div>`;
  },

  getStars() {
    const checked = document.querySelector('input[name="stars"]:checked');
    return checked ? parseInt(checked.value) : 3;
  },

  setStars(val) {
    const r = document.querySelector('input[name="stars"][value="' + val + '"]');
    if (r) r.checked = true;
  },

  // ── Photo-Upload ───────────────────────────────────────────────
  renderPhotoUpload() {
    return `
<div class="photo-upload" id="photoUploadArea">
  <input type="file" id="f-photo" accept="image/*" onchange="UI.previewPhoto(event)" />
  <div id="photoHint">
    <div style="font-size:2rem">📷</div>
    <div class="photo-hint">Klicken oder Foto auswählen</div>
    <div class="photo-hint" style="font-size:0.75rem;margin-top:0.3rem">Wird automatisch komprimiert</div>
  </div>
  <img id="photoPreview" class="photo-preview" style="display:none" />
</div>`;
  },

  async previewPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const img = document.getElementById('photoPreview');
    img.src = compressed;
    img.style.display = 'block';
    document.getElementById('photoHint').style.display = 'none';
  },

  getPhotoData() {
    const photoEl = document.getElementById('photoPreview');
    return photoEl.style.display === 'block' ? photoEl.src : '';
  },

  setPhotoData(src) {
    const preview = document.getElementById('photoPreview');
    const hint = document.getElementById('photoHint');
    if (src) {
      preview.src = src;
      preview.style.display = 'block';
      hint.style.display = 'none';
    } else {
      preview.style.display = 'none';
      preview.src = '';
      hint.style.display = 'block';
    }
  },

  // ── Tab-Switching ──────────────────────────────────────────────
  switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    const btn = document.querySelector(`[data-tab="${name}"]`);
    if (btn) btn.classList.add('active');
    if (window.App && App.onTabSwitch) App.onTabSwitch(name);
  },

  // ── Settings-Tab (gleich für alle Kategorien) ──────────────────
  renderSettingsTab() {
    return `
<div id="tab-settings" class="tab-content">
  <div class="form-card">
    <h2>Einstellungen</h2>
    <div class="settings-row">
      <div>
        <strong>GitHub-Verbindung</strong>
        <div id="connectionInfo" style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem"></div>
      </div>
      <button class="btn btn-secondary" onclick="UI.copyGistId()">📋 Gist-ID kopieren</button>
    </div>
    <div class="settings-row">
      <div>
        <strong>Daten exportieren</strong>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">JSON-Datei mit ALLEN Verkostungen (alle Kategorien) herunterladen.</p>
      </div>
      <button class="btn btn-secondary" onclick="UI.exportJson()">⬇️ Download JSON</button>
    </div>
    <div class="settings-row">
      <div>
        <strong>Daten importieren</strong>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">JSON-Datei einlesen. <strong style="color:var(--danger)">Achtung:</strong> Ersetzt ALLE bestehenden Daten komplett. Vorher exportieren als Backup empfohlen.</p>
      </div>
      <button class="btn btn-secondary" onclick="UI.triggerImport()">⬆️ Import JSON</button>
      <input type="file" id="importFileInput" accept="application/json,.json" style="display:none" onchange="UI.handleImport(event)" />
    </div>
    <div class="settings-row">
      <div>
        <strong>Daten neu laden</strong>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">Falls du auf einem anderen Gerät Änderungen gemacht hast.</p>
      </div>
      <button class="btn btn-secondary" onclick="TJ.loadData()">🔄 Aktualisieren</button>
    </div>
    <div class="settings-row">
      <div>
        <strong style="color:var(--danger)">Verbindung trennen</strong>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">Token von diesem Gerät entfernen. Daten im Gist bleiben erhalten.</p>
      </div>
      <button class="btn btn-danger" onclick="TJ.resetSetup()">🚪 Trennen</button>
    </div>
  </div>
</div>`;
  },

  renderSettingsContent() {
    const info = document.getElementById('connectionInfo');
    if (!info || !TJ.gistId) return;
    info.innerHTML = `
      Verbunden mit Gist <code style="background:var(--bg2);padding:0.1rem 0.4rem;border-radius:4px;color:var(--amber-light)">${TJ.gistId.substring(0, 8)}…${TJ.gistId.substring(TJ.gistId.length - 4)}</code><br>
      <a href="https://gist.github.com/${TJ.gistId}" target="_blank" style="color:var(--amber);font-size:0.85rem">Auf GitHub öffnen ↗</a>
    `;
  },

  copyGistId() {
    if (!TJ.gistId) return;
    navigator.clipboard.writeText(TJ.gistId).then(() => {
      TJ.notify('Gist-ID in Zwischenablage kopiert', 'success');
    });
  },

  exportJson() {
    const blob = new Blob([JSON.stringify(TJ.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasting-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ── Import ─────────────────────────────────────────────────────
  triggerImport() {
    document.getElementById('importFileInput').click();
  },

  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reset, damit dieselbe Datei erneut gewählt werden kann
    event.target.value = '';

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        TJ.notify('❌ Datei ist kein gültiges JSON', 'error');
        return;
      }

      // Migration: alte Whisky-only Struktur (Array) → Objekt
      if (Array.isArray(parsed)) {
        parsed = { whisky: parsed, shisha: [] };
      }

      // Validierung: muss ein Objekt mit Kategorie-Arrays sein
      if (typeof parsed !== 'object' || parsed === null) {
        TJ.notify('❌ Ungültiges Format', 'error');
        return;
      }

      // Sicherstellen, dass Kategorien existieren und Arrays sind
      const categories = ['whisky', 'shisha'];
      const counts = {};
      for (const cat of categories) {
        if (!parsed[cat]) parsed[cat] = [];
        if (!Array.isArray(parsed[cat])) {
          TJ.notify(`❌ Kategorie "${cat}" ist kein Array`, 'error');
          return;
        }
        counts[cat] = parsed[cat].length;
      }

      // Aktuelle Anzahlen für Vergleich
      const currentCounts = {
        whisky: TJ.getItems('whisky').length,
        shisha: TJ.getItems('shisha').length,
      };

      // Sicherheitsabfrage
      const totalNew = counts.whisky + counts.shisha;
      const totalCurrent = currentCounts.whisky + currentCounts.shisha;
      const confirmMsg =
        `⚠️ ACHTUNG: Alle bestehenden Daten werden komplett ersetzt!\n\n` +
        `Aktuell:\n` +
        `  • ${currentCounts.whisky} Whisky-Verkostungen\n` +
        `  • ${currentCounts.shisha} Shisha-Verkostungen\n` +
        `  = ${totalCurrent} gesamt\n\n` +
        `Nach Import:\n` +
        `  • ${counts.whisky} Whisky-Verkostungen\n` +
        `  • ${counts.shisha} Shisha-Verkostungen\n` +
        `  = ${totalNew} gesamt\n\n` +
        `Hast du vorher ein Backup exportiert?\n\n` +
        `Wirklich ersetzen?`;

      if (!confirm(confirmMsg)) {
        TJ.notify('Import abgebrochen', 'success');
        return;
      }

      // Ersetzen
      TJ.data = parsed;
      TJ.saveCache();
      await TJ.saveData();
      TJ.notify(`✅ ${totalNew} Verkostungen importiert`, 'success');

      // UI neu rendern
      if (window.App && App.renderCollection) {
        App.renderCollection();
      } else if (typeof onDataLoaded === 'function') {
        onDataLoaded();
      }
    } catch (e) {
      console.error(e);
      TJ.notify('❌ Import fehlgeschlagen: ' + e.message, 'error');
    }
  },

  // ── Empty State ────────────────────────────────────────────────
  emptyState(icon, msg) {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${escapeHtml(msg)}</p></div>`;
  },
};

// Modal-Backdrop-Click schließt Detail-Modal
document.addEventListener('DOMContentLoaded', () => {
  const detail = document.getElementById('detailModal');
  if (detail) {
    detail.addEventListener('click', e => {
      if (e.target === detail) UI.closeDetailModal();
    });
  }
});
