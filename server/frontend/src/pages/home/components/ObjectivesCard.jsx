import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { useMyOkrs } from '../../../hooks/useOkrs'
import ComingSoon from './ComingSoon'

/* ── Card "Objetivos y plan de carrera" — muestra los OKR asignados ── */
export default function ObjectivesCard({ employeeId }) {
  const { data: okrs = [] } = useMyOkrs(employeeId)
  const count = okrs.length
  const allCompleted = count > 0 && okrs.every((o) => o.status === 'COMPLETED')

  if (count === 0) {
    return <ComingSoon icon={Target} label="Objetivos y plan de carrera" />
  }

  return (
    <Link
      to="/myobjectives"
      className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col
                 items-center justify-center gap-2 py-10 text-center hover:border-brand transition-colors"
    >
      <Target size={24} className="text-brand" />
      <p className="text-xs font-medium text-slate-400">Objetivos y plan de carrera</p>
      <span className="text-sm font-semibold text-slate-700">
        {allCompleted
          ? 'Objetivos completados'
          : `Tenés ${count} objetivo${count !== 1 ? 's' : ''} asignado${count !== 1 ? 's' : ''}`}
      </span>
    </Link>
  )
}
