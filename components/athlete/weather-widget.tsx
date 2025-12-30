'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2, MapPin, CloudSun, CloudFog } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherData {
  temp: number
  condition: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'wind' | 'thunderstorm'
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
  thunderstorm: CloudRain,
}

const WEATHER_COLORS = {
  clear: 'text-amber-500',
  partly_cloudy: 'text-amber-400',
  cloudy: 'text-slate-400',
  rain: 'text-blue-400',
  snow: 'text-blue-200',
  fog: 'text-slate-300',
  wind: 'text-cyan-400',
  thunderstorm: 'text-purple-400',
}

// Map OpenWeatherMap weather codes to our conditions
function mapWeatherCode(weatherId: number): WeatherData['condition'] {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm'
  if (weatherId >= 300 && weatherId < 400) return 'rain' // Drizzle
  if (weatherId >= 500 && weatherId < 600) return 'rain'
  if (weatherId >= 600 && weatherId < 700) return 'snow'
  if (weatherId >= 700 && weatherId < 800) return 'fog' // Atmosphere (mist, fog, etc.)
  if (weatherId === 800) return 'clear'
  if (weatherId === 801) return 'partly_cloudy'
  if (weatherId >= 802 && weatherId < 900) return 'cloudy'
  return 'cloudy'
}

interface WeatherWidgetProps {
  className?: string
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        // Use OpenWeatherMap API (free tier allows 1000 calls/day)
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

        if (!apiKey) {
          // Fallback to showing a message if no API key
          setError('Weather not configured')
          setIsLoading(false)
          return
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        )

        if (!response.ok) {
          throw new Error('Weather API error')
        }

        const data = await response.json()

        const condition = mapWeatherCode(data.weather[0].id)

        setWeather({
          temp: Math.round(data.main.temp),
          condition,
          location: data.name,
          high: Math.round(data.main.temp_max),
          low: Math.round(data.main.temp_min),
          humidity: data.main.humidity,
          description: data.weather[0].description,
        })
      } catch {
        setError('Unable to load weather')
      } finally {
        setIsLoading(false)
      }
    }

    const getLocationAndWeather = () => {
      if (!navigator.geolocation) {
        setError('Location not supported')
        setIsLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // User denied location or error - fallback to London
          fetchWeather(51.5074, -0.1278)
        },
        { timeout: 10000 }
      )
    }

    getLocationAndWeather()
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

function getTrainingRecommendation(condition: WeatherData['condition'], temp: number): string {
  if (condition === 'thunderstorm') {
    return 'Thunderstorm warning! Stay indoors and focus on mobility or stretching.'
  }
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
