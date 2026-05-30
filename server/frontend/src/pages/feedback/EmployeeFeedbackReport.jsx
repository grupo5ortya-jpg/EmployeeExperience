import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useFeedbackResults }  from '../../hooks/useFeedbackResults'
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

            {/* Chart */}
            <Section title="Promedio por competencia">
                {data.competencies.every(c => c.average == null) ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                        Aún no hay evaluaciones completadas para este ciclo.
                    </p>
                ) : (
                    <CompetencyChart competencies={data.competencies} />
                )}
            </Section>

            {/* Comments — anonymized */}
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

        </main>
    )
}
