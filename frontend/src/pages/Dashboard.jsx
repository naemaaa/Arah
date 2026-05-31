import { useState, useRef } from 'react'
import { 
  analyzeFromForm, 
  uploadCV, 
  analyzeFromCV 
} from '../services/api'
import logo from '../assets/arah-logo.png'
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Compass, 
  Loader2, 
  ChevronRight, 
  BookOpen, 
  Play, 
  Globe, 
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  GraduationCap
} from 'lucide-react'

const ROLES = [
  "Data Analyst", "Data Scientist", "Backend Developer",
  "Frontend Developer", "Mobile Developer", "Product Manager",
  "Business Analyst", "Cloud Practitioner", "UX Designer", "UX Researcher"
]
const LEVELS = ["junior", "mid", "senior"]

export default function Dashboard() {
  const fileRef = useRef(null)
  const [inputType, setInputType] = useState('form')
  const [form, setForm] = useState({ major: '', target_role: '', level: 'junior', self_described_skills: '' })
  const [customRole, setCustomRole] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const finalRole = form.target_role === 'lainnya' ? customRole : form.target_role
  const gap = result?.gap
  const roadmap = result?.roadmap

  const handleSubmit = async () => {
    setError('')
    if (!form.major || !finalRole) { 
      setError('Jurusan dan target karir wajib diisi')
      return 
    }
    setIsLoading(true)
    try {
      let res
      if (inputType === 'cv' && cvFile) {
        const uploaded = await uploadCV(cvFile)
        res = await analyzeFromCV({ 
          major: form.major, 
          target_role: finalRole, 
          level: form.level, 
          extracted_text: uploaded.extracted_text, 
          job_desc: jobDesc 
        })
      } else {
        if (!form.self_described_skills) { 
          setError('Deskripsikan skill kamu terlebih dahulu')
          setIsLoading(false)
          return 
        }
        res = await analyzeFromForm({ ...form, target_role: finalRole, job_desc: jobDesc })
      }
      setResult(res)
    } catch (err) { 
      console.error(err)
      setError('Terjadi kesalahan koneksi atau server. Coba lagi.') 
    } finally { 
      setIsLoading(false) 
    }
  }

  const handleReset = () => {
    setResult(null)
    setForm({ major: '', target_role: '', level: 'junior', self_described_skills: '' })
    setCustomRole('')
    setJobDesc('')
    setCvFile(null)
    setError('')
  }

  // Radial match rate gauge calculations
  const matchRate = gap?.match_score || 0
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (matchRate / 100) * circumference

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800">
      
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D5C30] to-[#3D7B3E] flex items-center justify-center shadow-md">
            <img src={logo} alt="Arah" className="w-5 h-5 object-contain invert brightness-200" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight leading-none block">ARAH</span>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 block">Career Roadmap AI</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-[#E8F5E9] text-[#2D5C30] text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#BCE3C5]">
            Matcha Engine
          </span>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Mint Green Welcome Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E6F4EA] via-[#D8F0DF] to-[#CCEBD5] p-6 sm:p-8 border border-[#BCE3C5] shadow-sm flex justify-between items-center">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#2D5C30] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Interactive Peta Karir
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#113C1C] tracking-tight leading-tight mb-2">
              Petakan Karir Impianmu Bersama ARAH
            </h1>
            <p className="text-[#2D5C30] text-xs sm:text-sm font-medium leading-relaxed mb-4">
              Temukan kesenjangan keahlian antara jurusan/CV kamu saat ini dengan target karir yang dituju, lalu dapatkan peta jalan belajar yang terpersonalisasi secara instan.
            </p>
          </div>
          <div className="relative hidden lg:block pr-8 z-10">
            <div className="w-32 h-20 bg-gradient-to-t from-[#2D5C30] to-[#3D7B3E] rounded-t-full shadow-lg flex items-center justify-center text-3xl">🍵</div>
          </div>
        </div>

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: CUSTOMIZATION FORM */}
          <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-800 tracking-tight">Kustomisasi Analisis</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Sesuaikan profil untuk hasil roadmap presisi</p>
            </div>

            <div className="space-y-4">
              {/* Target Karir */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target Karir</label>
                <select 
                  value={form.target_role} 
                  onChange={e => setForm({ ...form, target_role: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#BCE3C5] focus:bg-white rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none transition-all"
                >
                  <option value="">Pilih role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="lainnya">Lainnya...</option>
                </select>
                {form.target_role === 'lainnya' && (
                  <input 
                    type="text" 
                    placeholder="Contoh: Prompt Engineer" 
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)} 
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#BCE3C5] focus:bg-white rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none mt-2 transition-all"
                  />
                )}
              </div>

              {/* Level Karir */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Level Karir Target</label>
                <div className="flex gap-2">
                  {LEVELS.map(l => {
                    const isActive = form.level === l
                    return (
                      <button 
                        key={l} 
                        onClick={() => setForm({ ...form, level: l })} 
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border text-capitalize ${
                          isActive 
                            ? 'bg-[#E8F5E9] border-[#2D5C30] text-[#2D5C30]' 
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jurusan Saat Ini</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Sistem Informasi / Teknik Elektro" 
                  value={form.major}
                  onChange={e => setForm({ ...form, major: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#BCE3C5] focus:bg-white rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none transition-all"
                />
              </div>

              {/* Toggle Input Type (Form vs CV) */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Metode input skill</label>
                <div className="flex bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-1 gap-1">
                  {[
                    ['form', 'Isi Manual'],
                    ['cv', 'Upload CV (PDF)']
                  ].map(([type, label]) => {
                    const isActive = inputType === type
                    return (
                      <button
                        key={type}
                        onClick={() => setInputType(type)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#2D5C30] to-[#3D7B3E] text-white shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600 bg-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Skill input content */}
              <div>
                {inputType === 'form' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Keahlian Saat Ini</label>
                    <textarea 
                      rows={4} 
                      placeholder="Ceritakan skill dan pengalaman kamu saat ini... (Contoh: Menguasai HTML/CSS dasar, mengerti database MySQL, paham Git)"
                      value={form.self_described_skills} 
                      onChange={e => setForm({ ...form, self_described_skills: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#BCE3C5] focus:bg-white rounded-xl p-3 text-xs font-semibold text-gray-700 outline-none resize-none transition-all leading-relaxed"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Upload CV (PDF)</label>
                    <div 
                      onClick={() => fileRef.current.click()} 
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        cvFile 
                          ? 'bg-[#F0F8F1]/40 border-[#2D5C30]' 
                          : 'bg-[#F8FAFC] border-gray-200 hover:border-[#2D5C30]'
                      }`}
                    >
                      {cvFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 size={24} className="text-[#2D5C30] mb-2" />
                          <p className="text-xs font-bold text-gray-700 max-w-[200px] truncate">{cvFile.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Klik untuk mengganti</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={24} className="text-gray-400 mb-2" />
                          <p className="text-xs font-bold text-gray-600">Klik untuk upload CV</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Format PDF saja</p>
                        </div>
                      )}
                      <input 
                        ref={fileRef} 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={e => setCvFile(e.target.files[0])} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description (Optional) */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Job Description Lowongan <span className="lowercase font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea 
                  rows={3} 
                  placeholder="Tempel job description lowongan kerja yang kamu incar di sini agar hasil analisis lebih pas dengan kebutuhan perusahaan..."
                  value={jobDesc} 
                  onChange={e => setJobDesc(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#BCE3C5] focus:bg-white rounded-xl p-3 text-xs font-semibold text-gray-700 outline-none resize-none transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 items-start">
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-600 leading-normal">{error}</p>
              </div>
            )}

            {/* Submit / Reset button */}
            <div className="pt-2">
              {result ? (
                <button 
                  onClick={handleReset} 
                  className="w-full py-3 rounded-xl text-xs font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-gray-500 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  Mulai Analisis Baru
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2D5C30] to-[#3D7B3E] hover:from-[#1E3B20] hover:to-[#2D5C30] disabled:from-gray-300 disabled:to-gray-400 text-white transition-all shadow-md shadow-green-950/10 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Menganalisis Profil...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Mulai Analisis Karir
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS OR PLACEHOLDER */}
          <div className="lg:col-span-8 space-y-6">
            {!result ? (
              // Beautiful Placeholder State
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
                <div className="w-16 h-16 bg-[#F0F8F1] rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 text-[#2D5C30]">
                  <Compass className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-heading">Siap untuk Analisis Karir?</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed font-semibold">
                  Isi formulir kustomisasi di sebelah kiri untuk melihat persentase kecocokan Anda dengan pekerjaan target serta roadmap terstruktur untuk belajar.
                </p>
                <div className="mt-8 flex gap-2 items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                  <span>Isi Profil</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span>Tekan Analisis</span>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span>Dapatkan Hasil</span>
                </div>
              </div>
            ) : (
              // Results Presentation
              <div className="space-y-6">
                
                {/* Score & Hero Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Gauge Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Matching Rate</p>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r={radius} className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r={radius} 
                          className="stroke-[#2D5C30] transition-all duration-700 ease-out" 
                          strokeWidth="7" 
                          fill="transparent" 
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col justify-center items-center">
                        <span className="text-2xl font-black text-slate-800 font-heading leading-none">{matchRate}%</span>
                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Score</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      {matchRate >= 60 ? (
                        <span className="bg-[#E8F5E9] text-[#2D5C30] text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#BCE3C5]">
                          Siap Melamar
                        </span>
                      ) : matchRate >= 30 ? (
                        <span className="bg-amber-50 text-amber-600 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                          Perlu Latihan
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                          Kesenjangan Tinggi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D5C30] bg-[#E8F5E9] border border-[#BCE3C5] px-2 py-0.5 rounded-md">
                        Analisis AI
                      </span>
                      <h3 className="text-xl font-bold text-slate-800 mt-2 tracking-tight">
                        Target: {finalRole}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-1 capitalize">
                        Level: {form.level} • Jurusan: {form.major}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-3">
                        Dari {gap?.total_required || 0} keahlian utama yang dibutuhkan untuk posisi ini, kamu sudah menguasai {gap?.matched_skills?.length || 0} skill. Kamu butuh meningkatkan {gap?.missing_skills?.length || 0} skill lainnya.
                      </p>
                    </div>
                    
                    {roadmap?.background_strength && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#2D5C30] flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                          <strong>Kekuatan Background:</strong> {roadmap.background_strength}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Grid (Dikuasai vs Gap) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Mastered Skills Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] text-[#2D5C30] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Skill yang Dikuasai</span>
                      <span className="ml-auto text-[11px] font-bold text-[#2D5C30] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        {gap?.matched_skills?.length || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {gap?.matched_skills?.length > 0 ? (
                        gap.matched_skills.map(s => (
                          <span key={s} className="bg-[#E8F5E9] text-[#2D5C30] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#BCE3C5]">
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">Belum ada skill yang sesuai dengan kriteria lowongan</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Gap Kompetensi</span>
                      <span className="ml-auto text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        {gap?.missing_skills?.length || 0}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {gap?.missing_skills?.length > 0 ? (
                        gap.missing_skills.map(s => (
                          <span key={s} className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-200">
                            {s}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-[#2D5C30] font-bold">Luar biasa! Kamu menguasai semua skill yang dibutuhkan.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── ROADMAP WEEKLY PLAN ── */}
                {roadmap?.weekly_plan && (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h3 className="text-base font-bold text-gray-800">Roadmap Pembelajaran</h3>
                        <p className="text-xs text-gray-400 font-medium">Langkah demi langkah menuju karir impian Anda</p>
                      </div>
                      {roadmap.estimated_duration && (
                        <span className="bg-[#E8F5E9] text-[#2D5C30] text-[10px] font-bold px-3 py-1.5 rounded-xl border border-[#BCE3C5] self-start sm:self-center">
                          Estimasi Durasi: {roadmap.estimated_duration}
                        </span>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {roadmap.weekly_plan.map((week, idx) => {
                        const hasResource = week.skills?.some(s => roadmap.skill_resources?.[s])
                        
                        return (
                          <div key={idx} className="flex gap-4 p-4 bg-[#FAFCFA] border border-[#F1F5F9] rounded-2xl relative hover:border-[#BCE3C5] transition-all">
                            {/* Step Node */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D5C30] to-[#3D7B3E] text-white flex items-center justify-center font-black text-xs shadow-md flex-shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </div>

                            <div className="flex-1 space-y-2.5">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#2D5C30] block leading-none mb-1">
                                  {week.week}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800">{week.focus}</h4>
                              </div>
                              
                              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                {week.action}
                              </p>

                              {/* Skills to learn in this phase */}
                              {week.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {week.skills.map(s => (
                                    <span key={s} className="bg-white border border-[#E2E8F0] text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Resources Container */}
                              {hasResource && (
                                <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2">
                                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">Rekomendasi Materi Belajar</p>
                                  <div className="flex flex-col gap-2">
                                    {week.skills.map(s => {
                                      const res = roadmap.skill_resources?.[s]
                                      if (!res) return null

                                      if (res.type === 'course') {
                                        return res.items?.map((c, j) => (
                                          <a 
                                            key={`${s}-${j}`} 
                                            href={c.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex items-center justify-between bg-white border border-[#E2E8F0] hover:border-[#BCE3C5] p-2 rounded-xl text-xs text-[#2D5C30] font-bold transition-all shadow-sm max-w-md"
                                          >
                                            <div className="flex items-center gap-2 truncate">
                                              <div className="w-6 h-6 bg-[#E8F5E9] text-[#2D5C30] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <BookOpen size={12} />
                                              </div>
                                              <span className="truncate">{c.title}</span>
                                            </div>
                                            {c.price === 'free' && (
                                              <span className="bg-[#E8F5E9] text-[#2D5C30] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0">
                                                Gratis
                                              </span>
                                            )}
                                          </a>
                                        ))
                                      }

                                      return (
                                        <div key={s} className="flex gap-2 flex-wrap">
                                          {res.youtube && (
                                            <a 
                                              href={res.youtube} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                            >
                                              <Play size={12} />
                                              YouTube: {s}
                                            </a>
                                          )}
                                          {res.google && (
                                            <a 
                                              href={res.google} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white border border-[#E2E8F0] hover:bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                            >
                                              <Globe size={12} />
                                              Artikel: {s}
                                            </a>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recommended courses list */}
                {roadmap?.recommended_courses && (
                  <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">Kursus Kursus Rekomendasi</h3>
                      <p className="text-xs text-gray-400 font-medium">Berdasarkan hasil analisis gap keahlian kamu</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roadmap.recommended_courses.map((course, idx) => (
                        <a 
                          key={idx} 
                          href={course.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center justify-between p-3.5 bg-[#FAFCFA] border border-[#F1F5F9] rounded-2xl hover:border-[#BCE3C5] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-[#E8F5E9] text-[#2D5C30] rounded-xl flex items-center justify-center flex-shrink-0">
                              <GraduationCap size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{course.title}</p>
                              <p className="text-[10px] text-gray-400 font-semibold">{course.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              course.priority === 'high' 
                                ? 'bg-red-50 text-red-600 border border-red-200' 
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {course.priority === 'high' ? 'Prioritas' : 'Opsional'}
                            </span>
                            <ArrowRight size={12} className="text-gray-300 group-hover:text-[#2D5C30] transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-white border-t border-[#E2E8F0] text-center space-y-2">
        <p className="text-[11px] text-gray-400 font-medium">© 2026 ARAH — Powered by Matcha. All rights reserved.</p>
        <p className="text-[11px] text-[#2D5C30] font-bold">
          Mari bekerjasama di LinkedIn: Naimatul Ulumiyah →
        </p>
      </footer>
    </div>
  )
}
