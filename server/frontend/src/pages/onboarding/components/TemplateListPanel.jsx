import TemplateFilters from './TemplateFilters'
import TemplateListItem from './TemplateListItem'

// TaskTypes usadas internamente por el sistema (Onboarding, Offboarding, Learning) —
// siempre protegidas, no se pueden desproteger desde la UI.
const SYSTEM_TASK_TYPES = [
    { name: 'Onboarding estándar', sub_type: 'Checklist' },
    { name: 'Offboarding estándad', sub_type: 'Checklist' },
]
const isSystemTemplate = (type) =>
    SYSTEM_TASK_TYPES.some((s) => s.name === type.name && s.sub_type === type.sub_type)

export default function TemplateListPanel({
    taskTypes, filteredTypes, isLoading, isError,
    filterName, setFilterName, filterSub, setFilterSub, typeNames, subTypes,
    selectedType, onSelectType, togglingId, onToggleProtected, onRequestDelete,
}) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">

            <TemplateFilters
                isLoading={isLoading}
                filteredCount={filteredTypes.length}
                filterName={filterName}
                setFilterName={setFilterName}
                filterSub={filterSub}
                setFilterSub={setFilterSub}
                typeNames={typeNames}
                subTypes={subTypes}
            />

            {isLoading ? (
                <div className="divide-y divide-brand-light">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-5 py-4 animate-pulse flex justify-between">
                            <div className="space-y-1.5 flex-1">
                                <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                            </div>
                            <div className="h-5 w-8 bg-slate-200 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <p className="px-5 py-10 text-center text-sm text-red-400">Error al cargar las plantillas.</p>
            ) : filteredTypes.length === 0 ? (
                <div className="px-5 py-10 text-center">
                    <p className="text-sm text-slate-500">
                        {taskTypes.length === 0
                            ? 'No hay plantillas todavía.'
                            : 'No hay plantillas para esos filtros.'}
                    </p>
                    {(filterName || filterSub) && (
                        <button
                            onClick={() => { setFilterName(''); setFilterSub('') }}
                            className="mt-3 text-xs font-medium text-brand hover:text-brand-hover transition-colors cursor-pointer"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <ul className="divide-y divide-brand-light">
                    {filteredTypes.map((type) => (
                        <TemplateListItem
                            key={type.id}
                            type={type}
                            isSelected={selectedType?.id === type.id}
                            onSelect={onSelectType}
                            isSystem={isSystemTemplate(type)}
                            isToggling={togglingId === type.id}
                            onToggleProtected={onToggleProtected}
                            onRequestDelete={onRequestDelete}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}
