import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, setTheme } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? 'text-text' : 'text-muted hover:text-text'}`

  return (
    <nav className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-primary text-white font-bold w-7 h-7 flex items-center justify-center rounded text-sm">
            K
          </span>
          <span className="font-semibold text-text">Kurso</span>
        </Link>
        <NavLink to="/courses" className={navLinkClass}>{t('nav.courses')}</NavLink>
        <NavLink to="/leaderboard" className={navLinkClass}>{t('nav.leaderboard')}</NavLink>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted hover:text-text transition-colors p-1"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-surface-2 border border-border text-text text-sm rounded px-2 py-1 cursor-pointer"
        >
          <option value="ru">RU</option>
          <option value="ky">KY</option>
          <option value="en">EN</option>
        </select>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="text-sm text-muted hover:text-text transition-colors">
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="text-sm bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {t('nav.register')}
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-muted">
              {user?.name}
              <span className="ml-1.5 bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
                {user?.level}
              </span>
            </span>
            {user?.hasAuthorProfile && (
              <NavLink to="/author/courses" className={navLinkClass}>{t('nav.author')}</NavLink>
            )}
            {(user?.role === 'moderator' || user?.role === 'admin') && (
              <NavLink to="/moderation" className={navLinkClass}>{t('nav.moderation')}</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>Админ</NavLink>
            )}
            <NavLink to="/profile" className={navLinkClass}>{t('nav.profile')}</NavLink>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-error transition-colors"
            >
              {t('nav.logout')}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
