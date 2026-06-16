import { Clock, LogOut } from 'lucide-react'

function estimatedMinutes(questions) {
  return questions.reduce((sum, q) => sum + (q.estimatedDuration ?? 1), 0)
}

export default function ExitInterviewCard({ assignment, onStart }) {
  const { survey } = assignment
  const mins = estimatedMinutes(survey.questions)

  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="self-start text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Entrevista de salida
          </span>
          <h3 className="text-sm font-bold text-slate-800 leading-snug">{survey.name}</h3>
        </div>
        <LogOut size={18} className="text-brand shrink-0 mt-0.5" />
      </div>

      {survey.description && (
        <p className="text-xs text-slate-500 leading-relaxed">{survey.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={13} />
        <span>~{mins} min · {survey.questions.length} preguntas</span>
      </div>

      {assignment.dueDate && (
        <p className="text-xs text-slate-400">
          Vence:{' '}
          <span className="font-medium text-slate-600">
            {new Date(assignment.dueDate).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </span>
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-auto w-full bg-brand hover:bg-brand-hover text-white
                   text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
      >
        Completar entrevista
      </button>
    </div>
  )
}
