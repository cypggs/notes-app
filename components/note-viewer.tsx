"use client"

import { NoteWithTags } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { Pin, Calendar } from 'lucide-react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface NoteViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: NoteWithTags | null
}

export function NoteViewer({ open, onOpenChange, note }: NoteViewerProps) {
  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw] p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl break-words pr-2">
            {note.is_pinned && <Pin className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-current flex-shrink-0" />}
            <span className="break-words overflow-wrap-anywhere">{note.title || '无标题'}</span>
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-2 flex-wrap">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="break-words">创建于 {formatDate(note.created_at)}</span>
            {note.updated_at !== note.created_at && (
              <span className="break-words">• 更新于 {formatDate(note.updated_at)}</span>
            )}
          </div>
        </DialogHeader>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 py-3 border-b">
            {note.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="py-3 sm:py-4 prose prose-sm max-w-none dark:prose-invert
          [&_*]:break-words [&_*]:overflow-wrap-anywhere
          [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:text-xs [&_pre]:sm:text-sm
          [&_code]:break-words [&_code]:whitespace-pre-wrap [&_code]:text-xs [&_code]:sm:text-sm
          [&_img]:max-w-full [&_img]:h-auto
          [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:text-xs [&_table]:sm:text-sm
          [&_iframe]:max-w-full
          [&_p]:text-sm [&_p]:sm:text-base
          [&_h1]:text-lg [&_h1]:sm:text-2xl
          [&_h2]:text-base [&_h2]:sm:text-xl
          [&_h3]:text-sm [&_h3]:sm:text-lg">
          <div data-color-mode="light" className="dark:hidden">
            <MDEditor source={note.content} style={{ background: 'transparent', whiteSpace: 'normal', wordBreak: 'break-word' }} />
          </div>
          <div data-color-mode="dark" className="hidden dark:block">
            <MDEditor source={note.content} style={{ background: 'transparent', whiteSpace: 'normal', wordBreak: 'break-word' }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
