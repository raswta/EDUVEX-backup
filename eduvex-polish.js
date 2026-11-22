/* EDUVEX add-on: notebook-style dark blue layout + lock screen timer (Media Session).
   Load AFTER the main script:  <script src="eduvex-polish.js?v=1"></script>  (just before </body>) */
(function () {
  'use strict';

  /* ---------- 1) Notebook look: dark blue, thick outlines, hard shadows (CSS only, every feature stays) ---------- */
  var css = `
:root{--ink:#020617;--paper:#0a1122;--card:#101a30;--edge:#3b4a66}
html[data-theme]{--ink:rgb(var(--s950r))}
html{scroll-behavior:smooth}
*{scrollbar-width:thin;scrollbar-color:#334155 transparent}
html body{font-family:'Bricolage Grotesque',Inter,system-ui,sans-serif;-webkit-tap-highlight-color:transparent}

/* graph-paper notebook background (dark blue) */
html:not([data-theme]) body.bg-slate-950{background-color:var(--paper)}
body.bg-slate-950{background-image:linear-gradient(rgba(148,163,184,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.075) 1px,transparent 1px);background-size:26px 26px}
html[data-theme] body.bg-slate-950{background-image:linear-gradient(rgba(var(--ar),.12) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--ar),.12) 1px,transparent 1px)}

/* header */
body>header{padding:.7rem 1rem;border-bottom:3px solid var(--ink);box-shadow:0 4px 0 rgba(0,0,0,.35)}
html:not([data-theme]) body>header{background:#0b1a3d}
body>header>div>span{font-size:1.5rem;font-weight:800;letter-spacing:-.02em}
body>header #hdrTools{gap:.45rem}
body>header #hdrTools>button{border:2px solid var(--ink);border-radius:.65rem;box-shadow:2px 2px 0 var(--ink);transition:transform .08s,box-shadow .08s}
body>header #hdrTools>button:active{transform:translate(2px,2px);box-shadow:none}
body main{padding:1.1rem .9rem 2rem}
body>footer{border-top:2px dashed rgba(148,163,184,.25);padding:.9rem;opacity:.85}

/* rhythm */
body #app>*+*{margin-top:1.1rem!important}
body .tab.space-y-6>*+*{margin-top:1.1rem!important}
body .grid.gap-6{gap:1.1rem}
body .card.space-y-3>*+*{margin-top:.75rem!important}
body .card.space-y-4>*+*{margin-top:.95rem!important}

/* cards: bold border + hard shadow */
body .card{padding:1.15rem;border-width:2px;border-radius:1.1rem;box-shadow:5px 5px 0 var(--ink)}
html:not([data-theme]) body .card{background-color:var(--card);border-color:var(--edge)}
body .card>h3:first-child,body .card h4{font-size:.95rem;font-weight:800;letter-spacing:-.01em;margin-bottom:.8rem}

/* tabs */
#tabBar{position:sticky;z-index:30;gap:.5rem;padding:.65rem .2rem;margin:0 -.2rem;background:rgba(10,17,34,.93);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);scrollbar-width:none;scroll-snap-type:x proximity;border-bottom:2px dashed rgba(148,163,184,.25)}
html[data-theme] #tabBar{background:rgba(var(--s950r),.93)}
#tabBar::-webkit-scrollbar{display:none}
body .tab-btn{padding:.5rem 1rem;border:2px solid transparent;border-radius:.7rem;font-weight:700;font-size:.8rem;scroll-snap-align:start;transition:transform .08s,box-shadow .08s}
body .tab-btn:not(.on){border-color:rgba(148,163,184,.22);background:rgba(15,23,42,.55)}
body .tab-btn:not(.on):hover{color:#e2e8f0;border-color:rgba(148,163,184,.45)}
body .tab-btn.on{border-color:var(--ink);box-shadow:3px 3px 0 var(--ink)}

/* inputs + buttons */
body .inp{border-width:2px;border-radius:.7rem;padding:.62rem .8rem;min-height:2.7rem}
html:not([data-theme]) body .inp{background-color:var(--paper);border-color:var(--edge)}
body .inp:focus{box-shadow:3px 3px 0 rgba(var(--ar,59,130,246),.55)}
body .lbl{font-weight:600;margin-bottom:.3rem}
body .btn{padding:.7rem 1rem;border:2px solid var(--ink);border-radius:.75rem;font-weight:700;box-shadow:3px 3px 0 var(--ink);transition:transform .08s,box-shadow .08s,background .15s}
body .btn:active:not(:disabled){transform:translate(3px,3px);box-shadow:0 0 0 var(--ink)}
body .btn:disabled{box-shadow:none;opacity:.55;cursor:not-allowed}
body .row{padding:.65rem .8rem;border-width:2px;border-radius:.75rem;gap:.6rem}

/* timer ticket */
#swDisplay{font-size:clamp(2.6rem,10vw,3.6rem);font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em;padding:.5rem 0;margin:1rem 0 .5rem;border:2px dashed rgba(148,163,184,.3);border-radius:1rem;background:rgba(0,0,0,.25)}
#swStatus{font-weight:600;letter-spacing:.03em}
#swBreak{max-height:9rem;overflow-y:auto}

/* goal + streak */
#goalTrack{height:14px!important;border:2px solid var(--ink);border-radius:999px;background:rgba(0,0,0,.3)}
#goalBar{border-radius:999px}
#goalText{white-space:nowrap}
#streakBtn{width:6rem;border-width:2px;box-shadow:4px 4px 0 var(--ink)}
html:not([data-theme]) #streakBtn{background:var(--card)}

/* warning boxes: solid yellow note like the notebook app */
body .bg-amber-500\\/10{background:#facc15!important;border:2px solid var(--ink)!important;border-radius:.8rem;box-shadow:3px 3px 0 var(--ink)}
body .bg-amber-500\\/10,body .bg-amber-500\\/10 *{color:#1c1917!important}

/* modals */
body .modal{background-color:rgba(2,6,23,.78);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
body .modal>.card{max-height:90vh;overflow-y:auto;box-shadow:7px 7px 0 var(--ink)}
body .modal.show>*{animation:evPop .18s ease-out}
@keyframes evPop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}

/* settings sections + theme dots */
#settings .card>div{padding-bottom:1rem;border-bottom:2px dashed rgba(148,163,184,.2)}
#settings .card>div:last-of-type{border-bottom:0;padding-bottom:0}
.thc{width:30px;height:30px;border-width:3px;border-color:var(--ink);box-shadow:2px 2px 0 var(--ink)}
.thc.on{border-color:#f8fafc}

@media(max-width:480px){
  body main{padding:.8rem .6rem 1.5rem}
  body .card{padding:.95rem;box-shadow:4px 4px 0 var(--ink)}
  #connText{display:none}
  body>header #hdrTools>button{padding:.4rem .55rem}
  #focus .absolute{font-size:.7rem}
}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
  var st = document.createElement('style');
  st.id = 'evPolish'; st.textContent = css; document.head.appendChild(st);
  var fl = document.createElement('link'); fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(fl);

  // notebook font + goal track hook
  var fl = document.createElement('link');
  fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&display=swap';
  document.head.appendChild(fl);
  var gb = document.getElementById('goalBar'); if (gb && gb.parentElement) gb.parentElement.id = 'goalTrack';

  // sticky tab bar sits right under the header
  var first = document.querySelector('.tab-btn'), bar = first && first.parentElement;
  if (bar) {
    bar.id = 'tabBar';
    var hdr = document.querySelector('body>header');
    var fit = function () { bar.style.top = (hdr ? hdr.offsetHeight : 56) + 'px'; };
    fit(); addEventListener('resize', fit); addEventListener('load', fit);
  }

  /* ---------- 2) Settings button for the lock screen timer ---------- */
  var key = document.querySelector('#settings .fa-key');
  var anchor = key && key.closest('#settings .card>div');
  if (anchor && !document.getElementById('lockBtn')) {
    var box = document.createElement('div');
    box.innerHTML =
      '<p class="lbl"><i class="fa-solid fa-lock mr-1"></i> Lock screen timer</p>' +
      '<button id="lockBtn" onclick="lockToggle()" class="btn"></button>' +
      '<p class="text-[11px] text-slate-500 mt-2">Shows the stopwatch on the lock screen with Pause / Play buttons. ' +
      'It plays a silent sound in the background, so it may pause your music and use a little more battery. Turn it on separately on each device.</p>';
    anchor.parentNode.insertBefore(box, anchor);
  }

  /* ---------- 2b) Style switch (Solid = original look, Grid = notebook look) ---------- */
  var tRow = document.getElementById('themeRow'), tBox = tRow && tRow.parentNode;
  if (tBox && !document.getElementById('styG')) {
    var sw = document.createElement('div');
    sw.className = 'flex items-center gap-3';
    sw.innerHTML = '<span class="text-xs font-semibold text-slate-300">Style</span>' +
      '<div class="grid grid-cols-2 gap-2 flex-1">' +
      '<button id="styS" onclick="setUiStyle(\'solid\')" class="btn">Solid</button>' +
      '<button id="styG" onclick="setUiStyle(\'grid\')" class="btn">Grid</button></div>';
    tBox.parentNode.insertBefore(sw, tBox);
  }
  var uiStyle = function () { return localStorage.getItem('ev_style') === 'solid' ? 'solid' : 'grid'; };
  function applyStyle() {
    var grid = uiStyle() === 'grid';
    st.disabled = !grid; fl.disabled = !grid;
    var a = document.getElementById('styS'), b = document.getElementById('styG');
    if (a) a.className = 'btn ' + (!grid ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700');
    if (b) b.className = 'btn ' + (grid ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700');
    if (typeof fit === 'function') fit();
  }
  window.setUiStyle = function (k) { localStorage.setItem('ev_style', k); applyStyle(); };
  applyStyle();

  /* ---------- 3) Lock screen timer (Media Session) ---------- */
  var lsAud = null, lsKey = '', lsReady = false;
  var lockOn = function () { return localStorage.getItem('ev_lock') === 'on'; };

  function audio() {
    if (lsAud) return lsAud;
    var sr = 8000, n = sr * 5, b = new ArrayBuffer(44 + n), v = new DataView(b);   // 5 s of silence, looped
    var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
    new Uint8Array(b, 44).fill(128);
    lsAud = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
    lsAud.loop = true; lsAud.setAttribute('playsinline', '');
    return lsAud;
  }
  function init() {
    if (lsReady || !('mediaSession' in navigator)) return;
    lsReady = true;
    var ms = navigator.mediaSession;
    ms.setActionHandler('play', function () { if (!running) toggleTimer(); });
    ms.setActionHandler('pause', function () { if (running) toggleTimer(); });
    ['previoustrack', 'nexttrack', 'seekbackward', 'seekforward', 'seekto'].forEach(function (a) { try { ms.setActionHandler(a, null); } catch (e) {} });
  }
  function stop() {
    if (lsAud && !lsAud.paused) lsAud.pause();
    if ('mediaSession' in navigator && lsKey) { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; }
    lsKey = '';
  }
  function sync() {
    if (!('mediaSession' in navigator) || !lockOn() || !(running || base > 0)) return stop();
    init();
    var a = audio(), t = pomo ? Math.max(0, pLeft) : base;
    var title = hms(t) + ' · ' + curSub, artist = running ? (pState === 'rest' ? 'Resting' : 'Studying') : 'Paused';
    if (title + '|' + artist !== lsKey) {
      lsKey = title + '|' + artist;
      navigator.mediaSession.metadata = new MediaMetadata({ title: title, artist: artist, album: 'EDUVEX', artwork: [{ src: 'icon.png', sizes: '512x512', type: 'image/png' }] });
    }
    navigator.mediaSession.playbackState = running ? 'playing' : 'paused';
    if (running) { if (a.paused) a.play().catch(function () {}); }
    else if (!a.paused) a.pause();
  }
  function ui() {
    var on = lockOn(), b = document.getElementById('lockBtn'); if (!b) return;
    b.textContent = on ? 'Lock screen timer: ON (tap to turn off)' : 'Lock screen timer: OFF (tap to turn on)';
    b.className = 'btn ' + (on ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700');
  }
  window.lockToggle = function () {
    if (!('mediaSession' in navigator)) return alert('This browser does not support lock screen controls.');
    localStorage.setItem('ev_lock', lockOn() ? 'off' : 'on');
    ui(); sync();
  };

  // run right after Start / Pause / Resume (inside the tap, so the browser allows the sound)
  var orig = window.toggleTimer;
  if (typeof orig === 'function') window.toggleTimer = function () { var r = orig.apply(this, arguments); sync(); return r; };
  setInterval(sync, 1000);
  ui();
})();
