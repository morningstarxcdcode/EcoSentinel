/**
 * Dashboard Component Tests
 * Unit tests for the main dashboard component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';

// Mock the environmental data hook
jest.mock('../../hooks/useEnvironmentalData', () => ({
  useEnvironmentalData: () => ({
    data: {
      location: 'San Francisco, CA',
      airQuality: 75,
      temperature: 22,
      humidity: 65,
      pressure: 1013,
      windSpeed: 12,
      uvIndex: 6,
      timestamp: '2024-01-01T12:00:00Z'
    },
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}));

describe('🌍 Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with environmental data', () => {
    render(<Dashboard />);
    
    // Check main elements are present
    expect(screen.getByText('Environmental Dashboard')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    
    // Check environmental metrics
    expect(screen.getByText('75')).toBeInTheDocument(); // AQI
    expect(screen.getByText('22°C')).toBeInTheDocument(); // Temperature
    expect(screen.getByText('65%')).toBeInTheDocument(); // Humidity
  });

  it('displays air quality status correctly', () => {
    render(<Dashboard />);
    
    // Check AQI value and status
    expect(screen.getByTestId('air-quality-value')).toHaveTextContent('75');
    expect(screen.getByTestId('air-quality-status')).toHaveTextContent('Moderate');
  });

  it('shows loading state', () => {
    // Mock loading state
    jest.doMock('../../hooks/useEnvironmentalData', () => ({
      useEnvironmentalData: () => ({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn()
      })
    }));

    render(<Dashboard />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading environmental data...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    // Mock error state
    jest.doMock('../../hooks/useEnvironmentalData', () => ({
      useEnvironmentalData: () => ({
        data: null,
        loading: false,
        error: 'Failed to fetch data',
        refetch: jest.fn()
      })
    }));

    render(<Dashboard />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    const mockRefetch = jest.fn();
    
    jest.doMock('../../hooks/useEnvironmentalData', () => ({
      useEnvironmentalData: () => ({
        data: global.testUtils.createMockEnvironmentalData(),
        loading: false,
        error: null,
        refetch: mockRefetch
      })
    }));

    const user = userEvent.setup();
    render(<Dashboard />);
    
    const refreshButton = screen.getByTestId('refresh-button');
    await user.click(refreshButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('displays health recommendations', () => {
    render(<Dashboard />);
    
    const recommendationsSection = screen.getByTestId('health-recommendations');
    expect(recommendationsSection).toBeInTheDocument();
    
    // Check for common recommendation text
    expect(screen.getByText(/outdoor activities/i)).toBeInTheDocument();
  });

  it('shows alerts for poor air quality', () => {
    // Mock poor air quality data
    jest.doMock('../../hooks/useEnvironmentalData', () => ({
      useEnvironmentalData: () => ({
        data: {
          ...global.testUtils.createMockEnvironmentalData(),
          airQuality: 180, // Unhealthy level
          alerts: ['Poor air quality detected']
        },
        loading: false,
        error: null,
        refetch: jest.fn()
      })
    }));

    render(<Dashboard />);
    
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
    expect(screen.getByText('Poor air quality detected')).toBeInTheDocument();
  });

  it('formats temperature correctly', () => {
    render(<Dashboard />);
    
    const temperatureElement = screen.getByTestId('temperature-value');
    expect(temperatureElement).toHaveTextContent('22°C');
  });

  it('updates when location changes', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    
    // Click location selector
    const locationSelector = screen.getByTestId('location-selector');
    await user.click(locationSelector);
    
    // Select different location
    const londonOption = screen.getByTestId('location-option-london');
    await user.click(londonOption);
    
    // Wait for update
    await waitFor(() => {
      expect(screen.getByText('London, UK')).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    render(<Dashboard />);
    
    // Check for proper headings
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for proper labels
    expect(screen.getByLabelText(/air quality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    
    // Check for proper button labels
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    
    // Tab through interactive elements
    await user.tab();
    expect(screen.getByTestId('location-selector')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByTestId('refresh-button')).toHaveFocus();
  });
});
