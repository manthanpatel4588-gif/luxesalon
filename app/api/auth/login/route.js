import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    console.log('Login attempt:', email); // DEBUG

    const { data: user, error } = await supabase
      .from('users')
      .select('*, salons(*)')
      .eq('email', email)
      .single();

    console.log('User found:', user);  // DEBUG
    console.log('Error:', error);      // DEBUG

    if (error || !user) {
      return NextResponse.json({ error: 'User not found', debug: error?.message }, { status: 401 });
    }

    console.log('DB password:', user.password, '| Input password:', password); // DEBUG

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (user.role === 'owner' && user.salons) {
      if (user.salons.status === 'inactive') {
        return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
      }
      const today = new Date().toISOString().split('T')[0];
      if (user.salons.expiry < today) {
        return NextResponse.json({ error: 'License expired' }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      salon: user.salons 
    });

  } catch (err) {
    console.log('Server error:', err); // DEBUG
    return NextResponse.json({ error: 'Server error', debug: err.message }, { status: 500 });
  }
}