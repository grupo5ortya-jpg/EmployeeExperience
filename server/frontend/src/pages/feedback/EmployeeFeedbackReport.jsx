import { useMemo }              from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useSelector }           from 'react-redux'
import { useQuery }              from '@tanstack/react-query'
import {
    ArrowLeft, MessageSquare, Lock, Sparkles,
    TrendingUp, Lightbulb, RotateCcw,
} from 'lucide-react'

import { useFeedbackResults }     from '../../hooks/useFeedbackResults'
import { useFeedbackGapAnalysis } from '../../hooks/useFeedbackGapAnalysis'
import { getMyResultCycles }      from '../../services/feedback360Service'
import { CompetencyChart }        from './components/CompetencyChart'
import { COMPETENCY_MAP }         from './competencyConfig'

/* ── Sección genérica ────────────────────────────────────────── */
function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </div>
    )
}

/* ── Resultados de un ciclo específico ───────────────────────── */
function CycleReport({ cycleId, evaluatedId, cycleName }) {
    const { data, isLoading } = useFeedbackResults(cycleId, evaluatedId)
    const { data: gapData }   = useFeedbackGapAnalysis(cycleId, evaluatedId)

    if (isLoading) return (
        <div className="animate-pulse space-y-3">
            <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
    )
    if (!data) return null

    const hasComments = data.competencies.some((c) => c.comments.length > 0)
    const blocked     = data.stats?.blocked ?? false
    const minRequired = data.stats?.minRequired ?? 0
    const completed   = data.stats?.completed ?? 0

    return (
        <div className="flex flex-col gap-4">
            {/* Cycle title */}
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-brand-light" />
                <span className="text-xs font-bold text-brand uppercase tracking-wider shrink-0">
                    {cycleName ?? cycleId}
                </span>
                <div className="h-px flex-1 bg-brand-light" />
            </div>

            {blocked ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center bg-white
                                rounded-xl border border-brand-light shadow-sm">
                    <Lock size={20} className="text-slate-300" />
                    <p className="text-sm text-slate-500">
                        Resultados parciales — faltan {minRequired - completed} evaluaciones para
                        garantizar el anonimato.
                    </p>
                </div>
            ) : (
                <>
                    <Section title="Promedio por competencia">
                        {data.competencies.every((c) => c.average == null) ? (
                            <p className="text-sm text-slate-400 text-center py-4">
                                Sin evaluaciones completadas.
                            </p>
                        ) : (
                            <CompetencyChart competencies={data.competencies} />
                        )}
                    </Section>

                    {hasComments && (
                        <Section title="Comentarios recibidos">
                            <div className="flex flex-col gap-5">
                                {data.competencies.filter((c) => c.comments.length > 0).map((c) => {
                                    const meta = COMPETENCY_MAP[c.id]
                                    const Icon = meta?.Icon
                                    return (
                                        <div key={c.id}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {Icon && <Icon size={12} className="text-brand shrink-0" strokeWidth={2} />}
                                                <span className="text-xs font-bold text-brand uppercase tracking-wide">
                                                    {meta?.label ?? c.id}
                                                </span>
                                            </div>
                                            <ul className="flex flex-col gap-1.5">
                                                {c.comments.map((text, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <MessageSquare size={13} className="text-slate-300 shrink-0 mt-0.5" />
                                                        <span className="leading-snug">{text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                })}
                            </div>
                        </Section>
                    )}

                    {gapData?.analysis && (
                        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                            <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40 flex items-center gap-2">
                                <Sparkles size={13} className="text-brand" />
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Tu análisis de desarrollo
                                </h2>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                <p className="text-sm text-slate-600 leading-snug border-l-2 border-brand pl-3">
                                    {gapData.analysis.summary}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <TrendingUp size={12} className="text-emerald-600 shrink-0" />
                                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                                Tus fortalezas
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
                                    <div className="rounded-lg bg-brand-pale border border-brand-light p-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Lightbulb size={12} className="text-brand shrink-0" />
                                            <p className="text-xs font-bold text-brand uppercase tracking-wide">
                                                Acciones para crecer
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
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/* ── Página ──────────────────────────────────────────────────── */
export default function EmployeeFeedbackReport() {
    const [params]    = useSearchParams()
    const { user }    = useSelector((s) => s.auth)
    const evaluatedId = params.get('evaluatedId') || user?.employeeId

    // Fetch all completed cycles for this employee
    const { data: assignments = [], isLoading: loadingCycles } = useQuery({
        queryKey: ['my-result-cycles', evaluatedId],
        queryFn:  () => getMyResultCycles(evaluatedId),
        enabled:  !!evaluatedId,
    })

    // Deduplicate cycles, most recent first
    const cycles = useMemo(() => {
        const seen = new Set()
        return assignments
            .filter((a) => {
                if (!a.cycleId || seen.has(a.cycleId)) return false
                seen.add(a.cycleId)
                return true
            })
            .map((a) => ({ cycleId: a.cycleId, cycleName: a.cycle?.name }))
    }, [assignments])

    // If URL has specific cycleId, only show that one
    const urlCycleId = params.get('cycleId')
    const displayCycles = urlCycleId
        ? cycles.filter((c) => c.cycleId === urlCycleId)
        : cycles

    if (loadingCycles) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-200 rounded-xl" />
            </div>
        </main>
    )

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-6">

            {/* Header */}
            <div>
                <Link to="/alerts"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors w-fit mb-3">
                    <ArrowLeft size={13} />
                    Volver a alertas
                </Link>
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">Mis resultados de Feedback 360°</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {displayCycles.length > 0
                            ? `${displayCycles.length} ciclo${displayCycles.length > 1 ? 's' : ''} disponible${displayCycles.length > 1 ? 's' : ''}`
                            : 'Historial de evaluaciones'}
                    </p>
                </div>
            </div>

            {/* No cycles yet */}
            {displayCycles.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <RotateCcw size={24} className="text-brand" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Sin resultados todavía</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            Cuando tu ciclo de Feedback 360° esté completo recibirás una notificación
                            y podrás ver tus resultados aquí.
                        </p>
                    </div>
                    <Link to="/alerts"
                        className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors">
                        Ver mis alertas →
                    </Link>
                </div>
            )}

            {/* All cycles stacked */}
            {displayCycles.map((c) => (
                <CycleReport
                    key={c.cycleId}
                    cycleId={c.cycleId}
                    evaluatedId={evaluatedId}
                    cycleName={c.cycleName}
                />
            ))}

        </main>
    )
}
