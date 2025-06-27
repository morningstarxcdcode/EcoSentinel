/**
 * Weather API Integration
 * Real-time weather and environmental data
 * Created by: morningstarxcdcode
 */

export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    description: string;
    icon: string;
  };
  airQuality: {
    aqi: number;
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    qualitativeDescription: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    description: string;
    icon: string;
  }>;
}

class WeatherAPI {
  private openWeatherAPIKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private geoUrl = 'http://api.openweathermap.org/geo/1.0';

  constructor() {
    console.log('🌤️ Weather API initialized');
  }

  /**
   * Get current weather data for a location
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Get current weather
      const weatherResponse = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherAPIKey}&units=metric`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();

      // Get air quality data
      const airQualityResponse = await fetch(
        `${this.baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.openWeatherAPIKey}`
      );
      
      const airQualityData = airQualityResponse.ok 
        ? await airQualityResponse.json() 
        : { list: [{ main: { aqi: 3 }, components: {} }] };

      // Get forecast data
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.openWeatherAPIKey}&units=metric&cnt=5`
      );
      
      const forecastData = forecastResponse.ok 
        ? await forecastResponse.json() 
        : { list: [] };

      return this.formatWeatherData(weatherData, airQualityData, forecastData);
    } catch (error) {
      console.error('❌ Error fetching weather data:', error);
      return this.getFallbackData(lat, lon);
    }
  }

  /**
   * Get weather data by city name
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const geoResponse = await fetch(
        `${this.geoUrl}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.openWeatherAPIKey}`
      );
      
      if (!geoResponse.ok) {
        throw new Error(`Geocoding API error: ${geoResponse.status}`);
      }
      
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        throw new Error('City not found');
      }
      
      const { lat, lon } = geoData[0];
      return await this.getCurrentWeather(lat, lon);
    } catch (error) {
      console.error('❌ Error fetching weather by city:', error);
      return this.getFallbackData(0, 0, city);
    }
  }

  /**
   * Format API response data
   */
  private formatWeatherData(weather: any, airQuality: any, forecast: any): WeatherData {
    const aqiData = airQuality.list?.[0] || { main: { aqi: 3 }, components: {} };
    
    return {
      location: {
        name: weather.name || 'Unknown',
        country: weather.sys?.country || 'Unknown',
        lat: weather.coord?.lat || 0,
        lon: weather.coord?.lon || 0,
      },
      current: {
        temperature: Math.round(weather.main?.temp || 20),
        humidity: weather.main?.humidity || 50,
        pressure: weather.main?.pressure || 1013,
        windSpeed: weather.wind?.speed || 0,
        windDirection: weather.wind?.deg || 0,
        visibility: weather.visibility ? weather.visibility / 1000 : 10,
        uvIndex: 5, // UV Index requires separate API call
        cloudCover: weather.clouds?.all || 0,
        description: weather.weather?.[0]?.description || 'Clear sky',
        icon: weather.weather?.[0]?.icon || '01d',
      },
      airQuality: {
        aqi: aqiData.main?.aqi || 3,
        components: {
          co: aqiData.components?.co || 233.0,
          no: aqiData.components?.no || 0.0,
          no2: aqiData.components?.no2 || 15.0,
          o3: aqiData.components?.o3 || 120.0,
          so2: aqiData.components?.so2 || 5.0,
          pm2_5: aqiData.components?.pm2_5 || 12.0,
          pm10: aqiData.components?.pm10 || 18.0,
          nh3: aqiData.components?.nh3 || 1.0,
        },
        qualitativeDescription: this.getAQIDescription(aqiData.main?.aqi || 3),
      },
      forecast: this.formatForecastData(forecast.list || []),
    };
  }

  /**
   * Format forecast data
   */
  private formatForecastData(forecastList: any[]): WeatherData['forecast'] {
    return forecastList.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000).toISOString(),
      tempMax: Math.round(item.main?.temp_max || item.main?.temp || 25),
      tempMin: Math.round(item.main?.temp_min || item.main?.temp || 15),
      humidity: item.main?.humidity || 50,
      description: item.weather?.[0]?.description || 'Clear sky',
      icon: item.weather?.[0]?.icon || '01d',
    }));
  }

  /**
   * Get AQI qualitative description
   */
  private getAQIDescription(aqi: number): string {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  }

  /**
   * Get fallback data when API fails
   */
  private getFallbackData(lat: number, lon: number, city?: string): WeatherData {
    console.log('📊 Using fallback weather data');
    
    return {
      location: {
        name: city || 'Demo Location',
        country: 'Demo',
        lat,
        lon,
      },
      current: {
        temperature: 22,
        humidity: 65,
        pressure: 1013,
        windSpeed: 12.3,
        windDirection: 180,
        visibility: 10,
        uvIndex: 5,
        cloudCover: 25,
        description: 'Partly cloudy',
        icon: '02d',
      },
      airQuality: {
        aqi: 3,
        components: {
          co: 233.0,
          no: 0.0,
          no2: 15.0,
          o3: 120.0,
          so2: 5.0,
          pm2_5: 12.0,
          pm10: 18.0,
          nh3: 1.0,
        },
        qualitativeDescription: 'Moderate',
      },
      forecast: Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        tempMax: 25 + Math.floor(Math.random() * 10),
        tempMin: 15 + Math.floor(Math.random() * 5),
        humidity: 50 + Math.floor(Math.random() * 20),
        description: 'Partly cloudy',
        icon: '02d',
      })),
    };
  }

  /**
   * Get weather data for multiple locations
   */
  async getMultiLocationWeather(locations: Array<{ lat: number; lon: number }>): Promise<WeatherData[]> {
    const promises = locations.map(location => 
      this.getCurrentWeather(location.lat, location.lon)
    );
    
    return Promise.all(promises);
  }

  /**
   * Get historical weather data (requires premium API)
   */
  async getHistoricalWeather(lat: number, lon: number, date: Date): Promise<WeatherData | null> {
    console.log(`📊 Historical weather data not available in free tier for ${lat}, ${lon} on ${date}`);
    return null;
  }
}

// Export singleton instance
export const weatherAPI = new WeatherAPI();
export default weatherAPI;
