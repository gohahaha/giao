-- ==================== 米奇giaogiao屋 - 免登录改造 数据库迁移 ====================
-- 在 Supabase 控制台 → SQL Editor → 粘贴全部 → Run

-- ==================== 1. 禁用所有表的 RLS（行级安全）====================
ALTER TABLE IF EXISTS posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;

-- ==================== 2. 给所有数据表添加 author_id 列 ====================
ALTER TABLE IF EXISTS posts ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE IF EXISTS photos ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE IF EXISTS comments ADD COLUMN IF NOT EXISTS author_id INTEGER;
ALTER TABLE IF EXISTS likes ADD COLUMN IF NOT EXISTS author_id INTEGER;

-- ==================== 3. 添加 author_id 索引（加速按作者查询）====================
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_photos_author_id ON photos(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_author_id ON messages(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_author_id ON likes(author_id);

-- ==================== 完成！====================
-- Storage 图片策略如果上次已创建就跳过，不用管这个报错
