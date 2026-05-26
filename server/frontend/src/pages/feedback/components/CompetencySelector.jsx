import { COMPETENCIES } from '../constants/competencies'
import { CompetencyCard } from './CompetencyCard'

/**
 * Sección "2. Competencias a evaluar" de CreateFeedback.
 * Renderiza el grid de CompetencyCards con cabecera y resumen de preguntas.
 *
 * @param {{ selectedIds: string[], onToggle: (id: string) => void }} props
 */
export function CompetencySelector({ selectedIds, onToggle }) {
    // 2 preguntas fijas por competencia
    const totalQuestions = selectedIds.length * 2

    return (
        <section className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-4">
            <div className="pb-3 border-b border-brand-light">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Competencias a evaluar
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                    Seleccioná las competencias que se evaluarán en este ciclo.
                    Cada una agrega 2 preguntas al cuestionario.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {COMPETENCIES.map((c) => (
                    <CompetencyCard
                        key={c.id}
                        competency={c}
                        selected={selectedIds.includes(c.id)}
                        onClick={() => onToggle(c.id)}
                    />
                ))}
            </div>

            {selectedIds.length > 0 && (
                <p className="text-xs text-brand font-medium">
                    {selectedIds.length} competencia{selectedIds.length > 1 ? 's' : ''} seleccionada{selectedIds.length > 1 ? 's' : ''}{' '}
                    → {totalQuestions} preguntas en el ciclo
                </p>
            )}
        </section>
    )
}
