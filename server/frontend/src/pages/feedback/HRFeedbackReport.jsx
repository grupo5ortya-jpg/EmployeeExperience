import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { useFeedbackResults }      from '../../hooks/useFeedbackResults'
import { useFeedbackGapAnalysis, useGenerateGapAnalysis } from '../../hooks/useFeedbackGapAnalysis'
import { CompetencyChart }    from './components/CompetencyChart'
import { COMPETENCY_MAP }     from './competencyConfig'

const TYPE_LABEL = { SELF: 'Auto', PEER: 'Par', LEADER: 'Líder', DIRECT_REPORT: 'Reporte directo' }
const TYPE_STYLE = {
    SELF:          'bg-brand-pale text-brand',
    PEER:          'bg-slate-100 text-slate-500',
    LEADER:        'bg-violet-100 text-violet-600',
    DIRECT_REPORT: 'bg-amber-100 text-amber-700',
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </div>
    )
}

export default function HRFeedbackReport() {
    const [params]    = useSearchParams()
    const cycleId     = params.get('cycleId')
    const evaluatedId = params.get('evaluatedId')

    const { data, isLoading, isError } = useFeedbackResults(cycleId, evaluatedId)
    const { data: gapData, isLoading: loadingGap } = useFeedbackGapAnalysis(cycleId, evaluatedId)
    const { mutate: generate, isPending: generating, error: generateError } = useGenerateGapAnalysis(cycleId, evaluatedId)

    if (isLoading) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-56 bg-slate-200 rounded-xl" />
            </div>
        </main>
    )

    if (isError || !data) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
            <p className="text-sm text-red-400">No se pudieron cargar los resultados.</p>
        </main>
    )

    const { evaluated, cycle, competencies, breakdown, stats } = data
    const evalName = evaluated
        ? `${evaluated.firstName ?? ''} ${evaluated.lastName ?? ''}`.trim()
        : 'Empleado'

    const hasData    = breakdown.length > 0
    const hasPending = stats?.pending > 0

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div>
                <Link to={`/feedback/${cycleId}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors w-fit mb-3">
                    <ArrowLeft size={13} />
                    Volver al ciclo
                </Link>
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">
                        Resultados — {evalName}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {cycle?.name}
                        {stats && (
                            <span className="ml-2">
                                · {stats.completed} de {stats.total} evaluaciones completadas
                            </span>
                        )}
                    </p>
                </div>

                {hasPending && (
                    <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200
                                    rounded-lg px-4 py-2.5 text-xs text-amber-700">
                        <span className="font-semibold">
                            {stats.pending} evaluación{stats.pending > 1 ? 'es' : ''} pendiente{stats.pending > 1 ? 's' : ''}
                        </span>
                        — los resultados son parciales hasta que todos completen el formulario.
                    </div>
                )}
            </div>

            {!hasData ? (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-10 text-center shrink-0">
                    <p className="text-sm text-slate-400">
                        No hay evaluaciones completadas para este empleado en este ciclo.
                    </p>
                </div>
            ) : (
                <>
                    {/* Averages chart */}
                    <Section title="Promedio por competencia">
                        <CompetencyChart competencies={competencies} />
                    </Section>

                    {/* Breakdown table */}
                    <Section title={`Desglose por evaluador (${breakdown.length})`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-125">
                                <thead>
                                    <tr className="border-b border-brand-light">
                                        <th className="text-left text-xs text-slate-400 font-semibold pb-2 pr-4">
                                            Evaluador
                                        </th>
                                        <th className="text-left text-xs text-slate-400 font-semibold pb-2 pr-4">
                                            Tipo
                                        </th>
                                        {competencies.map(c => (
                                            <th key={c.id}
                                                className="text-center text-xs text-slate-400 font-semibold pb-2 px-2">
                                                {COMPETENCY_MAP[c.id]?.label ?? c.id}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-light">
                                    {breakdown.map(row => (
                                        <tr key={row.id}>
                                            <td className="py-2.5 pr-4 font-medium text-slate-700">
                                                {row.evaluator
                                                    ? `${row.evaluator.firstName ?? ''} ${row.evaluator.lastName ?? ''}`.trim()
                                                    : '—'}
                                            </td>
                                            <td className="py-2.5 pr-4">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                    ${TYPE_STYLE[row.type] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {TYPE_LABEL[row.type] ?? row.type}
                                                </span>
                                            </td>
                                            {competencies.map(c => (
                                                <td key={c.id}
                                                    className="py-2.5 px-2 text-center font-semibold text-slate-700">
                                                    {row.scores[c.id] != null
                                                        ? row.scores[c.id].toFixed(1)
                                                        : <span className="text-slate-300">—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Comments per evaluator — shows all competencies, "no comentó" if empty */}
                    <Section title="Comentarios por evaluador">
                        <div className="flex flex-col gap-5">
                            {breakdown.map(row => {
                                const name = row.evaluator
                                    ? `${row.evaluator.firstName ?? ''} ${row.evaluator.lastName ?? ''}`.trim()
                                    : '—'
                                return (
                                    <div key={row.id}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-slate-700">{name}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                ${TYPE_STYLE[row.type] ?? ''}`}>
                                                {TYPE_LABEL[row.type] ?? row.type}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 pl-2">
                                            {competencies.map(c => {
                                                const meta    = COMPETENCY_MAP[c.id]
                                                const comment = row.comments?.[c.id]?.trim()
                                                return (
                                                    <div key={c.id}>
                                                        <p className="text-xs font-semibold text-brand mb-0.5">
                                                            {meta?.label ?? c.id}
                                                        </p>
                                                        {comment ? (
                                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                                <MessageSquare size={12}
                                                                    className="text-slate-300 shrink-0 mt-0.5" />
                                                                <span className="leading-snug">{comment}</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-normal italic">
                                                                no comentó
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Section>
                </>
            )}

            {/* ── AI Gap Analysis ────────────────────────── */}
            {hasData && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                                    flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-brand" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                AI Gap Analysis
                            </h2>
                        </div>
                        {!loadingGap && !gapData && (
                            <button
                                onClick={() => generate()}
                                disabled={generating}
                                className="flex items-center gap-1.5 text-xs font-semibold text-brand
                                           hover:text-brand-hover bg-brand-pale hover:bg-brand-light
                                           px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={11} className={generating ? 'animate-spin' : ''} />
                                {generating ? 'Generando...' : 'Generar análisis'}
                            </button>
                        )}
                        {gapData && (
                            <span className="text-xs text-slate-400">
                                Generado el {new Date(gapData.createdAt).toLocaleDateString('es-AR')}
                            </span>
                        )}
                    </div>

                    <div className="p-5">
                        {loadingGap && (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-1/2" />
                            </div>
                        )}

                        {!loadingGap && !gapData && !generating && (
                            <p className="text-xs text-slate-400 text-center py-4">
                                Hacé click en "Generar análisis" para que la IA compare los resultados
                                con el perfil esperado del departamento.
                            </p>
                        )}

                        {generateError && (
                            <p className="text-xs text-red-400 text-center py-2">
                                Error al generar el análisis. Verificá que haya evaluaciones completadas.
                            </p>
                        )}

                        {gapData?.analysis && (
                            <div className="flex flex-col gap-4">
                                {/* Summary */}
                                <p className="text-sm text-slate-600 leading-snug border-l-2 border-brand pl-3">
                                    {gapData.analysis.summary}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Strengths */}
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <TrendingUp size={12} className="text-emerald-600 shrink-0" />
                                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                                Fortalezas
                                            </p>
                                        </div>
                                        <ul className="flex flex-col gap-1.5">
                                            {gapData.analysis.strengths.map((s, i) => (
                                                <li key={i} className="text-xs text-emerald-700 leading-snug flex items-start gap-1.5">
                                                    <span className="mt-1 shrink-0">·</span>{s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Gaps */}
                                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                                Brechas
                                            </p>
                                        </div>
                                        <ul className="flex flex-col gap-1.5">
                                            {gapData.analysis.gaps.map((g, i) => (
                                                <li key={i} className="text-xs text-amber-700 leading-snug flex items-start gap-1.5">
                                                    <span className="mt-1 shrink-0">·</span>{g}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="rounded-lg bg-brand-pale border border-brand-light p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Lightbulb size={12} className="text-brand shrink-0" />
                                            <p className="text-xs font-bold text-brand uppercase tracking-wide">
                                                Acciones sugeridas
                                            </p>
                                        </div>
                                        <ul className="flex flex-col gap-1.5">
                                            {gapData.analysis.suggestions.map((s, i) => (
                                                <li key={i} className="text-xs text-brand leading-snug flex items-start gap-1.5">
                                                    <span className="mt-1 shrink-0">·</span>{s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </main>
    )
}
