import { useState, useMemo }      from 'react'
import { useSearchParams, Link }  from 'react-router-dom'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

import { useSurveyById }           from '../../hooks/useSurveyById'
import { useFeedback360Questions } from './hooks/useFeedback360Questions'
import { COMPETENCY_MAP }          from './competencyConfig'
import { submitResponse, completeAssignment, completeFeedbackAssignment } from '../../services/feedback360Service'

/* ── Scale input 1–5 ─────────────────────────────────────────── */
const SCALE_LABELS = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' }

function ScaleInput({ questionId, value, onChange }) {
    return (
        <div className="flex gap-2 flex-wrap mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(questionId, n)}
                    title={SCALE_LABELS[n]}
                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-colors
                        ${value === n
                            ? 'bg-brand border-brand text-white'
                            : 'bg-white border-brand-light text-slate-500 hover:border-brand hover:text-brand'}`}
                >
                    {n}
                </button>
            ))}
            {value && (
                <span className="self-center text-xs text-slate-400 ml-1">
                    {SCALE_LABELS[value]}
                </span>
            )}
        </div>
    )
}

/* ── Página ──────────────────────────────────────────────────── */
export default function ResponseForm360() {
    const [searchParams]  = useSearchParams()
    const surveyId        = searchParams.get('surveyId')
    const employeeId      = searchParams.get('employeeId')
    const assignmentId    = searchParams.get('assignmentId')  // FeedbackAssignment id

    const [answers,   setAnswers]   = useState({})   // { [questionId]: score (1-5) }
    const [submitting, setSubmitting] = useState(false)
    const [error,      setError]      = useState('')
    const [done,       setDone]       = useState(false)

    const { data: survey,  isLoading: loadingSurvey }    = useSurveyById(surveyId)
    const competencies = survey?.competencies ?? []
    const { data: groups = [], isLoading: loadingQ } = useFeedback360Questions(competencies)

    const allQuestions = useMemo(
        () => groups.flatMap((g) => g.questions),
        [groups],
    )

    const isLoading    = loadingSurvey || loadingQ
    const answeredCount = Object.keys(answers).length
    const canSubmit    = !submitting && answeredCount === allQuestions.length && allQuestions.length > 0

    function handleScale(questionId, value) {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            // Mark the assignment as completed
            if (assignmentId) {
                // Auto-generated FeedbackAssignment flow
                await completeFeedbackAssignment(assignmentId)
            } else {
                // Manual SurveyAssignment flow (pulse / legacy)
                await Promise.all(
                    allQuestions.map((q) =>
                        submitResponse({
                            surveyAssignmentId: surveyId,
                            questionId:         q.id,
                            numericValue:       answers[q.id],
                        }),
                    ),
                )
                await completeAssignment({ surveyId, employeeId })
            }
            setDone(true)
        } catch {
            setError('Hubo un error al enviar. Verificá tu conexión e intentá de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    /* ── Success state ───────────────────────────────────────── */
    if (done) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-slate-800">¡Evaluación enviada!</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Tus respuestas fueron guardadas correctamente.
                        </p>
                    </div>
                    <Link
                        to="/feedbackhome"
                        className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                    >
                        ← Volver a ciclos
                    </Link>
                </div>
            </main>
        )
    }

    /* ── Loading ─────────────────────────────────────────────── */
    if (isLoading) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                    <div className="h-28 bg-slate-200 rounded-xl" />
                    <div className="h-64 bg-slate-200 rounded-xl" />
                </div>
            </main>
        )
    }

    if (!surveyId || !employeeId || !survey) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <p className="text-sm text-red-400">Parámetros inválidos.</p>
            </main>
        )
    }

    /* ── Form ────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div>
                <Link
                    to="/feedbackhome"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors w-fit mb-3"
                >
                    <ArrowLeft size={13} />
                    Volver a ciclos
                </Link>
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">{survey.name}</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Evaluá cada competencia con una puntuación del 1 al 5.
                        {allQuestions.length > 0 && (
                            <span className="ml-1">
                                ({answeredCount}/{allQuestions.length} respondidas)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Questions grouped by competency */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {groups.map((group) => {
                    const meta = COMPETENCY_MAP[group.competencyId]
                    if (!meta || group.questions.length === 0) return null
                    const { Icon, label } = meta

                    return (
                        <section
                            key={group.competencyId}
                            className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden"
                        >
                            {/* Competency header */}
                            <div className="px-5 py-3 bg-brand-pale/40 border-b border-brand-light
                                            flex items-center gap-2">
                                <Icon size={13} className="text-brand shrink-0" strokeWidth={2} />
                                <span className="text-xs font-bold text-brand uppercase tracking-wide">
                                    {label}
                                </span>
                            </div>

                            {/* Questions */}
                            <div className="divide-y divide-brand-light">
                                {group.questions.map((q) => (
                                    <div key={q.id} className="px-5 py-4">
                                        <p className="text-sm text-slate-700 leading-snug">{q.text}</p>
                                        <ScaleInput
                                            questionId={q.id}
                                            value={answers[q.id]}
                                            onChange={handleScale}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                })}

                {error && (
                    <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="self-end bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                               px-6 py-2.5 rounded-lg transition-colors cursor-pointer
                               disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Enviando...' : 'Enviar evaluación'}
                </button>
            </form>

        </main>
    )
}
