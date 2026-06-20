/**
 * AI Coach Page
 *
 * A chat interface for the FitMe AI Coach — a personalized fitness assistant.
 * The backend automatically uses the logged-in user's profile and training
 * history, so the user can just ask questions naturally.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User as UserIcon, RotateCcw, Sparkles } from 'lucide-react'
import { coachApi } from '@/api/coach'
import { useI18nStore } from '@/app/i18n'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'How can I improve my form?',
  'What should I train tomorrow?',
  'How many rest days do I need?',
  'Give me a quick warm-up routine.',
]

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your FitMe AI Coach. I already know your profile and recent sessions, " +
    "so just ask me anything about your training — workouts, technique, recovery, " +
    "or how to fix the mistakes from your reports.",
}

export default function AICoach() {
  const { isRTL } = useI18nStore()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the newest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setLoading(true)

    try {
      const reply = await coachApi.sendMessage(trimmed)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err?.message || 'The AI Coach is unavailable right now.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleReset = async () => {
    try {
      await coachApi.reset()
    } catch {
      /* non-blocking */
    }
    setMessages([WELCOME])
    setError(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Coach</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your personal fitness assistant
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-end gap-2',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  msg.role === 'user'
                    ? 'bg-gray-200 dark:bg-gray-600'
                    : 'bg-primary'
                )}
              >
                {msg.role === 'user' ? (
                  <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md'
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading / thinking indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Suggestions (only before the first user message) */}
      {messages.length === 1 && !loading && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Coach anything about training..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
