import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { useAllEmployeeTasks } from '../../hooks/useAllEmployeeTasks'
import { useEmployees }        from '../../hooks/useEmployees'
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

    const { data: assignments = [], isLoading: loadingTasks, isFetching: fetchingTasks, isError: errorTasks     } = useAllEmployeeTasks()
    const { data: employees  = [], isLoading: loadingEmployees,                          isError: errorEmployees } = useEmployees()

    // isFetching cubre el refetch en background (tras invalidateQueries) — sin él,
    // React Query muestra datos stale mientras refetchea y el usuario no ve la nueva asignación
    // hasta que hace alguna interacción que dispara un re-render post-fetch.
    const isLoading = loadingTasks || fetchingTasks || loadingEmployees
    const isError   = errorTasks   || errorEmployees

    const [search,       setSearch]       = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')

    const statusOptions = ['Todos', ...Object.keys(STATUS_LABEL)]

    // ── Helpers ───────────────────────────────────────────────
    // Comprueba si un empleado ya tiene al menos una asignación.
    // Usa doble check (employeeId raw + employee.id del JOIN) para evitar
    // cualquier inconsistencia de formato entre los dos endpoints.
    const isAssigned = (employeeId, asgList) =>
        asgList.some((a) => a.employeeId === employeeId || a.employee?.id === employeeId)

    // ── Construir lista completa de filas ─────────────────────
    // Employees con tareas → una fila por assignment (igual que antes)
    // Employees sin tareas → una fila sintética con _unassigned: true
    const allRows = useMemo(() => {
        const unassignedRows = employees
            .filter((e) => !isAssigned(e.id, assignments))
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

        return [...assignments, ...unassignedRows]
    }, [assignments, employees])

    // ── Filtrar ───────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase()

        return allRows.filter((row) => {
            const matchSearch =
                !search ||
                `${row.employee?.firstName ?? ''} ${row.employee?.lastName ?? ''}`.toLowerCase().includes(q) ||
                row.task?.name?.toLowerCase().includes(q) ||
                row.employee?.position?.toLowerCase().includes(q)

            // Filas sin asignación solo aparecen cuando el filtro es "Todos"
            const matchStatus =
                filterStatus === 'Todos' ||
                (!row._unassigned && row.status === filterStatus)

            return matchSearch && matchStatus
        })
    }, [allRows, search, filterStatus])

    const totalAssigned   = assignments.length
    const totalUnassigned = employees.filter((e) => !isAssigned(e.id, assignments)).length

    return (
        <main className="flex-1 min-h-0 p-4 lg:p-6 flex flex-col gap-5">

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
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Asignaciones</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    Todos los empleados con sus tareas de onboarding
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

            {/* Table */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-navy">
                                {COLUMNS.map((col) => (
                                    <th key={col} className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : isError ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} className="text-center py-10 text-sm text-red-400 bg-brand-pale">
                                        Error al cargar los datos. Intentá de nuevo.
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} className="text-center py-10 text-sm text-slate-400 bg-brand-pale">
                                        {allRows.length === 0
                                            ? 'No hay empleados registrados.'
                                            : 'No se encontraron resultados para los filtros aplicados.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((row, i) => (
                                    <tr
                                        key={row._unassigned
                                            ? `unassigned-${row.employeeId}`
                                            : `${row.employeeId}-${row.taskId}`}
                                        onClick={() => !row._unassigned && navigate(`/onboarding-template/${row.taskId}`)}
                                        className={`border-b border-brand-light transition-colors
                                            ${row._unassigned
                                                ? 'bg-white opacity-60'
                                                : `cursor-pointer hover:bg-brand-light/70 ${i % 2 === 0 ? 'bg-white' : 'bg-brand-pale/30'}`
                                            }`}
                                    >
                                        {/* Empleado */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <EmployeeAvatar
                                                    firstName={row.employee?.firstName ?? ''}
                                                    lastName={row.employee?.lastName ?? ''}
                                                    size="sm"
                                                />
                                                <span className="font-semibold text-slate-700 whitespace-nowrap">
                                                    {row.employee?.firstName} {row.employee?.lastName}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Posición */}
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                            {row.employee?.position ?? '—'}
                                        </td>

                                        {/* Tarea */}
                                        <td className="px-4 py-3">
                                            {row._unassigned ? (
                                                <span className="text-xs text-slate-400 italic">Sin tareas asignadas</span>
                                            ) : (
                                                <p className="text-slate-700 font-medium">{row.task?.name ?? '—'}</p>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            {row._unassigned || !row.status ? (
                                                <span className="text-xs text-slate-400">—</span>
                                            ) : (
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap
                                                    ${STATUS_STYLE[row.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {STATUS_LABEL[row.status] ?? row.status}
                                                </span>
                                            )}
                                        </td>

                                        {/* Vencimiento */}
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                            {formatDate(row.dueDate)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-brand-light bg-brand-pale/50">
                    <p className="text-xs text-brand-hover font-medium">
                        {isLoading
                            ? 'Cargando...'
                            : `Mostrando ${filtered.length} de ${employees.length} empleados · ${totalAssigned} asignaciones · ${totalUnassigned} sin tareas`}
                    </p>
                </div>
            </div>

        </main>
    )
}
