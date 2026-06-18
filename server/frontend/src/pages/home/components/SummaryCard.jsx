import { Link } from 'react-router-dom'

/* ── Card de resumen ─────────────────────────────────────────── */
export default function SummaryCard({ icon: Icon, iconBg, iconColor, label, value, unit, to }) {
  const inner = (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-400 leading-tight">{label}</p>
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={16} strokeWidth={2} className={iconColor} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-slate-800 leading-none">{value ?? '—'}</span>
        {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}
