"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Jo API aapne banayi thi (/api/auth/login), ye use call karega
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Login success! User data browser memory mein save karo
        localStorage.setItem('user', JSON.stringify(data.user));
        // Dashboard par bhej do
        router.push('/');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Something went wrong. Is your server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C0A] blur-[120px] rounded-full"></div>
      </div>

      <div className="bg-[#111113] border border-[#C9A84C26] p-10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-[#C9A84C] text-4xl font-serif mb-2 tracking-tight">LuxeSalon</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">Management System Login</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="admin@luxesalon.com" 
              className="w-full bg-[#18181C] border border-[#C9A84C14] p-3.5 rounded-xl text-white outline-none focus:border-[#C9A84C] transition-all text-sm"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full bg-[#18181C] border border-[#C9A84C14] p-3.5 rounded-xl text-white outline-none focus:border-[#C9A84C] transition-all text-sm"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] text-black py-4 rounded-xl font-bold hover:bg-[#E2C97E] active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-[11px] mt-8">
          Authorized Personnel Only • LuxeSalon © 2026
        </p>
      </div>
    </div>
  );
}