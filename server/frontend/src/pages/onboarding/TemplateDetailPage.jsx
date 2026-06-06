import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, Layers, UserPlus, X } from 'lucide-react'
import { useTaskById } from '../../hooks/useTaskById'
import { useEmployeeTasksByTask } from '../../hooks/useEmployeeTasksByTask'
import { useEmployees } from '../../hooks/useEmployees'
import { useTasks } from '../../hooks/useTasks'
import { useAllEmployeeTasks } from '../../hooks/useAllEmployeeTasks'
import { createEmployeeTask } from '../../services/employeeTaskService'
import EmployeeAvatar from '../employeeList/components/EmployeeAvatar'

/* ─── Constantes ─────────────────────────────────────────── */
const STATUS_LABEL = {
    ENROLLED:    'Inscripto',
    IN_PROGRESS: 'En progreso',
    SUBMITED:    'Entregado',
    COMPLETED:   'Completado',
    DROPPED:     'Abandonado',
}
const STATUS_STYLE = {
    ENROLLED:    'bg-sky-100 text-sky-600',
    IN_PROGRESS: 'bg-amber-100 text-amber-600',
    SUBMITED:    'bg-violet-100 text-violet-600',
    COMPLETED:   'bg-green-100 text-green-600',
    DROPPED:     'bg-slate-100 text-slate-500',
}
const STATUS_OPTS = ['ENROLLED', 'IN_PROGRESS', 'SUBMITED', 'COMPLETED', 'DROPPED']

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ─── Modal de asignación ────────────────────────────────── */
function AssignModal({ taskId, employees, assignedEmployeeIds, onClose, onSaved }) {
    const [form,   setForm]   = useState({ employeeId: '', dueDate: '', status: 'ENROLLED' })
    const [saving, setSaving] = useState(false)
    const [error,  setError]  = useState('')

    // Excluir empleados que ya tienen esta tarea asignada
    const available = employees.filter((e) => !assignedEmployeeIds.includes(e.id))

    const handle = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            await createEmployeeTask({
                employeeId: form.employeeId,
                taskId,
                status:     form.status,
                dueDate:    form.dueDate,
            })
            onSaved()
        } catch {
            setError('No se pudo asignar la tarea. Verificá los datos e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Asignar empleado</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Asigná esta tarea a un colaborador</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">
                            Empleado <span className="text-red-400">*</span>
                        </label>
                        <select name="employeeId" value={form.employeeId} onChange={handle}
                            className={inputCls} required>
                            <option value="">Seleccionar empleado</option>
                            {available.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                    {emp.position ? ` — ${emp.position}` : ''}
                                </option>
                            ))}
                        </select>
                        {available.length === 0 && (
                            <p className="text-xs text-amber-500 mt-1">Todos los empleados ya tienen esta tarea asignada.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">
                            Fecha de vencimiento <span className="text-red-400">*</span>
                        </label>
                        <input type="date" name="dueDate" value={form.dueDate} onChange={handle}
                            className={inputCls} required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">Estado inicial</label>
                        <select name="status" value={form.status} onChange={handle} className={inputCls}>
                            {STATUS_OPTS.map((s) => (
                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                            {error}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-light">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5
                                       rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || available.length === 0}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                       disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Asignando...' : 'Asignar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ─── Página principal ───────────────────────────────────── */
export default function TemplateDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: task,              isLoading: loadingTask,        isError: taskError }  = useTaskById(id)
    const { data: assignments = [],  isLoading: loadingAssignments }                      = useEmployeeTasksByTask(id)
    const { data: employees  = [] }                                                        = useEmployees()
    const { data: allTasks   = [] }                                                        = useTasks()
    const { data: allEmpTasks = [] }                                                       = useAllEmployeeTasks()

    const [modalOpen, setModalOpen] = useState(false)

    // Employees who have ALL tasks of this template assigned (fully assigned → exclude from modal)
    const fullyAssignedIds = useMemo(() => {
        const taskTypeId = task?.taskType?.id
        if (!taskTypeId) return []
        const templateTaskIds = new Set(
            allTasks.filter((t) => t.taskType?.id === taskTypeId).map((t) => t.id)
        )
        const total = templateTaskIds.size
        if (total === 0) return []
        const countByEmployee = {}
        allEmpTasks.forEach((et) => {
            if (templateTaskIds.has(et.taskId)) {
                countByEmployee[et.employeeId] = (countByEmployee[et.employeeId] ?? 0) + 1
            }
        })
        return Object.entries(countByEmployee)
            .filter(([, count]) => count >= total)
            .map(([empId]) => empId)
    }, [task, allTasks, allEmpTasks])

    const assignedIds = assignments.map((a) => a.employeeId)

    const handleSaved = async () => {
        // Invalida todas las queries de employee-tasks (by-task + all) en un solo paso
        await queryClient.invalidateQueries({ queryKey: ['employee-tasks'] })
        setModalOpen(false)
    }

    if (loadingTask) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-slate-200 rounded-xl" />
                    <div className="h-64 bg-slate-200 rounded-xl" />
                </div>
            </main>
        )
    }

    if (taskError || !task) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <p className="text-sm text-red-400">No se pudo cargar la plantilla.</p>
            </main>
        )
    }

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Back */}
            <button
                onClick={() => navigate('/onboardinghome')}
                className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors w-fit cursor-pointer"
            >
                <ArrowLeft size={14} />
                Volver a plantillas
            </button>

            {/* Task header */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4 min-w-0">
                    <h1 className="text-lg font-bold text-slate-800">{task.name}</h1>
                    {task.taskType && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Layers size={11} />
                            {task.taskType.name}
                            {task.taskType.sub_type && ` · ${task.taskType.sub_type}`}
                        </p>
                    )}
                </div>
                {task.estimatedDuration != null && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand-pale px-3 py-1.5 rounded-lg shrink-0">
                        <Clock size={13} />
                        {task.estimatedDuration} días estimados
                    </div>
                )}
            </div>

            {/* Assignments table */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40 flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Empleados asignados ({loadingAssignments ? '…' : assignments.length})
                    </h2>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                                   text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <UserPlus size={13} />
                        Asignar empleado
                    </button>
                </div>

                {loadingAssignments ? (
                    <div className="divide-y divide-brand-light animate-pulse">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="px-5 py-4 flex items-center gap-4">
                                <div className="h-7 w-7 bg-slate-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/5" />
                                </div>
                                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-sm text-slate-400">No hay empleados asignados a esta tarea.</p>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="mt-3 text-sm text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer"
                        >
                            + Asignar el primero
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-navy">
                                    {['Empleado', 'Posición', 'Estado', 'Vencimiento'].map((col) => (
                                        <th key={col} className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((et, i) => (
                                    <tr
                                        key={`${et.employeeId}-${et.taskId}`}
                                        className={`border-b border-brand-light ${i % 2 === 0 ? 'bg-white' : 'bg-brand-pale/30'}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <EmployeeAvatar
                                                    firstName={et.employee?.firstName ?? ''}
                                                    lastName={et.employee?.lastName ?? ''}
                                                    size="sm"
                                                />
                                                <span className="font-medium text-slate-700">
                                                    {et.employee?.firstName} {et.employee?.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                            {et.employee?.position ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[et.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                                {STATUS_LABEL[et.status] ?? et.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                            {formatDate(et.dueDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <AssignModal
                    taskId={id}
                    employees={employees}
                    assignedEmployeeIds={fullyAssignedIds}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

        </main>
    )
}
