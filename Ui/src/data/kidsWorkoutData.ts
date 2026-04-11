// ─────────────────────────────────────────────────────────────
// Kids Workout Data — fun, age-appropriate, cartoon-themed
// These ONLY appear when Kids mode is selected.
// All exercises are flat (noLevels) — no beginner/intermediate/advanced.
// ─────────────────────────────────────────────────────────────

import { Workout } from "../types/workout.types";

// Kids exercises are stored directly as Exercise objects with levels
// but the ExerciseDetailModal will show them in a fun kids-friendly way.

export const KIDS_WORKOUTS: Workout[] = [
  // ─────────────────────────────────────────
  // ADVENTURE QUEST (Full Body Fun)
  // ─────────────────────────────────────────
  {
    id: "kids-adventure-1",
    title: "Adventure Quest",
    type: "full",
    targets: ["full-body", "cardio"],
    difficulty: "beginner",
    durationMinutes: 15,
    isKidsWorkout: true,
    exercises: [
      {
        id: "kids-jumpjack",
        name: "🌟 Star Jumps",
        sets: 2, reps: 10, restSeconds: 20,
        levels: {
          beginner: {
            label: "Star Jumps",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Stand with feet together","Jump and spread arms and legs like a star!","Jump back together","Repeat and have fun!"],
            tips: ["Land softly like a cat 🐱","Smile while you do it! 😄"]
          },
          intermediate: {
            label: "Star Jumps",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Jump wide and high!","Make the biggest star shape you can!"],
            tips: ["Go faster! 🚀"]
          },
          advanced: {
            label: "Star Jumps",
            videoUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8",
            steps: ["Super fast star jumps!"],
            tips: ["You're a superstar! ⭐"]
          }
        }
      },
      {
        id: "kids-frog-jump",
        name: "🐸 Frog Jumps",
        sets: 2, reps: 8, restSeconds: 20,
        levels: {
          beginner: {
            label: "Frog Jumps",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Squat down low like a frog 🐸","Put hands on the floor","Jump forward as far as you can!","Land in squat position"],
            tips: ["Ribbit! Make frog sounds! 🐸","Land with soft knees"]
          },
          intermediate: {
            label: "Frog Jumps",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Jump higher and further!"],
            tips: ["You're the best frog! 🐸"]
          },
          advanced: {
            label: "Frog Jumps",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Maximum frog power!"],
            tips: ["Super frog! 🦸"]
          }
        }
      },
      {
        id: "kids-bear-crawl",
        name: "🐻 Bear Crawl",
        sets: 2, reps: "10 steps", restSeconds: 20,
        levels: {
          beginner: {
            label: "Bear Crawl",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Get on hands and feet (not knees!)","Walk forward like a bear 🐻","Move opposite hand and foot together","Growl like a bear! ROAR!"],
            tips: ["Keep your back flat like a table","You're a mighty bear! 🐻"]
          },
          intermediate: {
            label: "Bear Crawl",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Bear crawl faster!"],
            tips: ["Speedy bear! 🐻💨"]
          },
          advanced: {
            label: "Bear Crawl",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Bear crawl backwards too!"],
            tips: ["Ninja bear! 🥷🐻"]
          }
        }
      },
      {
        id: "kids-superhero-pose",
        name: "🦸 Superhero Pose",
        sets: 2, reps: "15 seconds", restSeconds: 15,
        levels: {
          beginner: {
            label: "Superhero Pose",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Stand tall and proud","Put hands on hips like a superhero 🦸","Hold the pose for 15 seconds","Feel your superpowers!"],
            tips: ["You ARE a superhero! 💪","Stand as tall as possible!"]
          },
          intermediate: {
            label: "Superhero Pose",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Hold longer — 20 seconds!"],
            tips: ["Superpower charging! ⚡"]
          },
          advanced: {
            label: "Superhero Pose",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["30 second superhero hold!"],
            tips: ["Maximum power! 🦸‍♂️"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // ANIMAL KINGDOM (Movement & Strength)
  // ─────────────────────────────────────────
  {
    id: "kids-animals-1",
    title: "Animal Kingdom",
    type: "full",
    targets: ["full-body", "core"],
    difficulty: "beginner",
    durationMinutes: 20,
    isKidsWorkout: true,
    exercises: [
      {
        id: "kids-crab-walk",
        name: "🦀 Crab Walk",
        sets: 2, reps: "10 steps", restSeconds: 20,
        levels: {
          beginner: {
            label: "Crab Walk",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Sit on the floor","Put hands behind you, feet in front","Lift your bottom off the floor","Walk sideways like a crab! 🦀"],
            tips: ["Snap your claws! ✂️","Keep your tummy up high"]
          },
          intermediate: {
            label: "Crab Walk",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Crab walk faster!"],
            tips: ["Speed crab! 🦀💨"]
          },
          advanced: {
            label: "Crab Walk",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Crab walk backwards!"],
            tips: ["Ninja crab! 🥷🦀"]
          }
        }
      },
      {
        id: "kids-bunny-hop",
        name: "🐰 Bunny Hops",
        sets: 3, reps: 10, restSeconds: 20,
        levels: {
          beginner: {
            label: "Bunny Hops",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Stand with feet together","Bend knees slightly","Jump forward with both feet together 🐰","Land softly and hop again!"],
            tips: ["Wiggle your nose like a bunny! 🐰","Keep feet together"]
          },
          intermediate: {
            label: "Bunny Hops",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Hop higher!"],
            tips: ["Super bunny! 🐰⭐"]
          },
          advanced: {
            label: "Bunny Hops",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Bunny hop in a circle!"],
            tips: ["Champion bunny! 🏆🐰"]
          }
        }
      },
      {
        id: "kids-elephant-stomp",
        name: "🐘 Elephant Stomps",
        sets: 2, reps: 12, restSeconds: 20,
        levels: {
          beginner: {
            label: "Elephant Stomps",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand with feet wide apart","Bend forward and let arms hang like a trunk 🐘","March in place lifting knees high","Stomp like a big elephant!"],
            tips: ["Make elephant sounds! 🐘","Swing your trunk (arms)!"]
          },
          intermediate: {
            label: "Elephant Stomps",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stomp faster!"],
            tips: ["Mighty elephant! 🐘💪"]
          },
          advanced: {
            label: "Elephant Stomps",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["High knees elephant march!"],
            tips: ["King of the jungle! 👑🐘"]
          }
        }
      },
      {
        id: "kids-snake-stretch",
        name: "🐍 Snake Stretch",
        sets: 2, reps: "10 seconds", restSeconds: 15,
        levels: {
          beginner: {
            label: "Snake Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Lie on your tummy","Put hands under shoulders","Push up and look at the ceiling 🐍","Hiss like a snake! Ssssss!"],
            tips: ["Feel your tummy stretch","Hissss! 🐍"]
          },
          intermediate: {
            label: "Snake Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Hold the stretch longer!"],
            tips: ["Flexible snake! 🐍✨"]
          },
          advanced: {
            label: "Snake Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Full cobra stretch!"],
            tips: ["King cobra! 👑🐍"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // SPACE EXPLORER (Cardio & Coordination)
  // ─────────────────────────────────────────
  {
    id: "kids-space-1",
    title: "Space Explorer",
    type: "crossfit",
    targets: ["cardio", "full-body"],
    difficulty: "beginner",
    durationMinutes: 15,
    isKidsWorkout: true,
    exercises: [
      {
        id: "kids-rocket-launch",
        name: "🚀 Rocket Launch",
        sets: 3, reps: 8, restSeconds: 20,
        levels: {
          beginner: {
            label: "Rocket Launch",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Squat down low — you're a rocket on the launchpad! 🚀","Count down: 3... 2... 1...","BLAST OFF! Jump as high as you can!","Reach arms up to the stars!"],
            tips: ["Make rocket sounds! WHOOOOSH! 🚀","Land softly back on Earth 🌍"]
          },
          intermediate: {
            label: "Rocket Launch",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Faster countdown! Jump higher!"],
            tips: ["To the moon! 🌙"]
          },
          advanced: {
            label: "Rocket Launch",
            videoUrl: "https://www.youtube.com/embed/CVaEhXotL7M",
            steps: ["Maximum rocket power!"],
            tips: ["Intergalactic explorer! 🌌"]
          }
        }
      },
      {
        id: "kids-moon-walk",
        name: "🌙 Moon Walk",
        sets: 2, reps: "20 seconds", restSeconds: 15,
        levels: {
          beginner: {
            label: "Moon Walk",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Pretend you're on the moon — gravity is low! 🌙","Walk in slow motion","Bounce gently with each step","Float your arms like you're weightless!"],
            tips: ["Everything is slow on the moon! 🌙","Make space sounds! Beep boop! 🤖"]
          },
          intermediate: {
            label: "Moon Walk",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Moon walk with high knees!"],
            tips: ["Astronaut training! 👨‍🚀"]
          },
          advanced: {
            label: "Moon Walk",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Moon walk backwards!"],
            tips: ["Expert astronaut! 🚀⭐"]
          }
        }
      },
      {
        id: "kids-asteroid-dodge",
        name: "☄️ Asteroid Dodge",
        sets: 3, reps: 10, restSeconds: 20,
        levels: {
          beginner: {
            label: "Asteroid Dodge",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand with feet shoulder-width","Pretend asteroids are flying at you! ☄️","Jump left, jump right, duck down!","Move fast to dodge them all!"],
            tips: ["Dodge those asteroids! ☄️","Quick feet save the day! 🦶"]
          },
          intermediate: {
            label: "Asteroid Dodge",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Dodge faster!"],
            tips: ["Space ninja! 🥷🌌"]
          },
          advanced: {
            label: "Asteroid Dodge",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Maximum dodge speed!"],
            tips: ["Undefeated space hero! 🦸‍♂️🌌"]
          }
        }
      },
      {
        id: "kids-planet-spin",
        name: "🪐 Planet Spin",
        sets: 2, reps: "10 seconds", restSeconds: 15,
        levels: {
          beginner: {
            label: "Planet Spin",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand with arms out wide like Saturn's rings 🪐","Spin slowly in a circle","Stop and try the other direction","Don't get too dizzy! 😵‍💫"],
            tips: ["Spin like a planet! 🪐","Look at one spot to stay balanced"]
          },
          intermediate: {
            label: "Planet Spin",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Spin faster!"],
            tips: ["Spinning planet! 🪐💫"]
          },
          advanced: {
            label: "Planet Spin",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Spin and jump!"],
            tips: ["Galactic champion! 🏆🌌"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // NINJA TRAINING (Strength & Balance)
  // ─────────────────────────────────────────
  {
    id: "kids-ninja-1",
    title: "Ninja Training",
    type: "calisthenics",
    targets: ["bodyweight", "core"],
    difficulty: "intermediate",
    durationMinutes: 20,
    isKidsWorkout: true,
    exercises: [
      {
        id: "kids-ninja-pushup",
        name: "🥷 Ninja Push-ups",
        sets: 2, reps: 8, restSeconds: 25,
        levels: {
          beginner: {
            label: "Ninja Push-ups",
            videoUrl: "https://www.youtube.com/embed/jWxvty2KROs",
            steps: ["Get on hands and knees — ninja position! 🥷","Lower your chest to the ground","Push back up with ninja strength!","Say 'HI-YA!' when you push up!"],
            tips: ["Ninjas are strong AND quiet! 🥷","Keep your back straight"]
          },
          intermediate: {
            label: "Ninja Push-ups",
            videoUrl: "https://www.youtube.com/embed/zfA8sF2_QM8",
            steps: ["Full ninja push-ups on toes!"],
            tips: ["Ninja master! 🥷⭐"]
          },
          advanced: {
            label: "Ninja Push-ups",
            videoUrl: "https://www.youtube.com/embed/zfA8sF2_QM8",
            steps: ["Clap between push-ups!"],
            tips: ["Ultimate ninja! 🥷🏆"]
          }
        }
      },
      {
        id: "kids-ninja-balance",
        name: "🦅 Eagle Balance",
        sets: 2, reps: "10 seconds each leg", restSeconds: 20,
        levels: {
          beginner: {
            label: "Eagle Balance",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Stand on one foot like an eagle 🦅","Spread arms out wide like wings","Hold for 10 seconds","Switch to the other foot"],
            tips: ["Focus on one spot to balance","You're a mighty eagle! 🦅"]
          },
          intermediate: {
            label: "Eagle Balance",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Balance with eyes closed!"],
            tips: ["Ninja eagle! 🥷🦅"]
          },
          advanced: {
            label: "Eagle Balance",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Balance and move arms slowly!"],
            tips: ["Master of balance! 🏆🦅"]
          }
        }
      },
      {
        id: "kids-ninja-squat",
        name: "🐉 Dragon Squats",
        sets: 3, reps: 10, restSeconds: 20,
        levels: {
          beginner: {
            label: "Dragon Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Stand with feet shoulder-width","Squat down like a dragon crouching 🐉","Hold arms out like dragon wings","Rise up and ROAR!"],
            tips: ["ROAR like a dragon! 🐉","Sit back like you're on a throne"]
          },
          intermediate: {
            label: "Dragon Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Squat deeper, dragon!"],
            tips: ["Powerful dragon! 🐉💪"]
          },
          advanced: {
            label: "Dragon Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Jump squat — dragon takes flight!"],
            tips: ["Dragon master! 🐉👑"]
          }
        }
      },
      {
        id: "kids-ninja-plank",
        name: "🗿 Stone Warrior",
        sets: 2, reps: "15 seconds", restSeconds: 20,
        levels: {
          beginner: {
            label: "Stone Warrior",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Get into plank position on hands","Be as still as a stone statue 🗿","Hold for 15 seconds","Don't let anyone move you!"],
            tips: ["Statues don't move! 🗿","Squeeze your tummy tight"]
          },
          intermediate: {
            label: "Stone Warrior",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Hold for 25 seconds!"],
            tips: ["Unbreakable warrior! 🗿⚔️"]
          },
          advanced: {
            label: "Stone Warrior",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Plank with one arm raised!"],
            tips: ["Legendary warrior! 🗿👑"]
          }
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // DANCE PARTY (Cardio & Fun)
  // ─────────────────────────────────────────
  {
    id: "kids-dance-1",
    title: "Dance Party",
    type: "crossfit",
    targets: ["cardio", "full-body"],
    difficulty: "beginner",
    durationMinutes: 15,
    isKidsWorkout: true,
    exercises: [
      {
        id: "kids-wiggle",
        name: "🕺 Wiggle Warm-up",
        sets: 1, reps: "30 seconds", restSeconds: 10,
        levels: {
          beginner: {
            label: "Wiggle Warm-up",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Stand up and wiggle everything! 🕺","Wiggle your fingers","Wiggle your arms","Wiggle your whole body!"],
            tips: ["There's no wrong way to wiggle! 🕺","The sillier the better! 😄"]
          },
          intermediate: {
            label: "Wiggle Warm-up",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Wiggle faster!"],
            tips: ["Wiggle champion! 🏆"]
          },
          advanced: {
            label: "Wiggle Warm-up",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Wiggle and jump!"],
            tips: ["Ultimate wiggler! 🕺⭐"]
          }
        }
      },
      {
        id: "kids-freeze-dance",
        name: "🎵 Freeze Dance Squats",
        sets: 3, reps: 8, restSeconds: 15,
        levels: {
          beginner: {
            label: "Freeze Dance Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Dance around and have fun! 🎵","When you hear 'FREEZE' — squat down!","Hold the squat for 3 seconds","Then dance again!"],
            tips: ["Dancing makes exercise fun! 🎵","Freeze like a statue! 🗿"]
          },
          intermediate: {
            label: "Freeze Dance Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Squat lower on freeze!"],
            tips: ["Dance star! 🌟"]
          },
          advanced: {
            label: "Freeze Dance Squats",
            videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
            steps: ["Jump squat on freeze!"],
            tips: ["Dance champion! 🏆🎵"]
          }
        }
      },
      {
        id: "kids-robot-dance",
        name: "🤖 Robot Dance",
        sets: 2, reps: "20 seconds", restSeconds: 15,
        levels: {
          beginner: {
            label: "Robot Dance",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Move like a robot! 🤖","Stiff arms, stiff legs","March in place like a robot","Make robot sounds: BEEP BOOP!"],
            tips: ["Robots are very precise! 🤖","Keep movements sharp and stiff"]
          },
          intermediate: {
            label: "Robot Dance",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Robot dance with high knees!"],
            tips: ["Advanced robot model! 🤖⚡"]
          },
          advanced: {
            label: "Robot Dance",
            videoUrl: "https://www.youtube.com/embed/ZZZoCNMU48U",
            steps: ["Robot dance + jumping jacks!"],
            tips: ["Super robot! 🤖🦾"]
          }
        }
      },
      {
        id: "kids-cool-down",
        name: "🌈 Rainbow Stretch",
        sets: 1, reps: "30 seconds", restSeconds: 10,
        levels: {
          beginner: {
            label: "Rainbow Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Stand with feet wide apart","Reach one arm up and over like a rainbow 🌈","Feel the stretch on your side","Switch sides and make another rainbow!"],
            tips: ["Breathe slowly 🌬️","Imagine all the rainbow colors! 🌈"]
          },
          intermediate: {
            label: "Rainbow Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Reach further!"],
            tips: ["Beautiful rainbow! 🌈✨"]
          },
          advanced: {
            label: "Rainbow Stretch",
            videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
            steps: ["Hold each side 15 seconds!"],
            tips: ["Flexibility star! 🌟🌈"]
          }
        }
      }
    ]
  }
];
