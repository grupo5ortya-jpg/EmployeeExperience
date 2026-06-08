import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { useSkills } from '../../jobOpenings/hooks/useSkills'
import { useCreateCourse, useUpdateCourse } from '../../../hooks/useLearning'

const MODALITIES = ['Online', 'Presencial', 'Híbrida']

const emptyForm = { title: '', description: '', duration: '', modality: 'Online', link: '', skillId: '' }

export default function CourseFormModal({ isOpen, onClose, course }) {
    const { data: skills = [] } = useSkills()
    const { mutateAsync: createCourse, isPending: isCreating } = useCreateCourse()
    const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourse()

    const [form, setForm] = useState(emptyForm)

    useEffect(() => {
        if (course) {
            setForm({
                title: course.title ?? '',
                description: course.description ?? '',
                duration: course.duration ?? '',
                modality: course.modality ?? 'Online',
                link: course.link ?? '',
                skillId: course.skill?.id ?? '',
            })
        } else {
            setForm(emptyForm)
        }
    }, [course, isOpen])

    if (!isOpen) return null

    const isSaving = isCreating || isUpdating

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            duration: form.duration.trim() || null,
            modality: form.modality,
            link: form.link.trim() || null,
            skillId: form.skillId || null,
        }

        if (course) {
            await updateCourse({ id: course.id, payload })
        } else {
            await createCourse(payload)
        }
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-xl border">

                <div className="flex justify-between items-center px-5 py-4 border-b">
                    <h2 className="font-semibold text-slate-800">{course ? 'Editar curso' : 'Nuevo curso'}</h2>
                    <button onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
                    <input
                        required
                        placeholder="Título"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                    />

                    <textarea
                        required
                        placeholder="Descripción"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                        rows={3}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="Duración (ej. 12 horas)"
                            value={form.duration}
                            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                            className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                        />

                        <select
                            value={form.modality}
                            onChange={(e) => setForm((p) => ({ ...p, modality: e.target.value }))}
                            className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white"
                        >
                            {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <select
                        value={form.skillId}
                        onChange={(e) => setForm((p) => ({ ...p, skillId: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white"
                    >
                        <option value="">Sin skill asociada</option>
                        {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <input
                        placeholder="Link del curso"
                        value={form.link}
                        onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                    />

                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-3 py-2 border rounded-lg text-sm">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-3 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
