import { ChevronRight, Lock, Unlock, Trash2 } from 'lucide-react'

export default function TemplateListItem({
    type, isSelected, onSelect,
    isSystem, isToggling, onToggleProtected, onRequestDelete,
}) {
    return (
        <li
            onClick={() => onSelect(type)}
            className={`px-5 py-4 flex items-center justify-between gap-3 cursor-pointer transition-colors
                hover:bg-brand-pale/60 group
                ${isSelected ? 'bg-brand-pale border-l-4 border-brand' : ''}`}
        >
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">{type.name}</p>
                {type.sub_type && (
                    <p className="text-xs text-slate-400 mt-0.5">{type.sub_type}</p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-brand bg-brand-pale px-2 py-0.5 rounded-full">
                    {type.taskCount} {type.taskCount === 1 ? 'tarea' : 'tareas'}
                </span>
                <button
                    type="button"
                    onClick={(e) => onToggleProtected(e, type)}
                    disabled={isSystem || isToggling}
                    className={`p-0.5 rounded transition-all ${
                        isSystem
                            ? 'text-slate-300 cursor-not-allowed'
                            : type.is_protected
                                ? 'text-slate-400 hover:text-brand cursor-pointer'
                                : 'opacity-0 group-hover:opacity-100 text-slate-300 hover:text-brand cursor-pointer'
                    } disabled:opacity-100`}
                    title={
                        isSystem
                            ? 'Template protegido por el sistema'
                            : type.is_protected
                                ? 'Quitar protección'
                                : 'Proteger template (no se podrá eliminar)'
                    }
                >
                    {type.is_protected ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (!type.is_protected) onRequestDelete(type) }}
                    disabled={type.is_protected}
                    className={`p-0.5 rounded transition-all ${
                        type.is_protected
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 cursor-pointer'
                    }`}
                    title={type.is_protected ? 'Template protegido — no se puede eliminar' : 'Eliminar template'}
                >
                    <Trash2 size={14} />
                </button>
                <ChevronRight size={15} className="text-slate-300" />
            </div>
        </li>
    )
}
