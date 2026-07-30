window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  function init() {
    // Initialize state machine with default config
    exports.State.init(exports.UI.getQuickstartConfig());

    // Wire audio to state events
    exports.Audio.wire(exports.State);

    // Wire UI to state events
    exports.UI.wire(exports.State);

    // Initialize UI (renders routines, binds events, loads saved config)
    exports.UI.init();

    // Initialize audio context on first user interaction
    document.addEventListener('click', function initAudio() {
      exports.Audio.init();
    }, { once: true });
  }

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: '/ez-interval-timer/' });
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window.TimerApp);
