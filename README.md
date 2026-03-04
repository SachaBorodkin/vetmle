# VEtmle — Social Network

A full-featured social networking platform inspired by VKontakte, built with vanilla HTML/CSS/JS + Supabase.

---

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Name it `VEtmle`
3. Copy your **Project URL** and **Anon Key** from `Settings → API`

### 2. Run the Database Schema

In your Supabase project:

1. Go to **SQL Editor**
2. Open `supabase_schema.sql` from this project
3. Paste and run the entire file

### 3. Create Storage Buckets

In Supabase **Storage**:

1. Create bucket: `avatars` (Public)
2. Create bucket: `covers` (Public)
3. Create bucket: `posts` (Public)
4. Create bucket: `groups` (Public)

For each bucket, set the policy to allow public reads:

```sql
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

(Repeat for each bucket name)

### 4. Configure the App

Open `js/supabase.js` and replace:

```js
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

With your actual values.

### 5. Serve the App

Use any static file server. Examples:

**Using Python:**

```bash
python3 -m http.server 3000
```

**Using Node.js (serve):**

```bash
npx serve .
```

**Using VS Code Live Server:**

- Install the Live Server extension
- Right-click `index.html` → Open with Live Server

Then open `http://localhost:3000` in your browser.

---

## 📁 File Structure

```
VEtmle/
├── index.html                 # Login / Register page
├── supabase_schema.sql        # Database schema (run in Supabase)
│
├── css/
│   ├── main.css               # Global styles, variables, utilities
│   ├── layout.css             # App shell, sidebar, layout grid
│   ├── auth.css               # Auth page styles
│   └── components.css         # Post cards, chat, groups, etc.
│
├── js/
│   ├── supabase.js            # Supabase client + auth helpers
│   └── app.js                 # Global utilities (toast, modals, post renderer)
│
├── pages/
│   ├── feed.html              # News Feed (home page after login)
│   ├── profile.html           # User profile (wall, friends, photos, info)
│   ├── messages.html          # Real-time messaging
│   ├── friends.html           # Friends list, requests, suggestions
│   ├── groups.html            # Groups list + create group
│   ├── group.html             # Single group page
│   ├── notifications.html     # Notification center
│   ├── search.html            # Search people, groups, posts
│   └── settings.html          # Account settings
│
└── assets/
    └── default-avatar.svg     # Fallback avatar
```

---

## ✨ Features

| Feature                                   | Status |
| ----------------------------------------- | ------ |
| Auth (Login/Register/Forgot Password)     | ✅     |
| User Profiles with cover & avatar         | ✅     |
| Wall Posts with images                    | ✅     |
| Likes & Comments                          | ✅     |
| Friend System (add/accept/decline/remove) | ✅     |
| Real-time Messaging                       | ✅     |
| Groups (create/join/post)                 | ✅     |
| Notifications                             | ✅     |
| Search (people/groups/posts)              | ✅     |
| News Feed with filter                     | ✅     |
| Stories bar (UI)                          | ✅     |
| Profile editing                           | ✅     |
| Photo gallery                             | ✅     |
| Account settings                          | ✅     |
| Realtime post updates                     | ✅     |
| Mobile responsive                         | ✅     |

---

## 🎨 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES Modules)
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage + Realtime)
- **Fonts:** Google Fonts (Nunito + Manrope)
- **No build tools required** — runs directly in browser

---

## 🔐 Security Notes

- All database tables use Row Level Security (RLS)
- Users can only modify their own data
- Storage buckets require authentication for uploads
- Friend requests are validated at the database level

---

## 📱 Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).
Requires a browser with ES Modules support.
