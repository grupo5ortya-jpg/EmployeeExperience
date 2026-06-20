import { useEffect, useMemo, useState } from 'react'
import { X, Save, Trash2, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { useSkills, useCreateSkill, useDeleteSkill } from '../hooks/useSkills'
import { useDepartments } from '../../../hooks/useDepartments'
import { useUpdateJobOpening } from '../hooks/useUpdateJobOpening'
import { useCreateJobOpening } from '../hooks/useCreateJobOpening'
import IconButton from '../../../components/ui/IconButton'
import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

const INITIAL = {
    title: '',
    description: '',
    departmentId: '',
}

const NEW_SKILL_INITIAL = { name: '', type: 'hard' }

const DEFAULT_SKILL_LEVELS = [
    { order: 1, name: 'Beginner' },
    { order: 2, name: 'Junior' },
    { order: 3, name: 'Semi Senior' },
    { order: 4, name: 'Senior' },
    { order: 5, name: 'Expert' },
]

export default function CreateJobOpeningModal({ isOpen, onClose }) {
    const { data: departments = [] } = useDepartments()
    const { data: skills = [] } = useSkills()
    const { mutateAsync: createJobOpening } = useCreateJobOpening()
    const { mutateAsync: createSkill, isPending: creatingSkill } = useCreateSkill()
    const { mutateAsync: deleteSkill, isPending: deletingSkill } = useDeleteSkill()

    const [form, setForm] = useState(INITIAL)
    const [selectedSkills, setSelectedSkills] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [newSkill, setNewSkill] = useState(NEW_SKILL_INITIAL)
    const [newSkillError, setNewSkillError] = useState('')
    const [deleteSkillError, setDeleteSkillError] = useState('')

    const availableSkills = useMemo(() => {
        return skills.filter(
            (s) => !selectedSkills.some((x) => x.skill_id === s.id)
        )
    }, [skills, selectedSkills])

    const getSkillLevels = (skillId) => {
        const skill = skills.find((s) => s.id === skillId)
        return Array.isArray(skill?.levels) && skill.levels.length
            ? skill.levels
            : [
                  { order: 1, name: 'Beginner' },
                  { order: 2, name: 'Junior' },
                  { order: 3, name: 'Semi Senior' },
                  { order: 4, name: 'Senior' },
                  { order: 5, name: 'Expert' },
              ]
    }

    const getDefaultRequiredLevel = (skill) => {
        const levels = Array.isArray(skill?.levels) ? skill.levels : []
        if (!levels.length) return 3
        const orders = levels
            .map((level) => Number(level.order))
            .filter(Number.isInteger)
            .sort((a, b) => a - b)
        return orders[0] ?? 3
    }

    useEffect(() => {
        if (!isOpen) {
            setForm(INITIAL)
            setSelectedSkills([])
            setError('')
            setNewSkill(NEW_SKILL_INITIAL)
            setNewSkillError('')
        }
    }, [isOpen])

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const addSkill = (skill) => {
        setSelectedSkills((prev) => [
            ...prev,
            {
                skill_id: skill.id,
                name: skill.name,
                required_level: getDefaultRequiredLevel(skill),
                levels: skill.levels || [],
            },
        ])
    }

    const updateLevel = (skill_id, level) => {
        setSelectedSkills((prev) =>
            prev.map((s) =>
                s.skill_id === skill_id ? { ...s, required_level: Number(level) } : s
            )
        )
    }

    const removeSkill = (skill_id) => {
        setSelectedSkills((prev) => prev.filter((s) => s.skill_id !== skill_id))
    }

    const handleNewSkillChange = (e) => {
        setNewSkill((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const handleCreateSkill = async () => {
        const name = newSkill.name.trim()
        if (!name) return

        if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
            setNewSkillError('Ya existe una skill con ese nombre')
            return
        }

        setNewSkillError('')
        try {
            await createSkill({ name, type: newSkill.type, levels: DEFAULT_SKILL_LEVELS })
            setNewSkill(NEW_SKILL_INITIAL)
        } catch (err) {
            setNewSkillError('No se pudo crear la skill')
            console.error(err)
        }
    }

    const handleDeleteSkill = async (skill) => {
        if (!window.confirm(`¿Eliminar la skill "${skill.name}"? Esta acción no se puede deshacer.`)) return
        setDeleteSkillError('')
        try {
            await deleteSkill(skill.id)
        } catch (err) {
            setDeleteSkillError(err.response?.data?.error ?? 'No se pudo eliminar la skill.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Una vacante sin skills requeridas no tiene sentido — exigir al menos una.
        if (selectedSkills.length === 0) {
            setError('Tenés que seleccionar al menos una skill requerida.')
            return
        }

        setLoading(true)
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
                        <p className="text-sm font-semibold mb-2">
                            Skills requeridas <span className="text-red-500">*</span>
                        </p>

                        {/* Crear nueva skill */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b">
                            <input
                                name="name"
                                placeholder="Nueva skill"
                                value={newSkill.name}
                                onChange={handleNewSkillChange}
                                className="border rounded px-2 py-1 text-xs flex-1 min-w-35"
                            />
                            <select
                                name="type"
                                value={newSkill.type}
                                onChange={handleNewSkillChange}
                                className="border rounded px-2 py-1 text-xs"
                            >
                                <option value="hard">Hard</option>
                                <option value="soft">Soft</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleCreateSkill}
                                disabled={creatingSkill || !newSkill.name.trim()}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-brand text-white
                                           hover:bg-brand-hover disabled:opacity-50"
                            >
                                <Plus size={12} />
                                {creatingSkill ? 'Creando...' : 'Crear skill'}
                            </button>
                            {newSkillError && (
                                <span className="text-xs text-red-500 w-full">{newSkillError}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {availableSkills.map((s) => (
                                <div key={s.id} className="flex items-center border rounded overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => addSkill(s)}
                                        className="text-xs px-2 py-1 hover:bg-slate-100"
                                    >
                                        + {s.name}
                                    </button>
                                    <IconButton
                                        icon={Trash2}
                                        variant="danger"
                                        size={12}
                                        disabled={deletingSkill}
                                        title="Eliminar skill permanentemente"
                                        onClick={() => handleDeleteSkill(s)}
                                    />
                                </div>
                            ))}
                        </div>
                        {deleteSkillError && (
                            <p className="text-xs text-red-500 mb-2">{deleteSkillError}</p>
                        )}

                        <div className="flex flex-col gap-2">
                            {selectedSkills.map((s) => (
                                <div
                                    key={s.skill_id}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span className="text-sm flex-1">{s.name}</span>

                                    <select
                                        value={s.required_level}
                                        onChange={(e) =>
                                            updateLevel(s.skill_id, e.target.value)
                                        }
                                        className={`text-xs px-2 py-1 rounded ${getSkillLevelStyle(
                                            s.required_level
                                        )}`}
                                    >
                                        {(s.levels?.length ? s.levels : getSkillLevels(s.skill_id)).map(
                                            (level) => (
                                                <option key={level.order} value={level.order}>
                                                    {level.name || level.order}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => removeSkill(s.skill_id)}
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
                        disabled={loading || selectedSkills.length === 0}
                        className="bg-brand text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creando...' : 'Crear vacante'}
                    </button>

                </form>
            </div>
        </div>
    )
}