import { useState, useMemo } from 'react'
import { BarChart2, Search, X } from 'lucide-react'
import { usePulseAnalyses } from '../../hooks/usePulseAnalyses'
import PulseAnalysisCard from './components/PulseAnalysisCard'
import EmployeeAnswersCard from './components/EmployeeAnswersCard'

const RISK_FILTERS = [
  { label: 'Todos',    value: null },
  { label: 'Bueno',    value: 'GOOD' },
  { label: 'Medio',    value: 'MEDIUM' },
  { label: 'Negativo', value: 'NEGATIVE' },
]

const RISK_CARD_STYLE = {
  GOOD:     'bg-emerald-50 border-emerald-200',
  MEDIUM:   'bg-amber-50   border-amber-200',
  NEGATIVE: 'bg-red-50     border-red-200',
}

const inputClass = `text-xs text-slate-700 bg-white border border-brand-light rounded-lg
  px-3 py-1.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
  transition-colors cursor-pointer`

export default function PulseAnalysis() {
  const [riskFilter, setRiskFilter] = useState(null)
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [search,     setSearch]     = useState('')

  const { data: analyses = [], isLoading, isError } = usePulseAnalyses()

  const visible = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59') : null
    const q    = search.trim().toLowerCase()

    return analyses.filter((a) => {
      if (riskFilter && a.overallRisk !== riskFilter) return false
      const created = new Date(a.createdAt)
      if (from && created < from) return false
      if (to   && created > to)   return false
      if (q) {
        const fullName = `${a.employee?.firstName ?? ''} ${a.employee?.lastName ?? ''}`.toLowerCase()
        if (!fullName.includes(q)) return false
      }
      return true
    })
  }, [analyses, riskFilter, dateFrom, dateTo, search])

  const hasDateFilter = dateFrom || dateTo

  function clearDates() {
    setDateFrom('')
    setDateTo('')
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">Análisis de Pulso — IA</h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
          Evaluación de riesgo de onboarding basada en respuestas de encuestas de pulso
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5">

        {/* Risk tabs */}
        <div className="flex flex-wrap gap-1.5">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setRiskFilter(f.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
                ${riskFilter === f.value
                  ? 'bg-brand text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-brand-light hover:text-brand'}`}
            >
              {f.label}
              {f.value === null && analyses.length > 0 && (
                <span className="ml-1.5 opacity-60">{analyses.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Employee search */}
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empleado..."
            className="w-full pl-8 pr-8 py-1.5 text-xs text-slate-700 bg-white border border-brand-light
                       rounded-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
                       transition-colors placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Período:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
          />
          {hasDateFilter && (
            <button
              onClick={clearDates}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>

      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-sm text-red-400 text-center py-10">
          No se pudieron cargar los análisis. Intentá de nuevo.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && visible.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
            <BarChart2 size={24} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sin análisis disponibles</p>
            <p className="text-xs text-slate-400 mt-1">
              Los análisis aparecen una vez que los empleados completan sus encuestas de pulso.
            </p>
          </div>
        </div>
      )}

      {/* Analysis list */}
      {visible.length > 0 && (
        <div className="flex flex-col gap-5">
          {visible.map((analysis) => {
            const cardStyle = RISK_CARD_STYLE[analysis.overallRisk] ?? RISK_CARD_STYLE.GOOD
            return (
              <div
                key={analysis.surveyAssignmentId}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <PulseAnalysisCard   analysis={analysis} cardStyle={cardStyle} />
                <EmployeeAnswersCard scores={analysis.scoresSnapshot} cardStyle={cardStyle} />
              </div>
            )
          })}
        </div>
      )}

    </main>
  )
}
