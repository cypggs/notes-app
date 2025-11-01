"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { NoteWithTags, Tag } from '@/types'
import dynamic from 'next/dynamic'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface NoteEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: NoteWithTags | null
  tags: Tag[]
  onSave: (data: {
    title: string
    content: string
    tags: string[]
  }) => void
}

export function NoteEditor({ open, onOpenChange, note, tags, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const editorRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSelectedTags(note.tags?.map(t => t.id) || [])
    } else {
      setTitle('')
      setContent('')
      setSelectedTags([])
    }
  }, [note, open])

  const handleSave = () => {
    onSave({ title, content, tags: selectedTags })
    onOpenChange(false)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // 上传图片到服务器
  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上传失败')

      const { url } = await response.json()

      // 在当前光标位置插入图片 Markdown 语法
      const imageMarkdown = `\n![图片](${url})\n`
      setContent(prev => prev + imageMarkdown)
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('图片上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  // 处理图片粘贴
  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault()
        const file = item.getAsFile()
        if (file) {
          await uploadImage(file)
        }
      }
    }
  }

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        await uploadImage(file)
      }
    }

    // 重置 input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 打开文件选择器
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] p-4 sm:p-6">
        <DialogHeader className="pr-10 sm:pr-12">
          <DialogTitle className="text-lg sm:text-xl break-words leading-tight">{note ? '编辑笔记' : '新建笔记'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="输入笔记标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">标签</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer transition-all text-xs sm:text-sm"
                  style={
                    selectedTags.includes(tag.id)
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : { borderColor: tag.color, color: tag.color }
                  }
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-sm">内容</Label>
              <div className="flex items-center gap-2">
                {uploading && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="hidden sm:inline">正在上传图片...</span>
                    <span className="sm:hidden">上传中...</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-1.5"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">上传图片</span>
                  <span className="sm:hidden">图片</span>
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground break-words">
              💡 提示：可以直接粘贴图片（Ctrl/Cmd + V）或点击"上传图片"按钮
            </p>
            <div data-color-mode="light" className="dark:hidden" onPaste={handlePaste}>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={400}
                preview="edit"
              />
            </div>
            <div data-color-mode="dark" className="hidden dark:block" onPaste={handlePaste}>
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={400}
                preview="edit"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 sm:pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm sm:text-base">
              取消
            </Button>
            <Button onClick={handleSave} className="text-sm sm:text-base">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
