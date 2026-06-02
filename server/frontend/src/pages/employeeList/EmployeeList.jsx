import { useState, useMemo } from 'react'
import { UserPlus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { useEmployees } from '../../hooks/useEmployees'
import { createEmployee } from '../../services/employeeService'
import EmployeeFilters from './components/EmployeeFilters'
import EmployeeTable from './components/EmployeeTable'
import CreateEmployeeModal from './components/CreateEmployeeModal'

const STATUS_LABEL = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  ON_LEAVE: 'En licencia',
}

const ESTADO_OPTIONS = ['Todos', 'Activo', 'Inactivo', 'En licencia']

export default function EmployeeList() {
  const queryClient = useQueryClient()
  const { data: employees = [], isLoading, isError } = useEmployees()

  const [search, setSearch] = useState('')
  const [depto, setDepto] = useState('Todos')
  const [estado, setEstado] = useState('Todos')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const deptoOptions = useMemo(
    () => ['Todos', ...new Set(employees.map((e) => e.department?.name).filter(Boolean))],
    [employees],
  )

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const q = search.toLowerCase()
        const matchSearch =
          !search ||
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.user?.email?.toLowerCase().includes(q) ||
          e.position?.toLowerCase().includes(q)
        const matchDepto = depto === 'Todos' || e.department?.name === depto
        const matchEstado = estado === 'Todos' || STATUS_LABEL[e.status] === estado
        return matchSearch && matchDepto && matchEstado
      }),
    [employees, search, depto, estado],
  )

  const handleSave = async (data) => {
    const created = await createEmployee(data)
    await queryClient.invalidateQueries({ queryKey: ['employees'] })
    return created
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="border-l-4 border-brand pl-4">
          <h1 className="text-lg lg:text-xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
            Gestiona y monitorea a todas las personas de la organización
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                     text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors
                     cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          Nuevo empleado
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm">
        <EmployeeFilters
          search={search} onSearch={setSearch}
          depto={depto} onDepto={setDepto} deptoOptions={deptoOptions}
          estado={estado} onEstado={setEstado} estadoOptions={ESTADO_OPTIONS}
        />
        <EmployeeTable
          employees={filtered}
          total={employees.length}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        employees={employees}
      />

    </main>
  )
}
