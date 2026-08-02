window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var MAX_CHUNK_BYTES = 1800;

  function stripRoutine(r) {
    return {
      name: r.name,
      sets: r.sets,
      workMinutes: r.workMinutes,
      workSeconds: r.workSeconds,
      restMinutes: r.restMinutes,
      restSeconds: r.restSeconds,
      prepareMinutes: r.prepareMinutes || 0,
      prepareSeconds: r.prepareSeconds || 10
    };
  }

  function getRoutines() {
    var routines = exports.Storage.getRoutines();
    // Strip id and order — not needed for import
    return routines.map(stripRoutine);
  }

  // ===== Export =====

  function openExport() {
    var routines = getRoutines();
    if (routines.length === 0) {
      alert(exports.I18n.t('noRoutinesToExport'));
      return;
    }

    var json = JSON.stringify(routines);
    var chunks;
    if (json.length <= MAX_CHUNK_BYTES) {
      chunks = [{ i: 0, n: 1, d: routines }];
    } else {
      chunks = chunkRoutines(routines, MAX_CHUNK_BYTES);
    }

    showExportModal(chunks);
  }

  function chunkRoutines(routines, maxBytes) {
    var chunks = [];
    var current = [];
    for (var i = 0; i < routines.length; i++) {
      var test = current.concat([routines[i]]);
      var testJson = JSON.stringify({ i: 0, n: 1, d: test });
      if (testJson.length <= maxBytes) {
        current.push(routines[i]);
      } else {
        if (current.length === 0) {
          // Single routine too large — put it in its own chunk anyway
          current.push(routines[i]);
        } else {
          i--; // retry this routine in the next chunk
        }
        chunks.push(current);
        current = [];
      }
    }
    if (current.length > 0) chunks.push(current);

    return chunks.map(function(chunk, idx) {
      return { i: idx, n: chunks.length, d: chunk };
    });
  }

  var exportTimer = null;

  function showExportModal(chunks) {
    var modal = document.getElementById('export-modal');
    var container = document.getElementById('qr-export-container');
    var progress = document.getElementById('qr-export-progress');
    var instruction = document.getElementById('qr-export-instruction');
    modal.classList.remove('hidden');

    var total = chunks.length;
    var currentIdx = 0;

    function renderQr() {
      var chunk = chunks[currentIdx];
      container.innerHTML = '';
      try {
        new QRCode(container, {
          text: JSON.stringify(chunk),
          width: 280,
          height: 280,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (e) {
        container.textContent = 'QR error: ' + e.message;
      }

      if (total > 1) {
        progress.textContent = (currentIdx + 1) + ' / ' + total;
        instruction.textContent = exports.I18n.t('qrMultiInstruction');
      } else {
        progress.textContent = '';
        instruction.textContent = exports.I18n.t('qrSingleInstruction');
      }
    }

    renderQr();

    if (total > 1) {
      exportTimer = setInterval(function() {
        currentIdx = (currentIdx + 1) % total;
        renderQr();
      }, 2000);
    }

    // Close handler
    var onClose = function() {
      if (exportTimer) { clearInterval(exportTimer); exportTimer = null; }
      modal.classList.add('hidden');
    };

    document.getElementById('btn-close-export').onclick = onClose;
    modal.querySelector('.modal-backdrop').onclick = onClose;
  }

  // ===== Import =====

  var html5QrCode = null;
  var importChunks = [];
  var importTotal = -1;

  function openImport() {
    if (typeof Html5Qrcode === 'undefined') {
      alert('QR scanner not available. Please check your connection.');
      return;
    }

    var modal = document.getElementById('import-modal');
    modal.classList.remove('hidden');

    importChunks = [];
    importTotal = -1;
    document.getElementById('import-progress').textContent = '';
    document.getElementById('import-actions').classList.add('hidden');

    // Clean up any previous scanner instance
    if (html5QrCode) {
      html5QrCode.stop().then(function() {
        html5QrCode.clear();
      }).catch(function() {});
    }

    var readerEl = document.getElementById('qr-reader');
    readerEl.innerHTML = '';
    html5QrCode = new Html5Qrcode('qr-reader');

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      function() {} // ignore scan errors
    ).catch(function(err) {
      readerEl.textContent = 'Camera error: ' + err.message;
    });
  }

  function onScanSuccess(decodedText) {
    var data;
    try {
      data = JSON.parse(decodedText);
    } catch (e) {
      return; // not our QR code, ignore
    }

    // Single-chunk payload: plain array of routines
    if (Array.isArray(data)) {
      importChunks = [{ i: 0, n: 1, d: data }];
      importTotal = 1;
      finishImport();
      return;
    }

    // Multi-chunk payload
    if (data && typeof data.i === 'number' && Array.isArray(data.d)) {
      if (importTotal === -1) importTotal = data.n;

      // Avoid duplicates
      var exists = importChunks.some(function(c) { return c.i === data.i; });
      if (!exists) {
        importChunks.push(data);
      }

      var prog = document.getElementById('import-progress');
      prog.textContent = exports.I18n.t('importReceived')
        .replace('{cur}', importChunks.length)
        .replace('{total}', importTotal);

      if (importChunks.length >= importTotal) {
        finishImport();
      }
    }
  }

  function finishImport() {
    if (html5QrCode) {
      html5QrCode.stop().then(function() {
        html5QrCode.clear();
      }).catch(function() {});
    }

    // Assemble routines in order
    var allRoutines = [];
    importChunks.sort(function(a, b) { return a.i - b.i; });
    for (var i = 0; i < importChunks.length; i++) {
      allRoutines = allRoutines.concat(importChunks[i].d);
    }

    document.getElementById('qr-reader').innerHTML = '';
    document.getElementById('import-progress').textContent =
      exports.I18n.t('importReady').replace('{count}', allRoutines.length);
    document.getElementById('import-actions').classList.remove('hidden');

    document.getElementById('btn-import-merge').onclick = function() {
      mergeRoutines(allRoutines);
      closeImport();
    };

    document.getElementById('btn-import-cancel').onclick = function() {
      closeImport();
    };
  }

  function mergeRoutines(newRoutines) {
    var existing = exports.Storage.getRoutines();
    var names = {};
    for (var i = 0; i < existing.length; i++) {
      names[existing[i].name] = true;
    }

    for (var j = 0; j < newRoutines.length; j++) {
      var r = newRoutines[j];
      // Strip any id to avoid collisions
      r.id = undefined;
      // Handle duplicate names
      var base = r.name;
      var suffix = 2;
      while (names[r.name]) {
        r.name = base + ' (' + suffix + ')';
        suffix++;
      }
      names[r.name] = true;
      exports.Storage.saveRoutine(r);
    }

    if (exports.UI && exports.UI.renderRoutines) {
      exports.UI.renderRoutines();
    }
  }

  function closeImport() {
    if (html5QrCode) {
      html5QrCode.stop().then(function() {
        html5QrCode.clear();
      }).catch(function() {});
      html5QrCode = null;
    }
    var modal = document.getElementById('import-modal');
    if (modal) modal.classList.add('hidden');
    importChunks = [];
    importTotal = -1;
  }

  // Wire up menu buttons
  function wireMenu() {
    var btnExport = document.getElementById('btn-export-routines');
    var btnImport = document.getElementById('btn-import-routines');
    if (btnExport) btnExport.addEventListener('click', openExport);
    if (btnImport) btnImport.addEventListener('click', openImport);

    // Close import modal on backdrop click
    var importModal = document.getElementById('import-modal');
    if (importModal) {
      importModal.querySelector('.modal-backdrop').addEventListener('click', closeImport);
    }
  }

  exports.ExportImport = {
    openExport: openExport,
    openImport: openImport,
    wireMenu: wireMenu
  };

})(window.TimerApp);
