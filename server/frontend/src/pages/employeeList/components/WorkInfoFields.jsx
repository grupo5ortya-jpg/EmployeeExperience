import { useMemo } from 'react'
import Field from './Field'
import SectionTitle from './SectionTitle'

const STATUS_OPTS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'ON_LEAVE', label: 'En licencia' },
]

const inputCls = `
w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors
`

export default function WorkInfoFields({ form, onChange, roles, taskTypes, employees }) {
  const depts = useMemo(
    () => Object.values(
      employees.reduce((acc, emp) => {
        if (emp.department) acc[emp.department.id] = emp.department
        return acc
      }, {})
    ),
    [employees]
  )

  const managers = useMemo(
    () => employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName} — ${emp.position ?? ''}`.trim(),
    })),
    [employees]
  )

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Información laboral</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Email" required>
          <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls} placeholder="Ej. maria@empresa.com" required />
        </Field>
        <Field label="Rol" required>
          <select name="roleId" value={form.roleId} onChange={onChange} className={inputCls} required>
            <option value="">Seleccionar rol</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Template de plan">
          <select name="taskTypeId" value={form.taskTypeId} onChange={onChange} className={inputCls}>
            <option value="">Plan estándar</option>
            {taskTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}{tt.subType ? ` · ${tt.subType}` : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Posición / Cargo">
          <input name="position" value={form.position} onChange={onChange} className={inputCls} placeholder="Ej. Frontend Developer" />
        </Field>
        <Field label="Estado">
          <select name="status" value={form.status} onChange={onChange} className={inputCls}>
            {STATUS_OPTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Departamento">
          <select name="departmentId" value={form.departmentId} onChange={onChange} className={inputCls}>
            <option value="">Sin departamento</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Líder directo">
          <select name="managerId" value={form.managerId} onChange={onChange} className={inputCls}>
            <option value="">Sin líder asignado</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Fecha de ingreso">
          <input type="date" name="hireDate" value={form.hireDate} onChange={onChange} className={inputCls} />
        </Field>
      </div>
    </div>
  )
}
