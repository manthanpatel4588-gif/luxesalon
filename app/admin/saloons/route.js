import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: salons, error } = await supabase
    .from('salons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const salonsWithCount = await Promise.all(salons.map(async s => {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', s.id)
    return { ...s, customer_count: count || 0 }
  }))

  return NextResponse.json(salonsWithCount)
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, owner_name, email, password, phone, status, expiry } = body

    // Check karo email already exist to nahi karta
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })
    }

    // Salon banao
    const { data: salon, error: salonErr } = await supabase
      .from('salons')
      .insert({ name, owner_name, email, phone, status, expiry })
      .select()
      .single()

    if (salonErr) return NextResponse.json({ error: salonErr.message }, { status: 500 })

    // User banao
    const { error: userErr } = await supabase
      .from('users')
      .insert({
        role: 'owner',
        email,
        name: owner_name,
        password,
        salon_id: salon.id
      })

    if (userErr) {
      await supabase.from('salons').delete().eq('id', salon.id)
      return NextResponse.json({ error: userErr.message }, { status: 500 })
    }

    return NextResponse.json(salon, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const body = await req.json()
    const { id, password, ...updates } = body

    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (password) {
      await supabase.from('users').update({ password }).eq('salon_id', id)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}