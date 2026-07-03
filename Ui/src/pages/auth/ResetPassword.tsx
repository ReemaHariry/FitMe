import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)
  const navigate = useNavigate()
  const { t } = useI18nStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Supabase puts the recovery token in the URL hash fragment
  // (e.g. #access_token=...&type=recovery), not a query param,
  // so it's only readable client-side and never sent to a server.
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const type = params.get('type')

    if (token && type === 'recovery') {
      setAccessToken(token)
    } else {
      setError('This reset link is invalid or has expired. Please request a new one.')
    }
    setTokenChecked(true)
  }, [])

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword(accessToken, data.password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (error: any) {
      console.error('Reset password failed:', error)
      setError(
        error.message ||
          'Could not reset your password. The link may have expired — please request a new one.'
      )
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
              FitMe
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {success ? 'Password updated' : 'Set a new password'}
            </p>
          </div>

          {success ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your password has been updated. Redirecting you to login...
              </p>
            </div>
          ) : !accessToken && tokenChecked ? (
            /* Invalid / missing token state */
            <div className="text-center space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Request a new link
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

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

                <div className="relative">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    className="pl-12 pr-12"
                  />
                  <Lock className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Update password
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}