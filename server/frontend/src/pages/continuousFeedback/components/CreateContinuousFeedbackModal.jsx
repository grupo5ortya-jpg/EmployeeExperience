import { useState }        from 'react'
import { useSelector }     from 'react-redux'
import { X } from 'lucide-react'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm
text-slate-700 placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

export default function CreateContinuousFeedbackModal({
    isOpen,
    onClose,
    employees,
    onSubmit,
}) {
    const { user } = useSelector((s) => s.auth)

    const [form, setForm] = useState({
        receiverId:  '',
        description: '',
        type:        'RECOGNITION',
        isAnonymous: false,
    })

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onSubmit({
            ...form,
            emitterId: user?.employeeId ?? '',
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            Nuevo feedback continuo
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                            Emití un reconocimiento o sugerencia
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 flex flex-col gap-4"
                >

                    {/* Tipo */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                            Tipo
                        </label>

                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className={inputCls}
                        >
                            <option value="RECOGNITION">
                                Reconocimiento
                            </option>

                            <option value="SUGGESTION">
                                Sugerencia
                            </option>
                        </select>
                    </div>

                    {/* Receptor */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                            Destinatario
                        </label>

                        <select
                            name="receiverId"
                            value={form.receiverId}
                            onChange={handleChange}
                            className={inputCls}
                            required
                        >
                            <option value="">
                                Seleccionar colaborador
                            </option>

                            {employees.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.firstName} {e.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">
                            Mensaje
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className={`${inputCls} resize-none`}
                            required
                        />
                    </div>

                    {/* Anónimo */}
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            name="isAnonymous"
                            checked={form.isAnonymous}
                            onChange={handleChange}
                        />

                        Emitir anónimamente
                    </label>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-brand-light">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="bg-brand hover:bg-brand-hover text-white
                            text-sm font-semibold px-5 py-2.5 rounded-lg"
                        >
                            Enviar feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}