import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { usePendingExitInterviews } from '../../../hooks/useExitInterviews'
import ExitInterviewCard from '../../pulse/components/ExitInterviewCard'
import ExitInterviewForm from '../../pulse/components/ExitInterviewForm'

/* ── Vista Alumni ────────────────────────────────────────────── */
export default function AlumniDashboard({ employeeId }) {
  const { data: exitInterviews = [] } = usePendingExitInterviews(employeeId)
  const [activeExitInterview, setActiveExitInterview] = useState(null)

  return (
    <>
      <Link
        to={`/detailemployee/${employeeId}`}
        className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col
                   items-center justify-center gap-2 py-10 text-center hover:border-brand transition-colors"
      >
        <User size={24} className="text-brand" />
        <p className="text-sm font-semibold text-slate-700">Ver mi perfil</p>
        <p className="text-xs text-slate-400">Consultá tu información, certificaciones y skills</p>
      </Link>

      {/* Entrevista de salida pendiente */}
      {exitInterviews.length > 0 && (
        <>
          <div className="border-l-4 border-brand pl-4">
            <h2 className="text-base font-bold text-slate-800">Entrevista de salida</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tu opinión nos ayuda a mejorar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exitInterviews.map((assignment) => (
              <ExitInterviewCard
                key={assignment.surveyId}
                assignment={assignment}
                onStart={() => setActiveExitInterview(assignment)}
              />
            ))}
          </div>
        </>
      )}

      {activeExitInterview && (
        <ExitInterviewForm
          assignment={activeExitInterview}
          onClose={() => setActiveExitInterview(null)}
          onCompleted={() => setActiveExitInterview(null)}
        />
      )}
    </>
  )
}
