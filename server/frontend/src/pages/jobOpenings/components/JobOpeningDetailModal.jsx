import { useEffect, useMemo, useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { useSkills } from '../hooks/useSkills'
import { useDepartments } from '../../../hooks/useDepartments'
import { useUpdateJobOpening } from '../hooks/useUpdateJobOpening'

import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

export default function JobOpeningDetailModal({
    isOpen,
    onClose,
    job,
}) {
    const { mutateAsync: updateJobOpening } = useUpdateJobOpening()

    const [form, setForm] = useState(null)

    useEffect(() => {
        if (job) {
            setForm({
                title: job.title,
                description: job.description,
                departmentId: job.departmentId,
                skills: job.skills?.map((s) => ({
                    skillId: s.id,
                    name: s.name,
                    requiredLevel: s.JobOpeningSkill?.requiredLevel ?? 3,
                })) || [],
            })
        }
    }, [job])

    if (!isOpen || !form) return null

    const updateSkillLevel = (skillId, level) => {
        setForm((prev) => ({
            ...prev,
            skills: prev.skills.map((s) =>
                s.skillId === skillId
                    ? { ...s, requiredLevel: Number(level) }
                    : s
            ),
        }))
    }

    const handleSave = async () => {
        await updateJobOpening({
            id: job.id,
            payload: {
                title: form.title,
                description: form.description,
                skills: form.skills,
            },
        })

        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

            <div className="bg-white w-full max-w-2xl rounded-xl border">

                {/* HEADER */}
                <div className="flex justify-between px-5 py-4 border-b">
                    <h2 className="font-semibold">Detalle vacante</h2>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-5 flex flex-col gap-4">

                    <input
                        value={form.title}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, title: e.target.value }))
                        }
                        className="border px-3 py-2 rounded"
                    />

                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, description: e.target.value }))
                        }
                        className="border px-3 py-2 rounded"
                    />

                    {/* SKILLS */}
                    <div className="border rounded p-3">
                        <p className="text-sm font-semibold mb-2">
                            Skills requeridas
                        </p>

                        {form.skills.map((s) => (
                            <div
                                key={s.skillId}
                                className="flex items-center justify-between mb-2"
                            >
                                <span className="text-sm">{s.name}</span>

                                <select
                                    value={s.requiredLevel}
                                    onChange={(e) =>
                                        updateSkillLevel(s.skillId, e.target.value)
                                    }
                                    className={`text-xs px-2 py-1 rounded ${getSkillLevelStyle(
                                        s.requiredLevel
                                    )}`}
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>
                                            {getSkillLevelLabel(n)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-2 border rounded"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-3 py-2 bg-brand text-white rounded"
                        >
                            Guardar cambios
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}