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

function DashboardView({ data }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.totalCustomers} icon={<Users size={20}/>} color="text-[#C9A84C]" />
        <StatCard label="Today's Visits" value={data.todayCustomers} icon={<Scissors size={20}/>} />
        <StatCard label="Daily Income" value={`₹${data.dailyIncome}`} icon={<DollarSign size={20}/>} color="text-green-500" />
        <StatCard label="Monthly Income" value={`₹${data.monthlyIncome}`} icon={<BarChart3 size={20}/>} color="text-[#C9A84C]" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl h-80">
          <Bar data={{ labels: data.monthlyData.map(d => d.month), datasets: [{ label: 'Income', data: data.monthlyData.map(d => d.income), backgroundColor: '#C9A84C26', borderColor: '#C9A84C', borderWidth: 2 }] }} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl h-80">
          <Doughnut data={{ labels: ['Cash', 'Online', 'Pending'], datasets: [{ data: [data.paymentBreakdown.cash, data.paymentBreakdown.online, data.paymentBreakdown.pending], backgroundColor: ['#C9A84C', '#5C95E0', '#E05C5C'] }] }} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

function CustomersView() {
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[#C9A84C26] flex justify-between items-center">
        <h3 className="font-serif text-[#C9A84C]">Real-time Customer Data</h3>
        <button className="bg-[#C9A84C] text-black text-xs px-3 py-1.5 rounded-md font-bold hover:bg-[#E2C97E]">Add New</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#18181C] text-[#C9A84C] uppercase text-[10px] tracking-widest">
          <tr><th className="p-4">Name</th><th className="p-4">Mobile</th><th className="p-4">Total Spend</th><th className="p-4">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-[#C9A84C14]">
          <tr className="text-gray-500"><td colSpan="4" className="p-10 text-center italic">Connect your Supabase table to see real customers here...</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function VisitsView() {
  return <div className="p-10 border border-dashed border-[#C9A84C26] rounded-2xl text-center text-gray-500">Visit History list will appear here...</div>;
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