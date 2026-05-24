import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Layers } from 'lucide-react'
import { useTaskById } from '../../hooks/useTaskById'
import { useEmployeeTasksByTask } from '../../hooks/useEmployeeTasksByTask'
import EmployeeAvatar from '../employeeList/components/EmployeeAvatar'

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

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TemplateDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: task,        isLoading: loadingTask,        isError: taskError }  = useTaskById(id)
    const { data: assignments = [], isLoading: loadingAssignments }                 = useEmployeeTasksByTask(id)

    if (loadingTask) {
        return (
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-slate-200 rounded-xl" />
                    <div className="h-64 bg-slate-200 rounded-xl" />
                </div>
            </main>
        )
    }

    if (taskError || !task) {
        return (
            <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <p className="text-sm text-red-400">No se pudo cargar la plantilla.</p>
            </main>
        )
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

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
                <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Empleados asignados ({loadingAssignments ? '…' : assignments.length})
                    </h2>
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
                    <p className="px-5 py-12 text-center text-sm text-slate-400">
                        No hay empleados asignados a esta tarea.
                    </p>
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

        </main>
    )
}
