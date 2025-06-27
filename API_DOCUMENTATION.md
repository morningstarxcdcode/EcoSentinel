# 🌐 **EcoSentinel API Documentation**

Welcome to the EcoSentinel API! This comprehensive guide will help you integrate environmental intelligence into your applications.

---

## 📋 **Table of Contents**

- [🚀 Quick Start](#-quick-start)
- [🔐 Authentication](#-authentication)
- [📊 Environmental Data](#-environmental-data)
- [🤖 AI Insights](#-ai-insights)
- [👥 User Management](#-user-management)
- [🌐 WebSocket Events](#-websocket-events)
- [📈 Analytics](#-analytics)
- [🔧 System](#-system)
- [📝 Examples](#-examples)
- [🚨 Error Handling](#-error-handling)
- [📊 Rate Limits](#-rate-limits)

---

## 🚀 **Quick Start**

### **Base URL**
```
Production: https://api.ecosentinel.com/v1
Development: http://localhost:8000/api/v1
```

### **Authentication**
```bash
# Get your API key by registering
curl -X POST https://api.ecosentinel.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"secure123","name":"Your Name"}'

# Use the returned JWT token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.ecosentinel.com/v1/environmental-data
```

### **First API Call**
```bash
# Get current environmental data
curl https://api.ecosentinel.com/v1/environmental-data?location=San%20Francisco
```

---

## 🔐 **Authentication**

### **Register New User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "organization": "Environmental Corp" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-06-26T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "7d"
  }
}
```

### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "expires_in": "7d"
  }
}
```

### **Refresh Token**
```http
POST /auth/refresh
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Logout**
```http
POST /auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 **Environmental Data**

### **Get Current Environmental Data**
```http
GET /environmental-data
```

**Query Parameters:**
- `location` (string): City name or coordinates (e.g., "San Francisco" or "37.7749,-122.4194")
- `metrics` (string): Comma-separated list of metrics (optional)
- `format` (string): Response format - "json" or "csv" (default: "json")

**Example:**
```bash
curl "https://api.ecosentinel.com/v1/environmental-data?location=San Francisco&metrics=airQuality,temperature,humidity"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "San Francisco",
    "timestamp": "2025-06-26T10:00:00Z",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "metrics": {
      "airQuality": {
        "value": 75,
        "unit": "AQI",
        "status": "moderate",
        "description": "Air quality is acceptable for most people"
      },
      "temperature": {
        "value": 22.5,
        "unit": "°C",
        "status": "comfortable",
        "description": "Pleasant temperature conditions"
      },
      "humidity": {
        "value": 65,
        "unit": "%",
        "status": "optimal",
        "description": "Comfortable humidity levels"
      },
      "windSpeed": {
        "value": 12.3,
        "unit": "km/h",
        "status": "light",
        "description": "Light breeze conditions"
      },
      "pressure": {
        "value": 1013.25,
        "unit": "hPa",
        "status": "normal",
        "description": "Standard atmospheric pressure"
      },
      "co2Level": {
        "value": 420,
        "unit": "ppm",
        "status": "elevated",
        "description": "Above pre-industrial levels"
      },
      "uvIndex": {
        "value": 6,
        "unit": "UVI",
        "status": "moderate",
        "description": "Moderate UV exposure risk"
      },
      "noiseLevel": {
        "value": 55,
        "unit": "dB",
        "status": "acceptable",
        "description": "Typical urban noise levels"
      },
      "waterQuality": {
        "value": 85,
        "unit": "WQI",
        "status": "good",
        "description": "Good water quality conditions"
      },
      "biodiversityIndex": {
        "value": 72,
        "unit": "BDI",
        "status": "healthy",
        "description": "Diverse ecosystem present"
      },
      "carbonFootprint": {
        "value": 45,
        "unit": "CO₂e",
        "status": "moderate",
        "description": "Moderate carbon emissions"
      }
    },
    "overallScore": {
      "value": 78,
      "status": "good",
      "description": "Generally healthy environmental conditions"
    }
  }
}
```

### **Get Historical Data**
```http
GET /environmental-data/historical
```

**Query Parameters:**
- `location` (string, required): Location identifier
- `start_date` (string): Start date (ISO 8601 format)
- `end_date` (string): End date (ISO 8601 format)
- `interval` (string): Data interval - "hour", "day", "week" (default: "hour")
- `metrics` (string): Comma-separated list of metrics

**Example:**
```bash
curl "https://api.ecosentinel.com/v1/environmental-data/historical?location=San Francisco&start_date=2025-06-20T00:00:00Z&end_date=2025-06-26T00:00:00Z&interval=day"
```

### **Get Multiple Locations**
```http
GET /environmental-data/bulk
```

**Query Parameters:**
- `locations` (string, required): Comma-separated list of locations
- `metrics` (string): Specific metrics to retrieve

**Example:**
```bash
curl "https://api.ecosentinel.com/v1/environmental-data/bulk?locations=San Francisco,New York,London&metrics=airQuality,temperature"
```

---

## 🤖 **AI Insights**

### **Get AI Predictions**
```http
GET /ai-insights/predictions
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `location` (string, required): Location for predictions
- `horizon` (string): Prediction horizon - "1h", "6h", "24h", "7d", "30d" (default: "24h")
- `metrics` (string): Specific metrics to predict

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "San Francisco",
    "generated_at": "2025-06-26T10:00:00Z",
    "horizon": "24h",
    "predictions": {
      "airQuality": {
        "current": 75,
        "predicted": 68,
        "confidence": 0.94,
        "trend": "improving",
        "change": -7,
        "explanation": "Air quality expected to improve due to favorable wind patterns and reduced traffic",
        "factors": [
          {
            "name": "Wind Patterns",
            "impact": 0.35,
            "description": "Strong winds will help disperse pollutants"
          },
          {
            "name": "Traffic Density",
            "impact": 0.28,
            "description": "Reduced rush hour activity expected"
          }
        ],
        "scenarios": [
          {
            "name": "Best Case",
            "value": 62,
            "probability": 0.25
          },
          {
            "name": "Most Likely",
            "value": 68,
            "probability": 0.94
          },
          {
            "name": "Worst Case",
            "value": 78,
            "probability": 0.15
          }
        ]
      }
    },
    "model_info": {
      "version": "2.1.0",
      "accuracy": 0.94,
      "last_trained": "2025-06-25T00:00:00Z"
    }
  }
}
```

### **Get Anomaly Detection**
```http
GET /ai-insights/anomalies
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `location` (string): Specific location (optional)
- `severity` (string): Minimum severity - "low", "medium", "high", "critical"
- `timeframe` (string): Time range - "1h", "24h", "7d" (default: "24h")

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "anomaly_123",
        "location": "San Francisco",
        "metric": "airQuality",
        "type": "statistical_outlier",
        "severity": "high",
        "detected_at": "2025-06-26T09:30:00Z",
        "current_value": 180,
        "expected_range": [50, 100],
        "confidence": 0.96,
        "description": "Air quality has reached unhealthy levels, significantly above normal range",
        "potential_causes": [
          "Wildfire smoke",
          "Industrial emissions",
          "Traffic congestion"
        ],
        "recommendations": [
          "Limit outdoor activities",
          "Use air purifiers indoors",
          "Wear N95 masks when outside"
        ],
        "duration": "2h 30m",
        "status": "active"
      }
    ],
    "summary": {
      "total_anomalies": 1,
      "active_anomalies": 1,
      "severity_breakdown": {
        "critical": 0,
        "high": 1,
        "medium": 0,
        "low": 0
      }
    }
  }
}
```

### **Get AI Recommendations**
```http
GET /ai-insights/recommendations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `location` (string): Location for recommendations
- `category` (string): Category - "personal", "community", "policy", "business"
- `urgency` (string): Urgency level - "low", "medium", "high"

---

## 👥 **User Management**

### **Get User Profile**
```http
GET /users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Update User Profile**
```http
PUT /users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "organization": "New Organization",
  "preferences": {
    "notifications": true,
    "email_alerts": false,
    "preferred_units": "metric"
  }
}
```

### **Get User Activity**
```http
GET /users/activity
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `limit` (number): Number of activities to return (default: 50)
- `offset` (number): Pagination offset (default: 0)

---

## 🌐 **WebSocket Events**

Connect to real-time data streams using WebSocket:

### **Connection**
```javascript
const socket = io('wss://api.ecosentinel.com', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### **Available Events**

#### **Environmental Data Stream**
```javascript
socket.on('environmental-data', (data) => {
  console.log('Real-time environmental data:', data);
  // Data structure same as REST API
});
```

#### **AI Predictions**
```javascript
socket.on('ai-predictions', (predictions) => {
  console.log('AI predictions update:', predictions);
});
```

#### **Anomaly Alerts**
```javascript
socket.on('anomaly-alert', (alert) => {
  console.log('Environmental anomaly detected:', alert);
  // Show user notification
});
```

#### **System Health**
```javascript
socket.on('system-health', (health) => {
  console.log('System health update:', health);
});
```

### **Subscribing to Specific Locations**
```javascript
// Subscribe to specific location updates
socket.emit('subscribe-location', { location: 'San Francisco' });

// Subscribe to specific metrics
socket.emit('subscribe-metrics', { 
  metrics: ['airQuality', 'temperature'],
  location: 'San Francisco'
});
```

### **Community Features**
```javascript
// Join community room
socket.emit('join-community', { communityId: 'san-francisco-env' });

// Send community message
socket.emit('community-message', {
  communityId: 'san-francisco-env',
  message: 'Air quality seems better today!',
  type: 'observation'
});

// Listen for community messages
socket.on('community-message', (message) => {
  console.log('Community update:', message);
});
```

---

## 📈 **Analytics**

### **Get Location Statistics**
```http
GET /analytics/locations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `timeframe` (string): Analysis period - "24h", "7d", "30d", "1y"
- `metrics` (string): Specific metrics to analyze

### **Get Trend Analysis**
```http
GET /analytics/trends
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `location` (string): Location to analyze
- `metric` (string): Specific metric for trend analysis
- `period` (string): Analysis period

### **Get Comparative Analysis**
```http
GET /analytics/compare
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `locations` (string): Comma-separated locations to compare
- `metric` (string): Metric for comparison
- `timeframe` (string): Comparison timeframe

---

## 🔧 **System**

### **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-26T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_service": "healthy",
    "websocket": "healthy"
  },
  "metrics": {
    "uptime": "99.97%",
    "response_time": "187ms",
    "active_connections": 1247
  }
}
```

### **API Status**
```http
GET /status
```

### **Rate Limit Info**
```http
GET /rate-limit
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "limit": 1000,
  "remaining": 847,
  "reset": "2025-06-26T11:00:00Z",
  "window": "1h"
}
```

---

## 📝 **Examples**

### **JavaScript/Node.js**
```javascript
const axios = require('axios');

class EcoSentinelAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.ecosentinel.com/v1';
  }

  async getEnvironmentalData(location, metrics = []) {
    try {
      const params = new URLSearchParams({
        location,
        ...(metrics.length && { metrics: metrics.join(',') })
      });

      const response = await axios.get(
        `${this.baseURL}/environmental-data?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAIPredictions(location, horizon = '24h') {
    const response = await axios.get(
      `${this.baseURL}/ai-insights/predictions`,
      {
        params: { location, horizon },
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.data;
  }
}

// Usage
const api = new EcoSentinelAPI('your-jwt-token');

// Get current environmental data
api.getEnvironmentalData('San Francisco', ['airQuality', 'temperature'])
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Get AI predictions
api.getAIPredictions('San Francisco', '24h')
  .then(predictions => console.log(predictions))
  .catch(error => console.error(error));
```

### **Python**
```python
import requests
import json

class EcoSentinelAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.ecosentinel.com/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def get_environmental_data(self, location, metrics=None):
        params = {'location': location}
        if metrics:
            params['metrics'] = ','.join(metrics)
        
        response = requests.get(
            f'{self.base_url}/environmental-data',
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_ai_predictions(self, location, horizon='24h'):
        response = requests.get(
            f'{self.base_url}/ai-insights/predictions',
            params={'location': location, 'horizon': horizon},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
api = EcoSentinelAPI('your-jwt-token')

# Get environmental data
data = api.get_environmental_data('San Francisco', ['airQuality', 'temperature'])
print(json.dumps(data, indent=2))

# Get AI predictions
predictions = api.get_ai_predictions('San Francisco', '24h')
print(json.dumps(predictions, indent=2))
```

### **cURL Examples**
```bash
# Get environmental data
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.ecosentinel.com/v1/environmental-data?location=San Francisco"

# Get AI predictions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.ecosentinel.com/v1/ai-insights/predictions?location=San Francisco&horizon=24h"

# Get historical data
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.ecosentinel.com/v1/environmental-data/historical?location=San Francisco&start_date=2025-06-20T00:00:00Z&end_date=2025-06-26T00:00:00Z"

# Register new user
curl -X POST https://api.ecosentinel.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123","name":"Test User"}'
```

---

## 🚨 **Error Handling**

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCATION",
    "message": "The specified location could not be found",
    "details": {
      "location": "Invalid City Name",
      "suggestions": ["San Francisco", "New York", "London"]
    },
    "timestamp": "2025-06-26T10:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### **Common Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `MISSING_TOKEN` | 401 | Authorization header is missing |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_LOCATION` | 400 | Location not found or invalid |
| `MISSING_PARAMETERS` | 400 | Required parameters missing |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INVALID_DATE_RANGE` | 400 | Invalid date range specified |
| `UNSUPPORTED_METRIC` | 400 | Requested metric not supported |

### **Error Handling Best Practices**
```javascript
try {
  const response = await api.getEnvironmentalData('San Francisco');
  // Handle success
} catch (error) {
  if (error.response) {
    // API returned an error response
    const { code, message, details } = error.response.data.error;
    
    switch (code) {
      case 'RATE_LIMIT_EXCEEDED':
        // Wait and retry
        setTimeout(() => retryRequest(), 60000);
        break;
      case 'INVALID_LOCATION':
        // Show location suggestions
        showLocationSuggestions(details.suggestions);
        break;
      default:
        // Show generic error
        showError(message);
    }
  } else {
    // Network or other error
    console.error('Network error:', error.message);
  }
}
```

---

## 📊 **Rate Limits**

### **Rate Limit Tiers**

| Tier | Requests/Hour | WebSocket Connections | Features |
|------|---------------|----------------------|----------|
| **Free** | 1,000 | 5 | Basic environmental data |
| **Developer** | 10,000 | 25 | AI insights, historical data |
| **Professional** | 100,000 | 100 | Advanced analytics, priority support |
| **Enterprise** | Unlimited | Unlimited | Custom solutions, dedicated support |

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### **Handling Rate Limits**
```javascript
const response = await fetch('/api/v1/environmental-data', {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 429) {
  const resetTime = response.headers.get('X-RateLimit-Reset');
  const waitTime = (resetTime * 1000) - Date.now();
  
  console.log(`Rate limited. Retry after ${waitTime}ms`);
  setTimeout(() => retryRequest(), waitTime);
}
```

---

## 🔗 **SDKs and Libraries**

### **Official SDKs**
- **JavaScript/Node.js**: `npm install @ecosentinel/sdk`
- **Python**: `pip install ecosentinel-sdk`
- **Go**: `go get github.com/ecosentinel/go-sdk`
- **PHP**: `composer require ecosentinel/php-sdk`

### **Community Libraries**
- **Ruby**: `gem install ecosentinel-ruby`
- **Java**: Available on Maven Central
- **C#**: Available on NuGet

---

## 📞 **Support**

- **Documentation**: https://docs.ecosentinel.com
- **API Status**: https://status.ecosentinel.com
- **GitHub Issues**: https://github.com/morningstarxcdcode/ecosentinel/issues
- **Slack Community**: [StackOverflow Teams](https://stackoverflowteams.com/c/morningstarxcdcode/users/1/)
- **Email Support**: [morningstar.xcd@gmail.com](mailto:morningstar.xcd@gmail.com)
- **LinkedIn**: [Sourav Rajak](https://www.linkedin.com/in/sourav-rajak-6294682b2/)

---

**🌍 Start building with EcoSentinel API today and help create a more sustainable future! 🌱**
