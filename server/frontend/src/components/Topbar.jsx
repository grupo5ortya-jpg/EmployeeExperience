import { Menu, Search, Bell, ChevronDown } from 'lucide-react'

export default function Topbar() {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dateFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <header className="h-14 bg-navy border-b border-white/10 flex items-center gap-4 px-6 shrink-0">
      {/* Hamburger */}
      <button className="text-slate-300 hover:text-white transition-colors cursor-pointer">
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {/* Greeting */}
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white leading-tight whitespace-nowrap">
          ¡Hola, Martina! 👋
        </h1>
        <p className="text-xs text-slate-400 leading-tight">{dateFormatted}</p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar objetivos, feedback, cursos..."
            className="
              w-full pl-8 pr-4 py-2 rounded-lg border border-white/10 bg-white/10
              text-xs text-white placeholder:text-slate-400
              focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
              transition-colors duration-150
            "
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Bell */}
        <button className="relative text-slate-300 hover:text-white transition-colors cursor-pointer p-1">
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border border-navy" />
        </button>

        {/* Avatar + user info */}
        <button className="flex items-center gap-2.5 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold leading-none">ML</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">Martina López</p>
            <p className="text-xs text-slate-400 leading-tight">Especialista en RH</p>
          </div>
          <ChevronDown size={14} strokeWidth={1.8} className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
