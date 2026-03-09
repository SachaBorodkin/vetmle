// js/supabase.js — VEtmle Supabase client (ES Module, used by pages/)
// ╔══════════════════════════════════════════════════════╗
// ║  STEP 1 — Paste your Supabase credentials here      ║
// ║  supabase.com → your project → Settings → API       ║
// ╚══════════════════════════════════════════════════════╝
const SUPABASE_URL = "https://xtksymdbefznpjapeihr.supabase.co"; // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0a3N5bWRiZWZ6bnBqYXBlaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Mjc1NTQsImV4cCI6MjA4ODIwMzU1NH0._3w_UFUBZPKfW5F3-SYZMQkfXGZ22FFv_cdbyDkSots"; // your public anon key

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let _client = null;
function getClient() {
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return _client;
}

export const supabase = new Proxy({}, {
  get: (_, prop) => getClient()[prop]
});

export async function getCurrentUser() {
  const { data: { user } } = await getClient().auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await getClient().from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) { window.location.href = '../index.html'; return null; }
  return user;
}

export function avatarUrl(url) {
  if (!url) return '../assets/default-avatar.svg';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('../')) return url;
  return getClient().storage.from('avatars').getPublicUrl(url).data.publicUrl;
}

export function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)     return 'just now';
  if (s < 3600)   return Math.floor(s/60)   + 'm ago';
  if (s < 86400)  return Math.floor(s/3600)  + 'h ago';
  if (s < 604800) return Math.floor(s/86400) + 'd ago';
  return new Date(d).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'});
}