import { useState, useRef } from 'react'
import { analyzeFromForm, uploadCV, analyzeFromCV } from '../services/api'

const ROLES = [
  "Data Analyst", "Data Scientist", "Backend Developer",
  "Frontend Developer", "Mobile Developer", "Product Manager",
  "Business Analyst", "Cloud Practitioner", "UX Designer", "UX Researcher"
]

const LEVELS = ["junior", "mid", "senior"]

export default function Dashboard() {
  const fileRef = useRef(null)
  const [inputType, setInputType] = useState('form')
  const [form, setForm] = useState({
    major: '',
    target_role: '',
    level: 'junior',
    self_described_skills: ''
  })
  const [customRole, setCustomRole] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const finalRole = form.target_role === 'lainnya' ? customRole : form.target_role

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
          setError('Deskripsikan skill kamu')
          setIsLoading(false)
          return
        }
        res = await analyzeFromForm({ ...form, target_role: finalRole, job_desc: jobDesc })
      }
      setResult(res)
    } catch (e) {
      setError('Terjadi kesalahan, coba lagi')
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

  const gap = result?.gap
  const roadmap = result?.roadmap

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-3">
        <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm" />
        </div>
        <span className="font-semibold text-sm text-slate-900">Dashboard Arah</span>
        <span className="text-slate-400 text-sm">—</span>
        <span className="text-slate-500 text-sm">Analisis Karir & Skill</span>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 p-6 flex flex-col gap-5 overflow-y-auto bg-white">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">Profil Karir</h2>
            <p className="text-slate-500 text-xs mt-1">Analisis potensi karir Anda secara instan tanpa perlu mendaftar.</p>
          </div>

          {/* Input Type Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setInputType('form')}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                inputType === 'form' ? 'bg-white text-black' : 'text-slate-500'
              }`}
            >
              Isi Manual
            </button>
            <button
              onClick={() => setInputType('cv')}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                inputType === 'cv' ? 'bg-white text-black' : 'text-slate-500'
              }`}
            >
              Upload CV
            </button>
          </div>

          {/* Jurusan */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Jurusan</label>
            <input
              type="text"
              placeholder="contoh: Sistem Informasi"
              value={form.major}
              onChange={e => setForm({ ...form, major: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gray-300 transition-all"
            />
          </div>

          {/* Target Karir */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Target Karir</label>
            <select
              value={form.target_role}
              onChange={e => setForm({ ...form, target_role: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-gray-300 transition-all"
            >
              <option value="" className="bg-[#1a1a1a]">Pilih role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              <option value="lainnya">Lainnya...</option>
            </select>
            {form.target_role === 'lainnya' && (
              <input
                type="text"
                placeholder="contoh: Prompt Engineer"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                className="w-full mt-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gray-300 transition-all"
              />
            )}
          </div>

          {/* Level */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">Level</label>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, level: l })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                    form.level === l
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-gray-200 text-slate-500 hover:border-gray-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Input */}
          {inputType === 'form' ? (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 block">Skill yang kamu punya</label>
              <textarea
                rows={3}
                placeholder="Ceritakan skill kamu..."
                value={form.self_described_skills}
                onChange={e => setForm({ ...form, self_described_skills: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gray-300 transition-all resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1.5 block">Upload CV (PDF)</label>
              <div
                onClick={() => fileRef.current.click()}
                className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all"
              >
                {cvFile
                  ? <p className="text-xs text-slate-700">{cvFile.name}</p>
                  : <p className="text-xs text-slate-400">Klik untuk upload CV</p>
                }
              </div>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
            </div>
          )}

          {/* Job Desc */}
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1.5 block">
              Job Description <span className="text-slate-500">(opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Paste job description..."
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gray-300 transition-all resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={result ? handleReset : handleSubmit}
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Menganalisis...
              </>
            ) : result ? 'Analisis Ulang' : 'Analisis Sekarang'}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {!result ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Isi form di sebelah kiri untuk memulai analisis</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">

              {/* Match Score */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Match Score</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{gap.matched_skills.length} dari {gap.total_required} skill terpenuhi</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${
                      gap.match_score >= 60 ? 'text-green-500' :
                      gap.match_score >= 30 ? 'text-yellow-500' : 'text-red-500'
                    }`}>{gap.match_score}%</p>
                    <p className={`text-xs font-medium ${
                      gap.match_score >= 60 ? 'text-green-500/70' :
                      gap.match_score >= 30 ? 'text-yellow-500/70' : 'text-red-500/70'
                    }`}>
                      {gap.match_score >= 60 ? 'SIAP APPLY' : gap.match_score >= 30 ? 'PERLU LATIHAN' : 'KESENJANGAN TINGGI'}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      gap.match_score >= 60 ? 'bg-green-500' :
                      gap.match_score >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${gap.match_score}%` }}
                  />
                </div>
                {gap.source === 'job_description' && (
                  <p className="text-xs text-blue-500/70 mt-2">Berdasarkan job description yang kamu paste</p>
                )}
              </div>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Skill yang dikuasai</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gap.matched_skills.length > 0 ? gap.matched_skills.map(s => (
                      <span key={s} className="bg-green-400/10 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-400/20">
                        {s}
                      </span>
                    )) : <p className="text-xs text-slate-400">Belum ada yang match</p>}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-orange-400/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Skill perlu dikembangkan</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gap.missing_skills.map(s => (
                      <span key={s} className="bg-orange-400/10 text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-400/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transferable Skills */}
              {gap.transferable_skills && gap.transferable_skills.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <h3 className="text-sm font-medium text-amber-900 mb-3">Transferable Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {gap.transferable_skills.map((t, i) => (
                      <span key={i} className="bg-amber-400/10 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-400/20">
                        {t.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Background Strength */}
              {roadmap?.background_strength && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-900">✦</span>
                    <h3 className="text-sm font-semibold text-slate-900">Ringkasan Kekuatan</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{roadmap.background_strength}</p>
                </div>
              )}

              {/* Roadmap */}
              {roadmap?.weekly_plan && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-5 text-slate-900">Roadmap Belajar</h3>
                  <div className="space-y-5">
                    {roadmap.weekly_plan.map((week, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          {i < roadmap.weekly_plan.length - 1 && (
                            <div className="w-px bg-gray-200 flex-1 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{week.week}</p>
                          <p className="font-semibold text-sm text-slate-900">{week.focus}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{week.action}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {week.skills?.map(s => (
                              <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses */}
              {roadmap?.recommended_courses && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold mb-4 text-slate-900">Kursus Direkomendasikan</h3>
                  <div className="space-y-3">
                    {roadmap.recommended_courses.map((course, i) => (
                      <a
                        key={i}
                        href={course.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-slate-900 transition-colors">{course.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{course.platform}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                          course.priority === 'high'
                            ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                            : 'bg-slate-100 text-slate-500 border border-gray-200'
                        }`}>
                          {course.priority === 'high' ? 'PRIORITAS' : 'OPSIONAL'}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
