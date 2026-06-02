import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    CalendarRange,
    User2,
    Shield,
    HeartHandshake,
    MessageSquareWarning,
} from 'lucide-react'

import { useContinuousFeedbackById } from './hooks/useContinuousFeedbackById'

function formatDate(dateStr) {
    if (!dateStr) return '—'

    return new Date(dateStr).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export default function ContinuousFeedbackDetail() {

    const navigate = useNavigate()

    const { id } = useParams()

    const {
        data: feedback,
        isLoading,
        isError,
    } = useContinuousFeedbackById(id)

    /* ───────────────────────────────────────────── */
    /* Loading                                       */
    /* ───────────────────────────────────────────── */

    if (isLoading) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-5 w-24 bg-slate-200 rounded" />
                    <div className="h-48 bg-slate-200 rounded-xl" />
                </div>
            </main>
        )
    }

    /* ───────────────────────────────────────────── */
    /* Error                                         */
    /* ───────────────────────────────────────────── */

    if (isError || !feedback) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6
                             flex items-center justify-center">

                <p className="text-sm text-red-400">
                    No se pudo cargar el feedback.
                </p>
            </main>
        )
    }

    const isRecognition = feedback.type === 'RECOGNITION'

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Back */}
            <button
                onClick={() => navigate('/continuous-feedback')}
                className="flex items-center gap-1.5 text-xs font-medium text-brand
                           hover:text-brand-hover transition-colors w-fit cursor-pointer"
            >
                <ArrowLeft size={14} />

                Volver a feedback continuo
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

                <div
                    className={`h-1 ${isRecognition
                        ? 'bg-green-500'
                        : 'bg-amber-500'
                        }`}
                />

                <div className="p-5 flex flex-col gap-5">

                    {/* Top */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">

                                {isRecognition ? (
                                    <HeartHandshake
                                        size={18}
                                        className="text-green-600 shrink-0"
                                    />
                                ) : (
                                    <MessageSquareWarning
                                        size={18}
                                        className="text-amber-600 shrink-0"
                                    />
                                )}

                                <h1 className="text-lg font-bold text-slate-800">
                                    {isRecognition
                                        ? 'Reconocimiento'
                                        : 'Sugerencia'}
                                </h1>
                            </div>

                            <p className="text-xs text-slate-400 mt-1">
                                Feedback emitido entre colaboradores
                            </p>
                        </div>

                        <div
                            className={`flex items-center gap-1.5 text-xs font-semibold
                            px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap
                            ${isRecognition
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                        >
                            {isRecognition
                                ? 'Reconocimiento'
                                : 'Sugerencia'}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-brand-light">

                        {/* Emitter */}
                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-brand-pale
                                            flex items-center justify-center shrink-0">

                                <User2
                                    size={16}
                                    className="text-brand"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Emisor
                                </p>

                                <p className="text-sm font-semibold text-slate-700">
                                    {feedback.is_anonymous
                                        ? 'Anónimo'
                                        : `${feedback.emitter?.firstName} ${feedback.emitter?.lastName}`}
                                </p>
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-brand-pale
                                            flex items-center justify-center shrink-0">

                                <Shield
                                    size={16}
                                    className="text-brand"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Destinatario
                                </p>

                                <p className="text-sm font-semibold text-slate-700">
                                    {feedback.receiver?.firstName} {feedback.receiver?.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-brand-pale
                                            flex items-center justify-center shrink-0">

                                <CalendarRange
                                    size={16}
                                    className="text-brand"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Fecha de emisión
                                </p>

                                <p className="text-sm font-semibold text-slate-700">
                                    {formatDate(feedback.createdAt)}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Message */}
                    <div className="pt-4 border-t border-brand-light">

                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Mensaje
                        </p>

                        <div className="bg-slate-50 border border-brand-light rounded-xl p-4">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {feedback.description}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
