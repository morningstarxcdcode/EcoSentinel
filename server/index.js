const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const redis = require('redis');
const winston = require('winston');
const prometheus = require('prom-client');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.API_PORT || 8000;

// Initialize logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ecosentinel-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Initialize Prometheus metrics
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.connect();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    // Check Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        redis: 'connected',
        ai_service: 'connected' // This would be checked in real implementation
      }
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies unavailable'
    });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
  } catch (error) {
    logger.error('Metrics endpoint error', error);
    res.status(500).end();
  }
});

// Environmental data endpoints
app.get('/api/v1/environmental-data', async (req, res) => {
  try {
    const { location, timeRange = '24h' } = req.query;
    
    // Check cache first
    const cacheKey = `env-data:${location}:${timeRange}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      logger.info('Serving cached environmental data');
      return res.json(JSON.parse(cachedData));
    }

    // Mock environmental data (in real app, this would fetch from various APIs)
    const environmentalData = {
      location: location || 'Global',
      timestamp: new Date().toISOString(),
      metrics: {
        airQuality: {
          aqi: Math.floor(Math.random() * 100) + 50,
          pm25: Math.floor(Math.random() * 50) + 10,
          pm10: Math.floor(Math.random() * 80) + 20,
          status: 'moderate'
        },
        climate: {
          temperature: Math.round((Math.random() * 30 + 10) * 10) / 10,
          humidity: Math.floor(Math.random() * 40) + 40,
          pressure: Math.floor(Math.random() * 50) + 1000,
          windSpeed: Math.round((Math.random() * 20) * 10) / 10
        },
        carbon: {
          co2Level: Math.floor(Math.random() * 50) + 400,
          trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          monthlyChange: Math.round((Math.random() * 10 - 5) * 10) / 10
        },
        riskAssessment: {
          level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
          factors: ['air_quality', 'temperature', 'humidity'],
          confidence: Math.floor(Math.random() * 20) + 80
        }
      },
      predictions: {
        next24h: {
          airQuality: 'improving',
          temperature: '+2°C',
          riskLevel: 'stable'
        },
        next7days: {
          trend: 'stable',
          extremeEvents: 'none_predicted',
          confidence: 0.94
        }
      }
    };

    // Cache the data for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(environmentalData));
    
    logger.info('Environmental data fetched successfully', { location, timeRange });
    res.json(environmentalData);
    
  } catch (error) {
    logger.error('Error fetching environmental data', error);
    res.status(500).json({
      error: 'Failed to fetch environmental data',
      message: 'Please try again later'
    });
  }
});

// AI insights endpoint
app.get('/api/v1/ai-insights', authenticateToken, async (req, res) => {
  try {
    const { location, analysisType = 'comprehensive' } = req.query;
    
    // Mock AI insights (in real app, this would call the Python AI service)
    const aiInsights = {
      analysisId: `ai_${Date.now()}`,
      timestamp: new Date().toISOString(),
      location: location || 'Global',
      analysisType,
      insights: {
        summary: 'Environmental conditions are within normal parameters with moderate air quality concerns.',
        keyFindings: [
          'Air quality has improved by 12% over the past week',
          'Temperature patterns suggest stable weather conditions',
          'CO2 levels are trending downward in urban areas'
        ],
        recommendations: [
          'Continue monitoring PM2.5 levels in industrial zones',
          'Implement green transportation initiatives',
          'Increase urban tree coverage by 15%'
        ],
        riskFactors: [
          {
            factor: 'Air Quality',
            risk: 'moderate',
            impact: 'Potential respiratory health concerns for sensitive individuals',
            mitigation: 'Reduce outdoor activities during peak pollution hours'
          }
        ],
        confidence: 0.94,
        dataQuality: 'high',
        lastUpdated: new Date().toISOString()
      },
      explainability: {
        modelUsed: 'EcoSentinel-v2.1',
        dataPoints: 15420,
        factors: [
          { name: 'Historical Patterns', weight: 0.35 },
          { name: 'Weather Conditions', weight: 0.25 },
          { name: 'Pollution Sources', weight: 0.20 },
          { name: 'Seasonal Trends', weight: 0.20 }
        ],
        reasoning: 'Analysis based on multi-source environmental data with emphasis on recent trend patterns and seasonal adjustments.'
      }
    };

    logger.info('AI insights generated successfully', { location, analysisType, userId: req.user.id });
    res.json(aiInsights);
    
  } catch (error) {
    logger.error('Error generating AI insights', error);
    res.status(500).json({
      error: 'Failed to generate AI insights',
      message: 'Please try again later'
    });
  }
});

// User authentication endpoints
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'name']
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info('User registered successfully', { userId: user.id, email });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Please try again later'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close database connections
  await pool.end();
  
  // Close Redis connection
  await redisClient.quit();
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`EcoSentinel API server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = app;
