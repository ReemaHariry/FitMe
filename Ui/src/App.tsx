import { Routes, Route, Navigate } from 'react-router-dom'
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
  const { isAuthenticated, user } = useAuthStore()
  const { theme } = useThemeStore()

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
            <Route path="onboarding" element={!user?.onboardingCompleted ? <Onboarding /> : <Navigate to="/dashboard" />} />
            <Route path="dashboard" element={user?.onboardingCompleted ? <Dashboard /> : <Navigate to="/onboarding" />} />
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