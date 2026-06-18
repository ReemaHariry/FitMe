import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

interface MotivationCardProps {
  className?: string
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

export default function MotivationCard({ className = '' }: MotivationCardProps) {
  // Get quote based on day of month
  const dayOfMonth = new Date().getDate()
  const quote = QUOTES[dayOfMonth % QUOTES.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group ${className}`}
    >
      {/* Massive subtle background quote icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/5 dark:text-primary/10 transition-transform duration-700 group-hover:scale-110 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21L16.417 14.281C14.017 13.916 12.217 11.95 12.217 9.539V3H21.217V9.539C21.217 14.869 17.517 19.897 14.017 21ZM5.01697 21L7.41697 14.281C5.01697 13.916 3.21697 11.95 3.21697 9.539V3H12.217V9.539C12.217 14.869 8.51697 19.897 5.01697 21Z" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <p className="text-gray-800 dark:text-gray-100 italic text-xl md:text-2xl font-light tracking-wide leading-relaxed mb-6">
          "{quote.text}"
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-primary/40 rounded-full"></div>
          <p className="text-primary font-semibold text-sm tracking-[0.2em] uppercase">
            {quote.author}
          </p>
          <div className="h-px w-12 bg-primary/40 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  )
}
