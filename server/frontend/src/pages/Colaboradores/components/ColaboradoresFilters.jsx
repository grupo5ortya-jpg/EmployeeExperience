import { Search, X } from 'lucide-react'

function SelectFilter({ label, value, options, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs font-medium text-brand-hover border border-brand-light rounded-lg px-3 py-2 bg-brand-light
                 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light cursor-pointer
                 transition-colors duration-150"
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt === 'Todos' ? `${label}: Todos` : opt}
                </option>
            ))}
        </select>
    )
}

export default function ColaboradoresFilters({
    search, onSearch,
    depto, onDepto, deptoOptions,
    estado, onEstado, estadoOptions,
}) {
    const hasFilters = depto !== 'Todos' || estado !== 'Todos' || search !== ''

    const clearFilters = () => {
        onSearch('')
        onDepto('Todos')
        onEstado('Todos')
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-brand-light bg-brand-pale rounded-t-xl">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o posición..."
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-brand-light bg-white text-xs
                       text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand
                       focus:ring-2 focus:ring-brand-light transition-colors duration-150"
                    />
                </div>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-hover hover:text-brand transition-colors cursor-pointer"
                    >
                        <X size={13} />
                        Limpiar filtros
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-brand-light bg-brand-pale/50">
                <SelectFilter label="Departamento" value={depto} options={deptoOptions} onChange={onDepto} />
                <SelectFilter label="Estado" value={estado} options={estadoOptions} onChange={onEstado} />
            </div>
        </>
    )
}