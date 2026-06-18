import { Bell, RotateCcw, ClipboardList, Users, Circle } from 'lucide-react'

import { useUnreadAlerts }          from '../../../hooks/useUnreadAlerts'
import { useMyFeedbackAssignments } from '../../../hooks/useMyFeedbackAssignments'
import { useAllEmployeeTasks }      from '../../../hooks/useAllEmployeeTasks'
import { useEmployees }             from '../../../hooks/useEmployees'
import SummaryCard from './SummaryCard'
import PerformancePanel from './PerformancePanel'
import PendingSection from './PendingSection'
import PendingItem from './PendingItem'

/* ── Vista Líder ─────────────────────────────────────────────── */
export default function LiderDashboard({ employeeId }) {
  const { data: unread = 0 }          = useUnreadAlerts()
  const { data: assignments = [] }     = useMyFeedbackAssignments(employeeId)
  const { data: allTasks = [] }        = useAllEmployeeTasks()
  const { data: allEmployees = [] }    = useEmployees()

  const pendingEvals  = assignments.filter((a) => a.status === 'PENDING').length
  const submittedTeam = allTasks.filter((t) => t.status === 'SUBMITTED').length
  const teamCount     = allEmployees.filter((e) => e.manager?.id === employeeId).length

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard icon={RotateCcw}    iconBg="bg-brand-light"  iconColor="text-brand"
          label="Evaluaciones pendientes" value={pendingEvals} unit="eval." to="/myevaluations" />
        <SummaryCard icon={Bell}         iconBg="bg-red-100"      iconColor="text-red-500"
          label="Alertas del equipo"     value={unread}          unit="alertas" to="/alerts" />
        <SummaryCard icon={ClipboardList} iconBg="bg-amber-100"   iconColor="text-amber-600"
          label="Tareas a revisar"       value={submittedTeam}   unit="tareas" to="/all-assignments" />
        <SummaryCard icon={Users} iconBg="bg-emerald-100" iconColor="text-emerald-600"
          label="Mi equipo"             value={teamCount}        unit="personas" to="/employeelist" />
      </div>

      <PerformancePanel employeeId={employeeId} />

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
