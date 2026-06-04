# 🍷 Tasting Journal

Eine schlanke, schöne Web-App für deine persönliche Verkostungssammlung – Whisky, Shisha-Tabak und mehr. Metadaten werden in einem privaten GitHub Gist gespeichert, Fotos in Google Drive – beides syncet automatisch zwischen all deinen Geräten.

**Aktuelle Version: 1.3.4**

## ✨ Features

- 🥃 **Whisky-Verkostungen** – Nase, Gaumen, Abgang, Punktzahl, Sterne, Foto
- 💨 **Shisha-Tabak-Verkostungen** – Marke, Geschmack, Hitzeverhalten, Rauchentwicklung, Nikotinstärke, Verpackungsgröße, €/g Berechnung
- 🔍 **Suche & Sortierung** in jeder Kategorie
- 🎛 **Filter** – Shisha: nach Marke, Geschmacksrichtung, Sterne; beide: Favoriten-Filter
- ♥ **Favoriten** – Herz-Button auf jeder Karte, Favoriten-Filter in der Sammlung
- 📊 **Statistiken** – Durchschnittspunkte, Bester Eintrag, Verteilungen, **Top 10 Ranking**
- 📦 **Vollständiges Backup** – ZIP mit JSON + allen Fotos aus Google Drive
- ☁️ **Sync zwischen allen Geräten** via privatem GitHub Gist
- 📸 **Google Drive Foto-Speicher** – automatischer Token-Refresh, skaliert für hunderte Einträge
- 📱 **Auf Handy als App nutzbar** – über Safari/Chrome zum Homescreen hinzufügen
- 🔒 **Daten gehören dir** – alles in DEINEM privaten Gist und Google Drive
- ⚡ **Offline-fähig** – lokaler Cache, synchronisiert wenn online
- 🔢 **Versionsnummer** im Header – immer sichtbar welche Version läuft

## 🏗 Architektur

```
tasting-journal/
├── index.html              ← Startseite mit Kategorie-Kacheln
├── whisky.html / .js       ← Whisky-Verkostungen
├── shisha.html / .js       ← Shisha-Tabak-Verkostungen
├── settings.html           ← Einstellungen (GitHub, Google Drive, Import/Export, Backup)
├── gdrive-callback.html    ← OAuth2-Callback für Google Drive (Popup + Silent-Refresh)
├── shared/
│   ├── core.js             ← Gist-Sync, Setup, Persistenz, Helpers
│   ├── gdrive.js           ← Google Drive OAuth2, Auto-Refresh, Foto-Upload/Download
│   ├── ui.js               ← Wiederverwendbare UI-Komponenten, Tab-Switching
│   ├── styles.css          ← Gemeinsames Theming
│   └── version.js          ← Versionsnummer (TJ_VERSION)
├── manifest.json           ← Web-App-Manifest
└── icon.png
```

**Datenspeicherung:**
- **GitHub Gist** – alle Verkostungs-Metadaten (Text, Bewertungen, Notizen, Drive-URLs)
- **Google Drive** – Fotos im Ordner „Tasting Journal"

```json
{
  "whisky": [...],
  "shisha": [...]
}
```

Neue Kategorien lassen sich einfach nach dem bestehenden Pattern hinzufügen.

## 🚀 Erste Einrichtung

### Schritt 1: Repo erstellen / forken

Klicke oben rechts auf **Fork**, oder lade den Code als ZIP herunter und lade die Dateien in dein eigenes neues Repo hoch.

### Schritt 2: GitHub Pages aktivieren

1. **Settings** → **Pages**
2. Source: **Deploy from a branch** → Branch: **main** / Folder: **/ (root)**
3. Klick **Save**

Nach 1–2 Minuten erreichbar unter:
```
https://[deinusername].github.io/tasting-journal/
```

### Schritt 3: GitHub Token einrichten

Beim ersten Aufruf führt dich die App durch das Setup:
1. Klick **„🔑 Token erstellen"** → GitHub öffnet sich mit den richtigen Berechtigungen
2. „No expiration" wählen → **Generate token** → Token kopieren
3. In der App einfügen → **Einrichten**

### Schritt 4: Google Drive für Fotos einrichten (empfohlen)

1. **⚙️ Einstellungen** → **„📸 Google Drive – Foto-Speicher"** → **„🔗 Verbinden"**
2. Google-Konto auswählen
3. Ab sofort landen Fotos automatisch im Ordner **„Tasting Journal"** in deinem Drive
4. Bestehende Fotos per **„📤 Fotos migrieren"** nachträglich verschieben

> Der Token wird automatisch im Hintergrund erneuert – kein manuelles Neu-Verbinden nötig.

### Schritt 5: Auf weiteren Geräten

1. Gleiche URL öffnen
2. GitHub Token eingeben
3. Gist-ID vom ersten Gerät einfügen (⚙️ → „📋 Gist-ID kopieren")
4. Google Drive verbinden (Schritt 4 wiederholen)

## 📦 Backup

Unter **⚙️ Einstellungen → Datenverwaltung → „📦 Backup herunterladen"** wird ein ZIP erstellt mit:
- `tastings.json` – alle Verkostungsdaten
- `fotos/` – alle Fotos aus Google Drive

Zum Wiederherstellen: JSON importieren, Fotos manuell in Drive hochladen.

## 📱 Auf dem Homescreen installieren

**iPhone/iPad:** Safari → Teilen-Icon → „Zum Home-Bildschirm"  
**Android:** Chrome → Menü → „Zum Startbildschirm hinzufügen"

## 🔐 Sicherheitshinweise

- GitHub Token nur lokal im `localStorage` – nur `gist`-Berechtigung
- Google Drive Token nur lokal – läuft nach 1h ab, wird automatisch erneuert
- Fotos liegen in deinem eigenen Google Drive Account
- Gerät verloren: GitHub Token [widerrufen](https://github.com/settings/tokens), Drive in Einstellungen trennen

## 🆕 Eigene Kategorie hinzufügen

1. `mein-kategorie.html` von `whisky.html` kopieren, Felder anpassen
2. `mein-kategorie.js` von `whisky.js` kopieren, `CATEGORY` und Felder anpassen
3. `shared/core.js` → `data: { whisky: [], shisha: [], meinkategorie: [] }`
4. `index.html` → neue Kategorie-Kachel hinzufügen
5. `shared/styles.css` → optional `body.cat-meinkategorie` Theme

## 🛠 Lokale Entwicklung

```bash
cd tasting-journal
python3 -m http.server 8000
# http://localhost:8000
```

## 📜 Lizenz

MIT – mach damit was du willst.

