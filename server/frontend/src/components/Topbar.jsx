import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useSelector, useDispatch }              from 'react-redux'
import { useNavigate }                           from 'react-router-dom'
import { clearUser }                             from '../store/authSlice'
import { logoutUser }                            from '../services/authService'
import { useEmployees }                          from '../hooks/useEmployees'

// Quick-nav items the employee can search through
const EMPLOYEE_NAV = [
  { label: 'Mis tareas',        path: '/mytasks',              hint: 'Onboarding pendiente' },
  { label: 'Mis evaluaciones',  path: '/myevaluations',        hint: 'Feedback 360° asignado' },
  { label: 'Alertas',           path: '/alerts',               hint: 'Notificaciones' },
  { label: 'Feedback continuo', path: '/continuous-feedback',  hint: 'Reconocimientos y sugerencias' },
  { label: 'Mis resultados',    path: '/employeefeedbackreport', hint: 'Informe de Feedback 360°' },
]

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const [query, setQuery]   = useState('')
  const [open,  setOpen]    = useState(false)
  const wrapperRef          = useRef(null)

  const isEmployee = user?.role === 'Colaborador'
  const { data: employees = [] } = useEmployees()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (isEmployee) {
      // Colaborador: search their own nav sections
      const items = q
        ? EMPLOYEE_NAV.filter((n) =>
            n.label.toLowerCase().includes(q) || n.hint.toLowerCase().includes(q))
        : EMPLOYEE_NAV
      return items.slice(0, 6).map((n) => ({ ...n, _type: 'nav' }))
    }
    // Talento / Líder: search employees
    if (!q) return []
    return employees
      .filter((e) =>
        `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(q) ||
        (e.position ?? '').toLowerCase().includes(q))
      .slice(0, 6)
      .map((e) => ({ ...e, _type: 'employee' }))
  }, [query, employees, isEmployee])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (item) => {
    if (item._type === 'nav') {
      navigate(item.path)
    } else {
      navigate(`/detailemployee/${item.id}`)
    }
    setQuery('')
    setOpen(false)
  }

  const today       = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const dateFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  const firstName = user?.firstName ?? ''
  const lastName  = user?.lastName  ?? ''
  const initials  = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?'
  const fullName  = `${firstName} ${lastName}`.trim() || user?.email || '—'
  const position  = user?.position ?? user?.role ?? ''

  const handleLogout = async () => {
    try { await logoutUser() } catch { /* ignore */ }
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 bg-navy border-b border-white/10 flex items-center gap-4 px-6 shrink-0">

      {/* Greeting */}
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white leading-tight whitespace-nowrap">
          ¡Hola, {firstName || 'bienvenido'}! 👋
        </h1>
        <p className="text-xs text-slate-400 leading-tight">{dateFormatted}</p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative" ref={wrapperRef}>
        <div className="relative">
          <Search size={14} strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={isEmployee ? 'Ir a...' : 'Buscar empleado...'}
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-white/10 bg-white/10
              text-xs text-white placeholder:text-slate-400
              focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white rounded-xl
                          border border-brand-light shadow-xl overflow-hidden">
            {results.map((item) => (
              <button
                key={item._type === 'nav' ? item.path : item.id}
                type="button"
                onMouseDown={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                           hover:bg-brand-pale transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-pale flex items-center
                                justify-center shrink-0">
                  {item._type === 'nav'
                    ? <LayoutDashboard size={13} className="text-brand" />
                    : <User size={13} className="text-brand" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {item._type === 'nav'
                      ? item.label
                      : `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {item._type === 'nav' ? item.hint : (item.position ?? '')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: user + logout */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold leading-none">{initials}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{fullName}</p>
            <p className="text-xs text-slate-400 leading-tight">{position}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="text-slate-400 hover:text-white hover:bg-white/10
                     p-2 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>

    </header>
  )
}
