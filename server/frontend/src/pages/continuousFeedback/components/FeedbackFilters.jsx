const inputCls = `rounded-lg border border-brand-light px-3 py-2 text-sm`

export default function FeedbackFilters({
    mode,
    setMode,
    type,
    setType,
}) {
    return (
        <div className="flex flex-wrap gap-3">

            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={inputCls}
            >
                <option value="ALL">Todos</option>
                <option value="RECEIVED">Recibidos</option>
                <option value="SENT">Emitidos</option>
            </select>

            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputCls}
            >
                <option value="ALL">Todos los tipos</option>
                <option value="RECOGNITION">Reconocimientos</option>
                <option value="SUGGESTION">Sugerencias</option>
            </select>
        </div>
    )
}