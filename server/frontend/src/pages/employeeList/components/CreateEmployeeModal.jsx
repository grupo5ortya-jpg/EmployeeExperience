import { useState, useEffect, useMemo } from 'react'
import { X, Brain } from 'lucide-react'

import { useRoles } from '../../../hooks/useRoles'
import { useTaskTypes } from '../../../hooks/useTaskTypes'
import { useMentorSuggestions } from '../../../hooks/useMentorSuggestions'
import { assignMentor } from '../../../services/employeeService'
import EmployeeFormStep from './EmployeeFormStep'
import MentorAssignmentStep from './MentorAssignmentStep'

// TaskTypes de sistema que no son planes de onboarding para un alta nueva (son el
// checklist de offboarding y el catálogo de cursos de Learning, ver OnboardingHome.jsx) —
// nunca deben ofrecerse en "Template de plan". Mismo criterio de exclusión que el HIDDEN_TASK_TYPES
// de OnboardingHome más la exclusión de Offboarding (que ahí sí se gestiona/edita).
const NON_ONBOARDING_TASK_TYPES = ['Aprendizaje - curso', 'Offboarding estándar']

const INITIAL = {
  firstName: '', lastName: '', documentType: 'DNI', documentNumber: '',
  birthDate: '', position: '', status: 'ACTIVE', departmentId: '',
  managerId: '', hireDate: '', phone: '', address: '',
  emergencyContactName: '', emergencyContactPhone: '', email: '', personalEmail: '', roleId: '', taskTypeId: '',
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
  const { data: rawTaskTypes = [] } = useTaskTypes()
  // Solo planes de onboarding reales: con al menos 1 tarea asignable y de propósito
  // "alta de empleado" (no el checklist de offboarding ni el catálogo de Learning).
  const taskTypes = useMemo(
    () => rawTaskTypes.filter((tt) => tt.taskCount > 0 && !NON_ONBOARDING_TASK_TYPES.includes(tt.name)),
    [rawTaskTypes],
  )

  // Default del selector "Template de plan": "Onboarding estándar" pre-seleccionado,
  // pero el resto de templates sigue disponible para elegir en su lugar.
  useEffect(() => {
    if (form.taskTypeId) return
    const standard = taskTypes.find((tt) => tt.name === 'Onboarding estándar')
    if (standard) setForm((prev) => ({ ...prev, taskTypeId: standard.id }))
  }, [taskTypes, form.taskTypeId])

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
          <EmployeeFormStep
            form={form}
            onChange={handle}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            saving={saving}
            error={error}
            roles={roles}
            taskTypes={taskTypes}
            employees={employees}
          />
        )}

        {/* ── STEP 2: Mentor selection ── */}
        {step === 'mentor' && (
          <MentorAssignmentStep
            loadingSuggestions={loadingSuggestions}
            suggestionsError={suggestionsError}
            suggestionsData={suggestionsData}
            aiSuggestions={aiSuggestions}
            selectedMentor={selectedMentor}
            onSelectAiSuggestion={handleSelectAiSuggestion}
            mentorSearch={mentorSearch}
            setMentorSearch={setMentorSearch}
            filteredEmployees={filteredEmployees}
            createdEmployeeId={createdEmployee?.id}
            onSelectMentor={setSelectedMentor}
            assignError={assignError}
            assigningMentor={assigningMentor}
            onCancel={handleClose}
            onConfirm={handleConfirmMentor}
          />
        )}

      </div>
    </div>
  )
}
