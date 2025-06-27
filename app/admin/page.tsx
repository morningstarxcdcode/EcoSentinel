'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Users, Globe, Zap, TrendingUp, AlertTriangle,
  Settings, Database, Activity, Shield, Download, RefreshCw,
  Eye, Brain, Server, Cpu, HardDrive, Wifi, Clock,
  CheckCircle, XCircle, AlertCircle, Info, Filter,
  Calendar, Search, Bell, User, LogOut, Menu, X
} from 'lucide-react'

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  dataPoints: number
  predictions: number
  accuracy: number
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
}

interface UserAnalytics {
  totalRegistrations: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  userGrowthRate: number
  topLocations: Array<{ location: string; users: number }>
  userEngagement: {
    averageSessionTime: number
    pagesPerSession: number
    bounceRate: number
  }
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  services: Array<{
    name: string
    status: 'online' | 'offline' | 'degraded'
    responseTime: number
    uptime: number
    lastCheck: string
  }>
  resources: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  alerts: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
    resolved: boolean
  }>
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSystemMetrics({
        totalUsers: 12847,
        activeUsers: 3421,
        dataPoints: 2847392,
        predictions: 184729,
        accuracy: 94.2,
        uptime: 99.97,
        responseTime: 187,
        errorRate: 0.03,
        throughput: 1247
      })

      setUserAnalytics({
        totalRegistrations: 12847,
        dailyActiveUsers: 3421,
        weeklyActiveUsers: 8934,
        monthlyActiveUsers: 11203,
        userGrowthRate: 23.4,
        topLocations: [
          { location: 'San Francisco', users: 2341 },
          { location: 'New York', users: 1987 },
          { location: 'London', users: 1654 },
          { location: 'Tokyo', users: 1432 },
          { location: 'Berlin', users: 1203 }
        ],
        userEngagement: {
          averageSessionTime: 847,
          pagesPerSession: 4.2,
          bounceRate: 23.1
        }
      })

      setSystemHealth({
        status: 'healthy',
        services: [
          { name: 'API Gateway', status: 'online', responseTime: 45, uptime: 99.99, lastCheck: new Date().toISOString() },
          { name: 'AI Service', status: 'online', responseTime: 123, uptime: 99.95, lastCheck: new Date().toISOString() },
          { name: 'Database', status: 'online', responseTime: 23, uptime: 99.98, lastCheck: new Date().toISOString() },
          { name: 'Cache', status: 'online', responseTime: 12, uptime: 99.99, lastCheck: new Date().toISOString() },
          { name: 'WebSocket', status: 'online', responseTime: 34, uptime: 99.97, lastCheck: new Date().toISOString() }
        ],
        resources: {
          cpu: 34,
          memory: 67,
          disk: 45,
          network: 23
        },
        alerts: [
          { id: '1', type: 'warning', message: 'High memory usage detected on AI service', timestamp: new Date().toISOString(), resolved: false },
          { id: '2', type: 'info', message: 'Scheduled maintenance completed successfully', timestamp: new Date().toISOString(), resolved: true }
        ]
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'system', name: 'System Health', icon: Activity },
    { id: 'ai-models', name: 'AI Models', icon: Brain },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'offline':
      case 'critical':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return CheckCircle
      case 'warning':
      case 'degraded':
        return AlertCircle
      case 'offline':
      case 'critical':
        return XCircle
      default:
        return Info
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">EcoSentinel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@ecosentinel.com</p>
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-14'}`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              {isLoading && (
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadDashboardData}
                className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemMetrics && [
                  { label: 'Total Users', value: systemMetrics.totalUsers.toLocaleString(), icon: Users, color: 'blue' },
                  { label: 'Active Users', value: systemMetrics.activeUsers.toLocaleString(), icon: Activity, color: 'green' },
                  { label: 'Data Points', value: `${(systemMetrics.dataPoints / 1000000).toFixed(1)}M`, icon: Database, color: 'purple' },
                  { label: 'AI Accuracy', value: `${systemMetrics.accuracy}%`, icon: Brain, color: 'orange' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center`}>
                        <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* System Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                  {systemMetrics && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="text-sm font-medium text-green-600">{systemMetrics.uptime}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="text-sm font-medium text-blue-600">{systemMetrics.responseTime}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Error Rate</span>
                        <span className="text-sm font-medium text-red-600">{systemMetrics.errorRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Throughput</span>
                        <span className="text-sm font-medium text-purple-600">{systemMetrics.throughput} req/min</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resource Usage */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
                  {systemHealth && (
                    <div className="space-y-4">
                      {Object.entries(systemHealth.resources).map(([resource, usage]) => (
                        <div key={resource} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{resource}</span>
                            <span className="text-sm font-medium text-gray-900">{usage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                usage > 80 ? 'bg-red-500' : usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Services Status */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Status</h3>
                {systemHealth && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemHealth.services.map((service) => {
                      const StatusIcon = getStatusIcon(service.status)
                      return (
                        <div key={service.name} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status).split(' ')[0]}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.responseTime}ms • {service.uptime}% uptime</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && userAnalytics && (
            <div className="space-y-6">
              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: userAnalytics.totalRegistrations.toLocaleString(), change: '+12%' },
                  { label: 'Daily Active', value: userAnalytics.dailyActiveUsers.toLocaleString(), change: '+8%' },
                  { label: 'Weekly Active', value: userAnalytics.weeklyActiveUsers.toLocaleString(), change: '+15%' },
                  { label: 'Monthly Active', value: userAnalytics.monthlyActiveUsers.toLocaleString(), change: '+23%' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                <div className="space-y-3">
                  {userAnalytics.topLocations.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{location.location}</span>
                      </div>
                      <span className="text-sm text-gray-600">{location.users.toLocaleString()} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content would go here */}
          {activeTab !== 'overview' && activeTab !== 'users' && (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Dashboard
              </h3>
              <p className="text-gray-600">
                This section is under development. Advanced {activeTab.replace('-', ' ')} features coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
