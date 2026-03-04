// js/app.js — VEtmle Global Utilities

// ──────────────────────────────────────────────────────────────
// Toast notifications
// ──────────────────────────────────────────────────────────────
export function toast(message, type = "info", duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    el.style.transition = "0.3s ease";
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ──────────────────────────────────────────────────────────────
// Modal helpers
// ──────────────────────────────────────────────────────────────
export function createModal(title, bodyHTML, footerHTML = "") {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer" style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end">${footerHTML}</div>` : ""}
    </div>
  `;
  overlay.querySelector(".modal-close").onclick = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  return overlay;
}

// ──────────────────────────────────────────────────────────────
// Dropdown
// ──────────────────────────────────────────────────────────────
export function openDropdown(trigger, items) {
  // Remove existing dropdown
  document.querySelectorAll(".dropdown-menu").forEach((d) => d.remove());

  const menu = document.createElement("div");
  menu.className = "dropdown-menu";

  items.forEach((item) => {
    const el = document.createElement("button");
    el.className = `dropdown-item${item.danger ? " danger" : ""}`;
    el.innerHTML = `${item.icon ? `<span>${item.icon}</span>` : ""} ${item.label}`;
    el.onclick = () => {
      item.action();
      menu.remove();
    };
    menu.appendChild(el);
  });

  const wrap = document.createElement("div");
  wrap.className = "dropdown";
  wrap.style.position = "relative";
  trigger.parentNode.insertBefore(wrap, trigger);
  wrap.appendChild(trigger);
  wrap.appendChild(menu);

  const close = (e) => {
    if (!wrap.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", close);
    }
  };
  setTimeout(() => document.addEventListener("click", close), 10);
}

// ──────────────────────────────────────────────────────────────
// Upload image helper
// ──────────────────────────────────────────────────────────────
export async function uploadImage(supabase, bucket, file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

// ──────────────────────────────────────────────────────────────
// Format numbers
// ──────────────────────────────────────────────────────────────
export function formatCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n;
}

// ──────────────────────────────────────────────────────────────
// Render sidebar (shared across pages)
// ──────────────────────────────────────────────────────────────
export function renderSidebar(profile, activePage) {
  const pages = [
    { id: "feed", icon: "🏠", label: "News Feed", href: "../pages/feed.html" },
    {
      id: "profile",
      icon: "👤",
      label: "My Page",
      href: `../pages/profile.html?id=${profile?.id}`,
    },
    {
      id: "messages",
      icon: "✉️",
      label: "Messages",
      href: "../pages/messages.html",
      badge: true,
    },
    {
      id: "friends",
      icon: "👥",
      label: "Friends",
      href: "../pages/friends.html",
      badge: true,
    },
    { id: "groups", icon: "🏛️", label: "Groups", href: "../pages/groups.html" },
    {
      id: "notifications",
      icon: "🔔",
      label: "Notifications",
      href: "../pages/notifications.html",
      badge: true,
    },
    { id: "search", icon: "🔍", label: "Search", href: "../pages/search.html" },
  ];

  return `
    <div class="sidebar-logo">
      <div class="logo-icon">V</div>
      <span class="logo-text">VEtmle</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Navigation</div>
      ${pages
        .map(
          (p) => `
        <a href="${p.href}" class="nav-item${activePage === p.id ? " active" : ""}">
          <span class="nav-icon">${p.icon}</span>
          <span>${p.label}</span>
        </a>
      `,
        )
        .join("")}
    </nav>
    <div class="sidebar-user" onclick="window.location.href='../pages/profile.html?id=${profile?.id}'">
      <img class="avatar avatar-sm" src="${profile?.avatar_url || "/assets/default-avatar.svg"}" alt="">
      <div class="sidebar-user-info">
        <div class="name">${profile?.full_name || "User"}</div>
        <div class="username">@${profile?.username || ""}</div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────
// Post card renderer
// ──────────────────────────────────────────────────────────────
export function renderPost(
  post,
  currentUserId,
  { onLike, onComment, onDelete } = {},
) {
  const isLiked = post.user_liked || false;
  const isOwn = post.author_id === currentUserId;

  const wallNote =
    post.wall_owner_id && post.wall_owner_id !== post.author_id
      ? `<span class="post-wall-owner">→ <a href="../pages/profile.html?id=${post.wall_owner_id}">${post.wall_owner?.full_name || "User"}'s wall</a></span>`
      : "";

  return `
    <div class="post-card" data-post-id="${post.id}">
      <div class="post-header">
        <a href="../pages/profile.html?id=${post.author_id}">
          <img class="avatar avatar-md" src="${post.author?.avatar_url || "/assets/default-avatar.svg"}" alt="">
        </a>
        <div class="post-header-info">
          <a class="post-author-name" href="../pages/profile.html?id=${post.author_id}">${post.author?.full_name || "User"}</a>
          <div class="post-meta">${wallNote} <span>${timeAgo(post.created_at)}</span></div>
        </div>
        ${
          isOwn
            ? `
          <button class="post-menu-btn" onclick="togglePostMenu(this, '${post.id}')">⋯</button>
        `
            : ""
        }
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="" loading="lazy" onclick="openImageViewer('${post.image_url}')">` : ""}
      <div class="post-actions">
        <button class="post-action-btn${isLiked ? " liked" : ""}" onclick="handleLike(this, '${post.id}')">
          ${isLiked ? "❤️" : "🤍"} <span class="count">${formatCount(post.likes_count || 0)}</span>
        </button>
        <button class="post-action-btn" onclick="toggleComments(this, '${post.id}')">
          💬 <span class="count">${formatCount(post.comments_count || 0)}</span>
        </button>
        <button class="post-action-btn">
          🔁 <span class="count">${formatCount(post.reposts_count || 0)}</span>
        </button>
        <button class="post-action-btn" style="margin-left:auto" onclick="sharePost('${post.id}')">
          ↗️
        </button>
      </div>
      <div class="comments-container" id="comments-${post.id}" style="display:none"></div>
    </div>
  `;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
