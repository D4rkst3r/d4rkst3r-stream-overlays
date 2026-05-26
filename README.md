# 🎮 D4RKST3R Stream Overlays

Professional Game Design Stream Overlay Setup mit modernem Design und StreamElements Integration.

## 🌟 Features

- ✅ **Goal Progress** - Animierte Progress-Bars für Sub/Tip Goals
- ✅ **Live Stats** - Live Dashboard (Follower, Viewer, Tips, Subs)
- ✅ **Design Showcase** - Community Design Galerie mit Carousel
- ✅ **Credits Screen** - Thank You Screen mit Top Supporter
- ✅ **Dark Theme** - Orange/Dark Aesthetic für GameDesign
- ✅ **StreamElements Ready** - Automatische Event Integration
- ✅ **Smooth Animations** - CSS-basierte Übergänge & Effects
- ✅ **Responsive** - Funktioniert auf allen Auflösungen
- ✅ **Customizable** - Einfach anzupassen (CSS Variables)

## 📺 Live Demo

Besuche die **[Live Demo](https://yourusername.github.io/d4rkst3r-stream-overlays/)**

## 🚀 Quick Start für OBS

### 1. Browser Sources hinzufügen

In OBS:
```
Source → Browser Source
```

Dann eine dieser URLs eingeben:

**Goal Progress (600x200 oder 800x300):**
```
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/goal-progress.html
```

**Live Stats (400x600):**
```
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/live-stats.html
```

**Design Showcase (1920x1080):**
```
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/design-showcase.html
```

**Credits (1920x1080):**
```
https://yourusername.github.io/d4rkst3r-stream-overlays/screens/credits.html
```

### 2. OBS Settings

```
Browser Source Properties:
✅ Refresh browser when scene becomes active
✅ Shutdown source when not visible
✅ Control audio via OBS

Width: 1920
Height: 1080
```

### 3. Fertig! 🎉

Die Screens sollten nun in OBS laden und alle Animationen sollten funktionieren.

## 🎨 Customization

### Farben ändern

Editiere `styles/_theme.css`:

```css
:root {
  --color-accent: #ff8800;      /* Orange */
  --color-bg: #050507;          /* Schwarz */
  --color-text-primary: #e8e8e8; /* Weiß-Grau */
}
```

### Texte ändern

Öffne die HTML-Dateien in `screens/` und editiere die Texte direkt.

**Beispiel - Goal Progress:**
```html
<div class="goal-title">💰 GOAL PROGRESS 💰</div>
<div class="goal-message">Hilf mit, den nächsten Sound freizuschalten!</div>
```

### Neue Screens hinzufügen

Kopiere eine existierende Screen-Datei und modifiziere sie. Template:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../styles/main.css">
  <style>
    /* Your custom styles */
  </style>
</head>
<body>
  <div class="container">
    <!-- Your content -->
  </div>
  
  <script src="../js/utils.js"></script>
  <script>
    // Your JavaScript
  </script>
</body>
</html>
```

## 📁 Dateistruktur

```
d4rkst3r-stream-overlays/
├── index.html                  # Homepage mit Links zu allen Screens
├── README.md                   # Diese Datei
├── screens/
│   ├── goal-progress.html      # Goal Progress Screen
│   ├── live-stats.html         # Live Stats Dashboard
│   ├── design-showcase.html    # Design Showcase Gallery
│   └── credits.html            # Credits/Thank You Screen
├── styles/
│   ├── main.css                # Master CSS (imports alle)
│   ├── _theme.css              # Color & Font Variables
│   ├── _animations.css         # Keyframe Animations
│   └── _components.css         # Reusable UI Components
└── js/
    └── utils.js                # Helper Functions
```

## 🔌 StreamElements Integration

Die Screens sind ready für StreamElements Events!

Wenn SE Events nicht funktionieren, stelle sicher:
1. Overlay in StreamElements aktiviert ist
2. OBS und SE in der gleichen Browser-Sitzung laufen
3. Browser Console (F12) zeigt keine Fehler

## 🐛 Troubleshooting

### Problem: Blank Page in OBS
- ✅ URL überprüfen (copy/paste from demo page)
- ✅ Browser Console (F12 in OBS) auf Fehler checken
- ✅ OBS neustarten

### Problem: Animationen sehen laggy aus
- ✅ Hardware Acceleration in OBS aktivieren
- ✅ Browser Source: "Refresh when visible" aktivieren
- ✅ Andere CPU-intensive Sources reduzieren

### Problem: Farben sehen anders aus
- ✅ OBS Color Space → sRGB
- ✅ Monitor Kalibrierung checken
- ✅ CSS direkt im Browser testen

## 📊 Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Edge
- ✅ OBS Browser Source (Chromium-based)

## 🎬 Best Practices

1. **Szenen-Management:** Erstelle separate OBS Szenen für jeden Screen
2. **Größen:** Nutze Basis-Auflösung 1920x1080
3. **Customization:** Editiere CSS statt HTML wenn möglich
4. **Testing:** Test immer lokal (index.html) vor dem Pushen

## 📖 Weitere Ressourcen

- [OBS Browser Source Docs](https://github.com/obsproject/obs-studio/wiki/Sources-Guide#browser-source)
- [StreamElements Overlay Editor](https://streamelements.com/dashboard/overlays)
- [CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)

## 📝 License

Frei nutzbar für Stream-Zwecke!

## 🙏 Credits

Made with ❤️ for D4RKST3R GameDesign Streams

---

**Viel Spaß beim Streamen! 🚀**
