import { useSelector } from 'react-redux'
import { Navigate }    from 'react-router-dom'

export default function RoleRoute({ allowed, children }) {
  const { user } = useSelector((s) => s.auth)
  if (!user || !allowed.includes(user.role)) return <Navigate to="/" replace />
  return children
}
