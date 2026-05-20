import { FieldLabel, TextInput, Textarea } from './FormFields';

export default function TemplateInfoForm({ form, onChange }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-light bg-brand-pale/40">
                <h2 className="text-sm font-bold text-slate-700">Información general</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <FieldLabel>Nombre del template</FieldLabel>
                    <TextInput
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Ej. Onboarding Developer"
                        required
                    />
                </div>

                <div>
                    <FieldLabel>Descripción (opcional)</FieldLabel>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        placeholder="Proceso de onboarding para..."
                        rows={3}
                    />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={form.isActive}
                        onChange={onChange}
                        className="w-4 h-4 accent-brand cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-600 cursor-pointer select-none">
                        Plantilla activa
                    </label>
                </div>
            </div>
        </div>
    );
}
