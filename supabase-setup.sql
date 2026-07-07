-- ==================== 米奇giaogiao屋 - Supabase 数据库初始化 ====================
-- 在 Supabase 控制台 → SQL Editor → 新建查询 → 粘贴全部 → Run
-- 适用于首次创建，免 Auth 模式，用 author_id 标识作者

-- ==================== 1. 动态表 (日常圈) ====================
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 2. 照片表 (群相册) ====================
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  category TEXT DEFAULT 'daily' CHECK (category IN ('daily', 'party', 'funny', 'archive')),
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 3. 留言表 (碎碎念) ====================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 4. 评论表 ====================
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 5. 点赞表 ====================
CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id INTEGER NOT NULL,
  UNIQUE(post_id, author_id)
);

-- ==================== 6. RLS 全部关闭（免 Auth）====================
ALTER TABLE IF EXISTS posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;

-- ==================== 7. 索引 ====================
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_author_id ON photos(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_author_id ON messages(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_author_id ON likes(author_id);

-- ==================== 8. Storage 图片存储桶 ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 公开访问策略
DROP POLICY IF EXISTS "公开查看图片" ON storage.objects;
DROP POLICY IF EXISTS "公开上传图片" ON storage.objects;
DROP POLICY IF EXISTS "公开删除图片" ON storage.objects;

CREATE POLICY "公开查看图片" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "公开上传图片" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "公开删除图片" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- ==================== 完成！====================
