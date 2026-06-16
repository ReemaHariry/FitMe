import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Dot } from 'recharts'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { weightApi, type WeightLog } from '@/api/weight'
import { getWeightChange, getWeightGoalContext } from '@/utils/dashboardHelpers'

interface WeightTrackerProps {
  initialLogs: WeightLog[]
  fitnessGoal?: string
  onLogsUpdate?: (logs: WeightLog[]) => void
}

export default function WeightTracker({ initialLogs, fitnessGoal, onLogsUpdate }: WeightTrackerProps) {
  const [logs, setLogs] = useState<WeightLog[]>(initialLogs)
  const [showInput, setShowInput] = useState(false)
  const [inputWeight, setInputWeight] = useState('')
  const [inputNote, setInputNote] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justLogged, setJustLogged] = useState(false)

  useEffect(() => {
    setLogs(initialLogs)
  }, [initialLogs])

  const handleLogWeight = async () => {
    const weight = parseFloat(inputWeight)
    
    // Validation
    if (isNaN(weight) || weight < 20 || weight > 500) {
      setError('Please enter a valid weight between 20 and 500 kg')
      return
    }

    setIsLogging(true)
    setError(null)

    try {
      const newLog = await weightApi.logWeight({
        weight_kg: weight,
        note: inputNote || undefined
      })

      const updatedLogs = [...logs, newLog]
      setLogs(updatedLogs)
      onLogsUpdate?.(updatedLogs)
      
      setInputWeight('')
      setInputNote('')
      setShowInput(false)
      setJustLogged(true)
      setTimeout(() => setJustLogged(false), 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log weight')
    } finally {
      setIsLogging(false)
    }
  }

  // Calculate metrics
  const { current, previous, change, weeklyChange, trend } = getWeightChange(logs)
  
  // Get color context based on fitness goal
  const changeContext = change !== null ? getWeightGoalContext(change, fitnessGoal) : null
  const weeklyContext = weeklyChange !== null ? getWeightGoalContext(weeklyChange, fitnessGoal) : null

  // Prepare chart data
  const chartData = logs.map(log => ({
    date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight_kg
  }))

  const minWeight = logs.length > 0 ? Math.min(...logs.map(l => l.weight_kg)) - 2 : 0
  const maxWeight = logs.length > 0 ? Math.max(...logs.map(l => l.weight_kg)) + 2 : 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={justLogged ? 'ring-2 ring-primary ring-offset-2 rounded-2xl transition-all duration-300' : ''}
    >
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5" />
            ⚖️ Weight Progress
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(!showInput)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Log Weight
          </Button>
        </div>

        {/* Current Status */}
        {current !== null && (
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {current.toFixed(1)}
              </span>
              <span className="text-lg text-gray-500">kg</span>
            </div>
            
            {changeContext && (
              <div className="flex items-center gap-2 text-sm">
                {change! > 0 ? (
                  <TrendingUp className={`w-4 h-4 ${changeContext.color}`} />
                ) : change! < 0 ? (
                  <TrendingDown className={`w-4 h-4 ${changeContext.color}`} />
                ) : (
                  <Minus className="w-4 h-4 text-gray-500" />
                )}
                <span className={changeContext.color}>
                  {changeContext.label} since last log
                </span>
              </div>
            )}

            {/* Weekly Change Pill */}
            {weeklyContext && weeklyChange !== null && (
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  weeklyContext.isPositive && trend === 'losing' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : weeklyContext.isPositive && trend === 'gaining'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {trend === 'losing' && '📉'}
                  {trend === 'gaining' && '📈'}
                  {trend === 'maintaining' && '⚖️'}
                  {trend === 'losing' ? 'Lost' : trend === 'gaining' ? 'Gained' : 'Maintaining'} {Math.abs(weeklyChange).toFixed(1)} kg this week
                </span>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {logs.length >= 2 ? (
          <div className="mb-4" style={{ height: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[minWeight, maxWeight]}
                  hide
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs">
                          <p className="font-medium">{payload[0].payload.date}</p>
                          <p className="text-primary">{payload[0].value} kg</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : logs.length === 1 ? (
          <div className="flex flex-col items-center justify-center h-[120px] text-center">
            <div className="w-3 h-3 bg-primary rounded-full mb-2"></div>
            <p className="text-sm text-gray-500">Log more entries to see your trend</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[120px] text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <Scale className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Log your first weight to start tracking</p>
          </div>
        )}

        {/* Input Form */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="500"
                        placeholder="72.5"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="text-sm text-gray-500">kg</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Add a note (optional)"
                      value={inputNote}
                      onChange={(e) => setInputNote(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleLogWeight}
                    disabled={isLogging}
                    loading={isLogging}
                    size="sm"
                    className="mt-0.5"
                  >
                    Log
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
