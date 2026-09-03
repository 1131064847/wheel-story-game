(function () {
  'use strict';

  let engine = null;
  let wheel = null;
  let _pendingJump = false;

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
    els.endingBtnWrap = $('endingBtnWrap');
    els.endingRestartBtn = $('endingRestartBtn');
    els.restartBtn = $('restartBtn');
    els.nodePath = $('nodePath');
    els.storyTitleWrap = document.querySelector('.story-title');
  }

  function bindEvents() {
    els.spinBtn.addEventListener('click', onSpinClick);
    els.restartBtn.addEventListener('click', onRestartClick);
    els.endingRestartBtn.addEventListener('click', onRestartClick);
    els.selectionToast.addEventListener('animationend', function () {
      this.classList.remove('show');
    });
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

    els.nodePath.textContent = '节点：' + node.id;
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
    els.nodePath.textContent = '—— 冒险结束 ——';
  }

  function onSpinClick() {
    if (!wheel || wheel.isSpinning()) return;
    if (_pendingJump) return;

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
    els.spinBtn.disabled = true;
    els.spinBtn.textContent = '旋转中...';

    wheel.startSpin(null, function (sector, index, err) {
      els.spinBtn.disabled = false;
      els.spinBtn.textContent = '转 动';

      if (err) {
        if (err.busy) showToast('转盘正在旋转');
        else if (err.noData) showToast('当前节点无扇区');
        else if (err.invalid) showToast('转盘组件异常');
        return;
      }
      if (!sector) return;

      vibrate([30, 30, 60]);

      showToast('你选择了：' + (sector.text || '未知选项'));

      _pendingJump = true;

      setTimeout(function () {
        _pendingJump = false;

        if (!sector.targetNodeId) {
          showNoTarget(sector.text);
          return;
        }

        const next = engine.jumpTo(sector.targetNodeId);
        if (!next) {
          showJumpFailed(sector.targetNodeId);
        } else {
          vibrate(20);
          renderNode(next, false);
        }
      }, 1600);
    });
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
    _pendingJump = false;

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
