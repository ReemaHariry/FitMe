/**
 * Static Workout Data
 * Expanded dataset — simplified titles, smart alternatives
 */

import { Workout, InjurySafeExercise } from "../types/workout.types";

// ── Shared safe exercises reused across workouts ───────────
const SAFE: Record<string, InjurySafeExercise> = {
  wallSit: {
    id: "safe-wall-sit", name: "Wall Sit",
    sets: 3, reps: "30 seconds", restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/y-wV4Venusw",
    steps: ["Back flat against wall","Slide to 90-degree angle","Hold without moving","Breathe steadily"],
    tips: ["Isometric — no knee movement","Increase hold time gradually"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "knee_injury",
  },
  gluteBridge: {
    id: "safe-glute-bridge", name: "Glute Bridge",
    sets: 3, reps: 15, restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
    steps: ["Lie on back, knees bent","Lift hips until body is straight","Squeeze glutes at top","Lower with control"],
    tips: ["Zero knee stress","Focus on hip extension"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "knee_injury",
  },
  birdDog: {
    id: "safe-bird-dog", name: "Bird Dog",
    sets: 3, reps: "10 per side", restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
    steps: ["On hands and knees","Extend opposite arm and leg","Hold 3 seconds","Switch sides"],
    tips: ["No spinal compression","Builds back stability"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "back_injury",
  },
  deadBug: {
    id: "safe-dead-bug", name: "Dead Bug",
    sets: 3, reps: "10 per side", restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/g_BYB0R-4Ws",
    steps: ["Lie on back","Arms and knees at 90 degrees","Extend opposite arm and leg","Return and switch"],
    tips: ["Lower back pressed to floor","Safe core exercise"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "back_injury",
  },
  inclinePushup: {
    id: "safe-incline-pushup", name: "Incline Push-ups",
    sets: 3, reps: 10, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/4dF1DOWzf20",
    steps: ["Hands on elevated surface","Lower chest to surface","Push back up"],
    tips: ["Reduces shoulder load","Effective chest exercise"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "shoulder_injury",
  },
  bandPullApart: {
    id: "safe-band-pull-apart", name: "Resistance Band Pull-Apart",
    sets: 3, reps: 15, restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
    steps: ["Hold band at chest height","Pull band apart to sides","Return with control"],
    tips: ["Light resistance only","Great for shoulder health"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "shoulder_injury",
  },
  seatedCableRow: {
    id: "safe-seated-cable-row", name: "Seated Cable Rows",
    sets: 3, reps: 12, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/GZbfZ033f74",
    steps: ["Sit at cable machine","Pull handle to torso","Squeeze shoulder blades","Return with control"],
    tips: ["Supported seat protects back","Avoid jerking"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "back_injury",
  },
  // ── Pregnancy safe ──
  pregnancySquat: {
    id: "safe-preg-squat", name: "Supported Squat",
    sets: 3, reps: 12, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
    steps: ["Hold chair or wall for support","Feet wider than shoulder-width","Lower slowly","Rise with control"],
    tips: ["Never hold breath","Stop if uncomfortable","Widen stance as belly grows"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "pregnant",
  },
  pregnancyRow: {
    id: "safe-preg-row", name: "Seated Band Rows",
    sets: 3, reps: 12, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
    steps: ["Sit on chair","Band around feet","Pull to ribcage","Squeeze shoulder blades"],
    tips: ["Seated position is safer","Light resistance"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "pregnant",
  },
  pregnancyPushup: {
    id: "safe-preg-pushup", name: "Wall Push-ups",
    sets: 3, reps: 12, restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/EOf3cGIQpA4",
    steps: ["Stand arm's length from wall","Hands at shoulder height","Lean in and push back"],
    tips: ["No lying on stomach","Safe throughout pregnancy"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "pregnant",
  },
  pregnancyPlank: {
    id: "safe-preg-plank", name: "Standing Wall Plank",
    sets: 3, reps: "20 seconds", restSeconds: 45,
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    steps: ["Hands on wall at shoulder height","Walk feet back","Hold straight body position"],
    tips: ["Avoids lying flat","Safe core engagement"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "pregnant",
  },
  // ── Rehab ──
  rehabSquat: {
    id: "safe-rehab-squat", name: "Partial Range Squat",
    sets: 3, reps: 10, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
    steps: ["Feet shoulder-width","Lower only 30-45 degrees","Hold 2 seconds","Rise slowly"],
    tips: ["Pain-free range only","Use chair for support if needed"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "rehab",
  },
  rehabRow: {
    id: "safe-rehab-row", name: "Light Band Rows",
    sets: 3, reps: 15, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
    steps: ["Seated, light band","Pull gently to ribcage","Slow controlled movement"],
    tips: ["Very light resistance","Focus on movement pattern"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "rehab",
  },
  rehabPushup: {
    id: "safe-rehab-pushup", name: "Wall Push-ups",
    sets: 3, reps: 10, restSeconds: 60,
    videoUrl: "https://www.youtube.com/embed/EOf3cGIQpA4",
    steps: ["Hands on wall","Gentle push movement","No strain"],
    tips: ["Rehab-level intensity","Stop if pain occurs"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "rehab",
  },
  // ── Kids ──
  kidsSquat: {
    id: "safe-kids-squat", name: "Fun Squat Jumps",
    sets: 3, reps: 10, restSeconds: 30,
    videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
    steps: ["Feet shoulder-width","Squat down like sitting","Jump up with arms raised","Land softly"],
    tips: ["Make it fun!","Land with soft knees"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "child",
  },
  kidsPushup: {
    id: "safe-kids-pushup", name: "Knee Push-ups",
    sets: 3, reps: 8, restSeconds: 30,
    videoUrl: "https://www.youtube.com/embed/jWxvty2KROs",
    steps: ["On hands and knees","Lower chest to floor","Push back up"],
    tips: ["Great for building strength","Keep it fun"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "child",
  },
  kidsPlank: {
    id: "safe-kids-plank", name: "Bear Hold",
    sets: 3, reps: "15 seconds", restSeconds: 30,
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    steps: ["On hands and knees","Lift knees 2 inches off floor","Hold like a bear"],
    tips: ["Fun animal movement","Builds core strength"],
    isInjurySafe: true, noLevels: true,
    replacementReason: "child",
  },
};

export const WORKOUTS: Workout[] = [


  // ─────────────────────────────────────────
  // UPPER BODY — BEGINNER
  // ─────────────────────────────────────────
  {
    id: "upper-1",
    title: "Upper Body",
    type: "upper",
    targets: ["chest", "arms", "shoulders"],
    difficulty: "beginner",
    durationMinutes: 25,
    exercises: [
      {
        id: "ub1-pushup",
        name: "Push-ups",
        sets: 3, reps: 8, restSeconds: 60,
        muscles: ["chest", "triceps", "shoulders"],
        contraindications: ["shoulder_injury", "pregnant", "rehab"],
        alternatives: {
          shoulder_injury: { ...SAFE.inclinePushup, id: "ub1-pushup-alt-shoulder" },
          pregnant:        { ...SAFE.pregnancyPushup, id: "ub1-pushup-alt-preg" },
          rehab:           { ...SAFE.rehabPushup, id: "ub1-pushup-alt-rehab" },
          child:           { ...SAFE.kidsPushup, id: "ub1-pushup-alt-kids" },
        },
        levels: {
          beginner: {
            label: "Wall Push-ups",
            videoUrl: "https://www.youtube.com/embed/EOf3cGIQpA4",
            steps: ["Stand arm's length from wall","Place hands at shoulder height","Bend elbows and lean in","Push back to start"],
            tips: ["Keep core tight","Move slowly"]
          },
          intermediate: {
            label: "Knee Push-ups",
            videoUrl: "https://www.youtube.com/embed/jWxvty2KROs",
            steps: ["Start on hands and knees","Lower chest to ground","Push back up"],
            tips: ["Keep hips aligned","Full range of motion"]
          },
          advanced: {
            label: "Standard Push-ups",
            videoUrl: "https://www.youtube.com/embed/zfA8sF2_QM8",
            steps: ["Plank position","Lower chest to floor","Push back up"],
            tips: ["Straight line head to heels","Engage glutes"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "ub1-pushup-alt",
            name: "Incline Push-ups",
            sets: 3, reps: 10, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/4dF1DOWzf20",
            steps: ["Hands on elevated surface","Walk feet back to plank","Lower chest to surface","Push back up"],
            tips: ["Higher surface = less shoulder stress","Keep core tight"],
            isInjurySafe: true,
            replacesExercise: "Push-ups"
          }
        }
      },
      {
        id: "ub1-row",
        name: "Resistance Band Rows",
        sets: 3, reps: 12, restSeconds: 60,
        levels: {
          beginner: {
            label: "Seated Band Rows",
            videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
            steps: ["Sit, band under feet","Pull band to ribcage","Squeeze shoulder blades"],
            tips: ["Keep back neutral"]
          },
          intermediate: {
            label: "Dumbbell Rows",
            videoUrl: "https://www.youtube.com/embed/roCP6wCXPqo",
            steps: ["Hinge forward","Pull weight to hip","Lower with control"],
            tips: ["Lead with elbow"]
          },
          advanced: {
            label: "Barbell Rows",
            videoUrl: "https://www.youtube.com/embed/FWJR5Ve8bnQ",
            steps: ["Overhand grip","Pull bar to lower chest"],
            tips: ["Core braced throughout"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "ub1-row-alt",
            name: "Seated Cable Rows",
            sets: 3, reps: 12, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/GZbfZ033f74",
            steps: ["Sit at cable machine","Pull handle to torso","Squeeze shoulder blades","Return with control"],
            tips: ["Supported seat protects back","Avoid jerking"],
            isInjurySafe: true,
            replacesExercise: "Resistance Band Rows"
          }
        }
      },
      {
        id: "ub1-shoulder-press",
        name: "Shoulder Press",
        sets: 3, reps: 10, restSeconds: 60,
        muscles: ["shoulders", "triceps"],
        contraindications: ["shoulder_injury", "pregnant", "rehab"],
        alternatives: {
          shoulder_injury: { ...SAFE.bandPullApart, id: "ub1-press-alt-shoulder" },
          pregnant:        { ...SAFE.pregnancyRow, id: "ub1-press-alt-preg" },
          rehab:           { ...SAFE.bandPullApart, id: "ub1-press-alt-rehab" },
        },
        levels: {
          beginner: {
            label: "Seated Dumbbell Press",
            videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
            steps: ["Sit with back support","Dumbbells at shoulder height","Press overhead","Lower with control"],
            tips: ["Don't arch back"]
          },
          intermediate: {
            label: "Standing Dumbbell Press",
            videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
            steps: ["Stand feet shoulder-width","Press dumbbells overhead"],
            tips: ["Engage glutes for stability"]
          },
          advanced: {
            label: "Barbell Overhead Press",
            videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
            steps: ["Bar at collarbone","Press straight up","Lock out at top"],
            tips: ["Vertical bar path"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "ub1-press-alt",
            name: "Resistance Band Pull-Apart",
            sets: 3, reps: 15, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
            steps: ["Hold band at chest height","Arms extended forward","Pull band apart to sides","Return to center"],
            tips: ["Light resistance only","Stop if any pain","Great for shoulder health"],
            isInjurySafe: true,
            replacesExercise: "Shoulder Press"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // UPPER BODY — INTERMEDIATE
  // ─────────────────────────────────────────
  {
    id: "upper-2",
    title: "Upper Body",
    type: "upper",
    targets: ["chest", "back", "shoulders", "arms"],
    difficulty: "intermediate",
    durationMinutes: 35,
    exercises: [
      {
        id: "ub2-bench",
        name: "Bench Press",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Dumbbell Floor Press",
            videoUrl: "https://www.youtube.com/embed/uUGDRwge4F8",
            steps: ["Lie on floor","Hold dumbbells above chest","Lower until elbows touch floor","Press back up"],
            tips: ["Limited range protects shoulders"]
          },
          intermediate: {
            label: "Dumbbell Bench Press",
            videoUrl: "https://www.youtube.com/embed/VmB1G1K7v94",
            steps: ["Lie on bench","Press dumbbells from chest","Lower with control"],
            tips: ["Retract shoulder blades"]
          },
          advanced: {
            label: "Barbell Bench Press",
            videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
            steps: ["Grip wider than shoulders","Lower to mid-chest","Press explosively"],
            tips: ["Slight upper back arch"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "ub2-bench-alt",
            name: "Neutral Grip Dumbbell Press",
            sets: 4, reps: 10, restSeconds: 75,
            videoUrl: "https://www.youtube.com/embed/VmB1G1K7v94",
            steps: ["Lie on bench","Palms facing each other","Press up smoothly","Lower with control"],
            tips: ["Neutral grip reduces shoulder stress","Keep elbows closer to body"],
            isInjurySafe: true,
            replacesExercise: "Bench Press"
          }
        }
      },
      {
        id: "ub2-pullup",
        name: "Pull-ups",
        sets: 4, reps: 6, restSeconds: 90,
        levels: {
          beginner: {
            label: "Assisted Pull-ups",
            videoUrl: "https://www.youtube.com/embed/fLb7Xb7XJvI",
            steps: ["Use resistance band","Grip bar shoulder-width","Pull chin over bar"],
            tips: ["Focus on back engagement"]
          },
          intermediate: {
            label: "Negative Pull-ups",
            videoUrl: "https://www.youtube.com/embed/gnZDguCKaFY",
            steps: ["Jump to top","Lower slowly over 5 seconds"],
            tips: ["Control the descent"]
          },
          advanced: {
            label: "Full Pull-ups",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Dead hang start","Pull chin over bar","Lower fully"],
            tips: ["No kipping"]
          }
        }
      },
      {
        id: "ub2-dips",
        name: "Dips",
        sets: 3, reps: 10, restSeconds: 75,
        levels: {
          beginner: {
            label: "Bench Dips",
            videoUrl: "https://www.youtube.com/embed/0326dy_-CzM",
            steps: ["Hands on bench behind","Lower by bending elbows","Push back up"],
            tips: ["Elbows close to body"]
          },
          intermediate: {
            label: "Assisted Bar Dips",
            videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
            steps: ["Parallel bars","Lower to 90 degrees","Press up"],
            tips: ["Lean forward for chest"]
          },
          advanced: {
            label: "Weighted Dips",
            videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
            steps: ["Add weight belt","Full range dips"],
            tips: ["Progressive overload"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "ub2-dips-alt",
            name: "Close-Grip Push-ups",
            sets: 3, reps: 12, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
            steps: ["Plank position","Hands shoulder-width","Lower chest to floor","Push back up"],
            tips: ["Easier on shoulders than dips","Targets triceps well"],
            isInjurySafe: true,
            replacesExercise: "Dips"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // UPPER BODY — ADVANCED
  // ─────────────────────────────────────────
  {
    id: "upper-3",
    title: "Upper Body",
    type: "upper",
    targets: ["back", "shoulders", "arms"],
    difficulty: "advanced",
    durationMinutes: 50,
    exercises: [
      {
        id: "ub3-weighted-pullup",
        name: "Weighted Pull-ups",
        sets: 5, reps: 5, restSeconds: 120,
        levels: {
          beginner: {
            label: "Band-Assisted Pull-ups",
            videoUrl: "https://www.youtube.com/embed/fLb7Xb7XJvI",
            steps: ["Band for assistance","Full range of motion"],
            tips: ["Build strength gradually"]
          },
          intermediate: {
            label: "Bodyweight Pull-ups",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Strict form","Chin over bar"],
            tips: ["Control the movement"]
          },
          advanced: {
            label: "Weighted Pull-ups",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Add weight belt","Maintain strict form"],
            tips: ["Progressive overload"]
          }
        }
      },
      {
        id: "ub3-military-press",
        name: "Military Press",
        sets: 4, reps: 6, restSeconds: 90,
        levels: {
          beginner: {
            label: "Seated Dumbbell Press",
            videoUrl: "https://www.youtube.com/embed/qEwKCR5JCog",
            steps: ["Seated press with dumbbells"],
            tips: ["Focus on form"]
          },
          intermediate: {
            label: "Standing Barbell Press",
            videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
            steps: ["Press barbell overhead from shoulders"],
            tips: ["Engage core"]
          },
          advanced: {
            label: "Heavy Military Press",
            videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
            steps: ["Heavy barbell","Strict no leg drive"],
            tips: ["Vertical bar path"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "ub3-military-alt",
            name: "Face Pulls",
            sets: 4, reps: 15, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/rep-qVOkqgk",
            steps: ["Attach rope to cable at face height","Pull rope towards face","Separate hands at end","Return with control"],
            tips: ["Excellent for shoulder health","Light weight high reps","Focus on rear delts"],
            isInjurySafe: true,
            replacesExercise: "Military Press"
          }
        }
      },
      {
        id: "ub3-barbell-row",
        name: "Barbell Rows",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Dumbbell Rows",
            videoUrl: "https://www.youtube.com/embed/roCP6wCXPqo",
            steps: ["Single arm rows"],
            tips: ["Focus on back squeeze"]
          },
          intermediate: {
            label: "Barbell Rows",
            videoUrl: "https://www.youtube.com/embed/FWJR5Ve8bnQ",
            steps: ["Pull bar to lower chest"],
            tips: ["Keep back flat"]
          },
          advanced: {
            label: "Heavy Barbell Rows",
            videoUrl: "https://www.youtube.com/embed/FWJR5Ve8bnQ",
            steps: ["Heavy weight strict form"],
            tips: ["Explosive pull, controlled lower"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "ub3-row-alt",
            name: "Seated Cable Rows",
            sets: 4, reps: 12, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/GZbfZ033f74",
            steps: ["Sit at cable row machine","Pull handle to torso","Squeeze shoulder blades","Return with control"],
            tips: ["Supported position protects back","Avoid jerking motion"],
            isInjurySafe: true,
            replacesExercise: "Barbell Rows"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // LOWER BODY — BEGINNER
  // ─────────────────────────────────────────
  {
    id: "lower-1",
    title: "Lower Body",
    type: "lower",
    targets: ["legs", "core"],
    difficulty: "beginner",
    durationMinutes: 30,
    exercises: [
      {
        id: "lb1-squat",
        name: "Squats",
        sets: 3, reps: 12, restSeconds: 60,
        muscles: ["quads", "glutes", "hamstrings"],
        contraindications: ["knee_injury", "rehab"],
        alternatives: {
          knee_injury: { ...SAFE.wallSit, id: "lb1-squat-alt-knee" },
          pregnant:    { ...SAFE.pregnancySquat, id: "lb1-squat-alt-preg" },
          rehab:       { ...SAFE.rehabSquat, id: "lb1-squat-alt-rehab" },
          child:       { ...SAFE.kidsSquat, id: "lb1-squat-alt-kids" },
        },
        levels: {
          beginner: {
            label: "Bodyweight Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Feet shoulder-width","Lower hips back and down","Keep chest up","Stand back up"],
            tips: ["Knees track over toes","Weight in heels"]
          },
          intermediate: {
            label: "Goblet Squats",
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            steps: ["Hold dumbbell at chest","Squat deep","Drive through heels"],
            tips: ["Elbows inside knees"]
          },
          advanced: {
            label: "Barbell Back Squats",
            videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
            steps: ["Bar on upper back","Squat to parallel","Drive up explosively"],
            tips: ["Brace core hard"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "lb1-squat-alt",
            name: "Wall Sit",
            sets: 3, reps: "30 seconds", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/y-wV4Venusw",
            steps: ["Back flat against wall","Slide down to 90-degree angle","Hold position without moving","Breathe steadily"],
            tips: ["Isometric — no knee movement","Builds quad strength safely","Increase hold time gradually"],
            isInjurySafe: true,
            replacesExercise: "Squats"
          }
        }
      },
      {
        id: "lb1-lunge",
        name: "Lunges",
        sets: 3, reps: "10 per leg", restSeconds: 60,
        muscles: ["quads", "glutes"],
        contraindications: ["knee_injury", "pregnant"],
        alternatives: {
          knee_injury: { ...SAFE.gluteBridge, id: "lb1-lunge-alt-knee" },
          pregnant:    { ...SAFE.pregnancySquat, id: "lb1-lunge-alt-preg" },
          rehab:       { ...SAFE.gluteBridge, id: "lb1-lunge-alt-rehab" },
        },
        levels: {
          beginner: {
            label: "Static Lunges",
            videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
            steps: ["Step one foot forward","Lower back knee toward ground","Push through front heel"],
            tips: ["Front knee over ankle"]
          },
          intermediate: {
            label: "Walking Lunges",
            videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
            steps: ["Step forward into lunge","Bring back leg forward","Continue walking"],
            tips: ["Smooth transitions"]
          },
          advanced: {
            label: "Weighted Walking Lunges",
            videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
            steps: ["Hold dumbbells at sides","Walking lunges"],
            tips: ["Keep chest up"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "lb1-lunge-alt",
            name: "Glute Bridge",
            sets: 3, reps: 15, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            steps: ["Lie on back, knees bent","Lift hips until body is straight","Squeeze glutes at top","Lower with control"],
            tips: ["Zero knee stress","Excellent glute activation","Focus on hip extension"],
            isInjurySafe: true,
            replacesExercise: "Lunges"
          }
        }
      },
      {
        id: "lb1-rdl",
        name: "Romanian Deadlifts",
        sets: 3, reps: 10, restSeconds: 75,
        muscles: ["hamstrings", "glutes", "back"],
        contraindications: ["back_injury", "pregnant", "rehab"],
        alternatives: {
          back_injury: { ...SAFE.birdDog, id: "lb1-rdl-alt-back" },
          pregnant:    { ...SAFE.gluteBridge, id: "lb1-rdl-alt-preg" },
          rehab:       { ...SAFE.birdDog, id: "lb1-rdl-alt-rehab" },
        },
        levels: {
          beginner: {
            label: "Bodyweight Hip Hinge",
            videoUrl: "https://www.youtube.com/embed/1uDiW5--rAE",
            steps: ["Stand, slight knee bend","Hinge at hips, push butt back","Lower torso to parallel","Return to standing"],
            tips: ["Learn the hinge pattern"]
          },
          intermediate: {
            label: "Dumbbell RDL",
            videoUrl: "https://www.youtube.com/embed/2SHsk9AzdjA",
            steps: ["Hold dumbbells in front","Hinge at hips","Feel hamstring stretch"],
            tips: ["Weights stay close to legs"]
          },
          advanced: {
            label: "Barbell RDL",
            videoUrl: "https://www.youtube.com/embed/2SHsk9AzdjA",
            steps: ["Hold barbell","Lower to mid-shin","Drive hips forward"],
            tips: ["Squeeze glutes at top"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "lb1-rdl-alt",
            name: "Bird Dog",
            sets: 3, reps: "10 per side", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
            steps: ["Start on hands and knees","Extend opposite arm and leg","Hold 3 seconds","Return and switch sides"],
            tips: ["No spinal compression","Builds back stability","Move slowly and controlled"],
            isInjurySafe: true,
            replacesExercise: "Romanian Deadlifts"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // LOWER BODY — INTERMEDIATE
  // ─────────────────────────────────────────
  {
    id: "lower-2",
    title: "Lower Body",
    type: "lower",
    targets: ["legs", "core"],
    difficulty: "intermediate",
    durationMinutes: 40,
    exercises: [
      {
        id: "lb2-front-squat",
        name: "Front Squats",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Goblet Squat",
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            steps: ["Hold weight at chest","Squat deep","Stand up"],
            tips: ["Upright torso"]
          },
          intermediate: {
            label: "Double Dumbbell Front Squat",
            videoUrl: "https://www.youtube.com/embed/3ZLkfDBuTWI",
            steps: ["Dumbbells on shoulders","Squat to parallel","Drive up"],
            tips: ["Builds toward barbell version"]
          },
          advanced: {
            label: "Barbell Front Squat",
            videoUrl: "https://www.youtube.com/embed/uYumuL_G_V0",
            steps: ["Bar on front of shoulders","Elbows high","Squat deep"],
            tips: ["More quad emphasis"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "lb2-front-squat-alt",
            name: "Supported Wall Squat",
            sets: 4, reps: "40 seconds", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/y-wV4Venusw",
            steps: ["Back against wall","Feet slightly forward","Slide to comfortable angle","Hold position"],
            tips: ["Adjust depth to comfort level","No dynamic knee movement","Great quad strengthener"],
            isInjurySafe: true,
            replacesExercise: "Front Squats"
          }
        }
      },
      {
        id: "lb2-bulgarian",
        name: "Bulgarian Split Squats",
        sets: 3, reps: "10 per leg", restSeconds: 75,
        levels: {
          beginner: {
            label: "Bodyweight Split Squat",
            videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
            steps: ["Back foot on bench","Lower back knee toward ground","Push through front heel"],
            tips: ["Focus on balance first"]
          },
          intermediate: {
            label: "Dumbbell Bulgarian Split Squat",
            videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
            steps: ["Hold dumbbells at sides","Perform split squat"],
            tips: ["Challenging single-leg exercise"]
          },
          advanced: {
            label: "Barbell Bulgarian Split Squat",
            videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE",
            steps: ["Bar on back","Deep split squat"],
            tips: ["Advanced strength builder"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "lb2-bulgarian-alt",
            name: "Step-ups (Low Step)",
            sets: 3, reps: "12 per leg", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/dQqApCGd5Ss",
            steps: ["Use a low step or platform","Step up slowly","Control the descent","Alternate legs"],
            tips: ["Minimal knee stress","Progress by increasing step height","Keep torso upright"],
            isInjurySafe: true,
            replacesExercise: "Bulgarian Split Squats"
          }
        }
      },
      {
        id: "lb2-leg-curl",
        name: "Leg Curls",
        sets: 3, reps: 12, restSeconds: 60,
        levels: {
          beginner: {
            label: "Stability Ball Leg Curl",
            videoUrl: "https://www.youtube.com/embed/5ZJmWeRJnRs",
            steps: ["Lie on back, heels on ball","Lift hips","Curl ball toward you"],
            tips: ["Engages hamstrings and core"]
          },
          intermediate: {
            label: "Single-Leg Ball Curl",
            videoUrl: "https://www.youtube.com/embed/5ZJmWeRJnRs",
            steps: ["One leg on ball","Perform curl"],
            tips: ["Harder variation"]
          },
          advanced: {
            label: "Machine Leg Curl",
            videoUrl: "https://www.youtube.com/embed/ELOCsoDSmrg",
            steps: ["Use leg curl machine","Full range of motion"],
            tips: ["Isolated hamstring work"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // LOWER BODY — ADVANCED
  // ─────────────────────────────────────────
  {
    id: "lower-3",
    title: "Lower Body",
    type: "lower",
    targets: ["legs", "core"],
    difficulty: "advanced",
    durationMinutes: 55,
    exercises: [
      {
        id: "lb3-barbell-squat",
        name: "Barbell Back Squats",
        sets: 5, reps: 5, restSeconds: 120,
        levels: {
          beginner: {
            label: "Goblet Squat",
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            steps: ["Hold weight at chest","Squat deep"],
            tips: ["Master form first"]
          },
          intermediate: {
            label: "Low-Bar Squat",
            videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
            steps: ["Bar on upper back","Squat to parallel"],
            tips: ["Brace core"]
          },
          advanced: {
            label: "Heavy Barbell Squat",
            videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
            steps: ["Heavy load","Below parallel","Explosive drive"],
            tips: ["Belt recommended at heavy weights"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "lb3-squat-alt",
            name: "Leg Press (Partial Range)",
            sets: 5, reps: 8, restSeconds: 90,
            videoUrl: "https://www.youtube.com/embed/IZxyjW7MPJQ",
            steps: ["Sit in leg press machine","Place feet high on platform","Press to partial extension","Lower slowly"],
            tips: ["High foot placement reduces knee stress","Partial range is safer","Control the weight"],
            isInjurySafe: true,
            replacesExercise: "Barbell Back Squats"
          }
        }
      },
      {
        id: "lb3-deadlift",
        name: "Conventional Deadlift",
        sets: 4, reps: 6, restSeconds: 120,
        levels: {
          beginner: {
            label: "Trap Bar Deadlift",
            videoUrl: "https://www.youtube.com/embed/1uDiW5--rAE",
            steps: ["Stand inside trap bar","Hinge and grip handles","Drive through floor"],
            tips: ["Easier on lower back"]
          },
          intermediate: {
            label: "Romanian Deadlift",
            videoUrl: "https://www.youtube.com/embed/2SHsk9AzdjA",
            steps: ["Hinge at hips","Lower bar to shins"],
            tips: ["Feel hamstring stretch"]
          },
          advanced: {
            label: "Conventional Deadlift",
            videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
            steps: ["Bar over mid-foot","Hinge and grip","Drive floor away","Lock out hips"],
            tips: ["Keep bar close to body"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "lb3-deadlift-alt",
            name: "Dead Bug",
            sets: 4, reps: "10 per side", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/g_BYB0R-4Ws",
            steps: ["Lie on back","Arms and knees at 90 degrees","Extend opposite arm and leg","Return and switch"],
            tips: ["Lower back pressed to floor","No spinal compression","Builds deep core stability"],
            isInjurySafe: true,
            replacesExercise: "Conventional Deadlift"
          }
        }
      },
      {
        id: "lb3-hip-thrust",
        name: "Barbell Hip Thrusts",
        sets: 4, reps: 10, restSeconds: 75,
        levels: {
          beginner: {
            label: "Bodyweight Hip Thrust",
            videoUrl: "https://www.youtube.com/embed/xDmFkJxPzeM",
            steps: ["Shoulders on bench","Drive hips up","Squeeze glutes at top"],
            tips: ["Learn the movement pattern"]
          },
          intermediate: {
            label: "Dumbbell Hip Thrust",
            videoUrl: "https://www.youtube.com/embed/xDmFkJxPzeM",
            steps: ["Dumbbell on hips","Full hip extension"],
            tips: ["Controlled movement"]
          },
          advanced: {
            label: "Barbell Hip Thrust",
            videoUrl: "https://www.youtube.com/embed/xDmFkJxPzeM",
            steps: ["Barbell across hips","Drive explosively","Full lockout"],
            tips: ["Best glute exercise"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // FULL BODY — BEGINNER
  // ─────────────────────────────────────────
  {
    id: "full-1",
    title: "Full Body",
    type: "full",
    targets: ["full-body", "core"],
    difficulty: "beginner",
    durationMinutes: 30,
    exercises: [
      {
        id: "fb1-squat",
        name: "Bodyweight Squats",
        sets: 3, reps: 12, restSeconds: 45,
        muscles: ["quads", "glutes"],
        contraindications: ["knee_injury", "rehab"],
        alternatives: {
          knee_injury: { ...SAFE.wallSit, id: "fb1-squat-alt-knee" },
          pregnant:    { ...SAFE.pregnancySquat, id: "fb1-squat-alt-preg" },
          rehab:       { ...SAFE.rehabSquat, id: "fb1-squat-alt-rehab" },
          child:       { ...SAFE.kidsSquat, id: "fb1-squat-alt-kids" },
        },
        levels: {
          beginner: {
            label: "Bodyweight Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Feet shoulder-width","Lower hips back","Keep chest up","Stand back up"],
            tips: ["Knees track over toes"]
          },
          intermediate: {
            label: "Goblet Squats",
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            steps: ["Hold weight at chest","Squat deep"],
            tips: ["Upright torso"]
          },
          advanced: {
            label: "Jump Squats",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Squat down","Explode upward","Land softly"],
            tips: ["Absorb landing with bent knees"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "fb1-squat-alt",
            name: "Seated Leg Extensions",
            sets: 3, reps: 15, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/YyvSfVjQeL0",
            steps: ["Sit in chair","Extend one leg straight","Hold 2 seconds","Lower slowly"],
            tips: ["Minimal knee stress","Builds quad strength","Alternate legs"],
            isInjurySafe: true,
            replacesExercise: "Bodyweight Squats"
          }
        }
      },
      {
        id: "fb1-pushup",
        name: "Push-ups",
        sets: 3, reps: 8, restSeconds: 45,
        muscles: ["chest", "triceps", "shoulders"],
        contraindications: ["shoulder_injury", "pregnant", "rehab"],
        alternatives: {
          shoulder_injury: { ...SAFE.inclinePushup, id: "fb1-pushup-alt-shoulder" },
          pregnant:        { ...SAFE.pregnancyPushup, id: "fb1-pushup-alt-preg" },
          rehab:           { ...SAFE.rehabPushup, id: "fb1-pushup-alt-rehab" },
          child:           { ...SAFE.kidsPushup, id: "fb1-pushup-alt-kids" },
        },
        levels: {
          beginner: {
            label: "Knee Push-ups",
            videoUrl: "https://www.youtube.com/embed/jWxvty2KROs",
            steps: ["On hands and knees","Lower chest to ground","Push back up"],
            tips: ["Keep hips aligned"]
          },
          intermediate: {
            label: "Standard Push-ups",
            videoUrl: "https://www.youtube.com/embed/zfA8sF2_QM8",
            steps: ["Plank position","Lower chest","Push up"],
            tips: ["Straight body line"]
          },
          advanced: {
            label: "Diamond Push-ups",
            videoUrl: "https://www.youtube.com/embed/J0DnG1_S92I",
            steps: ["Hands form diamond","Lower and press"],
            tips: ["Tricep focus"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "fb1-pushup-alt",
            name: "Incline Push-ups",
            sets: 3, reps: 10, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/4dF1DOWzf20",
            steps: ["Hands on elevated surface","Lower chest to surface","Push back up"],
            tips: ["Reduces shoulder load","Effective chest exercise"],
            isInjurySafe: true,
            replacesExercise: "Push-ups"
          }
        }
      },
      {
        id: "fb1-plank",
        name: "Plank Hold",
        sets: 3, reps: "30 seconds", restSeconds: 45,
        muscles: ["core"],
        contraindications: ["back_injury", "pregnant"],
        alternatives: {
          back_injury: { ...SAFE.deadBug, id: "fb1-plank-alt-back" },
          pregnant:    { ...SAFE.pregnancyPlank, id: "fb1-plank-alt-preg" },
          rehab:       { ...SAFE.deadBug, id: "fb1-plank-alt-rehab" },
          child:       { ...SAFE.kidsPlank, id: "fb1-plank-alt-kids" },
        },
        levels: {
          beginner: {
            label: "Knee Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms on ground","Knees down","Hold straight line"],
            tips: ["Build core endurance"]
          },
          intermediate: {
            label: "Standard Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms and toes","Hold 30-45 seconds"],
            tips: ["Engage entire core"]
          },
          advanced: {
            label: "Plank with Leg Lift",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Standard plank","Lift one leg","Alternate"],
            tips: ["Increased difficulty"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "fb1-plank-alt",
            name: "Dead Bug",
            sets: 3, reps: "10 per side", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/g_BYB0R-4Ws",
            steps: ["Lie on back","Arms and knees at 90 degrees","Extend opposite arm and leg","Return and switch"],
            tips: ["Lower back pressed to floor","No spinal compression","Safe core exercise"],
            isInjurySafe: true,
            replacesExercise: "Plank Hold"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // FULL BODY — INTERMEDIATE
  // ─────────────────────────────────────────
  {
    id: "full-2",
    title: "Full Body",
    type: "full",
    targets: ["full-body", "core"],
    difficulty: "intermediate",
    durationMinutes: 45,
    exercises: [
      {
        id: "fb2-thruster",
        name: "Dumbbell Thrusters",
        sets: 4, reps: 10, restSeconds: 75,
        levels: {
          beginner: {
            label: "Light Dumbbell Thruster",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Dumbbells at shoulders","Squat down","Stand and press overhead"],
            tips: ["Combines squat and press"]
          },
          intermediate: {
            label: "Moderate Dumbbell Thruster",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Increase weight","Fluid motion"],
            tips: ["Use leg drive to help press"]
          },
          advanced: {
            label: "Barbell Thruster",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Bar on front of shoulders","Explosive thruster"],
            tips: ["High intensity"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder", "knee"],
          exercise: {
            id: "fb2-thruster-alt",
            name: "Goblet Squat",
            sets: 4, reps: 12, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/MeHQ4hVQ7dQ",
            steps: ["Hold dumbbell at chest","Squat deep","Stand up"],
            tips: ["No overhead movement","Easier on shoulders and knees","Focus on leg drive"],
            isInjurySafe: true,
            replacesExercise: "Dumbbell Thrusters"
          }
        }
      },
      {
        id: "fb2-burpee",
        name: "Burpees",
        sets: 3, reps: 10, restSeconds: 60,
        levels: {
          beginner: {
            label: "Step-Back Burpees",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Step back to plank","Do push-up","Step feet forward","Stand up"],
            tips: ["Lower impact version"]
          },
          intermediate: {
            label: "Standard Burpees",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Drop to plank","Push-up","Jump feet to hands","Jump up"],
            tips: ["Keep pace steady"]
          },
          advanced: {
            label: "Burpee with Tuck Jump",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Standard burpee","Tuck knees to chest on jump"],
            tips: ["Explosive power"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee", "shoulder", "back"],
          exercise: {
            id: "fb2-burpee-alt",
            name: "Mountain Climbers",
            sets: 3, reps: "20 total", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/nmwgirgXLYM",
            steps: ["Start in plank position","Bring one knee to chest","Alternate legs quickly","Keep hips level"],
            tips: ["No jumping — low impact","Cardio and core combined","Adjust pace to comfort"],
            isInjurySafe: true,
            replacesExercise: "Burpees"
          }
        }
      },
      {
        id: "fb2-plank",
        name: "Plank Hold",
        sets: 3, reps: "45 seconds", restSeconds: 45,
        levels: {
          beginner: {
            label: "Knee Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms and knees","Hold position"],
            tips: ["Build endurance"]
          },
          intermediate: {
            label: "Standard Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms and toes","45 second hold"],
            tips: ["Engage core fully"]
          },
          advanced: {
            label: "RKC Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Standard plank","Squeeze everything","Posterior pelvic tilt"],
            tips: ["Maximum tension"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "fb2-plank-alt",
            name: "Hollow Body Hold",
            sets: 3, reps: "30 seconds", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/LlDNef_Ztsc",
            steps: ["Lie on back","Lift shoulders and legs slightly","Press lower back to floor","Hold position"],
            tips: ["Spine-safe core exercise","Lower back stays on floor","Breathe steadily"],
            isInjurySafe: true,
            replacesExercise: "Plank Hold"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // FULL BODY — ADVANCED
  // ─────────────────────────────────────────
  {
    id: "full-3",
    title: "Full Body",
    type: "full",
    targets: ["full-body", "core", "cardio"],
    difficulty: "advanced",
    durationMinutes: 60,
    exercises: [
      {
        id: "fb3-clean-press",
        name: "Dumbbell Clean & Press",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Dumbbell Deadlift to Press",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Deadlift dumbbells","Clean to shoulders","Press overhead"],
            tips: ["Learn each phase separately"]
          },
          intermediate: {
            label: "Dumbbell Clean & Press",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Explosive clean","Immediate press"],
            tips: ["Fluid movement"]
          },
          advanced: {
            label: "Barbell Clean & Press",
            videoUrl: "https://www.youtube.com/embed/L219ltL15zk",
            steps: ["Power clean","Front rack","Overhead press"],
            tips: ["Olympic lifting technique"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder", "back"],
          exercise: {
            id: "fb3-clean-alt",
            name: "Dumbbell Deadlift",
            sets: 4, reps: 10, restSeconds: 75,
            videoUrl: "https://www.youtube.com/embed/2SHsk9AzdjA",
            steps: ["Dumbbells at sides","Hinge at hips","Drive through heels","Stand tall"],
            tips: ["No overhead movement","Protects shoulder and back","Focus on hip hinge"],
            isInjurySafe: true,
            replacesExercise: "Dumbbell Clean & Press"
          }
        }
      },
      {
        id: "fb3-box-jump",
        name: "Box Jumps",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Step-ups",
            videoUrl: "https://www.youtube.com/embed/dQqApCGd5Ss",
            steps: ["Step up onto box","Step down"],
            tips: ["Build confidence"]
          },
          intermediate: {
            label: "Box Jumps",
            videoUrl: "https://www.youtube.com/embed/52r_Ul5k03g",
            steps: ["Squat down","Explode onto box","Land softly"],
            tips: ["Absorb landing"]
          },
          advanced: {
            label: "Depth Jumps",
            videoUrl: "https://www.youtube.com/embed/52r_Ul5k03g",
            steps: ["Step off box","Land and immediately jump"],
            tips: ["Plyometric power"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "fb3-box-alt",
            name: "Glute Bridge March",
            sets: 4, reps: "12 per side", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            steps: ["Lie on back in bridge position","Lift one knee to chest","Alternate legs","Maintain hip height"],
            tips: ["No jumping — zero impact","Builds hip stability","Keep hips level throughout"],
            isInjurySafe: true,
            replacesExercise: "Box Jumps"
          }
        }
      },
      {
        id: "fb3-turkish-getup",
        name: "Turkish Get-ups",
        sets: 3, reps: "5 per side", restSeconds: 90,
        levels: {
          beginner: {
            label: "Half Turkish Get-up",
            videoUrl: "https://www.youtube.com/embed/0bWRPC49-KI",
            steps: ["Lie down, arm extended","Roll to elbow","Push to hand","Stop here"],
            tips: ["Learn each phase"]
          },
          intermediate: {
            label: "Turkish Get-up (Light)",
            videoUrl: "https://www.youtube.com/embed/0bWRPC49-KI",
            steps: ["Full movement with light weight"],
            tips: ["Slow and controlled"]
          },
          advanced: {
            label: "Turkish Get-up (Heavy)",
            videoUrl: "https://www.youtube.com/embed/0bWRPC49-KI",
            steps: ["Full movement with heavy kettlebell"],
            tips: ["Eye on the weight always"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder", "back"],
          exercise: {
            id: "fb3-getup-alt",
            name: "Supine Hip Extension",
            sets: 3, reps: 15, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            steps: ["Lie on back","Feet flat on floor","Lift hips to ceiling","Lower with control"],
            tips: ["No shoulder or back stress","Excellent glute exercise","Controlled movement"],
            isInjurySafe: true,
            replacesExercise: "Turkish Get-ups"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // CARDIO — BEGINNER
  // ─────────────────────────────────────────
  {
    id: "cardio-1",
    title: "Cardio",
    type: "crossfit",
    targets: ["cardio", "full-body"],
    difficulty: "beginner",
    durationMinutes: 20,
    exercises: [
      {
        id: "c1-march",
        name: "High Knees March",
        sets: 3, reps: "30 seconds", restSeconds: 30,
        levels: {
          beginner: {
            label: "Marching in Place",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand tall","Lift knees to hip height","Alternate legs","Pump arms"],
            tips: ["Low impact option"]
          },
          intermediate: {
            label: "High Knees",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Run in place","Drive knees up","Fast pace"],
            tips: ["Land on balls of feet"]
          },
          advanced: {
            label: "High Knees Sprint",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Maximum speed","Full knee drive"],
            tips: ["Explosive effort"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "c1-march-alt",
            name: "Seated Arm Circles",
            sets: 3, reps: "30 seconds", restSeconds: 30,
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Sit upright","Extend arms to sides","Make large circles","Reverse direction"],
            tips: ["Keeps heart rate up","Zero knee stress","Great warm-up movement"],
            isInjurySafe: true,
            replacesExercise: "High Knees March"
          }
        }
      },
      {
        id: "c1-jumping-jacks",
        name: "Jumping Jacks",
        sets: 3, reps: "30 seconds", restSeconds: 30,
        levels: {
          beginner: {
            label: "Step Jacks",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Step one foot out","Raise arms","Step back in","Alternate sides"],
            tips: ["No jumping version"]
          },
          intermediate: {
            label: "Jumping Jacks",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Jump feet apart","Raise arms overhead","Jump back together"],
            tips: ["Land softly"]
          },
          advanced: {
            label: "Power Jacks",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Jump wide into squat","Jump back together"],
            tips: ["Squat deep on landing"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "c1-jacks-alt",
            name: "Standing Side Steps",
            sets: 3, reps: "30 seconds", restSeconds: 30,
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Step side to side","Raise arms with each step","Keep knees soft"],
            tips: ["No impact on knees","Maintains cardio benefit","Add arm movements for intensity"],
            isInjurySafe: true,
            replacesExercise: "Jumping Jacks"
          }
        }
      },
      {
        id: "c1-mountain-climber",
        name: "Mountain Climbers",
        sets: 3, reps: "20 total", restSeconds: 45,
        levels: {
          beginner: {
            label: "Slow Mountain Climbers",
            videoUrl: "https://www.youtube.com/embed/nmwgirgXLYM",
            steps: ["Plank position","Bring knee to chest slowly","Alternate legs"],
            tips: ["Controlled pace"]
          },
          intermediate: {
            label: "Standard Mountain Climbers",
            videoUrl: "https://www.youtube.com/embed/nmwgirgXLYM",
            steps: ["Faster pace","Maintain plank"],
            tips: ["Cardio and core"]
          },
          advanced: {
            label: "Cross-Body Mountain Climbers",
            videoUrl: "https://www.youtube.com/embed/nmwgirgXLYM",
            steps: ["Knee to opposite elbow"],
            tips: ["Oblique engagement"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "c1-climber-alt",
            name: "Seated Bicycle Crunches",
            sets: 3, reps: "20 total", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/9FGilxCbdz8",
            steps: ["Sit on floor","Lean back slightly","Bring knee to opposite elbow","Alternate sides"],
            tips: ["No shoulder weight bearing","Core and cardio combined","Control the movement"],
            isInjurySafe: true,
            replacesExercise: "Mountain Climbers"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // CARDIO — INTERMEDIATE
  // ─────────────────────────────────────────
  {
    id: "cardio-2",
    title: "Cardio",
    type: "crossfit",
    targets: ["cardio", "full-body"],
    difficulty: "intermediate",
    durationMinutes: 30,
    exercises: [
      {
        id: "c2-burpee",
        name: "Burpees",
        sets: 4, reps: 10, restSeconds: 60,
        levels: {
          beginner: {
            label: "Step-Back Burpees",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Step back to plank","Push-up","Step forward","Stand up"],
            tips: ["Low impact version"]
          },
          intermediate: {
            label: "Standard Burpees",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Drop to plank","Push-up","Jump feet in","Jump up"],
            tips: ["Steady pace"]
          },
          advanced: {
            label: "Burpee Box Jumps",
            videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
            steps: ["Burpee then jump onto box"],
            tips: ["Explosive power"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee", "shoulder", "back"],
          exercise: {
            id: "c2-burpee-alt",
            name: "Standing Punches",
            sets: 4, reps: "20 total", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand in athletic stance","Alternate punching forward","Rotate torso slightly","Keep core engaged"],
            tips: ["Keeps heart rate elevated","No floor work needed","Add light dumbbells for intensity"],
            isInjurySafe: true,
            replacesExercise: "Burpees"
          }
        }
      },
      {
        id: "c2-jump-rope",
        name: "Jump Rope",
        sets: 4, reps: "45 seconds", restSeconds: 45,
        levels: {
          beginner: {
            label: "Jump Rope (Slow)",
            videoUrl: "https://www.youtube.com/embed/FJmRQ5iTXKE",
            steps: ["Basic two-foot jump","Slow steady pace"],
            tips: ["Land on balls of feet"]
          },
          intermediate: {
            label: "Jump Rope (Moderate)",
            videoUrl: "https://www.youtube.com/embed/FJmRQ5iTXKE",
            steps: ["Faster pace","Consistent rhythm"],
            tips: ["Wrists do the work"]
          },
          advanced: {
            label: "Double Unders",
            videoUrl: "https://www.youtube.com/embed/FJmRQ5iTXKE",
            steps: ["Rope passes twice per jump"],
            tips: ["Explosive jump"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "c2-rope-alt",
            name: "Shadow Boxing",
            sets: 4, reps: "45 seconds", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Athletic stance","Alternate jabs and crosses","Move feet side to side","Keep guard up"],
            tips: ["No jumping required","Excellent cardio","Engages upper body and core"],
            isInjurySafe: true,
            replacesExercise: "Jump Rope"
          }
        }
      },
      {
        id: "c2-sprint",
        name: "Sprint Intervals",
        sets: 6, reps: "20 seconds", restSeconds: 40,
        levels: {
          beginner: {
            label: "Brisk Walk Intervals",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Walk fast for 20 seconds","Rest 40 seconds","Repeat"],
            tips: ["Build aerobic base"]
          },
          intermediate: {
            label: "Jog Intervals",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Jog at moderate pace","Rest and repeat"],
            tips: ["Controlled breathing"]
          },
          advanced: {
            label: "All-Out Sprints",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Maximum effort sprint","Full recovery between sets"],
            tips: ["100% effort each interval"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "c2-sprint-alt",
            name: "Seated Cardio Punches",
            sets: 6, reps: "20 seconds", restSeconds: 40,
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Sit on edge of chair","Punch forward alternating arms","Increase speed","Engage core"],
            tips: ["Elevates heart rate safely","No knee stress","Great upper body cardio"],
            isInjurySafe: true,
            replacesExercise: "Sprint Intervals"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // CALISTHENICS — BEGINNER
  // ─────────────────────────────────────────
  {
    id: "cali-1",
    title: "Calisthenics",
    type: "calisthenics",
    targets: ["bodyweight", "core"],
    difficulty: "beginner",
    durationMinutes: 25,
    exercises: [
      {
        id: "cal1-pushup",
        name: "Push-up Variations",
        sets: 3, reps: 10, restSeconds: 60,
        levels: {
          beginner: {
            label: "Incline Push-ups",
            videoUrl: "https://www.youtube.com/embed/4dF1DOWzf20",
            steps: ["Hands on elevated surface","Lower chest","Push back up"],
            tips: ["Master form first"]
          },
          intermediate: {
            label: "Standard Push-ups",
            videoUrl: "https://www.youtube.com/embed/zfA8sF2_QM8",
            steps: ["Plank position","Full range"],
            tips: ["Straight body line"]
          },
          advanced: {
            label: "Diamond Push-ups",
            videoUrl: "https://www.youtube.com/embed/J0DnG1_S92I",
            steps: ["Hands form diamond","Lower and press"],
            tips: ["Tricep focus"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "cal1-pushup-alt",
            name: "Wall Push-ups",
            sets: 3, reps: 12, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/EOf3cGIQpA4",
            steps: ["Stand arm's length from wall","Hands at shoulder height","Lean in and push back"],
            tips: ["Minimal shoulder stress","Good for rehabilitation","Increase reps as strength builds"],
            isInjurySafe: true,
            replacesExercise: "Push-up Variations"
          }
        }
      },
      {
        id: "cal1-squat",
        name: "Bodyweight Squats",
        sets: 3, reps: 15, restSeconds: 45,
        levels: {
          beginner: {
            label: "Box Squats",
            videoUrl: "https://www.youtube.com/embed/SLQff9ScG0I",
            steps: ["Squat to box","Stand up"],
            tips: ["Learn depth"]
          },
          intermediate: {
            label: "Bodyweight Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Full depth squat"],
            tips: ["Controlled movement"]
          },
          advanced: {
            label: "Pause Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Squat and hold 3 seconds","Stand up"],
            tips: ["Builds strength at bottom"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "cal1-squat-alt",
            name: "Glute Bridge",
            sets: 3, reps: 15, restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
            steps: ["Lie on back","Lift hips up","Squeeze glutes","Lower slowly"],
            tips: ["No knee stress","Builds glute strength","Great for beginners"],
            isInjurySafe: true,
            replacesExercise: "Bodyweight Squats"
          }
        }
      },
      {
        id: "cal1-plank",
        name: "Plank Hold",
        sets: 3, reps: "20 seconds", restSeconds: 45,
        levels: {
          beginner: {
            label: "Knee Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms and knees","Hold"],
            tips: ["Build endurance"]
          },
          intermediate: {
            label: "Standard Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Forearms and toes","Hold 20-30 seconds"],
            tips: ["Engage core"]
          },
          advanced: {
            label: "Extended Plank",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Arms extended (push-up position)","Hold"],
            tips: ["Harder variation"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "cal1-plank-alt",
            name: "Bird Dog",
            sets: 3, reps: "10 per side", restSeconds: 45,
            videoUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
            steps: ["On hands and knees","Extend opposite arm and leg","Hold 3 seconds","Switch sides"],
            tips: ["Spine-safe core work","Builds stability","No back compression"],
            isInjurySafe: true,
            replacesExercise: "Plank Hold"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // CALISTHENICS — INTERMEDIATE
  // ─────────────────────────────────────────
  {
    id: "cali-2",
    title: "Calisthenics",
    type: "calisthenics",
    targets: ["bodyweight", "core"],
    difficulty: "intermediate",
    durationMinutes: 35,
    exercises: [
      {
        id: "cal2-pullup",
        name: "Pull-up Variations",
        sets: 4, reps: 8, restSeconds: 90,
        levels: {
          beginner: {
            label: "Australian Pull-ups",
            videoUrl: "https://www.youtube.com/embed/hXTc1mDnZCw",
            steps: ["Bar at waist height","Pull chest to bar"],
            tips: ["Horizontal pulling"]
          },
          intermediate: {
            label: "Standard Pull-ups",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Dead hang","Pull chin over bar"],
            tips: ["Vertical pulling"]
          },
          advanced: {
            label: "Weighted Pull-ups",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Add weight belt","Full range"],
            tips: ["Progressive overload"]
          }
        }
      },
      {
        id: "cal2-pistol",
        name: "Pistol Squats",
        sets: 3, reps: "6 per leg", restSeconds: 75,
        levels: {
          beginner: {
            label: "Assisted Pistol Squats",
            videoUrl: "https://www.youtube.com/embed/vq5-vdgJc0I",
            steps: ["Hold TRX or pole","Lower on one leg"],
            tips: ["Build balance and strength"]
          },
          intermediate: {
            label: "Box Pistol Squats",
            videoUrl: "https://www.youtube.com/embed/vq5-vdgJc0I",
            steps: ["Squat to box on one leg"],
            tips: ["Controlled depth"]
          },
          advanced: {
            label: "Full Pistol Squats",
            videoUrl: "https://www.youtube.com/embed/vq5-vdgJc0I",
            steps: ["Full depth single-leg squat"],
            tips: ["Advanced leg strength"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["knee"],
          exercise: {
            id: "cal2-pistol-alt",
            name: "Single-Leg Glute Bridge",
            sets: 3, reps: "12 per leg", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/AVAXhy6pl7o",
            steps: ["Lie on back","One leg extended","Bridge on single leg","Squeeze glutes"],
            tips: ["No knee stress","Builds single-leg strength","Excellent glute exercise"],
            isInjurySafe: true,
            replacesExercise: "Pistol Squats"
          }
        }
      },
      {
        id: "cal2-dips",
        name: "Parallel Bar Dips",
        sets: 3, reps: 10, restSeconds: 75,
        levels: {
          beginner: {
            label: "Bench Dips",
            videoUrl: "https://www.youtube.com/embed/0326dy_-CzM",
            steps: ["Hands on bench","Lower and press"],
            tips: ["Easier variation"]
          },
          intermediate: {
            label: "Parallel Bar Dips",
            videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
            steps: ["Full bodyweight dips"],
            tips: ["Control the movement"]
          },
          advanced: {
            label: "Ring Dips",
            videoUrl: "https://www.youtube.com/embed/2z8JmcrW-As",
            steps: ["Gymnastic rings","Unstable surface"],
            tips: ["Requires stability"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "cal2-dips-alt",
            name: "Tricep Pushdowns (Band)",
            sets: 3, reps: 15, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
            steps: ["Anchor band overhead","Grip band with both hands","Push down extending elbows","Return with control"],
            tips: ["Shoulder-friendly tricep exercise","Light resistance","Full extension at bottom"],
            isInjurySafe: true,
            replacesExercise: "Parallel Bar Dips"
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // CALISTHENICS — ADVANCED
  // ─────────────────────────────────────────
  {
    id: "cali-3",
    title: "Calisthenics",
    type: "calisthenics",
    targets: ["bodyweight", "core"],
    difficulty: "advanced",
    durationMinutes: 50,
    exercises: [
      {
        id: "cal3-muscle-up",
        name: "Muscle-ups",
        sets: 4, reps: 5, restSeconds: 120,
        levels: {
          beginner: {
            label: "Pull-up + Dip Combo",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Do a pull-up","Transition to dip position","Press up"],
            tips: ["Learn each phase separately"]
          },
          intermediate: {
            label: "Kipping Muscle-up",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["Kip for momentum","Transition over bar"],
            tips: ["Use hip drive"]
          },
          advanced: {
            label: "Strict Muscle-up",
            videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
            steps: ["No kipping","Pure strength"],
            tips: ["Elite movement"]
          }
        }
      },
      {
        id: "cal3-handstand-pushup",
        name: "Handstand Push-ups",
        sets: 4, reps: 6, restSeconds: 120,
        levels: {
          beginner: {
            label: "Pike Push-ups",
            videoUrl: "https://www.youtube.com/embed/spoSDRVu4Ik",
            steps: ["Hips high","Lower head to ground"],
            tips: ["Shoulder strength builder"]
          },
          intermediate: {
            label: "Wall Handstand Push-ups",
            videoUrl: "https://www.youtube.com/embed/spoSDRVu4Ik",
            steps: ["Kick up to wall","Lower head to floor","Press up"],
            tips: ["Use wall for balance"]
          },
          advanced: {
            label: "Freestanding Handstand Push-ups",
            videoUrl: "https://www.youtube.com/embed/spoSDRVu4Ik",
            steps: ["Freestanding handstand","Lower and press"],
            tips: ["Elite skill"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["shoulder"],
          exercise: {
            id: "cal3-hspu-alt",
            name: "Band Pull-Aparts",
            sets: 4, reps: 20, restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/tZzbxS6bpRs",
            steps: ["Hold band at chest height","Pull band apart","Squeeze shoulder blades","Return with control"],
            tips: ["Shoulder rehabilitation exercise","Light resistance","High reps for endurance"],
            isInjurySafe: true,
            replacesExercise: "Handstand Push-ups"
          }
        }
      },
      {
        id: "cal3-lsit",
        name: "L-Sit Hold",
        sets: 4, reps: "20 seconds", restSeconds: 90,
        levels: {
          beginner: {
            label: "Tucked L-Sit",
            videoUrl: "https://www.youtube.com/embed/IUZJrw9azlg",
            steps: ["Hands beside hips","Lift knees tucked"],
            tips: ["Build core and shoulder strength"]
          },
          intermediate: {
            label: "One-Leg Extended L-Sit",
            videoUrl: "https://www.youtube.com/embed/IUZJrw9azlg",
            steps: ["Extend one leg","Hold position"],
            tips: ["Progression to full L-sit"]
          },
          advanced: {
            label: "Full L-Sit",
            videoUrl: "https://www.youtube.com/embed/IUZJrw9azlg",
            steps: ["Both legs extended parallel","Hold"],
            tips: ["Advanced core control"]
          }
        },
        injurySafeAlternative: {
          forInjury: ["back"],
          exercise: {
            id: "cal3-lsit-alt",
            name: "Hollow Body Hold",
            sets: 4, reps: "30 seconds", restSeconds: 60,
            videoUrl: "https://www.youtube.com/embed/LlDNef_Ztsc",
            steps: ["Lie on back","Lift shoulders and legs slightly","Press lower back to floor","Hold"],
            tips: ["Spine-safe core exercise","Lower back stays on floor","Breathe steadily"],
            isInjurySafe: true,
            replacesExercise: "L-Sit Hold"
          }
        }
      }
    ]
  }

];
