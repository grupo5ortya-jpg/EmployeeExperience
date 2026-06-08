import { useState } from 'react'
import { Calendar, Check } from 'lucide-react'
import { OkrStatusBadge, OkrProgressBar } from './OkrProgress'
import { formatMetricValue, okrStatusMeta } from '../okrUtils'

function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MyOkrCard({ okr, onUpdateProgress, saving }) {
    const [value, setValue] = useState(okr.currentValue)
    const [editing, setEditing] = useState(false)

    const handleSave = async () => {
        await onUpdateProgress(okr.id, Number(value))
        setEditing(false)
    }

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${okrStatusMeta(okr.status).card}`}>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{okr.title}</p>
                    {okr.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{okr.description}</p>
                    )}
                    {okr.parent && (
                        <p className="text-xs text-brand mt-1">Parte de: {okr.parent.title}</p>
                    )}
                </div>
                <OkrStatusBadge status={okr.status} overdue={okr.isOverdue} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {okr.dueDate && (
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        Vence el {formatDate(okr.dueDate)}
                    </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                    {okr.period === 'YEARLY' ? 'Anual' : 'Trimestral'}
                </span>
            </div>

            <OkrProgressBar status={okr.status} percent={okr.progressPercent} />

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {okr.expectedProgressPercent != null && (
                    <span>Progreso esperado: <span className="font-semibold text-slate-500">{okr.expectedProgressPercent}%</span></span>
                )}
                {okr.daysRemaining != null && (
                    <span>
                        {okr.daysRemaining >= 0
                            ? <>Días restantes: <span className="font-semibold text-slate-500">{okr.daysRemaining}</span></>
                            : <span className="font-semibold text-red-500">Vencido hace {Math.abs(okr.daysRemaining)} días</span>}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">
                    Progreso actual: <span className="font-semibold text-slate-700">{formatMetricValue(okr.currentValue, okr.metricType)}</span>
                    {' '}— Meta: <span className="font-semibold text-slate-700">{formatMetricValue(okr.targetValue, okr.metricType)}</span>
                </span>

                {okr.status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <Check size={13} />
                        Objetivo completado
                    </span>
                ) : editing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            min="0"
                            step="any"
                            className="w-24 rounded-lg border border-brand-light px-2.5 py-1.5 text-sm
                                       text-slate-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                                       text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                            <Check size={13} />
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            onClick={() => { setEditing(false); setValue(okr.currentValue) }}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="text-xs font-semibold text-brand hover:text-brand-hover"
                    >
                        Actualizar progreso
                    </button>
                )}
            </div>
        </div>
    )
}
