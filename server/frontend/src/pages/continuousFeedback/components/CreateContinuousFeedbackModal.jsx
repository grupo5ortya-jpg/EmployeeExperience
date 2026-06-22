import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { X, ChevronDown, Check } from 'lucide-react'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm
text-slate-700 placeholder:text-slate-400 outline-none bg-white
focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

/* ── Employee combobox ─────────────────────────────────────── */
function EmployeePicker({ employees, value, onChange }) {
    const [query,  setQuery]  = useState('')
    const [open,   setOpen]   = useState(false)
    const ref = useRef(null)

    const selected = employees.find((e) => e.id === value)

    const filtered = query.trim() === ''
        ? employees
        : employees.filter((e) => {
            const full = `${e.firstName} ${e.lastName}`.toLowerCase()
            return full.includes(query.toLowerCase())
        })

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (emp) => {
        onChange(emp.id)
        setQuery('')
        setOpen(false)
    }

    const handleInputChange = (e) => {
        setQuery(e.target.value)
        onChange('')      // clear selection while typing
        setOpen(true)
    }

    const displayValue = open ? query : (selected ? `${selected.firstName} ${selected.lastName}` : '')

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    placeholder="Buscá por nombre..."
                    className={inputCls}
                    autoComplete="off"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setOpen((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                    <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {open && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-brand-light
                               rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <li className="px-4 py-3 text-xs text-slate-400">
                            Sin resultados para "{query}"
                        </li>
                    ) : (
                        filtered.map((emp) => (
                            <li
                                key={emp.id}
                                onMouseDown={() => handleSelect(emp)}
                                className={`flex items-center justify-between px-4 py-2.5 text-sm
                                            cursor-pointer transition-colors
                                            ${emp.id === value
                                                ? 'bg-brand-pale text-brand font-semibold'
                                                : 'text-slate-700 hover:bg-brand-pale/60'}`}
                            >
                                <span>
                                    {emp.firstName} {emp.lastName}
                                    {emp.position && (
                                        <span className="ml-1.5 text-xs text-slate-400 font-normal">
                                            · {emp.position}
                                        </span>
                                    )}
                                </span>
                                {emp.id === value && <Check size={13} className="text-brand shrink-0" />}
                            </li>
                        ))
                    )}
                </ul>
            )}

            {/* Hidden input to trigger required validation */}
            <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />
        </div>
    )
}

/* ── Modal ─────────────────────────────────────────────────── */
const EMPTY_FORM = { receiverId: '', title: '', description: '', type: 'RECOGNITION', isAnonymous: false }

export default function CreateContinuousFeedbackModal({ isOpen, onClose, employees, onSubmit, loading }) {
    const { user } = useSelector((s) => s.auth)
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.receiverId) return
        setError('')
        try {
            await onSubmit({
                type:        form.type,
                title:       form.title,
                description: form.description,
                receiver_id: form.receiverId,
                emitter_id:  user?.employeeId ?? '',
                isAnonymous: form.isAnonymous,
            })
            setForm(EMPTY_FORM)
            onClose()
        } catch (err) {
            setError(err?.response?.data?.message ?? 'No se pudo enviar el feedback.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Nuevo feedback continuo</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Emití un reconocimiento o sugerencia</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                    {/* Tipo */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Tipo</label>
                        <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                            <option value="RECOGNITION">Reconocimiento</option>
                            <option value="SUGGESTION">Sugerencia</option>
                        </select>
                    </div>

                    {/* Destinatario — combobox */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Destinatario</label>
                        <EmployeePicker
                            employees={employees}
                            value={form.receiverId}
                            onChange={(id) => setForm((prev) => ({ ...prev, receiverId: id }))}
                        />
                    </div>

                    {/* Título */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Título</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ej: Gran trabajo en el sprint"
                            className={inputCls}
                            required
                        />
                    </div>

                    {/* Mensaje */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Mensaje</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Escribí tu feedback..."
                            className={`${inputCls} resize-none`}
                            required
                        />
                    </div>

                    {/* Anónimo */}
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isAnonymous"
                            checked={form.isAnonymous}
                            onChange={handleChange}
                        />
                        Emitir anónimamente
                    </label>

                    {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                    )}

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
                            disabled={loading || !form.receiverId}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Enviando...' : 'Enviar feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
