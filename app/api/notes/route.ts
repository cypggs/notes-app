import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tagId = searchParams.get('tagId')

    let query = supabase
      .from('notes')
      .select(`
        *,
        note_tags(
          tag_id,
          tags(*)
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    // 如果有搜索关键词
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: notes, error } = await query

    if (error) throw error

    // 转换数据结构
    const notesWithTags = notes?.map(note => ({
      ...note,
      tags: note.note_tags?.map((nt: any) => nt.tags).filter(Boolean) || []
    })) || []

    // 如果有标签筛选
    let filteredNotes = notesWithTags
    if (tagId) {
      filteredNotes = notesWithTags.filter(note =>
        note.tags.some((tag: any) => tag.id === tagId)
      )
    }

    return NextResponse.json(filteredNotes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, tags } = body

    // 创建笔记
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({ title, content })
      .select()
      .single()

    if (noteError) throw noteError

    // 如果有标签，创建关联
    if (tags && tags.length > 0) {
      const noteTags = tags.map((tagId: string) => ({
        note_id: note.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('note_tags')
        .insert(noteTags)

      if (tagError) throw tagError
    }

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
