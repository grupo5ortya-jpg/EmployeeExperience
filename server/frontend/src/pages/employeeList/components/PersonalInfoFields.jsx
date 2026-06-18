import Field from './Field'
import SectionTitle from './SectionTitle'

const DOC_TYPES = ['DNI', 'Pasaporte', 'CUIT', 'CUIL']

const inputCls = `
w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors
`

export default function PersonalInfoFields({ form, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Datos personales</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre" required>
          <input name="firstName" value={form.firstName} onChange={onChange} className={inputCls} placeholder="Ej. María" required />
        </Field>
        <Field label="Apellido" required>
          <input name="lastName" value={form.lastName} onChange={onChange} className={inputCls} placeholder="Ej. González" required />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Tipo de documento" required>
          <select name="documentType" value={form.documentType} onChange={onChange} className={inputCls}>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Número de documento" required>
          <input name="documentNumber" value={form.documentNumber} onChange={onChange} className={inputCls} placeholder="Ej. 30111222" required />
        </Field>
        <Field label="Fecha de nacimiento">
          <input type="date" name="birthDate" value={form.birthDate} onChange={onChange} className={inputCls} />
        </Field>
      </div>
    </div>
  )
}
