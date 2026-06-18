import { useMemo, useState } from 'react'
import { Check, ExternalLink, Plus, Trash2, X } from 'lucide-react'

import { useCourses, useDeleteCourse, useEnrollments, useReviewCompletion } from '../../hooks/useLearning'
import CourseFormModal from './components/CourseFormModal'

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

function ReviewActions({ enrollment, onReview, isReviewing }) {
    return (
        <div className="flex items-center gap-2">
            {enrollment.certificateLink && (
                <a
                    href={enrollment.certificateLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover px-2.5 py-1.5 rounded-lg border border-brand-light hover:bg-brand-pale transition-colors"
                >
                    <ExternalLink size={12} />
                    Ver diploma
                </a>
            )}
            <button
                onClick={() => onReview(enrollment.id, 'approve')}
                disabled={isReviewing}
                title="Aprobar"
                className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Check size={14} />
            </button>
            <button
                onClick={() => onReview(enrollment.id, 'reject')}
                disabled={isReviewing}
                title="Rechazar"
                className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
            >
                <X size={14} />
            </button>
        </div>
    )
}

export default function LearningDashboard() {
    const { data: courses = [], isLoading: loadingCourses } = useCourses()
    const { data: enrollments = [], isLoading: loadingEnrollments } = useEnrollments()
    const { mutate: review, isPending: isReviewing } = useReviewCompletion()
    const { mutate: removeCourse, isPending: isDeleting } = useDeleteCourse()

    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)

    const isLoading = loadingCourses || loadingEnrollments

    const sortedEnrollments = useMemo(() => {
        const order = { PENDING_APPROVAL: 0, IN_PROGRESS: 1, COMPLETED: 2 }
        return [...enrollments].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
    }, [enrollments])

    const employeeName = (enrollment) => {
        const employee = enrollment.employee
        return employee ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() : '—'
    }

    const openCreateModal = () => {
        setEditingCourse(null)
        setIsCourseModalOpen(true)
    }

    const openEditModal = (course) => {
        setEditingCourse(course)
        setIsCourseModalOpen(true)
    }

    const handleDeleteCourse = (course) => {
        if (window.confirm(`¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`)) {
            removeCourse(course.id)
        }
    }

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Aprendizaje</h1>
                    <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                        Gestioná el catálogo de cursos y revisá las solicitudes de finalización
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo curso
                </button>
            </div>

            {/* Cursos */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cursos ({courses.length})</h3>

                {loadingCourses ? (
                    <p className="text-sm text-slate-400">Cargando cursos...</p>
                ) : courses.length === 0 ? (
                    <p className="text-sm text-slate-400">Todavía no creaste ningún curso.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="relative group bg-brand-pale/40 hover:bg-brand-pale rounded-lg transition-colors"
                            >
                                <button
                                    onClick={() => openEditModal(course)}
                                    className="w-full text-left p-3 cursor-pointer"
                                >
                                    <p className="text-sm font-semibold text-slate-800 pr-6">{course.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{course.modality} · {course.duration ?? 'Sin duración'}</p>
                                    {course.skill?.name && (
                                        <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-light text-brand-hover">
                                            {course.skill.name}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course) }}
                                    disabled={isDeleting}
                                    title="Eliminar curso"
                                    className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400
                                               hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inscripciones */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Inscripciones ({enrollments.length})
                </h3>

                {isLoading ? (
                    <p className="text-sm text-slate-400">Cargando...</p>
                ) : sortedEnrollments.length === 0 ? (
                    <p className="text-sm text-slate-400">Todavía no hay inscripciones.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-brand-light">
                                    <th className="py-2 pr-3">Empleado</th>
                                    <th className="py-2 pr-3">Curso</th>
                                    <th className="py-2 pr-3">Progreso</th>
                                    <th className="py-2 pr-3">Estado</th>
                                    <th className="py-2 pr-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEnrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="border-b border-slate-100 last:border-0">
                                        <td className="py-2.5 pr-3 text-slate-700">{employeeName(enrollment)}</td>
                                        <td className="py-2.5 pr-3 text-slate-700">
                                            {enrollment.course?.title}
                                            {enrollment.course?.isExternal && (
                                                <span className="ml-2 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-pale text-slate-600">
                                                    Externo{enrollment.course?.institution ? ` · ${enrollment.course.institution}` : ''}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 pr-3 text-slate-600">{enrollment.progress}%</td>
                                        <td className="py-2.5 pr-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[enrollment.status]}`}>
                                                {STATUS_LABEL[enrollment.status]}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            {enrollment.status === 'PENDING_APPROVAL' && (
                                                <ReviewActions
                                                    enrollment={enrollment}
                                                    isReviewing={isReviewing}
                                                    onReview={(id, decision) => review({ id, decision })}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CourseFormModal
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                course={editingCourse}
            />
        </main>
    )
}
