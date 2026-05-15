import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import SummaryCards from '../../components/SummaryCards'
import TaskList from '../../components/TaskList'
import GoalsList from '../../components/GoalsList'
import AIRecommendations from '../../components/AIRecommendations'
import CourseList from '../../components/CourseList'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Summary */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Resumen personal</h2>
            <SummaryCards />
          </section>

          {/* Two-column body: left 60% / right 40% */}
          <div className="grid grid-cols-5 gap-6 items-start">
            {/* Left column */}
            <div className="col-span-3 flex flex-col gap-6">
              <TaskList />
              <AIRecommendations />
            </div>

            {/* Right column */}
            <div className="col-span-2 flex flex-col gap-6">
              <GoalsList />
              <CourseList />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
