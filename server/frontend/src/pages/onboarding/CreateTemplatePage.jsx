import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createOnboardingTemplate, createOnboardingTemplateTask } from '../../services/onboardingService';

import TemplateInfoForm from './components/TemplateInfoForm';
import TasksSection from './components/TasksSection';
import TemplatePreview from './components/TemplatePreview';
import AddTaskModal from './components/AddTaskModal';

const initialTemplateForm = { name: '', description: '', isActive: true };
const initialTaskForm     = { title: '', description: '', responsibleRole: 'employee', dueInDays: 0, sortOrder: 1 };

let localIdCounter = 0;

const CreateTemplatePage = () => {
    const navigate = useNavigate();
    const [templateForm, setTemplateForm] = useState(initialTemplateForm);
    const [localTasks, setLocalTasks]     = useState([]);
    const [taskForm, setTaskForm]         = useState(initialTaskForm);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [saving, setSaving]             = useState(false);
    const [saveError, setSaveError]       = useState('');
    const [saved, setSaved]               = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleTemplateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTemplateForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleTaskChange = (e) => {
        setTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddTask = (form) => {
        localIdCounter += 1;
        setLocalTasks((prev) => [
            ...prev,
            { ...form, _localId: localIdCounter, sortOrder: Number(form.sortOrder), dueInDays: Number(form.dueInDays) },
        ]);
        setTaskForm({ ...initialTaskForm, sortOrder: localTasks.length + 2 });
    };

    const handleDeleteTask = (localId) => {
        setLocalTasks((prev) => prev.filter((t) => t._localId !== localId));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!templateForm.name.trim()) return;

        setSaving(true);
        setSaveError('');
        try {
            const created = await createOnboardingTemplate({
                name:        templateForm.name,
                description: templateForm.description,
                isActive:    templateForm.isActive,
            });

            const sorted = [...localTasks].sort((a, b) => a.sortOrder - b.sortOrder);
            for (const task of sorted) {
                await createOnboardingTemplateTask({
                    templateId:      created.id,
                    title:           task.title,
                    description:     task.description,
                    responsibleRole: task.responsibleRole,
                    dueInDays:       task.dueInDays,
                    sortOrder:       task.sortOrder,
                });
            }

            setSaved(true);
            setTemplateForm(initialTemplateForm);
            setLocalTasks([]);
        } catch (err) {
            console.error(err);
            setSaveError('No se pudo guardar la plantilla. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTemplateForm(initialTemplateForm);
        setLocalTasks([]);
        setSaveError('');
        setSaved(false);
    };

    if (saved) {
        return (
            <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-800 mb-1">¡Plantilla guardada!</h2>
                    <p className="text-sm text-slate-400 mb-5">La plantilla fue creada correctamente.</p>
                    <div className="flex items-center gap-3 justify-center">
                        <button
                            onClick={handleCancel}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Crear otra plantilla
                        </button>
                        <button
                            onClick={() => navigate('/onboardinghome')}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700
                                       px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Ver plantillas
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="border-l-4 border-brand pl-4">
                        <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                            Nuevo template de onboarding
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Crea un template con las tareas que deberá completar un nuevo colaborador.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setConfirmCancel(true)}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700
                                       px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !templateForm.name.trim()}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                       disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Guardando...' : 'Guardar template'}
                        </button>
                    </div>
                </div>

                {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">
                        {saveError}
                    </div>
                )}

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* Left: form + tasks */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <TemplateInfoForm form={templateForm} onChange={handleTemplateChange} />
                        <TasksSection
                            tasks={localTasks}
                            onAddTask={() => setIsAddTaskOpen(true)}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>

                    {/* Right: preview */}
                    <TemplatePreview
                        name={templateForm.name}
                        description={templateForm.description}
                        tasks={localTasks}
                    />
                </div>

            </form>

            {confirmCancel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
                    onClick={() => setConfirmCancel(false)}
                >
                    <div
                        className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-sm mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-bold text-slate-800 mb-1">¿Cancelar creación?</h3>
                        <p className="text-sm text-slate-400 mb-5">
                            Se perderán los datos ingresados. ¿Querés salir igual?
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setConfirmCancel(false)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700
                                           px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                            >
                                No, seguir editando
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/onboardinghome')}
                                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                                           px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                form={taskForm}
                onChange={handleTaskChange}
                onAdd={handleAddTask}
            />
        </main>
    );
};

export default CreateTemplatePage;
