import { CheckCheck, User, BarChart2 } from 'lucide-react'
import { Link }                        from 'react-router-dom'
import { useSelector }                 from 'react-redux'
import { useMarkAlertAsRead }          from '../../../hooks/useAlerts'

const RISK_STYLE = {
  high:   { bg: 'bg-red-50',   border: 'border-red-200',   badge: 'bg-red-100 text-red-600',    dot: 'bg-red-500',   label: 'Alto' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500', label: 'Medio' },
  low:    { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-600', dot: 'bg-green-500', label: 'Bajo' },
}

// Alert types without a pulse-style riskLevel that still warrant a tinted card —
// mirrors the OKR status colors (AT_RISK = yellow, STAGNANT = red).
const ALERT_TYPE_TONE = {
  OKR_BEHIND_SCHEDULE: 'medium',
  OKR_STAGNANT:        'high',
}

const SENTIMENT_STYLE = {
  negative: 'bg-red-100 text-red-600',
  neutral:  'bg-slate-100 text-slate-500',
  positive: 'bg-green-100 text-green-600',
}
const SENTIMENT_LABEL = { negative: 'Negativo', neutral: 'Neutral', positive: 'Positivo' }

// Alert types that embed a cycleId in topics[0] and link to a report
const REPORT_TYPES = {
  NEGATIVE_PULSE_SIGNAL: {
    link:  () => `/pulseanalysis`,
    label: 'Ver análisis de pulso',
  },
  PULSE_SURVEY_DUE: {
    link:  (alert) => `/pulsesurveys?employeeId=${alert.employee?.id}`,
    label: 'Completar encuesta',
  },
  FEEDBACK_EVALUATION_READY: {
    link:  (alert) => `/employeefeedbackreport?cycleId=${alert.topics?.[0]}&evaluatedId=${alert.employee?.id}`,
    label: 'Ver mis resultados',
  },
  FEEDBACK_ASSIGNED: {
    link:  () => `/myevaluations`,
    label: 'Ver mis evaluaciones',
  },
  FEEDBACK_CYCLE_COMPLETED: {
    link:  (alert) => `/hrfeedbackreport?cycleId=${alert.topics?.[0]}&evaluatedId=${alert.employee?.id}`,
    label: 'Ver resultados',
  },
  FEEDBACK_GAP_ANALYSIS_SENT: {
    link:  (alert) => `/employeefeedbackreport?cycleId=${alert.topics?.[0]}&evaluatedId=${alert.employee?.id}`,
    label: 'Ver mi análisis',
  },
  ONBOARDING_TASKS_ASSIGNED: {
    link:  () => `/mytasks`,
    label: 'Ver mis tareas',
  },
  ONBOARDING_TEMPLATE_APPROVED: {
    link:  () => `/mytasks`,
    label: 'Ver mis tareas',
  },
  ONBOARDING_TASK_SUBMITTED: {
    link:    (alert) => `/all-assignments?employeeId=${alert.employee?.id}`,
    label:   'Revisar tarea',
    hrOnly:  true,
  },
  ONBOARDING_TEMPLATE_SUBMITTED: {
    link:    (alert) => `/all-assignments?employeeId=${alert.employee?.id}`,
    label:   'Revisar template',
    hrOnly:  true,
  },
  ONBOARDING_TASK_OVERDUE: {
    link:   (alert) => `/all-assignments?employeeId=${alert.employee?.id}`,
    label:  'Ver tarea vencida',
    hrOnly: true,
  },
  TEAM_TASK_OVERDUE: {
    link:  (alert) => `/all-assignments?employeeId=${alert.employee?.id}`,
    label: 'Ver tarea vencida',
  },
  TASK_OVERDUE: {
    link:  () => `/mytasks`,
    label: 'Ver mis tareas',
  },
  CONTINUOUS_FEEDBACK_RECEIVED: {
    link:  () => `/continuous-feedback`,
    label: 'Ver feedback',
  },
  OKR_BEHIND_SCHEDULE: {
    link:  (alert, isTalento) => isTalento
      ? `/okrmanagement?okrId=${alert.topics?.[0] ?? ''}`
      : `/myobjectives?okrId=${alert.topics?.[0] ?? ''}`,
    label: 'Ver objetivo',
  },
  OKR_STAGNANT: {
    link:  (alert, isTalento) => isTalento
      ? `/okrmanagement?okrId=${alert.topics?.[0] ?? ''}`
      : `/myobjectives?okrId=${alert.topics?.[0] ?? ''}`,
    label: 'Ver objetivo',
  },
  OKR_ASSIGNED: {
    link:  (alert) => `/myobjectives?okrId=${alert.topics?.[0] ?? ''}`,
    label: 'Ver objetivo',
  },
  OKR_COMPLETED: {
    link:  (alert) => `/okrmanagement?okrId=${alert.topics?.[0] ?? ''}`,
    label: 'Ver objetivo',
  },
  TEAM_PULSE_ALERT: {
    link:  () => `/alerts`,
    label: 'Ver detalle',
  },
  ONBOARDING_COMPLETED: {
    link:   (alert) => `/all-assignments?employeeId=${alert.employee?.id}`,
    label:  'Ver plan',
    hrOnly: true,
  },
  COURSE_COMPLETION_REQUESTED: {
    link:   () => `/learningdashboard`,
    label:  'Revisar finalización',
    hrOnly: true,
  },
  COURSE_COMPLETION_APPROVED: {
    link:  () => `/mylearning`,
    label: 'Ver mi aprendizaje',
  },
  COURSE_COMPLETION_REJECTED: {
    link:  () => `/mylearning`,
    label: 'Ver mi aprendizaje',
  },
  JOB_OPENING_APPLICATION: {
    link:   () => `/job-openings`,
    label:  'Ver vacantes',
    hrOnly: true,
  },
  EMPLOYEE_REHIRED: {
    link:   (alert) => `/detailemployee/${alert.employee?.id}`,
    label:  'Completa su perfil',
    hrOnly: true,
  },
  REHIRE_WELCOME: {
    link:  (alert) => `/detailemployee/${alert.employee?.id}`,
    label: 'Ver mi perfil',
  },
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
  const { user } = useSelector((s) => s.auth)
  const isTalento = user?.role === 'Talento'

  const riskKey  = alert.riskLevel ?? ALERT_TYPE_TONE[alert.type]
  const risk     = RISK_STYLE[riskKey] ?? RISK_STYLE.low
  const isUnread = alert.status === 'UNREAD'
  const name     = alert.employee
    ? `${alert.employee.firstName ?? ''} ${alert.employee.lastName ?? ''}`.trim()
    : 'Empleado desconocido'

  const reportConfig = REPORT_TYPES[alert.type] ?? null
  const reportLink   = (reportConfig && (!reportConfig.hrOnly || isTalento))
    ? reportConfig.link(alert, isTalento)
    : null
  const reportLabel  = reportConfig?.label ?? 'Ver resultados'
  // Normalize topics — some alerts store it as object {key:val}, others as array
  const topicsArr = Array.isArray(alert.topics) ? alert.topics : []
  // Don't show topics that are UUIDs (used internally as references)
  const displayTopics = topicsArr.filter(
    (t) => !reportLink || !/^[0-9a-f-]{36}$/i.test(t)
  )

  const handleMarkRead = () => markRead(alert.id)

  return (
    <div className={`relative rounded-xl border ${risk.border} ${risk.bg} p-4 flex flex-col gap-3
                     transition-opacity ${isPending ? 'opacity-50' : ''}`}>

      {/* Unread dot */}
      {isUnread && <span className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${risk.dot}`} />}

      {/* Header */}
      <div className="flex items-start gap-2 pr-4">
        <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
          <User size={15} className="text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{name}</p>
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

      {/* Message — truncated to 3 lines */}
      <p className="text-sm text-slate-600 leading-snug line-clamp-3">{alert.message}</p>

      {/* Topics — max 4, rest shown as +N */}
      {displayTopics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {displayTopics.slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-white/80 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
          {displayTopics.length > 4 && (
            <span className="text-xs bg-white/80 border border-slate-200 text-slate-400 px-2 py-0.5 rounded-full">
              +{displayTopics.length - 4}
            </span>
          )}
        </div>
      )}

      {/* CTA for report types */}
      {reportLink && (
        <Link
          to={reportLink}
          onClick={isUnread ? handleMarkRead : undefined}
          className="self-start flex items-center gap-1.5 text-xs font-semibold text-white
                     bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-lg transition-colors"
        >
          <BarChart2 size={12} />
          {reportLabel}
        </Link>
      )}

      {/* Mark as read */}
      {isUnread && !reportLink && (
        <button
          onClick={handleMarkRead}
          disabled={isPending}
          className="self-end flex items-center gap-1.5 text-xs font-medium text-slate-400
                     hover:text-brand transition-colors disabled:pointer-events-none"
        >
          <CheckCheck size={13} />
          Marcar como leída
        </button>
      )}
    </div>
  )
}
