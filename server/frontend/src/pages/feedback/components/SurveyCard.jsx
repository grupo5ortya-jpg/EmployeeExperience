import { ChevronRight, Building2, CalendarRange, Lock } from 'lucide-react'
import { COMPETENCY_MAP } from '../competencyConfig'

/* ─── Helpers ───────────────────────────────────────────────── */
function formatShortDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short',
    })
}

function periodLabel(start, end) {
    const s = formatShortDate(start)
    const e = formatShortDate(end)
    if (!s && !e) return null
    if (s && e)   return `${s} — ${e}`
    if (s)        return `Desde ${s}`
    return `Hasta ${e}`
}

/* ─── Skeleton placeholder mientras carga ───────────────────── */
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm animate-pulse overflow-hidden">
            <div className="h-1 bg-slate-200" />
            <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/3 mt-2" />
            </div>
        </div>
    )
}

/* ─── Card de ciclo de feedback ─────────────────────────────── */
/**
 * Tarjeta de un ciclo de Feedback 360° para la vista de lista (FeedbackHome).
 *
 * @param {{ survey: object, assignmentCount: number, onClick: () => void }} props
 */
export function SurveyCard({ survey, assignmentCount, onClick }) {
    const period       = periodLabel(survey.startDate, survey.endDate)
    const competencies = (survey.competencies ?? []).map((id) => COMPETENCY_MAP[id]?.label ?? id)
    const maxVisible   = 2
    const visible      = competencies.slice(0, maxVisible)
    const extra        = competencies.length - maxVisible

    return (
        <article
            onClick={onClick}
            className="bg-white rounded-xl border border-brand-light shadow-sm hover:shadow-md
                       hover:border-brand transition-all cursor-pointer group overflow-hidden flex flex-col"
        >
            {/* Barra de acento */}
            <div className="h-1 bg-brand shrink-0" />

            <div className="p-5 flex flex-col gap-3 flex-1">

                {/* Nombre + chevron */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 flex-1">
                        {survey.name}
                    </h3>
                    <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-brand transition-colors shrink-0 mt-0.5"
                    />
                </div>

                {/* Departamento */}
                {survey.department ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{survey.department.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                        <Building2 size={11} className="shrink-0" />
                        <span>Sin departamento</span>
                    </div>
                )}

                {/* Período */}
                {period && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarRange size={11} className="text-slate-400 shrink-0" />
                        <span>{period}</span>
                    </div>
                )}

                {/* Competencias */}
                {competencies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {visible.map((c) => (
                            <span
                                key={c}
                                className="text-xs font-medium bg-brand-pale text-brand px-2 py-0.5 rounded-full"
                            >
                                {c}
                            </span>
                        ))}
                        {extra > 0 && (
                            <span className="text-xs text-slate-400 px-1 py-0.5">
                                +{extra} más
                            </span>
                        )}
                    </div>
                )}

                {/* Footer: participantes + anonimato */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-brand-light">
                    <span className="text-xs text-slate-500 font-medium">
                        {assignmentCount}{' '}
                        {assignmentCount === 1 ? 'participante' : 'participantes'}
                    </span>
                    {survey.minAnonymousResponses && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Lock size={10} />
                            <span>Mín. {survey.minAnonymousResponses} anón.</span>
                        </div>
                    )}
                </div>

            </div>
        </article>
    )
}
