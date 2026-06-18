import { Link } from 'react-router-dom'

/* ── Sección de pendientes con header ────────────────────────── */
export default function PendingSection({ title, to, children }) {
  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {to && (
          <Link to={to} className="text-xs text-brand hover:text-brand-hover font-medium transition-colors">
            Ver todas →
          </Link>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
