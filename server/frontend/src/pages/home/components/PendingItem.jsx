import { Link } from 'react-router-dom'

/* ── Pendientes (lista genérica) ─────────────────────────────── */
export default function PendingItem({ icon: Icon, iconClass, title, subtitle, to, badge }) {
  const content = (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0
                    hover:bg-brand-pale/30 rounded-lg px-2 -mx-2 transition-colors">
      <Icon size={16} className={`shrink-0 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      )}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}
