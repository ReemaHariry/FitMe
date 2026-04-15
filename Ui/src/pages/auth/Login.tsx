import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/app/store'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { t } = useI18nStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    try {
      await login(data.email, data.password, data.rememberMe)
      
      // Check if user needs onboarding
      const { user } = useAuthStore.getState()
      if (user?.onboardingCompleted) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Fitness Trainer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('auth.welcomeBack')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <Input
                {...register('email')}
                type="email"
                label={t('auth.email')}
                placeholder="john@example.com"
                error={errors.email?.message}
                className="pl-12"
              />
              <Mail className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                placeholder="••••••••"
                error={errors.password?.message}
                className="pl-12 pr-12"
              />
              <Lock className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.rememberMe')}
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              {t('auth.login')}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
              {t('auth.register')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}