import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Award, ExternalLink, GraduationCap } from 'lucide-react'

import { useEnrollments, useRequestCompletion, useUpdateProgress } from '../../hooks/useLearning'
import LearningCertifications from './components/LearningCertifications'
import ExternalCertificationModal from './components/ExternalCertificationModal'

const STATUS_LABEL = {
    IN_PROGRESS: 'En progreso',
    PENDING_APPROVAL: 'Pendiente de aprobación',
    COMPLETED: 'Completado',
    REJECTED: 'Rechazada',
}

const STATUS_STYLE = {
    IN_PROGRESS: 'bg-brand-light text-brand-hover',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
}

const PROGRESS_STEPS = [0, 25, 50, 75, 100]

function EnrollmentRow({ enrollment, onProgressChange, onRequestCompletion, isUpdating, isRequesting }) {
    const [diplomaUrl, setDiplomaUrl] = useState('')
    const canUploadDiploma = enrollment.status === 'IN_PROGRESS' && enrollment.progress === 100
    const canSubmitDiploma = diplomaUrl.trim().length > 0

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-slate-800">{enrollment.course?.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {enrollment.course?.skill?.name && (
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-light text-brand-hover">
                                {enrollment.course.skill.name}
                            </span>
                        )}
                        {enrollment.course?.institution && (
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-pale text-slate-600">
                                {enrollment.course.institution}
                            </span>
                        )}
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[enrollment.status]}`}>
                    {STATUS_LABEL[enrollment.status]}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                    />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-10 text-right">{enrollment.progress}%</span>
            </div>

            <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                    Progreso:
                    <select
                        value={enrollment.progress}
                        disabled={enrollment.status !== 'IN_PROGRESS' || enrollment.progress === 100 || isUpdating}
                        onChange={(e) => onProgressChange(Number(e.target.value))}
                        className="text-xs px-2 py-1 rounded border border-brand-light outline-none bg-white disabled:opacity-50"
                    >
                        {PROGRESS_STEPS.map((step) => (
                            <option key={step} value={step}>{step}%</option>
                        ))}
                    </select>
                </label>
            </div>

            {canUploadDiploma && (
                <div className="flex flex-col gap-2 pt-2 border-t border-brand-light">
                    <label className="text-xs font-medium text-slate-500">
                        Subir diploma (URL de la imagen)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            value={diplomaUrl}
                            onChange={(e) => setDiplomaUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 text-xs px-2 py-1.5 rounded border border-brand-light outline-none bg-white"
                        />
                        <button
                            onClick={() => onRequestCompletion(diplomaUrl.trim())}
                            disabled={!canSubmitDiploma || isRequesting}
                            className="text-xs px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                            Enviar a revisión
                        </button>
                    </div>
                </div>
            )}

            {enrollment.status === 'PENDING_APPROVAL' && enrollment.certificateLink && (
                <a
                    href={enrollment.certificateLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-hover font-medium pt-2 border-t border-brand-light"
                >
                    <ExternalLink size={12} />
                    Ver diploma enviado
                </a>
            )}
        </div>
    )
}

export default function MyLearning() {
    const { user } = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const [isExternalModalOpen, setIsExternalModalOpen] = useState(false)

    const { data: enrollments = [], isLoading, isError } = useEnrollments({ employeeId })
    const { mutate: updateProgress, isPending: isUpdating } = useUpdateProgress()
    const { mutate: requestCompletion, isPending: isRequesting } = useRequestCompletion()

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Mi aprendizaje</h1>
                    <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                        Seguí tu progreso en los cursos en los que estás inscripto
                    </p>
                </div>
                <button
                    onClick={() => setIsExternalModalOpen(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Award size={16} />
                    Subir certificación externa
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-slate-400">Cargando...</p>
            ) : isError ? (
                <p className="text-sm text-red-400">Error al cargar tus cursos. Intentá de nuevo.</p>
            ) : enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <GraduationCap size={24} className="text-brand" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Todavía no estás inscripto en ningún curso</p>
                    <p className="text-xs text-slate-400">Visitá Cursos disponibles para empezar a aprender.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrollments.map((enrollment) => (
                        <EnrollmentRow
                            key={enrollment.id}
                            enrollment={enrollment}
                            isUpdating={isUpdating}
                            isRequesting={isRequesting}
                            onProgressChange={(progress) => updateProgress({ id: enrollment.id, progress })}
                            onRequestCompletion={(certificateLink) => requestCompletion({ id: enrollment.id, certificateLink })}
                        />
                    ))}
                </div>
            )}

            <LearningCertifications employeeId={employeeId} />

            <ExternalCertificationModal
                isOpen={isExternalModalOpen}
                onClose={() => setIsExternalModalOpen(false)}
                employeeId={employeeId}
            />
        </main>
    )
}
