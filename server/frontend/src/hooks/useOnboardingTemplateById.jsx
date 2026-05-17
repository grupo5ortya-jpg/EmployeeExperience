import { useEffect, useMemo, useState } from 'react';
import useOnboardingTemplates from '../hooks/useOnboardingTemplates';
import useOnboardingTemplateById from '../hooks/useOnboardingTemplateById';
import {
    createOnboardingTemplate,
    createOnboardingTemplateTask,
} from '../services/onboardingService';

const initialTemplateForm = {
    name: '',
    description: '',
    isActive: true,
};

const initialTaskForm = {
    title: '',
    description: '',
    responsibleRole: 'employee',
    dueInDays: 0,
    sortOrder: 1,
};

const OnboardingTemplatesPage = () => {
    const {
        templates,
        loadingTemplates,
        templatesError,
        refetchTemplates,
    } = useOnboardingTemplates();

    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const {
        template,
        loadingTemplate,
        templateError,
        refetchTemplate,
    } = useOnboardingTemplateById(selectedTemplateId);

    const [templateForm, setTemplateForm] = useState(initialTemplateForm);
    const [taskForm, setTaskForm] = useState(initialTaskForm);

    const [submittingTemplate, setSubmittingTemplate] = useState(false);
    const [submittingTask, setSubmittingTask] = useState(false);

    const [templateSubmitError, setTemplateSubmitError] = useState('');
    const [taskSubmitError, setTaskSubmitError] = useState('');

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

    const handleTemplateFormChange = (event) => {
        const { name, value, type, checked } = event.target;

        setTemplateForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTaskFormChange = (event) => {
        const { name, value } = event.target;

        setTaskForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateTemplate = async (event) => {
        event.preventDefault();

        try {
            setSubmittingTemplate(true);
            setTemplateSubmitError('');

            const createdTemplate = await createOnboardingTemplate(templateForm);

            setTemplateForm(initialTemplateForm);

            await refetchTemplates();
            setSelectedTemplateId(createdTemplate.id);
        } catch (error) {
            console.error(error);
            setTemplateSubmitError('No se pudo crear la plantilla');
        } finally {
            setSubmittingTemplate(false);
        }
    };

    const handleCreateTask = async (event) => {
        event.preventDefault();

        if (!selectedTemplateId) return;

        try {
            setSubmittingTask(true);
            setTaskSubmitError('');

            await createOnboardingTemplateTask({
                templateId: selectedTemplateId,
                title: taskForm.title,
                description: taskForm.description,
                responsibleRole: taskForm.responsibleRole,
                dueInDays: Number(taskForm.dueInDays),
                sortOrder: Number(taskForm.sortOrder),
            });

            setTaskForm(initialTaskForm);

            await Promise.all([refetchTemplates(), refetchTemplate()]);
        } catch (error) {
            console.error(error);
            setTaskSubmitError('No se pudo crear la tarea');
        } finally {
            setSubmittingTask(false);
        }
    };

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

                        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-semibold text-slate-800">
                                Crear nueva plantilla
                            </h2>

                            <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-1">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={templateForm.name}
                                        onChange={handleTemplateFormChange}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                        placeholder="Ej. Onboarding líderes"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Activa
                                    </label>
                                    <div className="flex h-[42px] items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={templateForm.isActive}
                                            onChange={handleTemplateFormChange}
                                            className="h-4 w-4"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="description"
                                        value={templateForm.description}
                                        onChange={handleTemplateFormChange}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                        rows="3"
                                        placeholder="Descripción de la plantilla"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={submittingTemplate}
                                        className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                                    >
                                        {submittingTemplate ? 'Creando...' : 'Crear plantilla'}
                                    </button>
                                </div>
                            </form>

                            {templateSubmitError && (
                                <p className="mt-3 text-sm text-red-600">{templateSubmitError}</p>
                            )}
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

                                        <div className="mb-6 rounded-2xl border border-slate-200 p-4">
                                            <h3 className="mb-4 text-lg font-semibold text-slate-800">
                                                Agregar tarea a la plantilla
                                            </h3>

                                            <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Título
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={taskForm.title}
                                                        onChange={handleTaskFormChange}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                        placeholder="Ej. Presentación del equipo"
                                                        required
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Descripción
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={taskForm.description}
                                                        onChange={handleTaskFormChange}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                        rows="3"
                                                        placeholder="Descripción de la tarea"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Responsable
                                                    </label>
                                                    <select
                                                        name="responsibleRole"
                                                        value={taskForm.responsibleRole}
                                                        onChange={handleTaskFormChange}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                    >
                                                        <option value="employee">Employee</option>
                                                        <option value="leader">Leader</option>
                                                        <option value="hr">HR</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Vence en días
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="dueInDays"
                                                        value={taskForm.dueInDays}
                                                        onChange={handleTaskFormChange}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                        min="0"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                                        Orden
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="sortOrder"
                                                        value={taskForm.sortOrder}
                                                        onChange={handleTaskFormChange}
                                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                        min="1"
                                                        required
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <button
                                                        type="submit"
                                                        disabled={submittingTask}
                                                        className="rounded-xl bg-slate-800 px-5 py-2 font-medium text-white transition hover:bg-slate-900 disabled:opacity-60"
                                                    >
                                                        {submittingTask ? 'Creando...' : 'Agregar tarea'}
                                                    </button>
                                                </div>
                                            </form>

                                            {taskSubmitError && (
                                                <p className="mt-3 text-sm text-red-600">{taskSubmitError}</p>
                                            )}
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