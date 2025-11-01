"use client"

import { useState, useEffect } from 'react'
import { NoteWithTags, Tag } from '@/types'
import { NoteCard } from '@/components/note-card'
import { NoteEditor } from '@/components/note-editor'
import { NoteViewer } from '@/components/note-viewer'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, BookOpen } from 'lucide-react'

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithTags | null>(null)
  const [viewingNote, setViewingNote] = useState<NoteWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载笔记
  const loadNotes = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedTag) params.append('tagId', selectedTag)

      const response = await fetch(`/api/notes?${params}`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载标签
  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setTags(data)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  useEffect(() => {
    loadNotes()
    loadTags()
  }, [searchQuery, selectedTag])

  // 创建或更新笔记
  const handleSaveNote = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      if (editingNote) {
        // 更新笔记
        await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        // 创建笔记
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      loadNotes()
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  // 删除笔记
  const handleDeleteNote = async (id: string) => {
    if (!confirm('确定要删除这条笔记吗？')) return

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      loadNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // 切换置顶
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return

      await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          is_pinned: isPinned,
        }),
      })
      loadNotes()
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  // 打开编辑器
  const handleEditNote = (note: NoteWithTags) => {
    setEditingNote(note)
    setEditorOpen(true)
  }

  // 打开查看器
  const handleViewNote = (note: NoteWithTags) => {
    setViewingNote(note)
    setViewerOpen(true)
  }

  // 打开新建笔记
  const handleNewNote = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* 头部 */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">我的笔记本</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={handleNewNote}>
                <Plus className="h-4 w-4 mr-2" />
                新建笔记
              </Button>
            </div>
          </div>

          {/* 搜索和过滤 */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTag === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(null)}
                >
                  全部
                </Badge>
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTag === tag.id ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    style={
                      selectedTag === tag.id
                        ? { backgroundColor: tag.color, borderColor: tag.color }
                        : { borderColor: tag.color, color: tag.color }
                    }
                    onClick={() => setSelectedTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 笔记列表 */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            加载中...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery || selectedTag ? '没有找到匹配的笔记' : '还没有任何笔记'}
            </p>
            <Button onClick={handleNewNote}>
              <Plus className="h-4 w-4 mr-2" />
              创建第一条笔记
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={handleViewNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}
      </main>

      {/* 查看器对话框 */}
      <NoteViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        note={viewingNote}
      />

      {/* 编辑器对话框 */}
      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        tags={tags}
        onSave={handleSaveNote}
      />
    </div>
  )
}
