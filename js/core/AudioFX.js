(function (global) {
  'use strict';

  /**
   * 音频音效模块（Web Audio API 全合成，零外部音频资源）
   * - BGM：氛围铺底 + 随机五声音阶拨弦，循环播放
   * - tick：转盘转动棘轮音效（由 Wheel 转动帧跨扇区边界时驱动）
   * - click：按钮点击音效
   * - 音频解锁：进入页面先尝试自动起播；被浏览器策略拦截时，
   *   首次用户手势（按下即触发，pointerdown/touchstart/keydown 等）解锁 AudioContext，
   *   随后自动开启 BGM；解锁前所有发声调用静默跳过
   */

  let ctx = null;
  let master = null;
  let bgmGain = null;
  let bgmTimer = null;
  let bgmStarted = false;
  let bgmMuted = false;

  function ensureCtx() {
    if (ctx) {
      if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
      return true;
    }

    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;

    try {
      ctx = new AC();
    } catch (e) {
      return false;
    }

    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0;
    bgmGain.connect(master);

    return true;
  }

  /* ---------- 音效 ---------- */

  /** 按钮点击：短促下滑音 */
  function playClick() {
    if (!ensureCtx() || ctx.state !== 'running') return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.07);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** 转盘棘轮：高频短促咔哒，音调微随机更真实 */
  function playTick() {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1900 + Math.random() * 250, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  /* ---------- BGM ---------- */

  // A 羽调五声音阶，随缘拨弦营造古堡夜话氛围
  const PENTA = [440, 523.25, 587.33, 659.25, 783.99];

  function startPad() {
    const t = ctx.currentTime;
    [110, 164.81].forEach(function (freq, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = i === 0 ? -4 : 5;

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.028, t + 2.5);

      osc.connect(gain);
      gain.connect(bgmGain);
      osc.start(t);
    });
  }

  function schedulePluck() {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const freq = PENTA[Math.floor(Math.random() * PENTA.length)] *
      (Math.random() < 0.3 ? 0.5 : 1);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(t);
    osc.stop(t + 1.8);
  }

  function startBGM() {
    if (bgmStarted || !ensureCtx()) return;
    bgmStarted = true;

    bgmGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    // 静音状态下 BGM 照常启动，但增益保持 0（复用同一开关状态）
    bgmGain.gain.linearRampToValueAtTime(bgmMuted ? 0 : 1, ctx.currentTime + 1.5);

    startPad();
    bgmTimer = setInterval(schedulePluck, 1900);
    setTimeout(schedulePluck, 600);
  }

  /* ---------- BGM 开关（仅影响背景音乐，不影响 click/tick 音效） ---------- */

  /**
   * 切换 BGM 静音/恢复。
   * 返回切换后的静音状态（true=已静音），供按钮 UI 同步。
   * AudioContext 未就绪（未解锁）时仅记录状态，解锁后生效。
   */
  function toggleBGM() {
    bgmMuted = !bgmMuted;

    if (ctx && bgmGain && bgmStarted) {
      const g = bgmGain.gain;
      const now = ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(bgmMuted ? 0 : 1, now + 0.3);
    }
    return bgmMuted;
  }

  /** 当前静音状态（页面初始化按钮 UI 用） */
  function isBGMMuted() {
    return bgmMuted;
  }

  /* ---------- 音频解锁 ---------- */

  // 覆盖"按下即解锁"（pointerdown/touchstart/keydown），
  // 不必等点击完成，首次触碰页面任意位置即启动 BGM
  const GESTURE_EVENTS = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'];

  function unbindUnlock() {
    GESTURE_EVENTS.forEach(function (ev) {
      document.removeEventListener(ev, onFirstGesture);
    });
  }

  function onFirstGesture() {
    if (!ensureCtx()) { unbindUnlock(); return; }
    if (ctx.state === 'suspended') {
      try { ctx.resume(); } catch (e) {}
    }
    startBGM();
    unbindUnlock();
  }

  function bindUnlock() {
    GESTURE_EVENTS.forEach(function (ev) {
      document.addEventListener(ev, onFirstGesture, { passive: true });
    });
  }

  /**
   * 进入页面即刻尝试自动起播：
   * - 宽松环境（部分 WebView / 已有媒体参与度的桌面浏览器）直接播放；
   * - 严格环境（Chrome/Safari 全新页面）此时仍为 suspended，静默失败，
   *   留给首个手势解锁（浏览器自动播放策略不允许跨页面继承点击激活）。
   */
  function tryAutostart() {
    if (!ensureCtx()) return;
    try { ctx.resume(); } catch (e) {}
    if (ctx.state === 'running') {
      startBGM();
      unbindUnlock();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindUnlock();
      tryAutostart();
    });
  } else {
    bindUnlock();
    tryAutostart();
  }

  global.AudioFX = {
    click: playClick,
    tick: playTick,
    unlock: onFirstGesture,
    toggleBGM: toggleBGM,
    isBGMMuted: isBGMMuted,
    /** 调试/验收用：返回 AudioContext 当前状态 */
    state: function () {
      return ctx ? ctx.state : 'not-created';
    },
  };
})(window);
