// ─────────────────────────────────────────────────────────────
// KidsAvatar — animated cartoon character for kids workouts
// ─────────────────────────────────────────────────────────────

import { motion } from "framer-motion";

type AvatarPose =
  | "jumping"
  | "squatting"
  | "running"
  | "stretching"
  | "dancing"
  | "pushup"
  | "default";

interface KidsAvatarProps {
  pose?: AvatarPose;
  size?: number;
}

// Each pose maps to a different body transform
const poseConfig: Record<AvatarPose, {
  bodyRotate: number;
  leftArmRotate: number;
  rightArmRotate: number;
  leftLegRotate: number;
  rightLegRotate: number;
  bounce: number[];
  color: string;
}> = {
  jumping: {
    bodyRotate: 0, leftArmRotate: -140, rightArmRotate: 140,
    leftLegRotate: -30, rightLegRotate: 30,
    bounce: [0, -18, 0], color: "#22c55e",
  },
  squatting: {
    bodyRotate: 0, leftArmRotate: -60, rightArmRotate: 60,
    leftLegRotate: 40, rightLegRotate: -40,
    bounce: [0, 8, 0], color: "#f59e0b",
  },
  running: {
    bodyRotate: 8, leftArmRotate: -80, rightArmRotate: 40,
    leftLegRotate: -50, rightLegRotate: 30,
    bounce: [0, -6, 0], color: "#38bdf8",
  },
  stretching: {
    bodyRotate: 0, leftArmRotate: -170, rightArmRotate: 170,
    leftLegRotate: 0, rightLegRotate: 0,
    bounce: [0, -4, 0], color: "#a78bfa",
  },
  dancing: {
    bodyRotate: 10, leftArmRotate: -110, rightArmRotate: 60,
    leftLegRotate: -20, rightLegRotate: 40,
    bounce: [0, -10, 0], color: "#f472b6",
  },
  pushup: {
    bodyRotate: -15, leftArmRotate: -20, rightArmRotate: 20,
    leftLegRotate: 0, rightLegRotate: 0,
    bounce: [0, 5, 0], color: "#fb923c",
  },
  default: {
    bodyRotate: 0, leftArmRotate: -20, rightArmRotate: 20,
    leftLegRotate: 0, rightLegRotate: 0,
    bounce: [0, -4, 0], color: "#22c55e",
  },
};

export function KidsAvatar({ pose = "default", size = 120 }: KidsAvatarProps) {
  const cfg = poseConfig[pose];

  return (
    <motion.div
      animate={{ y: cfg.bounce }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className="select-none"
    >
      <svg viewBox="0 0 100 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse cx="50" cy="115" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />

        {/* Body */}
        <motion.g
          animate={{ rotate: [0, cfg.bodyRotate, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "50px", originY: "70px" }}
        >
          {/* Torso */}
          <rect x="36" y="52" width="28" height="30" rx="8" fill={cfg.color} />

          {/* Left Arm */}
          <motion.line
            x1="36" y1="58" x2="22" y2="72"
            stroke={cfg.color} strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [0, cfg.leftArmRotate * 0.3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "36px", originY: "58px" }}
          />
          {/* Right Arm */}
          <motion.line
            x1="64" y1="58" x2="78" y2="72"
            stroke={cfg.color} strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [0, cfg.rightArmRotate * 0.3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "64px", originY: "58px" }}
          />

          {/* Left Leg */}
          <motion.line
            x1="44" y1="82" x2="38" y2="100"
            stroke="#1e293b" strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [0, cfg.leftLegRotate * 0.4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "44px", originY: "82px" }}
          />
          {/* Right Leg */}
          <motion.line
            x1="56" y1="82" x2="62" y2="100"
            stroke="#1e293b" strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [0, cfg.rightLegRotate * 0.4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "56px", originY: "82px" }}
          />

          {/* Left Shoe */}
          <ellipse cx="38" cy="101" rx="7" ry="4" fill="#1e293b" />
          {/* Right Shoe */}
          <ellipse cx="62" cy="101" rx="7" ry="4" fill="#1e293b" />

          {/* Shirt detail */}
          <circle cx="50" cy="62" r="3" fill="white" opacity="0.5" />
          <circle cx="50" cy="70" r="3" fill="white" opacity="0.5" />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={{ rotate: [0, cfg.bodyRotate * 0.5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "50px", originY: "52px" }}
        >
          {/* Head circle */}
          <circle cx="50" cy="36" r="18" fill="#fde68a" />
          {/* Hair */}
          <ellipse cx="50" cy="20" rx="16" ry="8" fill="#92400e" />
          <circle cx="34" cy="24" r="5" fill="#92400e" />
          <circle cx="66" cy="24" r="5" fill="#92400e" />
          {/* Eyes */}
          <circle cx="43" cy="34" r="3.5" fill="white" />
          <circle cx="57" cy="34" r="3.5" fill="white" />
          <circle cx="44" cy="35" r="2" fill="#1e293b" />
          <circle cx="58" cy="35" r="2" fill="#1e293b" />
          {/* Eye shine */}
          <circle cx="45" cy="34" r="0.8" fill="white" />
          <circle cx="59" cy="34" r="0.8" fill="white" />
          {/* Smile */}
          <path d="M 43 42 Q 50 48 57 42" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="38" cy="40" r="4" fill="#fca5a5" opacity="0.6" />
          <circle cx="62" cy="40" r="4" fill="#fca5a5" opacity="0.6" />
        </motion.g>

        {/* Stars around avatar */}
        <motion.text
          x="8" y="30" fontSize="10"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >⭐</motion.text>
        <motion.text
          x="78" y="25" fontSize="8"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >✨</motion.text>
        <motion.text
          x="12" y="75" fontSize="8"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >💫</motion.text>
      </svg>
    </motion.div>
  );
}
