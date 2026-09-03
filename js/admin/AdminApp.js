(function () {
  'use strict';

  if (!Auth.requireLogin()) return;

  const engine = new StoryEngine();
  engine.init();

  let currentNodeId = engine.data.rootNodeId;
  let editingSectors = [];
  let previewWheel = null;
  let currentTargetOptions = [];

  const $ = (id) => document.getElementById(id);

  function init() {
    bindGlobalEvents();
    refreshAll();
  }

  function bindGlobalEvents() {
    $('logoutBtn').addEventListener('click', function () {
      Auth.logout();
      location.replace('admin-login.html');
    });

    $('playDemoBtn').addEventListener('click', function () {
      window.open('play.html', '_blank');
    });

    $('addNodeBtn').addEventListener('click', onAddNode);
    $('resetDefaultBtn').addEventListener('click', function () {
      confirmModal('恢复默认数据', '这将清空所有自定义节点配置，恢复为系统内置的古堡故事线。确定吗？', function () {
        engine.resetToDefault();
        currentNodeId = engine.data.rootNodeId;
        toast('已恢复默认数据', 'ok');
        refreshAll();
      });
    });

    $('saveNodeBtn').addEventListener('click', onSaveNode);
    $('deleteNodeBtn').addEventListener('click', onDeleteNode);
    $('setRootBtn').addEventListener('click', onSetRoot);

    $('addSectorBtn').addEventListener('click', addSectorRow);

    $('exportBtn').addEventListener('click', onExport);
    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', onImportFile);

    $('validateBtn').addEventListener('click', renderValidation);

    $('trySpinBtn').addEventListener('click', function () {
      if (previewWheel && previewWheel.sectors.length > 0 && !previewWheel.isSpinning()) {
        previewWheel.startSpin(null);
      }
    });

    $('modalCancel').addEventListener('click', hideModal);
    $('modalMask').addEventListener('click', function (e) {
      if (e.target === $('modalMask')) hideModal();
    });
  }

  function refreshAll() {
    renderNodeList();
    renderValidation();
    loadNode(currentNodeId);
  }

  /* ---------- Node list ---------- */

  function renderNodeList() {
    const list = $('nodeList');
    list.innerHTML = '';
    const nodes = engine.getAllNodes();
    const ids = Object.keys(nodes);
    $('nodeCount').textContent = ids.length + ' 个节点';

    ids.sort((a, b) => {
      if (a === engine.data.rootNodeId) return -1;
      if (b === engine.data.rootNodeId) return 1;
      return a.localeCompare(b);
    });

    ids.forEach(id => {
      const n = nodes[id];
      const item = document.createElement('div');
      item.className = 'node-item' + (id === currentNodeId ? ' active' : '');
      item.innerHTML =
        '<div class="node-item-id">' +
          '<span>' + Utils.escapeHtml(n.title || '(未命名)') + '</span>' +
          (id === engine.data.rootNodeId ? '<span class="node-item-tag root">根</span>' : '') +
          (n.isEnding ? '<span class="node-item-tag ending">结局</span>' : '') +
        '</div>' +
        '<div class="node-item-desc">' + Utils.escapeHtml(n.id) + '</div>';
      item.addEventListener('click', () => loadNode(id));
      list.appendChild(item);
    });

    if (ids.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="icon">🧱</div>暂无节点，点击上方新增</div>';
    }
  }

  /* ---------- Node CRUD ---------- */

  function loadNode(id) {
    const node = engine.getNode(id);
    if (!node) {
      currentNodeId = engine.data.rootNodeId;
      toast('节点不存在，已回退到根节点');
      return;
    }
    currentNodeId = id;
    renderNodeList();

    $('editorTitle').textContent = '节点编辑 · ' + node.id;
    $('emptyHint').classList.add('hidden');
    $('editorForm').classList.remove('hidden');

    $('f_id').value = node.id;
    $('f_id').disabled = true;
    $('f_title').value = node.title || '';
    $('f_content').value = node.content || '';
    $('f_isEnding').checked = !!node.isEnding;

    toggleEndingUI(node.isEnding);
    renderSectorsPanel(node);
  }

  function toggleEndingUI(isEnding) {
    const panel = $('sectorPanel');
    if (isEnding) {
      panel.style.opacity = 0.5;
      panel.style.pointerEvents = 'none';
      $('sectorSubLabel').textContent = '结局节点自动禁用转盘';
    } else {
      panel.style.opacity = 1;
      panel.style.pointerEvents = 'auto';
      $('sectorSubLabel').textContent = '';
    }
    updateSaveButtonState();
  }

  function onAddNode() {
    let id = 'node_' + Math.random().toString(36).slice(2, 7);
    let tryCount = 0;
    while (engine.data.nodes[id] && tryCount++ < 20) {
      id = 'node_' + Math.random().toString(36).slice(2, 7);
    }
    const ok = engine.addNode({
      id: id,
      title: '新节点 ' + id,
      content: '在这里填写故事剧情...',
      isEnding: false,
      sectors: [
        { text: '选项 A', angle: 120, color: CONFIG.WHEEL.DEFAULT_COLORS[0], targetNodeId: '' },
        { text: '选项 B', angle: 120, color: CONFIG.WHEEL.DEFAULT_COLORS[1], targetNodeId: '' },
        { text: '选项 C', angle: 120, color: CONFIG.WHEEL.DEFAULT_COLORS[2], targetNodeId: '' },
      ],
    });
    if (ok) {
      toast('已新建节点 ' + id, 'ok');
      refreshAll();
    }
  }

  function onSaveNode() {
    const id = $('f_id').value.trim();
    const title = $('f_title').value.trim();
    const content = $('f_content').value;
    const isEnding = $('f_isEnding').checked;

    if (!title) {
      toast('标题不能为空', 'err');
      return;
    }

    const sectors = isEnding ? [] : sectorsToArray();

    if (!isEnding) {
      if (sectors.length < 2) {
        toast('非结局节点至少需要 2 个扇区', 'err');
        return;
      }
      if (!Utils.validateTotalAngle(sectors)) {
        toast('扇区角度总和必须 = 360°', 'err');
        return;
      }
    }

    const result = engine.updateNode(id, {
      title: title,
      content: content,
      isEnding: isEnding,
      sectors: sectors,
    });

    if (result) {
      toast('保存成功 ✓', 'ok');
      renderNodeList();
      renderValidation();
      renderSectorsPanel(engine.getNode(id));
    }
  }

  function onDeleteNode() {
    if (currentNodeId === engine.data.rootNodeId) {
      toast('根节点不可删除', 'err');
      return;
    }
    confirmModal('删除节点', '将删除节点 "' + currentNodeId + '"，同时清理其他节点指向该节点的跳转引用。确定？', function () {
      engine.deleteNode(currentNodeId);
      currentNodeId = engine.data.rootNodeId;
      toast('已删除', 'ok');
      refreshAll();
    });
  }

  function onSetRoot() {
    if (currentNodeId === engine.data.rootNodeId) {
      toast('当前已是根节点');
      return;
    }
    confirmModal('设置根节点', '将把节点 "' + currentNodeId + '" 设置为游戏初始根节点。确定？', function () {
      engine.data.rootNodeId = currentNodeId;
      engine.save();
      toast('根节点已更新 ✓', 'ok');
      renderNodeList();
      renderValidation();
    });
  }

  /* ---------- Sectors ---------- */

  function renderSectorsPanel(node) {
    const wrap = $('sectorsWrap');
    const tbody = $('sectorsBody');
    wrap.style.display = node && !node.isEnding ? 'block' : 'none';
    $('sectorSubLabel').textContent = node && node.isEnding ? '结局节点' : '';

    if (!node) return;

    editingSectors = Utils.deepClone(node.isEnding ? [] : (node.sectors || []));
    renderTargetOptions();
    renderSectorsTable();
    renderPreview();
  }

  function renderTargetOptions() {
    currentTargetOptions = Object.keys(engine.data.nodes).map(id => ({
      id: id,
      label: (id === engine.data.rootNodeId ? '[根] ' : '') + id + ' · ' + (engine.data.nodes[id].title || ''),
    }));
  }

  function renderSectorsTable() {
    const tbody = $('sectorsBody');
    tbody.innerHTML = '';

    editingSectors.forEach(function (s, i) {
      const tr = document.createElement('tr');

      const opts = ['<option value="">（无）</option>'].concat(
        currentTargetOptions.map(function (o) {
          return '<option value="' + Utils.escapeHtml(o.id) + '"' + (s.targetNodeId === o.id ? ' selected' : '') + '>' + Utils.escapeHtml(o.label) + '</option>';
        })
      ).join('');

      tr.innerHTML =
        '<td><input type="text" data-k="text" data-i="' + i + '" value="' + Utils.escapeHtml(s.text || '') + '" /></td>' +
        '<td class="sector-angle-cell"><input type="number" step="0.1" min="0" data-k="angle" data-i="' + i + '" value="' + (s.angle || 0) + '" /></td>' +
        '<td><input type="color" data-k="color" data-i="' + i + '" value="' + Utils.escapeHtml(s.color || '#FF6B6B') + '" /></td>' +
        '<td><select data-k="targetNodeId" data-i="' + i + '">' + opts + '</select></td>' +
        '<td><button class="admin-btn admin-btn-sm admin-btn-danger" data-del="' + i + '">✕</button></td>';

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('input', onSectorChange);
      el.addEventListener('change', onSectorChange);
    });
    tbody.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = Number(btn.dataset.del);
        if (editingSectors.length <= 2) { toast('至少保留 2 个扇区', 'err'); return; }
        editingSectors.splice(idx, 1);
        renderSectorsTable();
        renderPreview();
      });
    });

    updateAngleSummary();
    updateSaveButtonState();
  }

  function onSectorChange(e) {
    const i = Number(e.target.dataset.i);
    const k = e.target.dataset.k;
    let val = e.target.value;
    if (k === 'angle') val = Number(val) || 0;
    editingSectors[i][k] = val;

    if (e.type === 'change' && k === 'angle') {
      normalizeOthers(i);
      renderSectorsTable();
    } else {
      updateAngleSummary();
      updateSaveButtonState();
    }
    renderPreview();
  }

  function normalizeOthers(changedIndex) {
    const changed = editingSectors[changedIndex];
    const others = [];
    for (let i = 0; i < editingSectors.length; i++) {
      if (i !== changedIndex) others.push(editingSectors[i]);
    }
    const remainSum = 360 - (Number(changed.angle) || 0);
    if (remainSum <= 0 || others.length === 0) return;
    const othersTotal = others.reduce(function (a, s) { return a + (Number(s.angle) || 0); }, 0);
    if (othersTotal <= 0) {
      const each = remainSum / others.length;
      others.forEach(function (s) { s.angle = Number(each.toFixed(2)); });
      return;
    }
    const scale = remainSum / othersTotal;
    others.forEach(function (s) {
      s.angle = Number(((Number(s.angle) || 0) * scale).toFixed(2));
    });
    const diff = remainSum - others.reduce(function (a, s) { return a + Number(s.angle); }, 0);
    if (others.length > 0) {
      others[others.length - 1].angle = Number((others[others.length - 1].angle + diff).toFixed(2));
    }
  }

  function updateAngleSummary() {
    const sum = editingSectors.reduce(function (a, s) { return a + (Number(s.angle) || 0); }, 0);
    const diff = sum - 360;
    const el = $('angleTotal');
    el.textContent = sum.toFixed(2);
    el.style.color = Math.abs(diff) < 0.01 ? '' : (diff > 0 ? '#ef4444' : '#f59e0b');
    const diffEl = document.getElementById('angleDiff');
    if (Math.abs(diff) < 0.01) {
      if (diffEl) diffEl.remove();
    } else {
      if (!diffEl) {
        const p = document.createElement('span');
        p.id = 'angleDiff';
        p.style.cssText = 'color:#ef4444;font-size:12px;margin-left:8px';
        p.textContent = '';
        $('angleTotal').parentNode.appendChild(p);
      }
      diffEl.textContent = (diff > 0 ? '+' : '') + diff.toFixed(2) + '°';
    }
  }

  function updateSaveButtonState() {
    const btn = $('saveNodeBtn');
    const isEnding = document.getElementById('f_isEnding').checked;
    if (isEnding) {
      btn.disabled = false;
      btn.textContent = '💾 保存节点';
      return;
    }
    const sum = editingSectors.reduce(function (a, s) { return a + (Number(s.angle) || 0); }, 0);
    const angleOk = Math.abs(sum - 360) < 0.01;
    const minOk = editingSectors.length >= 2;
    if (!angleOk || !minOk) {
      btn.disabled = true;
      let reason = [];
      if (!minOk) reason.push('至少 2 个扇区');
      if (!angleOk) reason.push('角度总和 ≠ 360°');
      btn.textContent = '✗ ' + reason.join(' | ');
    } else {
      btn.disabled = false;
      btn.textContent = '💾 保存节点';
    }
  }

  function sectorsToArray() {
    return editingSectors.map(function (s) {
      return {
        text: String(s.text || '').trim(),
        angle: Number(s.angle) || 0,
        color: String(s.color || '#FF6B6B').trim(),
        targetNodeId: String(s.targetNodeId || '').trim(),
      };
    });
  }

  function addSectorRow() {
    editingSectors.push({
      text: '新选项',
      angle: Math.max(5, Math.round((360 / Math.max(editingSectors.length + 1)))),
      color: CONFIG.WHEEL.DEFAULT_COLORS[editingSectors.length % CONFIG.WHEEL.DEFAULT_COLORS.length],
      targetNodeId: '',
    });
    renderSectorsTable();
    renderPreview();
  }

  /* ---------- Preview ---------- */

  function renderPreview() {
    if (!previewWheel) {
      const canvas = $('previewCanvas');
      previewWheel = new Wheel(canvas, {
        sectors: editingSectors,
        size: 200,
        minRounds: 5,
        duration: 3000,
      });
    } else {
      previewWheel.updateSectors(editingSectors);
    }
    const sum = editingSectors.reduce((a, s) => a + (Number(s.angle) || 0), 0);
    const ok = Utils.validateTotalAngle(editingSectors);
    const info = ok
      ? '<span style="color:#10b981">✓ ' + editingSectors.length + ' 扇区 · 总和 360°</span>'
      : '<span style="color:#ef4444">✗ 角度总和 ' + sum.toFixed(2) + '° ≠ 360°</span>';
    $('previewInfo').innerHTML = info;
  }

  /* ---------- Import / Export ---------- */

  function onExport() {
    const json = engine.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = 'wheel-story-' + ts + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('导出成功 ✓', 'ok');
  }

  function onImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      confirmModal('导入配置', '将用此 JSON 文件覆盖全部现有节点配置，此操作不可撤销。确定继续？', function () {
        const result = engine.importJSON(reader.result);
        if (result.ok) {
          currentNodeId = engine.data.rootNodeId;
          toast('导入成功 ✓', 'ok');
          refreshAll();
        } else {
          toast('导入失败：' + result.error, 'err');
        }
      });
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  /* ---------- Validation ---------- */

  function renderValidation() {
    const box = $('validationBox');
    const result = engine.validate();
    if (result.ok) {
      box.className = 'validation-box';
      box.innerHTML = '✓ 全部校验通过，配置可用';
    } else {
      box.className = 'validation-box err';
      box.innerHTML = '✗ 发现 ' + result.errors.length + ' 个问题：<ul>' +
        result.errors.map(e => '<li>' + Utils.escapeHtml(e) + '</li>').join('') +
        '</ul>';
    }
  }

  /* ---------- Helpers ---------- */

  function toast(msg, type) {
    const el = $('toast');
    el.textContent = msg;
    el.className = 'admin-toast show' + (type ? ' ' + type : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function confirmModal(title, body, onOk) {
    $('modalTitle').textContent = title;
    $('modalBody').textContent = body;
    $('modalMask').classList.remove('hidden');
    const okBtn = $('modalOk');
    const origFn = okBtn.onclick;
    okBtn.onclick = function () {
      hideModal();
      okBtn.onclick = origFn;
      onOk && onOk();
    };
  }

  function hideModal() {
    $('modalMask').classList.add('hidden');
  }

  init();
})();
