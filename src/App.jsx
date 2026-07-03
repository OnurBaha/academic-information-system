import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'

import Login from './pages/Auth/Login'

import StudentDashboard from './pages/Student/Dashboard'
import CourseReg        from './pages/Student/Courses'
import StudentGrades    from './pages/Student/Schedule'
import VideoPlayer      from './pages/Student/HomeworkSubmit'
import Documents        from './pages/Student/Documents'

import TeacherDashboard  from './pages/Teacher/Dashboard'
import GradeEntry        from './pages/Teacher/GradeEntry'
import Attendance        from './pages/Teacher/Attendance'
import HomeworkReview    from './pages/Teacher/HomeworkReview'
import Announcements     from './pages/Teacher/Announcements'

import DeanOverview      from './pages/Dean/Overview'
import Curriculum        from './pages/Dean/Curriculum'
import Faculty           from './pages/Dean/Faculty'
import StudentAnalytics  from './pages/Dean/StudentAnalytics'
import ApprovalCenter    from './pages/Dean/ApprovalCenter'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses"   element={<CourseReg />} />
          <Route path="/student/grades"    element={<StudentGrades />} />
          <Route path="/student/schedule"  element={<StudentGrades />} />
          <Route path="/student/video"     element={<VideoPlayer />} />
          <Route path="/student/documents" element={<Documents />} />

          <Route path="/teacher/dashboard"     element={<TeacherDashboard />} />
          <Route path="/teacher/grades"        element={<GradeEntry />} />
          <Route path="/teacher/attendance"    element={<Attendance />} />
          <Route path="/teacher/homework"      element={<HomeworkReview />} />
          <Route path="/teacher/announcements" element={<Announcements />} />

          <Route path="/dean/overview"   element={<DeanOverview />} />
          <Route path="/dean/curriculum" element={<Curriculum />} />
          <Route path="/dean/faculty"    element={<Faculty />} />
          <Route path="/dean/analytics"  element={<StudentAnalytics />} />
          <Route path="/dean/approvals"  element={<ApprovalCenter />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
