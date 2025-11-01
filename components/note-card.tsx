"use client"

import { NoteWithTags } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Pin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface NoteCardProps {
  note: NoteWithTags
  onView: (note: NoteWithTags) => void
  onEdit: (note: NoteWithTags) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
}

export function NoteCard({ note, onView, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  // 获取内容预览（去除 Markdown 标记，限制长度）
  const getPreview = (content: string) => {
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, '[代码块]')
      .replace(/`([^`]+)`/g, '$1')
    return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer">
      <div onClick={() => onView(note)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                {note.title || '无标题'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(note.created_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id, !note.is_pinned)
              }}
            >
              <Pin className={`h-4 w-4 ${note.is_pinned ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {getPreview(note.content)}
          </p>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(note)
          }}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          编辑
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          删除
        </Button>
      </CardFooter>
    </Card>
  )
}
