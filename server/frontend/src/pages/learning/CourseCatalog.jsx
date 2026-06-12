import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { BookOpen, Clock, ExternalLink, Laptop, Search } from 'lucide-react'

import { useCourses, useEnrollInCourse, useEnrollments } from '../../hooks/useLearning'

function CourseCard({ course, enrolled, onEnroll, isEnrolling }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-pale flex items-center justify-center shrink-0">
                        <BookOpen size={16} className="text-brand" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                        {course.skill?.name && (
                            <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-light text-brand-hover">
                                {course.skill.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-500 line-clamp-3">{course.description}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
                {course.duration && (
                    <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {course.duration}
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Laptop size={13} />
                    {course.modality}
                </span>
            </div>

            <div className="flex items-center justify-between mt-1">
                {course.link && (
                    <a
                        href={course.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
                    >
                        Ver curso
                        <ExternalLink size={12} />
                    </a>
                )}

                {enrolled ? (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700">
                        Inscripto
                    </span>
                ) : (
                    <button
                        onClick={onEnroll}
                        disabled={isEnrolling}
                        className="text-xs px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Inscribirme
                    </button>
                )}
            </div>
        </div>
    )
}

export default function CourseCatalog() {
    const { user } = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const { data: courses = [], isLoading, isError } = useCourses()
    const { data: enrollments = [] } = useEnrollments({ employeeId })
    const { mutateAsync: enroll, isPending } = useEnrollInCourse()

    const [search, setSearch] = useState('')

    const enrolledCourseIds = useMemo(
        () => new Set(enrollments.map((e) => e.courseId)),
        [enrollments],
    )

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return courses.filter((c) =>
            !search ||
            c.title.toLowerCase().includes(q) ||
            c.skill?.name?.toLowerCase().includes(q),
        )
    }, [courses, search])

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Course Catalog</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Explorá los cursos disponibles e inscribite para empezar a aprender
                </p>
            </div>

            {/* Buscador */}
            <div className="relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por título o skill..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-brand-light
                               text-slate-700 placeholder:text-slate-400 outline-none bg-white
                               focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                />
            </div>

            {/* Contenido */}
            {isLoading ? (
                <p className="text-sm text-slate-400">Cargando cursos...</p>
            ) : isError ? (
                <p className="text-sm text-red-400">Error al cargar el catálogo. Intentá de nuevo.</p>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <BookOpen size={24} className="text-brand" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        {courses.length === 0 ? 'Todavía no hay cursos publicados' : 'Sin resultados para tu búsqueda'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            enrolled={enrolledCourseIds.has(course.id)}
                            isEnrolling={isPending}
                            onEnroll={() => enroll({ employeeId, courseId: course.id })}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
