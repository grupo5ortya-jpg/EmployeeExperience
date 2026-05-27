import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Building2, CalendarRange, Lock,
    ShieldCheck, HelpCircle,
} from 'lucide-react'

import { useSurveyById } from '../../hooks/useSurveyById'
import { COMPETENCY_MAP, countQuestions } from './constants/competencies'
import { useFeedbackParticipants } from './hooks/useFeedbackParticipants'
import { QuestionList } from './components/QuestionList'
import { ParticipantsSection } from './components/ParticipantsSection'

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

    // Participantes del departamento del ciclo (hook cachea useEmployees globalmente)
    const { participants } = useFeedbackParticipants(survey?.department?.id ?? null)

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
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
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
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5">
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
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                                    flex items-center justify-between shrink-0">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Preguntas del ciclo ({totalQuestions})
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50
                                        border border-green-200 px-2.5 py-1 rounded-full">
                            <ShieldCheck size={11} />
                            Respuestas anónimas
                        </div>
                    </div>

                    <div className="overflow-auto flex-1 min-h-0 divide-y divide-brand-light">
                        <QuestionList competencyIds={competencies} variant="detail" />
                    </div>
                </div>
            )}

            {/* ── Participantes ─────────────────────────── */}
            <ParticipantsSection survey={survey} participants={participants} />

        </main>
    )
}
