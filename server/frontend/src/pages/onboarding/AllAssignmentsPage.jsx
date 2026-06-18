import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Search, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAllEmployeeTasks } from '../../hooks/useAllEmployeeTasks'
import { useEmployees }        from '../../hooks/useEmployees'
import { updateTaskStatus }    from '../../services/employeeTaskService'
import EmployeeAvatar from '../employeeList/components/EmployeeAvatar'

/* ─── Constantes ─────────────────────────────────────────── */
const STATUS_LABEL = {
    ENROLLED:    'Inscripto',
    IN_PROGRESS: 'En progreso',
    SUBMITTED:   'Entregado',
    COMPLETED:   'Completado',
    DROPPED:     'Completado',
    OVERDUE:     'Vencido',
}
const STATUS_STYLE = {
    ENROLLED:    'bg-sky-100 text-sky-600',
    IN_PROGRESS: 'bg-amber-100 text-amber-600',
    SUBMITTED:   'bg-violet-100 text-violet-600',
    COMPLETED:   'bg-green-100 text-green-600',
    DROPPED:     'bg-green-100 text-green-600',
    OVERDUE:     'bg-red-100 text-red-600',
}

const COLUMNS = ['Empleado', 'Posición', 'Tarea / Template', 'Estado', 'Vencimiento']

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SkeletonRow() {
    return (
        <tr className="border-b border-brand-light animate-pulse">
            <td className="px-4 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 bg-slate-200 rounded-full shrink-0" />
                    <div className="h-3.5 bg-slate-200 rounded w-28" />
                </div>
            </td>
            {[1, 2, 3, 4].map((i) => (
                <td key={i} className="px-4 py-4">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                </td>
            ))}
        </tr>
    )
}

/* ─── Página ─────────────────────────────────────────────── */
export default function AllAssignmentsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const prefilterEmployeeId = searchParams.get('employeeId')
    const { user } = useSelector((s) => s.auth)
    const isTalento = user?.role === 'Talento'

    const { data: assignments = [], isLoading: loadingTasks, isFetching: fetchingTasks, isError: errorTasks     } = useAllEmployeeTasks()
    const { data: employees  = [], isLoading: loadingEmployees,                          isError: errorEmployees } = useEmployees()

    const isLoading = loadingTasks || fetchingTasks || loadingEmployees
    const isError   = errorTasks   || errorEmployees

    const [search,       setSearch]       = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [expanded, setExpanded] = useState(
        () => prefilterEmployeeId ? new Set([prefilterEmployeeId]) : new Set()
    )

    const toggleExpanded = (empId) =>
        setExpanded((prev) => {
            const next = new Set(prev)
            next.has(empId) ? next.delete(empId) : next.add(empId)
            return next
        })

    const [expandedTemplates, setExpandedTemplates] = useState(new Set())
    const toggleTemplate = (key) =>
        setExpandedTemplates((prev) => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })

    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    const qc = useQueryClient()
    const { mutate: approve, isPending: approving } = useMutation({
        mutationFn: ({ employeeId, taskId }) => updateTaskStatus(employeeId, taskId, 'COMPLETED'),
        onSuccess:  () => qc.invalidateQueries({ queryKey: ['employee-tasks', 'all'] }),
    })

    // OVERDUE is a computed pseudo-status.
    // DROPPED is displayed as COMPLETED so it's excluded from the filter options.
    const statusOptions = ['Todos', 'ENROLLED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE']

    // ── Helpers ───────────────────────────────────────────────
    // Comprueba si un empleado ya tiene al menos una asignación.
    // Usa doble check (employeeId raw + employee.id del JOIN) para evitar
    // cualquier inconsistencia de formato entre los dos endpoints.
    const isAssigned = (employeeId, asgList) =>
        asgList.some((a) => a.employeeId === employeeId || a.employee?.id === employeeId)

    // ── Acotar assignments a los employees visibles ────────────
    // `employees` ya viene filtrado por rol desde el backend (Líder → su equipo).
    // `assignments` (GET /employee-task) no lo está, así que se cruza acá con
    // la misma lista para que un Líder solo vea los planes de su equipo.
    const scopedAssignments = useMemo(() => {
        const employeeIds = new Set(employees.map((e) => e.id))
        return assignments.filter(
            (a) => employeeIds.has(a.employeeId) || employeeIds.has(a.employee?.id),
        )
    }, [assignments, employees])

    // ── Construir lista completa de filas ─────────────────────
    // Employees con tareas → una fila por assignment (igual que antes)
    // Employees sin tareas → una fila sintética con _unassigned: true
    const allRows = useMemo(() => {
        const unassignedRows = employees
            .filter((e) => !isAssigned(e.id, scopedAssignments))
            .map((e) => ({
                employeeId:  e.id,
                taskId:      null,
                status:      null,
                dueDate:     null,
                _unassigned: true,
                employee: {
                    id:        e.id,
                    firstName: e.firstName,
                    lastName:  e.lastName,
                    position:  e.position ?? null,
                },
                task: null,
            }))

        return [...scopedAssignments, ...unassignedRows]
    }, [scopedAssignments, employees])

    // ── Filtrar ───────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        const NON_OVERDUE_STATUSES = ['COMPLETED', 'DROPPED']

        return allRows.filter((row) => {
            // If navigated from an alert, pre-filter to that employee only
            if (prefilterEmployeeId && row.employee?.id !== prefilterEmployeeId) return false

            const matchSearch =
                !search ||
                `${row.employee?.firstName ?? ''} ${row.employee?.lastName ?? ''}`.toLowerCase().includes(q) ||
                row.task?.name?.toLowerCase().includes(q) ||
                row.employee?.position?.toLowerCase().includes(q)

            let matchStatus
            if (filterStatus === 'Todos') {
                matchStatus = true
            } else if (filterStatus === 'OVERDUE') {
                matchStatus = !row._unassigned &&
                    row.dueDate &&
                    new Date(row.dueDate) < today &&
                    !NON_OVERDUE_STATUSES.includes(row.status)
            } else if (filterStatus === 'SUBMITTED') {
                matchStatus = !row._unassigned && row.status === 'SUBMITTED'
            } else if (filterStatus === 'COMPLETED') {
                matchStatus = !row._unassigned && (row.status === 'COMPLETED' || row.status === 'DROPPED')
            } else {
                matchStatus = !row._unassigned && row.status === filterStatus
            }

            return matchSearch && matchStatus
        })
    }, [allRows, search, filterStatus, prefilterEmployeeId])

    // Group filtered rows by employee → then by template (TaskType)
    const grouped = useMemo(() => {
        const map = {}
        filtered.forEach((row) => {
            const key = row.employeeId
            if (!map[key]) map[key] = { employee: row.employee, templates: {} }
            if (row._unassigned) return
            const ttId   = row.task?.taskType?.id   ?? 'sin-template'
            const ttName = row.task?.taskType
                ? `${row.task.taskType.name}${row.task.taskType.sub_type ? ` — ${row.task.taskType.sub_type}` : ''}`
                : 'Sin template'
            if (!map[key].templates[ttId]) map[key].templates[ttId] = { id: ttId, name: ttName, tasks: [] }
            map[key].templates[ttId].tasks.push(row)
        })
        return Object.values(map).map(({ employee, templates }) => ({
            employee,
            templateGroups: Object.values(templates),
        }))
    }, [filtered])

    const totalAssigned   = scopedAssignments.length
    const totalUnassigned = employees.filter((e) => !isAssigned(e.id, scopedAssignments)).length

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

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Planes asignados</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    Todos los empleados con sus planes de trabajo
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por empleado, tarea o posición..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-brand-light
                                   text-slate-700 placeholder:text-slate-400 outline-none bg-white
                                   focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
                    />
                </div>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3.5 py-2 text-sm rounded-lg border border-brand-light text-slate-700
                               outline-none bg-white focus:border-brand focus:ring-2 focus:ring-brand-light
                               transition-colors sm:w-44"
                >
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s === 'Todos' ? 'Todos los estados' : STATUS_LABEL[s]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Accordion list */}
            {isLoading && (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-400 text-center py-10">Error al cargar los datos.</p>
            )}

            {!isLoading && !isError && grouped.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-10">
                    {allRows.length === 0 ? 'No hay empleados registrados.' : 'Sin resultados para los filtros aplicados.'}
                </p>
            )}

            {!isLoading && !isError && grouped.length > 0 && (
                <div className="flex flex-col gap-3">
                    {grouped.map(({ employee, templateGroups }) => {
                        const empId   = employee?.id
                        const isOpen  = expanded.has(empId)
                        const allTasks = templateGroups.flatMap((tg) => tg.tasks)
                        const done    = allTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DROPPED').length
                        const total   = allTasks.length
                        const allDone = total > 0 && done === total

                        return (
                            <div key={empId}
                                className={`bg-white rounded-xl border shadow-sm overflow-hidden
                                    ${allDone ? 'border-emerald-200' : 'border-brand-light'}`}>

                                {/* Employee header — click to expand */}
                                <button
                                    type="button"
                                    onClick={() => toggleExpanded(empId)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors
                                        hover:bg-brand-pale/40
                                        ${allDone ? 'bg-emerald-50/50' : 'bg-white'}`}
                                >
                                    <EmployeeAvatar
                                        firstName={employee?.firstName ?? ''}
                                        lastName={employee?.lastName  ?? ''}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {employee?.firstName} {employee?.lastName}
                                        </p>
                                        {employee?.position && (
                                            <p className="text-xs text-slate-400">{employee.position}</p>
                                        )}
                                    </div>
                                    {total === 0 ? (
                                        <span className="text-xs text-slate-400 italic shrink-0">Sin tareas</span>
                                    ) : (
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0
                                            ${allDone ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-pale text-brand'}`}>
                                            {done}/{total}
                                        </span>
                                    )}
                                    {total > 0 && (
                                        isOpen
                                            ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
                                            : <ChevronRight size={16} className="text-slate-400 shrink-0" />
                                    )}
                                </button>

                                {/* Template groups — expanded */}
                                {isOpen && templateGroups.length > 0 && (
                                    <div className="border-t border-brand-light">
                                        {templateGroups.map((tg) => {
                                            const tmplKey   = `${empId}-${tg.id}`
                                            const isTmplOpen = expandedTemplates.has(tmplKey)
                                            const tDone     = tg.tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DROPPED').length
                                            const tTotal    = tg.tasks.length
                                            const tAllDone  = tTotal > 0 && tDone === tTotal

                                            return (
                                                <div key={tg.id} className="border-b border-brand-light last:border-0">

                                                    {/* Template header */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTemplate(tmplKey)}
                                                        className="w-full flex items-center gap-2 px-5 py-2.5 text-left
                                                                   bg-brand-pale/20 hover:bg-brand-pale/50 transition-colors"
                                                    >
                                                        {isTmplOpen
                                                            ? <ChevronDown  size={13} className="text-slate-400 shrink-0" />
                                                            : <ChevronRight size={13} className="text-slate-400 shrink-0" />
                                                        }
                                                        <span className="flex-1 text-xs font-semibold text-slate-600 uppercase tracking-wide truncate">
                                                            {tg.name}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                                                            ${tAllDone ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-pale text-brand'}`}>
                                                            {tDone}/{tTotal}
                                                        </span>
                                                    </button>

                                                    {/* Tasks within template */}
                                                    {isTmplOpen && (
                                                        <div className="divide-y divide-brand-light">
                                                            {tg.tasks.map((row) => {
                                                                const done = row.status === 'COMPLETED' || row.status === 'DROPPED'
                                                                const isOverdue = !done && row.dueDate && new Date(row.dueDate) < today && row.status !== 'SUBMITTED'
                                                                const displayStatus = isOverdue ? 'OVERDUE' : row.status
                                                                return (
                                                                <div key={row.taskId}
                                                                    className="flex items-center gap-3 pl-10 pr-5 py-3">
                                                                    {done
                                                                        ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                                                        : isOverdue
                                                                        ? <Clock size={15} className="text-red-400 shrink-0" />
                                                                        : <Circle size={15} className="text-slate-300 shrink-0" />
                                                                    }
                                                                    <span className={`flex-1 text-sm truncate
                                                                        ${done ? 'line-through text-slate-400' : isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                                                                        {row.task?.name ?? '—'}
                                                                    </span>
                                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0
                                                                        ${STATUS_STYLE[displayStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                                                                        {STATUS_LABEL[displayStatus] ?? row.status}
                                                                    </span>
                                                                    {row.dueDate && (
                                                                        <span className={`flex items-center gap-1 text-xs shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                                                                            <Clock size={11} />
                                                                            {formatDate(row.dueDate)}
                                                                        </span>
                                                                    )}
                                                                    {isTalento && row.status === 'SUBMITTED' && (
                                                                        <button
                                                                            onClick={() => approve({ employeeId: row.employeeId, taskId: row.taskId })}
                                                                            disabled={approving}
                                                                            className="text-xs font-semibold text-white bg-emerald-500
                                                                                       hover:bg-emerald-600 px-2.5 py-1 rounded-lg
                                                                                       transition-colors disabled:opacity-50 shrink-0"
                                                                        >
                                                                            Aprobar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <p className="text-xs text-slate-400 text-center">
                        {grouped.length} empleado{grouped.length !== 1 ? 's' : ''} · {totalAssigned} asignaciones
                    </p>
                </div>
            )}

        </main>
    )
}
