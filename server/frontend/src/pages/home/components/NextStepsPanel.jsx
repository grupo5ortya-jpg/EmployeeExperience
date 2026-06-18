import { Link } from 'react-router-dom'
import {
  Sparkles, Clock, RotateCcw, TrendingUp, BarChart2, AlertTriangle, Circle,
} from 'lucide-react'
import { useNextSteps } from '../../../hooks/useNextSteps'

/* ── Próximos pasos ──────────────────────────────────────────── */
const NEXT_STEP_META = {
  overdue_task:     { Icon: Clock,          iconCls: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100' },
  pending_feedback: { Icon: RotateCcw,      iconCls: 'text-violet-500', bg: 'bg-violet-50',  border: 'border-violet-100' },
  career_action:    { Icon: TrendingUp,     iconCls: 'text-brand',      bg: 'bg-brand-pale', border: 'border-brand-light' },
  gap_suggestion:   { Icon: BarChart2,      iconCls: 'text-purple-500', bg: 'bg-purple-50',  border: 'border-purple-100' },
  okr_risk:         { Icon: AlertTriangle,  iconCls: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100' },
}

export default function NextStepsPanel({ employeeId }) {
  const { data: steps = [], isLoading } = useNextSteps(employeeId)
  const visible = steps.slice(0, 3)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand" />
          <h3 className="text-sm font-semibold text-slate-700">Próximos pasos</h3>
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (visible.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-brand" />
        <h3 className="text-sm font-semibold text-slate-700">Próximos pasos</h3>
      </div>
      <div className="flex flex-col gap-2">
        {visible.map((step, i) => {
          const meta = NEXT_STEP_META[step.type] ?? { Icon: Circle, iconCls: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' }
          const { Icon, iconCls, bg, border } = meta
          return (
            <Link
              key={i}
              to={step.link}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-opacity hover:opacity-80 ${bg} ${border}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconCls}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 leading-snug">{step.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{step.description}</p>
              </div>
              <span className="text-xs text-brand font-medium shrink-0 mt-0.5">Ver →</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
