# 🚀 **EcoSentinel Usage Examples**

This guide provides practical examples of how to use EcoSentinel for different purposes and user types.

---

## 👥 **For Different User Types**

### **🏢 Environmental Organizations**
```javascript
// Monitor air quality across multiple locations
const locations = ['San Francisco', 'Los Angeles', 'New York'];
const airQualityData = await Promise.all(
  locations.map(location => 
    fetch(`/api/v1/environmental-data?location=${location}&metrics=airQuality`)
      .then(res => res.json())
  )
);

// Generate environmental report
const report = {
  timestamp: new Date().toISOString(),
  locations: airQualityData.map(data => ({
    location: data.location,
    airQuality: data.metrics.airQuality.value,
    status: data.metrics.airQuality.status,
    recommendations: data.recommendations
  }))
};

console.log('Environmental Report:', report);
```

### **🎓 Researchers & Scientists**
```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

# Collect historical environmental data
def collect_research_data(location, days=30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    response = requests.get(f'/api/v1/environmental-data/historical', {
        'location': location,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'interval': 'hour'
    })
    
    return response.json()['data']

# Analyze air quality trends
data = collect_research_data('San Francisco', 30)
df = pd.DataFrame(data)

# Create visualization
plt.figure(figsize=(12, 6))
plt.plot(df['timestamp'], df['airQuality'])
plt.title('Air Quality Trends - San Francisco (30 Days)')
plt.xlabel('Date')
plt.ylabel('Air Quality Index')
plt.show()

# Statistical analysis
correlation = df[['airQuality', 'temperature', 'humidity']].corr()
print("Correlation Matrix:", correlation)
```

### **🏛️ Government & Policy Makers**
```javascript
// Create policy dashboard
class PolicyDashboard {
  async generateCityReport(city) {
    const [current, predictions, trends] = await Promise.all([
      this.getCurrentData(city),
      this.getAIPredictions(city, '30d'),
      this.getTrendAnalysis(city, '1y')
    ]);

    return {
      city,
      currentStatus: this.assessEnvironmentalHealth(current),
      futureOutlook: this.analyzePredictions(predictions),
      yearlyTrends: trends,
      policyRecommendations: this.generatePolicyRecommendations(current, predictions),
      urgentActions: this.identifyUrgentActions(current)
    };
  }

  generatePolicyRecommendations(current, predictions) {
    const recommendations = [];
    
    if (current.airQuality > 100) {
      recommendations.push({
        priority: 'high',
        action: 'Implement vehicle emission restrictions',
        expectedImpact: '15-25% AQI reduction',
        timeframe: '6 months'
      });
    }

    if (predictions.carbonFootprint.trend === 'increasing') {
      recommendations.push({
        priority: 'medium',
        action: 'Increase renewable energy incentives',
        expectedImpact: '10-20% carbon reduction',
        timeframe: '2 years'
      });
    }

    return recommendations;
  }
}
```

### **👨‍💻 Developers & Integrators**
```typescript
// React Hook for environmental data
import { useState, useEffect } from 'react';
import { wsManager } from '@/lib/websocket';

export function useEnvironmentalData(location: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const handleData = (newData) => {
      if (newData.location === location) {
        setData(newData);
        setLoading(false);
      }
    };

    const handleError = (err) => {
      setError(err);
      setLoading(false);
    };

    wsManager.subscribe('environmental-data', handleData);
    wsManager.subscribe('error', handleError);

    // Initial data fetch
    fetch(`/api/v1/environmental-data?location=${location}`)
      .then(res => res.json())
      .then(handleData)
      .catch(handleError);

    return () => {
      wsManager.unsubscribe('environmental-data', handleData);
      wsManager.unsubscribe('error', handleError);
    };
  }, [location]);

  return { data, loading, error };
}

// Usage in component
function EnvironmentalWidget({ location }) {
  const { data, loading, error } = useEnvironmentalData(location);

  if (loading) return <div>Loading environmental data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="environmental-widget">
      <h3>{location} Environmental Status</h3>
      <div className="metrics">
        <div className={`metric ${data.airQuality.status}`}>
          Air Quality: {data.airQuality.value} AQI
        </div>
        <div className="metric">
          Temperature: {data.temperature.value}°C
        </div>
      </div>
    </div>
  );
}
```

---

## 🌍 **Real-World Use Cases**

### **1. Smart City Implementation**
```javascript
// Smart city environmental monitoring system
class SmartCityMonitor {
  constructor(cityName) {
    this.cityName = cityName;
    this.sensors = new Map();
    this.alerts = [];
  }

  async initializeMonitoring() {
    // Set up real-time monitoring
    wsManager.subscribe('environmental-data', (data) => {
      this.processEnvironmentalData(data);
    });

    wsManager.subscribe('anomaly-alert', (alert) => {
      this.handleEnvironmentalAlert(alert);
    });

    // Start monitoring
    await this.startContinuousMonitoring();
  }

  processEnvironmentalData(data) {
    // Update city dashboard
    this.updateCityDashboard(data);
    
    // Check for policy triggers
    this.checkPolicyTriggers(data);
    
    // Update traffic management
    if (data.airQuality > 150) {
      this.activateTrafficRestrictions();
    }
    
    // Update public transportation recommendations
    this.updateTransportRecommendations(data);
  }

  async activateTrafficRestrictions() {
    // Integrate with traffic management system
    await this.trafficSystem.activateEmergencyProtocol({
      reason: 'high_pollution',
      restrictions: ['odd_even_vehicles', 'commercial_vehicle_ban'],
      duration: '24h'
    });

    // Notify citizens
    await this.notificationSystem.sendCityWideAlert({
      type: 'environmental_emergency',
      message: 'High pollution levels detected. Traffic restrictions in effect.',
      actions: ['Use public transport', 'Work from home if possible']
    });
  }
}
```

### **2. Corporate Environmental Compliance**
```python
# Corporate environmental monitoring
class CorporateEnvironmentalMonitor:
    def __init__(self, company_locations):
        self.locations = company_locations
        self.compliance_thresholds = {
            'air_quality': 100,
            'noise_level': 70,
            'water_quality': 80
        }
    
    async def generate_compliance_report(self):
        report = {
            'company': 'EcoTech Corp',
            'report_date': datetime.now().isoformat(),
            'locations': [],
            'overall_compliance': True,
            'violations': [],
            'recommendations': []
        }
        
        for location in self.locations:
            location_data = await self.get_location_data(location)
            compliance_status = self.check_compliance(location_data)
            
            report['locations'].append({
                'location': location,
                'data': location_data,
                'compliance': compliance_status,
                'violations': self.identify_violations(location_data)
            })
            
            if not compliance_status['overall']:
                report['overall_compliance'] = False
                report['violations'].extend(compliance_status['violations'])
        
        # Generate recommendations
        report['recommendations'] = self.generate_recommendations(report)
        
        return report
    
    def check_compliance(self, data):
        violations = []
        
        if data['air_quality'] > self.compliance_thresholds['air_quality']:
            violations.append({
                'type': 'air_quality_violation',
                'current': data['air_quality'],
                'threshold': self.compliance_thresholds['air_quality'],
                'severity': 'high' if data['air_quality'] > 150 else 'medium'
            })
        
        return {
            'overall': len(violations) == 0,
            'violations': violations
        }
```

### **3. Community Environmental Action**
```javascript
// Community environmental action platform
class CommunityEnvironmentalAction {
  constructor(communityId) {
    this.communityId = communityId;
    this.members = new Set();
    this.actions = [];
    this.goals = new Map();
  }

  async createCommunityChallenge(challengeData) {
    const challenge = {
      id: `challenge_${Date.now()}`,
      title: challengeData.title,
      description: challengeData.description,
      goal: challengeData.goal,
      participants: new Set(),
      progress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + challengeData.duration),
      rewards: challengeData.rewards
    };

    // Example: "Reduce Community Carbon Footprint by 20%"
    if (challengeData.type === 'carbon_reduction') {
      challenge.trackingMetric = 'carbonFootprint';
      challenge.targetReduction = challengeData.targetReduction;
      
      // Set up monitoring
      wsManager.subscribe('environmental-data', (data) => {
        if (data.location === this.communityId) {
          this.updateChallengeProgress(challenge.id, data);
        }
      });
    }

    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  async organizeCleanupEvent(eventData) {
    const event = {
      id: `cleanup_${Date.now()}`,
      type: 'community_cleanup',
      title: eventData.title,
      location: eventData.location,
      date: eventData.date,
      volunteers: new Set(),
      equipment: eventData.equipment || [],
      expectedImpact: {
        wasteRemoved: eventData.expectedWaste,
        areaCleared: eventData.area,
        participantsNeeded: eventData.volunteersNeeded
      }
    };

    // Notify community members
    await this.notifyMembers({
      type: 'event_invitation',
      event: event,
      message: `Join us for a community cleanup event: ${event.title}`
    });

    return event;
  }

  async trackEnvironmentalImpact() {
    const impact = {
      period: 'monthly',
      metrics: {
        carbonFootprintReduction: 0,
        wasteReduced: 0,
        energySaved: 0,
        treesPlanted: 0,
        participantActions: 0
      }
    };

    // Calculate community impact
    const communityData = await this.getCommunityEnvironmentalData();
    const previousMonth = await this.getPreviousMonthData();

    impact.metrics.carbonFootprintReduction = 
      previousMonth.carbonFootprint - communityData.carbonFootprint;

    // Track member actions
    this.members.forEach(member => {
      impact.metrics.participantActions += member.actionsThisMonth;
    });

    return impact;
  }
}
```

---

## 🔧 **Integration Examples**

### **1. Mobile App Integration**
```javascript
// React Native integration
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useEcoSentinel(location) {
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const socket = io('wss://api.ecosentinel.com', {
      auth: { token: 'your-jwt-token' }
    });

    socket.on('environmental-data', (data) => {
      if (data.location === location) {
        setEnvironmentalData(data);
        
        // Send push notification for poor air quality
        if (data.airQuality > 150) {
          sendPushNotification({
            title: 'Air Quality Alert',
            body: `Poor air quality in ${location}. Consider staying indoors.`,
            data: { type: 'air_quality_alert', location }
          });
        }
      }
    });

    socket.on('anomaly-alert', (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
      
      // Show in-app notification
      showInAppNotification({
        type: 'warning',
        title: 'Environmental Alert',
        message: alert.description
      });
    });

    return () => socket.disconnect();
  }, [location]);

  return { environmentalData, alerts };
}
```

### **2. IoT Device Integration**
```python
# IoT sensor data integration
import asyncio
import aiohttp
from datetime import datetime

class IoTSensorIntegration:
    def __init__(self, device_id, api_key):
        self.device_id = device_id
        self.api_key = api_key
        self.base_url = 'https://api.ecosentinel.com/v1'
    
    async def send_sensor_data(self, sensor_readings):
        """Send IoT sensor data to EcoSentinel"""
        payload = {
            'device_id': self.device_id,
            'timestamp': datetime.now().isoformat(),
            'readings': sensor_readings,
            'location': {
                'lat': sensor_readings.get('latitude'),
                'lng': sensor_readings.get('longitude')
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{self.base_url}/iot/sensor-data',
                json=payload,
                headers={'Authorization': f'Bearer {self.api_key}'}
            ) as response:
                return await response.json()
    
    async def get_calibration_data(self):
        """Get calibration data from EcoSentinel AI"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f'{self.base_url}/iot/calibration/{self.device_id}',
                headers={'Authorization': f'Bearer {self.api_key}'}
            ) as response:
                return await response.json()

# Usage example
async def main():
    sensor = IoTSensorIntegration('sensor_001', 'your-api-key')
    
    # Simulate sensor readings
    readings = {
        'temperature': 23.5,
        'humidity': 65.2,
        'air_quality': 85,
        'noise_level': 45.3,
        'latitude': 37.7749,
        'longitude': -122.4194
    }
    
    result = await sensor.send_sensor_data(readings)
    print(f"Data sent successfully: {result}")

# Run the IoT integration
asyncio.run(main())
```

### **3. Slack Bot Integration**
```javascript
// Slack bot for environmental alerts
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Subscribe to environmental alerts
wsManager.subscribe('anomaly-alert', async (alert) => {
  const message = {
    channel: '#environmental-alerts',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Environmental Alert: ${alert.location}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Metric:* ${alert.metric}\n*Severity:* ${alert.severity}\n*Description:* ${alert.description}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommendations:*\n${alert.recommendations.map(r => `• ${r}`).join('\n')}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Dashboard'
            },
            url: `https://ecosentinel.com/dashboard?location=${alert.location}`
          }
        ]
      }
    ]
  };

  await app.client.chat.postMessage(message);
});

// Slash command for environmental data
app.command('/enviro', async ({ command, ack, respond }) => {
  await ack();

  const location = command.text || 'San Francisco';
  
  try {
    const response = await fetch(`https://api.ecosentinel.com/v1/environmental-data?location=${location}`);
    const data = await response.json();

    await respond({
      text: `Environmental data for ${location}:`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🌍 ${location} Environmental Status*\n\n` +
                  `*Air Quality:* ${data.airQuality.value} AQI (${data.airQuality.status})\n` +
                  `*Temperature:* ${data.temperature.value}°C\n` +
                  `*Humidity:* ${data.humidity.value}%\n` +
                  `*Overall Score:* ${data.overallScore.value}/100`
          }
        }
      ]
    });
  } catch (error) {
    await respond(`Sorry, I couldn't fetch environmental data for ${location}.`);
  }
});
```

---

## 📊 **Advanced Analytics Examples**

### **1. Environmental Trend Analysis**
```python
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

class EnvironmentalTrendAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        
    def analyze_long_term_trends(self, location, years=5):
        """Analyze long-term environmental trends"""
        
        # Fetch historical data
        data = self.fetch_historical_data(location, f'{years}y')
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Analyze trends for each metric
        trends = {}
        
        for metric in ['airQuality', 'temperature', 'carbonFootprint']:
            # Prepare data for regression
            X = np.array(range(len(df))).reshape(-1, 1)
            y = df[metric].values
            
            # Fit linear regression
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate trend
            trend_slope = model.coef_[0]
            trend_direction = 'improving' if trend_slope < 0 else 'worsening'
            
            # Calculate seasonal patterns
            df['month'] = df['timestamp'].dt.month
            seasonal_pattern = df.groupby('month')[metric].mean()
            
            trends[metric] = {
                'slope': trend_slope,
                'direction': trend_direction,
                'r_squared': model.score(X, y),
                'seasonal_pattern': seasonal_pattern.to_dict(),
                'current_value': df[metric].iloc[-1],
                'projected_1year': model.predict([[len(df) + 365]])[0]
            }
        
        return trends
    
    def generate_trend_report(self, trends):
        """Generate comprehensive trend report"""
        report = {
            'summary': {},
            'recommendations': [],
            'projections': {}
        }
        
        # Analyze overall environmental health trend
        improving_metrics = sum(1 for t in trends.values() if t['direction'] == 'improving')
        total_metrics = len(trends)
        
        report['summary']['overall_trend'] = 'improving' if improving_metrics > total_metrics/2 else 'declining'
        report['summary']['confidence'] = np.mean([t['r_squared'] for t in trends.values()])
        
        # Generate recommendations
        for metric, trend in trends.items():
            if trend['direction'] == 'worsening':
                if metric == 'airQuality':
                    report['recommendations'].append({
                        'metric': metric,
                        'action': 'Implement stricter emission controls',
                        'priority': 'high',
                        'expected_impact': '10-20% improvement in 2 years'
                    })
                elif metric == 'carbonFootprint':
                    report['recommendations'].append({
                        'metric': metric,
                        'action': 'Accelerate renewable energy adoption',
                        'priority': 'critical',
                        'expected_impact': '25-40% reduction in 5 years'
                    })
        
        return report
```

---

## 🎯 **Quick Start Templates**

### **1. Basic Environmental Monitor**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Environmental Monitor</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <div id="environmental-data">
        <h1>Environmental Monitor</h1>
        <div id="location">San Francisco</div>
        <div id="air-quality">Loading...</div>
        <div id="temperature">Loading...</div>
        <div id="alerts"></div>
    </div>

    <script>
        const socket = io('wss://api.ecosentinel.com');
        
        socket.on('environmental-data', (data) => {
            if (data.location === 'San Francisco') {
                document.getElementById('air-quality').textContent = 
                    `Air Quality: ${data.airQuality.value} AQI (${data.airQuality.status})`;
                document.getElementById('temperature').textContent = 
                    `Temperature: ${data.temperature.value}°C`;
            }
        });
        
        socket.on('anomaly-alert', (alert) => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert';
            alertDiv.textContent = `Alert: ${alert.description}`;
            document.getElementById('alerts').appendChild(alertDiv);
        });
    </script>
</body>
</html>
```

### **2. Simple Python Script**
```python
#!/usr/bin/env python3
"""
Simple EcoSentinel monitoring script
Usage: python monitor.py [location]
"""

import sys
import requests
import time
from datetime import datetime

def monitor_location(location='San Francisco'):
    """Monitor environmental conditions for a location"""
    
    print(f"🌍 Monitoring environmental conditions for {location}")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            # Fetch current data
            response = requests.get(
                f'https://api.ecosentinel.com/v1/environmental-data',
                params={'location': location}
            )
            
            if response.status_code == 200:
                data = response.json()['data']
                
                # Display current conditions
                print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"🌬️  Air Quality: {data['metrics']['airQuality']['value']} AQI ({data['metrics']['airQuality']['status']})")
                print(f"🌡️  Temperature: {data['metrics']['temperature']['value']}°C")
                print(f"💧 Humidity: {data['metrics']['humidity']['value']}%")
                print(f"📊 Overall Score: {data['overallScore']['value']}/100")
                print("-" * 50)
                
                # Check for alerts
                if data['metrics']['airQuality']['value'] > 100:
                    print("⚠️  WARNING: Poor air quality detected!")
                
            else:
                print(f"❌ Error fetching data: {response.status_code}")
            
            # Wait 5 minutes before next check
            time.sleep(300)
            
    except KeyboardInterrupt:
        print("\n👋 Monitoring stopped. Stay environmentally aware!")

if __name__ == "__main__":
    location = sys.argv[1] if len(sys.argv) > 1 else 'San Francisco'
    monitor_location(location)
```

---

**🌱 These examples show just a fraction of what's possible with EcoSentinel. Start building your environmental solutions today!**
