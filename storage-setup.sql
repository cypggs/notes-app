-- 创建图片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- 设置存储策略 - 允许匿名上传和读取
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'note-images');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'note-images');

CREATE POLICY "Allow anonymous deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'note-images');
