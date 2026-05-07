import { BookOpen, Users, Lightbulb } from 'lucide-react'

const recommendations = [
  {
    id:    1,
    icon:  BookOpen,
    iconBg:'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Completar el programa de liderazgo con éxito',
    desc:  'Tenés un 68% completado. Retomá donde lo dejaste y cerrá el módulo esta semana.',
    badge: { label: 'Por hacer', style: 'bg-blue-100 text-blue-700' },
    action:'Empezar',
  },
  {
    id:    2,
    icon:  Users,
    iconBg:'bg-orange-100',
    iconColor: 'text-orange-500',
    title: 'Pedir participación en programa con Fabiana',
    desc:  'Tu manager recomienda que te sumes al programa de mentoring del Q2.',
    badge: { label: 'Notificación', style: 'bg-orange-100 text-orange-700' },
    action:'Ver más',
  },
  {
    id:    3,
    icon:  Lightbulb,
    iconBg:'bg-green-100',
    iconColor: 'text-green-600',
    title: "Trabajar en la habilidad de comunicación efectiva",
    desc:  'Basado en tu feedback 360°, este curso refuerza tu área de mejora principal.',
    badge: { label: 'Curso', style: 'bg-green-100 text-green-700' },
    action:'Ir al curso',
  },
]

function RecommendationRow({ icon: Icon, iconBg, iconColor, title, desc, badge, action }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={16} strokeWidth={2} className={iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${badge.style}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        <button className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer">
          {action} →
        </button>
      </div>
    </div>
  )
}

export default function AIRecommendations() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">
          Recomendaciones para ti{' '}
          <span className="text-gray-400 font-normal">(IA)</span>
        </h3>
        <button className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors cursor-pointer">
          Ver todas →
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {recommendations.map((rec) => (
          <RecommendationRow key={rec.id} {...rec} />
        ))}
      </div>
    </div>
  )
}
