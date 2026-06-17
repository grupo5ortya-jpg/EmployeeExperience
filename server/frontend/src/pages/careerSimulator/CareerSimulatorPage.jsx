import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, BookOpen, Briefcase, Heart, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Loader2, Sparkles, Clock,
} from 'lucide-react'
import { getJobOpenings } from '../../services/jobOpeningService'
import { useActivePlan, usePlanHistory, useGeneratePlan } from '../../hooks/useCareerSimulator'

/* ── constants ─────────────────────────────────────────────────── */

const PRIORITY_STYLE = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-600',
}
const PRIORITY_LABEL = { high: 'Alta', medium: 'Media', low: 'Baja' }

const ACTION_ICON  = { course: BookOpen, experience: Briefcase, soft_skill: Heart }
const ACTION_COLOR = { course: 'text-blue-500', experience: 'text-purple-500', soft_skill: 'text-green-500' }
const ACTION_LABEL = { course: 'Curso', experience: 'Experiencia', soft_skill: 'Habilidad blanda' }

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

/* ── small components ──────────────────────────────────────────── */

function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[priority] ?? 'bg-slate-100 text-slate-500'}`}>
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  )
}

function GapPills({ gapSnapshot }) {
  if (!gapSnapshot) return null
  const { covered = [], gaps = [], missing = [] } = gapSnapshot
  if (!covered.length && !gaps.length && !missing.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {covered.length > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={12} />
          {covered.length} cubierta{covered.length !== 1 ? 's' : ''}
        </span>
      )}
      {gaps.length > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
          <AlertTriangle size={12} />
          {gaps.length} por mejorar
        </span>
      )}
      {missing.length > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
          <XCircle size={12} />
          {missing.length} faltante{missing.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

function ActionCard({ action }) {
  const Icon = ACTION_ICON[action.type] ?? TrendingUp
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-brand-light bg-brand-pale">
      <div className={`mt-0.5 shrink-0 ${ACTION_COLOR[action.type] ?? 'text-slate-400'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="text-xs text-slate-400">{ACTION_LABEL[action.type] ?? action.type}</span>
          <PriorityBadge priority={action.priority} />
          {action.skillName && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-brand-light text-brand">
              {action.skillName}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-700 leading-snug">{action.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{action.description}</p>
      </div>
    </div>
  )
}

function PlanCard({ plan, isActive = false }) {
  const [expanded, setExpanded] = useState(false)
  const actions = plan.plan?.actions ?? []
  const sortedActions = useMemo(
    () => [...actions].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)),
    [actions],
  )
  const estimatedMonths = plan.plan?.estimatedMonths
  const summary         = plan.plan?.summary
  const targetTitle     = plan.targetPosition?.title ?? plan.gapSnapshot?.targetPosition?.title ?? 'Puesto no disponible'

  const showBody = isActive || expanded

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${isActive ? 'border-brand' : 'border-brand-light'}`}>
      {/* Header */}
      <div
        role={isActive ? undefined : 'button'}
        tabIndex={isActive ? undefined : 0}
        onClick={() => !isActive && setExpanded((v) => !v)}
        onKeyDown={(e) => !isActive && e.key === 'Enter' && setExpanded((v) => !v)}
        className={`flex items-center gap-3 px-5 py-4
          ${isActive ? 'bg-brand' : 'bg-brand-pale hover:bg-brand-light/60 cursor-pointer'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isActive && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Plan activo
              </span>
            )}
            <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-700'}`}>
              {targetTitle}
            </span>
            {estimatedMonths && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                ${isActive ? 'bg-white/20 text-white' : 'bg-white border border-brand-light text-brand'}`}>
                <Clock size={11} />
                ~{estimatedMonths} meses
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
            Generado el {new Date(plan.generatedAt).toLocaleDateString('es-AR')}
          </p>
        </div>
        {!isActive && (
          <div className="text-slate-400 shrink-0">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
      </div>

      {/* Body */}
      {showBody && (
        <div className="p-5 bg-white flex flex-col gap-4">
          <GapPills gapSnapshot={plan.gapSnapshot} />
          {summary && (
            <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
          )}
          {sortedActions.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Acciones recomendadas
              </h4>
              {sortedActions.map((action, i) => (
                <ActionCard key={i} action={action} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── main page ─────────────────────────────────────────────────── */

export default function CareerSimulatorPage() {
  const { user } = useSelector((s) => s.auth)
  const employeeId = user?.employeeId

  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState('')
  const [showWarning, setShowWarning]                   = useState(false)

  const { data: jobOpenings = [] } = useQuery({
    queryKey: ['job-openings'],
    queryFn: getJobOpenings,
  })
  const openJobOpenings = useMemo(
    () => jobOpenings.filter((jo) => jo.status === 'open'),
    [jobOpenings],
  )

  const { data: activePlan, isLoading: isLoadingActive } = useActivePlan(employeeId)
  const { data: history = [], isLoading: isLoadingHistory } = usePlanHistory(employeeId)
  const { mutate: generate, isPending: isGenerating }    = useGeneratePlan()

  const pastPlans = history.slice(1) // index 0 is active (DESC order)

  const handleSelectJobOpening = (id) => {
    setSelectedJobOpeningId(id)
    setShowWarning(!!activePlan && !!id)
  }

  const handleGenerate = () => {
    if (!selectedJobOpeningId || isGenerating) return
    generate(
      { employeeId, jobOpeningId: selectedJobOpeningId },
      {
        onSuccess: () => {
          setSelectedJobOpeningId('')
          setShowWarning(false)
        },
      },
    )
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="border-l-4 border-brand pl-4">
          <h1 className="text-lg lg:text-xl font-bold text-slate-800">Simulador de carrera</h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
            Elegí un puesto objetivo y generá un plan de desarrollo personalizado con IA
          </p>
        </div>

        {/* Generator card */}
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand shrink-0" />
            <h2 className="text-sm font-bold text-slate-700">Generar plan de carrera</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedJobOpeningId}
              onChange={(e) => handleSelectJobOpening(e.target.value)}
              className="flex-1 text-sm text-slate-700 border border-brand-light rounded-lg px-3 py-2.5
                         focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light
                         transition-colors duration-150 cursor-pointer"
            >
              <option value="">Seleccioná un puesto objetivo...</option>
              {openJobOpenings.map((jo) => (
                <option key={jo.id} value={jo.id}>
                  {jo.title}{jo.department?.name ? ` — ${jo.department.name}` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={!selectedJobOpeningId || isGenerating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white
                         text-sm font-semibold transition-colors hover:bg-brand-hover
                         disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generar plan
                </>
              )}
            </button>
          </div>

          {showWarning && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-700 leading-relaxed">
                Ya tenés un plan activo para{' '}
                <strong>
                  {activePlan?.targetPosition?.title ?? activePlan?.gapSnapshot?.targetPosition?.title}
                </strong>
                . Al generar uno nuevo, este pasará a ser tu plan activo. El historial anterior se conserva.
              </p>
            </div>
          )}
        </div>

        {/* Active plan */}
        {isLoadingActive ? (
          <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ) : activePlan ? (
          <PlanCard plan={activePlan} isActive />
        ) : (
          <div className="bg-white rounded-xl border border-brand-light shadow-sm p-10 text-center">
            <TrendingUp size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              Todavía no generaste ningún plan de carrera.
              Seleccioná un puesto objetivo y hacé clic en "Generar plan".
            </p>
          </div>
        )}

        {/* History */}
        {!isLoadingHistory && pastPlans.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
              Historial ({pastPlans.length} plan{pastPlans.length !== 1 ? 'es' : ''} anterior{pastPlans.length !== 1 ? 'es' : ''})
            </h3>
            {pastPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
