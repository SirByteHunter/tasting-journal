# 🍷 Tasting Journal

Eine schlanke, schöne Web-App für deine persönliche Verkostungssammlung – Whisky, Shisha-Tabak und mehr. Daten werden in einem privaten GitHub Gist gespeichert und syncen automatisch zwischen all deinen Geräten.

## ✨ Features

- 🥃 **Whisky-Verkostungen** – Nase, Gaumen, Abgang, Punktzahl, Sterne, Foto
- 💨 **Shisha-Tabak-Verkostungen** – Marke, Geschmack, Hitzeverhalten, Rauchentwicklung, Nikotinstärke
- 🔍 **Suche & Sortierung** in jeder Kategorie
- 📊 **Statistiken** – Durchschnittspunkte, Top-Listen, Verteilungen
- ☁️ **Sync zwischen allen Geräten** via privatem GitHub Gist
- 📱 **Auf Handy als App nutzbar** – über Safari/Chrome zum Homescreen hinzufügen
- 🔒 **Daten gehören dir** – sie liegen in DEINEM privaten Gist
- ⚡ **Offline-fähig** – lokaler Cache, syncronisiert wenn online
- 🎨 **Kategorie-spezifisches Design** – Whisky in Bernstein, Shisha in Lila

## 🏗 Architektur

```
tasting-journal/
├── index.html              ← Startseite mit Kategorie-Kacheln
├── whisky.html / .js       ← Whisky-Verkostungen
├── shisha.html / .js       ← Shisha-Tabak-Verkostungen
├── shared/
│   ├── core.js             ← Gist-Sync, Setup, Persistenz
│   ├── ui.js               ← Wiederverwendbare UI-Komponenten
│   └── styles.css          ← Gemeinsames Theming
├── manifest.json           ← Web-App-Manifest
└── icon.png
```

Die Daten werden in einem einzigen Gist als JSON-Datei gespeichert, mit getrennten Arrays pro Kategorie:
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

### Schritt 3: App öffnen und Token erstellen

Beim ersten Aufruf führt dich die App durch das Setup:
1. Klick auf **„🔑 Token erstellen"** – das öffnet GitHub mit den richtigen Berechtigungen
2. Wähle eine Ablaufzeit (z.B. „No expiration") und klick **Generate token**
3. Kopiere den Token (beginnt mit `ghp_...` oder `github_pat_...`)
4. Füge ihn in der App ein und klick **Einrichten**

Beim ersten Setup wird automatisch ein **privater Gist** angelegt, der deine Daten speichert.

### Schritt 4: Auf weiteren Geräten

Auf einem zweiten Gerät (z.B. iPhone):
1. Gleiche URL öffnen: `https://[deinusername].github.io/tasting-journal/`
2. Token erstellen (oder den vom ersten Gerät weiterverwenden)
3. **Wichtig:** Bei „Gist-ID" die ID vom ersten Gerät einfügen
   - Diese findest du in der App unter **⚙️ → „📋 Gist-ID kopieren"**
   - Oder direkt auf https://gist.github.com (Eintrag „Tasting Journal – Daten")

Damit synchronisieren beide Geräte gegen denselben Gist.

## 📱 Auf dem Homescreen installieren

### iPhone / iPad
1. App in **Safari** öffnen
2. Tippe auf das **Teilen-Icon**
3. „Zum Home-Bildschirm"

### Android
1. App in **Chrome** öffnen
2. Menü → „Zum Startbildschirm hinzufügen"

## 🔐 Sicherheitshinweise

- Der **Token wird nur lokal im Browser** gespeichert (`localStorage`)
- Der **Gist ist privat** und nur über deinen Account erreichbar
- Tokens haben **nur `gist`-Berechtigung** – sie können nichts anderes anrichten
- Wenn du ein Gerät verlierst: erstelle einen neuen Token und [widerrufe den alten](https://github.com/settings/tokens)

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
