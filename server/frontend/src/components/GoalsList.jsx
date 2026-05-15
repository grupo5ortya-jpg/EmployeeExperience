const typeBadge = {
  Individual: 'bg-violet-100 text-violet-700',
  Equipo:     'bg-blue-100 text-blue-700',
  Empresa:    'bg-orange-100 text-orange-700',
}

const goals = [
  { id: 1, title: 'Comunicación de liderazgo',     type: 'Individual', pct: 70 },
  { id: 2, title: 'Soporte de Proyecto',            type: 'Equipo',     pct: 50 },
  { id: 3, title: 'Mejorar habilidades del sistema',type: 'Individual', pct: 40 },
  { id: 4, title: 'Mejorar para soporte integrado', type: 'Empresa',    pct: 20 },
]

function GoalRow({ title, type, pct }) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge[type]}`}
          >
            {type}
          </span>
          <p className="text-sm text-gray-700 font-medium truncate">{title}</p>
        </div>
        <span className="text-sm font-semibold text-gray-900 shrink-0">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function GoalsList() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Mis objetivos</h3>
        <button className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors cursor-pointer">
          Ver todos →
        </button>
      </div>

      {/* Goals */}
      <div className="flex flex-col gap-4">
        {goals.map((goal) => (
          <GoalRow key={goal.id} {...goal} />
        ))}
      </div>
    </div>
  )
}
