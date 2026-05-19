import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useOnboardingTemplateById from '../../hooks/useOnboardingTemplateById';

const ROLE_LABEL = { employee: 'Empleado', leader: 'Líder del equipo', hr: 'RRHH' };
const COLUMNS = ['Orden', 'Tarea', 'Descripción', 'Responsable', 'Días desde ingreso'];

export default function TemplateDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: template, isLoading: loadingTemplate, isError, refetch: refetchTemplate } = useOnboardingTemplateById(id);

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <button
                onClick={() => navigate('/onboardinghome')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} />
                Volver a plantillas
            </button>

            {loadingTemplate && (
                <div className="text-sm text-slate-400">Cargando plantilla...</div>
            )}

            {isError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">
                    No se pudo cargar la plantilla.
                    <button onClick={refetchTemplate} className="ml-2 underline">Reintentar</button>
                </div>
            )}

            {template && (
                <div className="flex flex-col gap-5">
                    <div className="border-l-4 border-brand pl-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg lg:text-xl font-bold text-slate-800">{template.name}</h1>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                template.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {template.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        {template.description && (
                            <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-brand-light bg-brand-pale/40">
                            <h2 className="text-sm font-bold text-slate-700">
                                Tareas ({template.tasks?.length ?? 0})
                            </h2>
                        </div>

                        {!template.tasks?.length ? (
                            <div className="px-6 py-12 text-center text-sm text-slate-400">
                                Esta plantilla no tiene tareas.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-navy">
                                            {COLUMNS.map((col) => (
                                                <th key={col} className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...template.tasks]
                                            .sort((a, b) => a.sortOrder - b.sortOrder)
                                            .map((task, i) => (
                                                <tr key={task.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{task.sortOrder}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{task.title}</td>
                                                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{task.description || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-brand-pale text-brand font-medium">
                                                            {ROLE_LABEL[task.responsibleRole] ?? task.responsibleRole}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {task.dueInDays > 0 ? `${task.dueInDays} días` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
