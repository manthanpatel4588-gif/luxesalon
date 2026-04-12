import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const { data: user, error } = await supabase
      .from('users')
      .select('*, salons(*)')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    if (user.role === 'owner') {
      if (!user.salons) {
        return NextResponse.json({ 
          error: 'No salon linked. Contact admin.' 
        }, { status: 403 })
      }

      if (user.salons.status === 'inactive') {
        return NextResponse.json({ 
          error: '⛔ Your account is deactivated. Contact admin to reactivate.' 
        }, { status: 403 })
      }

      const today = new Date().toISOString().split('T')[0]
      if (user.salons.expiry < today) {
        return NextResponse.json({ 
          error: '⏰ Your plan has expired. Please renew to continue.' 
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        salon_id: user.salon_id
      },
      salon: user.salons
    })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}