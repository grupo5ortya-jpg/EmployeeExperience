import JobOpeningRow from './JobOpeningRow'

const COLUMNS = [
	{ label: 'Vacante', vis: '' },
	{ label: 'Área', vis: 'hidden md:table-cell' },
	{ label: 'Skills', vis: 'hidden lg:table-cell' },
	{ label: 'Estado', vis: '' },
	{ label: '', vis: '' },
]

function Skeleton() {
	return (
		<tr className="animate-pulse border-b border-brand-light">
			{COLUMNS.map((c, i) => (
				<td key={i} className={`px-4 py-4 ${c.vis}`}>
					<div className="h-3 bg-slate-200 rounded w-3/4" />
				</td>
			))}
		</tr>
	)
}

export default function JobOpeningTable({
	data = [],          // 👈 FIX CRÍTICO
	total = 0,          // 👈 FIX CRÍTICO
	isLoading,
	isError,
	onSelect,
}) {
	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">

					<thead>
						<tr className="bg-navy">
							{COLUMNS.map(c => (
								<th
									key={c.label}
									className={`text-left text-xs text-sky-200 px-4 py-3 ${c.vis}`}
								>
									{c.label}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} />
							))
						) : isError ? (
							<tr>
								<td colSpan={COLUMNS.length} className="text-center py-10 text-red-400">
									Error al cargar vacantes
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td colSpan={COLUMNS.length} className="text-center py-10 text-slate-400">
									Sin resultados
								</td>
							</tr>
						) : (
							(Array.isArray(data) ? data : []).map((job, i) => (
								<JobOpeningRow
									key={job.id}
									job={job}
									striped={i % 2 === 0}
									onSelect={onSelect}
								/>
							))
						)}
					</tbody>

				</table>
			</div>

			<div className="px-4 py-3 border-t border-brand-light bg-brand-pale/50 text-xs text-brand-hover">
				{isLoading
					? 'Cargando...'
					: `Mostrando ${data.length} de ${total}`}
			</div>
		</>
	)
}