import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Clock, ChevronRight, Users, Trash2, RotateCcw, PlusCircle } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { updateTask, createTask, deleteTask } from '../../services/taskService'

const MAX_TASKS = 10

const inputCls = `w-full rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

const durationCls = `w-20 rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  text-center outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

// Contador de IDs locales para tareas nuevas (fuera del componente = no se resetea en re-renders)
let newTaskSeq = 0

/* ─────────────────────────────────────────────────────────── */
export default function OnboardingHome() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: tasks = [], isLoading, isError } = useTasks()

    const [selected, setSelected] = useState(null)

    const [form, setForm] = useState({
        name: '',
        estimatedDuration: '',
    })

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    // Filters
    const [selectedTaskType, setSelectedTaskType] = useState('')
    const [selectedSubType, setSelectedSubType] = useState('')

    // Unique task types
    const taskTypes = useMemo(() => {
        return [
            ...new Set(
                tasks
                    .map((task) => task.taskType?.name)
                    .filter(Boolean)
            ),
        ]
    }, [tasks])

    // Unique sub types based on selected task type
    const subTypes = useMemo(() => {
        return [
            ...new Set(
                tasks
                    .filter((task) =>
                        selectedTaskType
                            ? task.taskType?.name === selectedTaskType
                            : true
                    )
                    .map((task) => task.taskType?.sub_type)
                    .filter(Boolean)
            ),
        ]
    }, [tasks, selectedTaskType])

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesTaskType = selectedTaskType
                ? task.taskType?.name === selectedTaskType
                : true

            const matchesSubType = selectedSubType
                ? task.taskType?.sub_type === selectedSubType
                : true

            return matchesTaskType && matchesSubType
        })
    }, [tasks, selectedTaskType, selectedSubType])

    const handleSelect = (task) => {
        setSelected(task)

        setForm({
            name: task.name ?? '',
            estimatedDuration: task.estimatedDuration ?? '',
        })

        setSaveError('')
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSave = async (e) => {
        e.preventDefault()

        setSaving(true)
        setSaveError('')

        try {
            await updateTask(selected.id, {
                name: form.name,
                estimatedDuration:
                    form.estimatedDuration !== ''
                        ? Number(form.estimatedDuration)
                        : null,
            })

            await queryClient.invalidateQueries({
                queryKey: ['tasks'],
            })

            setSelected(null)
        } catch {
            setSaveError('No se pudo guardar. Verificá los campos e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    // ── Contadores derivados ──────────────────────────────────
    const activeCount = localSiblings.filter((t) => !t._deleted).length
    const deletedCount = localSiblings.filter((t) => t._deleted).length
    const canAddMore = activeCount < MAX_TASKS
    const hasChanges =
        localSiblings.some((t) => t._modified || t._deleted || (t._isNew && t.name.trim() !== ''))

    /* ── JSX ─────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                        Templates de onboarding
                    </h1>

                    <p className="text-xs text-slate-400 mt-0.5">
                        Gestioná los templates de tareas.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/createtemplatepage')}
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo template
                </button>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* Left */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

                    {/* Top */}
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40 flex flex-col gap-4">

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Plantillas ({isLoading ? '…' : filteredTasks.length})
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* Task type */}
                            <p className="text-xs text-slate-400 mt-0.5">
                                Todos los tipos
                            </p>

                            <select
                                value={selectedTaskType}
                                onChange={(e) => {
                                    setSelectedTaskType(e.target.value)
                                    setSelectedSubType('')
                                }}
                                className={inputCls}
                            >
                                <option value="">
                                    Todos los tipos
                                </option>

                                {taskTypes.map((type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {/* Sub type */}
                            <p className="text-xs text-slate-400 mt-0.5">
                                Todos los sub-tipos
                            </p>
                            <select
                                value={selectedSubType}
                                onChange={(e) => setSelectedSubType(e.target.value)}
                                disabled={!selectedTaskType}
                                className={`${inputCls} disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                            >
                                <option value="">
                                    Todos los subtipos
                                </option>

                                {subTypes.map((subType) => (
                                    <option
                                        key={subType}
                                        value={subType}
                                    >
                                        {subType}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="divide-y divide-brand-light">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="px-5 py-4 animate-pulse flex justify-between"
                                >
                                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3.5 bg-slate-200 rounded w-1/5" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (

                        /* Error */
                        <p className="px-5 py-10 text-center text-sm text-red-400">
                            Error al cargar las plantillas.
                        </p>

                    ) : filteredTasks.length === 0 ? (

                        /* Empty */
                        <div className="px-5 py-10 text-center">
                            <p className="text-sm text-slate-500">
                                No hay plantillas para esos filtros.
                            </p>

                            {(selectedTaskType || selectedSubType) && (
                                <button
                                    onClick={() => {
                                        setSelectedTaskType('')
                                        setSelectedSubType('')
                                    }}
                                    className="mt-3 text-xs font-medium text-brand hover:text-brand-hover transition-colors cursor-pointer"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>

                    ) : (

                        /* List */
                        <ul className="divide-y divide-brand-light">
                            {filteredTasks.map((task) => (
                                <li
                                    key={type.id}
                                    onClick={() => handleSelectType(type)}
                                    className={`px-5 py-4 flex items-center justify-between gap-3 cursor-pointer transition-colors
                                        hover:bg-brand-pale/60
                                        ${selected?.id === task.id
                                            ? 'bg-brand-pale border-l-4 border-brand'
                                            : ''
                                        }`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">
                                            {task.name}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 mt-1">

                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={11} />

                                                {task.estimatedDuration != null
                                                    ? `${task.estimatedDuration} días`
                                                    : 'Sin duración estimada'}
                                            </p>

                                            {task.taskType && (
                                                <>
                                                    <span className="text-slate-300 text-xs">•</span>

                                                    <span className="text-xs text-brand font-medium">
                                                        {task.taskType.name}
                                                    </span>

                                                    {task.taskType.sub_type && (
                                                        <span className="text-xs text-slate-400">
                                                            / {task.taskType.sub_type}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight
                                        size={15}
                                        className="text-slate-300 shrink-0"
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Right */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm">

                    {!selected ? (
                        <div className="flex items-center justify-center px-6 py-24 text-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Seleccioná una plantilla
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Hacé clic en una fila para editar sus campos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="flex flex-col">

                            {/* Edit form */}
                            <form
                                onSubmit={handleSave}
                                className="flex flex-col gap-5 p-6"
                            >

                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-bold text-slate-800">
                                        Editar plantilla
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/onboarding-template/${selected.id}`)
                                        }
                                        className="text-xs text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer"
                                    >
                                        Ver asignaciones →
                                    </button>
                                </div>

                                {selected.taskType && (
                                    <div className="text-xs text-slate-400 bg-brand-pale/50 rounded-lg px-3 py-2">
                                        Tipo:{' '}
                                        <span className="font-medium text-slate-600">
                                            {selected.taskType.name}
                                        </span>

                                        {selected.taskType.sub_type &&
                                            ` · ${selected.taskType.sub_type}`}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-slate-500">
                                        Nombre{' '}
                                        <span className="text-red-400">*</span>
                                    </label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={inputCls}
                                        required
                                    />
                                </div>

                                {/* Duration */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-slate-500">
                                        Duración estimada (días)
                                    </label>

                                    <input
                                        type="number"
                                        name="estimatedDuration"
                                        value={form.estimatedDuration}
                                        onChange={handleChange}
                                        min={0}
                                        className={inputCls}
                                        placeholder="Ej. 7"
                                    />
                                </div>

                                {/* Error */}
                                {saveError && (
                                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                                        {saveError}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-light">
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5
                                                   rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                                   px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                                   disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>

                            {/* Sibling tasks */}
                    {selected.taskType && (() => {
                        const siblings = tasks.filter(
                            (t) => t.taskType?.id === selected.taskType.id
                        )

                        return (
                            <div className="p-6 flex flex-col gap-3">

                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Tareas del template "
                                    {selected.taskType.sub_type ??
                                        selected.taskType.name}
                                    " ({siblings.length})
                                </p>

                                <ul className="flex flex-col gap-1.5">
                                    {siblings.map((t) => (
                                        <li
                                            key={t.id}
                                            onClick={() => handleSelect(t)}
                                            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
                                                        cursor-pointer transition-colors hover:bg-brand-pale/60
                                                        ${t.id === selected.id
                                                    ? 'bg-brand-pale ring-1 ring-brand/30'
                                                    : 'bg-slate-50'
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs font-semibold truncate
                                                                ${t.id === selected.id
                                                            ? 'text-brand'
                                                            : 'text-slate-700'
                                                        }`}
                                                >
                                                    {t.name}
                                                </p>
                                            </div>

                                            <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                                                <Clock size={10} />

                                                {t.estimatedDuration != null
                                                    ? `${t.estimatedDuration}d`
                                                    : '—'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })()}

                </div>
                    )}
            </div>

        </div>

            {/* ── Modal: cambios sin guardar ────────────────────── */ }
    {
        discardIntent && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
                onClick={() => setDiscardIntent(null)}
            >
                <div
                    className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-sm mx-4 p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-base font-bold text-slate-800 mb-1">¿Descartar cambios?</h3>
                    <p className="text-sm text-slate-400 mb-5">
                        Tenés cambios sin guardar en <span className="font-semibold text-slate-600">{selectedType?.name}</span>.
                        Si continuás se perderán.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setDiscardIntent(null)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700
                                           px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Seguir editando
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDiscard}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                                           px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Sí, descartar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

        </main >
    )
}