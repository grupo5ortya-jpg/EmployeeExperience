import { CheckCheck, User } from 'lucide-react'
import { useMarkAlertAsRead } from '../../../hooks/useAlerts'

const RISK_STYLE = {
  high:   { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-600',   dot: 'bg-red-500',   label: 'Alto' },
  medium: { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500', label: 'Medio' },
  low:    { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-600', dot: 'bg-green-500', label: 'Bajo' },
}

const SENTIMENT_STYLE = {
  negative: 'bg-red-100 text-red-600',
  neutral:  'bg-slate-100 text-slate-500',
  positive: 'bg-green-100 text-green-600',
}

const SENTIMENT_LABEL = {
  negative: 'Negativo',
  neutral:  'Neutral',
  positive: 'Positivo',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AlertCard({ alert }) {
  const { mutate: markRead, isPending } = useMarkAlertAsRead()

  const risk    = RISK_STYLE[alert.riskLevel]   ?? RISK_STYLE.low
  const isUnread = alert.status === 'UNREAD'
  const employeeName = alert.employee
    ? `${alert.employee.firstName ?? ''} ${alert.employee.lastName ?? ''}`.trim()
    : 'Empleado desconocido'

  return (
    <div className={`relative rounded-xl border ${risk.border} ${risk.bg} p-4 flex flex-col gap-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Unread dot */}
      {isUnread && (
        <span className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${risk.dot}`} />
      )}

      {/* Header */}
      <div className="flex items-start gap-2 pr-4">
        <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
          <User size={15} className="text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{employeeName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(alert.createdAt)}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {alert.riskLevel && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.badge}`}>
            Riesgo {risk.label}
          </span>
        )}
        {alert.sentiment && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SENTIMENT_STYLE[alert.sentiment] ?? ''}`}>
            {SENTIMENT_LABEL[alert.sentiment] ?? alert.sentiment}
          </span>
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-slate-600 leading-snug">{alert.message}</p>

      {/* Topics */}
      {alert.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {alert.topics.map((t) => (
            <span key={t} className="text-xs bg-white/80 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Mark as read */}
      {isUnread && (
        <button
          onClick={() => markRead(alert.id)}
          disabled={isPending}
          className="self-end flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand transition-colors disabled:pointer-events-none"
        >
          <CheckCheck size={13} />
          Marcar como leída
        </button>
      )}
    </div>
  )
}
