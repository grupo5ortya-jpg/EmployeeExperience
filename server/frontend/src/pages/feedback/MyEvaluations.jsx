import { useMemo }            from 'react'
import { Link }               from 'react-router-dom'
import { useSelector }        from 'react-redux'
import { CheckCircle2, Clock, ClipboardList } from 'lucide-react'
import { useMyFeedbackAssignments } from '../../hooks/useMyFeedbackAssignments'

const TYPE_LABEL = {
    SELF:          'Autoevaluación',
    PEER:          'Par',
    LEADER:        'A tu equipo',
    DIRECT_REPORT: 'A tu líder',
}

const TYPE_STYLE = {
    SELF:          'bg-brand-pale text-brand',
    PEER:          'bg-slate-100 text-slate-500',
    LEADER:        'bg-violet-100 text-violet-600',
    DIRECT_REPORT: 'bg-amber-100 text-amber-700',
}

function EvaluationCard({ assignment }) {
    const evaluated = assignment.evaluated
    const name = evaluated
        ? `${evaluated.firstName ?? ''} ${evaluated.lastName ?? ''}`.trim()
        : '—'
    const isDone = assignment.status === 'COMPLETED'

    return (
        <div className={`bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between gap-4
            ${isDone ? 'border-emerald-200 opacity-60' : 'border-brand-light'}`}>

            {/* Info */}
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                        ${TYPE_STYLE[assignment.type] ?? 'bg-slate-100 text-slate-500'}`}>
                        {TYPE_LABEL[assignment.type] ?? assignment.type}
                    </span>
                    {assignment.cycle?.name && (
                        <span className="text-xs text-slate-400 truncate">{assignment.cycle.name}</span>
                    )}
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                {evaluated?.position && (
                    <p className="text-xs text-slate-400 mt-0.5">{evaluated.position}</p>
                )}
            </div>

            {/* Action */}
            {isDone ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 shrink-0">
                    <CheckCircle2 size={14} />
                    Completada
                </span>
            ) : (
                <Link
                    to={`/responseform360?surveyId=${assignment.cycleId}&employeeId=${assignment.evaluator?.id}&assignmentId=${assignment.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand
                               hover:bg-brand-hover px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                    <Clock size={12} />
                    Evaluar
                </Link>
            )}
        </div>
    )
}

export default function MyEvaluations() {
    const { user }   = useSelector((s) => s.auth)
    const { data: assignments = [], isLoading, isError } = useMyFeedbackAssignments(user?.employeeId)

    const pending   = useMemo(() => assignments.filter(a => a.status === 'PENDING'),   [assignments])
    const completed = useMemo(() => assignments.filter(a => a.status === 'COMPLETED'), [assignments])

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Mis evaluaciones</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Evaluaciones de Feedback 360° asignadas para completar
                </p>
            </div>

            {isLoading && (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-400 text-center py-10">
                    No se pudieron cargar las evaluaciones.
                </p>
            )}

            {!isLoading && !isError && assignments.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <ClipboardList size={24} className="text-brand" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Sin evaluaciones asignadas</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Cuando RR.HH. lance un ciclo de Feedback 360° aparecerán aquí.
                        </p>
                    </div>
                </div>
            )}

            {/* Pending */}
            {pending.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Pendientes ({pending.length})
                    </h2>
                    {pending.map(a => <EvaluationCard key={a.id} assignment={a} />)}
                </section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Completadas ({completed.length})
                    </h2>
                    {completed.map(a => <EvaluationCard key={a.id} assignment={a} />)}
                </section>
            )}

        </main>
    )
}
