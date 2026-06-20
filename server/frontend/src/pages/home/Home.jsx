import { useSelector } from 'react-redux'

import TalentoDashboard     from './components/TalentoDashboard'
import LiderDashboard       from './components/LiderDashboard'
import ColaboradorDashboard from './components/ColaboradorDashboard'
import AlumniDashboard      from './components/AlumniDashboard'
import ObjectivesCard       from './components/ObjectivesCard'
import LearningSummaryCard  from './components/LearningSummaryCard'

/* ── Página principal ────────────────────────────────────────── */
export default function Home() {
  const { user } = useSelector((s) => s.auth)
  const role       = user?.role
  const employeeId = user?.employeeId
  const exitType   = user?.exitType

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="border-l-4 border-brand pl-4">
        <h1 className="text-lg lg:text-xl font-bold text-slate-800">
          Bienvenido, {user?.firstName ?? 'bienvenido'} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {role === 'Talento' && 'Panel de recursos humanos'}
          {role === 'Líder'   && 'Panel de líder de equipo'}
          {role === 'Colaborador' && 'Tu espacio de trabajo'}
          {role === 'Alumni'  && 'Tu espacio de ex empleado'}
        </p>
      </div>

      {/* Contenido por rol */}
      {role === 'Talento'     && <TalentoDashboard />}
      {role === 'Líder'       && <LiderDashboard employeeId={employeeId} />}
      {role === 'Colaborador' && <ColaboradorDashboard employeeId={employeeId} />}
      {role === 'Alumni'      && <AlumniDashboard employeeId={employeeId} exitType={exitType} />}

      {/* Resumen secundario */}
      {role !== 'Alumni' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ObjectivesCard employeeId={employeeId} />
          <LearningSummaryCard role={role} employeeId={employeeId} />
        </div>
      )}

    </main>
  )
}
