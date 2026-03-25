import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - 30)
  const threshStr = threshold.toISOString().split('T')[0]

  const { data: customers } = await supabase
    .from('customers')
    .select('*, visits(*)')
    .eq('salon_id', salonId)

  const inactive = (customers || []).filter(c => {
    const visits = c.visits || []
    if (!visits.length) return true
    const last = visits.sort((a, b) => b.date.localeCompare(a.date))[0]
    return last.date < threshStr
  }).map(c => {
    const visits = (c.visits || []).sort((a, b) => b.date.localeCompare(a.date))
    return { id: c.id, name: c.name, mobile: c.mobile, lastVisit: visits[0]?.date || 'Never' }
  })

  return NextResponse.json(inactive)
}