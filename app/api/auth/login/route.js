import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    // 1. User fetch karo
    const { data: user, error } = await supabase
      .from('users')
      .select('*, salons(*)')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // 2. Password check
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // 3. Owner ke liye salon status + expiry check
    if (user.role === 'owner') {

      // Salon exist karta hai?
      if (!user.salons) {
        return NextResponse.json({ error: 'No salon linked to this account' }, { status: 403 })
      }

      // Salon inactive hai?
       if (user.salons.status === 'inactive') {
        return NextResponse.json({ 
          error: '⛔ Your account has been deactivated. Please contact admin to reactivate.'
        }, { status: 403 })
      }

      const today = new Date().toISOString().split('T')[0]
      if (user.salons.expiry < today) {
        return NextResponse.json({ 
          error: '⏰ Your license has expired. Please renew your plan to continue.'
        }, { status: 403 })
      }
    }

    // 4. Success
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
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 })
  }
}