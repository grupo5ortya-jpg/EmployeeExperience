import { useState, useMemo }  from 'react'
import { useSelector }        from 'react-redux'
import {
    CheckCircle2, Circle, ClipboardList,
    Clock, Archive, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useMyTasks, useUpdateTaskStatus, useArchiveTemplate } from '../../hooks/useMyTasks'

const STATUS_SUBMITTED = 'SUBMITTED'
const STATUS_ENROLLED  = 'ENROLLED'
const STATUS_DROPPED   = 'DROPPED'

/* ─── Fila de tarea ──────────────────────────────────────── */
function TaskRow({ task, onToggle, isUpdating, disabled = false }) {
    const isCompleted = task.status === 'COMPLETED'
    const isSubmitted = task.status === STATUS_SUBMITTED
    const isDropped   = task.status === STATUS_DROPPED
    const done        = isCompleted || isSubmitted || isDropped
    const locked      = done || disabled

    const icon = (isCompleted || isDropped)
        ? <CheckCircle2 size={15} className={`shrink-0 ${disabled ? 'text-slate-400' : 'text-emerald-500'}`} />
        : isSubmitted
        ? <CheckCircle2 size={15} className="text-brand shrink-0" />
        : <Circle       size={15} className="text-slate-300 shrink-0" />

    return (
        <div className={`flex items-center border-b border-brand-light last:border-0
            ${disabled ? 'bg-slate-50' : isCompleted ? 'bg-emerald-50/20' : ''}`}>
            <button
                type="button"
                onClick={!locked ? () => onToggle(task.taskId, task.status) : undefined}
                disabled={isUpdating || locked}
                className={`flex-1 flex items-center gap-3 pl-8 pr-5 py-3 text-left transition-colors
                    ${!locked ? 'hover:bg-brand-pale/20 cursor-pointer' : 'cursor-default'}
                    disabled:opacity-100`}
            >
                {icon}
                <span className={`flex-1 text-sm leading-snug
                    ${disabled || isCompleted || isDropped
                        ? 'line-through text-slate-400'
                        : isSubmitted ? 'text-slate-500' : 'text-slate-700'}`}>
                    {task.task?.name ?? '—'}
                </span>
                {isSubmitted && !disabled && (
                    <span className="text-xs text-brand font-medium shrink-0">
                        Pendiente aprobación
                    </span>
                )}
                {!done && !disabled && task.task?.estimatedDuration != null && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock size={11} />
                        {task.task.estimatedDuration}d
                    </span>
                )}
            </button>
        </div>
    )
}

/* ─── Página principal ───────────────────────────────────── */
export default function MyTasks() {
    const { user }   = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const { data: tasks = [], isLoading, isError } = useMyTasks(employeeId)
    const { mutate: updateStatus, isPending }               = useUpdateTaskStatus(employeeId)
    const { mutate: archiveTemplate, isPending: archiving } = useArchiveTemplate(employeeId)

    // ── Agrupar TODAS las tareas (incluyendo DROPPED) por template ──
    const allGroups = useMemo(() => {
        const map = {}
        tasks.forEach((t) => {
            const tt   = t.task?.taskType
            const key  = tt?.id ?? 'sin-tipo'
            const name = tt
                ? `${tt.name}${tt.sub_type ? ` — ${tt.sub_type}` : ''}`
                : 'Sin categoría'
            if (!map[key]) map[key] = { id: key, name, tasks: [] }
            map[key].tasks.push(t)
        })
        return Object.values(map)
    }, [tasks])

    // Templates activos: al menos una tarea NO es DROPPED
    const activeGroups = useMemo(
        () => allGroups.filter((g) => !g.tasks.every((t) => t.status === STATUS_DROPPED)),
        [allGroups],
    )
    // Templates archivados: TODAS las tareas son DROPPED
    const archivedGroups = useMemo(
        () => allGroups.filter((g) => g.tasks.length > 0 && g.tasks.every((t) => t.status === STATUS_DROPPED)),
        [allGroups],
    )

    // Activos: expandidos por default → Set guarda los COLAPSADOS
    const [collapsedActive,  setCollapsedActive]  = useState(new Set())
    // Archivados: colapsados por default → Set guarda los EXPANDIDOS
    const [expandedArchived, setExpandedArchived] = useState(new Set())

    const toggleActive  = (id) => setCollapsedActive((p)  => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
    const toggleArchived = (id) => setExpandedArchived((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

    // ── Contadores (excluye DROPPED) ──────────────────────────────
    const activeTasks = useMemo(() => tasks.filter((t) => t.status !== STATUS_DROPPED), [tasks])
    const totalDone   = activeTasks.filter((t) => t.status === 'COMPLETED' || t.status === STATUS_SUBMITTED).length
    const totalTasks  = activeTasks.length
    const allDone     = totalTasks > 0 && activeTasks.every((t) => t.status === 'COMPLETED')

    const handleToggle = (taskId, currentStatus) => {
        const next = currentStatus === STATUS_SUBMITTED ? STATUS_ENROLLED : STATUS_SUBMITTED
        updateStatus({ taskId, status: next })
    }

    const handleArchive = (group) => {
        archiveTemplate(group.tasks.map((t) => t.taskId))
    }

    /* ── JSX ─────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                    Mis tareas de onboarding
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    {totalTasks > 0
                        ? `${totalDone} de ${totalTasks} tareas completadas`
                        : 'Tus tareas de incorporación aparecerán aquí'}
                </p>
            </div>

            {/* Barra de progreso */}
            {totalTasks > 0 && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-2 shrink-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Progreso general</span>
                        <span className="font-semibold">
                            {Math.round((totalDone / totalTasks) * 100)}%
                        </span>
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

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && (
                <p className="text-sm text-red-400 text-center py-10">
                    No se pudieron cargar las tareas.
                </p>
            )}

            {/* Empty state */}
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

            {/* ── Templates activos ────────────────────────────────── */}
            {activeGroups.map((group) => {
                const isOpen       = !collapsedActive.has(group.id)
                const done         = group.tasks.filter((t) => t.status === 'COMPLETED').length
                const total        = group.tasks.length
                const allCompleted = total > 0 && done === total

                return (
                    <div
                        key={group.id}
                        className={`bg-white rounded-xl border shadow-sm overflow-hidden shrink-0
                            ${allCompleted ? 'border-emerald-200' : 'border-brand-light'}`}
                    >
                        {/* Cabecera del template */}
                        <div className={`px-5 py-3 flex items-center gap-3 border-b
                            ${allCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-pale/40 border-brand-light'}`}>

                            {/* Botón collapsar */}
                            <button
                                type="button"
                                onClick={() => toggleActive(group.id)}
                                className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                            >
                                {isOpen
                                    ? <ChevronDown  size={14} className={`shrink-0 ${allCompleted ? 'text-emerald-500' : 'text-brand'}`} />
                                    : <ChevronRight size={14} className={`shrink-0 ${allCompleted ? 'text-emerald-500' : 'text-brand'}`} />
                                }
                                <span className={`text-xs font-bold uppercase tracking-wide truncate
                                    ${allCompleted ? 'text-emerald-600' : 'text-brand'}`}>
                                    {group.name}
                                </span>
                                {allCompleted && (
                                    <span className="text-xs text-emerald-500 font-semibold shrink-0">
                                        · Completado
                                    </span>
                                )}
                            </button>

                            {/* Contador + botón archivar */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                    ${allCompleted
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-brand-pale text-brand'}`}>
                                    {done}/{total}
                                </span>
                                {allCompleted && (
                                    <button
                                        type="button"
                                        onClick={() => handleArchive(group)}
                                        disabled={archiving}
                                        title="Archivar este template"
                                        className="flex items-center gap-1 text-xs font-medium
                                                   text-slate-400 hover:text-slate-600
                                                   px-2 py-1 rounded-lg hover:bg-white/60
                                                   transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        <Archive size={13} />
                                        Archivar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tareas */}
                        {isOpen && (
                            <div>
                                {group.tasks.map((t) => (
                                    <TaskRow
                                        key={t.taskId}
                                        task={t}
                                        onToggle={handleToggle}
                                        isUpdating={isPending}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}

            {/* ── Sección archivados ────────────────────────────────── */}
            {archivedGroups.length > 0 && (
                <>
                    {/* Separador */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <Archive size={12} />
                            Archivados ({archivedGroups.length})
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {archivedGroups.map((group) => {
                        const isOpen = expandedArchived.has(group.id)
                        const total  = group.tasks.length

                        return (
                            <div
                                key={group.id}
                                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0"
                            >
                                {/* Cabecera archivado */}
                                <button
                                    type="button"
                                    onClick={() => toggleArchived(group.id)}
                                    className="w-full flex items-center gap-2 px-5 py-3 text-left
                                               border-b border-slate-200 bg-slate-100/80
                                               hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    {isOpen
                                        ? <ChevronDown  size={14} className="text-slate-400 shrink-0" />
                                        : <ChevronRight size={14} className="text-slate-400 shrink-0" />
                                    }
                                    <span className="flex-1 text-xs font-bold uppercase tracking-wide text-slate-400 truncate">
                                        {group.name}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-400 shrink-0">
                                        Archivado · {total} tarea{total !== 1 ? 's' : ''}
                                    </span>
                                </button>

                                {/* Tareas deshabilitadas */}
                                {isOpen && (
                                    <div className="opacity-60">
                                        {group.tasks.map((t) => (
                                            <TaskRow
                                                key={t.taskId}
                                                task={t}
                                                onToggle={() => {}}
                                                isUpdating={false}
                                                disabled
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </>
            )}

        </main>
    )
}
