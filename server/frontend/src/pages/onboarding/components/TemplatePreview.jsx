import { Clock } from 'lucide-react';

function PreviewTask({ task, index }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-brand-light bg-brand-pale/40">
            <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold
                             flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 leading-tight truncate">
                    {task.name}
                </p>
                {task.estimatedDuration && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {task.estimatedDuration} {Number(task.estimatedDuration) === 1 ? 'día' : 'días'}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function TemplatePreview({ name, sub_type, tasks }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden lg:sticky lg:top-4">
            <div className="px-5 py-4 border-b border-brand-light bg-brand-pale/40">
                <h3 className="text-sm font-bold text-slate-700">Vista previa</h3>
            </div>

            {/* Info del template */}
            {(name || sub_type) && (
                <div className="px-4 pt-4">
                    <div className="p-3 rounded-lg bg-brand-pale border border-brand-light">
                        {name && (
                            <p className="text-xs font-bold text-brand">{name}</p>
                        )}
                        {sub_type && (
                            <p className="text-xs text-slate-500 mt-0.5">{sub_type}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Lista de tareas */}
            <div className="p-4 flex flex-col gap-2 max-h-[55vh] overflow-y-auto">
                {tasks.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                        Las tareas que agregues aparecerán aquí.
                    </p>
                ) : (
                    tasks.map((task, i) => (
                        <PreviewTask key={task._localId} task={task} index={i} />
                    ))
                )}
            </div>
        </div>
    );
}
