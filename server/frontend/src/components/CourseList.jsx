const courses = [
  {
    id:       1,
    title:    'Liderazgo efectivo',
    provider: 'LinkedIn Learning',
    pct:      60,
    thumbBg:  'bg-violet-200',
    thumbText:'LE',
  },
  {
    id:       2,
    title:    'Comunicación para líderes',
    provider: 'Coursera',
    pct:      75,
    thumbBg:  'bg-cyan-200',
    thumbText:'CL',
  },
  {
    id:       3,
    title:    'Gestión del tiempo',
    provider: 'Udemy',
    pct:      15,
    thumbBg:  'bg-orange-200',
    thumbText:'GT',
  },
]

function CourseRow({ title, provider, pct, thumbBg, thumbText }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {/* Thumbnail */}
      <div
        className={`w-11 h-11 rounded-lg ${thumbBg} flex items-center justify-center shrink-0`}
      >
        <span className="text-xs font-bold text-white/80 tracking-wide">{thumbText}</span>
      </div>

      {/* Info + progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-2">{provider}</p>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 shrink-0 w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CourseList() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">Mis cursos en progreso</h3>
        <button className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors cursor-pointer">
          Ver todos →
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {courses.map((course) => (
          <CourseRow key={course.id} {...course} />
        ))}
      </div>
    </div>
  )
}
