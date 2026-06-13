import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useEmployees } from '../../../hooks/useEmployees'
import { useStartOffboarding } from '../../../hooks/useOffboarding'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm
text-slate-700 placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

const labelCls = 'text-xs font-semibold text-slate-600'

export default function StartOffboardingModal({ isOpen, onClose }) {
    const { data: employees = [] } = useEmployees()
    const { mutateAsync: start, isPending, error, reset } = useStartOffboarding()

    const [employeeId, setEmployeeId] = useState('')
    const [lastWorkingDay, setLastWorkingDay] = useState('')

    if (!isOpen) return null

    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE')

    const handleClose = () => {
        setEmployeeId('')
        setLastWorkingDay('')
        reset()
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!employeeId || !lastWorkingDay) return
        try {
            await start({ employeeId, lastWorkingDay })
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
                            Se generará el checklist de salida y la entrevista de salida
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
                        <label className={labelCls}>Último día de trabajo</label>
                        <input
                            type="date"
                            value={lastWorkingDay}
                            onChange={(e) => setLastWorkingDay(e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>

                    {errorMessage && (
                        <p className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertCircle size={14} className="shrink-0" />
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-brand-light">
                        <button type="button" onClick={handleClose} className="text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !employeeId || !lastWorkingDay}
                            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                                       text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors
                                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Iniciando...' : 'Iniciar proceso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
