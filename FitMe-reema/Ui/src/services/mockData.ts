// Mock data service for UI-only frontend

export const mockUserData = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  profile: {
    gender: 'male',
    age: 30,
    height: 180,
    weight: 75,
    fitnessGoal: 'build_muscle',
    experienceLevel: 'intermediate',
    trainingDaysPerWeek: 4,
    preferredWorkoutDuration: 60
  }
}

export const mockWorkouts = [
  {
    id: '1',
    name: 'Upper Body Strength',
    duration: 45,
    difficulty: 'intermediate',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 12 },
      { name: 'Shoulder Press', sets: 3, reps: 10 },
      { name: 'Tricep Dips', sets: 3, reps: 15 }
    ]
  },
  {
    id: '2',
    name: 'Lower Body Power',
    duration: 50,
    difficulty: 'advanced',
    muscleGroups: ['legs', 'glutes'],
    exercises: [
      { name: 'Squats', sets: 4, reps: 15 },
      { name: 'Lunges', sets: 3, reps: 12 },
      { name: 'Deadlifts', sets: 4, reps: 10 }
    ]
  }
]

export const mockWorkoutHistory = [
  {
    id: '1',
    date: '2024-01-15',
    workoutName: 'Upper Body Strength',
    duration: 45,
    caloriesBurned: 320,
    aiScore: 85
  },
  {
    id: '2',
    date: '2024-01-13',
    workoutName: 'Cardio Blast',
    duration: 30,
    caloriesBurned: 280,
    aiScore: 78
  }
]

export const mockPerformanceData = {
  weeklyActivity: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 30 },
    { day: 'Fri', minutes: 45 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 0 }
  ],
  progressOverTime: [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 85 }
  ]
}
