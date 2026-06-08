import { useState, useMemo } from 'react'
import { Plus, Search, Target, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { useOkrs, useCreateOkr, useUpdateOkr } from '../../hooks/useOkrs'
import { useEmployees } from '../../hooks/useEmployees'
import OkrFormModal from './components/OkrFormModal'
import OkrTreeNode  from './components/OkrTreeNode'

function buildTree(okrs) {
    const nodes = new Map(okrs.map((o) => [o.id, { ...o, childNodes: [] }]))
    const roots = []

    for (const node of nodes.values()) {
        if (node.parentId && nodes.has(node.parentId)) {
            nodes.get(node.parentId).childNodes.push(node)
        } else {
            roots.push(node)
        }
    }
    return roots
}

function SummaryCard({ icon: Icon, label, value, tone }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-brand-light bg-white p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xl font-extrabold text-slate-800 leading-tight">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
            </div>
        </div>
    )
}

export default function OKRManagement() {
    const { data: okrs = [], isLoading: loadingOkrs } = useOkrs()
    const { data: employees = [], isLoading: loadingEmployees } = useEmployees()
    const { mutateAsync: createOkr, isPending: creating } = useCreateOkr()
    const { mutateAsync: updateOkr, isPending: updating } = useUpdateOkr()

    const isLoading = loadingOkrs || loadingEmployees

    const [search, setSearch]   = useState('')
    const [statusFilter, setStatusFilter] = useState('Todos')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const overdueCount = useMemo(() => okrs.filter((o) => o.isOverdue).length, [okrs])
    const completedCount = useMemo(() => okrs.filter((o) => o.status === 'COMPLETED').length, [okrs])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return okrs.filter((o) => {
            const matchSearch = !search
                || o.title.toLowerCase().includes(q)
                || `${o.responsible?.firstName ?? ''} ${o.responsible?.lastName ?? ''}`.toLowerCase().includes(q)
            const matchStatus = statusFilter === 'Todos'
                || (statusFilter === 'OVERDUE' ? o.isOverdue : o.status === statusFilter)
            return matchSearch && matchStatus
        })
    }, [okrs, search, statusFilter])

    const tree = useMemo(() => buildTree(filtered), [filtered])

    const employeeOptions = useMemo(
        () => employees.filter((e) => e.status === 'ACTIVE'),
        [employees],
    )

    const openCreate = () => { setEditing(null); setModalOpen(true) }
    const openEdit   = (okr) => { setEditing(okr); setModalOpen(true) }

    const handleSubmit = async (payload) => {
        if (editing) await updateOkr({ id: editing.id, ...payload })
        else await createOkr(payload)
    }

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg lg:text-xl font-bold text-slate-800">OKR Management</h1>
                    <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                        Creá objetivos, asigná responsables y supervisá el progreso de toda la organización
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                               text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors
                               cursor-pointer shrink-0"
                >
                    <Plus size={16} />
                    Nuevo objetivo
                </button>
            </div>

            {/* Dashboard global */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard icon={Target}        label="Objetivos totales"  value={okrs.length}      tone="bg-brand-pale text-brand" />
                <SummaryCard icon={AlertTriangle} label="Vencidos"           value={overdueCount}     tone="bg-red-50 text-red-500" />
                <SummaryCard icon={CheckCircle2}  label="Completados"        value={completedCount}   tone="bg-emerald-50 text-emerald-500" />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título o responsable..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-brand-light
                                   text-slate-700 placeholder:text-slate-400 outline-none bg-white
                                   focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2 text-sm rounded-lg border border-brand-light text-slate-700
                               outline-none bg-white focus:border-brand focus:ring-2 focus:ring-brand/20
                               transition-colors sm:w-56"
                >
                    <option value="Todos">Todos los estados</option>
                    <option value="ON_TRACK">En curso</option>
                    <option value="AT_RISK">En riesgo</option>
                    <option value="STAGNANT">Estancado</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="OVERDUE">Vencidos</option>
                </select>
            </div>

            {/* Listado jerárquico */}
            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : tree.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-16">
                    <Target size={32} className="text-slate-300" />
                    <p className="text-sm text-slate-400">No hay objetivos que coincidan con los filtros.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tree.map((node) => (
                        <OkrTreeNode key={node.id} node={node} onEdit={openEdit} />
                    ))}
                </div>
            )}

            <OkrFormModal
                key={modalOpen ? (editing?.id ?? 'new') : 'closed'}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                employees={employeeOptions}
                okrs={okrs}
                editing={editing}
                onSubmit={handleSubmit}
                loading={creating || updating}
            />
        </main>
    )
}
