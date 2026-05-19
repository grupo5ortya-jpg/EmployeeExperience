const ROLE_LABEL = { employee: 'Empleado', leader: 'Líder del equipo', hr: 'RRHH' };

function PreviewTask({ task, index }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-brand-light bg-brand-pale/40">
            <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold
                             flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 leading-tight truncate">
                    {task.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {ROLE_LABEL[task.responsibleRole] ?? task.responsibleRole}
                    {task.dueInDays > 0 && ` · ${task.dueInDays}d`}
                </p>
            </div>
        </div>
    );
}

export default function TemplatePreview({ name, description, tasks }) {
    const sorted = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden lg:sticky lg:top-4">
            <div className="px-5 py-4 border-b border-brand-light bg-brand-pale/40">
                <h3 className="text-sm font-bold text-slate-700">Vista previa del template</h3>
            </div>

            <div className="p-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
                {sorted.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                        Las tareas que agregues aparecerán aquí.
                    </p>
                ) : (
                    sorted.map((task, i) => (
                        <PreviewTask key={task._localId} task={task} index={i} />
                    ))
                )}
            </div>

            {(name || description) && (
                <div className="px-4 pb-4">
                    <div className="p-3 rounded-lg bg-brand-pale border border-brand-light">
                        <p className="text-xs font-semibold text-brand mb-1">Información</p>
                        {name && (
                            <p className="text-xs font-medium text-slate-700">{name}</p>
                        )}
                        {description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-3">{description}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
