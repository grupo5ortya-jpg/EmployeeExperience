import SummaryCards from '../../components/SummaryCards'
import TaskList from '../../components/TaskList'
import GoalsList from '../../components/GoalsList'
import AIRecommendations from '../../components/AIRecommendations'
import CourseList from '../../components/CourseList'

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-400 mb-3">Resumen personal</h2>
        <SummaryCards />
      </section>

      <div className="grid grid-cols-5 gap-6 items-start">
        <div className="col-span-3 flex flex-col gap-6">
          <TaskList />
          <AIRecommendations />
        </div>
        <div className="col-span-2 flex flex-col gap-6">
          <GoalsList />
          <CourseList />
        </div>
      </div>
    </main>
  )
}