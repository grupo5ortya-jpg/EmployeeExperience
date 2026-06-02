import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Building2, CalendarRange, Lock,
    ShieldCheck, HelpCircle, CheckCircle2, Clock, Users2, BarChart2,
} from 'lucide-react'

import { useSurveyById }          from '../../hooks/useSurveyById'
import { COMPETENCY_MAP, countQuestions } from './competencyConfig'
import { useFeedbackParticipants }        from './hooks/useFeedbackParticipants'
import { useFeedbackAssignments }         from '../../hooks/useFeedbackAssignments'
import { QuestionList }           from './components/QuestionList'
import { ParticipantsSection }    from './components/ParticipantsSection'

/* ─── Helpers ───────────────────────────────────────────────── */
function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

/* ─── Skeleton de carga ─────────────────────────────────────── */
function PageSkeleton() {
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-32 bg-slate-200 rounded-xl" />
                <div className="h-40 bg-slate-200 rounded-xl" />
                <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
        </main>
    )
}

/* ─── Página ─────────────────────────────────────────────────── */
export default function FeedbackDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: survey, isLoading, isError } = useSurveyById(id)
    const { participants }      = useFeedbackParticipants(survey?.department?.id ?? null)
    const { data: assignments = [], isLoading: loadingAssignments } = useFeedbackAssignments(id)

    // Group assignments by evaluator for display
    const byEvaluator = assignments.reduce((acc, a) => {
        const key = a.evaluator?.id ?? 'unknown'
        if (!acc[key]) acc[key] = { evaluator: a.evaluator, items: [] }
        acc[key].items.push(a)
        return acc
    }, {})

    // Unique evaluated employees (for HR results links)
    const evaluatedEmployees = Object.values(
        assignments.reduce((acc, a) => {
            if (a.evaluated?.id) acc[a.evaluated.id] = a.evaluated
            return acc
        }, {})
    )

    if (isLoading) return <PageSkeleton />

    if (isError || !survey) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <p className="text-sm text-red-400">No se pudo cargar el ciclo de evaluación.</p>
            </main>
        )
    }

    const competencies = survey.competencies ?? []
    const totalQuestions = countQuestions(competencies)

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Volver */}
            <button
                onClick={() => navigate('/feedbackhome')}
                className="flex items-center gap-1.5 text-xs font-medium text-brand
                           hover:text-brand-hover transition-colors w-fit cursor-pointer"
            >
                <ArrowLeft size={14} />
                Volver a ciclos
            </button>

            {/* ── Header del ciclo ──────────────────────── */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                <div className="h-1 bg-brand" />
                <div className="p-5">

                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-slate-800 truncate">{survey.name}</h1>
                            {survey.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">
                                    {survey.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand
                                        bg-brand-pale px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap">
                            <HelpCircle size={13} />
                            {totalQuestions} {totalQuestions === 1 ? 'pregunta' : 'preguntas'}
                        </div>
                    </div>

                    {/* Metadatos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-brand-light">

                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-brand-pale flex items-center justify-center shrink-0">
                                <Building2 size={13} className="text-brand" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Departamento</p>
                                <p className="text-xs font-semibold text-slate-700">
                                    {survey.department?.name ?? '—'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-brand-pale flex items-center justify-center shrink-0">
                                <CalendarRange size={13} className="text-brand" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Período</p>
                                <p className="text-xs font-semibold text-slate-700">
                                    {survey.startDate || survey.endDate
                                        ? `${formatDate(survey.startDate)} — ${formatDate(survey.endDate)}`
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                <Lock size={13} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Respuestas anónimas mínimas</p>
                                <p className="text-xs font-semibold text-slate-700">
                                    {survey.minAnonymousResponses ?? '—'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Competencias evaluadas ────────────────── */}
            {competencies.length > 0 && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 shrink-0">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Competencias evaluadas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {competencies.map((cId) => {
                            const meta = COMPETENCY_MAP[cId]
                            if (!meta) return null
                            const { Icon, label } = meta
                            return (
                                <span
                                    key={cId}
                                    className="flex items-center gap-1.5 bg-brand-pale border border-brand/20
                                               text-brand text-xs font-semibold px-3 py-1.5 rounded-full"
                                >
                                    <Icon size={11} strokeWidth={2} />
                                    {label}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ── Preguntas del ciclo ───────────────────── */}
            {totalQuestions > 0 && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                                    flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Preguntas del ciclo ({totalQuestions})
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50
                                        border border-green-200 px-2.5 py-1 rounded-full">
                            <ShieldCheck size={11} />
                            Respuestas anónimas
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-brand-light">
                        <QuestionList competencyIds={competencies} variant="detail" />
                    </div>
                </div>
            )}

            {/* ── Participantes ─────────────────────────── */}
            <div className="shrink-0">
                <ParticipantsSection survey={survey} participants={participants} />
            </div>

            {/* ── Evaluaciones generadas ───────────────── */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                                flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users2 size={13} className="text-brand" />
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Evaluaciones generadas
                        </h2>
                    </div>
                    {assignments.length > 0 && (
                        <span className="text-xs text-slate-400">
                            {assignments.filter(a => a.status === 'COMPLETED').length} / {assignments.length} completadas
                        </span>
                    )}
                </div>

                <div className="p-5">
                    {loadingAssignments && (
                        <div className="animate-pulse space-y-3">
                            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
                        </div>
                    )}

                    {!loadingAssignments && assignments.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-6">
                            {survey?.department
                                ? 'No se generaron evaluaciones. Verificá que haya empleados activos en el departamento con líder asignado.'
                                : 'Este ciclo no tiene departamento — las evaluaciones no se generan automáticamente.'}
                        </p>
                    )}

                    {!loadingAssignments && assignments.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {Object.values(byEvaluator).map(({ evaluator, items }) => {
                                const name = evaluator
                                    ? `${evaluator.firstName ?? ''} ${evaluator.lastName ?? ''}`.trim()
                                    : '—'
                                const allDone = items.every(i => i.status === 'COMPLETED')

                                return (
                                    <div key={evaluator?.id} className="rounded-lg border border-brand-light overflow-hidden">
                                        {/* Evaluator header */}
                                        <div className={`px-4 py-2.5 flex items-center justify-between
                                            ${allDone ? 'bg-emerald-50' : 'bg-brand-pale/40'}`}>
                                            <div>
                                                <span className="text-sm font-semibold text-slate-700">{name}</span>
                                                {evaluator?.position && (
                                                    <span className="text-xs text-slate-400 ml-2">{evaluator.position}</span>
                                                )}
                                            </div>
                                            {allDone && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                    <CheckCircle2 size={11} />
                                                    Todo completado
                                                </span>
                                            )}
                                        </div>

                                        {/* Assignment rows */}
                                        <ul className="divide-y divide-brand-light">
                                            {items.map((a) => {
                                                const evalName = a.evaluated
                                                    ? `${a.evaluated.firstName ?? ''} ${a.evaluated.lastName ?? ''}`.trim()
                                                    : '—'
                                                return (
                                                    <li key={a.id}
                                                        className="px-4 py-2.5 flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0
                                                                ${a.type === 'SELF'
                                                                    ? 'bg-brand-pale text-brand'
                                                                    : 'bg-slate-100 text-slate-500'}`}>
                                                                {a.type}
                                                            </span>
                                                            <span className="text-sm text-slate-600 truncate">{evalName}</span>
                                                        </div>
                                                        {a.status === 'COMPLETED' ? (
                                                            <span className="flex items-center gap-1 text-xs font-semibold
                                                                             text-emerald-600 shrink-0">
                                                                <CheckCircle2 size={11} />
                                                                Completada
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                                                    <Clock size={11} />
                                                                    Pendiente
                                                                </span>
                                                                <Link
                                                                    to={`/responseform360?surveyId=${a.cycleId}&employeeId=${a.evaluator?.id}&assignmentId=${a.id}`}
                                                                    className="text-xs font-semibold text-brand hover:text-brand-hover
                                                                               underline underline-offset-2 transition-colors"
                                                                >
                                                                    Ir al formulario →
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Resultados por empleado evaluado ─────── */}
            {evaluatedEmployees.length > 0 && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40 flex items-center gap-2">
                        <BarChart2 size={13} className="text-brand" />
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Resultados por empleado
                        </h2>
                    </div>
                    <ul className="divide-y divide-brand-light">
                        {evaluatedEmployees.map((emp) => {
                            const name = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim()
                            return (
                                <li key={emp.id}
                                    className="px-5 py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{name}</p>
                                        {emp.position && (
                                            <p className="text-xs text-slate-400">{emp.position}</p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/hrfeedbackreport?cycleId=${id}&evaluatedId=${emp.id}`}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-brand
                                                   hover:text-brand-hover bg-brand-pale hover:bg-brand-light
                                                   px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                    >
                                        <BarChart2 size={12} />
                                        Ver resultados
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

        </main>
    )
}
