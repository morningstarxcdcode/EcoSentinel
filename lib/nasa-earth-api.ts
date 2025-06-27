/**
 * NASA Earth Data API Integration
 * Real-time satellite environmental monitoring
 * Created by: morningstarxcdcode
 */

export interface NASAEarthData {
  imagery: {
    url: string;
    date: string;
    coordinates: { lat: number; lon: number };
    cloudScore: number;
  };
  landsat: {
    ndvi: number;
    temperature: number;
    moisture: number;
    urbanHeatIsland: number;
  };
  modis: {
    fireHotspots: FireHotspot[];
    aerosols: number;
    airQuality: number;
    vegetationHealth: number;
  };
  viirs: {
    nightLights: number;
    humanActivity: number;
    lightPollution: number;
  };
}

interface FireHotspot {
  lat: number;
  lon: number;
  confidence: number;
  brightness: number;
  fireRadiativePower: number;
  detectionTime: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
}

class NASAEarthAPI {
  private apiKey = process.env.NASA_API_KEY;
  private baseUrl = 'https://api.nasa.gov';
  private firmsUrl = 'https://firms.modaps.eosdis.nasa.gov/api';
  
  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    console.log('🛰️ Initializing NASA Earth API...');
    
    // Set up global monitoring for major cities
    this.startGlobalMonitoring();
    
    // Set up wildfire alert system
    this.startWildfireMonitoring();
  }

  /**
   * Get comprehensive Earth data for location
   */
  async getEarthData(lat: number, lon: number): Promise<NASAEarthData> {
    try {
      const [imagery, landsat, modis, viirs] = await Promise.all([
        this.getEarthImagery(lat, lon),
        this.getLandsatData(lat, lon),
        this.getMODISData(lat, lon),
        this.getVIIRSData(lat, lon)
      ]);

      return {
        imagery,
        landsat,
        modis,
        viirs
      };
    } catch (error) {
      console.error('❌ Error fetching NASA Earth data:', error);
      throw new Error('Failed to fetch satellite data');
    }
  }

  /**
   * Get Earth imagery from NASA
   */
  private async getEarthImagery(lat: number, lon: number) {
    const url = `${this.baseUrl}/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=2024-01-01&dim=0.1&api_key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        url: data.url,
        date: data.date,
        coordinates: { lat, lon },
        cloudScore: this.calculateCloudScore(data)
      };
    } catch (error) {
      console.error('❌ Error fetching Earth imagery:', error);
      return {
        url: '',
        date: new Date().toISOString(),
        coordinates: { lat, lon },
        cloudScore: 0
      };
    }
  }

  /**
   * Get Landsat environmental data
   */
  private async getLandsatData(lat: number, lon: number) {
    try {
      // Simulate Landsat data processing
      const ndvi = await this.calculateNDVI(lat, lon);
      const temperature = await this.getLandSurfaceTemperature(lat, lon);
      
      return {
        ndvi: ndvi,
        temperature: temperature,
        moisture: this.calculateSoilMoisture(ndvi, temperature),
        urbanHeatIsland: this.calculateUrbanHeatIsland(lat, lon, temperature)
      };
    } catch (error) {
      console.error('❌ Error processing Landsat data:', error);
      return {
        ndvi: 0.5,
        temperature: 20,
        moisture: 0.3,
        urbanHeatIsland: 0
      };
    }
  }

  /**
   * Get MODIS environmental data
   */
  private async getMODISData(lat: number, lon: number) {
    try {
      const fireHotspots = await this.getFireHotspots(lat, lon);
      const aerosols = await this.getAerosolOpticalDepth(lat, lon);
      
      return {
        fireHotspots: fireHotspots,
        aerosols: aerosols,
        airQuality: this.calculateAirQualityFromAerosols(aerosols),
        vegetationHealth: await this.getVegetationHealth(lat, lon)
      };
    } catch (error) {
      console.error('❌ Error processing MODIS data:', error);
      return {
        fireHotspots: [],
        aerosols: 0.1,
        airQuality: 50,
        vegetationHealth: 0.7
      };
    }
  }

  /**
   * Get VIIRS nighttime data
   */
  private async getVIIRSData(lat: number, lon: number) {
    try {
      const nightLights = await this.getNightLights(lat, lon);
      
      return {
        nightLights: nightLights,
        humanActivity: this.calculateHumanActivity(nightLights),
        lightPollution: this.calculateLightPollution(nightLights)
      };
    } catch (error) {
      console.error('❌ Error processing VIIRS data:', error);
      return {
        nightLights: 0.5,
        humanActivity: 0.3,
        lightPollution: 0.2
      };
    }
  }

  /**
   * Get active fire hotspots using FIRMS API
   */
  private async getFireHotspots(lat: number, lon: number, radiusKm: number = 50): Promise<FireHotspot[]> {
    const url = `${this.firmsUrl}/area/csv/${this.apiKey}/VIIRS_SNPP_NRT/${lat-0.5},${lon-0.5},${lat+0.5},${lon+0.5}/1`;
    
    try {
      const response = await fetch(url);
      const csvData = await response.text();
      
      return this.parseFireHotspots(csvData);
    } catch (error) {
      console.error('❌ Error fetching fire hotspots:', error);
      return [];
    }
  }

  /**
   * Parse fire hotspot CSV data
   */
  private parseFireHotspots(csvData: string): FireHotspot[] {
    const lines = csvData.split('\n').slice(1); // Skip header
    const hotspots: FireHotspot[] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const columns = line.split(',');
      if (columns.length >= 9) {
        const confidence = parseFloat(columns[8]);
        const brightness = parseFloat(columns[2]);
        const frp = parseFloat(columns[3]) || 0;
        
        hotspots.push({
          lat: parseFloat(columns[0]),
          lon: parseFloat(columns[1]),
          brightness: brightness,
          confidence: confidence,
          fireRadiativePower: frp,
          detectionTime: columns[5],
          severity: this.calculateFireSeverity(confidence, brightness, frp)
        });
      }
    }
    
    return hotspots;
  }

  /**
   * Calculate fire severity based on multiple factors
   */
  private calculateFireSeverity(confidence: number, brightness: number, frp: number): 'low' | 'medium' | 'high' | 'extreme' {
    const score = (confidence * 0.4) + (brightness * 0.3) + (frp * 0.3);
    
    if (score > 80) return 'extreme';
    if (score > 60) return 'high';
    if (score > 40) return 'medium';
    return 'low';
  }

  /**
   * Calculate NDVI (Normalized Difference Vegetation Index)
   */
  private async calculateNDVI(lat: number, lon: number): Promise<number> {
    try {
      // In real implementation, this would process actual satellite bands
      // For now, simulate based on location characteristics
      const baseNDVI = 0.6; // Moderate vegetation
      const seasonalVariation = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.2;
      const latitudeEffect = Math.cos(lat * Math.PI / 180) * 0.1;
      
      return Math.max(-1, Math.min(1, baseNDVI + seasonalVariation + latitudeEffect));
    } catch (error) {
      console.error('❌ Error calculating NDVI:', error);
      return 0.5;
    }
  }

  /**
   * Get land surface temperature
   */
  private async getLandSurfaceTemperature(lat: number, lon: number): Promise<number> {
    try {
      // Simulate land surface temperature based on location and season
      const baseTemp = 15; // Base temperature
      const latitudeEffect = (90 - Math.abs(lat)) * 0.3; // Warmer near equator
      const seasonalEffect = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 10;
      
      return baseTemp + latitudeEffect + seasonalEffect;
    } catch (error) {
      console.error('❌ Error getting land surface temperature:', error);
      return 20;
    }
  }

  /**
   * Calculate aerosol optical depth
   */
  private async getAerosolOpticalDepth(lat: number, lon: number): Promise<number> {
    try {
      // Simulate AOD based on location characteristics
      const urbanFactor = this.isUrbanArea(lat, lon) ? 0.3 : 0.1;
      const seasonalFactor = Math.random() * 0.2;
      
      return Math.max(0, Math.min(2, urbanFactor + seasonalFactor));
    } catch (error) {
      console.error('❌ Error getting aerosol data:', error);
      return 0.1;
    }
  }

  /**
   * Calculate air quality from aerosol data
   */
  private calculateAirQualityFromAerosols(aod: number): number {
    // Convert AOD to AQI approximation
    if (aod < 0.1) return 25;  // Good
    if (aod < 0.3) return 75;  // Moderate
    if (aod < 0.5) return 125; // Unhealthy for sensitive
    if (aod < 1.0) return 175; // Unhealthy
    return 225; // Very unhealthy
  }

  /**
   * Get vegetation health index
   */
  private async getVegetationHealth(lat: number, lon: number): Promise<number> {
    const ndvi = await this.calculateNDVI(lat, lon);
    const temperature = await this.getLandSurfaceTemperature(lat, lon);
    
    // Calculate vegetation health based on NDVI and temperature stress
    let health = (ndvi + 1) / 2; // Normalize NDVI to 0-1
    
    // Temperature stress factor
    if (temperature > 35 || temperature < 5) {
      health *= 0.7; // Reduce health for temperature stress
    }
    
    return Math.max(0, Math.min(1, health));
  }

  /**
   * Get night lights data
   */
  private async getNightLights(lat: number, lon: number): Promise<number> {
    try {
      // Simulate night lights based on urban density
      const urbanDensity = this.getUrbanDensity(lat, lon);
      return Math.max(0, Math.min(1, urbanDensity * 0.8 + Math.random() * 0.2));
    } catch (error) {
      console.error('❌ Error getting night lights data:', error);
      return 0.3;
    }
  }

  /**
   * Helper functions
   */
  private calculateCloudScore(imageData: any): number {
    // Simulate cloud score calculation
    return Math.random() * 100;
  }

  private calculateSoilMoisture(ndvi: number, temperature: number): number {
    // Higher NDVI and moderate temperature indicate higher moisture
    const moistureIndex = (ndvi * 0.7) + ((30 - Math.abs(temperature - 20)) / 30 * 0.3);
    return Math.max(0, Math.min(1, moistureIndex));
  }

  private calculateUrbanHeatIsland(lat: number, lon: number, temperature: number): number {
    const urbanDensity = this.getUrbanDensity(lat, lon);
    return urbanDensity * 3; // Urban areas can be 3°C warmer
  }

  private calculateHumanActivity(nightLights: number): number {
    return Math.min(1, nightLights * 1.2);
  }

  private calculateLightPollution(nightLights: number): number {
    return Math.min(1, nightLights * 0.9);
  }

  private isUrbanArea(lat: number, lon: number): boolean {
    // Simplified urban area detection
    const urbanDensity = this.getUrbanDensity(lat, lon);
    return urbanDensity > 0.5;
  }

  private getUrbanDensity(lat: number, lon: number): number {
    // Simulate urban density based on known major cities
    const majorCities = [
      { lat: 40.7128, lon: -74.0060, density: 0.9 }, // NYC
      { lat: 51.5074, lon: -0.1278, density: 0.8 },  // London
      { lat: 35.6762, lon: 139.6503, density: 0.9 }, // Tokyo
      { lat: 37.7749, lon: -122.4194, density: 0.7 } // SF
    ];
    
    for (const city of majorCities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2));
      if (distance < 0.5) { // Within ~50km
        return city.density * (1 - distance * 2);
      }
    }
    
    return Math.random() * 0.3; // Rural/suburban baseline
  }

  /**
   * Start global monitoring for major cities
   */
  private startGlobalMonitoring() {
    const majorCities = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
      { name: 'Lagos', lat: 6.5244, lon: 3.3792 }
    ];

    // Update satellite data every 6 hours
    setInterval(async () => {
      console.log('🌍 Updating global satellite data...');
      
      for (const city of majorCities) {
        try {
          const earthData = await this.getEarthData(city.lat, city.lon);
          await this.processCityData(city.name, earthData);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Failed to update ${city.name}:`, error);
        }
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  /**
   * Start wildfire monitoring system
   */
  private startWildfireMonitoring() {
    // Check for new fires every 30 minutes
    setInterval(async () => {
      console.log('🔥 Checking for wildfire activity...');
      
      const fireProneRegions = [
        { name: 'California', lat: 36.7783, lon: -119.4179 },
        { name: 'Australia', lat: -25.2744, lon: 133.7751 },
        { name: 'Amazon', lat: -3.4653, lon: -62.2159 },
        { name: 'Siberia', lat: 60.0000, lon: 105.0000 }
      ];
      
      for (const region of fireProneRegions) {
        try {
          const fires = await this.getFireHotspots(region.lat, region.lon, 200);
          const severeFires = fires.filter(fire => fire.severity === 'high' || fire.severity === 'extreme');
          
          if (severeFires.length > 0) {
            await this.sendFireAlert(region.name, severeFires);
          }
        } catch (error) {
          console.error(`❌ Error monitoring fires in ${region.name}:`, error);
        }
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  /**
   * Process city satellite data
   */
  private async processCityData(cityName: string, earthData: NASAEarthData): Promise<void> {
    console.log(`🛰️ Processing satellite data for ${cityName}`);
    
    // Check for environmental alerts
    const alerts = [];
    
    // Fire alerts
    if (earthData.modis.fireHotspots.length > 0) {
      alerts.push({
        type: 'wildfire',
        severity: 'high',
        message: `${earthData.modis.fireHotspots.length} active fire(s) detected near ${cityName}`,
        data: earthData.modis.fireHotspots
      });
    }
    
    // Air quality alerts
    if (earthData.modis.airQuality > 150) {
      alerts.push({
        type: 'air_quality',
        severity: 'medium',
        message: `Poor air quality detected in ${cityName} (AQI: ${earthData.modis.airQuality})`,
        data: { aqi: earthData.modis.airQuality }
      });
    }
    
    // Vegetation health alerts
    if (earthData.modis.vegetationHealth < 0.3) {
      alerts.push({
        type: 'vegetation_stress',
        severity: 'medium',
        message: `Vegetation stress detected in ${cityName}`,
        data: { health: earthData.modis.vegetationHealth }
      });
    }
    
    if (alerts.length > 0) {
      await this.sendEnvironmentalAlerts(cityName, alerts);
    }
    
    // Store data for historical analysis
    await this.storeEarthData(cityName, earthData);
  }

  /**
   * Send fire alerts
   */
  private async sendFireAlert(regionName: string, fires: FireHotspot[]): Promise<void> {
    console.log(`🔥 FIRE ALERT: ${fires.length} severe fires detected in ${regionName}`);
    
    // Implementation would send to alert system
    // This could integrate with emergency services, push notifications, etc.
  }

  /**
   * Send environmental alerts
   */
  private async sendEnvironmentalAlerts(location: string, alerts: any[]): Promise<void> {
    console.log(`🚨 Environmental alerts for ${location}:`, alerts);
    
    // Implementation would send to notification system
  }

  /**
   * Store Earth data for historical analysis
   */
  private async storeEarthData(location: string, data: NASAEarthData): Promise<void> {
    // Implementation would store in database
    console.log(`💾 Storing Earth data for ${location}`);
  }
}

// Export singleton instance
export const nasaEarthAPI = new NASAEarthAPI();
