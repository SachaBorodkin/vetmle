// js/app.js — VEtmle shared utilities
// VKontakte 2017–2019 faithful UI

// ── Toast ─────────────────────────────────────────────────────
export function toast(msg, type = 'info', dur = 3200) {
  let c = document.getElementById('toast-container');
  if (!c) { c = Object.assign(document.createElement('div'), { id: 'toast-container' }); document.body.appendChild(c); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.style.transition = '.22s'; el.style.opacity = '0'; el.style.transform = 'translateX(10px)';
    setTimeout(() => el.remove(), 230);
  }, dur);
}

// ── Modal ──────────────────────────────────────────────────────
export function createModal(title, bodyHTML, footerHTML) {
  const o = document.createElement('div');
  o.className = 'modal-overlay';
  o.innerHTML = '<div class="modal">'
    + '<div class="modal-header"><h2>' + title + '</h2>'
    + '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">&#10005;</button></div>'
    + '<div class="modal-body">' + bodyHTML + '</div>'
    + (footerHTML ? '<div class="modal-footer">' + footerHTML + '</div>' : '')
    + '</div>';
  o.addEventListener('click', e => { if (e.target === o) o.remove(); });
  document.body.appendChild(o);
  return o;
}

// ── Image viewer ───────────────────────────────────────────────
export function openImageViewer(url) {
  const o = document.createElement('div');
  o.className = 'image-viewer-overlay';
  o.innerHTML = '<img src="' + url + '" alt=""><button class="image-viewer-close" title="Close">&#10005;</button>';
  o.addEventListener('click', e => { if (e.target === o || e.target.tagName === 'BUTTON') o.remove(); });
  document.body.appendChild(o);
}
window.openImageViewer = openImageViewer;

// ── Formatters ─────────────────────────────────────────────────
export function formatCount(n) {
  n = parseInt(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function _esc(s) {
  if (!s) return '';
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}
function _ago(s) {
  const d = Math.floor((Date.now() - new Date(s)) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d / 60) + 'm ago';
  if (d < 86400) return Math.floor(d / 3600) + 'h ago';
  if (d < 604800) return Math.floor(d / 86400) + 'd ago';
  return new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── SVG Icons ──────────────────────────────────────────────────
export const ICONS = {
  heart:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  heartout: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  comment:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  repost:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  share:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  bookmark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  bm_fill:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  dots:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  home:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  user:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  mail:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  friends:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  bell:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  search:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  music:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  video:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  event:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  market:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  bookmark2:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  games:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4"/><circle cx="16" cy="10" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/></svg>',
  settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  group:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  play_f:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  pause_f:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  prev_f:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>',
  next_f:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>',
};

// ── Header ─────────────────────────────────────────────────────
export function renderHeader(profile, activePage) {
  const el = document.getElementById('vk-header');
  if (!el) return;
  const avt = (profile && profile.avatar_url && profile.avatar_url.startsWith('http'))
    ? profile.avatar_url : '../assets/default-avatar.svg';
  const name = profile ? (profile.full_name || 'User').split(' ')[0] : 'User';
  const pid  = profile ? profile.id : '';
  el.innerHTML =
    '<a class="vk-header-logo" href="../pages/feed.html">'
    + '<div class="logo-letter">В</div><span class="logo-name">VEtmle</span></a>'
    + '<div class="vk-header-search"><div class="search-bar" style="width:100%;height:30px">'
    + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    + '<input type="text" placeholder="Search VEtmle…" onkeydown="if(event.key===\'Enter\')window.location.href=\'../pages/search.html?q=\'+encodeURIComponent(this.value)" style="padding:0 6px"></div></div>'
    + '<div class="vk-header-actions">'
    + '<a href="../pages/messages.html" class="vk-header-btn" title="Messages">' + ICONS.mail + '<span class="badge" id="hdr-msg-badge" style="display:none">0</span></a>'
    + '<a href="../pages/friends.html" class="vk-header-btn" title="Friends">' + ICONS.friends + '<span class="badge" id="hdr-fr-badge" style="display:none">0</span></a>'
    + '<a href="../pages/notifications.html" class="vk-header-btn" title="Notifications">' + ICONS.bell + '<span class="badge" id="hdr-notif-badge" style="display:none">0</span></a>'
    + '</div>'
    + '<div class="vk-header-user" onclick="window.location.href=\'../pages/profile.html?id=' + pid + '\'">'
    + '<img src="' + avt + '" alt="" onerror="this.src=\'../assets/default-avatar.svg\'">'
    + '<span class="vk-header-uname">' + _esc(name) + '</span></div>';

  // Load unread counts async
  loadHeaderBadges();
}

async function loadHeaderBadges() {
  try {
    // Dynamically import supabase to avoid circular dep issues
    const { supabase, getCurrentUser } = await import('./supabase.js');
    const user = await getCurrentUser();
    if (!user) return;

    const [{ count: msgs }, { count: frs }, { count: notifs }] = await Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read', false),
      supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('addressee_id', user.id).eq('status', 'pending'),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
    ]);
    if (msgs)   { const b = document.getElementById('hdr-msg-badge');   if (b) { b.textContent = msgs;   b.style.display = 'flex'; } }
    if (frs)    { const b = document.getElementById('hdr-fr-badge');    if (b) { b.textContent = frs;    b.style.display = 'flex'; } }
    if (notifs) { const b = document.getElementById('hdr-notif-badge'); if (b) { b.textContent = notifs; b.style.display = 'flex'; } }
  } catch (e) { /* silently fail */ }
}

// ── Sidebar ────────────────────────────────────────────────────
export function renderSidebar(profile, activePage) {
  const sections = [
    { label: 'Main', items: [
      { id: 'feed',          icon: ICONS.home,      label: 'News Feed',      href: '../pages/feed.html' },
      { id: 'profile',       icon: ICONS.user,      label: 'My Profile',     href: '../pages/profile.html' + (profile ? '?id=' + profile.id : '') },
      { id: 'messages',      icon: ICONS.mail,      label: 'Messages',       href: '../pages/messages.html' },
      { id: 'friends',       icon: ICONS.friends,   label: 'Friends',        href: '../pages/friends.html' },
      { id: 'notifications', icon: ICONS.bell,      label: 'Notifications',  href: '../pages/notifications.html' },
      { id: 'search',        icon: ICONS.search,    label: 'Search',         href: '../pages/search.html' },
    ]},
    { label: 'Entertainment', items: [
      { id: 'music',    icon: ICONS.music,    label: 'Music',       href: '../pages/music.html' },
      { id: 'video',    icon: ICONS.video,    label: 'Video',       href: '../pages/video.html' },
      { id: 'games',    icon: ICONS.games,    label: 'Games',       href: '../pages/games.html' },
    ]},
    { label: 'Community', items: [
      { id: 'groups',    icon: ICONS.group,     label: 'Communities', href: '../pages/groups.html' },
      { id: 'events',    icon: ICONS.event,     label: 'Events',      href: '../pages/events.html' },
      { id: 'market',    icon: ICONS.market,    label: 'Marketplace', href: '../pages/market.html' },
      { id: 'bookmarks', icon: ICONS.bookmark2, label: 'Bookmarks',   href: '../pages/bookmarks.html' },
    ]},
    { label: 'Account', items: [
      { id: 'settings', icon: ICONS.settings, label: 'Settings', href: '../pages/settings.html' },
    ]},
  ];

  const avt = (profile && profile.avatar_url && profile.avatar_url.startsWith('http'))
    ? profile.avatar_url : '../assets/default-avatar.svg';
  const pid = profile ? profile.id : '';

  let nav = '';
  sections.forEach(s => {
    nav += '<div class="nav-section-label">' + s.label + '</div>';
    s.items.forEach(p => {
      nav += '<a href="' + p.href + '" class="nav-item' + (activePage === p.id ? ' active' : '') + '">'
        + '<span class="nav-icon">' + p.icon + '</span>'
        + '<span class="nav-label">' + p.label + '</span>'
        + '</a>';
    });
  });

  return '<div style="padding:11px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-shrink:0">'
    + '<div class="logo-letter">В</div>'
    + '<span class="logo-name">VEtmle</span></div>'
    + '<nav class="sidebar-nav">' + nav + '</nav>'
    + '<a class="sidebar-user" href="../pages/profile.html?id=' + pid + '">'
    + '<img src="' + avt + '" alt="" onerror="this.src=\'../assets/default-avatar.svg\'">'
    + '<div class="sidebar-user-info">'
    + '<div class="name">' + _esc(profile ? profile.full_name : 'User') + '</div>'
    + '<div style="font-size:11px;color:var(--green)">● online</div>'
    + '</div></a>';
}

// ── Render post ────────────────────────────────────────────────
export function renderPost(post, currentUserId) {
  const isLiked = post.user_liked || false;
  const isBm    = post.user_bookmarked || false;
  const isOwn   = post.author_id === currentUserId;

  const avt  = (post.author && post.author.avatar_url && post.author.avatar_url.startsWith('http'))
    ? post.author.avatar_url : '../assets/default-avatar.svg';
  const name = post.author ? _esc(post.author.full_name || 'User') : 'User';
  const wallNote = (post.wall_owner_id && post.wall_owner_id !== post.author_id && post.wall_owner)
    ? ' → <a href="../pages/profile.html?id=' + post.wall_owner_id + '">' + _esc(post.wall_owner.full_name || 'User') + '</a>' : '';

  const lc = formatCount(post.likes_count || 0);
  const cc = formatCount(post.comments_count || 0);
  const rc = formatCount(post.reposts_count || 0);

  return '<div class="post-card" data-post-id="' + post.id + '">'
    + '<div class="post-header">'
    + '<a href="../pages/profile.html?id=' + post.author_id + '" style="flex-shrink:0">'
    + '<img src="' + avt + '" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover" onerror="this.src=\'../assets/default-avatar.svg\'">'
    + '</a>'
    + '<div class="post-header-info">'
    + '<a class="post-author-name" href="../pages/profile.html?id=' + post.author_id + '">' + name + '</a>'
    + '<div class="post-meta">' + wallNote + (wallNote ? ' · ' : '') + _ago(post.created_at) + '</div>'
    + '</div>'
    + (isOwn ? '<button class="post-menu-btn" onclick="togglePostMenu(this,\'' + post.id + '\')">' + ICONS.dots + '</button>' : '')
    + '</div>'
    + (post.content ? '<div class="post-content">' + _esc(post.content) + '</div>' : '')
    + (post.image_url ? '<img class="post-image" src="' + post.image_url + '" alt="" loading="lazy" onclick="openImageViewer(\'' + post.image_url + '\')">' : '')
    + '<div class="post-actions">'
    + '<button class="post-action-btn' + (isLiked ? ' liked' : '') + '" onclick="handleLike(this,\'' + post.id + '\')">'
    + (isLiked ? ICONS.heart : ICONS.heartout) + ' <span class="count">' + lc + '</span></button>'
    + '<button class="post-action-btn" onclick="toggleComments(this,\'' + post.id + '\')">'
    + ICONS.comment + ' <span class="count">' + cc + '</span></button>'
    + '<button class="post-action-btn">' + ICONS.repost + ' <span class="count">' + rc + '</span></button>'
    + '<button class="post-action-btn" style="margin-left:auto" onclick="sharePost(\'' + post.id + '\')">' + ICONS.share + '</button>'
    + '<button class="post-action-btn' + (isBm ? ' bookmarked' : '') + '" onclick="bookmarkPost(\'' + post.id + '\',this)">'
    + (isBm ? ICONS.bm_fill : ICONS.bookmark) + '</button>'
    + '</div>'
    + '<div class="comments-container" id="comments-' + post.id + '" style="display:none"></div>'
    + '</div>';
}