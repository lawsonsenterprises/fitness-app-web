'use client'

import { useState } from 'react'
import {
  Target,
  Scale,
  Flame,
  Calculator,
  Save,
  Loader2,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const goalTypes = [
  { id: 'cut', label: 'Cut', icon: TrendingDown, description: 'Lose body fat while preserving muscle' },
  { id: 'maintain', label: 'Maintain', icon: Minus, description: 'Stay at current weight and composition' },
  { id: 'bulk', label: 'Bulk', icon: TrendingUp, description: 'Build muscle with controlled weight gain' },
]

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', multiplier: 1.2, description: 'Little to no exercise' },
  { id: 'light', label: 'Lightly Active', multiplier: 1.375, description: '1-3 days/week' },
  { id: 'moderate', label: 'Moderately Active', multiplier: 1.55, description: '3-5 days/week' },
  { id: 'very', label: 'Very Active', multiplier: 1.725, description: '6-7 days/week' },
  { id: 'extreme', label: 'Extremely Active', multiplier: 1.9, description: 'Physical job + training' },
]

export default function GoalsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentWeight: 76.2,
    goalWeight: 74,
    height: 180,
    age: 32,
    sex: 'male',
    goalType: 'cut',
    activityLevel: 'moderate',
    trainingDaysPerWeek: 4,
    trainingDayCalories: 2400,
    trainingDayProtein: 180,
    trainingDayCarbs: 250,
    trainingDayFat: 70,
    restDayCalories: 2000,
    restDayProtein: 180,
    restDayCarbs: 150,
    restDayFat: 75,
  })

  const calculateTDEE = () => {
    // Mifflin-St Jeor Equation
    const bmr = formData.sex === 'male'
      ? (10 * formData.currentWeight) + (6.25 * formData.height) - (5 * formData.age) + 5
      : (10 * formData.currentWeight) + (6.25 * formData.height) - (5 * formData.age) - 161

    const multiplier = activityLevels.find(a => a.id === formData.activityLevel)?.multiplier || 1.55
    return Math.round(bmr * multiplier)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Goals saved successfully')
    } catch {
      toast.error('Failed to save goals')
    } finally {
      setIsLoading(false)
    }
  }

  const tdee = calculateTDEE()

  return (
    <div className="space-y-6">
        {/* Body Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Body Metrics</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.goalWeight}
                onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </motion.div>

        {/* Goal Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Goal Type</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {goalTypes.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setFormData({ ...formData, goalType: goal.id })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                  formData.goalType === goal.id
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <goal.icon className={cn(
                  'h-6 w-6',
                  formData.goalType === goal.id ? 'text-amber-600' : 'text-muted-foreground'
                )} />
                <span className="font-medium">{goal.label}</span>
                <span className="text-xs text-muted-foreground text-center">{goal.description}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <Dumbbell className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Activity Level</h2>
          </div>

          <div className="space-y-2">
            {activityLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border p-4 transition-colors text-left',
                  formData.activityLevel === level.id
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <div>
                  <p className="font-medium">{level.label}</p>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">×{level.multiplier}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Training Days Per Week</label>
            <Input
              type="number"
              min="0"
              max="7"
              value={formData.trainingDaysPerWeek}
              onChange={(e) => setFormData({ ...formData, trainingDaysPerWeek: parseInt(e.target.value) })}
              className="max-w-xs"
            />
          </div>
        </motion.div>

        {/* TDEE Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-purple-600">Calculated TDEE</h2>
          </div>
          <p className="text-4xl font-bold text-purple-600">{tdee} kcal/day</p>
          <p className="text-sm text-purple-600/80 mt-2">
            Based on your metrics and activity level. Adjust targets below as needed.
          </p>
        </motion.div>

        {/* Macro Targets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold">Macro Targets</h2>
          </div>

          {/* Training Day */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Training Day</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calories</label>
                <Input
                  type="number"
                  value={formData.trainingDayCalories}
                  onChange={(e) => setFormData({ ...formData, trainingDayCalories: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Protein (g)</label>
                <Input
                  type="number"
                  value={formData.trainingDayProtein}
                  onChange={(e) => setFormData({ ...formData, trainingDayProtein: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Carbs (g)</label>
                <Input
                  type="number"
                  value={formData.trainingDayCarbs}
                  onChange={(e) => setFormData({ ...formData, trainingDayCarbs: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fat (g)</label>
                <Input
                  type="number"
                  value={formData.trainingDayFat}
                  onChange={(e) => setFormData({ ...formData, trainingDayFat: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Rest Day */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Rest Day</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calories</label>
                <Input
                  type="number"
                  value={formData.restDayCalories}
                  onChange={(e) => setFormData({ ...formData, restDayCalories: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Protein (g)</label>
                <Input
                  type="number"
                  value={formData.restDayProtein}
                  onChange={(e) => setFormData({ ...formData, restDayProtein: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Carbs (g)</label>
                <Input
                  type="number"
                  value={formData.restDayCarbs}
                  onChange={(e) => setFormData({ ...formData, restDayCarbs: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fat (g)</label>
                <Input
                  type="number"
                  value={formData.restDayFat}
                  onChange={(e) => setFormData({ ...formData, restDayFat: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Goals
              </>
            )}
          </Button>
        </div>
    </div>
  )
}
