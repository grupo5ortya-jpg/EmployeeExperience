const inputCls = `w-full rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors`

export default function TemplateFilters({
    isLoading, filteredCount,
    filterName, setFilterName,
    filterSub, setFilterSub,
    typeNames, subTypes,
}) {
    return (
        <div className="px-5 py-3.5 border-b border-brand-light bg-brand-pale/40 flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Plantillas ({isLoading ? '…' : filteredCount})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                    value={filterName}
                    onChange={(e) => { setFilterName(e.target.value); setFilterSub('') }}
                    className={inputCls}
                >
                    <option value="">Todos los tipos</option>
                    {typeNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <select
                    value={filterSub}
                    onChange={(e) => setFilterSub(e.target.value)}
                    disabled={subTypes.length === 0}
                    className={`${inputCls} disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                >
                    <option value="">Todos los subtipos</option>
                    {subTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
    )
}
