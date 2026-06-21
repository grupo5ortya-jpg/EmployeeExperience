import { CheckCircle2, Circle, ClipboardList } from 'lucide-react'
import { useMyTasks, useUpdateTaskStatus } from '../../../hooks/useMyTasks'

const STATUS_SUBMITTED = 'SUBMITTED'
const STATUS_ENROLLED  = 'ENROLLED'

// Mismo TaskType seedeado que usa el backend para el checklist de salida
// (getOffboardingChecklistTaskType — utils/offboarding.js).
const OFFBOARDING_CHECKLIST_TASK_TYPE = 'Offboarding estándar'

/* ── Card "Checklist de salida" — tareas del template Offboarding estándar ──
   Mismo patrón de toggle que MyTasks.jsx: click → SUBMITTED (pendiente de
   aprobación de Talento, vía /all-assignments), sin paso intermedio propio. */
export default function OffboardingChecklistCard({ employeeId }) {
    const { data: tasks = [] }                = useMyTasks(employeeId)
    const { mutate: updateStatus, isPending }  = useUpdateTaskStatus(employeeId)

    const checklist = tasks.filter((t) => t.task?.taskType?.name === OFFBOARDING_CHECKLIST_TASK_TYPE)

    if (checklist.length === 0) return null

    const done = checklist.filter((t) => t.status === 'COMPLETED').length

    const handleToggle = (taskId, currentStatus) => {
        const next = currentStatus === STATUS_SUBMITTED ? STATUS_ENROLLED : STATUS_SUBMITTED
        updateStatus({ taskId, status: next })
    }

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <ClipboardList size={14} className="text-brand" />
                <h3 className="text-sm font-semibold text-slate-700">Checklist de salida</h3>
                <span className="text-xs font-semibold text-brand bg-brand-pale px-2 py-0.5 rounded-full ml-auto">
                    {done}/{checklist.length}
                </span>
            </div>

            <ul className="flex flex-col">
                {checklist.map((t) => {
                    const isCompleted = t.status === 'COMPLETED'
                    const isSubmitted = t.status === STATUS_SUBMITTED
                    const locked      = isCompleted || isSubmitted

                    return (
                        <li key={t.taskId} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                            <button
                                type="button"
                                onClick={!locked ? () => handleToggle(t.taskId, t.status) : undefined}
                                disabled={isPending || locked}
                                className={`flex items-center gap-3 flex-1 text-left transition-colors
                                    ${!locked ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
                            >
                                {isCompleted
                                    ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    : isSubmitted
                                    ? <CheckCircle2 size={16} className="text-brand shrink-0" />
                                    : <Circle size={16} className="text-slate-300 shrink-0" />
                                }
                                <span className={`flex-1 text-sm leading-snug
                                    ${isCompleted ? 'line-through text-slate-400' : isSubmitted ? 'text-slate-500' : 'text-slate-700'}`}>
                                    {t.task?.name ?? '—'}
                                </span>
                            </button>
                            {isSubmitted && (
                                <span className="text-xs text-brand font-medium shrink-0">Pendiente aprobación</span>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
