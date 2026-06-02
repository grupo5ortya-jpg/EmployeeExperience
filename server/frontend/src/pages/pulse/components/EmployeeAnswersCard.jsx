const SCORE_COLOR = (score) => {
  if (score >= 4) return 'bg-emerald-400'
  if (score >= 3) return 'bg-amber-400'
  return 'bg-red-400'
}

const SCORE_TEXT = (score) => {
  if (score >= 4) return 'text-emerald-700'
  if (score >= 3) return 'text-amber-700'
  return 'text-red-600'
}

function ScoreBar({ score }) {
  const pct = (score / 5) * 100
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${SCORE_COLOR(score)} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums shrink-0 ${SCORE_TEXT(score)}`}>
        {score}/5
      </span>
    </div>
  )
}

export default function EmployeeAnswersCard({ scores = [], cardStyle }) {
  if (scores.length === 0) {
    return (
      <div className={`rounded-xl border p-4 flex items-center justify-center ${cardStyle}`}>
        <p className="text-xs text-slate-400">Sin respuestas cerradas registradas.</p>
      </div>
    )
  }

  const avg = (scores.reduce((s, a) => s + a.score, 0) / scores.length).toFixed(1)

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${cardStyle}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Respuestas del empleado
      </p>

      <ul className="flex flex-col gap-2.5">
        {scores.map((item, i) => (
          <li key={i} className="flex flex-col gap-1">
            <span className="text-xs text-slate-600 leading-tight">{item.question}</span>
            <ScoreBar score={item.score} />
          </li>
        ))}
      </ul>

      <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-400">Promedio general</span>
        <span className={`text-sm font-bold ${SCORE_TEXT(parseFloat(avg))}`}>{avg} / 5</span>
      </div>
    </div>
  )
}
