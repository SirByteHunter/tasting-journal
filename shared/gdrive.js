// ╔═══════════════════════════════════════════════════════════════╗
// ║  Google Drive – Foto-Upload für Tasting Journal               ║
// ╚═══════════════════════════════════════════════════════════════╝

const GDrive = {
  CLIENT_ID: '703760744986-04dnph9o58soupsmmjvfqe8uek11p0d9.apps.googleusercontent.com',
  SCOPE: 'https://www.googleapis.com/auth/drive.file',
  TOKEN_KEY: 'tj_gdrive_token',
  TOKEN_EXPIRY_KEY: 'tj_gdrive_expiry',
  FOLDER_KEY: 'tj_gdrive_folder',
  FOLDER_NAME: 'tasting-journal-pics',

  token: null,
  folderId: null,

  // ── Token laden ────────────────────────────────────────────────
  loadToken() {
    const expiry = parseInt(localStorage.getItem(this.TOKEN_EXPIRY_KEY) || '0');
    if (Date.now() < expiry) {
      this.token = localStorage.getItem(this.TOKEN_KEY);
      this.folderId = localStorage.getItem(this.FOLDER_KEY) || null;
      return !!this.token;
    }
    this.token = null;
    return false;
  },

  saveToken(token, expiresIn) {
    this.token = token;
    const expiry = Date.now() + (expiresIn - 60) * 1000;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
  },

  isConnected() {
    return this.loadToken();
  },

  disconnect() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.FOLDER_KEY);
    this.token = null;
    this.folderId = null;
  },

  // ── OAuth2 Login (Popup) ───────────────────────────────────────
  login() {
    return new Promise((resolve, reject) => {
      const redirectUri = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/') + 'gdrive-callback.html';
      const params = new URLSearchParams({
        client_id: this.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: this.SCOPE,
        prompt: 'consent',
      });
      const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();

      const popup = window.open(url, 'google-auth', 'width=500,height=600,scrollbars=yes');
      if (!popup) {
        reject(new Error('Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.'));
        return;
      }

      const handler = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'gdrive-token') {
          window.removeEventListener('message', handler);
          this.saveToken(event.data.token, event.data.expiresIn);
          resolve(event.data.token);
        }
        if (event.data && event.data.type === 'gdrive-error') {
          window.removeEventListener('message', handler);
          reject(new Error(event.data.error));
        }
      };
      window.addEventListener('message', handler);

      // Fallback: Popup geschlossen ohne Ergebnis
      const check = setInterval(() => {
        if (popup.closed) {
          clearInterval(check);
          window.removeEventListener('message', handler);
          reject(new Error('Login abgebrochen'));
        }
      }, 1000);
    });
  },

  // ── API-Aufruf ─────────────────────────────────────────────────
  async apiFetch(url, options = {}) {
    if (!this.token) throw new Error('Nicht mit Google Drive verbunden');
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': 'Bearer ' + this.token,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      this.disconnect();
      throw new Error('Google Drive Token abgelaufen – bitte neu verbinden');
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Drive API Fehler ' + res.status + ': ' + text);
    }
    return res.json();
  },

  // ── Ordner holen oder anlegen ──────────────────────────────────
  async getOrCreateFolder() {
    if (this.folderId) return this.folderId;
    const cached = localStorage.getItem(this.FOLDER_KEY);
    if (cached) { this.folderId = cached; return cached; }

    // Suchen
    const query = `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const search = await this.apiFetch(
      'https://www.googleapis.com/drive/v3/files?q=' + encodeURIComponent(query) + '&fields=files(id,name)'
    );
    if (search.files && search.files.length > 0) {
      this.folderId = search.files[0].id;
      localStorage.setItem(this.FOLDER_KEY, this.folderId);
      return this.folderId;
    }

    // Anlegen
    const created = await this.apiFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: this.FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    this.folderId = created.id;
    localStorage.setItem(this.FOLDER_KEY, this.folderId);
    return this.folderId;
  },

  // ── Foto hochladen ─────────────────────────────────────────────
  async uploadPhoto(dataUrl, filename) {
    this.loadToken();
    if (!this.token) throw new Error('Nicht mit Google Drive verbunden');

    const folderId = await this.getOrCreateFolder();

    // Base64 → Blob
    const [header, base64] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });

    // Multipart Upload
    const metadata = JSON.stringify({ name: filename, parents: [folderId] });
    const boundary = 'tasting_journal_boundary';
    const body = [
      '--' + boundary,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      '--' + boundary,
      'Content-Type: ' + mimeType,
      '',
      '',
    ].join('\r\n');

    const formData = new FormData();
    formData.append('metadata', new Blob([metadata], { type: 'application/json' }));
    formData.append('file', blob);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webContentLink,webViewLink',
      {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + this.token },
        body: formData,
      }
    );
    if (res.status === 401) {
      this.disconnect();
      throw new Error('Google Drive Token abgelaufen – bitte neu verbinden');
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Upload fehlgeschlagen: ' + text);
    }
    const file = await res.json();

    // Datei öffentlich lesbar machen
    await this.apiFetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    // Direkte Bild-URL
    return `https://drive.google.com/thumbnail?id=${file.id}&sz=w1024`;
  },

  // ── Foto löschen ───────────────────────────────────────────────
  async deletePhoto(url) {
    const match = url.match(/[?&]id=([^&]+)/);
    if (!match) return;
    const fileId = match[1];
    this.loadToken();
    if (!this.token) return;
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + this.token },
      });
    } catch (e) {
      console.warn('Foto konnte nicht gelöscht werden:', e);
    }
  },
};
