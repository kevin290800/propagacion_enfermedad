/**
 * Animación 2D (Canvas) del mecanismo de transmisión de la enfermedad seleccionada:
 *  aerosol / droplets · contacto · mosquito (ciclo humano → mosquito → humano) · agua (pozo contaminado).
 * Es un esquema didáctico: el contagio REAL lo decide el motor epidemiológico.
 */
export class TransmissionDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.kind = 'aerosol';
    this.t0 = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  set(kind) { this.kind = kind; this.t0 = performance.now(); }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return false;
    if (this.canvas.width !== Math.round(r.width * dpr)) {
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
    return true;
  }

  person(x, y, color, label, s = 1, sick = false) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = color;
    c.beginPath(); c.arc(0, -34, 11, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.roundRect(-12, -21, 24, 32, 9); c.fill();
    c.fillRect(-10, 9, 8, 22); c.fillRect(2, 9, 8, 22);
    if (sick) { c.fillStyle = '#fff'; c.font = '700 12px system-ui'; c.textAlign = 'center'; c.fillText('🤒', 0, -52); }
    c.restore();
    if (label) {
      c.fillStyle = '#cbd5e1'; c.font = '600 11px system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(label, x, y + 48 * s);
    }
  }

  caption(text, y) {
    const c = this.ctx;
    c.fillStyle = '#e2e8f0'; c.font = '600 12px system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText(text, this.w / 2, y);
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    if (this.canvas.offsetParent === null || !this.resize()) return;
    const c = this.ctx, W = this.w, H = this.h;
    const t = ((now - this.t0) / 1000) % 6;
    c.clearRect(0, 0, W, H);
    const yb = H * 0.68;
    const A = { x: W * 0.2, y: yb }, B = { x: W * 0.8, y: yb };
    const k = this.kind;
    if (k === 'aerosol' || k === 'droplets') {
      const turned = t > 4;
      this.person(A.x, A.y, '#ef4444', 'Infectado (I)', 1, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto (E)' : 'Susceptible (S)');
      if (k === 'aerosol') {
        c.strokeStyle = 'rgba(148,163,184,0.5)'; c.setLineDash([5, 5]);
        c.strokeRect(W * 0.08, H * 0.12, W * 0.84, H * 0.72); c.setLineDash([]);
        c.fillStyle = '#94a3b8'; c.font = '11px system-ui'; c.textAlign = 'left';
        c.fillText('Espacio cerrado: el aire compartido acumula aerosoles', W * 0.1, H * 0.1);
      }
      const n = k === 'aerosol' ? 40 : 18;
      for (let i = 0; i < n; i++) {
        const u = ((t / 4) + i / n) % 1;
        if (t > 4.2) break;
        const spread = k === 'aerosol' ? 0.35 : 0.12;
        const x = A.x + 16 + (B.x - A.x - 30) * u;
        const y = A.y - 36 + Math.sin(u * Math.PI + i) * H * spread * u - (k === 'aerosol' ? Math.sin(i) * 12 * u : 0);
        c.fillStyle = k === 'aerosol' ? `rgba(252,165,165,${0.8 - u * 0.4})` : `rgba(186,230,253,${0.9 - u * 0.5})`;
        c.beginPath(); c.arc(x, y, k === 'aerosol' ? 2.2 : 3.5, 0, Math.PI * 2); c.fill();
      }
      this.caption(k === 'aerosol' ? 'Tos / respiración → aerosoles suspendidos → inhalación' : 'Tos o estornudo → gotículas (< 2 m) → mucosas', 18);
    } else if (k === 'contact') {
      const close = Math.min(1, t / 2);
      const ax = A.x + (W * 0.22) * close, bx = B.x - (W * 0.22) * close;
      const turned = t > 4;
      this.person(ax, A.y, '#ef4444', 'Infectado', 1, true);
      this.person(bx, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Susceptible');
      if (t > 2 && t < 4.5) {
        const r = 10 + ((t - 2) * 20) % 30;
        c.strokeStyle = `rgba(249,115,22,${1 - r / 40})`; c.lineWidth = 3;
        c.beginPath(); c.arc((ax + bx) / 2, A.y - 10, r, 0, Math.PI * 2); c.stroke();
      }
      this.caption('Contacto directo con piel, sangre o fluidos (cuidado de enfermos, convivencia)', 18);
    } else if (k === 'mosquito') {
      const C = { x: W * 0.5, y: H * 0.32 };
      const turned = t > 5;
      this.person(A.x, A.y, '#ef4444', 'Humano infectado', 0.9, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Humano sano', 0.9);
      // ciclo: 0-1.5 pica a A, 1.5-3.5 incubación extrínseca, 3.5-5 pica a B
      let mx, my, infected = t > 1.5;
      if (t < 1.5) { const u = t / 1.5; mx = C.x + (A.x - C.x) * u; my = C.y + (A.y - 50 - C.y) * u; }
      else if (t < 3.5) { const u = (t - 1.5) / 2; mx = C.x + Math.cos(u * 6.28) * 30; my = C.y + Math.sin(u * 6.28) * 14; }
      else { const u = Math.min(1, (t - 3.5) / 1.5); mx = C.x + (B.x - C.x) * u; my = C.y + (B.y - 50 - C.y) * u; }
      c.fillStyle = infected ? '#dc2626' : '#27272a';
      c.beginPath(); c.ellipse(mx, my, 9, 4, 0.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(226,232,240,0.7)';
      c.beginPath(); c.ellipse(mx - 2, my - 7, 7, 3, -0.6 + Math.sin(now * 0.05) * 0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(mx + 3, my - 7, 7, 3, 0.6 - Math.sin(now * 0.05) * 0.4, 0, Math.PI * 2); c.fill();
      if (t > 1.5 && t < 3.5) { c.fillStyle = '#fcd34d'; c.font = '600 11px system-ui'; c.textAlign = 'center'; c.fillText('Incubación en el mosquito (periodo extrínseco)', C.x, C.y + 34); }
      this.caption('Humano → mosquito → humano: no hay contagio directo entre personas', 18);
    } else if (k === 'water') {
      const Wl = { x: W * 0.5, y: yb + 10 };
      const lv = Math.min(1, Math.max(0, (t - 1) / 2));
      c.fillStyle = '#78716c'; c.beginPath(); c.roundRect(Wl.x - 34, Wl.y - 24, 68, 34, 6); c.fill();
      c.fillStyle = `rgb(${56 + 70 * lv},${189 - 60 * lv},${248 - 190 * lv})`;
      c.beginPath(); c.ellipse(Wl.x, Wl.y - 24, 30, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#cbd5e1'; c.font = '600 11px system-ui'; c.textAlign = 'center'; c.fillText('Pozo / fuente', Wl.x, Wl.y + 28);
      const turned = t > 4.8;
      this.person(A.x, A.y, '#ef4444', 'Infectado contamina', 0.9, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Bebe agua', 0.9);
      if (t > 0.3 && t < 2.5) {
        for (let i = 0; i < 8; i++) {
          const u = ((t - 0.3) / 2.2 + i / 8) % 1;
          c.fillStyle = 'rgba(132,204,22,0.85)';
          c.beginPath(); c.arc(A.x + 20 + (Wl.x - A.x - 30) * u, A.y - 10 + Math.sin(u * 3.14) * -20, 3, 0, Math.PI * 2); c.fill();
        }
      }
      if (t > 3 && t < 4.8) {
        const u = (t - 3) / 1.8;
        c.fillStyle = 'rgba(56,189,248,0.9)';
        c.beginPath(); c.arc(Wl.x + 20 + (B.x - Wl.x - 30) * u, Wl.y - 30 - Math.sin(u * 3.14) * 30, 5, 0, Math.PI * 2); c.fill();
      }
      this.caption('Heces de infectados → agua contaminada (W) → quien bebe se expone', 18);
    }
  }
}
