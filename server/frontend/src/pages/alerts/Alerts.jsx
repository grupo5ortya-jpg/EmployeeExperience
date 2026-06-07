import { useState } from 'react'
import { Bell, BellOff, ChevronDown } from 'lucide-react'
import { useAlerts } from '../../hooks/useAlerts'
import AlertCard from './components/AlertCard'

function Section({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-brand-light overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3
                   bg-brand-pale/60 hover:bg-brand-light/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {title}
          </span>
          {count > 0 && (
            <span className="text-xs font-semibold bg-brand text-white
                             px-2 py-0.5 rounded-full leading-none">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Alerts() {
  const { data: alerts = [], isLoading, isError } = useAlerts()

  const unread = alerts.filter((a) => a.status === 'UNREAD')
  const read   = alerts.filter((a) => a.status === 'READ')

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">Alertas</h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
          Notificaciones del sistema
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-sm text-red-400 text-center py-10">
          No se pudieron cargar las alertas. Intentá de nuevo.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && alerts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
            <BellOff size={24} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sin alertas</p>
            <p className="text-xs text-slate-400 mt-1">
              No hay señales de riesgo en este momento.
            </p>
          </div>
        </div>
      )}

      {/* Accordion sections */}
      {!isLoading && !isError && alerts.length > 0 && (
        <div className="flex flex-col gap-3">

          {/* No leídas — abre por defecto */}
          <Section title="No leídas" count={unread.length} defaultOpen>
            {unread.length === 0 ? (
              <div className="col-span-full flex items-center gap-2 py-4 text-slate-400">
                <Bell size={15} />
                <span className="text-xs">Sin alertas nuevas.</span>
              </div>
            ) : (
              unread.map((a) => <AlertCard key={a.id} alert={a} />)
            )}
          </Section>

          {/* Leídas */}
          <Section title="Leídas" count={read.length} defaultOpen={false}>
            {read.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 py-4">
                Sin alertas leídas.
              </p>
            ) : (
              read.map((a) => <AlertCard key={a.id} alert={a} />)
            )}
          </Section>

          {/* Todas */}
          <Section title="Todas" count={alerts.length} defaultOpen={false}>
            {alerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </Section>

        </div>
      )}

    </main>
  )
}
