import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <Topbar />
        <Outlet />
      </div>
    </div>
  )
}
