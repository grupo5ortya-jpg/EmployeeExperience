import { useState, useMemo } from 'react'
import { Briefcase } from 'lucide-react'

import { useJobOpenings } from './hooks/useJobOpenings'
import { useSkills } from './hooks/useSkills'

import JobOpeningFilters from './components/JobOpeningFilters'
import JobOpeningTable from './components/JobOpeningTable'
import JobOpeningDetailModal from './components/JobOpeningDetailModal'

export default function JobOpeningsList() {
    const { data: jobOpenings = [], isLoading, isError } = useJobOpenings()
    const { data: skills = [] } = useSkills()

    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('Todos')
    const [status, setStatus] = useState('Todos')
    const [skill, setSkill] = useState('Todos')

    const [selected, setSelected] = useState(null)

    const departmentOptions = useMemo(
        () => [
            'Todos',
            ...new Set(jobOpenings.map(j => j.department?.name).filter(Boolean)),
        ],
        [jobOpenings]
    )

    const filtered = useMemo(() => {
        return jobOpenings.filter(job => {
            const q = search.toLowerCase()

            const matchSearch =
                !search ||
                job.title?.toLowerCase().includes(q) ||
                job.description?.toLowerCase().includes(q)

            const matchDept =
                department === 'Todos' ||
                job.department?.name === department

            const matchStatus =
                status === 'Todos' ||
                job.status === status

            const matchSkill =
                skill === 'Todos' ||
                job.skills?.some(s => s.name === skill)

            return matchSearch && matchDept && matchStatus && matchSkill
        })
    }, [jobOpenings, search, department, status, skill])

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">

            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">Vacantes</h1>
                    <p className="text-sm text-slate-400">
                        Gestión de puestos abiertos
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    <Briefcase size={16} />
                    {jobOpenings.length}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm">

                <JobOpeningFilters
                    search={search}
                    setSearch={setSearch}
                    department={department}
                    setDepartment={setDepartment}
                    departmentOptions={departmentOptions}
                    status={status}
                    setStatus={setStatus}
                    skill={skill}
                    setSkill={setSkill}
                    skills={skills}
                />

                <JobOpeningTable
                    data={filtered}
                    total={jobOpenings.length}
                    isLoading={isLoading}
                    isError={isError}
                    onSelect={setSelected}
                />

            </div>

            <JobOpeningDetailModal
                jobOpening={selected}
                onClose={() => setSelected(null)}
            />

        </main>
    )
}