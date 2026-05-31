import {
    getSkillLevelLabel,
    getSkillLevelStyle,
} from '../helpers/skillLevel'

const STATUS_LABEL = {
    open: 'Abierta',
    closed: 'Cerrada',
}

const STATUS_STYLE = {
    open: 'bg-green-100 text-green-600',
    closed: 'bg-red-100 text-red-600',
}

export default function JobOpeningRow({ job, striped, onSelect }) {
    const avg =
        job.skills?.length
            ? Math.round(
                job.skills.reduce(
                    (a, s) => a + (s.JobOpeningSkill?.requiredLevel || 0),
                    0
                ) / job.skills.length
            )
            : null

    return (
        <tr
            onClick={() => onSelect(job)}
            className={`cursor-pointer border-b border-brand-light hover:bg-brand-light/70
        ${striped ? 'bg-brand-pale' : 'bg-white'}`}
        >

            <td className="px-4 py-3">
                <p className="font-semibold text-slate-700">
                    {job.title}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-xs">
                    {job.description}
                </p>
            </td>

            <td className="hidden md:table-cell px-4 py-3">
                {job.department?.name ?? '—'}
            </td>

            <td className="hidden lg:table-cell px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {job.skills?.slice(0, 3).map(s => (
                        <span
                            key={s.id}
                            className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700"
                        >
                            {s.name}
                        </span>
                    ))}
                </div>
            </td>

            <td className="hidden lg:table-cell px-4 py-3">
                {avg && (
                    <span
                        className={`text-xs px-2 py-1 rounded-full ${getSkillLevelStyle(avg)}`}
                    >
                        {getSkillLevelLabel(avg)}
                    </span>
                )}
            </td>

            <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[job.status]
                    }`}>
                    {STATUS_LABEL[job.status]}
                </span>
            </td>

            <td className="px-4 py-3 text-slate-300">›</td>

        </tr>
    )
}