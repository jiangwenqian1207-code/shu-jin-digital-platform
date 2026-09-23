const distance = (a, b, aspect) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
export const GESTURE = Object.freeze({ pinchOn: .32, pinchOff: .52, pinchDwell: 100, releaseDwell: 140, lostGrace: 280, swipeDistance: .20, swipeVelocity: .55, cooldown: 1500 });

// The camera is unmirrored; 1-x maps a physical rightward wave to screen-right.
// This module has no DOM/camera dependencies, so timed landmark sequences can be tested.
export class GestureController {
  constructor() { this.reset(); }
  reset() {
    this.pinch = false; this.ratio = null; this.x = null; this.y = null;
    this.lastSeen = -Infinity; this.lastTime = null; this.candidate = null; this.candidateSince = 0;
    this.history = []; this.openSince = null; this.suppressUntil = 0;
    this.cooldownUntil = 0; this.armed = true; this.stillSince = null;
  }
  update(points, now, aspect = 4 / 3) {
    if (!points?.length) {
      this.history = []; this.openSince = null; this.candidate = null;
      if (now - this.lastSeen > GESTURE.lostGrace) {
        this.pinch = false; this.ratio = null; this.x = null; this.y = null; this.lastTime = null;
      }
      return { pinch: this.pinch, swipe: false, visible: false };
    }
    const dt = this.lastTime === null ? .1 : Math.min(.1, Math.max(.001, (now - this.lastTime) / 1000));
    this.lastTime = now; this.lastSeen = now;
    const palm = Math.max(.035, distance(points[5], points[17], aspect));
    const rawRatio = distance(points[4], points[8], aspect) / palm;
    const alpha = 1 - Math.exp(-dt / .055);
    this.ratio = this.ratio === null ? rawRatio : this.ratio + (rawRatio - this.ratio) * alpha;
    const proposed = this.pinch ? this.ratio <= GESTURE.pinchOff : this.ratio < GESTURE.pinchOn;
    if (proposed !== this.pinch) {
      if (this.candidate !== proposed) { this.candidate = proposed; this.candidateSince = now; }
      if (now - this.candidateSince >= (proposed ? GESTURE.pinchDwell : GESTURE.releaseDwell)) {
        this.pinch = proposed; this.candidate = null; this.suppressUntil = now + 450;
      }
    } else this.candidate = null;

    const centerX = 1 - (points[0].x + points[5].x + points[9].x + points[17].x) / 4;
    const centerY = (points[0].y + points[5].y + points[9].y + points[17].y) / 4;
    const oldX = this.x;
    this.x = oldX === null ? centerX : oldX + (centerX - oldX) * alpha;
    this.y = this.y === null ? centerY : this.y + (centerY - this.y) * alpha;
    const velocity = oldX === null ? 0 : (this.x - oldX) / dt;
    const extended = [[8,6],[12,10],[16,14],[20,18]].filter(([tip,pip]) => distance(points[tip], points[0], aspect) > distance(points[pip], points[0], aspect) * 1.12).length;
    const open = !this.pinch && rawRatio > .65 && this.ratio > .65 && extended >= 3 && now > this.suppressUntil;
    if (!open) { this.history = []; this.openSince = null; this.stillSince = null; return { pinch: this.pinch, swipe: false, visible: true }; }
    if (this.openSince === null) this.openSince = now;
    if (Math.abs(velocity) < .16) {
      if (this.stillSince === null) this.stillSince = now;
      if (now > this.cooldownUntil && now - this.stillSince > 260) this.armed = true;
    } else this.stillSince = null;
    this.history.push({ x: this.x, y: this.y, t: now });
    this.history = this.history.filter(p => now - p.t <= 420);
    const first = this.history[0];
    const elapsed = (now - first.t) / 1000;
    const dx = this.x - first.x;
    const swipe = this.armed && now > this.cooldownUntil && now - this.openSince > 220 && elapsed > .12 && dx > GESTURE.swipeDistance && dx / elapsed > GESTURE.swipeVelocity && Math.abs(this.y - first.y) < .13;
    if (swipe) { this.armed = false; this.cooldownUntil = now + GESTURE.cooldown; this.history = []; }
    return { pinch: this.pinch, swipe, visible: true };
  }
}

// Shrink first, replace ONE texture at the zero-opacity midpoint, then grow again.
export class PatternTransition {
  constructor(count, onChange) { this.count = count; this.onChange = onChange; this.index = 0; this.started = null; this.changed = false; }
  next(now) { if (this.started !== null) return false; this.started = now; this.changed = false; return true; }
  update(now) {
    if (this.started === null) return 1;
    const t = now - this.started;
    if (t < 520) return .5 + .5 * Math.cos(Math.PI * t / 520);
    if (!this.changed) { this.index = (this.index + 1) % this.count; this.changed = true; this.onChange(this.index); }
    if (t < 1200) return .5 - .5 * Math.cos(Math.PI * (t - 520) / 680);
    this.started = null; return 1;
  }
}
