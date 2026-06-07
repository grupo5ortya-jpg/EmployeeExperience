import { ChevronRight, Pencil, User, Calendar } from 'lucide-react'
import { useState } from 'react'
import { OkrStatusBadge, OkrProgressBar } from './OkrProgress'
import { formatMetricValue } from '../okrUtils'

function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function OkrTreeNode({ node, depth = 0, onEdit }) {
    const [collapsed, setCollapsed] = useState(false)
    const hasChildren = node.childNodes?.length > 0
    const responsibleName = node.responsible
        ? `${node.responsible.firstName ?? ''} ${node.responsible.lastName ?? ''}`.trim()
        : '—'

    return (
        <div className="flex flex-col gap-2" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
            <div className={`rounded-xl border p-4 flex flex-col gap-3 transition-colors
                             ${node.isOverdue ? 'border-red-200 bg-red-50/40' : 'border-brand-light bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                        {hasChildren && (
                            <button onClick={() => setCollapsed((v) => !v)} className="mt-0.5 text-slate-400 hover:text-brand shrink-0">
                                <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                            </button>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{node.title}</p>
                            {node.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{node.description}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => onEdit(node)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover shrink-0"
                    >
                        <Pencil size={13} />
                        Editar
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <User size={12} />
                        {responsibleName}
                    </span>
                    {node.dueDate && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {formatDate(node.dueDate)}
                        </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        {node.period === 'YEARLY' ? 'Anual' : 'Trimestral'}
                    </span>
                    <OkrStatusBadge status={node.status} overdue={node.isOverdue} />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <OkrProgressBar status={node.status} percent={node.progressPercent} />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                        {formatMetricValue(node.currentValue, node.metricType)} / {formatMetricValue(node.targetValue, node.metricType)}
                    </span>
                </div>
            </div>

            {hasChildren && !collapsed && (
                <div className="flex flex-col gap-2 border-l-2 border-brand-light pl-2">
                    {node.childNodes.map((child) => (
                        <OkrTreeNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} />
                    ))}
                </div>
            )}
        </div>
    )
}
