import { useState, useMemo } from 'react'
import { Briefcase, Plus } from 'lucide-react'

import { useJobOpenings } from './hooks/useJobOpenings'
import { useDepartments } from '../../hooks/useDepartments'

import JobOpeningFilters from './components/JobOpeningFilters.jsx'
import JobOpeningTable from './components/JobOpeningTable'
import JobOpeningDetailModal from './components/JobOpeningDetailModal'
import CreateJobOpeningModal from './components/CreateJobOpeningModal'

export default function JobOpeningsList() {
    const { data: jobs = [], isLoading, isError } = useJobOpenings()
    const { data: departments = [] } = useDepartments()

    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('Todos')
    const [status, setStatus] = useState('Todos')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const [selectedJob, setSelectedJob] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const departmentOptions = useMemo(
        () => ['Todos', ...departments.map((d) => d.name)],
        [departments]
    )

    const filteredJobs = useMemo(() => {
        const q = search.toLowerCase()

        return jobs.filter((j) => {
            const matchSearch =
                !search ||
                j.title?.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q)

            const matchDept =
                department === 'Todos' ||
                j.department?.name === department

            const matchStatus =
                status === 'Todos' ||
                j.status === status

            return matchSearch && matchDept && matchStatus
        })
    }, [jobs, search, department, status])

    const handleOpenDetail = (job) => {
        setSelectedJob(job)
        setIsDetailOpen(true)
    }

    const handleCloseDetail = () => {
        setIsDetailOpen(false)
        setSelectedJob(null)
    }

    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4">

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
                <div className="border-l-4 border-brand pl-4">
                    <h1 className="text-lg font-bold text-slate-800">
                        Vacantes
                    </h1>
                    <p className="text-sm text-slate-400">
                        Gestión de puestos abiertos
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                     text-sm font-semibold px-4 py-2.5 rounded-lg"
                >
                    <Plus size={16} />
                    Nueva vacante
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-brand-light">
                <JobOpeningFilters
                    search={search}
                    setSearch={setSearch}
                    department={department}
                    setDepartment={setDepartment}
                    departmentOptions={departmentOptions}
                    status={status}
                    setStatus={setStatus}
                />
                <JobOpeningTable
                    data={filteredJobs}
                    total={jobs.length}
                    isLoading={isLoading}
                    isError={isError}
                    onSelect={handleOpenDetail}
                />
            </div>

            {/* CREATE MODAL */}
            <CreateJobOpeningModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            {/* DETAIL / EDIT MODAL */}
            <JobOpeningDetailModal
                isOpen={isDetailOpen}
                job={selectedJob}
                onClose={handleCloseDetail}
            />

        </main>
    )
}