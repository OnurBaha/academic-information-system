import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/UI/Sidebar'
import TopAppBar from '../components/UI/TopAppBar'

export default function MainLayout() {
  const location = useLocation()
  const { currentUser } = useSelector((state) => state.auth || {})
  
  const isTeacher = location.pathname.startsWith('/teacher')
  const isDean = location.pathname.startsWith('/dean')
  const role = isTeacher ? 'teacher' : isDean ? 'dean' : 'student'

  // Oturum açılmamışsa giriş sayfasına yönlendir
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Rol yetki kontrolü: Kullanıcı kendi rolü dışındaki sayfalara erişmeye çalışırsa uygun dashboard'a yönlendir
  if (role !== currentUser.role) {
    if (currentUser.role === 'student') return <Navigate to="/student/dashboard" replace />
    if (currentUser.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
    if (currentUser.role === 'dean') return <Navigate to="/dean/overview" replace />
  }

  const user = {
    name: currentUser?.name || 'Kullanıcı',
    id: currentUser?.studentNumber || currentUser?.phone || currentUser?.id || '—'
  }

  return (
    <div className="layout-root">
      <Sidebar role={role} />
      <div className="layout-body">
        <TopAppBar role={role} userName={user.name} userId={user.id} />
        <Outlet />
      </div>
    </div>
  )
}
