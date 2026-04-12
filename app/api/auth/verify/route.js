import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')

  if (!salonId || salonId === 'null' || salonId === 'undefined') {
    return NextResponse.json({ ok: true })
  }

  const { data: salon, error } = await supabase
    .from('salons')
    .select('status, expiry')
    .eq('id', salonId)
    .single()

  if (error || !salon) {
    return NextResponse.json({ error: 'Not found' }, { status: 403 })
  }

  const today = new Date().toISOString().split('T')[0]

  if (salon.status === 'inactive') {
    return NextResponse.json({ error: 'inactive' }, { status: 403 })
  }

  if (salon.expiry < today) {
    return NextResponse.json({ error: 'expired' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
