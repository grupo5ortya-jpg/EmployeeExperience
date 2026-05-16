import ColaboradoresRow from './ColaboradoresRow'

const COLUMNS = [
  { label: 'Colaborador',   vis: '' },
  { label: 'Posición',      vis: 'hidden md:table-cell' },
  { label: 'Departamento',  vis: 'hidden lg:table-cell' },
  { label: 'Líder directo', vis: 'hidden lg:table-cell' },
  { label: 'Estado',        vis: '' },
  { label: '',              vis: '' },
]

function SkeletonRow() {
  return (
    <tr className="border-b border-brand-light animate-pulse">
      {COLUMNS.map(({ label, vis }, i) => (
        <td key={i} className={`px-4 py-4 ${vis}`}>
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function ColaboradoresTable({ employees, total, isLoading, isError }) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy">
              {COLUMNS.map(({ label, vis }) => (
                <th
                  key={label}
                  className={`text-left text-xs font-semibold text-sky-200 px-4 py-3 whitespace-nowrap ${vis}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : isError ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-10 text-sm text-red-400 bg-brand-pale">
                  Error al cargar los colaboradores. Intentá de nuevo.
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-10 text-sm text-slate-400 bg-brand-pale">
                  No se encontraron colaboradores
                </td>
              </tr>
            ) : (
              employees.map((emp, i) => (
                <ColaboradoresRow key={emp.id} employee={emp} striped={i % 2 === 0} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-brand-light bg-brand-pale/50 rounded-b-xl">
        <p className="text-xs text-brand-hover font-medium">
          {isLoading
            ? 'Cargando...'
            : `Mostrando ${employees.length} de ${total} colaboradores`}
        </p>
      </div>
    </>
  )
}
