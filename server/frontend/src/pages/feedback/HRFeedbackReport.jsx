import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Send, CheckSquare, Square, CheckCircle2 } from 'lucide-react'
import { useFeedbackResults }      from '../../hooks/useFeedbackResults'
import { useFeedbackGapAnalysis, useGenerateGapAnalysis, useSendGapAnalysis } from '../../hooks/useFeedbackGapAnalysis'
import { CompetencyChart }    from './components/CompetencyChart'
import { COMPETENCY_MAP }     from './competencyConfig'

const TYPE_LABEL = { SELF: 'Auto', PEER: 'Par', LEADER: 'Líder', DIRECT_REPORT: 'Reporte directo' }
const TYPE_STYLE = {
    SELF:          'bg-brand-pale text-brand',
    PEER:          'bg-slate-100 text-slate-500',
    LEADER:        'bg-violet-100 text-violet-600',
    DIRECT_REPORT: 'bg-amber-100 text-amber-700',
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 shrink-0">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </div>
    )
}

export default function HRFeedbackReport() {
    const [params]    = useSearchParams()
    const cycleId     = params.get('cycleId')
    const evaluatedId = params.get('evaluatedId')
    const autoGenerate = params.get('autoGenerate') === '1'

    const { data, isLoading, isError } = useFeedbackResults(cycleId, evaluatedId)
    const { data: gapData, isLoading: loadingGap } = useFeedbackGapAnalysis(cycleId, evaluatedId)
    const { mutate: generate, isPending: generating, error: generateError } = useGenerateGapAnalysis(cycleId, evaluatedId)
    const { mutate: sendSections, isPending: sending } = useSendGapAnalysis(cycleId, evaluatedId)

    const ALL_SECTIONS = ['strengths', 'gaps', 'suggestions']
    const [selected, setSelected] = useState(new Set(ALL_SECTIONS))

    // Auto-generate gap analysis when arriving from "Ver resultados" with no pending evaluations
    useEffect(() => {
        if (!autoGenerate) return
        if (loadingGap || gapData) return
        if (!data || data.stats?.pending > 0) return
        generate()
    }, [autoGenerate, loadingGap, gapData, data])

    const toggleSection = (key) => setSelected((prev) => {
        const next = new Set(prev)
        next.has(key) ? next.delete(key) : next.add(key)
        return next
    })

    if (isLoading) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-56 bg-slate-200 rounded-xl" />
            </div>
        </main>
    )

    if (isError || !data) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
            <p className="text-sm text-red-400">No se pudieron cargar los resultados.</p>
        </main>
    )

    const { evaluated, cycle, competencies, breakdown, stats } = data
    const evalName = evaluated
        ? `${evaluated.firstName ?? ''} ${evaluated.lastName ?? ''}`.trim()
        : 'Empleado'

    const hasData    = breakdown.length > 0
    const hasPending = stats?.pending > 0

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div>
                <Link to={`/feedback/${cycleId}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors w-fit mb-3">
                    <ArrowLeft size={13} />
                    Volver al ciclo
                </Link>
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">
                        Resultados — {evalName}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {cycle?.name}
                        {stats && (
                            <span className="ml-2">
                                · {stats.completed} de {stats.total} evaluaciones completadas
                            </span>
                        )}
                    </p>
                </div>

                {hasPending && (
                    <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200
                                    rounded-lg px-4 py-2.5 text-xs text-amber-700">
                        <span className="font-semibold">
                            {stats.pending} evaluación{stats.pending > 1 ? 'es' : ''} pendiente{stats.pending > 1 ? 's' : ''}
                        </span>
                        — los resultados son parciales hasta que todos completen el formulario.
                    </div>
                )}
            </div>

            {!hasData ? (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-10 text-center shrink-0">
                    <p className="text-sm text-slate-400">
                        No hay evaluaciones completadas para este empleado en este ciclo.
                    </p>
                </div>
            ) : (
                <>
                    {/* Averages chart */}
                    <Section title="Promedio por competencia">
                        <CompetencyChart competencies={competencies} />
                    </Section>

                    {/* Breakdown table */}
                    <Section title={`Desglose por evaluador (${breakdown.length})`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-125">
                                <thead>
                                    <tr className="border-b border-brand-light">
                                        <th className="text-left text-xs text-slate-400 font-semibold pb-2 pr-4">
                                            Evaluador
                                        </th>
                                        <th className="text-left text-xs text-slate-400 font-semibold pb-2 pr-4">
                                            Tipo
                                        </th>
                                        {competencies.map(c => (
                                            <th key={c.id}
                                                className="text-center text-xs text-slate-400 font-semibold pb-2 px-2">
                                                {COMPETENCY_MAP[c.id]?.label ?? c.id}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-light">
                                    {breakdown.map(row => (
                                        <tr key={row.id}>
                                            <td className="py-2.5 pr-4 font-medium text-slate-700">
                                                {row.evaluator
                                                    ? `${row.evaluator.firstName ?? ''} ${row.evaluator.lastName ?? ''}`.trim()
                                                    : '—'}
                                            </td>
                                            <td className="py-2.5 pr-4">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                    ${TYPE_STYLE[row.type] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {TYPE_LABEL[row.type] ?? row.type}
                                                </span>
                                            </td>
                                            {competencies.map(c => (
                                                <td key={c.id}
                                                    className="py-2.5 px-2 text-center font-semibold text-slate-700">
                                                    {row.scores[c.id] != null
                                                        ? row.scores[c.id].toFixed(1)
                                                        : <span className="text-slate-300">—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Comments per evaluator — shows all competencies, "no comentó" if empty */}
                    <Section title="Comentarios por evaluador">
                        <div className="flex flex-col gap-5">
                            {breakdown.map(row => {
                                const name = row.evaluator
                                    ? `${row.evaluator.firstName ?? ''} ${row.evaluator.lastName ?? ''}`.trim()
                                    : '—'
                                return (
                                    <div key={row.id}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-slate-700">{name}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                                ${TYPE_STYLE[row.type] ?? ''}`}>
                                                {TYPE_LABEL[row.type] ?? row.type}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 pl-2">
                                            {competencies.map(c => {
                                                const meta    = COMPETENCY_MAP[c.id]
                                                const comment = row.comments?.[c.id]?.trim()
                                                return (
                                                    <div key={c.id}>
                                                        <p className="text-xs font-semibold text-brand mb-0.5">
                                                            {meta?.label ?? c.id}
                                                        </p>
                                                        {comment ? (
                                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                                <MessageSquare size={12}
                                                                    className="text-slate-300 shrink-0 mt-0.5" />
                                                                <span className="leading-snug">{comment}</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-normal italic">
                                                                no comentó
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Section>
                </>
            )}

            {/* ── AI Gap Analysis ────────────────────────── */}
            {hasData && (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden shrink-0">
                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40
                                    flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-brand" />
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                AI Gap Analysis
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {gapData?.sentAt && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                    <CheckCircle2 size={13} />
                                    Enviado el {new Date(gapData.sentAt).toLocaleDateString('es-AR')}
                                </div>
                            )}
                            {gapData?.createdAt && !gapData.sentAt && (
                                <span className="text-xs text-slate-400">
                                    Generado el {new Date(gapData.createdAt).toLocaleDateString('es-AR')}
                                </span>
                            )}
                            {!loadingGap && !gapData && (() => {
                                const hasPending = (data?.stats?.pending ?? 0) > 0
                                return (
                                    <div className="flex flex-col items-end gap-0.5">
                                        <button
                                            onClick={() => generate()}
                                            disabled={generating || hasPending}
                                            title={hasPending ? 'Esperá que todos completen el formulario' : ''}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-brand
                                                       hover:text-brand-hover bg-brand-pale hover:bg-brand-light
                                                       px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40
                                                       disabled:pointer-events-none"
                                        >
                                            <RefreshCw size={11} className={generating ? 'animate-spin' : ''} />
                                            {generating ? 'Generando...' : 'Generar análisis'}
                                        </button>
                                        {hasPending && (
                                            <span className="text-[10px] text-amber-500 font-medium">
                                                {data.stats.pending} evaluación{data.stats.pending > 1 ? 'es' : ''} pendiente{data.stats.pending > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>

                    <div className="p-5">
                        {loadingGap && (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-1/2" />
                            </div>
                        )}

                        {!loadingGap && !gapData && !generating && (
                            <p className="text-xs text-slate-400 text-center py-4">
                                Hacé click en "Generar análisis" para que la IA compare los resultados
                                con el perfil esperado del departamento.
                            </p>
                        )}

                        {generateError && (
                            <p className="text-xs text-red-400 text-center py-2">
                                Error al generar el análisis. Verificá que haya evaluaciones completadas.
                            </p>
                        )}

                        {gapData?.analysis && (
                            <div className="flex flex-col gap-5">
                                {/* Summary */}
                                <p className="text-sm text-slate-600 leading-snug border-l-2 border-brand pl-3">
                                    {gapData.analysis.summary}
                                </p>

                                {/* Instruction */}
                                <p className="text-xs text-slate-400">
                                    Seleccioná las secciones que querés compartir con el empleado y hacé click en <strong>Enviar al empleado</strong>.
                                </p>

                                {/* 3 selectable cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Strengths */}
                                    {[
                                        {
                                            key:       'strengths',
                                            label:     'Fortalezas',
                                            items:     gapData.analysis.strengths,
                                            Icon:      TrendingUp,
                                            cardCls:   'bg-emerald-50 border-emerald-200',
                                            textCls:   'text-emerald-700',
                                            checkCls:  'text-emerald-600',
                                            activeCls: 'ring-2 ring-emerald-400',
                                        },
                                        {
                                            key:       'gaps',
                                            label:     'Brechas',
                                            items:     gapData.analysis.gaps,
                                            Icon:      AlertTriangle,
                                            cardCls:   'bg-amber-50 border-amber-200',
                                            textCls:   'text-amber-700',
                                            checkCls:  'text-amber-600',
                                            activeCls: 'ring-2 ring-amber-400',
                                        },
                                        {
                                            key:       'suggestions',
                                            label:     'Acciones sugeridas',
                                            items:     gapData.analysis.suggestions,
                                            Icon:      Lightbulb,
                                            cardCls:   'bg-brand-pale border-brand-light',
                                            textCls:   'text-brand',
                                            checkCls:  'text-brand',
                                            activeCls: 'ring-2 ring-brand',
                                        },
                                    ].map(({ key, label, items, Icon, cardCls, textCls, checkCls, activeCls }) => {
                                        const isOn = selected.has(key)
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleSection(key)}
                                                className={`rounded-lg border p-4 text-left transition-all
                                                    ${cardCls} ${isOn ? activeCls : 'opacity-60'}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon size={12} className={`${checkCls} shrink-0`} />
                                                        <p className={`text-xs font-bold uppercase tracking-wide ${textCls}`}>
                                                            {label}
                                                        </p>
                                                    </div>
                                                    {isOn
                                                        ? <CheckSquare size={14} className={checkCls} />
                                                        : <Square size={14} className="text-slate-300" />}
                                                </div>
                                                <ul className="flex flex-col gap-1.5">
                                                    {items.map((s, i) => (
                                                        <li key={i} className={`text-xs leading-snug flex items-start gap-1.5 ${textCls}`}>
                                                            <span className="mt-1 shrink-0">·</span>{s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Send button */}
                                <div className="flex items-center justify-between pt-1 border-t border-brand-light">
                                    <p className="text-xs text-slate-400">
                                        {selected.size === 0
                                            ? 'Seleccioná al menos una sección'
                                            : `${selected.size} sección${selected.size > 1 ? 'es' : ''} seleccionada${selected.size > 1 ? 's' : ''}`}
                                    </p>
                                    <button
                                        onClick={() => sendSections([...selected])}
                                        disabled={sending || selected.size === 0}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-white
                                                   bg-brand hover:bg-brand-hover px-4 py-2 rounded-lg
                                                   transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <Send size={12} />
                                        {sending ? 'Enviando...' : gapData.sentAt ? 'Reenviar al empleado' : 'Enviar al empleado'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </main>
    )
}
