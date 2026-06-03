# 📤 Schritt-für-Schritt: Auf GitHub hochladen

Da du Git/GitHub CLI nicht installiert hast, machst du alles bequem über die GitHub-Webseite.

## 1️⃣ Repository auf GitHub erstellen

1. Geh auf https://github.com/new
2. **Repository name**: `tasting-journal`
3. **Description**: „Persönliches Verkostungsjournal für Whisky, Shisha & mehr"
4. Wähle **Public** (notwendig für kostenlose GitHub Pages)
5. **NICHT** „Add a README", „Add .gitignore" oder „Add a license" anklicken (haben wir schon)
6. Klick **Create repository**

## 2️⃣ Dateien hochladen

Auf der nächsten Seite siehst du den leeren Repo-Bildschirm. Klick auf **„uploading an existing file"**.

Oder direkt via:
```
https://github.com/[deinusername]/tasting-journal/upload/main
```

### Drag & Drop:

1. Öffne den Finder, navigiere zu:
   ```
   /Users/D074361/Library/CloudStorage/OneDrive-SAPSE/Henry/Claude/tasting-journal/
   ```

2. **Wichtig**: GitHub kann komplette Ordner-Strukturen per Drag & Drop verarbeiten.
   Markiere ALLE Dateien und Ordner im `tasting-journal/`-Ordner:
   - `index.html`
   - `whisky.html`, `whisky.js`
   - `shisha.html`, `shisha.js`
   - `shared/` (kompletter Ordner mit `core.js`, `ui.js`, `styles.css`)
   - `manifest.json`
   - `icon.png`
   - `README.md`
   - `LICENSE`
   - `.gitignore` (versteckte Dateien zeigt der Finder mit `Cmd+Shift+.`)

3. **Ziehe sie auf die GitHub-Seite** ins „Drag files here"-Feld

4. Unten: Commit message: „Initial commit"

5. Klick **Commit changes**

GitHub übernimmt automatisch die Ordnerstruktur (`shared/core.js` etc.).

## 3️⃣ GitHub Pages aktivieren

1. Im Repo: **Settings** (oben rechts)
2. Linke Seitenleiste: **Pages**
3. **Source**: „Deploy from a branch"
4. **Branch**: `main`, Folder: `/ (root)`
5. **Save**

## 4️⃣ Warten und öffnen

- Nach 1–3 Minuten ist deine App live unter:
  ```
  https://[deinusername].github.io/tasting-journal/
  ```
- In **Settings → Pages** siehst du den Status: „Your site is live at..."

## 5️⃣ App das erste Mal einrichten

Beim ersten Aufruf führt dich die App durch das Setup:
1. Klick **„🔑 Token erstellen"**
2. Auf GitHub: Klick **Generate token** (Berechtigungen sind voreingestellt)
3. Token kopieren (beginnt mit `ghp_...`)
4. In der App einfügen
5. **„Einrichten"** klicken

Fertig! 🎉

Du landest auf der Startseite und kannst zwischen **Whisky** und **Shisha** wählen.

## 6️⃣ Auf iPhone öffnen und installieren

1. Safari → URL eingeben: `https://[deinusername].github.io/tasting-journal/`
2. Token-Setup wie oben
3. **Wichtig:** Auf iPhone die **Gist-ID** vom Mac eingeben
   - In App auf Mac: Whisky/Shisha öffnen → ⚙️ → „Gist-ID kopieren"
   - Oder bei https://gist.github.com nachschauen
4. Teilen-Icon → „Zum Home-Bildschirm"

---

## 🔄 Updates später hochladen

Wenn du Änderungen am Code machst:

### Methode A: Webseite (einfach für einzelne Dateien)
1. Gehe ins Repo auf GitHub
2. Klick auf die zu ändernde Datei (z.B. `whisky.js`)
3. Klick auf das **Stift-Symbol** ✏️
4. Änderungen einfügen → unten **Commit changes**

### Methode B: Drag & Drop neue Version
1. `https://github.com/[deinusername]/tasting-journal/upload/main`
2. Geänderte Dateien droppen, alte werden überschrieben
3. **Commit changes**

GitHub Pages aktualisiert sich automatisch in 1–2 Minuten.

---

## 💡 Tipps

- **Cache-Probleme nach Update?** Auf iPhone: Einstellungen → Safari → Verlauf und Websitedaten löschen. Oder die App vom Homescreen entfernen und neu hinzufügen.
- **Token verloren?** Auf GitHub einen neuen erstellen, in der App in den ⚙️-Einstellungen „Verbindung trennen", dann neu einrichten mit der alten Gist-ID.
- **Daten sichern?** Regelmäßig in den Einstellungen auf „Download JSON" – die Datei in iCloud/OneDrive sichern.
- **App teilen?** Andere können dein Repo forken und ihre eigene Version mit ihrem eigenen Gist haben. Daten bleiben getrennt.

## 🆕 Neue Kategorie später hinzufügen

Wenn du später z.B. Zigarren oder Wein dokumentieren willst, ist die Architektur bereits darauf vorbereitet. Frag mich einfach – wir bauen eine neue Kategorie in 10 Minuten dazu!
