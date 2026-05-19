import { Trash2, GripVertical } from 'lucide-react';

const ROLE_LABEL = { employee: 'Empleado', leader: 'Líder del equipo', hr: 'RRHH' };

export default function TaskRow({ task, index, onDelete }) {
    return (
        <tr className={`border-b border-brand-light transition-colors hover:brightness-95
            ${index % 2 === 0 ? 'bg-brand-pale' : 'bg-white'}`}
        >
            {/* Orden */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <GripVertical size={14} className="shrink-0" />
                    <span className="text-sm font-semibold text-slate-600">{task.sortOrder}</span>
                </div>
            </td>

            {/* Tarea */}
            <td className="px-4 py-3">
                <p className="text-sm font-medium text-slate-700 leading-tight">{task.title}</p>
                {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                )}
            </td>

            {/* Responsable */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-pale text-brand">
                    {ROLE_LABEL[task.responsibleRole] ?? task.responsibleRole}
                </span>
            </td>

            {/* Días */}
            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                {task.dueInDays} {task.dueInDays === 1 ? 'día' : 'días'}
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
