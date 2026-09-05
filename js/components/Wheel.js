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
    // 转动过程中指针每跨过一条扇区分界线触发一次 onTick()，用于播放棘轮音效
    this.onTick = typeof options.onTick === 'function' ? options.onTick : null;

    this._rotation = 0;          // 转盘旋转角
    this._pointerRotation = 0;   // 中心指针独立旋转角（不与转盘锁步）
    this._spinning = false;
    this._rafId = null;
    this._fallbackId = null;     // 动画兜底 interval（rAF 停滞时推进）

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
    // 中心轴指针拥有独立旋转角，不与转盘锁步
    this._drawCenterPointer(center, radius);
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
    const fillStyle = data.color || '#cccccc';
    ctx.fillStyle = fillStyle;
    ctx.fill();
    // 同色描边：向轮廓外扩 1px，封闭旋转时相邻扇区因抗锯齿产生的发丝缝隙
    ctx.strokeStyle = fillStyle;
    ctx.lineWidth = 2;
    ctx.stroke();

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
    const r = 24;
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, r - 13, 0, Math.PI * 2);
    ctx.fillStyle = '#ececec';
    ctx.fill();
    ctx.restore();
  };

  /**
   * 中心轴指针：白色小三角从中心圆边缘伸出，
   * 绘制在独立旋转坐标系内（使用 _pointerRotation），
   * 拥有与转盘不同的旋转轨迹，初始指向顶部
   */
  Wheel.prototype._drawCenterPointer = function (center, radius) {
    const ctx = this.ctx;
    const hubR = 24;               // 与中心圆半径一致
    const tipR = radius * 0.2;     // 指针尖端到轴心 = 转盘半径的 1/5

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(Utils.degToRad(this._pointerRotation));

    ctx.beginPath();
    ctx.moveTo(0, -tipR);
    ctx.lineTo(-10, -hubR + 2);
    ctx.lineTo(10, -hubR + 2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#c8c8c8';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();
  };

  Wheel.prototype.updateSectors = function (sectors) {
    this.sectors = sectors || [];
    this.render();
  };

  Wheel.prototype._spinToTarget = function (wheelTarget, pointerTarget, callback) {
    if (this._spinning) return;

    const startRotation = this._rotation;
    const startPointer = this._pointerRotation;
    const wheelDelta = wheelTarget - startRotation;
    const pointerDelta = pointerTarget - startPointer;
    const duration = this.duration;
    const startTime = performance.now();

    // 分界线角度表：指针跨过扇区分界线时触发 onTick()（棘轮音效）。
    // 判定依据是「指针相对转盘的角度」，即 (pointerRotation - rotation)。
    let tickBounds = null;
    if (this.onTick) {
      const layout = this._computeSectorLayout();
      tickBounds = [];
      for (let i = 0; i < layout.length; i++) {
        tickBounds.push(layout[i].start);
      }
    }

    const startRel = ((startPointer - startRotation) % 360 + 360) % 360;
    let relAtTick = startRel;

    this._spinning = true;

    const self = this;

    function step(now) {
      // 幂等保护：完成（或被 reset）后 rAF 与兜底 interval 的残余回调直接跳过
      if (!self._spinning) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      // 转盘与指针各自沿自己的目标角插值（同一条缓动曲线，但总角度不同 => 速度不同）
      self._rotation = startRotation + wheelDelta * eased;
      self._pointerRotation = startPointer + pointerDelta * eased;
      self.render();

      if (tickBounds) {
        const curRel = ((self._pointerRotation - self._rotation) % 360 + 360) % 360;
        let crossings = 0;
        for (let i = 0; i < tickBounds.length; i++) {
          const b = tickBounds[i];
          crossings += Math.floor((curRel - b) / 360) -
            Math.floor((relAtTick - b) / 360);
        }
        if (crossings > 0) self.onTick(crossings);
        relAtTick = curRel;
      }

      if (progress >= 1) {
        self._spinning = false;

        // 双通道驱动统一收口：清理 rAF 与兜底 interval
        if (self._rafId) {
          cancelAnimationFrame(self._rafId);
          self._rafId = null;
        }
        if (self._fallbackId) {
          clearInterval(self._fallbackId);
          self._fallbackId = null;
        }

        const layout = self._computeSectorLayout();
        const wheelNorm = ((self._rotation % 360) + 360) % 360;
        const pointerNorm = ((self._pointerRotation % 360) + 360) % 360;
        // 选中扇区 = 指针相对转盘的角度所落入的扇区
        const relativeAngle = ((pointerNorm - wheelNorm) % 360 + 360) % 360;

        let selectedIndex = 0;
        for (let i = 0; i < layout.length; i++) {
          const start = layout[i].start;
          const end = layout[i].end;
          if (relativeAngle >= start && relativeAngle < end) {
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

    function rafTick(now) {
      step(now);
      // step 可能在本帧内完成并清理 _rafId；未完成才继续排下一帧
      if (self._spinning) {
        self._rafId = requestAnimationFrame(rafTick);
      }
    }

    // 双通道驱动：rAF 主驱动；标签页隐藏/失焦导致 rAF 停滞时，
    // 由 setInterval 兜底推进（后台节流下动画跳帧但必然完成并回调结果）
    this._rafId = requestAnimationFrame(rafTick);
    this._fallbackId = setInterval(function () {
      step(performance.now());
    }, 60);
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

    // 扇区内随机偏移，避免每次都停在正中心
    const offsetDeg = (Math.random() - 0.5) * (CONFIG.WHEEL.POINTER_OFFSET * 2);
    const targetCenter = ((sectorCenterDeg + offsetDeg) % 360 + 360) % 360;

    // 转盘：从当前角度再转 minRounds 整圈 + 少量随机余量，视觉上不停在原位
    const wheelJitter = Math.floor(Math.random() * 360);
    const wheelTarget = this._rotation + this.minRounds * 360 + wheelJitter;

    // 指针：比转盘多转 POINTER_EXTRA_ROUNDS 圈，形成「独立、更快」的旋转轨迹；
    // 最终指针相对转盘的角度 = targetCenter，确保落入选定扇区。
    const POINTER_EXTRA_ROUNDS = this.minRounds + 3;
    const pointerTarget = wheelTarget + targetCenter + POINTER_EXTRA_ROUNDS * 360;

    this._spinToTarget(wheelTarget, pointerTarget, callback);
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
    if (this._fallbackId) {
      clearInterval(this._fallbackId);
      this._fallbackId = null;
    }
    this._spinning = false;
    this._rotation = 0;
    this._pointerRotation = 0;
    this.render();
  };

  Wheel.prototype.destroy = function () {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this._fallbackId) {
      clearInterval(this._fallbackId);
      this._fallbackId = null;
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
