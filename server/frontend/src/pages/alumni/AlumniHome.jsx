import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, GraduationCap, UserPlus } from 'lucide-react'

import { useAlumni, useRehireAlumni } from '../../hooks/useAlumni'
import { getSkills } from '../../services/skillService'
import EmployeeAvatar from '../employeeList/components/EmployeeAvatar'

const REHIRABLE_OPTIONS = [
  { value: '', label: 'Recontratable: Todos' },
  { value: 'true', label: 'Recontratable: Sí' },
  { value: 'false', label: 'Recontratable: No' },
]

export default function AlumniHome() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [skillId, setSkillId] = useState('')
  const [rehirable, setRehirable] = useState('')

  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: getSkills })
  const { data: alumni = [], isLoading, isError } = useAlumni({
    search: search || undefined,
    skillId: skillId || undefined,
    rehirable: rehirable || undefined,
  })
  const { mutate: rehire, isPending: isRehiring } = useRehireAlumni()

  const handleRehire = (e, alumniItem) => {
    e.stopPropagation()
    if (window.confirm(`¿Recontratar a ${alumniItem.firstName} ${alumniItem.lastName}? Volverá a ser un empleado activo (rol Colaborador).`)) {
      rehire(alumniItem.id)
    }
  }

  const hasFilters = search !== '' || skillId !== '' || rehirable !== ''
  const clearFilters = () => { setSearch(''); setSkillId(''); setRehirable('') }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">Alumni</h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
          Ex empleados — consultá su perfil, skills y disponibilidad para recontratación
        </p>
      </div>

      {/* Filters + table */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm flex-1 min-h-0 flex flex-col">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-brand-light bg-brand-pale rounded-t-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-brand-light bg-white text-xs
                         text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand
                         focus:ring-2 focus:ring-brand-light transition-colors duration-150"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-hover hover:text-brand transition-colors cursor-pointer"
            >
              <X size={13} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-brand-light bg-brand-pale/50">
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="text-xs font-medium text-brand-hover border border-brand-light rounded-lg px-3 py-2 bg-brand-light
                       focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light cursor-pointer
                       transition-colors duration-150"
          >
            <option value="">Skill: Todas</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={rehirable}
            onChange={(e) => setRehirable(e.target.value)}
            className="text-xs font-medium text-brand-hover border border-brand-light rounded-lg px-3 py-2 bg-brand-light
                       focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light cursor-pointer
                       transition-colors duration-150"
          >
            {REHIRABLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy">
                <th className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Alumni</th>
                <th className="hidden md:table-cell text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Ingreso</th>
                <th className="hidden lg:table-cell text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Skills</th>
                <th className="hidden lg:table-cell text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Tags</th>
                <th className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Recontratable</th>
                <th className="text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-brand-light animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3.5 bg-slate-200 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-red-400 bg-brand-pale">
                    Error al cargar los alumni. Intentá de nuevo.
                  </td>
                </tr>
              ) : alumni.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-slate-400 bg-brand-pale">
                    No se encontraron alumni
                  </td>
                </tr>
              ) : (
                alumni.map((a, i) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/alumni/${a.id}`)}
                    className={`border-b border-brand-light transition-colors cursor-pointer
                      hover:bg-brand-light/70 ${i % 2 === 0 ? 'bg-brand-pale' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar firstName={a.firstName} lastName={a.lastName} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 leading-tight truncate">
                            {a.firstName} {a.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate hidden sm:block">{a.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
                      {a.hireDate ? new Date(a.hireDate).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      {a.skills.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <GraduationCap size={13} className="text-slate-400" />
                          {a.skills.length} skill{a.skills.length !== 1 ? 's' : ''}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3">
                      {a.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {a.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-pale text-brand">
                              {tag}
                            </span>
                          ))}
                          {a.tags.length > 3 && <span className="text-xs text-slate-400">+{a.tags.length - 3}</span>}
                        </div>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${a.rehirable ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {a.rehirable ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleRehire(e, a)}
                        disabled={isRehiring}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                   bg-brand-pale text-brand hover:bg-brand-light transition-colors
                                   cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UserPlus size={13} />
                        Recontratar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-brand-light bg-brand-pale/50 rounded-b-xl">
          <p className="text-xs text-brand-hover font-medium">
            {isLoading ? 'Cargando...' : `${alumni.length} alumni encontrados`}
          </p>
        </div>
      </div>

    </main>
  )
}
