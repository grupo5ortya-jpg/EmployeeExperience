import Field from './Field'
import SectionTitle from './SectionTitle'

const inputCls = `
w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors
`

export default function ContactFields({ form, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Contacto</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Teléfono">
          <input name="phone" value={form.phone} onChange={onChange} className={inputCls} placeholder="Ej. 1122334455" />
        </Field>
        <Field label="Dirección">
          <input name="address" value={form.address} onChange={onChange} className={inputCls} placeholder="Ej. Av. Corrientes 1234" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Email personal">
          <input type="email" name="personalEmail" value={form.personalEmail} onChange={onChange} className={inputCls} placeholder="Ej. maria.gonzalez@gmail.com" />
        </Field>
      </div>
    </div>
  )
}
