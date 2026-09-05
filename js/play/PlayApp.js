(function () {
  'use strict';

  let engine = null;
  let wheel = null;

  /* ---------- 逆天改命 3s 窗口期状态 ---------- */
  const FATE_WINDOW_MS = 3000;
  let _windowSector = null;      // 窗口期内待确认的本次转盘结果
  let _fateTimer = null;         // 倒计时 interval id（null = 未运行）
  let _fateDeadline = 0;         // 倒计时截止时间戳
  let _fateRemaining = 0;        // 弹窗暂停时保留的剩余毫秒

  const els = {};

  function $(id) { return document.getElementById(id); }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  function init() {
    cacheEls();
    showLoading();

    engine = new StoryEngine();
    engine.init();

    const rootNode = engine.getRootNode();
    if (!rootNode) {
      showEmpty();
      return;
    }

    wheel = new Wheel(els.wheelCanvas, {
      sectors: rootNode.isEnding ? [] : rootNode.sectors,
      size: resolveWheelSize(),
      minRounds: 5,
      duration: 4500,
      onTick: function () { AudioFX.tick(); },
    });

    bindEvents();
    renderNode(rootNode, true);
  }

  function resolveWheelSize() {
    const vw = Math.min(window.innerWidth - 36, 460);
    return Math.max(240, Math.min(vw, 360));
  }

  function cacheEls() {
    els.storyCard = $('storyCard');
    els.storyTitle = $('storyTitle');
    els.storyContent = $('storyContent');
    els.wheelSection = $('wheelSection');
    els.wheelCanvas = $('wheelCanvas');
    els.wheelWrap = document.querySelector('.wheel-wrap');
    els.selectionToast = $('selectionToast');
    els.spinBtn = $('spinBtn');
    els.fateBtn = $('fateBtn');
    els.fateModal = $('fateModal');
    els.fateList = $('fateList');
    els.fateSubtitle = $('fateSubtitle');
    els.fateCancelBtn = $('fateCancelBtn');
    els.endingBtnWrap = $('endingBtnWrap');
    els.endingRestartBtn = $('endingRestartBtn');
    els.restartBtn = $('restartBtn');
    els.homeBtn = $('homeBtn');
    els.bgmBtn = $('bgmBtn');
    els.historyList = $('historyList');
    els.historyToggleBtn = $('historyToggleBtn');
    els.storyTitleWrap = document.querySelector('.story-title');
  }

  function bindEvents() {
    els.spinBtn.addEventListener('click', onSpinClick);
    els.fateBtn.addEventListener('click', onFateClick);
    els.fateCancelBtn.addEventListener('click', cancelFateModal);
    els.homeBtn.addEventListener('click', onHomeClick);
    els.bgmBtn.addEventListener('click', onBgmClick);
    els.historyToggleBtn.addEventListener('click', onHistoryToggle);
    els.restartBtn.addEventListener('click', onRestartClick);
    els.endingRestartBtn.addEventListener('click', onRestartClick);
    els.selectionToast.addEventListener('animationend', function () {
      this.classList.remove('show');
    });
    els.fateModal.addEventListener('click', function (e) {
      if (e.target === els.fateModal) cancelFateModal();
    });
  }

  /* ---------- 历史剧情记录 ---------- */

  /**
   * 历史剧情以纯文本段落拼接（不按章节分格），
   * 每次转盘触发新剧情后追加在列表末尾
   */
  function addHistoryItem(node) {
    if (!node || !els.historyList) return;

    const para = document.createElement('p');
    para.className = 'history-para';
    para.textContent = node.content || '(无剧情内容)';
    els.historyList.appendChild(para);

    // 自动滚动到底部
    els.historyList.scrollTop = els.historyList.scrollHeight;
  }

  function clearHistory() {
    if (els.historyList) els.historyList.innerHTML = '';
  }

  /**
   * 选择衔接段：转盘结果锁定后，以"我+选择内容"记录本次抉择，
   * 作为两个幕之间的过渡（逆天改命覆盖重选时仅记录最终结果）
   */
  function addHistoryChoice(sector) {
    if (!sector || !sector.text || !els.historyList) return;

    const para = document.createElement('p');
    para.className = 'history-choice';
    para.textContent = '我' + sector.text;
    els.historyList.appendChild(para);

    // 自动滚动到底部
    els.historyList.scrollTop = els.historyList.scrollHeight;
  }

  function onHistoryToggle() {
    const isOpen = els.historyList.style.display !== 'none';
    els.historyList.style.display = isOpen ? 'none' : 'block';
    els.historyToggleBtn.textContent = isOpen ? '展开' : '收起';
  }

  /* ---------- 返回主页 ---------- */

  function onHomeClick() {
    vibrate(10);
    // 时间戳防缓存：避免微信等浏览器用旧缓存页（如旧版重定向入口）导致"返回主页无效"
    location.href = 'index.html?_=' + Date.now();
  }

  /* ---------- 背景音乐开关 ---------- */

  function onBgmClick() {
    vibrate(10);
    AudioFX.click();

    const muted = AudioFX.toggleBGM();
    els.bgmBtn.classList.toggle('muted', muted);
    els.bgmBtn.setAttribute('aria-label', muted ? '开启背景音乐' : '关闭背景音乐');
  }

  function showLoading() {
    els.storyTitle.textContent = '加载中...';
    els.storyContent.innerHTML =
      '<div class="empty-hint">请稍候，故事即将展开...</div>';
    els.wheelSection.style.display = 'none';
    els.endingBtnWrap.style.display = 'none';
  }

  function renderNode(node, isInitial) {
    if (!node) {
      showEmpty();
      return;
    }

    const transitionEl = els.storyCard;
    if (transitionEl && !isInitial) {
      transitionEl.classList.add('card-transition');
      setTimeout(function () {
        transitionEl.classList.remove('card-transition');
      }, 350);
    }

    els.storyTitle.textContent = node.title || '未命名';

    if (node.isEnding) {
      renderEnding(node);
    } else {
      renderNormal(node);
    }

    addHistoryItem(node);
  }

  function renderNormal(node) {
    const badge = els.storyCard.querySelector('.ending-badge');
    if (badge) badge.remove();

    els.storyContent.textContent = node.content || '(暂无剧情内容)';
    els.storyContent.classList.remove('ending');

    els.wheelSection.style.display = 'flex';
    els.endingBtnWrap.style.display = 'none';
    els.spinBtn.disabled = false;
    els.spinBtn.textContent = '转 动';

    // 待旋转初始状态不显示逆天改命，仅停稳后的 3s 窗口期展示
    els.fateBtn.style.display = 'none';

    if (wheel) {
      wheel.updateSectors(node.sectors || []);
    }
    hideToast();
  }

  function renderEnding(node) {
    els.storyContent.textContent = node.content || '(结局已到)';
    els.storyContent.classList.add('ending');

    let badge = els.storyCard.querySelector('.ending-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'ending-badge';
      els.storyCard.insertBefore(badge, els.storyTitle);
    }
    badge.textContent = '★ 结局';

    els.wheelSection.style.display = 'none';
    els.endingBtnWrap.style.display = 'flex';
  }

  /* ---------- 转盘交互（随机 / 逆天改命共用结果处理） ---------- */

  function beginSpinUi() {
    els.spinBtn.disabled = true;
    els.spinBtn.textContent = '旋转中...';
    els.fateBtn.style.display = 'none';
  }

  /** 仅 err 分支使用：无待定结果，恢复初始待旋转状态 */
  function endSpinUi() {
    els.spinBtn.disabled = false;
    els.spinBtn.textContent = '转 动';
    els.fateBtn.style.display = 'none';
  }

  /**
   * 转盘停止后的统一结果处理：
   * 不立即跳转，进入 3s 逆天改命窗口期——
   * 期内可点按钮重选覆盖本次结果；倒计时结束则锁定并进入下一剧情。
   */
  function handleSpinResult(sector, index, err) {
    if (err) {
      endSpinUi();
      if (err.busy) showToast('转盘正在旋转');
      else if (err.noData) showToast('当前节点无扇区');
      else if (err.invalid) showToast('转盘组件异常');
      return;
    }
    if (!sector) {
      endSpinUi();
      return;
    }

    vibrate([30, 30, 60]);
    showToast('你选择了：' + (sector.text || '未知选项'));

    // 停稳出结果：spinBtn 保持禁用（状态锁），展示带倒计时的改命按钮
    els.spinBtn.textContent = '转 动';
    _windowSector = sector;
    startFateCountdown();
  }

  /** 窗口期结束（或重选确认）后的唯一跳转出口 */
  function executeJump(sector) {
    _windowSector = null;

    if (!sector) return;

    if (!sector.targetNodeId) {
      showNoTarget(sector.text);
      return;
    }

    // 记录选择衔接段："我+选择内容"，作为两幕之间的过渡
    addHistoryChoice(sector);

    const next = engine.jumpTo(sector.targetNodeId);
    if (!next) {
      showJumpFailed(sector.targetNodeId);
    } else {
      vibrate(20);
      renderNode(next, false);
    }
  }

  function onSpinClick() {
    if (!wheel || wheel.isSpinning()) return;
    if (_windowSector !== null) return; // 窗口期状态锁：禁止重复触发转盘

    const node = engine.getCurrentNode();
    if (!node) {
      showToast('当前节点无效，请重新开始');
      return;
    }
    if (node.isEnding) return;

    const sectors = node.sectors;
    if (!sectors || sectors.length === 0) {
      showToast('当前节点无转盘配置');
      return;
    }

    vibrate(15);
    beginSpinUi();

    // targetIndex=null：随机落点
    wheel.startSpin(null, handleSpinResult);
  }

  /* ---------- 逆天改命：停稳后 3s 窗口期，重选覆盖本次结果 ---------- */

  function startFateCountdown() {
    destroyFateCountdown(); // 容错：先销毁，防定时器残留/叠加

    els.fateBtn.style.display = '';
    _fateDeadline = Date.now() + FATE_WINDOW_MS;
    updateFateBtnText();
    armFateTimer();
  }

  function armFateTimer() {
    // 先清理再挂载，保证任意时刻至多一个 interval
    if (_fateTimer !== null) {
      clearInterval(_fateTimer);
      _fateTimer = null;
    }
    _fateTimer = setInterval(onFateTick, 100);
  }

  function onFateTick() {
    const remain = _fateDeadline - Date.now();
    if (remain <= 0) {
      // 倒计时结束：按钮消失，锁定本次结果，进入下一剧情
      destroyFateCountdown();
      executeJump(_windowSector);
    } else {
      updateFateBtnText();
    }
  }

  function updateFateBtnText() {
    const remain = Math.max(0, _fateDeadline - Date.now());
    els.fateBtn.textContent = '逆天改命(' + Math.ceil(remain / 1000) + 's)';
  }

  /** 打开选项弹窗时暂停倒计时，保留剩余时间 */
  function pauseFateCountdown() {
    if (_fateTimer === null) return;
    clearInterval(_fateTimer);
    _fateTimer = null;
    _fateRemaining = Math.max(0, _fateDeadline - Date.now());
  }

  /** 关闭弹窗未改命时恢复倒计时（继续剩余时间） */
  function resumeFateCountdown() {
    if (_fateTimer !== null) return; // 防叠加
    if (_windowSector === null) return;

    _fateDeadline = Date.now() + _fateRemaining;
    updateFateBtnText();
    armFateTimer();
  }

  /** 销毁倒计时：清理 interval、隐藏按钮、重置文案（任何退出路径都调用） */
  function destroyFateCountdown() {
    if (_fateTimer !== null) {
      clearInterval(_fateTimer);
      _fateTimer = null;
    }
    _fateRemaining = 0;
    els.fateBtn.style.display = 'none';
    els.fateBtn.textContent = '逆天改命';
  }

  function onFateClick() {
    if (_windowSector === null) return; // 仅窗口期内可触发

    vibrate(15);
    AudioFX.click();

    pauseFateCountdown();

    const node = engine.getCurrentNode();
    els.fateSubtitle.textContent = '重新指定本次的选择结果';
    renderFateOptions((node && node.sectors) || []);
    els.fateModal.style.display = 'flex';
  }

  function renderFateOptions(sectors) {
    els.fateList.innerHTML = '';

    sectors.forEach(function (sector, index) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'fate-option';

      const colorDot = document.createElement('span');
      colorDot.className = 'fate-option-color';
      colorDot.style.background = sector.color || '#ccc';

      const textEl = document.createElement('span');
      textEl.className = 'fate-option-text';
      textEl.textContent = sector.text || ('选项 ' + (index + 1));

      option.appendChild(colorDot);
      option.appendChild(textEl);
      option.addEventListener('click', function () { onFatePick(index); });

      els.fateList.appendChild(option);
    });
  }

  /** 窗口期内选定新选项：转盘重播完整旋转动画，强制落至指定选项 */
  function onFatePick(index) {
    destroyFateCountdown(); // 覆盖旧结果：销毁倒计时与待定扇区
    closeFateModal();
    _windowSector = null;

    if (!wheel || wheel.isSpinning()) return;

    vibrate(15);
    AudioFX.click();

    beginSpinUi();
    wheel.startSpin(index, handleSpinResult);
  }

  /** 窗口期内放弃改命：关闭弹窗并恢复剩余倒计时 */
  function cancelFateModal() {
    closeFateModal();
    resumeFateCountdown();
  }

  function closeFateModal() {
    els.fateModal.style.display = 'none';
  }

  function showToast(msg) {
    els.selectionToast.textContent = msg;
    els.selectionToast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.selectionToast.classList.remove('show');
    }, 2200);
  }

  function hideToast() {
    els.selectionToast.classList.remove('show');
    els.selectionToast.textContent = '';
  }

  function showNoTarget(text) {
    const cur = engine.getCurrentNode();
    els.storyContent.textContent =
      (cur ? cur.content : '') +
      '\n\n———\n⚠️ 路径未配置，"你选择了：' + text + '" 后无处可去。请联系管理员完善配置。';
    els.spinBtn.disabled = true;
    els.spinBtn.textContent = '无后续';
  }

  function showJumpFailed(targetId) {
    const cur = engine.getCurrentNode();
    els.storyContent.textContent =
      (cur ? cur.content : '') +
      '\n\n———\n⚠️ 跳转失败：目标节点 "' + targetId + '" 不存在。';
    els.spinBtn.disabled = true;
    els.spinBtn.textContent = '跳转失败';
  }

  function onRestartClick() {
    vibrate(20);
    hideToast();

    // 清理窗口期与弹窗，防止定时器残留、状态错乱
    destroyFateCountdown();
    closeFateModal();
    _windowSector = null;

    clearHistory();

    if (wheel && wheel.reset) {
      wheel.reset();
    } else if (wheel) {
      wheel._rotation = 0;
      wheel.render();
    }

    engine.reset();
    const root = engine.getRootNode();
    if (root) {
      renderNode(root, false);
    } else {
      showEmpty();
    }
  }

  function showEmpty() {
    els.storyTitle.textContent = '数据缺失';
    els.storyContent.innerHTML =
      '<div class="empty-hint">未找到任何故事节点配置。<br/>请联系管理员初始化数据。</div>';
    els.wheelSection.style.display = 'none';
    els.endingBtnWrap.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
