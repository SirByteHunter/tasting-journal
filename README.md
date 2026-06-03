# 🍷 Tasting Journal

Eine schlanke, schöne Web-App für deine persönliche Verkostungssammlung – Whisky, Shisha-Tabak und mehr. Metadaten werden in einem privaten GitHub Gist gespeichert, Fotos optional in Google Drive – beides syncet automatisch zwischen all deinen Geräten.

## ✨ Features

- 🥃 **Whisky-Verkostungen** – Nase, Gaumen, Abgang, Punktzahl, Sterne, Foto
- 💨 **Shisha-Tabak-Verkostungen** – Marke, Geschmack, Hitzeverhalten, Rauchentwicklung, Nikotinstärke
- 🔍 **Suche & Sortierung** in jeder Kategorie
- 📊 **Statistiken** – Durchschnittspunkte, Top-Listen, Verteilungen
- ☁️ **Sync zwischen allen Geräten** via privatem GitHub Gist
- 📸 **Google Drive Foto-Speicher** – Fotos landen in deinem Google Drive statt im Gist, skaliert für hunderte Einträge
- 📱 **Auf Handy als App nutzbar** – über Safari/Chrome zum Homescreen hinzufügen
- 🔒 **Daten gehören dir** – sie liegen in DEINEM privaten Gist und Google Drive
- ⚡ **Offline-fähig** – lokaler Cache, syncronisiert wenn online
- 🎨 **Kategorie-spezifisches Design** – Whisky in Bernstein, Shisha in Lila

## 🏗 Architektur

```
tasting-journal/
├── index.html              ← Startseite mit Kategorie-Kacheln
├── whisky.html / .js       ← Whisky-Verkostungen
├── shisha.html / .js       ← Shisha-Tabak-Verkostungen
├── settings.html           ← Einstellungen (GitHub, Google Drive, Import/Export)
├── gdrive-callback.html    ← OAuth2-Callback für Google Drive Login
├── shared/
│   ├── core.js             ← Gist-Sync, Setup, Persistenz
│   ├── gdrive.js           ← Google Drive OAuth2, Foto-Upload
│   ├── ui.js               ← Wiederverwendbare UI-Komponenten
│   └── styles.css          ← Gemeinsames Theming
├── manifest.json           ← Web-App-Manifest
└── icon.png
```

**Datenspeicherung:**
- **GitHub Gist** – alle Verkostungs-Metadaten (Text, Bewertungen, Notizen, Drive-URLs)
- **Google Drive** – Fotos (optional, aber empfohlen für viele Einträge)

```json
{
  "whisky": [...],
  "shisha": [...]
}
```

Neue Kategorien (Zigarren, Wein, ...) lassen sich einfach hinzufügen, indem ein neues HTML+JS-Paar nach dem gleichen Muster erstellt wird.

## 🚀 Erste Einrichtung (5 Minuten)

### Schritt 1: Repo erstellen / forken

Klicke oben rechts auf **Fork**, oder lade den Code als ZIP herunter und lade die Dateien in dein eigenes neues Repo hoch.

### Schritt 2: GitHub Pages aktivieren

In deinem Fork:
1. **Settings** → **Pages**
2. „Build and deployment" → Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Klick **Save**

Nach 1–2 Minuten ist deine App erreichbar unter:
```
https://[deinusername].github.io/tasting-journal/
```

### Schritt 3: App öffnen und GitHub Token erstellen

Beim ersten Aufruf führt dich die App durch das Setup:
1. Klick auf **„🔑 Token erstellen"** – das öffnet GitHub mit den richtigen Berechtigungen
2. Wähle eine Ablaufzeit (z.B. „No expiration") und klick **Generate token**
3. Kopiere den Token (beginnt mit `ghp_...` oder `github_pat_...`)
4. Füge ihn in der App ein und klick **Einrichten**

Beim ersten Setup wird automatisch ein **privater Gist** angelegt, der deine Daten speichert.

### Schritt 4: Google Drive für Fotos einrichten (empfohlen)

Damit Fotos in Google Drive statt im Gist gespeichert werden:
1. Öffne **⚙️ Einstellungen** → **„📸 Google Drive – Foto-Speicher"**
2. Klick **„🔗 Verbinden"** und melde dich mit deinem Google-Konto an
3. Ab sofort landen neue Fotos automatisch im Ordner **„Tasting Journal"** in deinem Drive
4. Bestehende Base64-Fotos kannst du per **„📤 Fotos migrieren"** nachträglich verschieben

### Schritt 5: Auf weiteren Geräten

Auf einem zweiten Gerät (z.B. iPhone):
1. Gleiche URL öffnen: `https://[deinusername].github.io/tasting-journal/`
2. Token erstellen (oder den vom ersten Gerät weiterverwenden)
3. **Wichtig:** Bei „Gist-ID" die ID vom ersten Gerät einfügen
   - Diese findest du in der App unter **⚙️ → „📋 Gist-ID kopieren"**
4. Google Drive ebenfalls verbinden (Schritt 4 wiederholen)

## 📱 Auf dem Homescreen installieren

### iPhone / iPad
1. App in **Safari** öffnen
2. Tippe auf das **Teilen-Icon**
3. „Zum Home-Bildschirm"

### Android
1. App in **Chrome** öffnen
2. Menü → „Zum Startbildschirm hinzufügen"

## 🔐 Sicherheitshinweise

- Der **GitHub Token wird nur lokal im Browser** gespeichert (`localStorage`)
- Der **Gist ist privat** und nur über deinen Account erreichbar
- Tokens haben **nur `gist`-Berechtigung** – sie können nichts anderes anrichten
- Der **Google Drive Token** wird ebenfalls nur lokal gespeichert und läuft nach 1 Stunde ab
- Fotos in Google Drive liegen in deinem eigenen Account
- Wenn du ein Gerät verlierst: GitHub Token [widerrufen](https://github.com/settings/tokens), Google Drive in den Einstellungen trennen

## 🆕 Eigene Kategorie hinzufügen

Du willst auch Wein, Zigarren oder Kaffee dokumentieren? So einfach geht's:

1. **`mein-kategorie.html`** kopieren von `whisky.html`, eigene Felder ins Form einfügen
2. **`mein-kategorie.js`** kopieren von `whisky.js`, `CATEGORY` ändern, Felder anpassen
3. **`shared/core.js`** → in `data: { whisky: [], shisha: [] }` deine Kategorie ergänzen
4. **`index.html`** → eine neue Kategorie-Kachel hinzufügen
5. **`shared/styles.css`** → optional ein eigenes Farb-Theme `body.cat-meinkategorie`

## 🛠 Lokale Entwicklung

```bash
cd tasting-journal
python3 -m http.server 8000
# Dann öffnen: http://localhost:8000
```

## 📜 Lizenz

MIT – mach damit was du willst.

