import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useOnboardingTemplates from '../../hooks/useOnboardingTemplates';

const COLUMNS = ['Nombre', 'Descripción', 'Estado', 'Acciones'];

export default function OnboardingHome() {
    const { templates, loadingTemplates, templatesError, refetchTemplates } = useOnboardingTemplates();
    const navigate = useNavigate();

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Templates de onboarding</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Gestioná los templates.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/createtemplatepage')}
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo template
                </button>
            </div>

            {templatesError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500 mb-4">
                    {templatesError}
                    <button onClick={refetchTemplates} className="ml-2 underline">Reintentar</button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
                {loadingTemplates ? (
                    <div className="px-6 py-12 text-center text-sm text-slate-400">Cargando plantillas...</div>
                ) : templates.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-400 mb-3">No hay templates creados todavía.</p>
                        <button
                            onClick={() => navigate('/createtemplatepage')}
                            className="text-sm text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer"
                        >
                            + Crear el primer template
                        </button>
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
                                {templates.map((tpl, i) => (
                                    <tr
                                        key={tpl.id}
                                        onClick={() => navigate(`/onboarding-template/${tpl.id}`)}
                                        className={`cursor-pointer transition-colors hover:bg-brand-pale/50 ${
                                            i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                        }`}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-800">{tpl.name}</td>
                                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{tpl.description || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                tpl.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {tpl.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => navigate(`/onboarding-template/${tpl.id}`)}
                                                className="text-brand hover:text-brand-hover text-xs font-medium transition-colors cursor-pointer"
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
