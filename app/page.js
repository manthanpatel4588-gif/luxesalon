"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// Ye sab icons yahan hone chahiye, varna Vercel error dega:
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
    <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] p-8 rounded-[2.5rem] hover:border-[#C9A84C33] transition-all group">
      <div className="text-[#C9A84C] mb-4 bg-[#C9A84C0A] w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-3xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}
function CustomersView() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('customers').select('*').order('name').then(({ data }) => setList(data || []));
  }, []);

  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            className="w-full bg-[#111113] border border-[rgba(201,168,76,0.15)] p-2.5 pl-10 rounded-xl outline-none focus:border-[#C9A84C]" 
            placeholder="Search name or mobile..." 
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[#C9A84C] text-[10px] uppercase tracking-[0.2em] font-bold">
            <tr>
              <th className="p-6">Client Name</th>
              <th className="p-6">Mobile Number</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6 font-serif text-lg">{c.name}</td>
                <td className="p-6 text-gray-500 tracking-wider">{c.mobile}</td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-[#C9A84C1A] rounded-lg text-gray-400 hover:text-[#C9A84C]"><Edit size={16}/></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VisitModal({ onClose, onSave }) {
  const [customerType, setCustomerType] = useState('new'); // 'existing' or 'new'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_id: '', name: '', mobile: '', service: '', 
    amount: '', date: new Date().toISOString().split('T')[0],
    status: 'paid', method: 'cash'
  });

  // Purane customers load karne ke liye
  useEffect(() => {
    async function loadCustomers() {
      const { data } = await supabase.from('customers').select('*').order('name');
      setCustomers(data || []);
    }
    loadCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let cid = form.customer_id;
      // Agar naya customer hai toh pehle use save karo
      if (customerType === 'new') {
        const { data, error } = await supabase
          .from('customers')
          .insert([{ name: form.name, mobile: form.mobile }])
          .select().single();
        if (error) throw error;
        cid = data.id;
      }

      // Visit record save karo
      const { error: vErr } = await supabase.from('visits').insert([{
        customer_id: cid, service: form.service, amount: Number(form.amount),
        date: form.date, payment_status: form.status, payment_method: form.method
      }]);
      
      if (vErr) throw vErr;
      onSave(); // Dashboard refresh karne ke liye
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-[rgba(201,168,76,0.3)] p-10 rounded-[2.5rem] w-full max-w-xl shadow-2xl">
        <h3 className="text-[#C9A84C] text-2xl font-serif mb-6">Record New Visit</h3>
        
        {/* SS wala Toggle Switch */}
        <div className="flex bg-black p-1 rounded-2xl mb-8 border border-white/5">
          <button type="button" onClick={() => setCustomerType('existing')} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${customerType === 'existing' ? 'bg-[#C9A84C] text-black shadow-lg' : 'text-gray-500'}`}>
            Existing Customer
          </button>
          <button type="button" onClick={() => setCustomerType('new')} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${customerType === 'new' ? 'bg-[#C9A84C] text-black shadow-lg' : 'text-gray-500'}`}>
            New Customer
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {customerType === 'existing' ? (
            <select className="col-span-2 bg-black border border-white/10 p-4 rounded-2xl outline-none text-gray-400" 
              onChange={e => setForm({...form, customer_id: e.target.value})} required>
              <option value="">Select Existing Client...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          ) : (
            <>
              <input placeholder="Full Name *" className="bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" 
                onChange={e => setForm({...form, name: e.target.value})} required />
              <input placeholder="Mobile Number *" className="bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" 
                onChange={e => setForm({...form, mobile: e.target.value})} required />
            </>
          )}

          <input placeholder="Services (e.g. Haircut, Blow Dry) *" className="col-span-2 bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" 
            onChange={e => setForm({...form, service: e.target.value})} required />

          <input type="number" placeholder="Amount (₹) *" className="bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-[#C9A84C]" 
            onChange={e => setForm({...form, amount: e.target.value})} required />
          
          <input type="date" value={form.date} className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-gray-400" 
            onChange={e => setForm({...form, date: e.target.value})} />

          <select className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-sm" 
            onChange={e => setForm({...form, status: e.target.value})}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <select className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-sm" 
            onChange={e => setForm({...form, method: e.target.value})}>
            <option value="cash">Cash</option>
            <option value="online">Online / UPI</option>
          </select>

          <button type="submit" disabled={loading} className="col-span-2 bg-[#C9A84C] text-black font-bold py-4 rounded-2xl mt-4 hover:bg-[#E2C97E] transition-all">
            {loading ? "Processing..." : "Save Visit Record"}
          </button>
          
          <button type="button" onClick={onClose} className="col-span-2 text-gray-600 text-[10px] uppercase tracking-widest mt-2 hover:text-white">Cancel</button>
        </form>
      </div>
    </div>
  );
}

function ReportsView() {
  const [range, setRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    const { data: visits } = await supabase
      .from('visits')
      .select('*, customers(name)')
      .gte('date', range.start)
      .lte('date', range.end);

    const summary = visits?.reduce((acc, v) => {
      acc.total += Number(v.amount);
      if (v.payment_status === 'paid') {
        if (v.payment_method === 'cash') acc.cash += Number(v.amount);
        else acc.online += Number(v.amount);
      } else {
        acc.pending += Number(v.amount);
      }
      return acc;
    }, { total: 0, cash: 0, online: 0, pending: 0, count: visits.length });

    setData({ visits, summary });
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-[#111113] border border-[rgba(201,168,76,0.15)] p-6 rounded-[2rem] flex items-end gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">From Date</label>
          <input type="date" className="w-full bg-black border border-white/10 p-3 rounded-xl outline-none" value={range.start} onChange={e => setRange({...range, start: e.target.value})} />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">To Date</label>
          <input type="date" className="w-full bg-black border border-white/10 p-3 rounded-xl outline-none" value={range.end} onChange={e => setRange({...range, end: e.target.value})} />
        </div>
        <button onClick={generateReport} className="bg-[#C9A84C] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#E2C97E]">Generate Report</button>
      </div>

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Report Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Total Collection</div>
              <div className="text-2xl font-serif text-[#C9A84C]">₹{data.summary.total}</div>
            </div>
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Cash Income</div>
              <div className="text-2xl font-serif text-green-500">₹{data.summary.cash}</div>
            </div>
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Online Income</div>
              <div className="text-2xl font-serif text-blue-400">₹{data.summary.online}</div>
            </div>
            <div className="bg-[#111113] p-6 rounded-2xl border border-white/5">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Pending</div>
              <div className="text-2xl font-serif text-red-500">₹{data.summary.pending}</div>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-[#111113] border border-white/5 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                <tr><th className="p-4">Client</th><th className="p-4">Service</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.visits.map(v => (
                  <tr key={v.id}>
                    <td className="p-4 font-bold">{v.customers?.name}</td>
                    <td className="p-4 text-gray-400">{v.service}</td>
                    <td className="p-4">₹{v.amount}</td>
                    <td className="p-4 text-[10px] uppercase font-bold">{v.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}