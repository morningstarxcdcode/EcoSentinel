/**
 * IoT Sensor Integration System
 * Handles connection and data collection from various environmental sensors
 */

export interface SensorReading {
  sensorId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  measurements: {
    airQuality?: {
      pm25: number;
      pm10: number;
      aqi: number;
    };
    temperature: number;
    humidity: number;
    pressure: number;
    gasLevels?: {
      co2: number;
      co: number;
      no2: number;
      o3: number;
    };
    noise?: number;
    uv?: number;
  };
  deviceInfo: {
    model: string;
    firmware: string;
    batteryLevel?: number;
    signalStrength?: number;
  };
}

export interface SensorDevice {
  id: string;
  name: string;
  type: 'air_quality' | 'weather' | 'multi_sensor' | 'diy_kit';
  status: 'online' | 'offline' | 'maintenance';
  location: {
    latitude: number;
    longitude: number;
    indoor: boolean;
  };
  owner: string;
  lastReading?: SensorReading;
  calibration: {
    lastCalibrated: string;
    nextCalibration: string;
    accuracy: number;
  };
}

class IoTSensorManager {
  private sensors: Map<string, SensorDevice> = new Map();
  private wsConnections: Map<string, WebSocket> = new Map();
  private dataBuffer: SensorReading[] = [];

  constructor() {
    this.initializeManager();
  }

  private initializeManager() {
    console.log('🔌 Initializing IoT Sensor Manager...');
    
    // Set up data processing interval
    setInterval(() => {
      this.processBufferedData();
    }, 30000); // Process every 30 seconds

    // Set up sensor health check
    setInterval(() => {
      this.checkSensorHealth();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Register a new IoT sensor device
   */
  async registerSensor(sensorConfig: Omit<SensorDevice, 'id' | 'status' | 'lastReading'>): Promise<string> {
    const sensorId = this.generateSensorId();
    
    const sensor: SensorDevice = {
      id: sensorId,
      status: 'offline',
      ...sensorConfig
    };

    this.sensors.set(sensorId, sensor);
    
    console.log(`📡 Registered new sensor: ${sensorId} (${sensor.name})`);
    
    // Save to database
    await this.saveSensorToDatabase(sensor);
    
    return sensorId;
  }

  /**
   * Connect to a sensor device via WebSocket
   */
  async connectSensor(sensorId: string, websocketUrl: string): Promise<void> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    try {
      const ws = new WebSocket(websocketUrl);
      
      ws.onopen = () => {
        console.log(`🔗 Connected to sensor ${sensorId}`);
        sensor.status = 'online';
        this.wsConnections.set(sensorId, ws);
        
        // Send configuration to sensor
        ws.send(JSON.stringify({
          type: 'config',
          sensorId: sensorId,
          reportingInterval: 60000, // 1 minute
          calibrationData: sensor.calibration
        }));
      };

      ws.onmessage = (event) => {
        this.handleSensorData(sensorId, JSON.parse(event.data));
      };

      ws.onclose = () => {
        console.log(`🔌 Disconnected from sensor ${sensorId}`);
        sensor.status = 'offline';
        this.wsConnections.delete(sensorId);
        
        // Attempt reconnection after 30 seconds
        setTimeout(() => {
          this.connectSensor(sensorId, websocketUrl);
        }, 30000);
      };

      ws.onerror = (error) => {
        console.error(`❌ Sensor ${sensorId} connection error:`, error);
        sensor.status = 'offline';
      };

    } catch (error) {
      console.error(`❌ Failed to connect to sensor ${sensorId}:`, error);
      sensor.status = 'offline';
    }
  }

  /**
   * Handle incoming sensor data
   */
  private handleSensorData(sensorId: string, data: any) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return;

    try {
      const reading: SensorReading = {
        sensorId: sensorId,
        timestamp: new Date().toISOString(),
        location: sensor.location,
        measurements: this.parseSensorMeasurements(data),
        deviceInfo: {
          model: sensor.type,
          firmware: data.firmware || 'unknown',
          batteryLevel: data.battery,
          signalStrength: data.signal
        }
      };

      // Validate reading
      if (this.validateReading(reading)) {
        // Update sensor's last reading
        sensor.lastReading = reading;
        
        // Add to buffer for processing
        this.dataBuffer.push(reading);
        
        // Emit real-time update
        this.emitRealTimeUpdate(reading);
        
        console.log(`📊 Received data from sensor ${sensorId}: AQI ${reading.measurements.airQuality?.aqi || 'N/A'}`);
      } else {
        console.warn(`⚠️ Invalid reading from sensor ${sensorId}`);
      }

    } catch (error) {
      console.error(`❌ Error processing data from sensor ${sensorId}:`, error);
    }
  }

  /**
   * Parse raw sensor measurements into standardized format
   */
  private parseSensorMeasurements(data: any): SensorReading['measurements'] {
    return {
      airQuality: data.airQuality ? {
        pm25: parseFloat(data.airQuality.pm25) || 0,
        pm10: parseFloat(data.airQuality.pm10) || 0,
        aqi: this.calculateAQI(data.airQuality)
      } : undefined,
      temperature: parseFloat(data.temperature) || 0,
      humidity: parseFloat(data.humidity) || 0,
      pressure: parseFloat(data.pressure) || 1013.25,
      gasLevels: data.gasLevels ? {
        co2: parseFloat(data.gasLevels.co2) || 0,
        co: parseFloat(data.gasLevels.co) || 0,
        no2: parseFloat(data.gasLevels.no2) || 0,
        o3: parseFloat(data.gasLevels.o3) || 0
      } : undefined,
      noise: data.noise ? parseFloat(data.noise) : undefined,
      uv: data.uv ? parseFloat(data.uv) : undefined
    };
  }

  /**
   * Calculate Air Quality Index from PM measurements
   */
  private calculateAQI(airQualityData: any): number {
    const pm25 = parseFloat(airQualityData.pm25) || 0;
    const pm10 = parseFloat(airQualityData.pm10) || 0;

    // Simplified AQI calculation based on PM2.5
    if (pm25 <= 12) return Math.round(pm25 * 50 / 12);
    if (pm25 <= 35.4) return Math.round(50 + (pm25 - 12) * 50 / 23.4);
    if (pm25 <= 55.4) return Math.round(100 + (pm25 - 35.4) * 50 / 20);
    if (pm25 <= 150.4) return Math.round(150 + (pm25 - 55.4) * 50 / 95);
    if (pm25 <= 250.4) return Math.round(200 + (pm25 - 150.4) * 100 / 100);
    return Math.round(300 + (pm25 - 250.4) * 200 / 249.6);
  }

  /**
   * Validate sensor reading for data quality
   */
  private validateReading(reading: SensorReading): boolean {
    const { measurements } = reading;
    
    // Check temperature range (-50°C to 60°C)
    if (measurements.temperature < -50 || measurements.temperature > 60) {
      return false;
    }
    
    // Check humidity range (0% to 100%)
    if (measurements.humidity < 0 || measurements.humidity > 100) {
      return false;
    }
    
    // Check pressure range (800 to 1200 hPa)
    if (measurements.pressure < 800 || measurements.pressure > 1200) {
      return false;
    }
    
    // Check AQI range (0 to 500)
    if (measurements.airQuality && 
        (measurements.airQuality.aqi < 0 || measurements.airQuality.aqi > 500)) {
      return false;
    }
    
    return true;
  }

  /**
   * Process buffered sensor data
   */
  private async processBufferedData() {
    if (this.dataBuffer.length === 0) return;

    console.log(`🔄 Processing ${this.dataBuffer.length} sensor readings...`);

    try {
      // Group readings by location for aggregation
      const locationGroups = this.groupReadingsByLocation(this.dataBuffer);
      
      // Process each location group
      for (const location of locationGroups.keys()) {
        const readings = locationGroups.get(location)!;
        const aggregatedData = this.aggregateReadings(readings);
        
        // Save to database
        await this.saveAggregatedData(location, aggregatedData);
        
        // Update real-time environmental data
        await this.updateEnvironmentalData(location, aggregatedData);
      }
      
      // Clear buffer
      this.dataBuffer = [];
      
      console.log('✅ Sensor data processed successfully');
      
    } catch (error) {
      console.error('❌ Error processing sensor data:', error);
    }
  }

  /**
   * Group sensor readings by location
   */
  private groupReadingsByLocation(readings: SensorReading[]): Map<string, SensorReading[]> {
    const groups = new Map<string, SensorReading[]>();
    
    for (const reading of readings) {
      const locationKey = `${reading.location.latitude.toFixed(3)},${reading.location.longitude.toFixed(3)}`;
      
      if (!groups.has(locationKey)) {
        groups.set(locationKey, []);
      }
      
      groups.get(locationKey)!.push(reading);
    }
    
    return groups;
  }

  /**
   * Aggregate multiple sensor readings
   */
  private aggregateReadings(readings: SensorReading[]): any {
    const count = readings.length;
    
    const aggregated = {
      timestamp: new Date().toISOString(),
      location: readings[0].location,
      sensorCount: count,
      measurements: {
        temperature: this.calculateAverage(readings, 'temperature'),
        humidity: this.calculateAverage(readings, 'humidity'),
        pressure: this.calculateAverage(readings, 'pressure'),
        airQuality: {
          pm25: this.calculateAverage(readings, 'airQuality.pm25'),
          pm10: this.calculateAverage(readings, 'airQuality.pm10'),
          aqi: this.calculateAverage(readings, 'airQuality.aqi')
        },
        gasLevels: {
          co2: this.calculateAverage(readings, 'gasLevels.co2'),
          co: this.calculateAverage(readings, 'gasLevels.co'),
          no2: this.calculateAverage(readings, 'gasLevels.no2'),
          o3: this.calculateAverage(readings, 'gasLevels.o3')
        }
      },
      dataQuality: {
        accuracy: this.calculateDataQuality(readings),
        completeness: this.calculateCompleteness(readings)
      }
    };
    
    return aggregated;
  }

  /**
   * Calculate average value from sensor readings
   */
  private calculateAverage(readings: SensorReading[], path: string): number {
    const values = readings
      .map(reading => this.getNestedValue(reading.measurements, path))
      .filter(value => value !== null && value !== undefined && !isNaN(value));
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(readings: SensorReading[]): number {
    let qualityScore = 0;
    let totalChecks = 0;
    
    for (const reading of readings) {
      const sensor = this.sensors.get(reading.sensorId);
      if (sensor) {
        qualityScore += sensor.calibration.accuracy;
        totalChecks++;
      }
    }
    
    return totalChecks > 0 ? qualityScore / totalChecks : 0.8; // Default 80%
  }

  /**
   * Calculate data completeness
   */
  private calculateCompleteness(readings: SensorReading[]): number {
    const expectedFields = ['temperature', 'humidity', 'pressure'];
    let completenessScore = 0;
    
    for (const reading of readings) {
      let fieldsPresent = 0;
      for (const field of expectedFields) {
        if (reading.measurements[field as keyof typeof reading.measurements] !== undefined) {
          fieldsPresent++;
        }
      }
      completenessScore += fieldsPresent / expectedFields.length;
    }
    
    return readings.length > 0 ? completenessScore / readings.length : 0;
  }

  /**
   * Check health of all connected sensors
   */
  private async checkSensorHealth() {
    console.log('🏥 Checking sensor health...');
    
    for (const [sensorId, sensor] of this.sensors) {
      const timeSinceLastReading = sensor.lastReading 
        ? Date.now() - new Date(sensor.lastReading.timestamp).getTime()
        : Infinity;
      
      // Mark sensor as offline if no data for 10 minutes
      if (timeSinceLastReading > 600000 && sensor.status === 'online') {
        sensor.status = 'offline';
        console.warn(`⚠️ Sensor ${sensorId} marked as offline - no data for ${Math.round(timeSinceLastReading / 60000)} minutes`);
      }
      
      // Check calibration status
      const nextCalibration = new Date(sensor.calibration.nextCalibration);
      if (nextCalibration < new Date()) {
        sensor.status = 'maintenance';
        console.warn(`🔧 Sensor ${sensorId} needs calibration`);
      }
    }
  }

  /**
   * Emit real-time update to connected clients
   */
  private emitRealTimeUpdate(reading: SensorReading) {
    // This would integrate with your WebSocket system
    // to send real-time updates to connected clients
    console.log(`📡 Emitting real-time update for sensor ${reading.sensorId}`);
  }

  /**
   * Generate unique sensor ID
   */
  private generateSensorId(): string {
    return `sensor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save sensor configuration to database
   */
  private async saveSensorToDatabase(sensor: SensorDevice): Promise<void> {
    // Implementation would save to your database
    console.log(`💾 Saving sensor ${sensor.id} to database`);
  }

  /**
   * Save aggregated data to database
   */
  private async saveAggregatedData(location: string, data: any): Promise<void> {
    // Implementation would save aggregated data
    console.log(`💾 Saving aggregated data for location ${location}`);
  }

  /**
   * Update environmental data with sensor readings
   */
  private async updateEnvironmentalData(location: string, data: any): Promise<void> {
    // Implementation would update the main environmental data system
    console.log(`🔄 Updating environmental data for location ${location}`);
  }

  /**
   * Get all registered sensors
   */
  public getSensors(): SensorDevice[] {
    return Array.from(this.sensors.values());
  }

  /**
   * Get sensor by ID
   */
  public getSensor(sensorId: string): SensorDevice | undefined {
    return this.sensors.get(sensorId);
  }

  /**
   * Get sensors by location (within radius)
   */
  public getSensorsByLocation(latitude: number, longitude: number, radiusKm: number = 5): SensorDevice[] {
    return Array.from(this.sensors.values()).filter(sensor => {
      const distance = this.calculateDistance(
        latitude, longitude,
        sensor.location.latitude, sensor.location.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export singleton instance
export const iotSensorManager = new IoTSensorManager();
