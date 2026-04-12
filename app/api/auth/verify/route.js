import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')

  if (!salonId || salonId === 'null' || salonId === 'undefined') {
    return NextResponse.json({ ok: true })
  }

  const { data: salon } = await supabase
    .from('salons')
    .select('status, expiry')
    .eq('id', salonId)
    .single()

  if (!salon) return NextResponse.json({ error: 'not found' }, { status: 403 })

  const today = new Date().toISOString().split('T')[0]

  if (salon.status === 'inactive' || salon.expiry < today) {
    return NextResponse.json({ error: 'blocked' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}