/**
 * FireStreakCard
 *
 * Shows current workout streak as an animated fire that grows
 * in size and intensity as the streak number increases.
 *
 * Streak tiers:
 *  0–2   days → small cold flame (blue-ish gray)
 *  3–6   days → warm orange flame
 *  7–13  days → hot orange-red flame  (medium fire)
 *  14–29 days → intense red flame     (big fire)
 *  30+   days → epic purple-gold flame (legendary)
 */

import { motion } from 'framer-motion'
import { useI18nStore } from '@/app/i18n'

interface FireStreakCardProps {
  streak: number
  loading?: boolean
}

function getFireConfig(streak: number) {
  if (streak >= 30) return {
    label: 'Legendary 🏆',
    colors: ['#ffd700', '#ff6b35', '#c026d3'],
    size: 72,
    layers: 4,
    speed: 0.6,
    glow: 'rgba(192,38,211,0.5)',
  }
  if (streak >= 14) return {
    label: 'On Fire!',
    colors: ['#ef4444', '#f97316', '#fbbf24'],
    size: 60,
    layers: 3,
    speed: 0.75,
    glow: 'rgba(239,68,68,0.4)',
  }
  if (streak >= 7) return {
    label: 'Heating Up',
    colors: ['#f97316', '#fbbf24', '#fde68a'],
    size: 50,
    layers: 3,
    speed: 0.9,
    glow: 'rgba(249,115,22,0.35)',
  }
  if (streak >= 3) return {
    label: 'Getting Warm',
    colors: ['#fb923c', '#fcd34d', '#fef3c7'],
    size: 40,
    layers: 2,
    speed: 1.1,
    glow: 'rgba(251,146,60,0.25)',
  }
  return {
    label: 'Just Started',
    colors: ['#ea580c', '#f97316', '#fb923c'],
    size: 34,
    layers: 1,
    speed: 1.4,
    glow: 'rgba(234,88,12,0.3)',
  }
}

function FlameShape({ color, scale = 1, delay = 0, speed = 1 }: {
  color: string; scale?: number; delay?: number; speed?: number
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${38 * scale}px`,
        height: `${52 * scale}px`,
        borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
        background: `radial-gradient(ellipse at 50% 80%, ${color} 0%, transparent 70%)`,
        filter: 'blur(1px)',
      }}
      animate={{
        scaleY: [1, 1.08, 0.96, 1.05, 1],
        scaleX: [1, 0.96, 1.04, 0.98, 1],
        y: [0, -3, 1, -2, 0],
      }}
      transition={{
        duration: speed,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function FireStreakCard({ streak, loading = false }: FireStreakCardProps) {
  const { t } = useI18nStore()
  const cfg = getFireConfig(streak)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        {/* Label at top */}
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('dashboard.workoutStreak')}
        </p>

        {/* Large streak number */}
        <p className="text-5xl font-bold text-gray-900 dark:text-white">
          {loading ? '·' : streak}
        </p>

        {/* Animated Flame + Status text at bottom */}
        <div className="flex items-center gap-2">
          <div
            style={{
              position: 'relative',
              width: '20px',
              height: '26px',
              filter: `drop-shadow(0 0 6px ${cfg.glow})`,
            }}
          >
            <FlameShape color={cfg.colors[0]} scale={0.35} delay={0} speed={cfg.speed} />
          </div>
          <span className="text-sm font-semibold" style={{ color: cfg.colors[0] }}>
            {loading ? '...' : streak === 0 ? 'No streak yet' : `${streak} day${streak !== 1 ? 's' : ''} — ${cfg.label}`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
