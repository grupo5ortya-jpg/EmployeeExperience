const courses = [
  {
    id:        1,
    title:     'Liderazgo efectivo',
    provider:  'LinkedIn Learning',
    pct:       60,
    thumbBg:   'bg-brand',
    thumbText: 'LE',
  },
  {
    id:        2,
    title:     'Comunicación para líderes',
    provider:  'Coursera',
    pct:       75,
    thumbBg:   'bg-cyan-400',
    thumbText: 'CL',
  },
  {
    id:        3,
    title:     'Gestión del tiempo',
    provider:  'Udemy',
    pct:       15,
    thumbBg:   'bg-orange-300',
    thumbText: 'GT',
  },
]

function CourseRow({ title, provider, pct, thumbBg, thumbText }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-11 h-11 rounded-lg ${thumbBg} flex items-center justify-center shrink-0`}>
        <span className="text-xs font-bold text-white tracking-wide">{thumbText}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 mb-2">{provider}</p>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 shrink-0 w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CourseList() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-700">Mis cursos en progreso</h3>
        <button className="text-xs text-brand-hover hover:text-brand font-medium transition-colors cursor-pointer">
          Ver todos →
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {courses.map((course) => (
          <CourseRow key={course.id} {...course} />
        ))}
      </div>
    </div>
  )
}
