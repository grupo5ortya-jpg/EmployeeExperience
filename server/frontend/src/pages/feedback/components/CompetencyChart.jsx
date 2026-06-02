import { COMPETENCY_MAP } from '../competencyConfig'

const barColor = (avg) => {
    if (avg == null) return 'bg-slate-200'
    if (avg >= 4)    return 'bg-emerald-400'
    if (avg >= 3)    return 'bg-amber-400'
    return 'bg-red-400'
}

const textColor = (avg) => {
    if (avg == null) return 'text-slate-400'
    if (avg >= 4)    return 'text-emerald-600'
    if (avg >= 3)    return 'text-amber-600'
    return 'text-red-500'
}

export function CompetencyChart({ competencies }) {
    if (!competencies?.length) return null

    const overallAvg = (() => {
        const vals = competencies.filter(c => c.average != null).map(c => c.average)
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null
    })()

    return (
        <div className="flex flex-col gap-4">
            {/* Overall score */}
            {overallAvg && (
                <div className="flex items-center justify-between pb-3 border-b border-brand-light">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Promedio general
                    </span>
                    <span className={`text-2xl font-extrabold ${textColor(parseFloat(overallAvg))}`}>
                        {overallAvg} <span className="text-sm font-medium text-slate-400">/ 5</span>
                    </span>
                </div>
            )}

            {/* Per competency bars */}
            {competencies.map((c) => {
                const meta  = COMPETENCY_MAP[c.id]
                const label = meta?.label ?? c.id
                const Icon  = meta?.Icon
                const pct   = c.average != null ? (c.average / 5) * 100 : 0

                return (
                    <div key={c.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 w-36 shrink-0">
                            {Icon && <Icon size={12} className="text-brand shrink-0" strokeWidth={2} />}
                            <span className="text-sm text-slate-600 truncate">{label}</span>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor(c.average)}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-8 text-right ${textColor(c.average)}`}>
                            {c.average != null ? c.average.toFixed(1) : '—'}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
