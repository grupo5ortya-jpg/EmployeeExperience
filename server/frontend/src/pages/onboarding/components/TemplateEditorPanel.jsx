import { PlusCircle } from 'lucide-react'
import EditableTaskRow from './EditableTaskRow'

const MAX_TASKS = 10

// ── Clave única por tarea ─────────────────────────────────
const getKey = (t) => t._isNew ? t._localId : t.id

export default function TemplateEditorPanel({
    selectedType, localSiblings, lastAddedKey,
    activeCount, deletedCount, canAddMore,
    saving, saveError, hasChanges,
    onSave, onCancel, onViewAssignments,
    onAddNewTask, onUpdateSibling, onMarkDeleted, onUndoDelete,
}) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm">
            {!selectedType ? (
                <div className="flex items-center justify-center px-6 py-24 text-center">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Seleccioná una plantilla</p>
                        <p className="text-xs text-slate-400 mt-1">Hacé clic en una fila para ver y editar sus tareas.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={onSave} className="flex flex-col">

                    {/* Header del panel */}
                    <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-brand-light">
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-800">{selectedType.name}</h2>
                            {selectedType.sub_type && (
                                <p className="text-xs text-slate-400 mt-0.5">{selectedType.sub_type}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onViewAssignments}
                            className="text-xs text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer shrink-0"
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
                            <p className="text-xs text-slate-400">Vence en (días)</p>
                        </div>

                        {localSiblings.map((t) => {
                            const key = getKey(t)
                            return (
                                <EditableTaskRow
                                    key={key}
                                    task={t}
                                    taskKey={key}
                                    autoFocus={t._isNew && key === lastAddedKey}
                                    onUpdate={onUpdateSibling}
                                    onMarkDeleted={onMarkDeleted}
                                    onUndoDelete={onUndoDelete}
                                />
                            )
                        })}

                        {/* Botón agregar */}
                        {canAddMore ? (
                            <button
                                type="button"
                                onClick={onAddNewTask}
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
                            onClick={onCancel}
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
    )
}
