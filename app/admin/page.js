'use client'
import { useState, useEffect, useCallback } from 'react'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--gold:#C9A84C;--gold-l:#E2C97E;--gold-d:#8B6F2E;--black:#0A0A0B;--s1:#111113;--s2:#18181C;--s3:#222228;--border:rgba(201,168,76,0.15);--borderH:rgba(201,168,76,0.4);--text:#F0EDE8;--dim:#9A9494;--red:#E05C5C;--green:#5CBF85;--blue:#5C95E0}
  body{background:var(--black);color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;min-height:100vh}
  h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;font-weight:600;letter-spacing:.02em}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--s1)}::-webkit-scrollbar-thumb{background:var(--gold-d);border-radius:2px}
  .layout{display:flex;min-height:100vh}
  .sidebar{width:220px;background:var(--s1);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;position:fixed;top:0;left:0;bottom:0}
  .sb-brand{padding:24px 20px;border-bottom:1px solid var(--border)}
  .brand-name{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--gold)}
  .brand-sub{font-size:10px;color:var(--dim);letter-spacing:.2em;text-transform:uppercase;margin-top:2px}
  .sb-nav{flex:1;padding:16px 12px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:var(--dim);font-size:13px;transition:all .2s;margin-bottom:2px;border:1px solid transparent}
  .nav-item:hover{background:var(--s2);color:var(--text)}
  .nav-item.active{background:rgba(201,168,76,.1);color:var(--gold);border-color:var(--border)}
  .sb-footer{padding:16px;border-top:1px solid var(--border)}
  .user-badge{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border-radius:8px;border:1px solid var(--border)}
  .avatar{width:32px;height:32px;background:linear-gradient(135deg,var(--gold-d),var(--gold));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--black);flex-shrink:0}
  .main{margin-left:220px;flex:1;display:flex;flex-direction:column}
  .topbar{padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:var(--s1);position:sticky;top:0;z-index:10}
  .topbar h2{font-size:20px}
  .content{padding:28px}
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:28px}
  .stat-card{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:20px;transition:all .3s;animation:fadeUp .4s ease both}
  .stat-card:hover{border-color:var(--borderH);transform:translateY(-2px)}
  .stat-icon{width:36px;height:36px;background:rgba(201,168,76,.1);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;color:var(--gold)}
  .stat-label{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
  .stat-value{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;line-height:1}
  .c-gold{color:var(--gold)}.c-green{color:var(--green)}.c-red{color:var(--red)}.c-blue{color:var(--blue)}
  .table-wrap{background:var(--s1);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .table-header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap}
  .table-header h3{font-size:16px}
  table{width:100%;border-collapse:collapse}
  thead{background:var(--s2)}
  th{padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
  td{padding:12px 16px;border-top:1px solid var(--border);font-size:13px}
  tr:hover td{background:rgba(201,168,76,.03)}
  .td-actions{display:flex;gap:6px}
  .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500}
  .badge-green{background:rgba(92,191,133,.15);color:var(--green)}
  .badge-red{background:rgba(224,92,92,.15);color:var(--red)}
  .badge-gold{background:rgba(201,168,76,.15);color:var(--gold)}
  .badge-gray{background:var(--s3);color:var(--dim)}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;border:1px solid transparent;font-family:'DM Sans',sans-serif}
  .btn-primary{background:var(--gold);color:var(--black);border-color:var(--gold)}
  .btn-primary:hover{background:var(--gold-l)}
  .btn-ghost{background:transparent;color:var(--dim);border-color:var(--border)}
  .btn-ghost:hover{background:var(--s2);color:var(--text)}
  .btn-danger{background:rgba(224,92,92,.15);color:var(--red);border-color:rgba(224,92,92,.3)}
  .btn-success{background:rgba(92,191,133,.15);color:var(--green);border-color:rgba(92,191,133,.3)}
  .btn-sm{padding:5px 10px;font-size:12px}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .ig{margin-bottom:16px}
  .ig label{display:block;font-size:12px;color:var(--dim);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:.08em}
  input,select{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13.5px;font-family:'DM Sans',sans-serif;transition:border-color .2s;outline:none}
  input:focus,select:focus{border-color:var(--gold-d)}
  input::placeholder{color:var(--dim)}
  select option{background:var(--s2)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
  .modal{background:var(--s1);border:1px solid var(--border);border-radius:16px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;animation:slideUp .3s ease}
  .modal-head{padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between}
  .modal-head h2{font-size:22px}
  .modal-body{padding:20px 24px}
  .modal-foot{padding:0 24px 20px;display:flex;gap:10px;justify-content:flex-end}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .section-header h2{font-size:24px}
  .section-header p{font-size:13px;color:var(--dim);margin-top:2px}
  .toasts{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px}
  .toast{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:10px;min-width:280px;animation:slideIn .3s ease;font-size:13px}
  .toast.success{border-color:rgba(92,191,133,.4);color:var(--green)}
  .toast.error{border-color:rgba(224,92,92,.4);color:var(--red)}
  .search-wrap{position:relative}
  .search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dim)}
  .search-wrap input{padding-left:32px}
  .spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  .empty{text-align:center;padding:60px 20px;color:var(--dim)}
  .divider{height:1px;background:var(--border);margin:16px 0}
  .info-box{background:rgba(201,168,76,.06);border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-size:12px;color:var(--dim);margin-bottom:16px;line-height:1.6}
  .info-box strong{color:var(--gold)}
  .expired-row td{opacity:.6}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media(max-width:768px){.sidebar{display:none}.main{margin-left:0}.form-row{grid-template-columns:1fr}}
`

const LOGIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0A0A0B;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;color:#F0EDE8}
  .lp{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 30% 50%,rgba(201,168,76,.06),transparent 60%)}
  .lcard{background:#111113;border:1px solid rgba(201,168,76,.15);border-radius:20px;padding:40px;width:100%;max-width:400px;animation:up .5s ease}
  .lbrand{text-align:center;margin-bottom:8px}
  .lbrand h1{font-family:'Cormorant Garamond',serif;font-size:32px;color:#C9A84C}
  .lbrand .sub{font-size:11px;color:#9A9494;letter-spacing:.2em;text-transform:uppercase;margin-top:4px}
  .admin-badge{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);border-radius:6px;padding:6px 12px;font-size:11px;color:#C9A84C;text-align:center;margin:16px 0 24px;letter-spacing:.1em;text-transform:uppercase}
  .ig{margin-bottom:16px}
  .ig label{display:block;font-size:11px;color:#9A9494;margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:.08em}
  input{width:100%;background:#18181C;border:1px solid rgba(201,168,76,.15);border-radius:8px;padding:9px 12px;color:#F0EDE8;font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
  input:focus{border-color:#8B6F2E}
  input::placeholder{color:#9A9494}
  .btn-login{width:100%;padding:11px;background:#C9A84C;color:#0A0A0B;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px}
  .btn-login:hover{background:#E2C97E}
  .btn-login:disabled{opacity:.5;cursor:not-allowed}
  .err{background:rgba(224,92,92,.1);border:1px solid rgba(224,92,92,.4);border-radius:8px;padding:10px 14px;color:#E05C5C;font-size:13px;margin-bottom:12px}
  .footer{text-align:center;font-size:11px;color:#9A9494;margin-top:20px}
  .spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,.3);border-top-color:#0A0A0B;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
`

// Icons
const I = {
  store: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>,
  alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  key: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
}

const todayStr = () => new Date().toISOString().split('T')[0]

function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <I.check /> : <I.alert />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// Salon Modal - Create / Edit
function SalonModal({ salon, onClose, onSave, addToast }) {
  const [form, setForm] = useState({
    name: salon?.name || '',
    owner_name: salon?.owner_name || '',
    email: salon?.email || '',
    password: '',
    phone: salon?.phone || '',
    status: salon?.status || 'active',
    expiry: salon?.expiry || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.owner_name || !form.email || !form.expiry) {
      addToast('Fill all required fields', 'error'); return
    }
    if (!salon && !form.password) {
      addToast('Password is required for new salon', 'error'); return
    }
    setLoading(true)
    try {
      const method = salon ? 'PUT' : 'POST'
      const body = salon ? { id: salon.id, ...form } : form
      const res = await fetch('/api/admin/salons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { addToast(data.error || 'Error saving salon', 'error'); return }
      addToast(salon ? 'Salon updated!' : 'Salon created! ✅', 'success')
      onSave()
    } catch { addToast('Something went wrong', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{salon ? 'Edit Salon' : 'Create New Salon'}</h2>
          <button className="btn btn-ghost" style={{padding:6,width:32,height:32,justifyContent:'center'}} onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body">
          <div className="info-box">
            <strong>📋 Instructions:</strong> Fill salon details below. The owner will use the email & password to login. Set expiry date as per your plan (monthly/yearly).
          </div>
          <div className="form-row">
            <div className="ig"><label>Salon Name *</label><input placeholder="e.g. Priya Beauty Studio" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="ig"><label>Owner Name *</label><input placeholder="Full name" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="ig"><label>Login Email *</label><input type="email" placeholder="owner@salon.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="ig">
              <label>{salon ? 'New Password (leave blank)' : 'Password *'}</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="ig"><label>Phone</label><input placeholder="10-digit number" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g,''))} /></div>
            <div className="ig">
              <label>License Expiry *</label>
              <input type="date" min={todayStr()} value={form.expiry} onChange={e => set('expiry', e.target.value)} />
            </div>
          </div>
          <div className="ig">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">✅ Active</option>
              <option value="inactive">⛔ Inactive</option>
            </select>
          </div>
          <div className="divider" />
          <div style={{fontSize:12,color:'var(--dim)'}}>
            💡 <strong style={{color:'var(--gold)'}}>Pricing tip:</strong> Set 30 days expiry for monthly plan (₹500-800/month), 365 days for yearly plan (₹5000-8000/year)
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner" /> : (salon ? 'Update Salon' : 'Create Salon')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Admin Dashboard
function AdminDashboard({ onLogout, adminName }) {
  const [salons, setSalons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editSalon, setEditSalon] = useState(null)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/salons')
      .then(r => r.json())
      .then(d => setSalons(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (salon) => {
    const newStatus = salon.status === 'active' ? 'inactive' : 'active'
    await fetch('/api/admin/salons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: salon.id, status: newStatus })
    })
    addToast(`Salon ${newStatus === 'active' ? 'activated ✅' : 'deactivated ⛔'}`, 'success')
    load()
  }

  const filtered = salons.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const active = salons.filter(s => s.status === 'active').length
  const expired = salons.filter(s => s.expiry < todayStr()).length
  const totalCustomers = salons.reduce((sum, s) => sum + (s.customer_count || 0), 0)

  const getExpiryBadge = (expiry) => {
    if (!expiry) return <span className="badge badge-gray">No expiry</span>
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return <span className="badge badge-red">⛔ Expired</span>
    if (daysLeft <= 7) return <span className="badge badge-gold">⚠️ {daysLeft}d left</span>
    return <span className="badge badge-green">{expiry}</span>
  }

  return (
    <div className="layout">
      <style>{CSS}</style>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="brand-name">LuxeSalon</div>
          <div className="brand-sub">Admin Panel</div>
        </div>
        <div className="sb-nav">
          <div className="nav-item active">
            <I.store /><span>Salons</span>
          </div>
        </div>
        <div className="sb-footer">
          <div className="user-badge">
            <div className="avatar">A</div>
            <div>
              <div style={{fontSize:13,fontWeight:500}}>{adminName}</div>
              <div style={{fontSize:10,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.1em'}}>Admin</div>
            </div>
            <button onClick={onLogout} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--dim)',padding:4}} title="Logout">
              <I.logout />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <h2>Salon Management</h2>
          <span style={{fontSize:12,color:'var(--dim)'}}>{new Date().toLocaleDateString('en-IN', {weekday:'short',year:'numeric',month:'short',day:'numeric'})}</span>
        </div>
        <div className="content">
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card" style={{animationDelay:'0ms'}}>
              <div className="stat-icon"><I.store /></div>
              <div className="stat-label">Total Salons</div>
              <div className="stat-value c-gold">{salons.length}</div>
            </div>
            <div className="stat-card" style={{animationDelay:'50ms'}}>
              <div className="stat-icon"><I.check /></div>
              <div className="stat-label">Active Salons</div>
              <div className="stat-value c-green">{active}</div>
            </div>
            <div className="stat-card" style={{animationDelay:'100ms'}}>
              <div className="stat-icon"><I.alert /></div>
              <div className="stat-label">Expired/Inactive</div>
              <div className="stat-value c-red">{salons.length - active + expired}</div>
            </div>
            <div className="stat-card" style={{animationDelay:'150ms'}}>
              <div className="stat-icon"><I.users /></div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-value c-gold">{totalCustomers}</div>
            </div>
          </div>

          {/* Salons Table */}
          <div className="section-header">
            <div>
              <h2>Salon Accounts</h2>
              <p>{filtered.length} salons registered</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditSalon(null); setShowModal(true) }}>
              <I.plus /> Create Salon
            </button>
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <h3>All Salons</h3>
              <div className="search-wrap">
                <I.search />
                <input style={{width:220}} placeholder="Search by name, owner, email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Salon Name</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>License Expiry</th>
                  <th>Customers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>{[...Array(8)].map((_, j) => (
                      <td key={j}><div style={{height:14,background:'var(--s3)',borderRadius:4,animation:'shimmer 1.5s infinite'}} /></td>
                    ))}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty"><p>No salons found. Create one!</p></div></td></tr>
                ) : filtered.map(s => {
                  const isExpired = s.expiry && s.expiry < todayStr()
                  return (
                    <tr key={s.id} className={isExpired ? 'expired-row' : ''}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.owner_name}</td>
                      <td style={{color:'var(--dim)',fontSize:12}}>{s.email}</td>
                      <td style={{color:'var(--dim)',fontSize:12}}>{s.phone || '—'}</td>
                      <td>
                        {s.status === 'active'
                          ? <span className="badge badge-green">✅ Active</span>
                          : <span className="badge badge-red">⛔ Inactive</span>}
                      </td>
                      <td>{getExpiryBadge(s.expiry)}</td>
                      <td style={{color:'var(--gold)',fontWeight:500}}>{s.customer_count || 0}</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditSalon(s); setShowModal(true) }}>
                            <I.edit /> Edit
                          </button>
                          <button
                            className={`btn btn-sm ${s.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => toggleStatus(s)}
                          >
                            {s.status === 'active' ? '⛔ Disable' : '✅ Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <SalonModal
          salon={editSalon}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
          addToast={addToast}
        />
      )}
      <Toasts toasts={toasts} />
    </div>
  )
}

// Admin Login
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      if (data.user?.role !== 'admin') { setError('Admin access required'); return }
      onLogin(data)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{LOGIN_CSS}</style>
      <div className="lp">
        <div className="lcard">
          <div className="lbrand">
            <h1>LuxeSalon</h1>
            <div className="sub">Management System</div>
          </div>
          <div className="admin-badge">🔐 Admin Portal</div>
          {error && <div className="err">{error}</div>}
          <div className="ig">
            <label>Admin Email</label>
            <input type="email" placeholder="admin@luxesalon.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="ig">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔐 Admin Login'}
          </button>
          <div className="footer">LuxeSalon Admin • Authorized Access Only</div>
        </div>
      </div>
    </>
  )
}

// Page Entry
export default function AdminPage() {
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('luxe_admin_auth')
    if (saved) { try { setAuth(JSON.parse(saved)) } catch { localStorage.removeItem('luxe_admin_auth') } }
  }, [])

  if (!auth) return (
    <AdminLogin onLogin={data => {
      setAuth(data)
      localStorage.setItem('luxe_admin_auth', JSON.stringify(data))
    }} />
  )

  return (
    <AdminDashboard
      adminName={auth.user?.name}
      onLogout={() => { localStorage.removeItem('luxe_admin_auth'); setAuth(null) }}
    />
  )
} 