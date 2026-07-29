window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var STORAGE_KEY = 'workout-records';

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function add(record) {
    var records = getAll();
    records.push({
      id: Date.now(),
      name: record.name,
      completedAt: new Date().toISOString(),
      duration: record.duration,
      sets: record.sets,
      workSeconds: record.workSeconds,
      restSeconds: record.restSeconds,
      prepareSeconds: record.prepareSeconds
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {}
  }

  function getPaginated(offset, limit, lang) {
    var records = getAll();
    // Sort by completedAt descending (newest first)
    records.sort(function(a, b) {
      return b.completedAt.localeCompare(a.completedAt);
    });

    // Group by local date string
    var locale = lang === 'zh-HK' ? 'zh-Hant-HK' :
                 lang === 'zh-TW' ? 'zh-Hant-TW' :
                 lang === 'zh-CN' ? 'zh-Hans-CN' :
                 lang === 'ja' ? 'ja-JP' : 'en-US';

    var days = [];
    var currentDay = null;

    for (var i = 0; i < records.length; i++) {
      var d = new Date(records[i].completedAt);
      var dayKey = d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      if (!currentDay || currentDay.key !== dayKey) {
        currentDay = { key: dayKey, label: dayKey, records: [] };
        days.push(currentDay);
      }
      currentDay.records.push(records[i]);
    }

    var pageDays = days.slice(offset, offset + limit);
    return {
      days: pageDays,
      hasMore: offset + limit < days.length
    };
  }

  function getDailyDurations(year, month) {
    var records = getAll();
    var daily = {};
    for (var i = 0; i < records.length; i++) {
      var d = new Date(records[i].completedAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        var key = d.toISOString().split('T')[0];
        daily[key] = (daily[key] || 0) + records[i].duration;
      }
    }
    return daily;
  }

  exports.Records = {
    getAll: getAll,
    add: add,
    getPaginated: getPaginated,
    getDailyDurations: getDailyDurations
  };

})(window.TimerApp);
