import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useArahStore from '../store/useArahStore'

export default function Result() {
  const navigate = useNavigate()
  const { result, userInput, reset } = useArahStore()

  useEffect(() => {
    if (!result) navigate('/')
  }, [result])

  if (!result) return null

  const { gap, roadmap } = result

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arah</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {userInput?.major} → {gap?.target_role} ({gap?.level})
            </p>
          </div>
          <div className="flex items-center gap-3">
            {gap?.source === 'job_description' && (
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
                Berdasarkan Job Desc
              </span>
            )}
            <button
              onClick={() => { reset(); navigate('/') }}
              className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg transition-all"
            >
              Mulai ulang
            </button>
          </div>
        </div>

        {/* Match Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900">Match Score</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {gap.matched_skills.length} dari {gap.total_required} skill terpenuhi
              </p>
            </div>
            <span className={`text-3xl font-bold ${
              gap.match_score >= 60 ? 'text-green-600' :
              gap.match_score >= 30 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {gap.match_score}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                gap.match_score >= 60 ? 'bg-green-500' :
                gap.match_score >= 30 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${gap.match_score}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {gap.match_score >= 60
              ? 'Kamu sudah cukup siap! Fokus pada skill yang masih kurang.'
              : gap.match_score >= 30
              ? 'Kamu di jalur yang benar. Masih ada beberapa skill yang perlu dikembangkan.'
              : 'Jangan khawatir! Setiap expert dulunya juga pemula. Ikuti roadmap di bawah.'}
          </p>
        </div>

        {/* Skill Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              Skill yang kamu punya
            </h2>
            <div className="flex flex-wrap gap-2">
              {gap.matched_skills.length > 0 ? gap.matched_skills.map(s => (
                <span key={s} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
                  {s}
                </span>
              )) : (
                <p className="text-sm text-gray-400">Belum ada skill yang match</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              Skill yang perlu dikembangkan
            </h2>
            <div className="flex flex-wrap gap-2">
              {gap.missing_skills.map(s => (
                <span key={s} className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1.5 rounded-full border border-red-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Transferable Skills */}
        {gap.transferable_skills && gap.transferable_skills.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-amber-900 mb-3">
              Transferable Skills dari jurusanmu
            </h2>
            <div className="flex flex-wrap gap-2">
              {gap.transferable_skills.map((t, i) => (
                <div key={i} className="bg-white border border-amber-200 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-amber-800">{t.skill}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{t.relevance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Background Strength */}
        {roadmap?.background_strength && (
          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Background kamu adalah kekuatan
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">
              {roadmap.background_strength}
            </p>
          </div>
        )}

        {/* Summary */}
        {roadmap?.summary && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Ringkasan</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{roadmap.summary}</p>
          </div>
        )}

        {/* Weekly Plan */}
        {roadmap?.weekly_plan && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-6">Roadmap Belajar</h2>
            <div className="space-y-6">
              {roadmap.weekly_plan.map((week, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < roadmap.weekly_plan.length - 1 && (
                      <div className="w-px bg-gray-200 flex-1 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs font-medium text-gray-400 mb-1">{week.week}</p>
                    <p className="font-semibold text-sm text-gray-900">{week.focus}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{week.action}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {week.skills?.map(s => (
                        <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100">
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

        {/* Recommended Courses */}
        {roadmap?.recommended_courses && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Course yang Direkomendasikan</h2>
            <div className="space-y-3">
              {roadmap.recommended_courses.map((course, i) => (
                <a
                  key={i}
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{course.platform}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      course.priority === 'high'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {course.priority === 'high' ? 'Prioritas' : 'Opsional'}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          Dibuat dengan Arah — Your background is your starting point.
        </p>

      </div>
    </div>
  )
}
