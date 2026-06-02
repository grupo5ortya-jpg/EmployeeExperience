import { NavLink } from 'react-router-dom'
import {
  Home,
  UserPlus,
  RotateCcw,
  Target,
  BookOpen,
  ClipboardList,
  User,
  Bell,
  BarChart2,
  LifeBuoy,
  Settings,
  Users,
  MessageSquareHeart,
  Briefcase
} from 'lucide-react'
import { useUnreadAlerts } from '../hooks/useUnreadAlerts'

const staticNavItems = [
  { icon: Home, label: 'Inicio', to: '/' },
  { icon: User, label: 'Mi perfil' },
  { icon: Users, label: 'Equipo', to: '/employeelist' },
  { icon: UserPlus, label: 'Onboarding', to: '/onboardinghome' },
  { icon: RotateCcw, label: 'Feedback 360°', to: '/feedbackhome' },
  { icon: Target, label: 'Objetivos' },
  { icon: BookOpen, label: 'Aprendizaje LMS' },
  { icon: ClipboardList, label: 'Plan de acción' },
  { icon: Bell, label: 'Alertas', to: '/alerts', dynamicBadge: true },
  { icon: BarChart2, label: 'Análisis de Pulso', to: '/pulseanalysis' },
  { icon: LifeBuoy, label: 'Soporte' },
  { icon: MessageSquareHeart, label: 'Feedback continuo', to: '/continuous-feedback' },
  { icon: Briefcase, label: 'Vacantes', to: '/job-openings' }
]

const itemClass = (active) =>
  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer
  ${active ? 'bg-brand text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`

function NavItem({ icon: Icon, label, active, badge, to }) {
  const content = (isActive) => (
    <>
      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge > 0 && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <li>
        <NavLink
          to={to}
          end={to === '/'}
          className={({ isActive }) => itemClass(isActive)}
        >
          {({ isActive }) => content(isActive)}
        </NavLink>
      </li>
    )
  }

  return (
    <li>
      <button className={itemClass(active)}>
        {content(active)}
      </button>
    </li>
  )
}

export default function Sidebar() {
  const { data: unreadCount = 0 } = useUnreadAlerts()

  const navItems = staticNavItems.map((item) =>
    item.dynamicBadge ? { ...item, badge: unreadCount } : item
  )

  return (
    <aside className="hidden lg:flex w-56 shrink-0 h-screen bg-navy flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <Users size={15} strokeWidth={2.2} className="text-white" />
        </div>
        <span className="text-sm font-extrabold text-white tracking-tight">EmployeeExp</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </ul>
      </nav>

      {/* Bottom: Configuración */}
      <div className="px-2 py-3 border-t border-white/10">
        <NavItem icon={Settings} label="Configuración" />
      </div>
    </aside>
  )
}
