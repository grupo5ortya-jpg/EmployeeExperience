import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Plus, GraduationCap, CheckCircle2, XCircle } from 'lucide-react'

import { useAlumniByEmployee, useUpdateAlumni } from '../../hooks/useAlumni'
import EmployeeAvatar from '../employeeList/components/EmployeeAvatar'

function levelName(skill) {
  const level = skill.levels?.find((l) => l.order === skill.level)
  return level?.name ?? `Nivel ${skill.level}`
}

export default function AlumniDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { data: alumni, isLoading } = useAlumniByEmployee(employeeId)
  const { mutate: update, isPending } = useUpdateAlumni()
  const [newTag, setNewTag] = useState('')

  if (isLoading) {
    return (
      <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">
        <p className="text-sm text-slate-400">Cargando...</p>
      </main>
    )
  }

  if (!alumni) {
    return (
      <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">
        <p className="text-sm text-slate-400">No se encontró el perfil de alumni.</p>
      </main>
    )
  }

  const toggleRehirable = () => {
    update({ employeeId, rehirable: !alumni.rehirable })
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (!tag || alumni.tags.includes(tag)) { setNewTag(''); return }
    update({ employeeId, tags: [...alumni.tags, tag] })
    setNewTag('')
  }

  const removeTag = (tag) => {
    update({ employeeId, tags: alumni.tags.filter((t) => t !== tag) })
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Back */}
      <button
        onClick={() => navigate('/alumnihome')}
        className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors w-fit cursor-pointer"
      >
        <ArrowLeft size={14} />
        Volver a Alumni
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <EmployeeAvatar firstName={alumni.firstName} lastName={alumni.lastName} />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">{alumni.firstName} {alumni.lastName}</h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{alumni.email ?? '—'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingreso: {alumni.hireDate ? new Date(alumni.hireDate).toLocaleDateString('es-AR') : '—'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleRehirable}
          disabled={isPending}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors
                      cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0
                      ${alumni.rehirable
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
        >
          {alumni.rehirable ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {alumni.rehirable ? 'Recontratable' : 'No recontratable'}
        </button>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</h3>

        <div className="flex flex-wrap gap-2">
          {alumni.tags.length === 0 && (
            <p className="text-sm text-slate-400">Sin tags todavía.</p>
          )}
          {alumni.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-pale text-brand">
              {tag}
              <button onClick={() => removeTag(tag)} disabled={isPending} className="hover:text-brand-hover cursor-pointer disabled:opacity-40">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Agregar tag..."
            className="flex-1 rounded-lg border border-brand-light px-3.5 py-2 text-sm
                       text-slate-700 placeholder:text-slate-400 outline-none bg-white
                       focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
          <button
            onClick={addTag}
            disabled={isPending || !newTag.trim()}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                       text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors
                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</h3>
        {alumni.skills.length === 0 ? (
          <p className="text-sm text-slate-400">No tiene skills registradas.</p>
        ) : (
          <ul className="divide-y divide-brand-light">
            {alumni.skills.map((skill) => (
              <li key={skill.skillId} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap size={16} className="text-brand shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{skill.name}</span>
                  {skill.type && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                      {skill.type}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-brand shrink-0">{levelName(skill)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </main>
  )
}
