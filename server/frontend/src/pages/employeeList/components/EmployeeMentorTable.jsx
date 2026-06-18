import { CheckCircle2, ChevronRight } from 'lucide-react'

export default function EmployeeMentorTable({ employees, newEmployeeId, selectedId, onSelect }) {
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
