/**
 * Test script to verify weather API integration
 */

import weatherAPI from '../lib/weather-api';

async function testWeatherAPI() {
  console.log('🧪 Testing Weather API Integration...\n');

  try {
    // Test 1: Get weather for NYC
    console.log('1️⃣ Testing NYC weather data...');
    const nycWeather = await weatherAPI.getCurrentWeather(40.7128, -74.0060);
    console.log('✅ NYC Weather:', {
      location: nycWeather.location.name,
      temperature: nycWeather.current.temperature,
      description: nycWeather.current.description,
      airQuality: nycWeather.airQuality.aqi,
      humidity: nycWeather.current.humidity,
    });

    // Test 2: Get weather by city name
    console.log('\n2️⃣ Testing city search...');
    const londonWeather = await weatherAPI.getWeatherByCity('London');
    console.log('✅ London Weather:', {
      location: `${londonWeather.location.name}, ${londonWeather.location.country}`,
      temperature: londonWeather.current.temperature,
      description: londonWeather.current.description,
      airQuality: londonWeather.airQuality.aqi,
    });

    // Test 3: Multiple locations
    console.log('\n3️⃣ Testing multiple locations...');
    const multiWeather = await weatherAPI.getMultiLocationWeather([
      { lat: 40.7128, lon: -74.0060 }, // NYC
      { lat: 51.5074, lon: -0.1278 },  // London
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
    ]);
    
    console.log('✅ Multi-location weather:');
    multiWeather.forEach(weather => {
      console.log(`   ${weather.location.name}: ${weather.current.temperature}°C, AQI: ${weather.airQuality.aqi}`);
    });

    console.log('\n🎉 All weather API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Weather API test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testWeatherAPI().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default testWeatherAPI;
