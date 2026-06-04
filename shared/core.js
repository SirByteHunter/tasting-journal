// ╔═══════════════════════════════════════════════════════════════╗
// ║  Core – Geteilte Logik für alle Kategorien                    ║
// ║  GitHub Gist Sync, Setup, Cache, Notifications                ║
// ╚═══════════════════════════════════════════════════════════════╝

const TJ = {
  TOKEN_KEY: 'tj_gh_token',
  GIST_KEY: 'tj_gist_id',
  GIST_FILENAME: 'tastings.json',
  CACHE_KEY: 'tj_cache',

  token: null,
  gistId: null,
  data: { meta: {}, whisky: [], shisha: [], kaffee: [] },
  isDirty: false,
  saveTimer: null,
  currentCategory: null,

  // ── Nutzername ─────────────────────────────────────────────────
  getUsername() {
    return (this.data.meta && this.data.meta.username) || '';
  },

  async setUsername(name) {
    if (!this.data.meta) this.data.meta = {};
    this.data.meta.username = name.trim();
    this.saveCache();
    await this.saveData();
  },

  // ── Sync-Status ────────────────────────────────────────────────
  setSyncStatus(state, text) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.classList.remove('synced', 'syncing', 'error');
    el.classList.add(state);
    const t = el.querySelector('.sync-text');
    if (t) t.textContent = text;
  },

  // ── Notifications ──────────────────────────────────────────────
  notify(msg, type) {
    let el = document.getElementById('notification');
    if (!el) {
      el = document.createElement('div');
      el.id = 'notification';
      el.className = 'notification';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'notification show' + (type ? ' ' + type : '');
    clearTimeout(this._notifyTimer);
    this._notifyTimer = setTimeout(() => { el.className = 'notification'; }, 3000);
  },

  // ── GitHub Gist API ────────────────────────────────────────────
  async ghFetch(url, options) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options && options.headers),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API ${res.status}: ${text}`);
    }
    return res.json();
  },

  async createGist() {
    const initial = { meta: {}, whisky: [], shisha: [] };
    const data = await this.ghFetch('https://api.github.com/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Tasting Journal – Daten',
        public: false,
        files: {
          [this.GIST_FILENAME]: { content: JSON.stringify(initial, null, 2) },
        },
      }),
    });
    return data.id;
  },

  async loadFromGist() {
    const data = await this.ghFetch(`https://api.github.com/gists/${this.gistId}`);
    const file = data.files[this.GIST_FILENAME];
    if (!file) {
      return { whisky: [], shisha: [] };
    }
    let raw;
    if (file.truncated) {
      raw = await fetch(file.raw_url).then(r => r.text());
    } else {
      raw = file.content;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { whisky: [], shisha: [] };
    }
    // Migration: alte Whisky-only Struktur (Array) → neues Objekt
    if (Array.isArray(parsed)) {
      parsed = { whisky: parsed, shisha: [] };
    }
    // Sicherstellen, dass alle Kategorien existieren
    if (!parsed.meta) parsed.meta = {};
    if (!parsed.whisky) parsed.whisky = [];
    if (!parsed.shisha) parsed.shisha = [];
    if (!parsed.kaffee) parsed.kaffee = [];
    return parsed;
  },

  async saveToGist() {
    await this.ghFetch(`https://api.github.com/gists/${this.gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        files: {
          [this.GIST_FILENAME]: { content: JSON.stringify(this.data, null, 2) },
        },
      }),
    });
  },

  // ── Setup-Flow ─────────────────────────────────────────────────
  async setupComplete() {
    const newToken = document.getElementById('setupToken').value.trim();
    const newGistId = document.getElementById('setupGistId').value.trim();
    const newUsername = (document.getElementById('setupUsername').value || '').trim();

    if (!newToken) {
      this.notify('Bitte Token eingeben', 'error');
      return;
    }
    if (!newToken.match(/^(ghp|github_pat)_/)) {
      this.notify('Token sollte mit "ghp_" oder "github_pat_" beginnen', 'error');
      return;
    }

    this.token = newToken;
    this.setSyncStatus('syncing', 'Verbinde…');

    try {
      if (newGistId) {
        this.gistId = newGistId;
        await this.ghFetch(`https://api.github.com/gists/${this.gistId}`);
      } else {
        this.gistId = await this.createGist();
      }

      localStorage.setItem(this.TOKEN_KEY, this.token);
      localStorage.setItem(this.GIST_KEY, this.gistId);

      const setupModal = document.getElementById('setupModal');
      if (setupModal) {
        setupModal.classList.remove('open');
        setupModal.style.display = 'none';
      }
      const appContent = document.getElementById('appContent');
      if (appContent) appContent.style.display = 'block';

      this.notify('✅ Verbindung hergestellt – Gist-ID: ' + this.gistId.substring(0, 8) + '…', 'success');
      await this.loadData();
      // Namen speichern wenn angegeben
      if (newUsername) {
        if (!this.data.meta) this.data.meta = {};
        this.data.meta.username = newUsername;
        this.saveCache();
        await this.saveData();
      }
      if (typeof onSetupComplete === 'function') onSetupComplete();
    } catch (e) {
      console.error(e);
      this.notify('Fehler: ' + e.message, 'error');
      this.setSyncStatus('error', 'Fehler');
      this.token = null;
    }
  },

  resetSetup() {
    if (!confirm('Token und Gist-ID von diesem Gerät entfernen? Die Daten im Gist bleiben erhalten.')) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.GIST_KEY);
    localStorage.removeItem(this.CACHE_KEY);
    location.reload();
  },

  // ── Cache ──────────────────────────────────────────────────────
  saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Cache zu groß', e);
    }
  },

  loadCache() {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          this.data = { meta: {}, whisky: parsed, shisha: [], kaffee: [] };
        } else {
          this.data = parsed;
        }
        if (!this.data.meta) this.data.meta = {};
        if (!this.data.whisky) this.data.whisky = [];
        if (!this.data.shisha) this.data.shisha = [];
        if (!this.data.kaffee) this.data.kaffee = [];
      } catch (e) {
        this.data = { whisky: [], shisha: [] };
      }
    }
  },

  // ── Persistenz ─────────────────────────────────────────────────
  async saveData() {
    this.isDirty = true;
    this.setSyncStatus('syncing', 'Speichern…');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(async () => {
      try {
        await this.saveToGist();
        this.isDirty = false;
        this.setSyncStatus('synced', 'Synchronisiert');
      } catch (e) {
        console.error(e);
        this.setSyncStatus('error', 'Sync-Fehler');
        this.notify('Speichern fehlgeschlagen: ' + e.message, 'error');
      }
    }, 500);
  },

  async loadData() {
    this.setSyncStatus('syncing', 'Lade…');
    try {
      this.data = await this.loadFromGist();
      this.saveCache();
      this.setSyncStatus('synced', 'Synchronisiert');
      if (typeof onDataLoaded === 'function') onDataLoaded();
    } catch (e) {
      console.error(e);
      this.setSyncStatus('error', 'Offline');
      this.notify('Konnte nicht laden – nutze lokale Kopie', 'error');
      this.loadCache();
      if (typeof onDataLoaded === 'function') onDataLoaded();
    }
  },

  // ── Helpers für die Kategorie-Seiten ───────────────────────────
  getItems(category) {
    return this.data[category] || [];
  },

  upsertItem(category, item) {
    if (!this.data[category]) this.data[category] = [];
    const list = this.data[category];
    const idx = list.findIndex(x => x.id === item.id);
    if (idx > -1) list[idx] = item;
    else list.unshift(item);
  },

  removeItem(category, id) {
    if (!this.data[category]) return;
    this.data[category] = this.data[category].filter(x => x.id !== id);
  },

  // ── Init ───────────────────────────────────────────────────────
  init(category) {
    this.currentCategory = category;
    this.token = localStorage.getItem(this.TOKEN_KEY);
    this.gistId = localStorage.getItem(this.GIST_KEY);

    if (this.token && this.gistId) {
      const setupModal = document.getElementById('setupModal');
      if (setupModal) setupModal.style.display = 'none';
      const appContent = document.getElementById('appContent');
      if (appContent) appContent.style.display = 'block';
      this.loadCache();
      if (typeof onDataLoaded === 'function') onDataLoaded();
      this.loadData();
    } else {
      const setupModal = document.getElementById('setupModal');
      if (setupModal) setupModal.classList.add('open');
    }

    // Auto-Reload bei Tab-Wechsel
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.token && this.gistId && !this.isDirty) {
        this.loadData();
      }
    });
  },
};

// ── Helpers (global verfügbar) ─────────────────────────────────
function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

function starsHtml(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - (n || 0));
}

function compressImage(file, maxWidth = 1024, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = h * (maxWidth / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
