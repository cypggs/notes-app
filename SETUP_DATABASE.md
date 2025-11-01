# 数据库设置指南

在启动应用之前，需要在 Supabase 中创建数据库表。

## 步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`mclpscvtkxldycxoidoc`
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query** 创建新查询
5. 复制 `database.sql` 文件中的所有内容
6. 粘贴到 SQL 编辑器中
7. 点击 **Run** 或按 `Cmd/Ctrl + Enter` 执行

## 执行的内容

SQL 脚本将创建：

- ✅ `notes` 表 - 存储笔记
- ✅ `tags` 表 - 存储标签
- ✅ `note_tags` 表 - 笔记和标签的关联
- ✅ RLS 策略 - 允许匿名访问
- ✅ 索引 - 提升搜索性能
- ✅ 触发器 - 自动更新时间戳
- ✅ 示例数据 - 2 条示例笔记和 4 个标签

## 验证

执行完成后，你可以在 Supabase Dashboard 中：

1. 点击左侧菜单的 **Table Editor**
2. 查看是否有 `notes`、`tags`、`note_tags` 三个表
3. 点击 `notes` 表，应该能看到 2 条示例数据

## 常见问题

**Q: 如果执行失败怎么办？**
A: 检查是否已经执行过 SQL。如果表已存在，可以删除后重新执行，或者只执行失败的部分。

**Q: 能否跳过示例数据？**
A: 可以，删除 SQL 文件最后的 `INSERT INTO` 语句即可。

---

完成后，返回主目录运行 `npm run dev` 启动应用！
