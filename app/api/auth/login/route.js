import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { email, password } = await req.json()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Get user profile from your users table
  const { data: user } = await supabase
    .from('users')
    .select('*, salons(*)')
    .eq('email', email)
    .single()

  // Block if salon is inactive or expired
  if (user.role === 'owner') {
    if (user.salons?.status === 'inactive') {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 403 })
    }
    const today = new Date().toISOString().split('T')[0]
    if (user.salons?.expiry < today) {
      return NextResponse.json({ error: 'License expired' }, { status: 403 })
    }
  }

  return NextResponse.json({
    user,
    token: data.session.access_token
  })
}