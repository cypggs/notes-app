import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🚀 开始设置数据库...\n')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  try {
    console.log('📝 创建数据库表...\n')

    // 创建 tags 表和插入数据
    console.log('1️⃣ 创建标签...')
    const tagsToCreate = [
      { name: '工作', color: '#ef4444' },
      { name: '学习', color: '#3b82f6' },
      { name: '生活', color: '#10b981' },
      { name: '想法', color: '#f59e0b' }
    ]

    for (const tag of tagsToCreate) {
      const { error } = await supabase
        .from('tags')
        .upsert(tag, { onConflict: 'name', ignoreDuplicates: true })

      if (error && error.code !== '42P01') { // 忽略表不存在的错误
        console.log(`   ⚠️  标签 "${tag.name}": ${error.message}`)
      }
    }

    // 创建示例笔记
    console.log('2️⃣ 创建示例笔记...')
    const notesToCreate = [
      {
        title: '欢迎使用笔记本',
        content: `# 欢迎使用在线笔记本！

这是一个基于 **Next.js** 和 **Supabase** 构建的现代化笔记应用。

## 功能特性

- 📝 支持 Markdown 语法
- 🏷️ 标签分类管理
- 🔍 全文搜索
- 📌 笔记置顶
- 🌙 深色模式
- ⚡ 实时保存

开始记录你的想法吧！`,
        is_pinned: true
      },
      {
        title: 'Markdown 语法示例',
        content: `# 标题 1

## 标题 2

### 标题 3

**粗体文本** 和 *斜体文本*

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
// 代码块示例
const greeting = "Hello World";
console.log(greeting);
\`\`\`

> 这是一个引用块

[链接文本](https://example.com)`,
        is_pinned: false
      }
    ]

    for (const note of notesToCreate) {
      const { error } = await supabase
        .from('notes')
        .insert(note)

      if (error && error.code !== '42P01') {
        console.log(`   ⚠️  笔记 "${note.title}": ${error.message}`)
      }
    }

    // 检查是否成功
    console.log('\n🔍 验证数据库...')

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')

    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')

    if (notesError || tagsError) {
      console.log('\n❌ 数据库表不存在！')
      console.log('\n请手动在 Supabase Dashboard 执行以下步骤：\n')
      console.log('1. 访问: https://supabase.com/dashboard/project/mclpscvtkxldycxoidoc')
      console.log('2. 点击左侧 "SQL Editor"')
      console.log('3. 复制 database.sql 的全部内容并执行\n')
      console.log('执行完成后，重新运行: node setup-db.mjs\n')
      return
    }

    console.log(`✅ 笔记表: ${notes?.length || 0} 条记录`)
    console.log(`✅ 标签表: ${tags?.length || 0} 条记录`)

    console.log('\n🎊 数据库设置完成！\n')
    console.log('现在可以访问应用了：')
    console.log('👉 http://localhost:3000\n')

  } catch (error) {
    console.error('\n❌ 错误:', error.message)
    console.log('\n请手动在 Supabase Dashboard 执行 database.sql\n')
  }
}

setupDatabase()
