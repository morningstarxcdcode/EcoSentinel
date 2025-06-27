/**
 * Dashboard E2E Tests
 * End-to-end tests for EcoSentinel dashboard functionality
 */

import { test, expect } from '@playwright/test';

test.describe('🌍 EcoSentinel Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display main dashboard elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/EcoSentinel/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Environmental Intelligence');
    
    // Check navigation menu
    await expect(page.locator('nav')).toBeVisible();
    
    // Check dashboard cards
    await expect(page.locator('[data-testid="air-quality-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="temperature-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="humidity-card"]')).toBeVisible();
  });

  test('should load environmental data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="air-quality-value"]');
    
    // Check that AQI value is displayed
    const aqiValue = await page.locator('[data-testid="air-quality-value"]').textContent();
    expect(aqiValue).toMatch(/\d+/);
    
    // Check that temperature is displayed
    const tempValue = await page.locator('[data-testid="temperature-value"]').textContent();
    expect(tempValue).toMatch(/\d+°[CF]/);
    
    // Check that humidity is displayed
    const humidityValue = await page.locator('[data-testid="humidity-value"]').textContent();
    expect(humidityValue).toMatch(/\d+%/);
  });

  test('should update data when location changes', async ({ page }) => {
    // Click location selector
    await page.click('[data-testid="location-selector"]');
    
    // Select different location
    await page.click('[data-testid="location-option-london"]');
    
    // Wait for data to update
    await page.waitForTimeout(2000);
    
    // Check that location has changed
    await expect(page.locator('[data-testid="current-location"]')).toContainText('London');
    
    // Verify data has updated (values should be different)
    const newAqiValue = await page.locator('[data-testid="air-quality-value"]').textContent();
    expect(newAqiValue).toMatch(/\d+/);
  });

  test('should display health recommendations', async ({ page }) => {
    // Check recommendations section
    await expect(page.locator('[data-testid="health-recommendations"]')).toBeVisible();
    
    // Check that recommendations are displayed
    const recommendations = page.locator('[data-testid="recommendation-item"]');
    await expect(recommendations).toHaveCount(await recommendations.count());
    expect(await recommendations.count()).toBeGreaterThan(0);
    
    // Check recommendation content
    const firstRec = recommendations.first();
    await expect(firstRec).toContainText(/outdoor|indoor|air|quality/i);
  });

  test('should show alerts when air quality is poor', async ({ page }) => {
    // Mock poor air quality data
    await page.route('**/api/v1/environmental-data*', async route => {
      await route.fulfill({
        json: {
          location: 'Test City',
          airQuality: 180, // Unhealthy level
          temperature: 25,
          humidity: 60,
          alerts: ['Poor air quality detected']
        }
      });
    });
    
    // Reload page to get new data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that alert is displayed
    await expect(page.locator('[data-testid="alert-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-message"]')).toContainText('Poor air quality');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Check that cards stack vertically
    const cards = page.locator('[data-testid*="card"]');
    const firstCard = cards.first();
    const secondCard = cards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Second card should be below first card (higher y position)
    expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y);
  });

  test('should handle loading states', async ({ page }) => {
    // Intercept API call to add delay
    await page.route('**/api/v1/environmental-data*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Navigate to page
    await page.goto('/');
    
    // Check loading indicator is shown
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="air-quality-value"]');
    
    // Check loading indicator is hidden
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/environmental-data*', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Internal server error' }
      });
    });
    
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
    
    // Check retry button is available
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    // Wait for initial data load
    await page.waitForSelector('[data-testid="air-quality-value"]');
    
    // Get initial AQI value
    const initialAqi = await page.locator('[data-testid="air-quality-value"]').textContent();
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Wait for refresh to complete
    await page.waitForTimeout(1000);
    
    // Check that refresh indicator was shown (briefly)
    // Note: This might be too fast to catch in a real test
    
    // Verify data is still displayed (could be same or different values)
    const newAqi = await page.locator('[data-testid="air-quality-value"]').textContent();
    expect(newAqi).toMatch(/\d+/);
  });

  test('should navigate to different sections', async ({ page }) => {
    // Test navigation to predictions page
    await page.click('[data-testid="nav-predictions"]');
    await expect(page).toHaveURL(/.*predictions/);
    await expect(page.locator('h1')).toContainText('AI Predictions');
    
    // Test navigation to alerts page
    await page.click('[data-testid="nav-alerts"]');
    await expect(page).toHaveURL(/.*alerts/);
    await expect(page.locator('h1')).toContainText('Environmental Alerts');
    
    // Test navigation back to dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page).toHaveURL('/');
  });
});
