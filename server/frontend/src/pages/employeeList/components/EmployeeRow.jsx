import { useNavigate } from 'react-router-dom'
import EmployeeAvatar from './EmployeeAvatar'

const STATUS_LABEL = {
  ACTIVE:      'Activo',
  INACTIVE:    'Inactivo',
  ON_LEAVE:    'En licencia',
  ONBOARDING:  'Onboarding',
}

const STATUS_STYLE = {
  ACTIVE:      'bg-green-100 text-green-600',
  INACTIVE:    'bg-slate-100 text-slate-500',
  ON_LEAVE:    'bg-amber-100 text-amber-600',
  ONBOARDING:  'bg-violet-100 text-violet-600',
}

export default function EmployeeRow({ employee, striped }) {
  const navigate = useNavigate()
  const { id, firstName, lastName, position, user, department, manager, status } = employee

  const statusLabel = STATUS_LABEL[status] ?? status
  const statusStyle = STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-500'

  return (
    <tr
      onClick={() => navigate(`/detailemployee/${id}`)}
      className={`border-b border-brand-light transition-colors cursor-pointer
        hover:bg-brand-light/70
        ${striped ? 'bg-brand-pale' : 'bg-white'}`}
    >
      {/* Colaborador — always */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <EmployeeAvatar firstName={firstName} lastName={lastName} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-700 leading-tight truncate">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {user?.email ?? '—'}
            </p>
          </div>
        </div>
      </td>

      {/* Posición — md+ */}
      <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
        {position ?? '—'}
      </td>

      {/* Departamento — lg+ */}
      <td className="hidden lg:table-cell px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
        {department?.name ?? '—'}
      </td>

      {/* Líder directo — lg+ */}
      <td className="hidden lg:table-cell px-4 py-3">
        {manager ? (
          <div className="flex items-center gap-2">
            <EmployeeAvatar firstName={manager.firstName} lastName={manager.lastName} size="sm" />
            <span className="text-slate-600 whitespace-nowrap text-xs">
              {manager.firstName} {manager.lastName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* Estado — always */}
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle}`}>
          {statusLabel}
        </span>
      </td>

      {/* Flecha indicadora — always */}
      <td className="px-4 py-3 text-slate-300">
        <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </td>
    </tr>
  )
}
