import { NextRequest, NextResponse } from 'next/server';
import weatherAPI from '@/lib/weather-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/environmental-data
 * Fetch real-time environmental data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '40.7128'); // Default to NYC
    const lon = parseFloat(searchParams.get('lon') || '-74.0060');
    const city = searchParams.get('city');

    const location = city || `${lat}, ${lon}`;
    console.log(`🌍 Fetching environmental data for: ${location}`);

    // Fetch weather data
    const weatherData = city 
      ? await weatherAPI.getWeatherByCity(city)
      : await weatherAPI.getCurrentWeather(lat, lon);

    // Transform data for frontend
    const environmentalData = {
      location: weatherData.location,
      airQuality: weatherData.airQuality.aqi,
      airQualityDescription: weatherData.airQuality.qualitativeDescription,
      temperature: weatherData.current.temperature,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      pressure: weatherData.current.pressure,
      visibility: weatherData.current.visibility,
      uvIndex: weatherData.current.uvIndex,
      cloudCover: weatherData.current.cloudCover,
      weatherDescription: weatherData.current.description,
      weatherIcon: weatherData.current.icon,
      airComponents: weatherData.airQuality.components,
      forecast: weatherData.forecast,
      riskLevel: calculateRiskLevel(weatherData),
      lastUpdated: new Date().toISOString(),
      dataSource: 'live',
      // Additional calculated metrics
      carbonLevel: Math.round(weatherData.airQuality.components.co / 10), // Simplified CO level
      healthIndex: calculateHealthIndex(weatherData),
      environmentalScore: calculateEnvironmentalScore(weatherData),
    };

    return NextResponse.json(environmentalData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching environmental data:', error);
    
    // Return fallback data instead of error
    const fallbackData = {
      location: {
        name: 'Demo Location',
        country: 'Demo',
        lat: 40.7128,
        lon: -74.0060,
      },
      airQuality: 75,
      airQualityDescription: 'Moderate',
      temperature: 22.5,
      humidity: 65,
      windSpeed: 12.3,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      cloudCover: 25,
      weatherDescription: 'Partly cloudy',
      weatherIcon: '02d',
      carbonLevel: 410,
      riskLevel: 'low',
      healthIndex: 78,
      environmentalScore: 82,
      lastUpdated: new Date().toISOString(),
      dataSource: 'fallback',
      forecast: [],
      airComponents: {},
    };

    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

/**
 * Calculate overall risk level based on environmental data
 */
function calculateRiskLevel(weatherData: any): 'low' | 'medium' | 'high' | 'critical' {
  const aqi = weatherData.airQuality.aqi;
  const temp = weatherData.current.temperature;
  const humidity = weatherData.current.humidity;
  const windSpeed = weatherData.current.windSpeed;

  let riskScore = 0;

  // Air quality risk
  if (aqi >= 4) riskScore += 3;
  else if (aqi === 3) riskScore += 2;
  else if (aqi === 2) riskScore += 1;

  // Temperature extremes
  if (temp > 35 || temp < -10) riskScore += 2;
  else if (temp > 30 || temp < 0) riskScore += 1;

  // High humidity
  if (humidity > 80) riskScore += 1;

  // Low wind (poor air circulation)
  if (windSpeed < 2) riskScore += 1;

  if (riskScore >= 5) return 'critical';
  if (riskScore >= 3) return 'high';
  if (riskScore >= 1) return 'medium';
  return 'low';
}

/**
 * Calculate health index based on environmental conditions
 */
function calculateHealthIndex(weatherData: any): number {
  const aqi = weatherData.airQuality.aqi;
  const temp = weatherData.current.temperature;
  const humidity = weatherData.current.humidity;
  const uvIndex = weatherData.current.uvIndex;

  let healthScore = 100;

  // Deduct for poor air quality
  healthScore -= (aqi - 1) * 15;

  // Deduct for temperature extremes
  if (temp > 35 || temp < -5) healthScore -= 20;
  else if (temp > 30 || temp < 0) healthScore -= 10;

  // Deduct for high humidity
  if (humidity > 80) healthScore -= 10;

  // Deduct for high UV
  if (uvIndex > 8) healthScore -= 15;
  else if (uvIndex > 6) healthScore -= 5;

  return Math.max(0, Math.min(100, Math.round(healthScore)));
}

/**
 * Calculate environmental score
 */
function calculateEnvironmentalScore(weatherData: any): number {
  const aqi = weatherData.airQuality.aqi;
  const pm25 = weatherData.airQuality.components.pm2_5;
  const pm10 = weatherData.airQuality.components.pm10;
  const co = weatherData.airQuality.components.co;

  let envScore = 100;

  // Air quality impact
  envScore -= (aqi - 1) * 12;

  // Particulate matter impact
  if (pm25 > 25) envScore -= 15;
  else if (pm25 > 15) envScore -= 8;

  if (pm10 > 50) envScore -= 10;
  else if (pm10 > 25) envScore -= 5;

  // Carbon monoxide impact
  if (co > 500) envScore -= 10;
  else if (co > 300) envScore -= 5;

  return Math.max(0, Math.min(100, Math.round(envScore)));
}
