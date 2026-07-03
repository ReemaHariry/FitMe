import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dumbbell, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useI18nStore } from '@/app/i18n'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const { t } = useI18nStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.forgotPassword(data.email)
      // Always show the success state, even if the email doesn't exist —
      // the backend intentionally doesn't reveal that, for security.
      setSubmitted(true)
    } catch (error: any) {
      console.error('Forgot password failed:', error)
      setError(error.message || 'Something went wrong. Please try again.')
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
              {submitted
                ? 'Check your email'
                : 'Reset your password'}
            </p>
          </div>

          {submitted ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                If an account exists for that email, we've sent a link to
                reset your password. Be sure to check your spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
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
                    {...register('email')}
                    type="email"
                    label={t('auth.email')}
                    placeholder="your_email@example.com"
                    error={errors.email?.message}
                    className="pl-12"
                  />
                  <Mail className="absolute left-4 top-11 w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter the email address associated with your account and
                  we'll send you a link to reset your password.
                </p>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Send reset link
                </Button>
              </form>

              {/* Back to login link */}
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