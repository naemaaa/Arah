import { useState, useRef } from 'react'
import { analyzeFromForm, uploadCV, analyzeFromCV } from '../services/api'
import logo from '../assets/arah-logo.png'

const apiUrl = import.meta.env.VITE_API_URL;

async function analyzeCV(cvData) {
  const response = await fetch(`${apiUrl}/api/analyze/cv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cvData),
  });
  return response.json();
}

const ROLE_GROUPS = {
  "Software Engineering": [
    "Backend Developer", "Frontend Developer", "Fullstack Developer",
    "Mobile Developer", "DevOps Engineer"
  ],
  "Data & AI": [
    "Data Analyst", "Data Scientist", "Data Engineer", "Machine Learning Engineer"
  ],
  "Product & Design": [
    "Product Manager", "UX Designer", "UX Researcher", "UI/UX Designer", "Product Owner"
  ],
  "Business & Cloud": [
    "Business Analyst", "Cloud Practitioner", "Cloud Architect"
  ]
}
const ROLES = Object.values(ROLE_GROUPS).flat()
const LEVELS = ["junior", "mid", "senior"]

// ── Helpers (defined OUTSIDE Dashboard so they never get re-created)
const labelStyle = {
  display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px'
}
const inputStyle = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: '#1e293b', outline: 'none', transition: 'border-color 0.2s',
  lineHeight: 1.4, fontFamily: 'inherit'
}
const cardStyle = {
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: '14px', padding: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
}
function mkBadge(color, bg, border) {
  return { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, padding: '4px 11px', borderRadius: '20px', background: bg, color, border: `1px solid ${border}` }
}
function mkSkillBadge(color, bg, border) {
  return { display: 'inline-block', fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '6px', background: bg, color, border: `1px solid ${border}` }
}

export default function Dashboard() {
  const fileRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const [inputType, setInputType] = useState('form')
  const [form, setForm] = useState({ major: '', target_role: '', level: 'junior', self_described_skills: '' })
  const [customRole, setCustomRole] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [completedWeeks, setCompletedWeeks] = useState(() => {
    try {
      const saved = localStorage.getItem('arah_completed_weeks')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleWeek = (weekKey) => {
    const updated = { ...completedWeeks, [weekKey]: !completedWeeks[weekKey] }
    setCompletedWeeks(updated)
    localStorage.setItem('arah_completed_weeks', JSON.stringify(updated))
  }

  const finalRole = form.target_role === 'lainnya' ? customRole : form.target_role
  const gap = result?.gap
  const roadmap = result?.roadmap

  const handleSubmit = async () => {
    setError('')
    if (!form.major || !finalRole) { setError('Jurusan dan target karir wajib diisi'); return }
    setIsLoading(true)
    try {
      let res
      if (inputType === 'cv' && cvFile) {
        const uploaded = await uploadCV(cvFile)
        res = await analyzeFromCV({ major: form.major, target_role: finalRole, level: form.level, extracted_text: uploaded.extracted_text, job_desc: jobDesc })
      } else {
        if (!form.self_described_skills) { setError('Deskripsikan skill kamu'); setIsLoading(false); return }
        res = await analyzeFromForm({ ...form, target_role: finalRole, job_desc: jobDesc })
      }
      setResult(res)
      if (window.innerWidth <= 768) setSidebarOpen(false)
    } catch { setError('Terjadi kesalahan, coba lagi') }
    finally { setIsLoading(false) }
  }

  const handleReset = () => {
    setResult(null)
    setForm({ major: '', target_role: '', level: 'junior', self_described_skills: '' })
    setCustomRole(''); setJobDesc(''); setCvFile(null); setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', color: '#1e293b', fontFamily: "'Inter',-apple-system,sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '56px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="hamburger-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="Arah" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#2563eb', letterSpacing: '0.06em' }}>ARAH</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {result && (
            <div style={{ display: 'flex', gap: '16px' }}>
              {['Analisis', 'Roadmap'].map(nav => (
                <a key={nav} href={`#${nav.toLowerCase()}`} style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>{nav}</a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="backdrop" onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, top: '56px', background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
        )}

        {/* ── SIDEBAR — content INLINED (no sub-component to avoid remount on state change) */}
        <aside className={sidebarOpen ? 'sidebar open' : 'sidebar collapsed'}>
          {/* Title */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', margin: 0 }}>Kustomisasi Analisis</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', margin: '3px 0 0' }}>Sesuaikan profil untuk hasil presisi</p>
          </div>

          {/* Target Karir */}
          <div>
            <label style={labelStyle}>Target Karir</label>
            <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })} style={inputStyle}>
              <option value="">Pilih role...</option>
              {Object.entries(ROLE_GROUPS).map(([groupName, roles]) => (
                <optgroup key={groupName} label={groupName}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </optgroup>
              ))}
              <option value="lainnya">Lainnya (Kustom)...</option>
            </select>
            {form.target_role === 'lainnya' && (
              <input type="text" placeholder="Contoh: Prompt Engineer" value={customRole}
                onChange={e => setCustomRole(e.target.value)} style={{ ...inputStyle, marginTop: '6px' }} />
            )}
          </div>

          {/* Level */}
          <div>
            <label style={labelStyle}>Level Karir</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setForm({ ...form, level: l })} style={{
                  flex: 1, padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: form.level === l ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                  background: form.level === l ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : '#f8fafc',
                  color: form.level === l ? '#fff' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                }}>{l.charAt(0).toUpperCase() + l.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Jurusan */}
          <div>
            <label style={labelStyle}>Jurusan</label>
            <input type="text" placeholder="Contoh: Sistem Informasi" value={form.major}
              onChange={e => setForm({ ...form, major: e.target.value })} style={inputStyle} />
          </div>

          {/* Toggle Manual / CV */}
          <div>
            <div style={{ display: 'flex', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '3px', gap: '3px', marginBottom: '12px' }}>
              {[['form', 'Isi Manual'], ['cv', 'Upload CV']].map(([t, lbl]) => (
                <button key={t} onClick={() => setInputType(t)} style={{
                  flex: 1, padding: '7px 0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none',
                  background: inputType === t ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'transparent',
                  color: inputType === t ? '#fff' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
                }}>{lbl}</button>
              ))}
            </div>

            {inputType === 'form' ? (
              <div>
                <label style={labelStyle}>Skill yang Kamu Punya</label>
                <textarea rows={4} placeholder="Ceritakan skill dan pengalaman kamu..."
                  value={form.self_described_skills} onChange={e => setForm({ ...form, self_described_skills: e.target.value })}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Upload CV (PDF)</label>
                <div onClick={() => fileRef.current.click()} style={{
                  border: `2px dashed ${cvFile ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '10px',
                  padding: '20px 12px', textAlign: 'center', cursor: 'pointer',
                  background: cvFile ? '#eff6ff' : '#f8fafc', transition: 'all 0.2s'
                }}>
                  {cvFile ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, margin: '0 0 2px' }}>{cvFile.name}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Klik untuk ganti</p>
                    </>
                  ) : (
                    <>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}>
                        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                      </svg>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 2px' }}>Klik untuk upload CV</p>
                      <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>PDF only</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label style={labelStyle}>Job Description <span style={{ fontWeight: 400, color: '#cbd5e1', fontSize: '10px', textTransform: 'none', letterSpacing: 0 }}>(opsional)</span></label>
            <textarea rows={3} placeholder="Paste job description dari lowongan yang dituju..."
              value={jobDesc} onChange={e => setJobDesc(e.target.value)}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Jika diisi, analisis lebih spesifik</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button onClick={result ? handleReset : handleSubmit} disabled={isLoading} style={{
            width: '100%', padding: '13px 0', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            border: result ? '1.5px solid #e2e8f0' : 'none',
            background: result ? '#f8fafc' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
            color: result ? '#64748b' : '#fff', cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: result ? 'none' : '0 4px 16px rgba(37,99,235,0.2)', letterSpacing: '0.01em'
          }}>
            {isLoading
              ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Menganalisis...</>
              : result ? 'Perbarui Analisis' : 'Mulai Analisis'
            }
          </button>
        </aside>

        {/* ── MAIN CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', minWidth: 0 }}>
          {!result ? (
            <div style={{ height: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: '340px', padding: '0 16px' }}>
                <div style={{ width: '64px', height: '64px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Siap untuk Analisis?</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 20px' }}>
                  Isi form di sidebar untuk memulai analisis karir berbasis AI dan dapatkan roadmap personal kamu.
                </p>
                <button className="mobile-cta" onClick={() => setSidebarOpen(true)} style={{
                  display: 'none', background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                  color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.2)'
                }}>Mulai Analisis</button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '860px' }}>

              {/* ── ANALISIS */}
              <section id="analisis">
                {/* Hero */}
                <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'stretch' }}>
                  <div style={cardStyle}>
                    <div style={{ marginBottom: '10px' }}>
                      {gap.match_score >= 60
                        ? <span style={mkBadge('#1d4ed8','#eff6ff','#bfdbfe')}>Siap Apply</span>
                        : gap.match_score >= 30
                        ? <span style={mkBadge('#4f46e5','#f5f3ff','#ddd6fe')}>Perlu Latihan Intensif</span>
                        : <span style={mkBadge('#475569','#f8fafc','#e2e8f0')}>Kesenjangan Tinggi</span>
                      }
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{finalRole}</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                      Analisis menunjukkan Anda menguasai <strong style={{ color: '#1e293b' }}>{gap.matched_skills.length} dari {gap.total_required} skill</strong> utama.
                    </p>
                  </div>
                  <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '16px 20px', minWidth: '130px' }}>
                    <div style={{ position: 'relative', width: '88px', height: '88px' }}>
                      <svg width="88" height="88" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle cx="60" cy="60" r="52" fill="none"
                          stroke={gap.match_score >= 60 ? '#2563eb' : gap.match_score >= 30 ? '#4f46e5' : '#64748b'}
                          strokeWidth="10" strokeDasharray={`${gap.match_score * 3.267} 326.7`} strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>{gap.match_score}%</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Matching Rate</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ ...cardStyle, borderColor: '#bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Skill Dikuasai</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{gap.matched_skills.length} skill</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {gap.matched_skills.length > 0
                        ? gap.matched_skills.map(s => <span key={s} style={mkSkillBadge('#1d4ed8','#eff6ff','#bfdbfe')}>{s}</span>)
                        : <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Belum ada yang match</p>}
                    </div>
                  </div>
                  <div style={{ ...cardStyle, borderColor: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gap Kompetensi</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{gap.missing_skills.length} skill</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {gap.missing_skills.length > 0
                        ? gap.missing_skills.map(s => <span key={s} style={mkSkillBadge('#475569','#f1f5f9','#e2e8f0')}>{s}</span>)
                        : <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Semua skill sudah dimiliki!</p>}
                    </div>
                  </div>
                </div>

                {/* Background strength */}
                {roadmap?.background_strength && (
                  <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd', background: '#f0f7ff', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      <div>
                        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 5px' }}>Kekuatan Background Anda</h3>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, margin: 0 }}>{roadmap.background_strength}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ── ROADMAP */}
              {roadmap?.weekly_plan && (
                <section id="roadmap" style={{ marginTop: '40px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Roadmap Belajar</h2>
                    {roadmap.estimated_duration && (
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', display: 'inline-block', marginBottom: '6px' }}>
                        {roadmap.estimated_duration}
                      </span>
                    )}
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                      Langkah strategis menuju {finalRole} Profesional
                    </p>
                  </div>

                  <div className="timeline-container">
                    {roadmap.weekly_plan.map((week, i) => {
                      const weekKey = `${finalRole}_${week.week}`
                      const isCompleted = !!completedWeeks[weekKey]
                      return (
                        <div key={i} className={`timeline-item ${isCompleted ? 'completed' : ''}`} style={{ position: 'relative' }}>
                          {/* Step number / dot */}
                          <div className={`timeline-dot ${isCompleted ? 'completed' : ''}`} onClick={() => toggleWeek(weekKey)} title="Tandai Selesai">
                            {isCompleted ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <span>{String(i + 1).padStart(2, '0')}</span>
                            )}
                          </div>

                          <div style={{
                            ...cardStyle,
                            borderColor: isCompleted ? '#bfdbfe' : '#e2e8f0',
                            background: isCompleted ? '#f8fafc' : '#fff',
                            opacity: isCompleted ? 0.85 : 1,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            padding: '20px',
                            borderRadius: '16px',
                            boxShadow: isCompleted ? 'none' : '0 4px 20px -2px rgba(0,0,0,0.02), 0 2px 5px -1px rgba(0,0,0,0.01)',
                            marginLeft: '4px'
                          }}>
                            {/* Card Header with week and checkbox */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>{week.week}</span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: isCompleted ? '#2563eb' : '#64748b', userSelect: 'none' }}>
                                <input type="checkbox" checked={isCompleted} onChange={() => toggleWeek(weekKey)} style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2563eb', margin: 0 }} />
                                {isCompleted ? 'Selesai' : 'Tandai Selesai'}
                              </label>
                            </div>

                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{week.focus}</h3>
                            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65, margin: '0 0 12px' }}>{week.action}</p>

                            {/* Skill tags */}
                            {week.skills?.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                                {week.skills.map(s => (
                                  <span key={s} style={{ fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>{s}</span>
                                ))}
                              </div>
                            )}

                            {/* Resource links per skill */}
                            {week.skills?.some(s => roadmap.skill_resources?.[s]) && (
                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Belajar dari</p>
                                {week.skills.map(s => {
                                  const res = roadmap.skill_resources?.[s]
                                  if (!res) return null

                                  if (res.type === 'course') {
                                    return res.items?.map((c, j) => (
                                      <a key={`${s}-${j}`} href={c.url} target="_blank" rel="noreferrer" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                                        color: '#2563eb', textDecoration: 'none', fontSize: '12px', fontWeight: 500
                                      }}>
                                        <span style={{ width: '20px', height: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </span>
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                                        {c.price === 'free' && <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>Gratis</span>}
                                      </a>
                                    ))
                                  }

                                  // YouTube + Google/article links
                                  return (
                                    <div key={s} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      {res.youtube && (
                                        <a href={res.youtube} target="_blank" rel="noreferrer" style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                                          fontSize: '11px', fontWeight: 600, color: '#fff', textDecoration: 'none',
                                          background: '#ef4444', padding: '4px 10px', borderRadius: '6px'
                                        }}>
                                          <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                          </svg>
                                          YouTube: {s}
                                        </a>
                                      )}
                                      {res.google && (
                                        <a href={res.google} target="_blank" rel="noreferrer" style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                                          fontSize: '11px', fontWeight: 600, color: '#2563eb', textDecoration: 'none',
                                          background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px'
                                        }}>
                                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                          </svg>
                                          Artikel: {s}
                                        </a>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>


                  {/* Recommended courses */}
                  {roadmap?.recommended_courses && (
                    <div style={{ marginTop: '32px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Kursus Direkomendasikan</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {roadmap.recommended_courses.map((course, i) => (
                          <a key={i} href={course.url} target="_blank" rel="noreferrer" style={{
                            ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '13px 16px', textDecoration: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', gap: '10px'
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <div style={{ width: '34px', height: '34px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                                </svg>
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</p>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>{course.platform}</p>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '4px 9px', borderRadius: '6px', flexShrink: 0, whiteSpace: 'nowrap',
                              ...(course.priority === 'high'
                                ? { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }
                                : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' })
                            }}>{course.priority === 'high' ? 'PRIORITAS' : 'OPSIONAL'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Footer */}
              <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 6px' }}>© 2026 ARAH — Naimatul Ulumiyah. All rights reserved.</p>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'none' }}>
                  Mari bekerjasama di LinkedIn: Naimatul Ulumiyah →
                </a>
              </footer>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter',-apple-system,sans-serif !important; background: #f8fafc !important; }
        select { cursor: pointer; font-family: inherit; }
        select option { background: #fff; color: #1e293b; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: #cbd5e1; }
        select:focus, input:focus, textarea:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        a { -webkit-tap-highlight-color: transparent; }

        .hamburger-toggle:hover {
          background-color: #f1f5f9 !important;
        }

        /* Desktop Sidebar base */
        .sidebar {
          width: 280px;
          min-width: 280px;
          background: #fff;
          border-right: 1px solid #e2e8f0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 16px;
          max-height: calc(100vh - 56px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 769px) {
          .sidebar.collapsed {
            width: 0px !important;
            min-width: 0px !important;
            padding: 20px 0px !important;
            border-right: none !important;
            opacity: 0;
            pointer-events: none;
          }
        }

        /* Timeline styles */
        .timeline-container {
          position: relative;
          border-left: 2px solid #e2e8f0;
          margin-left: 18px;
          padding-left: 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-top: 8px;
          padding-bottom: 8px;
        }
        
        .timeline-dot {
          position: absolute;
          left: -46px;
          top: 16px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #3b82f6;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 12px;
          z-index: 2;
          cursor: pointer;
          box-shadow: 0 0 0 4px #fff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        
        .timeline-dot:hover {
          background: #eff6ff;
          transform: scale(1.08);
        }
        
        .timeline-dot.completed {
          background: #2563eb;
          border-color: #2563eb;
          color: #fff;
          box-shadow: 0 0 0 4px #fff, 0 4px 12px rgba(37,99,235,0.2);
        }

        @media (max-width: 768px) {
          .backdrop { display: block !important; }
          .mobile-cta { display: block !important; }

          .sidebar {
            position: fixed !important;
            top: 56px !important; left: 0 !important;
            width: 85% !important; max-width: 320px !important;
            min-width: unset !important;
            height: calc(100vh - 56px) !important;
            max-height: calc(100vh - 56px) !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            z-index: 45;
            border-right: none !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
            opacity: 1 !important;
            pointer-events: auto !important;
          }
          .sidebar.open { transform: translateX(0) !important; }

          main { padding: 16px 14px !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .skills-grid { grid-template-columns: 1fr !important; }
          
          .timeline-container {
            margin-left: 12px;
            padding-left: 20px;
            gap: 20px;
          }
          .timeline-dot {
            left: -38px;
            width: 32px;
            height: 32px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          main { padding: 12px 10px !important; }
          h1 { font-size: 22px !important; }
          h2 { font-size: 17px !important; }
        }
      `}</style>
    </div>
  )
}
