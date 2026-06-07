const STATUS_META = {
    NOT_STARTED: { label: 'No iniciado', badge: 'bg-slate-100 text-slate-500',  bar: 'bg-slate-300' },
    IN_PROGRESS: { label: 'En progreso', badge: 'bg-sky-100 text-sky-600',      bar: 'bg-brand' },
    AT_RISK:     { label: 'En riesgo',   badge: 'bg-amber-100 text-amber-600', bar: 'bg-amber-400' },
    COMPLETED:   { label: 'Completado',  badge: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-400' },
}

export const okrStatusMeta = (status) => STATUS_META[status] ?? STATUS_META.NOT_STARTED

const METRIC_UNIT = { NUMBER: '', PERCENTAGE: '%', CURRENCY: '$' }

export function formatMetricValue(value, metricType) {
    const unit = METRIC_UNIT[metricType] ?? ''
    if (metricType === 'CURRENCY') return `${unit}${value}`
    return `${value}${unit}`
}
