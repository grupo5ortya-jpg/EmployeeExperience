import { useState } from 'react'
import { Search, SlidersHorizontal, X, MoreVertical } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

const employees = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    initials: 'JP',
    avatarBg: 'bg-brand',
    rol: 'Frontend Developer',
    departamento: 'Tecnología',
    seniority: 'Senior',
    lider: { name: 'Ana Gómez', initials: 'AG', bg: 'bg-violet-300' },
    objetivos: { done: 4, total: 5 },
    cursos: { done: 2, total: 3 },
    feedback: 'Positivo',
    riesgo: 'Bajo',
    estado: 'Activo',
  },
  {
    id: 2,
    name: 'María López',
    email: 'maria.lopez@empresa.com',
    initials: 'ML',
    avatarBg: 'bg-pink-400',
    rol: 'Backend Developer',
    departamento: 'Tecnología',
    seniority: 'Semi-Senior',
    lider: { name: 'Lucas Silva', initials: 'LS', bg: 'bg-sky-300' },
    objetivos: { done: 3, total: 5 },
    cursos: { done: 1, total: 3 },
    feedback: 'Neutro',
    riesgo: 'Medio',
    estado: 'Activo',
  },
  {
    id: 3,
    name: 'Lucas Fernández',
    email: 'lucas.fernandez@empresa.com',
    initials: 'LF',
    avatarBg: 'bg-emerald-400',
    rol: 'UX Designer',
    departamento: 'Producto',
    seniority: 'Senior',
    lider: { name: 'Martín Ruiz', initials: 'MR', bg: 'bg-orange-300' },
    objetivos: { done: 5, total: 5 },
    cursos: { done: 3, total: 3 },
    feedback: 'Positivo',
    riesgo: 'Bajo',
    estado: 'Activo',
  },
  {
    id: 4,
    name: 'Martín Suárez',
    email: 'martin.suarez@empresa.com',
    initials: 'MS',
    avatarBg: 'bg-slate-400',
    rol: 'DevOps Engineer',
    departamento: 'Tecnología',
    seniority: 'Junior',
    lider: { name: 'Lucas Díaz', initials: 'LD', bg: 'bg-cyan-400' },
    objetivos: { done: 1, total: 5 },
    cursos: { done: 0, total: 3 },
    feedback: 'Negativo',
    riesgo: 'Alto',
    estado: 'Activo',
  },
  {
    id: 5,
    name: 'Camila Torres',
    email: 'camila.torres@empresa.com',
    initials: 'CT',
    avatarBg: 'bg-amber-400',
    rol: 'Data Analyst',
    departamento: 'Datos',
    seniority: 'Semi-Senior',
    lider: { name: 'Sofía Herrera', initials: 'SH', bg: 'bg-pink-300' },
    objetivos: { done: 3, total: 5 },
    cursos: { done: 2, total: 4 },
    feedback: 'Neutro',
    riesgo: 'Medio',
    estado: 'Activo',
  },
  {
    id: 6,
    name: 'Alejandro Gómez',
    email: 'alejandro.gomez@empresa.com',
    initials: 'AG',
    avatarBg: 'bg-indigo-400',
    rol: 'Project Manager',
    departamento: 'Operaciones',
    seniority: 'Senior',
    lider: { name: 'Martín Ruiz', initials: 'MR', bg: 'bg-orange-300' },
    objetivos: { done: 4, total: 5 },
    cursos: { done: 1, total: 2 },
    feedback: 'Positivo',
    riesgo: 'Bajo',
    estado: 'Activo',
  },
  {
    id: 7,
    name: 'Valentina Díaz',
    email: 'valentina.diaz@empresa.com',
    initials: 'VD',
    avatarBg: 'bg-rose-400',
    rol: 'HR Analyst',
    departamento: 'Talento',
    seniority: 'Junior',
    lider: { name: 'Daniela Ruffy', initials: 'DR', bg: 'bg-emerald-300' },
    objetivos: { done: 2, total: 5 },
    cursos: { done: 1, total: 3 },
    feedback: 'Neutro',
    riesgo: 'Medio',
    estado: 'En licencia',
  },
  {
    id: 8,
    name: 'Sofía Herrera',
    email: 'sofia.herrera@empresa.com',
    initials: 'SH',
    avatarBg: 'bg-teal-400',
    rol: 'Product Owner',
    departamento: 'Producto',
    seniority: 'Senior',
    lider: { name: 'Ana Gómez', initials: 'AG', bg: 'bg-violet-300' },
    objetivos: { done: 5, total: 5 },
    cursos: { done: 2, total: 2 },
    feedback: 'Positivo',
    riesgo: 'Bajo',
    estado: 'Activo',
  },
]

// col visibility: '' = always, 'hidden sm:table-cell', 'hidden md:table-cell', 'hidden lg:table-cell'
const columns = [
  { label: 'Colaborador',   vis: '' },
  { label: 'Rol',           vis: 'hidden md:table-cell' },
  { label: 'Departamento',  vis: 'hidden lg:table-cell' },
  { label: 'Líder directo', vis: 'hidden lg:table-cell' },
  { label: 'Objetivos',     vis: 'hidden md:table-cell' },
  { label: 'Cursos',        vis: 'hidden lg:table-cell' },
  { label: 'Feedback',      vis: 'hidden sm:table-cell' },
  { label: 'Riesgo',        vis: 'hidden sm:table-cell' },
  { label: 'Estado',        vis: '' },
  { label: '',              vis: '' },
]

const feedbackStyle = {
  Positivo: 'bg-green-100 text-green-600',
  Negativo: 'bg-red-100 text-red-500',
  Neutro:   'bg-slate-100 text-slate-500',
}

const riesgoStyle = {
  Bajo:  'bg-green-100 text-green-600',
  Medio: 'bg-orange-100 text-orange-500',
  Alto:  'bg-red-100 text-red-500',
}

const estadoStyle = {
  Activo:        'bg-green-100 text-green-600',
  'En licencia': 'bg-amber-100 text-amber-600',
  Inactivo:      'bg-slate-100 text-slate-500',
}

const departamentos = ['Todos', 'Tecnología', 'Producto', 'Datos', 'Operaciones', 'Talento']
const seniorities   = ['Todos', 'Junior', 'Semi-Senior', 'Senior']
const estados       = ['Todos', 'Activo', 'En licencia', 'Inactivo']
const riesgos       = ['Todos', 'Bajo', 'Medio', 'Alto']

function SelectFilter({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium text-brand-hover border border-brand-light rounded-lg px-3 py-2 bg-brand-light
                 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light cursor-pointer
                 transition-colors duration-150 hover:bg-brand-light"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt === 'Todos' ? `${label}: Todos` : opt}</option>
      ))}
    </select>
  )
}

function Avatar({ initials, bg, size = 'md' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center shrink-0`}>
      <span className="font-bold text-white leading-none">{initials}</span>
    </div>
  )
}

function ProgressBadge({ done, total }) {
  const pct = Math.round((done / total) * 100)
  const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-orange-500' : 'text-red-500'
  return (
    <div className="flex flex-col gap-1 min-w-[48px]">
      <span className={`text-sm font-semibold ${color}`}>{done}/{total}</span>
      <div className="h-1 w-full bg-white/70 rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Colaboradores() {
  const [search, setSearch]       = useState('')
  const [depto, setDepto]         = useState('Todos')
  const [seniority, setSeniority] = useState('Todos')
  const [estado, setEstado]       = useState('Todos')
  const [riesgo, setRiesgo]       = useState('Todos')

  const hasFilters = depto !== 'Todos' || seniority !== 'Todos' || estado !== 'Todos' || riesgo !== 'Todos' || search !== ''

  const clearFilters = () => {
    setSearch(''); setDepto('Todos'); setSeniority('Todos')
    setEstado('Todos'); setRiesgo('Todos')
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch    = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.rol.toLowerCase().includes(q)
    const matchDepto     = depto === 'Todos'     || e.departamento === depto
    const matchSeniority = seniority === 'Todos' || e.seniority === seniority
    const matchEstado    = estado === 'Todos'    || e.estado === estado
    const matchRiesgo    = riesgo === 'Todos'    || e.riesgo === riesgo
    return matchSearch && matchDepto && matchSeniority && matchEstado && matchRiesgo
  })

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">

          {/* Header */}
          <div className="border-l-4 border-brand pl-4">
            <h1 className="text-lg lg:text-xl font-bold text-slate-800">Colaboradores</h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-0.5">Gestiona y monitorea a todas las personas de la organización</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border border-brand-light shadow-sm">

            {/* Search + filtros */}
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-brand-light bg-brand-pale rounded-t-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o rol..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-brand-light bg-white text-xs
                             text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand
                             focus:ring-2 focus:ring-brand-light transition-colors duration-150"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand hover:bg-brand-hover text-xs font-semibold text-white transition-colors cursor-pointer">
                  <SlidersHorizontal size={14} />
                  Filtros
                </button>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-hover hover:text-brand-hover transition-colors cursor-pointer"
                  >
                    <X size={13} />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-brand-light bg-brand-pale/50">
              <SelectFilter label="Departamento"    value={depto}     options={departamentos} onChange={setDepto} className="bg-brand-hover" />
              <SelectFilter label="Seniority"       value={seniority} options={seniorities}   onChange={setSeniority} />
              <SelectFilter label="Estado"          value={estado}    options={estados}       onChange={setEstado} />
              <SelectFilter label="Nivel de riesgo" value={riesgo}    options={riesgos}       onChange={setRiesgo} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy">
                    {columns.map(({ label, vis }) => (
                      <th key={label} className={`text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap ${vis}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-10 text-sm text-slate-400 bg-brand-pale">
                        No se encontraron colaboradores
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp, i) => (
                      <tr
                        key={emp.id}
                        className={`border-b border-brand-light transition-colors hover:brightness-95
                          ${i % 2 === 0 ? 'bg-brand-pale' : 'bg-brand-light'}`}
                      >
                        {/* Colaborador - always */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp.initials} bg={emp.avatarBg} />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700 leading-tight truncate">{emp.name}</p>
                              <p className="text-xs text-slate-400 truncate hidden sm:block">{emp.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Rol - md+ */}
                        <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">{emp.rol}</td>

                        {/* Departamento - lg+ */}
                        <td className="hidden lg:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">{emp.departamento}</td>

                        {/* Líder - lg+ */}
                        <td className="hidden lg:table-cell px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar initials={emp.lider.initials} bg={emp.lider.bg} size="sm" />
                            <span className="text-slate-600 whitespace-nowrap text-xs">{emp.lider.name}</span>
                          </div>
                        </td>

                        {/* Objetivos - md+ */}
                        <td className="hidden md:table-cell px-4 py-3">
                          <ProgressBadge done={emp.objetivos.done} total={emp.objetivos.total} />
                        </td>

                        {/* Cursos - lg+ */}
                        <td className="hidden lg:table-cell px-4 py-3">
                          <ProgressBadge done={emp.cursos.done} total={emp.cursos.total} />
                        </td>

                        {/* Feedback - sm+ */}
                        <td className="hidden sm:table-cell px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${feedbackStyle[emp.feedback]}`}>
                            {emp.feedback}
                          </span>
                        </td>

                        {/* Riesgo - sm+ */}
                        <td className="hidden sm:table-cell px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riesgoStyle[emp.riesgo]}`}>
                            {emp.riesgo}
                          </span>
                        </td>

                        {/* Estado - always */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoStyle[emp.estado]}`}>
                            {emp.estado}
                          </span>
                        </td>

                        {/* Acciones - always */}
                        <td className="px-4 py-3">
                          <button className="text-brand hover:text-brand-hover transition-colors cursor-pointer p-1 rounded hover:bg-brand-light">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-brand-light bg-brand-pale/50 rounded-b-xl">
              <p className="text-xs text-brand-hover font-medium">
                Mostrando {filtered.length} de {employees.length} colaboradores
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer
                      ${page === 1 ? 'bg-navy text-white' : 'text-brand-hover hover:bg-brand-light'}`}
                  >
                    {page}
                  </button>
                ))}
                <span className="text-sky-300 text-xs px-1">...</span>
                <button className="w-7 h-7 rounded-lg text-xs font-semibold text-brand-hover hover:bg-brand-light transition-colors cursor-pointer">8</button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
