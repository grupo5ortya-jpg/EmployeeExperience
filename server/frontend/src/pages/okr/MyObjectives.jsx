import { useSelector } from 'react-redux'
import { Target } from 'lucide-react'

import { useMyOkrs, useUpdateOkrProgress } from '../../hooks/useOkrs'
import MyOkrCard from './components/MyOkrCard'

export default function MyObjectives() {
    const { user } = useSelector((s) => s.auth)
    const employeeId = user?.employeeId

    const { data: okrs = [], isLoading } = useMyOkrs(employeeId)
    const { mutateAsync: updateProgress, isPending: saving } = useUpdateOkrProgress()

    const handleUpdateProgress = (id, currentValue) => updateProgress({ id, currentValue })

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Mis objetivos</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Objetivos asignados a vos — actualizá tu progreso a medida que avanzás
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : okrs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-16">
                    <Target size={32} className="text-slate-300" />
                    <p className="text-sm text-slate-400">Todavía no tenés objetivos asignados.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {okrs.map((okr) => (
                        <MyOkrCard
                            key={okr.id}
                            okr={okr}
                            onUpdateProgress={handleUpdateProgress}
                            saving={saving}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
