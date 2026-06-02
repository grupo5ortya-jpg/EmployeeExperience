import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useAlerts } from '../../hooks/useAlerts'
import AlertCard from './components/AlertCard'

const FILTERS = [
  { label: 'Todas',    value: undefined },
  { label: 'No leídas', value: 'UNREAD' },
  { label: 'Leídas',   value: 'READ' },
]

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState(undefined)
  const { data: alerts = [], isLoading, isError } = useAlerts(statusFilter)

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="border-l-4 border-brand pl-4">
          <h1 className="text-lg lg:text-xl font-bold text-slate-800">Alertas de onboarding</h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
            Señales de riesgo detectadas en encuestas de pulso
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
              ${statusFilter === f.value
                ? 'bg-brand text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-brand-light hover:text-brand'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />
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
            <p className="text-xs text-slate-400 mt-1">No hay señales de riesgo en este momento.</p>
          </div>
        </div>
      )}

      {/* Alert grid */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

    </main>
  )
}
