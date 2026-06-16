import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

interface MotivationCardProps {
  sessionsThisWeek: number
  weeklyGoal: number
}

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
  { text: "The difference between try and triumph is just a little umph.", author: "Marvin Phillips" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Every champion was once a contender that refused to give up.", author: "Rocky Balboa" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It never gets easier, you just get stronger.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Once you see results, it becomes an addiction.", author: "Unknown" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
  { text: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
  { text: "You are one workout away from a good mood.", author: "Unknown" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Gandhi" },
  { text: "The body achieves what the mind believes.", author: "Unknown" },
  { text: "Be stronger than your excuses.", author: "Unknown" },
  { text: "Train insane or remain the same.", author: "Unknown" },
  { text: "Champions are made from something they have deep inside.", author: "Muhammad Ali" },
  { text: "The clock is ticking. Are you becoming the person you want to be?", author: "Greg Plitt" },
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
]

export default function MotivationCard({ sessionsThisWeek, weeklyGoal }: MotivationCardProps) {
  // Get quote based on day of month
  const dayOfMonth = new Date().getDate()
  const quote = QUOTES[dayOfMonth % QUOTES.length]
  
  // Calculate progress
  const remaining = Math.max(0, weeklyGoal - sessionsThisWeek)
  const progress = Math.min(100, (sessionsThisWeek / weeklyGoal) * 100)
  const isGoalComplete = sessionsThisWeek >= weeklyGoal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border-l-4 border-primary"
    >
      {/* Quote Section */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 italic text-base leading-relaxed">
          "{quote.text}"
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">— {quote.author}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

      {/* Goal Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Today's Goal
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {sessionsThisWeek}/{weeklyGoal} sessions
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Goal Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {isGoalComplete ? (
            <span className="text-primary font-medium">🎉 Weekly goal complete! You did it!</span>
          ) : (
            `You have ${remaining} workout${remaining !== 1 ? 's' : ''} left to hit your weekly goal`
          )}
        </p>
      </div>
    </motion.div>
  )
}
