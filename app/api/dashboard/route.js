import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const salonId = req.nextUrl.searchParams.get('salon_id')

  const [{ data: visits }, { data: customers }] = await Promise.all([
    supabase.from('visits').select('*').eq('salon_id', salonId),
    supabase.from('customers').select('id').eq('salon_id', salonId),
  ])

  const todayStr = new Date().toISOString().split('T')[0]
  const thisMonth = todayStr.slice(0, 7)

  const todayVisits = (visits || []).filter(v => v.date === todayStr)
  const monthVisits = (visits || []).filter(v => v.date?.startsWith(thisMonth))
  const paid = v => v.payment_status === 'paid'

  // Monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const m = d.toISOString().slice(0, 7)
    const mv = (visits || []).filter(v => v.date?.startsWith(m) && paid(v))
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      income: mv.reduce((s, v) => s + Number(v.amount), 0),
      count: mv.length
    }
  })

  // Payment breakdown
  const allPaid = (visits || []).filter(paid)
  const paymentBreakdown = {
    cash: allPaid.filter(v => v.payment_method === 'cash').reduce((s, v) => s + Number(v.amount), 0),
    online: allPaid.filter(v => ['upi', 'online', 'card'].includes(v.payment_method)).reduce((s, v) => s + Number(v.amount), 0),
    pending: (visits || []).filter(v => v.payment_status === 'pending').reduce((s, v) => s + Number(v.amount), 0),
  }

  return NextResponse.json({
    totalCustomers: (customers || []).length,
    todayCustomers: todayVisits.length,
    dailyIncome: todayVisits.filter(paid).reduce((s, v) => s + Number(v.amount), 0),
    monthlyIncome: monthVisits.filter(paid).reduce((s, v) => s + Number(v.amount), 0),
    cashToday: todayVisits.filter(v => paid(v) && v.payment_method === 'cash').reduce((s, v) => s + Number(v.amount), 0),
    onlineToday: todayVisits.filter(v => paid(v) && v.payment_method !== 'cash').reduce((s, v) => s + Number(v.amount), 0),
    pendingPayments: (visits || []).filter(v => v.payment_status === 'pending').reduce((s, v) => s + Number(v.amount), 0),
    monthlyData,
    paymentBreakdown,
  })
}