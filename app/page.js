"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, MessageCircle, DollarSign, FileText, Calendar
} from 'lucide-react';

// --- MAIN APP COMPONENT ---
export default function LuxeSalonApp() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [stats, setStats] = useState({ 
    totalCustomers: 0, todayVisits: 0, dailyIncome: 0, 
    cashToday: 0, onlineToday: 0, pendingToday: 0 
  });
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(loggedInUser));
      fetchData();
    }
  }, []);

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Fetch Customers Count
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    
    // 2. Fetch Today's Visits for Stats
    const { data: visits } = await supabase.from('visits').select('*').eq('date', today);
    
    let daily = 0, cash = 0, online = 0, pending = 0;
    visits?.forEach(v => {
      const amt = Number(v.amount);
      if (v.payment_status === 'paid') {
        daily += amt;
        if (v.payment_method === 'cash') cash += amt;
        else online += amt;
      } else {
        pending += amt;
      }
    });

    setStats({
      totalCustomers: count || 0,
      todayVisits: visits?.length || 0,
      dailyIncome: daily,
      cashToday: cash,
      onlineToday: online,
      pendingToday: pending
    });
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar (Based on your HTML file) */}
      <aside className="w-60 bg-[#111113] border-r border-[rgba(201,168,76,0.15)] flex flex-col">
        <div className="p-6 border-b border-[rgba(201,168,76,0.15)]">
          <div className="text-[#C9A84C] text-xl font-serif font-bold tracking-widest uppercase">LuxeSalon</div>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Priya Beauty Studio</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<FileText size={18}/>} label="Reports" active={activePage === 'reports'} onClick={() => setActivePage('reports')} />
          <NavItem icon={<MessageCircle size={18}/>} label="WhatsApp" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>

        <div className="p-4 border-t border-[rgba(201,168,76,0.15)]">
          <div className="flex items-center gap-3 p-3 bg-[#18181C] rounded-lg border border-[rgba(201,168,76,0.1)]">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center text-black font-bold text-xs">{user.name[0]}</div>
            <div className="text-xs truncate font-medium">{user.name}</div>
            <button onClick={() => { localStorage.removeItem('user'); router.push('/login'); }} className="text-gray-500 hover:text-red-500 ml-auto"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[rgba(201,168,76,0.15)] bg-[#111113] flex items-center justify-between px-8">
          <h2 className="text-xl font-serif capitalize">{activePage}</h2>
          <button onClick={() => setShowVisitModal(true)} className="bg-[#C9A84C] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#E2C97E] transition-all">
            <Plus size={18}/> Record Visit
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {activePage === 'dashboard' && <DashboardView stats={stats} />}
          {activePage === 'customers' && <CustomersView />}
          {activePage === 'visits' && <VisitHistoryView />}
          {activePage === 'reports' && <ReportsView salonId={user.salon_id} />}
        </section>
      </main>

      {/* VISIT MODAL (The Master Form you wanted) */}
      {showVisitModal && <VisitModal onClose={() => { setShowVisitModal(false); fetchData(); }} />}
    </div>
  );
}

// --- DASHBOARD COMPONENT ---
function DashboardView({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Total Customers" value={stats.totalCustomers} icon={<Users />} color="text-[#C9A84C]" />
      <StatCard label="Today's Visits" value={stats.todayVisits} icon={<Scissors />} />
      <StatCard label="Daily Income" value={`₹${stats.dailyIncome}`} icon={<DollarSign />} color="text-green-500" />
      <StatCard label="Cash Today" value={`₹${stats.cashToday}`} icon={<DollarSign />} />
      <StatCard label="Online Today" value={`₹${stats.onlineToday}`} icon={<DollarSign />} color="text-blue-400" />
      <StatCard label="Pending Payments" value={`₹${stats.pendingToday}`} icon={<DollarSign />} color="text-red-500" />
    </div>
  );
}

// --- VISIT MODAL (The one with Existing/New Toggle) ---
function VisitModal({ onClose }) {
  const [customerType, setCustomerType] = useState('new');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    name: '', mobile: '', service: '', amount: '', 
    date: new Date().toISOString().split('T')[0], 
    status: 'paid', method: 'cash', customer_id: '' 
  });

  useEffect(() => {
    supabase.from('customers').select('*').then(({ data }) => setCustomers(data || []));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let cid = form.customer_id;
      if (customerType === 'new') {
        const { data } = await supabase.from('customers').insert([{ name: form.name, mobile: form.mobile }]).select().single();
        cid = data.id;
      }
      await supabase.from('visits').insert([{
        customer_id: cid, service: form.service, amount: Number(form.amount),
        date: form.date, payment_status: form.status, payment_method: form.method
      }]);
      onClose();
    } catch (err) { alert("Error saving visit!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-[rgba(201,168,76,0.3)] p-8 rounded-2xl w-full max-w-lg">
        <div className="flex bg-[#18181C] p-1 rounded-xl mb-6">
          <button onClick={() => setCustomerType('existing')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${customerType === 'existing' ? 'bg-[#C9A84C] text-black' : 'text-gray-500'}`}>Existing</button>
          <button onClick={() => setCustomerType('new')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${customerType === 'new' ? 'bg-[#C9A84C] text-black' : 'text-gray-500'}`}>New Customer</button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          {customerType === 'new' ? (
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Name" className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, name: e.target.value})} required/>
              <input placeholder="Mobile" className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, mobile: e.target.value})} required/>
            </div>
          ) : (
            <select className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, customer_id: e.target.value})} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          )}
          <input placeholder="Service Done" className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, service: e.target.value})} required/>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Amount" className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, amount: e.target.value})} required/>
            <input type="date" value={form.date} className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, date: e.target.value})} required/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, status: e.target.value})}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select className="bg-black border border-white/10 p-3 rounded-lg outline-none" onChange={e => setForm({...form, method: e.target.value})}>
              <option value="cash">Cash</option>
              <option value="online">Online/UPI</option>
            </select>
          </div>
          <button className="w-full bg-[#C9A84C] text-black font-bold py-3 rounded-lg mt-4">{loading ? "Saving..." : "Save Visit"}</button>
          <button type="button" onClick={onClose} className="w-full text-gray-500 text-sm">Cancel</button>
        </form>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-[rgba(201,168,76,0.1)] text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] p-6 rounded-xl relative overflow-hidden group hover:border-[rgba(201,168,76,0.4)] transition-all">
      <div className="text-[#C9A84C] opacity-20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform">{React.cloneElement(icon, { size: 64 })}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-3xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}

function CustomersView() {
  const [list, setList] = useState([]);
  useEffect(() => {
    supabase.from('customers').select('*').order('name').then(({ data }) => setList(data || []));
  }, []);

  return (
    <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#18181C] text-[#C9A84C] text-[10px] uppercase tracking-widest font-bold">
          <tr><th className="p-4">Name</th><th className="p-4">Mobile</th><th className="p-4 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
          {list.map(c => (
            <tr key={c.id} className="hover:bg-white/5">
              <td className="p-4 font-bold">{c.name}</td>
              <td className="p-4 text-gray-500">{c.mobile}</td>
              <td className="p-4 text-right flex justify-end gap-2"><Edit size={16} className="text-gray-500 cursor-pointer"/><Trash2 size={16} className="text-red-900 cursor-pointer"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VisitHistoryView() {
  const [visits, setVisits] = useState([]);
  useEffect(() => {
    supabase.from('visits').select(`*, customers(name, mobile)`).order('date', {ascending: false}).then(({data}) => setVisits(data || []));
  }, []);

  return (
    <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] rounded-xl overflow-hidden">
      <table className="w-full text-left text-xs md:text-sm">
        <thead className="bg-[#18181C] text-[#C9A84C] uppercase text-[10px] tracking-widest">
          <tr><th className="p-4">Customer</th><th className="p-4">Service</th><th className="p-4">Amount</th><th className="p-4">Date</th><th className="p-4">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
          {visits.map(v => (
            <tr key={v.id} className="hover:bg-white/5">
              <td className="p-4 font-bold">{v.customers?.name}</td>
              <td className="p-4 text-gray-400">{v.service}</td>
              <td className="p-4 text-[#C9A84C]">₹{v.amount}</td>
              <td className="p-4 text-gray-500">{v.date}</td>
              <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{v.payment_status.toUpperCase()}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsView() {
  return <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-gray-500 italic">Financial Reports generated here with date filters.</div>;
}