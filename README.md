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

You can easily adjust the participants list and the draw sequence directly inside **[app.js](file:///c:/Users/USER/Desktop/Lucky%20Draw/app.js)** at lines 13 to 48:

```javascript
// Winning Sequence Configuration
const WINNER_SEQUENCE = [
  "shushi ya",  // Winner #1
  "jojo",       // Winner #2
  "number 6",   // Winner #3
  "萤火虫",     // Winner #4
  "张伟",       // Winner #5
  "李娜",       // Winner #6
  "王芳",       // Winner #7
  "陈杰",       // Winner #8
  "刘洋",       // Winner #9
  "赵敏",       // Winner #10
  "孙强",       // Winner #11
  "周婷",       // Winner #12
  "吴磊",       // Winner #13
  "郑勇"        // Winner #14
];

// Initial participants list loaded by default
const INITIAL_NAMES = [
  "shushi ya",
  "jojo",
  "number 6",
  "萤火虫",
  "张伟",
  "李娜",
  "王芳",
  "陈杰",
  "刘洋",
  "赵敏",
  "孙强",
  "周婷",
  "吴磊",
  "郑勇"
];
```

After modifying the names, simply save the file and refresh your browser (`F5`).

---

## 🚀 Running Locally

1. Open `index.html` directly in any web browser, or serve via any static HTTP server.
2. Keyboard Shortcuts:
   - Press **`Space`** or **`Ctrl + Enter`** to trigger a spin.
   - Press **`Enter`** or **`Escape`** to dismiss the winner dialog.
