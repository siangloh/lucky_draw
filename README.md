# Wheel of Names

A responsive, high-performance static web application inspired by **wheelofnames.com**.

---

## 🌟 Features

1. **Pixel-Perfect Authentic Look & Feel**:
   - Matches the official dark interface, typography, colors, and layout.
   - Smooth canvas rendering with dynamic slice colors and contrast-aware typography.
   - 3D faceted pointer that dynamically reflects current sector lighting.
   - Smooth curved text overlays (`Click to spin` and `or press ctrl+enter`).
   - Gentle idle auto-rotation when awaiting spin.

2. **Clean & Discrete Operation**:
   - Zero suspicious menus or indicators exposed on the user interface.
   - Pure winner celebration dialog with official `We have a winner!` announcement and confetti particle effects.
   - Zero prize tags displayed anywhere on screen.

3. **Responsive Design**:
   - Seamlessly adapts across full desktop, split-screen desktop, and mobile viewports.
   - Collapses into a clean hamburger menu on smaller widths.

---

## ⚙️ Configuration

You can easily adjust the participants list and designated winners directly inside **[app.js](file:///c:/Users/USER/Desktop/Lucky%20Draw/app.js)**:

```javascript
// Designated Winners Configuration (Only specify rounds you want to lock; others are completely random)
const DESIGNATED_WINNERS = {
  1: "DEVA",   // Draw #1 -> 14th Prize
  4: "EZZAT"   // Draw #4 -> 11th Prize
};

// Initial participants list loaded by default
const INITIAL_NAMES = [
  "ADHA",
  "ALI",
  "DEVA",
  "EZZAT",
  "FAYSAL",
  "HANIZA",
  "SHOHAN",
  "RUBEL",
  "SHALINI",
  "SHAMIM",
  "TAN JIN CHUN",
  "WIN NAUNG",
  "YEASUF",
  "YOONG YING KIE"
];
```

After modifying the names, simply save the file and refresh your browser (`F5`).

---

## 🚀 Running Locally

1. Open `index.html` directly in any web browser, or serve via any static HTTP server.
2. Keyboard Shortcuts:
   - Press **`Space`** or **`Ctrl + Enter`** to trigger a spin.
   - Press **`Enter`** or **`Escape`** to dismiss the winner dialog.
