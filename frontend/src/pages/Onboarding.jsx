import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useArahStore from '../store/useArahStore'
import { analyzeFromForm, uploadCV, analyzeFromCV } from '../services/api'

const ROLES = [
  "Data Analyst", "Data Scientist", "Backend Developer",
  "Frontend Developer", "Mobile Developer", "Product Manager",
  "Business Analyst", "Cloud Practitioner", "UX Designer", "UX Researcher"
]

const LEVELS = ["junior", "mid", "senior"]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setResult, setLoading, setUserInput, isLoading } = useArahStore()
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

  const handleSubmit = async () => {
    setError('')
    const finalRole = form.target_role === 'lainnya' ? customRole : form.target_role

    if (!form.major || !finalRole) {
      setError('Jurusan dan target karir wajib diisi')
      return
    }

    if (form.target_role === 'lainnya' && !customRole) {
      setError('Masukkan target karir kamu')
      return
    }

    setLoading(true)
    setUserInput({ ...form, target_role: finalRole, inputType })

    try {
      let result

      if (inputType === 'cv' && cvFile) {
        const uploaded = await uploadCV(cvFile)
        result = await analyzeFromCV({
          major: form.major,
          target_role: finalRole,
          level: form.level,
          extracted_text: uploaded.extracted_text,
          job_desc: jobDesc
        })
      } else {
        if (!form.self_described_skills) {
          setError('Deskripsikan skill kamu')
          setLoading(false)
          return
        }
        result = await analyzeFromForm({
          ...form,
          target_role: finalRole,
          job_desc: jobDesc
        })
      }

      setResult(result)
      navigate('/result')
    } catch (e) {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Arah</h1>
          <p className="text-gray-500 mt-1">Temukan arahmu dari latar belakangmu.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setInputType('form')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              inputType === 'form' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Isi Manual
          </button>
          <button
            onClick={() => setInputType('cv')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              inputType === 'cv' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            Upload CV
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
            <input
              type="text"
              placeholder="contoh: Sistem Informasi, Teknik Informatika"
              value={form.major}
              onChange={e => setForm({ ...form, major: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target karir</label>
            <select
              value={form.target_role}
              onChange={e => setForm({ ...form, target_role: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Pilih role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              <option value="lainnya">Lainnya...</option>
            </select>

            {form.target_role === 'lainnya' && (
              <input
                type="text"
                placeholder="contoh: Prompt Engineer, AI Researcher, MLOps Engineer"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                className="w-full mt-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, level: l })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                    form.level === l
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {inputType === 'form' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill yang kamu punya
              </label>
              <textarea
                rows={4}
                placeholder="Ceritakan skill kamu... contoh: Saya bisa Python, pernah belajar machine learning, dan familiar dengan SQL"
                value={form.self_described_skills}
                onChange={e => setForm({ ...form, self_described_skills: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload CV (PDF)</label>
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-all"
              >
                {cvFile ? (
                  <p className="text-sm text-gray-700 font-medium">{cvFile.name}</p>
                ) : (
                  <p className="text-sm text-gray-400">Klik untuk upload CV kamu</p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setCvFile(e.target.files[0])}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Paste job description yang ingin kamu apply... AI akan analisis skill yang dibutuhkan secara spesifik"
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <a>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Menganalisis...
            </a>
          ) : 'Analisis Sekarang'}
        </button>

      </div>
    </div>
  )
}
