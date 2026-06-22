import { useState } from 'react'
import { X } from 'lucide-react'
import { okrStatusMeta } from '../okrUtils'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm
text-slate-700 placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

const labelCls = 'text-xs font-semibold text-slate-600'

const EMPTY_FORM = {
    title: '', description: '', responsibleEmployeeId: '', period: 'QUARTERLY',
    metricType: 'NUMBER', targetValue: '', currentValue: '0', dueDate: '', parentId: '',
}

const formFromOkr = (okr) => ({
    title:                 okr.title ?? '',
    description:           okr.description ?? '',
    responsibleEmployeeId: okr.responsible?.id ?? '',
    period:                okr.period ?? 'QUARTERLY',
    metricType:            okr.metricType ?? 'NUMBER',
    targetValue:           okr.targetValue ?? '',
    currentValue:          okr.currentValue ?? 0,
    dueDate:               okr.dueDate ?? '',
    parentId:              okr.parentId ?? '',
})

// `key={editing?.id ?? 'new'}` on the parent forces a remount when switching
// between create/edit or between different OKRs, so initial state is always fresh.
export default function OkrFormModal({ isOpen, onClose, employees, okrs, editing, onSubmit, loading }) {
    const [form, setForm] = useState(() => editing ? formFromOkr(editing) : EMPTY_FORM)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.responsibleEmployeeId || !form.targetValue) return
        setError('')

        const payload = {
            title:                 form.title,
            description:           form.description || null,
            responsibleEmployeeId: form.responsibleEmployeeId,
            period:                form.period,
            metricType:            form.metricType,
            targetValue:           Number(form.targetValue),
            currentValue:          Number(form.currentValue || 0),
            dueDate:               form.dueDate || null,
            parentId:              form.parentId || null,
        }

        try {
            await onSubmit(payload)
            onClose()
        } catch (err) {
            setError(err?.response?.data?.message ?? 'No se pudo guardar el objetivo.')
        }
    }

    // Only suggest active objectives as parent: not itself, not completed, not overdue/at-risk.
    // Keep the currently-assigned parent visible even if it later became inactive, so editing doesn't silently clear it.
    const parentOptions = okrs.filter((o) =>
        o.id !== editing?.id
        && (o.id === editing?.parentId || (o.status !== 'COMPLETED' && !o.isOverdue)))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light sticky top-0 bg-white">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            {editing ? 'Editar objetivo' : 'Nuevo objetivo'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Definí la meta, el responsable y la jerarquía
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Título</label>
                        <input
                            type="text" name="title" value={form.title} onChange={handleChange}
                            placeholder="Ej: Mejorar el onboarding"
                            className={inputCls} required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Descripción</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange}
                            rows={2} placeholder="Detalles del objetivo..."
                            className={`${inputCls} resize-none`}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Responsable</label>
                        <select name="responsibleEmployeeId" value={form.responsibleEmployeeId} onChange={handleChange} className={inputCls} required>
                            <option value="">Seleccioná un empleado...</option>
                            {employees.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.firstName} {e.lastName}{e.position ? ` · ${e.position}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Período</label>
                            <select name="period" value={form.period} onChange={handleChange} className={inputCls}>
                                <option value="QUARTERLY">Trimestral</option>
                                <option value="YEARLY">Anual</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Tipo de métrica</label>
                            <select name="metricType" value={form.metricType} onChange={handleChange} className={inputCls}>
                                <option value="NUMBER">Número</option>
                                <option value="PERCENTAGE">Porcentaje</option>
                                <option value="CURRENCY">Monto</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Valor objetivo</label>
                            <input
                                type="number" name="targetValue" value={form.targetValue} onChange={handleChange}
                                min="0" step="any" className={inputCls} required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Valor actual</label>
                            <input
                                type="number" name="currentValue" value={form.currentValue} onChange={handleChange}
                                min="0" step="any" className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Fecha límite</label>
                            <input
                                type="date" name="dueDate" value={form.dueDate ?? ''} onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Objetivo padre (opcional)</label>
                            <select name="parentId" value={form.parentId} onChange={handleChange} className={inputCls}>
                                <option value="">Sin padre</option>
                                {parentOptions.map((o) => (
                                    <option key={o.id} value={o.id}>{o.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {editing && (
                        <p className="text-xs text-slate-400">
                            El estado (<span className="font-semibold text-slate-500">{okrStatusMeta(editing.status).label}</span>)
                            se calcula automáticamente según el progreso y el tiempo transcurrido.
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-brand-light">
                        <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.responsibleEmployeeId || !form.targetValue}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear objetivo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
