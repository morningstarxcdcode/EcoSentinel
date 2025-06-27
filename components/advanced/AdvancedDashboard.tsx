'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Zap, Thermometer, Wind, Droplets, Gauge, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Eye, Brain, Leaf, Recycle, Sun, Moon, Cloud, 
  Activity, BarChart3, PieChart, LineChart, Map,
  Layers, Filter, Settings, Download, Share2,
  Play, Pause, SkipForward, RotateCcw, Maximize2
} from 'lucide-react'
import { wsManager, EnvironmentalDataStream } from '@/lib/websocket'

interface AdvancedMetric {
  id: string
  name: string
  value: number
  unit: string
  icon: React.ComponentType<any>
  color: string
  trend: 'up' | 'down' | 'stable'
  change: number
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical'
  description: string
  recommendations: string[]
  historicalData: number[]
  prediction: {
    next1h: number
    next6h: number
    next24h: number
    confidence: number
  }
}

export function AdvancedDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataStream | null>(null)
  const [selectedLocation, setSelectedLocation] = useState('Global')
  const [timeRange, setTimeRange] = useState('24h')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | '3d' | 'map'>('grid')
  const [isPlaying, setIsPlaying] = useState(true)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['all'])
  const [alerts, setAlerts] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Advanced metrics configuration
  const advancedMetrics: AdvancedMetric[] = useMemo(() => [
    {
      id: 'air-quality',
      name: 'Air Quality Index',
      value: environmentalData?.airQuality || 75,
      unit: 'AQI',
      icon: Gauge,
      color: 'from-blue-500 to-blue-600',
      trend: 'down',
      change: -5.2,
      status: 'moderate',
      description: 'Current air quality conditions',
      recommendations: ['Use air purifier', 'Limit outdoor activities'],
      historicalData: [80, 78, 75, 73, 75, 77, 75],
      prediction: { next1h: 73, next6h: 70, next24h: 68, confidence: 0.94 }
    },
    {
      id: 'temperature',
      name: 'Temperature',
      value: environmentalData?.temperature || 22.5,
      unit: '°C',
      icon: Thermometer,
      color: 'from-red-500 to-red-600',
      trend: 'up',
      change: 2.1,
      status: 'good',
      description: 'Ambient temperature reading',
      recommendations: ['Stay hydrated', 'Dress appropriately'],
      historicalData: [20, 21, 22, 23, 22.5, 23, 22.5],
      prediction: { next1h: 23, next6h: 24, next24h: 25, confidence: 0.89 }
    },
    {
      id: 'humidity',
      name: 'Humidity',
      value: environmentalData?.humidity || 65,
      unit: '%',
      icon: Droplets,
      color: 'from-cyan-500 to-cyan-600',
      trend: 'stable',
      change: 0.5,
      status: 'good',
      description: 'Relative humidity levels',
      recommendations: ['Maintain indoor ventilation'],
      historicalData: [63, 64, 65, 66, 65, 64, 65],
      prediction: { next1h: 66, next6h: 67, next24h: 68, confidence: 0.87 }
    },
    {
      id: 'wind-speed',
      name: 'Wind Speed',
      value: environmentalData?.windSpeed || 12.3,
      unit: 'km/h',
      icon: Wind,
      color: 'from-green-500 to-green-600',
      trend: 'up',
      change: 3.2,
      status: 'excellent',
      description: 'Current wind conditions',
      recommendations: ['Good for outdoor activities'],
      historicalData: [10, 11, 12, 13, 12.3, 13, 12.3],
      prediction: { next1h: 13, next6h: 14, next24h: 15, confidence: 0.82 }
    },
    {
      id: 'uv-index',
      name: 'UV Index',
      value: environmentalData?.uvIndex || 6,
      unit: 'UVI',
      icon: Sun,
      color: 'from-yellow-500 to-yellow-600',
      trend: 'up',
      change: 1.5,
      status: 'moderate',
      description: 'Ultraviolet radiation levels',
      recommendations: ['Use sunscreen', 'Wear protective clothing'],
      historicalData: [4, 5, 6, 7, 6, 5, 6],
      prediction: { next1h: 7, next6h: 8, next24h: 5, confidence: 0.91 }
    },
    {
      id: 'noise-level',
      name: 'Noise Level',
      value: environmentalData?.noiseLevel || 55,
      unit: 'dB',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      trend: 'down',
      change: -2.8,
      status: 'good',
      description: 'Ambient noise pollution',
      recommendations: ['Quiet environment maintained'],
      historicalData: [58, 57, 55, 54, 55, 56, 55],
      prediction: { next1h: 54, next6h: 52, next24h: 50, confidence: 0.85 }
    },
    {
      id: 'water-quality',
      name: 'Water Quality',
      value: environmentalData?.waterQuality || 85,
      unit: 'WQI',
      icon: Droplets,
      color: 'from-blue-500 to-teal-600',
      trend: 'up',
      change: 3.1,
      status: 'good',
      description: 'Local water quality index',
      recommendations: ['Safe for consumption'],
      historicalData: [82, 83, 85, 86, 85, 84, 85],
      prediction: { next1h: 86, next6h: 87, next24h: 88, confidence: 0.88 }
    },
    {
      id: 'biodiversity',
      name: 'Biodiversity Index',
      value: environmentalData?.biodiversityIndex || 72,
      unit: 'BDI',
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      trend: 'stable',
      change: 0.8,
      status: 'good',
      description: 'Local ecosystem health',
      recommendations: ['Support conservation efforts'],
      historicalData: [70, 71, 72, 73, 72, 71, 72],
      prediction: { next1h: 72, next6h: 73, next24h: 74, confidence: 0.79 }
    },
    {
      id: 'carbon-footprint',
      name: 'Carbon Footprint',
      value: environmentalData?.carbonFootprint || 45,
      unit: 'CO₂e',
      icon: Recycle,
      color: 'from-orange-500 to-red-600',
      trend: 'down',
      change: -4.2,
      status: 'moderate',
      description: 'Local carbon emissions',
      recommendations: ['Use renewable energy', 'Reduce consumption'],
      historicalData: [50, 48, 45, 43, 45, 47, 45],
      prediction: { next1h: 44, next6h: 42, next24h: 40, confidence: 0.92 }
    }
  ], [environmentalData])

  // WebSocket connection management
  useEffect(() => {
    const handleConnection = (status: any) => {
      setIsConnected(status.status === 'connected')
    }

    const handleEnvironmentalData = (data: EnvironmentalDataStream) => {
      setEnvironmentalData(data)
    }

    const handleAnomalyAlert = (alert: any) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]) // Keep last 10 alerts
    }

    const handleSystemHealth = (health: any) => {
      setSystemHealth(health)
    }

    wsManager.subscribe('connection', handleConnection)
    wsManager.subscribe('environmental-data', handleEnvironmentalData)
    wsManager.subscribe('anomaly-alert', handleAnomalyAlert)
    wsManager.subscribe('system-health', handleSystemHealth)

    return () => {
      wsManager.unsubscribe('connection', handleConnection)
      wsManager.unsubscribe('environmental-data', handleEnvironmentalData)
      wsManager.unsubscribe('anomaly-alert', handleAnomalyAlert)
      wsManager.unsubscribe('system-health', handleSystemHealth)
    }
  }, [])

  // 3D Visualization Canvas
  useEffect(() => {
    const drawEnvironmentalSphere = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Create gradient for 3D effect
      const gradient = ctx.createRadialGradient(x - 30, y - 30, 0, x, y, radius)
      gradient.addColorStop(0, '#4ade80')
      gradient.addColorStop(0.7, '#22c55e')
      gradient.addColorStop(1, '#15803d')

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Add data points around the sphere
      advancedMetrics.forEach((metric, index) => {
        const angle = (index / advancedMetrics.length) * Math.PI * 2
        const pointX = x + Math.cos(angle) * (radius + 20)
        const pointY = y + Math.sin(angle) * (radius + 20)

        ctx.beginPath()
        ctx.arc(pointX, pointY, 5, 0, Math.PI * 2)
        ctx.fillStyle = getStatusColor(metric.status)
        ctx.fill()

        // Add metric labels
        ctx.fillStyle = '#374151'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(metric.name, pointX, pointY + 20)
        ctx.fillText(`${metric.value}${metric.unit}`, pointX, pointY + 35)
      })
    }

    if (viewMode === '3d' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw 3D-like environmental visualization
        drawEnvironmentalSphere(ctx, canvas.width / 2, canvas.height / 2, 100)
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animate()

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [viewMode, isPlaying, advancedMetrics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981'
      case 'good': return '#22c55e'
      case 'moderate': return '#f59e0b'
      case 'poor': return '#ef4444'
      case 'critical': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return CheckCircle
      case 'moderate':
        return AlertTriangle
      case 'poor':
      case 'critical':
        return AlertTriangle
      default:
        return AlertTriangle
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Activity
    }
  }

  const filteredMetrics = selectedMetrics.includes('all') 
    ? advancedMetrics 
    : advancedMetrics.filter(metric => selectedMetrics.includes(metric.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Advanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold gradient-text">EcoSentinel Pro</h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-600">
                  {isConnected ? 'Live Data' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Location Selector */}
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Global">Global</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="London">London</option>
                <option value="Tokyo">Tokyo</option>
              </select>

              {/* Time Range */}
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { mode: 'grid', icon: BarChart3 },
                  { mode: 'list', icon: LineChart },
                  { mode: '3d', icon: Globe },
                  { mode: 'map', icon: Map }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === mode 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Alerts Bar */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Environmental Alert</h3>
                  <p className="text-sm opacity-90">{alerts[0]?.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics Filter */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Environmental Metrics</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                multiple
                value={selectedMetrics}
                onChange={(e) => setSelectedMetrics(Array.from(e.target.selectedOptions, option => option.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Metrics</option>
                {advancedMetrics.map(metric => (
                  <option key={metric.id} value={metric.id}>{metric.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {viewMode === '3d' ? (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3D Environmental Visualization</h3>
              <p className="text-gray-600">Interactive real-time environmental data sphere</p>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="mx-auto border border-gray-200 rounded-lg"
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                      <metric.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                      <p className="text-sm text-gray-500">{metric.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getStatusIcon(metric.status), {
                      className: `w-5 h-5 ${getStatusColor(metric.status)}`
                    })}
                  </div>
                </div>

                {/* Metric Value */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {metric.value}
                    </span>
                    <span className="text-lg text-gray-500">{metric.unit}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {React.createElement(getTrendIcon(metric.trend), {
                      className: `w-4 h-4 ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`
                    })}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-xs text-gray-500">vs last hour</span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="mb-4">
                  <div className="h-16 flex items-end space-x-1">
                    {metric.historicalData.map((value, i) => (
                      <div
                        key={i}
                        className={`flex-1 bg-gradient-to-t ${metric.color} rounded-t opacity-70`}
                        style={{ height: `${(value / Math.max(...metric.historicalData)) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Predictions */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">AI Predictions</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{metric.prediction.next1h}{metric.unit}</div>
                      <div className="text-gray-500">1h</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{metric.prediction.next6h}{metric.unit}</div>
                      <div className="text-gray-500">6h</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{metric.prediction.next24h}{metric.unit}</div>
                      <div className="text-gray-500">24h</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Confidence: {Math.round(metric.prediction.confidence * 100)}%
                  </div>
                </div>

                {/* Recommendations */}
                {metric.recommendations.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {metric.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-1">
                          <span className="text-primary-500">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {viewMode === 'list' ? 'Detailed Metrics List' : 'Environmental Map View'}
            </h3>
            <p className="text-gray-600">
              {viewMode === 'list' 
                ? 'Comprehensive list view with detailed analytics'
                : 'Interactive map visualization coming soon'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
