import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Lock, Sparkles, TrendingUp, Lightbulb } from 'lucide-react'
import { useFeedbackResults }       from '../../hooks/useFeedbackResults'
import { useFeedbackGapAnalysis }   from '../../hooks/useFeedbackGapAnalysis'
import { CompetencyChart }     from './components/CompetencyChart'
import { COMPETENCY_MAP }      from './competencyConfig'

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </div>
    )
}

export default function EmployeeFeedbackReport() {
    const [params]    = useSearchParams()
    const cycleId     = params.get('cycleId')
    const evaluatedId = params.get('evaluatedId')

    const { data, isLoading, isError } = useFeedbackResults(cycleId, evaluatedId)
    const { data: gapData }            = useFeedbackGapAnalysis(cycleId, evaluatedId)

    if (isLoading) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-36 bg-slate-200 rounded-xl" />
            </div>
        </main>
    )

    if (isError || !data) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
            <p className="text-sm text-red-400">No se pudieron cargar los resultados.</p>
        </main>
    )

    const hasComments = data.competencies.some(c => c.comments.length > 0)
    const blocked     = data.stats?.blocked ?? false
    const minRequired = data.stats?.minRequired ?? 0
    const completed   = data.stats?.completed ?? 0

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div>
                <Link to="/feedbackhome"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors w-fit mb-3">
                    <ArrowLeft size={13} />
                    Volver
                </Link>
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">Mis resultados de Feedback 360°</h1>
                    <p className="text-xs text-slate-400 mt-0.5">{data.cycle?.name}</p>
                </div>
            </div>

            {/* Blocked state — anonymity protection */}
            {blocked && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Lock size={22} className="text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Resultados aún no disponibles
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            Para proteger el anonimato, los resultados se muestran
                            cuando al menos <span className="font-semibold">{minRequired}</span> personas
                            completen tu evaluación. Hasta ahora completaron <span className="font-semibold">{completed}</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* Results — only shown when not blocked */}
            {!blocked && (
                <>
                    <Section title="Promedio por competencia">
                        {data.competencies.every(c => c.average == null) ? (
                            <p className="text-sm text-slate-400 text-center py-4">
                                Aún no hay evaluaciones completadas para este ciclo.
                            </p>
                        ) : (
                            <CompetencyChart competencies={data.competencies} />
                        )}
                    </Section>

                    {hasComments && (
                        <Section title="Comentarios recibidos">
                            <div className="flex flex-col gap-5">
                                {data.competencies.filter(c => c.comments.length > 0).map(c => {
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
                </>
            )}

            {/* ── AI Gap Analysis (employee view: strengths + suggestions only) ── */}
            {!blocked && gapData?.analysis && (
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

        </main>
    )
}
