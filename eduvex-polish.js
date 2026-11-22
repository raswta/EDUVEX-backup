/* EDUVEX add-on: cleaner layout + lock screen timer (Media Session).
   Load AFTER the main script:  <script src="eduvex-polish.js?v=1"></script>  (just before </body>) */
(function () {
  'use strict';

  /* ---------- 1) Layout polish (CSS only, every feature stays) ---------- */
  var css = `
html{scroll-behavior:smooth}
*{scrollbar-width:thin;scrollbar-color:#334155 transparent}
body{-webkit-tap-highlight-color:transparent;background-image:radial-gradient(1200px 500px at 50% -10%,rgba(59,130,246,.08),transparent 60%)}
html[data-theme] body{background-image:radial-gradient(1200px 500px at 50% -10%,rgba(var(--ar),.1),transparent 60%)}
body>header{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding-top:.6rem;padding-bottom:.6rem}
body>header #hdrTools{gap:.4rem}
body main{padding:1rem .85rem 2rem}
body>footer{padding:.9rem;opacity:.8}

/* consistent vertical rhythm */
body #app>*+*{margin-top:1rem!important}
body .tab.space-y-6>*+*{margin-top:1rem!important}
body .grid.gap-6{gap:1rem}

/* cards */
body .card{padding:1.1rem;border-radius:1.1rem;box-shadow:0 1px 0 rgba(255,255,255,.03) inset,0 8px 24px -12px rgba(0,0,0,.55)}
body .card>h3:first-child,body .card h4{font-size:.78rem;letter-spacing:.04em;text-transform:uppercase;margin-bottom:.75rem}
body .card.space-y-3>*+*{margin-top:.7rem!important}
body .card.space-y-4>*+*{margin-top:.9rem!important}

/* sticky, scroll-snapping tab bar */
#tabBar{position:sticky;z-index:30;gap:.35rem;padding:.5rem .15rem;margin-left:-.15rem;margin-right:-.15rem;
  background:rgba(2,6,23,.86);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  scrollbar-width:none;scroll-snap-type:x proximity;border-bottom:1px solid rgba(148,163,184,.12)}
html[data-theme] #tabBar{background:rgba(var(--s950r),.86)}
#tabBar::-webkit-scrollbar{display:none}
body .tab-btn{padding:.5rem 1rem;border-radius:9999px;font-size:.8rem;scroll-snap-align:start;transition:background .15s,color .15s}
body .tab-btn:not(.on):hover{background:rgba(148,163,184,.12);color:#e2e8f0}

/* forms and buttons */
body .inp{padding:.62rem .8rem;border-radius:.7rem;min-height:2.6rem;transition:border-color .15s,box-shadow .15s}
body .inp:focus{box-shadow:0 0 0 3px rgba(var(--ar,59,130,246),.22)}
body .lbl{font-weight:500;margin-bottom:.3rem}
body .btn{padding:.7rem 1rem;border-radius:.75rem;font-weight:600;transition:background .15s,transform .1s,opacity .15s}
body .btn:active{transform:scale(.98)}
body .btn:disabled{opacity:.6;cursor:not-allowed}
body .row{padding:.65rem .8rem;border-radius:.75rem;gap:.6rem}

/* timer */
#swDisplay{font-size:clamp(2.6rem,10vw,3.5rem);font-variant-numeric:tabular-nums;letter-spacing:-.02em;margin:1.1rem 0 .4rem}
#swStatus{font-weight:500;letter-spacing:.03em}
#swBreak{max-height:9rem;overflow-y:auto}
#sessionsList,#examsList,#classesList{padding-right:.15rem}

/* goal + streak */
#streakBtn{width:6rem;box-shadow:0 8px 24px -12px rgba(0,0,0,.55)}
#goalText{white-space:nowrap}

/* modals */
body .modal{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
body .modal>.card{max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px -12px rgba(0,0,0,.7)}
body .modal.show>*{animation:evPop .18s ease-out}
@keyframes evPop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}

/* settings: grouped sections */
#settings .card>div{padding-bottom:1rem;border-bottom:1px solid rgba(148,163,184,.12)}
#settings .card>div:last-of-type{border-bottom:0;padding-bottom:0}

/* small screens */
@media(max-width:480px){
  body main{padding:.75rem .6rem 1.5rem}
  body .card{padding:.95rem}
  #connText{display:none}
  body>header #hdrTools>button{padding:.4rem .55rem}
  #focus .absolute{font-size:.7rem}
}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
  var st = document.createElement('style');
  st.id = 'evPolish'; st.textContent = css; document.head.appendChild(st);

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
