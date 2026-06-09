import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import {
    useQuestions,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
    useCreateQuestionOption,
} from '../../hooks/useQuestions'
import { useQuestionTypes } from '../../hooks/useQuestionTypes'
import { COMPETENCIES } from '../feedback/competencyConfig'

const PULSE_PERIODS = [
    { id: '30', label: 'Pulso — Día 30' },
    { id: '60', label: 'Pulso — Día 60' },
    { id: '90', label: 'Pulso — Día 90' },
]

const DEFAULT_OPTIONS = [
    { label: 'Muy bajo', value: 1, order: 1 },
    { label: 'Bajo',     value: 2, order: 2 },
    { label: 'Regular',  value: 3, order: 3 },
    { label: 'Alto',     value: 4, order: 4 },
    { label: 'Muy alto', value: 5, order: 5 },
]

const inputCls = `w-full rounded-lg border border-brand px-2.5 py-1.5 text-sm text-slate-700
    outline-none focus:ring-2 focus:ring-brand/20 transition-colors`

/* ── Single question row with inline edit ─────────────────── */
function QuestionRow({ question, onEdit, onDelete, isDeleting }) {
    const [editing, setEditing] = useState(false)
    const [text, setText] = useState(question.text)

    const handleSave = () => {
        if (!text.trim() || text === question.text) { setEditing(false); return }
        onEdit(question.id, text.trim())
        setEditing(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') { setEditing(false); setText(question.text) }
    }

    return (
        <div className="flex items-start gap-2 py-2.5 border-b border-brand-light last:border-0">
            <span className={`mt-0.5 shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded
                ${question.type === 'Cerrada' ? 'bg-brand-light text-brand-hover' : 'bg-slate-100 text-slate-500'}`}>
                {question.type}
            </span>

            {editing ? (
                <div className="flex-1 flex items-center gap-2">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className={inputCls}
                    />
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 cursor-pointer shrink-0"
                        title="Guardar"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={() => { setEditing(false); setText(question.text) }}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                        title="Cancelar"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <p className="flex-1 text-sm text-slate-700 leading-snug">{question.text}</p>
            )}

            {!editing && (
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setEditing(true)}
                        className="p-1 rounded hover:bg-brand-pale text-slate-300 hover:text-brand cursor-pointer"
                        title="Editar"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        disabled={isDeleting}
                        className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 cursor-pointer disabled:opacity-50"
                        title="Eliminar"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    )
}

/* ── Inline add-question form ─────────────────────────────── */
function AddQuestionForm({ questionTypeId, onAdd, onCancel, saving }) {
    const [text, setText] = useState('')
    const [type, setType] = useState('Cerrada')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!text.trim()) return
        onAdd({ questionTypeId, text: text.trim(), type })
        setText('')
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 pt-3 border-t border-brand-light mt-1">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Texto de la pregunta..."
                autoFocus
                className={`${inputCls} flex-1 min-w-48`}
            />
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-brand-light px-2.5 py-1.5 text-xs text-slate-600 outline-none
                           focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
                <option value="Cerrada">Cerrada (1-5)</option>
                <option value="Abierta">Abierta</option>
            </select>
            <button
                type="submit"
                disabled={!text.trim() || saving}
                className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold
                           transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? 'Guardando...' : 'Agregar'}
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
                <X size={16} />
            </button>
        </form>
    )
}

/* ── Collapsible question group ───────────────────────────── */
function QuestionGroup({ title, description, questions, questionTypeId, onEdit, onDelete, onAdd, isDeleting, isSaving }) {
    const [expanded, setExpanded] = useState(true)
    const [adding,   setAdding]   = useState(false)

    const handleAdd = (data) => {
        onAdd(data)
        setAdding(false)
    }

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded((v) => !v)}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-brand-pale/40 hover:bg-brand-pale transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    {expanded
                        ? <ChevronDown  size={14} className="text-slate-400 shrink-0" />
                        : <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    }
                    <div className="text-left min-w-0">
                        <span className="text-sm font-semibold text-slate-700">{title}</span>
                        {description && (
                            <span className="text-xs text-slate-400 ml-2 hidden sm:inline">{description}</span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-brand-light shrink-0">
                        {questions.length}
                    </span>
                </div>

                {questionTypeId && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setExpanded(true); setAdding(true) }}
                        className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover
                                   transition-colors cursor-pointer shrink-0 ml-3"
                    >
                        <Plus size={13} />
                        Agregar
                    </button>
                )}
            </div>

            {expanded && (
                <div className="px-4 pb-3">
                    {questions.length === 0 && !adding && (
                        <p className="text-xs text-slate-400 py-3">Sin preguntas todavía.</p>
                    )}

                    {questions.map((q) => (
                        <QuestionRow
                            key={q.id}
                            question={q}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDeleting={isDeleting}
                        />
                    ))}

                    {adding && (
                        <AddQuestionForm
                            questionTypeId={questionTypeId}
                            onAdd={handleAdd}
                            onCancel={() => setAdding(false)}
                            saving={isSaving}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

/* ── Página principal ─────────────────────────────────────── */
export default function QuestionManagement() {
    const [tab, setTab] = useState('feedback360')

    const { data: questions    = [], isLoading } = useQuestions()
    const { data: questionTypes = [] }           = useQuestionTypes()

    const { mutateAsync: createQ,    isPending: isCreating } = useCreateQuestion()
    const { mutateAsync: updateQ }                           = useUpdateQuestion()
    const { mutate:      deleteQ,    isPending: isDeleting } = useDeleteQuestion()
    const { mutateAsync: createOpt }                         = useCreateQuestionOption()

    // Find QuestionType id by name + subType
    const findQtId = (name, subType) =>
        questionTypes.find((t) => t.name === name && t.subType === subType)?.id ?? null

    const handleAdd = async ({ questionTypeId, text, type }) => {
        const q = await createQ({ text, type, questionTypeId })
        if (type === 'Cerrada' && q?.id) {
            await Promise.all(DEFAULT_OPTIONS.map((opt) => createOpt({ questionId: q.id, ...opt })))
        }
    }

    const handleEdit   = (id, text) => updateQ({ id, data: { text } })

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar esta pregunta? Esta acción no se puede deshacer.')) deleteQ(id)
    }

    const f360Groups = useMemo(() =>
        COMPETENCIES.map((comp) => ({
            id:             comp.id,
            title:          comp.label,
            description:    comp.description,
            questions:      questions.filter(
                (q) => q.questionType?.name === 'Feedback360' && q.questionType?.sub_type === comp.id,
            ),
            questionTypeId: findQtId('Feedback360', comp.id),
        }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [questions, questionTypes])

    const pulseGroups = useMemo(() =>
        PULSE_PERIODS.map((p) => ({
            id:             p.id,
            title:          p.label,
            description:    null,
            questions:      questions.filter(
                (q) => q.questionType?.name === 'Pulso' && q.questionType?.sub_type === p.id,
            ),
            questionTypeId: findQtId('Pulso', p.id),
        }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [questions, questionTypes])

    const activeGroups = tab === 'feedback360' ? f360Groups : pulseGroups

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Gestión de preguntas</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Editá las preguntas de Feedback 360° y Pulso. Las preguntas cerradas
                    auto-generan opciones 1-5 al crearse.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-brand-light border border-brand/20 p-1 rounded-xl w-fit">
                {[
                    { id: 'feedback360', label: 'Feedback 360°' },
                    { id: 'pulse',       label: 'Pulso 30-60-90' },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                            ${tab === t.id
                                ? 'bg-white text-navy shadow-sm border border-brand-light'
                                : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400">Cargando preguntas...</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {activeGroups.map((group) => (
                        <QuestionGroup
                            key={group.id}
                            title={group.title}
                            description={group.description}
                            questions={group.questions}
                            questionTypeId={group.questionTypeId}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAdd={handleAdd}
                            isDeleting={isDeleting}
                            isSaving={isCreating}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
