"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, MessageCircle, DollarSign, FileText, Calendar
} from 'lucide-react';

// --- MAIN APP ---
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
    const { count: cCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
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
      totalCustomers: cCount || 0,
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
      {/* Sidebar */}
      <aside className="w-64 bg-[#111113] border-r border-[rgba(201,168,76,0.15)] flex flex-col">
        <div className="p-8 border-b border-[rgba(201,168,76,0.15)]">
          <div className="text-[#C9A84C] text-2xl font-serif font-bold tracking-widest uppercase">LuxeSalon</div>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em]">Priya Beauty Studio</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<FileText size={18}/>} label="Reports" active={activePage === 'reports'} onClick={() => setActivePage('reports')} />
          <NavItem icon={<MessageCircle size={18}/>} label="WhatsApp" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>

        <div className="p-6 border-t border-[rgba(201,168,76,0.15)]">
          <div className="flex items-center gap-3 p-3 bg-[#18181C] rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center text-black font-bold">{user.name[0]}</div>
            <div className="flex-1 truncate">
               <div className="text-xs font-bold">{user.name}</div>
               <div className="text-[10px] text-gray-500 uppercase font-bold">Owner</div>
            </div>
            <button onClick={() => { localStorage.removeItem('user'); router.push('/login'); }} className="text-gray-500 hover:text-red-500"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
        <header className="h-20 border-b border-[rgba(201,168,76,0.15)] flex items-center justify-between px-10">
          <h2 className="text-2xl font-serif capitalize">{activePage}</h2>
          <button onClick={() => setShowVisitModal(true)} className="bg-[#C9A84C] text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-[#C9A84C1A]">
            <Plus size={18}/> Record Visit
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {activePage === 'dashboard' && <DashboardView stats={stats} />}
          {activePage === 'customers' && <CustomersView />}
          {activePage === 'visits' && <VisitHistoryView />}
          {activePage === 'reports' && <ReportsView />}
        </div>
      </main>

      {showVisitModal && <VisitModal onClose={() => { setShowVisitModal(false); fetchData(); }} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-[#C9A84C12] text-[#C9A84C] border border-[#C9A84C1A]' : 'text-gray-500 hover:text-white'}`}>
      {icon} <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] p-8 rounded-[2.5rem] group hover:border-[#C9A84C33] transition-all">
      <div className="text-[#C9A84C] mb-4 bg-[#C9A84C0A] w-12 h-12 flex items-center justify-center rounded-2xl">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-4xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}

function DashboardView({ stats }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={<Users />} color="text-[#C9A84C]" />
        <StatCard label="Today's Visits" value={stats.todayVisits} icon={<Scissors />} />
        <StatCard label="Daily Income" value={`₹${stats.dailyIncome}`} icon={<DollarSign />} color="text-green-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <SmallStatCard label="Cash Today" value={`₹${stats.cashToday}`} />
         <SmallStatCard label="Online Today" value={`₹${stats.onlineToday}`} color="text-blue-400" />
         <SmallStatCard label="Pending Payments" value={`₹${stats.pendingToday}`} color="text-red-500" />
         <SmallStatCard label="Monthly Income" value={`₹${stats.dailyIncome}`} />
      </div>
    </div>
  );
}

function SmallStatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-white/5 p-6 rounded-3xl">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-2xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}

function VisitModal({ onClose, fetchData }) {
  const [type, setType] = useState('new');
  const [modalLoading, setModalLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    name: '', mobile: '', service: '', amount: '', 
    date: new Date().toISOString().split('T')[0], 
    status: 'paid', method: 'cash', customer_id: '' 
  });

  useEffect(() => {
    supabase.from('customers').select('*').order('name').then(({data}) => setCustomers(data || []));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let cid = form.customer_id;
      if (type === 'new') {
        const { data } = await supabase.from('customers').insert([{ name: form.name, mobile: form.mobile }]).select().single();
        cid = data.id;
      }
      await supabase.from('visits').insert([{
        customer_id: cid, service: form.service, amount: Number(form.amount),
        date: form.date, payment_status: form.status, payment_method: form.method
      }]);
      onClose();
    } catch (err) { alert("Error saving visit!"); }
    finally { setModalLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-[rgba(201,168,76,0.3)] p-10 rounded-[2.5rem] w-full max-w-xl">
        <h3 className="text-[#C9A84C] text-2xl font-serif mb-6 text-center">Record New Visit</h3>
        <div className="flex bg-black p-1 rounded-2xl mb-8 border border-white/5">
          <button onClick={() => setType('existing')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'existing' ? 'bg-[#C9A84C] text-black shadow-lg' : 'text-gray-500'}`}>Existing</button>
          <button onClick={() => setType('new')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'new' ? 'bg-[#C9A84C] text-black shadow-lg' : 'text-gray-500'}`}>New Customer</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {type === 'new' ? (
            <>
              <input placeholder="Name" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, name: e.target.value})} required/>
              <input placeholder="Mobile" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, mobile: e.target.value})} required/>
            </>
          ) : (
            <select className="col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none text-gray-400" onChange={e => setForm({...form, customer_id: e.target.value})} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          )}
          <input placeholder="Service" className="col-span-2 bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, service: e.target.value})} required/>
          <input type="number" placeholder="Amount (₹)" className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, amount: e.target.value})} required/>
          <input type="date" value={form.date} className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, date: e.target.value})} required/>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, status: e.target.value})}>
            <option value="paid">Paid</option><option value="pending">Pending</option>
          </select>
          <select className="bg-black/50 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setForm({...form, method: e.target.value})}>
            <option value="cash">Cash</option><option value="online">Online/UPI</option>
          </select>
          <button className="col-span-2 bg-[#C9A84C] text-black font-bold py-4 rounded-2xl mt-4 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            {modalLoading ? "Processing..." : "Save Record"}
          </button>
          <button type="button" onClick={onClose} className="col-span-2 text-gray-600 text-[10px] uppercase mt-2">Cancel</button>
        </form>
      </div>
    </div>
  );
}

function CustomersView() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { supabase.from('customers').select('*').order('name').then(({data}) => setList(data || [])); }, []);
  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

  return (
    <div className="space-y-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input className="w-full bg-[#111113] border border-white/5 p-3 pl-10 rounded-2xl outline-none" placeholder="Search customers..." onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="bg-[#111113] border border-white/5 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[#C9A84C] text-[10px] uppercase tracking-widest font-bold">
            <tr><th className="p-6">Name</th><th className="p-6">Mobile</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-bold">{c.name}</td>
                <td className="p-6 text-gray-500">{c.mobile}</td>
                <td className="p-6 text-right flex justify-end gap-3"><Edit size={16} className="text-gray-500"/><Trash2 size={16} className="text-red-900"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VisitHistoryView() {
  const [list, setList] = useState([]);
  useEffect(() => { supabase.from('visits').select(`*, customers(name, mobile)`).order('date', {ascending: false}).then(({data}) => setList(data || [])); }, []);
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[2rem] overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
          <tr><th className="p-6">Client</th><th className="p-6">Service</th><th className="p-6">Amount</th><th className="p-6">Date</th><th className="p-6">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {list.map(v => (
            <tr key={v.id} className="hover:bg-white/5">
              <td className="p-6"><strong>{v.customers?.name}</strong></td>
              <td className="p-6 text-gray-400">{v.service}</td>
              <td className="p-6 text-[#C9A84C] font-bold">₹{v.amount}</td>
              <td className="p-6 text-gray-500 text-xs">{v.date}</td>
              <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${v.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{v.payment_status.toUpperCase()}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsView() {
  const [range, setRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [repData, setRepData] = useState(null);
  const [repLoading, setRepLoading] = useState(false);

  const generate = async () => {
    setRepLoading(true);
    const { data } = await supabase.from('visits').select('*, customers(name)').gte('date', range.start).lte('date', range.end);
    setRepData(data || []);
    setRepLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#111113] p-8 rounded-[2rem] border border-white/5 flex items-end gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">From Date</label>
          <input type="date" className="w-full bg-black border border-white/10 p-3 rounded-xl outline-none" value={range.start} onChange={e => setRange({...range, start: e.target.value})} />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">To Date</label>
          <input type="date" className="w-full bg-black border border-white/10 p-3 rounded-xl outline-none" value={range.end} onChange={e => setRange({...range, end: e.target.value})} />
        </div>
        <button onClick={generate} className="bg-[#C9A84C] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#E2C97E]">
          {repLoading ? "Searching..." : "Generate"}
        </button>
      </div>

      {repData && (
        <div className="bg-[#111113] border border-white/5 rounded-[2rem] overflow-hidden">
           <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                 <tr><th className="p-4">Name</th><th className="p-4">Service</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {repData.map(r => (
                   <tr key={r.id}><td className="p-4">{r.customers?.name}</td><td className="p-4 text-gray-400">{r.service}</td><td className="p-4 font-bold">₹{r.amount}</td><td className="p-4 text-gray-500">{r.date}</td></tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}