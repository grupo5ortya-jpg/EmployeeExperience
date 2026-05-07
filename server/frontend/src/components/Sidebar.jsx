import {
  Home,
  UserPlus,
  RotateCcw,
  Target,
  BookOpen,
  ClipboardList,
  User,
  Bell,
  LifeBuoy,
  Settings,
  Users,
} from 'lucide-react'

const mainNav = [
  { icon: Home,          label: 'Inicio',          active: true  },
  { icon: UserPlus,      label: 'Onboarding'                     },
  { icon: RotateCcw,     label: 'Feedback 360°'                  },
  { icon: Target,        label: 'Objetivos'                      },
  { icon: BookOpen,      label: 'Aprendizaje LMS'                },
  { icon: ClipboardList, label: 'Plan de acción'                 },
  { icon: User,          label: 'Mi perfil'                      },
]

const conversationsNav = [
  { icon: Bell,     label: 'Notificaciones', badge: 3 },
  { icon: LifeBuoy, label: 'Soporte'                  },
]

function NavItem({ icon: Icon, label, active, badge }) {
  return (
    <li>
      <button
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer
          ${active
            ? 'bg-violet-50 text-violet-700 font-medium'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-normal'
          }
        `}
      >
        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    </li>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <Users size={15} strokeWidth={2.2} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-900 tracking-tight">PeopleGrow</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </ul>

        {/* Divider + Conversaciones section */}
        <div className="mt-4 mb-1 px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Conversaciones
          </p>
        </div>
        <ul className="flex flex-col gap-0.5">
          {conversationsNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </ul>
      </nav>

      {/* Bottom: Configuración */}
      <div className="px-2 py-3 border-t border-gray-100">
        <NavItem icon={Settings} label="Configuración" />
      </div>
    </aside>
  )
}
