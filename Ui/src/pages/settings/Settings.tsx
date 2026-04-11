import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Smartphone, 
  Volume2, 
  VolumeX,
  LogOut,
  Trash2,
  Download,
  Upload
} from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useThemeStore } from '@/app/theme'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'

export default function Settings() {
  const { logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { language, setLanguage } = useI18nStore()
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    socialUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
  })
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout()
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      console.log('Account deletion requested')
    }
  }

  const handleExportData = () => {
    // Handle data export
    console.log('Data export requested')
  }

  const handleImportData = () => {
    // Handle data import
    console.log('Data import requested')
  }

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ]

  const settingSections = [
    {
      title: 'Appearance',
      icon: theme === 'dark' ? Moon : Sun,
      settings: [
        {
          label: 'Theme',
          description: 'Choose your preferred theme',
          control: (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </>
              )}
            </Button>
          ),
        },
        {
          label: 'Language',
          description: 'Select your preferred language',
          control: (
            <Select
              options={languageOptions}
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
              className="w-32"
            />
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          label: 'Workout Reminders',
          description: 'Get reminded about your scheduled workouts',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.workoutReminders}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  workoutReminders: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          ),
        },
        {
          label: 'Progress Updates',
          description: 'Receive updates about your fitness progress',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.progressUpdates}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  progressUpdates: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          ),
        },
        {
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  emailNotifications: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          ),
        },
        {
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
          control: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  pushNotifications: e.target.checked 
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          ),
        },
      ],
    },
    {
      title: 'Audio & Video',
      icon: soundEnabled ? Volume2 : VolumeX,
      settings: [
        {
          label: 'Sound Effects',
          description: 'Enable sound effects during workouts',
          control: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Off
                </>
              )}
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      settings: [
        {
          label: 'Data Privacy',
          description: 'Manage your data privacy settings',
          control: (
            <Button variant="outline" size="sm">
              Manage
            </Button>
          ),
        },
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          control: (
            <Button variant="outline" size="sm">
              Enable
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: Download,
      settings: [
        {
          label: 'Export Data',
          description: 'Download your workout data and progress',
          control: (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          ),
        },
        {
          label: 'Import Data',
          description: 'Import workout data from other apps',
          control: (
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportData}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          ),
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customize your AI Fitness Trainer experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-6">
                {section.settings.map((setting, settingIndex) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {setting.control}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Account Actions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Sign Out
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="flex items-center text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Fitness Trainer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Version 1.0.0
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <button className="hover:text-primary">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-primary">Terms of Service</button>
              <span>•</span>
              <button className="hover:text-primary">Support</button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}