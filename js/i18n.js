window.TimerApp = window.TimerApp || {};

(function(exports) {
  'use strict';

  var STORAGE_KEY = 'app-language';
  var currentLang = null;
  var changeListeners = [];

  var translations = {
    en: {
      appTitle: 'EZ Interval Timer',
      quickstart: 'Quickstart',
      yourRoutines: 'Your Routines',
      sets: 'Sets',
      work: 'Work',
      rest: 'Rest',
      getReady: 'Get Ready',
      saveRoutine: 'Save Routine',
      start: 'Start',
      edit: 'Edit',
      delete: 'Delete',
      exit: 'Exit',
      cancel: 'Cancel',
      save: 'Save',
      newRoutine: 'New Routine',
      editRoutine: 'Edit Routine',
      name: 'Name',
      routineName: 'Routine name',
      menu: 'Menu',
      language: 'Language',
      addToHomeScreen: 'Add to Home Screen',
      githubRepo: 'GitHub Repo',
      contact: 'Contact',
      noRoutines: 'No routines yet. Use the quickstart panel above to create one.',
      menuAria: 'Menu',
      closeMenuAria: 'Close menu',
      addRoutineAria: 'Add new routine',
      decreaseSets: 'Decrease sets',
      increaseSets: 'Increase sets',
      decreaseWork: 'Decrease work time',
      increaseWork: 'Increase work time',
      decreaseRest: 'Decrease rest time',
      increaseRest: 'Increase rest time',
      decreasePrepare: 'Decrease prepare time',
      increasePrepare: 'Increase prepare time',
      skipBackAria: 'Skip backward',
      skipFwdAria: 'Skip forward',
      lockAria: 'Lock screen',
      unlockAria: 'Unlock screen',
      pauseAria: 'Pause',
      resumeAria: 'Resume',
      phaseGetReady: 'Get Ready',
      phaseWork: 'Work',
      phaseRest: 'Rest',
      phasePaused: 'Paused',
      phaseDone: 'Done!',
      setCounter: 'Set {current} / {total}',
      setCounterComplete: 'Complete!',
      setCounterPaused: 'Set {current} / {total} (Paused)',
      audioPrepare: 'Get Ready',
      audioWork: 'Work',
      audioRest: 'Rest',
      audioFinished: 'Workout complete',
      installIOS: 'Tap the Share button then "Add to Home Screen"',
      installAndroid: 'Tap \u22EE \u2192 "Add to Home Screen" in your browser menu',
      installDesktop: 'Bookmark this page (Ctrl+D) for quick access',
      durationSec: '{s}s',
      durationMin: '{m}m',
      durationMinSec: '{m}m {s}s',
      durationHour: '{h}h',
      durationHourMin: '{h}h {m}m',
      durationShort: '{m}:{s}',
      durationShortMin: '{m}m',
      langEn: 'English',
      langZhHK: '廣東話',
      langZhTW: '台灣中文',
      langZhCN: '简体中文',
      langJa: '日本語',
      selectLanguage: 'Language'
    },
    'zh-HK': {
      appTitle: 'EZ 計時器',
      quickstart: '快速開始',
      yourRoutines: '你的模式',
      sets: '組數',
      work: '運動',
      rest: '休息',
      getReady: '準備',
      saveRoutine: '儲存模式',
      start: '開始',
      edit: '編輯',
      delete: '刪除',
      exit: '離開',
      cancel: '取消',
      save: '儲存',
      newRoutine: '新增模式',
      editRoutine: '編輯模式',
      name: '名稱',
      routineName: '模式名稱',
      menu: '選單',
      language: '語言',
      addToHomeScreen: '加到主畫面',
      githubRepo: 'GitHub 存放庫',
      contact: '聯絡',
      noRoutines: '未有模式。請用上面嘅快速開始面板建立一個。',
      menuAria: '選單',
      closeMenuAria: '關閉選單',
      addRoutineAria: '新增模式',
      decreaseSets: '減少組數',
      increaseSets: '增加組數',
      decreaseWork: '減少運動時間',
      increaseWork: '增加運動時間',
      decreaseRest: '減少休息時間',
      increaseRest: '增加休息時間',
      decreasePrepare: '減少準備時間',
      increasePrepare: '增加準備時間',
      skipBackAria: '跳返上一個',
      skipFwdAria: '跳去下一個',
      lockAria: '鎖定螢幕',
      unlockAria: '解鎖螢幕',
      pauseAria: '暫停',
      resumeAria: '繼續',
      phaseGetReady: '準備',
      phaseWork: '運動',
      phaseRest: '休息',
      phasePaused: '已暫停',
      phaseDone: '搞掂！',
      setCounter: '第 {current} / {total} 組',
      setCounterComplete: '搞掂晒！',
      setCounterPaused: '第 {current} / {total} 組 (已暫停)',
      audioPrepare: '準備',
      audioWork: '做運動',
      audioRest: '休息',
      audioFinished: '運動完成',
      installIOS: '撳分享掣然後揀「加到主畫面」',
      installAndroid: '撳 ⋮ →「加到主畫面」',
      installDesktop: '將呢頁加入書籤 (Ctrl+D) 就可以快速開啟',
      durationSec: '{s}秒',
      durationMin: '{m}分鐘',
      durationMinSec: '{m}分{s}秒',
      durationHour: '{h}小時',
      durationHourMin: '{h}小時{m}分鐘',
      durationShort: '{m}:{s}',
      durationShortMin: '{m}分鐘',
      langEn: 'English',
      langZhHK: '廣東話',
      langZhTW: '台灣中文',
      langZhCN: '简体中文',
      langJa: '日本語',
      selectLanguage: '語言'
    },
    'zh-TW': {
      appTitle: 'EZ 計時器',
      quickstart: '快速開始',
      yourRoutines: '你的模式',
      sets: '組數',
      work: '運動',
      rest: '休息',
      getReady: '準備',
      saveRoutine: '儲存模式',
      start: '開始',
      edit: '編輯',
      delete: '刪除',
      exit: '離開',
      cancel: '取消',
      save: '儲存',
      newRoutine: '新增模式',
      editRoutine: '編輯模式',
      name: '名稱',
      routineName: '模式名稱',
      menu: '選單',
      language: '語言',
      addToHomeScreen: '加到主畫面',
      githubRepo: 'GitHub 存放庫',
      contact: '聯絡',
      noRoutines: '尚無模式。請使用上方的快速開始面板建立一個。',
      menuAria: '選單',
      closeMenuAria: '關閉選單',
      addRoutineAria: '新增模式',
      decreaseSets: '減少組數',
      increaseSets: '增加組數',
      decreaseWork: '減少運動時間',
      increaseWork: '增加運動時間',
      decreaseRest: '減少休息時間',
      increaseRest: '增加休息時間',
      decreasePrepare: '減少準備時間',
      increasePrepare: '增加準備時間',
      skipBackAria: '跳回上一個',
      skipFwdAria: '跳往下一個',
      lockAria: '鎖定螢幕',
      unlockAria: '解鎖螢幕',
      pauseAria: '暫停',
      resumeAria: '繼續',
      phaseGetReady: '準備',
      phaseWork: '運動',
      phaseRest: '休息',
      phasePaused: '已暫停',
      phaseDone: '完成！',
      setCounter: '第 {current} / {total} 組',
      setCounterComplete: '全部完成！',
      setCounterPaused: '第 {current} / {total} 組 (已暫停)',
      audioPrepare: '準備',
      audioWork: '開始運動',
      audioRest: '休息一下',
      audioFinished: '運動完成',
      installIOS: '點按分享按鈕然後選擇「加到主畫面」',
      installAndroid: '點按 ⋮ →「加到主畫面」',
      installDesktop: '將此頁面加入書籤 (Ctrl+D) 即可快速開啟',
      durationSec: '{s} 秒',
      durationMin: '{m} 分鐘',
      durationMinSec: '{m} 分 {s} 秒',
      durationHour: '{h} 小時',
      durationHourMin: '{h} 小時 {m} 分鐘',
      durationShort: '{m}:{s}',
      durationShortMin: '{m} 分鐘',
      langEn: 'English',
      langZhHK: '廣東話',
      langZhTW: '台灣中文',
      langZhCN: '简体中文',
      langJa: '日本語',
      selectLanguage: '語言'
    },
    'zh-CN': {
      appTitle: 'EZ 计时器',
      quickstart: '快速开始',
      yourRoutines: '你的模式',
      sets: '组数',
      work: '运动',
      rest: '休息',
      getReady: '准备',
      saveRoutine: '保存模式',
      start: '开始',
      edit: '编辑',
      delete: '删除',
      exit: '退出',
      cancel: '取消',
      save: '保存',
      newRoutine: '新增模式',
      editRoutine: '编辑模式',
      name: '名称',
      routineName: '模式名称',
      menu: '菜单',
      language: '语言',
      addToHomeScreen: '添加到主屏幕',
      githubRepo: 'GitHub 仓库',
      contact: '联系我们',
      noRoutines: '暂无模式。请使用上方的快速开始面板创建一个。',
      menuAria: '菜单',
      closeMenuAria: '关闭菜单',
      addRoutineAria: '新增模式',
      decreaseSets: '减少组数',
      increaseSets: '增加组数',
      decreaseWork: '减少运动时间',
      increaseWork: '增加运动时间',
      decreaseRest: '减少休息时间',
      increaseRest: '增加休息时间',
      decreasePrepare: '减少准备时间',
      increasePrepare: '增加准备时间',
      skipBackAria: '跳回上一个',
      skipFwdAria: '跳到下一个',
      lockAria: '锁定屏幕',
      unlockAria: '解锁屏幕',
      pauseAria: '暂停',
      resumeAria: '继续',
      phaseGetReady: '准备',
      phaseWork: '运动',
      phaseRest: '休息',
      phasePaused: '已暂停',
      phaseDone: '完成！',
      setCounter: '第 {current} / {total} 组',
      setCounterComplete: '全部完成！',
      setCounterPaused: '第 {current} / {total} 组 (已暂停)',
      audioPrepare: '准备',
      audioWork: '开始运动',
      audioRest: '休息一下',
      audioFinished: '运动完成',
      installIOS: '点击分享按钮，然后选择「添加到主屏幕」',
      installAndroid: '点击 ⋮ →「添加到主屏幕」',
      installDesktop: '将此页面加入书签 (Ctrl+D) 即可快速打开',
      durationSec: '{s} 秒',
      durationMin: '{m} 分钟',
      durationMinSec: '{m} 分 {s} 秒',
      durationHour: '{h} 小时',
      durationHourMin: '{h} 小时 {m} 分钟',
      durationShort: '{m}:{s}',
      durationShortMin: '{m} 分钟',
      langEn: 'English',
      langZhHK: '廣東話',
      langZhTW: '台灣中文',
      langZhCN: '简体中文',
      langJa: '日本語',
      selectLanguage: '语言'
    },
    ja: {
      appTitle: 'EZ インターバルタイマー',
      quickstart: 'クイックスタート',
      yourRoutines: 'ルーティン',
      sets: 'セット数',
      work: '運動',
      rest: '休憩',
      getReady: '準備',
      saveRoutine: 'ルーティンを保存',
      start: 'スタート',
      edit: '編集',
      delete: '削除',
      exit: '終了',
      cancel: 'キャンセル',
      save: '保存',
      newRoutine: '新規ルーティン',
      editRoutine: 'ルーティンを編集',
      name: '名前',
      routineName: 'ルーティン名',
      menu: 'メニュー',
      language: '言語',
      addToHomeScreen: 'ホーム画面に追加',
      githubRepo: 'GitHub リポジトリ',
      contact: 'お問い合わせ',
      noRoutines: 'ルーティンがありません。上のクイックスタートパネルで作成してください。',
      menuAria: 'メニュー',
      closeMenuAria: 'メニューを閉じる',
      addRoutineAria: '新規ルーティンを追加',
      decreaseSets: 'セット数を減らす',
      increaseSets: 'セット数を増やす',
      decreaseWork: '運動時間を減らす',
      increaseWork: '運動時間を増やす',
      decreaseRest: '休憩時間を減らす',
      increaseRest: '休憩時間を増やす',
      decreasePrepare: '準備時間を減らす',
      increasePrepare: '準備時間を増やす',
      skipBackAria: '前に戻る',
      skipFwdAria: '次に進む',
      lockAria: '画面をロック',
      unlockAria: 'ロックを解除',
      pauseAria: '一時停止',
      resumeAria: '再開',
      phaseGetReady: '準備',
      phaseWork: '運動',
      phaseRest: '休憩',
      phasePaused: '一時停止中',
      phaseDone: '完了！',
      setCounter: 'セット {current} / {total}',
      setCounterComplete: '完了！',
      setCounterPaused: 'セット {current} / {total} (一時停止中)',
      audioPrepare: '準備',
      audioWork: '運動しましょう',
      audioRest: '休みましょう',
      audioFinished: 'ワークアウト完了',
      installIOS: '共有ボタンをタップして「ホーム画面に追加」',
      installAndroid: '⋮ →「ホーム画面に追加」をタップ',
      installDesktop: 'このページをブックマーク (Ctrl+D) してください',
      durationSec: '{s}秒',
      durationMin: '{m}分',
      durationMinSec: '{m}分{s}秒',
      durationHour: '{h}時間',
      durationHourMin: '{h}時間{m}分',
      durationShort: '{m}:{s}',
      durationShortMin: '{m}分',
      langEn: 'English',
      langZhHK: '廣東話',
      langZhTW: '台灣中文',
      langZhCN: '简体中文',
      langJa: '日本語',
      selectLanguage: '言語'
    }
  };

  function getLanguage() {
    if (currentLang) return currentLang;
    try {
      currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      currentLang = 'en';
    }
    return currentLang;
  }

  function setLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    for (var i = 0; i < changeListeners.length; i++) {
      changeListeners[i](lang);
    }
  }

  function t(key, vars) {
    var lang = getLanguage();
    var dict = translations[lang] || translations['en'];
    var str = dict[key];
    if (str === undefined) {
      str = (translations['en'][key] !== undefined) ? translations['en'][key] : key;
    }
    if (vars) {
      for (var k in vars) {
        if (vars.hasOwnProperty(k)) {
          str = str.replace('{' + k + '}', vars[k]);
        }
      }
    }
    return str;
  }

  function onChange(fn) {
    changeListeners.push(fn);
  }

  function updatePageLanguage() {
    var lang = getLanguage();
    document.documentElement.lang = lang;
    document.title = t('appTitle');

    // Text content
    var textEls = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textEls.length; i++) {
      textEls[i].textContent = t(textEls[i].getAttribute('data-i18n'));
    }

    // Placeholder
    var placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholderEls.length; j++) {
      placeholderEls[j].placeholder = t(placeholderEls[j].getAttribute('data-i18n-placeholder'));
    }

    // aria-label
    var ariaEls = document.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ariaEls.length; k++) {
      ariaEls[k].setAttribute('aria-label', t(ariaEls[k].getAttribute('data-i18n-aria')));
    }
  }

  exports.I18n = {
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    t: t,
    onChange: onChange,
    updatePageLanguage: updatePageLanguage
  };

})(window.TimerApp);
