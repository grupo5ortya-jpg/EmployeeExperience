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
                    skill_id: s.id,
                    name: s.name,
                    required_level: s.JobOpeningSkill?.required_level ?? 3,
                    levels: Array.isArray(s.levels) ? s.levels : [],
                })) || [],
            })
        }
    }, [job])

    if (!isOpen || !form) return null

    const updateSkillLevel = (skill_id, level) => {
        setForm((prev) => ({
            ...prev,
            skills: prev.skills.map((s) =>
                s.skill_id === skill_id
                    ? { ...s, required_level: Number(level) }
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
                                key={s.skill_id}
                                className="flex items-center justify-between mb-2"
                            >
                                <span className="text-sm">{s.name}</span>

                                <select
                                    value={s.required_level}
                                    onChange={(e) =>
                                        updateSkillLevel(s.skill_id, e.target.value)
                                    }
                                    className={`text-xs px-2 py-1 rounded ${getSkillLevelStyle(
                                        s.required_level
                                    )}`}
                                >
                                    {(s.levels?.length ? s.levels : [
                                        { order: 1, name: 'Beginner' },
                                        { order: 2, name: 'Junior' },
                                        { order: 3, name: 'Semi Senior' },
                                        { order: 4, name: 'Senior' },
                                        { order: 5, name: 'Expert' },
                                    ]).map((level) => (
                                        <option key={level.order} value={level.order}>
                                            {level.name || level.order}
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