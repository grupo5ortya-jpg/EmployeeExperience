import PersonalInfoFields from './PersonalInfoFields'
import WorkInfoFields from './WorkInfoFields'
import ContactFields from './ContactFields'
import EmergencyContactFields from './EmergencyContactFields'

export default function EmployeeFormStep({
  form, onChange, onSubmit, onCancel, saving, error, roles, taskTypes, employees,
}) {
  return (
    <form onSubmit={onSubmit} className="px-6 py-5 flex flex-col gap-5">

      <PersonalInfoFields form={form} onChange={onChange} />
      <WorkInfoFields form={form} onChange={onChange} roles={roles} taskTypes={taskTypes} employees={employees} />
      <ContactFields form={form} onChange={onChange} />
      <EmergencyContactFields form={form} onChange={onChange} />

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-light">
        <button
          type="button"
          onClick={onCancel}
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
  )
}
