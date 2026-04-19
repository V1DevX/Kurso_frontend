import { useEffect, useState } from 'react'
import client from '@/api/client'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    client.get('/moderation/pending')
      .then(({ data }) => setCourses(data))
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const approve = async (id) => {
    try {
      await client.put(`/moderation/${id}/approve`)
      setCourses((c) => c.filter((x) => x._id !== id))
    } catch { setError('Ошибка') }
  }

  const reject = async (id) => {
    if (!reason.trim()) return
    try {
      await client.put(`/moderation/${id}/reject`, { rejectionReason: reason })
      setCourses((c) => c.filter((x) => x._id !== id))
      setRejectId(null)
      setReason('')
    } catch { setError('Ошибка') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text">Курсы на проверке</h1>
      <ErrorMessage message={error} />

      {courses.length === 0 ? (
        <p className="text-muted text-center py-16">Нет курсов на проверке</p>
      ) : (
        courses.map((course) => (
          <div key={course._id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-text">{course.title}</h2>
                <p className="text-muted text-sm mt-0.5">{course.description}</p>
                <p className="text-muted text-xs mt-1">
                  Автор: <span className="text-text">{course.authorId?.name || '—'}</span>
                  {' · '}
                  Сложность: <span className="text-text">{course.difficulty}</span>
                  {' · '}
                  Категория: <span className="text-text">{course.category}</span>
                </p>
              </div>
              {course.aiReport && (
                <div className={`shrink-0 text-center px-3 py-2 rounded-lg border ${
                  course.aiReport.score >= 7
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-warning/30 bg-warning/10 text-warning'
                }`}>
                  <p className="text-xs">AI оценка</p>
                  <p className="text-xl font-bold">{course.aiReport.score}/10</p>
                  <p className="text-xs">{course.aiReport.recommendation}</p>
                </div>
              )}
            </div>

            {rejectId === course._id ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 bg-surface-2 border border-border text-text rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Причина отказа..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button onClick={() => reject(course._id)} className="bg-error/20 hover:bg-error/30 text-error px-4 py-2 rounded-lg text-sm transition-colors">
                  Отклонить
                </button>
                <button onClick={() => { setRejectId(null); setReason('') }} className="border border-border text-muted px-3 py-2 rounded-lg text-sm hover:text-text transition-colors">
                  Отмена
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => approve(course._id)} className="flex items-center gap-1.5 bg-success/20 hover:bg-success/30 text-success px-4 py-2 rounded-lg text-sm transition-colors">
                  <CheckCircle size={14} /> Одобрить
                </button>
                <button onClick={() => setRejectId(course._id)} className="flex items-center gap-1.5 bg-error/20 hover:bg-error/30 text-error px-4 py-2 rounded-lg text-sm transition-colors">
                  <XCircle size={14} /> Отклонить
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
