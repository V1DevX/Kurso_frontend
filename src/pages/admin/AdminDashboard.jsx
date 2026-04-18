import { useEffect, useState } from 'react'
import { getStats } from '../../api/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { Users, BookOpen, Zap, GraduationCap } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2 rounded-lg bg-surface-2 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-muted text-sm">{label}</p>
        <p className="text-2xl font-bold text-text">{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Ошибка загрузки статистики'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text">Дашборд</h1>
      <ErrorMessage message={error} />
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Пользователей"
              value={stats.users.total}
              sub={stats.users.banned > 0 ? `${stats.users.banned} забанено` : undefined}
              color="text-accent"
            />
            <StatCard
              icon={BookOpen}
              label="Курсов"
              value={stats.courses.total}
              sub={`${stats.courses.approved} одобрено`}
              color="text-primary"
            />
            <StatCard
              icon={GraduationCap}
              label="Записей"
              value={stats.enrollments}
              color="text-success"
            />
            <StatCard
              icon={Zap}
              label="Всего XP"
              value={stats.totalXp.toLocaleString()}
              color="text-warning"
            />
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold text-text mb-4">Статус курсов</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: 'На проверке', value: stats.courses.pending, color: 'bg-warning' },
                { label: 'Одобрено',    value: stats.courses.approved, color: 'bg-success' },
                { label: 'Отклонено',   value: stats.courses.rejected, color: 'bg-error' },
              ].map(({ label, value, color }) => {
                const pct = stats.courses.total ? Math.round(value / stats.courses.total * 100) : 0
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm text-muted w-28">{label}</span>
                    <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-text w-8 text-right">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
