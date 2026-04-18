import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen } from 'lucide-react'

const links = [
  { to: '/admin',         label: 'Дашборд',   icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Курсы',     icon: BookOpen },
  { to: '/admin/users',   label: 'Пользователи', icon: Users },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <aside className="w-56 bg-surface border-r border-border flex flex-col gap-1 p-3 shrink-0">
        <p className="text-xs text-muted font-medium px-3 py-2 uppercase tracking-wider">Админ</p>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary/20 text-text' : 'text-muted hover:text-text hover:bg-surface-2'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
