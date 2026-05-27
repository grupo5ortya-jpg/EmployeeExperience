import { useState } from 'react'
import { X } from 'lucide-react'

import { useRoles } from '../../../hooks/useRoles'
import { useTaskTypes } from '../../../hooks/useTaskTypes'

const DOC_TYPES = ['DNI', 'Pasaporte', 'CUIT', 'CUIL']

const STATUS_OPTS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'ON_LEAVE', label: 'En licencia' },
]

const INITIAL = {
  firstName: '',
  lastName: '',
  documentType: 'DNI',
  documentNumber: '',
  birthDate: '',
  position: '',
  status: 'ACTIVE',
  departmentId: '',
  managerId: '',
  hireDate: '',
  phone: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  email: '',
  roleId: '',
  taskTypeId: '',
}

const inputCls = `
w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors
`

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">
        {label}
        {required && (
          <span className="text-red-400 ml-0.5">*</span>
        )}
      </label>

      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3
      className="text-xs font-semibold text-slate-400 uppercase
            tracking-wider pt-2 pb-1 border-b border-brand-light"
    >
      {children}
    </h3>
  )
}

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSave,
  employees,
}) {

  const [form, setForm] = useState(INITIAL)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const { data: roles = [] } = useRoles()

  const { data: taskTypes = [] } = useTaskTypes()

  if (!isOpen) return null

  /* ───────────────────────────────────────────── */
  /* Derived data                                  */
  /* ───────────────────────────────────────────── */

  const depts = Object.values(
    employees.reduce((acc, employee) => {

      if (employee.department) {
        acc[employee.department.id] = employee.department
      }

      return acc

    }, {})
  )

  const managers = employees.map((employee) => ({
    id: employee.id,
    name:
      `${employee.firstName} ${employee.lastName} — ${employee.position ?? ''}`
        .trim(),
  }))

  /* ───────────────────────────────────────────── */
  /* Handlers                                      */
  /* ───────────────────────────────────────────── */

  const handle = (e) => {

    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    setSaving(true)

    setError('')

    try {

      await onSave({
        ...form,
        departmentId: form.departmentId || null,
        managerId: form.managerId || null,
        birthDate: form.birthDate || null,
        hireDate: form.hireDate || null,
        taskTypeId: form.taskTypeId || null,
        address: form.address
          ? { street: form.address }
          : null,
      })

      setForm(INITIAL)

      onClose()

    } catch (err) {

      console.error(err)

      setError(
        'No se pudo guardar el colaborador. Revisá los campos e intentá de nuevo.'
      )

    } finally {

      setSaving(false)
    }
  }

  const handleCancel = () => {

    setForm(INITIAL)

    setError('')

    onClose()
  }

  /* ───────────────────────────────────────────── */
  /* Render                                        */
  /* ───────────────────────────────────────────── */

  return (

    <div
      className="fixed inset-0 z-50 flex items-start justify-center
            bg-navy/40 backdrop-blur-sm overflow-y-auto py-6 px-4"
    >

      <div
        className="bg-white rounded-2xl border border-brand-light
                shadow-xl w-full max-w-2xl"
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4
                    border-b border-brand-light"
        >

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Nuevo colaborador
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Completá los datos para crear el perfil
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600
                        p-1.5 rounded-lg hover:bg-brand-pale
                        transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-5"
        >

          {/* Datos personales */}
          <div className="flex flex-col gap-3">

            <SectionTitle>
              Datos personales
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Nombre" required>

                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. María"
                  required
                />
              </Field>

              <Field label="Apellido" required>

                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. González"
                  required
                />
              </Field>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Field label="Tipo de documento" required>

                <select
                  name="documentType"
                  value={form.documentType}
                  onChange={handle}
                  className={inputCls}
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Número de documento" required>

                <input
                  name="documentNumber"
                  value={form.documentNumber}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. 30111222"
                  required
                />
              </Field>

              <Field label="Fecha de nacimiento">

                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handle}
                  className={inputCls}
                />
              </Field>

            </div>
          </div>

          {/* Información laboral */}
          <div className="flex flex-col gap-3">

            <SectionTitle>
              Información laboral
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Email" required>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. maria@empresa.com"
                  required
                />
              </Field>

              <Field label="Rol" required>

                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handle}
                  className={inputCls}
                  required
                >

                  <option value="">
                    Seleccionar rol
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>

            </div>

            {/* TEMPLATE SELECT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Template de onboarding">

                <select
                  name="taskTypeId"
                  value={form.taskTypeId}
                  onChange={handle}
                  className={inputCls}
                >

                  <option value="">
                    Onboarding - estándar
                  </option>
                  {console.log(taskTypes)}
                  {taskTypes.map((taskType) => (

                    <option
                      key={taskType.id}
                      value={taskType.id}
                    >
                      {taskType.name}

                      {taskType.sub_type
                        ? ` · ${taskType.sub_type}`
                        : ''}
                    </option>
                  ))}
                </select>
              </Field>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Posición / Cargo">

                <input
                  name="position"
                  value={form.position}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. Frontend Developer"
                />
              </Field>

              <Field label="Estado">

                <select
                  name="status"
                  value={form.status}
                  onChange={handle}
                  className={inputCls}
                >

                  {STATUS_OPTS.map(({ value, label }) => (

                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Departamento">

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handle}
                  className={inputCls}
                >

                  <option value="">
                    Sin departamento
                  </option>

                  {depts.map((dept) => (

                    <option
                      key={dept.id}
                      value={dept.id}
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Líder directo">

                <select
                  name="managerId"
                  value={form.managerId}
                  onChange={handle}
                  className={inputCls}
                >

                  <option value="">
                    Sin líder asignado
                  </option>

                  {managers.map((manager) => (

                    <option
                      key={manager.id}
                      value={manager.id}
                    >
                      {manager.name}
                    </option>
                  ))}
                </select>
              </Field>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Fecha de ingreso">

                <input
                  type="date"
                  name="hireDate"
                  value={form.hireDate}
                  onChange={handle}
                  className={inputCls}
                />
              </Field>

            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-3">

            <SectionTitle>
              Contacto
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Teléfono">

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. 1122334455"
                />
              </Field>

              <Field label="Dirección">

                <input
                  name="address"
                  value={form.address}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. Av. Corrientes 1234"
                />
              </Field>

            </div>
          </div>

          {/* Contacto emergencia */}
          <div className="flex flex-col gap-3">

            <SectionTitle>
              Contacto de emergencia
            </SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Nombre">

                <input
                  name="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. Juan González"
                />
              </Field>

              <Field label="Teléfono">

                <input
                  name="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={handle}
                  className={inputCls}
                  placeholder="Ej. 1199887766"
                />
              </Field>

            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs text-red-500 bg-red-50
                            border border-red-200 rounded-lg
                            px-4 py-2.5"
            >
              {error}
            </p>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3
                        pt-3 border-t border-brand-light"
          >

            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-medium text-slate-500
                            hover:text-slate-700 px-4 py-2.5 rounded-lg
                            hover:bg-brand-pale transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white
                            text-sm font-semibold px-5 py-2.5 rounded-lg
                            transition-colors cursor-pointer
                            disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Guardando...'
                : 'Guardar usuario'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}