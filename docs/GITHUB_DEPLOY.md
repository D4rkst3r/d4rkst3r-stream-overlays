# 🚀 GitHub Pages Deploy Guide

So bringst du deine Stream Overlays ins Internet auf GitHub Pages (kostenlos!)

---

## 📋 Voraussetzungen

- GitHub Account (kostenlos: https://github.com/signup)
- Git installiert (https://git-scm.com/download/win)
- Oder GitHub Desktop (einfacher für Anfänger)

---

## Option A: Mit GitHub Desktop (EINFACH) ⭐

### Schritt 1: GitHub Desktop installieren & anmelden
1. Download: https://desktop.github.com/
2. Installieren & öffnen
3. Mit GitHub Account anmelden

### Schritt 2: Neues Repo erstellen
1. File → New Repository
2. **Name:** `d4rkst3r-stream-overlays`
3. **Local Path:** `C:\Users\az319\Playground\D4rkst3r\`
4. **Create Repository**

### Schritt 3: Dateien hinzufügen
1. Der `Stream/` Ordner sollte jetzt im Repo sein
2. GitHub Desktop sollte alle Dateien erkennen
3. Links unten: "Summary" beschreiben (z.B. "Initial commit - Stream overlays")
4. **Commit to main** klicken

### Schritt 4: Auf GitHub hochladen
1. Oben: **Publish repository**
2. **Name:** `d4rkst3r-stream-overlays`
3. **Keep this code private:** ⚠️ **UNCHECKED** (Public!)
4. **Publish Repository**

### Schritt 5: GitHub Pages aktivieren
1. Browser → https://github.com/yourusername/d4rkst3r-stream-overlays
2. **Settings** (Zahnrad oben rechts)
3. **Pages** (links im Menü)
4. **Source:** `main` branch auswählen
5. **Save**

### Schritt 6: Warten & testen
Nach 1-2 Minuten:
- https://yourusername.github.io/d4rkst3r-stream-overlays/ sollte funktionieren!

---

## Option B: Mit Git Command Line (FORTGESCHRITTENE)

```powershell
# 1. In dein Projektverzeichnis wechseln
cd C:\Users\az319\Playground\D4rkst3r\Stream

# 2. Git initialisieren
git init

# 3. Remote hinzufügen (ersetze USERNAME!)
git remote add origin https://github.com/USERNAME/d4rkst3r-stream-overlays.git

# 4. Branch umbenennen zu main (falls nicht main)
git branch -M main

# 5. Alle Dateien hinzufügen
git add .

# 6. Erster Commit
git commit -m "Initial commit - D4RKST3R Stream Overlays Setup"

# 7. Auf GitHub pushen
git push -u origin main
```

Dann gleich zu Step 5 (GitHub Pages aktivieren).

---

## Option C: Drag & Drop Upload (SUPER EINFACH)

### Schritt 1-2: Repo erstellen (wie Option A)
1. https://github.com/new
2. Name: `d4rkst3r-stream-overlays`
3. Public ✅
4. Create repository

### Schritt 2: Dateien hochladen
1. Im Repo: **Add file** → **Upload files**
2. Oder: Ziehe Dateien vom Explorer rein
3. Upload alle Dateien aus `C:\Users\az319\Playground\D4rkst3r\Stream\`

Folder-Struktur MUSS so sein:
```
d4rkst3r-stream-overlays/
├── index.html
├── README.md
├── screens/
│   ├── goal-progress.html
│   ├── live-stats.html
│   ├── design-showcase.html
│   └── credits.html
├── styles/
│   ├── main.css
│   ├── _theme.css
│   ├── _animations.css
│   └── _components.css
└── js/
    └── utils.js
```

### Schritt 3: GitHub Pages aktivieren (wie oben)

---

## ✅ Fertig! Deine URLs:

Nach Deploy:
```
https://yourusername.github.io/d4rkst3r-stream-overlays/
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/goal-progress.html
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/live-stats.html
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/design-showcase.html
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/credits.html
```

---

## 🔄 Updates pushen

Nachdem dein Repo online ist:

### Mit GitHub Desktop:
1. Ändere Dateien lokal
2. GitHub Desktop öffnen
3. Beschreibung eingeben (z.B. "Update colors")
4. **Commit to main**
5. **Push origin**
6. Fertig! ✅ (1-2 min später online)

### Mit Git Command Line:
```powershell
cd C:\Users\az319\Playground\D4rkst3r\Stream
git add .
git commit -m "Update: Changed colors"
git push
```

---

## 🎯 In OBS nutzen

Sobald online, nutze die HTTPS URLs in OBS:

```
Browser Source URL:
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/goal-progress.html
```

Vorteile:
- ✅ Kein lokaler Server nötig
- ✅ Funktioniert überall (auch mobil)
- ✅ Automatische Updates
- ✅ Professionell & zuverlässig
- ✅ Kostenlos!

---

## 🐛 Troubleshooting

### Problem: "404 - Page not found"
**Lösung:**
1. Warte 5 Minuten nach dem Upload
2. Browser Cache leeren (Ctrl+Shift+Del)
3. URL überprüfen (case-sensitive!)
4. Stelle sicher, dass `index.html` im Root ist

### Problem: GitHub Pages wird nicht aktiviert
**Lösung:**
1. Repo muss **Public** sein (nicht Private!)
2. Settings → Pages → Source muss gesetzt sein
3. Warte 2-5 Minuten

### Problem: Styles/JS laden nicht
**Lösung:**
1. Pfade in HTML überprüfen (müssen relativ sein)
2. `../styles/main.css` (nicht `/styles/...`)
3. `../js/utils.js` (nicht `/js/...`)

### Problem: StreamElements Events funktionieren nicht
**Lösung:**
Nutze lokal: `http://localhost:8000` statt HTTPS
Oder: SE API Integration (fortgeschrittenes Topic)

---

## 📊 Dein GitHub Workflow

```
Lokal ändern
   ↓
Testen in Browser (index.html)
   ↓
GitHub Desktop: Commit & Push
   ↓
Online verfügbar (1-2 min später)
   ↓
In OBS testen
```

---

## 🔐 Private Daten?

Falls du keinen Code sharing willst:
- Repo kann **Private** sein
- Aber dann funktioniert GitHub Pages nicht (Pro+ Account nötig)
- **Empfehlung:** Public ist OK - das sind nur Overlays!

---

**Du bist jetzt ein GitHub Publisher! 🚀**

Weitere Hilfe:
- GitHub Docs: https://docs.github.com/
- GitHub Pages Docs: https://pages.github.com/
