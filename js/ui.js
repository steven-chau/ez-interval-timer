window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  // ===== DOM references (cached on init) =====
  var configView, timerView, timerBg, phaseLabel, countdownDigits;
  var progressRing, setCounter, btnPlayPause, iconPause, iconPlay;
  var btnSkipBack, btnSkipFwd, btnLock, iconUnlocked, iconLocked;
  var btnExit, lockOverlay, timerControls;
  var routinesGrid, routinesEmpty;
  var routineModal, modalTitle, btnModalCancel, btnModalSave;
  var btnMenu, menuBackdrop, menuDrawer, btnMenuClose, btnAddToHomescreen;
  var setsDisplay;
  var workMinDisplay, workSecDisplay;
  var restMinDisplay, restSecDisplay;
  var prepareMinDisplay, prepareSecDisplay;
  var modalSetsDisplay;
  var modalWorkMinDisplay, modalWorkSecDisplay;
  var modalRestMinDisplay, modalRestSecDisplay;
  var modalPrepareMinDisplay, modalPrepareSecDisplay;

  // ===== Config state =====
  var config = {
    sets: 3,
    workMinutes: 0, workSeconds: 30,
    restMinutes: 0, restSeconds: 10,
    prepareMinutes: 0, prepareSeconds: 10
  };

  var modalConfig = {};
  var editingRoutineId = null;

  // ===== Circumference constant =====
  var CIRCUMFERENCE = 2 * Math.PI * 90; // ~565.49

  // ===== Init =====
  function init() {
    cacheDom();
    loadLastConfig();
    renderRoutines();
    setupMenu();
    bindEvents();
  }

  function cacheDom() {
    configView = document.getElementById('config-view');
    timerView = document.getElementById('timer-view');
    timerBg = document.getElementById('timer-bg');
    phaseLabel = document.getElementById('phase-label');
    countdownDigits = document.getElementById('countdown-digits');
    progressRing = document.getElementById('progress-ring');
    setCounter = document.getElementById('set-counter');
    btnPlayPause = document.getElementById('btn-play-pause');
    iconPause = document.getElementById('icon-pause');
    iconPlay = document.getElementById('icon-play');
    btnSkipBack = document.getElementById('btn-skip-back');
    btnSkipFwd = document.getElementById('btn-skip-fwd');
    btnLock = document.getElementById('btn-lock');
    iconUnlocked = document.getElementById('icon-unlocked');
    iconLocked = document.getElementById('icon-locked');
    btnExit = document.getElementById('btn-exit');
    lockOverlay = document.getElementById('lock-overlay');
    timerControls = document.getElementById('timer-controls');
    routinesGrid = document.getElementById('routines-grid');
    routinesEmpty = document.getElementById('routines-empty');
    routineModal = document.getElementById('routine-modal');
    modalTitle = document.getElementById('modal-title');

    setsDisplay = document.getElementById('sets-display');
    workMinDisplay = document.getElementById('work-min-display');
    workSecDisplay = document.getElementById('work-sec-display');
    restMinDisplay = document.getElementById('rest-min-display');
    restSecDisplay = document.getElementById('rest-sec-display');
    prepareMinDisplay = document.getElementById('prepare-min-display');
    prepareSecDisplay = document.getElementById('prepare-sec-display');

    modalSetsDisplay = document.getElementById('modal-sets-display');
    modalWorkMinDisplay = document.getElementById('modal-work-min-display');
    modalWorkSecDisplay = document.getElementById('modal-work-sec-display');
    modalRestMinDisplay = document.getElementById('modal-rest-min-display');
    modalRestSecDisplay = document.getElementById('modal-rest-sec-display');
    modalPrepareMinDisplay = document.getElementById('modal-prepare-min-display');
    modalPrepareSecDisplay = document.getElementById('modal-prepare-sec-display');

    btnModalCancel = document.getElementById('btn-modal-cancel');
    btnModalSave = document.getElementById('btn-modal-save');

    btnMenu = document.getElementById('btn-menu');
    menuBackdrop = document.getElementById('menu-backdrop');
    menuDrawer = document.getElementById('menu-drawer');
    btnMenuClose = document.getElementById('btn-menu-close');
    btnAddToHomescreen = document.getElementById('btn-add-to-homescreen');
  }

  // ===== Config Helpers =====
  function loadLastConfig() {
    var saved = exports.Storage.getLastConfig();
    if (saved) {
      config.sets = saved.sets || 3;
      config.workMinutes = saved.workMinutes || 0;
      config.workSeconds = saved.workSeconds || 30;
      config.restMinutes = saved.restMinutes || 0;
      config.restSeconds = saved.restSeconds || 10;
      config.prepareMinutes = saved.prepareMinutes || 0;
      config.prepareSeconds = saved.prepareSeconds || 10;
    }
    updateConfigDisplay();
  }

  function updateConfigDisplay() {
    setsDisplay.textContent = config.sets;
    workMinDisplay.textContent = config.workMinutes;
    workSecDisplay.textContent = pad(config.workSeconds);
    restMinDisplay.textContent = config.restMinutes;
    restSecDisplay.textContent = pad(config.restSeconds);
    prepareMinDisplay.textContent = config.prepareMinutes;
    prepareSecDisplay.textContent = pad(config.prepareSeconds);
  }

  function getConfigFromDOM(prefix) {
    var getEl = function(id) { return document.getElementById(id); };
    if (prefix === 'modal-') {
      return {
        sets: modalConfig.sets,
        workMinutes: modalConfig.workMinutes,
        workSeconds: modalConfig.workSeconds,
        restMinutes: modalConfig.restMinutes,
        restSeconds: modalConfig.restSeconds,
        prepareMinutes: modalConfig.prepareMinutes,
        prepareSeconds: modalConfig.prepareSeconds
      };
    }
    return {
      sets: config.sets,
      workMinutes: config.workMinutes,
      workSeconds: config.workSeconds,
      restMinutes: config.restMinutes,
      restSeconds: config.restSeconds,
      prepareMinutes: config.prepareMinutes,
      prepareSeconds: config.prepareSeconds
    };
  }

  function getQuickstartConfig() {
    return {
      sets: config.sets,
      workMinutes: config.workMinutes,
      workSeconds: config.workSeconds,
      restMinutes: config.restMinutes,
      restSeconds: config.restSeconds,
      prepareMinutes: config.prepareMinutes,
      prepareSeconds: config.prepareSeconds
    };
  }

  // ===== Stepper Logic =====
  function adjustConfig(target, action, isModal) {
    var cfg = isModal ? modalConfig : config;
    var amount = 1;
    // Shift key for ±10 adjustment on minutes, ±5 on seconds
    var shiftAmount = 10;

    switch (target) {
      case 'sets':
      case 'modal-sets':
        if (action === 'increment') cfg.sets = Math.min(99, cfg.sets + amount);
        else cfg.sets = Math.max(1, cfg.sets - amount);
        break;

      case 'work':
      case 'modal-work':
        if (action === 'increment') {
          cfg.workSeconds += 5;
          if (cfg.workSeconds >= 60) { cfg.workSeconds = 0; cfg.workMinutes++; }
          if (cfg.workMinutes > 99) { cfg.workMinutes = 99; cfg.workSeconds = 55; }
        } else {
          cfg.workSeconds -= 5;
          if (cfg.workSeconds < 0) { cfg.workSeconds = 55; cfg.workMinutes--; }
          if (cfg.workMinutes < 0) { cfg.workMinutes = 0; cfg.workSeconds = 0; }
        }
        break;

      case 'rest':
      case 'modal-rest':
        if (action === 'increment') {
          cfg.restSeconds += 5;
          if (cfg.restSeconds >= 60) { cfg.restSeconds = 0; cfg.restMinutes++; }
          if (cfg.restMinutes > 99) { cfg.restMinutes = 99; cfg.restSeconds = 55; }
        } else {
          cfg.restSeconds -= 5;
          if (cfg.restSeconds < 0) { cfg.restSeconds = 55; cfg.restMinutes--; }
          if (cfg.restMinutes < 0) { cfg.restMinutes = 0; cfg.restSeconds = 0; }
        }
        break;

      case 'prepare':
      case 'modal-prepare':
        if (action === 'increment') {
          cfg.prepareSeconds += 5;
          if (cfg.prepareSeconds >= 60) { cfg.prepareSeconds = 0; cfg.prepareMinutes++; }
          if (cfg.prepareMinutes > 99) { cfg.prepareMinutes = 99; cfg.prepareSeconds = 55; }
        } else {
          cfg.prepareSeconds -= 5;
          if (cfg.prepareSeconds < 0) { cfg.prepareSeconds = 55; cfg.prepareMinutes--; }
          if (cfg.prepareMinutes < 0) { cfg.prepareMinutes = 0; cfg.prepareSeconds = 0; }
        }
        break;
    }

    if (isModal) {
      updateModalDisplay();
    } else {
      updateConfigDisplay();
      saveCurrentConfig();
    }
  }

  function saveCurrentConfig() {
    exports.Storage.saveLastConfig(getQuickstartConfig());
  }

  // ===== Time Input Editing =====
  function startTimeEdit(displayEl, cfgKey, minDisplay, secDisplay, isModal) {
    if (displayEl.classList.contains('editing')) return;
    displayEl.classList.add('editing');

    var cfg = isModal ? modalConfig : config;
    var minKey = cfgKey + 'Minutes';
    var secKey = cfgKey + 'Seconds';

    // Replace spans with inputs
    minDisplay.innerHTML = '<input type="number" class="time-edit-input" value="' + cfg[minKey] + '" min="0" max="99" inputmode="numeric">';
    secDisplay.innerHTML = '<input type="number" class="time-edit-input" value="' + pad(cfg[secKey]) + '" min="0" max="59" inputmode="numeric">';

    var minInput = minDisplay.querySelector('input');
    var secInput = secDisplay.querySelector('input');

    minInput.focus();
    minInput.select();

    function commit() {
      var newMin = clamp(parseInt(minInput.value, 10) || 0, 0, 99);
      var newSec = clamp(parseInt(secInput.value, 10) || 0, 0, 59);
      cfg[minKey] = newMin;
      cfg[secKey] = newSec;

      // Restore display
      minDisplay.textContent = newMin;
      secDisplay.textContent = pad(newSec);
      displayEl.classList.remove('editing');

      if (isModal) {
        updateModalDisplay();
      } else {
        saveCurrentConfig();
      }
    }

    function cancel() {
      minDisplay.textContent = cfg[minKey];
      secDisplay.textContent = pad(cfg[secKey]);
      displayEl.classList.remove('editing');
    }

    displayEl.addEventListener('focusout', function() {
      setTimeout(function() {
        if (displayEl.classList.contains('editing') && !displayEl.contains(document.activeElement)) {
          commit();
        }
      }, 150);
    });

    function onKeydown(e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    }

    minInput.addEventListener('keydown', onKeydown);
    secInput.addEventListener('keydown', onKeydown);
  }

  // ===== Modal =====
  function openModal(routine) {
    editingRoutineId = routine ? routine.id : null;
    modalTitle.textContent = routine ? 'Edit Routine' : 'New Routine';
    document.getElementById('modal-name').value = routine ? routine.name : '';

    if (routine) {
      modalConfig = {
        sets: routine.sets,
        workMinutes: routine.workMinutes,
        workSeconds: routine.workSeconds,
        restMinutes: routine.restMinutes,
        restSeconds: routine.restSeconds,
        prepareMinutes: routine.prepareMinutes || 0,
        prepareSeconds: routine.prepareSeconds || 10
      };
    } else {
      modalConfig = {
        sets: config.sets,
        workMinutes: config.workMinutes,
        workSeconds: config.workSeconds,
        restMinutes: config.restMinutes,
        restSeconds: config.restSeconds,
        prepareMinutes: config.prepareMinutes,
        prepareSeconds: config.prepareSeconds
      };
    }
    updateModalDisplay();
    routineModal.classList.remove('hidden');
    document.getElementById('modal-name').focus();
  }

  function closeModal() {
    routineModal.classList.add('hidden');
    editingRoutineId = null;
  }

  function updateModalDisplay() {
    modalSetsDisplay.textContent = modalConfig.sets;
    modalWorkMinDisplay.textContent = modalConfig.workMinutes;
    modalWorkSecDisplay.textContent = pad(modalConfig.workSeconds);
    modalRestMinDisplay.textContent = modalConfig.restMinutes;
    modalRestSecDisplay.textContent = pad(modalConfig.restSeconds);
    modalPrepareMinDisplay.textContent = modalConfig.prepareMinutes;
    modalPrepareSecDisplay.textContent = pad(modalConfig.prepareSeconds);
  }

  function saveModal() {
    var name = document.getElementById('modal-name').value.trim();
    if (!name) {
      document.getElementById('modal-name').focus();
      return;
    }

    var routine = {
      id: editingRoutineId,
      name: name,
      sets: modalConfig.sets,
      workMinutes: modalConfig.workMinutes,
      workSeconds: modalConfig.workSeconds,
      restMinutes: modalConfig.restMinutes,
      restSeconds: modalConfig.restSeconds,
      prepareMinutes: modalConfig.prepareMinutes,
      prepareSeconds: modalConfig.prepareSeconds
    };

    exports.Storage.saveRoutine(routine);
    closeModal();
    renderRoutines();
  }

  // ===== Routines =====
  function renderRoutines() {
    var routines = exports.Storage.getRoutines();
    routinesGrid.innerHTML = '';

    if (routines.length === 0) {
      routinesEmpty.classList.remove('hidden');
      return;
    }

    routinesEmpty.classList.add('hidden');

    for (var i = 0; i < routines.length; i++) {
      routinesGrid.appendChild(createRoutineCard(routines[i]));
    }
  }

  function createRoutineCard(routine) {
    var card = document.createElement('div');
    card.className = 'routine-card';

    var totalSec = routine.prepareSeconds +
      (routine.sets * (routine.workMinutes * 60 + routine.workSeconds)) +
      ((routine.sets - 1) * (routine.restMinutes * 60 + routine.restSeconds));
    var durationStr = formatDuration(totalSec);

    var workSec = routine.workMinutes * 60 + routine.workSeconds;
    var restSec = routine.restMinutes * 60 + routine.restSeconds;

    card.innerHTML =
      '<div class="routine-card-header">' +
        '<span class="routine-card-name">' + escapeHtml(routine.name) + '</span>' +
      '</div>' +
      '<div class="routine-card-duration">' + durationStr + '</div>' +
      '<div class="routine-card-tags">' +
        '<span class="routine-tag sets">' + routine.sets + 'x</span>' +
        '<span class="routine-tag">Work ' + formatDurationShort(workSec) + '</span>' +
        (restSec > 0 ? '<span class="routine-tag">Rest ' + formatDurationShort(restSec) + '</span>' : '') +
      '</div>' +
      '<div class="routine-card-actions">' +
        '<button class="btn btn-secondary routine-edit" data-id="' + routine.id + '">Edit</button>' +
        '<button class="btn btn-danger routine-delete" data-id="' + routine.id + '">Delete</button>' +
        '<button class="btn btn-primary routine-start" data-id="' + routine.id + '">Start</button>' +
      '</div>';

    return card;
  }

  // ===== Timer View =====
  function showTimerView() {
    configView.classList.add('hidden');
    timerView.classList.remove('hidden');
    updateTimerDisplay();
  }

  function showConfigView() {
    timerView.classList.add('hidden');
    configView.classList.remove('hidden');
    updateConfigDisplay();
    renderRoutines();
    if (exports.Confetti) exports.Confetti.stop();
    var gif = document.getElementById('finish-gif');
    if (gif) gif.classList.remove('pop');
  }

  function updateTimerDisplay() {
    var st = exports.State.getState();
    if (!st) return;

    // Phase label & color
    var phaseClass = exports.State.getPhaseClass();
    timerBg.className = 'timer-bg ' + phaseClass;
    phaseLabel.textContent = getPhaseLabelText(st);
    phaseLabel.classList.remove('flash');

    // Countdown digits
    var remaining = st.phaseSecondsRemaining;
    if (remaining > 59) {
      var min = Math.floor(remaining / 60);
      var sec = remaining % 60;
      countdownDigits.textContent = min + ':' + pad(sec);
    } else {
      countdownDigits.textContent = remaining;
    }

    // Progress ring
    if (st.phaseSecondsTotal > 0) {
      var progress = remaining / st.phaseSecondsTotal;
      progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    } else {
      progressRing.style.strokeDashoffset = CIRCUMFERENCE;
    }
    progressRing.style.stroke = st.phase === 'paused'
      ? 'rgba(255,255,255,0.35)'
      : 'rgba(255,255,255,0.85)';

    // Set counter
    if (st.phase === 'prepare') {
      setCounter.textContent = 'Set 1 / ' + st.totalSets;
    } else if (st.phase === 'finished') {
      setCounter.textContent = 'Complete!';
    } else if (st.phase === 'paused') {
      setCounter.textContent = 'Set ' + st.currentSet + ' / ' + st.totalSets + ' (Paused)';
    } else {
      setCounter.textContent = 'Set ' + st.currentSet + ' / ' + st.totalSets;
    }

    // Play/pause icon
    if (st.isPaused) {
      iconPause.classList.add('hidden');
      iconPlay.classList.remove('hidden');
      btnPlayPause.setAttribute('aria-label', 'Resume');
    } else {
      iconPause.classList.remove('hidden');
      iconPlay.classList.add('hidden');
      btnPlayPause.setAttribute('aria-label', 'Pause');
    }

    // Lock icon
    if (st.isLocked) {
      iconUnlocked.classList.add('hidden');
      iconLocked.classList.remove('hidden');
      btnLock.setAttribute('aria-label', 'Unlock screen');
      lockOverlay.classList.remove('hidden');
      timerControls.classList.add('locked');
    } else {
      iconUnlocked.classList.remove('hidden');
      iconLocked.classList.add('hidden');
      btnLock.setAttribute('aria-label', 'Lock screen');
      lockOverlay.classList.add('hidden');
      timerControls.classList.remove('locked');
    }
  }

  function flashPhaseLabel() {
    phaseLabel.classList.add('flash');
    setTimeout(function() { phaseLabel.classList.remove('flash'); }, 900);
  }

  function getPhaseLabelText(st) {
    if (st.phase === 'prepare') return 'Get Ready';
    if (st.phase === 'work') return 'Work';
    if (st.phase === 'rest') return 'Rest';
    if (st.phase === 'paused') return 'Paused';
    if (st.phase === 'finished') return 'Done!';
    return '';
  }

  // ===== Exit =====
  function exitTimer() {
    exports.State.transition('exit');
    exports.Timer.stop();
    showConfigView();
  }

  // ===== Swipe Gestures =====
  var touchStartX = 0;
  var touchStartY = 0;

  function handleTouchStart(e) {
    if (e.target.closest('.timer-controls')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (e.target.closest('.timer-controls')) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      var State = exports.State;
      if (dx > 0) {
        State.transition('skip-backward');
      } else {
        State.transition('skip-forward');
      }
      updateTimerDisplay();
      flashPhaseLabel();
    }
  }

  // ===== Event Binding =====
  function bindEvents() {
    // --- Stepper buttons (quickstart panel) ---
    document.querySelector('#config-view').addEventListener('click', function(e) {
      var btn = e.target.closest('.stepper-btn');
      if (!btn) return;
      var action = btn.dataset.action;
      var target = btn.dataset.target;
      if (action && target) {
        adjustConfig(target, action, false);
      }
    });

    // --- Stepper buttons (modal) ---
    routineModal.addEventListener('click', function(e) {
      var btn = e.target.closest('.stepper-btn');
      if (!btn) return;
      var action = btn.dataset.action;
      var target = btn.dataset.target;
      if (action && target) {
        adjustConfig(target, action, true);
      }
    });

    // --- Time display click for editing ---
    document.querySelector('#config-view').addEventListener('click', function(e) {
      var display = e.target.closest('.time-display');
      if (!display) return;
      var target = display.dataset.target;
      if (!target) return;
      var isModal = false;

      var minEl, secEl;
      switch (target) {
        case 'work':
          minEl = workMinDisplay; secEl = workSecDisplay; break;
        case 'rest':
          minEl = restMinDisplay; secEl = restSecDisplay; break;
        case 'prepare':
          minEl = prepareMinDisplay; secEl = prepareSecDisplay; break;
        default: return;
      }
      startTimeEdit(display, target, minEl, secEl, false);
    });

    routineModal.addEventListener('click', function(e) {
      var display = e.target.closest('.time-display');
      if (!display) return;
      var target = display.dataset.target;
      if (!target) return;
      var minEl, secEl;
      switch (target) {
        case 'modal-work':
          minEl = modalWorkMinDisplay; secEl = modalWorkSecDisplay; break;
        case 'modal-rest':
          minEl = modalRestMinDisplay; secEl = modalRestSecDisplay; break;
        case 'modal-prepare':
          minEl = modalPrepareMinDisplay; secEl = modalPrepareSecDisplay; break;
        default: return;
      }
      startTimeEdit(display, target.replace('modal-', ''), minEl, secEl, true);
    });

    // --- Start button ---
    document.getElementById('btn-start').addEventListener('click', function() {
      var totalWork = config.workMinutes * 60 + config.workSeconds;
      if (totalWork === 0) return;

      exports.State.init(getQuickstartConfig());
      exports.Audio.init();
      exports.State.transition('start');
      exports.Timer.start();
      showTimerView();
    });

    // --- Save Routine button ---
    document.getElementById('btn-save-routine').addEventListener('click', function() {
      openModal(null);
    });

    // --- Add routine button ---
    document.getElementById('btn-add-routine').addEventListener('click', function() {
      openModal(null);
    });

    // --- Routine card actions (delegation) ---
    routinesGrid.addEventListener('click', function(e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var id = btn.dataset.id;
      if (!id) return;

      if (btn.classList.contains('routine-edit')) {
        var routines = exports.Storage.getRoutines();
        for (var i = 0; i < routines.length; i++) {
          if (routines[i].id === id) { openModal(routines[i]); break; }
        }
      } else if (btn.classList.contains('routine-delete')) {
        exports.Storage.deleteRoutine(id);
        renderRoutines();
      } else if (btn.classList.contains('routine-start')) {
        var routines = exports.Storage.getRoutines();
        for (var j = 0; j < routines.length; j++) {
          if (routines[j].id === id) {
            startRoutine(routines[j]);
            break;
          }
        }
      }
    });

    // --- Modal buttons ---
    btnModalCancel.addEventListener('click', closeModal);
    btnModalSave.addEventListener('click', saveModal);
    routineModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    // --- Modal keyboard ---
    document.getElementById('modal-name').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); saveModal(); }
      if (e.key === 'Escape') { closeModal(); }
    });

    // --- Timer controls ---
    btnPlayPause.addEventListener('click', function() {
      var State = exports.State;
      var st = State.getState();
      if (st.isPaused) {
        State.transition('resume');
        exports.Timer.start();
      } else {
        State.transition('pause');
        exports.Timer.stop();
      }
      updateTimerDisplay();
    });

    btnSkipBack.addEventListener('click', function() {
      if (exports.State.getState().isLocked) return;
      exports.State.transition('skip-backward');
      updateTimerDisplay();
      flashPhaseLabel();
    });

    btnSkipFwd.addEventListener('click', function() {
      if (exports.State.getState().isLocked) return;
      var State = exports.State;
      var wasActive = State.getState().phase !== 'finished';
      State.transition('skip-forward');
      updateTimerDisplay();
      flashPhaseLabel();
      var st = State.getState();
      if (wasActive && st.phase === 'finished') {
        exports.Timer.stop();
        // Brief delay before returning to config
        setTimeout(function() { showConfigView(); }, 2000);
      }
    });

    btnLock.addEventListener('click', function() {
      exports.State.transition('toggle-lock');
      updateTimerDisplay();
    });

    // --- Exit ---
    btnExit.addEventListener('click', exitTimer);

    // --- Swipe gestures on timer ---
    timerBg.addEventListener('touchstart', handleTouchStart, { passive: true });
    timerBg.addEventListener('touchend', handleTouchEnd, { passive: true });

    // --- Keyboard shortcuts ---
    document.addEventListener('keydown', function(e) {
      var st = exports.State.getState();
      if (!st || st.view !== 'timer') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          btnPlayPause.click();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!st.isLocked) btnSkipBack.click();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!st.isLocked) btnSkipFwd.click();
          break;
        case 'Escape':
          e.preventDefault();
          if (st.isPaused) {
            exports.State.transition('exit');
            exports.Timer.stop();
            showConfigView();
          }
          break;
        case 'l':
          if (!e.ctrlKey && !e.metaKey) {
            btnLock.click();
          }
          break;
      }
    });

    // --- Menu ---
    btnMenu.addEventListener('click', openMenu);
    btnMenuClose.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);
    btnAddToHomescreen.addEventListener('click', function() {
      closeMenu();
      showInstallHelp();
    });

    // --- Wake Lock ---
    exports.State.on('start', function() {
      requestWakeLock();
    });

    exports.State.on('exit', function() {
      releaseWakeLock();
    });
  }

  // ===== Start from routine =====
  function startRoutine(routine) {
    var cfg = {
      sets: routine.sets,
      workMinutes: routine.workMinutes,
      workSeconds: routine.workSeconds,
      restMinutes: routine.restMinutes,
      restSeconds: routine.restSeconds,
      prepareMinutes: routine.prepareMinutes || 0,
      prepareSeconds: routine.prepareSeconds || 10
    };

    var totalWork = cfg.workMinutes * 60 + cfg.workSeconds;
    if (totalWork === 0) return;

    exports.State.init(cfg);
    exports.Audio.init();
    exports.State.transition('start');
    exports.Timer.start();
    showTimerView();
  }

  // ===== Wake Lock =====
  var wakeLock = null;

  function requestWakeLock() {
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(function(sentinel) {
        wakeLock = sentinel;
        wakeLock.addEventListener('release', function() {
          wakeLock = null;
        });
      }).catch(function() {
        // Wake lock not available or denied
      });
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(function() {});
      wakeLock = null;
    }
  }

  // ===== Menu =====
  function setupMenu() {
    // Hide hamburger if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches
        || navigator.standalone) {
      btnMenu.classList.add('hidden');
    }
  }

  function openMenu() {
    menuDrawer.classList.remove('closed');
    menuBackdrop.classList.remove('closed');
  }

  function closeMenu() {
    menuDrawer.classList.add('closed');
    menuBackdrop.classList.add('closed');
  }

  function showInstallHelp() {
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/.test(ua);
    var isAndroid = /Android/.test(ua);
    var msg;

    if (isIOS) {
      msg = 'Tap the Share button then "Add to Home Screen"';
    } else if (isAndroid) {
      msg = 'Tap \u22EE \u2192 "Add to Home Screen" in your browser menu';
    } else {
      msg = 'Bookmark this page (Ctrl+D) for quick access';
    }

    alert(msg);
  }

  // ===== Helpers =====
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDuration(totalSec) {
    if (totalSec < 60) return totalSec + 's';
    if (totalSec < 3600) {
      var m = Math.floor(totalSec / 60);
      var s = totalSec % 60;
      return s > 0 ? m + 'm ' + s + 's' : m + 'm';
    }
    var h = Math.floor(totalSec / 3600);
    var rem = totalSec % 3600;
    var m = Math.floor(rem / 60);
    return m > 0 ? h + 'h ' + m + 'm' : h + 'h';
  }

  function formatDurationShort(totalSec) {
    if (totalSec < 60) return totalSec + 's';
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return s > 0 ? m + ':' + pad(s) : m + 'm';
  }

  // ===== State change listener =====
  function wire(stateModule) {
    stateModule.on('phasechange', function() {
      updateTimerDisplay();
      flashPhaseLabel();
    });

    stateModule.on('tick', function() {
      updateTimerDisplay();
    });

    stateModule.on('lockchange', function() {
      updateTimerDisplay();
    });

    stateModule.on('exit', function() {
      showConfigView();
    });

    stateModule.on('finish', function() {
      exports.Timer.stop();
      updateTimerDisplay();
      exports.Confetti.fire();
      var gif = document.getElementById('finish-gif');
      if (gif) gif.classList.add('pop');
    });
  }

  exports.UI = {
    init: init,
    updateTimerDisplay: updateTimerDisplay,
    showTimerView: showTimerView,
    showConfigView: showConfigView,
    getQuickstartConfig: getQuickstartConfig,
    wire: wire,
    renderRoutines: renderRoutines
  };

})(window.TimerApp);
