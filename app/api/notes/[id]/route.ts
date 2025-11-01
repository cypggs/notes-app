import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, content, is_pinned, tags } = body

    // 更新笔记
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .update({ title, content, is_pinned })
      .eq('id', id)
      .select()
      .single()

    if (noteError) throw noteError

    // 如果提供了标签，更新标签关联
    if (tags !== undefined) {
      // 删除旧的关联
      await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', id)

      // 创建新的关联
      if (tags.length > 0) {
        const noteTags = tags.map((tagId: string) => ({
          note_id: id,
          tag_id: tagId
        }))

        const { error: tagError } = await supabase
          .from('note_tags')
          .insert(noteTags)

        if (tagError) throw tagError
      }
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
