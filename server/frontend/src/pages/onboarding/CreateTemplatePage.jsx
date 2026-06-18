import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { createTaskType } from '../../services/taskTypeService';
import { createTask } from '../../services/taskService';

import TemplateInfoForm from './components/TemplateInfoForm';
import TasksSection     from './components/TasksSection';
import TemplatePreview  from './components/TemplatePreview';
import AddTaskModal     from './components/AddTaskModal';

const initialTemplateForm = { name: '', sub_type: '' };
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
        try {
            // 1. Crear la plantilla (TaskType) — si esto falla, no continuamos
            const createdType = await createTaskType({
                name:    templateForm.name.trim(),
                subType: templateForm.sub_type.trim() || null,
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

            // Avisar si alguna tarea no se pudo crear
            const failed = localTasks.filter((_, i) => results[i].status === 'rejected');
            if (failed.length > 0) {
                window.alert(
                    `La plantilla se creó, pero estas tareas no se pudieron guardar: ${failed.map((t) => t.name).join(', ')}`
                );
            }

            // 3. Invalidar cache de tareas para que OnboardingHome se actualice
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });

            navigate('/onboardinghome');
        } catch (err) {
            // Solo llega aquí si falló el POST del TaskType
            console.error(err);
            setSaveError('No se pudo guardar la plantilla. Verificá tu conexión e intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    /* ── Formulario principal ────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="border-l-4 border-brand pl-4">
                        <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                            Nuevo template de plan
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
