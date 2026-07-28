window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var intervalId = null;
  var expectedTick = 0;
  var tickInterval = 1000;

  function start() {
    stop();
    expectedTick = Date.now() + tickInterval;
    scheduleTick();
  }

  function stop() {
    if (intervalId !== null) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  }

  /**
   * Self-correcting timer using setTimeout chaining.
   * Compensates for drift and browser throttling.
   */
  function scheduleTick() {
    var now = Date.now();
    var drift = now - expectedTick;

    // If we drifted more than 2 seconds (e.g. tab was hidden), catch up
    if (drift > 2000) {
      expectedTick = now + tickInterval;
    } else if (drift < -tickInterval) {
      expectedTick = now + tickInterval;
    }

    var delay = Math.max(0, expectedTick - now);

    intervalId = setTimeout(function() {
      var State = exports.State;
      var shouldContinue = State.transition('tick');
      if (shouldContinue) {
        expectedTick += tickInterval;
        scheduleTick();
      } else {
        stop();
      }
    }, delay);
  }

  exports.Timer = {
    start: start,
    stop: stop
  };

})(window.TimerApp);
