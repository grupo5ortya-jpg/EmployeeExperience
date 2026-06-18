import { CheckCircle2 } from 'lucide-react'

export default function MentorSuggestionCard({ suggestion, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer
        ${selected
          ? 'border-brand bg-brand-pale ring-2 ring-brand/20'
          : 'border-brand-light bg-white hover:border-brand hover:bg-brand-pale/40'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{suggestion.name}</p>
          {(suggestion.department || suggestion.position) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {[suggestion.department, suggestion.position].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {selected
          ? <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
          : <span className="text-xs font-semibold text-brand shrink-0 mt-0.5">Elegir</span>
        }
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{suggestion.reason}</p>
    </button>
  )
}
