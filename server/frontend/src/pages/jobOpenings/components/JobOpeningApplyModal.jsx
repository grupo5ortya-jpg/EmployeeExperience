import { useEffect, useState } from 'react'
import { X, Send, Check } from 'lucide-react'
import { useSelector } from 'react-redux'

import { useApplyToJobOpening } from '../hooks/useApplyToJobOpening'

import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

const STATUS_LABEL = {
    open: 'Abierta',
    closed: 'Cerrada',
}

const STATUS_STYLE = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-slate-200 text-slate-600',
}

export default function JobOpeningApplyModal({ isOpen, onClose, job }) {
    const employeeId = useSelector((s) => s.auth.user?.employeeId)
    const { mutateAsync: apply, isPending, isSuccess, isError, error, reset } = useApplyToJobOpening()

    useEffect(() => {
        if (isOpen) reset()
    }, [isOpen, job, reset])

    if (!isOpen || !job) return null

    const handleApply = async () => {
        try {
            await apply({ id: job.id, employeeId })
        } catch {
            // El error se muestra debajo del botón vía isError/error
        }
    }

    const alreadyApplied = error?.response?.status === 409

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl border">

                {/* HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b">
                    <h2 className="font-semibold">Detalle vacante</h2>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-5 flex flex-col gap-4">

                    {/* STATUS */}
                    <div className="flex items-center justify-between border rounded p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Estado:</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLE[job.status]}`}>
                                {STATUS_LABEL[job.status] ?? job.status}
                            </span>
                        </div>
                        {job.department?.name && (
                            <span className="text-xs text-slate-400">{job.department.name}</span>
                        )}
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-slate-800">{job.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{job.description}</p>
                    </div>

                    {/* SKILLS */}
                    {job.skills?.length > 0 && (
                        <div className="border rounded p-3">
                            <p className="text-sm font-semibold mb-2">Skills requeridas</p>

                            {job.skills.map((s) => (
                                <div key={s.id} className="flex items-center justify-between mb-2 last:mb-0">
                                    <span className="text-sm">{s.name}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${getSkillLevelStyle(s.JobOpeningSkill?.required_level)}`}>
                                        {getSkillLevelLabel(s.JobOpeningSkill?.required_level)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FEEDBACK */}
                    {isSuccess && (
                        <p className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <Check size={14} />
                            ¡Tu postulación fue enviada! El equipo de Talento fue notificado.
                        </p>
                    )}
                    {isError && !isSuccess && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {alreadyApplied ? 'Ya te postulaste para esta vacante.' : 'Ocurrió un error al enviar tu postulación.'}
                        </p>
                    )}

                    {/* FOOTER */}
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-2 border rounded">
                            Cerrar
                        </button>

                        {job.status === 'open' && !isSuccess && (
                            <button
                                onClick={handleApply}
                                disabled={isPending || alreadyApplied}
                                className="flex items-center gap-2 px-3 py-2 bg-brand hover:bg-brand-hover text-white rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Send size={14} />
                                Inscribirme
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
