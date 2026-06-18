import { Trash2, Clock } from 'lucide-react';

export default function TaskRow({ task, index, onDelete }) {
    return (
        <tr className={`border-b border-brand-light transition-colors hover:brightness-95
            ${index % 2 === 0 ? 'bg-brand-pale' : 'bg-white'}`}
        >
            {/* Tarea */}
            <td className="px-4 py-3">
                <p className="text-sm font-medium text-slate-700 leading-tight">{task.name}</p>
            </td>

            {/* Vence en X días */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} className="text-slate-300" />
                    {task.estimatedDuration
                        ? `Vence en ${task.estimatedDuration} ${Number(task.estimatedDuration) === 1 ? 'día' : 'días'}`
                        : '—'}
                </span>
            </td>

            {/* Acciones */}
            <td className="px-4 py-3">
                <button
                    type="button"
                    title="Eliminar"
                    onClick={() => onDelete(task._localId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50
                               transition-colors cursor-pointer"
                >
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}
