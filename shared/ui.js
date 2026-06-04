// ╔═══════════════════════════════════════════════════════════════╗
// ║  UI – Geteilte UI-Komponenten für alle Kategorien             ║
// ║  Header, Setup-Modal, Notification, Filter, Karten            ║
// ╚═══════════════════════════════════════════════════════════════╝

const UI = {
  // ── Header (kategorie-spezifisch) ──────────────────────────────
  renderHeader(opts) {
    const { icon, title, subtitle, accent, isHome } = opts;
    const username = (typeof TJ !== 'undefined' && TJ.getUsername()) ? TJ.getUsername() + 's ' : '';
    return `
<header class="cat-${accent}">
  ${isHome ? '' : '<a href="index.html" class="back-link" title="Zur Übersicht">←</a>'}
  <div class="glass-icon">${icon}</div>
  <div class="header-text">
    <h1>${escapeHtml(username)}${escapeHtml(title)}</h1>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
  </div>
  <div class="sync-status" id="syncStatus" title="Sync-Status">
    <span class="sync-dot"></span>
    <span class="sync-text">Lade…</span>
  </div>
  <span class="version-badge" title="Version">${typeof TJ_VERSION !== 'undefined' ? TJ_VERSION : ''}</span>
  <a href="settings.html" class="header-icon-btn" title="Einstellungen" aria-label="Einstellungen">⚙️</a>
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
          <strong>Dein Name</strong>
          <p>Wie soll dein Tasting Journal heißen? Der Name wird in der App angezeigt.</p>
          <input type="text" id="setupUsername" placeholder="z.B. Heinrich" autocomplete="off" />
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">2</div>
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
        <div class="step-num">3</div>
        <div class="step-content">
          <strong>Token hier einfügen</strong>
          <input type="password" id="setupToken" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" />
        </div>
      </div>

      <div class="setup-step">
        <div class="step-num">4</div>
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
    <div class="photo-hint" style="font-size:0.75rem;margin-top:0.3rem" id="photoHintSub">
      ${typeof GDrive !== 'undefined' && GDrive.isConnected() ? 'Wird in Google Drive gespeichert' : 'Wird lokal komprimiert gespeichert'}
    </div>
  </div>
  <div id="photoUploading" style="display:none;text-align:center;padding:1rem">
    <div style="font-size:1.5rem">⏳</div>
    <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.3rem">Lade hoch…</div>
  </div>
  <img id="photoPreview" class="photo-preview" style="display:none" />
</div>`;
  },

  async previewPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const hint = document.getElementById('photoHint');
    const uploading = document.getElementById('photoUploading');
    const preview = document.getElementById('photoPreview');

    // Immer zuerst lokal komprimieren (für Preview)
    const compressed = await compressImage(file);
    preview.src = compressed;

    if (typeof GDrive !== 'undefined' && GDrive.isConnected()) {
      hint.style.display = 'none';
      uploading.style.display = 'block';
      preview.style.display = 'none';
      try {
        const filename = 'photo_' + Date.now() + '.jpg';
        const driveUrl = await GDrive.uploadPhoto(compressed, filename);
        preview.src = driveUrl;
        preview.style.display = 'block';
        uploading.style.display = 'none';
        TJ.notify('📷 Foto in Google Drive gespeichert', 'success');
      } catch (err) {
        console.error(err);
        uploading.style.display = 'none';
        // Fallback: lokal speichern
        preview.src = compressed;
        preview.style.display = 'block';
        hint.style.display = 'none';
        TJ.notify('⚠️ Drive-Upload fehlgeschlagen – lokal gespeichert', 'error');
      }
    } else {
      preview.style.display = 'block';
      hint.style.display = 'none';
    }
  },

  getPhotoData() {
    const photoEl = document.getElementById('photoPreview');
    return photoEl.style.display === 'block' ? photoEl.src : '';
  },

  setPhotoData(src) {
    const preview = document.getElementById('photoPreview');
    const hint = document.getElementById('photoHint');
    const uploading = document.getElementById('photoUploading');
    if (uploading) uploading.style.display = 'none';
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

  updateHeaderTitle(title) {
    const h1 = document.querySelector('header h1');
    if (!h1) return;
    const username = (typeof TJ !== 'undefined' && TJ.getUsername()) ? TJ.getUsername() + 's ' : '';
    h1.textContent = username + title;
  },

  // ── Tab-Switching ──────────────────────────────────────────────
  switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    const btn = document.querySelector(`[data-tab="${name}"]`);
    if (btn) btn.classList.add('active');
    if (typeof App !== 'undefined' && App.onTabSwitch) App.onTabSwitch(name);
  },

  // ── Kategorie-Settings-Tab ─────────────────────────────────────
  // Nur kategoriespezifische Einstellungen. Globale Einstellungen
  // (GitHub-Verbindung, Import/Export, Reset) liegen in settings.html.
  renderSettingsTab() {
    return `
<div id="tab-settings" class="tab-content">
  <div class="form-card">
    <h2>Einstellungen</h2>
    <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem">
      Hier kommen später kategoriespezifische Einstellungen hin.
    </p>
    <div class="settings-row">
      <div>
        <strong>Globale Einstellungen</strong>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:0.3rem">GitHub-Verbindung, Import &amp; Export, Daten neu laden – alles auf der Übersichtsseite.</p>
      </div>
      <a href="settings.html" class="btn btn-primary" style="text-decoration:none;display:inline-block">⚙️ Globale Einstellungen öffnen</a>
    </div>
  </div>
</div>`;
  },

  renderSettingsContent() {
    // Wird derzeit nicht mehr für globale Settings genutzt.
    // Platzhalter für zukünftige kategoriespezifische Settings.
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
      const categories = ['whisky', 'shisha', 'kaffee'];
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
