import RiskBadge from './RiskBadge'

const SENTIMENT_STYLE = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral:  'bg-slate-100   text-slate-500',
  negative: 'bg-red-100     text-red-600',
}
const SENTIMENT_LABEL = { positive: 'Positivo', neutral: 'Neutral', negative: 'Negativo' }

const SUBTYPE_LABEL = { '30': '30 días', '60': '60 días', '90': '90 días' }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function PulseAnalysisCard({ analysis, cardStyle }) {
  const { overallRisk, sentiment, topics, summary, reasoning, createdAt, employee, survey } = analysis
  const employeeName = employee
    ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || 'Empleado'
    : 'Empleado'

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${cardStyle}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge risk={overallRisk} size="sm" />
        {sentiment && (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SENTIMENT_STYLE[sentiment] ?? ''}`}>
            {SENTIMENT_LABEL[sentiment] ?? sentiment}
          </span>
        )}
        {survey?.subType && (
          <span className="text-xs text-slate-400 ml-auto">
            Pulso {SUBTYPE_LABEL[survey.subType] ?? survey.subType}
          </span>
        )}
      </div>

      {/* Employee + date */}
      <div>
        <p className="text-sm font-semibold text-slate-800 leading-tight">{employeeName}</p>
        {employee?.position && (
          <p className="text-xs text-slate-400 mt-0.5">{employee.position}</p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(createdAt)}</p>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-slate-700 leading-snug">{summary}</p>
      )}

      {/* Reasoning */}
      {reasoning && (
        <p className="text-xs text-slate-500 leading-snug italic border-l-2 border-slate-200 pl-2">
          {reasoning}
        </p>
      )}

      {/* Topics */}
      {topics?.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {topics.map((t) => (
            <span key={t} className="text-xs bg-white/80 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
