/**
 * netease-meting.js —— 替代 MetingJS
 *
 * 公共 Meting API（api.i-meto.com）已失效，本脚本改为读取构建期生成的
 * /js/music-db.js（scripts/netease-music.js 产出），音频走网易云 outer/url 直链。
 * 保留 MetingJS 的 DOM 约定（.aplayer + data-*），Butterfly 的 pjax 回调无需改动。
 */
(function () {
  'use strict';

  var aplayers = window.aplayers || [];
  window.aplayers = aplayers;

  var DEFAULTS = {
    container: null,
    audio: [],
    mini: null,
    fixed: null,
    autoplay: false,
    mutex: true,
    lrcType: 3,
    listFolded: false,
    preload: 'auto',
    theme: '#2980b9',
    loop: 'all',
    order: 'list',
    volume: null,
    listMaxHeight: null,
    customAudioType: null,
    storageName: 'metingjs'
  };

  function parseSettings(el, audio) {
    var opt = { container: el, audio: audio };
    Object.keys(DEFAULTS).forEach(function (key) {
      if (key === 'container' || key === 'audio') return;
      var lower = key.toLowerCase();
      var val = el.dataset[lower] !== undefined ? el.dataset[lower] : el.dataset[key];
      if (val === undefined) {
        if (DEFAULTS[key] !== null) opt[key] = DEFAULTS[key];
        return;
      }
      if (val === 'true' || val === 'false') val = val === 'true';
      else if (val !== '' && !isNaN(val) && key !== 'theme' && key !== 'storageName') val = Number(val);
      opt[key] = val;
    });
    // data-mode 是 hexo-tag-aplayer 的写法，映射到 APlayer 的 order
    if (el.dataset.mode) opt.order = el.dataset.mode;
    return opt;
  }

  function toAudioList(tracks) {
    return tracks.map(function (t) {
      return {
        name: t.name,
        artist: t.artist,
        url: t.url,
        cover: t.cover,
        lrc: t.lrc || '',
        theme: undefined
      };
    });
  }

  function pickTracks(server, type, id) {
    if (server !== 'netease') {
      console.warn('[netease-meting] 仅支持 netease，已跳过', server, id);
      return null;
    }
    var db = window.MUSIC_DB;
    if (!db || !db.playlists) {
      console.warn('[netease-meting] MUSIC_DB 未加载（请先 hexo generate）');
      return null;
    }
    if (type === 'playlist') {
      var pl = db.playlists[String(id)];
      return pl ? toAudioList(pl.tracks) : null;
    }
    // 单曲：在所有歌单里找，找不到就用 outer/url 兜底
    for (var pid in db.playlists) {
      var tracks = db.playlists[pid].tracks || [];
      for (var i = 0; i < tracks.length; i++) {
        if (String(tracks[i].id) === String(id)) return toAudioList([tracks[i]]);
      }
    }
    return [{
      name: 'Netease ' + id,
      artist: '',
      url: 'https://music.163.com/song/media/outer/url?id=' + id + '.mp3',
      cover: '',
      lrc: ''
    }];
  }

  function initOne(el) {
    if (!el || el.dataset.neteaseInited === '1') return;
    var audio;
    if (el.dataset.id) {
      audio = pickTracks(el.dataset.server || 'netease', el.dataset.type || 'playlist', el.dataset.id);
      if (!audio || !audio.length) {
        console.warn('[netease-meting] 无可用曲目', el.dataset.id);
        return;
      }
    } else if (el.dataset.url) {
      audio = [{
        name: el.dataset.name || el.dataset.title || 'Audio',
        artist: el.dataset.artist || el.dataset.author || '',
        url: el.dataset.url,
        cover: el.dataset.cover || el.dataset.pic || '',
        lrc: el.dataset.lrc || ''
      }];
    } else {
      return;
    }

    var opt = parseSettings(el, audio);
    // 有歌词才开滚动歌词，否则关闭（MetingJS 同款逻辑）
    if (!audio[0].lrc) opt.lrcType = 0;

    try {
      var ap = new APlayer(opt);
      el.dataset.neteaseInited = '1';
      aplayers.push(ap);
    } catch (e) {
      console.error('[netease-meting] 初始化失败', e);
    }
  }

  function loadMeting() {
    if (typeof APlayer === 'undefined') {
      console.warn('[netease-meting] APlayer 未就绪');
      return;
    }
    var boot = function () {
      var nodes = document.querySelectorAll('.aplayer');
      for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
    };
    if (window.MUSIC_DB) return boot();
    if (window.__MUSIC_DB_LOADING__) return;
    window.__MUSIC_DB_LOADING__ = true;
    // 曲库由 scripts/netease-music.js 在 generate 时产出
    var s = document.createElement('script');
    s.src = '/js/music-db.js';
    s.onload = function () { window.__MUSIC_DB_LOADING__ = false; boot(); };
    s.onerror = function () {
      window.__MUSIC_DB_LOADING__ = false;
      console.error('[netease-meting] 加载 /js/music-db.js 失败');
    };
    document.head.appendChild(s);
  }
  window.loadMeting = loadMeting;

  // Butterfly pjax：销毁非 fixed 播放器后会再次调用 loadMeting
  // 这里给未销毁的 fixed 播放器打标记，避免重复初始化
  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxSend', function () {
      for (var i = aplayers.length - 1; i >= 0; i--) {
        var ap = aplayers[i];
        try {
          if (!ap.options.fixed) {
            ap.destroy();
            aplayers.splice(i, 1);
          }
        } catch (e) { /* ignore */ }
      }
      var nodes = document.querySelectorAll('.aplayer');
      for (var j = 0; j < nodes.length; j++) {
        if (!nodes[j].dataset.neteaseInited) continue;
        // 非 fixed 的节点 pjax 后会换新 DOM，fixed 的保留标记
        var isFixed = nodes[j].dataset.fixed === 'true' || nodes[j].dataset.fixed === '1';
        if (!isFixed) delete nodes[j].dataset.neteaseInited;
      }
    }, 'neteaseMetingDestroy');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMeting);
  } else {
    loadMeting();
  }
})();
