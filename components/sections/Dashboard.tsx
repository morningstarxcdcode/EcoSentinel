'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Thermometer, Wind, Droplets, Gauge } from 'lucide-react'

interface DashboardProps {
  data: any
}

export function Dashboard({ data }: DashboardProps) {
  const getSystemStatus = (riskLevel: string) => {
    if (riskLevel === 'low') return 'All Systems Operational';
    if (riskLevel === 'medium') return 'Monitoring Conditions';
    return 'Environmental Alert';
  };

  const metrics = [
    {
      title: 'Air Quality Index',
      value: data?.airQuality || 75,
      unit: 'AQI',
      icon: Gauge,
      trend: data?.airQuality > 100 ? 'down' : 'up',
      change: data?.airQualityDescription || 'Moderate',
      status: data?.airQuality > 100 ? 'poor' : data?.airQuality > 50 ? 'moderate' : 'good',
      color: data?.airQuality > 100 ? 'red' : data?.airQuality > 50 ? 'orange' : 'green'
    },
    {
      title: 'Temperature',
      value: data?.temperature || 22.5,
      unit: '°C',
      icon: Thermometer,
      trend: data?.temperature > 25 ? 'up' : 'down',
      change: data?.weatherDescription || 'Partly cloudy',
      status: data?.temperature > 30 || data?.temperature < 0 ? 'poor' : 'good',
      color: data?.temperature > 30 ? 'red' : data?.temperature < 10 ? 'blue' : 'green'
    },
    {
      title: 'Humidity',
      value: data?.humidity || 65,
      unit: '%',
      icon: Droplets,
      trend: data?.humidity > 70 ? 'up' : 'down',
      change: data?.humidity > 80 ? 'High' : data?.humidity < 30 ? 'Low' : 'Normal',
      status: data?.humidity > 80 || data?.humidity < 30 ? 'moderate' : 'good',
      color: data?.humidity > 80 ? 'orange' : 'teal'
    },
    {
      title: 'Wind Speed',
      value: data?.windSpeed || 12.3,
      unit: 'km/h',
      icon: Wind,
      trend: data?.windSpeed > 20 ? 'up' : 'down',
      change: data?.windSpeed > 30 ? 'Strong' : data?.windSpeed < 5 ? 'Calm' : 'Moderate',
      status: data?.windSpeed > 50 ? 'poor' : 'good',
      color: data?.windSpeed > 30 ? 'orange' : 'green'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-orange-600 bg-orange-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      teal: 'from-teal-500 to-teal-600',
      red: 'from-red-500 to-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
            Live Environmental
            <span className="gradient-text block">Dashboard</span>
          </h2>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Real-time environmental monitoring with AI-powered insights and predictions.
          </p>
        </motion.div>

        {/* Dashboard Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl mx-auto"
        >
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  data?.dataSource === 'live' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="text-sm font-medium text-gray-600">
                  {data?.dataSource === 'live' ? 'Live Data' : 'Demo Data'}
                </span>
              </div>
              {data?.location && (
                <div className="text-sm text-gray-500">
                  📍 {data.location.name}, {data.location.country}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">
                {getSystemStatus(data?.riskLevel || 'low')}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getMetricColor(metric.color)} flex items-center justify-center`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>

                {/* Value */}
                <div className="mb-2">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-secondary-900">
                      {metric.value}
                    </span>
                    <span className="text-sm text-secondary-500">
                      {metric.unit}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600 mt-1">
                    {metric.title}
                  </p>
                </div>

                {/* Trend */}
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-secondary-500">vs yesterday</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  AI Environmental Insights
                </h3>
                <p className="text-secondary-700 mb-4">
                  Current air quality is moderate with improving trends. Temperature patterns suggest stable weather conditions for the next 48 hours. Recommended actions: limit outdoor activities during peak hours (2-4 PM).
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-primary-700">
                    94% Confidence
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-green-700">
                    Improving Trend
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700">
                    7-Day Forecast Available
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View Detailed Analysis
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Download Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-secondary-100 text-secondary-700 px-6 py-3 rounded-lg font-semibold hover:bg-secondary-200 transition-colors"
            >
              Set Alerts
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
