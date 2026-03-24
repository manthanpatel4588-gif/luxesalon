"use client";
import React, { useState } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Direct dashboard access
  const [activePage, setActivePage] = useState('dashboard');

  if (!isLoggedIn) return <div className="bg-black h-screen flex items-center justify-center"><button onClick={() => setIsLoggedIn(true)} className="bg-[#C9A84C] p-4 rounded">Enter Dashboard</button></div>;

  return (
    <div className="flex h-screen bg-black text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111113] border-r border-[#C9A84C26] flex flex-col">
        <div className="p-6 border-b border-[#C9A84C26]"><div className="text-[#C9A84C] text-xl font-serif font-bold">LuxeSalon</div></div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<MessageCircle size={18} className="text-green-500"/>} label="WhatsApp" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#C9A84C26] bg-[#111113] flex items-center justify-between px-8">
          <h2 className="text-xl font-serif capitalize">{activePage}</h2>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {/* Page Routing Logic */}
          {activePage === 'dashboard' && <DashboardView data={MOCK_DATA} />}
          {activePage === 'customers' && <CustomersView />}
          {activePage === 'visits' && <VisitsView />}
          {activePage === 'whatsapp' && <WhatsAppView />}
        </section>
      </main>
    </div>
  );
}

// --- Components ---

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${active ? 'bg-[#C9A84C1A] text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
      {icon} <span className="text-sm">{label}</span>
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
        <div className="col-span-2 bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl h-80"><Bar data={{ labels: data.monthlyData.map(d => d.month), datasets: [{ label: 'Income', data: data.monthlyData.map(d => d.income), backgroundColor: '#C9A84C26', borderColor: '#C9A84C', borderWidth: 2 }] }} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        <div className="bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl h-80"><Doughnut data={{ labels: ['Cash', 'Online', 'Pending'], datasets: [{ data: [data.paymentBreakdown.cash, data.paymentBreakdown.online, data.paymentBreakdown.pending], backgroundColor: ['#C9A84C', '#5C95E0', '#E05C5C'] }] }} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      </div>
    </div>
  );
}

function CustomersView() {
  const customers = [
    { id: 1, name: 'Meera Kapoor', mobile: '9876501234', spend: 2500, last: '2026-03-20' },
    { id: 2, name: 'Sunita Verma', mobile: '9876502345', spend: 1200, last: '2026-03-15' },
    { id: 3, name: 'Kavita Joshi', mobile: '9876503456', spend: 3500, last: '2026-03-10' }
  ];
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] rounded-2xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#18181C] text-[#C9A84C] uppercase text-[10px] tracking-widest">
          <tr><th className="p-4">Name</th><th className="p-4">Mobile</th><th className="p-4">Spend</th><th className="p-4">Last Visit</th><th className="p-4">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-[#C9A84C14]">
          {customers.map(c => (
            <tr key={c.id} className="hover:bg-[#C9A84C05]">
              <td className="p-4 font-medium">{c.name}</td><td className="p-4 text-gray-500">{c.mobile}</td><td className="p-4 text-[#C9A84C]">₹{c.spend}</td><td className="p-4 text-gray-500">{c.last}</td>
              <td className="p-4 flex gap-2 text-gray-400"><Edit size={14}/><Trash2 size={14}/></td>
            </tr>
          ))}
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
      <div><div className="font-bold">Meera Kapoor</div><div className="text-xs text-gray-500">Last visited 35 days ago</div></div>
      <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><MessageCircle size={16}/> Send Reminder</button>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] p-5 rounded-2xl">
      <div className="text-[#C9A84C] mb-2">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
      <div className={`text-2xl font-serif font-bold ${color}`}>{value}</div>
    </div>
  );
}