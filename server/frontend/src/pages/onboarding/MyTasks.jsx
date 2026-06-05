import { useMemo }          from 'react'
import { useSelector }      from 'react-redux'
import { CheckCircle2, Circle, ClipboardList, Clock, EyeOff } from 'lucide-react'
import { useMyTasks, useUpdateTaskStatus } from '../../hooks/useMyTasks'

const STATUS_SUBMITTED = 'SUBMITTED'
const STATUS_ENROLLED  = 'ENROLLED'
const STATUS_DROPPED   = 'DROPPED'

const STATUS_LABEL = {
    ENROLLED:    'Pendiente',
    IN_PROGRESS: 'En progreso',
    COMPLETED:   'Completada',
    PAUSED:      'Pausada',
    DROPPED:     'Abandonada',
}

function TaskRow({ task, onToggle, onArchive, isUpdating }) {
    const done    = task.status === STATUS_SUBMITTED
    const locked  = done || task.status === 'COMPLETED' // submitted/approved → no editable
    return (
        <div className={`flex items-center border-b border-brand-light last:border-0
            ${done ? 'bg-emerald-50/40' : ''}`}>
            <button
                type="button"
                onClick={!locked ? () => onToggle(task.taskId, task.status) : undefined}
                disabled={isUpdating || locked}
                className={`flex-1 flex items-center gap-3 px-5 py-3.5 text-left transition-colors
                    ${!locked ? 'hover:bg-brand-pale/30 cursor-pointer' : 'cursor-default'}
                    disabled:opacity-100`}
            >
                {done
                    ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    : <Circle      size={18} className="text-slate-300 shrink-0" />
                }
                <span className={`flex-1 text-sm leading-snug
                    ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {task.task?.name ?? '—'}
                </span>
                {done && (
                    <span className="text-xs text-emerald-600 font-medium shrink-0">
                        Entregada · pendiente de aprobación
                    </span>
                )}
                {!done && task.task?.estimatedDuration && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock size={11} />
                        {task.task.estimatedDuration}d
                    </span>
                )}
            </button>
            {/* Archive button — only visible once HR approved (COMPLETED) */}
            {task.status === 'COMPLETED' && (
                <button
                    type="button"
                    onClick={() => onArchive(task.taskId)}
                    disabled={isUpdating}
                    title="Archivar tarea"
                    className="px-4 text-slate-300 hover:text-slate-500 transition-colors
                               disabled:opacity-40 shrink-0"
                >
                    <EyeOff size={15} />
                </button>
            )}
        </div>
    )
}

export default function MyTasks() {
    const { user }   = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const { data: tasks = [], isLoading, isError } = useMyTasks(employeeId)
    const { mutate: updateStatus, isPending }       = useUpdateTaskStatus(employeeId)

    // Exclude archived (DROPPED) tasks from the visible view
    const visibleTasks = useMemo(() =>
        tasks.filter((t) => t.status !== STATUS_DROPPED), [tasks])

    // Group visible tasks by TaskType
    const groups = useMemo(() => {
        const map = {}
        visibleTasks.forEach((t) => {
            const tt   = t.task?.taskType
            const key  = tt?.id ?? 'sin-tipo'
            const name = tt ? `${tt.name}${tt.sub_type ? ` — ${tt.sub_type}` : ''}` : 'Sin categoría'
            if (!map[key]) map[key] = { name, tasks: [] }
            map[key].tasks.push(t)
        })
        return Object.values(map)
    }, [tasks])

    const totalDone  = visibleTasks.filter((t) => t.status === 'COMPLETED' || t.status === STATUS_SUBMITTED).length
    const totalTasks = visibleTasks.length
    const allDone    = totalTasks > 0 && visibleTasks.every((t) => t.status === 'COMPLETED')

    const handleToggle  = (taskId, currentStatus) => {
        // ENROLLED/IN_PROGRESS → SUBMITTED (employee delivers for HR review)
        // SUBMITTED → ENROLLED (undo delivery)
        const next = (currentStatus === STATUS_SUBMITTED) ? STATUS_ENROLLED : STATUS_SUBMITTED
        updateStatus({ taskId, status: next })
    }
    const handleArchive = (taskId) => updateStatus({ taskId, status: STATUS_DROPPED })

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Mis tareas de onboarding</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    {totalTasks > 0
                        ? `${totalDone} de ${totalTasks} tareas completadas`
                        : 'Tus tareas de incorporación aparecerán aquí'}
                </p>
            </div>

            {/* Progress bar */}
            {totalTasks > 0 && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-2 shrink-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Progreso general</span>
                        <span className="font-semibold">{Math.round((totalDone / totalTasks) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500
                                ${allDone ? 'bg-emerald-400' : 'bg-brand'}`}
                            style={{ width: `${(totalDone / totalTasks) * 100}%` }}
                        />
                    </div>
                    {allDone && (
                        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1">
                            <CheckCircle2 size={13} />
                            ¡Completaste todas las tareas de onboarding!
                        </p>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col gap-4">
                    {[1,2].map(i => <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-400 text-center py-10">
                    No se pudieron cargar las tareas.
                </p>
            )}

            {!isLoading && !isError && tasks.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <ClipboardList size={24} className="text-brand" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Sin tareas asignadas</p>
                        <p className="text-xs text-slate-400 mt-1">
                            RR.HH. asignará tus tareas de incorporación próximamente.
                        </p>
                    </div>
                </div>
            )}

            {/* Task groups */}
            {groups.map((group) => {
                const done  = group.tasks.filter((t) => t.status === 'COMPLETED' || t.status === STATUS_SUBMITTED).length
                const total = group.tasks.length
                const allGroupDone = done === total

                return (
                    <div key={group.name}
                        className={`bg-white rounded-xl border shadow-sm overflow-hidden shrink-0
                            ${allGroupDone ? 'border-emerald-200' : 'border-brand-light'}`}>

                        {/* Group header */}
                        <div className={`px-5 py-3 flex items-center justify-between border-b
                            ${allGroupDone ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-pale/40 border-brand-light'}`}>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wide
                                    ${allGroupDone ? 'text-emerald-600' : 'text-brand'}`}>
                                    {group.name}
                                </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                ${allGroupDone
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-brand-pale text-brand'}`}>
                                {done}/{total}
                            </span>
                        </div>

                        {/* Tasks */}
                        <div className="divide-y divide-brand-light">
                            {group.tasks.map((t) => (
                                <TaskRow
                                    key={t.taskId}
                                    task={t}
                                    onToggle={handleToggle}
                                    onArchive={handleArchive}
                                    isUpdating={isPending}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}

        </main>
    )
}
