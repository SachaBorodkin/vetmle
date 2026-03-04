-- ══════════════════════════════════════════════════════════════
-- VEtmle — Full Supabase Schema
-- Run this ENTIRE file in: Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  cover_url   TEXT,
  city        TEXT,
  birthday    DATE,
  status      TEXT DEFAULT 'offline',
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"             ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"            ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);  -- SECURITY DEFINER trigger needs this open
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- TRIGGER: auto-create profile on signup
-- Drop and recreate cleanly to avoid stale versions
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username  TEXT;
  _fullname  TEXT;
  _counter   INT := 0;
  _try       TEXT;
BEGIN
  -- Derive base username from metadata or email
  _username := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    '[^a-z0-9_]', '_', 'g'
  ));
  -- Ensure minimum length
  IF length(_username) < 3 THEN _username := 'user_' || _username; END IF;

  _fullname := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Handle username collisions by appending a number
  _try := _username;
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, full_name)
      VALUES (NEW.id, _try, _fullname);
      EXIT; -- success
    EXCEPTION WHEN unique_violation THEN
      _counter := _counter + 1;
      _try := _username || '_' || _counter;
      IF _counter > 99 THEN
        -- Last resort: use part of UUID
        _try := _username || '_' || substr(NEW.id::text, 1, 6);
        INSERT INTO public.profiles (id, username, full_name)
        VALUES (NEW.id, _try, _fullname);
        EXIT;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- FRIENDSHIPS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their friendships"   ON friendships;
DROP POLICY IF EXISTS "Users can create friend requests"   ON friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;

CREATE POLICY "friendships_select" ON friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_insert" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update" ON friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_delete" ON friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ─────────────────────────────────────────────
-- POSTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wall_owner_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  image_url      TEXT,
  likes_count    INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reposts_count  INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone"       ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their posts"       ON posts;
DROP POLICY IF EXISTS "Authors can delete their posts"       ON posts;

CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- ─────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone"        ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments"  ON comments;
DROP POLICY IF EXISTS "Authors can delete their comments"        ON comments;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Auto-increment post comments count
DROP TRIGGER IF EXISTS on_comment_created ON comments;
DROP FUNCTION IF EXISTS increment_comments_count();

CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION increment_comments_count();

-- ─────────────────────────────────────────────
-- LIKES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone"  ON likes;
DROP POLICY IF EXISTS "Authenticated users can like"    ON likes;
DROP POLICY IF EXISTS "Users can unlike"                ON likes;

CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Auto-update likes count
DROP TRIGGER IF EXISTS on_like_change ON likes;
DROP FUNCTION IF EXISTS update_likes_count();

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages"                          ON messages;
DROP POLICY IF EXISTS "Authenticated users can send messages"                  ON messages;
DROP POLICY IF EXISTS "Users can update their received messages (mark read)"   ON messages;

CREATE POLICY "messages_select" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ─────────────────────────────────────────────
-- GROUPS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  avatar_url    TEXT,
  cover_url     TEXT,
  owner_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  members_count INT DEFAULT 1,
  is_private    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Groups are viewable by everyone"      ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Owners can update groups"              ON groups;

CREATE POLICY "groups_select" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_insert" ON groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "groups_update" ON groups FOR UPDATE USING (auth.uid() = owner_id);

-- ─────────────────────────────────────────────
-- GROUP MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id  UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members are viewable by everyone" ON group_members;
DROP POLICY IF EXISTS "Authenticated users can join groups"    ON group_members;
DROP POLICY IF EXISTS "Users can leave groups"                 ON group_members;

CREATE POLICY "group_members_select" ON group_members FOR SELECT USING (true);
CREATE POLICY "group_members_insert" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "group_members_delete" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('like','comment','friend_request','friend_accept','message','wall_post')),
  entity_id  UUID,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications"   ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- ══════════════════════════════════════════════════════════════
-- STORAGE — create these buckets manually in Supabase Storage:
--   avatars  (public)
--   covers   (public)
--   posts    (public)
--   groups   (public)
--
-- For each bucket, add these policies in Storage → Policies:
--   SELECT: true
--   INSERT: auth.role() = 'authenticated'
-- ══════════════════════════════════════════════════════════════