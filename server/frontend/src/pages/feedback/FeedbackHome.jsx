import { useState, useMemo } from 'react'
import { useNavigate }       from 'react-router-dom'
import { Plus, Search, RotateCcw } from 'lucide-react'

import { useSurveys }     from '../../hooks/useSurveys'
import { useDepartments } from '../../hooks/useDepartments'
import { useFeedbackParticipants } from './hooks/useFeedbackParticipants'
import { SurveyCard, SkeletonCard } from './components/SurveyCard'
import { COMPETENCY_MAP }  from './competencyConfig'

/* ─── Página ─────────────────────────────────────────────────── */
export default function FeedbackHome() {
    const navigate = useNavigate()

    const { data: surveys     = [], isLoading: loadingSurveys, isError: errorSurveys } = useSurveys()
    const { data: departments = [], isLoading: loadingDepts }                         = useDepartments()
    const { countByDept, isLoading: loadingParticipants }                             = useFeedbackParticipants()

    const isLoading = loadingSurveys || loadingDepts || loadingParticipants

    const [search,     setSearch]     = useState('')
    const [filterDept, setFilterDept] = useState('Todos')

    // Opciones del select de departamento
    const deptOptions = useMemo(
        () => ['Todos', ...departments.map((d) => d.name)],
        [departments],
    )

    // Filtrar ciclos por búsqueda y departamento
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return surveys.filter((s) => {
            const matchSearch =
                !search ||
                s.name.toLowerCase().includes(q) ||
                s.department?.name?.toLowerCase().includes(q) ||
                (s.competencies ?? []).some((id) =>
                    (COMPETENCY_MAP[id]?.label ?? id).toLowerCase().includes(q),
                )
            const matchDept =
                filterDept === 'Todos' || s.department?.name === filterDept
            return matchSearch && matchDept
        })
    }, [surveys, search, filterDept])

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">Feedback 360°</h1>
                    <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                        Gestioná los ciclos de evaluación de desempeño e interpersonales
                    </p>
                </div>
                <button
                    onClick={() => navigate('/createfeedback')}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors
                               cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo ciclo
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, departamento o competencia..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-brand-light
                                   text-slate-700 placeholder:text-slate-400 outline-none bg-white
                                   focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                    />
                </div>
                <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-3.5 py-2 text-sm rounded-lg border border-brand-light text-slate-700
                               outline-none bg-white focus:border-brand focus:ring-2 focus:ring-brand/20
                               transition-colors sm:w-52"
                >
                    {deptOptions.map((d) => (
                        <option key={d} value={d}>
                            {d === 'Todos' ? 'Todos los departamentos' : d}
                        </option>
                    ))}
                </select>
            </div>

            {/* Contenido */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>

            ) : errorSurveys ? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-red-400">Error al cargar los ciclos. Intentá de nuevo.</p>
                </div>

            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-full bg-brand-pale flex items-center justify-center">
                        <RotateCcw size={24} className="text-brand" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">
                            {surveys.length === 0
                                ? 'No hay ciclos de Feedback 360° todavía'
                                : 'Sin resultados para los filtros aplicados'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {surveys.length === 0
                                ? 'Creá el primer ciclo de evaluación para tu equipo.'
                                : 'Probá con otro departamento o término de búsqueda.'}
                        </p>
                    </div>
                    {surveys.length === 0 && (
                        <button
                            onClick={() => navigate('/createfeedback')}
                            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white
                                       text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            <Plus size={15} />
                            Crear primer ciclo
                        </button>
                    )}
                </div>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((survey) => (
                        <SurveyCard
                            key={survey.id}
                            survey={survey}
                            assignmentCount={countByDept[survey.department?.id] ?? 0}
                            onClick={() => navigate(`/feedback/${survey.id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            {!isLoading && !errorSurveys && filtered.length > 0 && (
                <p className="text-xs text-slate-400 text-center">
                    Mostrando {filtered.length} de {surveys.length} ciclos
                </p>
            )}

        </main>
    )
}
