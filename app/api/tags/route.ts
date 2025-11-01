import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(tags || [])
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, color } = body

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({ name, color })
      .select()
      .single()

    if (error) {
      // 如果标签已存在，返回现有标签
      if (error.code === '23505') {
        const { data: existingTag } = await supabase
          .from('tags')
          .select('*')
          .eq('name', name)
          .single()

        return NextResponse.json(existingTag)
      }
      throw error
    }

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
