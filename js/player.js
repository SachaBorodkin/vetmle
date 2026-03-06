// js/player.js — Global mini music player (shared across all pages)
// Inject the player bar into any page by calling initMiniPlayer(supabase)

const PLAYER_HTML = `
<div id="mini-player" style="
  position:fixed;bottom:0;left:var(--sidebar-w,240px);right:0;
  background:var(--surface);border-top:1px solid var(--border);
  padding:0 20px;height:66px;display:none;align-items:center;gap:16px;
  z-index:300;box-shadow:0 -4px 24px rgba(0,0,0,.5);backdrop-filter:blur(16px);
">
  <img id="mp-cover" style="width:44px;height:44px;border-radius:8px;object-fit:cover;background:var(--surface3);flex-shrink:0" src="" alt="">
  <div style="min-width:0;width:180px;flex-shrink:0">
    <div id="mp-title" style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
    <div id="mp-artist" style="font-size:11px;color:var(--text3)"></div>
  </div>
  <div style="display:flex;align-items:center;gap:10px">
    <button id="mp-prev" style="background:none;border:none;color:var(--text2);cursor:pointer;display:flex;align-items:center;padding:4px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>
    </button>
    <button id="mp-play" style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(91,127,255,.4)">
      <svg id="mp-icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <svg id="mp-icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
    </button>
    <button id="mp-next" style="background:none;border:none;color:var(--text2);cursor:pointer;display:flex;align-items:center;padding:4px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>
    </button>
  </div>
  <div style="flex:1;display:flex;align-items:center;gap:8px;max-width:400px">
    <span id="mp-time" style="font-size:11px;color:var(--text3);width:32px;flex-shrink:0">0:00</span>
    <div id="mp-bar" style="flex:1;height:4px;background:var(--border);border-radius:2px;cursor:pointer;position:relative">
      <div id="mp-fill" style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:2px;width:0%;pointer-events:none"></div>
    </div>
    <span id="mp-dur" style="font-size:11px;color:var(--text3);width:32px;flex-shrink:0">0:00</span>
  </div>
  <a href="../pages/music.html" style="font-size:12px;color:var(--accent);text-decoration:none;flex-shrink:0;white-space:nowrap">&#9835; Music</a>
  <button id="mp-close" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;padding:4px;flex-shrink:0" title="Close player">&#10005;</button>
</div>`;

export function initMiniPlayer() {
  if (document.getElementById('mini-player')) return;
  document.body.insertAdjacentHTML('beforeend', PLAYER_HTML);

  const pl = document.getElementById('mini-player');
  const audio = window.__vetmle_audio = window.__vetmle_audio || new Audio();

  // Restore state from sessionStorage
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem('vetmle_player') || 'null'); } catch(e) { return null; } })();
  if (saved && saved.url) {
    pl.style.display = 'flex';
    document.getElementById('mp-title').textContent  = saved.title  || '';
    document.getElementById('mp-artist').textContent = saved.artist || '';
    document.getElementById('mp-cover').src          = saved.cover  || '';
    if (audio.src !== saved.url) { audio.src = saved.url; audio.currentTime = saved.time || 0; }
    updateIcons();
  }

  // Controls
  document.getElementById('mp-play').onclick  = togglePlay;
  document.getElementById('mp-prev').onclick  = () => navigate(-1);
  document.getElementById('mp-next').onclick  = () => navigate(1);
  document.getElementById('mp-close').onclick = () => { audio.pause(); pl.style.display = 'none'; sessionStorage.removeItem('vetmle_player'); };
  document.getElementById('mp-bar').onclick   = e => {
    const bar = document.getElementById('mp-bar');
    audio.currentTime = (e.offsetX / bar.offsetWidth) * (audio.duration || 0);
  };

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('mp-fill').style.width = pct + '%';
    document.getElementById('mp-time').textContent = fmt(audio.currentTime);
    // Save progress
    const s = JSON.parse(sessionStorage.getItem('vetmle_player') || '{}');
    s.time = audio.currentTime;
    sessionStorage.setItem('vetmle_player', JSON.stringify(s));
  });
  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('mp-dur').textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => { navigate(1); });
  audio.addEventListener('play',  updateIcons);
  audio.addEventListener('pause', updateIcons);

  function togglePlay() {
    if (audio.paused) audio.play().catch(()=>{});
    else audio.pause();
  }

  function navigate(dir) {
    const queue = JSON.parse(sessionStorage.getItem('vetmle_queue') || '[]');
    const idx   = parseInt(sessionStorage.getItem('vetmle_queue_idx') || '0');
    const next  = idx + dir;
    if (next < 0 || next >= queue.length) return;
    playQueueItem(queue, next);
  }

  function updateIcons() {
    const playing = !audio.paused && !audio.ended;
    document.getElementById('mp-icon-play').style.display  = playing ? 'none'  : 'block';
    document.getElementById('mp-icon-pause').style.display = playing ? 'block' : 'none';
  }

  function fmt(s) { if (!s || isNaN(s)) return '0:00'; const m=Math.floor(s/60); return m+':'+(Math.floor(s%60)<10?'0':'')+Math.floor(s%60); }
}

// Call this to start playing a track from any page
export function playTrackGlobal(track, queue, queueIdx) {
  const pl = document.getElementById('mini-player');
  if (!pl) return;
  const audio = window.__vetmle_audio;
  if (!audio) return;

  pl.style.display = 'flex';
  document.getElementById('mp-title').textContent  = track.title  || '';
  document.getElementById('mp-artist').textContent = track.artist || '';
  document.getElementById('mp-cover').src          = track.cover_url || '';
  audio.src = track.audio_url;
  audio.play().catch(() => {});

  // Save to session
  sessionStorage.setItem('vetmle_player', JSON.stringify({ url: track.audio_url, title: track.title, artist: track.artist, cover: track.cover_url || '', time: 0 }));
  if (queue) {
    sessionStorage.setItem('vetmle_queue', JSON.stringify(queue));
    sessionStorage.setItem('vetmle_queue_idx', String(queueIdx || 0));
  }
}

function playQueueItem(queue, idx) {
  const track = queue[idx];
  if (!track) return;
  sessionStorage.setItem('vetmle_queue_idx', String(idx));
  playTrackGlobal(track, queue, idx);
}