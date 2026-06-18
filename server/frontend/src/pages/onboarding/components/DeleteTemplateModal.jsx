import { AlertTriangle } from 'lucide-react'

export default function DeleteTemplateModal({ template, deleting, onCancel, onConfirm }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
            onClick={() => !deleting && onCancel()}
        >
            <div
                className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-sm mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={16} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Eliminar template</h3>
                </div>
                <p className="text-sm text-slate-500 mb-1">
                    Vas a eliminar{' '}
                    <span className="font-semibold text-slate-700">"{template.name}"</span>
                    {template.sub_type && (
                        <span className="text-slate-400"> — {template.sub_type}</span>
                    )}.
                </p>
                <p className="text-xs text-slate-400 mb-5">
                    Los empleados que ya tenían tareas de este template las conservarán en su historial.
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700
                                   px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors
                                   cursor-pointer disabled:opacity-40"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                                   px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                   disabled:opacity-40"
                    >
                        {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
