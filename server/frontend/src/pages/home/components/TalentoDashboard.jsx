import { Users, Bell, RotateCcw, ClipboardList, Target, Briefcase } from 'lucide-react'

import { useEmployees }        from '../../../hooks/useEmployees'
import { useUnreadAlerts }     from '../../../hooks/useUnreadAlerts'
import { useSurveys }          from '../../../hooks/useSurveys'
import { useAllEmployeeTasks } from '../../../hooks/useAllEmployeeTasks'
import { useOkrs }             from '../../../hooks/useOkrs'
import { useJobOpenings }      from '../../jobOpenings/hooks/useJobOpenings'
import SummaryCard from './SummaryCard'

/* ── Vista Talento ───────────────────────────────────────────── */
export default function TalentoDashboard() {
  const { data: employees = [] }   = useEmployees()
  const { data: unread = 0 }       = useUnreadAlerts()
  const { data: surveys = [] }     = useSurveys()
  const { data: allTasks = [] }    = useAllEmployeeTasks()
  const { data: okrs = [] }        = useOkrs()
  const { data: jobOpenings = [] } = useJobOpenings()

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
  const pendingTasks    = allTasks.filter((t) =>
    t.status && !['COMPLETED', 'DROPPED'].includes(t.status)).length
  const activeOkrs      = okrs.filter((o) => o.status !== 'COMPLETED').length
  const openPositions   = jobOpenings.filter((j) => j.status === 'open').length

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
          label="Planes asignados"     value={pendingTasks}  unit="pendientes" to="/all-assignments" />
        <SummaryCard icon={Target}     iconBg="bg-emerald-100" iconColor="text-emerald-600"
          label="OKR activos"       value={activeOkrs}       unit="activos"     to="/okrmanagement" />
        <SummaryCard icon={Briefcase}  iconBg="bg-indigo-100"  iconColor="text-indigo-600"
          label="Vacantes abiertas" value={openPositions}    unit="abiertas"  to="/job-openings" />
      </div>
    </>
  )
}
