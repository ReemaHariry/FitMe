import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Dumbbell, 
  Video, 
  BarChart3, 
  User, 
  Settings,
  Bot,
  Scale
} from 'lucide-react'
import { useI18nStore } from '@/app/i18n'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'nav.workouts', href: '/workouts', icon: Dumbbell },
  { name: 'nav.liveTraining', href: '/live-training', icon: Video },
  { name: 'nav.aiCoach', href: '/ai-coach', icon: Bot },
  { name: 'bodyCalculations', href: '/nutrition', icon: Scale },
  { name: 'nav.reports', href: '/reports', icon: BarChart3 },
  { name: 'nav.profile', href: '/profile', icon: User },
  { name: 'nav.settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { t, isRTL } = useI18nStore()
  const { isOpen } = useSidebar()

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? 256 : 80 
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={cn(
        "bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden",
        isRTL && "border-l border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isOpen ? "space-x-3" : "flex-col"
        )}>
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  FitMe
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Trainer
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
                "flex items-center rounded-2xl transition-colors relative group",
                isOpen ? "space-x-3 px-4 py-3" : "justify-center px-0 py-3",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                isRTL && isOpen && "flex-row-reverse space-x-reverse"
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  className={cn(
                    "flex items-center w-full",
                    isOpen ? "space-x-3" : "justify-center"
                  )}
                  whileHover={{ x: isOpen && !isRTL ? 2 : isOpen && isRTL ? -2 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {t(item.name)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {t(item.name)}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  )
}