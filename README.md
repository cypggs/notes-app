# 我的笔记本 - 精美在线笔记应用

基于 **Next.js 14** 和 **Supabase** 构建的现代化笔记应用，支持 Markdown、标签管理、全文搜索和深色模式。

## ✨ 功能特性

- 📝 **Markdown 编辑器** - 支持实时 Markdown 语法编辑和预览
- 🏷️ **标签系统** - 为笔记添加多个标签，支持按标签筛选
- 🔍 **全文搜索** - 快速搜索笔记标题和内容
- 📌 **笔记置顶** - 重要笔记可以置顶显示
- 🌙 **深色模式** - 支持浅色/深色主题自动切换
- 💾 **实时保存** - 笔记自动保存到云端
- 🎨 **现代 UI** - 基于 shadcn/ui 的精美卡片式设计
- ⚡ **响应式** - 完美适配桌面端和移动端

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **编辑器**: @uiw/react-md-editor
- **图标**: Lucide React
- **主题**: next-themes

## 🚀 快速开始

### 1. 创建 Supabase 数据库表

登录你的 Supabase 项目控制台，进入 SQL Editor，执行 `database.sql` 中的 SQL 语句创建所需的数据库表。

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📝 使用说明

1. **创建笔记**: 点击右上角的"新建笔记"按钮
2. **编辑笔记**: 点击笔记卡片上的"编辑"按钮
3. **删除笔记**: 点击笔记卡片上的"删除"按钮
4. **置顶笔记**: 点击笔记卡片右上角的图钉图标
5. **搜索笔记**: 在顶部搜索框输入关键词
6. **标签筛选**: 点击顶部的标签徽章进行筛选
7. **切换主题**: 点击右上角的主题切换按钮

## 📄 环境变量

已配置在 `.env.local` 文件中：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

---

**开始记录你的想法吧！** 🚀
