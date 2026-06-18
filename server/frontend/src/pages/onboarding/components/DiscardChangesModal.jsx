export default function DiscardChangesModal({ currentTypeName, onCancel, onConfirm }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-sm mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-base font-bold text-slate-800 mb-1">¿Descartar cambios?</h3>
                <p className="text-sm text-slate-400 mb-5">
                    Tenés cambios sin guardar en{' '}
                    <span className="font-semibold text-slate-600">{currentTypeName}</span>.
                    Si continuás se perderán.
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700
                                   px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                    >
                        Seguir editando
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                                   px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Sí, descartar
                    </button>
                </div>
            </div>
        </div>
    )
}
