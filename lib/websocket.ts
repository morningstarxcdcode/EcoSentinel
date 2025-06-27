// Advanced WebSocket Manager for Real-time Environmental Data
import { io, Socket } from 'socket.io-client'

export interface EnvironmentalDataStream {
  location: string
  timestamp: string
  airQuality: number
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  co2Level: number
  uvIndex: number
  noiseLevel: number
  waterQuality: number
  soilMoisture: number
  biodiversityIndex: number
  energyConsumption: number
  wasteGeneration: number
  treeCount: number
  carbonFootprint: number
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  aiPredictions: {
    next1h: any
    next6h: any
    next24h: any
    next7days: any
  }
  anomalies: Array<{
    type: string
    severity: number
    description: string
    recommendation: string
  }>
  trends: {
    improving: string[]
    declining: string[]
    stable: string[]
  }
}

export class AdvancedWebSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private dataBuffer: EnvironmentalDataStream[] = []
  private subscribers: Map<string, Function[]> = new Map()

  constructor(private url: string) {
    this.initializeConnection()
  }

  private initializeConnection() {
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    })

    this.setupEventHandlers()
    this.startHeartbeat()
  }

  private setupEventHandlers() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('🌍 EcoSentinel WebSocket Connected')
      this.reconnectAttempts = 0
      this.emit('connection', { status: 'connected', timestamp: new Date() })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket Disconnected:', reason)
      this.emit('connection', { status: 'disconnected', reason, timestamp: new Date() })
      this.handleReconnection()
    })

    // Real-time environmental data
    this.socket.on('environmental-data', (data: EnvironmentalDataStream) => {
      this.processEnvironmentalData(data)
    })

    // AI predictions stream
    this.socket.on('ai-predictions', (predictions) => {
      this.emit('ai-predictions', predictions)
    })

    // Anomaly alerts
    this.socket.on('anomaly-alert', (alert) => {
      this.emit('anomaly-alert', {
        ...alert,
        timestamp: new Date(),
        id: `anomaly-${Date.now()}`
      })
    })

    // System health updates
    this.socket.on('system-health', (health) => {
      this.emit('system-health', health)
    })

    // Community updates
    this.socket.on('community-update', (update) => {
      this.emit('community-update', update)
    })

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket Error:', error)
      this.emit('error', error)
    })
  }

  private processEnvironmentalData(data: EnvironmentalDataStream) {
    // Add to buffer for offline support
    this.dataBuffer.push(data)
    if (this.dataBuffer.length > 1000) {
      this.dataBuffer = this.dataBuffer.slice(-1000) // Keep last 1000 entries
    }

    // Calculate derived metrics
    const enhancedData = {
      ...data,
      derivedMetrics: this.calculateDerivedMetrics(data),
      qualityScore: this.calculateQualityScore(data),
      healthImpact: this.calculateHealthImpact(data),
      recommendations: this.generateRecommendations(data)
    }

    this.emit('environmental-data', enhancedData)
  }

  private calculateDerivedMetrics(data: EnvironmentalDataStream) {
    return {
      airQualityTrend: this.calculateTrend('airQuality', data.airQuality),
      temperatureAnomaly: this.calculateAnomaly('temperature', data.temperature),
      comfortIndex: this.calculateComfortIndex(data.temperature, data.humidity),
      environmentalStress: this.calculateEnvironmentalStress(data),
      sustainabilityScore: this.calculateSustainabilityScore(data),
      biodiversityHealth: this.calculateBiodiversityHealth(data),
      carbonEfficiency: this.calculateCarbonEfficiency(data)
    }
  }

  private calculateQualityScore(data: EnvironmentalDataStream): number {
    const weights = {
      airQuality: 0.25,
      waterQuality: 0.20,
      soilMoisture: 0.15,
      biodiversityIndex: 0.15,
      noiseLevel: 0.10,
      carbonFootprint: 0.15
    }

    let score = 0
    score += (100 - data.airQuality) * weights.airQuality
    score += data.waterQuality * weights.waterQuality
    score += data.soilMoisture * weights.soilMoisture
    score += data.biodiversityIndex * weights.biodiversityIndex
    score += (100 - data.noiseLevel) * weights.noiseLevel
    score += (100 - data.carbonFootprint) * weights.carbonFootprint

    return Math.round(score)
  }

  private calculateHealthImpact(data: EnvironmentalDataStream) {
    const impacts = []
    
    if (data.airQuality > 100) {
      impacts.push({
        type: 'respiratory',
        severity: data.airQuality > 150 ? 'high' : 'moderate',
        description: 'Air quality may affect sensitive individuals'
      })
    }

    if (data.uvIndex > 7) {
      impacts.push({
        type: 'skin',
        severity: data.uvIndex > 10 ? 'high' : 'moderate',
        description: 'High UV exposure risk'
      })
    }

    if (data.noiseLevel > 70) {
      impacts.push({
        type: 'hearing',
        severity: data.noiseLevel > 85 ? 'high' : 'moderate',
        description: 'Noise levels may cause stress or hearing damage'
      })
    }

    return impacts
  }

  private generateRecommendations(data: EnvironmentalDataStream): string[] {
    const recommendations = []

    if (data.airQuality > 100) {
      recommendations.push('Consider wearing a mask outdoors')
      recommendations.push('Limit outdoor exercise activities')
      recommendations.push('Use air purifiers indoors')
    }

    if (data.carbonFootprint > 50) {
      recommendations.push('Switch to renewable energy sources')
      recommendations.push('Use public transportation or electric vehicles')
      recommendations.push('Implement energy-efficient practices')
    }

    if (data.biodiversityIndex < 30) {
      recommendations.push('Plant native species in your area')
      recommendations.push('Create wildlife-friendly spaces')
      recommendations.push('Support local conservation efforts')
    }

    return recommendations
  }

  private calculateTrend(metric: string, value: number): 'improving' | 'declining' | 'stable' {
    // Simplified trend calculation - in real app, use historical data
    const random = Math.random()
    if (random < 0.33) return 'improving'
    if (random < 0.66) return 'declining'
    return 'stable'
  }

  private calculateAnomaly(metric: string, value: number): number {
    // Simplified anomaly detection - in real app, use ML models
    return Math.random() * 100
  }

  private calculateComfortIndex(temp: number, humidity: number): number {
    // Heat index calculation
    if (temp < 80) return 100 - Math.abs(temp - 72) * 2
    
    const hi = -42.379 + 2.04901523 * temp + 10.14333127 * humidity
      - 0.22475541 * temp * humidity - 0.00683783 * temp * temp
      - 0.05481717 * humidity * humidity + 0.00122874 * temp * temp * humidity
      + 0.00085282 * temp * humidity * humidity - 0.00000199 * temp * temp * humidity * humidity

    return Math.max(0, 100 - (hi - temp) * 2)
  }

  private calculateEnvironmentalStress(data: EnvironmentalDataStream): number {
    const stressFactors = [
      data.airQuality / 100,
      data.noiseLevel / 100,
      (100 - data.waterQuality) / 100,
      data.carbonFootprint / 100,
      (100 - data.biodiversityIndex) / 100
    ]

    return Math.round(stressFactors.reduce((sum, factor) => sum + factor, 0) / stressFactors.length * 100)
  }

  private calculateSustainabilityScore(data: EnvironmentalDataStream): number {
    const sustainabilityFactors = [
      (100 - data.carbonFootprint) / 100,
      data.biodiversityIndex / 100,
      data.waterQuality / 100,
      (100 - data.wasteGeneration) / 100,
      data.treeCount / 100
    ]

    return Math.round(sustainabilityFactors.reduce((sum, factor) => sum + factor, 0) / sustainabilityFactors.length * 100)
  }

  private calculateBiodiversityHealth(data: EnvironmentalDataStream): 'excellent' | 'good' | 'fair' | 'poor' {
    if (data.biodiversityIndex >= 80) return 'excellent'
    if (data.biodiversityIndex >= 60) return 'good'
    if (data.biodiversityIndex >= 40) return 'fair'
    return 'poor'
  }

  private calculateCarbonEfficiency(data: EnvironmentalDataStream): number {
    return Math.max(0, 100 - data.carbonFootprint)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: new Date() })
      }
    }, 30000) // Every 30 seconds
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
        this.initializeConnection()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  // Public methods
  public subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    this.subscribers.get(event)!.push(callback)
  }

  public unsubscribe(event: string, callback: Function) {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  public sendLocationUpdate(location: { lat: number, lng: number, address: string }) {
    if (this.socket?.connected) {
      this.socket.emit('location-update', location)
    }
  }

  public requestHistoricalData(params: { location: string, timeRange: string, metrics: string[] }) {
    if (this.socket?.connected) {
      this.socket.emit('request-historical-data', params)
    }
  }

  public joinCommunityRoom(communityId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-community', { communityId })
    }
  }

  public getBufferedData(): EnvironmentalDataStream[] {
    return [...this.dataBuffer]
  }

  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected'
    if (this.socket.connected) return 'connected'
    return 'connecting'
  }

  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

// Singleton instance
export const wsManager = new AdvancedWebSocketManager(
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'
)
