import { useState }        from 'react'
import { useNavigate }      from 'react-router-dom'
import { useQueryClient }   from '@tanstack/react-query'
import { ArrowLeft, Lock, HelpCircle, Pencil } from 'lucide-react'

import { useDepartments }   from '../../hooks/useDepartments'
import { createSurvey }     from '../../services/surveyService'
import { countQuestions }   from './competencyConfig'
import { useFeedbackParticipants } from './hooks/useFeedbackParticipants'
import { CompetencySelector } from './components/CompetencySelector'
import { QuestionList }       from './components/QuestionList'
import { CyclePreview }       from './components/CyclePreview'

/* ─── Estilos comunes de inputs ─────────────────────────────── */
const inputCls = `w-full rounded-lg border border-brand-light px-3.5 py-2.5 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

/* ─── Página ─────────────────────────────────────────────────── */
export default function CreateFeedback() {
    const navigate    = useNavigate()
    const queryClient = useQueryClient()

    const { data: departments = [], isLoading: loadingDepts } = useDepartments()
    const { countByDept } = useFeedbackParticipants()

    /* ── Estado del formulario ───────────────────────────────── */
    const [form, setForm] = useState({
        name:                  '',
        departmentId:          '',
        startDate:             '',
        endDate:               '',
        description:           '',
        minAnonymousResponses: '',
    })
    const [selectedCompetencies, setSelectedCompetencies] = useState([])
    const [saving,        setSaving]        = useState(false)
    const [saveError,     setSaveError]     = useState('')
    const [confirmCancel, setConfirmCancel] = useState(false)

    /* ── Derivados ───────────────────────────────────────────── */
    const deptName         = departments.find((d) => d.id === form.departmentId)?.name ?? ''
    const participantCount = form.departmentId ? (countByDept[form.departmentId] ?? 0) : 0
    const totalQuestions   = countQuestions(selectedCompetencies)
    const isDirty          = !!(form.name || selectedCompetencies.length > 0)

    /* ── Handlers ────────────────────────────────────────────── */
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const toggleCompetency = (id) =>
        setSelectedCompetencies((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        )

    const handleCancel = () =>
        isDirty ? setConfirmCancel(true) : navigate('/feedbackhome')

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || !form.departmentId) return
        setSaving(true)
        setSaveError('')
        try {
            await createSurvey({
                name:                  form.name.trim(),
                departmentId:          form.departmentId         || null,
                startDate:             form.startDate            || null,
                endDate:               form.endDate              || null,
                description:           form.description.trim()   || null,
                minAnonymousResponses: form.minAnonymousResponses
                    ? Number(form.minAnonymousResponses)
                    : null,
                competencies:   selectedCompetencies,
                // campos legado — no usados en Feedback 360
                surveyTypeId:   null,
                questionTypeId: null,
            })
            await queryClient.invalidateQueries({ queryKey: ['surveys'] })
            navigate('/feedbackhome')
        } catch {
            setSaveError('No se pudo guardar el ciclo. Verificá tu conexión e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    /* ── Render ──────────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col">
            <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* ── Header ──────────────────────────────── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 text-xs font-medium text-brand
                                       hover:text-brand-hover transition-colors cursor-pointer mb-2"
                        >
                            <ArrowLeft size={13} />
                            Volver a ciclos
                        </button>
                        <div className="border-l-4 border-brand pl-4">
                            <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                                Nuevo ciclo de Feedback 360°
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Configurá el ciclo de evaluación y seleccioná las competencias a evaluar.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-sm font-medium text-slate-500 hover:text-slate-700
                                       px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !form.name.trim() || !form.departmentId}
                            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                                       px-5 py-2.5 rounded-lg transition-colors cursor-pointer
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Guardando...' : 'Crear ciclo'}
                        </button>
                    </div>
                </div>

                {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">
                        {saveError}
                    </div>
                )}

                {/* ── Layout 2/3 + 1/3 ────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Columna izquierda ────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* 1. Información general */}
                        <section className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-4">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-3 border-b border-brand-light">
                                1. Información general
                            </h2>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">
                                    Nombre del ciclo <span className="text-red-400">*</span>
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Evaluación 360° — Q2 2026"
                                    className={inputCls}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">
                                    Departamento <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="departmentId"
                                    value={form.departmentId}
                                    onChange={handleChange}
                                    className={`${inputCls} ${!form.departmentId ? 'border-red-200 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                                    disabled={loadingDepts}
                                >
                                    <option value="">
                                        {loadingDepts ? 'Cargando departamentos...' : 'Seleccioná un departamento...'}
                                    </option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">
                                        Fecha de inicio
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">
                                        Fecha de cierre
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        min={form.startDate || undefined}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">
                                    Descripción
                                    <span className="text-slate-400 font-normal ml-1">(opcional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Contexto del ciclo, objetivos o instrucciones para los evaluadores..."
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                    <Lock size={11} className="text-slate-400" />
                                    Respuestas anónimas mínimas
                                    <span className="text-slate-400 font-normal">(opcional)</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        name="minAnonymousResponses"
                                        value={form.minAnonymousResponses}
                                        onChange={handleChange}
                                        placeholder="Ej: 3"
                                        min={1}
                                        max={20}
                                        className={`${inputCls} w-28`}
                                    />
                                    <p className="text-xs text-slate-400 leading-snug">
                                        Mínimo de pares que deben responder para
                                        mostrar resultados (garantiza anonimato).
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Competencias */}
                        <CompetencySelector
                            selectedIds={selectedCompetencies}
                            onToggle={toggleCompetency}
                        />

                        {/* 3. Preguntas */}
                        <section className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-3">
                            <div className="pb-3 border-b border-brand-light flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        3. Preguntas de evaluación
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Vista previa de las preguntas que recibirán los evaluadores. Todas incluyen
                                        escala 1–5 y un campo de comentario opcional.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/questionmanagement')}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-brand
                                               hover:text-brand-hover transition-colors cursor-pointer shrink-0"
                                >
                                    <Pencil size={12} />
                                    Edición de preguntas
                                </button>
                            </div>

                            {selectedCompetencies.length === 0 ? (
                                <div className="flex flex-col items-center py-10 gap-3 text-center">
                                    <div className="w-10 h-10 rounded-full bg-brand-pale flex items-center justify-center">
                                        <HelpCircle size={18} className="text-brand/50" />
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Seleccioná al menos una competencia para ver las preguntas del ciclo.
                                    </p>
                                </div>
                            ) : (
                                <QuestionList
                                    competencyIds={selectedCompetencies}
                                    variant="create"
                                />
                            )}
                        </section>

                    </div>

                    {/* ── Columna derecha: vista previa ─────── */}
                    <CyclePreview
                        form={form}
                        selectedIds={selectedCompetencies}
                        totalQuestions={totalQuestions}
                        deptName={deptName}
                        participantCount={participantCount}
                    />

                </div>
            </form>

            {/* ── Modal de confirmación de cancelación ─── */}
            {confirmCancel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
                    onClick={() => setConfirmCancel(false)}
                >
                    <div
                        className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-sm mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-bold text-slate-800 mb-1">¿Cancelar creación?</h3>
                        <p className="text-sm text-slate-400 mb-5">
                            Se perderán los datos ingresados. ¿Querés salir igual?
                        </p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setConfirmCancel(false)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700
                                           px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
                            >
                                No, seguir editando
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/feedbackhome')}
                                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                                           px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
