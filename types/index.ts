export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  is_pinned: boolean
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface NoteTag {
  note_id: string
  tag_id: string
}

export interface NoteWithTags extends Note {
  tags?: Tag[]
}
