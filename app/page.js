"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Error fix: Import zaroori hai
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, MessageCircle, DollarSign, FileText
} from 'lucide-react';

export default function LuxeSalonApp() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [stats, setStats] = useState({ totalCustomers: 0, todayVisits: 0, dailyIncome: 0, monthlyIncome: 0 });
  const router = useRouter();

  // 1. Auth Check & Fetch Stats
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(loggedInUser));
      fetchGlobalStats();
    }
  }, []);

  async function fetchGlobalStats() {
    // Total Customers
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    
    // Today's Data
    const today = new Date().toISOString().split('T')[0];
    const { data: todayVisits } = await supabase.from('visits').select('amount').eq('date', today);
    const todayIncome = todayVisits?.reduce((sum, v) => sum + Number(v.amount), 0) || 0;

    setStats(prev => ({
      ...prev,
      totalCustomers: count || 0,
      todayVisits: todayVisits?.length || 0,
      dailyIncome: todayIncome
    }));
  }

  if (!user) return <div className="bg-black h-screen flex items-center justify-center text-[#C9A84C]">Loading LuxeSalon...</div>;

  return (
    <div className="flex h-screen bg-black text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0B] border-r border-[#C9A84C1A] flex flex-col">
        <div className="p-8">
          <div className="text-[#C9A84C] text-2xl font-serif font-bold tracking-tighter">LuxeSalon</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mt-1">Priya Beauty Studio</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<FileText size={18}/>} label="Reports" active={activePage === 'reports'} onClick={() => setActivePage('reports')} />
          <NavItem icon={<MessageCircle size={18} className="text-green-600"/>} label="WhatsApp Reminders" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>

        <div className="p-6 mt-auto border-t border-[#C9A84C1A]">
          <div className="flex items-center gap-3 mb-6 p-2 bg-white/5 rounded-xl">
            <div className="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center text-black font-bold text-sm">PS</div>
            <div>
              <div className="text-xs font-bold">{user.name}</div>
              <div className="text-[10px] text-gray-500 uppercase">Owner</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('user'); router.push('/login'); }} className="flex items-center gap-2 text-red-500 text-xs font-bold w-full px-2 hover:opacity-80 transition-all">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
        <header className="h-20 border-b border-[#C9A84C1A] flex items-center justify-between px-10">
          <h2 className="text-2xl font-serif capitalize">{activePage.replace('-', ' ')}</h2>
          <button 
            onClick={() => setShowVisitModal(true)}
            className="bg-[#C9A84C] text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#C9A84C22]"
          >
            <Plus size={18}/> Add Visit
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {activePage === 'dashboard' && <DashboardView stats={stats} />}
          {activePage === 'customers' && <CustomersList />}
          {activePage === 'visits' && <VisitHistory />}
          {activePage === 'whatsapp' && <WhatsAppReminders />}
        </div>
      </main>

      {/* Record Visit Modal */}
      {showVisitModal && <VisitModal onClose={() => { setShowVisitModal(false); fetchGlobalStats(); }} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-[#C9A84C12] text-[#C9A84C] border border-[#C9A84C1A]' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon} <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function DashboardView({ stats }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={<Users size={24}/>} />
        <StatCard label="Today's Visits" value={stats.todayVisits} icon={<Scissors size={24}/>} />
        <StatCard label="Daily Income" value={`₹${stats.dailyIncome}`} icon={<DollarSign size={24}/>} color="text-green-500" />
      </div>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#0D0D0E] border border-[#C9A84C1A] p-8 rounded-[2rem] h-80 flex items-center justify-center text-gray-600 italic">
          Income Chart will load from database...
        </div>
        <div className="bg-[#0D0D0E] border border-[#C9A84C1A] p-8 rounded-[2rem] h-80 flex items-center justify-center text-gray-600 italic">
          Payment Breakdown will load...
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#0D0D0E] border border-[#C9A84C1A] p-8 rounded-[2rem] hover:border-[#C9A84C44] transition-all group">
      <div className="text-[#C9A84C] mb-4 bg-[#C9A84C0A] w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-4xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}

function VisitHistory() {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    async function loadVisits() {
      const { data } = await supabase
        .from('visits')
        .select(`*, customers(name, mobile)`)
        .order('date', { ascending: false });
      setVisits(data || []);
    }
    loadVisits();
  }, []);

  return (
    <div className="bg-[#0D0D0E] border border-[#C9A84C1A] rounded-[2rem] overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[#C9A84C] text-[10px] uppercase tracking-widest">
          <tr>
            <th className="p-6">Customer</th>
            <th className="p-6">Service</th>
            <th className="p-6">Amount</th>
            <th className="p-6">Date</th>
            <th className="p-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {visits.map((v) => (
            <tr key={v.id} className="hover:bg-white/5 transition-colors">
              <td className="p-6 font-bold">{v.customers?.name} <br/><span className="text-[10px] text-gray-500 font-normal">{v.customers?.mobile}</span></td>
              <td className="p-6 text-gray-300">{v.service}</td>
              <td className="p-6 text-[#C9A84C] font-bold">₹{v.amount}</td>
              <td className="p-6 text-gray-500">{v.date}</td>
              <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${v.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{v.payment_status.toUpperCase()}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VisitModal({ onClose }) {
  const [form, setForm] = useState({ name: '', mobile: '', service: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'paid', method: 'cash' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Get or Create Customer
    let { data: cust } = await supabase.from('customers').select('id').eq('mobile', form.mobile).single();
    if (!cust) {
      const { data: newCust } = await supabase.from('customers').insert([{ name: form.name, mobile: form.mobile }]).select().single();
      cust = newCust;
    }

    // 2. Insert Visit
    await supabase.from('visits').insert([{
      customer_id: cust.id, service: form.service, amount: Number(form.amount),
      date: form.date, payment_status: form.status, payment_method: form.method
    }]);

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-[#0D0D0E] border border-[#C9A84C1A] p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[#C9A84C] text-2xl font-serif">Record New Visit</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X/></button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-5">
          <input placeholder="Client Name" className="col-span-1 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" onChange={e => setForm({...form, name: e.target.value})} required/>
          <input placeholder="Mobile Number" className="col-span-1 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" onChange={e => setForm({...form, mobile: e.target.value})} required/>
          <input placeholder="Service (Haircut, Facial...)" className="col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" onChange={e => setForm({...form, service: e.target.value})} required/>
          <input type="number" placeholder="Amount (₹)" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" onChange={e => setForm({...form, amount: e.target.value})} required/>
          <input type="date" value={form.date} className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none text-gray-400" onChange={e => setForm({...form, date: e.target.value})}/>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, status: e.target.value})}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, method: e.target.value})}>
            <option value="cash">Cash</option>
            <option value="online">Online / UPI</option>
          </select>
          <button disabled={loading} className="col-span-2 bg-[#C9A84C] text-black font-bold py-4 rounded-2xl mt-4 hover:bg-[#E2C97E] transition-all">
            {loading ? "Saving Record..." : "Save Visit Record"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Placeholder components for other pages
function CustomersList() { return <div className="text-gray-500 text-center p-20 border border-dashed border-white/10 rounded-3xl">Searchable Customer List Coming Soon...</div>; }
function WhatsAppReminders() { return <div className="text-gray-500 text-center p-20 border border-dashed border-white/10 rounded-3xl">Reminders for 30+ days inactive customers...</div>; }