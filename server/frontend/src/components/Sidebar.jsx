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

const navItems = [
  { icon: Home,          label: 'Inicio',          active: true  },
  { icon: User,          label: 'Mi perfil'                      },
  { icon: Users,         label: 'Equipo'                         },
  { icon: UserPlus,      label: 'Onboarding'                     },
  { icon: RotateCcw,     label: 'Feedback 360°'                  },
  { icon: Target,        label: 'Objetivos'                      },
  { icon: BookOpen,      label: 'Aprendizaje LMS'                },
  { icon: ClipboardList, label: 'Plan de acción'                 },
  { icon: Bell,          label: 'Notificaciones', badge: 3       },
  { icon: LifeBuoy,      label: 'Soporte'                        },
]

function NavItem({ icon: Icon, label, active, badge }) {
  return (
    <li>
      <button
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer
          ${active
            ? 'bg-brand text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    </li>
  )
}

export default function Sidebar() {
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
