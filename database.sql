-- 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '无标题',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建笔记标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- 创建更新时间自动更新的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- 创建允许匿名访问的策略（无需登录即可访问）
CREATE POLICY "Allow anonymous access to notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to tags" ON tags
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous access to note_tags" ON note_tags
  FOR ALL USING (true) WITH CHECK (true);

-- 创建全文搜索索引（提升搜索性能）
CREATE INDEX IF NOT EXISTS notes_title_content_idx ON notes USING gin(to_tsvector('simple', title || ' ' || content));
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notes_is_pinned_idx ON notes(is_pinned);

-- 插入一些示例数据
INSERT INTO tags (name, color) VALUES
  ('工作', '#ef4444'),
  ('学习', '#3b82f6'),
  ('生活', '#10b981'),
  ('想法', '#f59e0b')
ON CONFLICT (name) DO NOTHING;

INSERT INTO notes (title, content, is_pinned) VALUES
  ('欢迎使用笔记本', E'# 欢迎使用在线笔记本！\n\n这是一个基于 **Next.js** 和 **Supabase** 构建的现代化笔记应用。\n\n## 功能特性\n\n- 📝 支持 Markdown 语法\n- 🏷️ 标签分类管理\n- 🔍 全文搜索\n- 📌 笔记置顶\n- 🌙 深色模式\n- ⚡ 实时保存\n\n开始记录你的想法吧！', true),
  ('Markdown 语法示例', E'# 标题 1\n\n## 标题 2\n\n### 标题 3\n\n**粗体文本** 和 *斜体文本*\n\n- 列表项 1\n- 列表项 2\n- 列表项 3\n\n```javascript\n// 代码块示例\nconst greeting = "Hello World";\nconsole.log(greeting);\n```\n\n> 这是一个引用块\n\n[链接文本](https://example.com)', false);
