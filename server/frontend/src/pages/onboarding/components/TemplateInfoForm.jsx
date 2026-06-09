import { FieldLabel, TextInput } from './FormFields';

export default function TemplateInfoForm({ form, onChange }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-light bg-brand-pale/40">
                <h2 className="text-sm font-bold text-slate-700">Información de la plantilla</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                    Definí el tipo y subtipo del template (ej: Onboarding · Checklist).
                </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <FieldLabel>Nombre del template <span className="text-red-400">*</span></FieldLabel>
                    <TextInput
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Ej. Onboarding"
                        required
                    />
                </div>

                <div>
                    <FieldLabel>Subtipo (opcional)</FieldLabel>
                    <TextInput
                        name="sub_type"
                        value={form.sub_type}
                        onChange={onChange}
                        placeholder="Ej. Checklist, Documentación, Integración"
                    />
                </div>

                <div>
                    <FieldLabel>Días para completar (opcional)</FieldLabel>
                    <TextInput
                        type="number"
                        name="defaultDueDays"
                        value={form.defaultDueDays}
                        onChange={onChange}
                        placeholder="Ej. 30"
                        min={1}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Días desde la fecha de contratación antes de que venzan las tareas.
                    </p>
                </div>
            </div>
        </div>
    );
}
