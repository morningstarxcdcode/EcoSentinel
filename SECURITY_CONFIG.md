# Security Configuration for EcoSentinel

## Environment Variables Security
```bash
# Required environment variables (add to .env.local)
SECURITY_JWT_SECRET=your-jwt-secret-here
SECURITY_ENCRYPTION_KEY=your-encryption-key-here
SECURITY_API_KEY_SALT=your-api-key-salt-here
SECURITY_SESSION_SECRET=your-session-secret-here

# Database security
DATABASE_SSL_MODE=require
DATABASE_SSL_CERT_PATH=/path/to/cert
DATABASE_SSL_KEY_PATH=/path/to/key
DATABASE_SSL_CA_PATH=/path/to/ca

# Redis security
REDIS_TLS_ENABLED=true
REDIS_AUTH_PASSWORD=your-redis-password

# External API security
NASA_API_KEY=your-nasa-api-key
WEATHER_API_KEY=your-weather-api-key
SATELLITE_API_KEY=your-satellite-api-key
```

## Security Headers Configuration

### Next.js Security Headers
```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' wss: https:; frame-src 'none'; object-src 'none';"
  }
]
```

## API Security Configuration

### Rate Limiting
```javascript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  // Advanced configuration
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip + ':' + req.path
  }
}
```

### API Authentication
```javascript
// JWT configuration
const jwtConfig = {
  algorithm: 'HS256',
  expiresIn: '1h',
  issuer: 'ecosentinel',
  audience: 'ecosentinel-users',
  clockTolerance: 30, // 30 seconds
  maxAge: '1h'
}

// API Key validation
const apiKeyConfig = {
  headerName: 'X-API-Key',
  keyLength: 32,
  prefix: 'es_',
  encryption: 'aes-256-gcm'
}
```

## Database Security

### PostgreSQL Security Settings
```sql
-- Enable SSL
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'

-- Enable logging
log_connections = on
log_disconnections = on
log_checkpoints = on
log_lock_waits = on

-- Security settings
password_encryption = scram-sha-256
row_security = on
```

### Database Connection Security
```javascript
// Secure database connection
const dbConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
    key: fs.readFileSync('/path/to/client-key.key').toString(),
    cert: fs.readFileSync('/path/to/client-certificate.crt').toString(),
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
}
```

## Container Security

### Docker Security
```dockerfile
# Security-hardened Dockerfile
FROM node:18-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set security headers
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Use non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

### Kubernetes Security
```yaml
# Security context for Kubernetes
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: ecosentinel
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      limits:
        memory: "512Mi"
        cpu: "500m"
      requests:
        memory: "256Mi"
        cpu: "250m"
```

## Monitoring & Alerting

### Security Monitoring
```yaml
# Prometheus security alerts
groups:
- name: security_alerts
  rules:
  - alert: HighFailedAuthenticationRate
    expr: rate(auth_failures_total[5m]) > 10
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High authentication failure rate detected"
      
  - alert: SuspiciousAPIActivity
    expr: rate(api_requests_total{status_code="401"}[5m]) > 50
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Suspicious API activity detected"
      
  - alert: UnauthorizedDataAccess
    expr: rate(data_access_unauthorized_total[5m]) > 5
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "Unauthorized data access attempt"
```

## Security Automation

### Automated Security Scanning
```yaml
# GitHub Actions security workflow
name: Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run OWASP ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'https://ecosentinel.app'
```

## Compliance Frameworks

### GDPR Compliance Checklist
- [ ] Data Processing Agreement (DPA) in place
- [ ] Privacy Policy updated and accessible
- [ ] Consent mechanisms implemented
- [ ] Data Subject Rights (DSR) procedures
- [ ] Data Protection Impact Assessment (DPIA) completed
- [ ] Data retention policies defined
- [ ] Secure data deletion procedures
- [ ] Cross-border data transfer safeguards

### SOC 2 Type II Controls
- [ ] Access controls and user provisioning
- [ ] System monitoring and logging
- [ ] Change management procedures
- [ ] Incident response procedures
- [ ] Risk assessment and management
- [ ] Vendor management program
- [ ] Business continuity planning
- [ ] Data backup and recovery testing

## Security Training & Awareness

### Developer Security Training Topics
1. Secure coding practices (OWASP Top 10)
2. Authentication and authorization
3. Cryptography and key management
4. Input validation and output encoding
5. Security testing methodologies
6. Cloud security best practices
7. Container and Kubernetes security
8. AI/ML security considerations

### Security Awareness Metrics
- Training completion rate: 100%
- Phishing simulation click rate: <5%
- Security incident reporting rate: >90%
- Password policy compliance: 100%
- Security knowledge assessment score: >85%
