import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Clock, ChevronRight } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { updateTask } from '../../services/taskService'

const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

export default function OnboardingHome() {
    const navigate    = useNavigate()
    const queryClient = useQueryClient()
    const { data: tasks = [], isLoading, isError } = useTasks()

    const [selected,  setSelected]  = useState(null)
    const [form,      setForm]      = useState({ name: '', estimatedDuration: '' })
    const [saving,    setSaving]    = useState(false)
    const [saveError, setSaveError] = useState('')

    const handleSelect = (task) => {
        setSelected(task)
        setForm({ name: task.name ?? '', estimatedDuration: task.estimatedDuration ?? '' })
        setSaveError('')
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError('')
        try {
            await updateTask(selected.id, {
                name:              form.name,
                estimatedDuration: form.estimatedDuration !== '' ? Number(form.estimatedDuration) : null,
            })
            await queryClient.invalidateQueries({ queryKey: ['tasks'] })
            setSelected(null)
        } catch {
            setSaveError('No se pudo guardar. Intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Templates de onboarding</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Gestioná los templates de tareas.</p>
                </div>
                <button
                    onClick={() => navigate('/createtemplatepage')}
                    className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo template
                </button>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* Left — task list, half width */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Plantillas ({isLoading ? '…' : tasks.length})
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="divide-y divide-brand-light">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="px-5 py-4 animate-pulse flex justify-between">
                                    <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3.5 bg-slate-200 rounded w-1/5" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <p className="px-5 py-10 text-center text-sm text-red-400">Error al cargar las plantillas.</p>
                    ) : tasks.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-400">No hay plantillas todavía.</p>
                    ) : (
                        <ul className="divide-y divide-brand-light">
                            {tasks.map((task) => (
                                <li
                                    key={task.id}
                                    onClick={() => handleSelect(task)}
                                    className={`px-5 py-4 flex items-center justify-between gap-3 cursor-pointer transition-colors
                                        hover:bg-brand-pale/60
                                        ${selected?.id === task.id ? 'bg-brand-pale border-l-4 border-brand' : ''}`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{task.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Clock size={11} />
                                            {task.estimatedDuration != null
                                                ? `${task.estimatedDuration} días`
                                                : 'Sin duración estimada'}
                                        </p>
                                    </div>
                                    <ChevronRight size={15} className="text-slate-300 shrink-0" />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Right — edit panel */}
                <div className="bg-white rounded-xl border border-brand-light shadow-sm">
                    {!selected ? (
                        <div className="flex items-center justify-center px-6 py-24 text-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Seleccioná una plantilla</p>
                                <p className="text-xs text-slate-400 mt-1">Hacé clic en una fila para editar sus campos.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-brand-light">

                            {/* Edit form */}
                            <form onSubmit={handleSave} className="flex flex-col gap-5 p-6">

                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-bold text-slate-800">Editar plantilla</h2>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/onboarding-template/${selected.id}`)}
                                        className="text-xs text-brand hover:text-brand-hover font-medium transition-colors cursor-pointer"
                                    >
                                        Ver asignaciones →
                                    </button>
                                </div>

                                {selected.taskType && (
                                    <div className="text-xs text-slate-400 bg-brand-pale/50 rounded-lg px-3 py-2">
                                        Tipo: <span className="font-medium text-slate-600">{selected.taskType.name}</span>
                                        {selected.taskType.sub_type && ` · ${selected.taskType.sub_type}`}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-slate-500">
                                        Nombre <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={inputCls}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-slate-500">Duración estimada (días)</label>
                                    <input
                                        type="number"
                                        name="estimatedDuration"
                                        value={form.estimatedDuration}
                                        onChange={handleChange}
                                        min={0}
                                        className={inputCls}
                                        placeholder="Ej. 7"
                                    />
                                </div>

                                {saveError && (
                                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                                        {saveError}
                                    </p>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-light">
                                    <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5
                                                   rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                                   px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                                   disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>

                            {/* Sibling tasks del mismo taskType */}
                            {selected.taskType && (() => {
                                const siblings = tasks.filter(
                                    (t) => t.taskType?.id === selected.taskType.id
                                )
                                return (
                                    <div className="p-6 flex flex-col gap-3">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Tareas del template "{selected.taskType.sub_type ?? selected.taskType.name}" ({siblings.length})
                                        </p>
                                        <ul className="flex flex-col gap-1.5">
                                            {siblings.map((t) => (
                                                <li
                                                    key={t.id}
                                                    onClick={() => handleSelect(t)}
                                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
                                                        cursor-pointer transition-colors hover:bg-brand-pale/60
                                                        ${t.id === selected.id ? 'bg-brand-pale ring-1 ring-brand/30' : 'bg-slate-50'}`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${t.id === selected.id ? 'text-brand' : 'text-slate-700'}`}>
                                                            {t.name}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {t.estimatedDuration != null ? `${t.estimatedDuration}d` : '—'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })()}

                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}
