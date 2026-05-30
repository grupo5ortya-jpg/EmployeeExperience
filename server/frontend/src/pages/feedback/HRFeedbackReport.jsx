import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useFeedbackResults } from '../../hooks/useFeedbackResults'
import { CompetencyChart }    from './components/CompetencyChart'
import { COMPETENCY_MAP }     from './competencyConfig'

const TYPE_LABEL = { SELF: 'Auto', PEER: 'Par', LEADER: 'Líder' }
const TYPE_STYLE = {
    SELF:   'bg-brand-pale text-brand',
    PEER:   'bg-slate-100 text-slate-500',
    LEADER: 'bg-violet-100 text-violet-600',
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

        </main>
    )
}
