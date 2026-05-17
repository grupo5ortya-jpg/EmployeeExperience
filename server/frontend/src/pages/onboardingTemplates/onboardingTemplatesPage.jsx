import { useEffect, useMemo, useState } from 'react';
import useOnboardingTemplates from '../../hooks/useOnboardingTemplates';
import useOnboardingTemplateById from '../../hooks/useOnboardingTemplateById';

const OnboardingTemplatesPage = () => {
    const { templates, loadingTemplates, templatesError } = useOnboardingTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const { template, loadingTemplate, templateError } = useOnboardingTemplateById(selectedTemplateId);

    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [templates, selectedTemplateId]);

    const metrics = useMemo(() => {
        const totalTemplates = templates.length;
        const activeTemplates = templates.filter((templateItem) => templateItem.isActive).length;
        const totalTasks = templates.reduce(
            (acc, templateItem) => acc + (templateItem.tasks?.length || 0),
            0
        );
        const averageTasks =
            totalTemplates > 0 ? (totalTasks / totalTemplates).toFixed(1) : 0;

        return {
            totalTemplates,
            activeTemplates,
            totalTasks,
            averageTasks,
        };
    }, [templates]);

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Configuración de plantillas de onboarding
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Vista de RRHH para administrar y consultar plantillas de onboarding.
                    </p>
                </div>

                {loadingTemplates && (
                    <div className="rounded-xl bg-white p-6 shadow">
                        <p className="text-slate-600">Cargando plantillas...</p>
                    </div>
                )}

                {templatesError && (
                    <div className="rounded-xl bg-red-100 p-4 text-red-700 shadow">
                        {templatesError}
                    </div>
                )}

                {!loadingTemplates && !templatesError && (
                    <>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded-2xl bg-white p-5 shadow">
                                <p className="text-sm text-slate-500">Plantillas</p>
                                <p className="mt-2 text-3xl font-bold text-slate-800">
                                    {metrics.totalTemplates}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow">
                                <p className="text-sm text-slate-500">Plantillas activas</p>
                                <p className="mt-2 text-3xl font-bold text-emerald-600">
                                    {metrics.activeTemplates}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow">
                                <p className="text-sm text-slate-500">Tareas totales</p>
                                <p className="mt-2 text-3xl font-bold text-slate-800">
                                    {metrics.totalTasks}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow">
                                <p className="text-sm text-slate-500">Promedio de tareas</p>
                                <p className="mt-2 text-3xl font-bold text-slate-800">
                                    {metrics.averageTasks}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <section className="rounded-2xl bg-white p-4 shadow lg:col-span-1">
                                <h2 className="mb-4 text-xl font-semibold text-slate-800">
                                    Plantillas
                                </h2>

                                <div className="space-y-3">
                                    {templates.map((templateItem) => (
                                        <button
                                            key={templateItem.id}
                                            onClick={() => setSelectedTemplateId(templateItem.id)}
                                            className={`w-full rounded-xl border p-4 text-left transition ${selectedTemplateId === templateItem.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">
                                                        {templateItem.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {templateItem.description || 'Sin descripción'}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${templateItem.isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                >
                                                    {templateItem.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>

                                            <div className="mt-3 text-xs text-slate-500">
                                                {(templateItem.tasks?.length || 0)} tareas
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl bg-white p-4 shadow lg:col-span-2">
                                {!selectedTemplateId && (
                                    <p className="text-slate-500">
                                        Seleccioná una plantilla para ver el detalle.
                                    </p>
                                )}

                                {loadingTemplate && (
                                    <p className="text-slate-500">Cargando detalle...</p>
                                )}

                                {templateError && (
                                    <div className="rounded-xl bg-red-100 p-4 text-red-700">
                                        {templateError}
                                    </div>
                                )}

                                {!loadingTemplate && !templateError && template && (
                                    <div>
                                        <div className="mb-6 border-b border-slate-200 pb-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800">
                                                        {template.name}
                                                    </h2>
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {template.description || 'Sin descripción'}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${template.isActive
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                >
                                                    {template.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-slate-800">
                                                Tareas configuradas
                                            </h3>

                                            {template.tasks?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {template.tasks
                                                        .slice()
                                                        .sort((a, b) => a.sortOrder - b.sortOrder)
                                                        .map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className="rounded-xl border border-slate-200 p-4"
                                                            >
                                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                                                                                #{task.sortOrder}
                                                                            </span>
                                                                            <h4 className="font-semibold text-slate-800">
                                                                                {task.title}
                                                                            </h4>
                                                                        </div>

                                                                        <p className="mt-2 text-sm text-slate-600">
                                                                            {task.description || 'Sin descripción'}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                                                            Responsable: {task.responsibleRole}
                                                                        </span>
                                                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                                                            Vence en: {task.dueInDays} días
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                                                    Esta plantilla no tiene tareas configuradas.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OnboardingTemplatesPage;