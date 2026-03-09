// js/player.js — Global mini music player
// Uses sessionStorage to persist track across page navigation

const HTML = `<div id="mini-player" style="position:fixed;bottom:0;left:var(--sidebar-w);right:0;height:62px;background:#191c22;border-top:1px solid var(--border);display:none;align-items:center;gap:14px;padding:0 16px;z-index:600">
  <img id="mp-cover" style="width:42px;height:42px;border-radius:6px;object-fit:cover;background:var(--surface3);flex-shrink:0" src="" alt="">
  <div style="min-width:0;width:190px;flex-shrink:0">
    <div id="mp-title" style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
    <div id="mp-artist" style="font-size:11px;color:var(--text3)"></div>
  </div>
  <div style="display:flex;align-items:center;gap:9px">
    <button id="mp-prev" style="background:none;border:none;color:var(--text2);cursor:pointer;display:flex;align-items:center;padding:4px" title="Previous">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>
    </button>
    <button id="mp-play" style="width:36px;height:36px;border-radius:50%;background:var(--blue);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Play/Pause">
      <svg id="mp-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </button>
    <button id="mp-next" style="background:none;border:none;color:var(--text2);cursor:pointer;display:flex;align-items:center;padding:4px" title="Next">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>
    </button>
  </div>
  <div style="flex:1;display:flex;align-items:center;gap:8px;max-width:380px">
    <span id="mp-cur" style="font-size:11px;color:var(--text3);width:32px;flex-shrink:0">0:00</span>
    <div id="mp-bar" style="flex:1;height:4px;background:var(--border);border-radius:2px;cursor:pointer;position:relative">
      <div id="mp-fill" style="height:100%;background:var(--blue);border-radius:2px;width:0%;pointer-events:none"></div>
    </div>
    <span id="mp-dur" style="font-size:11px;color:var(--text3);width:32px;flex-shrink:0">0:00</span>
  </div>
  <a href="../pages/music.html" style="font-size:12px;color:var(--blue);text-decoration:none;flex-shrink:0">♫ Music</a>
  <button id="mp-close" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px 6px;flex-shrink:0" title="Close">✕</button>
</div>`;

function fmt(s) { if (!s || isNaN(s)) return '0:00'; const m=Math.floor(s/60); return m+':'+(Math.floor(s%60)<10?'0':'')+Math.floor(s%60); }

export function initMiniPlayer() {
  if (document.getElementById('mini-player')) return;
  document.body.insertAdjacentHTML('beforeend', HTML);

  if (!window.__mp_audio) window.__mp_audio = new Audio();
  const audio = window.__mp_audio;
  audio.volume = 0.8;

  const pl = document.getElementById('mini-player');

  // Restore saved state
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem('vkplayer') || 'null'); } catch(e) { return null; } })();
  if (saved && saved.url) {
    pl.style.display = 'flex';
    document.getElementById('mp-title').textContent  = saved.title  || '';
    document.getElementById('mp-artist').textContent = saved.artist || '';
    document.getElementById('mp-cover').src          = saved.cover  || '';
    if (!audio.src || audio.src !== saved.url) {
      audio.src = saved.url;
      if (saved.time) audio.currentTime = saved.time;
    }
    updateIcon();
  }

  // Controls
  document.getElementById('mp-play').onclick  = () => { if (audio.paused) audio.play().catch(()=>{}); else audio.pause(); };
  document.getElementById('mp-prev').onclick  = () => navQueue(-1);
  document.getElementById('mp-next').onclick  = () => navQueue(+1);
  document.getElementById('mp-close').onclick = () => {
    audio.pause(); pl.style.display = 'none';
    sessionStorage.removeItem('vkplayer');
  };
  document.getElementById('mp-bar').onclick = e => {
    const bar = document.getElementById('mp-bar');
    if (audio.duration) audio.currentTime = (e.offsetX / bar.offsetWidth) * audio.duration;
  };

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('mp-fill').style.width = pct + '%';
    document.getElementById('mp-cur').textContent  = fmt(audio.currentTime);
    // Save progress
    try { const s = JSON.parse(sessionStorage.getItem('vkplayer') || '{}'); s.time = audio.currentTime; sessionStorage.setItem('vkplayer', JSON.stringify(s)); } catch(e){}
  });
  audio.addEventListener('loadedmetadata', () => { document.getElementById('mp-dur').textContent = fmt(audio.duration); });
  audio.addEventListener('play',  updateIcon);
  audio.addEventListener('pause', updateIcon);
  audio.addEventListener('ended', () => navQueue(+1));
}

function updateIcon() {
  const audio = window.__mp_audio; if (!audio) return;
  const icon = document.getElementById('mp-play-icon'); if (!icon) return;
  if (audio.paused) {
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  } else {
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  }
}

function navQueue(dir) {
  try {
    const queue = JSON.parse(sessionStorage.getItem('vkqueue') || '[]');
    const idx   = parseInt(sessionStorage.getItem('vkqidx') || '0');
    const next  = idx + dir;
    if (next < 0 || next >= queue.length) return;
    playTrackGlobal(queue[next], queue, next);
  } catch(e) {}
}

export function playTrackGlobal(track, queue, qIdx) {
  if (!document.getElementById('mini-player')) initMiniPlayer();
  const audio = window.__mp_audio; if (!audio) return;
  const pl = document.getElementById('mini-player');

  pl.style.display = 'flex';
  document.getElementById('mp-title').textContent  = track.title  || '';
  document.getElementById('mp-artist').textContent = track.artist || '';
  document.getElementById('mp-cover').src          = track.cover_url || '../assets/default-avatar.svg';

  audio.src = track.audio_url;
  audio.play().catch(() => {});

  try {
    sessionStorage.setItem('vkplayer', JSON.stringify({ url: track.audio_url, title: track.title, artist: track.artist, cover: track.cover_url || '', time: 0 }));
    if (queue) { sessionStorage.setItem('vkqueue', JSON.stringify(queue)); sessionStorage.setItem('vkqidx', String(qIdx || 0)); }
  } catch(e) {}
}