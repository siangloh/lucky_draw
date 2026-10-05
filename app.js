/**
 * ==============================================================================
 * 🎯【内定中奖顺序设置】（修改这里即可设定第1个、第2个中奖者）
 *
 * 页面上没有任何外露的“暗箱/作弊”菜单，他人完全看不出任何破绽！
 * 按照数组顺序依次中奖：
 * 第1次抽奖 -> 命中 WINNER_SEQUENCE[0]
 * 第2次抽奖 -> 命中 WINNER_SEQUENCE[1]
 * 第3次抽奖 -> 命中 WINNER_SEQUENCE[2]
 * ... 以此类推！
 * ==============================================================================
 */
const WINNER_SEQUENCE = [
  "shushi ya",  // 🎯 第 1 次抽奖必中之人
  "jojo",       // 🎯 第 2 次抽奖必中之人
  "number 6",   // 🎯 第 3 次抽奖必中之人
  "萤火虫",     // 🎯 第 4 次抽奖必中之人
  "张伟",       // 🎯 第 5 次抽奖必中之人
  "李娜",       // 🎯 第 6 次抽奖必中之人
  "王芳",       // 🎯 第 7 次抽奖必中之人
  "陈杰",       // 🎯 第 8 次抽奖必中之人
  "刘洋",       // 🎯 第 9 次抽奖必中之人
  "赵敏",       // 🎯 第 10 次抽奖必中之人
  "孙强",       // 🎯 第 11 次抽奖必中之人
  "周婷",       // 🎯 第 12 次抽奖必中之人
  "吴磊",       // 🎯 第 13 次抽奖必中之人
  "郑勇"        // 🎯 第 14 次抽奖必中之人
];

/**
 * 👥【初始 14 位人员名单】
 * 页面右侧文本框默认加载这些名字，也可以在网页上直接编辑或粘贴替换
 */
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

// ==============================================================================
// ⚙️ Wheel of Names 1:1 引擎逻辑
// ==============================================================================

(function () {
  'use strict';

  // Wheel of Names official palette
  const WHEEL_COLORS = [
    '#e11d48', // red
    '#2563eb', // blue
    '#16a34a', // green
    '#eab308', // yellow
    '#ea580c', // orange
    '#9333ea', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6', // teal
    '#84cc16', // lime
    '#3b82f6', // sky
    '#f97316', // amber
    '#8b5cf6', // violet
    '#0284c7'  // ocean
  ];

  class WheelOfNamesApp {
    constructor() {
      this.canvas = document.getElementById('wheel-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.pointer = document.getElementById('wheel-pointer');
      this.entriesTextarea = document.getElementById('entries-textarea');
      this.promptTop = document.getElementById('tilt-top-prompt');
      this.promptBottom = document.getElementById('tilt-bottom-prompt');

      this.names = [...INITIAL_NAMES];
      this.spinIndex = 0; // Current round index
      this.results = [];

      this.currentAngle = 0; // in radians
      this.isSpinning = false;
      this.lastTickSlice = -1;

      // Idle slow continuous rotation before spin
      this.isIdle = true;
      this.idleSpeed = 0.003; // Smooth gentle rotation speed

      this.initCanvasSize();
      this.initEvents();
      this.render();
      this.updateUI();
      this.startIdleLoop();
    }

    startIdleLoop() {
      const loop = () => {
        if (this.isIdle && !this.isSpinning) {
          this.currentAngle = (this.currentAngle + this.idleSpeed) % (Math.PI * 2);
          this.render();
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    initCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const size = Math.max(rect.width || 600, 600);

      this.canvas.width = size * dpr;
      this.canvas.height = size * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvasSize = size;
      this.center = size / 2;
      this.radius = size / 2 - 10;
    }

    // Helper: calculate luminance to set black or white text matching Image 2
    getSliceTextColor(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 155 ? '#1f2937' : '#ffffff';
    }

    adjustBrightness(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, Math.max(0, (num >> 16) + amt));
      const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
      const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // Dynamically match 3D pointer color to the slice at 3 o'clock (matching Online behavior)
    updatePointerColor(sliceColor) {
      if (!this.pointer) return;
      const topPoly = this.pointer.querySelectorAll('polygon')[0];
      const botPoly = this.pointer.querySelectorAll('polygon')[1];
      const line = this.pointer.querySelector('line');

      if (topPoly && botPoly) {
        topPoly.setAttribute('fill', sliceColor);
        topPoly.setAttribute('stroke', this.adjustBrightness(sliceColor, -30));
        botPoly.setAttribute('fill', this.adjustBrightness(sliceColor, -25));
        botPoly.setAttribute('stroke', this.adjustBrightness(sliceColor, -45));
        if (line) line.setAttribute('stroke', this.adjustBrightness(sliceColor, 35));
      }
    }

    // Draw smooth curved text matching Image 2 (Click to spin & or press ctrl+enter)
    drawCurvedPromptText(text, isBottom, radius, fontSize, baseAngleOffset = 0) {
      const ctx = this.ctx;
      const center = this.center;
      const chars = text.split('');

      // Measure character widths
      ctx.save();
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);

      // Spacing angle
      const totalAngle = totalWidth / radius;
      let currentAngle = -totalAngle / 2;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const w = charWidths[i];
        const charMidAngle = currentAngle + (w / 2) / radius;
        currentAngle += w / radius;

        ctx.save();
        if (!isBottom) {
          // Top rainbow arc (convex upward) shifted to upper-left
          const finalAngle = charMidAngle + baseAngleOffset;
          const x = center + radius * Math.sin(finalAngle);
          const y = center - radius * Math.cos(finalAngle);
          ctx.translate(x, y);
          ctx.rotate(finalAngle);
        } else {
          // Bottom smile arc (convex downward) shifted to lower-left
          const finalAngle = charMidAngle + baseAngleOffset;
          const x = center + radius * Math.sin(finalAngle);
          const y = center + radius * Math.cos(finalAngle);
          ctx.translate(x, y);
          ctx.rotate(-finalAngle);
        }

        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }

    // ================== WHEEL DRAWING ENGINE ==================

    render() {
      const ctx = this.ctx;
      const center = this.center;
      const radius = this.radius;
      const count = this.names.length;

      ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

      if (count === 0) {
        ctx.fillStyle = '#9da3b4';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Please add entries', center, center);
        return;
      }

      const arc = (Math.PI * 2) / count;

      // 1. Draw Wheel Slices
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(this.currentAngle);

      for (let i = 0; i < count; i++) {
        const startAngle = i * arc;
        const endAngle = startAngle + arc;
        const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Dividing hairline
        ctx.strokeStyle = '#ffffff25';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Slice text (Radial from rim towards center)
        ctx.save();
        const sliceMid = startAngle + arc / 2;
        ctx.rotate(sliceMid);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Dynamic luminance text color (Black on bright slices, White on dark slices, matching Image 2!)
        const textColor = this.getSliceTextColor(color);
        ctx.fillStyle = textColor;

        // Auto font size (Enlarged and bold for high visibility)
        const fontSize = Math.min(36, Math.max(18, Math.floor(460 / count)));
        ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

        if (textColor === '#ffffff') {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 5;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillText(this.names[i], radius - 20, 0);
        ctx.restore();
      }

      ctx.restore();

      // 2. Draw Wheel Outer Rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff18';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();

      // 3. Update dynamic 3D pointer color to match current slice under 3 o'clock (0 radians)
      const pointerAngle = 0;
      const normAngle = ((pointerAngle - this.currentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const currentSlice = Math.floor(normAngle / arc);
      const currentSliceColor = WHEEL_COLORS[currentSlice % WHEEL_COLORS.length];
      this.updatePointerColor(currentSliceColor);

      // 4. Draw Curved Prompts ("Click to spin" & "or press ctrl+enter") centered in the middle
      if (!this.isSpinning) {
        // Top Rainbow curve (Click to spin) - Centered in the middle (baseAngleOffset = 0)
        const topRadius = radius * 0.58;
        const topFontSize = Math.round(radius * 0.165);
        this.drawCurvedPromptText('Click to spin', false, topRadius, topFontSize, 0);

        // Bottom Smile curve (or press ctrl+enter) - Centered in the middle (baseAngleOffset = 0)
        const bottomRadius = radius * 0.62;
        const bottomFontSize = Math.round(radius * 0.115);
        this.drawCurvedPromptText('or press ctrl+enter', true, bottomRadius, bottomFontSize, 0);
      }
    }

    // ================== STEALTH RIGGED SPIN ALGORITHM ==================
    // Pointer is on the RIGHT side at 3 o'clock (0 radians)
    spin() {
      if (this.isSpinning) return;
      if (this.names.length === 0) return;

      this.isIdle = false; // Stop idle rotation

      if (window.soundEngine) {
        window.soundEngine.init();
      }

      this.isSpinning = true;

      // Hide prompts while spinning
      if (this.promptTop) this.promptTop.style.opacity = '0';
      if (this.promptBottom) this.promptBottom.style.opacity = '0';

      // 1. Determine Winning Target from WINNER_SEQUENCE
      let targetWinner = null;
      if (this.spinIndex < WINNER_SEQUENCE.length) {
        const designatedName = WINNER_SEQUENCE[this.spinIndex];
        // Check if designated name is currently on the wheel
        if (this.names.includes(designatedName)) {
          targetWinner = designatedName;
        }
      }

      // Fallback if not configured or name was removed
      if (!targetWinner) {
        const randIndex = Math.floor(Math.random() * this.names.length);
        targetWinner = this.names[randIndex];
      }

      // 2. Exact Angle Calculation for Pointer at 3 o'clock (0 radians)
      const targetIndex = this.names.indexOf(targetWinner);
      const arc = (Math.PI * 2) / this.names.length;

      // Jitter inside slice (+/- 26% of slice) so it doesn't look dead-center
      const jitter = (Math.random() - 0.5) * (arc * 0.52);
      const sliceCenter = targetIndex * arc + arc / 2 + jitter;

      // Desired angle modulo 2*PI: pointer is at 0
      let desiredModAngle = (-sliceCenter) % (Math.PI * 2);
      if (desiredModAngle < 0) desiredModAngle += Math.PI * 2;

      // Full revolutions (7 to 9 full spins)
      const fullSpins = 7 + Math.floor(Math.random() * 3);
      const currentModAngle = this.currentAngle % (Math.PI * 2);
      let deltaAngle = desiredModAngle - currentModAngle;
      if (deltaAngle <= 0) deltaAngle += Math.PI * 2;

      const totalRotation = deltaAngle + fullSpins * Math.PI * 2;
      const startAngle = this.currentAngle;
      const endAngle = startAngle + totalRotation;

      // 3. Realistic Ease-Out Quintic Deceleration
      const duration = 6500;
      const startTime = performance.now();
      let lastFrameAngle = startAngle;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Quintic Ease-out curve
        const ease = 1 - Math.pow(1 - progress, 5);
        this.currentAngle = startAngle + totalRotation * ease;

        const velocity = this.currentAngle - lastFrameAngle;
        lastFrameAngle = this.currentAngle;

        // Pointer tick detection on 3 o'clock pointer
        const pointerAngle = 0;
        const normAngle = ((pointerAngle - this.currentAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor(normAngle / arc);

        if (currentSlice !== this.lastTickSlice) {
          this.lastTickSlice = currentSlice;
          this.triggerPointerBump();
          if (window.soundEngine) {
            window.soundEngine.playTick(velocity * 30);
          }
        }

        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isSpinning = false;
          this.currentAngle = endAngle;
          this.render();
          if (this.promptTop) this.promptTop.style.opacity = '1';
          if (this.promptBottom) this.promptBottom.style.opacity = '1';
          this.onSpinComplete(targetWinner);
        }
      };

      requestAnimationFrame(animate);
    }

    triggerPointerBump() {
      this.pointer.classList.remove('tick-bump');
      void this.pointer.offsetWidth;
      this.pointer.classList.add('tick-bump');
    }

    onSpinComplete(winnerName) {
      if (window.soundEngine) {
        window.soundEngine.playFanfare();
      }

      if (window.confettiCannon) {
        window.confettiCannon.fire(4500);
      }

      // Add to results
      this.results.unshift({
        name: winnerName,
        time: new Date().toLocaleTimeString()
      });
      this.renderResults();

      // Show Official Winner Modal (NO PRIZE TEXT!)
      this.lastWinner = winnerName;
      document.getElementById('winner-display-name').textContent = winnerName;
      document.getElementById('winner-modal').classList.add('open');
    }

    advanceRound(removeWinner = false) {
      if (removeWinner && this.lastWinner) {
        this.names = this.names.filter(n => n !== this.lastWinner);
        this.entriesTextarea.value = this.names.join('\n');
        this.render();
      }

      this.spinIndex++;
      this.updateEntryCount();
      this.isIdle = true; // Resume gentle idle rotation
    }

    // ================== EVENT HANDLERS ==================

    initEvents() {
      // Click canvas or center hub to spin
      this.canvas.addEventListener('click', () => this.spin());
      document.getElementById('center-hub').addEventListener('click', () => this.spin());

      // Textarea input sync
      this.entriesTextarea.addEventListener('input', (e) => {
        this.names = e.target.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        this.render();
        this.updateEntryCount();
      });

      // Tool: Shuffle
      document.getElementById('btn-tool-shuffle').addEventListener('click', () => {
        for (let i = this.names.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.names[i], this.names[j]] = [this.names[j], this.names[i]];
        }
        this.render();
        this.entriesTextarea.value = this.names.join('\n');
      });

      // Tool: Sort
      document.getElementById('btn-tool-sort').addEventListener('click', () => {
        this.names.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
        this.render();
        this.entriesTextarea.value = this.names.join('\n');
      });

      // Sidebar Tab Switching
      const tabEntries = document.getElementById('tab-btn-entries');
      const tabResults = document.getElementById('tab-btn-results');
      const panelEntries = document.getElementById('entries-panel');
      const panelResults = document.getElementById('results-panel');

      tabEntries.addEventListener('click', () => {
        tabEntries.classList.add('active');
        tabResults.classList.remove('active');
        panelEntries.style.display = 'flex';
        panelResults.classList.remove('active');
      });

      tabResults.addEventListener('click', () => {
        tabResults.classList.add('active');
        tabEntries.classList.remove('active');
        panelEntries.style.display = 'none';
        panelResults.classList.add('active');
      });

      // Sidebar Toggle
      document.getElementById('btn-toggle-sidebar').addEventListener('click', () => {
        const sb = document.getElementById('won-right-sidebar');
        sb.classList.toggle('collapsed');
      });

      // Winner Modal Actions
      document.getElementById('btn-modal-close').addEventListener('click', () => {
        document.getElementById('winner-modal').classList.remove('open');
        this.advanceRound(false);
      });

      document.getElementById('btn-modal-remove').addEventListener('click', () => {
        document.getElementById('winner-modal').classList.remove('open');
        this.advanceRound(true);
      });

      document.getElementById('btn-modal-x').addEventListener('click', () => {
        document.getElementById('winner-modal').classList.remove('open');
        this.advanceRound(false);
      });

      // Fullscreen
      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });

      // Innocent "Customize" Modal
      document.getElementById('btn-nav-customize').addEventListener('click', () => {
        document.getElementById('customize-modal').classList.add('open');
      });
      document.getElementById('btn-close-customize').addEventListener('click', () => {
        document.getElementById('customize-modal').classList.remove('open');
      });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        const isModalOpen = document.getElementById('winner-modal').classList.contains('open');
        if (isModalOpen) {
          if (e.key === 'Enter' || e.code === 'Space' || e.key === 'Escape') {
            e.preventDefault();
            document.getElementById('btn-modal-close').click();
          }
          return;
        }

        // Ctrl + Enter to spin
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.spin();
          return;
        }

        // Space to spin when not typing
        if (e.code === 'Space' && !this.isTyping(e)) {
          e.preventDefault();
          this.spin();
          return;
        }
      });

      // Window Resize
      window.addEventListener('resize', () => {
        this.initCanvasSize();
        this.render();
      });
    }

    isTyping(e) {
      const tag = (e.target || {}).tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    renderResults() {
      const list = document.getElementById('results-list');
      document.getElementById('results-count-badge').textContent = this.results.length;

      if (this.results.length === 0) {
        list.innerHTML = '<div style="color:#6b7280; text-align:center; padding:20px 0; font-size:0.82rem;">No results yet</div>';
        return;
      }

      list.innerHTML = '';
      this.results.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'result-row';
        item.innerHTML = `
          <div style="font-weight:700; color:#fff;">${r.name}</div>
          <div style="font-size:0.72rem; color:#9da3b4;">${r.time}</div>
        `;
        list.appendChild(item);
      });
    }

    updateEntryCount() {
      document.getElementById('entries-count-badge').textContent = this.names.length;
    }

    updateUI() {
      this.entriesTextarea.value = this.names.join('\n');
      this.updateEntryCount();
      this.renderResults();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.wheelApp = new WheelOfNamesApp();
  });

})();
