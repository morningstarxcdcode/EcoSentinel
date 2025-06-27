#!/usr/bin/env python3
"""
EcoSentinel AI Service
Advanced environmental data analysis and prediction service
"""

import os
import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import openai
import redis
import requests
from prometheus_client import Counter, Histogram, generate_latest
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ai_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
PORT = int(os.getenv('AI_SERVICE_PORT', 5000))

# Initialize Redis client
redis_client = redis.from_url(REDIS_URL)

# Prometheus metrics
REQUEST_COUNT = Counter('ai_requests_total', 'Total AI requests', ['endpoint', 'status'])
REQUEST_DURATION = Histogram('ai_request_duration_seconds', 'AI request duration')
PREDICTION_ACCURACY = Histogram('ai_prediction_accuracy', 'AI prediction accuracy scores')

class EnvironmentalAI:
    """Advanced AI system for environmental data analysis and prediction"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_importance = {}
        self.model_accuracy = {}
        self.initialize_models()
        
    def initialize_models(self):
        """Initialize and train AI models"""
        logger.info("Initializing AI models...")
        
        # Generate synthetic training data (in production, use real historical data)
        self.training_data = self._generate_training_data()
        
        # Initialize models
        self.models = {
            'air_quality': RandomForestRegressor(n_estimators=100, random_state=42),
            'temperature': RandomForestRegressor(n_estimators=100, random_state=42),
            'anomaly_detector': IsolationForest(contamination=0.1, random_state=42),
            'risk_predictor': RandomForestRegressor(n_estimators=150, random_state=42)
        }
        
        self.scalers = {
            'air_quality': StandardScaler(),
            'temperature': StandardScaler(),
            'risk_predictor': StandardScaler()
        }
        
        # Train models
        self._train_models()
        logger.info("AI models initialized successfully")
    
    def _generate_training_data(self, samples=10000):
        """Generate synthetic environmental training data"""
        np.random.seed(42)
        
        # Generate base features
        dates = pd.date_range(start='2020-01-01', periods=samples, freq='H')
        
        # Seasonal patterns
        day_of_year = dates.dayofyear
        hour_of_day = dates.hour
        
        # Base environmental data with realistic patterns
        temperature = 20 + 10 * np.sin(2 * np.pi * day_of_year / 365) + \
                     5 * np.sin(2 * np.pi * hour_of_day / 24) + \
                     np.random.normal(0, 2, samples)
        
        humidity = 60 + 20 * np.sin(2 * np.pi * day_of_year / 365 + np.pi/4) + \
                  10 * np.sin(2 * np.pi * hour_of_day / 24 + np.pi) + \
                  np.random.normal(0, 5, samples)
        
        wind_speed = 5 + 3 * np.sin(2 * np.pi * day_of_year / 365 + np.pi/2) + \
                    np.random.exponential(2, samples)
        
        pressure = 1013 + 10 * np.sin(2 * np.pi * day_of_year / 365) + \
                  np.random.normal(0, 5, samples)
        
        # Air quality influenced by weather and human activity
        air_quality = 50 + 30 * (1 / (wind_speed + 1)) + \
                     20 * np.sin(2 * np.pi * hour_of_day / 24 + np.pi) + \
                     np.random.normal(0, 10, samples)
        air_quality = np.clip(air_quality, 0, 500)
        
        # Risk score based on multiple factors
        risk_score = (air_quality / 100) * 0.4 + \
                    (np.abs(temperature - 22) / 30) * 0.3 + \
                    (humidity / 100) * 0.2 + \
                    (1 / (wind_speed + 1)) * 0.1
        risk_score = np.clip(risk_score * 100, 0, 100)
        
        return pd.DataFrame({
            'datetime': dates,
            'temperature': temperature,
            'humidity': humidity,
            'wind_speed': wind_speed,
            'pressure': pressure,
            'air_quality': air_quality,
            'risk_score': risk_score,
            'day_of_year': day_of_year,
            'hour_of_day': hour_of_day,
            'is_weekend': dates.weekday >= 5
        })
    
    def _train_models(self):
        """Train all AI models"""
        data = self.training_data
        
        # Prepare features
        feature_cols = ['temperature', 'humidity', 'wind_speed', 'pressure', 
                       'day_of_year', 'hour_of_day', 'is_weekend']
        X = data[feature_cols]
        
        # Train air quality model
        y_air = data['air_quality']
        X_scaled_air = self.scalers['air_quality'].fit_transform(X)
        self.models['air_quality'].fit(X_scaled_air, y_air)
        
        # Calculate accuracy
        y_pred_air = self.models['air_quality'].predict(X_scaled_air)
        self.model_accuracy['air_quality'] = r2_score(y_air, y_pred_air)
        
        # Train temperature model
        y_temp = data['temperature']
        X_scaled_temp = self.scalers['temperature'].fit_transform(X)
        self.models['temperature'].fit(X_scaled_temp, y_temp)
        
        y_pred_temp = self.models['temperature'].predict(X_scaled_temp)
        self.model_accuracy['temperature'] = r2_score(y_temp, y_pred_temp)
        
        # Train anomaly detector
        self.models['anomaly_detector'].fit(X)
        
        # Train risk predictor
        y_risk = data['risk_score']
        X_scaled_risk = self.scalers['risk_predictor'].fit_transform(X)
        self.models['risk_predictor'].fit(X_scaled_risk, y_risk)
        
        y_pred_risk = self.models['risk_predictor'].predict(X_scaled_risk)
        self.model_accuracy['risk_predictor'] = r2_score(y_risk, y_pred_risk)
        
        # Store feature importance
        for model_name in ['air_quality', 'temperature', 'risk_predictor']:
            importance = self.models[model_name].feature_importances_
            self.feature_importance[model_name] = dict(zip(feature_cols, importance))
        
        logger.info(f"Model accuracies: {self.model_accuracy}")
    
    def predict_environmental_metrics(self, input_data: Dict) -> Dict:
        """Predict environmental metrics based on input conditions"""
        try:
            # Prepare input features
            features = np.array([[
                input_data.get('temperature', 22),
                input_data.get('humidity', 60),
                input_data.get('wind_speed', 5),
                input_data.get('pressure', 1013),
                input_data.get('day_of_year', datetime.now().timetuple().tm_yday),
                input_data.get('hour_of_day', datetime.now().hour),
                input_data.get('is_weekend', datetime.now().weekday() >= 5)
            ]])
            
            # Make predictions
            predictions = {}
            
            # Air quality prediction
            X_air = self.scalers['air_quality'].transform(features)
            air_quality_pred = self.models['air_quality'].predict(X_air)[0]
            predictions['air_quality'] = {
                'value': float(air_quality_pred),
                'category': self._categorize_air_quality(air_quality_pred),
                'confidence': float(self.model_accuracy['air_quality'])
            }
            
            # Temperature prediction
            X_temp = self.scalers['temperature'].transform(features)
            temp_pred = self.models['temperature'].predict(X_temp)[0]
            predictions['temperature'] = {
                'value': float(temp_pred),
                'confidence': float(self.model_accuracy['temperature'])
            }
            
            # Risk assessment
            X_risk = self.scalers['risk_predictor'].transform(features)
            risk_pred = self.models['risk_predictor'].predict(X_risk)[0]
            predictions['risk_assessment'] = {
                'score': float(risk_pred),
                'level': self._categorize_risk(risk_pred),
                'confidence': float(self.model_accuracy['risk_predictor'])
            }
            
            # Anomaly detection
            anomaly_score = self.models['anomaly_detector'].decision_function(features)[0]
            is_anomaly = self.models['anomaly_detector'].predict(features)[0] == -1
            predictions['anomaly_detection'] = {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(anomaly_score),
                'threshold': -0.1
            }
            
            return predictions
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def _categorize_air_quality(self, aqi_value):
        """Categorize air quality index"""
        if aqi_value <= 50:
            return 'Good'
        elif aqi_value <= 100:
            return 'Moderate'
        elif aqi_value <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi_value <= 200:
            return 'Unhealthy'
        elif aqi_value <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'
    
    def _categorize_risk(self, risk_score):
        """Categorize environmental risk level"""
        if risk_score <= 30:
            return 'Low'
        elif risk_score <= 60:
            return 'Moderate'
        elif risk_score <= 80:
            return 'High'
        else:
            return 'Critical'
    
    async def generate_ai_insights(self, environmental_data: Dict) -> Dict:
        """Generate comprehensive AI insights using GPT-4"""
        try:
            # Prepare context for GPT-4
            context = f"""
            Environmental Data Analysis:
            - Air Quality Index: {environmental_data.get('air_quality', 'N/A')}
            - Temperature: {environmental_data.get('temperature', 'N/A')}°C
            - Humidity: {environmental_data.get('humidity', 'N/A')}%
            - Wind Speed: {environmental_data.get('wind_speed', 'N/A')} m/s
            - Location: {environmental_data.get('location', 'Unknown')}
            
            Please provide:
            1. A brief summary of current environmental conditions
            2. Key insights and patterns
            3. Actionable recommendations for improvement
            4. Potential health impacts
            5. Short-term predictions (24-48 hours)
            
            Keep the response professional, accurate, and actionable.
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert environmental scientist and AI analyst specializing in climate data interpretation and public health recommendations."},
                    {"role": "user", "content": context}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            ai_analysis = response.choices[0].message.content
            
            return {
                'ai_generated_insights': ai_analysis,
                'model_used': 'GPT-4',
                'confidence': 0.85,
                'generated_at': datetime.now().isoformat(),
                'data_quality': 'high' if len(environmental_data) > 5 else 'moderate'
            }
            
        except Exception as e:
            logger.error(f"AI insights generation error: {str(e)}")
            # Fallback to rule-based insights
            return self._generate_fallback_insights(environmental_data)
    
    def _generate_fallback_insights(self, data: Dict) -> Dict:
        """Generate fallback insights when GPT-4 is unavailable"""
        insights = []
        recommendations = []
        
        # Air quality analysis
        aqi = data.get('air_quality', 50)
        if aqi > 100:
            insights.append(f"Air quality is concerning with AQI of {aqi}")
            recommendations.append("Limit outdoor activities, especially for sensitive individuals")
        
        # Temperature analysis
        temp = data.get('temperature', 22)
        if temp > 30:
            insights.append("High temperature conditions detected")
            recommendations.append("Stay hydrated and avoid prolonged sun exposure")
        elif temp < 5:
            insights.append("Cold weather conditions present")
            recommendations.append("Dress warmly and be aware of potential health risks")
        
        return {
            'ai_generated_insights': f"Analysis: {'; '.join(insights)}. Recommendations: {'; '.join(recommendations)}",
            'model_used': 'Rule-based fallback',
            'confidence': 0.70,
            'generated_at': datetime.now().isoformat(),
            'data_quality': 'moderate'
        }

# Initialize AI system
ai_system = EnvironmentalAI()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'EcoSentinel AI Service',
        'version': '2.1.0',
        'models_loaded': len(ai_system.models),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

@app.route('/predict', methods=['POST'])
@REQUEST_DURATION.time()
def predict_environmental():
    """Predict environmental metrics"""
    try:
        data = request.get_json()
        
        if not data:
            REQUEST_COUNT.labels(endpoint='predict', status='error').inc()
            return jsonify({'error': 'No input data provided'}), 400
        
        # Make predictions
        predictions = ai_system.predict_environmental_metrics(data)
        
        # Cache results
        cache_key = f"predictions:{hash(str(data))}"
        redis_client.setex(cache_key, 300, json.dumps(predictions))  # Cache for 5 minutes
        
        REQUEST_COUNT.labels(endpoint='predict', status='success').inc()
        
        return jsonify({
            'predictions': predictions,
            'model_info': {
                'accuracies': ai_system.model_accuracy,
                'feature_importance': ai_system.feature_importance
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        REQUEST_COUNT.labels(endpoint='predict', status='error').inc()
        return jsonify({'error': 'Prediction failed', 'message': str(e)}), 500

@app.route('/insights', methods=['POST'])
@REQUEST_DURATION.time()
async def generate_insights():
    """Generate AI-powered environmental insights"""
    try:
        data = request.get_json()
        
        if not data:
            REQUEST_COUNT.labels(endpoint='insights', status='error').inc()
            return jsonify({'error': 'No input data provided'}), 400
        
        # Check cache first
        cache_key = f"insights:{hash(str(data))}"
        cached_insights = redis_client.get(cache_key)
        
        if cached_insights:
            REQUEST_COUNT.labels(endpoint='insights', status='cache_hit').inc()
            return jsonify(json.loads(cached_insights))
        
        # Generate new insights
        insights = await ai_system.generate_ai_insights(data)
        
        # Cache results
        redis_client.setex(cache_key, 1800, json.dumps(insights))  # Cache for 30 minutes
        
        REQUEST_COUNT.labels(endpoint='insights', status='success').inc()
        
        return jsonify(insights)
        
    except Exception as e:
        logger.error(f"Insights endpoint error: {str(e)}")
        REQUEST_COUNT.labels(endpoint='insights', status='error').inc()
        return jsonify({'error': 'Insights generation failed', 'message': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    return jsonify({
        'models': list(ai_system.models.keys()),
        'accuracies': ai_system.model_accuracy,
        'feature_importance': ai_system.feature_importance,
        'training_samples': len(ai_system.training_data),
        'last_trained': datetime.now().isoformat()  # In production, store actual training time
    })

if __name__ == '__main__':
    logger.info(f"Starting EcoSentinel AI Service on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
