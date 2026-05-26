import { AlignLeft } from 'lucide-react'
import { COMPETENCY_MAP, QUESTIONS_BY_COMPETENCY } from '../constants/competencies'

/** Indicador de escala 1–5 compartido */
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

/**
 * Lista de preguntas agrupadas por competencia.
 *
 * variant="create" → estilo sección (fondo paleado, borde round por grupo).
 *                    Usado en CreateFeedback como preview de preguntas.
 *
 * variant="detail" → estilo tabla plana dentro de un contenedor scrolleable.
 *                    Usado en FeedbackDetailPage.
 *
 * @param {{ competencyIds: string[], variant?: 'create' | 'detail' }} props
 */
export function QuestionList({ competencyIds, variant = 'create' }) {
    if (!competencyIds?.length) return null

    // Precomputa los índices de inicio por grupo (para numeración global)
    const startIndices = competencyIds.map((_, i) =>
        competencyIds
            .slice(0, i)
            .reduce((acc, id) => acc + (QUESTIONS_BY_COMPETENCY[id]?.length ?? 0), 0),
    )

    /* ── Variante "detail" — para FeedbackDetailPage ─────────────── */
    if (variant === 'detail') {
        return (
            <>
                {competencyIds.map((cId, idx) => {
                    const meta = COMPETENCY_MAP[cId]
                    if (!meta) return null
                    const { Icon, label } = meta
                    const qs       = QUESTIONS_BY_COMPETENCY[cId] ?? []
                    const startIdx = startIndices[idx]

                    return (
                        <div key={cId}>
                            {/* Subheader de competencia */}
                            <div className="px-5 py-2.5 bg-slate-50 flex items-center gap-2">
                                <Icon size={12} className="text-brand shrink-0" strokeWidth={2} />
                                <span className="text-xs font-bold text-brand uppercase tracking-wide">
                                    {label}
                                </span>
                            </div>

                            {/* Preguntas */}
                            {qs.map((text, i) => (
                                <div
                                    key={`${cId}-${i}`}
                                    className="px-5 py-3.5 flex gap-3 border-t border-brand-light/60"
                                >
                                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                        {startIdx + i + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">{text}</p>
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

    /* ── Variante "create" — para CreateFeedback ──────────────────── */
    return (
        <div className="flex flex-col gap-5">
            {competencyIds.map((cId, idx) => {
                const comp = COMPETENCY_MAP[cId]
                if (!comp) return null
                const { Icon, label } = comp
                const qs       = QUESTIONS_BY_COMPETENCY[cId] ?? []
                const startIdx = startIndices[idx]

                return (
                    <div key={cId}>
                        {/* Header de competencia */}
                        <div className="flex items-center gap-2 mb-2">
                            <Icon size={13} className="text-brand shrink-0" strokeWidth={2} />
                            <p className="text-xs font-bold text-brand uppercase tracking-wide">
                                {label}
                            </p>
                            <span className="text-xs text-slate-400">
                                ({qs.length} {qs.length === 1 ? 'pregunta' : 'preguntas'})
                            </span>
                        </div>

                        {/* Preguntas */}
                        <div className="bg-brand-pale/30 rounded-lg border border-brand-light px-4">
                            {qs.map((text, i) => (
                                <div
                                    key={`${cId}-${i}`}
                                    className="flex gap-3 py-3 border-b border-brand-light last:border-0"
                                >
                                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5">
                                        {startIdx + i + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">{text}</p>
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
