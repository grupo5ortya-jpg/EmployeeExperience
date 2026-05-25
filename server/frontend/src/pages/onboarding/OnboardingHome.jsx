import { useState, useMemo } from 'react'
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
    const navigate    = useNavigate()
    const queryClient = useQueryClient()
    const { data: tasks = [], isLoading, isError } = useTasks()

    // ── Estado del panel derecho ──────────────────────────────
    const [selectedType,  setSelectedType]  = useState(null)
    const [localSiblings, setLocalSiblings] = useState([])   // copia editable de las tareas
    const [saving,        setSaving]        = useState(false)
    const [saveError,     setSaveError]     = useState('')

    // ── Guard: cambios sin guardar ────────────────────────────
    // discardIntent = null (nada pendiente) | 'CLOSE' (cerrar panel) | TaskType (cambiar a otro)
    const [discardIntent, setDiscardIntent] = useState(null)

    // ── Derivar TaskTypes únicos desde las tareas ─────────────
    const taskTypes = useMemo(() => {
        const map = {}
        tasks.forEach((t) => {
            if (!t.taskType) return
            if (!map[t.taskType.id]) map[t.taskType.id] = { ...t.taskType, taskCount: 0 }
            map[t.taskType.id].taskCount++
        })
        return Object.values(map)
    }, [tasks])

    // ── Clave única por tarea (DB id para existentes, _localId para nuevas) ──
    const getKey = (t) => t._isNew ? t._localId : t.id

    // ── Cargar una plantilla en el editor (sin guard) ─────────
    const doSelectType = (type) => {
        const siblings = tasks.filter((t) => t.taskType?.id === type.id)
        setSelectedType(type)
        setLocalSiblings(siblings.map((t) => ({
            id:                t.id,
            name:              t.name,
            estimatedDuration: t.estimatedDuration ?? '',
            _isNew:            false,
            _modified:         false,
            _deleted:          false,
        })))
        setSaveError('')
        setDiscardIntent(null)
    }

    // ── Seleccionar un tipo de plantilla (con guard) ──────────
    const handleSelectType = (type) => {
        if (hasChanges && selectedType && selectedType.id !== type.id) {
            setDiscardIntent(type)
            return
        }
        doSelectType(type)
    }

    // ── Cancelar edición (con guard si hay cambios) ───────────
    const handleCancelEdit = () => {
        if (hasChanges) {
            setDiscardIntent('CLOSE')
        } else {
            setSelectedType(null)
        }
    }

    // ── Confirmar descarte de cambios ─────────────────────────
    const handleConfirmDiscard = () => {
        if (discardIntent === 'CLOSE') {
            setSelectedType(null)
            setDiscardIntent(null)
        } else {
            doSelectType(discardIntent)
        }
    }

    // ── Agregar nueva fila (nueva tarea aún no persistida) ────
    const handleAddNewTask = () => {
        newTaskSeq += 1
        setLocalSiblings((prev) => [
            ...prev,
            {
                _localId:          `new-${newTaskSeq}`,
                _isNew:            true,
                _deleted:          false,
                name:              '',
                estimatedDuration: '',
            },
        ])
    }

    // ── Editar campo de cualquier tarea ──────────────────────
    const updateSibling = (key, field, value) =>
        setLocalSiblings((prev) =>
            prev.map((t) => getKey(t) === key ? { ...t, [field]: value, _modified: true } : t)
        )

    // ── Eliminar tarea ────────────────────────────────────────
    // Tareas nuevas (_isNew): se remueven directo del array (nunca existieron en DB)
    // Tareas existentes: soft-delete con strikethrough + opción de deshacer
    const markDeleted = (key) =>
        setLocalSiblings((prev) => {
            const task = prev.find((t) => getKey(t) === key)
            if (task?._isNew) return prev.filter((t) => getKey(t) !== key)
            return prev.map((t) => getKey(t) === key ? { ...t, _deleted: true } : t)
        })

    const undoDelete = (key) =>
        setLocalSiblings((prev) =>
            prev.map((t) => getKey(t) === key ? { ...t, _deleted: false } : t)
        )

    // ── Guardar todos los cambios ─────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError('')
        try {
            // PATCH tareas existentes modificadas (no eliminadas)
            const toUpdate = localSiblings.filter((t) => !t._isNew && t._modified && !t._deleted)
            await Promise.all(toUpdate.map((t) =>
                updateTask(t.id, {
                    name:              t.name,
                    estimatedDuration: t.estimatedDuration !== '' ? Number(t.estimatedDuration) : null,
                })
            ))

            // DELETE tareas existentes marcadas
            const toDelete = localSiblings.filter((t) => !t._isNew && t._deleted)
            await Promise.all(toDelete.map((t) => deleteTask(t.id)))

            // POST tareas nuevas con nombre cargado (filas vacías se ignoran)
            const toCreate = localSiblings.filter((t) => t._isNew && !t._deleted && t.name.trim())
            await Promise.all(toCreate.map((t) =>
                createTask({
                    name:              t.name.trim(),
                    taskTypeId:        selectedType.id,
                    estimatedDuration: t.estimatedDuration !== '' ? Number(t.estimatedDuration) : null,
                })
            ))

            await queryClient.invalidateQueries({ queryKey: ['tasks'] })
            setSelectedType(null)
        } catch {
            setSaveError('No se pudo guardar. Verificá los campos e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    // ── Contadores derivados ──────────────────────────────────
    const activeCount  = localSiblings.filter((t) => !t._deleted).length
    const deletedCount = localSiblings.filter((t) => t._deleted).length
    const canAddMore   = activeCount < MAX_TASKS
    const hasChanges   =
        localSiblings.some((t) => t._modified || t._deleted || (t._isNew && t.name.trim() !== ''))

    /* ── JSX ─────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Templates de onboarding</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Gestioná los templates de tareas.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => navigate('/all-assignments')}
                        className="flex items-center gap-1.5 border border-brand text-brand hover:bg-brand-pale
                                   text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <Users size={16} />
                        Ver asignaciones
                    </button>
                    <button
                        onClick={() => navigate('/createtemplatepage')}
                        className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                                   text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <Plus size={16} />
                        Nuevo template
                    </button>
                </div>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* ── Izquierda: lista de plantillas (TaskTypes) ── */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Plantillas ({isLoading ? '…' : taskTypes.length})
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="divide-y divide-brand-light">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="px-5 py-4 animate-pulse flex justify-between">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                                    </div>
                                    <div className="h-5 w-8 bg-slate-200 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <p className="px-5 py-10 text-center text-sm text-red-400">Error al cargar las plantillas.</p>
                    ) : taskTypes.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-400">No hay plantillas todavía.</p>
                    ) : (
                        <ul className="divide-y divide-brand-light">
                            {taskTypes.map((type) => (
                                <li
                                    key={type.id}
                                    onClick={() => handleSelectType(type)}
                                    className={`px-5 py-4 flex items-center justify-between gap-3 cursor-pointer transition-colors
                                        hover:bg-brand-pale/60
                                        ${selectedType?.id === type.id ? 'bg-brand-pale border-l-4 border-brand' : ''}`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{type.name}</p>
                                        {type.sub_type && (
                                            <p className="text-xs text-slate-400 mt-0.5">{type.sub_type}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-semibold text-brand bg-brand-pale px-2 py-0.5 rounded-full">
                                            {type.taskCount} {type.taskCount === 1 ? 'tarea' : 'tareas'}
                                        </span>
                                        <ChevronRight size={15} className="text-slate-300" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ── Derecha: editor de plantilla ── */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm">
                    {!selectedType ? (
                        <div className="flex items-center justify-center px-6 py-24 text-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Seleccioná una plantilla</p>
                                <p className="text-xs text-slate-400 mt-1">Hacé clic en una fila para ver y editar sus tareas.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="flex flex-col">

                            {/* Header del panel */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-brand-light">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800">{selectedType.name}</h2>
                                    {selectedType.sub_type && (
                                        <p className="text-xs text-slate-400 mt-0.5">{selectedType.sub_type}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const first = tasks.find(t => t.taskType?.id === selectedType.id)
                                        if (first) navigate(`/onboarding-template/${first.id}`)
                                    }}
                                    className="text-xs text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer"
                                >
                                    Ver asignaciones →
                                </button>
                            </div>

                            {/* Lista de tareas */}
                            <div className="px-6 py-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Tareas ({activeCount}/{MAX_TASKS}{deletedCount > 0 && `, ${deletedCount} a eliminar`})
                                    </p>
                                    <p className="text-xs text-slate-400">días est.</p>
                                </div>

                                {/* Todas las tareas (existentes + nuevas) */}
                                {localSiblings.map((t) => {
                                    const key = getKey(t)
                                    return t._deleted ? (
                                        /* Tarea marcada para eliminar (solo existentes) */
                                        <div key={key} className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                                            <p className="flex-1 text-xs text-red-400 line-through truncate">{t.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => undoDelete(key)}
                                                className="text-slate-400 hover:text-brand transition-colors cursor-pointer shrink-0"
                                                title="Deshacer"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        /* Tarea editable */
                                        <div key={key} className="flex items-center gap-2">
                                            <input
                                                value={t.name}
                                                onChange={(e) => updateSibling(key, 'name', e.target.value)}
                                                placeholder="Nombre de la tarea"
                                                className={`${inputCls} flex-1`}
                                                // required solo en existentes; las nuevas vacías se ignoran al guardar
                                                required={!t._isNew}
                                                autoFocus={t._isNew}
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <input
                                                    type="number"
                                                    value={t.estimatedDuration}
                                                    onChange={(e) => updateSibling(key, 'estimatedDuration', e.target.value)}
                                                    min={0}
                                                    placeholder="—"
                                                    className={durationCls}
                                                />
                                                <Clock size={11} className="text-slate-300" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => markDeleted(key)}
                                                className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                                title={t._isNew ? 'Cancelar' : 'Eliminar tarea'}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )
                                })}

                                {/* Botón agregar tarea */}
                                {canAddMore ? (
                                    <button
                                        type="button"
                                        onClick={handleAddNewTask}
                                        className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-hover
                                                   font-medium transition-colors cursor-pointer mt-1 w-fit"
                                    >
                                        <PlusCircle size={14} />
                                        Agregar tarea
                                    </button>
                                ) : (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Límite de {MAX_TASKS} tareas por plantilla alcanzado.
                                    </p>
                                )}
                            </div>

                            {/* Error */}
                            {saveError && (
                                <div className="mx-6 mb-4">
                                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                                        {saveError}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-brand-light">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5
                                               rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !hasChanges}
                                    className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                               px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>

                        </form>
                    )}
                </div>

            </div>

            {/* ── Modal: cambios sin guardar ────────────────────── */}
            {discardIntent && (
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
            )}

        </main>
    )
}
