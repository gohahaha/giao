-- ==================== 紧急修复：解除 user_id 约束 ====================
-- 在 Supabase SQL Editor 中执行

-- 1. 删除旧的外键约束（user_id 引用 auth.users，现已不用）
ALTER TABLE IF EXISTS posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE IF EXISTS photos DROP CONSTRAINT IF EXISTS photos_user_id_fkey;
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE IF EXISTS comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

-- 2. 允许 user_id 为空（现在用 author_id）
ALTER TABLE IF EXISTS posts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS photos ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS likes ALTER COLUMN user_id DROP NOT NULL;

-- 3. 确认 Storage 图片桶存在
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
