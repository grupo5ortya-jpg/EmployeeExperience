import { X, Briefcase, Building2, BrainCircuit } from 'lucide-react'

import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

export default function JobOpeningDetailModal({
    jobOpening,
    onClose,
}) {
    if (!jobOpening) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy/40 backdrop-blur-sm py-6 px-4">

            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-3xl">

                {/* HEADER */}
                <div className="flex justify-between px-6 py-4 border-b border-brand-light">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-brand" />
                        <div>
                            <h2 className="font-bold text-slate-800">
                                {jobOpening.title}
                            </h2>
                            <p className="text-xs text-slate-400">
                                Detalle de vacante
                            </p>
                        </div>
                    </div>

                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-6 py-5 flex flex-col gap-6">

                    <div>
                        <h3 className="text-xs font-semibold text-slate-400">
                            Área
                        </h3>
                        <p>{jobOpening.department?.name}</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-400">
                            Descripción
                        </h3>
                        <p className="text-sm text-slate-600">
                            {jobOpening.description}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-400">
                            Skills
                        </h3>

                        <div className="grid gap-2">
                            {jobOpening.skills?.map(s => {
                                const level =
                                    s.JobOpeningSkill?.requiredLevel

                                return (
                                    <div
                                        key={s.id}
                                        className="flex justify-between border p-3 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <BrainCircuit size={14} />
                                            {s.name}
                                        </div>

                                        <span className={`text-xs px-2 py-1 rounded-full ${getSkillLevelStyle(level)}`}>
                                            {getSkillLevelLabel(level)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-brand-light flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-sm text-slate-500 hover:text-slate-700"
                    >
                        Cerrar
                    </button>
                </div>

            </div>

        </div>
    )
}