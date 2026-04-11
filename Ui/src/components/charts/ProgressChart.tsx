import { motion } from 'framer-motion'

const data = [
  { month: 'Jan', score: 75 },
  { month: 'Feb', score: 78 },
  { month: 'Mar', score: 82 },
  { month: 'Apr', score: 85 },
]

export default function ProgressChart() {
  return (
    <div className="space-y-4">
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="40"
              y1={160 - (y * 1.2)}
              x2="380"
              y2={160 - (y * 1.2)}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-600"
              opacity="0.3"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((y) => (
            <text
              key={y}
              x="30"
              y={165 - (y * 1.2)}
              className="text-xs fill-gray-500 dark:fill-gray-400"
              textAnchor="end"
            >
              {y}
            </text>
          ))}

          {/* Line path */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={`M 80 ${160 - (data[0].score * 1.2)} ${data.slice(1).map((point, index) => 
              `L ${80 + (index + 1) * 100} ${160 - (point.score * 1.2)}`
            ).join(' ')}`}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <motion.circle
              key={point.month}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.2 }}
              cx={80 + index * 100}
              cy={160 - (point.score * 1.2)}
              r="6"
              fill="#22c55e"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* X-axis labels */}
          {data.map((point, index) => (
            <text
              key={point.month}
              x={80 + index * 100}
              y="185"
              className="text-xs fill-gray-500 dark:fill-gray-400"
              textAnchor="middle"
            >
              {point.month}
            </text>
          ))}
        </svg>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Current Score: {data[data.length - 1].score}/100</span>
        <span className="text-primary">↗ +{data[data.length - 1].score - data[0].score} points</span>
      </div>
    </div>
  )
}