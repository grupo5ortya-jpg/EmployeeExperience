import { useState, useEffect, useMemo } from 'react'
import { X, Brain, Search, CheckCircle2, UserCheck, ChevronRight } from 'lucide-react'

import { useRoles } from '../../../hooks/useRoles'
import { useTaskTypes } from '../../../hooks/useTaskTypes'
import { useMentorSuggestions } from '../../../hooks/useMentorSuggestions'
import { assignMentor } from '../../../services/employeeService'

const DOC_TYPES = ['DNI', 'Pasaporte', 'CUIT', 'CUIL']

const STATUS_OPTS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'ON_LEAVE', label: 'En licencia' },
]

const INITIAL = {
  firstName: '', lastName: '', documentType: 'DNI', documentNumber: '',
  birthDate: '', position: '', status: 'ACTIVE', departmentId: '',
  managerId: '', hireDate: '', phone: '', address: '',
  emergencyContactName: '', emergencyContactPhone: '', email: '', roleId: '', taskTypeId: '',
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
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2 pb-1 border-b border-brand-light">
      {children}
    </h3>
  )
}

/* ── Mentor step sub-components ─────────────────────────────────────────── */

function MentorSuggestionCard({ suggestion, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer
        ${selected
          ? 'border-brand bg-brand-pale ring-2 ring-brand/20'
          : 'border-brand-light bg-white hover:border-brand hover:bg-brand-pale/40'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{suggestion.name}</p>
          {(suggestion.department || suggestion.position) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {[suggestion.department, suggestion.position].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {selected
          ? <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
          : <span className="text-xs font-semibold text-brand shrink-0 mt-0.5">Elegir</span>
        }
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{suggestion.reason}</p>
    </button>
  )
}

function EmployeeMentorTable({ employees, newEmployeeId, selectedId, onSelect }) {
  const visible = employees.filter((e) => e.id !== newEmployeeId)

  if (visible.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-5">Sin resultados</p>
  }

  return (
    <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto">
      {visible.map((emp) => {
        const isSelected = emp.id === selectedId
        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelect(emp)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group
              ${isSelected ? 'bg-brand-pale' : 'hover:bg-brand-pale/40'}`}
          >
            <div>
              <p className={`text-sm font-medium leading-tight ${isSelected ? 'text-brand' : 'text-slate-700'}`}>
                {emp.firstName} {emp.lastName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {[emp.department?.name, emp.position].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
            {isSelected
              ? <CheckCircle2 size={16} className="text-brand shrink-0" />
              : <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
            }
          </button>
        )
      })}
    </div>
  )
}

/* ── Main modal ─────────────────────────────────────────────────────────── */

export default function CreateEmployeeModal({ isOpen, onClose, onSave, employees }) {
  const [step, setStep] = useState('form')
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdEmployee, setCreatedEmployee] = useState(null)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [mentorSearch, setMentorSearch] = useState('')
  const [assigningMentor, setAssigningMentor] = useState(false)
  const [assignError, setAssignError] = useState('')

  const { data: roles = [] } = useRoles()
  const { data: taskTypes = [] } = useTaskTypes()
  const {
    mutate: fetchSuggestions,
    data: suggestionsData,
    isPending: loadingSuggestions,
    isError: suggestionsError,
    reset: resetSuggestions,
  } = useMentorSuggestions()

  useEffect(() => {
    if (step === 'mentor' && createdEmployee?.id) {
      fetchSuggestions({ employeeId: createdEmployee.id })
    }
  }, [step, createdEmployee?.id, fetchSuggestions])

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

  const aiSuggestions = useMemo(() => {
    const raw = suggestionsData?.suggestions ?? []
    return raw.map((s) => {
      const emp = employees.find((e) => e.id === s.employeeId)
      return { ...s, department: emp?.department?.name ?? null, position: emp?.position ?? null }
    })
  }, [suggestionsData, employees])

  const filteredEmployees = useMemo(() => {
    const q = mentorSearch.toLowerCase()
    return employees.filter((emp) => {
      if (emp.id === createdEmployee?.id) return false
      if (!mentorSearch) return true
      return (
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.position?.toLowerCase().includes(q) ||
        emp.department?.name?.toLowerCase().includes(q)
      )
    })
  }, [employees, mentorSearch, createdEmployee?.id])

  if (!isOpen) return null

  /* ── Handlers ── */

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await onSave({
        ...form,
        departmentId: form.departmentId || null,
        managerId: form.managerId || null,
        birthDate: form.birthDate || null,
        hireDate: form.hireDate || null,
        taskTypeId: form.taskTypeId || null,
        address: form.address ? { street: form.address } : null,
      })
      setCreatedEmployee(created)
      setStep('mentor')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el colaborador. Revisá los campos e intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setStep('form')
    setForm(INITIAL)
    setError('')
    setCreatedEmployee(null)
    setSelectedMentor(null)
    setMentorSearch('')
    setAssigningMentor(false)
    setAssignError('')
    resetSuggestions()
  }

  const handleClose = () => { handleReset(); onClose() }

  const handleSelectAiSuggestion = (suggestion) => {
    const emp = employees.find((e) => e.id === suggestion.employeeId)
    setSelectedMentor(
      emp ?? { id: suggestion.employeeId, firstName: suggestion.name, lastName: '', department: null, position: null }
    )
  }

  const handleConfirmMentor = async () => {
    if (!selectedMentor) return
    setAssigningMentor(true)
    setAssignError('')
    try {
      await assignMentor(createdEmployee.id, selectedMentor.id)
      handleClose()
    } catch (err) {
      console.error(err)
      setAssignError('No se pudo asignar el mentor. Podés intentarlo desde el perfil del colaborador.')
    } finally {
      setAssigningMentor(false)
    }
  }

  /* ── Render ── */

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy/40 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
          <div className="flex items-center gap-3">
            {step === 'mentor' && (
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Brain size={16} className="text-brand" />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {step === 'form' ? 'Nuevo colaborador' : 'Asignar mentor'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'form'
                  ? 'Completá los datos para crear el perfil'
                  : `Seleccioná un mentor para ${createdEmployee?.firstName ?? ''} ${createdEmployee?.lastName ?? ''}`.trim()
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-brand-pale/30 border-b border-brand-light">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 'form' ? 'text-brand' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${step !== 'form' ? 'bg-brand/10 text-brand' : 'bg-brand text-white'}`}>
              {step === 'mentor' ? '✓' : '1'}
            </span>
            Datos personales
          </div>
          <div className="flex-1 h-px bg-brand-light mx-1" />
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 'mentor' ? 'text-brand' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${step === 'mentor' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'}`}>
              2
            </span>
            Asignar mentor
          </div>
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

            <div className="flex flex-col gap-3">
              <SectionTitle>Datos personales</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nombre" required>
                  <input name="firstName" value={form.firstName} onChange={handle} className={inputCls} placeholder="Ej. María" required />
                </Field>
                <Field label="Apellido" required>
                  <input name="lastName" value={form.lastName} onChange={handle} className={inputCls} placeholder="Ej. González" required />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Tipo de documento" required>
                  <select name="documentType" value={form.documentType} onChange={handle} className={inputCls}>
                    {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Número de documento" required>
                  <input name="documentNumber" value={form.documentNumber} onChange={handle} className={inputCls} placeholder="Ej. 30111222" required />
                </Field>
                <Field label="Fecha de nacimiento">
                  <input type="date" name="birthDate" value={form.birthDate} onChange={handle} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SectionTitle>Información laboral</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email" required>
                  <input type="email" name="email" value={form.email} onChange={handle} className={inputCls} placeholder="Ej. maria@empresa.com" required />
                </Field>
                <Field label="Rol" required>
                  <select name="roleId" value={form.roleId} onChange={handle} className={inputCls} required>
                    <option value="">Seleccionar rol</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Template de onboarding">
                  <select name="taskTypeId" value={form.taskTypeId} onChange={handle} className={inputCls}>
                    <option value="">Onboarding - estándar</option>
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
                  <input name="position" value={form.position} onChange={handle} className={inputCls} placeholder="Ej. Frontend Developer" />
                </Field>
                <Field label="Estado">
                  <select name="status" value={form.status} onChange={handle} className={inputCls}>
                    {STATUS_OPTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Departamento">
                  <select name="departmentId" value={form.departmentId} onChange={handle} className={inputCls}>
                    <option value="">Sin departamento</option>
                    {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Líder directo">
                  <select name="managerId" value={form.managerId} onChange={handle} className={inputCls}>
                    <option value="">Sin líder asignado</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Fecha de ingreso">
                  <input type="date" name="hireDate" value={form.hireDate} onChange={handle} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SectionTitle>Contacto</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <input name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="Ej. 1122334455" />
                </Field>
                <Field label="Dirección">
                  <input name="address" value={form.address} onChange={handle} className={inputCls} placeholder="Ej. Av. Corrientes 1234" />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SectionTitle>Contacto de emergencia</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nombre">
                  <input name="emergencyContactName" value={form.emergencyContactName} onChange={handle} className={inputCls} placeholder="Ej. Juan González" />
                </Field>
                <Field label="Teléfono">
                  <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handle} className={inputCls} placeholder="Ej. 1199887766" />
                </Field>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-light">
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar y continuar'}
              </button>
            </div>

          </form>
        )}

        {/* ── STEP 2: Mentor selection ── */}
        {step === 'mentor' && (
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* AI Suggestions */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-brand" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sugerencias de la IA
                </h3>
              </div>

              {loadingSuggestions && (
                <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-brand-pale border border-brand-light">
                  <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-sm text-slate-500">Analizando candidatos...</p>
                </div>
              )}

              {suggestionsError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  No se pudieron cargar las sugerencias. Podés elegir un mentor manualmente.
                </p>
              )}

              {!loadingSuggestions && !suggestionsError && aiSuggestions.length === 0 && suggestionsData && (
                <p className="text-xs text-slate-400 text-center py-3">
                  No se encontraron sugerencias. Elegí un mentor manualmente.
                </p>
              )}

              {!loadingSuggestions && aiSuggestions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiSuggestions.map((s) => (
                    <MentorSuggestionCard
                      key={s.employeeId}
                      suggestion={s}
                      selected={selectedMentor?.id === s.employeeId}
                      onSelect={() => handleSelectAiSuggestion(s)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-brand-light" />
              <span className="text-xs text-slate-400 shrink-0">o elegir manualmente</span>
              <div className="flex-1 h-px bg-brand-light" />
            </div>

            {/* Search + table */}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                  placeholder="Buscar por nombre, cargo o departamento..."
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-brand-light
                             text-slate-700 placeholder:text-slate-400 outline-none bg-white
                             focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
                />
              </div>
              <div className="rounded-xl border border-brand-light overflow-hidden">
                <EmployeeMentorTable
                  employees={filteredEmployees}
                  newEmployeeId={createdEmployee?.id}
                  selectedId={selectedMentor?.id}
                  onSelect={setSelectedMentor}
                />
              </div>
            </div>

            {/* Selected mentor confirmation banner */}
            {selectedMentor && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-pale border border-brand/20">
                <CheckCircle2 size={16} className="text-brand shrink-0" />
                <p className="text-sm text-slate-700">
                  Mentor seleccionado:{' '}
                  <span className="font-semibold text-brand">
                    {selectedMentor.firstName} {selectedMentor.lastName}
                  </span>
                </p>
              </div>
            )}

            {/* Assign error */}
            {assignError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {assignError}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-light">
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
              >
                Omitir este paso
              </button>
              <button
                type="button"
                onClick={handleConfirmMentor}
                disabled={!selectedMentor || assigningMentor}
                className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                           text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors
                           cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck size={15} />
                {assigningMentor ? 'Guardando...' : 'Confirmar mentor'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
