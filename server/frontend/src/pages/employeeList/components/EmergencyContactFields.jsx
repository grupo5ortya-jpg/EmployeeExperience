import Field from './Field'
import SectionTitle from './SectionTitle'

const inputCls = `
w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors
`

export default function EmergencyContactFields({ form, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Contacto de emergencia</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nombre">
          <input name="emergencyContactName" value={form.emergencyContactName} onChange={onChange} className={inputCls} placeholder="Ej. Juan González" />
        </Field>
        <Field label="Teléfono">
          <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={onChange} className={inputCls} placeholder="Ej. 1199887766" />
        </Field>
      </div>
    </div>
  )
}
