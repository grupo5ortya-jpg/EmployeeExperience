import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTasks } from '../../hooks/useTasks'
import { updateTask, createTask, deleteTask, deleteTaskType } from '../../services/taskService'
import { updateTaskType } from '../../services/taskTypeService'
import TemplateListPanel from './components/TemplateListPanel'
import TemplateEditorPanel from './components/TemplateEditorPanel'
import DiscardChangesModal from './components/DiscardChangesModal'
import DeleteTemplateModal from './components/DeleteTemplateModal'

const MAX_TASKS = 10

// TaskTypes usadas internamente por el sistema (Onboarding, Offboarding, Learning) —
// siempre protegidas, no se pueden desproteger desde la UI.
const SYSTEM_TASK_TYPES = [
    { name: 'Onboarding estándar', sub_type: 'Checklist' },
    { name: 'Offboarding estándad', sub_type: 'Checklist' },
]
const isSystemTemplate = (type) =>
    SYSTEM_TASK_TYPES.some((s) => s.name === type.name && s.sub_type === type.sub_type)

// "Aprendizaje - curso" es el TaskType singleton de Learning (LXP): sus "tareas" son
// cursos gestionados desde LearningDashboard (/learning-courses), no templates de onboarding.
// Se oculta por completo de esta página (sigue protegido contra borrado a nivel backend).
const HIDDEN_TASK_TYPES = [
    { name: 'Aprendizaje - curso', sub_type: 'Curso' },
]
const isHiddenTemplate = (type) =>
    HIDDEN_TASK_TYPES.some((s) => s.name === type.name && s.sub_type === type.sub_type)

// Contador fuera del componente → no se resetea en re-renders
let newTaskSeq = 0

/* ─────────────────────────────────────────────────────────── */
export default function OnboardingHome() {
    const navigate    = useNavigate()
    const queryClient = useQueryClient()
    const { data: tasks = [], isLoading, isError } = useTasks()

    // ── Estado del panel derecho ──────────────────────────────
    const [selectedType,      setSelectedType]      = useState(null)
    const [localSiblings,     setLocalSiblings]     = useState([])
    const [saving,            setSaving]            = useState(false)
    const [saveError,         setSaveError]         = useState('')

    // Clave de la última tarea nueva agregada (para autoFocus preciso)
    const [lastAddedKey, setLastAddedKey] = useState(null)

    // Guard: discardIntent = null | 'CLOSE' | TaskType
    const [discardIntent,  setDiscardIntent]  = useState(null)
    // Borrar template: null | TaskType
    const [deleteIntent,   setDeleteIntent]   = useState(null)
    const [deleting,       setDeleting]       = useState(false)
    // Blindar/desblindar template: id del TaskType en proceso
    const [togglingId,     setTogglingId]     = useState(null)

    // ── Filtros del panel izquierdo ───────────────────────────
    const [filterName, setFilterName] = useState('')
    const [filterSub,  setFilterSub]  = useState('')

    // ── Derivar TaskTypes únicos ──────────────────────────────
    const taskTypes = useMemo(() => {
        const map = {}
        tasks.forEach((t) => {
            if (!t.taskType) return
            if (isHiddenTemplate(t.taskType)) return
            if (!map[t.taskType.id]) map[t.taskType.id] = { ...t.taskType, taskCount: 0 }
            map[t.taskType.id].taskCount++
        })
        return Object.values(map)
    }, [tasks])

    // Opciones de los selects de filtro
    const typeNames = useMemo(() =>
        [...new Set(taskTypes.map((tt) => tt.name).filter(Boolean))],
        [taskTypes],
    )

    const subTypes = useMemo(() =>
        [...new Set(
            taskTypes
                .filter((tt) => filterName ? tt.name === filterName : true)
                .map((tt) => tt.sub_type)
                .filter(Boolean),
        )],
        [taskTypes, filterName],
    )

    const filteredTypes = useMemo(() =>
        taskTypes.filter((tt) => {
            const okName = filterName ? tt.name === filterName : true
            const okSub  = filterSub  ? tt.sub_type === filterSub : true
            return okName && okSub
        }),
        [taskTypes, filterName, filterSub],
    )

    // ── Clave única por tarea ─────────────────────────────────
    const getKey = (t) => t._isNew ? t._localId : t.id

    // ── Cargar plantilla en el editor (sin guard) ─────────────
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
        setLastAddedKey(null)
    }

    // ── Seleccionar plantilla (con guard) ─────────────────────
    const handleSelectType = (type) => {
        if (hasChanges && selectedType && selectedType.id !== type.id) {
            setDiscardIntent(type)
            return
        }
        doSelectType(type)
    }

    // ── Cancelar edición ──────────────────────────────────────
    const handleCancelEdit = () => {
        if (hasChanges) {
            setDiscardIntent('CLOSE')
        } else {
            setSelectedType(null)
        }
    }

    // ── Confirmar descarte ────────────────────────────────────
    const handleConfirmDiscard = () => {
        if (discardIntent === 'CLOSE') {
            setSelectedType(null)
            setDiscardIntent(null)
        } else {
            doSelectType(discardIntent)
        }
    }

    // ── Confirmar borrado de template ────────────────────────
    const handleConfirmDelete = async () => {
        if (!deleteIntent) return
        setDeleting(true)
        try {
            await deleteTaskType(deleteIntent.id)
            await queryClient.refetchQueries({ queryKey: ['tasks'] })
            if (selectedType?.id === deleteIntent.id) setSelectedType(null)
        } finally {
            setDeleting(false)
            setDeleteIntent(null)
        }
    }

    // ── Blindar / desblindar template ─────────────────────────
    const handleToggleProtected = async (e, type) => {
        e.stopPropagation()
        if (isSystemTemplate(type) || togglingId) return
        setTogglingId(type.id)
        try {
            await updateTaskType(type.id, { isProtected: !type.is_protected })
            await queryClient.refetchQueries({ queryKey: ['tasks'] })
        } finally {
            setTogglingId(null)
        }
    }

    // ── Agregar nueva fila ────────────────────────────────────
    const handleAddNewTask = () => {
        newTaskSeq += 1
        const localId = `new-${newTaskSeq}`
        setLastAddedKey(localId)
        setLocalSiblings((prev) => [
            ...prev,
            {
                _localId:          localId,
                _isNew:            true,
                _deleted:          false,
                name:              '',
                estimatedDuration: '',
            },
        ])
    }

    // ── Editar campo ──────────────────────────────────────────
    const updateSibling = (key, field, value) =>
        setLocalSiblings((prev) =>
            prev.map((t) => getKey(t) === key ? { ...t, [field]: value, _modified: true } : t),
        )

    // ── Eliminar / deshacer ───────────────────────────────────
    const markDeleted = (key) =>
        setLocalSiblings((prev) => {
            const task = prev.find((t) => getKey(t) === key)
            if (task?._isNew) return prev.filter((t) => getKey(t) !== key)
            return prev.map((t) => getKey(t) === key ? { ...t, _deleted: true } : t)
        })

    const undoDelete = (key) =>
        setLocalSiblings((prev) =>
            prev.map((t) => getKey(t) === key ? { ...t, _deleted: false } : t),
        )

    // ── Guardar ───────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError('')
        try {
            // PATCH modificadas
            const toUpdate = localSiblings.filter((t) => !t._isNew && t._modified && !t._deleted)
            await Promise.all(toUpdate.map((t) =>
                updateTask(t.id, {
                    name:              t.name,
                    estimatedDuration: t.estimatedDuration !== '' ? Number(t.estimatedDuration) : null,
                }),
            ))

            // DELETE marcadas
            const toDelete = localSiblings.filter((t) => !t._isNew && t._deleted)
            await Promise.all(toDelete.map((t) => deleteTask(t.id)))

            // POST nuevas con nombre
            const toCreate = localSiblings.filter((t) => t._isNew && !t._deleted && t.name.trim())
            await Promise.all(toCreate.map((t) =>
                createTask({
                    name:              t.name.trim(),
                    taskTypeId:        selectedType.id,
                    estimatedDuration: t.estimatedDuration !== '' ? Number(t.estimatedDuration) : null,
                }),
            ))

            // Refetch y recargar panel con datos frescos (sin cerrar)
            await queryClient.refetchQueries({ queryKey: ['tasks'] })
            const freshTasks    = queryClient.getQueryData(['tasks']) ?? []
            const freshSiblings = freshTasks.filter((t) => t.taskType?.id === selectedType.id)
            setLocalSiblings(freshSiblings.map((t) => ({
                id:                t.id,
                name:              t.name,
                estimatedDuration: t.estimatedDuration ?? '',
                _isNew:            false,
                _modified:         false,
                _deleted:          false,
            })))
            setLastAddedKey(null)
        } catch {
            setSaveError('No se pudo guardar. Verificá los campos e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    // ── Navegar a las asignaciones del template seleccionado ──
    const handleViewAssignments = () => {
        const first = tasks.find((t) => t.taskType?.id === selectedType.id)
        if (first) navigate(`/onboarding-template/${first.id}`)
    }

    // ── Contadores derivados ──────────────────────────────────
    const activeCount  = localSiblings.filter((t) => !t._deleted).length
    const deletedCount = localSiblings.filter((t) => t._deleted).length
    const canAddMore   = activeCount < MAX_TASKS
    const hasChanges    =
        localSiblings.some((t) => t._modified || t._deleted || (t._isNew && t.name.trim() !== ''))

    /* ── JSX ─────────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Gestión de planes</h1>
                <p className="text-xs text-slate-400 mt-0.5">Gestioná los templates de planes de trabajo.</p>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                <TemplateListPanel
                    taskTypes={taskTypes}
                    filteredTypes={filteredTypes}
                    isLoading={isLoading}
                    isError={isError}
                    filterName={filterName}
                    setFilterName={setFilterName}
                    filterSub={filterSub}
                    setFilterSub={setFilterSub}
                    typeNames={typeNames}
                    subTypes={subTypes}
                    selectedType={selectedType}
                    onSelectType={handleSelectType}
                    togglingId={togglingId}
                    onToggleProtected={handleToggleProtected}
                    onRequestDelete={setDeleteIntent}
                />

                <TemplateEditorPanel
                    selectedType={selectedType}
                    localSiblings={localSiblings}
                    lastAddedKey={lastAddedKey}
                    activeCount={activeCount}
                    deletedCount={deletedCount}
                    canAddMore={canAddMore}
                    saving={saving}
                    saveError={saveError}
                    hasChanges={hasChanges}
                    onSave={handleSave}
                    onCancel={handleCancelEdit}
                    onViewAssignments={handleViewAssignments}
                    onAddNewTask={handleAddNewTask}
                    onUpdateSibling={updateSibling}
                    onMarkDeleted={markDeleted}
                    onUndoDelete={undoDelete}
                />

            </div>

            {/* ── Modal: cambios sin guardar ────────────────────── */}
            {discardIntent && (
                <DiscardChangesModal
                    currentTypeName={selectedType?.name}
                    onCancel={() => setDiscardIntent(null)}
                    onConfirm={handleConfirmDiscard}
                />
            )}

            {/* ── Modal: confirmar borrado de template ──────────── */}
            {deleteIntent && (
                <DeleteTemplateModal
                    template={deleteIntent}
                    deleting={deleting}
                    onCancel={() => setDeleteIntent(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}

        </main>
    )
}
