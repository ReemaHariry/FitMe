import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Target, Upload, Clock, Star, Dumbbell, AlertCircle } from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { useAuthStore } from '@/app/store'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatsCard from '@/components/cards/StatsCard'
import ActivityChart from '@/components/charts/ActivityChart'
import ProgressChart from '@/components/charts/ProgressChart'
import { dashboardApi, type DashboardStats, type RecentSession } from '@/api/dashboard'
import { weightApi, type WeightLog } from '@/api/weight'
import { usersApi, type ProfileDataResponse } from '@/api/users'
import MotivationCard from '@/components/dashboard/MotivationCard'
import WeeklyGoalCard from '@/components/dashboard/WeeklyGoalCard'
import WeightTracker from '@/components/dashboard/WeightTracker'
import StreakCalendar from '@/components/dashboard/StreakCalendar'
import FireStreakCard from '@/components/dashboard/FireStreakCard'

export default function Dashboard() {
  const { t } = useI18nStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // ============================================================================
  // REAL DATA STATE
  // ============================================================================
  const [dashStats, setDashStats] = useState<DashboardStats | null>(() => {
    const cached = sessionStorage.getItem('fitme_dashStats')
    return cached ? JSON.parse(cached) : null
  })
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>(() => {
    const cached = sessionStorage.getItem('fitme_recentSessions')
    return cached ? JSON.parse(cached) : []
  })
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    const cached = sessionStorage.getItem('fitme_weightLogs')
    return cached ? JSON.parse(cached) : []
  })
  const [profile, setProfile] = useState<ProfileDataResponse | null>(() => {
    const cached = sessionStorage.getItem('fitme_profile')
    return cached ? JSON.parse(cached) : null
  })

  // We only show loading state if we DON'T have cached data
  const [statsLoading, setStatsLoading] = useState(!dashStats)
  const [recentLoading, setRecentLoading] = useState(recentSessions.length === 0)
  const [weightLoading, setWeightLoading] = useState(weightLogs.length === 0)
  const [profileLoading, setProfileLoading] = useState(!profile)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = () => {
    setStatsError(null)

    // 1. Load Stats
    dashboardApi.getStats()
      .then(stats => {
        setDashStats(stats)
        sessionStorage.setItem('fitme_dashStats', JSON.stringify(stats))
        setStatsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load stats:', err)
        setStatsError(t('common.error'))
        setStatsLoading(false)
      })

    // 2. Load Recent Sessions
    dashboardApi.getRecentSessions(3)
      .then(recent => {
        setRecentSessions(recent)
        sessionStorage.setItem('fitme_recentSessions', JSON.stringify(recent))
        setRecentLoading(false)
      })
      .catch(err => {
        console.error('Failed to load recent sessions:', err)
        setRecentLoading(false)
      })

    // 3. Load Weight Logs
    weightApi.getLogs(10)
      .then(weights => {
        setWeightLogs(weights)
        sessionStorage.setItem('fitme_weightLogs', JSON.stringify(weights))
        setWeightLoading(false)
      })
      .catch(err => {
        console.error('Failed to load weight logs:', err)
        setWeightLoading(false)
      })

    // 4. Load Profile
    usersApi.getProfile()
      .then(userProfile => {
        setProfile(userProfile)
        sessionStorage.setItem('fitme_profile', JSON.stringify(userProfile))
        setProfileLoading(false)
      })
      .catch(err => {
        console.error('Failed to load profile:', err)
        setProfileLoading(false)
      })
  }

  // Handler for weight log updates
  const handleWeightLogsUpdate = (updatedLogs: WeightLog[]) => {
    setWeightLogs(updatedLogs)
  }

  // ============================================================================
  // STATS — no streak here; streak has its own FireStreakCard
  // ============================================================================
  const stats = [
    {
      title: t('dashboard.totalSessions'),
      value: statsLoading ? '...' : String(dashStats?.total_sessions ?? 0),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('dashboard.totalMinutes'),
      value: statsLoading ? '...' : String(dashStats?.total_minutes ?? 0),
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t('dashboard.currentScore'),
      value: statsLoading ? '...' : dashStats?.average_form_score ? `${dashStats.average_form_score}/100` : '--',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: t('dashboard.bestExercise'),
      value: statsLoading ? '...' : (dashStats?.most_practiced_exercise && dashStats.most_practiced_exercise !== 'none' ? dashStats.most_practiced_exercise : '--'),
      icon: Dumbbell,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('auth.welcomeBack')}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/live-training')}
              className="flex items-center shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-primary/80"
            >
              <Play className="w-4 h-4 me-2" />
              {t('dashboard.startTraining')}
            </Button>
            <Button
              onClick={() => navigate('/upload-video')}
              variant="outline"
              className="flex items-center shadow-sm"
            >
              <Upload className="w-4 h-4 me-2" />
              {t('dashboard.uploadVideo')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Banner */}
      {statsError && (
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{statsError}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN (Main Content) - 8 columns wide */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Stats Grid + Fire Streak side by side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* 4 small stat cards */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <StatsCard key={stat.title} {...stat} delay={index * 0.08} />
              ))}
            </div>

            {/* Fire Streak Card */}
            <div className="flex items-stretch">
              <div className="w-full h-full">
                <FireStreakCard
                  streak={dashStats?.current_streak ?? 0}
                  loading={statsLoading}
                />
              </div>
            </div>
          </motion.div>

          {/* Daily Quote Banner */}
          <MotivationCard className="hover:shadow-md transition-shadow" />

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('dashboard.weeklyActivity')}
                  </h2>
                </div>
                <ActivityChart />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('dashboard.progressOverTime')}
                  </h2>
                </div>
                <ProgressChart />
              </Card>
            </motion.div>
          </div>

          {/* Session History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('dashboard.recentSessions')}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                  {t('dashboard.viewAll')}
                </Button>
              </div>

              {recentLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-200 dark:bg-gray-700 rounded-xl h-16" />
                  ))}
                </div>
              )}

              {!recentLoading && recentSessions.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Dumbbell className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No sessions yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Your workout history will appear here.
                  </p>
                  <Button onClick={() => navigate('/live-training')} size="sm">
                    Start your first workout
                  </Button>
                </div>
              )}

              {!recentLoading && recentSessions.length > 0 && (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => session.report_id && navigate(`/reports/${session.report_id}`)}
                      className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent ${
                        session.report_id ? 'cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm' : ''
                      }`}
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {session.session_name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {session.date_label} • {
                            session.duration_minutes > 0
                              ? `${session.duration_minutes} ${t('common.minutes')}`
                              : session.duration_seconds > 0
                              ? '< 1 min'
                              : '—'
                          }
                          {session.form_score !== null && ` • ${t('common.score')}: ${session.form_score}/100`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {session.performance_rating.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

        </div>

        {/* RIGHT COLUMN (Sidebar) - 4 columns wide */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8 lg:sticky lg:top-6">
          
          {/* Weekly Goal */}
          {!statsLoading && !profileLoading && dashStats && profile && (
            <WeeklyGoalCard
              sessionsThisWeek={dashStats.sessions_this_week}
              weeklyGoal={profile.training_days_per_week || 3}
            />
          )}

          {/* Weight Tracker */}
          {!weightLoading && !profileLoading && profile && (
            <div className="shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <WeightTracker
                initialLogs={weightLogs}
                fitnessGoal={profile.fitness_goal || undefined}
                onLogsUpdate={handleWeightLogsUpdate}
              />
            </div>
          )}

          {/* Streak Calendar */}
          {!statsLoading && dashStats && (
            <div className="shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
              <StreakCalendar activeDates={dashStats.active_dates_last_30} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
