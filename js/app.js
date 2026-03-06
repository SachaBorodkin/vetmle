// js/app.js — VEtmle Global Utilities

// ──────────────────────────────────────────────────────────────
// Toast notifications
// ──────────────────────────────────────────────────────────────
export function toast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ──────────────────────────────────────────────────────────────
// Modal
// ──────────────────────────────────────────────────────────────
export function createModal(title, bodyHTML, footerHTML = '') {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal">' +
      '<div class="modal-header">' +
        '<h2>' + title + '</h2>' +
        '<button class="modal-close">&#x2715;</button>' +
      '</div>' +
      '<div class="modal-body">' + bodyHTML + '</div>' +
      (footerHTML ? '<div class="modal-footer" style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end">' + footerHTML + '</div>' : '') +
    '</div>';
  overlay.querySelector('.modal-close').onclick = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return overlay;
}

// ──────────────────────────────────────────────────────────────
// Upload image helper
// ──────────────────────────────────────────────────────────────
export async function uploadImage(supabase, bucket, file) {
  const ext = file.name.split('.').pop();
  const path = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return path;
}

// ──────────────────────────────────────────────────────────────
// Format numbers
// ──────────────────────────────────────────────────────────────
export function formatCount(n) {
  n = parseInt(n) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ──────────────────────────────────────────────────────────────
// Time ago
// ──────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ──────────────────────────────────────────────────────────────
// Escape HTML
// ──────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ──────────────────────────────────────────────────────────────
// SVG icons (no emoji dependency)
// ──────────────────────────────────────────────────────────────
const ICONS = {
  heart:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  heartout: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  comment:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  repost:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  share:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  dots:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  home:     '&#127968;',
  user:     '&#128100;',
  mail:     '&#9993;',
  friends:  '&#128101;',
  group:    '&#127963;',
  bell:     '&#128276;',
  search:    '&#128269;',
  music:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  video:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
  event:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  market:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
  bookmark:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>',
  community: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  games:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4m-2-2v4"/><circle cx="16" cy="10" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/></svg>',
  bookmark_off: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>',
  settings:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
};

// ──────────────────────────────────────────────────────────────
// Render sidebar
// ──────────────────────────────────────────────────────────────
export function renderSidebar(profile, activePage) {
  const sections = [
    {
      label: 'Main',
      items: [
        { id: 'feed',          icon: ICONS.home,      label: 'News Feed',     href: '../pages/feed.html' },
        { id: 'profile',       icon: ICONS.user,      label: 'My Page',       href: '../pages/profile.html?id=' + (profile ? profile.id : '') },
        { id: 'messages',      icon: ICONS.mail,      label: 'Messages',      href: '../pages/messages.html' },
        { id: 'friends',       icon: ICONS.friends,   label: 'Friends',       href: '../pages/friends.html' },
        { id: 'notifications', icon: ICONS.bell,      label: 'Notifications', href: '../pages/notifications.html' },
        { id: 'search',        icon: ICONS.search,    label: 'Search',        href: '../pages/search.html' },
      ]
    },
    {
      label: 'Entertainment',
      items: [
        { id: 'music',      icon: ICONS.music,     label: 'Music',       href: '../pages/music.html' },
        { id: 'video',      icon: ICONS.video,     label: 'Video',       href: '../pages/video.html' },
        { id: 'games',      icon: ICONS.games,     label: 'Games',       href: '../pages/games.html' },
      ]
    },
    {
      label: 'Community',
      items: [
        { id: 'groups',     icon: ICONS.community, label: 'Communities', href: '../pages/groups.html' },
        { id: 'events',     icon: ICONS.event,     label: 'Events',      href: '../pages/events.html' },
        { id: 'market',     icon: ICONS.market,    label: 'Marketplace', href: '../pages/market.html' },
        { id: 'bookmarks',  icon: ICONS.bookmark,  label: 'Bookmarks',   href: '../pages/bookmarks.html' },
      ]
    },
    {
      label: 'Account',
      items: [
        { id: 'settings',   icon: ICONS.settings,  label: 'Settings',    href: '../pages/settings.html' },
      ]
    }
  ];

  const avatarSrc = (profile && profile.avatar_url && profile.avatar_url.startsWith('http'))
    ? profile.avatar_url
    : '../assets/default-avatar.svg';

  let navHTML = '';
  sections.forEach(function(section) {
    navHTML += '<div class="nav-section-label">' + section.label + '</div>';
    section.items.forEach(function(p) {
      const active = activePage === p.id ? ' active' : '';
      navHTML += '<a href="' + p.href + '" class="nav-item' + active + '">' +
        '<span class="nav-icon">' + p.icon + '</span>' +
        '<span>' + p.label + '</span>' +
      '</a>';
    });
  });

  return '' +
    '<div class="sidebar-logo">' +
      '<div class="logo-icon">V</div>' +
      '<span class="logo-text">VEtmle</span>' +
    '</div>' +
    '<nav class="sidebar-nav">' +
      navHTML +
    '</nav>' +
    '<div class="sidebar-user" onclick="window.location.href=\'../pages/profile.html?id=' + (profile ? profile.id : '') + '\'">' +
      '<img src="' + avatarSrc + '" alt="" ' +
           'style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:center;flex-shrink:0;display:block;background:var(--surface3)">' +
      '<div class="sidebar-user-info">' +
        '<div class="name">' + (profile ? profile.full_name : 'User') + '</div>' +
        '<div class="username">@' + (profile ? profile.username : '') + '</div>' +
      '</div>' +
    '</div>';
}

// ──────────────────────────────────────────────────────────────
// Render post card
// ──────────────────────────────────────────────────────────────
export function renderPost(post, currentUserId) {
  const isLiked = post.user_liked || false;
  const isOwn   = post.author_id === currentUserId;

  const authorAvatar = (post.author && post.author.avatar_url && post.author.avatar_url.startsWith('http'))
    ? post.author.avatar_url
    : '../assets/default-avatar.svg';

  const authorName = (post.author && post.author.full_name) ? post.author.full_name : 'User';

  const wallNote = (post.wall_owner_id && post.wall_owner_id !== post.author_id && post.wall_owner)
    ? ' <span class="post-wall-owner">&#8594; <a href="../pages/profile.html?id=' + post.wall_owner_id + '">' + (post.wall_owner.full_name || 'User') + '\'s wall</a></span>'
    : '';

  const menuBtn = isOwn
    ? '<button class="post-menu-btn" onclick="togglePostMenu(this,\'' + post.id + '\')">' + ICONS.dots + '</button>'
    : '';

  const imageHtml = post.image_url
    ? '<img class="post-image" src="' + post.image_url + '" alt="" loading="lazy" onclick="openImageViewer(\'' + post.image_url + '\')">'
    : '';

  const likeIcon  = isLiked ? ICONS.heart : ICONS.heartout;
  const likeClass = isLiked ? ' liked' : '';
  const likes     = formatCount(post.likes_count    || 0);
  const comments  = formatCount(post.comments_count || 0);
  const reposts   = formatCount(post.reposts_count  || 0);

  return '' +
    '<div class="post-card" data-post-id="' + post.id + '">' +

      '<div class="post-header">' +
        '<a href="../pages/profile.html?id=' + post.author_id + '" style="flex-shrink:0">' +
          '<img src="' + authorAvatar + '" alt="" ' +
               'style="width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:center;display:block;background:var(--surface3)">' +
        '</a>' +
        '<div class="post-header-info">' +
          '<a class="post-author-name" href="../pages/profile.html?id=' + post.author_id + '">' + escapeHtml(authorName) + '</a>' +
          '<div class="post-meta">' + wallNote + ' <span>' + timeAgo(post.created_at) + '</span></div>' +
        '</div>' +
        menuBtn +
      '</div>' +

      '<div class="post-content">' + escapeHtml(post.content) + '</div>' +
      imageHtml +

      '<div class="post-actions">' +
        '<button class="post-action-btn' + likeClass + '" onclick="handleLike(this,\'' + post.id + '\')">' +
          likeIcon + ' <span class="count">' + likes + '</span>' +
        '</button>' +
        '<button class="post-action-btn" onclick="toggleComments(this,\'' + post.id + '\')">' +
          ICONS.comment + ' <span class="count">' + comments + '</span>' +
        '</button>' +
        '<button class="post-action-btn">' +
          ICONS.repost + ' <span class="count">' + reposts + '</span>' +
        '</button>' +
        '<button class="post-action-btn" style="margin-left:auto" onclick="sharePost(\'' + post.id + '\')">' +
          ICONS.share +
        '</button>' +
        '<button class="post-action-btn" onclick="bookmarkPost(\'' + post.id + '\')" title="Save post">' +
          ICONS.bookmark_off +
        '</button>' +
      '</div>' +

      '<div class="comments-container" id="comments-' + post.id + '" style="display:none"></div>' +

    '</div>';
}