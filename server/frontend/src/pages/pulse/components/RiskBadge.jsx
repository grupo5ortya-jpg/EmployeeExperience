const RISK_CONFIG = {
  GOOD:     { label: 'Bueno',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  MEDIUM:   { label: 'Medio',   className: 'bg-amber-100  text-amber-700  border-amber-200'  },
  NEGATIVE: { label: 'Negativo', className: 'bg-red-100    text-red-700    border-red-200'    },
}

export default function RiskBadge({ risk, size = 'sm' }) {
  const config = RISK_CONFIG[risk] ?? RISK_CONFIG.GOOD
  const sizeClass = size === 'lg'
    ? 'text-sm font-bold px-3 py-1'
    : 'text-xs font-semibold px-2.5 py-0.5'

  return (
    <span className={`inline-flex items-center rounded-full border ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  )
}
