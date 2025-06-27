const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8
});

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'websocket-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/websocket-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/websocket-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for HTTP endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// In-memory stores (in production, use Redis)
const connectedUsers = new Map();
const roomUsers = new Map();
const environmentalDataCache = new Map();
const userLocations = new Map();

// Advanced environmental data simulator
class EnvironmentalDataSimulator {
  constructor() {
    this.locations = [
      'San Francisco', 'New York', 'London', 'Tokyo', 'Sydney',
      'Berlin', 'Paris', 'Toronto', 'Singapore', 'Mumbai'
    ];
    this.baseData = new Map();
    this.initializeBaseData();
    this.startSimulation();
  }

  initializeBaseData() {
    this.locations.forEach(location => {
      this.baseData.set(location, {
        airQuality: 50 + Math.random() * 100,
        temperature: 15 + Math.random() * 20,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 20,
        pressure: 1000 + Math.random() * 50,
        co2Level: 400 + Math.random() * 100,
        uvIndex: Math.random() * 12,
        noiseLevel: 30 + Math.random() * 50,
        waterQuality: 60 + Math.random() * 40,
        soilMoisture: 30 + Math.random() * 70,
        biodiversityIndex: 40 + Math.random() * 60,
        energyConsumption: 20 + Math.random() * 80,
        wasteGeneration: 10 + Math.random() * 90,
        treeCount: Math.floor(Math.random() * 1000),
        carbonFootprint: 20 + Math.random() * 80
      });
    });
  }

  generateRealtimeData(location) {
    const base = this.baseData.get(location) || this.baseData.get('San Francisco');
    const now = new Date();
    
    // Add realistic variations
    const timeOfDay = now.getHours();
    const dayOfWeek = now.getDay();
    const seasonFactor = Math.sin((now.getMonth() / 12) * 2 * Math.PI);
    
    // Traffic and activity patterns
    const rushHourFactor = (timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19) ? 1.3 : 1.0;
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.0;
    
    const data = {
      location,
      timestamp: now.toISOString(),
      airQuality: Math.max(0, Math.min(500, base.airQuality + 
        (Math.random() - 0.5) * 10 + 
        rushHourFactor * 15 + 
        seasonFactor * 5)),
      temperature: base.temperature + 
        (Math.random() - 0.5) * 3 + 
        seasonFactor * 10 + 
        Math.sin((timeOfDay / 24) * 2 * Math.PI) * 5,
      humidity: Math.max(0, Math.min(100, base.humidity + 
        (Math.random() - 0.5) * 5 + 
        seasonFactor * 10)),
      windSpeed: Math.max(0, base.windSpeed + (Math.random() - 0.5) * 3),
      pressure: base.pressure + (Math.random() - 0.5) * 5,
      co2Level: Math.max(350, base.co2Level + 
        (Math.random() - 0.5) * 20 + 
        rushHourFactor * 30 * weekendFactor),
      uvIndex: Math.max(0, Math.min(12, 
        Math.sin(Math.max(0, (timeOfDay - 6) / 12) * Math.PI) * 10 + 
        seasonFactor * 2 + 
        (Math.random() - 0.5) * 1)),
      noiseLevel: Math.max(20, Math.min(120, base.noiseLevel + 
        (Math.random() - 0.5) * 10 + 
        rushHourFactor * 20 * weekendFactor)),
      waterQuality: Math.max(0, Math.min(100, base.waterQuality + (Math.random() - 0.5) * 2)),
      soilMoisture: Math.max(0, Math.min(100, base.soilMoisture + 
        (Math.random() - 0.5) * 5 + 
        seasonFactor * 15)),
      biodiversityIndex: Math.max(0, Math.min(100, base.biodiversityIndex + (Math.random() - 0.5) * 1)),
      energyConsumption: Math.max(0, Math.min(100, base.energyConsumption + 
        (Math.random() - 0.5) * 10 + 
        rushHourFactor * 20 * weekendFactor)),
      wasteGeneration: Math.max(0, Math.min(100, base.wasteGeneration + 
        (Math.random() - 0.5) * 5 + 
        weekendFactor * -10)),
      treeCount: base.treeCount + Math.floor((Math.random() - 0.5) * 2),
      carbonFootprint: Math.max(0, Math.min(100, base.carbonFootprint + 
        (Math.random() - 0.5) * 5 + 
        rushHourFactor * 15 * weekendFactor)),
      riskLevel: this.calculateRiskLevel(base),
      aiPredictions: this.generateAIPredictions(base),
      anomalies: this.detectAnomalies(base),
      trends: this.calculateTrends(location)
    };

    // Update base data slightly for next iteration
    Object.keys(base).forEach(key => {
      if (typeof base[key] === 'number') {
        base[key] += (Math.random() - 0.5) * 0.1;
      }
    });

    return data;
  }

  calculateRiskLevel(data) {
    const riskFactors = [
      data.airQuality / 100,
      Math.max(0, (data.temperature - 35) / 10),
      Math.max(0, (data.uvIndex - 8) / 4),
      Math.max(0, (data.noiseLevel - 70) / 30),
      Math.max(0, (100 - data.waterQuality) / 100)
    ];

    const avgRisk = riskFactors.reduce((sum, risk) => sum + risk, 0) / riskFactors.length;
    
    if (avgRisk < 0.3) return 'low';
    if (avgRisk < 0.6) return 'moderate';
    if (avgRisk < 0.8) return 'high';
    return 'critical';
  }

  generateAIPredictions(data) {
    return {
      next1h: {
        airQuality: data.airQuality + (Math.random() - 0.5) * 5,
        temperature: data.temperature + (Math.random() - 0.5) * 2,
        confidence: 0.85 + Math.random() * 0.1
      },
      next6h: {
        airQuality: data.airQuality + (Math.random() - 0.5) * 15,
        temperature: data.temperature + (Math.random() - 0.5) * 5,
        confidence: 0.75 + Math.random() * 0.15
      },
      next24h: {
        airQuality: data.airQuality + (Math.random() - 0.5) * 25,
        temperature: data.temperature + (Math.random() - 0.5) * 8,
        confidence: 0.65 + Math.random() * 0.2
      },
      next7days: {
        trend: Math.random() > 0.5 ? 'improving' : 'declining',
        confidence: 0.70 + Math.random() * 0.2
      }
    };
  }

  detectAnomalies(data) {
    const anomalies = [];
    
    if (data.airQuality > 150) {
      anomalies.push({
        type: 'air_quality_spike',
        severity: data.airQuality > 200 ? 'critical' : 'high',
        description: 'Unusual spike in air pollution detected',
        recommendation: 'Limit outdoor activities and use air purifiers'
      });
    }

    if (data.temperature > 35) {
      anomalies.push({
        type: 'heat_wave',
        severity: data.temperature > 40 ? 'critical' : 'moderate',
        description: 'Extreme temperature conditions',
        recommendation: 'Stay hydrated and avoid prolonged sun exposure'
      });
    }

    if (data.noiseLevel > 85) {
      anomalies.push({
        type: 'noise_pollution',
        severity: 'moderate',
        description: 'High noise levels detected',
        recommendation: 'Use hearing protection in affected areas'
      });
    }

    return anomalies;
  }

  calculateTrends(location) {
    // Simplified trend calculation
    return {
      improving: ['waterQuality', 'biodiversityIndex'],
      declining: ['airQuality', 'carbonFootprint'],
      stable: ['temperature', 'humidity']
    };
  }

  startSimulation() {
    setInterval(() => {
      this.locations.forEach(location => {
        const data = this.generateRealtimeData(location);
        environmentalDataCache.set(location, data);
        
        // Broadcast to all connected clients interested in this location
        io.emit('environmental-data', data);
        
        // Broadcast to location-specific rooms
        io.to(`location:${location}`).emit('location-specific-data', data);
      });
    }, 5000); // Update every 5 seconds

    // Generate AI predictions every minute
    setInterval(() => {
      this.locations.forEach(location => {
        const predictions = this.generateAdvancedPredictions(location);
        io.emit('ai-predictions', { location, predictions });
      });
    }, 60000);

    // System health updates every 30 seconds
    setInterval(() => {
      const systemHealth = this.generateSystemHealth();
      io.emit('system-health', systemHealth);
    }, 30000);
  }

  generateAdvancedPredictions(location) {
    return {
      shortTerm: {
        timeframe: '1-6 hours',
        predictions: {
          airQuality: { value: 75, confidence: 0.92, trend: 'improving' },
          temperature: { value: 23.5, confidence: 0.88, trend: 'stable' }
        }
      },
      longTerm: {
        timeframe: '1-7 days',
        predictions: {
          airQuality: { value: 68, confidence: 0.76, trend: 'improving' },
          temperature: { value: 25.2, confidence: 0.82, trend: 'increasing' }
        }
      }
    };
  }

  generateSystemHealth() {
    return {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      metrics: {
        connectedUsers: connectedUsers.size,
        activeRooms: roomUsers.size,
        dataPointsPerSecond: 50 + Math.floor(Math.random() * 100),
        averageLatency: 45 + Math.floor(Math.random() * 50),
        cpuUsage: 20 + Math.random() * 60,
        memoryUsage: 40 + Math.random() * 40,
        networkThroughput: 1000 + Math.random() * 5000
      },
      services: {
        database: { status: 'online', responseTime: 23 },
        aiService: { status: 'online', responseTime: 156 },
        cache: { status: 'online', responseTime: 12 },
        externalAPIs: { status: 'online', responseTime: 234 }
      }
    };
  }
}

// Initialize the environmental data simulator
const dataSimulator = new EnvironmentalDataSimulator();

// Authentication middleware for Socket.IO
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    // Allow anonymous connections for demo purposes
    socket.userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    logger.error('Socket authentication failed:', err);
    next(new Error('Authentication failed'));
  }
};

// Socket.IO connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId} (${socket.id})`);
  
  // Store connected user
  connectedUsers.set(socket.id, {
    userId: socket.userId,
    userEmail: socket.userEmail,
    connectedAt: new Date(),
    lastActivity: new Date(),
    location: null,
    subscriptions: new Set()
  });

  // Send initial data
  socket.emit('connection-established', {
    userId: socket.userId,
    timestamp: new Date().toISOString(),
    availableLocations: dataSimulator.locations
  });

  // Send cached environmental data
  environmentalDataCache.forEach((data, location) => {
    socket.emit('environmental-data', data);
  });

  // Handle location updates
  socket.on('location-update', (locationData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.location = locationData;
      user.lastActivity = new Date();
      userLocations.set(socket.userId, locationData);
      
      // Join location-specific room
      if (locationData.address) {
        socket.join(`location:${locationData.address}`);
      }
      
      logger.info(`User ${socket.userId} updated location: ${locationData.address}`);
    }
  });

  // Handle subscription to specific metrics
  socket.on('subscribe-metrics', (metrics) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      metrics.forEach(metric => user.subscriptions.add(metric));
      socket.emit('subscription-confirmed', { metrics, timestamp: new Date() });
    }
  });

  // Handle historical data requests
  socket.on('request-historical-data', (params) => {
    // Simulate historical data generation
    const historicalData = generateHistoricalData(params);
    socket.emit('historical-data', {
      requestId: params.requestId,
      data: historicalData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle community room joining
  socket.on('join-community', (data) => {
    const roomName = `community:${data.communityId}`;
    socket.join(roomName);
    
    if (!roomUsers.has(roomName)) {
      roomUsers.set(roomName, new Set());
    }
    roomUsers.get(roomName).add(socket.userId);
    
    // Notify room members
    socket.to(roomName).emit('user-joined-community', {
      userId: socket.userId,
      communityId: data.communityId,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`User ${socket.userId} joined community: ${data.communityId}`);
  });

  // Handle real-time chat in communities
  socket.on('community-message', (data) => {
    const roomName = `community:${data.communityId}`;
    socket.to(roomName).emit('community-message', {
      ...data,
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle heartbeat
  socket.on('heartbeat', (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.lastActivity = new Date();
    }
    socket.emit('heartbeat-ack', { timestamp: new Date().toISOString() });
  });

  // Handle anomaly reporting
  socket.on('report-anomaly', (anomalyData) => {
    const anomaly = {
      ...anomalyData,
      reportedBy: socket.userId,
      timestamp: new Date().toISOString(),
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Broadcast anomaly to relevant users
    io.emit('anomaly-alert', anomaly);
    
    logger.info(`Anomaly reported by ${socket.userId}:`, anomaly);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.info(`User disconnected: ${socket.userId} (${socket.id}) - Reason: ${reason}`);
    
    // Clean up user data
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Remove from community rooms
      roomUsers.forEach((users, roomName) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(roomName).emit('user-left-community', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      });
    }
    
    connectedUsers.delete(socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for user ${socket.userId}:`, error);
  });
});

// Helper function to generate historical data
function generateHistoricalData(params) {
  const { location, timeRange, metrics } = params;
  const data = [];
  const now = new Date();
  const intervals = {
    '1h': { count: 12, interval: 5 * 60 * 1000 }, // 5 min intervals
    '24h': { count: 24, interval: 60 * 60 * 1000 }, // 1 hour intervals
    '7d': { count: 7, interval: 24 * 60 * 60 * 1000 }, // 1 day intervals
    '30d': { count: 30, interval: 24 * 60 * 60 * 1000 } // 1 day intervals
  };

  const config = intervals[timeRange] || intervals['24h'];
  
  for (let i = config.count; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * config.interval));
    const dataPoint = dataSimulator.generateRealtimeData(location);
    dataPoint.timestamp = timestamp.toISOString();
    data.push(dataPoint);
  }

  return data;
}

// HTTP endpoints for WebSocket server
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WebSocket Server',
    connectedUsers: connectedUsers.size,
    activeRooms: roomUsers.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/stats', (req, res) => {
  const stats = {
    connectedUsers: connectedUsers.size,
    activeRooms: roomUsers.size,
    totalDataPoints: environmentalDataCache.size,
    userLocations: userLocations.size,
    systemHealth: dataSimulator.generateSystemHealth(),
    timestamp: new Date().toISOString()
  };
  
  res.json(stats);
});

// Start the server
const PORT = process.env.WS_PORT || 8001;
server.listen(PORT, () => {
  logger.info(`🌍 EcoSentinel WebSocket Server running on port ${PORT}`);
  console.log(`🚀 WebSocket Server: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('WebSocket server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
