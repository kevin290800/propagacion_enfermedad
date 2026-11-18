/**
 * Gráfica comparativa: simulación de agentes (ESTOCÁSTICA, puntos) frente a la solución RK4
 * de la EDO (DETERMINISTA, líneas) con la MISMA población N y las mismas condiciones iniciales.
 * Incluye título de ejes con unidades, leyenda, marcadores de pico y selección de un día
 * (clic) para revisar la ciudad en ese momento en el mapa 2D.
 */
const COLORS = { S: '#38bdf8', E: '#fbbf24', I: '#ef4444', R: '#10b981', D: '#94a3b8', V: '#a855f7' };
const NAMES = { S: 'Susceptibles', E: 'Expuestos', I: 'Infectados', R: 'Recuperados', D: 'Fallecidos', V: 'Vacunados' };

export class ComparisonChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ode = null;
    this.history = [];
    this.N = 1;
    this.day = 0;
    this.series = ['S', 'E', 'I', 'R', 'D', 'V'];
    this.hover = null;
    this.onDayClick = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); this.hover = e.clientX - r.left; this.render(); });
    canvas.addEventListener('mouseleave', () => { this.hover = null; this.render(); });
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const d = this.dayAt(e.clientX - r.left);
      if (d !== null && this.onDayClick) this.onDayClick(d);
    });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width || 600;
    this.h = r.height || 300;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  setData(ode, history, N, day, offset = 0) {
    this.offset = offset;
    this.ode = ode;
    this.history = history;
    this.N = Math.max(1, N);
    this.day = day;
    this.render();
  }

  get pad() { return { l: 56, r: 14, t: 34, b: 42 }; }
  get maxDay() { return Math.max(30, this.ode ? this.ode.times[this.ode.times.length - 1] + (this.offset || 0) : 30); }
  dayAt(px) {
    const p = this.pad, W = this.w - p.l - p.r;
    const d = Math.round(((px - p.l) / W) * this.maxDay);
    return d >= 0 && d <= this.maxDay ? d : null;
  }

  render() {
    const c = this.ctx;
    if (!c || !this.w) return;
    const light = document.body.classList.contains('light-theme');
    const ink = light ? '#334155' : '#94a3b8';
    c.clearRect(0, 0, this.w, this.h);
    const p = this.pad;
    const W = this.w - p.l - p.r, H = this.h - p.t - p.b;
    if (W <= 0 || H <= 0) return;
    const maxDay = this.maxDay;
    const X = (d) => p.l + (d / maxDay) * W;
    const Y = (v) => p.t + H - (v / this.N) * H;
    c.strokeStyle = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
    c.fillStyle = ink;
    c.font = '11px system-ui, sans-serif';
    c.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const y = p.t + (H * k) / 4;
      c.beginPath(); c.moveTo(p.l, y); c.lineTo(p.l + W, y); c.stroke();
      c.textAlign = 'right';
      c.fillText(`${Math.round(this.N * (1 - k / 4))}`, p.l - 6, y + 4);
    }
    c.textAlign = 'center';
    for (let d = 0; d <= maxDay; d += maxDay > 120 ? 30 : 15) c.fillText(`${d}`, X(d), p.t + H + 15);
    c.font = '600 11px system-ui, sans-serif';
    c.fillText('Tiempo t (días)', p.l + W / 2, this.h - 6);
    c.save(); c.translate(13, p.t + H / 2); c.rotate(-Math.PI / 2); c.fillText(`Personas (N = ${this.N})`, 0, 0); c.restore();

    const has = (k) => (this.ode && this.ode[k] && Math.max(...this.ode[k]) >= this.N * 0.004) || this.history.some((h) => h[k] > 0);
    const shown = this.series.filter(has);
    // EDO: líneas continuas
    if (this.ode) {
      for (const k of shown) {
        const arr = this.ode[k];
        if (!arr) continue;
        c.strokeStyle = COLORS[k]; c.lineWidth = 2.2; c.globalAlpha = 0.85;
        c.beginPath();
        const o = this.offset || 0;
        this.ode.times.forEach((t, i) => (i ? c.lineTo(X(t + o), Y(arr[i])) : c.moveTo(X(t + o), Y(arr[i]))));
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    // Agentes: puntos
    for (const k of shown) {
      c.fillStyle = COLORS[k];
      c.strokeStyle = light ? '#0f172a' : '#0b1020';
      for (const h of this.history) {
        if (h[k] === undefined) continue;
        c.beginPath(); c.arc(X(h.day), Y(h[k]), 3, 0, Math.PI * 2); c.fill(); c.lineWidth = 0.8; c.stroke();
      }
    }
    // marcadores de pico de I
    const mark = (x, y, label, col, dash) => {
      c.strokeStyle = col; c.setLineDash(dash ? [3, 3] : []); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, p.t + H); c.stroke(); c.setLineDash([]);
      c.fillStyle = col; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
      c.font = '600 10px system-ui'; c.textAlign = 'left';
      c.fillText(label, Math.min(x + 7, this.w - 120), y - 6);
    };
    if (this.ode) {
      const s = this.ode.summary;
      const o = this.offset || 0;
      mark(X(s.peakDay + o), Y(s.peakInfected), `Pico EDO: ${s.peakInfected} (día ${s.peakDay + o})`, '#fca5a5', true);
    }
    let pa = null;
    for (const h of this.history) if (!pa || h.I > pa.I) pa = h;
    if (pa && pa.I > 0) mark(X(pa.day), Y(pa.I), `Pico agentes: ${pa.I} (día ${pa.day})`, '#f87171', false);
    // día actual
    c.strokeStyle = '#f43f5e'; c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(X(this.day), p.t); c.lineTo(X(this.day), p.t + H); c.stroke();
    c.setLineDash([]);
    // leyenda
    c.font = '11px system-ui'; c.textAlign = 'left';
    let lx = p.l;
    c.fillStyle = ink; c.fillText('Líneas = EDO (determinista) · Puntos = agentes (estocástico)', lx, 14);
    lx = p.l;
    for (const k of shown) {
      c.fillStyle = COLORS[k];
      c.fillRect(lx, 21, 14, 3);
      c.beginPath(); c.arc(lx + 7, 22.5, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = ink; c.fillText(NAMES[k], lx + 18, 27);
      lx += c.measureText(NAMES[k]).width + 32;
    }
    // lectura bajo el cursor
    if (this.hover !== null && this.ode) {
      const d = this.dayAt(this.hover);
      if (d !== null) {
        const hi = this.history.find((h) => h.day === d);
        const oi = this.ode.times.indexOf(d - (this.offset || 0));
        c.strokeStyle = light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
        c.beginPath(); c.moveTo(X(d), p.t); c.lineTo(X(d), p.t + H); c.stroke();
        const lines = [`Día ${d}`];
        if (oi >= 0) lines.push(`EDO: I=${this.ode.I[oi].toFixed(1)}  R=${this.ode.R[oi].toFixed(1)}  S=${this.ode.S[oi].toFixed(0)}`);
        if (hi) lines.push(`Agentes: I=${hi.I}  R=${hi.R}  S=${hi.S}`);
        lines.push(hi ? 'Clic: ver la ciudad ese día (mapa 2D)' : '');
        const bx = Math.min(X(d) + 8, this.w - 230);
        c.fillStyle = light ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.94)';
        c.fillRect(bx, p.t + 4, 222, lines.length * 15 + 8);
        c.fillStyle = light ? '#0f172a' : '#f8fafc';
        lines.forEach((t, i) => c.fillText(t, bx + 6, p.t + 18 + i * 15));
      }
    }
  }
}
