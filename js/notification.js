/**
 * 今日运势 - 推送通知模块
 * 使用 Service Worker + Notification API
 */

var Notifier = {
  // 请求通知权限
  requestPermission: async function () {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    var result = await Notification.requestPermission();
    return result === "granted";
  },

  // 注册 Service Worker
  registerSW: async function () {
    if (!("serviceWorker" in navigator)) return false;
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker 注册成功");
      return true;
    } catch (e) {
      console.warn("Service Worker 注册失败", e);
      return false;
    }
  },

  // 发送通知
  sendNotification: async function (title, body) {
    if (!await this.requestPermission()) return;
    if ("Notification" in window) {
      try {
        new Notification(title, { body: body, icon: "/icons/icon-192.png" });
      } catch (e) {
        console.warn("通知发送失败", e);
      }
    }
  },

  // 检查推送时间
  checkPushTime: function () {
    if (!DATA.settings.pushEnabled) return;
    var now = new Date();
    var parts = DATA.settings.pushTime.split(":");
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var targetMinutes = h * 60 + m;

    // 在目标时间的 ±1 分钟内推送
    if (Math.abs(currentMinutes - targetMinutes) <= 1) {
      var lastPush = localStorage.getItem("last_push_date");
      var today = now.toISOString().split("T")[0];
      if (lastPush !== today) {
        this.pushTodayFortune();
        localStorage.setItem("last_push_date", today);
      }
    }
  },

  // 推送今日运势
  pushTodayFortune: async function () {
    var fortune = await DATA.getTodayFortune();
    var body = "💕 " + fortune.love + " · 💰 " + fortune.money;
    this.sendNotification("☀️ 今日运势已更新", body);
  },

  // 启动
  start: function () {
    this.registerSW();
    this.checkPushTime();
    setInterval(this.checkPushTime.bind(this), 60000);
  }
};
