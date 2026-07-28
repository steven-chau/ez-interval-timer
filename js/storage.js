window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var STORAGE_KEY = 'interval-timer-routines';
  var CONFIG_KEY = 'interval-timer-last-config';

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  function getRoutines() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRoutine(routine) {
    var routines = getRoutines();
    if (!routine.id) {
      routine.id = generateId();
      routines.push(routine);
    } else {
      var idx = -1;
      for (var i = 0; i < routines.length; i++) {
        if (routines[i].id === routine.id) { idx = i; break; }
      }
      if (idx >= 0) {
        routines[idx] = routine;
      } else {
        routine.id = generateId();
        routines.push(routine);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    return routine;
  }

  function deleteRoutine(id) {
    var routines = [];
    var all = getRoutines();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id !== id) routines.push(all[i]);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }

  function getLastConfig() {
    try {
      var data = localStorage.getItem(CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLastConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  exports.Storage = {
    getRoutines: getRoutines,
    saveRoutine: saveRoutine,
    deleteRoutine: deleteRoutine,
    getLastConfig: getLastConfig,
    saveLastConfig: saveLastConfig
  };

})(window.TimerApp);
