import { okrStatusMeta } from '../okrUtils'

export function OkrStatusBadge({ status, overdue }) {
    const meta = okrStatusMeta(status)
    return (
        <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                {meta.label}
            </span>
            {overdue && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Vencido
                </span>
            )}
        </div>
    )
}

export function OkrProgressBar({ status, percent }) {
    const meta = okrStatusMeta(status)
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-sm font-bold text-slate-600 w-10 text-right">{percent}%</span>
        </div>
    )
}
