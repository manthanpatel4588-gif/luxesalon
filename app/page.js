'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ── helpers ──────────────────────────────────────────────
const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]

// ── Icons ────────────────────────────────────────────────
const Icons = {
  dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  history: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>,
  chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  whatsapp: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  dollar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  scissors: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  chevL: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="15 18 9 12 15 6"/></svg>,
  chevR: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="9 18 15 12 9 6"/></svg>,
  check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>,
  alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

// ── Styles (CSS-in-JS via style tags) ────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --gold:#C9A84C;--gold-l:#E2C97E;--gold-d:#8B6F2E;
    --black:#0A0A0B;--s1:#111113;--s2:#18181C;--s3:#222228;
    --border:rgba(201,168,76,0.15);--borderH:rgba(201,168,76,0.4);
    --text:#F0EDE8;--dim:#9A9494;--red:#E05C5C;--green:#5CBF85;--blue:#5C95E0;
  }
  body{background:var(--black);color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;height:100vh;overflow:hidden}
  h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;font-weight:600;letter-spacing:.02em}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--s1)}::-webkit-scrollbar-thumb{background:var(--gold-d);border-radius:2px}
  .app{display:flex;height:100vh}
  /* Sidebar */
  .sidebar{width:240px;background:var(--s1);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
  .sb-brand{padding:24px 20px;border-bottom:1px solid var(--border)}
  .sb-brand .name{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold);letter-spacing:.05em}
  .sb-brand .sub{font-size:10px;color:var(--dim);letter-spacing:.2em;text-transform:uppercase;margin-top:2px}
  .sb-nav{flex:1;padding:16px 12px;overflow-y:auto}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:var(--dim);font-size:13.5px;transition:all .2s;margin-bottom:2px;border:1px solid transparent}
  .nav-item:hover{background:var(--s2);color:var(--text)}
  .nav-item.active{background:rgba(201,168,76,.1);color:var(--gold);border-color:var(--border)}
  .sb-footer{padding:16px;border-top:1px solid var(--border)}
  .user-badge{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border-radius:8px;border:1px solid var(--border)}
  .avatar{width:32px;height:32px;background:linear-gradient(135deg,var(--gold-d),var(--gold));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--black);flex-shrink:0}
  .user-name{font-size:13px;font-weight:500}
  .user-role{font-size:10px;color:var(--gold);text-transform:uppercase;letter-spacing:.1em}
  .logout-btn{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--dim);padding:4px;transition:color .2s}
  .logout-btn:hover{color:var(--red)}
  /* Main */
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden}
  .topbar{padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:var(--s1);flex-shrink:0}
  .topbar h2{font-size:20px}
  .content{flex:1;overflow-y:auto;padding:28px}
  /* Stat Cards */
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:24px}
  .stat-card{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden;transition:all .3s;animation:fadeUp .4s ease both}
  .stat-card:hover{border-color:var(--borderH);transform:translateY(-2px)}
  .stat-card::before{content:'';position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 70%)}
  .stat-icon{width:36px;height:36px;background:rgba(201,168,76,.1);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;color:var(--gold)}
  .stat-label{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
  .stat-value{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;line-height:1;animation:countUp .5s ease both}
  .stat-sub{font-size:11px;color:var(--dim);margin-top:6px}
  .c-gold{color:var(--gold)}.c-green{color:var(--green)}.c-red{color:var(--red)}.c-blue{color:var(--blue)}
  /* Charts */
  .charts-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:24px}
  .chart-card{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:20px}
  .chart-card h3{font-size:16px;margin-bottom:16px}
  /* Table */
  .table-wrap{background:var(--s1);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .table-header{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap}
  .table-header h3{font-size:16px}
  .search-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  table{width:100%;border-collapse:collapse}
  thead{background:var(--s2)}
  th{padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;cursor:pointer;user-select:none}
  th:hover{color:var(--gold)}
  td{padding:12px 16px;border-top:1px solid var(--border);font-size:13px}
  tr:hover td{background:rgba(201,168,76,.03)}
  .td-actions{display:flex;gap:6px;align-items:center}
  /* Badges */
  .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500}
  .badge-green{background:rgba(92,191,133,.15);color:var(--green)}
  .badge-red{background:rgba(224,92,92,.15);color:var(--red)}
  .badge-gold{background:rgba(201,168,76,.15);color:var(--gold)}
  .badge-blue{background:rgba(92,149,224,.15);color:var(--blue)}
  .badge-gray{background:var(--s3);color:var(--dim)}
  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;border:1px solid transparent;font-family:'DM Sans',sans-serif}
  .btn-primary{background:var(--gold);color:var(--black);border-color:var(--gold)}
  .btn-primary:hover{background:var(--gold-l)}
  .btn-ghost{background:transparent;color:var(--dim);border-color:var(--border)}
  .btn-ghost:hover{background:var(--s2);color:var(--text);border-color:var(--borderH)}
  .btn-danger{background:rgba(224,92,92,.15);color:var(--red);border-color:rgba(224,92,92,.3)}
  .btn-danger:hover{background:rgba(224,92,92,.25)}
  .btn-green{background:rgba(92,191,133,.15);color:var(--green);border-color:rgba(92,191,133,.3)}
  .btn-sm{padding:5px 10px;font-size:12px}
  .btn-icon{padding:6px;width:32px;height:32px;justify-content:center}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  /* Inputs */
  .ig{margin-bottom:16px}
  .ig label{display:block;font-size:12px;color:var(--dim);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:.08em}
  input,select,textarea{width:100%;background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-size:13.5px;font-family:'DM Sans',sans-serif;transition:border-color .2s;outline:none}
  input:focus,select:focus,textarea:focus{border-color:var(--gold-d)}
  input::placeholder{color:var(--dim)}
  select option{background:var(--s2)}
  .search-wrap{position:relative}
  .search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dim)}
  .search-wrap input{padding-left:32px}
  /* Modal */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
  .modal{background:var(--s1);border:1px solid var(--border);border-radius:16px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:slideUp .3s ease}
  .modal-head{padding:20px 24px 0;display:flex;align-items:center;justify-content:space-between}
  .modal-head h2{font-size:22px}
  .modal-body{padding:20px 24px}
  .modal-foot{padding:0 24px 20px;display:flex;gap:10px;justify-content:flex-end}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  /* Tabs */
  .tab-bar{display:flex;gap:4px;background:var(--s2);border-radius:8px;padding:3px;margin-bottom:16px;width:fit-content}
  .tab-item{padding:6px 16px;border-radius:6px;font-size:13px;cursor:pointer;color:var(--dim);transition:all .2s}
  .tab-item.active{background:var(--s1);color:var(--gold);border:1px solid var(--border)}
  /* Toast */
  .toasts{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px}
  .toast{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:10px;min-width:280px;animation:slideIn .3s ease;font-size:13px}
  .toast.success{border-color:rgba(92,191,133,.4)}
  .toast.error{border-color:rgba(224,92,92,.4)}
  .toast.success svg{color:var(--green)}
  .toast.error svg{color:var(--red)}
  /* Pagination */
  .pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--border)}
  .pag-info{font-size:12px;color:var(--dim)}
  .pag-btns{display:flex;gap:6px}
  .pag-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;font-size:12px;background:var(--s2);border:1px solid var(--border);color:var(--dim);transition:all .2s}
  .pag-btn:hover{border-color:var(--gold-d);color:var(--gold)}
  .pag-btn.active{background:var(--gold);color:var(--black);border-color:var(--gold)}
  /* Skeleton */
  .sk{background:linear-gradient(90deg,var(--s2) 25%,var(--s3) 50%,var(--s2) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px}
  .spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  /* Report */
  .rpt-filters{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}
  .rpt-filters .ig{margin-bottom:0;flex:1;min-width:140px}
  .rpt-summary{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:20px}
  .rpt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
  .rpt-metric{background:var(--s2);border-radius:8px;padding:14px;border:1px solid var(--border)}
  .rpt-metric .lbl{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
  .rpt-metric .val{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600}
  /* WA */
  .wa-card{background:var(--s1);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:16px;transition:all .2s}
  .wa-card:hover{border-color:var(--borderH)}
  /* Notice */
  .notice{background:rgba(201,168,76,.08);border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-size:12.5px;color:var(--dim);line-height:1.6;margin-bottom:16px}
  /* Empty */
  .empty{text-align:center;padding:60px 20px;color:var(--dim)}
  /* Animations */
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .section-header h2{font-size:24px}
  .section-header p{font-size:13px;color:var(--dim);margin-top:2px}
  @media(max-width:768px){.sidebar{display:none}.charts-grid{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}.stat-grid{grid-template-columns:repeat(2,1fr)}}
`

// ── Chart components ──────────────────────────────────────
function BarChart({ data }) {
  const ref = useRef(); const chartRef = useRef()
  useEffect(() => {
    if (!ref.current || !window.Chart) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new window.Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [{ label: 'Income (₹)', data: data.map(d => d.income), backgroundColor: 'rgba(201,168,76,0.2)', borderColor: '#C9A84C', borderWidth: 2, borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `₹${c.raw.toLocaleString()}` } } },
        scales: {
          x: { grid: { color: 'rgba(201,168,76,0.08)' }, ticks: { color: '#9A9494' } },
          y: { grid: { color: 'rgba(201,168,76,0.08)' }, ticks: { color: '#9A9494', callback: v => `₹${v / 1000}k` } }
        }
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])
  return <canvas ref={ref} />
}

function DonutChart({ data }) {
  const ref = useRef(); const chartRef = useRef()
  useEffect(() => {
    if (!ref.current || !window.Chart) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new window.Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: ['Cash', 'Online/UPI', 'Pending'],
        datasets: [{ data: [data.cash, data.online, data.pending], backgroundColor: ['#C9A84C', '#5C95E0', '#E05C5C'], borderWidth: 0, hoverOffset: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9A9494', padding: 16, font: { size: 12 } } },
          tooltip: { callbacks: { label: c => `₹${c.raw.toLocaleString()}` } }
        },
        cutout: '65%'
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data])
  return <canvas ref={ref} />
}

// ── Toast ─────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? <Icons.check /> : <Icons.alert />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── Visit Modal ───────────────────────────────────────────
function VisitModal({ salonId, customers, visit, onClose, onSave, addToast }) {
  const [isNew, setIsNew] = useState(!visit?.customer_id)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_id: visit?.customer_id || '',
    name: visit?.customers?.name || '',
    mobile: visit?.customers?.mobile || '',
    service: visit?.service || '',
    amount: visit?.amount || '',
    date: visit?.date || today(),
    payment_status: visit?.payment_status || 'paid',
    payment_method: visit?.payment_method || 'cash',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.service || !form.amount) { addToast('Fill all required fields', 'error'); return }
    if (!isNew && !form.customer_id) { addToast('Select a customer', 'error'); return }
    if (isNew && (!form.name || !form.mobile)) { addToast('Enter customer name and mobile', 'error'); return }
    setLoading(true)
    try {
      let customerId = form.customer_id
      if (isNew) {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salon_id: salonId, name: form.name, mobile: form.mobile })
        })
        const nc = await res.json()
        customerId = nc.id
      }
      const visitData = { salon_id: salonId, customer_id: customerId, service: form.service, amount: Number(form.amount), date: form.date, payment_status: form.payment_status, payment_method: form.payment_method }
      if (visit) {
        await fetch('/api/visits', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: visit.id, ...visitData }) })
      } else {
        await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(visitData) })
      }
      addToast(visit ? 'Visit updated!' : 'Visit saved!', 'success')
      onSave()
    } catch { addToast('Something went wrong', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{visit ? 'Edit Visit' : 'Record New Visit'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icons.x /></button>
        </div>
        <div className="modal-body">
          <div className="tab-bar">
            <div className={`tab-item ${!isNew ? 'active' : ''}`} onClick={() => setIsNew(false)}>Existing Customer</div>
            <div className={`tab-item ${isNew ? 'active' : ''}`} onClick={() => setIsNew(true)}>New Customer</div>
          </div>
          {!isNew ? (
            <div className="ig">
              <label>Select Customer *</label>
              <select value={form.customer_id} onChange={e => {
                const c = customers.find(c => c.id === e.target.value)
                set('customer_id', e.target.value)
                if (c) { set('name', c.name); set('mobile', c.mobile) }
              }}>
                <option value="">-- Select --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
              </select>
            </div>
          ) : (
            <div className="form-row">
              <div className="ig"><label>Name *</label><input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="ig"><label>Mobile *</label><input placeholder="10-digit" value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
            </div>
          )}
          <div className="ig"><label>Services *</label><input placeholder="e.g. Haircut, Blow Dry" value={form.service} onChange={e => set('service', e.target.value)} /></div>
          <div className="form-row">
            <div className="ig"><label>Amount (₹) *</label><input type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div className="ig"><label>Visit Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="ig">
              <label>Payment Status</label>
              <select value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="ig">
              <label>Payment Method</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner" /> : (visit ? 'Update Visit' : 'Save Visit')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────
function Dashboard({ salonId, onAddVisit }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard?salon_id=${salonId}`)
      .then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [salonId])

  if (loading) return (
    <div>
      <div className="stat-grid">{[...Array(7)].map((_, i) => (
        <div key={i} className="stat-card"><div className="sk" style={{ height: 20, marginBottom: 12 }} /><div className="sk" style={{ height: 36, width: '60%' }} /></div>
      ))}</div>
    </div>
  )

  const StatCard = ({ icon, label, value, color, delay }) => (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color || ''}`}>{value}</div>
    </div>
  )

  return (
    <div>
      <div className="section-header">
        <div><h2>Dashboard</h2><p>Business overview for today & this month</p></div>
        <button className="btn btn-primary" onClick={onAddVisit}><Icons.plus /> Record Visit</button>
      </div>
      <div className="stat-grid">
        <StatCard icon={<Icons.users />} label="Total Customers" value={data.totalCustomers} color="c-gold" delay={0} />
        <StatCard icon={<Icons.scissors />} label="Today's Visits" value={data.todayCustomers} delay={50} />
        <StatCard icon={<Icons.dollar />} label="Daily Income" value={fmt(data.dailyIncome)} color="c-green" delay={100} />
        <StatCard icon={<Icons.chart />} label="Monthly Income" value={fmt(data.monthlyIncome)} color="c-gold" delay={150} />
        <StatCard icon={<Icons.dollar />} label="Cash Today" value={fmt(data.cashToday)} delay={200} />
        <StatCard icon={<Icons.dollar />} label="Online Today" value={fmt(data.onlineToday)} color="c-blue" delay={250} />
        <StatCard icon={<Icons.alert />} label="Pending Payments" value={fmt(data.pendingPayments)} color="c-red" delay={300} />
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Income</h3>
          <div style={{ height: 220 }}><BarChart data={data.monthlyData || []} /></div>
        </div>
        <div className="chart-card">
          <h3>Payment Breakdown</h3>
          <div style={{ height: 220 }}><DonutChart data={data.paymentBreakdown || { cash: 0, online: 0, pending: 0 }} /></div>
        </div>
      </div>
    </div>
  )
}

// ── Customers ─────────────────────────────────────────────
function Customers({ salonId, addToast }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'name', dir: 1 })
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const PER = 8

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/customers?salon_id=${salonId}`).then(r => r.json()).then(setCustomers).finally(() => setLoading(false))
  }, [salonId])
  useEffect(() => { load() }, [load])

  const filtered = customers
    .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.mobile?.includes(search))
    .sort((a, b) => { const v = (a[sort.key] || '') < (b[sort.key] || '') ? -1 : 1; return v * sort.dir })

  const paged = filtered.slice((page - 1) * PER, page * PER)
  const totalPages = Math.ceil(filtered.length / PER)

  const del = async id => {
    if (!confirm('Delete this customer?')) return
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
    addToast('Customer deleted', 'success'); load()
  }

  const sortBy = k => setSort(s => ({ key: k, dir: s.key === k ? -s.dir : 1 }))

  return (
    <div>
      <div className="section-header">
        <div><h2>Customers</h2><p>{filtered.length} total customers</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icons.plus /> Add Visit</button>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <h3>Customer List</h3>
          <div className="search-row">
            <div className="search-wrap">
              <Icons.search />
              <input style={{ width: 200 }} placeholder="Search name or mobile..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th onClick={() => sortBy('name')}>Name {sort.key === 'name' ? (sort.dir === 1 ? '↑' : '↓') : ''}</th>
              <th>Mobile</th>
              <th>Last Service</th>
              <th onClick={() => sortBy('totalAmount')}>Total Spend {sort.key === 'totalAmount' ? (sort.dir === 1 ? '↑' : '↓') : ''}</th>
              <th onClick={() => sortBy('lastVisit')}>Last Visit {sort.key === 'lastVisit' ? (sort.dir === 1 ? '↑' : '↓') : ''}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="sk" style={{ height: 14 }} /></td>)}</tr>
            )) : paged.length === 0 ? (
              <tr><td colSpan={6}><div className="empty"><p>No customers found</p></div></td></tr>
            ) : paged.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ color: 'var(--dim)' }}>{c.mobile}</td>
                <td style={{ color: 'var(--dim)', fontSize: 12 }}>{c.lastService || '—'}</td>
                <td style={{ color: 'var(--gold)' }}>{fmt(c.totalAmount)}</td>
                <td style={{ color: 'var(--dim)' }}>{c.lastVisit || '—'}</td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(c.id)}><Icons.trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pag-info">Showing {(page - 1) * PER + 1}–{Math.min(page * PER, filtered.length)} of {filtered.length}</span>
            <div className="pag-btns">
              <div className="pag-btn" onClick={() => page > 1 && setPage(p => p - 1)}><Icons.chevL /></div>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <div key={i} className={`pag-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</div>
              ))}
              <div className="pag-btn" onClick={() => page < totalPages && setPage(p => p + 1)}><Icons.chevR /></div>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <VisitModal salonId={salonId} customers={customers} visit={null}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
          addToast={addToast}
        />
      )}
    </div>
  )
}

// ── Visits ────────────────────────────────────────────────
function Visits({ salonId, addToast }) {
  const [visits, setVisits] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editVisit, setEditVisit] = useState(null)
  const PER = 10

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/visits?salon_id=${salonId}`).then(r => r.json()),
      fetch(`/api/customers?salon_id=${salonId}`).then(r => r.json())
    ]).then(([v, c]) => { setVisits(v); setCustomers(c) }).finally(() => setLoading(false))
  }, [salonId])
  useEffect(() => { load() }, [load])

  const filtered = visits
    .filter(v => !search || v.customers?.name?.toLowerCase().includes(search.toLowerCase()) || v.service?.toLowerCase().includes(search.toLowerCase()))
    .filter(v => filterStatus === 'all' || v.payment_status === filterStatus)
    .filter(v => filterMethod === 'all' || v.payment_method === filterMethod)

  const paged = filtered.slice((page - 1) * PER, page * PER)
  const totalPages = Math.ceil(filtered.length / PER)

  const del = async id => {
    if (!confirm('Delete this visit?')) return
    await fetch(`/api/visits?id=${id}`, { method: 'DELETE' })
    addToast('Visit deleted', 'success'); load()
  }

  const sBadge = s => s === 'paid' ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>
  const mBadge = m => {
    const cls = { cash: 'badge-gold', upi: 'badge-blue', card: 'badge-blue', online: 'badge-blue' }
    return <span className={`badge ${cls[m] || 'badge-gray'}`}>{m?.toUpperCase()}</span>
  }

  return (
    <div>
      <div className="section-header">
        <div><h2>Visit History</h2><p>{filtered.length} records found</p></div>
        <button className="btn btn-primary" onClick={() => { setEditVisit(null); setShowModal(true) }}><Icons.plus /> Add Visit</button>
      </div>
      <div className="table-wrap">
        <div className="table-header">
          <h3>All Visits</h3>
          <div className="search-row">
            <div className="search-wrap">
              <Icons.search />
              <input style={{ width: 180 }} placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select style={{ width: 130 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select style={{ width: 130 }} value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1) }}>
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Customer</th><th>Services</th><th>Amount</th><th>Date</th><th>Status</th><th>Method</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}>{[...Array(7)].map((_, j) => <td key={j}><div className="sk" style={{ height: 14 }} /></td>)}</tr>
            )) : paged.length === 0 ? (
              <tr><td colSpan={7}><div className="empty"><p>No visits found</p></div></td></tr>
            ) : paged.map(v => (
              <tr key={v.id}>
                <td>
                  <div><strong style={{ fontSize: 13 }}>{v.customers?.name}</strong></div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>{v.customers?.mobile}</div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--dim)', maxWidth: 180 }}>{v.service}</td>
                <td style={{ color: 'var(--gold)', fontWeight: 500 }}>{fmt(v.amount)}</td>
                <td style={{ color: 'var(--dim)' }}>{v.date}</td>
                <td>{sBadge(v.payment_status)}</td>
                <td>{mBadge(v.payment_method)}</td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditVisit(v); setShowModal(true) }}><Icons.edit /></button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(v.id)}><Icons.trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pag-info">Showing {(page - 1) * PER + 1}–{Math.min(page * PER, filtered.length)} of {filtered.length}</span>
            <div className="pag-btns">
              <div className="pag-btn" onClick={() => page > 1 && setPage(p => p - 1)}><Icons.chevL /></div>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <div key={i} className={`pag-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</div>
              ))}
              <div className="pag-btn" onClick={() => page < totalPages && setPage(p => p + 1)}><Icons.chevR /></div>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <VisitModal salonId={salonId} customers={customers} visit={editVisit}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
          addToast={addToast}
        />
      )}
    </div>
  )
}

// ── Reports ───────────────────────────────────────────────
function Reports({ salonId }) {
  const [type, setType] = useState('daily')
  const [start, setStart] = useState(today())
  const [end, setEnd] = useState(today())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const setRange = t => {
    setType(t)
    const now = new Date()
    if (t === 'daily') { setStart(today()); setEnd(today()) }
    else if (t === 'monthly') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      setStart(first); setEnd(today())
    }
  }

  const generate = async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?salon_id=${salonId}&start=${start}&end=${end}`)
    setData(await res.json())
    setLoading(false)
  }

  const sBadge = s => s === 'paid' ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>

  return (
    <div>
      <div className="section-header"><div><h2>Reports</h2><p>Generate income & customer reports</p></div></div>
      <div className="rpt-filters">
        <div className="ig">
          <label>Report Type</label>
          <select value={type} onChange={e => setRange(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div className="ig"><label>From Date</label><input type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div className="ig"><label>To Date</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Generate Report'}
        </button>
      </div>
      {data && (
        <>
          <div className="rpt-summary">
            <h3 style={{ marginBottom: 16 }}>Summary — {start} to {end}</h3>
            <div className="rpt-grid">
              <div className="rpt-metric"><div className="lbl">Total Customers</div><div className="val c-gold">{data.totalCustomers}</div></div>
              <div className="rpt-metric"><div className="lbl">Total Income</div><div className="val c-green">{fmt(data.totalIncome)}</div></div>
              <div className="rpt-metric"><div className="lbl">Cash Income</div><div className="val c-gold">{fmt(data.cashIncome)}</div></div>
              <div className="rpt-metric"><div className="lbl">Online Income</div><div className="val c-blue">{fmt(data.onlineIncome)}</div></div>
              <div className="rpt-metric"><div className="lbl">Pending</div><div className="val c-red">{fmt(data.pendingPayments)}</div></div>
              <div className="rpt-metric"><div className="lbl">Total Visits</div><div className="val">{data.visits?.length || 0}</div></div>
            </div>
          </div>
          <div className="table-wrap">
            <div className="table-header"><h3>Visit Details</h3></div>
            <table>
              <thead><tr><th>Customer</th><th>Services</th><th>Amount</th><th>Date</th><th>Status</th><th>Method</th></tr></thead>
              <tbody>
                {(data.visits || []).length === 0
                  ? <tr><td colSpan={6}><div className="empty"><p>No visits in this period</p></div></td></tr>
                  : (data.visits || []).map(v => (
                    <tr key={v.id}>
                      <td><strong>{v.customers?.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--dim)' }}>{v.service}</td>
                      <td style={{ color: 'var(--gold)' }}>{fmt(v.amount)}</td>
                      <td style={{ color: 'var(--dim)' }}>{v.date}</td>
                      <td>{sBadge(v.payment_status)}</td>
                      <td><span className="badge badge-gray">{v.payment_method?.toUpperCase()}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── WhatsApp ──────────────────────────────────────────────
function WhatsApp({ salonId }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/whatsapp?salon_id=${salonId}`).then(r => r.json()).then(setCustomers).finally(() => setLoading(false))
  }, [salonId])

  const send = c => {
    const msg = encodeURIComponent(`Hello ${c.name}, it's been a while since your last visit. We miss you! Please visit us again soon. 💇‍♀️✨`)
    window.open(`https://wa.me/${c.mobile}?text=${msg}`, '_blank')
  }

  return (
    <div>
      <div className="section-header"><div><h2>WhatsApp Reminders</h2><p>Customers who haven't visited in 30+ days</p></div></div>
      <div className="notice">💡 <strong>Pro tip:</strong> Sending reminders to inactive customers brings them back. Click "Send Reminder" to open WhatsApp with a pre-filled message.</div>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        : customers.length === 0
          ? <div className="wa-card" style={{ justifyContent: 'center' }}><p style={{ color: 'var(--green)' }}>✅ All customers visited recently. No reminders needed!</p></div>
          : customers.map(c => (
            <div key={c.id} className="wa-card">
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>📱 {c.mobile}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>Last visit: <span style={{ color: 'var(--red)' }}>{c.lastVisit}</span></div>
              </div>
              <button className="btn btn-green" onClick={() => send(c)}><Icons.whatsapp /> Send Reminder</button>
            </div>
          ))}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────
function Sidebar({ page, setPage, user, salon, onLogout }) {
  const nav = [
    { key: 'dashboard', label: 'Dashboard', icon: <Icons.dashboard /> },
    { key: 'customers', label: 'Customers', icon: <Icons.users /> },
    { key: 'visits', label: 'Visit History', icon: <Icons.history /> },
    { key: 'reports', label: 'Reports', icon: <Icons.chart /> },
    { key: 'whatsapp', label: 'WhatsApp Reminders', icon: <Icons.whatsapp /> },
  ]
  return (
    <div className="sidebar">
      <div className="sb-brand">
        <div className="name">LuxeSalon</div>
        <div className="sub">{salon?.name || user?.name || 'Salon'}</div>
      </div>
      <nav className="sb-nav">
        {nav.map(item => (
          <div key={item.key} className={`nav-item ${page === item.key ? 'active' : ''}`} onClick={() => setPage(item.key)}>
            {item.icon}<span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="user-badge">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={onLogout}><Icons.logout /></button>
        </div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [toasts, setToasts] = useState([])
  const [chartLoaded, setChartLoaded] = useState(false)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [visitCustomers, setVisitCustomers] = useState([])

  // Load Chart.js
  useEffect(() => {
    if (window.Chart) { setChartLoaded(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    s.onload = () => setChartLoaded(true)
    document.head.appendChild(s)
  }, [])

  // Check saved auth
  useEffect(() => {
    const saved = localStorage.getItem('luxe_auth')
    if (saved) { try { setAuth(JSON.parse(saved)) } catch { localStorage.removeItem('luxe_auth') } }
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('luxe_auth')
    setAuth(null)
  }

  const handleAddVisit = async () => {
    const res = await fetch(`/api/customers?salon_id=${auth?.user?.salon_id}`)
    setVisitCustomers(await res.json())
    setShowVisitModal(true)
  }

  const titles = { dashboard: 'Dashboard', customers: 'Customers', visits: 'Visit History', reports: 'Reports', whatsapp: 'WhatsApp Reminders' }

  if (!auth) return <LoginPage onLogin={data => { setAuth(data); localStorage.setItem('luxe_auth', JSON.stringify(data)) }} addToast={addToast} toasts={toasts} />

  const salonId = auth.user?.salon_id

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} user={auth.user} salon={auth.salon} onLogout={handleLogout} />
        <div className="main">
          <div className="topbar">
            <h2>{titles[page]}</h2>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="content">
            {page === 'dashboard' && <Dashboard salonId={salonId} onAddVisit={handleAddVisit} />}
            {page === 'customers' && <Customers salonId={salonId} addToast={addToast} />}
            {page === 'visits' && <Visits salonId={salonId} addToast={addToast} />}
            {page === 'reports' && <Reports salonId={salonId} />}
            {page === 'whatsapp' && <WhatsApp salonId={salonId} />}
          </div>
        </div>
      </div>
      {showVisitModal && (
        <VisitModal salonId={salonId} customers={visitCustomers} visit={null}
          onClose={() => setShowVisitModal(false)}
          onSave={() => { setShowVisitModal(false); addToast('Visit saved!', 'success'); setPage('dashboard') }}
          addToast={addToast}
        />
      )}
      <Toasts toasts={toasts} />
    </>
  )
}

// ── Login Page ────────────────────────────────────────────
function LoginPage({ onLogin, addToast, toasts }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const LOGIN_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=DM+Sans:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0A0A0B;color:#F0EDE8;font-family:'DM Sans',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .lp{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 50%,rgba(201,168,76,.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(201,168,76,.04) 0%,transparent 50%)}
    .lcard{background:#111113;border:1px solid rgba(201,168,76,.15);border-radius:20px;padding:40px;width:100%;max-width:400px;animation:slideUp .5s ease}
    .lbrand{text-align:center;margin-bottom:32px}
    .lbrand h1{font-family:'Cormorant Garamond',serif;font-size:36px;color:#C9A84C;margin-bottom:4px}
    .lbrand p{color:#9A9494;font-size:13px;letter-spacing:.1em;text-transform:uppercase}
    .ig{margin-bottom:16px}
    .ig label{display:block;font-size:12px;color:#9A9494;margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:.08em}
    input{width:100%;background:#18181C;border:1px solid rgba(201,168,76,.15);border-radius:8px;padding:9px 12px;color:#F0EDE8;font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
    input:focus{border-color:#8B6F2E}
    input::placeholder{color:#9A9494}
    .btn-login{width:100%;padding:11px;background:#C9A84C;color:#0A0A0B;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px}
    .btn-login:hover{background:#E2C97E}
    .btn-login:disabled{opacity:.5;cursor:not-allowed}
    .err{background:rgba(224,92,92,.1);border:1px solid rgba(224,92,92,.4);border-radius:8px;padding:10px 14px;color:#E05C5C;font-size:13px;margin-bottom:12px}
    .footer-txt{text-align:center;font-size:11px;color:#9A9494;margin-top:20px;letter-spacing:.05em}
    .spinner{width:18px;height:18px;border:2px solid rgba(0,0,0,.3);border-top-color:#0A0A0B;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
    .toasts{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px}
    .toast{background:#18181C;border:1px solid rgba(201,168,76,.15);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:10px;min-width:280px;animation:slideIn .3s ease;font-size:13px}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
  `

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
      onLogin(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{LOGIN_CSS}</style>
      <div className="lp">
        <div className="lcard">
          <div className="lbrand">
            <h1>LuxeSalon</h1>
            <p>Management System Login</p>
          </div>
          {error && <div className="err">{error}</div>}
          <div className="ig">
            <label>Email Address</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="ig">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In to Dashboard'}
          </button>
          <div className="footer-txt">Authorized Personnel Only • LuxeSalon © 2026</div>
        </div>
      </div>
      <div className="toasts">
        {toasts.map(t => <div key={t.id} className="toast">{t.message}</div>)}
      </div>
    </>
  )
}