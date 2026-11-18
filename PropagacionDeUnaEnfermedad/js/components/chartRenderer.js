/**
 * Motor Gráfico Epidemiológico de Alto Rendimiento (HTML5 Canvas Nativo)
 * Representa curvas continuas de sistemas de Ecuaciones Diferenciales (RK4)
 * - Soporte para Retina / High-DPI
 * - Tooltip interactivo al mover el ratón o deslizar el dedo
 * - Cursor temporal sincronizado con la simulación
 * - Línea de Capacidad Hospitalaria y Marcador de Pico Epidémico
 * - Gráfico de Rt (Número Reproductivo Efectivo)
 */

export class ChartRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = null;
    this.currentDay = 0;
    this.hoverIndex = null;
    this.activeMode = 'compartments'; // 'compartments' o 'rt'

    this.padding = { top: 35, right: 30, bottom: 45, left: 65 };

    this.colors = {
      S: '#38bdf8',  // Susceptibles
      E: '#fbbf24',  // Expuestos
      I: '#ef4444',  // Infectados
      R: '#10b981',  // Recuperados
      D: '#94a3b8',  // Fallecidos
      V: '#a855f7',  // Vacunados
      Rt: '#f43f5e', // Rt
      hospital: '#f97316' // Capacidad
    };

    this.initCanvasSize();
    this.bindEvents();
  }

  initCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 700);
    const height = rect.height > 0 ? rect.height : 340;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayW = width;
    this.displayH = height;

    if (this.data) this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    const updateHover = (clientX, clientY) => {
      if (!this.data || !this.data.times || this.data.times.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const chartW = this.displayW - this.padding.left - this.padding.right;
      if (mouseX >= this.padding.left && mouseX <= this.displayW - this.padding.right) {
        const ratio = (mouseX - this.padding.left) / chartW;
        const index = Math.round(ratio * (this.data.times.length - 1));
        this.hoverIndex = Math.max(0, Math.min(this.data.times.length - 1, index));
      } else {
        this.hoverIndex = null;
      }
      this.render();
    };

    this.canvas.addEventListener('mousemove', (e) => updateHover(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = null;
      this.render();
    });

    // Soporte táctil para celulares
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        updateHover(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.hoverIndex = null;
      this.render();
    });
  }

  setMode(mode) {
    this.activeMode = mode;
    this.render();
  }

  updateData(solutionData) {
    this.data = solutionData;
    this.render();
  }

  setCurrentDay(day) {
    this.currentDay = day;
    this.render();
  }

  render() {
    if (!this.data || !this.data.times) return;

    const ctx = this.ctx;
    const w = this.displayW;
    const h = this.displayH;
    const p = this.padding;

    // Limpiar canvas
    ctx.clearRect(0, 0, w, h);

    const chartW = w - p.left - p.right;
    const chartH = h - p.top - p.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    if (this.activeMode === 'rt') {
      this.renderRtChart(ctx, chartW, chartH, p);
    } else {
      this.renderCompartmentChart(ctx, chartW, chartH, p);
    }
  }

  renderCompartmentChart(ctx, chartW, chartH, p) {
    const { times, S, E, I, R, D, summary } = this.data;
    const n = times.length;
    if (n === 0) return;

    const maxVal = Math.max(
      ...S,
      ...E,
      ...I,
      ...R,
      summary.hospitalBeds || 0
    ) * 1.05;

    const getX = (i) => p.left + (i / (n - 1)) * chartW;
    const getY = (val) => p.top + chartH - (val / maxVal) * chartH;

    // Cuadrícula y ejes
    this.drawGrid(ctx, chartW, chartH, p, maxVal, times[n - 1]);

    // Capacidad Hospitalaria (línea punteada)
    if (summary.hospitalBeds) {
      const yHosp = getY(summary.hospitalBeds);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = this.colors.hospital;
      ctx.lineWidth = 1.8;
      ctx.moveTo(p.left, yHosp);
      ctx.lineTo(p.left + chartW, yHosp);
      ctx.stroke();

      // Texto de camas UCI
      ctx.fillStyle = this.colors.hospital;
      ctx.font = '11px sans-serif';
      ctx.fillText(`Capacidad Hospitalaria: ${summary.hospitalBeds.toLocaleString()}`, p.left + 8, yHosp - 5);
      ctx.restore();
    }

    // Dibujar curvas continuas
    this.drawCurve(ctx, times, S, this.colors.S, 2.5, getX, getY, 'Susceptibles (S)');
    if (E && E.length > 0 && Math.max(...E) > 0) {
      this.drawCurve(ctx, times, E, this.colors.E, 2.5, getX, getY, 'Expuestos (E)');
    }
    this.drawCurve(ctx, times, R, this.colors.R, 2.5, getX, getY, 'Recuperados (R)');
    this.drawCurve(ctx, times, D, this.colors.D, 2.0, getX, getY, 'Fallecidos (D)');
    
    // Curva de infectados con área sombreada
    this.drawAreaUnderCurve(ctx, times, I, 'rgba(239, 68, 68, 0.2)', getX, getY, chartH, p);
    this.drawCurve(ctx, times, I, this.colors.I, 3.2, getX, getY, 'Infectados (I)');

    // Marcador del Pico de Infectados
    if (summary.peakDay !== undefined && summary.peakInfected !== undefined) {
      const peakIndex = times.indexOf(summary.peakDay);
      if (peakIndex >= 0) {
        const px = getX(peakIndex);
        const py = getY(summary.peakInfected);

        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Etiqueta del pico
        ctx.font = 'bold 11px sans-serif';
        const labelText = `Pico: ${summary.peakInfected.toLocaleString()} (Día ${summary.peakDay})`;
        ctx.fillStyle = '#ffffff';
        const textW = ctx.measureText(labelText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(px - textW / 2 - 6, py - 28, textW + 12, 20);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(px - textW / 2 - 6, py - 28, textW + 12, 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(labelText, px - textW / 2, py - 14);
        ctx.restore();
      }
    }

    // Cursor del Día Actual en simulación
    if (this.currentDay > 0) {
      const currentDayIndex = Math.min(times.length - 1, Math.round(this.currentDay));
      const cx = getX(currentDayIndex);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(cx, p.top);
      ctx.lineTo(cx, p.top + chartH);
      ctx.stroke();
      ctx.restore();
    }

    // Tooltip al pasar el ratón / dedo
    if (this.hoverIndex !== null) {
      this.drawTooltip(ctx, this.hoverIndex, getX, getY, p, chartW);
    }
  }

  renderRtChart(ctx, chartW, chartH, p) {
    const { times, Rt, summary } = this.data;
    const n = times.length;
    if (n === 0) return;

    const maxVal = Math.max(3.0, (summary.r0 ? parseFloat(summary.r0) : 3.0) * 1.2);
    const getX = (i) => p.left + (i / (n - 1)) * chartW;
    const getY = (val) => p.top + chartH - (val / maxVal) * chartH;

    this.drawGrid(ctx, chartW, chartH, p, maxVal, times[n - 1], 'Rt');

    // Línea de umbral crítico Rt = 1.0
    const yCritical = getY(1.0);
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(p.left, yCritical);
    ctx.lineTo(p.left + chartW, yCritical);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Umbral Crítico (Rt = 1.0)', p.left + 8, yCritical - 6);
    ctx.restore();

    // Curva de Rt
    this.drawCurve(ctx, times, Rt, this.colors.Rt, 3.0, getX, getY, 'Rt');

    if (this.hoverIndex !== null) {
      const idx = this.hoverIndex;
      const day = times[idx];
      const rtVal = Rt[idx] ? Rt[idx].toFixed(2) : '0';
      const hx = getX(idx);
      const hy = getY(Rt[idx]);

      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Caja de tooltip
      ctx.font = '12px sans-serif';
      const text = `Día ${day}: Rt = ${rtVal} (${parseFloat(rtVal) > 1 ? 'Epidemia en expansión' : 'Epidemia contenida'})`;
      const tw = ctx.measureText(text).width;
      let tx = hx - tw / 2;
      if (tx < p.left) tx = p.left + 5;
      if (tx + tw > this.displayW - p.right) tx = this.displayW - p.right - tw - 5;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(tx - 6, hy - 32, tw + 12, 24);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(tx - 6, hy - 32, tw + 12, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, tx, hy - 16);
      ctx.restore();
    }
  }

  drawGrid(ctx, chartW, chartH, p, maxY, maxDays, yFormat = 'count') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    // Líneas horizontales (Eje Y)
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = p.top + (chartH / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(p.left, y);
      ctx.lineTo(p.left + chartW, y);
      ctx.stroke();

      const val = maxY * (1 - i / ySteps);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      const label = yFormat === 'Rt' ? val.toFixed(1) : this.formatCompactNumber(val);
      ctx.fillText(label, p.left - 8, y + 4);
    }

    // Líneas verticales (Eje X - Días)
    const xSteps = 6;
    for (let j = 0; j <= xSteps; j++) {
      const x = p.left + (chartW / xSteps) * j;
      ctx.beginPath();
      ctx.moveTo(x, p.top);
      ctx.lineTo(x, p.top + chartH);
      ctx.stroke();

      const dayVal = Math.round((maxDays / xSteps) * j);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Día ${dayVal}`, x, p.top + chartH + 18);
    }

    // Etiquetas de ejes
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText('Tiempo transcurrido (Días)', p.left + chartW / 2, p.top + chartH + 36);

    ctx.save();
    ctx.translate(16, p.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yFormat === 'Rt' ? 'Número Reproductivo Efectivo (Rt)' : 'Número de Individuos', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  drawCurve(ctx, times, series, color, lineWidth, getX, getY) {
    if (!series || series.length === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < series.length; i++) {
      const x = getX(i);
      const y = getY(series[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawAreaUnderCurve(ctx, times, series, fillColor, getX, getY, chartH, p) {
    if (!series || series.length === 0) return;
    ctx.save();
    ctx.beginPath();
    const bottomY = p.top + chartH;

    for (let i = 0; i < series.length; i++) {
      const x = getX(i);
      const y = getY(series[i]);
      if (i === 0) ctx.moveTo(x, bottomY);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(getX(series.length - 1), bottomY);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  drawTooltip(ctx, index, getX, getY, p, chartW) {
    const { times, S, E, I, R, D, Rt } = this.data;
    const day = times[index];
    const sVal = Math.round(S[index]);
    const eVal = E ? Math.round(E[index]) : 0;
    const iVal = Math.round(I[index]);
    const rVal = Math.round(R[index]);
    const dVal = Math.round(D[index]);
    const rtVal = Rt && Rt[index] ? Rt[index].toFixed(2) : '-';

    const tx = getX(index);

    // Línea vertical sobre el punto inspeccionado
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.moveTo(tx, p.top);
    ctx.lineTo(tx, p.top + (this.displayH - p.top - p.bottom));
    ctx.stroke();

    // Tarjeta emergente
    const lines = [
      { text: `📅 Día ${day}`, color: '#ffffff', bold: true },
      { text: `🔵 Susceptibles: ${sVal.toLocaleString()}`, color: this.colors.S },
      ...(eVal > 0 ? [{ text: `🟡 Expuestos: ${eVal.toLocaleString()}`, color: this.colors.E }] : []),
      { text: `🔴 Infectados: ${iVal.toLocaleString()}`, color: this.colors.I },
      { text: `🟢 Recuperados: ${rVal.toLocaleString()}`, color: this.colors.R },
      { text: `⚫ Fallecidos: ${dVal.toLocaleString()}`, color: this.colors.D },
      { text: `📈 Rt: ${rtVal}`, color: '#f43f5e' }
    ];

    const cardW = 175;
    const cardH = lines.length * 18 + 12;
    let cardX = tx + 14;
    if (cardX + cardW > this.displayW - p.right) {
      cardX = tx - cardW - 14;
    }
    const cardY = p.top + 10;

    // Fondo tarjeta con efecto glassmorphism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Texto
    lines.forEach((item, lIdx) => {
      ctx.font = item.bold ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.fillStyle = item.color;
      ctx.textAlign = 'left';
      ctx.fillText(item.text, cardX + 10, cardY + 18 + lIdx * 18);
    });

    ctx.restore();
  }

  formatCompactNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.round(num).toString();
  }
}
