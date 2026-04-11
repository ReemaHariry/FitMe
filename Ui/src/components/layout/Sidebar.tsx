import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Dumbbell, 
  Video, 
  BarChart3, 
  User, 
  Settings
} from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'nav.workouts', href: '/workouts', icon: Dumbbell },
  { name: 'nav.liveTraining', href: '/live-training', icon: Video },
  { name: 'nav.reports', href: '/reports', icon: BarChart3 },
  { name: 'nav.profile', href: '/profile', icon: User },
  { name: 'nav.settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { t, isRTL } = useI18nStore()

  return (
    <div className={cn(
      "w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col",
      isRTL && "border-l border-gray-200 dark:border-gray-700"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Fitness
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trainer
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                isRTL && "flex-row-reverse space-x-reverse"
              )
            }
          >
            {({ isActive }) => (
              <motion.div
                className="flex items-center space-x-3 w-full"
                whileHover={{ x: isRTL ? -2 : 2 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{t(item.name)}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}