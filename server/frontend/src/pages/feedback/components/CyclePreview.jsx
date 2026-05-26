import {
    Building2, CalendarRange, Lock,
    Star, HelpCircle, ShieldCheck, Users,
} from 'lucide-react'
import { COMPETENCIES } from '../constants/competencies'

function formatDateRange(start, end) {
    if (!start && !end) return null
    const fmt = (d) =>
        d
            ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric',
            })
            : '?'
    return `${fmt(start)} — ${fmt(end)}`
}

/**
 * Panel de vista previa pegajosa (columna derecha de CreateFeedback).
 * Muestra nombre, departamento, período, anonimato, competencias y total de preguntas.
 *
 * @param {{
 *   form: object,
 *   selectedIds: string[],
 *   totalQuestions: number,
 *   deptName: string,
 *   participantCount: number,
 * }} props
 */
export function CyclePreview({ form, selectedIds, totalQuestions, deptName, participantCount }) {
    const period      = formatDateRange(form.startDate, form.endDate)
    const selectedDefs = COMPETENCIES.filter((c) => selectedIds.includes(c.id))

    return (
        <div className="lg:sticky lg:top-4 bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

            {/* Encabezado */}
            <div className="bg-navy px-5 py-3.5">
                <p className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
                    Vista previa del ciclo
                </p>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">

                {/* Nombre */}
                <p className={`text-sm font-bold leading-snug ${form.name ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                    {form.name || 'Sin nombre'}
                </p>

                <div className="h-px bg-brand-light" />

                {/* Departamento */}
                <div className="flex items-start gap-2.5">
                    <Building2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-slate-400">Departamento</p>
                        <p className={`text-xs font-semibold mt-0.5 ${deptName ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                            {deptName || 'Sin seleccionar'}
                        </p>
                    </div>
                </div>

                {/* Participantes estimados */}
                <div className="flex items-start gap-2.5">
                    <Users size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-slate-400">Participantes estimados</p>
                        {deptName ? (
                            <p className="text-xs font-semibold mt-0.5 text-slate-700">
                                <span className="text-brand font-extrabold text-sm">{participantCount}</span>
                                {' '}empleado{participantCount !== 1 ? 's' : ''} de {deptName}
                            </p>
                        ) : (
                            <p className="text-xs font-semibold mt-0.5 text-slate-300 italic">
                                Seleccioná un departamento
                            </p>
                        )}
                    </div>
                </div>

                {/* Período */}
                <div className="flex items-start gap-2.5">
                    <CalendarRange size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-slate-400">Período</p>
                        <p className={`text-xs font-semibold mt-0.5 ${period ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                            {period || 'Sin definir'}
                        </p>
                    </div>
                </div>

                {/* Anonimato */}
                <div className="flex items-start gap-2.5">
                    <Lock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-slate-400">Respuestas anónimas mínimas</p>
                        <p className={`text-xs font-semibold mt-0.5 ${form.minAnonymousResponses ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                            {form.minAnonymousResponses || 'Sin definir'}
                        </p>
                    </div>
                </div>

                <div className="h-px bg-brand-light" />

                {/* Competencias seleccionadas */}
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Star size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-400">
                            Competencias ({selectedIds.length})
                        </p>
                    </div>
                    {selectedDefs.length === 0 ? (
                        <p className="text-xs text-slate-300 italic">Sin seleccionar</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedDefs.map((c) => (
                                <span
                                    key={c.id}
                                    className="text-xs font-medium bg-brand-pale text-brand px-2 py-0.5 rounded-full"
                                >
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total de preguntas */}
                <div className="flex items-center justify-between bg-brand-pale/60 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                        <HelpCircle size={14} className="text-brand" />
                        <p className="text-xs font-semibold text-slate-700">Total de preguntas</p>
                    </div>
                    <span className="text-base font-extrabold text-brand">{totalQuestions}</span>
                </div>

                {/* Disclaimer de anonimato */}
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <ShieldCheck size={14} className="text-green-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700 leading-snug">
                        Las respuestas de pares son <strong>anónimas</strong>. Solo se
                        muestran resultados agregados cuando se alcanza el mínimo configurado.
                    </p>
                </div>

            </div>
        </div>
    )
}
