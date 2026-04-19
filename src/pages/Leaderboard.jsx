import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLeaderboard } from '@/api/users'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { Flame } from 'lucide-react'

export default function Leaderboard() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLeaderboard()
      .then(({ data }) => setUsers(data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">{t('leaderboard.title')}</h1>
      <ErrorMessage message={error} />
      <div className="flex flex-col gap-2">
        {users.map((user, i) => (
          <div
            key={user._id}
            className="flex items-center gap-4 bg-surface border border-border rounded-xl px-4 py-3"
          >
            <span className={`w-7 text-center font-bold text-sm ${
              i === 0 ? 'text-warning' : i === 1 ? 'text-muted' : i === 2 ? 'text-warning/70' : 'text-muted'
            }`}>
              {i + 1}
            </span>
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{user.name?.[0]}</div>
            }
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-text text-sm font-medium">{user.name}</span>
                <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
                  {t('profile.level')} {user.level}
                </span>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full mt-1.5 w-48">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(user.xp % 200) / 200 * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>{user.xp} XP</span>
              {user.streak > 0 && (
                <span className="flex items-center gap-0.5 text-error">
                  <Flame size={12} /> {user.streak}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
