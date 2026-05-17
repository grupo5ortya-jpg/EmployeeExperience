import { useState, useMemo } from 'react'
import { useEmployees } from '../../hooks/useEmployees'
import ColaboradoresFilters from './components/ColaboradoresFilters'
import ColaboradoresTable from './components/ColaboradoresTable'

const STATUS_LABEL = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    ON_LEAVE: 'En licencia',
}

const ESTADO_OPTIONS = ['Todos', 'Activo', 'Inactivo', 'En licencia']

export default function Colaboradores() {
    const { data: employees = [], isLoading, isError } = useEmployees()

    const [search, setSearch] = useState('')
    const [depto, setDepto] = useState('Todos')
    const [estado, setEstado] = useState('Todos')

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

    return (
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-6">
            <div className="border-l-4 border-brand pl-4">
                <h1 className="text-lg lg:text-xl font-bold text-slate-800">Colaboradores</h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                    Gestiona y monitorea a todas las personas de la organización
                </p>
            </div>

            <div className="bg-white rounded-xl border border-brand-light shadow-sm">
                <ColaboradoresFilters
                    search={search} onSearch={setSearch}
                    depto={depto} onDepto={setDepto} deptoOptions={deptoOptions}
                    estado={estado} onEstado={setEstado} estadoOptions={ESTADO_OPTIONS}
                />
                <ColaboradoresTable
                    employees={filtered}
                    total={employees.length}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>
        </main>
    )
}