import { useEffect, useState, useCallback } from 'react'
import { getUsers, banUser, unbanUser, changeRole } from '../../api/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { Ban, ShieldCheck, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const ROLE_COLORS = {
  user:      'bg-surface-2 text-muted',
  moderator: 'bg-blue-500/20 text-blue-300',
  admin:     'bg-accent/20 text-accent',
}

function BanModal({ user, onClose, onBanned }) {
  const [bannedUntil, setBannedUntil] = useState('')
  const [banReason, setBanReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await banUser(user._id, {
        bannedUntil: bannedUntil || null,
        banReason,
      })
      onBanned()
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text">Забанить {user.name}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Причина</label>
            <input
              className="bg-surface-2 border border-border text-text rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Причина бана..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Дата окончания (пусто = навсегда)</label>
            <input
              type="datetime-local"
              className="bg-surface-2 border border-border text-text rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              value={bannedUntil}
              onChange={(e) => setBannedUntil(e.target.value)}
            />
          </div>
          <ErrorMessage message={error} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="border border-border text-muted px-4 py-2 rounded-lg text-sm hover:text-text transition-colors">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="bg-error hover:bg-error/80 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              {loading ? 'Сохранение...' : 'Забанить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banTarget, setBanTarget] = useState(null)

  const fetchUsers = useCallback((page = 1, q = query) => {
    setLoading(true)
    getUsers({ page, search: q })
      .then(({ data }) => {
        setUsers(data.users)
        setPagination(data.pagination)
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => { fetchUsers(1, query) }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
  }

  const handleUnban = async (id) => {
    try {
      await unbanUser(id)
      setUsers((u) => u.map((x) => x._id === id ? { ...x, banned: false, bannedUntil: null, banReason: '' } : x))
    } catch { setError('Ошибка') }
  }

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await changeRole(id, role)
      setUsers((u) => u.map((x) => x._id === id ? { ...x, role: data.role } : x))
    } catch { setError('Ошибка изменения роли') }
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">
          Пользователи
          <span className="ml-2 text-muted text-lg font-normal">({pagination.total})</span>
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="bg-surface border border-border text-text rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-primary w-56"
              placeholder="Имя или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm transition-colors">
            Найти
          </button>
        </form>
      </div>

      <ErrorMessage message={error} />

      {loading ? <LoadingSpinner /> : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted text-left">
                <th className="px-4 py-3 font-medium">Пользователь</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Уровень</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className={`${user.banned ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {user.avatar
                        ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{user.name?.[0]}</div>
                      }
                      <div>
                        <p className="text-text font-medium">{user.name}</p>
                        <p className="text-muted text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer outline-none ${ROLE_COLORS[user.role]}`}
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text">{user.level}</span>
                    <span className="text-muted ml-1 text-xs">{user.xp} XP</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <div>
                        <span className="text-error text-xs font-medium">Забанен</span>
                        {user.bannedUntil && (
                          <p className="text-muted text-xs">до {new Date(user.bannedUntil).toLocaleDateString()}</p>
                        )}
                        {user.banReason && (
                          <p className="text-muted text-xs truncate max-w-32" title={user.banReason}>{user.banReason}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-success text-xs">Активен</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <button
                        onClick={() => handleUnban(user._id)}
                        className="flex items-center gap-1 text-success hover:text-success/80 text-xs transition-colors"
                      >
                        <ShieldCheck size={13} /> Разбанить
                      </button>
                    ) : user.role !== 'admin' ? (
                      <button
                        onClick={() => setBanTarget(user)}
                        className="flex items-center gap-1 text-muted hover:text-error text-xs transition-colors"
                      >
                        <Ban size={13} /> Забанить
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-muted text-xs">
                Страница {pagination.page} из {pagination.pages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  className="p-1.5 rounded border border-border text-muted hover:text-text disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  className="p-1.5 rounded border border-border text-muted hover:text-text disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {banTarget && (
        <BanModal
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onBanned={() => {
            setBanTarget(null)
            fetchUsers(pagination.page)
          }}
        />
      )}
    </div>
  )
}
