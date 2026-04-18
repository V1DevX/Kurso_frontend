import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMe, getMyCourses, becomeAuthor } from '../api/users'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ErrorMessage from '../components/shared/ErrorMessage'
import { Flame, Zap } from 'lucide-react'

export default function Profile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)

  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState({ enrolled: [], authored: [] })
  const [loading, setLoading] = useState(true)
  const [becoming, setBecoming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getMe(), getMyCourses()])
      .then(([u, c]) => {
        setUser(u.data)
        setCourses(c.data)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  const handleBecomeAuthor = async () => {
    setBecoming(true)
    try {
      const { data } = await becomeAuthor()
      setUser(data)
      setAuth(data, accessToken)
    } catch {
      setError(t('common.error'))
    } finally {
      setBecoming(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!user) return <ErrorMessage message={error} />

  const xpProgress = (user.xp % 200) / 200 * 100

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">{user.name}</h1>
            <p className="text-muted text-sm">{user.email}</p>
            {user.profession && <p className="text-muted text-sm">{user.profession}</p>}
          </div>
          {user.avatar && (
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="bg-accent/20 text-accent text-sm px-2.5 py-1 rounded-full font-medium">
              {t('profile.level')} {user.level}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted text-sm">
            <Zap size={14} className="text-warning" />
            {user.xp} {t('profile.xp')}
          </div>
          <div className="flex items-center gap-1 text-muted text-sm">
            <Flame size={14} className="text-error" />
            {user.streak} {t('profile.days')}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted">
            <span>{user.xp % 200} / 200 XP</span>
            <span>{t('profile.level')} {user.level + 1}</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        <ErrorMessage message={error} />

        {!user.hasAuthorProfile && (
          <button
            onClick={handleBecomeAuthor}
            disabled={becoming}
            className="self-start border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {becoming ? t('common.loading') : t('profile.becomeAuthor')}
          </button>
        )}
      </div>

      {courses.enrolled.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-3">{t('profile.enrolled')}</h2>
          <div className="flex flex-col gap-2">
            {courses.enrolled.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/courses/${c._id}/learn`)}
                className="bg-surface border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-between"
              >
                <span className="text-text text-sm">{c.title}</span>
                <span className="text-accent text-xs">{t('course.enrolled')} →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.hasAuthorProfile && courses.authored.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-3">{t('profile.authored')}</h2>
          <div className="flex flex-col gap-2">
            {courses.authored.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/author/courses/${c._id}/edit`)}
                className="bg-surface border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-between"
              >
                <span className="text-text text-sm">{c.title}</span>
                <span className="text-muted text-xs">{t(`course.status.${c.status}`)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
