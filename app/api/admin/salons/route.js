import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET - all salons with customer count
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

// POST - create salon + user (custom users table mein)
export async function POST(req) {
  try {
    const { name, owner_name, email, password, phone, status, expiry } = await req.json()

    // 1. Check email already exists in our custom users table
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 400 })
    }

    // 2. Create salon first
    const { data: salon, error: salonErr } = await supabase
      .from('salons')
      .insert({ name, owner_name, email, phone, status, expiry })
      .select()
      .single()

    if (salonErr) {
      return NextResponse.json({ error: salonErr.message }, { status: 500 })
    }

    // 3. Create user in OUR custom users table (not auth.users)
    const { error: userErr } = await supabase
      .from('users')
      .insert({
        role: 'owner',
        email: email,
        name: owner_name,
        password: password,
        salon_id: salon.id
      })

    if (userErr) {
      // Rollback salon
      await supabase.from('salons').delete().eq('id', salon.id)
      return NextResponse.json({ error: userErr.message }, { status: 500 })
    }

    return NextResponse.json(salon, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT - update salon
export async function PUT(req) {
  try {
    const { id, password, ...updates } = await req.json()

    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Password update if provided
    if (password) {
      await supabase
        .from('users')
        .update({ password })
        .eq('salon_id', id)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}