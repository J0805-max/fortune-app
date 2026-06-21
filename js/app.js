/**
 * 今日运势 - 应用主逻辑
 */

var App = {
  init: async function () {
    DATA.init();
    this.bindNavigation();
    this.bindSettings();
    this.updateStatusBarTime();
    setInterval(this.updateStatusBarTime.bind(this), 60000);
    await this.renderToday();
    await this.renderWeek();
    Notifier.start();
  },

  // 更新时间
  updateStatusBarTime: function () {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    var el = document.getElementById("timeDisplay");
    if (el) el.textContent = h + ":" + m;
  },

  // 绑定导航
  bindNavigation: function () {
    var items = document.querySelectorAll(".nav-item");
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener("click", this.handleNavClick.bind(this));
    }
  },

  handleNavClick: function (e) {
    var page = e.currentTarget.dataset.page;
    this.switchPage(page);
  },

  // 切换页面
  switchPage: function (page) {
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove("active");
    }
    var navs = document.querySelectorAll(".nav-item");
    for (var i = 0; i < navs.length; i++) {
      navs[i].classList.remove("active");
    }
    var targetPage = document.getElementById("page-" + page);
    if (targetPage) targetPage.classList.add("active");
    var targetNav = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (targetNav) targetNav.classList.add("active");
  },

  // 渲染今日页面
  renderToday: async function () {
    var fortune = await DATA.getTodayFortune();

    setText("todayDate", this.formatDate(new Date()));
    setText("zodiacLabel", "⚖️ " + DATA.settings.zodiac + " · " + (DATA.ZODIAC_EN[DATA.settings.zodiac] || "LIBRA"));
    setText("overviewText", fortune.overall);
    setText("loveText", fortune.love);
    setText("moneyText", fortune.money);
    setText("luckyNum", fortune.luckyNum);
    setText("luckyColor", fortune.luckyColor);
    setText("goodHour", fortune.goodHour || "-");

    // 黄历
    var yiEl = document.getElementById("yiText");
    var jiEl = document.getElementById("jiText");
    var chongEl = document.getElementById("chongText");
    if (yiEl) yiEl.innerHTML = (fortune.yi || "-").replace(/·/g, " · ");
    if (jiEl) jiEl.innerHTML = (fortune.ji || "-").replace(/·/g, " · ");
    if (chongEl) chongEl.textContent = fortune.chong || "-";

    // 农历
    if (DATA.settings.showLunar) {
      var lunar = await DATA.getLunarDate();
      setText("lunarDate", lunar);
    } else {
      setText("lunarDate", "");
    }

    // 缓存今日数据到过去一周
    var todayKey = "day_" + fortune.date;
    if (!DATA.cache[todayKey]) {
      DATA.cache[todayKey] = {
        summary: fortune.overall,
        trend: "☀️"
      };
      DATA.saveCache();
    }
  },

  // 渲染过去一周
  renderWeek: async function () {
    var weekData = await DATA.getWeekFortune();
    var container = document.getElementById("weekList");
    if (!container) return;

    var weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var html = "";

    for (var i = 0; i < weekData.length; i++) {
      var day = weekData[i];
      var d = new Date(day.date);
      if (isNaN(d.getTime())) {
        d = new Date();
        d.setDate(d.getDate() - (6 - i));
      }
      var dayOfWeek = d.getDay();
      var isToday = i === weekData.length - 1;
      var month = d.getMonth() + 1;
      var dayNum = d.getDate();

      html += '<div class="day-card' + (isToday ? " today" : "") + '">';
      html += '  <div class="dayname">';
      html += '    <div class="weekday">' + (isToday ? "今天" : weekDays[dayOfWeek]) + "</div>";
      html += '    <div class="date-num">' + month + "/" + dayNum + "</div>";
      html += "  </div>";
      html += '  <div class="summary">' + (day.summary || "暂无数据") + "</div>";
      html += '  <div class="trend">' + (day.trend || "☀️") + "</div>";
      html += "</div>";
    }

    container.innerHTML = html;

    // 设置周总结
    var summary = document.getElementById("weekSummary");
    if (summary) {
      var summaries = [
        "这周社交运不错，财运稍有波动，周末运势回升",
        "整体运势平稳，适合按计划推进事项",
        "人际关系良好，适合团队合作与沟通"
      ];
      summary.textContent = summaries[new Date().getDate() % summaries.length];
    }
  },

  // 绑定设置交互
  bindSettings: function () {
    var self = this;

    // 推送开关
    var pushToggle = document.getElementById("pushToggle");
    if (pushToggle) {
      pushToggle.addEventListener("click", function () {
        DATA.settings.pushEnabled = !DATA.settings.pushEnabled;
        this.classList.toggle("on");
        DATA.saveSettings();
      });
    }

    // 农历开关
    var lunarToggle = document.getElementById("lunarToggle");
    if (lunarToggle) {
      lunarToggle.addEventListener("click", function () {
        DATA.settings.showLunar = !DATA.settings.showLunar;
        this.classList.toggle("on");
        DATA.saveSettings();
        self.renderToday();
      });
    }

    // 推送时间
    var pushTime = document.getElementById("pushTimeDisplay");
    if (pushTime) {
      pushTime.addEventListener("click", function () {
        var newTime = prompt("请输入推送时间（格式 HH:MM）", DATA.settings.pushTime);
        if (newTime && /^\d{1,2}:\d{2}$/.test(newTime)) {
          DATA.settings.pushTime = newTime;
          this.textContent = newTime + " ▸";
          DATA.saveSettings();
        }
      });
    }

    // 星座切换
    var zodiacSetting = document.getElementById("zodiacSetting");
    if (zodiacSetting) {
      zodiacSetting.addEventListener("click", function () {
        var zodiacs = ["白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座","摩羯座","水瓶座","双鱼座"];
        var current = zodiacs.indexOf(DATA.settings.zodiac);
        var next = (current + 1) % zodiacs.length;
        DATA.settings.zodiac = zodiacs[next];
        this.textContent = DATA.settings.zodiac + " ▸";
        DATA.saveSettings();
        self.renderToday();
      });
    }

    // 数据来源
    var dataSource = document.getElementById("dataSourceItem");
    if (dataSource) {
      dataSource.addEventListener("click", function () {
        alert(
          "📡 数据来源\n\n" +
          "所有数据均来自公开免费的 API 服务：\n\n" +
          "1️⃣ 天行数据 (tianapi.com)\n" +
          "   - 星座每日运势\n" +
          "   - 黄历信息\n" +
          "   - 注册免费获取 API Key\n\n" +
          "2️⃣ 香港天文台 (hko.gov.hk)\n" +
          "   - 农历公历对照\n\n" +
          "⚠️ 当前使用内置示例数据\n" +
          "配置 API Key 后即可获取实时数据"
        );
      });
    }

    // 关于
    var aboutItems = document.querySelectorAll(".setting-item .right");
    for (var i = 0; i < aboutItems.length; i++) {
      if (aboutItems[i].textContent.trim() === "▸" && 
          aboutItems[i].closest(".setting-item") && 
          aboutItems[i].closest(".setting-item").querySelector(".icon-text") &&
          aboutItems[i].closest(".setting-item").querySelector(".icon-text").textContent === "ℹ️") {
        aboutItems[i].addEventListener("click", function () {
          alert("今日运势 v1.0.0\n\n为天秤座打造的每日运势 App\n清新简约 · 数据真实可查");
        });
      }
    }
  },

  // 格式化日期
  formatDate: function (date) {
    var weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日 " + weekDays[date.getDay()];
  }
};

// 工具函数
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

// 启动
document.addEventListener("DOMContentLoaded", function () {
  App.init();
});

