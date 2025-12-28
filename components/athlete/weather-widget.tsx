'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2, MapPin, CloudSun, CloudFog } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherData {
  temp: number
  condition: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'wind'
  location: string
  high: number
  low: number
  humidity: number
  description: string
}

const WEATHER_ICONS = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  fog: CloudFog,
  wind: Wind,
}

const WEATHER_COLORS = {
  clear: 'text-amber-500',
  partly_cloudy: 'text-amber-400',
  cloudy: 'text-slate-400',
  rain: 'text-blue-400',
  snow: 'text-blue-200',
  fog: 'text-slate-300',
  wind: 'text-cyan-400',
}

interface WeatherWidgetProps {
  className?: string
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate fetching weather data
    // In production, this would call a weather API
    const fetchWeather = async () => {
      setIsLoading(true)
      try {
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Mock weather data based on time of day
        const hour = new Date().getHours()
        const conditions: WeatherData['condition'][] = ['clear', 'partly_cloudy', 'cloudy', 'rain']
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

        setWeather({
          temp: Math.round(8 + Math.random() * 10), // 8-18°C for UK
          condition: randomCondition,
          location: 'London',
          high: Math.round(12 + Math.random() * 6),
          low: Math.round(4 + Math.random() * 4),
          humidity: Math.round(60 + Math.random() * 30),
          description: getConditionDescription(randomCondition),
        })
      } catch {
        setError('Unable to load weather')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          {error || 'Weather unavailable'}
        </div>
      </div>
    )
  }

  const WeatherIcon = WEATHER_ICONS[weather.condition]

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-muted/50', WEATHER_COLORS[weather.condition])}>
            <WeatherIcon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{weather.temp}°</span>
              <span className="text-muted-foreground text-sm">C</span>
            </div>
            <p className="text-sm text-muted-foreground">{weather.description}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{weather.location}</span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-end gap-2">
              <span className="text-muted-foreground">H:</span>
              <span className="font-medium">{weather.high}°</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="text-muted-foreground">L:</span>
              <span className="font-medium">{weather.low}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Training recommendation */}
      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          {getTrainingRecommendation(weather.condition, weather.temp)}
        </p>
      </div>
    </div>
  )
}

function getConditionDescription(condition: WeatherData['condition']): string {
  switch (condition) {
    case 'clear':
      return 'Clear skies'
    case 'partly_cloudy':
      return 'Partly cloudy'
    case 'cloudy':
      return 'Overcast'
    case 'rain':
      return 'Light rain'
    case 'snow':
      return 'Snow showers'
    case 'fog':
      return 'Foggy'
    case 'wind':
      return 'Windy'
    default:
      return 'Unknown'
  }
}

function getTrainingRecommendation(condition: WeatherData['condition'], temp: number): string {
  if (condition === 'rain') {
    return 'Indoor training recommended today. Perfect for hitting the gym!'
  }
  if (condition === 'snow') {
    return 'Stay warm! Consider indoor cardio or a mobility session.'
  }
  if (temp < 5) {
    return 'Bundle up if training outdoors. Warm-up thoroughly.'
  }
  if (temp > 25) {
    return 'Stay hydrated! Early morning or evening training advised.'
  }
  if (condition === 'clear' || condition === 'partly_cloudy') {
    return 'Great weather for outdoor training. Enjoy your session!'
  }
  return 'Good conditions for training. Stay consistent!'
}
