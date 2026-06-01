import { useEffect, useMemo, useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { useSkills } from '../hooks/useSkills'
import { useDepartments } from '../../../hooks/useDepartments'
import { useUpdateJobOpening } from '../hooks/useUpdateJobOpening'
import { useCreateJobOpening } from '../hooks/useCreateJobOpening'
import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

const INITIAL = {
    title: '',
    description: '',
    departmentId: '',
}

export default function CreateJobOpeningModal({ isOpen, onClose }) {
    const { data: departments = [] } = useDepartments()
    const { data: skills = [] } = useSkills()
    const { mutateAsync: createJobOpening } = useCreateJobOpening()

    const [form, setForm] = useState(INITIAL)
    const [selectedSkills, setSelectedSkills] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const availableSkills = useMemo(() => {
        return skills.filter(
            (s) => !selectedSkills.some((x) => x.skillId === s.id)
        )
    }, [skills, selectedSkills])

    useEffect(() => {
        if (!isOpen) {
            setForm(INITIAL)
            setSelectedSkills([])
            setError('')
        }
    }, [isOpen])

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const addSkill = (skill) => {
        setSelectedSkills((prev) => [
            ...prev,
            {
                skillId: skill.id,
                name: skill.name,
                requiredLevel: 3,
            },
        ])
    }

    const updateLevel = (skillId, level) => {
        setSelectedSkills((prev) =>
            prev.map((s) =>
                s.skillId === skillId ? { ...s, requiredLevel: Number(level) } : s
            )
        )
    }

    const removeSkill = (skillId) => {
        setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await createJobOpening({
                ...form,
                skills: selectedSkills,
            })

            onClose()
        } catch (err) {
            setError('Error creando vacante')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl border border-brand-light shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center px-5 py-4 border-b">
                    <h2 className="font-semibold text-slate-800">
                        Crear vacante
                    </h2>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

                    <input
                        name="title"
                        placeholder="Título"
                        className="border rounded px-3 py-2"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Descripción"
                        className="border rounded px-3 py-2"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <select
                        name="departmentId"
                        className="border rounded px-3 py-2"
                        value={form.departmentId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Departamento</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    {/* SKILLS SELECTOR */}
                    <div className="border rounded p-3">
                        <p className="text-sm font-semibold mb-2">Skills requeridas</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {availableSkills.map((s) => (
                                <button
                                    type="button"
                                    key={s.id}
                                    onClick={() => addSkill(s)}
                                    className="text-xs px-2 py-1 border rounded hover:bg-slate-100"
                                >
                                    + {s.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2">
                            {selectedSkills.map((s) => (
                                <div
                                    key={s.skillId}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="text-sm flex-1">{s.name}</span>

                                    <select
                                        value={s.requiredLevel}
                                        onChange={(e) =>
                                            updateLevel(s.skillId, e.target.value)
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

                                    <button
                                        type="button"
                                        onClick={() => removeSkill(s.skillId)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        disabled={loading}
                        className="bg-brand text-white py-2 rounded"
                    >
                        {loading ? 'Creando...' : 'Crear vacante'}
                    </button>

                </form>
            </div>
        </div>
    )
}