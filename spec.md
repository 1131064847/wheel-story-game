# H5 转盘分支故事游戏 — 项目规划文档

> 纯前端 · Canvas 转盘 · 原生 HTML/CSS/JS · localStorage 存储
> 移动端优先 · 竖屏适配 · 微信内置浏览器兼容

---

## 一、项目概述

一款**移动端 H5 转盘故事分支游戏**。玩家通过转动带有不等分扇区的转盘，根据选中扇区跳转到不同的故事节点，最终走向各种结局。同时提供完整的**管理员配置后台**，支持可视化编辑全部故事节点、转盘扇区、跳转关系，导出/导入 JSON 配置。

### 核心原则
| 原则 | 说明 |
|------|------|
| 零后端 | 所有数据存储在浏览器 localStorage，无服务端依赖 |
| 纯原生 | HTML + CSS + JavaScript (ES6+)，不引入重型框架 |
| Canvas 转盘 | 转盘组件使用 Canvas 2D 原生绘制，不依赖第三方插件 |
| 配置驱动 | 剧情、扇区、跳转全部由管理员配置生成，无硬编码故事内容 |
| 移动端优先 | 竖屏 H5 设计，适配微信内置浏览器 |

---

## 二、目录结构

```
wheel-story-game/
│
├── index.html                  # 入口页（根据 hash 路由或 localStorage 自动跳转）
├── play.html                   # 【普通用户游玩视图】
├── admin-login.html            # 【管理员登录页】
├── admin-dashboard.html        # 【管理员配置后台】
│
├── spec.md                     # 本文档（项目规划）
│
├── css/
│   ├── common.css              # 公共样式：reset、变量、工具类、移动端适配
│   ├── play.css                # 游玩页样式
│   └── admin.css               # 管理员后台样式
│
├── js/
│   ├── core/                   # 基础能力层
│   │   ├── Config.js           # 常量定义（admin 账号、localStorage key、默认配色）
│   │   ├── Storage.js          # localStorage 封装（含 JSON 序列化、容错）
│   │   └── Utils.js            # 工具函数（UUID、角度校验、深拷贝、颜色工具等）
│   │
│   ├── components/             # 可复用组件层
│   │   └── Wheel.js            # Canvas 转盘组件（渲染 + 动画引擎）
│   │
│   ├── engine/                 # 业务核心引擎层
│   │   └── StoryEngine.js      # 故事引擎（节点管理、分支跳转、容错）
│   │
│   ├── play/                   # 游玩页面逻辑
│   │   └── PlayApp.js          # 游玩页主入口（初始化、节点渲染、交互绑定）
│   │
│   └── admin/                  # 管理员后台模块
│       ├── Auth.js             # 登录鉴权（账号密码校验、会话状态）
│       ├── NodeManager.js      # 故事节点 CRUD 管理
│       ├── SectorConfig.js     # 扇区配置（新增/删除/编辑扇区）
│       ├── Preview.js          # 转盘预览（复用 Wheel 组件）
│       └── IO.js               # 配置导入/导出 JSON
│
└── assets/                     # 静态资源（若需图标等）
```

---

## 三、模块划分详解

### 3.1 `core/` — 基础能力层

#### `Config.js`
```js
const CONFIG = {
  ADMIN: { username: 'admin', password: '123456' },
  STORAGE_KEYS: {
    STORY_DATA: 'wheel_story_data',        // 全部故事节点配置
    ADMIN_SESSION: 'wheel_admin_session',   // 管理员登录态
  },
  WHEEL: {
    RENDER_SIZE: 320,                       // 转盘绘制尺寸（canvas 逻辑像素）
    ANIMATION_MIN_ROUNDS: 5,                // 最少旋转圈数
    ANIMATION_DURATION: 4500,                // 动画时长 ms
    POINTER_OFFSET: 0.5,                    // 指针安全偏移（度），避免落在线上
    DEFAULT_COLORS: ['#FF6B6B','#4ECDC4','#FFE66D','#95E1D3','#F38181','#AA96DA'],
  },
  ROOT_NODE_ID: 'root',                     // 根节点固定 ID
};
```

#### `Storage.js`
- `Storage.get(key)` / `Storage.set(key, value)` — 读写
- `Storage.remove(key)` — 删除
- `Storage.getStoryData()` / `Storage.setStoryData(data)` — 故事配置便捷方法，带默认值兜底
- 读写均做 try-catch 容错，防止 localStorage 不可用时页面崩溃

#### `Utils.js`
- `Utils.generateId()` — 生成唯一 ID（简短随机串）
- `Utils.normalizeAngle(sectors)` — 归一化扇区角度到 360°
- `Utils.validateTotalAngle(sectors)` — 校验扇区角度总和是否等于 360°（允许 0.01 误差）
- `Utils.deepClone(obj)` — 深拷贝
- `Utils.parseColor(input)` — 颜色格式校验
- `Utils.escapeHtml(str)` — HTML 转义，防止 XSS

---

### 3.2 `components/Wheel.js` — 转盘组件

**纯 Canvas 2D 实现**，对外暴露一个构造函数 `new Wheel(canvasElement, options)`。

#### 初始化参数 `options`
```js
{
  sectors: [                           // 扇区数组
    { text: '推开大门', angle: 60, color: '#FF6B6B', targetNodeId: 'hall' },
    { text: '绕到后门', angle: 120, color: '#4ECDC4', targetNodeId: 'backyard' },
    { text: '转身离开', angle: 180, color: '#FFE66D', targetNodeId: 'leave' },
  ],
  size: 320,                           // canvas 绘制尺寸（正方形）
  pointerDirection: 'top',              // 指针朝向（默认顶部）
}
```

#### 核心 API
| 方法 | 说明 |
|------|------|
| `wheel.render()` | 根据当前 sectors 数据重绘转盘 |
| `wheel.updateSectors(sectors)` | 更新扇区数据并重新渲染 |
| `wheel.spin(targetAngle, callback)` | 旋转到目标角度，停止后回调 |
| `wheel.spinToSector(index, callback)` | 旋转到指定扇区索引，自动计算目标角度 |
| `wheel.isSpinning()` | 是否正在旋转 |
| `wheel.destroy()` | 销毁，清理事件监听 |

#### 渲染逻辑
1. 计算每个扇区的起始角度 `startAngle = 累计前置扇区角度`
2. 绘制圆弧扇形：`ctx.beginPath → moveTo(center) → arc(center, center, radius, start, end) → closePath → fill`
3. 绘制分割线：`ctx.stroke` 从圆心到扇区边界点
4. 绘制文字：计算扇区中心角度，在扇区中线上、距圆心适当距离处 `ctx.fillText`
5. 绘制外层圆环（装饰）、中心圆盘、指针（独立绘制在 canvas 上方或 overlay div）

#### 动画逻辑（加速 → 匀速 → 阻尼减速）
动画曲线通过**三次贝塞尔 / 分段 easing** 实现：

```
总时长 4500ms，分三段：
  0~20%  (0~900ms)   加速阶段    — easeInQuad
  20%~60%(900~2700ms) 匀速阶段    — 线性
  60%~100%(2700~4500ms) 阻尼减速 — easeOutQuart

目标角度计算：
  目标扇区中心角度 → 加至少 5 圈 (360° × 5) → 对齐指针位置 → 再加安全偏移避免分割线
  最终: totalRotation = rounds * 360 + pointerAngle - sectorCenter + randomOffset(±0.5°)
```

- 使用 `requestAnimationFrame` 驱动动画，保证手机流畅
- 动画期间锁定状态，`isSpinning() === true` 时不响应再次 spin 调用

#### 指针落位安全保护
计算目标角度时在扇区中心基础上添加 **±0.5° 随机偏移**，确保永远不会精确落在分割线上。

---

### 3.3 `engine/StoryEngine.js` — 故事引擎

负责**故事节点的增删改查 + 分支跳转逻辑 + 容错**。

#### 数据模型
```js
{
  rootNodeId: 'root',                    // 根节点 ID
  nodes: {
    'root': {
      id: 'root',
      title: '起始',
      content: '你推开了古老的大门...',
      isEnding: false,                   // 是否结局节点
      sectors: [
        { text: '向右转', angle: 90,  color: '#FF6B6B', targetNodeId: 'hall_A' },
        { text: '向左转', angle: 180, color: '#4ECDC4', targetNodeId: 'hall_B' },
        { text: '直走',   angle: 90,  color: '#FFE66D', targetNodeId: 'hall_C' },
      ]
    },
    'hall_A': {
      id: 'hall_A',
      title: '走廊 A',
      content: '你来到了布满盔甲的走廊...',
      isEnding: false,
      sectors: [ /* ... */ ]
    },
    'ending_1': {
      id: 'ending_1',
      title: '结局：勇者',
      content: '你成功逃出生天！',
      isEnding: true,
      sectors: []                         // 结局节点无转盘
    }
  }
}
```

#### 核心 API
| 方法 | 说明 |
|------|------|
| `StoryEngine.init()` | 从 localStorage 加载数据，首次使用创建示例根节点 |
| `StoryEngine.getNode(id)` | 获取单个节点（容错：不存在返回 null） |
| `StoryEngine.getAllNodes()` | 返回全部节点对象 |
| `StoryEngine.getRootNode()` | 获取根节点 |
| `StoryEngine.addNode(node)` | 新增节点 |
| `StoryEngine.updateNode(id, patch)` | 更新节点（部分字段） |
| `StoryEngine.deleteNode(id)` | 删除节点（**级联清除其他节点指向此节点的跳转引用**） |
| `StoryEngine.jumpTo(nodeId)` | 跳转，返回目标节点或 null（容错） |
| `StoryEngine.validate()` | 校验全部节点：角度总和、跳转目标存在性、根节点存在 |
| `StoryEngine.save()` | 持久化到 localStorage |
| `StoryEngine.exportJSON()` | 导出 JSON 字符串 |
| `StoryEngine.importJSON(jsonStr)` | 从 JSON 字符串导入并覆盖 |

#### 跳转容错逻辑
```js
jumpTo(nodeId) {
  if (!nodeId) return null;
  const node = this.nodes[nodeId];
  if (!node) {
    console.warn(`[StoryEngine] 跳转失败: 节点 "${nodeId}" 不存在`);
    return null;
  }
  return node;
}
```

#### 删除节点级联清理
删除节点 `X` 时，遍历所有其他节点的 `sectors`，将 `targetNodeId === X` 的扇区目标置为空字符串（管理员后台可后续重新指定）。

---

### 3.4 `play/PlayApp.js` — 游玩页主入口

#### 页面结构（play.html）
```
┌──────────────────────┐
│   顶部导航栏           │  ← 标题 + 重新开始按钮
├──────────────────────┤
│                      │
│   故事文本区域         │  ← 当前节点 content，可滚动
│                      │
├──────────────────────┤
│                      │
│                      │
│      [ 转盘 Canvas ]  │  ← 中间
│                      │
│                      │
├──────────────────────┤
│                      │
│   [ 旋转按钮 ]        │  ← 底部，大按钮
│                      │
└──────────────────────┘
```

结局页面：
```
┌──────────────────────┐
│   顶部导航栏           │
├──────────────────────┤
│                      │
│   结局标题            │
│                      │
│   结局文本内容         │
│                      │
├──────────────────────┤
│                      │
│   [ 重新开始 ] 按钮    │
│                      │
└──────────────────────┘
```

#### 主流程
```js
PlayApp.init()
  → StoryEngine.init()
  → 获取根节点 = StoryEngine.getRootNode()
  → renderNode(rootNode)

renderNode(node)
  → 更新故事文本 DOM
  → if (node.isEnding): 显示结局样式 + 重新开始按钮，隐藏转盘和旋转按钮
  → else: Wheel.updateSectors(node.sectors) + Wheel.render()

spinButton.onClick
  → if (wheel.isSpinning()) return
  → 随机或手动选一个扇区索引
  → wheel.spinToSector(index, (result) => {
      → 弹出选中结果提示
      → 下一节点 = StoryEngine.jumpTo(result.sector.targetNodeId)
      → if (!下一节点) { 提示"路径缺失，游戏结束" }
      → else { renderNode(下一节点) }
    })

restartButton.onClick
  → renderNode(StoryEngine.getRootNode())
```

#### 交互细节
- 转盘旋转按钮有 loading 态，旋转期间按钮禁用 + 灰色 + 文案变为"转动中..."
- 选中扇区后用 Toast/Modal 短暂展示选中内容（如 "你选择了：推开大门"），然后自动跳转
- 结局页面有明显的视觉区分（背景色变化、庆祝/结束图标）
- **刷新页面或点击重新开始 → 回到根节点**（不做存档，每次都是新游戏）

---

### 3.5 `admin/` — 管理员后台模块

#### 3.5.1 `Auth.js` 登录鉴权
```
admin-login.html:
  账号输入框
  密码输入框
  [ 登录 ] 按钮

Auth.login(username, password)
  → 比对 CONFIG.ADMIN
  → 成功: Storage.set(CONFIG.STORAGE_KEYS.ADMIN_SESSION, { loggedIn: true, ts: Date.now() })
  → 跳转 admin-dashboard.html
  → 失败: 显示红色错误提示

Auth.checkSession()
  → admin-dashboard.html 加载时调用
  → 未登录 → 强制跳转回 admin-login.html

Auth.logout()
  → 清除 session → 跳转登录页
```

#### 3.5.2 `NodeManager.js` 节点管理
管理员后台主界面布局：
```
┌──────────────────────────────────┐
│ 故事节点管理      [+ 新增节点]   │
├──────────────────────────────────┤
│                                  │
│ 📋 节点列表（左侧/上方）          │
│ ┌────────────────────────────┐   │
│ │ [根] root    → Hall        │   │
│ │     hall_A   → 走廊 A     │   │
│ │     hall_B   → 走廊 B     │   │
│ │     ending_1 → 结局       │   │
│ └────────────────────────────┘   │
│                                  │
│ ✏️ 节点编辑（右侧/下方）          │
│ 节点ID: [__________]             │
│ 标题:   [__________]             │
│ 剧情:   [textarea  ]             │
│ ☑ 结局节点                       │
│                                  │
│ 🎡 转盘扇区配置                   │
│ ┌──────┬──────┬──────┬──────┐   │
│ │ 文字 │ 角度 │ 颜色 │ 跳转 │   │
│ ├──────┼──────┼──────┼──────┤   │
│ │ ...  │ ...  │ ...  │ ...  │   │
│ └──────┴──────┴──────┴──────┘   │
│ [+ 添加扇区]                     │
│                                  │
│ 💾 [保存节点]  [预览转盘]        │
│                                  │
├──────────────────────────────────┤
│ 导入导出: [导出JSON] [选择文件]  │
└──────────────────────────────────┘
```

NodeManager API：
- 列表渲染：遍历 StoryEngine.getAllNodes() 生成节点卡片
- 新增节点：弹窗表单，ID 自动生成或手动输入
- 删除节点：二次确认 → StoryEngine.deleteNode(id) → 刷新列表
- 切换节点：点击列表项 → 加载该节点到编辑区
- 编辑节点：修改 title/content/isEnding → 保存时 StoryEngine.updateNode()

#### 3.5.3 `SectorConfig.js` 扇区配置
- 为当前选中节点渲染扇区编辑表格
- 每行：文字输入框 | 角度输入框（数字，联动自动归一化） | 颜色选择器（HTML5 color input） | 跳转目标下拉框（全部节点 ID）
- 添加扇区：追加一行
- 删除扇区：移除一行
- **实时校验**：角度总和必须等于 360°，否则保存按钮置灰 + 红字提示差值
- 结局节点：扇区编辑区隐藏或禁用

#### 3.5.4 `Preview.js` 转盘预览
- 复用 `Wheel.js` 组件，canvas 放在一个小尺寸预览区
- 扇区配置变化时实时更新预览（`wheel.updateSectors(previewSectors)`）
- 提供"试转"按钮，模拟旋转动画

#### 3.5.5 `IO.js` 导入导出
- 导出：`StoryEngine.exportJSON()` → 触发 `<a download="story-config.json">` 下载
- 导入：`<input type="file" accept=".json">` → FileReader 读取 → `StoryEngine.importJSON()` → 刷新页面
- 导入前校验 JSON 结构合法性（必须有 `nodes` + `rootNodeId`）

---

## 四、页面路由与入口逻辑

| URL | 行为 |
|-----|------|
| `index.html` | 检查当前状态 → localStorage 有 session → 跳 admin-dashboard；否则 → play.html |
| `play.html` | 游玩页，始终开放访问 |
| `admin-login.html` | 登录页，始终开放访问 |
| `admin-dashboard.html` | 管理员后台，未登录强制跳 admin-login.html |

---

## 五、数据校验清单

| 校验点 | 位置 | 规则 |
|--------|------|------|
| 扇区角度总和 | SectorConfig 保存时 / StoryEngine.validate() | 必须等于 360°，允许 ±0.01° 浮点误差 |
| 跳转目标节点存在性 | StoryEngine.jumpTo() / 删除时级联清理 | 目标不存在时 jumpTo 返回 null，删除时自动清理引用 |
| 根节点存在 | StoryEngine.init() | 无根节点时自动创建一个默认根节点，防止空状态 |
| 管理员账号密码 | Auth.login() | 严格比对 `admin` / `123456`，错误时给出红色提示 |
| 导入 JSON 格式 | IO.js | 必须是合法 JSON + 包含 `nodes` 对象和 `rootNodeId` 字符串 |
| 节点 ID 唯一性 | NodeManager 新增时 | ID 不能与已有节点重复 |
| 结局节点无扇区 | SectorConfig | isEnding=true 时强制 sectors=[] 并禁用编辑 |

---

## 六、UI 设计要点

### 6.1 游玩页 (play.html)
- **配色**：深色渐变背景 + 金色/暖色转盘，营造故事氛围
- **故事文本区**：卡片式，圆角，可滚动，支持多行
- **转盘**：居中显示，canvas 自适应宽度 `min(90vw, 360px)`
- **旋转按钮**：大圆形按钮，位于转盘正下方，带阴影和按压反馈
- **指针**：固定在转盘顶部的三角指针（CSS 绘制或 canvas overlay）

### 6.2 管理员后台 (admin-dashboard.html)
- **布局**：上中下或左右分栏，移动端自动变为单列
- **配色**：中性灰白底 + 蓝紫强调色，专业感
- **节点列表**：卡片/列表形式，展示 ID + 标题摘要
- **表单**：清晰的 label + input 对齐
- **校验提示**：红色文字、输入框 border 变红
- **预览区**：右侧独立区域，实时同步

### 6.3 管理员登录页 (admin-login.html)
- 居中卡片，简洁表单，深色/品牌色背景

### 6.4 移动端适配
- `viewport` meta: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- 使用 `rem` 或 `vw/vh` 单位
- canvas 使用 `devicePixelRatio` 保证高清屏清晰
- 触摸友好：按钮最小点击区域 44×44px
- 禁止双击缩放、橡皮筋效果

---

## 七、技术实现细节

### 7.1 Canvas 高清屏适配
```js
const dpr = window.devicePixelRatio || 1;
canvas.width = size * dpr;
canvas.height = size * dpr;
canvas.style.width = size + 'px';
canvas.style.height = size + 'px';
ctx.scale(dpr, dpr);
```

### 7.2 动画缓动函数
```js
// easeInQuad   — 加速
t => t * t
// linear       — 匀速  
t => t
// easeOutQuart — 阻尼减速
t => 1 - Math.pow(1 - t, 4)

// 分段组合：按阶段计算总偏移量占比
function segmentedEase(t) {
  if (t < 0.2)    return easeInQuad(t / 0.2) * 0.3;        // 前20%完成30%位移
  else if (t < 0.6) return 0.3 + linear((t - 0.2) / 0.4) * 0.35;  // 中间40%完成35%
  else            return 0.65 + easeOutQuart((t - 0.6) / 0.4) * 0.35;  // 后40%完成35%
}
```

### 7.3 扇区文字渲染
- 文字方向：沿扇区中线径向排列（旋转 canvas）
- 自动换行处理（扇区太窄时缩小字号）
- 文字颜色自动对比度（根据背景色亮度选黑/白）

### 7.4 localStorage 默认数据（首次启动）
```json
{
  "rootNodeId": "root",
  "nodes": {
    "root": {
      "id": "root",
      "title": "序章：神秘的古堡",
      "content": "你驱车来到郊外的一座古老城堡前，铁门缓缓敞开，一股神秘的气息扑面而来...",
      "isEnding": false,
      "sectors": [
        { "text": "推开大门进入", "angle": 120, "color": "#FF6B6B", "targetNodeId": "hall" },
        { "text": "绕到城堡后方", "angle": 120, "color": "#4ECDC4", "targetNodeId": "backyard" },
        { "text": "转身离开",     "angle": 120, "color": "#FFE66D", "targetNodeId": "leave" }
      ]
    },
    "hall": {
      "id": "hall",
      "title": "大厅",
      "content": "你走进了布满壁画的大厅，烛光摇曳...",
      "isEnding": true,
      "sectors": []
    },
    "backyard": {
      "id": "backyard", 
      "title": "后院花园",
      "content": "后院的玫瑰丛中有一条隐秘小径...",
      "isEnding": true,
      "sectors": []
    },
    "leave": {
      "id": "leave",
      "title": "结局：平安归家",
      "content": "你选择了安全，驱车离去。古堡在后视镜中越来越远...",
      "isEnding": true,
      "sectors": []
    }
  }
}
```

---

## 八、非功能性需求

| 项目 | 要求 |
|------|------|
| 浏览器兼容 | iOS Safari ≥12、Android Chrome ≥60、微信内置浏览器 X5 ≥3 |
| 首屏加载 | 纯静态资源，无网络请求，首次打开 < 1s |
| 动画帧率 | 转盘旋转动画 ≥ 50fps（requestAnimationFrame + DPR 优化） |
| 离线可用 | 所有数据本地存储，断网不影响游玩/管理 |
| 安全性 | 管理员密码不做前端加密（纯前端无法安全存储），仅做基本校验；XSS 防护（内容转义） |

---

## 九、开发步骤（顺序）

1. **骨架搭建** — 创建目录、4 个 HTML 页面、公共 CSS reset
2. **core 层** — Config、Storage、Utils
3. **Wheel 组件** — Canvas 绘制 + 旋转动画（先做独立 demo 验证效果）
4. **StoryEngine** — 节点数据管理 + 跳转 + 默认数据
5. **play 页面** — 整合 Wheel + StoryEngine，完成游玩主流程
6. **admin 登录页** — Auth 模块
7. **admin 后台主框架** — 布局、NodeManager 列表/编辑
8. **SectorConfig** — 扇区配置表格
9. **Preview** — 复用 Wheel 实时预览
10. **IO 导入导出** — JSON 文件交互
11. **整体联调 + 边界测试** — 校验、容错、删节点级联清理
12. **移动端适配调优** — DPR、viewport、触摸、滚动

---

## 十、后续可扩展方向（本次不实现）

- 故事节点可视化连线图（Graph 视图）
- 扇区权重随机概率（当前每次选中是手动/等概率，可扩展按 angle 权重随机）
- 多语言（i18n）
- 音效/BGM 支持
- 二维码分享特定结局
- PWA 离线安装

---

> **本文档为开发确认基线，方案确认后立即进入骨架初始化阶段。**
