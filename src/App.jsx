import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getMe } from '@/api/users'
import useAuthStore from '@/store/authStore'
import useUiStore from '@/store/uiStore'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Home, Login, Register, Catalog, CoursePage, LearnPage, Profile, Leaderboard } from '@/pages'
import { AuthorCourses, CourseNew, CourseEdit, LessonEditor } from '@/pages/author'
import { ModerationQueue } from '@/pages/moderation'
import { AdminLayout, AdminDashboard, AdminCourses, AdminUsers } from '@/pages/admin'

function AdminRoute({ children }) {
  return <ProtectedRoute requireAuth requireRole="admin">{children}</ProtectedRoute>
}

export default function App() {
  const { setAuth, logout, isAuthenticated } = useAuthStore()
  const { theme } = useUiStore()

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    getMe()
      .then(({ data }) => setAuth(data, token))
      .catch(() => logout())
  }, [])

  return (
    <Routes>
      {/* Landing page — own navbar, no Layout */}
      <Route path="/" element={<Home />} />

      {/* App pages — wrapped in Layout with Navbar */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/courses" element={<Catalog />} />
            <Route path="/courses/:id" element={<CoursePage />} />
            <Route path="/courses/:id/learn" element={
              <ProtectedRoute requireAuth><LearnPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireAuth><Profile /></ProtectedRoute>
            } />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/author/courses" element={
              <ProtectedRoute requireAuth requireAuthor><AuthorCourses /></ProtectedRoute>
            } />
            <Route path="/author/courses/new" element={
              <ProtectedRoute requireAuth requireAuthor><CourseNew /></ProtectedRoute>
            } />
            <Route path="/author/courses/:id/edit" element={
              <ProtectedRoute requireAuth requireAuthor><CourseEdit /></ProtectedRoute>
            } />
            <Route path="/author/courses/:courseId/lessons/:lessonId/edit" element={
              <ProtectedRoute requireAuth requireAuthor><LessonEditor /></ProtectedRoute>
            } />
            <Route path="/moderation" element={
              <ProtectedRoute requireAuth requireRole={['moderator', 'admin']}><ModerationQueue /></ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}
