const typeBadge = {
  Individual: 'bg-brand-light text-brand-hover',
  Equipo:     'bg-cyan-100 text-cyan-600',
  Empresa:    'bg-orange-100 text-orange-500',
}

const goals = [
  { id: 1, title: 'Comunicación de liderazgo',      type: 'Individual', pct: 70 },
  { id: 2, title: 'Soporte de Proyecto',             type: 'Equipo',     pct: 50 },
  { id: 3, title: 'Mejorar habilidades del sistema', type: 'Individual', pct: 40 },
  { id: 4, title: 'Mejorar para soporte integrado',  type: 'Empresa',    pct: 20 },
]

function GoalRow({ title, type, pct }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge[type]}`}>
            {type}
          </span>
          <p className="text-sm text-slate-700 font-medium truncate">{title}</p>
        </div>
        <span className="text-sm font-semibold text-slate-700 shrink-0">{pct}%</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function GoalsList() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Mis objetivos</h3>
        <button className="text-xs text-brand-hover hover:text-brand font-medium transition-colors cursor-pointer">
          Ver todos →
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {goals.map((goal) => (
          <GoalRow key={goal.id} {...goal} />
        ))}
      </div>
    </div>
  )
}
