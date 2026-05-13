import { Target, MonitorPlay, MessageSquare, Sparkles } from 'lucide-react'

const cards = [
  {
    label:     'Objetivos activos',
    value:     4,
    unit:      'objetivos',
    sub:       'Ver objetivos →',
    icon:      Target,
    iconBg:    'bg-brand-light',
    iconColor: 'text-brand',
  },
  {
    label:     'Cursos en progreso',
    value:     2,
    unit:      'cursos',
    sub:       'Ir al LMS →',
    icon:      MonitorPlay,
    iconBg:    'bg-cyan-100',
    iconColor: 'text-cyan-500',
  },
  {
    label:     'Feedback pendiente',
    value:     1,
    unit:      'feedback',
    sub:       'Responder ahora →',
    icon:      MessageSquare,
    iconBg:    'bg-orange-100',
    iconColor: 'text-orange-400',
  },
  {
    label:     'Próximos pasos IA',
    value:     3,
    unit:      'recomendaciones',
    sub:       'Ver sugerencias →',
    icon:      Sparkles,
    iconBg:    'bg-brand-light',
    iconColor: 'text-brand',
  },
]

function Card({ label, value, unit, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-400 leading-tight">{label}</p>
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={16} strokeWidth={2} className={iconColor} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-slate-800 leading-none">{value}</span>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>

      <p className="text-xs text-brand-hover font-medium hover:text-brand cursor-pointer transition-colors">
        {sub}
      </p>
    </div>
  )
}

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} {...card} />
      ))}
    </div>
  )
}
