import { useState, useMemo }  from 'react'
import { useQueryClient }      from '@tanstack/react-query'
import { Search, CheckCircle2, ClipboardList, UserCheck, AlertCircle } from 'lucide-react'
import { useTasks }            from '../../hooks/useTasks'
import { useEmployees }        from '../../hooks/useEmployees'
import { useAllEmployeeTasks } from '../../hooks/useAllEmployeeTasks'
import { createEmployeeTask }  from '../../services/employeeTaskService'

// "Aprendizaje - curso" es el TaskType singleton de Learning (LXP): sus "tareas" son
// cursos gestionados desde LearningDashboard (/learning-courses), no templates de onboarding.
// Mismo criterio que OnboardingHome.jsx — se oculta también acá.
const HIDDEN_TASK_TYPES = [
    { name: 'Aprendizaje - curso', sub_type: 'Curso' },
]
const isHiddenTemplate = (type) =>
    HIDDEN_TASK_TYPES.some((s) => s.name === type.name && s.sub_type === type.sub_type)

/* ── Helpers ──────────────────────────────────────────────── */
const AVATAR_COLORS = [
    'bg-sky-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]
function avatarColor(name = '') {
    let h = 0
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function Initials({ firstName = '', lastName = '' }) {
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    return (
        <span className={`w-8 h-8 rounded-full flex items-center justify-center
            text-xs font-bold text-white shrink-0 ${avatarColor(firstName + lastName)}`}>
            {initials || '?'}
        </span>
    )
}

/* ── Página ───────────────────────────────────────────────── */
export default function AssignTemplatePage() {
    const qc = useQueryClient()

    const { data: tasks = [],       isLoading: loadingTasks }     = useTasks()
    const { data: employees = [],   isLoading: loadingEmployees } = useEmployees()
    const { data: allEmpTasks = [] }                              = useAllEmployeeTasks()

    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [templateSearch,   setTemplateSearch]   = useState('')
    const [employeeSearch,   setEmployeeSearch]   = useState('')
    const [selectedIds,      setSelectedIds]      = useState(new Set())
    const [assigning,        setAssigning]        = useState(false)
    const [successCount,     setSuccessCount]     = useState(null)
    const [error,            setError]            = useState('')

    /* ── Templates derivados de tasks ───────────────────────── */
    const templates = useMemo(() => {
        const map = {}
        tasks.forEach((t) => {
            if (!t.taskType) return
            if (isHiddenTemplate(t.taskType)) return
            const { id, name, sub_type } = t.taskType
            if (!map[id]) map[id] = { id, name, sub_type, count: 0 }
            map[id].count++
        })
        return Object.values(map)
    }, [tasks])

    const filteredTemplates = useMemo(() => {
        const q = templateSearch.toLowerCase()
        return templates.filter((tt) =>
            !q || tt.name.toLowerCase().includes(q) || tt.sub_type?.toLowerCase().includes(q)
        )
    }, [templates, templateSearch])

    /* ── Empleados activos ──────────────────────────────────── */
    const activeEmployees = useMemo(
        () => employees.filter((e) => e.status === 'ACTIVE'),
        [employees],
    )

    /* ── IDs ya completamente asignados para el template ────── */
    const fullyAssignedIds = useMemo(() => {
        if (!selectedTemplate) return new Set()
        const templateTaskIds = new Set(
            tasks.filter((t) => t.taskType?.id === selectedTemplate.id).map((t) => t.id)
        )
        const result = new Set()
        if (templateTaskIds.size === 0) return result
        activeEmployees.forEach((emp) => {
            const empTaskIds = new Set(
                allEmpTasks.filter((et) => et.employeeId === emp.id).map((et) => et.taskId)
            )
            if ([...templateTaskIds].every((id) => empTaskIds.has(id))) result.add(emp.id)
        })
        return result
    }, [selectedTemplate, tasks, allEmpTasks, activeEmployees])

    /* ── Empleados filtrados por búsqueda ───────────────────── */
    const filteredEmployees = useMemo(() => {
        const q = employeeSearch.toLowerCase()
        return activeEmployees.filter((e) =>
            !q ||
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
            e.department?.name?.toLowerCase().includes(q)
        )
    }, [activeEmployees, employeeSearch])

    const availableEmployees = filteredEmployees.filter((e) => !fullyAssignedIds.has(e.id))

    /* ── Handlers ───────────────────────────────────────────── */
    const handleSelectTemplate = (tt) => {
        setSelectedTemplate(tt)
        setSelectedIds(new Set())
        setSuccessCount(null)
        setError('')
        setEmployeeSearch('')
    }

    const toggle = (id) => {
        if (fullyAssignedIds.has(id)) return
        setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    }

    const selectAll  = () => setSelectedIds(new Set(availableEmployees.map((e) => e.id)))
    const clearAll   = () => setSelectedIds(new Set())

    const handleAssign = async () => {
        if (!selectedTemplate || selectedIds.size === 0) return
        setAssigning(true)
        setError('')
        setSuccessCount(null)
        const firstTaskId = tasks.find((t) => t.taskType?.id === selectedTemplate.id)?.id
        try {
            await Promise.all(
                [...selectedIds].map((empId) =>
                    createEmployeeTask({ employeeId: empId, taskId: firstTaskId })
                )
            )
            await qc.invalidateQueries({ queryKey: ['employee-tasks', 'all'] })
            setSuccessCount(selectedIds.size)
            setSelectedIds(new Set())
        } catch {
            setError('No se pudo completar la asignación. Intentá de nuevo.')
        } finally {
            setAssigning(false)
        }
    }

    /* ── JSX ─────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Asignar template</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    Elegí un template y seleccioná los empleados que lo recibirán.
                </p>
            </div>

            {/* Dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

                {/* ── Columna izquierda: Templates (2/5) ───────── */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

                    {/* Header col */}
                    <div className="px-4 py-3 border-b border-brand-light bg-brand-pale/40">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            1. Elegí el template
                        </p>
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                placeholder="Buscar template..."
                                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-brand-light
                                           bg-white text-slate-700 placeholder:text-slate-400
                                           outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {/* Lista de templates */}
                    {loadingTasks ? (
                        <div className="divide-y divide-brand-light">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="px-4 py-3.5 animate-pulse flex justify-between">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <p className="px-4 py-10 text-center text-xs text-slate-400">
                            {templates.length === 0 ? 'No hay templates creados.' : 'Sin resultados.'}
                        </p>
                    ) : (
                        <ul className="divide-y divide-brand-light">
                            {filteredTemplates.map((tt) => {
                                const isSelected = selectedTemplate?.id === tt.id
                                return (
                                    <li
                                        key={tt.id}
                                        onClick={() => handleSelectTemplate(tt)}
                                        className={`px-4 py-3.5 flex items-center justify-between gap-3
                                            cursor-pointer transition-colors hover:bg-brand-pale/50
                                            ${isSelected ? 'bg-brand-pale border-l-4 border-brand' : ''}`}
                                    >
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate
                                                ${isSelected ? 'text-brand' : 'text-slate-700'}`}>
                                                {tt.name}
                                            </p>
                                            {tt.sub_type && (
                                                <p className="text-xs text-slate-400 mt-0.5">{tt.sub_type}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                                            ${isSelected ? 'bg-brand text-white' : 'bg-brand-pale text-brand'}`}>
                                            {tt.count} {tt.count === 1 ? 'tarea' : 'tareas'}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

                {/* ── Columna derecha: Empleados (3/5) ─────────── */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

                    {!selectedTemplate ? (
                        /* Placeholder */
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-brand-pale flex items-center justify-center">
                                <ClipboardList size={22} className="text-brand/50" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Seleccioná un template para ver los empleados
                            </p>
                            <p className="text-xs text-slate-400">
                                Los empleados ya asignados a ese template aparecerán marcados.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header col */}
                            <div className="px-4 py-3 border-b border-brand-light bg-brand-pale/40">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        2. Seleccioná empleados
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {availableEmployees.length > 0 && (
                                            selectedIds.size > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={clearAll}
                                                    className="text-xs font-medium text-slate-400 hover:text-slate-600
                                                               transition-colors cursor-pointer"
                                                >
                                                    Limpiar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={selectAll}
                                                    className="text-xs font-medium text-brand hover:text-brand-hover
                                                               transition-colors cursor-pointer"
                                                >
                                                    Seleccionar todos
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        placeholder="Buscar empleado o departamento..."
                                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-brand-light
                                                   bg-white text-slate-700 placeholder:text-slate-400
                                                   outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    />
                                </div>
                            </div>

                            {/* Banner de éxito */}
                            {successCount !== null && (
                                <div className="mx-4 mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200
                                                rounded-lg px-3 py-2.5">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <p className="text-xs font-semibold text-emerald-700">
                                        Template asignado a {successCount} empleado{successCount !== 1 ? 's' : ''} correctamente.
                                    </p>
                                </div>
                            )}

                            {/* Banner de error */}
                            {error && (
                                <div className="mx-4 mt-3 flex items-center gap-2 bg-red-50 border border-red-200
                                                rounded-lg px-3 py-2.5">
                                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                                    <p className="text-xs font-semibold text-red-500">{error}</p>
                                </div>
                            )}

                            {/* Lista de empleados */}
                            {loadingEmployees ? (
                                <div className="divide-y divide-brand-light">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3 bg-slate-200 rounded w-2/5" />
                                                <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <p className="px-4 py-10 text-center text-xs text-slate-400">
                                    Sin resultados para esa búsqueda.
                                </p>
                            ) : (
                                <ul className="divide-y divide-brand-light">
                                    {filteredEmployees.map((emp) => {
                                        const assigned  = fullyAssignedIds.has(emp.id)
                                        const checked   = selectedIds.has(emp.id)
                                        const fullName  = `${emp.firstName} ${emp.lastName}`

                                        return (
                                            <li
                                                key={emp.id}
                                                onClick={() => toggle(emp.id)}
                                                className={`px-4 py-3 flex items-center gap-3 transition-colors
                                                    ${assigned
                                                        ? 'opacity-50 cursor-default'
                                                        : 'cursor-pointer hover:bg-brand-pale/40'}
                                                    ${checked ? 'bg-brand-pale/60' : ''}`}
                                            >
                                                <Initials firstName={emp.firstName} lastName={emp.lastName} />

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate
                                                        ${checked ? 'text-brand' : 'text-slate-700'}`}>
                                                        {fullName}
                                                    </p>
                                                    {emp.department?.name && (
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {emp.department.name}
                                                        </p>
                                                    )}
                                                </div>

                                                {assigned ? (
                                                    <span className="flex items-center gap-1 text-xs font-medium
                                                                     text-emerald-600 bg-emerald-50 px-2 py-0.5
                                                                     rounded-full shrink-0">
                                                        <UserCheck size={11} />
                                                        Ya asignado
                                                    </span>
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center
                                                        justify-center shrink-0 transition-colors
                                                        ${checked
                                                            ? 'bg-brand border-brand'
                                                            : 'border-slate-300 bg-white'}`}
                                                    >
                                                        {checked && (
                                                            <svg viewBox="0 0 12 9" className="w-3 h-3 fill-white">
                                                                <path d="M1 4l3.5 3.5L11 1" stroke="white" strokeWidth="1.8"
                                                                      fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}

                            {/* Footer con botón asignar */}
                            <div className="px-4 py-3 border-t border-brand-light bg-white flex items-center justify-between gap-3">
                                <p className="text-xs text-slate-400">
                                    {selectedIds.size > 0
                                        ? <span className="font-semibold text-brand">{selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}</span>
                                        : `${availableEmployees.length} disponible${availableEmployees.length !== 1 ? 's' : ''}`
                                    }
                                </p>
                                <button
                                    type="button"
                                    onClick={handleAssign}
                                    disabled={selectedIds.size === 0 || assigning}
                                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                                               text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors
                                               cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {assigning ? 'Asignando...' : `Asignar${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </main>
    )
}
