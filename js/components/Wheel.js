(function (global) {
  'use strict';

  const DEG_90 = 90;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function Wheel(canvasEl, options) {
    if (!(this instanceof Wheel)) {
      return new Wheel(canvasEl, options);
    }
    options = options || {};

    if (!canvasEl || typeof canvasEl.getContext !== 'function') {
      console.error('[Wheel] 初始化失败: canvas 元素无效');
      this._valid = false;
      return;
    }
    this._valid = true;

    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.size = options.size || CONFIG.WHEEL.RENDER_SIZE;
    this.sectors = options.sectors || [];
    this.minRounds = options.minRounds || CONFIG.WHEEL.ANIMATION_MIN_ROUNDS;
    this.duration = options.duration || CONFIG.WHEEL.ANIMATION_DURATION;

    this._rotation = 0;
    this._spinning = false;
    this._rafId = null;

    this._setupCanvas();
    this.render();
  }

  Wheel.prototype._setupCanvas = function () {
    const dpr = window.devicePixelRatio || 1;
    const cssSize = this.size;
    this.canvas.width = cssSize * dpr;
    this.canvas.height = cssSize * dpr;
    this.canvas.style.width = cssSize + 'px';
    this.canvas.style.height = cssSize + 'px';
    this.ctx.scale(dpr, dpr);
    this._dpr = dpr;
  };

  Wheel.prototype._computeSectorLayout = function () {
    const layout = [];
    let cumulative = 0;
    for (let i = 0; i < this.sectors.length; i++) {
      const s = this.sectors[i];
      const startAngle = cumulative;
      const sectorAngle = Number(s.angle) || 0;
      const endAngle = startAngle + sectorAngle;
      const centerAngle = startAngle + sectorAngle / 2;
      layout.push({
        index: i,
        start: startAngle,
        end: endAngle,
        center: centerAngle,
        angle: sectorAngle,
        data: s,
      });
      cumulative = endAngle;
    }
    return layout;
  };

  Wheel.prototype.render = function () {
    if (!this._valid || !this.ctx) return;

    const ctx = this.ctx;
    const size = this.size;
    const center = size / 2;
    const radius = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    if (!this.sectors || this.sectors.length === 0) {
      this._drawEmpty(center, radius);
      return;
    }

    const layout = this._computeSectorLayout();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(Utils.degToRad(this._rotation));
    ctx.translate(-center, -center);

    for (let i = 0; i < layout.length; i++) {
      this._drawSector(layout[i], center, radius);
    }

    this._drawSectorBorders(layout, center, radius);

    ctx.restore();

    this._drawOuterRing(center, radius);
    this._drawCenterCircle(center);
    this._drawPointer(center, radius);
  };

  Wheel.prototype._drawEmpty = function (center, radius) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂无扇区数据', center, center);
    ctx.restore();
  };

  Wheel.prototype._drawSector = function (sectorLayout, center, radius) {
    const ctx = this.ctx;
    const startRad = Utils.degToRad(sectorLayout.start - DEG_90);
    const endRad = Utils.degToRad(sectorLayout.end - DEG_90);
    const data = sectorLayout.data;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startRad, endRad);
    ctx.closePath();
    ctx.fillStyle = data.color || '#cccccc';
    ctx.fill();

    this._drawSectorText(sectorLayout, center, radius, startRad, endRad);
  };

  Wheel.prototype._drawSectorText = function (sectorLayout, center, radius) {
    const ctx = this.ctx;
    const text = sectorLayout.data.text;
    if (!text) return;

    const sectorAngle = sectorLayout.angle;
    if (sectorAngle < 8) return;

    const midRad = Utils.degToRad(sectorLayout.center - DEG_90);
    const textRadius = radius * 0.62;

    const light = Utils.isLightColor(sectorLayout.data.color);
    ctx.fillStyle = light ? '#333333' : '#ffffff';

    let fontSize = 14;
    if (sectorAngle < 20) fontSize = 11;
    if (sectorAngle < 12) fontSize = 9;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextWidth = radius * 0.45;
    const words = String(text).split('');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const test = line + words[i];
      if (ctx.measureText(test).width > maxTextWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const totalLines = lines.length;
    const lineHeight = fontSize + 2;

    for (let i = 0; i < totalLines; i++) {
      const offsetY = (i - (totalLines - 1) / 2) * lineHeight;
      const x = center + Math.cos(midRad) * textRadius;
      const y = center + Math.sin(midRad) * textRadius + offsetY;

      ctx.save();
      ctx.translate(x, y);
      let rot = midRad;
      if (Math.sin(midRad) > 0) {
        rot += Math.PI;
      }
      ctx.rotate(rot);
      ctx.fillText(lines[i], 0, 0);
      ctx.restore();
    }
  };

  Wheel.prototype._drawSectorBorders = function (layout, center, radius) {
    const ctx = this.ctx;
    ctx.strokeStyle = CONFIG.WHEEL.STROKE_COLOR;
    ctx.lineWidth = CONFIG.WHEEL.STROKE_WIDTH;

    for (let i = 0; i < layout.length; i++) {
      const startRad = Utils.degToRad(layout[i].start - DEG_90);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(startRad) * radius, center + Math.sin(startRad) * radius);
      ctx.stroke();
    }
  };

  Wheel.prototype._drawOuterRing = function (center, radius) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  Wheel.prototype._drawCenterCircle = function (center) {
    const ctx = this.ctx;
    const r = 18;
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.WHEEL.CENTER_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, r - 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f8f8f8';
    ctx.fill();
    ctx.restore();
  };

  Wheel.prototype._drawPointer = function (center, radius) {
    const ctx = this.ctx;
    const px = center;
    const py = center - radius - 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px - 10, py + 2);
    ctx.lineTo(px - 5, py + 2);
    ctx.lineTo(px - 5, py + 10);
    ctx.lineTo(px + 5, py + 10);
    ctx.lineTo(px + 5, py + 2);
    ctx.lineTo(px + 10, py + 2);
    ctx.closePath();

    ctx.fillStyle = CONFIG.WHEEL.POINTER_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  Wheel.prototype.updateSectors = function (sectors) {
    this.sectors = sectors || [];
    this.render();
  };

  Wheel.prototype._spinToTarget = function (targetRotation, callback) {
    if (this._spinning) return;

    const startRotation = this._rotation;
    const delta = targetRotation - startRotation;
    const duration = this.duration;
    const startTime = performance.now();

    this._spinning = true;

    const self = this;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      self._rotation = startRotation + delta * eased;
      self.render();

      if (progress < 1) {
        self._rafId = requestAnimationFrame(tick);
      } else {
        self._spinning = false;
        self._rafId = null;

        const layout = self._computeSectorLayout();
        const normalizedRot = ((self._rotation % 360) + 360) % 360;

        let pointerAngle = ((-normalizedRot) % 360 + 360) % 360;

        let selectedIndex = 0;
        for (let i = 0; i < layout.length; i++) {
          const start = layout[i].start;
          const end = layout[i].end;
          if (pointerAngle >= start && pointerAngle < end) {
            selectedIndex = i;
            break;
          }
        }

        const selectedSector = layout[selectedIndex].data;
        if (typeof callback === 'function') {
          callback(selectedSector, selectedIndex);
        }
      }
    }

    this._rafId = requestAnimationFrame(tick);
  };

  Wheel.prototype._randomIndex = function () {
    if (!this.sectors || this.sectors.length === 0) return -1;

    const total = this.sectors.reduce((acc, s) => acc + (Number(s.angle) || 0), 0);
    if (total <= 0) return Math.floor(Math.random() * this.sectors.length);

    let r = Math.random() * total;
    for (let i = 0; i < this.sectors.length; i++) {
      r -= Number(this.sectors[i].angle) || 0;
      if (r <= 0) return i;
    }
    return this.sectors.length - 1;
  };

  Wheel.prototype.startSpin = function (targetIndex, callback) {
    if (!this._valid) {
      if (typeof callback === 'function') callback(null, -1, { invalid: true });
      return;
    }
    if (this._spinning) {
      if (typeof callback === 'function') {
        callback(null, -1, { busy: true });
      }
      return;
    }

    if (!this.sectors || this.sectors.length === 0) {
      if (typeof callback === 'function') {
        callback(null, -1, { noData: true });
      }
      return;
    }

    let index;
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < this.sectors.length) {
      index = targetIndex;
    } else {
      index = this._randomIndex();
    }

    const layout = this._computeSectorLayout();
    const sectorCenterDeg = layout[index].center;

    const offsetDeg = (Math.random() - 0.5) * (CONFIG.WHEEL.POINTER_OFFSET * 2);

    let targetRelative = ((360 - sectorCenterDeg + offsetDeg) % 360 + 360) % 360;

    const currentNorm = ((this._rotation % 360) + 360) % 360;
    const deltaNorm = ((targetRelative - currentNorm) % 360 + 360) % 360;

    const extraRounds = Math.max(1, this.minRounds);
    const targetRotation = this._rotation + extraRounds * 360 + deltaNorm;

    this._spinToTarget(targetRotation, callback);
  };

  Wheel.prototype.isSpinning = function () {
    return this._spinning;
  };

  Wheel.prototype.reset = function () {
    if (!this._valid) return;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._spinning = false;
    this._rotation = 0;
    this.render();
  };

  Wheel.prototype.destroy = function () {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._spinning = false;
    this.canvas = null;
    this.ctx = null;
  };

  Wheel.prototype.spin = function (targetIndex, callback) {
    return this.startSpin(targetIndex, callback);
  };

  Wheel.prototype.spinToSector = function (index, callback) {
    return this.startSpin(index, callback);
  };

  global.Wheel = Wheel;
})(window);
