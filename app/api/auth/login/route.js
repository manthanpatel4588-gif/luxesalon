import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    // Step 1: User fetch karo
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Step 2: Password check
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Step 3: Owner ke liye salon alag fetch karo
    if (user.role === 'owner') {
      if (!user.salon_id) {
        return NextResponse.json({ error: 'No salon linked. Contact admin.' }, { status: 403 })
      }

      // Salon alag se fetch karo
      const { data: salon } = await supabase
        .from('salons')
        .select('*')
        .eq('id', user.salon_id)
        .single()

      if (!salon) {
        return NextResponse.json({ error: 'Salon not found. Contact admin.' }, { status: 403 })
      }

      // Status check
      if (salon.status === 'inactive') {
        return NextResponse.json({
          error: '⛔ Your account is deactivated. Contact admin to reactivate.'
        }, { status: 403 })
      }

      // Expiry check
      const today = new Date().toISOString().split('T')[0]
      if (salon.expiry < today) {
        return NextResponse.json({
          error: '⏰ Your plan has expired. Please renew to continue.'
        }, { status: 403 })
      }

      // Success with salon
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          salon_id: user.salon_id
        },
        salon: salon
      })
    }

    // Admin ke liye
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        salon_id: null
      },
      salon: null
    })

  } catch (err) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 })
  }
}