import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Activity } from 'lucide-react'
import { usePendingSurveys } from '../../hooks/usePendingSurveys'
import { usePendingExitInterviews } from '../../hooks/useExitInterviews'
import PulseSurveyCard from './components/PulseSurveyCard'
import PulseSurveyForm from './components/PulseSurveyForm'
import ExitInterviewCard from './components/ExitInterviewCard'
import ExitInterviewForm from './components/ExitInterviewForm'

export default function PulseSurveys() {
  const [searchParams] = useSearchParams()
  const { user } = useSelector((s) => s.auth)
  // ?employeeId= sigue soportado (lo usan los links de Alertas/Home con el id ya resuelto),
  // pero si no viene en la URL se cae al empleado logueado — antes quedaba vacío sin el query param.
  const employeeId = searchParams.get('employeeId') || user?.employeeId

  const { data: assignments = [], isLoading, isError } = usePendingSurveys(employeeId)
  const { data: exitInterviews = [] } = usePendingExitInterviews(employeeId)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [activeExitInterview, setActiveExitInterview] = useState(null)

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">Encuestas de Pulso</h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
          Completá tus encuestas de seguimiento de onboarding
        </p>
      </div>

      {/* No employeeId — no debería pasar logueado, defensivo */}
      {!employeeId && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Activity size={36} className="text-slate-300" />
          <p className="text-sm text-slate-400">No se pudo identificar al empleado.</p>
        </div>
      )}

      {/* Loading */}
      {employeeId && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {employeeId && isError && (
        <p className="text-sm text-red-400 text-center py-10">
          No se pudieron cargar las encuestas. Intentá de nuevo.
        </p>
      )}

      {/* Empty state */}
      {employeeId && !isLoading && !isError && assignments.length === 0 && exitInterviews.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
            <Activity size={24} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sin encuestas pendientes</p>
            <p className="text-xs text-slate-400 mt-1">No tenés encuestas de pulso por completar en este momento.</p>
          </div>
        </div>
      )}

      {/* Survey cards */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <PulseSurveyCard
              key={assignment.surveyId}
              assignment={assignment}
              onStart={() => setActiveAssignment(assignment)}
            />
          ))}
        </div>
      )}

      {/* Exit interview */}
      {exitInterviews.length > 0 && (
        <>
          <div className="border-l-4 border-brand pl-4 mt-1">
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

      {/* Survey form modal */}
      {activeAssignment && (
        <PulseSurveyForm
          assignment={activeAssignment}
          onClose={() => setActiveAssignment(null)}
          onCompleted={() => setActiveAssignment(null)}
        />
      )}

      {/* Exit interview form modal */}
      {activeExitInterview && (
        <ExitInterviewForm
          assignment={activeExitInterview}
          onClose={() => setActiveExitInterview(null)}
          onCompleted={() => setActiveExitInterview(null)}
        />
      )}

    </main>
  )
}
