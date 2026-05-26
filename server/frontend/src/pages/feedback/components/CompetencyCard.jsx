import { Check } from 'lucide-react'

/**
 * Tarjeta de competencia interactiva (seleccionable/deseleccionable).
 * Usada dentro de CompetencySelector en CreateFeedback.
 *
 * @param {{ competency: object, selected: boolean, onClick: () => void }} props
 */
export function CompetencyCard({ competency, selected, onClick }) {
    const { Icon, label, description } = competency

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer w-full
                ${selected
                    ? 'border-brand bg-brand-pale shadow-sm shadow-brand/10'
                    : 'border-slate-200 bg-white hover:border-brand-light hover:bg-brand-pale/30'
                }`}
        >
            {selected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand
                                 flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={3} />
                </span>
            )}

            <Icon
                size={20}
                className={`mb-2 ${selected ? 'text-brand' : 'text-slate-400'}`}
                strokeWidth={1.8}
            />
            <p className={`text-xs font-bold leading-tight ${selected ? 'text-brand' : 'text-slate-700'}`}>
                {label}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{description}</p>
        </button>
    )
}
