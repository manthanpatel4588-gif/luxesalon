"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Scissors, BarChart3, History, 
  LogOut, Plus, Search, Edit, Trash2, X, Check, 
  AlertCircle, MessageCircle, Store, DollarSign, 
  ChevronLeft, ChevronRight, Calendar 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// ChartJS Register
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- Mock Data (Replace with Supabase later) ---
const MOCK_DATA = {
  totalCustomers: 156,
  todayCustomers: 12,
  dailyIncome: 4500,
  monthlyIncome: 85000,
  cashToday: 2000,
  onlineToday: 2500,
  pendingPayments: 1200,
  monthlyData: [
    { month: 'Jan', income: 45000 },
    { month: 'Feb', income: 52000 },
    { month: 'Mar', income: 85000 },
  ],
  paymentBreakdown: { cash: 40000, online: 35000, pending: 10000 }
};

export default function LuxeSalonApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Priya Sharma', role: 'owner' });

  // Login bypass for now
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#111113] border border-[#C9A84C26] p-10 rounded-2xl w-full max-w-md text-center">
          <h1 className="text-[#C9A84C] text-4xl font-serif mb-2">LuxeSalon</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Management System</p>
          <button 
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-[#C9A84C] text-black py-3 rounded-lg font-medium hover:bg-[#E2C97E] transition-all"
          >
            Enter Dashboard (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-[#F0EDE8] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#111113] border-r border-[#C9A84C26] flex flex-col">
        <div className="p-6 border-b border-[#C9A84C26]">
          <div className="text-[#C9A84C] text-xl font-serif font-bold tracking-wider">LuxeSalon</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Salon Panel</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<Users size={18}/>} label="Customers" active={activePage === 'customers'} onClick={() => setActivePage('customers')} />
          <NavItem icon={<History size={18}/>} label="Visit History" active={activePage === 'visits'} onClick={() => setActivePage('visits')} />
          <NavItem icon={<BarChart3 size={18}/>} label="Reports" active={activePage === 'reports'} onClick={() => setActivePage('reports')} />
          <NavItem icon={<MessageCircle size={18} className="text-green-500"/>} label="WhatsApp" active={activePage === 'whatsapp'} onClick={() => setActivePage('whatsapp')} />
        </nav>

        <div className="p-4 border-t border-[#C9A84C26]">
          <div className="flex items-center gap-3 bg-[#18181C] p-3 rounded-xl border border-[#C9A84C26]">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8B6F2E] to-[#C9A84C] rounded-full flex items-center justify-center text-black font-bold text-xs">P</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-[#C9A84C] uppercase">{user.role}</div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="text-gray-500 hover:text-red-500"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#C9A84C26] bg-[#111113] flex items-center justify-between px-8">
          <h2 className="text-xl font-serif capitalize">{activePage}</h2>
          <div className="text-xs text-gray-500">{new Date().toDateString()}</div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {activePage === 'dashboard' && <DashboardView data={MOCK_DATA} />}
          {activePage !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Scissors size={48} className="opacity-20 mb-4" />
              <p>{activePage} page is coming soon...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-[#C9A84C1A] text-[#C9A84C] border border-[#C9A84C26]' : 'text-gray-500 hover:bg-[#18181C] hover:text-white'}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function DashboardView({ data }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.totalCustomers} icon={<Users size={20}/>} color="text-[#C9A84C]" />
        <StatCard label="Today's Visits" value={data.todayCustomers} icon={<Scissors size={20}/>} />
        <StatCard label="Daily Income" value={`₹${data.dailyIncome}`} icon={<DollarSign size={20}/>} color="text-green-500" />
        <StatCard label="Monthly Income" value={`₹${data.monthlyIncome}`} icon={<BarChart3 size={20}/>} color="text-[#C9A84C]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl">
          <h3 className="text-lg font-serif mb-6">Monthly Revenue</h3>
          <div className="h-64">
            <Bar 
              data={{
                labels: data.monthlyData.map(d => d.month),
                datasets: [{
                  label: 'Income',
                  data: data.monthlyData.map(d => d.income),
                  backgroundColor: '#C9A84C26',
                  borderColor: '#C9A84C',
                  borderWidth: 2,
                  borderRadius: 8
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-[#111113] border border-[#C9A84C26] p-6 rounded-2xl">
          <h3 className="text-lg font-serif mb-6">Payment Methods</h3>
          <div className="h-64">
            <Doughnut 
              data={{
                labels: ['Cash', 'Online', 'Pending'],
                datasets: [{
                  data: [data.paymentBreakdown.cash, data.paymentBreakdown.online, data.paymentBreakdown.pending],
                  backgroundColor: ['#C9A84C', '#5C95E0', '#E05C5C'],
                  borderWidth: 0
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111113] border border-[#C9A84C26] p-5 rounded-2xl relative overflow-hidden group hover:border-[#C9A84C66] transition-all">
      <div className="text-[#C9A84C] mb-3 bg-[#C9A84C1A] w-10 h-10 flex items-center justify-center rounded-lg">{icon}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-serif font-bold ${color}`}>{value}</div>
      <div className="absolute -right-2 -top-2 w-16 h-16 bg-[#C9A84C08] rounded-full blur-xl group-hover:bg-[#C9A84C15] transition-all"></div>
    </div>
  );
}