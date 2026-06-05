import { useMemo }         from 'react'
import { useSelector }     from 'react-redux'
import { Link }            from 'react-router-dom'
import {
  Users, Bell, RotateCcw, ClipboardList,
  CheckCircle2, Clock, Circle, AlertCircle,
  BookOpen, Target, Sparkles,
} from 'lucide-react'

import { useEmployees }              from '../../hooks/useEmployees'
import { useUnreadAlerts }           from '../../hooks/useUnreadAlerts'
import { useSurveys }                from '../../hooks/useSurveys'
import { useAllEmployeeTasks }       from '../../hooks/useAllEmployeeTasks'
import { useMyTasks }                from '../../hooks/useMyTasks'
import { useMyFeedbackAssignments }  from '../../hooks/useMyFeedbackAssignments'
import { usePendingSurveys }         from '../../hooks/usePendingSurveys'

/* ── Card de resumen ─────────────────────────────────────────── */
function SummaryCard({ icon: Icon, iconBg, iconColor, label, value, unit, to }) {
  const inner = (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-400 leading-tight">{label}</p>
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={16} strokeWidth={2} className={iconColor} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-slate-800 leading-none">{value ?? '—'}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

/* ── Pendientes (lista genérica) ─────────────────────────────── */
function PendingItem({ icon: Icon, iconClass, title, subtitle, to, badge }) {
  const content = (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0
                    hover:bg-brand-pale/30 rounded-lg px-2 -mx-2 transition-colors">
      <Icon size={16} className={`shrink-0 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      )}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

/* ── Placeholder card ────────────────────────────────────────── */
function ComingSoon({ icon: Icon, label }) {
  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col
                    items-center justify-center gap-2 py-10 text-center opacity-60">
      <Icon size={24} className="text-slate-300" />
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <span className="text-xs text-slate-300">Próximamente</span>
    </div>
  )
}

/* ── Vista Talento ───────────────────────────────────────────── */
function TalentoDashboard() {
  const { data: employees = [] }   = useEmployees()
  const { data: unread = 0 }       = useUnreadAlerts()
  const { data: surveys = [] }     = useSurveys()
  const { data: allTasks = [] }    = useAllEmployeeTasks()

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
  const pendingTasks    = allTasks.filter((t) =>
    t.status && !['COMPLETED', 'DROPPED'].includes(t.status)).length

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={Users}      iconBg="bg-brand-light"  iconColor="text-brand"
          label="Empleados activos" value={activeEmployees} unit="empleados" to="/employeelist" />
        <SummaryCard icon={Bell}       iconBg="bg-red-100"      iconColor="text-red-500"
          label="Alertas sin leer"  value={unread}           unit="alertas"   to="/alerts" />
        <SummaryCard icon={RotateCcw}  iconBg="bg-violet-100"  iconColor="text-violet-600"
          label="Ciclos 360° activos" value={surveys.length} unit="ciclos"   to="/feedbackhome" />
        <SummaryCard icon={ClipboardList} iconBg="bg-amber-100" iconColor="text-amber-600"
          label="Tareas de onboarding" value={pendingTasks}  unit="pendientes" to="/all-assignments" />
      </div>
    </>
  )
}

/* ── Vista Líder ─────────────────────────────────────────────── */
function LiderDashboard({ employeeId }) {
  const { data: unread = 0 }          = useUnreadAlerts()
  const { data: assignments = [] }     = useMyFeedbackAssignments(employeeId)
  const { data: allTasks = [] }        = useAllEmployeeTasks()

  const pendingEvals  = assignments.filter((a) => a.status === 'PENDING').length
  const submittedTeam = allTasks.filter((t) => t.status === 'SUBMITTED' || t.status === 'SUBMITED').length

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={RotateCcw}    iconBg="bg-brand-light"  iconColor="text-brand"
          label="Evaluaciones pendientes" value={pendingEvals} unit="eval." to="/myevaluations" />
        <SummaryCard icon={Bell}         iconBg="bg-red-100"      iconColor="text-red-500"
          label="Alertas del equipo"     value={unread}          unit="alertas" to="/alerts" />
        <SummaryCard icon={ClipboardList} iconBg="bg-amber-100"   iconColor="text-amber-600"
          label="Tareas a revisar"       value={submittedTeam}   unit="tareas" to="/all-assignments" />
        <ComingSoon icon={Users} label="Equipo" />
      </div>

      {/* Evaluaciones pendientes */}
      {assignments.filter((a) => a.status === 'PENDING').length > 0 && (
        <PendingSection title="Evaluaciones que debés completar" to="/myevaluations">
          {assignments.filter((a) => a.status === 'PENDING').slice(0, 5).map((a) => {
            const evaluated = a.evaluated
            const name = evaluated ? `${evaluated.firstName ?? ''} ${evaluated.lastName ?? ''}`.trim() : '—'
            return (
              <PendingItem
                key={a.id}
                icon={Circle} iconClass="text-amber-400"
                title={`Evaluar a ${name}`}
                subtitle={a.cycle?.name ?? 'Feedback 360°'}
                badge={{ label: 'Pendiente', cls: 'bg-amber-100 text-amber-600' }}
                to={`/responseform360?surveyId=${a.cycleId}&employeeId=${a.evaluator?.id}&assignmentId=${a.id}`}
              />
            )
          })}
        </PendingSection>
      )}
    </>
  )
}

/* ── Vista Colaborador ───────────────────────────────────────── */
function ColaboradorDashboard({ employeeId }) {
  const { data: tasks = [] }          = useMyTasks(employeeId)
  const { data: assignments = [] }    = useMyFeedbackAssignments(employeeId)
  const { data: pulseAssignments = [] } = usePendingSurveys(employeeId)
  const { data: unread = 0 }          = useUnreadAlerts()

  const pendingTasks = tasks.filter((t) =>
    !['COMPLETED', 'DROPPED', 'SUBMITTED', 'SUBMITED'].includes(t.status))
  const pendingEvals = assignments.filter((a) => a.status === 'PENDING')

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={ClipboardList} iconBg="bg-brand-light" iconColor="text-brand"
          label="Tareas pendientes"      value={pendingTasks.length}    unit="tareas" to="/mytasks" />
        <SummaryCard icon={RotateCcw}    iconBg="bg-violet-100"  iconColor="text-violet-600"
          label="Evaluaciones pendientes" value={pendingEvals.length}   unit="eval." to="/myevaluations" />
        <SummaryCard icon={Bell}         iconBg="bg-amber-100"   iconColor="text-amber-600"
          label="Encuestas de pulso"     value={pulseAssignments.length} unit="pendientes" to={`/pulsesurveys?employeeId=${employeeId}`} />
        <SummaryCard icon={Bell}         iconBg="bg-red-100"     iconColor="text-red-500"
          label="Alertas sin leer"       value={unread}                 unit="alertas" to="/alerts" />
      </div>

      {/* Tareas pendientes */}
      {pendingTasks.length > 0 && (
        <PendingSection title="Tus tareas de onboarding" to="/mytasks">
          {pendingTasks.slice(0, 5).map((t) => (
            <PendingItem
              key={t.taskId}
              icon={Circle} iconClass="text-slate-300"
              title={t.task?.name ?? '—'}
              subtitle={t.task?.taskType?.name ?? 'Onboarding'}
              badge={t.dueDate
                ? { label: new Date(t.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }), cls: 'text-slate-400' }
                : null}
              to="/mytasks"
            />
          ))}
        </PendingSection>
      )}

      {/* Evaluaciones pendientes */}
      {pendingEvals.length > 0 && (
        <PendingSection title="Evaluaciones que debés completar" to="/myevaluations">
          {pendingEvals.slice(0, 3).map((a) => {
            const evaluated = a.evaluated
            const name = evaluated ? `${evaluated.firstName ?? ''} ${evaluated.lastName ?? ''}`.trim() : '—'
            return (
              <PendingItem
                key={a.id}
                icon={AlertCircle} iconClass="text-amber-400"
                title={`Evaluar a ${name}`}
                subtitle={a.cycle?.name ?? 'Feedback 360°'}
                badge={{ label: a.type, cls: 'bg-brand-pale text-brand' }}
                to={`/responseform360?surveyId=${a.cycleId}&employeeId=${a.evaluator?.id}&assignmentId=${a.id}`}
              />
            )
          })}
        </PendingSection>
      )}
    </>
  )
}

/* ── Sección de pendientes con header ────────────────────────── */
function PendingSection({ title, to, children }) {
  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {to && (
          <Link to={to} className="text-xs text-brand hover:text-brand-hover font-medium transition-colors">
            Ver todas →
          </Link>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ── Página principal ────────────────────────────────────────── */
export default function Home() {
  const { user } = useSelector((s) => s.auth)
  const role       = user?.role
  const employeeId = user?.employeeId

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">
          Bienvenido, {user?.firstName ?? 'bienvenido'} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {role === 'Talento' && 'Panel de recursos humanos'}
          {role === 'Líder'   && 'Panel de líder de equipo'}
          {role === 'Colaborador' && 'Tu espacio de trabajo'}
        </p>
      </div>

      {/* Contenido por rol */}
      {role === 'Talento'     && <TalentoDashboard />}
      {role === 'Líder'       && <LiderDashboard employeeId={employeeId} />}
      {role === 'Colaborador' && <ColaboradorDashboard employeeId={employeeId} />}

      {/* Placeholders — próximamente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComingSoon icon={Target}  label="Objetivos y plan de carrera" />
        <ComingSoon icon={BookOpen} label="Aprendizaje LMS" />
      </div>

    </main>
  )
}
