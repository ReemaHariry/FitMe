import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useThemeStore } from '@/app/theme'
import { useSidebar } from '@/contexts/SidebarContext'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { isOpen, toggle } = useSidebar()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  const handleNavigate = (path: string) => {
    setIsDropdownOpen(false)
    navigate(path)
  }

  const handleToggleTheme = () => {
    toggleTheme()
    // Don't close dropdown - let user toggle multiple times if needed
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Sidebar Toggle Button */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Right side - Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-start">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* Arrow */}
              <div className="absolute -top-2 end-6 w-4 h-4 bg-white dark:bg-gray-800 border-t border-s border-gray-200 dark:border-gray-700 transform rotate-45"></div>
              
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xl">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-2">
                {/* Theme Toggle */}
                <button
                  onClick={handleToggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-start"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Light Mode
                      </span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </span>
                    </>
                  )}
                </button>

                {/* My Profile */}
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-start"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    My Profile
                  </span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-start"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Settings
                  </span>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-start"
                >
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Sign Out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
