import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')
  
  // ✅ Add this check
  if (!salonId) return NextResponse.json([], { status: 200 })
  
  const { data, error } = await supabase
    .from('customers')
    .select('*, visits(*)')
    .eq('salon_id', salonId)
  if (error) return NextResponse.json({ error }, { status: 500 })
  // ...rest same

  // Process: add lastVisit, lastService, totalAmount
  const processed = data.map(c => {
    const visits = (c.visits || []).sort((a, b) => b.date.localeCompare(a.date))
    const last = visits[0]
    return {
      ...c,
      lastVisit: last?.date || null,
      lastService: last?.service || null,
      totalAmount: visits.filter(v => v.payment_status === 'paid').reduce((s, v) => s + Number(v.amount), 0)
    }
  })
  return NextResponse.json(processed)
}

export async function POST(req) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('customers')
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
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req) {
  const id = req.nextUrl.searchParams.get('id')
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}