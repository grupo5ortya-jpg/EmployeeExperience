import { Clock, RotateCcw, Trash2 } from 'lucide-react'

const inputCls = `w-full rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

const durationCls = `w-20 rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  text-center outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

export default function EditableTaskRow({ task: t, taskKey, autoFocus, onUpdate, onMarkDeleted, onUndoDelete }) {
    if (t._deleted) {
        return (
            /* Tarea marcada para eliminar */
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                <p className="flex-1 text-xs text-red-400 line-through truncate">{t.name}</p>
                <button
                    type="button"
                    onClick={() => onUndoDelete(taskKey)}
                    className="text-slate-400 hover:text-brand transition-colors cursor-pointer shrink-0"
                    title="Deshacer"
                >
                    <RotateCcw size={14} />
                </button>
            </div>
        )
    }

    return (
        /* Tarea editable */
        <div className="flex items-center gap-2">
            <input
                value={t.name}
                onChange={(e) => onUpdate(taskKey, 'name', e.target.value)}
                placeholder="Nombre de la tarea"
                className={`${inputCls} flex-1`}
                required={!t._isNew}
                autoFocus={autoFocus}
            />
            <div className="flex items-center gap-1 shrink-0">
                <input
                    type="number"
                    value={t.estimatedDuration}
                    onChange={(e) => onUpdate(taskKey, 'estimatedDuration', e.target.value)}
                    min={0}
                    placeholder="—"
                    className={durationCls}
                />
                <Clock size={11} className="text-slate-300" />
            </div>
            <button
                type="button"
                onClick={() => onMarkDeleted(taskKey)}
                className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                title={t._isNew ? 'Cancelar' : 'Eliminar tarea'}
            >
                <Trash2 size={15} />
            </button>
        </div>
    )
}
