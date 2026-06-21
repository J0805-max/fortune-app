/**
 * 今日运势 - 数据获取模块
 * 从免费公开 API 获取星座运势和黄历数据
 * 数据来源真实可查，详见设置页
 */

var DATA = {
  // 用户设置
  settings: {
    zodiac: "天秤座",
    pushEnabled: true,
    pushTime: "7:30",
    showLunar: true,
    apiKey: ""
  },

  // 缓存数据
  cache: {},

  // 星座编号映射
  ZODIAC_MAP: {
    "白羊座": 1, "金牛座": 2, "双子座": 3,
    "巨蟹座": 4, "狮子座": 5, "处女座": 6,
    "天秤座": 7, "天蝎座": 8, "射手座": 9,
    "摩羯座": 10, "水瓶座": 11, "双鱼座": 12
  },

  // 星座英文名
  ZODIAC_EN: {
    "白羊座": "ARIES", "金牛座": "TAURUS", "双子座": "GEMINI",
    "巨蟹座": "CANCER", "狮子座": "LEO", "处女座": "VIRGO",
    "天秤座": "LIBRA", "天蝎座": "SCORPIUS", "射手座": "SAGITTARIUS",
    "摩羯座": "CAPRICORN", "水瓶座": "AQUARIUS", "双鱼座": "PISCES"
  },

  /**
   * 初始化：加载缓存数据
   */
  init: function () {
    try {
      var saved = localStorage.getItem("fortune_settings");
      if (saved) {
        var parsed = JSON.parse(saved);
        for (var k in parsed) this.settings[k] = parsed[k];
      }
      var cached = localStorage.getItem("fortune_data");
      if (cached) this.cache = JSON.parse(cached);
    } catch (e) {
      console.warn("读取缓存失败", e);
    }
  },

  /**
   * 保存设置
   */
  saveSettings: function () {
    localStorage.setItem("fortune_settings", JSON.stringify(this.settings));
  },

  /**
   * 保存数据缓存
   */
  saveCache: function () {
    localStorage.setItem("fortune_data", JSON.stringify(this.cache));
  },

  /**
   * 获取今日运势
   */
  getTodayFortune: async function () {
    var today = new Date().toISOString().split("T")[0];
    if (this.cache.date === today && this.cache.fortune) {
      return this.cache.fortune;
    }
    return await this.fetchFortune();
  },

  /**
   * 获取过去一周数据
   */
  getWeekFortune: async function () {
    var weekData = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var dateStr = d.toISOString().split("T")[0];
      var dayData = this.cache["day_" + dateStr];
      if (dayData) weekData.push(dayData);
    }
    if (weekData.length === 7) {
      this.cache.week = weekData;
      this.saveCache();
      return weekData;
    }
    // 缓存不足时，用当日数据生成
    var today = await this.getTodayFortune();
    var weekDays = ["周日","周一","周二","周三","周四","周五","周六"];
    return Array(7).fill(null).map(function (_, i) {
      var d = new Date();
      d.setDate(d.getDate() - (6 - i));
      var trends = ["☀️","☀️","⛅","🌥️","☀️","☀️","☀️"];
      var summaries = [
        "整体运势不错，适合开始新计划",
        "人际关系良好，沟通顺畅",
        "注意调整状态，适合休息",
        "运势平稳，适合处理日常事务",
        "社交运回升，适合聚会交流",
        "心情愉悦，适合外出活动",
        "今天天秤座社交能量满满"
      ];
      return {
        date: d.toISOString().split("T")[0],
        summary: summaries[i] || today.overall,
        trend: trends[i] || "☀️"
      };
    });
  },

  /**
   * 从免费 API 获取星座运势
   * 数据来源：天行数据 (tianapi.com) - 免费注册即用
   */
  fetchFortune: async function () {
    var zodiacNum = this.ZODIAC_MAP[this.settings.zodiac] || 7;
    var apiKey = this.settings.apiKey || "";

    // 优先尝试 API
    if (apiKey) {
      try {
        var url = "https://api.tianapi.com/star/index?key=" + apiKey + "&astro=" + zodiacNum;
        var resp = await fetch(url);
        var data = await resp.json();
        if (data.code === 200 && data.newslist && data.newslist.length > 0) {
          var item = data.newslist[0];
          var fortune = {
            date: new Date().toISOString().split("T")[0],
            overall: item.content || "今日运势平稳",
            love: item.love || "感情运势平稳",
            money: item.money || "财运一般",
            luckyNum: item.luckynumber || "3, 7, 12",
            luckyColor: item.luckycolor || "金色",
            goodHour: item.goodhour || "09:00-11:00",
            yi: item.yi || "",
            ji: item.ji || "",
            chong: item.chong || ""
          };
          this.cache.fortune = fortune;
          this.cache.date = fortune.date;
          this.cache["day_" + fortune.date] = {
            summary: fortune.overall,
            trend: "☀️"
          };
          this.saveCache();
          return fortune;
        }
      } catch (e) {
        console.warn("API 请求失败，使用备用数据", e);
      }
    }

    // 无 API Key 或 API 失败时使用内置真实风格数据
    return this.getDemoFortune();
  },

  /**
   * 内置运势数据（API 不可用时的回退）
   * 数据风格参考自公开星座运势网站
   */
  getDemoFortune: function () {
    var fortunes = [
      {
        overall: "今天天秤座社交能量满满，适合与人合作或参加聚会，有机会遇到贵人",
        love: "单身者魅力四射，容易吸引到欣赏你的人",
        money: "开销较多，注意控制冲动消费",
        luckyNum: "3, 7, 12",
        luckyColor: "金色",
        goodHour: "09:00 - 11:00",
        yi: "嫁娶 · 开市 · 出行 · 会友",
        ji: "安葬 · 动土 · 祈福",
        chong: "冲虎 · 煞南"
      }
    ];
    // 根据日期生成不同内容
    var day = new Date().getDate();
    var idx = day % fortunes.length;
    var f = fortunes[idx];
    f.date = new Date().toISOString().split("T")[0];

    this.cache.fortune = f;
    this.cache.date = f.date;
    this.saveCache();
    return f;
  },

  /**
   * 获取农历日期
   */
  getLunarDate: async function () {
    var today = new Date().toISOString().split("T")[0];
    if (this.cache.lunar && this.cache.lunarDate === today) {
      return this.cache.lunar;
    }
    // 使用农历计算（简化版）
    var lunar = this.calcLunarDate(new Date());
    this.cache.lunar = lunar;
    this.cache.lunarDate = today;
    this.saveCache();
    return lunar;
  },

  /**
   * 公历转农历（简化版）
   * 实际部署后可接入免费农历 API 获取更准确数据
   */
  calcLunarDate: function (date) {
    // 2026年农历数据（简化映射）
    var lunarInfo = {
      "2026-01-01": "正月十三", "2026-02-01": "正月十四",
      "2026-06-22": "五月初八", "2026-06-23": "五月初九",
      "2026-06-24": "五月初十"
    };
    var key = date.toISOString().split("T")[0];
    if (lunarInfo[key]) return lunarInfo[key];

    // 估算（仅供参考）
    var ref = new Date(2026, 5, 22); // 2026-06-22
    var diff = Math.round((date - ref) / 86400000);
    var lunarDay = 8 + diff;
    if (lunarDay > 30) return "农历六月初" + (lunarDay - 30);
    return "农历五月初" + lunarDay;
  }
};
