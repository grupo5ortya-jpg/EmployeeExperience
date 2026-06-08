const STATUS_META = {
    ON_TRACK:  { label: 'En curso',   badge: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-400', card: 'border-brand-light bg-white' },
    AT_RISK:   { label: 'En riesgo',  badge: 'bg-amber-100 text-amber-600',     bar: 'bg-amber-400',   card: 'border-amber-200 bg-amber-50/60' },
    STAGNANT:  { label: 'Estancado',  badge: 'bg-red-100 text-red-600',         bar: 'bg-red-400',     card: 'border-red-200 bg-red-50/60' },
    COMPLETED: { label: 'Completado', badge: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-400', card: 'border-emerald-200 bg-emerald-50/60' },
}

export const okrStatusMeta = (status) => STATUS_META[status] ?? STATUS_META.ON_TRACK

const METRIC_UNIT = { NUMBER: '', PERCENTAGE: '%', CURRENCY: '$' }

export function formatMetricValue(value, metricType) {
    const unit = METRIC_UNIT[metricType] ?? ''
    if (metricType === 'CURRENCY') return `${unit}${value}`
    return `${value}${unit}`
}
