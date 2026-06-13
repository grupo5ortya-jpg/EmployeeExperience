import { useState } from 'react'
import { X } from 'lucide-react'

import { useSkills } from '../../jobOpenings/hooks/useSkills'
import { useCreateExternalCertification } from '../../../hooks/useLearning'

const MODALITIES = ['Online', 'Presencial', 'Híbrida']

const emptyForm = { title: '', duration: '', modality: 'Online', skillId: '', institution: '', certificateLink: '' }

export default function ExternalCertificationModal({ isOpen, onClose, employeeId }) {
    const { data: skills = [] } = useSkills()
    const { mutateAsync: createExternalCertification, isPending } = useCreateExternalCertification()

    const [form, setForm] = useState(emptyForm)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        await createExternalCertification({
            employeeId,
            title: form.title.trim(),
            duration: form.duration.trim() || null,
            modality: form.modality,
            skillId: form.skillId || null,
            institution: form.institution.trim() || null,
            certificateLink: form.certificateLink.trim(),
        })
        setForm(emptyForm)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-xl border">

                <div className="flex justify-between items-center px-5 py-4 border-b">
                    <h2 className="font-semibold text-slate-800">Subir certificación externa</h2>
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
                        placeholder="Institución (opcional)"
                        value={form.institution}
                        onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                    />

                    <input
                        required
                        type="url"
                        placeholder="Diploma URL"
                        value={form.certificateLink}
                        onChange={(e) => setForm((p) => ({ ...p, certificateLink: e.target.value }))}
                        className="border border-brand-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                    />

                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="px-3 py-2 border rounded-lg text-sm">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-3 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Enviar a revisión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
