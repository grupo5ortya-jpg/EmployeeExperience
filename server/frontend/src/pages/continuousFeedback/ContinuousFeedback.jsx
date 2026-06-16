import { useState, useEffect } from 'react'
import { useSelector }         from 'react-redux'
import { useSearchParams }     from 'react-router-dom'
import {
    Plus, HeartHandshake, MessageSquareWarning,
    MessageSquareDashed, User2,
} from 'lucide-react'

import { useReceivedFeedbacks, useSentFeedbacks } from './hooks/useContinuousFeedback'
import { useCreateContinuousFeedback }            from './hooks/useCreateContinuousFeedback'
import CreateContinuousFeedbackModal              from './components/CreateContinuousFeedbackModal'
import { useEmployees }                           from '../../hooks/useEmployees'

/* ── helpers ──────────────────────────────────────────────── */
function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

/* ── card ─────────────────────────────────────────────────── */
function FeedbackCard({ item, tab }) {
    const isRecognition = item.type === 'RECOGNITION'

    const personLabel = tab === 'received'
        ? (item.emitter ? `${item.emitter.firstName} ${item.emitter.lastName}` : 'Anónimo')
        : (item.receiver ? `${item.receiver.firstName} ${item.receiver.lastName}` : '—')

    const personRole = tab === 'received' ? 'De' : 'Para'

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3
            ${isRecognition
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'}`}>

            {/* Type badge */}
            <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide
                    ${isRecognition ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isRecognition
                        ? <HeartHandshake size={13} className="shrink-0" />
                        : <MessageSquareWarning size={13} className="shrink-0" />}
                    {isRecognition ? 'Reconocimiento' : 'Sugerencia'}
                </div>
                <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
            </div>

            {/* Title */}
            {item.title && (
                <p className={`text-sm font-semibold leading-snug
                    ${isRecognition ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {item.title}
                </p>
            )}

            {/* Message */}
            <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
            </p>

            {/* Person */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-black/5">
                <User2 size={11} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500">
                    <span className="font-medium">{personRole}:</span> {personLabel}
                </span>
            </div>
        </div>
    )
}

/* ── section by type ──────────────────────────────────────── */
function TypeSection({ label, Icon, items, tab, emptyText }) {
    if (items.length === 0) return (
        <div className="flex items-center gap-2 py-4 text-slate-400">
            <MessageSquareDashed size={14} />
            <span className="text-xs">{emptyText}</span>
        </div>
    )
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
                <Icon size={13} className="text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-xs text-slate-400">({items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                    <FeedbackCard key={item.id} item={item} tab={tab} />
                ))}
            </div>
        </div>
    )
}

/* ── page ─────────────────────────────────────────────────── */
export default function ContinuousFeedback() {
    const { user }       = useSelector((s) => s.auth)
    const employeeId     = user?.employeeId
    const canSend        = user?.role === 'Colaborador'
    const [searchParams] = useSearchParams()

    const [tab,       setTab]       = useState('received')
    const [openModal, setOpenModal] = useState(false)

    // Auto-open modal when ?new=1 (from sidebar sub-item)
    useEffect(() => {
        if (searchParams.get('new') === '1') setOpenModal(true)
    }, [searchParams])

    const { data: received = [], isLoading: loadingR } = useReceivedFeedbacks(employeeId)
    const { data: sent     = [], isLoading: loadingS } = useSentFeedbacks(employeeId)
    const { data: employees = [] }                     = useEmployees()
    const { mutateAsync: createFeedback, isPending }   = useCreateContinuousFeedback()

    const items   = tab === 'received' ? received : sent
    const loading = tab === 'received' ? loadingR : loadingS

    const recognitions = items.filter((f) => f.type === 'RECOGNITION')
    const suggestions  = items.filter((f) => f.type === 'SUGGESTION')

    const TABS = [
        { key: 'received', label: 'Recibidos' },
        { key: 'sent',     label: 'Enviados'  },
    ]

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">
                        Feedback continuo
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Reconocimientos y sugerencias entre colaboradores
                    </p>
                </div>
                {canSend && (
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover
                               text-white text-sm font-semibold px-4 py-2.5
                               rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={15} />
                    Enviar feedback
                </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors
                            ${tab === t.key
                                ? 'bg-brand text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-brand-light hover:text-brand'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Content */}
            {!loading && (
                <div className="flex flex-col gap-6">
                    <TypeSection
                        label="Reconocimientos"
                        Icon={HeartHandshake}
                        items={recognitions}
                        tab={tab}
                        emptyText={tab === 'received'
                            ? 'Todavía no recibiste reconocimientos.'
                            : 'Todavía no enviaste reconocimientos.'}
                    />
                    <TypeSection
                        label="Sugerencias"
                        Icon={MessageSquareWarning}
                        items={suggestions}
                        tab={tab}
                        emptyText={tab === 'received'
                            ? 'Todavía no recibiste sugerencias.'
                            : 'Todavía no enviaste sugerencias.'}
                    />
                </div>
            )}

            {/* Modal */}
            <CreateContinuousFeedbackModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                employees={employees.filter((e) => e.id !== employeeId && e.role?.name !== 'Talento')}
                onSubmit={async (payload) => { await createFeedback(payload) }}
                loading={isPending}
            />
        </main>
    )
}
