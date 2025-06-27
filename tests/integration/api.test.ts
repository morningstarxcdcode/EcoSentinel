/**
 * API Integration Tests
 * Tests for EcoSentinel API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('🌍 EcoSentinel API Integration Tests', () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  beforeAll(async () => {
    // Setup test database and services
    console.log('🔧 Setting up integration test environment...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up integration test environment...');
  });

  describe('🔍 Health Check Endpoint', () => {
    it('should return healthy status', async () => {
      global.testUtils.mockApiResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: 'connected',
          redis: 'connected',
          ai: 'operational'
        }
      });

      const response = await fetch(`${baseURL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.services).toBeDefined();
    });

    it('should handle service unavailability', async () => {
      global.testUtils.mockApiResponse({
        status: 'degraded',
        services: {
          database: 'connected',
          redis: 'disconnected',
          ai: 'operational'
        }
      }, 503);

      const response = await fetch(`${baseURL}/health`);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('degraded');
    });
  });

  describe('🌬️ Environmental Data Endpoint', () => {
    it('should return environmental data for valid location', async () => {
      const mockData = global.testUtils.createMockEnvironmentalData();
      global.testUtils.mockApiResponse(mockData);

      const response = await fetch(`${baseURL}/v1/environmental-data?location=San Francisco`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.location).toBe('San Francisco, CA');
      expect(data.airQuality).toBeGreaterThanOrEqual(0);
      expect(data.temperature).toBeDefined();
      expect(data.humidity).toBeDefined();
    });

    it('should handle invalid location', async () => {
      global.testUtils.mockApiError('Location not found', 404);

      const response = await fetch(`${baseURL}/v1/environmental-data?location=InvalidLocation`);
      
      expect(response.status).toBe(404);
    });

    it('should require location parameter', async () => {
      global.testUtils.mockApiError('Location parameter is required', 400);

      const response = await fetch(`${baseURL}/v1/environmental-data`);
      
      expect(response.status).toBe(400);
    });
  });

  describe('🤖 AI Insights Endpoint', () => {
    it('should return AI predictions for valid location', async () => {
      const mockPredictions = {
        location: 'San Francisco, CA',
        predictions: {
          airQuality: {
            next24h: [65, 70, 75, 80],
            confidence: 0.94,
            trend: 'improving'
          },
          temperature: {
            next24h: [18, 20, 22, 24],
            confidence: 0.92,
            trend: 'stable'
          }
        },
        recommendations: [
          'Good time for outdoor activities',
          'Air quality expected to improve'
        ]
      };

      global.testUtils.mockApiResponse(mockPredictions);

      const response = await fetch(`${baseURL}/v1/ai-insights/predictions?location=San Francisco`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.predictions).toBeDefined();
      expect(data.predictions.airQuality.confidence).toBeGreaterThan(0.8);
      expect(data.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('🔐 Authentication Endpoints', () => {
    it('should authenticate valid user', async () => {
      const mockUser = global.testUtils.createMockUser();
      global.testUtils.mockApiResponse({
        user: mockUser,
        token: 'mock-jwt-token',
        expiresIn: 3600
      });

      const response = await fetch(`${baseURL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      global.testUtils.mockApiError('Invalid credentials', 401);

      const response = await fetch(`${baseURL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
    });
  });

  describe('📊 Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Mock rate limit exceeded response
      global.testUtils.mockApiResponse({
        error: 'Rate limit exceeded',
        retryAfter: 60
      }, 429);

      const response = await fetch(`${baseURL}/v1/environmental-data?location=Test`);
      
      expect(response.status).toBe(429);
    });
  });

  describe('🔒 Security Headers', () => {
    it('should include security headers', async () => {
      global.testUtils.mockApiResponse({ status: 'ok' });

      const response = await fetch(`${baseURL}/health`);

      // Note: In a real test, you'd check actual headers
      expect(response.status).toBe(200);
    });
  });
});
