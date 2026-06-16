import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Target, Calendar, Upload } from 'lucide-react'
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
import QuickStatsCards from '@/components/dashboard/QuickStatsCards'
import WeightTracker from '@/components/dashboard/WeightTracker'
import AchievementBadges from '@/components/dashboard/AchievementBadges'
import LastSessionSummary from '@/components/dashboard/LastSessionSummary'
import StreakCalendar from '@/components/dashboard/StreakCalendar'

export default function Dashboard() {
  const { t } = useI18nStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  // ============================================================================
  // REAL DATA STATE
  // ============================================================================
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null)
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [profile, setProfile] = useState<ProfileDataResponse | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStatsLoading(true)
        const [stats, recent, weights, userProfile] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentSessions(3),
          weightApi.getLogs(10),
          usersApi.getProfile()
        ])
        setDashStats(stats)
        setRecentSessions(recent)
        setWeightLogs(weights)
        setProfile(userProfile)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setStatsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Handler for weight log updates
  const handleWeightLogsUpdate = (updatedLogs: WeightLog[]) => {
    setWeightLogs(updatedLogs)
  }

  // ============================================================================
  // STATS ARRAY NOW USES REAL DATA
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
      title: t('dashboard.workoutStreak'),
      value: statsLoading ? '...' : `${dashStats?.current_streak ?? 0} ${t('dashboard.days')}`,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              👋 {t('auth.welcomeBack')}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/live-training')}
              className="flex items-center"
            >
              <Play className="w-4 h-4 me-2" />
              {t('dashboard.startTraining')}
            </Button>
            <Button
              onClick={() => navigate('/upload-video')}
              variant="outline"
              className="flex items-center"
            >
              <Upload className="w-4 h-4 me-2" />
              {t('dashboard.uploadVideo')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Motivation Card */}
      {!statsLoading && dashStats && profile && (
        <MotivationCard
          sessionsThisWeek={dashStats.sessions_this_week}
          weeklyGoal={profile.training_days_per_week || 3}
        />
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
        {!statsLoading && dashStats && profile && (
          <QuickStatsCards
            bestScore={dashStats.best_score}
            sessionsThisWeek={dashStats.sessions_this_week}
            weeklyGoal={profile.training_days_per_week || 3}
          />
        )}
      </motion.div>

      {/* Weight Tracker */}
      {!statsLoading && profile && (
        <WeightTracker
          initialLogs={weightLogs}
          fitnessGoal={profile.fitness_goal || undefined}
          onLogsUpdate={handleWeightLogsUpdate}
        />
      )}

      {/* Achievement Badges */}
      {!statsLoading && dashStats && (
        <AchievementBadges stats={dashStats} weightLogs={weightLogs} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Last Session Summary */}
        {!statsLoading && recentSessions.length > 0 && (
          <LastSessionSummary session={recentSessions[0]} />
        )}

        {/* Session History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.recentSessions')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                {t('dashboard.viewAll')}
              </Button>
            </div>
            
            {/* Loading State */}
            {statsLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-4 bg-gray-200 dark:bg-gray-700 rounded-xl h-16"></div>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!statsLoading && recentSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('dashboard.noSessionsYet')}
              </div>
            )}
            
            {/* Recent Sessions List */}
            {!statsLoading && recentSessions.length > 0 && (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => session.report_id && navigate(`/reports/${session.report_id}`)}
                    className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl ${
                      session.report_id ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors' : ''
                    }`}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.session_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.date_label} • {
                          // FIXED: Show duration properly
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
                      <p className="text-sm text-primary capitalize">
                        {session.performance_rating.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.weeklyActivity')}
              </h2>
            </div>
            <ActivityChart />
          </Card>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.progressOverTime')}
              </h2>
            </div>
            <ProgressChart />
          </Card>
        </motion.div>
      </div>

      {/* Streak Calendar */}
      {!statsLoading && dashStats && (
        <StreakCalendar activeDates={dashStats.active_dates_last_30} />
      )}
    </div>
  )
}
