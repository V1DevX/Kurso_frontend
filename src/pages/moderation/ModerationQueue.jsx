import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import client from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ModerationQueue() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    client.get('/moderation/pending')
      .then(({ data }) => setCourses(data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  const handleApprove = async (courseId) => {
    try {
      await client.put(`/moderation/${courseId}/approve`)
      setCourses((c) => c.filter((x) => x._id !== courseId))
    } catch { setError(t('common.error')) }
  }

  const handleReject = async (courseId) => {
    if (!reason.trim()) return
    try {
      await client.put(`/moderation/${courseId}/reject`, { rejectionReason: reason })
      setCourses((c) => c.filter((x) => x._id !== courseId))
      setRejectId(null)
      setReason('')
    } catch { setError(t('common.error')) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">{t('nav.moderation')}</h1>
      <ErrorMessage message={error} />

      {courses.length === 0 ? (
        <p className="text-muted text-center py-16">{t('moderation.empty')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-text">{course.title}</h2>
                  <p className="text-muted text-sm">{course.authorId?.name || '—'}</p>
                </div>
                {course.aiReport && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.aiReport.score >= 7 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {t('moderation.aiScore')}: {course.aiReport.score}/10
                  </span>
                )}
              </div>

              {rejectId === course._id ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-surface-2 border border-border text-text rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder={t('moderation.reason')}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleReject(course._id)}
                    className="bg-error hover:bg-error/80 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {t('moderation.reject')}
                  </button>
                  <button
                    onClick={() => { setRejectId(null); setReason('') }}
                    className="border border-border text-muted px-3 py-2 rounded-lg text-sm hover:text-text transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(course._id)}
                    className="flex items-center gap-1.5 bg-success/20 hover:bg-success/30 text-success px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle size={14} />
                    {t('moderation.approve')}
                  </button>
                  <button
                    onClick={() => setRejectId(course._id)}
                    className="flex items-center gap-1.5 bg-error/20 hover:bg-error/30 text-error px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <XCircle size={14} />
                    {t('moderation.reject')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
