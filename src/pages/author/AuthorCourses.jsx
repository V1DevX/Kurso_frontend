import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMyCourses } from '../../api/users'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { Plus, Pencil } from 'lucide-react'

const STATUS_STYLES = {
  pending:  'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  rejected: 'bg-error/20 text-error',
}

export default function AuthorCourses() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyCourses()
      .then(({ data }) => setCourses(data.authored))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text">{t('nav.author')}</h1>
        <button
          onClick={() => navigate('/author/courses/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t('author.createCourse')}
        </button>
      </div>

      <ErrorMessage message={error} />

      {courses.length === 0 ? (
        <p className="text-muted text-center py-16">{t('author.noCourses')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[course.status]}`}>
                  {t(`course.status.${course.status}`)}
                </span>
                <span className="text-text">{course.title}</span>
              </div>
              <button
                onClick={() => navigate(`/author/courses/${course._id}/edit`)}
                className="flex items-center gap-1.5 text-muted hover:text-text text-sm transition-colors"
              >
                <Pencil size={14} />
                {t('common.edit')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
