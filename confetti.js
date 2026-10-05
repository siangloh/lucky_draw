/**
 * High-performance Confetti and Streamer Particle Engine
 * Canvas-based, smooth physics with air drag and flutter
 */
class ConfettiCannon {
  constructor(canvasId = 'confetti-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  fire(durationMs = 4000) {
    this.resize();
    const colors = [
      '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#f97316', '#eab308', '#06b6d4', '#ffffff'
    ];

    // Left cannon
    this.addBurst(this.width * 0.15, this.height * 0.8, 60, -60, colors);
    // Right cannon
    this.addBurst(this.width * 0.85, this.height * 0.8, 120, -60, colors);
    // Center cannon
    this.addBurst(this.width * 0.5, this.height * 0.6, 90, -90, colors);

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }

    // Secondary burst after 400ms for continuous celebration
    setTimeout(() => {
      this.addBurst(this.width * 0.3, this.height * 0.7, 70, -70, colors);
      this.addBurst(this.width * 0.7, this.height * 0.7, 110, -70, colors);
    }, 450);
  }

  addBurst(startX, startY, angleDeg, spreadDeg, colors) {
    const count = 70;
    for (let i = 0; i < count; i++) {
      const angle = (angleDeg + (Math.random() * spreadDeg - spreadDeg / 2)) * (Math.PI / 180);
      const velocity = 15 + Math.random() * 22;
      const size = 7 + Math.random() * 8;
      const isRibbon = Math.random() > 0.65;

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: -Math.sin(angle) * velocity,
        gravity: 0.45 + Math.random() * 0.25,
        drag: 0.965,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.08 + Math.random() * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: size,
        height: isRibbon ? size * (2.5 + Math.random() * 2.5) : size,
        isRibbon: isRibbon,
        alpha: 1,
        decay: 0.003 + Math.random() * 0.005
      });
    }
  }

  loop() {
    if (!this.animating) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.scale(Math.sin(p.wobble), 1);
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.isRibbon) {
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  clear() {
    this.particles = [];
    this.animating = false;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

window.confettiCannon = new ConfettiCannon();
