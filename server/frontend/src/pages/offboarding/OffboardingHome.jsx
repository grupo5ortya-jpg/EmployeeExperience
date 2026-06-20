import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ClipboardList, MessageSquare } from 'lucide-react'

import { useOffboardings } from '../../hooks/useOffboarding'
import StartOffboardingModal from './components/StartOffboardingModal'

// "Caso" = cierre administrativo del proceso por parte de HR — independiente del progreso
// real (checklist/entrevista). Si ambos ya están al 100% pero el caso sigue IN_PROGRESS,
// se muestra "Listo para cerrar" para que HR sepa que puede finalizarlo.
const STATUS_LABEL = {
    IN_PROGRESS: 'Abierto',
    COMPLETED:   'Cerrado',
}

const STATUS_STYLE = {
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED:   'bg-green-100 text-green-700',
}

const READY_TO_CLOSE_STYLE = 'bg-brand-pale text-brand'

function isReadyToClose(o) {
    if (o.status !== 'IN_PROGRESS') return false
    // Despido: no hay checklist ni entrevista que esperar — queda listo para cerrar de entrada.
    if (o.exitType === 'TERMINATION') return true
    const checklistDone = o.checklist.total > 0 && o.checklist.completed === o.checklist.total
    const exitDone      = o.exitInterview?.status === 'COMPLETED'
    return checklistDone && exitDone
}

const EXIT_INTERVIEW_LABEL = {
    PENDING:   'Pendiente',
    COMPLETED: 'Completada',
}

const EXIT_INTERVIEW_STYLE = {
    PENDING:   'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
}

// Despido (TERMINATION): no se le asigna checklist ni entrevista de salida — se muestra
// "N/A" en vez de 0/0 para no confundirlo con una renuncia recién iniciada.
const EXIT_TYPE_LABEL = {
    RESIGNATION: 'Renuncia',
    TERMINATION: 'Despido',
}

const EXIT_TYPE_STYLE = {
    RESIGNATION: 'bg-slate-100 text-slate-600',
    TERMINATION: 'bg-red-100 text-red-700',
}

export default function OffboardingHome() {
    const navigate = useNavigate()
    const { data: offboardings = [], isLoading } = useOffboardings()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Offboarding</h1>
                    <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                        Gestioná los procesos de desvinculación: checklist de salida y entrevista de salida
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Iniciar proceso
                </button>
            </div>

            {/* Procesos */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3 flex-1 min-h-0">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Procesos ({offboardings.length})
                </h3>

                {isLoading ? (
                    <p className="text-sm text-slate-400">Cargando...</p>
                ) : offboardings.length === 0 ? (
                    <p className="text-sm text-slate-400">Todavía no se inició ningún proceso de offboarding.</p>
                ) : (
                    <div className="overflow-auto flex-1 min-h-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-brand-light">
                                    <th className="py-2 pr-3">Empleado</th>
                                    <th className="py-2 pr-3">Motivo</th>
                                    <th className="py-2 pr-3">Último día</th>
                                    <th className="py-2 pr-3">Checklist</th>
                                    <th className="py-2 pr-3">Entrevista de salida</th>
                                    <th className="py-2 pr-3">Caso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offboardings.map((o) => {
                                    const readyToClose = isReadyToClose(o)
                                    const isTermination = o.exitType === 'TERMINATION'
                                    return (
                                    <tr
                                        key={o.id}
                                        onClick={() => navigate(`/offboarding/${o.employeeId}`)}
                                        className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-brand-pale/40"
                                    >
                                        <td className="py-2.5 pr-3 text-slate-700 font-medium">
                                            {o.employee ? `${o.employee.firstName ?? ''} ${o.employee.lastName ?? ''}`.trim() : '—'}
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${EXIT_TYPE_STYLE[o.exitType] ?? ''}`}>
                                                {EXIT_TYPE_LABEL[o.exitType] ?? o.exitType}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-3 text-slate-600">
                                            {o.lastWorkingDay ? new Date(o.lastWorkingDay).toLocaleDateString('es-AR') : '—'}
                                        </td>
                                        <td className="py-2.5 pr-3 text-slate-600">
                                            {isTermination ? (
                                                <span className="text-slate-400">N/A</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <ClipboardList size={13} className="text-slate-400" />
                                                    {o.checklist.completed}/{o.checklist.total}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            {isTermination ? (
                                                <span className="text-slate-400">N/A</span>
                                            ) : o.exitInterview ? (
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${EXIT_INTERVIEW_STYLE[o.exitInterview.status] ?? ''}`}>
                                                    <MessageSquare size={12} />
                                                    {EXIT_INTERVIEW_LABEL[o.exitInterview.status] ?? o.exitInterview.status}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${readyToClose ? READY_TO_CLOSE_STYLE : (STATUS_STYLE[o.status] ?? '')}`}>
                                                {readyToClose ? 'Listo para cerrar' : (STATUS_LABEL[o.status] ?? o.status)}
                                            </span>
                                        </td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <StartOffboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </main>
    )
}
