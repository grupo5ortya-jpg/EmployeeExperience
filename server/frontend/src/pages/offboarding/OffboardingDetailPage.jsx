import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, MessageSquare } from 'lucide-react'

import { useOffboardingByEmployee, useCompleteOffboarding } from '../../hooks/useOffboarding'

const TASK_STATUS_LABEL = {
    ENROLLED:    'Pendiente',
    IN_PROGRESS: 'En progreso',
    SUBMITTED:   'Entregado',
    COMPLETED:   'Completado',
    DROPPED:     'Abandonado',
    REJECTED:    'Rechazado',
}

const EXIT_INTERVIEW_LABEL = {
    PENDING:   'Pendiente',
    COMPLETED: 'Completada',
}

const EXIT_INTERVIEW_STYLE = {
    PENDING:   'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function OffboardingDetailPage() {
    const { employeeId } = useParams()
    const navigate = useNavigate()
    const { data: offboarding, isLoading } = useOffboardingByEmployee(employeeId)
    const { mutate: complete, isPending: completing } = useCompleteOffboarding()

    if (isLoading) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">
                <p className="text-sm text-slate-400">Cargando...</p>
            </main>
        )
    }

    if (!offboarding) {
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">
                <p className="text-sm text-slate-400">No se encontró un proceso de offboarding para este empleado.</p>
            </main>
        )
    }

    const employeeName = offboarding.employee
        ? `${offboarding.employee.firstName ?? ''} ${offboarding.employee.lastName ?? ''}`.trim()
        : '—'

    const handleComplete = () => {
        if (window.confirm(`¿Finalizar el proceso de offboarding de ${employeeName}? El usuario pasará a tener rol Alumni.`)) {
            complete(employeeId)
        }
    }

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Back */}
            <button
                onClick={() => navigate('/offboardinghome')}
                className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors w-fit cursor-pointer"
            >
                <ArrowLeft size={14} />
                Volver a offboarding
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4 min-w-0">
                    <h1 className="text-lg font-bold text-slate-800">{employeeName}</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Último día de trabajo: {formatDate(offboarding.lastWorkingDay)}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${offboarding.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {offboarding.status === 'COMPLETED' ? 'Completado' : 'En curso'}
                    </span>
                    {offboarding.status === 'IN_PROGRESS' && (
                        <button
                            onClick={handleComplete}
                            disabled={completing}
                            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                                       text-sm font-semibold px-4 py-2 rounded-lg transition-colors
                                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {completing ? 'Finalizando...' : 'Finalizar proceso'}
                        </button>
                    )}
                </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Checklist de salida ({offboarding.checklist.completed}/{offboarding.checklist.total})
                </h3>
                <ul className="divide-y divide-brand-light">
                    {offboarding.checklist.tasks.map((task) => {
                        const isCompleted = task.status === 'COMPLETED'
                        return (
                            <li key={task.taskId} className="py-2.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {isCompleted ? (
                                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    ) : (
                                        <Circle size={16} className="text-slate-300 shrink-0" />
                                    )}
                                    <span className={`text-sm truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                        {task.name}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-slate-400 shrink-0">
                                    {TASK_STATUS_LABEL[task.status] ?? task.status}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* Entrevista de salida */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entrevista de salida</h3>
                {offboarding.exitInterview ? (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <MessageSquare size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-700">
                                Respondible hasta {formatDate(offboarding.exitInterview.dueDate)}
                            </span>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${EXIT_INTERVIEW_STYLE[offboarding.exitInterview.status] ?? ''}`}>
                            {EXIT_INTERVIEW_LABEL[offboarding.exitInterview.status] ?? offboarding.exitInterview.status}
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">No se generó una entrevista de salida.</p>
                )}
            </div>
        </main>
    )
}
