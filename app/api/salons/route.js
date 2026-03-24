import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('salons')
    .select('*, customers(count)')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()

  // Create salon
  const { data: salon } = await supabase
    .from('salons')
    .insert({
      name: body.name,
      owner_name: body.ownerName,
      email: body.email,
      phone: body.phone,
      status: body.status,
      expiry: body.expiry
    })
    .select()
    .single()

  // Create login in Supabase Auth
  await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true
  })

  // Create user profile
  await supabase.from('users').insert({
    role: 'owner',
    email: body.email,
    name: body.ownerName,
    salon_id: salon.id
  })

  return NextResponse.json(salon, { status: 201 })
}