import { Link } from 'react-router-dom'
import { HeartHandshake, MessageSquareWarning, MessageSquareDashed } from 'lucide-react'
import { useReceivedFeedbacks } from '../../continuousFeedback/hooks/useContinuousFeedback'

/* ── Panel feedbacks recibidos ───────────────────────────────── */
export default function ReceivedFeedbacksPanel({ employeeId }) {
  const { data: feedbacks = [], isLoading } = useReceivedFeedbacks(employeeId)

  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700">Feedbacks recibidos</h3>
          <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-light text-brand
                           text-xs font-bold flex items-center justify-center">
            {feedbacks.length}
          </span>
        </div>
        <Link to="/continuous-feedback"
              className="text-xs text-brand hover:text-brand-hover font-medium transition-colors">
          Ver todos →
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && feedbacks.length === 0 && (
        <div className="flex items-center gap-2 py-4 justify-center text-slate-400">
          <MessageSquareDashed size={14} />
          <span className="text-xs">Todavía no recibiste feedbacks.</span>
        </div>
      )}

      {!isLoading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {feedbacks.slice(0, 6).map((item) => {
            const isRecognition = item.type === 'RECOGNITION'
            const from = item.emitter
              ? `${item.emitter.firstName} ${item.emitter.lastName}`
              : 'Anónimo'
            return (
              <Link
                key={item.id}
                to="/continuous-feedback"
                className={`rounded-lg border p-3 flex flex-col gap-1.5
                            hover:opacity-80 transition-opacity cursor-pointer
                            ${isRecognition
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-amber-50 border-amber-200'}`}
              >
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide
                                 ${isRecognition ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isRecognition
                    ? <HeartHandshake size={11} className="shrink-0" />
                    : <MessageSquareWarning size={11} className="shrink-0" />}
                  {isRecognition ? 'Reconocimiento' : 'Sugerencia'}
                </div>
                {item.title && (
                  <p className={`text-xs font-semibold leading-snug truncate
                                 ${isRecognition ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {item.title}
                  </p>
                )}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                  {item.description}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">De: {from}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
