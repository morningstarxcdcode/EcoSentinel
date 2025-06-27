// EcoSentinel Security Middleware
// Advanced security middleware for API protection

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Enhanced rate limiting with different tiers
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.round(windowMs / 1000),
        limit: max,
        remaining: 0
      });
    },
    keyGenerator: (req: Request) => {
      return `${req.ip}:${req.path}`;
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
};

// Different rate limits for different endpoints
export const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // Authentication endpoints (stricter)
  auth: createRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  
  // Data endpoints (moderate)
  data: createRateLimit(5 * 60 * 1000, 50), // 50 requests per 5 minutes
  
  // Upload endpoints (very strict)
  upload: createRateLimit(60 * 60 * 1000, 10), // 10 uploads per hour
  
  // AI/ML endpoints (resource intensive)
  ai: createRateLimit(10 * 60 * 1000, 20), // 20 requests per 10 minutes
};

// Enhanced helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      connectSrc: ["'self'", "wss:", "https://api.ecosentinel.app"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "origin-when-cross-origin" },
  xssFilter: true,
});

// Input validation schemas
export const validationSchemas = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .escape(),
    
  password: body('password')
    .isLength({ min: 12, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 12 characters, including uppercase, lowercase, number, and special character'),
    
  apiKey: body('apiKey')
    .isLength({ min: 32, max: 64 })
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Invalid API key format'),
    
  coordinates: [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
  ],
  
  environmentalData: [
    body('temperature').optional().isFloat({ min: -100, max: 100 }),
    body('humidity').optional().isFloat({ min: 0, max: 100 }),
    body('airQuality').optional().isInt({ min: 0, max: 500 }),
    body('timestamp').isISO8601().toDate()
  ]
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// JWT token utilities
export class JWTManager {
  private readonly secret: string;
  private readonly algorithm = 'HS256';
  
  constructor() {
    this.secret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
  }
  
  generateToken(payload: object, expiresIn = '1h'): string {
    return jwt.sign(payload, this.secret, {
      algorithm: this.algorithm,
      expiresIn,
      issuer: 'ecosentinel',
      audience: 'ecosentinel-users'
    });
  }
  
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret, {
        algorithms: [this.algorithm],
        issuer: 'ecosentinel',
        audience: 'ecosentinel-users'
      });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  refreshToken(oldToken: string): string {
    const decoded = this.verifyToken(oldToken);
    const { iat, exp, ...payload } = decoded;
    return this.generateToken(payload);
  }
}

// Password hashing utilities
export class PasswordManager {
  private readonly saltRounds = 12;
  
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  generateSecurePassword(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

// API Key management
export class APIKeyManager {
  private readonly prefix = 'es_';
  private readonly keyLength = 32;
  
  generateAPIKey(): string {
    const randomBytes = crypto.randomBytes(this.keyLength);
    return this.prefix + randomBytes.toString('hex');
  }
  
  validateAPIKeyFormat(apiKey: string): boolean {
    const regex = new RegExp(`^${this.prefix}[a-f0-9]{${this.keyLength * 2}}$`);
    return regex.test(apiKey);
  }
  
  hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const jwtManager = new JWTManager();
    const decoded = jwtManager.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// API Key authentication middleware
export const authenticateAPIKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const apiKeyManager = new APIKeyManager();
  
  if (!apiKeyManager.validateAPIKeyFormat(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }
  
  // Here you would typically check against your database
  // const hashedKey = apiKeyManager.hashAPIKey(apiKey);
  // const isValid = await checkAPIKeyInDatabase(hashedKey);
  
  // For now, we'll assume the key is valid if format is correct
  next();
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !user.role) {
      return res.status(403).json({ error: 'Access denied: No role assigned' });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    
    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request
  console.log(JSON.stringify({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  }));
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      requestId,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    }));
  });
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add security headers
  res.setHeader('X-Request-ID', crypto.randomUUID());
  res.setHeader('X-Response-Time', Date.now());
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'https://ecosentinel.app',
      'https://www.ecosentinel.app',
      'https://api.ecosentinel.app',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : [])
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = res.getHeader('X-Request-ID');
  
  // Log error
  console.error(JSON.stringify({
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  }));
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      requestId
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      requestId
    });
  }
};

const securityMiddleware = {
  rateLimits,
  helmetConfig,
  validationSchemas,
  handleValidationErrors,
  JWTManager,
  PasswordManager,
  APIKeyManager,
  authenticateToken,
  authenticateAPIKey,
  requireRole,
  requestLogger,
  securityHeaders,
  corsOptions,
  errorHandler
};

export default securityMiddleware;
