import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { useEmployees } from '../../../hooks/useEmployees'
import { useStartOffboarding } from '../../../hooks/useOffboarding'
import Button from '../../../components/ui/Button'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm
text-slate-700 placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

const labelCls = 'text-xs font-semibold text-slate-600'

export default function StartOffboardingModal({ isOpen, onClose }) {
    const { data: employees = [] } = useEmployees()
    const { mutateAsync: start, isPending, error, reset } = useStartOffboarding()

    const [employeeId, setEmployeeId] = useState('')
    const [lastWorkingDay, setLastWorkingDay] = useState('')
    const [rehirable, setRehirable] = useState('true')
    const [exitType, setExitType] = useState('RESIGNATION')
    const [tags, setTags] = useState([])
    const [newTag, setNewTag] = useState('')

    if (!isOpen) return null

    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE')
    const isTermination = exitType === 'TERMINATION'

    const handleClose = () => {
        setEmployeeId('')
        setLastWorkingDay('')
        setRehirable('true')
        setExitType('RESIGNATION')
        setTags([])
        setNewTag('')
        reset()
        onClose()
    }

    const addTag = () => {
        const tag = newTag.trim()
        if (!tag || tags.includes(tag)) { setNewTag(''); return }
        setTags((prev) => [...prev, tag])
        setNewTag('')
    }

    const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!employeeId || !lastWorkingDay) return
        try {
            await start({ employeeId, lastWorkingDay, rehirable: rehirable === 'true', exitType, tags })
            handleClose()
        } catch {
            // El error se muestra debajo del formulario vía `error`
        }
    }

    const alreadyInProgress = error?.response?.status === 409
    const errorMessage = alreadyInProgress
        ? 'Ya existe un proceso de offboarding en curso para este empleado.'
        : error
            ? (error.response?.data?.message ?? 'No se pudo iniciar el proceso de offboarding.')
            : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-md">

                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Iniciar offboarding</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isTermination
                                ? 'No se enviará checklist ni entrevista de salida. El empleado pasa a rol Alumni y el caso queda cerrado de inmediato — sin pasos adicionales.'
                                : 'Se generará el checklist de salida y la entrevista de salida. El empleado pasa a rol Alumni de inmediato.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Empleado</label>
                        <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className={inputCls}
                            required
                        >
                            <option value="">Seleccioná un empleado...</option>
                            {activeEmployees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}{emp.department?.name ? ` · ${emp.department.name}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Motivo de salida</label>
                        <select
                            value={exitType}
                            onChange={(e) => setExitType(e.target.value)}
                            className={inputCls}
                        >
                            <option value="RESIGNATION">Renuncia</option>
                            <option value="TERMINATION">Despido</option>
                        </select>
                        {isTermination && (
                            <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-0.5">
                                <AlertCircle size={12} className="shrink-0" />
                                No se le enviará checklist ni cuestionario de salida.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Último día de trabajo</label>
                        <input
                            type="date"
                            value={lastWorkingDay}
                            onChange={(e) => setLastWorkingDay(e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Recontratable</label>
                        <select
                            value={rehirable}
                            onChange={(e) => setRehirable(e.target.value)}
                            className={inputCls}
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {/* Tags — evita tener que ir a /alumni/:id después solo para etiquetar */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Tags (opcional)</label>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-1">
                                {tags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-pale text-brand">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-hover cursor-pointer">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                                placeholder="Agregar tag..."
                                className={inputCls}
                            />
                            <Button type="button" variant="ghost" onClick={addTag} disabled={!newTag.trim()} className="shrink-0">
                                <Plus size={14} />
                            </Button>
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertCircle size={14} className="shrink-0" />
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-brand-light">
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !employeeId || !lastWorkingDay}>
                            {isPending ? 'Iniciando...' : 'Iniciar proceso'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
