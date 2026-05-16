import { Check } from 'lucide-react'

const tasks = [
  {
    id: 1,
    title:    'Completar evaluación 360°',
    category: 'Feedback 360°',
    badge:    { type: 'urgent', label: 'Vence hoy' },
    done:     false,
  },
  {
    id: 2,
    title:    'Dar feedback a Juan',
    category: 'Feedback 360°',
    badge:    { type: 'date', label: '15/05/2025' },
    done:     false,
  },
  {
    id: 3,
    title:    'Revisar plan de carrera actual',
    category: 'Plan de acción',
    badge:    { type: 'date', label: '20/05/2025' },
    done:     false,
  },
  {
    id: 4,
    title:    'Problema con liderazgo situacional',
    category: 'Aprendizaje LMS',
    badge:    { type: 'date', label: '22/05/2025' },
    done:     false,
  },
  {
    id: 5,
    title:    'Actualizar plan de objetivos',
    category: 'Objetivos',
    badge:    { type: 'date', label: '28/05/2025' },
    done:     false,
  },
  {
    id: 6,
    title:    'Presentación corporativa',
    category: 'Objetivos',
    badge:    { type: 'done', label: 'Completada' },
    done:     true,
  },
]

const badgeStyles = {
  urgent: 'bg-red-50 text-red-500',
  done:   'bg-green-50 text-green-500',
  date:   'bg-transparent text-slate-400',
}

function Badge({ type, label }) {
  return (
    <span className={`text-xs font-medium whitespace-nowrap px-2.5 py-1 rounded-full ${badgeStyles[type]}`}>
      {label}
    </span>
  )
}

function TaskRow({ title, category, badge, done }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`
          w-5 h-5 rounded-full border shrink-0 flex items-center justify-center transition-colors
          ${done
            ? 'bg-green-400 border-green-400'
            : 'border-slate-300 hover:border-brand cursor-pointer'
          }
        `}
      >
        {done && <Check size={11} strokeWidth={3} className="text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight truncate ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {title}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{category}</p>
      </div>

      <Badge type={badge.type} label={badge.label} />
    </div>
  )
}

export default function TaskList() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-700">Próximas tareas</h3>
        <button className="text-xs text-brand-hover hover:text-brand font-medium transition-colors cursor-pointer">
          Ver todas →
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {tasks.map((task) => (
          <TaskRow key={task.id} {...task} />
        ))}
      </div>
    </div>
  )
}
