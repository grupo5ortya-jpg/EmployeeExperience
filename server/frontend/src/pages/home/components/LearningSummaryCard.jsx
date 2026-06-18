import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useEnrollments } from '../../../hooks/useLearning'

/* ── Card "Learning" — resumen de aprendizaje según rol ──────── */
export default function LearningSummaryCard({ role, employeeId }) {
  const isHR = role === 'Talento'
  const { data: enrollments = [] } = useEnrollments(
    isHR ? { status: 'PENDING_APPROVAL' } : { employeeId }
  )
  const count = enrollments.length
  const to    = isHR ? '/learningdashboard' : '/mylearning'
  const text  = isHR
    ? `${count} solicitud${count !== 1 ? 'es' : ''} pendiente${count !== 1 ? 's' : ''} de aprobación`
    : `Tenés ${count} curso${count !== 1 ? 's' : ''} en tu aprendizaje`

  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col
                 items-center justify-center gap-2 py-10 text-center hover:border-brand transition-colors"
    >
      <GraduationCap size={24} className="text-brand" />
      <p className="text-xs font-medium text-slate-400">Learning</p>
      <span className="text-sm font-semibold text-slate-700">{text}</span>
    </Link>
  )
}
