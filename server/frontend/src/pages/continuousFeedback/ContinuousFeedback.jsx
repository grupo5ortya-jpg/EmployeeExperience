
import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'

import { useEmployees } from '../../hooks/useEmployees'
import { useContinuousFeedback } from './hooks/useContinuousFeedback'
import { useCreateContinuousFeedback } from './hooks/useCreateContinuousFeedback'

import FeedbackTable from './components/FeedbackTable'
import FeedbackFilters from './components/FeedbackFilters'
import CreateContinuousFeedbackModal from './components/CreateContinuousFeedbackModal'

export default function ContinuousFeedback() {

    const { data: feedbacks = [], isLoading } = useContinuousFeedback()
    const { data: employees = [] } = useEmployees()

    const {
        mutateAsync: createFeedback,
        isPending: creatingFeedback,
    } = useCreateContinuousFeedback()

    const [mode, setMode] = useState('ALL')
    const [type, setType] = useState('ALL')

    const [openModal, setOpenModal] = useState(false)

    // TODO:
    // reemplazar cuando exista autenticación real
    const currentEmployeeId = 'HARDCODED-EMPLOYEE-ID'

    /* ───────────────────────────────────────────── */
    /* Filters                                       */
    /* ───────────────────────────────────────────── */

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter((f) => {

            const matchesType =
                type === 'ALL'
                    ? true
                    : f.type === type

            const matchesMode =
                mode === 'ALL'
                    ? true
                    : mode === 'SENT'
                        ? f.emitter_id === currentEmployeeId
                        : f.receiver_id === currentEmployeeId

            return matchesType && matchesMode
        })
    }, [feedbacks, type, mode])

    /* ───────────────────────────────────────────── */
    /* Create feedback                               */
    /* ───────────────────────────────────────────── */

    const handleCreate = async (payload) => {
        await createFeedback(payload)
    }

    /* ───────────────────────────────────────────── */
    /* Render                                        */
    /* ───────────────────────────────────────────── */

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

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover
                               text-white text-sm font-semibold px-4 py-2.5
                               rounded-lg transition-colors cursor-pointer"
                >
                    <Plus size={16} />

                    Nuevo feedback
                </button>
            </div>

            {/* Filters */}
            <FeedbackFilters
                mode={mode}
                setMode={setMode}
                type={type}
                setType={setType}
            />

            {/* Loading */}
            {isLoading ? (
                <div className="bg-white rounded-xl border border-brand-light shadow-sm p-8">
                    <p className="text-sm text-slate-400">
                        Cargando feedback...
                    </p>
                </div>
            ) : (
                <FeedbackTable feedbacks={filteredFeedbacks} />
            )}

            {/* Modal */}
            <CreateContinuousFeedbackModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                employees={employees}
                onSubmit={handleCreate}
                loading={creatingFeedback}
            />
        </main>
    )
}

