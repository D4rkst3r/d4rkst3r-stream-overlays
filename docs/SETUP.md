# D4RKST3R Stream Overlay Setup Guide

**Version:** 1.0  
**Last Updated:** 2026-05-21  
**Status:** Ready for Integration

---

## 📋 Inhaltsverzeichnis

1. [Quick Start](#quick-start)
2. [Dateien Übersicht](#dateien-übersicht)
3. [StreamElements Integration](#streamelements-integration)
4. [OBS Setup](#obs-setup)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Ordner-Struktur vorbereiten
```
C:\Users\az319\Playground\D4rkst3r\Stream\
├── styles/              ✅ CSS Files
├── js/                  ✅ JavaScript Utils
├── screens/             ✅ Neue Screens
├── assets/              📁 (für Bilder/Icons)
└── docs/                📁 Diese Dokumentation
```

### 2. Screens testen (lokal)
Öffne jeden Screen in deinem Browser:
- `screens/goal-progress.html` - Goal-Counter
- `screens/live-stats.html` - Live Dashboard
- `screens/design-showcase.html` - Design Galerie
- `screens/credits.html` - Thank You Screen

### 3. In OBS hinzufügen
Für jeden Screen:
- **OBS → Source hinzufügen → Browser**
- **URL eingeben:** `file:///C:/Users/az319/Playground/D4rkst3r/Stream/screens/SCREEN_NAME.html`
- **Größe:** 1920x1080 (oder anpassen)

---

## 📁 Dateien Übersicht

### CSS Foundation (`styles/`)
| Datei | Zweck |
|-------|-------|
| `_theme.css` | Farben, Fonts, Spacing (CSS Variables) |
| `_animations.css` | Alle Keyframe-Animationen |
| `_components.css` | Reusable UI Components |
| `main.css` | Imports alle Stylesheets |

**Verwendung:** Einfach nur `main.css` in jedem HTML laden:
```html
<link rel="stylesheet" href="../styles/main.css">
```

### JavaScript Utilities (`js/`)
| Datei | Funktionen |
|-------|-----------|
| `utils.js` | `formatNumber()`, `formatMoney()`, `animateProgress()`, `updateCounter()`, `switchScreen()`, `setupStreamElements()`, etc. |

**Wichtige Funktionen:**

```javascript
// Zahlen formatieren (1000 → "1K")
formatNumber(1234)  // → "1.2K"
formatMoney(50)     // → "$50.00"

// Progress Bar animieren
animateProgress(barElement, 125, 500)

// Counter updaten
updateCounter(element, 1234)

// SE Events setup
setupStreamElements({
  onTip: (amount, username) => { ... },
  onFollower: (username) => { ... }
})

// Zwischen Screens wechseln
switchScreen('goal-progress')
```

### Screens (`screens/`)
| Screen | Zweck | Best For |
|--------|-------|----------|
| `goal-progress.html` | Progress Bar zu Ziel | Sub/Tip Goals |
| `live-stats.html` | Live Dashboard | Follower, Viewer, Tips |
| `design-showcase.html` | Design Galerie | Community Showcase |
| `credits.html` | Thank You Screen | Stream-Ende |

---

## 🔌 StreamElements Integration

### Schritt 1: Browser Source in OBS
```
OBS → Source → Browser Source hinzufügen
URL: file:///C:/Users/az319/Playground/D4rkst3r/Stream/screens/live-stats.html
```

### Schritt 2: StreamElements API Token (Optional)
Wenn du Advanced Features brauchst (API-Polling):
1. StreamElements → Account → Settings
2. Copy **Access Token**
3. In JavaScript verwenden:
   ```javascript
   const token = "YOUR_SE_ACCESS_TOKEN";
   pollTipLeaderboard(channelId, token, (data) => {
     console.log('Leaderboard:', data);
   });
   ```

### Schritt 3: Events automatisch triggern
StreamElements sendet Events automatisch über `window.overlayWindow.EventCreated`:

```javascript
// In goal-progress.html ist das schon konfiguriert!
setupStreamElements({
  onTip: (amount, username) => {
    updateGoalProgress(goalState.current + amount, goalState.target);
  }
});
```

---

## 🎮 OBS Setup

### Szenen erstellen (Empfehlung)
```
[Scenes]
├── Start Soon
├── Gameplay
│   ├── Game Capture
│   └── Alerts Widget
│   └── Stats Panel
├── Goal Progress
│   └── goal-progress.html Browser Source
├── Design Showcase
│   └── design-showcase.html Browser Source
└── Credits/BRB
    └── credits.html Browser Source
```

### Source-Einstellungen
```
Browser Source Eigenschaften:
- ✅ Refresh Browser when scene becomes active
- ✅ Shutdown source when not visible
- ✅ Control audio via OBS
- Width: 1920
- Height: 1080
```

---

## 🎨 Customization

### Farben ändern
In `styles/_theme.css`:
```css
:root {
  --color-accent: #ff8800;        /* Orange → deine Farbe */
  --color-bg: #050507;            /* Schwarz → deine Farbe */
  --color-text-primary: #e8e8e8;  /* Weiß-Grau */
}
```

### Fonts ändern
```css
:root {
  --font-mono: 'Arial', sans-serif;  /* Statt Courier New */
}
```

### Animationen anpassen
In `styles/_animations.css`:
```css
@keyframes fillProgress {
  ...
}

/* Dauer ändern */
.progress-bar::after {
  transition: width 2s ease-out;  /* statt 1.5s */
}
```

### Eigene Screens hinzufügen
Template:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  <div class="container">
    <!-- Dein Content hier -->
  </div>
  
  <script src="../js/utils.js"></script>
  <script>
    // Dein JavaScript hier
  </script>
</body>
</html>
```

---

## 🔧 Troubleshooting

### Problem: Browser Source zeigt nichts
**Lösung:**
1. URL-Pfad überprüfen (Use `file:///C:/...` mit Schrägstrichen)
2. OBS neustarten
3. Browser Console checken (F12 in OBS)

### Problem: StreamElements Events funktionieren nicht
**Lösung:**
1. Check: Ist das Overlay in StreamElements verlinkt?
2. Check: Läuft OBS und StreamElements nebeneinander?
3. Console-Fehler anschauen

### Problem: Animationen sehen laggy aus
**Lösung:**
1. Hardware-Beschleunigung in OBS aktivieren
2. Browser-Quelle Einstellungen: "Refresh when visible" aktivieren
3. andere CPU-intensive Sources reduzieren

### Problem: Farben sehen anders aus
**Lösung:**
1. OBS Color Space auf "sRGB" setzen
2. Monitor-Kalibrierung checken
3. CSS direkt im Browser prüfen

---

## 📊 Live-Test Checklist

- [ ] Alle Screens öffnen sich ohne Fehler
- [ ] Animationen sind smooth (60fps)
- [ ] SE Events werden erkannt (Tips/Follower/Subs)
- [ ] Progress Bars füllen sich korrekt
- [ ] Counter updaten sich
- [ ] Design-Showcase Bilder laden
- [ ] Credits Screen zeigt Daten korrekt
- [ ] OBS Screen-Übergänge smooth
- [ ] Kein Konsolen-Fehler

---

## 🎬 Pro Tips

1. **Keyboard Shortcut für Screen-Wechsel:** Erstelle ein OBS Hotkey, das die Browser-Quelle URL ändert
2. **Auto-Reset für Goals:** Nutze einen SE Custom Widget Reset-Button
3. **Mobile Ansicht:** Für Tests, nutze OBS `Preview Scaling`
4. **Backup machen:** Speichere `Stream/` Ordner regelmäßig ab

---

## 📞 Support

Falls Fehler auftauchen:
1. Browser Console checken (F12)
2. Netzwerk Tab in DevTools
3. OBS Logs anschauen: `Help → Log Files`

---

**Viel Spaß mit dem Setup! 🚀**  
Made with ❤️ by Claude  
Für D4RKST3R GameDesign Streams
