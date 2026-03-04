// js/supabase.js — VEtmle Supabase client (ES Module, used by pages/)
// ╔══════════════════════════════════════════════════════╗
// ║  STEP 1 — Paste your Supabase credentials here      ║
// ║  supabase.com → your project → Settings → API       ║
// ╚══════════════════════════════════════════════════════╝
const SUPABASE_URL = "https://xtksymdbefznpjapeihr.supabase.co"; // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0a3N5bWRiZWZ6bnBqYXBlaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Mjc1NTQsImV4cCI6MjA4ODIwMzU1NH0._3w_UFUBZPKfW5F3-SYZMQkfXGZ22FFv_cdbyDkSots"; // your public anon key

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../index.html";
    return null;
  }
  return user;
}

export function avatarUrl(url) {
  if (!url) return "../assets/default-avatar.svg";
  if (url.startsWith("http")) return url;
  return supabase.storage.from("avatars").getPublicUrl(url).data.publicUrl;
}

export function coverUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return supabase.storage.from("covers").getPublicUrl(url).data.publicUrl;
}

export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
