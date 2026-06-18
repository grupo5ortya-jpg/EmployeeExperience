import { FieldLabel, TextInput, SubmitButton } from './FormFields';

export default function TaskForm({ form, onChange, onSubmit, submitting, error, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">

            <div>
                <FieldLabel>Nombre de la tarea <span className="text-red-400">*</span></FieldLabel>
                <TextInput
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Ej. Completar checklist de bienvenida"
                    required
                />
            </div>

            <div>
                <FieldLabel>Vence en (días)</FieldLabel>
                <TextInput
                    type="number"
                    name="estimatedDuration"
                    value={form.estimatedDuration}
                    onChange={onChange}
                    placeholder="Ej. 3"
                    min="0"
                />
            </div>

            <div className="flex items-center gap-3 pt-1">
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
                <p className="text-xs text-red-500">{error}</p>
            )}
        </form>
    );
}
