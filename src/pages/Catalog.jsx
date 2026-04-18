import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCourses } from '../api/courses'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorMessage from '../components/shared/ErrorMessage'
import { Star, Users, BookOpen } from 'lucide-react'

const DIFFICULTY_COLORS = {
  beginner:     'bg-success/20 text-success',
  intermediate: 'bg-warning/20 text-warning',
  advanced:     'bg-error/20 text-error',
}

export default function Catalog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCourses({ status: 'approved' })
      .then(({ data }) => setCourses(data.courses))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">{t('nav.courses')}</h1>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course._id}
            onClick={() => navigate(`/courses/${course._id}`)}
            className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-text leading-snug">{course.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[course.difficulty]}`}>
                {t(`course.${course.difficulty}`)}
              </span>
            </div>
            <p className="text-muted text-sm line-clamp-2">{course.description}</p>
            <div className="flex items-center gap-4 text-muted text-xs mt-auto">
              <span className="flex items-center gap-1">
                <Star size={12} />
                {course.rating?.toFixed(1) || '—'}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {course.enrolledStudents?.length ?? 0} {t('course.students')}
              </span>
              <span className="ml-auto font-medium text-text text-sm">
                {course.price === 0 ? t('course.free') : `${course.price} сом`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
