import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Database se user fetch karo (saath mein salon details bhi)
    const { data: user, error } = await supabase
      .from('users')
      .select('*, salons(*)')
      .eq('email', email)
      .single();

    // 2. Check karo agar user mila ya nahi
    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // 3. Password Check (Direct comparison kyunki aapne hash nahi kiya hai)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 4. Status aur Expiry check (Jo aapne pehle likha tha)
    if (user.role === 'owner' && user.salons) {
      if (user.salons.status === 'inactive') {
        return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
      }
      
      const today = new Date().toISOString().split('T')[0];
      if (user.salons.expiry < today) {
        return NextResponse.json({ error: 'License expired' }, { status: 403 });
      }
    }

    // 5. Success! User bhej do
    return NextResponse.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      salon: user.salons 
    });

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}