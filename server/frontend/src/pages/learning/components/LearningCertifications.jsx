import { Award, BookOpenCheck, ExternalLink } from 'lucide-react'

import { useEnrollments } from '../../../hooks/useLearning'

export default function LearningCertifications({ employeeId }) {
    const { data: completed = [], isLoading } = useEnrollments({ employeeId, status: 'COMPLETED' })

    if (isLoading) return null
    if (completed.length === 0) return null

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Learning &amp; Certifications
            </h3>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <BookOpenCheck size={14} className="text-brand" />
                    Cursos completados
                </p>
                <ul className="flex flex-col gap-1">
                    {completed.map((e) => (
                        <li key={e.id} className="text-sm text-slate-700 pl-5">
                            {e.course?.title}
                        </li>
                    ))}
                </ul>
            </div>

            {completed.some((e) => e.certificateLink) && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Award size={14} className="text-brand" />
                        Certificaciones
                    </p>
                    <ul className="flex flex-col gap-1">
                        {completed
                            .filter((e) => e.certificateLink)
                            .map((e) => (
                                <li key={e.id} className="pl-5">
                                    <a
                                        href={e.certificateLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-brand hover:text-brand-hover font-medium inline-flex items-center gap-1"
                                    >
                                        {e.course?.title}
                                        <ExternalLink size={12} />
                                    </a>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
