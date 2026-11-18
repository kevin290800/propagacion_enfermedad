/**
 * Controles de cámara orbitales (ratón + táctil) escritos a medida.
 * Los OrbitControls oficiales de Three.js sólo se distribuyen como módulo ES,
 * que no funciona al abrir index.html con doble clic (file://).
 *
 *  - Arrastrar (clic izquierdo / 1 dedo): rotar
 *  - Clic derecho, Shift+arrastrar o 2 dedos: desplazar
 *  - Rueda / pellizcar: acercar / alejar
 *  - Un clic sin arrastrar dispara onClick(x, y)
 */
export class OrbitCameraControls {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.target = new THREE.Vector3(0, 0, 0);
    this.radius = 78;
    this.theta = 0.0;   // azimut
    this.phi = 0.88;    // ángulo polar (0 = cenital)
    this.minRadius = 8;
    this.maxRadius = 190;
    this.onClick = null;
    this.onUserMove = null;
    this.goal = null;   // destino animado (seguir a una persona / encuadres)
    this.bind();
    this.update();
  }

  bind() {
    const d = this.dom;
    let mode = null, sx = 0, sy = 0, lx = 0, ly = 0, moved = 0, pinch = 0;
    d.addEventListener('contextmenu', (e) => e.preventDefault());
    d.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      d.setPointerCapture(e.pointerId);
      mode = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
      sx = lx = e.clientX; sy = ly = e.clientY; moved = 0;
    });
    d.addEventListener('pointermove', (e) => {
      if (!mode || e.pointerType === 'touch') return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) this.drag(mode, dx, dy);
    });
    d.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') return;
      if (mode && moved <= 4 && this.onClick) this.onClick(e.clientX, e.clientY, e);
      mode = null;
    });
    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(Math.exp(e.deltaY * 0.0012));
    }, { passive: false });

    // Táctil
    d.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) { mode = 'rotate'; sx = lx = e.touches[0].clientX; sy = ly = e.touches[0].clientY; moved = 0; }
      else if (e.touches.length === 2) {
        mode = 'pinch';
        pinch = this.touchDist(e);
        lx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        ly = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    }, { passive: true });
    d.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (mode === 'rotate' && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lx, dy = e.touches[0].clientY - ly;
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) this.drag('rotate', dx, dy);
      } else if (e.touches.length === 2) {
        const dist = this.touchDist(e);
        if (pinch > 0) this.zoom(pinch / dist);
        pinch = dist;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.drag('pan', cx - lx, cy - ly);
        lx = cx; ly = cy;
        moved = 99;
      }
    }, { passive: false });
    d.addEventListener('touchend', (e) => {
      if (mode === 'rotate' && moved <= 6 && this.onClick && e.changedTouches.length) {
        this.onClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
      }
      if (e.touches.length === 0) mode = null;
    });
  }

  touchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy) || 1;
  }

  drag(mode, dx, dy) {
    this.goal = null;
    if (this.onUserMove) this.onUserMove();
    if (mode === 'rotate') {
      this.theta -= dx * 0.006;
      this.phi = Math.max(0.12, Math.min(1.45, this.phi - dy * 0.005));
    } else {
      const s = this.radius * 0.0016;
      const cos = Math.cos(this.theta), sin = Math.sin(this.theta);
      this.target.x -= (dx * cos + dy * sin) * s;
      this.target.z -= (-dx * sin + dy * cos) * s;
      this.target.x = Math.max(-80, Math.min(80, this.target.x));
      this.target.z = Math.max(-60, Math.min(60, this.target.z));
    }
    this.update();
  }

  zoom(f) {
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius * f));
    this.update();
  }

  /** Mueve suavemente la cámara hacia un objetivo. */
  flyTo(x, z, radius, phi, theta) {
    this.goal = { x, z, radius: radius ?? this.radius, phi: phi ?? this.phi, theta };
  }

  tick(follow) {
    if (follow) {
      this.target.x += (follow.x - this.target.x) * 0.12;
      this.target.z += (follow.z - this.target.z) * 0.12;
      this.update();
    }
    if (this.goal) {
      const g = this.goal;
      this.target.x += (g.x - this.target.x) * 0.08;
      this.target.z += (g.z - this.target.z) * 0.08;
      this.radius += (g.radius - this.radius) * 0.08;
      this.phi += (g.phi - this.phi) * 0.08;
      if (g.theta !== undefined) {
        let d = g.theta - this.theta;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        this.theta += d * 0.06;
      }
      if (Math.abs(g.radius - this.radius) < 0.2 && Math.hypot(g.x - this.target.x, g.z - this.target.z) < 0.2) this.goal = null;
      this.update();
    }
  }

  update() {
    const r = this.radius;
    const c = this.camera;
    c.position.set(
      this.target.x + r * Math.sin(this.phi) * Math.sin(this.theta),
      this.target.y + r * Math.cos(this.phi),
      this.target.z + r * Math.sin(this.phi) * Math.cos(this.theta)
    );
    c.lookAt(this.target);
  }
}
