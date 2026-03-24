"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Navigation ke liye
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, MessageCircle, DollarSign 
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MOCK_DATA = {
  totalCustomers: 156, todayCustomers: 12, dailyIncome: 4500, monthlyIncome: 85000,
  monthlyData: [{ month: 'Jan', income: 45000 }, { month: 'Feb', income: 52000 }, { month: 'Mar', income: 85000 }],
  paymentBreakdown: { cash: 40000, online: 35000, pending: 10000 }
};

export default function LuxeSalonApp() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const router = useRouter();

  // --- Check Login Status ---
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      // Agar user memory mein nahi hai, toh login page par bhej do
      router.push('/login');
    } else {
      // Agar hai, toh user state set karo
      setUser(JSON.parse(loggedInUser));
    }
  }, [router]);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Jab tak check ho raha hai, tab tak black screen dikhao
  if (!user) return <div className="bg-black h-screen flex items-center justify-center text-[#C9A84C] font-serif text-xl">Loading LuxeSalon...</div>;

  return (
    <div className="flex h-screen bg-black text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111113] border-r border-[#C9A84C26] flex flex-col">
        <div className="p-6 border-b border-[#C9A84C26]">
          <div className="text-[#C9A84C] text-xl font-serif font-bold">LuxeSalon</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Hello, {user.name}</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<MessageCircle size={18} className="text-green-500"/>} label="WhatsApp" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>

        <div className="p-4 border-t border-[#C9A84C26]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#C9A84C26] bg-[#111113] flex items-center justify-between px-8">
          <h2 className="text-xl font-serif capitalize">{activePage}</h2>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {activePage === 'dashboard' && <DashboardView data={MOCK_DATA} />}
          {activePage === 'customers' && <CustomersView />}
          {activePage === 'visits' && <VisitsView />}
          {activePage === 'whatsapp' && <WhatsAppView />}
        </section>
      </main>
    </div>
  );
}

// --- Components (Same as before but cleaned up) ---

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-[#C9A84C1A] text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function DashboardView() {
  const [stats, setStats] = useState({ totalCustomers: 0, todayVisits: 0, dailyIncome: 0 });

  useEffect(() => {
    async function fetchStats() {
      // 1. Total Customers Count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // 2. Today's Visits & Income
      const today = new Date().toISOString().split('T')[0];
      const { data: visits } = await supabase
        .from('visits')
        .select('amount')
        .eq('date', today);

      const income = visits?.reduce((sum, v) => sum + Number(v.amount), 0) || 0;

      setStats({
        totalCustomers: customerCount || 0,
        todayVisits: visits?.length || 0,
        dailyIncome: income
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={<Users size={20}/>} color="text-[#C9A84C]" />
        <StatCard label="Today's Visits" value={stats.todayVisits} icon={<Scissors size={20}/>} />
        <StatCard label="Daily Income" value={`₹${stats.dailyIncome}`} icon={<DollarSign size={20}/>} color="text-green-500" />
        <StatCard label="Monthly Income" value="₹0" icon={<BarChart3 size={20}/>} color="text-[#C9A84C]" />
      </div>
      {/* Charts ko abhi ke liye khali ya 0 data dikhao */}
    </div>
  );
}
function CustomersView() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('customers')
      .insert([{ name, mobile }]);

    if (!error) {
      setShowModal(false);
      // Refresh list logic here
      window.location.reload(); 
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-[#C9A84C] font-serif text-2xl">Customer List</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#C9A84C] text-black px-4 py-2 rounded-lg font-bold">+ Add Customer</button>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111113] border border-[#C9A84C26] p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-[#C9A84C] text-xl mb-4">New Customer</h3>
            <input placeholder="Full Name" className="w-full bg-black border border-[#C9A84C14] p-3 rounded-lg mb-4" onChange={e => setName(e.target.value)} />
            <input placeholder="Mobile Number" className="w-full bg-black border border-[#C9A84C14] p-3 rounded-lg mb-4" onChange={e => setMobile(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 text-gray-500">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-[#C9A84C] text-black py-2 rounded-lg font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Table code below... */}
    </div>
  );
}

function AddVisitModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '', mobile: '', service: '', amount: '', 
    date: new Date().toISOString().split('T')[0],
    payment_status: 'paid', payment_method: 'cash'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    
    // 1. Pehle Customer dhoondo ya naya banao
    let customerId;
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('mobile', formData.mobile)
      .single();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: cErr } = await supabase
        .from('customers')
        .insert([{ name: formData.name, mobile: formData.mobile }])
        .select()
        .single();
      if (cErr) return alert("Customer error!");
      customerId = newCust.id;
    }

    // 2. Ab Visit record karo
    const { error: vErr } = await supabase
      .from('visits')
      .insert([{
        customer_id: customerId,
        service: formData.service,
        amount: Number(formData.amount),
        date: formData.date,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method
      }]);

    if (!vErr) {
      alert("Visit Saved!");
      onRefresh();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] border border-[#C9A84C26] p-8 rounded-3xl w-full max-w-lg shadow-2xl">
        <h3 className="text-[#C9A84C] text-2xl font-serif mb-6">New Client Visit</h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Client Name" className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none" 
              onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input placeholder="Mobile" className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none" 
              onChange={e => setFormData({...formData, mobile: e.target.value})} required />
          </div>

          <input placeholder="Service (e.g. Haircut + Beard)" className="w-full bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none" 
            onChange={e => setFormData({...formData, service: e.target.value})} required />

          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Amount (₹)" className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none" 
              onChange={e => setFormData({...formData, amount: e.target.value})} required />
            <input type="date" className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none text-gray-400" 
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none text-gray-400"
              onChange={e => setFormData({...formData, payment_status: e.target.value})}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select className="bg-black border border-[#C9A84C14] p-3 rounded-xl outline-none text-gray-400"
              onChange={e => setFormData({...formData, payment_method: e.target.value})}>
              <option value="cash">Cash</option>
              <option value="online">Online / UPI</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 text-gray-500 font-medium">Cancel</button>
            <button type="submit" className="flex-1 bg-[#C9A84C] text-black py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WhatsAppView() {
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl flex justify-between items-center">
      <div><div className="font-bold">WhatsApp Reminder Service</div><div className="text-xs text-gray-500">Feature will be active once customer data is linked.</div></div>
      <button className="bg-green-600/20 text-green-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-green-600/30 opacity-50 cursor-not-allowed"><MessageCircle size={16}/> Send Reminder</button>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] p-5 rounded-2xl hover:border-[#C9A84C66] transition-all">
      <div className="text-[#C9A84C] mb-2">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
      <div className={`text-2xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}