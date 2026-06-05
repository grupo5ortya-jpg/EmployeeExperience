import { useSelector } from 'react-redux'
import { Navigate }    from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const { user, isLoading } = useSelector((s) => s.auth)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
