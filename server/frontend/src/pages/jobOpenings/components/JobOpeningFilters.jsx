import { Search, X } from 'lucide-react'

function Select({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs border border-brand-light rounded-lg px-3 py-2 bg-brand-light text-brand-hover"
        >
            {options.map(opt => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    )
}

export default function JobOpeningFilters({
    search,
    setSearch,
    department,
    setDepartment,
    departmentOptions,
    status,
    setStatus,
    skill,
    setSkill,
    skills,
}) {
    const hasFilters =
        search !== '' ||
        department !== 'Todos' ||
        status !== 'Todos' ||
        skill !== 'Todos'

    return (
        <>
            <div className="flex items-center gap-3 p-4 border-b border-brand-light bg-brand-pale">

                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar vacante..."
                        className="w-full pl-8 pr-3 py-2 text-sm border border-brand-light rounded-lg"
                    />
                </div>

                {hasFilters && (
                    <button
                        onClick={() => {
                            setSearch('')
                            setDepartment('Todos')
                            setStatus('Todos')
                            setSkill('Todos')
                        }}
                        className="text-xs text-brand-hover flex items-center gap-1"
                    >
                        <X size={12} />
                        Limpiar
                    </button>
                )}
            </div>

            <div className="flex gap-2 flex-wrap px-4 py-3 border-b border-brand-light bg-brand-pale/50">

                <Select
                    value={department}
                    onChange={setDepartment}
                    options={departmentOptions}
                />

                <Select
                    value={status}
                    onChange={setStatus}
                    options={['Todos', 'open', 'closed']}
                />

                <Select
                    value={skill}
                    onChange={setSkill}
                    options={[
                        'Todos',
                        ...skills.map(s => s.name),
                    ]}
                />

            </div>
        </>
    )
}