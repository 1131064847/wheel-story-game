(function (global) {
  'use strict';

  const DEFAULT_DATA = {
    rootNodeId: CONFIG.ROOT_NODE_ID,
    nodes: {
      root: {
        id: 'root',
        title: '序章：神秘的古堡',
        content: '深夜的暴雨中，你驱车来到郊外一座尘封已久的古堡前。铁门被狂风推开，一股夹杂着玫瑰花香的阴风扑面而来...\n\n古老的石墙上挂着褪色的油画，画中人的眼睛似乎在跟着你移动。',
        isEnding: false,
        sectors: [
          { text: '推开大门', angle: 120, color: '#FF6B6B', targetNodeId: 'hall' },
          { text: '绕到后方', angle: 120, color: '#4ECDC4', targetNodeId: 'backyard' },
          { text: '转身离开', angle: 120, color: '#FFE66D', targetNodeId: 'leave' },
        ],
      },
      hall: {
        id: 'hall',
        title: '第一章：诡异大厅',
        content: '你推开沉重的橡木大门，大厅里烛光摇曳，却空无一人。墙上挂着的盔甲反射着跳动的火光。\n\n脚步声从二楼传来，忽远忽近，你握紧了口袋里唯一的武器——一把折叠小刀。',
        isEnding: false,
        sectors: [
          { text: '上楼探查', angle: 90,  color: '#FF6B6B', targetNodeId: 'upstairs' },
          { text: '蹲下躲藏', angle: 90,  color: '#4ECDC4', targetNodeId: 'hide' },
          { text: '大声呼喊', angle: 90,  color: '#FFE66D', targetNodeId: 'shout' },
          { text: '从后门溜走', angle: 90,  color: '#AA96DA', targetNodeId: 'backyard' },
        ],
      },
      backyard: {
        id: 'backyard',
        title: '第一章：玫瑰花园',
        content: '后院的玫瑰丛在月光下显得格外妖异。你注意到花丛深处有一条被枯叶掩盖的石板小径。\n\n远处的钟楼突然敲响了午夜的钟声——当当当，刚好十二下。',
        isEnding: false,
        sectors: [
          { text: '沿小径深入', angle: 180, color: '#FF6B6B', targetNodeId: 'tunnel' },
          { text: '翻墙离开',   angle: 180, color: '#4ECDC4', targetNodeId: 'ending_escape' },
        ],
      },
      leave: {
        id: 'leave',
        title: '结局：平安归家',
        content: '你选择了理智。回到车里，一路疾驰驶离了那片阴森的树林。后视镜里，古堡在闪电的映照下越来越远...\n\n第二天的报纸上，你看到了古堡被雷劈中、地下室发现神秘壁画的新闻。也许你错过了一个秘密，但你保住了性命。',
        isEnding: true,
        sectors: [],
      },
      upstairs: {
        id: 'upstairs',
        title: '第二章：午夜来客',
        content: '你屏住呼吸冲上楼梯，在长廊尽头看到一个身着白裙的身影正背对你站立。\n\n"你终于来了..." 她没有回头，声音却在你耳边清晰地响起。',
        isEnding: false,
        sectors: [
          { text: '转身就跑',    angle: 120, color: '#FF6B6B', targetNodeId: 'ending_flees' },
          { text: '上前搭话',    angle: 120, color: '#4ECDC4', targetNodeId: 'ending_truth' },
          { text: '用刀刺过去',  angle: 120, color: '#FFE66D', targetNodeId: 'ending_blood' },
        ],
      },
      hide: {
        id: 'hide',
        title: '第二章：地下室',
        content: '你躲进壁炉旁的暗室，发现这里竟是一条通往地下的密道。越往下走，空气中的血腥味越浓。\n\n地面上散落着古老的日记残页，写着："当午夜十二响时，新的祭品将..."',
        isEnding: false,
        sectors: [
          { text: '继续深入', angle: 180, color: '#FF6B6B', targetNodeId: 'ending_sacrifice' },
          { text: '原路返回', angle: 180, color: '#4ECDC4', targetNodeId: 'ending_return' },
        ],
      },
      shout: {
        id: 'shout',
        title: '结局：无人应答',
        content: '你的喊声在空旷的大厅里回荡，没有任何回应。但你注意到——壁炉上方那幅油画里的人，嘴角似乎微微上扬了。\n\n烛火突然全部熄灭。',
        isEnding: true,
        sectors: [],
      },
      tunnel: {
        id: 'tunnel',
        title: '第二章：密道',
        content: '石板小径尽头是一扇刻满符文的石门。门上的文字写着：\n\n"真心者得见天光，虚伪者永葬于此。"',
        isEnding: false,
        sectors: [
          { text: '推门而入', angle: 180, color: '#FF6B6B', targetNodeId: 'ending_treasure' },
          { text: '原路返回', angle: 180, color: '#4ECDC4', targetNodeId: 'hall' },
        ],
      },
      ending_escape: {
        id: 'ending_escape',
        title: '结局：翻窗逃走',
        content: '你翻过古堡围墙，在黑暗中拼命奔跑。身后传来低沉的笑声，像是在嘲弄你的恐惧。\n\n你跑了整整一夜，直到天色微亮才敢停下。回头望去——古堡早已消失在晨雾之中。',
        isEnding: true,
        sectors: [],
      },
      ending_flees: {
        id: 'ending_flees',
        title: '结局：仓皇逃离',
        content: '你转身就跑，楼梯、大厅、大门，你的脑子里只剩下一个字——跑！\n\n当你气喘吁吁冲回车里时，才发现口袋里的折叠小刀不见了。而后视镜里，有个白色的身影正缓缓从古堡中走出...',
        isEnding: true,
        sectors: [],
      },
      ending_truth: {
        id: 'ending_truth',
        title: '结局：真相',
        content: '你鼓起勇气走上前，轻轻拍了拍那个白裙身影的肩膀。她缓缓转过脸——那是一张和你自己一模一样的脸。\n\n"欢迎回家，" 她微笑道，"你终于记起来了。"',
        isEnding: true,
        sectors: [],
      },
      ending_blood: {
        id: 'ending_blood',
        title: '结局：血色婚礼',
        content: '你举起刀刺向那个白色身影。刀刃穿过了她的身体——但消失的不是她，而是你自己。\n\n当你意识到不对劲时，已经太晚了。你变成了画中人，永远站在壁炉上方，看着每一个闯入古堡的灵魂...',
        isEnding: true,
        sectors: [],
      },
      ending_sacrifice: {
        id: 'ending_sacrifice',
        title: '结局：祭品',
        content: '你沿着密道走到尽头，发现一个巨大的圆形祭坛，上面画着你看不懂的符文。蜡烛刚好点燃了第十二根。\n\n"来得正好，" 一个古老的声音在你脑海中响起，"第十二位祭品..."',
        isEnding: true,
        sectors: [],
      },
      ending_return: {
        id: 'ending_return',
        title: '结局：迷途知返',
        content: '你转身返回大厅，决定不再探索这座诡异的古堡。从后门离开后，你一路平安到家。\n\n虽然不知道自己错过了什么，但你知道自己做出了正确的选择。',
        isEnding: true,
        sectors: [],
      },
      ending_treasure: {
        id: 'ending_treasure',
        title: '结局：宝藏与诅咒',
        content: '石门应声而开。你看到了满屋的金银珠宝，但在最中央的石台上，放着一个黑匣子，匣子上刻着一行小字：\n\n"拿走一件，留下灵魂。"\n\n古堡外的晨曦穿过窗户洒进来。你深吸一口气，走向了那个黑匣子...',
        isEnding: true,
        sectors: [],
      },
    },
  };

  function StoryEngine() {
    this.data = null;
    this.currentNodeId = null;
  }

  StoryEngine.prototype.init = function () {
    const saved = Storage.get(CONFIG.STORAGE_KEYS.STORY_DATA);
    if (this._isValidData(saved)) {
      this.data = Utils.deepClone(saved);
    } else {
      this.data = Utils.deepClone(DEFAULT_DATA);
      this.save();
    }
    this.currentNodeId = this.data.rootNodeId;
  };

  StoryEngine.prototype._isValidData = function (d) {
    if (!d || typeof d !== 'object') return false;
    if (!d.rootNodeId || typeof d.rootNodeId !== 'string') return false;
    if (!d.nodes || typeof d.nodes !== 'object') return false;
    if (Object.keys(d.nodes).length === 0) return false;
    return true;
  };

  StoryEngine.prototype.getNode = function (id) {
    if (!id) return null;
    const node = this.data.nodes[id];
    return node ? Utils.deepClone(node) : null;
  };

  StoryEngine.prototype.getRootNode = function () {
    return this.getNode(this.data.rootNodeId);
  };

  StoryEngine.prototype.getCurrentNode = function () {
    return this.getNode(this.currentNodeId);
  };

  StoryEngine.prototype.getAllNodes = function () {
    return Utils.deepClone(this.data.nodes);
  };

  StoryEngine.prototype.reset = function () {
    this.currentNodeId = this.data.rootNodeId;
  };

  StoryEngine.prototype.jumpTo = function (nodeId) {
    if (!nodeId) {
      console.warn('[StoryEngine] 跳转失败: 目标节点 ID 为空');
      return null;
    }
    const node = this.data.nodes[nodeId];
    if (!node) {
      console.warn('[StoryEngine] 跳转失败: 节点 "' + nodeId + '" 不存在');
      return null;
    }
    this.currentNodeId = nodeId;
    return Utils.deepClone(node);
  };

  StoryEngine.prototype.isEnding = function (nodeId) {
    const node = this.data.nodes[nodeId];
    return !!(node && node.isEnding);
  };

  StoryEngine.prototype.addNode = function (node) {
    if (!node || !node.id) return false;
    if (this.data.nodes[node.id]) return false;
    this.data.nodes[node.id] = {
      id: node.id,
      title: node.title || '',
      content: node.content || '',
      isEnding: !!node.isEnding,
      sectors: Array.isArray(node.sectors) ? node.sectors : [],
    };
    this.save();
    return true;
  };

  StoryEngine.prototype.updateNode = function (id, patch) {
    if (!this.data.nodes[id]) return false;
    const target = this.data.nodes[id];
    for (const key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key) && key !== 'id') {
        target[key] = patch[key];
      }
    }
    if (patch.isEnding) {
      target.sectors = [];
    }
    this.save();
    return true;
  };

  StoryEngine.prototype.deleteNode = function (id) {
    if (!this.data.nodes[id]) return false;
    if (id === this.data.rootNodeId) return false;
    delete this.data.nodes[id];
    for (const nid in this.data.nodes) {
      const n = this.data.nodes[nid];
      if (Array.isArray(n.sectors)) {
        n.sectors.forEach(s => {
          if (s.targetNodeId === id) s.targetNodeId = '';
        });
      }
    }
    if (this.currentNodeId === id) {
      this.currentNodeId = this.data.rootNodeId;
    }
    this.save();
    return true;
  };

  StoryEngine.prototype.validate = function () {
    const errors = [];
    if (!this.data.rootNodeId) {
      errors.push('缺少根节点 ID');
    }
    if (!this.data.nodes[this.data.rootNodeId]) {
      errors.push('根节点 "' + this.data.rootNodeId + '" 不存在');
    }
    for (const id in this.data.nodes) {
      const n = this.data.nodes[id];
      if (!n.isEnding) {
        if (!Utils.validateTotalAngle(n.sectors)) {
          errors.push('节点 "' + id + '" 扇区角度总和 ≠ 360°');
        }
        n.sectors.forEach((s, i) => {
          if (s.targetNodeId && !this.data.nodes[s.targetNodeId]) {
            errors.push('节点 "' + id + '" 第 ' + (i + 1) + ' 扇区跳转目标 "' + s.targetNodeId + '" 不存在');
          }
        });
      }
    }
    return {
      ok: errors.length === 0,
      errors: errors,
    };
  };

  StoryEngine.prototype.save = function () {
    Storage.set(CONFIG.STORAGE_KEYS.STORY_DATA, this.data);
  };

  StoryEngine.prototype.exportJSON = function () {
    return JSON.stringify(this.data, null, 2);
  };

  StoryEngine.prototype.importJSON = function (jsonStr) {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return { ok: false, error: 'JSON 格式错误' };
    }
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'JSON 根节点必须是对象' };
    }
    if (!parsed.nodes || typeof parsed.nodes !== 'object') {
      return { ok: false, error: '缺少 nodes 对象' };
    }
    if (!parsed.rootNodeId) {
      return { ok: false, error: '缺少 rootNodeId' };
    }
    const nodeKeys = Object.keys(parsed.nodes);
    if (nodeKeys.length === 0) {
      return { ok: false, error: 'nodes 为空' };
    }
    if (!parsed.nodes[parsed.rootNodeId]) {
      return { ok: false, error: '根节点 "' + parsed.rootNodeId + '" 不存在于 nodes 中' };
    }

    const normalizedNodes = {};
    for (let i = 0; i < nodeKeys.length; i++) {
      const id = nodeKeys[i];
      const n = parsed.nodes[id];
      if (!n || typeof n !== 'object') {
        return { ok: false, error: '节点 "' + id + '" 结构非法' };
      }
      normalizedNodes[id] = {
        id: id,
        title: typeof n.title === 'string' ? n.title : '',
        content: typeof n.content === 'string' ? n.content : '',
        isEnding: !!n.isEnding,
        sectors: Array.isArray(n.sectors) ? n.sectors.map(function (s) {
          return {
            text: String(s.text || ''),
            angle: Number(s.angle) || 0,
            color: String(s.color || '#cccccc'),
            targetNodeId: String(s.targetNodeId || ''),
          };
        }) : [],
      };
    }

    this.data = {
      rootNodeId: String(parsed.rootNodeId),
      nodes: normalizedNodes,
    };
    this.currentNodeId = this.data.rootNodeId;
    this.save();
    return { ok: true };
  };

  StoryEngine.prototype.resetToDefault = function () {
    this.data = Utils.deepClone(DEFAULT_DATA);
    this.currentNodeId = this.data.rootNodeId;
    this.save();
  };

  global.StoryEngine = StoryEngine;
})(window);
