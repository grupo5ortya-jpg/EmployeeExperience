import { Plus } from 'lucide-react';
import TaskRow from './TaskRow';

const COLUMNS = ['Tarea', 'Duración estimada', 'Acciones'];

export default function TasksSection({ tasks = [], onAddTask, onDeleteTask }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-brand-light">
                <div>
                    <h2 className="text-sm font-bold text-slate-700">Tareas del template</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Definí las tareas que forman parte de esta plantilla.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAddTask}
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                               text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors
                               cursor-pointer shrink-0"
                >
                    <Plus size={14} />
                    Agregar tarea
                </button>
            </div>

            {tasks.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-navy">
                                {COLUMNS.map((col) => (
                                    <th key={col} className="text-left text-xs font-semibold text-sky-200
                                                             px-4 py-3 whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task, i) => (
                                <TaskRow
                                    key={task._localId}
                                    task={task}
                                    index={i}
                                    onDelete={onDeleteTask}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-400">No hay tareas agregadas todavía.</p>
                    <button
                        type="button"
                        onClick={onAddTask}
                        className="mt-3 text-sm text-brand hover:text-brand-hover
                                   font-medium transition-colors cursor-pointer"
                    >
                        + Agregar la primera tarea
                    </button>
                </div>
            )}
        </div>
    );
}
