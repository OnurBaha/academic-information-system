import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/UI/Sidebar'
import TopAppBar from '../components/UI/TopAppBar'

export default function MainLayout() {
  const location = useLocation()
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth)
  
  const isTeacher = location.pathname.startsWith('/teacher')
  const isDean = location.pathname.startsWith('/dean')
  const role = isTeacher ? 'teacher' : isDean ? 'dean' : 'student'

  // Öğrenci oturum açmamışsa giriş sayfasına yönlendir
  if (role === 'student' && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const user = isTeacher 
    ? { name: 'Dr. Ahmet Yılmaz', id: 'EGT-2021-0042' }
    : isDean 
    ? { name: 'Prof. Dr. Ahmet Yılmaz', id: 'DKN-2018-0001' }
    : authUser
    ? { name: authUser.name, id: authUser.ogrenciNo }
    : { name: 'Ahmet Yılmaz', id: '20211024032' }

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
