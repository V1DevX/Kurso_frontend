import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCourse, getLessons, enrollCourse, getReviews } from '../api/courses'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorMessage from '../components/shared/ErrorMessage'
import { Lock, PlayCircle, Star } from 'lucide-react'

const DIFFICULTY_COLORS = {
  beginner:     'bg-success/20 text-success',
  intermediate: 'bg-warning/20 text-warning',
  advanced:     'bg-error/20 text-error',
}

export default function CoursePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [reviews, setReviews] = useState([])
  const [enrollStatus, setEnrollStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getCourse(id),
      getLessons(id),
      getReviews(id),
    ])
      .then(([c, l, r]) => {
        setCourse(c.data)
        setLessons(l.data)
        setReviews(r.data)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setEnrolling(true)
    try {
      const { data } = await enrollCourse(id)
      setEnrollStatus(data.status)
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!course) return <ErrorMessage message={error} />

  const isEnrolled = enrollStatus === 'active'
  const isPending = enrollStatus === 'pending'

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-text">{course.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full shrink-0 ${DIFFICULTY_COLORS[course.difficulty]}`}>
            {t(`course.${course.difficulty}`)}
          </span>
        </div>
        <p className="text-muted">{course.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1"><Star size={14} /> {course.rating?.toFixed(1) || '—'}</span>
          <span>{course.price === 0 ? t('course.free') : `${course.price} сом`}</span>
        </div>

        <ErrorMessage message={error} />

        {isEnrolled ? (
          <button
            onClick={() => navigate(`/courses/${id}/learn`)}
            className="self-start bg-success hover:bg-success/80 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {t('course.enrolled')}
          </button>
        ) : isPending ? (
          <span className="self-start text-warning border border-warning/30 px-4 py-2 rounded-lg text-sm">
            {t('course.pending')}
          </span>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="self-start bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {enrolling ? t('common.loading') : t('course.enroll')}
          </button>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text mb-3">
          {lessons.length} {t('course.lessons')}
        </h2>
        <div className="flex flex-col gap-2">
          {lessons.map((lesson, i) => (
            <div
              key={lesson._id}
              className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3"
            >
              <span className="text-muted text-sm w-6">{i + 1}</span>
              {isEnrolled
                ? <PlayCircle size={16} className="text-primary shrink-0" />
                : <Lock size={16} className="text-muted shrink-0" />
              }
              <span className="text-text text-sm">{lesson.title}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Отзывы</h2>
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-surface border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text">{r.userId?.name || 'User'}</span>
                  <span className="flex items-center gap-0.5 text-warning text-xs">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && <p className="text-muted text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
