import { motion } from 'framer-motion'
import { Play, Clock, Target, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    duration: number
    exercises: number
    difficulty: string
    image?: string
  }
  featured?: boolean
}

export default function WorkoutCard({ workout, featured = false }: WorkoutCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl ${
        featured ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-gray-50 dark:bg-gray-700'
      }`}
    >
      {/* Background Image */}
      {workout.image && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={workout.image}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              featured ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {workout.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{workout.duration}min</span>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                <span>{workout.exercises} exercises</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{workout.difficulty}</span>
              </div>
            </div>
          </div>
          
          {featured && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1">
              <span className="text-sm font-medium">Recommended</span>
            </div>
          )}
        </div>

        <Button
          className={`w-full ${
            featured 
              ? 'bg-white text-primary hover:bg-gray-100' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </div>
    </motion.div>
  )
}