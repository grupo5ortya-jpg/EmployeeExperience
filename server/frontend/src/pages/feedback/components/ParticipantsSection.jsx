import { useState } from 'react'
import { Users, ShieldCheck, Lock, Building2 } from 'lucide-react'
import { ParticipantsModal } from './ParticipantsModal'

/**
 * Tarjeta de "Participantes del ciclo" de FeedbackDetailPage.
 * Incluye las 3 cajas informativas y el botón que abre ParticipantsModal.
 *
 * @param {{ survey: object, participants: object[] }} props
 */
export function ParticipantsSection({ survey, participants }) {
    const [showModal, setShowModal] = useState(false)

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

            {/* Header de la sección */}
            <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                            flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Participantes del ciclo
                </h2>
                {participants.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand
                                   hover:text-brand-hover transition-colors cursor-pointer"
                    >
                        <Users size={13} />
                        Ver participantes
                    </button>
                )}
            </div>

            <div className="p-5 flex flex-col gap-3">

                {/* Advertencia si no hay departamento */}
                {!survey.department && (
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200
                                    rounded-xl px-4 py-3.5">
                        <Building2 size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-snug">
                            Este ciclo no tiene un departamento asignado.
                            Los participantes no se generan automáticamente.
                        </p>
                    </div>
                )}

                {/* Cajas de información */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* Cantidad */}
                    <div className="flex items-center gap-3 bg-brand-pale/50 border border-brand/10
                                    rounded-xl p-4">
                        <div className="w-9 h-9 rounded-lg bg-brand-pale flex items-center
                                        justify-center shrink-0">
                            <Users size={16} className="text-brand" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Participantes</p>
                            <p className="text-2xl font-extrabold text-brand leading-none mt-0.5">
                                {survey.department ? participants.length : '—'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-tight">
                                {survey.department
                                    ? `del dep. ${survey.department.name}`
                                    : 'sin departamento'}
                            </p>
                        </div>
                    </div>

                    {/* Generación automática */}
                    <div className="flex items-start gap-3 bg-green-50/70 border border-green-200/60
                                    rounded-xl p-4">
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center
                                        justify-center shrink-0 mt-0.5">
                            <ShieldCheck size={16} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Generación</p>
                            <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">
                                Las evaluaciones se generan automáticamente al lanzar el ciclo
                            </p>
                        </div>
                    </div>

                    {/* Anonimato */}
                    <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/60
                                    rounded-xl p-4">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center
                                        justify-center shrink-0 mt-0.5">
                            <Lock size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Anonimato</p>
                            <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">
                                {survey.minAnonymousResponses
                                    ? `Resultados visibles desde ${survey.minAnonymousResponses} respuestas`
                                    : 'Sin mínimo de respuestas configurado'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal de participantes */}
            {showModal && (
                <ParticipantsModal
                    employees={participants}
                    departmentName={survey.department?.name}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}
