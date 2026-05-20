import { FieldLabel, TextInput, Textarea, Select, SubmitButton } from './FormFields';

const ROLE_OPTIONS = [
    { value: 'employee', label: 'Empleado' },
    { value: 'leader',   label: 'Líder' },
    { value: 'hr',       label: 'RRHH' },
];

export default function TaskForm({ form, onChange, onSubmit, submitting, error, onCancel }) {
    return (
        <div className="rounded-xl border border-brand-light p-4">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Agregar tarea</h3>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                    <FieldLabel>Título</FieldLabel>
                    <TextInput
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        placeholder="Ej. Presentación del equipo"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <FieldLabel>Descripción</FieldLabel>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        placeholder="Descripción de la tarea"
                        rows={2}
                    />
                </div>

                <div>
                    <FieldLabel>Responsable</FieldLabel>
                    <Select
                        name="responsibleRole"
                        value={form.responsibleRole}
                        onChange={onChange}
                        options={ROLE_OPTIONS}
                    />
                </div>

                <div>
                    <FieldLabel>Vence en (días)</FieldLabel>
                    <TextInput
                        type="number"
                        name="dueInDays"
                        value={form.dueInDays}
                        onChange={onChange}
                        min="0"
                        required
                    />
                </div>

                <div>
                    <FieldLabel>Orden</FieldLabel>
                    <TextInput
                        type="number"
                        name="sortOrder"
                        value={form.sortOrder}
                        onChange={onChange}
                        min="1"
                        required
                    />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-1">
                    <SubmitButton
                        loading={submitting}
                        label="Agregar tarea"
                        loadingLabel="Agregando..."
                        variant="navy"
                    />
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700
                                       px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                    )}
                </div>

                {error && (
                    <p className="md:col-span-2 text-xs text-red-500">{error}</p>
                )}
            </form>
        </div>
    );
}
