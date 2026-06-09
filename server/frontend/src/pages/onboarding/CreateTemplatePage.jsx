import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

import { createTaskType } from '../../services/taskTypeService';
import { createTask } from '../../services/taskService';

import TemplateInfoForm from './components/TemplateInfoForm';
import TasksSection     from './components/TasksSection';
import TemplatePreview  from './components/TemplatePreview';
import AddTaskModal     from './components/AddTaskModal';

const initialTemplateForm = { name: '', sub_type: '', defaultDueDays: '' };
const initialTaskForm     = { name: '', estimatedDuration: '' };

let localIdCounter = 0;

const CreateTemplatePage = () => {
    const navigate     = useNavigate();
    const queryClient  = useQueryClient();

    const [templateForm,    setTemplateForm]    = useState(initialTemplateForm);
    const [localTasks,      setLocalTasks]      = useState([]);
    const [taskForm,        setTaskForm]        = useState(initialTaskForm);
    const [isAddTaskOpen,   setIsAddTaskOpen]   = useState(false);
    const [saving,          setSaving]          = useState(false);
    const [saveError,       setSaveError]       = useState('');
    const [saved,           setSaved]           = useState(false);
    const [failedTasks,     setFailedTasks]     = useState([]);   // tareas que no se pudieron crear
    const [confirmCancel,   setConfirmCancel]   = useState(false);

    /* ── Handlers ────────────────────────────────────────────── */
    const handleTemplateChange = (e) => {
        const { name, value } = e.target;
        setTemplateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleTaskChange = (e) => {
        setTaskForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddTask = (form) => {
        localIdCounter += 1;
        setLocalTasks((prev) => [
            ...prev,
            {
                _localId:          localIdCounter,
                name:              form.name,
                estimatedDuration: form.estimatedDuration !== '' ? Number(form.estimatedDuration) : null,
            },
        ]);
        setTaskForm(initialTaskForm);
    };

    const handleDeleteTask = (localId) => {
        setLocalTasks((prev) => prev.filter((t) => t._localId !== localId));
    };

    /* ── Guardar: 1) POST /task-type  2) POST /task (×N) ─────── */
    const handleSave = async (e) => {
        e.preventDefault();
        if (!templateForm.name.trim()) return;

        setSaving(true);
        setSaveError('');
        setFailedTasks([]);
        try {
            // 1. Crear la plantilla (TaskType) — si esto falla, no continuamos
            const createdType = await createTaskType({
                name:          templateForm.name.trim(),
                sub_type:      templateForm.sub_type.trim() || null,
                defaultDueDays: templateForm.defaultDueDays !== ''
                    ? Number(templateForm.defaultDueDays)
                    : null,
            });

            // 2. Crear todas las tareas en paralelo; usamos allSettled para no abortar
            //    ante el primer fallo — queremos saber cuáles fallaron individualmente.
            const results = await Promise.allSettled(
                localTasks.map((task) =>
                    createTask({
                        name:              task.name,
                        taskTypeId:        createdType.id,
                        estimatedDuration: task.estimatedDuration ?? null,
                    })
                )
            );

            // Detectar tareas que no se pudieron crear
            const failed = localTasks.filter((_, i) => results[i].status === 'rejected');

            // 3. Invalidar cache de tareas para que OnboardingHome se actualice
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });

            // Pasar a pantalla de éxito (con o sin advertencia de tareas fallidas)
            setFailedTasks(failed);
            setSaved(true);
            setTemplateForm(initialTemplateForm);
            setLocalTasks([]);
        } catch (err) {
            // Solo llega aquí si falló el POST del TaskType
            console.error(err);
            setSaveError('No se pudo guardar la plantilla. Verificá tu conexión e intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setTemplateForm(initialTemplateForm);
        setLocalTasks([]);
        setSaveError('');
        setFailedTasks([]);
        setSaved(false);
    };

    /* ── Pantalla de éxito ───────────────────────────────────── */
    if (saved) {
        const hasWarning = failedTasks.length > 0;
        return (
            <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
                <div className="text-center max-w-sm w-full">
                    {/* Ícono */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4
                        ${hasWarning ? 'bg-amber-100' : 'bg-green-100'}`}>
                        {hasWarning ? (
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        ) : (
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>

                    {/* Título */}
                    <h2 className="text-base font-bold text-slate-800 mb-1">
                        {hasWarning ? 'Plantilla creada con advertencias' : '¡Plantilla guardada!'}
                    </h2>

                    {/* Descripción */}
                    {hasWarning ? (
                        <div className="text-left bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                            <p className="text-sm text-amber-700 font-medium mb-2">
                                La plantilla se creó, pero las siguientes tareas no pudieron guardarse:
                            </p>
                            <ul className="space-y-1">
                                {failedTasks.map((t) => (
                                    <li key={t._localId} className="text-xs text-amber-600 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                        {t.name}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-amber-500 mt-2">
                                Podés agregarlas desde la pantalla de plantillas.
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 mb-5">
                            La plantilla fue creada correctamente.
                        </p>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-3 justify-center">
                        <button
                            onClick={handleReset}
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

    /* ── Formulario principal ────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="border-l-4 border-brand pl-4">
                        <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                            Nuevo template de onboarding
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Creá una plantilla con sus tareas asociadas.
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

                {/* Layout tres columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* Izquierda (2/3): info + lista de tareas */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        <TemplateInfoForm form={templateForm} onChange={handleTemplateChange} />
                        <TasksSection
                            tasks={localTasks}
                            onAddTask={() => setIsAddTaskOpen(true)}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>

                    {/* Derecha (1/3): vista previa sticky */}
                    <TemplatePreview
                        name={templateForm.name}
                        sub_type={templateForm.sub_type}
                        tasks={localTasks}
                    />
                </div>

            </form>

            {/* Confirmación de cancelación */}
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

            {/* Modal para agregar tarea */}
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
