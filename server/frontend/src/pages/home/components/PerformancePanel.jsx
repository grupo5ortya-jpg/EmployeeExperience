import { Link } from 'react-router-dom'
import { useSurveys } from '../../../hooks/useSurveys'
import { useFeedbackResults } from '../../../hooks/useFeedbackResults'
import { CompetencyChart } from '../../feedback/components/CompetencyChart'

/* ── Panel rendimiento 360° ──────────────────────────────────── */
export default function PerformancePanel({ employeeId }) {
  const { data: surveys = [] } = useSurveys()
  const latestCycle = surveys[0] ?? null
  const { data, isLoading } = useFeedbackResults(latestCycle?.id, employeeId)

  const hasData = data?.competencies?.some((c) => c.average != null)

  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Mi rendimiento 360°</h3>
          {data?.cycle && (
            <p className="text-xs text-slate-400 mt-0.5">{data.cycle.name}</p>
          )}
        </div>
        {hasData && (
          <Link
            to={`/employeefeedbackreport?cycleId=${latestCycle?.id}&evaluatedId=${employeeId}`}
            className="text-xs text-brand hover:text-brand-hover font-medium transition-colors"
          >
            Ver detalle →
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-3/5" />
        </div>
      )}

      {!isLoading && !hasData && (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <span className="text-xs">Aún no hay resultados de Feedback 360°.</span>
        </div>
      )}

      {!isLoading && hasData && (
        <CompetencyChart competencies={data.competencies} />
      )}
    </div>
  )
}
