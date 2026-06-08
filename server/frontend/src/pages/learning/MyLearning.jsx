import { useSelector } from 'react-redux'
import { GraduationCap } from 'lucide-react'

import { useEnrollments, useRequestCompletion, useUpdateProgress } from '../../hooks/useLearning'
import LearningCertifications from './components/LearningCertifications'

const STATUS_LABEL = {
    IN_PROGRESS: 'En progreso',
    PENDING_APPROVAL: 'Pendiente de aprobación',
    COMPLETED: 'Completado',
}

const STATUS_STYLE = {
    IN_PROGRESS: 'bg-brand-light text-brand-hover',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
}

const PROGRESS_STEPS = [0, 25, 50, 75, 100]

function EnrollmentRow({ enrollment, onProgressChange, onRequestCompletion, isUpdating, isRequesting }) {
    const canRequestCompletion = enrollment.status === 'IN_PROGRESS' && enrollment.progress === 100

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-slate-800">{enrollment.course?.title}</p>
                    {enrollment.course?.skill?.name && (
                        <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-light text-brand-hover">
                            {enrollment.course.skill.name}
                        </span>
                    )}
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
                        disabled={enrollment.status !== 'IN_PROGRESS' || isUpdating}
                        onChange={(e) => onProgressChange(Number(e.target.value))}
                        className="text-xs px-2 py-1 rounded border border-brand-light outline-none bg-white disabled:opacity-50"
                    >
                        {PROGRESS_STEPS.map((step) => (
                            <option key={step} value={step}>{step}%</option>
                        ))}
                    </select>
                </label>

                {canRequestCompletion && (
                    <button
                        onClick={onRequestCompletion}
                        disabled={isRequesting}
                        className="text-xs px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Request Completion
                    </button>
                )}
            </div>
        </div>
    )
}

export default function MyLearning() {
    const { user } = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const { data: enrollments = [], isLoading, isError } = useEnrollments({ employeeId })
    const { mutate: updateProgress, isPending: isUpdating } = useUpdateProgress()
    const { mutate: requestCompletion, isPending: isRequesting } = useRequestCompletion()

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Mi aprendizaje</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Seguí tu progreso en los cursos en los que estás inscripto
                </p>
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
                            onRequestCompletion={() => requestCompletion(enrollment.id)}
                        />
                    ))}
                </div>
            )}

            <LearningCertifications employeeId={employeeId} />
        </main>
    )
}
