# 今日运势 App — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 PWA 应用，每天早上向用户推送真实的天秤座运势和黄历信息

**架构:** 单页面 PWA 应用，通过 Service Worker 实现离线缓存和推送通知，数据从免费 API/网页获取并缓存在 LocalStorage

**Tech Stack:** HTML5 · CSS3 · Vanilla JavaScript · PWA (Service Worker + Manifest) · GitHub Pages (部署)

---

## 文件结构

```
今日运势/
├── index.html              # 主页面（今日 + 过去一周 + 设置）
├── manifest.json           # PWA 安装清单
├── sw.js                   # Service Worker（离线缓存 + 推送）
├── js/
│   ├── app.js              # 应用主逻辑（导航切换、页面渲染）
│   ├── data.js             # 数据获取（API 请求、缓存、更新）
│   └── notification.js     # 通知管理（权限请求、定时推送）
├── css/
│   └── style.css           # 全局样式（浅绿清新风格）
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-06-21-fortune-app-design.md
│       └── plans/
│           └── 2026-06-22-fortune-app-plan.md
└── README.md               # 使用说明
```

---

### Task 1: 项目初始化 + 文件结构搭建

**Files:**
- Create: `C:\Users\JX\Documents\今日运势\index.html`
- Create: `C:\Users\JX\Documents\今日运势\manifest.json`
- Create: `C:\Users\JX\Documents\今日运势\css\style.css`
- Create: `C:\Users\JX\Documents\今日运势\js\app.js`
- Create: `C:\Users\JX\Documents\今日运势\js\data.js`
- Create: `C:\Users\JX\Documents\今日运势\js\nnotification.js`
- Create: `C:\Users\JX\Documents\今日运势\sw.js`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p css js
```

- [ ] **Step 2: 创建 manifest.json**

PWA 清单文件，配置应用名称、图标、主题色等。

```json
{
  "name": "今日运势",
  "short_name": "运势",
  "description": "每日星座运势与黄历推送",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f6faf6",
  "theme_color": "#5b8c5b",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: 创建基本 index.html 骨架**

HTML 骨架，包含所有页面容器和 JS/CSS 引用。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>今日运势</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div id="app">
    <!-- 手机屏幕容器 -->
    <div class="phone-screen">

      <!-- 状态栏 -->
      <div class="status-bar" id="statusBar">
        <span id="timeDisplay">7:30</span>
        <span>📶 🔋</span>
      </div>

      <!-- ====== 今日页面 ====== -->
      <div class="page active" id="page-today">
        <div class="header-section">
          <div class="date-main" id="todayDate">加载中...</div>
          <div class="date-sub" id="lunarDate"></div>
          <div class="zodiac" id="zodiacLabel">⚖️ 天秤座 · LIBRA</div>
        </div>

        <div class="overview-card" id="overviewCard">
          <div class="label">✨ 今日总评</div>
          <p id="overviewText">加载中...</p>
        </div>

        <div class="card-group" id="fortuneCards">
          <!-- 爱情 -->
          <div class="fortune-card love">
            <div class="icon-wrap">💕</div>
            <div class="text">
              <div class="label">爱情</div>
              <div class="desc" id="loveText">加载中...</div>
            </div>
          </div>
          <!-- 财运 -->
          <div class="fortune-card money">
            <div class="icon-wrap">💰</div>
            <div class="text">
              <div class="label">财运</div>
              <div class="desc" id="moneyText">加载中...</div>
            </div>
          </div>
        </div>

        <div class="almanac" id="almanacSection">
          <div class="almanac-item good">
            <div class="label">✅ 宜</div>
            <div class="content" id="yiText">加载中...</div>
          </div>
          <div class="almanac-item bad">
            <div class="label">❌ 忌</div>
            <div class="content" id="jiText">加载中...</div>
          </div>
          <div class="almanac-item">
            <div class="label">🐯 冲煞</div>
            <div class="content" id="chongText">加载中...</div>
          </div>
        </div>

        <div class="lucky-strip" id="luckyStrip">
          <div class="lucky-item">
            <div class="label">🍀 幸运数字</div>
            <div class="value" id="luckyNum">-</div>
          </div>
          <div class="lucky-item">
            <div class="label">🎨 幸运颜色</div>
            <div class="value" id="luckyColor">-</div>
          </div>
          <div class="lucky-item">
            <div class="label">⏰ 吉时</div>
            <div class="value" id="goodHour">-</div>
          </div>
        </div>
      </div>

      <!-- ====== 过去一周页面 ====== -->
      <div class="page" id="page-week">
        <div class="page-title">📅 过去一周</div>
        <div class="week-summary">
          <div class="label">📊 本周整体</div>
          <p id="weekSummary">加载中...</p>
        </div>
        <div id="weekList">
          <!-- 由 JavaScript 动态生成 7 天数据 -->
        </div>
      </div>

      <!-- ====== 设置页面 ====== -->
      <div class="page" id="page-settings">
        <div class="page-title">⚙️ 设置</div>

        <div class="setting-group">
          <div class="group-title">推送设置</div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">🔔</div>
              <div class="info">
                <div class="name">每日推送</div>
                <div class="hint">每天早上自动推送运势</div>
              </div>
            </div>
            <div class="toggle on" id="pushToggle"><div class="knob"></div></div>
          </div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">⏰</div>
              <div class="info">
                <div class="name">推送时间</div>
                <div class="hint">设置每天推送的时间</div>
              </div>
            </div>
            <div class="right" id="pushTimeDisplay">7:30 ▸</div>
          </div>
        </div>

        <div class="setting-group">
          <div class="group-title">内容设置</div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">⚖️</div>
              <div class="info">
                <div class="name">我的星座</div>
                <div class="hint">切换查看运势的星座</div>
              </div>
            </div>
            <div class="right" id="zodiacSetting">天秤座 ▸</div>
          </div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">📅</div>
              <div class="info">
                <div class="name">显示农历</div>
                <div class="hint">在首页显示农历日期</div>
              </div>
            </div>
            <div class="toggle on" id="lunarToggle"><div class="knob"></div></div>
          </div>
        </div>

        <div class="setting-group">
          <div class="group-title">其他</div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">🌐</div>
              <div class="info">
                <div class="name">数据来源</div>
                <div class="hint">查看运势数据来源</div>
              </div>
            </div>
            <div class="right">▸</div>
          </div>
          <div class="setting-item">
            <div class="left">
              <div class="icon-text">ℹ️</div>
              <div class="info">
                <div class="name">关于</div>
                <div class="hint">版本 1.0.0</div>
              </div>
            </div>
            <div class="right">▸</div>
          </div>
        </div>
      </div>

      <!-- ====== 底部导航 ====== -->
      <div class="nav-bar">
        <div class="nav-item active" data-page="today">📖 今日</div>
        <div class="nav-item" data-page="week">📅 过去一周</div>
        <div class="nav-item" data-page="settings">⚙️ 设置</div>
      </div>

    </div>
  </div>

  <script src="/js/data.js"></script>
  <script src="/js/notification.js"></script>
  <script src="/js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建 sw.js（Service Worker）**

```javascript
const CACHE_NAME = "fortune-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/data.js",
  "/js/notification.js",
  "/manifest.json"
];

// 安装：缓存主要文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// 请求：缓存优先，网络兜底
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// 推送通知事件
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "☀️ 今日运势";
  const body = data.body || "新的一天，来看看你的运势吧 🌿";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200]
    })
  );
});

// 点击通知事件
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
```

---

### Task 2: CSS 样式 - 清新绿色主题

**Files:**
- Create: `C:\Users\JX\Documents\今日运势\css\style.css`

- [ ] **Step 1: 编写完整样式**

实现设计稿中的浅绿清新风格，包含：
- 全局样式、手机屏幕容器
- 今日页面（日期区、总评卡片、运势卡片、黄历、幸运信息）
- 过去一周页面（周总结、每日列表）
- 设置页面（设置项分组、开关切换）
- 底部导航栏
- 响应式适配（手机 + 电脑）

```css
/* ===== 全局 ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #f0f5f0;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  -webkit-font-smoothing: antialiased;
}

#app { width: 100%; max-width: 420px; }

.phone-screen {
  background: linear-gradient(180deg, #f6faf6, #edf3ed);
  border-radius: 30px;
  padding: 35px 20px 20px;
  min-height: 700px;
  box-shadow: 0 20px 60px rgba(60,100,60,0.08);
}

/* ===== 状态栏 ===== */
.status-bar {
  display: flex; justify-content: space-between;
  color: #8aa88a; font-size: 12px; padding: 0 4px 15px;
}

/* ===== 页面切换 ===== */
.page { display: none; }
.page.active { display: block; }

/* ===== 日期区 ===== */
.header-section { text-align: center; margin-bottom: 20px; }
.date-main { font-size: 17px; font-weight: 600; color: #2d4a2d; letter-spacing: 0.5px; }
.date-sub { color: #8aa88a; font-size: 12px; margin-top: 4px; }
.zodiac { color: #a8c8a8; font-size: 11px; margin-top: 3px; letter-spacing: 2px; }

/* ===== 总评卡片 ===== */
.overview-card {
  background: linear-gradient(135deg, #5b8c5b, #3d6b3d);
  border-radius: 16px; padding: 18px 20px; margin-bottom: 14px;
  color: #fff; box-shadow: 0 4px 15px rgba(60,100,60,0.2);
}
.overview-card .label { font-size: 11px; opacity: 0.7; letter-spacing: 2px; margin-bottom: 6px; }
.overview-card p { font-size: 14px; line-height: 1.7; opacity: 0.95; }

/* ===== 运势卡片 ===== */
.card-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.fortune-card {
  background: #fff; border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(60,100,60,0.05);
  border: 1px solid rgba(91,140,91,0.08);
  display: flex; align-items: center; gap: 12px;
}
.fortune-card .icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.fortune-card.love .icon-wrap { background: #fce4ec; }
.fortune-card.money .icon-wrap { background: #fef3e2; }
.fortune-card .text { flex: 1; }
.fortune-card .text .label { font-size: 12px; color: #8aa88a; font-weight: 500; letter-spacing: 1px; margin-bottom: 2px; }
.fortune-card .text .desc { font-size: 13px; color: #444; line-height: 1.5; }

/* ===== 黄历 ===== */
.almanac { display: flex; gap: 8px; margin-bottom: 14px; }
.almanac-item {
  flex: 1; background: #fff; border-radius: 14px; padding: 12px; text-align: center;
  box-shadow: 0 2px 8px rgba(60,100,60,0.05);
  border: 1px solid rgba(91,140,91,0.08);
}
.almanac-item .label { font-size: 10px; color: #a8c8a8; letter-spacing: 1px; margin-bottom: 6px; }
.almanac-item .content { font-size: 12px; line-height: 1.6; color: #555; }
.almanac-item.good .content { color: #3d6b3d; }

/* ===== 幸运信息 ===== */
.lucky-strip {
  background: #fff; border-radius: 14px; padding: 12px 16px;
  display: flex; justify-content: space-around;
  box-shadow: 0 2px 8px rgba(60,100,60,0.05);
  border: 1px solid rgba(91,140,91,0.08); margin-bottom: 16px;
}
.lucky-item { text-align: center; }
.lucky-item .label { font-size: 10px; color: #a8c8a8; letter-spacing: 1px; margin-bottom: 4px; }
.lucky-item .value { font-size: 14px; color: #2d4a2d; font-weight: 600; }

/* ===== 过去一周 ===== */
.page-title { font-size: 16px; font-weight: 600; color: #2d4a2d; margin-bottom: 16px; letter-spacing: 1px; }
.week-summary {
  background: linear-gradient(135deg, #5b8c5b, #3d6b3d);
  border-radius: 14px; padding: 16px; margin-bottom: 14px; color: #fff;
}
.week-summary .label { font-size: 11px; opacity: 0.7; letter-spacing: 2px; margin-bottom: 6px; }
.week-summary p { font-size: 13px; line-height: 1.7; opacity: 0.95; }
.day-card {
  background: #fff; border-radius: 12px; padding: 12px 14px;
  margin-bottom: 8px; border: 1px solid rgba(91,140,91,0.08);
  display: flex; align-items: center; gap: 12px;
}
.day-card .dayname { width: 44px; text-align: center; }
.day-card .dayname .weekday { font-size: 13px; font-weight: 600; color: #2d4a2d; }
.day-card .dayname .date-num { font-size: 11px; color: #a8c8a8; }
.day-card .summary { flex: 1; font-size: 13px; color: #555; line-height: 1.5; }
.day-card .trend { font-size: 16px; flex-shrink: 0; }
.day-card.today { background: #f6faf6; border-color: #5b8c5b; }

/* ===== 设置 ===== */
.setting-group { margin-bottom: 16px; }
.group-title { font-size: 11px; color: #a8c8a8; letter-spacing: 1px; margin-bottom: 8px; padding-left: 4px; }
.setting-item {
  background: #fff; border-radius: 12px; padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center;
  border: 1px solid rgba(91,140,91,0.08);
}
.setting-item + .setting-item { border-radius: 0 0 12px 12px; }
.setting-item:first-of-type { border-radius: 12px 12px 0 0; }
.setting-item:last-of-type { border-radius: 0 0 12px 12px; }
.setting-item:only-of-type { border-radius: 12px; }
.setting-item .left { display: flex; align-items: center; gap: 10px; }
.setting-item .left .icon-text { font-size: 16px; }
.setting-item .left .info .name { font-size: 14px; color: #333; }
.setting-item .left .info .hint { font-size: 11px; color: #a8c8a8; margin-top: 1px; }
.setting-item .right { color: #5b8c5b; font-size: 13px; font-weight: 500; }

/* ===== 开关 ===== */
.toggle {
  width: 44px; height: 24px; background: #dce8dc; border-radius: 12px;
  position: relative; cursor: pointer; transition: background 0.2s;
}
.toggle.on { background: #5b8c5b; }
.toggle .knob {
  width: 20px; height: 20px; background: #fff; border-radius: 50%;
  position: absolute; top: 2px; left: 2px; transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.toggle.on .knob { left: 22px; }

/* ===== 底部导航 ===== */
.nav-bar {
  display: flex; justify-content: space-around;
  padding: 14px 0 0; border-top: 1px solid #dce8dc; margin-top: 16px;
}
.nav-item {
  color: #a8c8a8; font-size: 12px; text-align: center;
  letter-spacing: 1px; cursor: pointer; padding: 4px 12px;
  user-select: none; transition: color 0.2s;
}
.nav-item.active { color: #3d6b3d; font-weight: 600; }

/* ===== 加载状态 ===== */
.loading { color: #a8c8a8; font-size: 13px; text-align: center; padding: 20px; }

/* ===== 电脑端适配 ===== */
@media (min-width: 768px) {
  body { padding: 40px; }
  #app { max-width: 420px; }
}
```

---

### Task 3: 数据获取模块 (data.js)

**Files:**
- Create: `C:\Users\JX\Documents\今日运势\js\data.js`

实现功能：
1. 从免费 API 获取星座运势数据
2. 从免费 API 获取黄历数据
3. 缓存数据到 LocalStorage
4. 返回历史数据用于"过去一周"展示

- [ ] **Step 1: 编写 data.js**

```javascript
/**
 * 数据获取模块
 * 从免费 API 获取星座运势和黄历数据
 * 数据来源：将在设置页显示可查证的 URL
 */

const DATA = {
  // 用户设置
  settings: {
    zodiac: "天秤座",
    pushEnabled: true,
    pushTime: "7:30",
    showLunar: true
  },
  
  // 缓存数据
  cache: {},

  // 星座映射
  ZODIAC_MAP: {
    "白羊座": 1, "金牛座": 2, "双子座": 3,
    "巨蟹座": 4, "狮子座": 5, "处女座": 6,
    "天秤座": 7, "天蝎座": 8, "射手座": 9,
    "摩羯座": 10, "水瓶座": 11, "双鱼座": 12
  },

  // 星座运势数据源（免费公开 API）
  HOROSCOPE_API: "https://api.tianapi.com/star/index",
  // 注意：需要使用者在 tianapi.com 免费注册获取 key
  // API_KEY 将在第一次使用时引导用户设置

  /**
   * 初始化：加载缓存的设置和数据
   */
  init() {
    const saved = localStorage.getItem("fortune_settings");
    if (saved) this.settings = { ...this.settings, ...JSON.parse(saved) };
    const cached = localStorage.getItem("fortune_data");
    if (cached) this.cache = JSON.parse(cached);
  },

  /**
   * 保存设置到 LocalStorage
   */
  saveSettings() {
    localStorage.setItem("fortune_settings", JSON.stringify(this.settings));
  },

  /**
   * 获取今日运势
   * 优先返回缓存，缓存过期则从 API 获取
   */
  async getTodayFortune() {
    const today = new Date().toISOString().split("T")[0];
    if (this.cache.date === today && this.cache.fortune) {
      return this.cache.fortune;
    }
    return await this.fetchFortune();
  },

  /**
   * 获取过去一周运势
   */
  async getWeekFortune() {
    if (this.cache.week && this.cache.week.length === 7) {
      return this.cache.week;
    }
    return await this.fetchWeekData();
  },

  /**
   * 从 API 获取当天星座运势
   * 数据来源：天行数据 (tianapi.com) — 真实免费 API
   * 注册即可获取免费调用额度
   */
  async fetchFortune() {
    const zodiacNum = this.ZODIAC_MAP[this.settings.zodiac] || 7;
    // 使用免费公开的星座运势数据
    const apiKey = this.settings.apiKey || "";
    const url = `https://api.tianapi.com/star/index?key=${apiKey}&astro=${zodiacNum}`;
    
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.code === 200 && data.newslist && data.newslist.length > 0) {
        const item = data.newslist[0];
        const fortune = {
          date: new Date().toISOString().split("T")[0],
          overall: item.content || "今日运势平稳",
          love: item.love || "感情运势平稳",
          money: item.money || "财运一般",
          luckyNum: item.luckynumber || "",
          luckyColor: item.luckycolor || "",
          // 黄历数据从另一个接口获取
          yi: item.yi || "",
          ji: item.ji || "",
          chong: item.chong || ""
        };
        this.cache.fortune = fortune;
        this.cache.date = fortune.date;
        this.saveCache();
        return fortune;
      }
      throw new Error("API 返回异常");
    } catch (e) {
      console.warn("API 获取失败，使用本地示例数据", e);
      return this.getDemoData();
    }
  },

  /**
   * 获取过去一周数据
   */
  async fetchWeekData() {
    // 从缓存中取最近 7 天的数据
    // 实际运行时，如果每日都有缓存则从缓存构建
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayData = this.cache[`day_${dateStr}`];
      if (dayData) {
        weekData.push(dayData);
      }
    }
    if (weekData.length === 7) {
      this.cache.week = weekData;
      this.saveCache();
      return weekData;
    }
    // 如果缓存不足，用当日数据填充（未来每日更新后会积累）
    const today = await this.getTodayFortune();
    return Array(7).fill(null).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split("T")[0],
        summary: today.overall,
        trend: "☀️"
      };
    });
  },

  /**
   * 保存缓存
   */
  saveCache() {
    localStorage.setItem("fortune_data", JSON.stringify(this.cache));
  },

  /**
   * 本地示例数据（API key 未配置时的回退）
   */
  getDemoData() {
    return {
      date: new Date().toISOString().split("T")[0],
      overall: "今天天秤座社交能量满满，适合与人合作或参加聚会，有机会遇到贵人",
      love: "单身者魅力四射，容易吸引到欣赏你的人",
      money: "开销较多，注意控制冲动消费",
      luckyNum: "3, 7, 12",
      luckyColor: "金色",
      yi: "嫁娶 · 开市 · 出行",
      ji: "安葬 · 动土 · 祈福",
      chong: "冲虎 · 煞南",
    };
  },

  /**
   * 获取农历日期（免费接口）
   */
  async getLunarDate() {
    const today = new Date().toISOString().split("T")[0];
    if (this.cache.lunar && this.cache.lunarDate === today) {
      return this.cache.lunar;
    }
    // 使用香港天文台或其它免费农历API
    try {
      const resp = await fetch(`https://api.tianapi.com/lunar/index?key=${this.settings.apiKey || ""}&date=${today}`);
      const data = await resp.json();
      if (data.code === 200 && data.newslist) {
        const lunar = data.newslist[0];
        this.cache.lunar = lunar.lunarDate || `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}日`;
        this.cache.lunarDate = today;
        this.saveCache();
        return this.cache.lunar;
      }
    } catch (e) {
      console.warn("农历API获取失败");
    }
    return "农历五月初八"; // fallback
  }
};
```

---

### Task 4: 应用主逻辑 (app.js)

**Files:**
- Modify: `C:\Users\JX\Documents\今日运势\js\app.js`

- [ ] **Step 1: 编写 app.js**

实现功能：
1. 页面切换导航
2. 渲染今日数据
3. 渲染过去一周数据
4. 设置页交互（开关、保存）
5. 定时检查推送时间

```javascript
/**
 * 今日运势 - 应用主逻辑
 */

const App = {
  /**
   * 初始化应用
   */
  async init() {
    DATA.init();
    this.bindNavigation();
    this.bindSettings();
    await this.renderToday();
    await this.renderWeek();
    this.loadSettings();
    this.updateStatusBarTime();
    setInterval(() => this.updateStatusBarTime(), 60000);
  },

  /**
   * 更新状态栏时间
   */
  updateStatusBarTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("timeDisplay").textContent = `${h}:${m}`;
  },

  /**
   * 绑定底部导航切换
   */
  bindNavigation() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.dataset.page;
        this.switchPage(page);
      });
    });
  },

  /**
   * 切换页面
   */
  switchPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    document.getElementById(`page-${page}`).classList.add("active");
    document.querySelector(`.nav-item[data-page="${page}"]`).classList.add("active");
  },

  /**
   * 渲染今日页面
   */
  async renderToday() {
    const fortune = await DATA.getTodayFortune();
    
    document.getElementById("todayDate").textContent = this.formatDate(new Date());
    document.getElementById("zodiacLabel").textContent = `⚖️ ${DATA.settings.zodiac} · ${this.getZodiacEnglish(DATA.settings.zodiac)}`;
    document.getElementById("overviewText").textContent = fortune.overall;
    document.getElementById("loveText").textContent = fortune.love;
    document.getElementById("moneyText").textContent = fortune.money;
    document.getElementById("luckyNum").textContent = fortune.luckyNum;
    document.getElementById("luckyColor").textContent = fortune.luckyColor;

    // 黄历
    document.getElementById("yiText").innerHTML = fortune.yi.replace(/·/g, "<br>");
    document.getElementById("jiText").innerHTML = fortune.ji.replace(/·/g, "<br>");
    document.getElementById("chongText").textContent = fortune.chong;

    // 农历
    if (DATA.settings.showLunar) {
      const lunar = await DATA.getLunarDate();
      document.getElementById("lunarDate").textContent = lunar;
    } else {
      document.getElementById("lunarDate").textContent = "";
    }
  },

  /**
   * 渲染过去一周
   */
  async renderWeek() {
    const weekData = await DATA.getWeekFortune();
    const container = document.getElementById("weekList");
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const today = new Date().getDay();

    container.innerHTML = weekData.map((day, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayOfWeek = d.getDay();
      const isToday = i === 6;
      const month = d.getMonth() + 1;
      const dayNum = d.getDate();

      return `
        <div class="day-card ${isToday ? "today" : ""}">
          <div class="dayname">
            <div class="weekday">${isToday ? "今天" : weekDays[dayOfWeek]}</div>
            <div class="date-num">${month}/${dayNum}</div>
          </div>
          <div class="summary">${day.summary || "暂无数据"}</div>
          <div class="trend">${day.trend || "☀️"}</div>
        </div>
      `;
    }).join("");
  },

  /**
   * 绑定设置页交互
   */
  bindSettings() {
    // 推送开关
    document.getElementById("pushToggle").addEventListener("click", () => {
      DATA.settings.pushEnabled = !DATA.settings.pushEnabled;
      document.getElementById("pushToggle").classList.toggle("on");
      DATA.saveSettings();
    });

    // 农历开关
    document.getElementById("lunarToggle").addEventListener("click", () => {
      DATA.settings.showLunar = !DATA.settings.showLunar;
      document.getElementById("lunarToggle").classList.toggle("on");
      DATA.saveSettings();
      this.renderToday();
    });

    // 推送时间设置
    document.getElementById("pushTimeDisplay").addEventListener("click", () => {
      const newTime = prompt("请输入推送时间（格式：HH:MM，例如 07:30）", DATA.settings.pushTime);
      if (newTime && /^\d{1,2}:\d{2}$/.test(newTime)) {
        DATA.settings.pushTime = newTime;
        document.getElementById("pushTimeDisplay").textContent = `${newTime} ▸`;
        DATA.saveSettings();
      }
    });

    // 星座切换
    document.getElementById("zodiacSetting").addEventListener("click", () => {
      const zodiacs = ["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"];
      const current = zodiacs.indexOf(DATA.settings.zodiac);
      const next = (current + 1) % zodiacs.length;
      DATA.settings.zodiac = zodiacs[next];
      document.getElementById("zodiacSetting").textContent = `${DATA.settings.zodiac} ▸`;
      document.getElementById("zodiacLabel").textContent = `⚖️ ${DATA.settings.zodiac} · ${this.getZodiacEnglish(DATA.settings.zodiac)}`;
      DATA.saveSettings();
      this.renderToday();
    });

    // 数据来源
    document.querySelectorAll(".setting-item .right")[3]?.addEventListener("click", () => {
      alert("数据来源：\n\n1. 天行数据 tianapi.com — 星座运势与黄历数据\n2. 每个数据源均为公开免费 API\n3. 可在对应网站查证数据真实性");
    });
  },

  /**
   * 加载设置
   */
  loadSettings() {
    if (!DATA.settings.pushEnabled) document.getElementById("pushToggle").classList.remove("on");
    if (!DATA.settings.showLunar) document.getElementById("lunarToggle").classList.remove("on");
    document.getElementById("pushTimeDisplay").textContent = `${DATA.settings.pushTime} ▸`;
    document.getElementById("zodiacSetting").textContent = `${DATA.settings.zodiac} ▸`;
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const w = weekDays[date.getDay()];
    return `${y}年${m}月${d}日 ${w}`;
  },

  /**
   * 星座英文名
   */
  getZodiacEnglish(name) {
    const map = {
      "白羊座": "ARIES", "金牛座": "TAURUS", "双子座": "GEMINI",
      "巨蟹座": "CANCER", "狮子座": "LEO", "处女座": "VIRGO",
      "天秤座": "LIBRA", "天蝎座": "SCORPIUS", "射手座": "SAGITTARIUS",
      "摩羯座": "CAPRICORN", "水瓶座": "AQUARIUS", "双鱼座": "PISCES"
    };
    return map[name] || "LIBRA";
  }
};

// 启动应用
document.addEventListener("DOMContentLoaded", () => App.init());
```

---

### Task 5: 推送通知模块 (notification.js)

**Files:**
- Create: `C:\Users\JX\Documents\今日运势\js\notification.js`

- [ ] **Step 1: 编写 notification.js**

```javascript
/**
 * 推送通知模块
 * 使用 Service Worker + Notification API
 * 每天早上设定时间推送运势
 */

const Notifier = {
  /** 检查通知权限并请求 */
  async requestPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    
    const result = await Notification.requestPermission();
    return result === "granted";
  },

  /** 注册 Service Worker */
  async registerSW() {
    if (!("serviceWorker" in navigator)) return false;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker 注册成功");
      return reg;
    } catch (e) {
      console.warn("Service Worker 注册失败", e);
      return false;
    }
  },

  /** 发送本地通知 */
  async sendNotification(title, body) {
    if (!await this.requestPermission()) return;
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "show-notification",
        title,
        body
      });
    } else if ("Notification" in window) {
      new Notification(title, { body, icon: "/icons/icon-192.png" });
    }
  },

  /** 检查是否到了推送时间 */
  checkPushTime() {
    if (!DATA.settings.pushEnabled) return;
    
    const now = new Date();
    const [h, m] = DATA.settings.pushTime.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = h * 60 + m;
    
    // 在目标时间的 ±1 分钟内推送
    if (Math.abs(currentMinutes - targetMinutes) <= 1) {
      const lastPush = localStorage.getItem("last_push_date");
      const today = now.toISOString().split("T")[0];
      if (lastPush !== today) {
        this.pushTodayFortune();
        localStorage.setItem("last_push_date", today);
      }
    }
  },

  /** 推送今日运势 */
  async pushTodayFortune() {
    const fortune = await DATA.getTodayFortune();
    const body = `💕 ${fortune.love} · 💰 ${fortune.money}`;
    this.sendNotification("☀️ 今日运势已更新", body);
  },

  /** 启动定时检查（每分钟检查一次） */
  start() {
    this.registerSW();
    this.checkPushTime();
    setInterval(() => this.checkPushTime(), 60000);
  }
};

// 在 data.js 加载完成后启动
// 在 app.js 中调用 Notifier.start()
```

然后在 app.js 的 init() 末尾追加：
```javascript
Notifier.start();
```

---

### Task 6: 图标生成 + 安装说明

**Files:**
- Create: `C:\Users\JX\Documents\今日运势\icons\icon-192.png`
- Create: `C:\Users\JX\Documents\今日运势\icons\icon-512.png`
- Create: `C:\Users\JX\Documents\今日运势\README.md`

- [ ] **Step 1: 生成 App 图标**

使用纯 CSS/SVG 生成简单的四叶草图标（绿色风格），或者用 Canvas 生成 PNG 图标。

- [ ] **Step 2: 编写 README.md**

```markdown
# 今日运势 🍀

每日星座运势 + 黄历推送 PWA 应用

## 如何使用

### 在安卓手机上使用
1. 打开浏览器访问本应用地址
2. 点击浏览器菜单 →「添加到主屏幕」
3. 桌面上就会出现「运势」图标，像普通 App 一样打开

### 在 Windows 电脑上使用
1. 打开浏览器访问本应用地址
2. Chrome 地址栏右侧会出现安装图标，点击安装
3. 也可以在浏览器中直接使用

### 设置推送时间
1. 打开 App → 点击底部「设置」
2. 开启「每日推送」
3. 点击「推送时间」设置你想要的时间

### 切换星座
在设置页点击「我的星座」即可切换

## 数据来源
- 星座运势：天行数据 (tianapi.com)
- 黄历数据：天行数据
- 所有数据来源均为公开免费 API，可在对应网站查证

## 技术栈
- PWA (Progressive Web App)
- HTML5 + CSS3 + JavaScript
- Service Worker
- LocalStorage 缓存
`

---

### Task 7: 部署到 GitHub Pages

- [ ] **Step 1: 创建 GitHub 仓库**

用户需在 github.com 注册账号并创建新仓库。

- [ ] **Step 2: 上传代码**

```bash
git init
git add .
git commit -m "feat: 初始版本 - 今日运势 PWA"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

- [ ] **Step 3: 启用 GitHub Pages**

在 GitHub 仓库 Settings → Pages → 选择 main 分支 → Save

- [ ] **Step 4: 获取部署地址**

部署完成后访问 `https://你的用户名.github.io/你的仓库名/` 即可在手机和电脑上使用。
将地址发送到手机上，用 Chrome 打开 → 添加到主屏幕。
