import { AlignLeft } from 'lucide-react'
import { COMPETENCY_MAP } from '../competencyConfig'
import { useFeedback360Questions } from '../hooks/useFeedback360Questions'

function ScaleIndicator() {
    return (
        <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
                <div
                    key={n}
                    className="w-6 h-6 rounded border border-brand-light bg-brand-pale/40
                               flex items-center justify-center text-xs font-semibold text-brand/60"
                >
                    {n}
                </div>
            ))}
            <span className="text-xs text-slate-400 ml-1.5">1 = Muy malo · 5 = Excelente</span>
        </div>
    )
}

export function QuestionList({ competencyIds, variant = 'create' }) {
    const { data: groups = [], isLoading } = useFeedback360Questions(competencyIds)

    if (!competencyIds?.length) return null

    if (isLoading) {
        return (
            <div className="py-8 text-center text-xs text-slate-400">
                Cargando preguntas...
            </div>
        )
    }

    // Global question numbering across groups
    const startIndices = groups.map((_, i) =>
        groups.slice(0, i).reduce((acc, g) => acc + g.questions.length, 0),
    )

    /* ── variant="detail" — FeedbackDetailPage ─── */
    if (variant === 'detail') {
        return (
            <>
                {groups.map((group, idx) => {
                    const meta = COMPETENCY_MAP[group.competencyId]
                    if (!meta) return null
                    const { Icon, label } = meta
                    const startIdx = startIndices[idx]

                    return (
                        <div key={group.competencyId}>
                            <div className="px-5 py-2.5 bg-slate-50 flex items-center gap-2">
                                <Icon size={12} className="text-brand shrink-0" strokeWidth={2} />
                                <span className="text-xs font-bold text-brand uppercase tracking-wide">
                                    {label}
                                </span>
                            </div>
                            {group.questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="px-5 py-3.5 flex gap-3 border-t border-brand-light/60"
                                >
                                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                        {startIdx + i + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">{q.text}</p>
                                        <ScaleIndicator />
                                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                            <AlignLeft size={10} className="shrink-0" />
                                            <span>Comentario adicional opcional</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </>
        )
    }

    /* ── variant="create" — CreateFeedback ─── */
    return (
        <div className="flex flex-col gap-5">
            {groups.map((group, idx) => {
                const comp = COMPETENCY_MAP[group.competencyId]
                if (!comp) return null
                const { Icon, label } = comp
                const startIdx = startIndices[idx]

                return (
                    <div key={group.competencyId}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={13} className="text-brand shrink-0" strokeWidth={2} />
                            <p className="text-xs font-bold text-brand uppercase tracking-wide">{label}</p>
                            <span className="text-xs text-slate-400">
                                ({group.questions.length} {group.questions.length === 1 ? 'pregunta' : 'preguntas'})
                            </span>
                        </div>
                        <div className="bg-brand-pale/30 rounded-lg border border-brand-light px-4">
                            {group.questions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className="flex gap-3 py-3 border-b border-brand-light last:border-0"
                                >
                                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                        {startIdx + i + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">{q.text}</p>
                                        <ScaleIndicator />
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                                            <AlignLeft size={10} className="shrink-0" />
                                            <span>Campo de comentario adicional opcional</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
