"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, MessageCircle, DollarSign, FileText, Calendar
} from 'lucide-react';

export default function LuxeSalonApp() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [stats, setStats] = useState({ 
    totalCustomers: 0, todayVisits: 0, dailyIncome: 0, 
    monthlyIncome: 0, cashToday: 0, onlineToday: 0, pendingToday: 0 
  });
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) { router.push('/login'); } 
    else { 
      setUser(JSON.parse(loggedInUser));
      fetchData(); 
    }
  }, []);

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Total Customers
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    
    // 2. Today's Data & Breakdowns
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
      pendingToday: pending,
      monthlyIncome: daily // Monthly calculation can be added later
    });
  }

  if (!user) return <div className="bg-black h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-black text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar - Same as SS */}
      <aside className="w-64 bg-[#0A0A0B] border-r border-[#C9A84C1A] flex flex-col">
        <div className="p-8">
          <div className="text-[#C9A84C] text-2xl font-serif font-bold">LuxeSalon</div>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Priya Beauty Studio</div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<FileText size={18}/>} label="Reports" active={activePage === 'reports'} onClick={() => setActivePage('reports')} />
          <NavItem icon={<MessageCircle size={18}/>} label="WhatsApp Reminders" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>
        <div className="p-6 border-t border-white/5">
           <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4">
              <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center text-black font-bold">P</div>
              <div className="text-xs font-bold">Priya Sharma <br/><span className="text-[10px] text-gray-500 font-normal uppercase">Owner</span></div>
           </div>
           <button onClick={() => { localStorage.removeItem('user'); router.push('/login'); }} className="text-red-500 text-xs font-bold flex items-center gap-2"><LogOut size={14}/> Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-serif capitalize">{activePage}</h2>
          <div className="text-gray-500 text-sm flex items-center gap-2"><Calendar size={14}/> {new Date().toDateString()}</div>
        </header>

        {activePage === 'dashboard' && <DashboardView stats={stats} />}
        {activePage === 'customers' && <CustomersView />}
        {activePage === 'visits' && <VisitHistoryView />}
        {activePage === 'reports' && <ReportsView />}
        {activePage === 'whatsapp' && <WhatsAppView />}

        {showVisitModal && <VisitModal onClose={() => { setShowVisitModal(false); fetchData(); }} />}
      </main>

      {/* Floating Add Button */}
      <button onClick={() => setShowVisitModal(true)} className="fixed bottom-10 right-10 bg-[#C9A84C] text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40"><Plus size={28}/></button>
    </div>
  );
}

// --- Dashboard Component ---
function DashboardView({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-10">
      <StatCard label="Total Customers" value={stats.totalCustomers} icon={<Users size={20}/>} />
      <StatCard label="Today's Visits" value={stats.todayVisits} icon={<Scissors size={20}/>} />
      <StatCard label="Daily Income" value={`₹${stats.dailyIncome}`} icon={<DollarSign size={20}/>} color="text-green-500" />
      <StatCard label="Cash Today" value={`₹${stats.cashToday}`} icon={<DollarSign size={20}/>} />
      <StatCard label="Online Today" value={`₹${stats.onlineToday}`} icon={<DollarSign size={20}/>} color="text-blue-400" />
      <StatCard label="Pending Payments" value={`₹${stats.pendingToday}`} icon={<DollarSign size={20}/>} color="text-red-500" />
    </div>
  );
}

// --- Master Visit Modal (With Toggle) ---
function VisitModal({ onClose }) {
  const [customerType, setCustomerType] = useState('new'); // Existing vs New
  const [form, setForm] = useState({ name: '', mobile: '', service: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'paid', method: 'cash' });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function getCustomers() {
      const { data } = await supabase.from('customers').select('*').order('name');
      setCustomers(data || []);
    }
    getCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    let cid;
    if (customerType === 'new') {
      const { data } = await supabase.from('customers').insert([{ name: form.name, mobile: form.mobile }]).select().single();
      cid = data.id;
    } else {
      cid = form.customer_id;
    }

    await supabase.from('visits').insert([{
      customer_id: cid, service: form.service, amount: Number(form.amount),
      date: form.date, payment_status: form.status, payment_method: form.method
    }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-xl">
        <h3 className="text-2xl font-serif text-[#C9A84C] mb-6">Record New Visit</h3>
        
        {/* Toggle Switch */}
        <div className="flex bg-black p-1 rounded-xl mb-8">
          <button onClick={() => setCustomerType('existing')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${customerType === 'existing' ? 'bg-[#C9A84C] text-black' : 'text-gray-500'}`}>Existing Customer</button>
          <button onClick={() => setCustomerType('new')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${customerType === 'new' ? 'bg-[#C9A84C] text-black' : 'text-gray-500'}`}>New Customer</button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {customerType === 'new' ? (
            <>
              <input placeholder="Full Name" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, name: e.target.value})} required/>
              <input placeholder="Mobile" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, mobile: e.target.value})} required/>
            </>
          ) : (
            <select className="col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, customer_id: e.target.value})} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          )}
          <input placeholder="Services (e.g. Haircut, Blow Dry)" className="col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, service: e.target.value})} required/>
          <input type="number" placeholder="Amount (₹)" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, amount: e.target.value})} required/>
          <input type="date" value={form.date} className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, date: e.target.value})}/>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none text-xs" onChange={e => setForm({...form, status: e.target.value})}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none text-xs" onChange={e => setForm({...form, method: e.target.value})}>
            <option value="cash">Cash</option>
            <option value="online">Online / UPI</option>
          </select>
          <button className="col-span-2 bg-[#C9A84C] text-black font-bold py-4 rounded-2xl mt-4">Save Visit</button>
          <button type="button" onClick={onClose} className="col-span-2 text-gray-500 text-sm mt-2">Cancel</button>
        </form>
      </div>
    </div>
  );
}

// --- Customer View (With Edit Option) ---
function CustomersView() {
  const [list, setList] = useState([]);
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('customers').select('*').order('name');
      setList(data || []);
    }
    load();
  }, []);

  return (
    <div className="bg-[#0D0D0E] border border-white/5 rounded-[2rem] overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-[#C9A84C] uppercase text-[10px] tracking-widest">
          <tr><th className="p-6">Name</th><th className="p-6">Mobile</th><th className="p-6">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {list.map(c => (
            <tr key={c.id} className="hover:bg-white/5">
              <td className="p-6 font-bold">{c.name}</td>
              <td className="p-6 text-gray-500">{c.mobile}</td>
              <td className="p-6 flex gap-3"><Edit size={16} className="text-gray-500 cursor-pointer"/><Trash2 size={16} className="text-red-900 cursor-pointer"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Shared Components ---
function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-[#C9A84C12] text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
      {icon} <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#0D0D0E] border border-white/5 p-8 rounded-[2rem]">
      <div className="text-[#C9A84C] mb-4 bg-[#C9A84C0A] w-10 h-10 flex items-center justify-center rounded-xl">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-3xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Placeholder Views for others
function VisitHistoryView() { return <div className="p-20 text-center text-gray-600">List of all historical visits...</div>; }
function ReportsView() { return <div className="p-20 text-center text-gray-600">Daily/Monthly Income reports with filters...</div>; }
function WhatsAppView() { return <div className="p-20 text-center text-gray-600">Reminders for inactive clients...</div>; }