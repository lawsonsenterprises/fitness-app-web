'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2, MapPin, CloudSun, CloudFog, Settings, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const { postcode, updatePostcode } = useAuth()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [postcodeInput, setPostcodeInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      if (!apiKey) {
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
      setError(null)
    } catch {
      setError('Unable to load weather')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchWeatherByPostcode = useCallback(async (postcodeToUse: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      if (!apiKey) {
        setError('Weather not configured')
        setIsLoading(false)
        return
      }

      // Use OpenWeatherMap geocoding API for UK postcodes
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/zip?zip=${postcodeToUse},GB&appid=${apiKey}`
      )

      if (!geoResponse.ok) {
        throw new Error('Invalid postcode')
      }

      const geoData = await geoResponse.json()
      await fetchWeatherByCoords(geoData.lat, geoData.lon)
    } catch {
      setError('Invalid postcode')
      setIsLoading(false)
    }
  }, [fetchWeatherByCoords])

  useEffect(() => {
    const getLocationAndWeather = () => {
      // If user has a saved postcode, use that
      if (postcode) {
        fetchWeatherByPostcode(postcode)
        return
      }

      // Otherwise try geolocation
      if (!navigator.geolocation) {
        setError('Location not supported')
        setIsLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // User denied location or error - fallback to London
          fetchWeatherByCoords(51.5074, -0.1278)
        },
        { timeout: 10000 }
      )
    }

    getLocationAndWeather()
  }, [postcode, fetchWeatherByCoords, fetchWeatherByPostcode])

  const handleSavePostcode = async () => {
    if (!postcodeInput.trim()) return

    setIsSaving(true)
    const { error: saveError } = await updatePostcode(postcodeInput.trim().toUpperCase())
    setIsSaving(false)

    if (!saveError) {
      setShowSettings(false)
      setIsLoading(true)
      fetchWeatherByPostcode(postcodeInput.trim().toUpperCase())
    }
  }

  const handleOpenSettings = () => {
    setPostcodeInput(postcode || '')
    setShowSettings(true)
  }

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Settings modal
  if (showSettings) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Weather Location</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              UK Postcode
            </label>
            <Input
              type="text"
              placeholder="e.g. SW1A 1AA"
              value={postcodeInput}
              onChange={(e) => setPostcodeInput(e.target.value)}
              className="h-9"
            />
          </div>

          <Button
            onClick={handleSavePostcode}
            disabled={!postcodeInput.trim() || isSaving}
            className="w-full h-9 gap-2"
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Location
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Set your postcode to get accurate local weather
          </p>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm flex-1">
            {error || 'Weather unavailable'}
          </div>
          <button
            onClick={handleOpenSettings}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
            title="Weather settings"
          >
            <Settings className="h-4 w-4" />
          </button>
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
          <div className="flex items-center justify-end gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{weather.location}</span>
            </div>
            <button
              onClick={handleOpenSettings}
              className="p-1 rounded hover:bg-muted text-muted-foreground ml-1"
              title="Change location"
            >
              <Settings className="h-3 w-3" />
            </button>
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
