import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')
  const { data, error } = await supabase
    .from('visits')
    .select('*, customers(name, mobile)')
    .eq('salon_id', salonId)
    .order('date', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('visits')
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req) {
  const body = await req.json()
  const { id, ...updates } = body
  const { data, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const id = req.nextUrl.searchParams.get('id')
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}