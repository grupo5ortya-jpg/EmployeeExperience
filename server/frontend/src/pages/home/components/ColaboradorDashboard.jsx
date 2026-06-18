import { ClipboardList, RotateCcw, Bell, Circle, AlertCircle } from 'lucide-react'

import { useMyTasks }               from '../../../hooks/useMyTasks'
import { useMyFeedbackAssignments } from '../../../hooks/useMyFeedbackAssignments'
import { usePendingSurveys }        from '../../../hooks/usePendingSurveys'
import { useUnreadAlerts }          from '../../../hooks/useUnreadAlerts'
import SummaryCard from './SummaryCard'
import PendingSection from './PendingSection'
import PendingItem from './PendingItem'
import PerformancePanel from './PerformancePanel'
import ReceivedFeedbacksPanel from './ReceivedFeedbacksPanel'
import NextStepsPanel from './NextStepsPanel'

/* ── Vista Colaborador ───────────────────────────────────────── */
export default function ColaboradorDashboard({ employeeId }) {
  const { data: tasks = [] }          = useMyTasks(employeeId)
  const { data: assignments = [] }    = useMyFeedbackAssignments(employeeId)
  const { data: pulseAssignments = [] } = usePendingSurveys(employeeId)
  const { data: unread = 0 }          = useUnreadAlerts()

  const pendingTasks = tasks.filter((t) =>
    !['COMPLETED', 'DROPPED', 'SUBMITTED'].includes(t.status))
  const pendingEvals = assignments.filter((a) => a.status === 'PENDING')

  return (
    <>
      <NextStepsPanel employeeId={employeeId} />

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
        <PendingSection title="Tus planes de trabajo" to="/mytasks">
          {pendingTasks.slice(0, 5).map((t) => (
            <PendingItem
              key={t.taskId}
              icon={Circle} iconClass="text-slate-300"
              title={t.task?.name ?? '—'}
              subtitle={t.task?.taskType?.name ?? 'Plan'}
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

      <PerformancePanel employeeId={employeeId} />
      <ReceivedFeedbacksPanel employeeId={employeeId} />
    </>
  )
}
