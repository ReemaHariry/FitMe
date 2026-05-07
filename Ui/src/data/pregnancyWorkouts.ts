/**
 * Pregnancy Workout Data
 * Trimester-specific, expert-curated workouts for prenatal wellness
 * Following ACOG guidelines for exercise during pregnancy
 */

export interface PregnancyExercise {
  name: string;
  benefit: string;
  emoji: string;
  videoUrl: string;
  sets: number;
  reps: string | number;
  restSeconds: number;
  steps: string[];
  tips: string[];
}

export interface PregnancyCategory {
  id: string;
  name: string;
  duration: number;
  description: string;
  emoji: string;
  exercises: PregnancyExercise[];
}

export interface TrimesterData {
  label: string;
  weeks: string;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  goals: string[];
  benefits: string[];
  categories: PregnancyCategory[];
  extraWarning?: string;
}

export const pregnancyWorkouts: Record<1 | 2 | 3, TrimesterData> = {
  1: {
    label: "First Trimester",
    weeks: "Weeks 1-12",
    subtitle: "Gentle beginnings — listen to your body",
    color: "#f9a8d4",
    gradientFrom: "#fce7f3",
    gradientTo: "#fdf2f8",
    goals: [
      "Maintain fitness without overexertion",
      "Reduce nausea and fatigue",
      "Keep circulation healthy",
      "Gentle core stability (no crunches)",
    ],
    benefits: [
      "💤 Reduces Fatigue",
      "🩸 Improves Circulation",
      "🧘 Reduces Nausea",
      "💪 Safe Core Work",
    ],
    categories: [
      {
        id: "morning-ease-t1",
        name: "Morning Ease",
        duration: 10,
        description: "Gentle movements to start the day with energy",
        emoji: "🌅",
        exercises: [
          {
            name: "Seated Cat-Cow Stretches",
            benefit: "Relieves back tension",
            emoji: "🌅",
            videoUrl: "https://www.youtube.com/embed/K9bK0dwBfQk",
            sets: 3,
            reps: 10,
            restSeconds: 30,
            steps: [
              "Sit on a chair with feet flat on the floor",
              "Place hands on knees",
              "Inhale and arch your back, lifting chest (cow pose)",
              "Exhale and round your spine, tucking chin (cat pose)",
              "Move slowly and smoothly between positions",
            ],
            tips: [
              "Keep movements gentle and controlled",
              "Breathe deeply with each movement",
              "Stop if you feel any discomfort",
            ],
          },
          {
            name: "Gentle Neck Rolls",
            benefit: "Reduces tension headaches",
            emoji: "🌸",
            videoUrl: "https://www.youtube.com/embed/dQqApCGd5Ss",
            sets: 2,
            reps: "5 each direction",
            restSeconds: 20,
            steps: [
              "Sit comfortably with shoulders relaxed",
              "Slowly drop chin to chest",
              "Roll head gently to the right shoulder",
              "Continue rolling back and to the left",
              "Reverse direction after 5 rolls",
            ],
            tips: [
              "Move very slowly to avoid dizziness",
              "Never force the movement",
              "Keep shoulders down and relaxed",
            ],
          },
          {
            name: "Ankle Circles",
            benefit: "Improves circulation",
            emoji: "🌿",
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            sets: 3,
            reps: "10 each direction",
            restSeconds: 20,
            steps: [
              "Sit comfortably or lie on your back",
              "Lift one foot slightly off the ground",
              "Rotate ankle in clockwise circles",
              "Complete 10 circles, then reverse direction",
              "Switch to the other foot",
            ],
            tips: [
              "Great for reducing swelling",
              "Can be done anytime, anywhere",
              "Point and flex toes for extra benefit",
            ],
          },
          {
            name: "Seated Side Stretches",
            benefit: "Opens the ribcage for better breathing",
            emoji: "💫",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            sets: 3,
            reps: "5 each side",
            restSeconds: 30,
            steps: [
              "Sit tall on a chair with feet flat",
              "Raise right arm overhead",
              "Lean gently to the left side",
              "Hold for 3-5 breaths",
              "Return to center and switch sides",
            ],
            tips: [
              "Keep both hips on the chair",
              "Don't lean forward or back",
              "Breathe deeply into the stretch",
            ],
          },
        ],
      },
      {
        id: "breathe-balance-t1",
        name: "Breathe & Balance",
        duration: 15,
        description: "Breathing exercises and gentle balance work",
        emoji: "🧘",
        exercises: [
          {
            name: "Diaphragmatic Breathing",
            benefit: "Prepares for labor breathing",
            emoji: "🧘",
            videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
            sets: 3,
            reps: "10 breaths",
            restSeconds: 30,
            steps: [
              "Sit or lie comfortably",
              "Place one hand on chest, one on belly",
              "Breathe in deeply through nose, expanding belly",
              "Exhale slowly through mouth",
              "Focus on belly rising and falling",
            ],
            tips: [
              "This is the foundation of labor breathing",
              "Practice daily for best results",
              "Helps reduce anxiety and stress",
            ],
          },
          {
            name: "Seated Pelvic Tilts",
            benefit: "Strengthens core safely",
            emoji: "🌊",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            sets: 3,
            reps: 12,
            restSeconds: 30,
            steps: [
              "Sit on edge of chair with feet flat",
              "Place hands on hips",
              "Tilt pelvis forward, arching lower back slightly",
              "Tilt pelvis back, rounding lower back",
              "Move slowly and controlled",
            ],
            tips: [
              "Safe core work for pregnancy",
              "Helps with back pain",
              "Can be done throughout pregnancy",
            ],
          },
          {
            name: "Wall Support Standing Balance",
            benefit: "Safe balance practice",
            emoji: "🌟",
            videoUrl: "https://www.youtube.com/embed/y-wV4Venusw",
            sets: 3,
            reps: "30 seconds each leg",
            restSeconds: 30,
            steps: [
              "Stand next to a wall for support",
              "Place one hand on wall",
              "Lift one foot slightly off ground",
              "Hold for 30 seconds",
              "Switch legs",
            ],
            tips: [
              "Improves stability as your center of gravity shifts",
              "Use wall for safety",
              "Progress by using less wall support",
            ],
          },
          {
            name: "Gentle Hip Circles",
            benefit: "Eases early pelvic discomfort",
            emoji: "🌺",
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            sets: 3,
            reps: "10 each direction",
            restSeconds: 30,
            steps: [
              "Stand with feet hip-width apart",
              "Place hands on hips",
              "Make slow circles with your hips",
              "Complete 10 circles clockwise",
              "Reverse direction for 10 more",
            ],
            tips: [
              "Loosens tight hip muscles",
              "Helps with pelvic discomfort",
              "Can be done while holding onto a chair",
            ],
          },
        ],
      },
      {
        id: "safe-strength-t1",
        name: "Safe Strength",
        duration: 20,
        description: "Low-impact strength to support your changing body",
        emoji: "💪",
        exercises: [
          {
            name: "Wall Push-Ups",
            benefit: "Safe upper body strength",
            emoji: "💪",
            videoUrl: "https://www.youtube.com/embed/EOf3cGIQpA4",
            sets: 3,
            reps: 10,
            restSeconds: 45,
            steps: [
              "Stand arm's length from wall",
              "Place hands on wall at shoulder height",
              "Bend elbows and lean toward wall",
              "Push back to starting position",
              "Keep core engaged",
            ],
            tips: [
              "Safer than floor push-ups during pregnancy",
              "Builds upper body strength for carrying baby",
              "Can adjust difficulty by changing distance from wall",
            ],
          },
          {
            name: "Supported Squats (with chair)",
            benefit: "Leg strength for labor",
            emoji: "🪑",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            sets: 3,
            reps: 12,
            restSeconds: 60,
            steps: [
              "Stand in front of chair, feet shoulder-width",
              "Hold chair back for support",
              "Lower down as if sitting",
              "Stop when thighs are parallel to ground",
              "Push through heels to stand",
            ],
            tips: [
              "Squats are excellent preparation for labor",
              "Chair provides safety and support",
              "Don't go too deep if uncomfortable",
            ],
          },
          {
            name: "Clamshells with Band",
            benefit: "Hip and glute support",
            emoji: "🌸",
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            sets: 3,
            reps: "15 each side",
            restSeconds: 45,
            steps: [
              "Lie on your side with knees bent",
              "Place resistance band above knees (optional)",
              "Keep feet together, lift top knee",
              "Lower with control",
              "Complete reps, then switch sides",
            ],
            tips: [
              "Strengthens hips for pregnancy posture",
              "Can be done without band",
              "Use pillows for comfort",
            ],
          },
          {
            name: "Bird-Dog",
            benefit: "Safe core stability (no crunches!)",
            emoji: "✨",
            videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
            sets: 3,
            reps: "10 each side",
            restSeconds: 45,
            steps: [
              "Start on hands and knees",
              "Extend right arm forward and left leg back",
              "Hold for 3 seconds",
              "Return to start",
              "Alternate sides",
            ],
            tips: [
              "Excellent safe core exercise",
              "No pressure on belly",
              "Improves balance and stability",
            ],
          },
        ],
      },
      {
        id: "rest-restore-t1",
        name: "Rest & Restore",
        duration: 10,
        description: "Evening wind-down for tired bodies",
        emoji: "🌙",
        exercises: [
          {
            name: "Legs Up the Wall",
            benefit: "Reduces swelling",
            emoji: "🌙",
            videoUrl: "https://www.youtube.com/embed/y-wV4Venusw",
            sets: 1,
            reps: "5-10 minutes",
            restSeconds: 0,
            steps: [
              "Lie on your back near a wall",
              "Swing legs up to rest against wall",
              "Scoot hips close to wall",
              "Arms relaxed at sides",
              "Breathe deeply and relax",
            ],
            tips: [
              "Perfect for reducing leg swelling",
              "Great before bed",
              "Use pillows under hips for comfort",
            ],
          },
          {
            name: "Child's Pose (modified)",
            benefit: "Back relief",
            emoji: "🌿",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            sets: 3,
            reps: "30 seconds",
            restSeconds: 30,
            steps: [
              "Kneel on floor with knees wide apart",
              "Sit back toward heels",
              "Extend arms forward on floor",
              "Rest forehead on floor or pillow",
              "Breathe deeply",
            ],
            tips: [
              "Widen knees to make room for belly",
              "Use pillows for support",
              "Excellent for back pain relief",
            ],
          },
          {
            name: "Butterfly Stretch",
            benefit: "Hip opener",
            emoji: "💫",
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            sets: 3,
            reps: "30 seconds",
            restSeconds: 30,
            steps: [
              "Sit on floor with soles of feet together",
              "Hold feet with hands",
              "Gently press knees toward floor",
              "Keep back straight",
              "Hold and breathe",
            ],
            tips: [
              "Opens hips for labor",
              "Don't force the stretch",
              "Sit on cushion if more comfortable",
            ],
          },
          {
            name: "Body Scan Meditation",
            benefit: "Stress relief",
            emoji: "🌸",
            videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
            sets: 1,
            reps: "5-10 minutes",
            restSeconds: 0,
            steps: [
              "Lie comfortably on your side",
              "Close your eyes",
              "Focus on each body part from toes to head",
              "Notice sensations without judgment",
              "Breathe deeply and relax",
            ],
            tips: [
              "Reduces stress and anxiety",
              "Helps with sleep",
              "Connect with your baby",
            ],
          },
        ],
      },
    ],
  },

  2: {
    label: "Second Trimester",
    weeks: "Weeks 13-27",
    subtitle: "Finding your rhythm — baby is growing!",
    color: "#fbbf24",
    gradientFrom: "#fef3c7",
    gradientTo: "#fef9e7",
    goals: [
      "Build strength for the growing belly",
      "Improve posture as center of gravity shifts",
      "Maintain cardiovascular health",
      "Strengthen pelvic floor",
    ],
    benefits: [
      "💪 Builds Strength",
      "🧘 Improves Posture",
      "❤️ Heart Health",
      "🌸 Pelvic Floor Power",
    ],
    categories: [
      {
        id: "belly-support-t2",
        name: "Belly Support Strength",
        duration: 25,
        description: "Build the muscles that support your growing bump",
        emoji: "🤰",
        exercises: [
          {
            name: "Side-Lying Leg Lifts",
            benefit: "Glute strength without belly pressure",
            emoji: "🤰",
          },
          {
            name: "Seated Resistance Band Rows",
            benefit: "Upper back posture",
            emoji: "🌟",
          },
          {
            name: "Modified Deadlifts (light/no weight)",
            benefit: "Posterior chain strength",
            emoji: "💪",
          },
          {
            name: "Supported Lunges",
            benefit: "Leg strength and balance",
            emoji: "🌸",
          },
        ],
      },
      {
        id: "prenatal-cardio-t2",
        name: "Prenatal Cardio Flow",
        duration: 20,
        description: "Heart-healthy movement safe for you and baby",
        emoji: "🚶",
        exercises: [
          {
            name: "Brisk Walking (guided pace)",
            benefit: "Best cardio for pregnancy",
            emoji: "🚶",
          },
          {
            name: "Gentle Dance Moves",
            benefit: "Fun low-impact cardio",
            emoji: "💃",
          },
          {
            name: "Marching in Place",
            benefit: "Safe cardio alternative",
            emoji: "🌊",
          },
          {
            name: "Step Touches",
            benefit: "Coordination and cardio",
            emoji: "✨",
          },
        ],
      },
      {
        id: "pelvic-floor-t2",
        name: "Pelvic Floor Power",
        duration: 15,
        description: "The most important muscles for birth and recovery",
        emoji: "🌸",
        exercises: [
          {
            name: "Kegel Exercises",
            benefit: "Pelvic floor strengthening",
            emoji: "🌸",
          },
          {
            name: "Deep Squat Hold",
            benefit: "Pelvic floor release",
            emoji: "🧘",
          },
          {
            name: "Bridge Pose",
            benefit: "Glute and pelvic floor",
            emoji: "💫",
          },
          {
            name: "Happy Baby Pose",
            benefit: "Pelvic floor stretch",
            emoji: "🌟",
          },
        ],
      },
      {
        id: "posture-perfect-t2",
        name: "Posture Perfect",
        duration: 15,
        description: "Combat pregnancy posture changes",
        emoji: "🌊",
        exercises: [
          {
            name: "Chest Openers",
            benefit: "Counter forward shoulder rounding",
            emoji: "🌊",
          },
          {
            name: "Thoracic Rotation",
            benefit: "Spine mobility",
            emoji: "💫",
          },
          {
            name: "Hip Flexor Stretch",
            benefit: "Counters belly-forward posture",
            emoji: "🌿",
          },
          {
            name: "Wall Angels",
            benefit: "Shoulder and back alignment",
            emoji: "✨",
          },
        ],
      },
    ],
  },

  3: {
    label: "Third Trimester",
    weeks: "Weeks 28-40",
    subtitle: "Preparing for the big day — gentle and powerful",
    color: "#c084fc",
    gradientFrom: "#f3e8ff",
    gradientTo: "#faf5ff",
    goals: [
      "Prepare the body for labor",
      "Manage discomfort (back pain, swelling, sleep)",
      "Build endurance for labor",
      "Practice labor positions",
    ],
    benefits: [
      "🤰 Labor Prep",
      "💆 Pain Relief",
      "💪 Build Endurance",
      "😴 Better Sleep",
    ],
    extraWarning:
      "Always consult your doctor before exercising in the third trimester. Stop immediately if you feel any pain, pressure, or shortness of breath.",
    categories: [
      {
        id: "labor-prep-t3",
        name: "Labor Prep",
        duration: 20,
        description: "Positions and exercises that prepare you for birth",
        emoji: "🤰",
        exercises: [
          {
            name: "Deep Squat Practice",
            benefit: "Opens pelvis for birth",
            emoji: "🤰",
          },
          {
            name: "Hands and Knees Rocking",
            benefit: "Optimal baby positioning",
            emoji: "🌸",
          },
          {
            name: "Hip Figure-8s",
            benefit: "Encourages baby into position",
            emoji: "💫",
          },
          {
            name: "Birthing Breath Practice",
            benefit: "Labor breathing technique",
            emoji: "🧘",
          },
        ],
      },
      {
        id: "comfort-relief-t3",
        name: "Comfort & Relief",
        duration: 15,
        description: "Gentle relief for common third-trimester discomforts",
        emoji: "🌊",
        exercises: [
          {
            name: "Cat-Cow on All Fours",
            benefit: "Back pain relief",
            emoji: "🌊",
          },
          {
            name: "Side-Lying Stretches",
            benefit: "Rib and hip relief",
            emoji: "🌿",
          },
          {
            name: "Foot and Ankle Pumps",
            benefit: "Reduce swelling",
            emoji: "💫",
          },
          {
            name: "Prenatal Massage Points",
            benefit: "Self-massage for comfort",
            emoji: "✨",
          },
        ],
      },
      {
        id: "gentle-endurance-t3",
        name: "Gentle Endurance",
        duration: 20,
        description: "Build stamina for the marathon of labor",
        emoji: "💪",
        exercises: [
          {
            name: "Walking with Purpose",
            benefit: "Endurance and baby positioning",
            emoji: "🚶",
          },
          {
            name: "Supported Wall Sit",
            benefit: "Leg endurance for labor",
            emoji: "💪",
          },
          {
            name: "Slow Controlled Breathing Circuits",
            benefit: "Mental endurance",
            emoji: "🌸",
          },
          {
            name: "Rocking Chair Movement",
            benefit: "Comfort and positioning",
            emoji: "🌟",
          },
        ],
      },
      {
        id: "sleep-better-t3",
        name: "Sleep Better Tonight",
        duration: 15,
        description: "Wind down and prepare for restful sleep",
        emoji: "🌙",
        exercises: [
          {
            name: "Pillow Support Setup",
            benefit: "Safe sleeping positions",
            emoji: "🌙",
          },
          {
            name: "Gentle Full-Body Stretch",
            benefit: "Reduce overnight discomfort",
            emoji: "🌿",
          },
          {
            name: "Progressive Muscle Relaxation",
            benefit: "Stress and tension release",
            emoji: "💫",
          },
          {
            name: "Gratitude Body Scan",
            benefit: "Mindful connection with baby",
            emoji: "🌸",
          },
        ],
      },
    ],
  },
};
