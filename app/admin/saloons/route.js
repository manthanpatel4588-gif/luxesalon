import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - all salons with customer count
export async function GET() {
  const { data: salons, error } = await supabase
    .from('salons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Get customer counts
  const salonsWithCount = await Promise.all(salons.map(async s => {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', s.id)
    return { ...s, customer_count: count || 0 }
  }))

  return NextResponse.json(salonsWithCount)
}

// POST - create new salon + user
export async function POST(req) {
  const body = await req.json()
  const { name, owner_name, email, password, phone, status, expiry } = body

  try {
    // 1. Create salon
    const { data: salon, error: salonErr } = await supabase
      .from('salons')
      .insert({ name, owner_name, email, phone, status, expiry })
      .select()
      .single()

    if (salonErr) return NextResponse.json({ error: salonErr.message }, { status: 500 })

    // 2. Create user with hashed password (or plain for now)
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
      // Rollback salon if user creation fails
      await supabase.from('salons').delete().eq('id', salon.id)
      return NextResponse.json({ error: 'Email already exists or user creation failed' }, { status: 400 })
    }

    // 3. Update salon with owner reference
    await supabase.from('salons').update({ owner_id: salon.id }).eq('id', salon.id)

    return NextResponse.json(salon, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT - update salon
export async function PUT(req) {
  const body = await req.json()
  const { id, password, ...updates } = body

  // Update salon
  const { data, error } = await supabase
    .from('salons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Update password if provided
  if (password) {
    await supabase.from('users').update({ password }).eq('salon_id', id)
  }

  // Sync email if changed
  if (updates.email) {
    await supabase.from('users').update({ email: updates.email, name: updates.owner_name }).eq('salon_id', id)
  }

  return NextResponse.json(data)
}