-- ==================== 米奇giaogiao屋 - Supabase 数据库设置 ====================
-- 在 Supabase 控制台的 SQL Editor 中执行此文件
-- 或者复制粘贴到 Supabase → SQL Editor → New Query → Run

-- ==================== 1. 用户档案表 ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  member_id INTEGER NOT NULL CHECK (member_id BETWEEN 1 AND 10),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 2. 动态表 (日常圈) ====================
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 3. 照片表 (群相册) ====================
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT DEFAULT 'daily' CHECK (category IN ('daily', 'party', 'funny', 'archive')),
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 4. 留言表 (碎碎念) ====================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 5. 评论表 ====================
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 6. 点赞表 ====================
CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, user_id)
);

-- ==================== 7. 开启行级安全 (RLS) ====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ==================== 8. RLS 策略：所有人可读 ====================
CREATE POLICY "允许认证用户查看档案" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "允许认证用户查看动态" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "允许认证用户查看照片" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "允许认证用户查看留言" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "允许认证用户查看评论" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "允许认证用户查看点赞" ON likes
  FOR SELECT USING (auth.role() = 'authenticated');

-- ==================== 9. RLS 策略：用户可写入自己的数据 ====================
CREATE POLICY "用户可创建自己的档案" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可发布动态" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可上传照片" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可写留言" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可发表评论" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可点赞" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== 10. RLS 策略：用户可删除自己的数据 ====================
CREATE POLICY "用户可删除自己的动态" ON posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的照片" ON photos
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的留言" ON messages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的评论" ON comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "用户可取消点赞" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== 11. 存储桶：图片 ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 存储策略
CREATE POLICY "图片所有人可查看" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "认证用户可上传图片" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "用户可删除自己的图片" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);

-- ==================== 12. 创建索引(加速查询) ====================
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);

-- ==================== 完成！====================
-- 接下来：把 js/supabase-config.js 里的 SUPABASE_URL 和 SUPABASE_ANON_KEY 改成你自己的
