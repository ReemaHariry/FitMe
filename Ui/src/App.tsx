import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from './app/store'
import { useThemeStore } from './app/theme'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/dashboard/Dashboard'
import Workouts from './pages/workout/Workouts'
import WorkoutDetail from './pages/workout/WorkoutDetail'
import LiveTraining from './pages/live-training/LiveTraining'
import Reports from './pages/reports/Reports'
import ReportDetail from './pages/reports/ReportDetail'

import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()
  const [authChecked, setAuthChecked] = useState(false)  // ADDED: Track auth check completion

  // Check authentication on app startup
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setAuthChecked(true)  // ADDED: Mark as complete
    }
    initAuth()
  }, [checkAuth])

  // ADDED: Show loading while checking auth to prevent flash
  if (!authChecked) {
    return (
      <div className={theme}>
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={theme}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="onboarding" element={!user?.onboarding_complete ? <Onboarding /> : <Navigate to="/dashboard" />} />
            <Route path="dashboard" element={user?.onboarding_complete ? <Dashboard /> : <Navigate to="/onboarding" />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workouts/:id" element={<WorkoutDetail />} />
            <Route path="live-training" element={<LiveTraining />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:id" element={<ReportDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App