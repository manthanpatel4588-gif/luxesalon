import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
 
export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')
  const start = req.nextUrl.searchParams.get('start')
  const end = req.nextUrl.searchParams.get('end')
 
  const { data: visits, error } = await supabase
    .from('visits')
    .select('*, customers(name, mobile)')
    .eq('salon_id', salonId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })
 
  if (error) return NextResponse.json({ error }, { status: 500 })
 
  const paid = v => v.payment_status === 'paid'
  return NextResponse.json({
    visits,
    totalCustomers: new Set(visits.map(v => v.customer_id)).size,
    totalIncome: visits.filter(paid).reduce((s, v) => s + Number(v.amount), 0),
    cashIncome: visits.filter(v => paid(v) && v.payment_method === 'cash').reduce((s, v) => s + Number(v.amount), 0),
    onlineIncome: visits.filter(v => paid(v) && v.payment_method !== 'cash').reduce((s, v) => s + Number(v.amount), 0),
    pendingPayments: visits.filter(v => v.payment_status === 'pending').reduce((s, v) => s + Number(v.amount), 0),
  })
}